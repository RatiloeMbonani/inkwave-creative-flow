import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CONTENT_TYPES } from "@/lib/content-types";
import {
  FileText,
  Share2,
  Mail,
  Code2,
  ArrowRight,
  Image as ImageIcon,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/create/")({
  head: () => ({
    meta: [
      { title: "Create — INKWAVE AI" },
      { name: "description", content: "Pick a content type and let INKWAVE AI draft it for you." },
      { property: "og:title", content: "Create — INKWAVE AI" },
      { property: "og:description", content: "Blogs, social posts, emails and code in one workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateIndex,
});

const ICON = { blog: FileText, social: Share2, email: Mail, code: Code2 } as const;

const MEDIA = [
  {
    tab: "image" as const,
    label: "Image",
    blurb: "AI visuals tuned to tone, language & platform",
    icon: ImageIcon,
  },
  {
    tab: "video" as const,
    label: "Video",
    blurb: "Short AI video clips for your channels",
    icon: Video,
  },
];

function CreateIndex() {
  return (
    <AppShell title="Create" subtitle="What are we making today?">
      <div className="grid max-w-4xl gap-4 sm:grid-cols-2">
        {(Object.keys(CONTENT_TYPES) as Array<keyof typeof CONTENT_TYPES>).map((key) => {
          const Icon = ICON[key];
          const meta = CONTENT_TYPES[key];
          return (
            <Link
              key={key}
              to="/create/$type"
              params={{ type: key }}
              className="bg-card hover:border-primary/40 group flex items-start gap-4 rounded-2xl border p-6 shadow-card transition-colors"
            >
              <span className="bg-accent text-primary inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-base font-semibold">
                  {meta.label}
                  <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="text-muted-foreground mt-1 block text-sm">{meta.blurb}</span>
              </span>
            </Link>
          );
        })}

        {MEDIA.map(({ tab, label, blurb, icon: Icon }) => (
          <Link
            key={tab}
            to="/studio"
            search={{ tab }}
            className="bg-card hover:border-primary/40 group flex items-start gap-4 rounded-2xl border p-6 shadow-card transition-colors"
          >
            <span className="bg-accent text-primary inline-flex size-11 shrink-0 items-center justify-center rounded-xl">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-base font-semibold">
                {label}
                <ArrowRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              <span className="text-muted-foreground mt-1 block text-sm">{blurb}</span>
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
