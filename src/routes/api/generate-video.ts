import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/videos";

function key() {
  return process.env["LOVABLE_API_KEY"];
}

export const Route = createFileRoute("/api/generate-video")({
  server: {
    handlers: {
      // Start a generation job.
      POST: async ({ request }) => {
        const apiKey = key();
        if (!apiKey) return new Response("Video generation isn't configured yet.", { status: 500 });

        const { prompt, seconds = "6", size = "1280x720" } = (await request.json()) as {
          prompt?: string;
          seconds?: string;
          size?: string;
        };
        if (!prompt || prompt.trim().length < 3) {
          return new Response("Prompt is too short", { status: 400 });
        }

        const upstream = await fetch(GATEWAY, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "google/veo-3.1-fast", prompt, seconds, size }),
        });
        return new Response(await upstream.text(), {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        });
      },

      // Poll job status (?id=...) or stream the finished file (?id=...&download=1).
      GET: async ({ request }) => {
        const apiKey = key();
        if (!apiKey) return new Response("Video generation isn't configured yet.", { status: 500 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
          return new Response("Missing job id", { status: 400 });
        }

        if (url.searchParams.get("download")) {
          const file = await fetch(`${GATEWAY}/${id}/content`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            redirect: "follow",
          });
          if (!file.ok || !file.body) {
            return new Response(await file.text(), { status: file.status });
          }
          return new Response(file.body, {
            headers: {
              "Content-Type": file.headers.get("content-type") ?? "video/mp4",
              "Cache-Control": "no-store",
            },
          });
        }

        const status = await fetch(`${GATEWAY}/${id}`, {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        return new Response(await status.text(), {
          status: status.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
