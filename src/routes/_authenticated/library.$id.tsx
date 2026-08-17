import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getContent, saveContent, deleteContent } from "@/lib/data.functions";
import { AppShell } from "@/components/AppShell";
import { ContentEditor } from "@/components/ContentEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Save, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library/$id")({
  head: () => ({
    meta: [
      { title: "Content — INKWAVE AI" },
      { name: "description", content: "Edit, refine and export a saved piece of content." },
      { property: "og:title", content: "Content — INKWAVE AI" },
      { property: "og:description", content: "Edit, refine and export your saved content." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContentDetail,
});

function ContentDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOne = useServerFn(getContent);
  const persist = useServerFn(saveContent);
  const remove = useServerFn(deleteContent);

  const q = useQuery({ queryKey: ["content", id], queryFn: () => fetchOne({ data: { id } }) });
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const row = q.data;
  const title = draft?.title ?? row?.title ?? "";
  const body = draft?.body ?? row?.body ?? "";

  const save = async () => {
    if (!row) return;
    setBusy(true);
    try {
      await persist({
        data: {
          id: row.id,
          project_id: row.project_id,
          content_type: row.content_type,
          platform: row.platform,
          title,
          body,
          metadata: (row.metadata ?? {}) as Record<string, unknown>,
          model: row.model ?? undefined,
        },
      });
      qc.invalidateQueries();
      toast.success("Changes saved");
    } catch {
      toast.error("Could not save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const destroy = async () => {
    setBusy(true);
    try {
      await remove({ data: { id } });
      qc.invalidateQueries();
      toast.success("Deleted");
      navigate({ to: "/library" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      title={row?.title ?? "Content"}
      subtitle={row ? `${row.content_type} · v${row.version ?? 1}` : undefined}
      actions={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/library">
            <ArrowLeft className="size-4" /> Library
          </Link>
        </Button>
      }
    >
      {q.isLoading && <Skeleton className="h-96 w-full rounded-2xl" />}
      {!q.isLoading && !row && (
        <p className="text-muted-foreground bg-card rounded-2xl border p-8 text-sm">
          This content no longer exists.
        </p>
      )}
      {row && (
        <div className="max-w-4xl space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setDraft({ title: e.target.value, body })} />
          </div>
          <ContentEditor
            title={title}
            body={body}
            onChange={(next) => setDraft({ title, body: next })}
            contentType={row.content_type}
            footer={
              <div className="flex flex-wrap gap-2">
                <Button onClick={save} disabled={busy}>
                  {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Save changes
                </Button>
                <Button variant="outline" onClick={destroy} disabled={busy}>
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            }
          />
        </div>
      )}
    </AppShell>
  );
}
