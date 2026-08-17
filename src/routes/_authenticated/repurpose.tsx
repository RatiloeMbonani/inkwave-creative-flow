import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { repurposeContent } from "@/lib/ai.functions";
import { listContent, saveContent } from "@/lib/data.functions";
import { TONES, PLATFORMS } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { renderMarkdown } from "@/lib/markdown";
import { Copy, Loader2, Repeat2, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/repurpose")({
  head: () => ({
    meta: [
      { title: "Repurpose — INKWAVE AI" },
      { name: "description", content: "Turn one piece of content into posts, emails, threads and more." },
      { property: "og:title", content: "Repurpose — INKWAVE AI" },
      { property: "og:description", content: "One piece in, a whole content wave out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RepurposePage,
});

const TARGETS = [...PLATFORMS, "Email newsletter", "Blog intro", "Video script", "Twitter thread"];

function RepurposePage() {
  const qc = useQueryClient();
  const run = useServerFn(repurposeContent);
  const listFn = useServerFn(listContent);
  const persist = useServerFn(saveContent);

  const [source, setSource] = useState("");
  const [tone, setTone] = useState("Professional");
  const [targets, setTargets] = useState<string[]>(["LinkedIn", "Instagram"]);
  const [results, setResults] = useState<Array<{ target: string; body: string | null; error: string | null }>>(
    [],
  );
  const [busy, setBusy] = useState(false);

  const contentQ = useQuery({ queryKey: ["content", "repurpose"], queryFn: () => listFn({ data: { limit: 30 } }) });

  const toggle = (t: string) =>
    setTargets((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const go = async () => {
    if (source.trim().length < 20) {
      toast.error("Paste at least a short paragraph to repurpose.");
      return;
    }
    if (targets.length === 0) {
      toast.error("Choose at least one format.");
      return;
    }
    setBusy(true);
    try {
      const res = await run({ data: { source, targets: targets.slice(0, 9), tone } });
      setResults(res.results);
      toast.success("Repurposed content ready");
    } catch {
      toast.error("Repurposing failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const saveOne = async (target: string, body: string) => {
    try {
      await persist({
        data: {
          content_type: "social",
          platform: PLATFORMS.includes(target) ? target : null,
          title: `${target} — repurposed`,
          body,
          metadata: { target, tone },
        },
      });
      qc.invalidateQueries({ queryKey: ["content"] });
      toast.success(`Saved ${target} version`);
    } catch {
      toast.error("Could not save this version.");
    }
  };

  return (
    <AppShell title="Repurpose" subtitle="One idea, every channel">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
          <div className="space-y-1.5">
            <Label>Start from existing content</Label>
            <Select
              onValueChange={(id) => {
                const found = contentQ.data?.find((c) => c.id === id);
                if (found) setSource(found.body);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pick from your library" />
              </SelectTrigger>
              <SelectContent>
                {contentQ.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="source">Source content</Label>
            <Textarea
              id="source"
              rows={10}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Paste an article, transcript or post…"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Formats</legend>
            <div className="grid grid-cols-2 gap-2">
              {TARGETS.map((t) => (
                <label key={t} className="flex items-center gap-2 text-xs">
                  <Checkbox checked={targets.includes(t)} onCheckedChange={() => toggle(t)} />
                  {t}
                </label>
              ))}
            </div>
          </fieldset>

          <Button className="w-full" onClick={go} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Repeat2 className="size-4" />}
            Repurpose
          </Button>
        </div>

        <div className="space-y-3">
          {results.length === 0 && (
            <div className="text-muted-foreground bg-card flex min-h-72 flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-card">
              <Repeat2 className="text-primary size-7" />
              <p className="mt-4 text-sm font-medium">Your variations appear here</p>
            </div>
          )}
          {results.map((r) => (
            <article key={r.target} className="bg-card rounded-2xl border p-5 shadow-card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">{r.target}</h2>
                {r.body && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await navigator.clipboard.writeText(r.body!);
                        toast.success("Copied");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => saveOne(r.target, r.body!)}>
                      <Save className="size-3.5" /> Save
                    </Button>
                  </div>
                )}
              </div>
              {r.error ? (
                <p className="text-destructive mt-2 text-xs">{r.error}</p>
              ) : (
                <div
                  className="prose-ink mt-3 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(r.body ?? "") }}
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
