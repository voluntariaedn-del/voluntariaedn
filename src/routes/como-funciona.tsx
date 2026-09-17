import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/como-funciona")({
  head: () => ({
    meta: [
      { title: "Como funciona a VoluntarIA" },
      {
        name: "description",
        content:
          "Do cadastro à avaliação: entenda o caminho completo entre voluntário e organização dentro da VoluntarIA.",
      },
      { property: "og:title", content: "Como funciona a VoluntarIA" },
      {
        property: "og:description",
        content: "O caminho completo entre quem quer ajudar e quem precisa de ajuda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComoFunciona,
});

const fluxo = [
  { t: "Pessoa quer ajudar", d: "Alguém decide doar tempo, habilidade ou recursos." },
  { t: "Cria seu perfil", d: "Nome, cidade, contato e uma breve apresentação." },
  {
    t: "Informa habilidades e disponibilidade",
    d: "Interesses, o que sabe fazer, dias livres e modalidade.",
  },
  { t: "Encontra oportunidades", d: "Busca por causa, cidade, data, urgência e duração." },
  { t: "Demonstra interesse", d: "Envia candidatura com mensagem e disponibilidade." },
  { t: "A organização responde", d: "Aceita, recusa ou pede mais informações." },
  { t: "Conexão criada", d: "Voluntário e organização conversam por mensagens." },
  { t: "O voluntariado acontece", d: "A ação é realizada no local ou à distância." },
  { t: "Horas registradas", d: "A organização confirma a participação e as horas." },
  { t: "Avaliação e histórico", d: "Os dois lados se avaliam e o histórico é guardado." },
];

function ComoFunciona() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Passo a passo"
        title="Como funciona a VoluntarIA"
        description="Uma ponte entre necessidade e disponibilidade, com cada etapa registrada."
      />
      <section className="mx-auto max-w-3xl px-4 py-14">
        <ol className="relative space-y-6 border-l border-border pl-6">
          {fluxo.map((item, i) => (
            <li key={item.t}>
              <span className="absolute -left-4 grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h2 className="text-lg font-semibold">{item.t}</h2>
              <p className="text-sm text-muted-foreground">{item.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Onde estamos agora</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Nesta primeira entrega já funcionam: contas, perfis de voluntário e de organização,
            páginas públicas e os painéis iniciais. Oportunidades, candidaturas, mensagens, horas,
            avaliações e as funções de inteligência artificial chegam nas próximas etapas.
          </p>
          <Button asChild className="mt-4">
            <Link to="/auth" search={{ modo: "cadastro", tipo: "voluntario" }}>
              Criar minha conta
            </Link>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}
