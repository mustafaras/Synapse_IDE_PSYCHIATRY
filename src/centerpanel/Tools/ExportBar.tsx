import React, { useEffect, useMemo, useState } from "react";
import styles from "../styles/tools.module.css";

import { filterPatients, useRegistry } from "../registry/state";
import type { RegistryState } from "../registry/types";
import { resolveScope } from "./lib/scope";
import { assembleForPreview, type DeidPolicy } from "./lib/assemble";
import { downloadText } from "../lib/exporters";


import {
  appendAudit,
  type AuditRecord,
  computeChecksumHex,
  diffUnified,
  fmtWhen,
  listRecent,
  clearAuditAll,
  makeAuditRecord,
  rerunAndChecksum,
  snapshotSelection,
  truncateChecksum,
} from "./audit";
import { type ExternalExportPayload, getExternalExport, subscribeExternalExport } from "./exportInbox";
import { type ConsultPdfManifest, getRecipe } from "./recipes";

type ScopeKind = "encounter" | "patient" | "cohort";

interface ExportBarProps {
  scopeKind: ScopeKind;
  policy: DeidPolicy;
}


const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}${mm}${dd}-${hh}${mi}`;
};

function countForScope(state: RegistryState, scopeKind: ScopeKind): number {
  if (scopeKind === "cohort") return filterPatients(state).length;
  if (scopeKind === "encounter") {
    if (state.selectedEncounterId) return 1;
    const p = state.patients.find((pp) => pp.id === state.selectedPatientId);
    return (p?.encounters?.length ?? 0) > 0 ? 1 : 0;
  }
  if (scopeKind === "patient") {
    return state.selectedPatientId ? 1 : 0;
  }
  return 0;
}

function fileBase(scope: ScopeKind, count: number) {
  return `Tools_${scope}_${nowStamp()}_${count}`;
}

function openPreviewWindow(html: string, _desiredTitle: string, autoPrint = false) {
  try {

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, "_blank");
    if (!w) {
      URL.revokeObjectURL(url);
      return false;
    }

    if (autoPrint) {
      setTimeout(() => {
        try { w.focus(); w.print(); } catch {}
      }, 250);
    }

    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return true;
  } catch {
    return false;
  }
}


async function downloadPdfFromHtml(html: string, filename: string): Promise<boolean> {
  try {

    type ChainSet = { save: () => Promise<void> | void };
    type ChainFrom = { set: (opt: Record<string, unknown>) => ChainSet };
    type Chain = { from: (el: HTMLElement) => ChainFrom };
    type Factory = () => Chain;
    const mod: unknown = await import("html2pdf.js");
    let html2pdf: Factory;
    const maybeObj = mod as Record<string, unknown> | undefined;
    const def = maybeObj && typeof maybeObj === "object" && "default" in maybeObj ? (maybeObj as { default: unknown }).default : undefined;
    if (typeof def === "function") {
      html2pdf = def as Factory;
    } else if (typeof mod === "function") {
      html2pdf = mod as unknown as Factory;
    } else {
      throw new Error("html2pdf module shape unsupported");
    }


    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-99999px";
    iframe.style.top = "0";
    iframe.width = "800";
    iframe.height = "1120";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) throw new Error("iframe doc unavailable");
  doc.open();

  const PDF_STYLE_MARK = 'id="pdf-style-override"';
  const pdfStyle = `\n<style ${PDF_STYLE_MARK}>
    :root { --cp-surface:#ffffff; --cp-surface-2:#f7f8fa; --cp-text:#0f172a; --cp-text-muted:#475569; --cp-border:#e5e7eb; }
    html, body { height:100%; }
    body { font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial; margin:24px; color:var(--cp-text); background:var(--cp-surface); -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }

    * { color:#000000 !important; opacity:1 !important; filter:none !important; mix-blend-mode:normal !important; }
    header{ margin-bottom:8px; }
    h1{ margin:0 0 8px 0; font-size:20px; font-weight:650; }
    h2{ margin:18px 0 8px 0; font-size:16px; font-weight:600; }
    h3{ margin:12px 0 6px 0; font-size:14px; font-weight:600; }
    p{ margin:6px 0; }
    ul,ol{ margin:8px 0 0 20px; }
    .muted{ color:var(--cp-text-muted); }
    .footer{ margin-top:24px; padding-top:8px; border-top:1px solid var(--cp-border); }
    .disclaimer{ color:var(--cp-text-muted); }
    table{ width:100%; border-collapse:collapse; margin:8px 0; }
    th,td{ border:1px solid var(--cp-border); padding:6px 8px; text-align:left; }
    th{ background:var(--cp-surface-2); font-weight:600; }
    @media print { body{ background:#fff; color:#000; } .muted{ color:#444; } .footer{ border-top:1px solid #999; } }
  </style>\n`;
  const htmlForPdf = html.includes("</head>")
    ? html.replace("</head>", `${pdfStyle}</head>`)
    : pdfStyle + html;
  doc.write(htmlForPdf);
    doc.close();


    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const target = doc.body as HTMLElement;
    try {
      target.style.setProperty("background", "#ffffff", "important");
      target.style.setProperty("color", "#000000", "important");
      target.style.setProperty(
        "font",
        "14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial",
        "important"
      );
      (doc.querySelectorAll('*') as unknown as HTMLElement[]).forEach((el: HTMLElement) => {
        try {
          el.style.setProperty('color', '#000000', 'important');
          el.style.setProperty('opacity', '1', 'important');
          el.style.setProperty('filter', 'none', 'important');
          el.style.setProperty('mix-blend-mode', 'normal', 'important');
        } catch {}
      });
    } catch {}
    const opt: Record<string, unknown> = {
      margin:       10,
      filename,
      image:        { type: "png", quality: 1 },
      html2canvas:  { scale: 3, useCORS: true, backgroundColor: "#ffffff", letterRendering: true },
      jsPDF:        { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak:    { mode: ["css", "legacy"] },
    };
    await html2pdf().from(target).set(opt).save();

    iframe.remove();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

type SourceMode = "tools" | "consult" | "combined";

const ExportBar: React.FC<ExportBarProps> = ({ scopeKind, policy }) => {
  const { state } = useRegistry();
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const [recent, setRecent] = useState<AuditRecord[]>([]);
  const [openDiff, setOpenDiff] = useState<{ id: string; text: string } | null>(null);
  const [external, setExternal] = useState<ExternalExportPayload | null>(null);
  const [source, setSource] = useState<SourceMode>("tools");

  const count = useMemo(() => countForScope(state as RegistryState, scopeKind), [state, scopeKind]);
  const basename = useMemo(() => fileBase(scopeKind, count), [scopeKind, count]);

  function notify(kind: "ok" | "err", msg: string) {
    setToast({ kind, msg });
    window.setTimeout(() => setToast(null), 1600);
  }

  async function getPayload() {
    const scope = resolveScope(state as RegistryState, scopeKind);
    const out = assembleForPreview(state as RegistryState, scope, policy);
    return { scope, out };
  }


  function ensureNonEmpty(cnt: number): boolean {
    if (cnt === 0) {
      notify("err", "Nothing to export for current scope.");
      return false;
    }
    return true;
  }

  function refreshAudit() {
    setRecent(listRecent(5));
  }
  useEffect(() => { refreshAudit(); }, []);
  useEffect(() => {

    const unsub = subscribeExternalExport(setExternal);

    setExternal(getExternalExport());

    setSource(getExternalExport() ? "consult" : "tools");
    return unsub;
  }, []);

  useEffect(() => {
    if (external && source === "tools") {

    }
  }, [external, source]);

  function ensureConsultAvailable(): boolean {
    if (!external) {
      notify("err", "Consult payload missing. Use 'Send to Export' from Preview or Consult.");
      return false;
    }
    return true;
  }

  function extractBody(innerHtml: string): string {
    const m = innerHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return m ? m[1] : innerHtml;
  }

  function combineHtml(consultHtml: string, toolsHtml: string): string {
    const c = extractBody(consultHtml);
    const t = extractBody(toolsHtml);
    return `<!DOCTYPE html><html><head><meta charset="utf-8" />
      <title>Combined Export</title>
      <style>
        body{font:14px/1.55 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica,Arial;margin:24px;color:#eee;background:#111}
        h1{margin:0 0 10px 0;font-size:18px}
        h2{margin:18px 0 8px 0;font-size:16px}
        section{break-inside:avoid;page-break-inside:avoid}
        hr{border:0;border-top:1px solid rgba(255,255,255,.12);margin:18px 0}
        @media print{body{background:#fff;color:#000} hr{border-top:1px solid #999}}
      </style>
    </head><body>
      <h1>Combined Export</h1>
      <section>
        <h2>Consult Output</h2>
        <div>${c}</div>
      </section>
      <hr/>
      <section>
        <h2>Tools Preview</h2>
        <div>${t}</div>
      </section>
    </body></html>`;
  }

  function renderUnifiedDiffBlock(text: string) {
    const lines = text.split(/\n/);
    return (
      <pre
        aria-label="Diff result"
        style={{
          width: "100%",
          overflow: "auto",
          margin: 0,
          padding: 8,
          background: "var(--cp-surface-2, #111)",
          borderRadius: 6,
          maxHeight: 280,
        }}
      >
        {lines.map((ln, idx) => {
          const isAdd = ln.startsWith("+ ");
          const isDel = ln.startsWith("- ");
          const color = isAdd ? "#69c36b" : isDel ? "#ff6b6b" : "inherit";
          return (
            <div key={idx} style={{ color, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace" }}>
              {ln}
            </div>
          );
        })}
      </pre>
    );
  }

  return (
    <div role="region" aria-label="Export actions" className={styles.vstack} style={{ gap: 8 }}>
      {external ? (
        <div
          className={styles.externalBanner}
          role="status"
          aria-live="polite"
        >
          <div className={styles.externalBannerIcon} aria-hidden="true">ℹ️</div>
          <div className={styles.externalBannerBody}>
            <p className={styles.externalBannerTitle}>External consult</p>
            <p className={styles.externalBannerMeta}>
              <strong>Consult content available.</strong> Use the selector below to export Tools, Consult, or Combined.
            </p>
          </div>
        </div>
      ) : null}
      <div
        className={`${styles.bar} ${styles.barStack} ${styles.barThemeAmber}`}
        role="group"
        aria-label="Export controls"
      >
        <div className={styles.barRow} role="toolbar" aria-orientation="horizontal" aria-label="Export actions">
        <button
          className={styles.btnGhost}
          aria-label="Open printable preview"
          disabled={count === 0 || (source !== "tools" && !external)}
          aria-disabled={count === 0 || (source !== "tools" && !external)}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const wantConsult = source === "consult";
              const wantCombined = source === "combined";
              let html: string;
              let fname = `${basename}.pdf`;
              if (wantConsult || wantCombined) {
                if (!ensureConsultAvailable()) return;
                const recipe = getRecipe<ConsultPdfManifest>("consult/pdf/v1");
                if (!recipe) throw new Error("consult/pdf/v1 recipe missing");
                const manifest: ConsultPdfManifest = {
                  version: "v1",
                  scopeKind: external!.scopeKind,
                  scopeLabel: external!.scopeLabel,
                  policyPreset: external!.policyPreset,
                  selection: external!.selection,
                  bodyHtml: external!.html,
                };
                const out = recipe.render(manifest);
                const consultHtml = out.html;
                if (wantCombined) {
                  const scope = resolveScope(state as RegistryState, scopeKind);
                  const toolsHtml = (assembleForPreview(state as RegistryState, scope, policy)).html;
                  html = combineHtml(consultHtml, toolsHtml);
                  fname = `Combined_${basename}.pdf`;
                } else {
                  html = consultHtml;
                  fname = `${out.filenameBase}.pdf`;
                }
              } else {
                html = (await getPayload()).out.html;
              }
              const ok = openPreviewWindow(html, fname, false);
              if (!ok) notify("err", "Popup blocked");
              else notify("ok", "Preview opened");
            } catch (e) {
              console.error(e);
              notify("err", "Failed to open preview");
            }
          }}
        >
          Open Preview
        </button>

        <button
          className={styles.btnPrimary}
          aria-label="Quick print (Save as PDF in dialog)"
          disabled={count === 0 || (source !== "tools" && !external)}
          aria-disabled={count === 0 || (source !== "tools" && !external)}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const wantConsult = source === "consult";
              const wantCombined = source === "combined";
              const scope = resolveScope(state as RegistryState, scopeKind);
              let html: string;
              let fname = `${basename}.pdf`;
              if (wantConsult || wantCombined) {
                if (!ensureConsultAvailable()) return;
                const recipe = getRecipe<ConsultPdfManifest>("consult/pdf/v1");
                if (!recipe) throw new Error("consult/pdf/v1 recipe missing");
                const manifest: ConsultPdfManifest = {
                  version: "v1",
                  scopeKind: external!.scopeKind,
                  scopeLabel: external!.scopeLabel,
                  policyPreset: external!.policyPreset,
                  selection: external!.selection,
                  bodyHtml: external!.html,
                };
                const out = recipe.render(manifest);
                const consultHtml = out.html;
                if (wantCombined) {
                  const toolsHtml = (assembleForPreview(state as RegistryState, scope, policy)).html;
                  html = combineHtml(consultHtml, toolsHtml);
                  fname = `Combined_${basename}.pdf`;
                } else {
                  html = consultHtml;
                  fname = `${out.filenameBase}.pdf`;
                }
              } else {
                html = (assembleForPreview(state as RegistryState, scope, policy)).html;
              }
              const ok = openPreviewWindow(html, fname, true);
              if (!ok) notify("err", "Popup blocked");
              else notify("ok", "Print dialog opened");

              if (ok) {
                const checksum = await computeChecksumHex(html, "application/pdf");
                const selection = (source === "tools") ? snapshotSelection(state as RegistryState, scopeKind) : external!.selection;
                const args: Parameters<typeof makeAuditRecord>[0] = {
                  state: state as RegistryState,
                  scopeKind,
                  scopeLabel: (source === "tools") ? scope.scopeLabel : external!.scopeLabel,
                  selection,
                  policyPreset: (source === "tools") ? policy.preset : external!.policyPreset,
                  count,
                  mime: "application/pdf",
                  action: "print",
                  filename: fname,
                  checksum,
                  source: (source === "tools") ? "tools" : "consult",
                };
                const uid = (state as unknown as { user?: { id?: string } }).user?.id;
                if (uid) args.userId = uid;
                if (source === "tools" && policy.seed !== undefined) args.seed = policy.seed;
                if (source !== "tools") {

                  const manifest: ConsultPdfManifest = {
                    version: "v1",
                    scopeKind: external!.scopeKind,
                    scopeLabel: external!.scopeLabel,
                    policyPreset: external!.policyPreset,
                    selection: external!.selection,
                    bodyHtml: external!.html,
                  };
                  args.recipeId = "consult/pdf/v1";
                  args.manifest = JSON.stringify(manifest);
                }
                appendAudit(makeAuditRecord(args));
                refreshAudit();
              }
            } catch (e) {
              console.error(e);
              notify("err", "Failed to print");
            }
          }}
        >
          Quick Print
        </button>

        <button
          className={styles.btn}
          aria-label="Download PDF (via browser print to PDF)"
          disabled={count === 0 || (source !== "tools" && !external)}
          aria-disabled={count === 0 || (source !== "tools" && !external)}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const wantConsult = source === "consult";
              const wantCombined = source === "combined";
              const scope = resolveScope(state as RegistryState, scopeKind);
              let html: string;
              let fname = `${basename}.pdf`;
              if (wantConsult || wantCombined) {
                if (!ensureConsultAvailable()) return;
                const recipe = getRecipe<ConsultPdfManifest>("consult/pdf/v1");
                if (!recipe) throw new Error("consult/pdf/v1 recipe missing");
                const manifest: ConsultPdfManifest = {
                  version: "v1",
                  scopeKind: external!.scopeKind,
                  scopeLabel: external!.scopeLabel,
                  policyPreset: external!.policyPreset,
                  selection: external!.selection,
                  bodyHtml: external!.html,
                };
                const out = recipe.render(manifest);
                const consultHtml = out.html;
                if (wantCombined) {
                  const toolsHtml = (assembleForPreview(state as RegistryState, scope, policy)).html;
                  html = combineHtml(consultHtml, toolsHtml);
                  fname = `Combined_${basename}.pdf`;
                } else {
                  html = consultHtml;
                  fname = `${out.filenameBase}.pdf`;
                }
              } else {
                html = (assembleForPreview(state as RegistryState, scope, policy)).html;
              }
              const ok = await downloadPdfFromHtml(html, fname);
              if (!ok) notify("err", "Failed to generate PDF");
              else notify("ok", "PDF downloaded");

              if (ok) {
                const checksum = await computeChecksumHex(html, "application/pdf");
                const selection = (source === "tools") ? snapshotSelection(state as RegistryState, scopeKind) : external!.selection;
                const args: Parameters<typeof makeAuditRecord>[0] = {
                  state: state as RegistryState,
                  scopeKind,
                  scopeLabel: (source === "tools") ? scope.scopeLabel : external!.scopeLabel,
                  selection,
                  policyPreset: (source === "tools") ? policy.preset : external!.policyPreset,
                  count,
                  mime: "application/pdf",
                  action: "download",
                  filename: fname,
                  checksum,
                  source: (source === "tools") ? "tools" : "consult",
                };
                const uid = (state as unknown as { user?: { id?: string } }).user?.id;
                if (uid) args.userId = uid;
                if (source === "tools" && policy.seed !== undefined) args.seed = policy.seed;
                if (source !== "tools") {
                  const manifest: ConsultPdfManifest = {
                    version: "v1",
                    scopeKind: external!.scopeKind,
                    scopeLabel: external!.scopeLabel,
                    policyPreset: external!.policyPreset,
                    selection: external!.selection,
                    bodyHtml: external!.html,
                  };
                  args.recipeId = "consult/pdf/v1";
                  args.manifest = JSON.stringify(manifest);
                }
                appendAudit(makeAuditRecord(args));
                refreshAudit();
              }
            } catch (e) {
              console.error(e);
              notify("err", "Failed to download PDF");
            }
          }}
        >
          Download PDF
        </button>

        <button
          className={styles.btn}
          aria-label="Download JSON"
          disabled={count === 0 || source === "consult"}
          aria-disabled={count === 0 || source === "consult"}
          title={source === "consult" ? "Disabled for Consult-only mode" : undefined}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const { out } = await getPayload();
              downloadText(`${basename}.json`, out.json, "application/json");
              notify("ok", "JSON downloaded");

              const checksum = await computeChecksumHex(out.json, "application/json");
              const selection = snapshotSelection(state as RegistryState, scopeKind);
              const scope = resolveScope(state as RegistryState, scopeKind);
              const args: Parameters<typeof makeAuditRecord>[0] = {
                state: state as RegistryState,
                scopeKind,
                scopeLabel: scope.scopeLabel,
                selection,
                policyPreset: policy.preset,
                count,
                mime: "application/json",
                action: "download",
                filename: `${basename}.json`,
                checksum,
                storeText: out.json,
              };
              const uid = (state as unknown as { user?: { id?: string } }).user?.id;
              if (uid) args.userId = uid;
              if (policy.seed !== undefined) args.seed = policy.seed;
              appendAudit(makeAuditRecord(args));
              refreshAudit();
            } catch (e) {
              console.error(e);
              notify("err", "JSON download failed");
            }
          }}
        >
          Download JSON
        </button>

        <button
          className={styles.btn}
          aria-label="Download CSV"
          disabled={count === 0 || source === "consult"}
          aria-disabled={count === 0 || source === "consult"}
          title={source === "consult" ? "Disabled for Consult-only mode" : undefined}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const { out } = await getPayload();
              downloadText(`${basename}.csv`, out.csv, "text/csv");
              notify("ok", "CSV downloaded");

              const checksum = await computeChecksumHex(out.csv, "text/csv");
              const selection = snapshotSelection(state as RegistryState, scopeKind);
              const scope = resolveScope(state as RegistryState, scopeKind);
              const args: Parameters<typeof makeAuditRecord>[0] = {
                state: state as RegistryState,
                scopeKind,
                scopeLabel: scope.scopeLabel,
                selection,
                policyPreset: policy.preset,
                count,
                mime: "text/csv",
                action: "download",
                filename: `${basename}.csv`,
                checksum,
                storeText: out.csv,
              };
              const uid = (state as unknown as { user?: { id?: string } }).user?.id;
              if (uid) args.userId = uid;
              if (policy.seed !== undefined) args.seed = policy.seed;
              appendAudit(makeAuditRecord(args));
              refreshAudit();
            } catch (e) {
              console.error(e);
              notify("err", "CSV download failed");
            }
          }}
        >
          Download CSV
        </button>

        <button
          className={styles.btnGhost}
          aria-label="Copy JSON to clipboard"
          disabled={count === 0 || source === "consult"}
          aria-disabled={count === 0 || source === "consult"}
          title={source === "consult" ? "Disabled for Consult-only mode" : undefined}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const { out } = await getPayload();
              const ok = await copyToClipboard(out.json);
              notify(ok ? "ok" : "err", ok ? "JSON copied" : "Copy blocked");

              if (ok) {
                const checksum = await computeChecksumHex(out.json, "application/json");
                const selection = snapshotSelection(state as RegistryState, scopeKind);
                const scope = resolveScope(state as RegistryState, scopeKind);
                const args: Parameters<typeof makeAuditRecord>[0] = {
                  state: state as RegistryState,
                  scopeKind,
                  scopeLabel: scope.scopeLabel,
                  selection,
                  policyPreset: policy.preset,
                  count,
                  mime: "application/json",
                  action: "copy",
                  filename: `${basename}.json`,
                  checksum,
                  storeText: out.json,
                };
                const uid = (state as unknown as { user?: { id?: string } }).user?.id;
                if (uid) args.userId = uid;
                if (policy.seed !== undefined) args.seed = policy.seed;
                appendAudit(makeAuditRecord(args));
                refreshAudit();
              }
            } catch (e) {
              console.error(e);
              notify("err", "Copy failed");
            }
          }}
        >
          Copy JSON
        </button>

        <button
          className={styles.btnGhost}
          aria-label="Copy CSV to clipboard"
          disabled={count === 0 || source === "consult"}
          aria-disabled={count === 0 || source === "consult"}
          title={source === "consult" ? "Disabled for Consult-only mode" : undefined}
          onClick={async () => {
            if (!ensureNonEmpty(count)) return;
            try {
              const { out } = await getPayload();
              const ok = await copyToClipboard(out.csv);
              notify(ok ? "ok" : "err", ok ? "CSV copied" : "Copy blocked");

              if (ok) {
                const checksum = await computeChecksumHex(out.csv, "text/csv");
                const selection = snapshotSelection(state as RegistryState, scopeKind);
                const scope = resolveScope(state as RegistryState, scopeKind);
                const args: Parameters<typeof makeAuditRecord>[0] = {
                  state: state as RegistryState,
                  scopeKind,
                  scopeLabel: scope.scopeLabel,
                  selection,
                  policyPreset: policy.preset,
                  count,
                  mime: "text/csv",
                  action: "copy",
                  filename: `${basename}.csv`,
                  checksum,
                  storeText: out.csv,
                };
                const uid = (state as unknown as { user?: { id?: string } }).user?.id;
                if (uid) args.userId = uid;
                if (policy.seed !== undefined) args.seed = policy.seed;
                appendAudit(makeAuditRecord(args));
                refreshAudit();
              }
            } catch (e) {
              console.error(e);
              notify("err", "Copy failed");
            }
          }}
        >
          Copy CSV
        </button>
        </div>

        {}
        <div className={`${styles.barRow}`} role="toolbar" aria-orientation="horizontal" aria-label="Export source">
          <div className={styles.hstack} role="group" aria-label="Export source" style={{ gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <div className={`${styles.meta} ${styles.monoTight}`}>Content</div>
            <div className={styles.seg}>
              <button className={styles.segBtn} aria-pressed={source === "tools"} onClick={() => setSource("tools") }>
                Tools
              </button>
              <button className={styles.segBtn} aria-pressed={source === "consult"} onClick={() => setSource("consult")} title={!external ? "Disabled until Consult payload is sent" : undefined} disabled={!external}>
                Consult
              </button>
              <button className={styles.segBtn} aria-pressed={source === "combined"} onClick={() => setSource("combined")} title={!external ? "Disabled until Consult payload is sent" : undefined} disabled={!external}>
                Combined
              </button>
            </div>
            {}
            <div className={styles.meta} role="status" aria-live="polite">
              Selected: {source === "tools" ? "Tools" : source === "consult" ? "Consult" : "Combined"}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.meta} style={{ maxWidth: "72ch" }}>
        <em>Exports support clinical communication and documentation. They are not directives or orders.</em>
      </div>

      {toast != null && (
        <div
          className={`${styles.status} ${toast.kind === "ok" ? styles.success : styles.error}`}
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}
      {toast != null && (
        <div className={styles.srOnly} role="status" aria-live="polite">{toast.msg}</div>
      )}

      {}
      <div className={styles.divider} />
      <div role="region" aria-label="Recent exports" className={styles.vstack} style={{ gap: 6 }}>
        <div className={styles.outHeader}>
          <div className={styles.historyTitle}><strong>Recent exports</strong> <span className={styles.meta}>(last 5)</span></div>
          <div className={styles.outActions}>
            <button
              className={`${styles.btn} ${styles.btnGhost} ${styles.btnIcon}`}
              aria-label="Clear recent exports"
              title="Clear"
              onClick={() => { clearAuditAll(); refreshAudit(); notify("ok", "Cleared recent exports"); }}
            >
              {}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6m-9 4h12m-1 0-.7 12.1a2 2 0 0 1-2 1.9H8.7a2 2 0 0 1-2-1.9L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
            </button>
          </div>
        </div>
        {recent.length === 0 && <div className={styles.meta}>No exports yet.</div>}
        {recent.length > 0 && (
          <ul className={styles.recentList}>
            {recent.map((rec) => {
              const mimeLabel = rec.mime === "application/json" ? "JSON" : rec.mime === "text/csv" ? "CSV" : "HTML";
              return (
              <li key={rec.id}>
                <div className={styles.recentItem}>
                  <div className={styles.recentLeft}>
                    <div className={styles.recentTop}>
                      <span className={styles.meta}>{fmtWhen(rec.ts)} • {rec.scopeKind}</span>
                      <span className={`${styles.chipTiny}`}>{mimeLabel}</span>
                    </div>
                    <div className={`${styles.monoTight} ${styles.recentFile}`} title={rec.filename}>
                      {rec.filename} <span className={styles.meta}>• sum:{truncateChecksum(rec.checksum, 12)}</span>
                    </div>
                  </div>
                  <div className={styles.recentRight}>
                  <button
                    className={`${styles.btn} ${styles.btnSm}`}
                    aria-label={`Re-run ${rec.filename}`}
                    onClick={async () => {
                      try {
                        const { out, matches } = await rerunAndChecksum(state as RegistryState, rec);
                        if (rec.mime === "application/json") {
                          if (rec.action === "download") downloadText(rec.filename, out.json, "application/json");
                          else if (rec.action === "copy") await copyToClipboard(out.json);
                        } else if (rec.mime === "text/csv") {
                          if (rec.action === "download") downloadText(rec.filename, out.csv, "text/csv");
                          else if (rec.action === "copy") await copyToClipboard(out.csv);
                        } else {
                          const doPrint = rec.action === "print";
                          const ok = openPreviewWindow(out.html, rec.filename, doPrint);
                          if (!ok) notify("err", "Popup blocked");
                        }
                        notify(matches ? "ok" : "err", matches ? "Re-run identical ✓" : "Re-run differs");
                      } catch (e) {
                        console.error(e);
                        notify("err", "Re-run failed");
                      }
                    }}
                  >
                    Re-run
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnSm}`}
                    aria-label={`Diff ${rec.filename}`}
                    onClick={async () => {
                      try {
                        if (!(rec.mime === "application/json" || rec.mime === "text/csv")) {
                          notify("err", "Diff only for JSON/CSV");
                          return;
                        }
                        if (!rec.storedText) {
                          notify("err", "No snapshot stored for diff");
                          return;
                        }
                        if (openDiff && openDiff.id === rec.id) { setOpenDiff(null); return; }
                        const { out } = await rerunAndChecksum(state as RegistryState, rec);
                        const nowText = rec.mime === "application/json" ? out.json : out.csv;
                        const diff = diffUnified(rec.storedText, nowText);
                        setOpenDiff({ id: rec.id, text: diff });
                      } catch (e) {
                        console.error(e);
                        notify("err", "Diff failed");
                      }
                    }}
                  >
                    Diff
                  </button>
                  </div>
                </div>
                {openDiff != null && openDiff.id === rec.id && (
                  <div style={{ width: "100%" }}>
                    {renderUnifiedDiffBlock(openDiff.text)}
                  </div>
                )}
              </li>
            );})}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ExportBar;
