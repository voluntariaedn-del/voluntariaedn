import { Link } from "@tanstack/react-router";
import { HeartHandshake } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">
              Voluntar<span className="text-primary">IA</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Uma ponte entre quem quer ajudar e quem precisa de ajuda.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Plataforma</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/oportunidades" className="hover:text-foreground">
                Oportunidades
              </Link>
            </li>
            <li>
              <Link to="/organizacoes" className="hover:text-foreground">
                Organizações
              </Link>
            </li>
            <li>
              <Link to="/impacto" className="hover:text-foreground">
                Impacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Sobre</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/quem-somos" className="hover:text-foreground">
                Quem nós somos
              </Link>
            </li>
            <li>
              <Link to="/como-funciona" className="hover:text-foreground">
                Como funciona
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Participe</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" search={{ modo: "cadastro" }} className="hover:text-foreground">
                Quero ser voluntário
              </Link>
            </li>
            <li>
              <Link to="/auth" search={{ modo: "cadastro" }} className="hover:text-foreground">
                Sou uma organização
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        VoluntarIA — tecnologia a serviço da solidariedade.
      </div>
    </footer>
  );
}
