import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { refineContent } from "@/lib/ai.functions";
import { REFINE_ACTIONS, TONES, LANGUAGES } from "@/lib/content-types";
import { renderMarkdown, wordCount } from "@/lib/markdown";
import { exportTxt, exportMarkdown, exportPdf, exportDocx, exportCode } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, Copy, Download, Wand2, Languages, Mic2 } from "lucide-react";
import { toast } from "sonner";

export function ContentEditor({
  title,
  body,
  onChange,
  contentType,
  fileExtension,
  footer,
}: {
  title: string;
  body: string;
  onChange: (next: string) => void;
  contentType: string;
  fileExtension?: string;
  footer?: React.ReactNode;
}) {
  const refine = useServerFn(refineContent);
  const [busy, setBusy] = useState<string | null>(null);

  const runRefine = async (action: string, extra?: string) => {
    setBusy(action + (extra ?? ""));
    try {
      const res = await refine({ data: { body, action, ...(extra ? { extra } : {}) } });
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onChange(res.body);
      toast.success("Content updated");
    } catch {
      toast.error("That edit couldn't be applied. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(body);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {REFINE_ACTIONS.map((a) => (
          <Button
            key={a.id}
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => runRefine(a.id)}
          >
            {busy === a.id ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Wand2 className="size-3.5" />
            )}
            {a.label}
          </Button>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={busy !== null}>
              <Mic2 className="size-3.5" /> Change tone
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {TONES.map((t) => (
              <DropdownMenuItem key={t} onClick={() => runRefine("tone", t)}>
                {t}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={busy !== null}>
              <Languages className="size-3.5" /> Translate
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {LANGUAGES.map((l) => (
              <DropdownMenuItem key={l} onClick={() => runRefine("translate", l)}>
                {l}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="preview">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">{wordCount(body)} words</span>
            <Button variant="ghost" size="sm" onClick={copy}>
              <Copy className="size-3.5" /> Copy
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Download className="size-3.5" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    if (!exportPdf(title, body)) toast.error("Allow pop-ups to export as PDF.");
                  }}
                >
                  PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportDocx(title, body)}>DOCX</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportTxt(title, body)}>TXT</DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportMarkdown(title, body)}>Markdown</DropdownMenuItem>
                {contentType === "code" && (
                  <DropdownMenuItem onClick={() => exportCode(title, body, fileExtension ?? "txt")}>
                    Source file
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value="preview" className="mt-3">
          <div
            className="prose-ink bg-card min-h-64 rounded-2xl border p-6 shadow-card"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
          />
        </TabsContent>
        <TabsContent value="edit" className="mt-3">
          <Textarea
            value={body}
            onChange={(e) => onChange(e.target.value)}
            rows={22}
            className="font-mono text-sm leading-relaxed"
            aria-label="Edit generated content"
          />
        </TabsContent>
      </Tabs>

      {footer}
    </div>
  );
}
