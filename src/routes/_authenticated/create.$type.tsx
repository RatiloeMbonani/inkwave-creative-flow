import { useState } from "react";
import { createFileRoute, useNavigate, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { optimizePrompt, generateContent } from "@/lib/ai.functions";
import { saveContent, savePrompt, listProjects } from "@/lib/data.functions";
import {
  CONTENT_TYPES,
  isContentType,
  TONES,
  LANGUAGES,
  PLATFORMS,
  EMAIL_TYPES,
  CODE_LANGUAGES,
  CODE_MODES,
} from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { ContentEditor } from "@/components/ContentEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/create/$type")({
  beforeLoad: ({ params }) => {
    if (!isContentType(params.type)) throw notFound();
  },
  head: ({ params }) => {
    const label = isContentType(params.type) ? CONTENT_TYPES[params.type].label : "Create";
    return {
      meta: [
        { title: `${label} generator — INKWAVE AI` },
        { name: "description", content: `Generate ${label.toLowerCase()} content with INKWAVE AI.` },
        { property: "og:title", content: `${label} generator — INKWAVE AI` },
        { property: "og:description", content: `Optimize your prompt and generate ${label.toLowerCase()} content.` },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CreatePage,
});

const EXT: Record<string, string> = {
  JavaScript: "js",
  TypeScript: "ts",
  React: "tsx",
  HTML: "html",
  CSS: "css",
  Python: "py",
  PHP: "php",
  Java: "java",
  SQL: "sql",
  "Node.js": "js",
};

function CreatePage() {
  const { type } = Route.useParams();
  const contentType = type as "blog" | "social" | "email" | "code";
  const meta = CONTENT_TYPES[contentType];
  const navigate = useNavigate();
  const qc = useQueryClient();

  const optimize = useServerFn(optimizePrompt);
  const generate = useServerFn(generateContent);
  const persistContent = useServerFn(saveContent);
  const persistPrompt = useServerFn(savePrompt);
  const projectsFn = useServerFn(listProjects);
  const projectsQ = useQuery({ queryKey: ["projects", {}], queryFn: () => projectsFn({ data: {} }) });

  const [idea, setIdea] = useState("");
  const [optimized, setOptimized] = useState("");
  const [improvements, setImprovements] = useState("");
  type Opts = {
    tone: string;
    language: string;
    length: string;
    platform: string;
    emailType: string;
    codeLanguage: string;
    mode: string;
    keywords: string;
    audience: string;
  };
  const [options, setOptions] = useState<Opts>({
    tone: "Professional",
    language: "English",
    length: "Medium",
    platform: "LinkedIn",
    emailType: "Professional",
    codeLanguage: "TypeScript",
    mode: "Generate Code",
    keywords: "",
    audience: "",
  });
  const [result, setResult] = useState<{ title: string; body: string; model?: string } | null>(null);
  const [projectId, setProjectId] = useState<string>("none");
  const [busy, setBusy] = useState<"optimize" | "generate" | "save" | null>(null);

  const setOpt = (k: keyof Opts) => (v: string) => setOptions((o) => ({ ...o, [k]: v }));

  const relevantOptions = () => {
    const base: Record<string, string> = {
      tone: options.tone,
      language: options.language,
    };
    if (contentType === "blog")
      return { ...base, length: options.length, keywords: options.keywords, audience: options.audience };
    if (contentType === "social") return { ...base, platform: options.platform, audience: options.audience };
    if (contentType === "email") return { ...base, emailType: options.emailType };
    return { language: options.codeLanguage, mode: options.mode, tone: options.tone };
  };

  const runOptimize = async () => {
    if (idea.trim().length < 3) {
      toast.error("Describe your idea first.");
      return;
    }
    setBusy("optimize");
    try {
      const res = await optimize({ data: { idea, contentType } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setOptimized(res.optimized);
      setImprovements(res.improvements);
      toast.success("Prompt optimized");
    } finally {
      setBusy(null);
    }
  };

  const runGenerate = async () => {
    const prompt = (optimized || idea).trim();
    if (prompt.length < 3) {
      toast.error("Describe your idea first.");
      return;
    }
    setBusy("generate");
    try {
      const res = await generate({
        data: { contentType, prompt, options: relevantOptions() },
      });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setResult({ title: res.title, body: res.body, model: res.model });
      toast.success("Content generated");
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    if (!result) return;
    setBusy("save");
    try {
      const row = await persistContent({
        data: {
          project_id: projectId === "none" ? null : projectId,
          content_type: contentType,
          platform: contentType === "social" ? options.platform : null,
          title: result.title,
          original_input: idea,
          optimized_prompt: optimized || undefined,
          body: result.body,
          metadata: relevantOptions(),
          model: result.model,
        },
      });
      if (optimized) {
        await persistPrompt({
          data: {
            title: result.title.slice(0, 140),
            category: meta.label,
            original_prompt: idea,
            optimized_prompt: optimized,
            improvements: improvements || undefined,
            tags: [],
          },
        });
      }
      qc.invalidateQueries();
      toast.success("Saved to your library");
      navigate({ to: "/library/$id", params: { id: row.id } });
    } catch {
      toast.error("Could not save this content. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell title={`${meta.label} generator`} subtitle={meta.blurb}>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="idea">Your idea</Label>
            <Textarea
              id="idea"
              rows={5}
              placeholder={
                contentType === "code"
                  ? "e.g. A React hook that debounces a value"
                  : "e.g. Why small businesses should automate invoicing"
              }
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {contentType !== "code" && (
              <Field label="Tone">
                <Picker value={options.tone} onChange={setOpt("tone")} items={TONES} />
              </Field>
            )}
            {contentType !== "code" && (
              <Field label="Language">
                <Picker value={options.language} onChange={setOpt("language")} items={LANGUAGES} />
              </Field>
            )}
            {contentType === "blog" && (
              <Field label="Length">
                <Picker
                  value={options.length}
                  onChange={setOpt("length")}
                  items={["Short", "Medium", "Long"]}
                />
              </Field>
            )}
            {contentType === "social" && (
              <Field label="Platform">
                <Picker value={options.platform} onChange={setOpt("platform")} items={PLATFORMS} />
              </Field>
            )}
            {contentType === "email" && (
              <Field label="Email type">
                <Picker value={options.emailType} onChange={setOpt("emailType")} items={EMAIL_TYPES} />
              </Field>
            )}
            {contentType === "code" && (
              <>
                <Field label="Language">
                  <Picker
                    value={options.codeLanguage}
                    onChange={setOpt("codeLanguage")}
                    items={CODE_LANGUAGES}
                  />
                </Field>
                <Field label="Mode">
                  <Picker value={options.mode} onChange={setOpt("mode")} items={[...CODE_MODES]} />
                </Field>
              </>
            )}
          </div>

          {(contentType === "blog" || contentType === "social") && (
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audience (optional)</Label>
              <Input
                id="audience"
                value={options.audience}
                onChange={(e) => setOpt("audience")(e.target.value)}
                placeholder="Small business owners"
              />
            </div>
          )}
          {contentType === "blog" && (
            <div className="space-y-1.5">
              <Label htmlFor="keywords">SEO keywords (optional)</Label>
              <Input
                id="keywords"
                value={options.keywords}
                onChange={(e) => setOpt("keywords")(e.target.value)}
                placeholder="invoicing, automation, cash flow"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={runOptimize} disabled={busy !== null}>
              {busy === "optimize" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Wand2 className="size-4" />
              )}
              Optimize my prompt
            </Button>
            <Button onClick={runGenerate} disabled={busy !== null}>
              {busy === "generate" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Generate {meta.label.toLowerCase()}
            </Button>
          </div>

          {optimized && (
            <div className="bg-muted/60 space-y-2 rounded-xl p-4">
              <p className="text-xs font-semibold">Optimized prompt</p>
              <Textarea
                rows={6}
                value={optimized}
                onChange={(e) => setOptimized(e.target.value)}
                className="bg-background text-xs"
                aria-label="Optimized prompt"
              />
              {improvements && <p className="text-muted-foreground text-xs">{improvements}</p>}
            </div>
          )}
        </div>

        <div>
          {!result && (
            <div className="text-muted-foreground bg-card flex min-h-80 flex-col items-center justify-center rounded-2xl border p-10 text-center shadow-card">
              <Sparkles className="text-primary size-7" />
              <p className="mt-4 text-sm font-medium">Your draft appears here</p>
              <p className="mt-1 max-w-xs text-xs">
                Optimize the prompt for sharper results, then hit generate.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={result.title}
                  onChange={(e) => setResult({ ...result, title: e.target.value })}
                />
              </div>

              <ContentEditor
                title={result.title}
                body={result.body}
                onChange={(body) => setResult({ ...result, body })}
                contentType={contentType}
                fileExtension={EXT[options.codeLanguage] ?? "txt"}
                footer={
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="w-56 space-y-1.5">
                      <Label>Save to project</Label>
                      <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No project</SelectItem>
                          {projectsQ.data?.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={save} disabled={busy !== null}>
                      {busy === "save" ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save to library
                    </Button>
                    <Button variant="outline" onClick={runGenerate} disabled={busy !== null}>
                      Regenerate
                    </Button>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Picker({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i} value={i}>
            {i}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
