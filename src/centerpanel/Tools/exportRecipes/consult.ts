



import type { ConsultPdfManifest, Recipe, RenderResult } from "../recipes";

function sanitizeFilenamePart(s: string): string {
  return (s || "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_-]+/g, "")
    .slice(0, 60) || "Consult";
}

function normalizeHtmlBody(html: string): string {


  return (html || "").replace(/\s+/g, " ").trim();
}

function renderHtml(manifest: ConsultPdfManifest): RenderResult {
  const scope = manifest.scopeLabel || "Consult";
  const safeScope = sanitizeFilenamePart(scope);
  const body = normalizeHtmlBody(manifest.bodyHtml);


  const title = `Consult — ${scope}`;
  const css = `
    :root { --cp-surface:#ffffff; --cp-surface-2:#f7f8fa; --cp-text:#0f172a; --cp-text-muted:#475569; --cp-border:#e5e7eb; }
    html, body { height:100%; }
    body { font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial; margin:24px; color:#000; background:#fff; -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
    header{ margin:0 0 8px 0; }
    h1{ margin:0 0 8px 0; font-size:20px; font-weight:650; }
    h2{ margin:18px 0 8px 0; font-size:16px; font-weight:600; page-break-after: avoid; }
    h3{ margin:12px 0 6px 0; font-size:14px; font-weight:600; page-break-after: avoid; }
    p{ margin:6px 0; }
    ul,ol{ margin:8px 0 0 20px; }
    .muted{ color:#444; }
    .footer{ margin-top:24px; padding-top:8px; border-top:1px solid #999; }
    .disclaimer{ color:#444; font-size:12px; }
    table{ width:100%; border-collapse:collapse; margin:8px 0; }
    th,td{ border:1px solid #cfd4dc; padding:6px 8px; text-align:left; }
    th{ background:#f7f8fa; font-weight:600; }
    .page-break { page-break-before: always; }
    @page { margin: 18mm 14mm; }
    @media print { body{ background:#fff; color:#000; } }
  `;
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'"/>
<meta name="referrer" content="no-referrer"/>
<title>${title}</title>
<style>${css}</style>
</head>
<body>
  <header>
    <h1>Consult Summary</h1>
    <div class="muted">Scope: ${escapeHtml(scope)} • Policy: ${manifest.policyPreset}</div>
  </header>
  <main>${body}</main>
  <div class="footer">
    <div class="disclaimer">Supports documentation; not directives or orders.</div>
  </div>
</body>
</html>`;
  return { html, filenameBase: `Consult_${safeScope}` };
}

function escapeHtml(s: string): string {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const consultPdfV1: Recipe<ConsultPdfManifest> = {
  id: "consult/pdf/v1",
  render: (manifest) => renderHtml(manifest),
};
