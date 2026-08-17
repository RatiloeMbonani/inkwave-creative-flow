import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContent } from "@/lib/data.functions";
import { CONTENT_TYPES } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library/")({
  head: () => ({
    meta: [
      { title: "Content library — INKWAVE AI" },
      { name: "description", content: "Every piece of content you've generated, searchable in one place." },
      { property: "og:title", content: "Content library — INKWAVE AI" },
      { property: "og:description", content: "Browse, search and reuse your generated content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const fn = useServerFn(listContent);
  const q = useQuery({
    queryKey: ["content", { search, type }],
    queryFn: () => fn({ data: { limit: 100, search: search || undefined, contentType: type } }),
  });

  const filters = ["all", ...Object.keys(CONTENT_TYPES)];

  return (
    <AppShell
      title="Content library"
      subtitle="Everything you've created"
      actions={
        <Button size="sm" asChild>
          <Link to="/create">
            <Plus className="size-4" /> New
          </Link>
        </Button>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search your content…"
          className="max-w-xs"
          aria-label="Search content"
        />
        {filters.map((f) => (
          <Button
            key={f}
            size="sm"
            variant={type === f ? "default" : "outline"}
            onClick={() => setType(f)}
          >
            {f === "all" ? "All" : CONTENT_TYPES[f as keyof typeof CONTENT_TYPES].label}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {q.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        {q.data?.length === 0 && (
          <p className="text-muted-foreground bg-card col-span-full rounded-2xl border p-8 text-center text-sm">
            No content matches this view yet.
          </p>
        )}
        {q.data?.map((item) => (
          <Link
            key={item.id}
            to="/library/$id"
            params={{ id: item.id }}
            className="bg-card hover:border-primary/40 flex flex-col rounded-2xl border p-5 shadow-card transition-colors"
          >
            <span className="text-primary text-[11px] font-bold tracking-wide uppercase">
              {item.content_type}
              {item.platform ? ` · ${item.platform}` : ""}
            </span>
            <span className="mt-2 line-clamp-2 text-sm font-semibold">{item.title}</span>
            <span className="text-muted-foreground mt-2 line-clamp-3 text-xs">
              {item.body.replace(/[#*`>]/g, "").slice(0, 160)}
            </span>
            <span className="text-muted-foreground mt-auto pt-3 text-[11px]">
              {item.word_count ?? 0} words · {new Date(item.created_at).toLocaleDateString()}
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
