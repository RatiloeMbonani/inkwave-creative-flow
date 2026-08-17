import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPrompts, savePrompt, togglePromptFavorite, deletePrompt } from "@/lib/data.functions";
import { optimizePrompt } from "@/lib/ai.functions";
import { PROMPT_CATEGORIES } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Loader2, Save, Star, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/prompts")({
  head: () => ({
    meta: [
      { title: "Prompt library — INKWAVE AI" },
      { name: "description", content: "Optimize rough ideas into precise prompts and save your best ones." },
      { property: "og:title", content: "Prompt library — INKWAVE AI" },
      { property: "og:description", content: "Optimize, save and reuse your best AI prompts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromptsPage,
});

function PromptsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPrompts);
  const saveFn = useServerFn(savePrompt);
  const favFn = useServerFn(togglePromptFavorite);
  const delFn = useServerFn(deletePrompt);
  const optimizeFn = useServerFn(optimizePrompt);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [idea, setIdea] = useState("");
  const [optimized, setOptimized] = useState("");
  const [improvements, setImprovements] = useState("");
  const [title, setTitle] = useState("");
  const [saveCategory, setSaveCategory] = useState("General");
  const [busy, setBusy] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["prompts", { search, category, favoritesOnly }],
    queryFn: () => listFn({ data: { search: search || undefined, category, favoritesOnly } }),
  });

  const optimize = async () => {
    if (idea.trim().length < 3) {
      toast.error("Describe your idea first.");
      return;
    }
    setBusy("optimize");
    try {
      const res = await optimizeFn({ data: { idea } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setOptimized(res.optimized);
      setImprovements(res.improvements);
      setTitle(res.title);
      toast.success("Prompt optimized");
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!optimized) return;
    setBusy("save");
    try {
      await saveFn({
        data: {
          title: (title || idea).slice(0, 140),
          category: saveCategory,
          original_prompt: idea,
          optimized_prompt: optimized,
          improvements: improvements || undefined,
          tags: [],
        },
      });
      qc.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Prompt saved");
      setIdea("");
      setOptimized("");
      setImprovements("");
      setTitle("");
    } catch {
      toast.error("Could not save the prompt.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell title="Prompt library" subtitle="Better prompts, better output">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="idea">Rough idea</Label>
            <Textarea
              id="idea"
              rows={5}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="write something about coffee shops"
            />
          </div>
          <Button className="w-full" onClick={optimize} disabled={busy !== null}>
            {busy === "optimize" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Wand2 className="size-4" />
            )}
            Optimize prompt
          </Button>

          {optimized && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="opt">Optimized prompt</Label>
                <Textarea
                  id="opt"
                  rows={8}
                  value={optimized}
                  onChange={(e) => setOptimized(e.target.value)}
                  className="text-xs"
                />
              </div>
              {improvements && <p className="text-muted-foreground text-xs">{improvements}</p>}
              <div className="space-y-1.5">
                <Label htmlFor="p-title">Title</Label>
                <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={saveCategory} onValueChange={setSaveCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPT_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={save} disabled={busy !== null}>
                {busy === "save" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save to library
              </Button>
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prompts…"
              className="max-w-xs"
              aria-label="Search prompts"
            />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {PROMPT_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant={favoritesOnly ? "default" : "outline"}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              <Star className="size-4" /> Favorites
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {q.isLoading && <Skeleton className="h-32 rounded-2xl" />}
            {q.data?.length === 0 && (
              <p className="text-muted-foreground bg-card rounded-2xl border p-8 text-center text-sm">
                No saved prompts yet. Optimize an idea and save it.
              </p>
            )}
            {q.data?.map((p) => (
              <article key={p.id} className="bg-card rounded-2xl border p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{p.title}</h2>
                    <p className="text-muted-foreground text-xs">
                      {p.category} · used {p.use_count ?? 0}×
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Toggle favorite"
                      onClick={async () => {
                        await favFn({ data: { id: p.id, value: !p.is_favorite } });
                        qc.invalidateQueries({ queryKey: ["prompts"] });
                      }}
                    >
                      <Star className={`size-4 ${p.is_favorite ? "fill-current text-primary" : ""}`} />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Copy prompt"
                      onClick={async () => {
                        await navigator.clipboard.writeText(p.optimized_prompt ?? p.original_prompt);
                        toast.success("Prompt copied");
                      }}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Delete prompt"
                      onClick={async () => {
                        await delFn({ data: { id: p.id } });
                        qc.invalidateQueries({ queryKey: ["prompts"] });
                        toast.success("Prompt deleted");
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3 line-clamp-3 text-xs whitespace-pre-wrap">
                  {p.optimized_prompt ?? p.original_prompt}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
