import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useProfile, useSession, useVolunteerProfile } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/perfil/editar")({
  head: () => ({
    meta: [
      { title: "Editar meu perfil — VoluntarIA" },
      {
        name: "description",
        content:
          "Atualize seus dados de voluntário na VoluntarIA: cidade, interesses, habilidades e disponibilidade.",
      },
      { property: "og:title", content: "Editar meu perfil — VoluntarIA" },
      { property: "og:description", content: "Mantenha seu perfil de voluntário atualizado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EditarPerfil />
    </RequireAuth>
  ),
});

const DIAS = [
  "Manhãs de semana",
  "Tardes de semana",
  "Noites de semana",
  "Sábados",
  "Domingos",
  "Sob combinação",
];

const MODALIDADES = [
  { value: "presencial", label: "Presencial" },
  { value: "remoto", label: "Remoto" },
  { value: "hibrido", label: "Tanto faz" },
];

function listaParaTexto(v: string[] | null | undefined) {
  return (v ?? []).join(", ");
}

function textoParaLista(v: string) {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function EditarPerfil() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: carregandoPerfil } = useProfile(user?.id);
  const { data: vol, isLoading: carregandoVol } = useVolunteerProfile(user?.id);

  const [form, setForm] = useState({
    full_name: "",
    avatar_url: "",
    city: "",
    state: "",
    phone: "",
    bio: "",
    interests: "",
    skills: "",
    experience: "",
    hours_per_week: "",
    modality: "presencial",
  });
  const [availability, setAvailability] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!profile && !vol) return;
    setForm({
      full_name: profile?.full_name ?? "",
      avatar_url: profile?.avatar_url ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
      interests: listaParaTexto(vol?.interests),
      skills: listaParaTexto(vol?.skills),
      experience: vol?.experience ?? "",
      hours_per_week: vol?.hours_per_week ? String(vol.hours_per_week) : "",
      modality: vol?.modality ?? "presencial",
    });
    setAvailability(vol?.availability ?? []);
  }, [profile, vol]);

  function set(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function alternarDia(dia: string) {
    setAvailability((a) => (a.includes(dia) ? a.filter((d) => d !== dia) : [...a, dia]));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (form.full_name.trim().length < 3) {
      toast.error("Informe seu nome completo.");
      return;
    }
    const horas = form.hours_per_week ? Number(form.hours_per_week) : null;
    if (horas !== null && (Number.isNaN(horas) || horas < 0 || horas > 80)) {
      toast.error("Informe as horas por semana entre 0 e 80.");
      return;
    }

    setSalvando(true);
    try {
      const { error: erroPerfil } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name.trim(),
          avatar_url: form.avatar_url.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim().toUpperCase() || null,
          phone: form.phone.trim() || null,
          bio: form.bio.trim() || null,
        })
        .eq("id", user.id);
      if (erroPerfil) throw erroPerfil;

      const { error: erroVol } = await supabase.from("volunteer_profiles").upsert(
        {
          user_id: user.id,
          interests: textoParaLista(form.interests),
          skills: textoParaLista(form.skills),
          experience: form.experience.trim() || null,
          hours_per_week: horas,
          modality: form.modality,
          availability,
        },
        { onConflict: "user_id" },
      );
      if (erroVol) throw erroVol;

      await queryClient.invalidateQueries();
      toast.success("Perfil atualizado.");
      navigate({ to: "/painel/voluntario" });
    } catch {
      toast.error("Não foi possível salvar agora. Tente novamente em instantes.");
    } finally {
      setSalvando(false);
    }
  }

  const carregando = carregandoPerfil || carregandoVol;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Meu perfil"
        title="Editar perfil de voluntário"
        description="Quanto mais completo o seu perfil, melhores serão as combinações com as oportunidades."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {carregando ? (
          <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
        ) : (
          <form onSubmit={salvar} className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Dados pessoais</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="full_name">Nome completo</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={(e) => set("full_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="avatar_url">Foto (endereço da imagem)</Label>
                  <Input
                    id="avatar_url"
                    value={form.avatar_url}
                    onChange={(e) => set("avatar_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado (UF)</Label>
                  <Input
                    id="state"
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    placeholder="SP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="(11) 90000-0000"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bio">Sobre você</Label>
                  <Textarea
                    id="bio"
                    rows={4}
                    value={form.bio}
                    onChange={(e) => set("bio", e.target.value)}
                    placeholder="Conte um pouco da sua motivação para ajudar."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Interesses e habilidades</h2>
              <div className="mt-4 grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="interests">Interesses (separados por vírgula)</Label>
                  <Input
                    id="interests"
                    value={form.interests}
                    onChange={(e) => set("interests", e.target.value)}
                    placeholder="Educação, Meio ambiente, Animais"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Habilidades (separadas por vírgula)</Label>
                  <Input
                    id="skills"
                    value={form.skills}
                    onChange={(e) => set("skills", e.target.value)}
                    placeholder="Ensino, Cozinha, Design, Direção"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experiências anteriores</Label>
                  <Textarea
                    id="experience"
                    rows={3}
                    value={form.experience}
                    onChange={(e) => set("experience", e.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Disponibilidade</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {DIAS.map((dia) => {
                  const ativo = availability.includes(dia);
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => alternarDia(dia)}
                      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        ativo
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {dia}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hours_per_week">Horas disponíveis por semana</Label>
                  <Input
                    id="hours_per_week"
                    inputMode="numeric"
                    value={form.hours_per_week}
                    onChange={(e) => set("hours_per_week", e.target.value)}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Modalidade preferida</Label>
                  <div className="flex flex-wrap gap-2">
                    {MODALIDADES.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => set("modality", m.value)}
                        className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                          form.modality === m.value
                            ? "border-primary bg-primary-soft text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/painel/voluntario" })}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </PageShell>
  );
}
