import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMyOrganization, useSession } from "@/lib/auth";
import { MODALIDADES, URGENCIAS } from "@/lib/opportunities";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/oportunidade/nova")({
  head: () => ({
    meta: [
      { title: "Publicar oportunidade — VoluntarIA" },
      {
        name: "description",
        content: "Publique uma ação de voluntariado e receba candidaturas de voluntários.",
      },
      { property: "og:title", content: "Publicar oportunidade — VoluntarIA" },
      { property: "og:description", content: "Crie uma ação de voluntariado na VoluntarIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NovaOportunidade />
    </RequireAuth>
  ),
});

function NovaOportunidade() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: org, isLoading } = useMyOrganization(user?.id);

  const { data: causas } = useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("causes").select("slug, name").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    cause: "",
    city: "",
    state: "",
    date: "",
    time: "",
    duration_hours: "",
    slots: "1",
    skills: "",
    modality: "presencial",
    urgency: "media",
  });
  const [salvando, setSalvando] = useState(false);

  function set(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    if (form.title.trim().length < 5) {
      toast.error("Escreva um título com pelo menos 5 caracteres.");
      return;
    }
    if (form.description.trim().length < 20) {
      toast.error("Descreva a ação com pelo menos 20 caracteres.");
      return;
    }
    const vagas = Number(form.slots);
    if (!Number.isFinite(vagas) || vagas < 1) {
      toast.error("Informe um número de vagas válido.");
      return;
    }

    setSalvando(true);
    try {
      const { error } = await supabase.from("opportunities").insert({
        organization_id: org.id,
        title: form.title.trim(),
        description: form.description.trim(),
        cause: form.cause || null,
        city: form.city.trim() || org.city,
        state: form.state.trim().toUpperCase() || org.state,
        date: form.date || null,
        time: form.time.trim() || null,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
        slots: vagas,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        modality: form.modality,
        urgency: form.urgency,
      });
      if (error) throw error;
      await queryClient.invalidateQueries();
      toast.success("Oportunidade publicada.");
      navigate({ to: "/painel/oportunidades" });
    } catch {
      toast.error("Não foi possível publicar agora. Tente novamente em instantes.");
    } finally {
      setSalvando(false);
    }
  }

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-muted-foreground">
          Carregando...
        </div>
      </PageShell>
    );
  }

  if (!org) {
    return (
      <PageShell>
        <PageHeader
          eyebrow="Publicar oportunidade"
          title="Cadastre sua organização primeiro"
          description="Só organizações cadastradas podem publicar ações de voluntariado."
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Button asChild>
            <Link to="/organizacao/editar">Cadastrar organização</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Publicar oportunidade"
        title="Nova oportunidade de voluntariado"
        description="Quanto mais claro o convite, mais fácil um voluntário reconhecer que aquela ação combina com ele."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <form onSubmit={salvar} className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">O que será feito</h2>
            <div className="mt-4 grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da ação</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Ex.: Mutirão de leitura para crianças"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Explique a atividade, o público atendido e o que o voluntário vai fazer."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cause">Causa</Label>
                <select
                  id="cause"
                  value={form.cause}
                  onChange={(e) => set("cause", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Selecione uma causa</option>
                  {(causas ?? []).map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Habilidades necessárias (separadas por vírgula)</Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  placeholder="Paciência, leitura em voz alta"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Quando e onde</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder={org.city ?? "Cidade da ação"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder={org.state ?? "SP"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  value={form.time}
                  onChange={(e) => set("time", e.target.value)}
                  placeholder="09h às 12h"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duração (horas)</Label>
                <Input
                  id="duration_hours"
                  inputMode="decimal"
                  value={form.duration_hours}
                  onChange={(e) => set("duration_hours", e.target.value)}
                  placeholder="3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slots">Vagas</Label>
                <Input
                  id="slots"
                  inputMode="numeric"
                  value={form.slots}
                  onChange={(e) => set("slots", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modality">Modalidade</Label>
                <select
                  id="modality"
                  value={form.modality}
                  onChange={(e) => set("modality", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {MODALIDADES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Nível de urgência</Label>
                <select
                  id="urgency"
                  value={form.urgency}
                  onChange={(e) => set("urgency", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {URGENCIAS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={salvando}>
              {salvando ? "Publicando..." : "Publicar oportunidade"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate({ to: "/painel/oportunidades" })}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
