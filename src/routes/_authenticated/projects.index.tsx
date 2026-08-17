import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProjects, saveProject } from "@/lib/data.functions";
import { PROJECT_STATUSES, STATUS_LABEL } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — INKWAVE AI" },
      { name: "description", content: "Group your generated content into campaigns and client projects." },
      { property: "og:title", content: "Projects — INKWAVE AI" },
      { property: "og:description", content: "Organize your AI content by campaign or client." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listProjects);
  const saveFn = useServerFn(saveProject);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "draft" });

  const q = useQuery({
    queryKey: ["projects", { status, search }],
    queryFn: () => listFn({ data: { status, search: search || undefined } }),
  });

  const create = async () => {
    if (!form.name.trim()) {
      toast.error("Give your project a name.");
      return;
    }
    setBusy(true);
    try {
      await saveFn({
        data: {
          name: form.name.trim(),
          description: form.description || undefined,
          status: form.status,
          tags: [],
        },
      });
      qc.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setForm({ name: "", description: "", status: "draft" });
      toast.success("Project created");
    } catch {
      toast.error("Could not create the project. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      title="Projects"
      subtitle="Organize content by campaign or client"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="size-4" /> New project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-desc">Description</Label>
                <Textarea
                  id="p-desc"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={create} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Create project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects…"
          className="max-w-xs"
          aria-label="Search projects"
        />
        {["all", ...PROJECT_STATUSES].map((s) => (
          <Button
            key={s}
            size="sm"
            variant={status === s ? "default" : "outline"}
            onClick={() => setStatus(s)}
          >
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </Button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {q.isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        {q.data?.length === 0 && (
          <p className="text-muted-foreground bg-card col-span-full rounded-2xl border p-8 text-center text-sm">
            No projects yet. Create one to group related content.
          </p>
        )}
        {q.data?.map((p) => (
          <Link
            key={p.id}
            to="/projects/$id"
            params={{ id: p.id }}
            className="bg-card hover:border-primary/40 rounded-2xl border p-5 shadow-card transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold">{p.name}</h2>
              <span className="bg-accent text-accent-foreground shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium">
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-xs">
              {p.description ?? "No description"}
            </p>
            <p className="text-muted-foreground mt-4 text-[11px]">
              Updated {new Date(p.updated_at).toLocaleDateString()}
            </p>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
