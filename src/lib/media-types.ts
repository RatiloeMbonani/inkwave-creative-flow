/** Options shared by the Image Studio and Video Studio. */

export const MEDIA_PLATFORMS = [
  "Instagram",
  "TikTok",
  "LinkedIn",
  "Facebook",
  "X",
  "YouTube",
  "Pinterest",
  "Website / Blog",
] as const;

export type MediaPlatform = (typeof MEDIA_PLATFORMS)[number];

/** Composition guidance per platform, fed into the prompt. */
export const PLATFORM_SPEC: Record<string, { ratio: string; note: string }> = {
  Instagram: { ratio: "4:5 vertical", note: "bold, thumb-stopping, centred subject, room for a caption overlay" },
  TikTok: { ratio: "9:16 vertical", note: "full-bleed vertical framing, high energy, safe margins for UI overlays" },
  LinkedIn: { ratio: "1.91:1 landscape", note: "clean, credible, professional; restrained colour" },
  Facebook: { ratio: "1.91:1 landscape", note: "warm, community-oriented, clear focal point" },
  X: { ratio: "16:9 landscape", note: "high contrast, readable at small sizes" },
  YouTube: { ratio: "16:9 landscape", note: "thumbnail energy: strong subject, dramatic lighting, clear negative space for a title" },
  Pinterest: { ratio: "2:3 vertical", note: "editorial, aspirational, lifestyle styling" },
  "Website / Blog": { ratio: "16:9 landscape", note: "clean hero image, generous negative space" },
};

export const IMAGE_STYLES = [
  "Photorealistic",
  "Cinematic",
  "3D render",
  "Flat illustration",
  "Watercolour",
  "Minimal graphic",
  "Retro poster",
  "Neon cyberpunk",
];

export const VIDEO_FORMATS = [
  "Short-form reel (15-30s)",
  "Explainer (60-90s)",
  "Product demo",
  "Testimonial story",
  "Ad spot (15s)",
  "Tutorial",
];

export const VIDEO_LENGTHS = ["15 seconds", "30 seconds", "60 seconds", "90 seconds"];
