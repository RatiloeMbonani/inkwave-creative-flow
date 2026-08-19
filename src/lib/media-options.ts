export const VISUAL_TONES = [
  "Professional",
  "Cinematic",
  "Playful",
  "Bold",
  "Minimal",
  "Luxury",
  "Documentary",
  "Retro",
  "Futuristic",
];

export const MEDIA_PLATFORMS = {
  Instagram: { ratio: "4:5 vertical feed", size: "720x1280", orientation: "vertical" },
  TikTok: { ratio: "9:16 full-bleed vertical", size: "720x1280", orientation: "vertical" },
  LinkedIn: { ratio: "16:9 landscape", size: "1280x720", orientation: "horizontal" },
  Facebook: { ratio: "1:1 square", size: "1280x720", orientation: "horizontal" },
  X: { ratio: "16:9 landscape", size: "1280x720", orientation: "horizontal" },
  YouTube: { ratio: "16:9 widescreen", size: "1280x720", orientation: "horizontal" },
} as const;

export type MediaPlatform = keyof typeof MEDIA_PLATFORMS;

export function buildVisualPrompt(opts: {
  kind: "image" | "video";
  idea: string;
  tone: string;
  language: string;
  platform: MediaPlatform;
  duration?: string;
}) {
  const p = MEDIA_PLATFORMS[opts.platform];
  const lines = [
    opts.kind === "image"
      ? `Create a high-quality social media image: ${opts.idea}.`
      : `Create a short social video scene: ${opts.idea}.`,
    `Visual tone: ${opts.tone}.`,
    `Framing: ${p.ratio}, optimized for ${opts.platform}.`,
    `Any visible text must be written in ${opts.language} and kept short and legible.`,
  ];
  if (opts.kind === "video") {
    lines.push(`Duration: about ${opts.duration ?? "6"} seconds, smooth natural camera motion.`);
  }
  lines.push("No watermarks, no distorted text, no logos.");
  return lines.join(" ");
}
