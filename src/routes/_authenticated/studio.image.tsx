import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
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
import { Download, ImageIcon, Loader2, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { TONES, LANGUAGES } from "@/lib/content-types";
import { IMAGE_STYLES, MEDIA_PLATFORMS, PLATFORM_SPEC } from "@/lib/media-types";
import { buildImagePrompt } from "@/lib/media-prompt";
import { streamImage } from "@/lib/streamImage";
import { saveContent, listProjects } from "@/lib/data.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/studio/image")({
  head: () => ({
    meta: [
      { title: "Image Studio — INKWAVE AI" },
      {
        name: "description",
        content:
          "Generate on-brand images from a prompt, tuned to your tone, language and the platform you're posting on.",
      },
      { property: "og:title", content: "Image Studio — INKWAVE AI" },
      { property: "og:description", content: "AI image generation tuned per platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImageStudio,
});

function ImageStudio() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const persistContent = useServerFn(saveContent);
  const projectsFn = useServerFn(listProjects);
  const projectsQ = useQuery({ queryKey: ["projects", {}], queryFn: () => projectsFn({ data: {} }) });

  const [idea, setIdea] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [style, setStyle] = useState(IMAGE_STYLES[0]!);
  const [tone, setTone] = useState(TONES[0]!);
  const [language, setLanguage] = useState(LANGUAGES[0]!);
  const [platform, setPlatform] = useState<string>(MEDIA_PLATFORMS[0]);
  const [projectId, setProjectId] = useState("none");

  const [image, setImage] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState<"generate" | "save" | null>(null);

  const spec = PLATFORM_SPEC[platform];

  const prompt = () =>
    buildImagePrompt({
      idea,
      style,
      tone,
      language,
      platform,
      ...(overlayText.trim() ? { extraText: overlayText.trim() } : {}),
    });

  const generate = async () => {
    if (idea.trim().length < 3) {
      toast.error("Describe the picture you want first.");
      return;
    }
    setBusy("generate");
    setImage(null);
    setIsFinal(false);
    try {
      await streamImage(prompt(), (dataUrl, final) => {
        setImage(dataUrl);
        if (final) setIsFinal(true);
      });
      toast.success("Image ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setBusy(null);
    }
  };

  const download = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = `inkwave-${platform.toLowerCase().replace(/\W+/g, "-")}.png`;
    a.click();
  };

  const save = async () => {
    if (!image || !user) return;
    setBusy("save");
    try {
      const blob = await (await fetch(image)).blob();
      const path = `${user.id}/images/${crypto.randomUUID()}.png`;
      const { error } = await supabase.storage.from("media").upload(path, blob, {
        contentType: "image/png",
      });
      if (error) throw new Error(error.message);
      const title = idea.trim().slice(0, 80) || "Generated image";
      await persistContent({
        data: {
          project_id: projectId === "none" ? null : projectId,
          content_type: "image",
          platform,
          title,
          original_input: idea,
          optimized_prompt: prompt(),
          body: `Image generated for ${platform} (${spec?.ratio ?? "square"}), ${style.toLowerCase()} style, ${tone.toLowerCase()} tone, ${language}.\n\nStored at: ${path}`,
          metadata: { kind: "image", style, tone, language, platform, mediaPath: path },
        },
      });
      qc.invalidateQueries();
      toast.success("Saved to your library");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save this image");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppShell title="Image Studio" subtitle="Prompt in, post-ready visual out">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
          <div className="space-y-1.5">
            <Label htmlFor="idea">Describe the picture</Label>
            <Textarea
              id="idea"
              rows={5}
              placeholder="e.g. A barista pouring latte art in a sunlit corner café"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Tone">
              <Picker value={tone} onChange={setTone} items={TONES} />
            </Field>
            <Field label="Language">
              <Picker value={language} onChange={setLanguage} items={LANGUAGES} />
            </Field>
            <Field label="Platform">
              <Picker value={platform} onChange={setPlatform} items={[...MEDIA_PLATFORMS]} />
            </Field>
            <Field label="Style">
              <Picker value={style} onChange={setStyle} items={IMAGE_STYLES} />
            </Field>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="overlay">Text on the image (optional)</Label>
            <Input
              id="overlay"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Opening soon"
            />
          </div>

          {spec && (
            <p className="text-muted-foreground bg-muted/60 rounded-xl p-3 text-xs">
              {platform}: {spec.ratio} — {spec.note}
            </p>
          )}

          <Button onClick={generate} disabled={busy !== null} className="w-full">
            {busy === "generate" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            Generate image
          </Button>
        </div>

        <div className="space-y-4">
          <div className="bg-card flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border p-4 shadow-card">
            {image ? (
              <img
                src={image}
                alt={idea || "Generated image"}
                className={`max-h-[32rem] w-auto rounded-xl transition-[filter] duration-500 ${
                  isFinal ? "blur-0" : "blur-2xl"
                }`}
              />
            ) : (
              <div className="text-muted-foreground flex flex-col items-center text-center">
                <ImageIcon className="text-primary size-7" />
                <p className="mt-4 text-sm font-medium">Your visual appears here</p>
                <p className="mt-1 max-w-xs text-xs">
                  Pick the tone, language and platform — we frame the shot to match.
                </p>
              </div>
            )}
          </div>

          {image && isFinal && (
            <div className="bg-card flex flex-wrap items-end gap-3 rounded-2xl border p-4 shadow-card">
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
              <Button variant="outline" onClick={download}>
                <Download className="size-4" />
                Download
              </Button>
              <Button variant="outline" onClick={generate} disabled={busy !== null}>
                Regenerate
              </Button>
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
