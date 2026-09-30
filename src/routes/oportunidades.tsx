import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, Clock, MapPin, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import {
  formatarData,
  MODALIDADES,
  URGENCIAS,
  useMyApplications,
  useOpportunities,
  type Filtros,
} from "@/lib/opportunities";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

const filtrosIniciais: Filtros = {
  termo: "",
  causa: "",
  cidade: "",
  estado: "",
  modalidade: "",
  urgencia: "",
};

function Oportunidades() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciais);
  const [aberta, setAberta] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { data: causas } = useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("slug, name")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: oportunidades, isLoading } = useOpportunities(filtros);
  const { data: minhas } = useMyApplications(user?.id);

  const jaCandidatado = new Set((minhas ?? []).map((a) => a.opportunity_id));

  function set(campo: keyof Filtros, valor: string) {
    setFiltros((f) => ({ ...f, [campo]: valor }));
  }

  async function candidatar(opportunityId: string) {
    if (!user) return;
    if (mensagem.trim().length < 10) {
      toast.error("Escreva uma mensagem com pelo menos 10 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.from("applications").insert({
        opportunity_id: opportunityId,
        volunteer_id: user.id,
        message: mensagem.trim(),
        availability: disponibilidade.trim() || null,
      });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success("Candidatura enviada. A organização vai responder por aqui.");
      setAberta(null);
      setMensagem("");
      setDisponibilidade("");
    } catch {
      toast.error("Não foi possível enviar sua candidatura agora.");
    } finally {
      setEnviando(false);
    }
  }

  const lista = oportunidades ?? [];

  return (
    <PageShell>
      <PageHeader
        eyebrow="Oportunidades"
        title="Oportunidades de voluntariado"
        description="Ações publicadas pelas organizações cadastradas. Use os filtros para encontrar o que combina com você."
      />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="termo">Buscar</Label>
              <Input
                id="termo"
                value={filtros.termo}
                onChange={(e) => set("termo", e.target.value)}
                placeholder="Palavra do título ou da descrição"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="causa">Causa</Label>
              <select
                id="causa"
                value={filtros.causa}
                onChange={(e) => set("causa", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Todas</option>
                {(causas ?? []).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={filtros.cidade}
                onChange={(e) => set("cidade", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado (UF)</Label>
              <Input
                id="estado"
                maxLength={2}
                value={filtros.estado}
                onChange={(e) => set("estado", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="modalidade">Modalidade</Label>
                <select
                  id="modalidade"
                  value={filtros.modalidade}
                  onChange={(e) => set("modalidade", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  {MODALIDADES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgencia">Urgência</Label>
                <select
                  id="urgencia"
                  value={filtros.urgencia}
                  onChange={(e) => set("urgencia", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Todas</option>
                  {URGENCIAS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setFiltros(filtrosIniciais)}>
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>}

          {!isLoading && lista.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Nenhuma oportunidade encontrada</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ainda não há ações publicadas com esses filtros. As oportunidades aparecem aqui
                assim que as organizações publicam — nada é inventado pela plataforma.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/organizacoes">Ver organizações</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth" search={{ modo: "cadastro", tipo: "organizacao" }}>
                    Sou uma organização
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {lista.map((op) => {
            const org = op.organizations as {
              name: string;
              slug: string;
              verified: boolean;
              logo_url: string | null;
            } | null;
            const candidatado = jaCandidatado.has(op.id);
            return (
              <article key={op.id} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {op.urgency === "alta" && (
                        <span className="rounded-full bg-urgent-soft px-2.5 py-1 text-xs font-semibold text-urgent">
                          🚨 Urgente
                        </span>
                      )}
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs capitalize">
                        {op.modality}
                      </span>
                      {op.cause && (
                        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs">
                          {op.cause}
                        </span>
                      )}
                    </div>
                    <h2 className="mt-3 text-lg font-bold">{op.title}</h2>
                    {org && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Link
                          to="/organizacoes/$slug"
                          params={{ slug: org.slug }}
                          className="hover:underline"
                        >
                          {org.name}
                        </Link>
                        {org.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground">{op.description}</p>

                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {[op.city, op.state].filter(Boolean).join(" — ") || "Local a combinar"}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {formatarData(op.date)}
                        {op.time ? ` · ${op.time}` : ""}
                      </span>
                      {op.duration_hours && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {op.duration_hours} h
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {op.slots} {op.slots === 1 ? "vaga" : "vagas"}
                      </span>
                    </div>

                    {op.skills.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {op.skills.map((s: string) => (
                          <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0">
                    {!user ? (
                      <Button asChild>
                        <Link to="/auth" search={{ modo: "entrar" }}>
                          Entrar para participar
                        </Link>
                      </Button>
                    ) : candidatado ? (
                      <span className="inline-block rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                        Candidatura enviada
                      </span>
                    ) : (
                      <Button onClick={() => setAberta(aberta === op.id ? null : op.id)}>
                        {aberta === op.id ? "Fechar" : "Quero participar"}
                      </Button>
                    )}
                  </div>
                </div>

                {user && aberta === op.id && !candidatado && (
                  <div className="mt-6 space-y-4 rounded-xl border border-border bg-background p-5">
                    <div className="space-y-2">
                      <Label htmlFor={`msg-${op.id}`}>Sua mensagem para a organização</Label>
                      <Textarea
                        id={`msg-${op.id}`}
                        rows={4}
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        placeholder="Conte por que você quer participar e o que sabe fazer."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`disp-${op.id}`}>Sua disponibilidade</Label>
                      <Input
                        id={`disp-${op.id}`}
                        value={disponibilidade}
                        onChange={(e) => setDisponibilidade(e.target.value)}
                        placeholder="Ex.: sábados de manhã"
                      />
                    </div>
                    <Button onClick={() => candidatar(op.id)} disabled={enviando}>
                      {enviando ? "Enviando..." : "Enviar candidatura"}
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
