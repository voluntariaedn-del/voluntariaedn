import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";
import { useRoles, useSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/painel/admin")({
  head: () => ({
    meta: [
      { title: "Painel administrativo — VoluntarIA" },
      {
        name: "description",
        content: "Área interna de administração da VoluntarIA: pessoas, organizações e verificação.",
      },
      { property: "og:title", content: "Painel administrativo — VoluntarIA" },
      { property: "og:description", content: "Administração da VoluntarIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PainelAdmin />
    </RequireAuth>
  ),
});

function PainelAdmin() {
  const { user } = useSession();
  const { data: roles, isLoading: carregandoPapeis } = useRoles(user?.id);
  const queryClient = useQueryClient();
  const isAdmin = !!roles?.includes("admin");

  const { data: pessoas } = useQuery({
    queryKey: ["admin-profiles"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, city, state, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: orgs } = useQuery({
    queryKey: ["admin-orgs"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, city, state, verified, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  const verificar = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase.from("organizations").update({ verified }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Verificação atualizada.");
      queryClient.invalidateQueries({ queryKey: ["admin-orgs"] });
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: () => toast.error("Não foi possível atualizar a verificação."),
  });

  if (carregandoPapeis) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
          Carregando...
        </div>
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell>
        <PageHeader eyebrow="Administração" title="Acesso restrito" />
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex items-start gap-3 rounded-2xl border border-urgent/40 bg-urgent-soft p-6">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-urgent" />
            <p className="text-sm">
              Esta área é exclusiva da equipe administrativa da VoluntarIA. O papel de administrador
              é concedido internamente e não pode ser solicitado pelo cadastro.
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Administração"
        title="Pessoas e organizações"
        description="Acompanhe quem está na plataforma e conceda a verificação das organizações."
      />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Organizações ({orgs?.length ?? 0})</h2>
          <div className="mt-4 space-y-3">
            {(orgs ?? []).map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-medium">{o.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[o.city, o.state].filter(Boolean).join(" — ") || "Localização não informada"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {o.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1 text-xs text-primary">
                      <BadgeCheck className="h-3.5 w-3.5" /> verificada
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant={o.verified ? "outline" : "default"}
                    disabled={verificar.isPending}
                    onClick={() => verificar.mutate({ id: o.id, verified: !o.verified })}
                  >
                    {o.verified ? "Remover verificação" : "Verificar"}
                  </Button>
                </div>
              </div>
            ))}
            {orgs && orgs.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma organização cadastrada ainda.</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Pessoas ({pessoas?.length ?? 0})</h2>
          <div className="mt-4 space-y-2">
            {(pessoas ?? []).map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-4"
              >
                <p className="font-medium">{p.full_name || "Sem nome informado"}</p>
                <p className="text-sm text-muted-foreground">
                  {[p.city, p.state].filter(Boolean).join(" — ") || "Localização não informada"}
                </p>
              </div>
            ))}
            {pessoas && pessoas.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma pessoa cadastrada ainda.</p>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
