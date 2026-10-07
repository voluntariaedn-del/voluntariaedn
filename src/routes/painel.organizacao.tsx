import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, ClipboardList, Clock, MessageSquare, ShieldAlert, Users } from "lucide-react";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { useMyOrganization, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel/organizacao")({
  head: () => ({
    meta: [
      { title: "Painel da organização — VoluntarIA" },
      {
        name: "description",
        content: "Gerencie o cadastro institucional da sua organização na VoluntarIA.",
      },
      { property: "og:title", content: "Painel da organização — VoluntarIA" },
      { property: "og:description", content: "Seu espaço institucional na VoluntarIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PainelOrganizacao />
    </RequireAuth>
  ),
});

const atalhos = [
  { icon: MessageSquare, label: "Mensagens", desc: "Conversas com os voluntários." },
  { icon: Clock, label: "Horas e ações", desc: "Confirmar participação e horas." },
];

function PainelOrganizacao() {
  const { user } = useSession();
  const { data: org, isLoading } = useMyOrganization(user?.id);

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
          eyebrow="Painel da organização"
          title="Complete o cadastro da sua organização"
          description="Ainda não encontramos um cadastro institucional ligado à sua conta."
        />
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-2xl border border-urgent/40 bg-urgent-soft p-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 text-urgent" />
              <div>
                <p className="font-semibold">Falta o cadastro institucional</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe nome, descrição, cidade, contatos e áreas de atuação para aparecer na
                  lista de organizações e solicitar a verificação.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/organizacao/editar">Cadastrar organização</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const local = [org.city, org.state].filter(Boolean).join(" — ");

  return (
    <PageShell>
      <PageHeader eyebrow="Painel da organização" title={org.name} description={local || undefined} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-4">
              {org.logo_url ? (
                <img src={org.logo_url} alt={org.name} className="h-16 w-16 rounded-xl object-cover" />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-xl bg-primary-soft text-xl font-semibold text-primary">
                  {org.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold">{org.name}</p>
                <p className="text-sm text-muted-foreground">{local || "Cidade não informada"}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button asChild size="sm">
                  <Link to="/organizacao/editar">Editar organização</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/organizacoes/$slug" params={{ slug: org.slug }}>
                    Ver página pública
                  </Link>
                </Button>
              </div>
            </div>

            {org.description && (
              <p className="mt-5 text-sm text-muted-foreground">{org.description}</p>
            )}

            {org.causes.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {org.causes.map((c) => (
                  <span key={c} className="rounded-full bg-primary-soft px-3 py-1 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>Contato: {org.contact_email || "não informado"}</p>
              <p>Telefone: {org.contact_phone || "não informado"}</p>
              <p>Site: {org.website || "não informado"}</p>
              <p>Instagram: {org.instagram || "não informado"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div
              className={`rounded-2xl border p-6 ${org.verified ? "border-primary/40 bg-primary-soft" : "border-border bg-card"}`}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck className={`h-5 w-5 ${org.verified ? "text-primary" : "text-muted-foreground"}`} />
                <p className="font-semibold">
                  {org.verified ? "Organização verificada" : "Verificação pendente"}
                </p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {org.verified
                  ? "Seu cadastro foi conferido pela equipe da VoluntarIA."
                  : "A verificação é concedida pela equipe da VoluntarIA após conferir as informações institucionais. Nenhuma organização pode se verificar sozinha."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <ClipboardList className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold">Publicar oportunidade</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie uma nova vaga de voluntariado.</p>
            <Button asChild size="sm" className="mt-3">
              <Link to="/oportunidade/nova">Nova oportunidade</Link>
            </Button>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <Users className="h-5 w-5 text-primary" />
            <p className="mt-3 font-semibold">Vagas e candidaturas</p>
            <p className="mt-1 text-sm text-muted-foreground">Encerre vagas e aceite ou recuse voluntários.</p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link to="/painel/oportunidades">Gerenciar</Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {atalhos.map((a) => (
            <div key={a.label} className="rounded-2xl border border-dashed border-border p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                <a.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{a.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              <span className="mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                em breve
              </span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
