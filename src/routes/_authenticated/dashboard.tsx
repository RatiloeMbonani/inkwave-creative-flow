import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStats, listContent, listProjects } from "@/lib/data.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTENT_TYPES, STATUS_LABEL } from "@/lib/content-types";
import { FileText, Share2, Mail, Code2, Plus, Sparkles, Type, FolderKanban } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — INKWAVE AI" },
      { name: "description", content: "Your content stats, recent work and quick-create tools." },
      { property: "og:title", content: "Dashboard — INKWAVE AI" },
      { property: "og:description", content: "Your INKWAVE AI content workspace at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const TYPE_ICON = { blog: FileText, social: Share2, email: Mail, code: Code2 } as const;

function Dashboard() {
  const stats = useServerFn(getStats);
  const content = useServerFn(listContent);
  const projects = useServerFn(listProjects);

  const statsQ = useQuery({ queryKey: ["stats", 0], queryFn: () => stats({ data: { days: 0 } }) });
  const contentQ = useQuery({
    queryKey: ["content", "recent"],
    queryFn: () => content({ data: { limit: 6 } }),
  });
  const projectsQ = useQuery({ queryKey: ["projects", {}], queryFn: () => projects({ data: {} }) });

  const cards = [
    { label: "Content created", value: statsQ.data?.totalContent ?? 0, icon: FileText },
    { label: "Words written", value: (statsQ.data?.words ?? 0).toLocaleString(), icon: Type },
    { label: "Projects", value: statsQ.data?.projects ?? 0, icon: FolderKanban },
    { label: "Saved prompts", value: statsQ.data?.prompts ?? 0, icon: Sparkles },
  ];

  return (
    <AppShell
      title="Dashboard"
      subtitle="Where ideas make waves"
      actions={
        <Button asChild size="sm">
          <Link to="/create">
            <Plus className="size-4" /> New content
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card rounded-2xl border p-5 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium">{label}</p>
              <Icon className="text-primary size-4" aria-hidden="true" />
            </div>
            {statsQ.isLoading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold">{value}</p>
            )}
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Start creating</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(CONTENT_TYPES) as Array<keyof typeof CONTENT_TYPES>).map((key) => {
            const Icon = TYPE_ICON[key];
            const meta = CONTENT_TYPES[key];
            return (
              <Link
                key={key}
                to="/create/$type"
                params={{ type: key }}
                className="bg-card hover:border-primary/40 group rounded-2xl border p-5 shadow-card transition-colors"
              >
                <span className="bg-accent text-primary group-hover:bg-brand-gradient inline-flex size-9 items-center justify-center rounded-xl transition-colors">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-semibold">{meta.label}</p>
                <p className="text-muted-foreground mt-1 text-xs">{meta.blurb}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent content</h2>
            <Link to="/library" className="text-primary text-xs font-medium hover:underline">
              View library
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {contentQ.isLoading && <Skeleton className="h-24 w-full rounded-2xl" />}
            {contentQ.data?.length === 0 && (
              <p className="text-muted-foreground bg-card rounded-2xl border p-6 text-sm">
                Nothing yet — generate your first piece and it will appear here.
              </p>
            )}
            {contentQ.data?.map((item) => (
              <Link
                key={item.id}
                to="/library/$id"
                params={{ id: item.id }}
                className="bg-card hover:border-primary/40 flex items-center gap-3 rounded-xl border p-4 transition-colors"
              >
                <span className="bg-accent text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase">
                  {item.content_type.slice(0, 2)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{item.title}</span>
                  <span className="text-muted-foreground block text-xs">
                    {item.word_count ?? 0} words · {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Projects</h2>
            <Link to="/projects" className="text-primary text-xs font-medium hover:underline">
              All projects
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {projectsQ.isLoading && <Skeleton className="h-24 w-full rounded-2xl" />}
            {projectsQ.data?.length === 0 && (
              <p className="text-muted-foreground bg-card rounded-2xl border p-6 text-sm">
                Create a project to group related content.
              </p>
            )}
            {projectsQ.data?.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/projects/$id"
                params={{ id: p.id }}
                className="bg-card hover:border-primary/40 flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="text-muted-foreground block truncate text-xs">
                    {p.description ?? "No description"}
                  </span>
                </span>
                <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium">
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
