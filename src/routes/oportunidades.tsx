import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { CauseIcon } from "@/components/site/CauseIcon";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({
    meta: [
      { title: "Oportunidades de voluntariado — VoluntarIA" },
      {
        name: "description",
        content:
          "Encontre ações de voluntariado por causa, cidade, data e modalidade dentro da VoluntarIA.",
      },
      { property: "og:title", content: "Oportunidades de voluntariado — VoluntarIA" },
      {
        property: "og:description",
        content: "Busque ações de voluntariado por causa, cidade, data e modalidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Oportunidades,
});

function Oportunidades() {
  const { data: causes } = useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Oportunidades"
        title="Oportunidades de voluntariado"
        description="Aqui ficará o catálogo de ações publicadas pelas organizações, com busca por cidade, causa, data, modalidade e urgência."
      />
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="rounded-2xl border border-dashed border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Em construção — próxima etapa</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            As oportunidades reais aparecem assim que a publicação for liberada para as
            organizações. Para não enganar ninguém, esta página não exibe ações inventadas.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/auth" search={{ modo: "cadastro", tipo: "voluntario" }}>
                Criar perfil de voluntário
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/organizacoes">Ver organizações</Link>
            </Button>
          </div>
        </div>

        <h2 className="mt-12 text-xl font-bold">Causas disponíveis</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(causes ?? []).map((cause) => (
            <div key={cause.slug} className="rounded-2xl border border-border bg-card p-4">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <CauseIcon name={cause.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{cause.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cause.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
