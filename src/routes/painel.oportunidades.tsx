import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyOrganization, useSession } from "@/lib/auth";
import { formatarData, useOrgApplications, useOrgOpportunities } from "@/lib/opportunities";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel/oportunidades")({
  head: () => ({
    meta: [
      { title: "Minhas oportunidades — VoluntarIA" },
      {
        name: "description",
        content: "Gerencie as ações publicadas e responda às candidaturas recebidas.",
      },
      { property: "og:title", content: "Minhas oportunidades — VoluntarIA" },
      { property: "og:description", content: "Gerencie ações e candidaturas na VoluntarIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MinhasOportunidades />
    </RequireAuth>
  ),
});

function MinhasOportunidades() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const { data: org, isLoading } = useMyOrganization(user?.id);
  const { data: oportunidades } = useOrgOpportunities(org?.id);
  const { data: candidaturas } = useOrgApplications(org?.id);

  async function responder(id: string, status: "aceita" | "recusada" | "contatada") {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) {
      toast.error("Não foi possível atualizar a candidatura.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["org-applications"] });
    toast.success(
      status === "aceita"
        ? "Voluntário aceito. Os contatos ficam visíveis para ele."
        : status === "recusada"
          ? "Candidatura recusada."
          : "Marcada como contatada.",
    );
  }

  async function alternarStatus(id: string, atual: string) {
    const novo = atual === "aberta" ? "encerrada" : "aberta";
    const { error } = await supabase.from("opportunities").update({ status: novo }).eq("id", id);
    if (error) {
      toast.error("Não foi possível alterar a situação da oportunidade.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["org-opportunities"] });
    toast.success(novo === "aberta" ? "Oportunidade reaberta." : "Oportunidade encerrada.");
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
          Carregando...
        </div>
      </PageShell>
    );
  }

  if (!org) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Minhas oportunidades"
          title="Cadastre sua organização primeiro"
          description="Só organizações cadastradas publicam ações e recebem candidaturas."
        />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <Button asChild>
            <Link to="/organizacao/editar">Cadastrar organização</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  const pendentes = (candidaturas ?? []).filter((c) => c.status === "pendente");
  const respondidas = (candidaturas ?? []).filter((c) => c.status !== "pendente");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Minhas oportunidades"
        title="Ações e candidaturas"
        description="Publique ações, acompanhe quem se candidatou e responda a cada pessoa."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Oportunidades publicadas</h2>
          <Button asChild>
            <Link to="/oportunidade/nova">Publicar oportunidade</Link>
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {(oportunidades ?? []).length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Você ainda não publicou nenhuma ação.
            </p>
          )}
          {(oportunidades ?? []).map((op) => (
            <div
              key={op.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{op.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatarData(op.date)} · {[op.city, op.state].filter(Boolean).join(" — ") || "Local a combinar"} ·{" "}
                  {op.slots} {op.slots === 1 ? "vaga" : "vagas"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  op.status === "aberta"
                    ? "bg-primary-soft text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {op.status === "aberta" ? "Aberta" : "Encerrada"}
              </span>
              <Button variant="outline" size="sm" onClick={() => alternarStatus(op.id, op.status)}>
                {op.status === "aberta" ? "Encerrar" : "Reabrir"}
              </Button>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold">Candidaturas recebidas</h2>
        <div className="mt-5 space-y-4">
          {(candidaturas ?? []).length === 0 && (
            <p className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
              Nenhuma candidatura recebida até agora.
            </p>
          )}

          {[...pendentes, ...respondidas].map((c) => (
            <article key={c.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{c.volunteerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.opportunityTitle}
                    {c.volunteerCity ? ` · ${c.volunteerCity}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">
                  {c.status}
                </span>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{c.message}</p>
              {c.availability && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Disponibilidade informada: {c.availability}
                </p>
              )}
              {c.volunteerSkills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.volunteerSkills.map((s) => (
                    <span key={s} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              {c.status !== "pendente" && c.volunteerPhone && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Telefone do voluntário: {c.volunteerPhone}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => responder(c.id, "aceita")} disabled={c.status === "aceita"}>
                  Aceitar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => responder(c.id, "contatada")}
                  disabled={c.status === "contatada"}
                >
                  Marcar como contatada
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => responder(c.id, "recusada")}
                  disabled={c.status === "recusada"}
                >
                  Recusar
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
