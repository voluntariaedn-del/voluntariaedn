-- ROLES
CREATE TYPE public.app_role AS ENUM ('volunteer', 'organization', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "user_roles_read_own" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- VOLUNTEER PROFILE
CREATE TABLE public.volunteer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  interests TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  availability TEXT[] NOT NULL DEFAULT '{}',
  hours_per_week INTEGER,
  modality TEXT NOT NULL DEFAULT 'ambos',
  experience TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.volunteer_profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.volunteer_profiles TO authenticated;
GRANT ALL ON public.volunteer_profiles TO service_role;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "volunteer_public_read" ON public.volunteer_profiles FOR SELECT USING (true);
CREATE POLICY "volunteer_insert_own" ON public.volunteer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "volunteer_update_own" ON public.volunteer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER volunteer_profiles_updated_at BEFORE UPDATE ON public.volunteer_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  mission TEXT,
  city TEXT,
  state TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  instagram TEXT,
  causes TEXT[] NOT NULL DEFAULT '{}',
  founded_year INTEGER,
  document TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.organizations TO anon;
GRANT SELECT, INSERT, UPDATE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orgs_public_read" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "orgs_insert_own" ON public.organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "orgs_update_own" ON public.organizations FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = owner_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER organizations_updated_at BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- prevent non-admins from self-verifying
CREATE OR REPLACE FUNCTION public.protect_org_verification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.verified IS DISTINCT FROM OLD.verified AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.verified = OLD.verified;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER organizations_protect_verification BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.protect_org_verification();

-- CAUSES
CREATE TABLE public.causes (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Heart',
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT ON public.causes TO anon, authenticated;
GRANT ALL ON public.causes TO service_role;
ALTER TABLE public.causes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "causes_public_read" ON public.causes FOR SELECT USING (true);
CREATE POLICY "causes_admin_write" ON public.causes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.causes (slug, name, icon, description, sort_order) VALUES
  ('educacao', 'Educação', 'GraduationCap', 'Reforço escolar, alfabetização e formação', 1),
  ('assistencia-social', 'Assistência social', 'HandHeart', 'Apoio a famílias em situação de vulnerabilidade', 2),
  ('animais', 'Animais', 'PawPrint', 'Proteção, resgate e cuidado de animais', 3),
  ('meio-ambiente', 'Meio ambiente', 'Leaf', 'Mutirões, reciclagem e preservação', 4),
  ('saude', 'Saúde', 'Stethoscope', 'Apoio a pacientes, campanhas e prevenção', 5),
  ('idosos', 'Idosos', 'Users', 'Companhia e cuidado com pessoas idosas', 6),
  ('criancas', 'Crianças e adolescentes', 'Baby', 'Atividades, esporte e cultura para a infância', 7),
  ('cultura', 'Cultura e esporte', 'Palette', 'Oficinas, arte, música e esporte comunitário', 8),
  ('tecnologia', 'Tecnologia', 'Laptop', 'Inclusão digital e apoio técnico a projetos', 9),
  ('alimentacao', 'Alimentação', 'UtensilsCrossed', 'Arrecadação e distribuição de alimentos', 10);

-- TEAM (Quem nós somos)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.team_members TO anon, authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_public_read" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "team_admin_write" ON public.team_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- VISIT PHOTOS (galeria interativa)
CREATE TABLE public.visit_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  org_name TEXT,
  city TEXT,
  state TEXT,
  visit_date DATE,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.visit_photos TO anon, authenticated;
GRANT ALL ON public.visit_photos TO service_role;
ALTER TABLE public.visit_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "visits_public_read" ON public.visit_photos FOR SELECT USING (true);
CREATE POLICY "visits_admin_write" ON public.visit_photos FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- NEW USER TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  chosen_role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  chosen_role := CASE
    WHEN NEW.raw_user_meta_data ->> 'account_type' = 'organization' THEN 'organization'::public.app_role
    ELSE 'volunteer'::public.app_role
  END;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, chosen_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  IF chosen_role = 'volunteer' THEN
    INSERT INTO public.volunteer_profiles (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DEMO CONTENT for "Quem nós somos"
INSERT INTO public.team_members (name, role, bio, sort_order, is_demo) VALUES
  ('Equipe VoluntarIA', 'Idealização e desenvolvimento', 'Conteúdo de demonstração: substitua pelos integrantes reais da equipe.', 1, true);

INSERT INTO public.visit_photos (image_url, title, org_name, city, state, visit_date, caption, sort_order, is_demo) VALUES
  ('https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1600&q=80', 'Visita ao projeto de arrecadação', 'Projeto Esperança', 'Indaiatuba', 'SP', '2026-03-14', 'Demonstração: organização de doações junto com a equipe da ONG.', 1, true),
  ('https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1600&q=80', 'Tarde de reforço escolar', 'Instituto Semear', 'Campinas', 'SP', '2026-04-02', 'Demonstração: acompanhamento das atividades com as crianças.', 2, true),
  ('https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1600&q=80', 'Mutirão de alimentos', 'Casa Solidária', 'Salto', 'SP', '2026-05-18', 'Demonstração: montagem de cestas com voluntários da comunidade.', 3, true),
  ('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80', 'Encontro com lideranças', 'Rede Bairro Vivo', 'Itu', 'SP', '2026-06-09', 'Demonstração: conversa sobre necessidades locais e planejamento.', 4, true),
  ('https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1600&q=80', 'Mutirão ambiental', 'Verde Comunidade', 'Indaiatuba', 'SP', '2026-07-21', 'Demonstração: plantio de mudas em área comunitária.', 5, true);