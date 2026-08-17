import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { globalSearch } from "@/lib/data.functions";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "Search — INKWAVE AI" },
      { name: "description", content: "Search across your projects, prompts and generated content." },
      { property: "og:title", content: "Search — INKWAVE AI" },
      { property: "og:description", content: "Find any project, prompt or piece of content instantly." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const fn = useServerFn(globalSearch);
  const query = useQuery({
    queryKey: ["search", q],
    queryFn: () => fn({ data: { q } }),
    enabled: q.trim().length > 1,
  });

  const r = query.data;

  return (
    <AppShell title="Search" subtitle="Find anything in your workspace">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search projects, prompts and content…"
        className="max-w-xl"
        aria-label="Search everything"
        autoFocus
      />

      {query.isLoading && <Skeleton className="mt-6 h-40 max-w-xl rounded-2xl" />}

      {r && (
        <div className="mt-6 max-w-xl space-y-6">
          <Group title="Projects" empty={r.projects.length === 0}>
            {r.projects.map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="bg-card hover:border-primary/40 block rounded-xl border p-4 text-sm transition-colors"
              >
                {p.name}
              </Link>
            ))}
          </Group>
          <Group title="Prompts" empty={r.prompts.length === 0}>
            {r.prompts.map((p) => (
              <div key={p.id} className="bg-card rounded-xl border p-4 text-sm">
                {p.title}
                <span className="text-muted-foreground ml-2 text-xs">{p.category}</span>
              </div>
            ))}
          </Group>
          <Group title="Content" empty={r.content.length === 0}>
            {r.content.map((c) => (
              <Link
                key={c.id}
                to="/library/$id"
                params={{ id: c.id }}
                className="bg-card hover:border-primary/40 block rounded-xl border p-4 text-sm transition-colors"
              >
                {c.title}
                <span className="text-muted-foreground ml-2 text-xs">{c.content_type}</span>
              </Link>
            ))}
          </Group>
        </div>
      )}
    </AppShell>
  );
}

function Group({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-2 space-y-2">
        {empty ? <p className="text-muted-foreground text-sm">No matches.</p> : children}
      </div>
    </section>
  );
}
