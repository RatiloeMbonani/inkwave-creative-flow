import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const OptimizeInput = z.object({
  idea: z.string().min(3).max(4000),
  contentType: z.string().max(40).optional(),
});

const GenerateInput = z.object({
  contentType: z.enum(["blog", "social", "email", "code"]),
  prompt: z.string().min(3).max(8000),
  options: z.record(z.union([z.string(), z.number()])).default({}),
});

const RefineInput = z.object({
  body: z.string().min(1).max(20000),
  action: z.string().min(1).max(30),
  extra: z.string().max(60).optional(),
});

const RepurposeInput = z.object({
  source: z.string().min(20).max(20000),
  targets: z.array(z.string().min(1).max(40)).min(1).max(9),
  tone: z.string().max(40).default("Professional"),
});

export const optimizePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => OptimizeInput.parse(i))
  .handler(async ({ data }) => {
    const { generateText, parseJsonResponse, AiServiceError } = await import("./ai.server");
    const { OPTIMIZER_SYSTEM } = await import("./ai-prompts");
    try {
      const { text, model } = await generateText(
        [
          { role: "system", content: OPTIMIZER_SYSTEM },
          {
            role: "user",
            content: `Content type: ${data.contentType ?? "general"}\nRough idea: ${data.idea}`,
          },
        ],
        { temperature: 0.4 },
      );
      const parsed = parseJsonResponse<{ optimized: string; improvements: string; title: string }>(text);
      if (!parsed?.optimized) {
        return { ok: false as const, error: "The optimizer returned an unexpected response. Try again." };
      }
      return {
        ok: true as const,
        original: data.idea,
        optimized: parsed.optimized,
        improvements: parsed.improvements ?? "",
        title: parsed.title ?? data.idea.slice(0, 48),
        model,
      };
    } catch (err) {
      const message =
        err instanceof AiServiceError ? err.message : "Prompt optimization failed. Please try again.";
      return { ok: false as const, error: message };
    }
  });

export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => GenerateInput.parse(i))
  .handler(async ({ data }) => {
    const { generateText, parseJsonResponse, AiServiceError } = await import("./ai.server");
    const { generationSystemPrompt } = await import("./ai-prompts");
    try {
      const { text, model } = await generateText([
        { role: "system", content: generationSystemPrompt(data.contentType, data.options) },
        { role: "user", content: data.prompt },
      ]);
      const parsed = parseJsonResponse<{
        title: string;
        body: string;
        metadata?: Record<string, Json>;
      }>(text);
      const body = parsed?.body ?? text;
      if (!body.trim()) {
        return { ok: false as const, error: "The AI returned nothing usable. Try regenerating." };
      }
      return {
        ok: true as const,
        title: parsed?.title?.slice(0, 160) ?? "Untitled",
        body,
        metadata: (parsed?.metadata ?? {}) as Record<string, Json>,
        model,
      };
    } catch (err) {
      const message = err instanceof AiServiceError ? err.message : "Generation failed. Please try again.";
      return { ok: false as const, error: message };
    }
  });

export const refineContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RefineInput.parse(i))
  .handler(async ({ data }) => {
    const { generateText, AiServiceError } = await import("./ai.server");
    const { refinementPrompt } = await import("./ai-prompts");
    try {
      const { text } = await generateText(
        [
          { role: "system", content: refinementPrompt(data.action, data.extra) },
          { role: "user", content: data.body },
        ],
        { temperature: 0.6 },
      );
      return { ok: true as const, body: text };
    } catch (err) {
      const message = err instanceof AiServiceError ? err.message : "That edit failed. Please try again.";
      return { ok: false as const, error: message };
    }
  });

export const repurposeContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RepurposeInput.parse(i))
  .handler(async ({ data }) => {
    const { generateText, AiServiceError } = await import("./ai.server");
    const { repurposePrompt } = await import("./ai-prompts");
    const results: Array<{ target: string; body: string | null; error: string | null }> = [];
    for (const target of data.targets) {
      try {
        const { text } = await generateText([
          { role: "system", content: repurposePrompt(target, data.tone) },
          { role: "user", content: data.source },
        ]);
        results.push({ target, body: text, error: null });
      } catch (err) {
        results.push({
          target,
          body: null,
          error: err instanceof AiServiceError ? err.message : "Generation failed.",
        });
      }
    }
    return { results };
  });
