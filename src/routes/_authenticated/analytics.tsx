import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getStats } from "@/lib/data.functions";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CONTENT_TYPES } from "@/lib/content-types";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — INKWAVE AI" },
      { name: "description", content: "See what you create, how much, and where it goes." },
      { property: "og:title", content: "Analytics — INKWAVE AI" },
      { property: "og:description", content: "Content output, word counts and channel mix at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

const RANGES = [
  { label: "7 days", days: 7 },
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "All time", days: 0 },
];

function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const fn = useServerFn(getStats);
  const q = useQuery({ queryKey: ["stats", days], queryFn: () => fn({ data: { days } }) });
  const s = q.data;

  const maxDaily = Math.max(1, ...(s?.daily ?? []).map((d) => d.count));

  return (
    <AppShell title="Analytics" subtitle="Your content output at a glance">
      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <Button
            key={r.label}
            size="sm"
            variant={days === r.days ? "default" : "outline"}
            onClick={() => setDays(r.days)}
          >
            {r.label}
          </Button>
        ))}
      </div>

      {q.isLoading && <Skeleton className="mt-6 h-64 w-full rounded-2xl" />}

      {s && (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Content pieces", value: s.totalContent },
              { label: "Words written", value: s.words.toLocaleString() },
              { label: "Prompts saved", value: s.prompts },
              { label: "Prompt reuses", value: s.promptUses },
            ].map((c) => (
              <div key={c.label} className="bg-card rounded-2xl border p-5 shadow-card">
                <p className="text-muted-foreground text-xs font-medium">{c.label}</p>
                <p className="mt-2 text-3xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="bg-card rounded-2xl border p-5 shadow-card">
              <h2 className="text-sm font-semibold">By content type</h2>
              <div className="mt-4 space-y-3">
                {Object.keys(s.byType).length === 0 && (
                  <p className="text-muted-foreground text-sm">No content in this range.</p>
                )}
                {Object.entries(s.byType).map(([type, count]) => (
                  <div key={type}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">
                        {CONTENT_TYPES[type as keyof typeof CONTENT_TYPES]?.label ?? type}
                      </span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="bg-muted mt-1 h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{ width: `${(count / Math.max(1, s.totalContent)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-card rounded-2xl border p-5 shadow-card">
              <h2 className="text-sm font-semibold">By platform</h2>
              <div className="mt-4 space-y-3">
                {Object.keys(s.byPlatform).length === 0 && (
                  <p className="text-muted-foreground text-sm">No platform-specific posts yet.</p>
                )}
                {Object.entries(s.byPlatform).map(([platform, count]) => (
                  <div key={platform}>
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{platform}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="bg-muted mt-1 h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-brand-gradient h-full rounded-full"
                        style={{ width: `${(count / Math.max(1, s.totalContent)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="bg-card mt-6 rounded-2xl border p-5 shadow-card">
            <h2 className="text-sm font-semibold">Daily output</h2>
            {s.daily.length === 0 ? (
              <p className="text-muted-foreground mt-3 text-sm">Nothing created in this range yet.</p>
            ) : (
              <div className="mt-5 flex h-40 items-end gap-1.5 overflow-x-auto">
                {s.daily.map((d) => (
                  <div key={d.date} className="flex min-w-6 flex-1 flex-col items-center gap-2">
                    <div
                      className="bg-brand-gradient w-full rounded-t-md"
                      style={{ height: `${(d.count / maxDaily) * 100}%` }}
                      title={`${d.date}: ${d.count}`}
                    />
                    <span className="text-muted-foreground text-[10px]">{d.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
