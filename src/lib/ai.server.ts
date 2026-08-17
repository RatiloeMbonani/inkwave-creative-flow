/**
 * Text generation service. Provider-agnostic wrapper around the AI gateway so
 * the model/provider can be swapped without touching feature code.
 */

export const DEFAULT_TEXT_MODEL = "google/gemini-3.5-flash";

export class AiServiceError extends Error {
  status: number;
  retryable: boolean;
  constructor(message: string, status: number, retryable: boolean) {
    super(message);
    this.name = "AiServiceError";
    this.status = status;
    this.retryable = retryable;
  }
}

type Msg = { role: "system" | "user" | "assistant"; content: string };

function friendly(status: number, raw: string): AiServiceError {
  switch (status) {
    case 401:
      return new AiServiceError(
        "AI is not configured for this workspace yet. Add an AI provider key to enable generation.",
        401,
        false,
      );
    case 402:
      return new AiServiceError(
        "This workspace is out of AI credits. Top up credits to keep generating.",
        402,
        false,
      );
    case 403:
      return new AiServiceError("AI access is currently blocked for this workspace.", 403, false);
    case 429:
      return new AiServiceError("Too many requests right now. Wait a moment and try again.", 429, true);
    case 400:
      return new AiServiceError("That request couldn't be processed. Try shortening your input.", 400, false);
    default:
      return new AiServiceError(
        status >= 500
          ? "The AI service is temporarily unavailable. Please try again."
          : `Generation failed (${status}).`,
        status,
        status >= 500,
      );
  }
  void raw;
}

export async function generateText(
  messages: Msg[],
  options?: { model?: string; temperature?: number },
): Promise<{ text: string; model: string }> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    throw new AiServiceError(
      "Text generation isn't configured yet. The TEXT_AI provider key is missing.",
      401,
      false,
    );
  }
  const model = options?.model ?? DEFAULT_TEXT_MODEL;

  let res: Response;
  try {
    res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: options?.temperature ?? 0.7 }),
    });
  } catch {
    throw new AiServiceError("Couldn't reach the AI service. Check your connection and retry.", 503, true);
  }

  if (!res.ok) {
    const raw = await res.text().catch(() => "");
    console.error("AI gateway error", res.status, raw.slice(0, 400));
    throw friendly(res.status, raw);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) {
    throw new AiServiceError("The AI returned an empty response. Try regenerating.", 502, true);
  }
  return { text, model };
}

/** Extracts a JSON object from a model response, tolerating code fences. */
export function parseJsonResponse<T>(text: string): T | null {
  const cleaned = text
    .replace(/^\s*```(?:json)?/i, "")
    .replace(/```\s*$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
