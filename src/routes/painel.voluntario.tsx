import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, ClipboardList, Clock, MessageSquare, Star, Trophy } from "lucide-react";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { useProfile, useSession, useVolunteerProfile } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel/voluntario")({
  head: () => ({
    meta: [
      { title: "Painel do voluntário — VoluntarIA" },
      {
        name: "description",
        content: "Seu perfil, disponibilidade e próximos passos como voluntário na VoluntarIA.",
      },
      { property: "og:title", content: "Painel do voluntário — VoluntarIA" },
      { property: "og:description", content: "Acompanhe sua jornada de voluntariado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PainelVoluntario />
    </RequireAuth>
  ),
});

const atalhos = [
  { icon: ClipboardList, label: "Minhas candidaturas", desc: "Acompanhe os pedidos enviados." },
  { icon: CalendarDays, label: "Minha agenda", desc: "Datas e horários das ações." },
  { icon: MessageSquare, label: "Minhas mensagens", desc: "Conversas com as organizações." },
  { icon: Clock, label: "Minhas horas", desc: "Horas previstas e confirmadas." },
  { icon: Star, label: "Minhas avaliações", desc: "O que as organizações disseram." },
  { icon: Trophy, label: "Minhas conquistas", desc: "Marcos da sua trajetória." },
];

function Chips({ titulo, itens }: { titulo: string; itens: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold">{titulo}</p>
      {itens.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {itens.map((i) => (
            <span key={i} className="rounded-full bg-primary-soft px-3 py-1 text-xs text-foreground">
              {i}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">Ainda não informado.</p>
      )}
    </div>
  );
}

function PainelVoluntario() {
  const { user } = useSession();
  const { data: profile, isLoading: carregandoPerfil } = useProfile(user?.id);
  const { data: vp } = useVolunteerProfile(user?.id);

  const local = [profile?.city, profile?.state].filter(Boolean).join(" — ");

  return (
    <PageShell>
      <PageHeader
        eyebrow="Painel do voluntário"
        title={profile?.full_name ? `Olá, ${profile.full_name.split(" ")[0]}!` : "Seu painel"}
        description="Este é o seu espaço na VoluntarIA. Mantenha seu perfil atualizado para receber oportunidades que combinam com você."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center gap-4">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <span className="grid h-16 w-16 place-items-center rounded-full bg-primary-soft text-xl font-semibold text-primary">
                  {(profile?.full_name ?? "V").charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold">
                  {carregandoPerfil ? "Carregando..." : (profile?.full_name || "Sem nome informado")}
                </p>
                <p className="text-sm text-muted-foreground">{local || "Cidade não informada"}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="ml-auto">
                <Button asChild size="sm">
                  <Link to="/perfil/editar">Editar perfil</Link>
                </Button>
              </div>
            </div>

            {profile?.bio && <p className="mt-5 text-sm text-muted-foreground">{profile.bio}</p>}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Chips titulo="Áreas de interesse" itens={vp?.interests ?? []} />
              <Chips titulo="Habilidades" itens={vp?.skills ?? []} />
              <Chips titulo="Disponibilidade" itens={vp?.availability ?? []} />
              <div>
                <p className="text-sm font-semibold">Dedicação</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {vp?.hours_per_week ? `${vp.hours_per_week} h por semana` : "Horas não informadas"}
                  {" · "}
                  {vp?.modality === "remoto"
                    ? "Remoto"
                    : vp?.modality === "presencial"
                      ? "Presencial"
                      : "Presencial ou remoto"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold">Resumo</p>
              <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Ações concluídas</dt>
                  <dd className="font-semibold text-foreground">0</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Horas confirmadas</dt>
                  <dd className="font-semibold text-foreground">0</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Candidaturas</dt>
                  <dd className="font-semibold text-foreground">0</dd>
                </div>
              </dl>
              <p className="mt-3 text-xs text-muted-foreground">
                Os números começam a crescer assim que as oportunidades entrarem no ar.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold">Encontrar formas de ajudar</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Veja as organizações já cadastradas na plataforma.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/organizacoes">Ver organizações</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
