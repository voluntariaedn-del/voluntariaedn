import { useCallback, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/quem-somos")({
  head: () => ({
    meta: [
      { title: "Quem nós somos — VoluntarIA" },
      {
        name: "description",
        content:
          "Conheça o propósito da VoluntarIA, as pessoas por trás do projeto e as visitas feitas às organizações parceiras.",
      },
      { property: "og:title", content: "Quem nós somos — VoluntarIA" },
      {
        property: "og:description",
        content: "O propósito, a equipe e as visitas às organizações que inspiram a VoluntarIA.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuemSomos,
});

type Foto = {
  id: string;
  title: string;
  caption: string | null;
  city: string | null;
  state: string | null;
  org_name: string | null;
  image_url: string;
  visit_date: string | null;
  is_demo: boolean;
};

function formatarData(value: string | null) {
  if (!value) return null;
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function QuemSomos() {
  const { data: team } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: fotos } = useQuery({
    queryKey: ["visit-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visit_photos")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Foto[];
    },
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Quem nós somos"
        title="Gente que acredita que ajudar pode ser simples"
        description="A VoluntarIA nasceu da vontade de encurtar a distância entre quem quer ajudar e quem precisa de ajuda — com tecnologia a serviço das pessoas."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Nosso propósito</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Muita gente quer ser voluntária, mas não sabe onde começar. Muitas organizações
              precisam de ajuda, mas não conseguem alcançar as pessoas certas. A VoluntarIA existe
              para resolver esses dois problemas ao mesmo tempo: reunir em um só lugar as
              oportunidades de voluntariado e ajudar cada pessoa a encontrar aquela que combina com
              o seu perfil.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Como a plataforma funciona</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>1. A pessoa cria o perfil e conta suas habilidades, interesses e disponibilidade.</li>
              <li>2. As organizações publicam suas necessidades e oportunidades.</li>
              <li>3. A plataforma aproxima os dois lados e a pessoa demonstra interesse.</li>
              <li>4. A organização aceita, combina os detalhes e a ação acontece.</li>
              <li>5. Horas e participação ficam registradas no histórico de quem ajudou.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <h2 className="text-2xl font-bold">Quem está por trás</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Um time pequeno, movido pela ideia de que tecnologia social só faz sentido perto das
          pessoas.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(team ?? []).map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.name}
                    className="h-14 w-14 rounded-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
                    {m.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-sm text-muted-foreground">{m.role}</p>
                </div>
              </div>
              {m.bio && <p className="mt-3 text-sm text-muted-foreground">{m.bio}</p>}
              {m.is_demo && (
                <span className="mt-3 inline-block rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  conteúdo de demonstração
                </span>
              )}
            </div>
          ))}
          {team && team.length === 0 && (
            <p className="text-sm text-muted-foreground">Equipe ainda não cadastrada.</p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="text-2xl font-bold">Visitas às organizações</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Registros das nossas visitas a ONGs e projetos sociais. Use as setas, o teclado ou
          arraste no celular para navegar; toque na foto para ampliar.
        </p>
        <Galeria fotos={fotos ?? []} />
      </section>
    </PageShell>
  );
}

function Galeria({ fotos }: { fotos: Foto[] }) {
  const [index, setIndex] = useState(0);
  const [aberta, setAberta] = useState(false);
  const total = fotos.length;
  const touchStart = useRef<number | null>(null);

  const avancar = useCallback(() => {
    setIndex((i) => (total ? (i + 1) % total : 0));
  }, [total]);
  const voltar = useCallback(() => {
    setIndex((i) => (total ? (i - 1 + total) % total : 0));
  }, [total]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") avancar();
      if (e.key === "ArrowLeft") voltar();
      if (e.key === "Escape") setAberta(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avancar, voltar]);

  if (!total) {
    return (
      <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        Ainda não há fotos de visitas cadastradas.
      </p>
    );
  }

  const atual = fotos[index]!;
  const data = formatarData(atual.visit_date);
  const local = [atual.city, atual.state].filter(Boolean).join(" — ");

  return (
    <div className="mt-6">
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card"
        onTouchStart={(e) => {
          touchStart.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const start = touchStart.current;
          const end = e.changedTouches[0]?.clientX ?? null;
          if (start == null || end == null) return;
          if (start - end > 50) avancar();
          if (end - start > 50) voltar();
          touchStart.current = null;
        }}
      >
        <button
          type="button"
          onClick={() => setAberta(true)}
          className="block w-full"
          aria-label={`Ampliar foto: ${atual.title}`}
        >
          <img
            src={atual.image_url}
            alt={atual.title}
            className="aspect-[16/9] w-full object-cover"
          />
        </button>

        <button
          type="button"
          onClick={voltar}
          aria-label="Foto anterior"
          className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 backdrop-blur"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={avancar}
          aria-label="Próxima foto"
          className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-background/85 backdrop-blur"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="border-t border-border p-5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{atual.title}</h3>
            {atual.is_demo && (
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                foto de demonstração
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[atual.org_name, local, data].filter(Boolean).join(" · ")}
          </p>
          {atual.caption && <p className="mt-2 text-sm text-muted-foreground">{atual.caption}</p>}
          <p className="mt-3 text-xs text-muted-foreground">
            Foto {index + 1} de {total}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {fotos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Ver foto ${i + 1}`}
            aria-current={i === index}
            className={`h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
              i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img src={f.image_url} alt={f.title} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {aberta && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={atual.title}
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setAberta(false)}
              aria-label="Fechar"
              className="grid h-10 w-10 place-items-center rounded-full bg-background/90"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <button
              type="button"
              onClick={voltar}
              aria-label="Foto anterior"
              className="absolute left-0 grid h-11 w-11 place-items-center rounded-full bg-background/85"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <img
              src={atual.image_url}
              alt={atual.title}
              className="max-h-full max-w-full rounded-2xl object-contain"
            />
            <button
              type="button"
              onClick={avancar}
              aria-label="Próxima foto"
              className="absolute right-0 grid h-11 w-11 place-items-center rounded-full bg-background/85"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <p className="py-3 text-center text-sm text-white">
            {[atual.title, atual.org_name, local, data].filter(Boolean).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}
