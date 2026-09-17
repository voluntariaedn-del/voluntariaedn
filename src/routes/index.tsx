import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Building2,
  HandHeart,
  Heart,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CauseIcon } from "@/components/site/CauseIcon";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VoluntarIA — conecte quem quer ajudar a quem precisa de ajuda" },
      {
        name: "description",
        content:
          "A VoluntarIA aproxima voluntários de ONGs, projetos sociais e comunidades. Crie seu perfil, encontre oportunidades que combinam com você e transforme sua cidade.",
      },
      { property: "og:title", content: "VoluntarIA — voluntariado que combina com você" },
      {
        property: "og:description",
        content: "Plataforma que conecta pessoas dispostas a ajudar com quem precisa de ajuda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const steps = [
  { title: "Crie seu perfil", text: "Conte quem você é, o que sabe fazer e quando pode ajudar." },
  { title: "Encontre oportunidades", text: "Busque por causa, cidade, data e modalidade." },
  { title: "Demonstre interesse", text: "Envie sua candidatura com uma mensagem à organização." },
  { title: "Realize e registre", text: "Participe, registre suas horas e receba avaliações." },
];

function Home() {
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

  const { data: orgs } = useQuery({
    queryKey: ["orgs-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug, city, state, logo_url, verified, causes")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ["home-counts"],
    queryFn: async () => {
      const [vol, org] = await Promise.all([
        supabase.from("volunteer_profiles").select("*", { count: "exact", head: true }),
        supabase.from("organizations").select("*", { count: "exact", head: true }),
      ]);
      return { volunteers: vol.count ?? 0, organizations: org.count ?? 0 };
    },
  });

  return (
    <PageShell>
      {/* HERO */}
      <section className="surface-gradient border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge className="bg-primary-soft text-foreground hover:bg-primary-soft">
              <Sparkles className="mr-1 h-3.5 w-3.5 text-primary" />
              Voluntariado com propósito
            </Badge>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Conectamos quem quer ajudar a quem precisa de ajuda.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              A VoluntarIA é uma plataforma de tecnologia social: você conta suas habilidades,
              interesses e disponibilidade, e nós ajudamos a encontrar a forma de ajudar que
              realmente combina com o seu perfil.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/auth" search={{ modo: "cadastro", tipo: "voluntario" }}>
                  <UserRound className="h-4 w-4" />
                  Quero ser voluntário
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth" search={{ modo: "cadastro", tipo: "organizacao" }}>
                  <Building2 className="h-4 w-4" />
                  Sou uma organização
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/oportunidades">
                  <Search className="h-4 w-4" />
                  Encontrar oportunidades
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-semibold text-muted-foreground">Exemplo de oportunidade</p>
            <div className="mt-4 rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold">Arrecadação de alimentos</h3>
                  <p className="text-sm text-muted-foreground">Projeto Esperança</p>
                </div>
                <Badge className="shrink-0 bg-urgent-soft text-urgent-foreground hover:bg-urgent-soft">
                  Urgente
                </Badge>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" /> Indaiatuba - SP
                </li>
                <li>📅 20/10/2026 · 09:00 às 13:00</li>
                <li>👥 5 vagas · Presencial</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">Organização</Badge>
                <Badge variant="secondary">Trabalho em equipe</Badge>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Demonstração — as oportunidades reais chegam na próxima etapa da plataforma.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAUSAS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Causas para se envolver</h2>
        <p className="mt-2 text-muted-foreground">
          Escolha o que faz sentido para você. Cada causa reúne organizações e ações diferentes.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(causes ?? []).map((cause) => (
            <div
              key={cause.slug}
              className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <CauseIcon name={cause.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{cause.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{cause.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NECESSIDADES URGENTES */}
      <section className="border-y border-border bg-urgent-soft/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold">🚨 Necessidades urgentes</h2>
              <p className="mt-2 text-muted-foreground">
                Pedidos de ajuda que não podem esperar: voluntários, alimentos, roupas, materiais e
                profissionais.
              </p>
            </div>
          </div>
          <p className="mt-6 rounded-2xl border border-dashed border-urgent bg-background p-5 text-sm text-muted-foreground">
            Esta área começa a receber pedidos reais assim que as organizações publicarem suas
            necessidades. Nenhum número ou pedido fictício será exibido como real.
          </p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">Como funciona</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
        <Button asChild variant="link" className="mt-4 px-0">
          <Link to="/como-funciona">
            Ver o fluxo completo <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* ORGANIZAÇÕES */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <h2 className="min-w-0 text-2xl font-bold sm:text-3xl">Organizações cadastradas</h2>
          <Button asChild variant="outline" size="sm">
            <Link to="/organizacoes">Ver todas</Link>
          </Button>
        </div>
        {orgs && orgs.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Link
                key={org.id}
                to="/organizacoes/$slug"
                params={{ slug: org.slug }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-soft text-primary">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{org.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {[org.city, org.state].filter(Boolean).join(" - ") || "Localização a definir"}
                    </p>
                  </div>
                </div>
                {org.verified && (
                  <Badge className="mt-3 bg-primary-soft text-foreground hover:bg-primary-soft">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Verificada
                  </Badge>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Ainda não há organizações cadastradas. Se você representa uma ONG ou projeto social,
            crie sua conta e seja uma das primeiras.
          </p>
        )}
      </section>

      {/* IMPACTO */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold">Impacto da plataforma</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Voluntários cadastrados" value={counts?.volunteers ?? 0} />
            <Stat label="Organizações" value={counts?.organizations ?? 0} />
            <Stat label="Ações concluídas" value={0} note="disponível na etapa de ações" />
            <Stat label="Horas registradas" value={0} note="disponível na etapa de horas" />
          </div>
          <Button asChild variant="link" className="mt-4 px-0">
            <Link to="/impacto">
              Ver página de impacto <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center sm:p-12">
          <HandHeart className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Toda ajuda começa com um primeiro passo
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Crie sua conta gratuitamente. Leva poucos minutos e já deixa seu perfil pronto para
            receber recomendações.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/auth" search={{ modo: "cadastro", tipo: "voluntario" }}>
                <Heart className="h-4 w-4" />
                Criar conta de voluntário
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ modo: "cadastro", tipo: "organizacao" }}>
                Cadastrar organização
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-sm font-medium">{label}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
