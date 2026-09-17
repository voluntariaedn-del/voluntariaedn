import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Building2, MapPin, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader, PageShell } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/organizacoes/")({
  head: () => ({
    meta: [
      { title: "Organizações — VoluntarIA" },
      {
        name: "description",
        content:
          "Conheça as ONGs, instituições e projetos sociais cadastrados na VoluntarIA e veja quais já são verificados.",
      },
      { property: "og:title", content: "Organizações na VoluntarIA" },
      {
        property: "og:description",
        content: "ONGs, instituições e projetos sociais cadastrados na plataforma.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Organizacoes,
});

function Organizacoes() {
  const [term, setTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, slug, city, state, logo_url, verified, description, causes")
        .order("verified", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (data ?? []).filter((org) => {
    const q = term.trim().toLowerCase();
    if (!q) return true;
    return [org.name, org.city, org.state, org.description]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <PageShell>
      <PageHeader
        eyebrow="Organizações"
        title="ONGs, instituições e projetos sociais"
        description="Cada organização tem uma página pública com sua história, áreas de atuação e contatos."
      />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Buscar por nome, cidade ou causa"
          className="max-w-md"
        />

        {isLoading ? (
          <p className="mt-8 text-sm text-muted-foreground">Carregando organizações...</p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
            Nenhuma organização encontrada. Se você representa uma ONG ou projeto social,{" "}
            <Link
              to="/auth"
              search={{ modo: "cadastro", tipo: "organizacao" }}
              className="font-medium text-primary underline"
            >
              crie sua conta
            </Link>
            .
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((org) => (
              <Link
                key={org.id}
                to="/organizacoes/$slug"
                params={{ slug: org.slug }}
                className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-soft text-primary">
                    {org.logo_url ? (
                      <img src={org.logo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-5 w-5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{org.name}</h2>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {[org.city, org.state].filter(Boolean).join(" - ") || "Local a definir"}
                    </p>
                  </div>
                </div>
                {org.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                    {org.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {org.verified && (
                    <Badge className="bg-primary-soft text-foreground hover:bg-primary-soft">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Verificada
                    </Badge>
                  )}
                  {(org.causes ?? []).slice(0, 3).map((c) => (
                    <Badge key={c} variant="secondary">
                      {c}
                    </Badge>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
