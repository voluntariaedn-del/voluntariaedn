import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe, Instagram, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/organizacoes/$slug")({
  head: () => ({
    meta: [
      { title: "Perfil da organização — VoluntarIA" },
      {
        name: "description",
        content:
          "Conheça a organização, suas áreas de atuação, contatos e oportunidades abertas na VoluntarIA.",
      },
      { property: "og:title", content: "Perfil da organização — VoluntarIA" },
      {
        property: "og:description",
        content: "Áreas de atuação, contatos e oportunidades abertas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrgProfile,
});

function OrgProfile() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["organization", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <p className="mx-auto max-w-6xl px-4 py-20 text-sm text-muted-foreground">Carregando...</p>
      </PageShell>
    );
  }

  if (!data) {
    return (
      <PageShell>
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h1 className="text-2xl font-bold">Organização não encontrada</h1>
          <Button asChild className="mt-4">
            <Link to="/organizacoes">Ver todas as organizações</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="surface-gradient border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary-soft text-primary">
              {data.logo_url ? (
                <img src={data.logo_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-7 w-7" />
              )}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-3xl font-bold">{data.name}</h1>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {[data.city, data.state].filter(Boolean).join(" - ") || "Local a definir"}
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.verified ? (
              <Badge className="bg-primary-soft text-foreground hover:bg-primary-soft">
                <ShieldCheck className="mr-1 h-3.5 w-3.5 text-primary" /> Organização verificada
              </Badge>
            ) : (
              <Badge variant="secondary">Verificação pendente</Badge>
            )}
            {(data.causes ?? []).map((c) => (
              <Badge key={c} variant="secondary">
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Block title="Sobre a organização">
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {data.description || "Esta organização ainda não escreveu sua descrição."}
            </p>
          </Block>
          {data.mission && (
            <Block title="Missão">
              <p className="whitespace-pre-line text-sm text-muted-foreground">{data.mission}</p>
            </Block>
          )}
          <Block title="Oportunidades abertas">
            <p className="text-sm text-muted-foreground">
              A publicação de oportunidades chega na próxima etapa da plataforma.
            </p>
          </Block>
        </div>

        <aside className="space-y-6">
          <Block title="Contato">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {data.contact_email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary" /> {data.contact_email}
                </li>
              )}
              {data.contact_phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-primary" /> {data.contact_phone}
                </li>
              )}
              {data.website && (
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 shrink-0 text-primary" />
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="truncate underline"
                  >
                    {data.website}
                  </a>
                </li>
              )}
              {data.instagram && (
                <li className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 shrink-0 text-primary" /> {data.instagram}
                </li>
              )}
              {!data.contact_email && !data.contact_phone && !data.website && !data.instagram && (
                <li>Nenhum contato informado ainda.</li>
              )}
            </ul>
          </Block>
          <Block title="Informações">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Fundada em: {data.founded_year ?? "não informado"}</li>
              <li>Na VoluntarIA desde {new Date(data.created_at).toLocaleDateString("pt-BR")}</li>
            </ul>
          </Block>
        </aside>
      </section>
    </PageShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
