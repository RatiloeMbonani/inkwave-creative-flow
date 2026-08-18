import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const VideoPlanInput = z.object({
  idea: z.string().min(3).max(4000),
  platform: z.string().max(40).default("TikTok"),
  tone: z.string().max(40).default("Bold"),
  language: z.string().max(40).default("English"),
  format: z.string().max(60).default("Short-form reel (15-30s)"),
  length: z.string().max(40).default("30 seconds"),
});

export type VideoPlan = {
  title: string;
  hook: string;
  script: string;
  shots: { timecode: string; visual: string; onScreenText: string; voiceover: string }[];
  caption: string;
  hashtags: string[];
  coverPrompt: string;
  music: string;
};

export const planVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => VideoPlanInput.parse(i))
  .handler(async ({ data }) => {
    const { generateText, parseJsonResponse, AiServiceError } = await import("./ai.server");

    const system = `You are INKWAVE AI's video director. You produce production-ready short video packages.
Write everything in ${data.language}. Tone: ${data.tone}. Platform: ${data.platform}. Format: ${data.format}. Target duration: ${data.length}.
Respect the platform's culture, pacing and caption conventions.
Return ONLY valid JSON, no markdown fences, with this exact shape:
{"title":"<short video title>","hook":"<the first 3 seconds, spoken>","script":"<the full voiceover script as plain text>","shots":[{"timecode":"0:00-0:03","visual":"<what we see>","onScreenText":"<text overlay>","voiceover":"<line spoken>"}],"caption":"<the post caption for ${data.platform}>","hashtags":["#..."],"coverPrompt":"<a detailed image-generation prompt for the cover frame / thumbnail>","music":"<music and sound direction>"}`;

    try {
      const { text, model } = await generateText(
        [
          { role: "system", content: system },
          { role: "user", content: `Video idea: ${data.idea}` },
        ],
        { temperature: 0.8 },
      );
      const parsed = parseJsonResponse<VideoPlan>(text);
      if (!parsed?.script) {
        return { ok: false as const, error: "The director returned an unexpected response. Try again." };
      }
      return { ok: true as const, plan: { ...parsed, shots: parsed.shots ?? [] }, model };
    } catch (err) {
      const message =
        err instanceof AiServiceError ? err.message : "Video planning failed. Please try again.";
      return { ok: false as const, error: message };
    }
  });
