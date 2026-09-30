import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Modalidade = "presencial" | "remoto" | "hibrido";
export type Urgencia = "baixa" | "media" | "alta";

export const MODALIDADES: { value: Modalidade; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Híbrido" },
];

export const URGENCIAS: { value: Urgencia; label: string }[] = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta 🚨" },
];

export const STATUS_CANDIDATURA: Record<string, string> = {
  pendente: "Aguardando resposta",
  aceita: "Aceita",
  recusada: "Não selecionada",
  contatada: "Organização entrou em contato",
};

export type Filtros = {
  termo: string;
  causa: string;
  cidade: string;
  estado: string;
  modalidade: string;
  urgencia: string;
};

export function useOpportunities(filtros: Filtros) {
  return useQuery({
    queryKey: ["opportunities", filtros],
    queryFn: async () => {
      let q = supabase
        .from("opportunities")
        .select(
          "*, organizations(id, name, slug, logo_url, verified, contact_email, contact_phone)",
        )
        .eq("status", "aberta")
        .order("urgency", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(60);

      if (filtros.termo.trim()) {
        const t = `%${filtros.termo.trim()}%`;
        q = q.or(`title.ilike.${t},description.ilike.${t}`);
      }
      if (filtros.causa) q = q.eq("cause", filtros.causa);
      if (filtros.cidade.trim()) q = q.ilike("city", `%${filtros.cidade.trim()}%`);
      if (filtros.estado.trim()) q = q.ilike("state", filtros.estado.trim());
      if (filtros.modalidade) q = q.eq("modality", filtros.modalidade);
      if (filtros.urgencia) q = q.eq("urgency", filtros.urgencia);

      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyApplications(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select(
          "*, opportunities(id, title, date, time, city, state, modality, organizations(name, slug, contact_email, contact_phone))",
        )
        .eq("volunteer_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useOrgOpportunities(orgId: string | undefined) {
  return useQuery({
    queryKey: ["org-opportunities", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export type CandidaturaOrg = {
  id: string;
  message: string;
  availability: string | null;
  status: string;
  created_at: string;
  opportunity_id: string;
  volunteer_id: string;
  opportunityTitle: string;
  volunteerName: string;
  volunteerCity: string | null;
  volunteerPhone: string | null;
  volunteerSkills: string[];
  volunteerInterests: string[];
};

export function useOrgApplications(orgId: string | undefined) {
  return useQuery({
    queryKey: ["org-applications", orgId],
    enabled: !!orgId,
    queryFn: async (): Promise<CandidaturaOrg[]> => {
      const { data: apps, error } = await supabase
        .from("applications")
        .select("*, opportunities!inner(id, title, organization_id)")
        .eq("opportunities.organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const lista = apps ?? [];
      if (lista.length === 0) return [];

      const ids = Array.from(new Set(lista.map((a) => a.volunteer_id)));
      const [{ data: perfis }, { data: vps }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, city, state, phone").in("id", ids),
        supabase.from("volunteer_profiles").select("user_id, skills, interests").in("user_id", ids),
      ]);

      return lista.map((a) => {
        const p = (perfis ?? []).find((x) => x.id === a.volunteer_id);
        const v = (vps ?? []).find((x) => x.user_id === a.volunteer_id);
        return {
          id: a.id,
          message: a.message,
          availability: a.availability,
          status: a.status,
          created_at: a.created_at,
          opportunity_id: a.opportunity_id,
          volunteer_id: a.volunteer_id,
          opportunityTitle:
            (a.opportunities as { title?: string } | null)?.title ?? "Oportunidade",
          volunteerName: p?.full_name || "Voluntário",
          volunteerCity: [p?.city, p?.state].filter(Boolean).join(" — ") || null,
          volunteerPhone: p?.phone ?? null,
          volunteerSkills: v?.skills ?? [],
          volunteerInterests: v?.interests ?? [],
        };
      });
    },
  });
}

export function formatarData(data: string | null) {
  if (!data) return "Data a combinar";
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
