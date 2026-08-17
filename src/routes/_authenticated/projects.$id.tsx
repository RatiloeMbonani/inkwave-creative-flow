import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProject, saveProject, deleteProject } from "@/lib/data.functions";
import { PROJECT_STATUSES, STATUS_LABEL } from "@/lib/content-types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  head: () => ({
    meta: [
      { title: "Project — INKWAVE AI" },
      { name: "description", content: "Manage a project and everything created inside it." },
      { property: "og:title", content: "Project — INKWAVE AI" },
      { property: "og:description", content: "Manage project details and its generated content." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOne = useServerFn(getProject);
  const persist = useServerFn(saveProject);
  const remove = useServerFn(deleteProject);

  const q = useQuery({ queryKey: ["project", id], queryFn: () => fetchOne({ data: { id } }) });
  const [draft, setDraft] = useState<{ name: string; description: string; status: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const project = q.data?.project;
  const form = draft ?? {
    name: project?.name ?? "",
    description: project?.description ?? "",
    status: project?.status ?? "draft",
  };

  const save = async () => {
    setBusy(true);
    try {
      await persist({
        data: {
          id,
          name: form.name,
          description: form.description || undefined,
          status: form.status,
          tags: (project?.tags ?? []) as string[],
        },
      });
      qc.invalidateQueries();
      toast.success("Project updated");
    } catch {
      toast.error("Could not update this project.");
    } finally {
      setBusy(false);
    }
  };

  const destroy = async () => {
    setBusy(true);
    try {
      await remove({ data: { id } });
      qc.invalidateQueries();
      toast.success("Project deleted");
      navigate({ to: "/projects" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      title={project?.name ?? "Project"}
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/projects">
            <ArrowLeft className="size-4" /> Projects
          </Link>
        </Button>
      }
    >
      {q.isLoading && <Skeleton className="h-72 w-full rounded-2xl" />}
      {!q.isLoading && !project && (
        <p className="text-muted-foreground bg-card rounded-2xl border p-8 text-sm">
          This project no longer exists.
        </p>
      )}
      {project && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div className="bg-card h-fit space-y-4 rounded-2xl border p-5 shadow-card">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setDraft({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={4}
                value={form.description}
                onChange={(e) => setDraft({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setDraft({ ...form, status: v })}>
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
            <div className="flex gap-2">
              <Button onClick={save} disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save
              </Button>
              <Button variant="outline" onClick={destroy} disabled={busy}>
                <Trash2 className="size-4" /> Delete
              </Button>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Content in this project</h2>
            <div className="mt-3 space-y-2">
              {q.data?.items.length === 0 && (
                <p className="text-muted-foreground bg-card rounded-2xl border p-6 text-sm">
                  Nothing here yet — generate content and save it to this project.
                </p>
              )}
              {q.data?.items.map((item) => (
                <Link
                  key={item.id}
                  to="/library/$id"
                  params={{ id: item.id }}
                  className="bg-card hover:border-primary/40 flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{item.title}</span>
                    <span className="text-muted-foreground block text-xs">
                      {item.content_type} · {item.word_count ?? 0} words
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-[11px]">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
