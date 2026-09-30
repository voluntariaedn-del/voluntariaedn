CREATE TYPE public.opportunity_status AS ENUM ('aberta', 'encerrada');
CREATE TYPE public.application_status AS ENUM ('pendente', 'aceita', 'recusada', 'contatada');

CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cause TEXT,
  city TEXT,
  state TEXT,
  date DATE,
  time TEXT,
  duration_hours NUMERIC,
  slots INTEGER NOT NULL DEFAULT 1,
  skills TEXT[] NOT NULL DEFAULT '{}',
  modality TEXT NOT NULL DEFAULT 'presencial',
  urgency TEXT NOT NULL DEFAULT 'media',
  status public.opportunity_status NOT NULL DEFAULT 'aberta',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.opportunities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opportunities TO authenticated;
GRANT ALL ON public.opportunities TO service_role;

ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opps_public_read" ON public.opportunities
  FOR SELECT USING (true);

CREATE POLICY "opps_insert_own_org" ON public.opportunities
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()));

CREATE POLICY "opps_update_own_org" ON public.opportunities
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "opps_delete_own_org" ON public.opportunities
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = organization_id AND o.owner_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER opportunities_updated_at BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX opportunities_status_idx ON public.opportunities (status, created_at DESC);
CREATE INDEX opportunities_org_idx ON public.opportunities (organization_id);

CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  availability TEXT,
  status public.application_status NOT NULL DEFAULT 'pendente',
  org_reply TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, volunteer_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apps_read_own_or_org" ON public.applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM public.opportunities op
      JOIN public.organizations o ON o.id = op.organization_id
      WHERE op.id = opportunity_id AND o.owner_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "apps_insert_own" ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = volunteer_id);

CREATE POLICY "apps_update_org_or_own" ON public.applications
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM public.opportunities op
      JOIN public.organizations o ON o.id = op.organization_id
      WHERE op.id = opportunity_id AND o.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = volunteer_id
    OR EXISTS (
      SELECT 1 FROM public.opportunities op
      JOIN public.organizations o ON o.id = op.organization_id
      WHERE op.id = opportunity_id AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "apps_delete_own" ON public.applications
  FOR DELETE TO authenticated
  USING (auth.uid() = volunteer_id);

CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX applications_opp_idx ON public.applications (opportunity_id);
CREATE INDEX applications_vol_idx ON public.applications (volunteer_id, created_at DESC);