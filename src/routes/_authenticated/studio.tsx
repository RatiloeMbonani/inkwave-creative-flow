import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGES } from "@/lib/content-types";
import { MEDIA_PLATFORMS, VISUAL_TONES, buildVisualPrompt, type MediaPlatform } from "@/lib/media-options";
import { streamImage } from "@/lib/streamImage";
import { Download, Image as ImageIcon, Loader2, Sparkles, Video } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Visual Studio — INKWAVE AI" },
      {
        name: "description",
        content: "Generate on-brand images and short videos tuned to your tone, language and platform.",
      },
      { property: "og:title", content: "Visual Studio — INKWAVE AI" },
      {
        property: "og:description",
        content: "AI image and video generation with tone, language and platform presets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioPage,
});

const PLATFORM_KEYS = Object.keys(MEDIA_PLATFORMS) as MediaPlatform[];

function StudioPage() {
  return (
    <AppShell title="Visual Studio" subtitle="Images and videos tuned to your tone, language and platform">
      <Tabs defaultValue="image" className="max-w-6xl">
        <TabsList>
          <TabsTrigger value="image">
            <ImageIcon className="mr-2 size-4" /> Image
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="mr-2 size-4" /> Video
          </TabsTrigger>
        </TabsList>
        <TabsContent value="image" className="mt-5">
          <ImagePanel />
        </TabsContent>
        <TabsContent value="video" className="mt-5">
          <VideoPanel />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Controls({
  idea,
  setIdea,
  tone,
  setTone,
  language,
  setLanguage,
  platform,
  setPlatform,
  placeholder,
  extra,
  children,
}: {
  idea: string;
  setIdea: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  platform: MediaPlatform;
  setPlatform: (v: MediaPlatform) => void;
  placeholder: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
      <div className="space-y-1.5">
        <Label htmlFor="visual-idea">Describe the visual</Label>
        <Textarea
          id="visual-idea"
          rows={5}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Tone</Label>
          <Picker value={tone} onChange={setTone} items={VISUAL_TONES} />
        </div>
        <div className="space-y-1.5">
          <Label>Language</Label>
          <Picker value={language} onChange={setLanguage} items={LANGUAGES} />
        </div>
        <div className="space-y-1.5">
          <Label>Platform</Label>
          <Picker
            value={platform}
            onChange={(v) => setPlatform(v as MediaPlatform)}
            items={PLATFORM_KEYS}
          />
        </div>
        {extra}
      </div>
      <p className="text-muted-foreground text-xs">
        Optimized for {MEDIA_PLATFORMS[platform].ratio}.
      </p>
      {children}
    </div>
  );
}

function ImagePanel() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("Cinematic");
  const [language, setLanguage] = useState("English");
  const [platform, setPlatform] = useState<MediaPlatform>("Instagram");
  const [src, setSrc] = useState<string | null>(null);
  const [isFinal, setIsFinal] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (idea.trim().length < 3) {
      toast.error("Describe the image first.");
      return;
    }
    setBusy(true);
    setSrc(null);
    setIsFinal(false);
    try {
      await streamImage(
        "/api/generate-image",
        buildVisualPrompt({ kind: "image", idea, tone, language, platform }),
        (dataUrl, final) => {
          setSrc(dataUrl);
          if (final) setIsFinal(true);
        },
      );
      toast.success("Image ready");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Controls
        idea={idea}
        setIdea={setIdea}
        tone={tone}
        setTone={setTone}
        language={language}
        setLanguage={setLanguage}
        platform={platform}
        setPlatform={setPlatform}
        placeholder="e.g. A founder working late in a warm-lit studio, coffee steam catching the light"
      >
        <Button onClick={run} disabled={busy} className="w-full">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Generate image
        </Button>
      </Controls>

      <div className="bg-card flex min-h-80 flex-col items-center justify-center rounded-2xl border p-6 shadow-card">
        {!src && (
          <div className="text-muted-foreground text-center">
            <ImageIcon className="text-primary mx-auto size-7" />
            <p className="mt-4 text-sm font-medium">Your image appears here</p>
            <p className="mt-1 text-xs">Previews render progressively while the model works.</p>
          </div>
        )}
        {src && (
          <div className="w-full space-y-4">
            <img
              src={src}
              alt={idea || "Generated visual"}
              className={`mx-auto max-h-[520px] rounded-xl transition-[filter] duration-300 ${isFinal ? "blur-0" : "blur-2xl"}`}
            />
            {isFinal && (
              <div className="flex justify-center">
                <Button asChild variant="outline">
                  <a href={src} download="inkwave-image.png">
                    <Download className="size-4" /> Download
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type VideoJob = { id: string; status: string; progress?: number; error?: { message?: string } };

function VideoPanel() {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("Cinematic");
  const [language, setLanguage] = useState("English");
  const [platform, setPlatform] = useState<MediaPlatform>("TikTok");
  const [duration, setDuration] = useState("6");
  const [status, setStatus] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const stopped = useRef(false);

  useEffect(() => () => { stopped.current = true; }, []);

  const run = async () => {
    if (idea.trim().length < 3) {
      toast.error("Describe the video first.");
      return;
    }
    setBusy(true);
    setVideoUrl(null);
    setProgress(0);
    setStatus("Starting generation…");
    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildVisualPrompt({ kind: "video", idea, tone, language, platform, duration }),
          seconds: duration,
          size: MEDIA_PLATFORMS[platform].size,
        }),
      });
      if (!res.ok) throw new Error((await res.text()) || `Video generation failed (${res.status})`);
      const job = (await res.json()) as VideoJob;

      // Poll until the render completes.
      for (let i = 0; i < 150 && !stopped.current; i++) {
        await new Promise((r) => setTimeout(r, 5000));
        const s = await fetch(`/api/generate-video?id=${encodeURIComponent(job.id)}`);
        if (!s.ok) throw new Error(`Could not check the render status (${s.status})`);
        const state = (await s.json()) as VideoJob;
        setProgress(state.progress ?? 0);
        setStatus(state.status === "completed" ? "Finishing up…" : "Rendering your video…");
        if (state.status === "completed") {
          setVideoUrl(`/api/generate-video?id=${encodeURIComponent(job.id)}&download=1`);
          setStatus(null);
          toast.success("Video ready");
          return;
        }
        if (state.status === "failed") {
          throw new Error(state.error?.message ?? "The video render failed. Try a different prompt.");
        }
      }
      throw new Error("The video is taking longer than expected. Please try again.");
    } catch (err) {
      setStatus(null);
      toast.error(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <Controls
        idea={idea}
        setIdea={setIdea}
        tone={tone}
        setTone={setTone}
        language={language}
        setLanguage={setLanguage}
        platform={platform}
        setPlatform={setPlatform}
        placeholder="e.g. Slow push-in on ocean waves at sunrise with a surfer walking into frame"
        extra={
          <div className="space-y-1.5">
            <Label>Duration</Label>
            <Picker value={duration} onChange={setDuration} items={["4", "6", "8"]} />
          </div>
        }
      >
        <Button onClick={run} disabled={busy} className="w-full">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Video className="size-4" />}
          Generate video
        </Button>
      </Controls>

      <div className="bg-card flex min-h-80 flex-col items-center justify-center rounded-2xl border p-6 shadow-card">
        {!videoUrl && !busy && (
          <div className="text-muted-foreground text-center">
            <Video className="text-primary mx-auto size-7" />
            <p className="mt-4 text-sm font-medium">Your video appears here</p>
            <p className="mt-1 text-xs">Renders usually take one to two minutes.</p>
          </div>
        )}
        {busy && (
          <div className="text-muted-foreground w-full max-w-sm text-center">
            <Loader2 className="text-primary mx-auto size-7 animate-spin" />
            <p className="mt-4 text-sm font-medium">{status ?? "Working…"}</p>
            <div className="bg-muted mt-4 h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-brand-gradient h-full transition-all"
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>
          </div>
        )}
        {videoUrl && !busy && (
          <div className="w-full space-y-4">
            <video src={videoUrl} controls playsInline className="mx-auto max-h-[520px] rounded-xl" />
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <a href={videoUrl} download="inkwave-video.mp4">
                  <Download className="size-4" /> Download
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
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
  items: readonly string[];
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
