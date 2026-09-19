import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth", search: { modo: "entrar" }, replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
