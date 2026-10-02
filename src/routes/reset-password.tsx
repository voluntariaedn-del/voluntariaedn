import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Definir nova senha — VoluntarIA" },
      { name: "description", content: "Defina uma nova senha para acessar sua conta na VoluntarIA." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [linkValido, setLinkValido] = useState<boolean | null>(null);

  useEffect(() => {
    // O link do e-mail chega com type=recovery no hash da URL.
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setLinkValido(true);
      return;
    }
    // Se o hash já foi consumido pelo cliente de autenticação, a sessão de
    // recuperação pode já estar ativa; confirma com o servidor.
    supabase.auth.getUser().then(({ data, error }) => {
      setLinkValido(!error && !!data.user);
    });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setEnviando(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      navigate({ to: "/painel", replace: true });
    } catch (err) {
      const m = err instanceof Error ? err.message.toLowerCase() : "";
      if (m.includes("weak") || m.includes("pwned"))
        toast.error("Essa senha é fácil de adivinhar. Escolha uma senha mais forte.");
      else toast.error("Não foi possível alterar a senha. Peça um novo link e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <PageShell>
      <section className="surface-gradient min-h-[70vh] px-4 py-14">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">
              Voluntar<span className="text-primary">IA</span>
            </span>
          </div>

          {linkValido === null ? (
            <p className="mt-8 text-sm text-muted-foreground">Verificando seu link...</p>
          ) : !linkValido ? (
            <div className="mt-6 space-y-4">
              <h1 className="text-xl font-bold">Link inválido ou expirado</h1>
              <p className="text-sm text-muted-foreground">
                O link de recuperação não é mais válido. Peça um novo para definir sua senha.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth" search={{ modo: "recuperar" }}>
                  Pedir novo link
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <h1 className="mt-6 text-xl font-bold">Definir nova senha</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Escolha uma senha nova para acessar sua conta.
              </p>
              <form onSubmit={submit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nova-senha">Nova senha</Label>
                  <Input
                    id="nova-senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmar-senha">Confirmar nova senha</Label>
                  <Input
                    id="confirmar-senha"
                    type="password"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={enviando}>
                  {enviando ? "Aguarde..." : "Salvar nova senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
