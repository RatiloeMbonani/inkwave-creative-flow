import { renderMarkdown } from "./markdown";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "inkwave-content";

export function exportTxt(title: string, body: string) {
  download(`${slug(title)}.txt`, `${title}\n\n${body}`, "text/plain;charset=utf-8");
}

export function exportMarkdown(title: string, body: string) {
  download(`${slug(title)}.md`, `# ${title}\n\n${body}`, "text/markdown;charset=utf-8");
}

export function exportCode(title: string, body: string, extension: string) {
  const match = body.match(/```[\w]*\n([\s\S]*?)```/);
  download(`${slug(title)}.${extension || "txt"}`, match?.[1] ?? body, "text/plain;charset=utf-8");
}

/** DOCX via the HTML-in-Word container format — opens natively in Word/Docs. */
export function exportDocx(title: string, body: string) {
  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${renderMarkdown(body)}</body></html>`;
  download(`${slug(title)}.doc`, html, "application/msword");
}

/** PDF through the browser's print pipeline (no server round-trip needed). */
export function exportPdf(title: string, body: string) {
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return false;
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:44rem;margin:3rem auto;padding:0 1.5rem;line-height:1.7;color:#0B1020}
h1{font-size:1.9rem}h2{font-size:1.35rem;margin-top:1.8rem}pre{background:#0B1020;color:#F8FAFC;padding:1rem;border-radius:8px;overflow:auto}
code{font-family:ui-monospace,monospace;font-size:.9em}blockquote{border-left:3px solid #4F7CFF;padding-left:1rem;color:#64748B}</style>
</head><body><h1>${title}</h1>${renderMarkdown(body)}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
  return true;
}
