import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Clock, HeartHandshake, Sparkles, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/impacto")({
  head: () => ({
    meta: [
      { title: "Impacto — VoluntarIA" },
      {
        name: "description",
        content:
          "Números reais da VoluntarIA: voluntários, organizações, oportunidades e horas dedicadas às comunidades.",
      },
      { property: "og:title", content: "O impacto da VoluntarIA" },
      {
        property: "og:description",
        content: "Acompanhe os números reais da plataforma, atualizados conforme a comunidade cresce.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impacto,
});

function Impacto() {
  const { data, isLoading } = useQuery({
    queryKey: ["impacto"],
    queryFn: async () => {
      const [volunteers, orgs, causes] = await Promise.all([
        supabase.from("volunteer_profiles").select("user_id", { count: "exact", head: true }),
        supabase.from("organizations").select("id", { count: "exact", head: true }),
        supabase.from("causes").select("slug", { count: "exact", head: true }),
      ]);
      return {
        volunteers: volunteers.count ?? 0,
        orgs: orgs.count ?? 0,
        causes: causes.count ?? 0,
      };
    },
  });

  const cards = [
    { icon: Users, label: "Voluntários cadastrados", value: data?.volunteers ?? 0 },
    { icon: Building2, label: "Organizações cadastradas", value: data?.orgs ?? 0 },
    { icon: Sparkles, label: "Causas disponíveis", value: data?.causes ?? 0 },
    { icon: HeartHandshake, label: "Ações concluídas", value: 0 },
    { icon: Clock, label: "Horas voluntárias confirmadas", value: 0 },
  ];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Impacto"
        title="Números reais, contados um a um"
        description="Aqui não existem números inflados. Tudo o que você vê nesta página vem diretamente do que já aconteceu na plataforma."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-urgent/40 bg-urgent-soft p-4 text-sm">
          A VoluntarIA está começando. Enquanto as primeiras ações acontecem, vários indicadores
          ainda aparecem zerados — e é assim que deve ser: preferimos mostrar a realidade a inventar
          resultados.
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <card.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-3xl font-bold">{isLoading ? "—" : card.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-xl font-semibold">O que ainda vamos medir</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Conforme as próximas etapas ficarem prontas, esta página passa a mostrar também
            candidaturas aceitas, comunidades atendidas, recursos arrecadados nas campanhas de
            doação e avaliações trocadas entre voluntários e organizações.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
