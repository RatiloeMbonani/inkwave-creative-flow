import { createFileRoute, Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { FileText, Share2, Mail, Code2, Sparkles, Repeat2, BarChart3, FolderKanban } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INKWAVE AI — Multi-modal AI content creation" },
      {
        name: "description",
        content:
          "Optimize prompts, generate blogs, social posts, emails and code, then repurpose everything from one workspace. Where ideas make waves.",
      },
      { property: "og:title", content: "INKWAVE AI — Where ideas make waves" },
      {
        property: "og:description",
        content: "One AI workspace for blogs, social posts, emails and code — plus prompt optimization.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const TOOLS = [
  { icon: FileText, title: "Blog writer", copy: "SEO-ready long-form articles with outlines and meta." },
  { icon: Share2, title: "Social posts", copy: "Platform-native hooks, captions and hashtags." },
  { icon: Mail, title: "Email composer", copy: "Applications, follow-ups and campaigns that land." },
  { icon: Code2, title: "Code assistant", copy: "Generate, explain, debug and improve code." },
  { icon: Sparkles, title: "Prompt optimizer", copy: "Turn a rough idea into a precise prompt." },
  { icon: Repeat2, title: "Repurpose engine", copy: "One piece becomes nine, instantly." },
  { icon: FolderKanban, title: "Projects", copy: "Group every asset by campaign or client." },
  { icon: BarChart3, title: "Analytics", copy: "See what you make, and what works." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <BrandLogo />
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pt-12 pb-20 text-center sm:pt-20">
        <span className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold">
          <Sparkles className="size-3.5" /> Prompt-first content creation
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-6xl">
          One idea in. <span className="text-brand-gradient">A wave of content out.</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base sm:text-lg">
          INKWAVE AI optimizes your prompt first, then writes the blog, the posts, the email and the code —
          all organized into projects you can measure.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button size="lg" asChild>
            <Link to="/auth">Start creating free</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/auth">I already have an account</Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted/40 border-y">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="bg-card rounded-2xl border p-5 shadow-card">
              <span className="bg-accent text-primary inline-flex size-9 items-center justify-center rounded-xl">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-sm font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-10">
        <BrandLogo />
        <p className="text-muted-foreground text-xs">
          © {new Date().getFullYear()} INKWAVE AI. Where ideas make waves.
        </p>
      </footer>
    </div>
  );
}
