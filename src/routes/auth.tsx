import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Modo = "entrar" | "cadastro" | "recuperar";
type Tipo = "voluntario" | "organizacao";

type AuthSearch = { modo: Modo; tipo?: Tipo };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    const m = search["modo"];
    const modo: Modo = m === "cadastro" || m === "recuperar" ? m : "entrar";
    const tipo = search["tipo"];
    return tipo === "organizacao" || tipo === "voluntario" ? { modo, tipo } : { modo };
  },
  head: () => ({
    meta: [
      { title: "Entrar ou criar conta — VoluntarIA" },
      {
        name: "description",
        content:
          "Crie sua conta de voluntário ou de organização na VoluntarIA e comece a transformar boa vontade em ação.",
      },
      { property: "og:title", content: "Entrar ou criar conta — VoluntarIA" },
      {
        property: "og:description",
        content: "Acesse a VoluntarIA como voluntário ou como organização.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function traduzErro(message: string) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já tem uma conta. Tente entrar.";
  if (m.includes("invalid login")) return "E-mail ou senha incorretos.";
  if (m.includes("weak") || m.includes("pwned"))
    return "Essa senha é fácil de adivinhar. Escolha uma senha mais forte.";
  if (m.includes("invalid") && m.includes("email")) return "Informe um e-mail válido.";
  if (m.includes("password") && m.includes("6")) return "A senha precisa ter ao menos 6 caracteres.";
  if (m.includes("email not confirmed"))
    return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (m.includes("rate limit")) return "Muitas tentativas. Aguarde alguns minutos e tente de novo.";
  return "Não foi possível concluir. Tente novamente em instantes.";
}

function AuthPage() {
  const { modo, tipo } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSession();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState<Tipo>(tipo ?? "voluntario");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (tipo) setPerfil(tipo);
  }, [tipo]);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/painel", replace: true });
  }, [loading, user, navigate]);

  function trocarModo(next: Modo) {
    const search: AuthSearch = tipo ? { modo: next, tipo } : { modo: next };
    navigate({ to: "/auth", search, replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (senha.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (modo === "cadastro" && nome.trim().length < 3) {
      toast.error("Informe seu nome completo.");
      return;
    }

    setEnviando(true);
    try {
      if (modo === "cadastro") {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: `${window.location.origin}/painel`,
            data: {
              full_name: nome.trim(),
              account_type: perfil === "organizacao" ? "organization" : "volunteer",
            },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Se pedirmos confirmação, verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
      navigate({ to: "/painel", replace: true });
    } catch (err) {
      toast.error(traduzErro(err instanceof Error ? err.message : ""));
    } finally {
      setEnviando(false);
    }
  }

  async function entrarComGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/painel`,
        queryParams: { account_type: perfil === "organizacao" ? "organization" : "volunteer" },
      },
    });
    if (error) toast.error(traduzErro(error.message));
  }

  const cadastro = modo === "cadastro";

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

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            <button
              type="button"
              onClick={() => trocarModo("entrar")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${!cadastro ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarModo("cadastro")}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${cadastro ? "bg-card shadow-sm" : "text-muted-foreground"}`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {cadastro && (
              <>
                <div className="space-y-2">
                  <Label>Quero me cadastrar como</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        ["voluntario", "Sou voluntário"],
                        ["organizacao", "Sou organização"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPerfil(value)}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                          perfil === value
                            ? "border-primary bg-primary-soft text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">
                    {perfil === "organizacao" ? "Seu nome (responsável)" : "Nome completo"}
                  </Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como podemos te chamar?"
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete={cadastro ? "new-password" : "current-password"}
              />
            </div>

            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? "Aguarde..." : cadastro ? "Criar minha conta" : "Entrar"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={entrarComGoogle}>
            Continuar com Google
          </Button>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Ao continuar você concorda em usar a plataforma com responsabilidade.{" "}
            <Link to="/como-funciona" className="text-primary underline">
              Ver como funciona
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
