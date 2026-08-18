import { PLATFORM_SPEC } from "./media-types";

/** Builds the final image-generation prompt from the idea + posting context. */
export function buildImagePrompt(input: {
  idea: string;
  style: string;
  tone: string;
  language: string;
  platform: string;
  extraText?: string;
}): string {
  const spec = PLATFORM_SPEC[input.platform] ?? PLATFORM_SPEC["Instagram"]!;
  return [
    `Create a ${input.style.toLowerCase()} image for a ${input.platform} post.`,
    `Subject: ${input.idea}.`,
    `Emotional tone: ${input.tone.toLowerCase()}.`,
    `Composition: ${spec.ratio} aspect ratio, ${spec.note}.`,
    input.extraText
      ? `Include this text rendered cleanly in the image, in ${input.language}: "${input.extraText}".`
      : `Do not include any text, watermarks or logos.`,
    `Any incidental signage or wording must be in ${input.language}.`,
    `High quality, sharp detail, professional colour grading, no distorted anatomy.`,
  ].join(" ");
}
