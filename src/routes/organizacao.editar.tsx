import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify, useMyOrganization, useSession } from "@/lib/auth";
import { PageShell, PageHeader } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/organizacao/editar")({
  head: () => ({
    meta: [
      { title: "Dados da organização — VoluntarIA" },
      {
        name: "description",
        content:
          "Cadastre ou atualize os dados institucionais da sua organização na VoluntarIA.",
      },
      { property: "og:title", content: "Dados da organização — VoluntarIA" },
      {
        property: "og:description",
        content: "Mantenha o perfil da sua organização completo para atrair voluntários.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <EditarOrganizacao />
    </RequireAuth>
  ),
});

function EditarOrganizacao() {
  const { user } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: org, isLoading } = useMyOrganization(user?.id);

  const { data: causas } = useQuery({
    queryKey: ["causes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("causes")
        .select("slug, name")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    name: "",
    logo_url: "",
    description: "",
    mission: "",
    city: "",
    state: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    instagram: "",
    document: "",
    founded_year: "",
  });
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!org) return;
    setForm({
      name: org.name ?? "",
      logo_url: org.logo_url ?? "",
      description: org.description ?? "",
      mission: org.mission ?? "",
      city: org.city ?? "",
      state: org.state ?? "",
      contact_email: org.contact_email ?? "",
      contact_phone: org.contact_phone ?? "",
      website: org.website ?? "",
      instagram: org.instagram ?? "",
      document: org.document ?? "",
      founded_year: org.founded_year ? String(org.founded_year) : "",
    });
    setSelecionadas(org.causes ?? []);
  }, [org]);

  function set(campo: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function alternarCausa(slug: string) {
    setSelecionadas((c) => (c.includes(slug) ? c.filter((s) => s !== slug) : [...c, slug]));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (form.name.trim().length < 3) {
      toast.error("Informe o nome da organização.");
      return;
    }
    const ano = form.founded_year ? Number(form.founded_year) : null;
    if (ano !== null && (Number.isNaN(ano) || ano < 1800 || ano > new Date().getFullYear())) {
      toast.error("Informe um ano de fundação válido.");
      return;
    }

    setSalvando(true);
    try {
      const dados = {
        name: form.name.trim(),
        logo_url: form.logo_url.trim() || null,
        description: form.description.trim() || null,
        mission: form.mission.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim().toUpperCase() || null,
        contact_email: form.contact_email.trim() || null,
        contact_phone: form.contact_phone.trim() || null,
        website: form.website.trim() || null,
        instagram: form.instagram.trim().replace(/^@/, "") || null,
        document: form.document.trim() || null,
        founded_year: ano,
        causes: selecionadas,
      };

      if (org) {
        const { error } = await supabase.from("organizations").update(dados).eq("id", org.id);
        if (error) throw error;
      } else {
        const base = slugify(dados.name) || "organizacao";
        const sufixo = Math.random().toString(36).slice(2, 6);
        const { error } = await supabase.from("organizations").insert({
          ...dados,
          owner_id: user.id,
          slug: `${base}-${sufixo}`,
        });
        if (error) throw error;
      }

      await queryClient.invalidateQueries();
      toast.success(org ? "Dados atualizados." : "Organização cadastrada.");
      navigate({ to: "/painel/organizacao" });
    } catch {
      toast.error("Não foi possível salvar agora. Tente novamente em instantes.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Minha organização"
        title={org ? "Editar dados da organização" : "Cadastrar organização"}
        description="Essas informações aparecem no perfil público que os voluntários visitam."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando seus dados...</p>
        ) : (
          <form onSubmit={salvar} className="space-y-8">
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Identificação</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nome da organização</Label>
                  <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="logo_url">Logo (endereço da imagem)</Label>
                  <Input
                    id="logo_url"
                    value={form.logo_url}
                    onChange={(e) => set("logo_url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">CNPJ ou documento</Label>
                  <Input
                    id="document"
                    value={form.document}
                    onChange={(e) => set("document", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founded_year">Ano de fundação</Label>
                  <Input
                    id="founded_year"
                    inputMode="numeric"
                    value={form.founded_year}
                    onChange={(e) => set("founded_year", e.target.value)}
                    placeholder="2015"
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
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Sobre o trabalho</h2>
              <div className="mt-4 grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="O que a organização faz no dia a dia."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mission">Missão</Label>
                  <Textarea
                    id="mission"
                    rows={3}
                    value={form.mission}
                    onChange={(e) => set("mission", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Áreas de atuação</Label>
                  <div className="flex flex-wrap gap-2">
                    {(causas ?? []).map((c) => {
                      const ativo = selecionadas.includes(c.slug);
                      return (
                        <button
                          key={c.slug}
                          type="button"
                          onClick={() => alternarCausa(c.slug)}
                          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                            ativo
                              ? "border-primary bg-primary-soft text-foreground"
                              : "border-border text-muted-foreground hover:border-primary/40"
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Contato e redes</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">E-mail de contato</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => set("contact_email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Telefone</Label>
                  <Input
                    id="contact_phone"
                    value={form.contact_phone}
                    onChange={(e) => set("contact_phone", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Site</Label>
                  <Input
                    id="website"
                    value={form.website}
                    onChange={(e) => set("website", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={form.instagram}
                    onChange={(e) => set("instagram", e.target.value)}
                    placeholder="@suaong"
                  />
                </div>
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <p>
                O selo de organização verificada é concedido pela equipe da VoluntarIA após a
                análise dos dados. Ele não pode ser ativado pela própria organização.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando..." : org ? "Salvar alterações" : "Cadastrar organização"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/painel/organizacao" })}
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
