import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRoles, useSession } from "@/lib/auth";
import { PageShell } from "@/components/site/PageShell";
import { RequireAuth } from "@/components/site/RequireAuth";

export const Route = createFileRoute("/painel/")({
  head: () => ({
    meta: [
      { title: "Meu painel — VoluntarIA" },
      {
        name: "description",
        content: "Acesse o seu painel na VoluntarIA como voluntário, organização ou administrador.",
      },
      { property: "og:title", content: "Meu painel — VoluntarIA" },
      { property: "og:description", content: "Seu espaço na VoluntarIA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelIndex,
});

function PainelIndex() {
  return (
    <RequireAuth>
      <Redirecionador />
    </RequireAuth>
  );
}

function Redirecionador() {
  const { user } = useSession();
  const { data: roles, isLoading } = useRoles(user?.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading || !roles) return;
    if (roles.includes("admin")) navigate({ to: "/painel/admin", replace: true });
    else if (roles.includes("organization")) navigate({ to: "/painel/organizacao", replace: true });
    else navigate({ to: "/painel/voluntario", replace: true });
  }, [roles, isLoading, navigate]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Abrindo o seu painel...
      </div>
    </PageShell>
  );
}
