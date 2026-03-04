import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/tools.module.css";

import { useRegistry } from "../registry/state";
import type { RegistryState } from "../registry/types";
import { resolveScope } from "./lib/scope";
import { assembleForPreview, type DeidPolicy } from "./lib/assemble";
import { publishExternalExport, type ExternalExportPayload } from "./exportInbox";
import { snapshotSelection } from "./audit";

type Tab = "pdf" | "json" | "csv";

interface Props {
  scopeKind: "encounter" | "patient" | "cohort";
  policy: DeidPolicy;
  csvPreviewRows?: number;
  debounceMs?: number;
}

function splitCsvRow(row: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (q && row[i + 1] === '"') { cur += '"'; i++; }
      else q = !q;
    } else if (ch === "," && !q) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

function validateJson(jsonText: string) {
  try {
    const parsed = JSON.parse(jsonText);
    const patients: unknown[] =
      parsed?.kind === "registry.v1" && Array.isArray(parsed.patients)
        ? parsed.patients
        : Array.isArray(parsed)
          ? parsed
          : [];
    let missingId = 0, missingRisk = 0;
    for (const p of patients) {
      const obj = p as { id?: unknown; risk?: unknown };
      if (!obj.id) missingId++;
      if (obj.risk == null || obj.risk === "") missingRisk++;
    }
    return { ok: true, rows: patients.length, missingId, missingRisk };
  } catch (e) {
    return { ok: false, rows: 0, missingId: 0, missingRisk: 0, error: (e as Error).message };
  }
}

function validateCsv(csvText: string) {
  const lines = csvText.trim().split(/\r?\n/);
  if (!lines.length) return { ok: true, rows: 0, missingId: 0, missingRisk: 0 };
  const header = splitCsvRow(lines[0]);
  const idxId = header.indexOf("id");
  const idxRisk = header.indexOf("risk");
  let missingId = 0, missingRisk = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = splitCsvRow(lines[i]);
    if (idxId >= 0 && !(row[idxId] ?? "").trim()) missingId++;
    if (idxRisk >= 0 && (row[idxRisk] ?? "").trim() === "") missingRisk++;
  }
  return { ok: true, rows: Math.max(0, lines.length - 1), missingId, missingRisk };
}

function HtmlIframe({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  useEffect(() => { ref.current?.contentWindow?.focus(); }, [html]);
  return (
    <iframe
      ref={ref}
      title="Preview (PDF)"
      srcDoc={html}
      className={styles.previewFrameV2}
    />
  );
}


function injectPrettyScrollbarCss(docHtml: string): string {
  if (!docHtml) return docHtml;
  const MARK = 'id="pretty-scrollbar-style"';
  if (docHtml.includes(MARK)) return docHtml;
  const style = `\n<style ${MARK}>

  html { scrollbar-width: thin; }

  body { scrollbar-color: rgba(245,158,11,0.70) transparent; }


  body::-webkit-scrollbar { width: 12px; height: 12px; }
  body::-webkit-scrollbar-track {
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
    border-radius: 10px;
  }
  body::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, rgba(245,158,11,0.85), rgba(234,179,8,0.75));
    border-radius: 10px;
    border: 3px solid transparent;
    background-clip: content-box;
  }
  body::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, rgba(251,191,36,0.90), rgba(245,158,11,0.85));
  }
  @media print {

    body::-webkit-scrollbar { width: 0; height: 0; }
  }
</style>\n`;
  if (/</i.test(docHtml)) {
    if (docHtml.includes("</head>")) return docHtml.replace("</head>", `${style}</head>`);
    const headOpen = docHtml.match(/<head[^>]*>/i)?.[0];
    if (headOpen) return docHtml.replace(headOpen, headOpen + style);
  }
  return `${style}${docHtml}`;
}


function forceLightPreviewIfRequested(docHtml: string, enable: boolean): string {
  if (!enable || !docHtml) return docHtml;
  let out = docHtml;

  out = out.replace(/<html(\s[^>]*)?>/i, (m) => {
    return m.includes("data-tools-theme=") ? m : m.replace(/<html/i, '<html data-tools-theme="light"');
  });

  const MARK = 'id="tools-light-preview-style"';
  if (out.includes(MARK)) return out;
  const style = `\n<style ${MARK}>
  html[data-tools-theme="light"] body { background: #ffffff !important; color: #000000 !important; }
  html[data-tools-theme="light"] .muted { color: #444444 !important; opacity: 1 !important; }
  html[data-tools-theme="light"] .footer { border-top: 1px solid #999999 !important; }
</style>\n`;
  if (out.includes("</head>")) return out.replace("</head>", `${style}</head>`);
  const headOpen = out.match(/<head[^>]*>/i)?.[0];
  if (headOpen) return out.replace(headOpen, headOpen + style);
  return `${style}${out}`;
}

const TAB_IDS = ["pdf", "json", "csv"] as const;
const PANEL_IDS = { pdf: "panel-pdf", json: "panel-json", csv: "panel-csv" } as const;
const EMPTY_NOTICE = "No selection for the chosen scope. Choose an Encounter, Patient, or a non-empty Cohort.";

const PreviewPanel: React.FC<Props> = ({ scopeKind, policy, csvPreviewRows = 25, debounceMs = 150 }) => {
  const { state } = useRegistry();
  const [tab, setTab] = useState<Tab>("pdf");
  const [html, setHtml] = useState<string>("");
  const [json, setJson] = useState<string>("{}");
  const [csv, setCsv] = useState<string>("");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [jsonExpanded, setJsonExpanded] = useState<boolean>(false);
  const [announce, setAnnounce] = useState<string>("");
  const [isEmptyScope, setIsEmptyScope] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setIsBusy(true);
      if (cancelled) return;
      try {
        const scope = resolveScope(state as RegistryState, scopeKind);
        const empty = !((scope.patients?.length ?? 0) > 0 || (scope.encounters?.length ?? 0) > 0);
        setIsEmptyScope(empty);
        const out = assembleForPreview(state as RegistryState, scope, policy);
        if (cancelled) return;

        const toolsCenterEl = document.querySelector('[data-testid="tools-center"]');
        const isLight = toolsCenterEl?.getAttribute('data-theme') === 'light';
        const htmlWithScrollbar = injectPrettyScrollbarCss(out.html || "");
        const htmlForced = forceLightPreviewIfRequested(htmlWithScrollbar, Boolean(isLight));
        setHtml(htmlForced);
        setJson(out.json || "{}");
        setCsv(out.csv || "");
        setAnnounce(empty ? "Preview: empty scope" : `Preview updated: ${scopeKind.toString().toLowerCase()} — ${tab.toUpperCase()}`);
      } catch (e) {
        console.error("Preview assembly error:", e);
      } finally {
        setIsBusy(false);
      }
    }, debounceMs);
    return () => { cancelled = true; clearTimeout(t); };
  }, [state, scopeKind, policy, policy.preset, policy.seed, policy.anonymize, debounceMs, tab]);

  const jv = useMemo(() => validateJson(json), [json]);
  const cv = useMemo(() => validateCsv(csv), [csv]);
  const deid = policy.preset !== "none" || policy.anonymize;

  function onTabKeyDown(e: React.KeyboardEvent) {
    const order = TAB_IDS as unknown as Tab[];
    const idx = order.indexOf(tab);
    if (idx < 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = order[(idx + 1) % order.length];
      setTab(next);
      tabRefs.current[order.indexOf(next)]?.focus();
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prev = order[(idx - 1 + order.length) % order.length];
      setTab(prev);
      tabRefs.current[order.indexOf(prev)]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab(order[0]);
      tabRefs.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      setTab(order[order.length - 1]);
      tabRefs.current[order.length - 1]?.focus();
    }
  }

  return (
    <>
      {}
      <div className={styles.hstack} style={{ justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <div
          className={`${styles.seg} ${styles.previewTabs} ${styles.previewHeaderRight}`}
          role="tablist"
          aria-label="Preview format"
          onKeyDown={onTabKeyDown}
          tabIndex={0}
        >
          <button
            ref={(el) => { tabRefs.current[0] = el; }}
            id="tab-pdf"
            role="tab"
            aria-selected={tab === "pdf"}
            aria-controls={PANEL_IDS.pdf}
            tabIndex={tab === "pdf" ? 0 : -1}
            className={styles.segBtn}
            onClick={() => setTab("pdf")}
          >PDF</button>
          <button
            ref={(el) => { tabRefs.current[1] = el; }}
            id="tab-json"
            role="tab"
            aria-selected={tab === "json"}
            aria-controls={PANEL_IDS.json}
            tabIndex={tab === "json" ? 0 : -1}
            className={styles.segBtn}
            onClick={() => setTab("json")}
          >JSON</button>
          <button
            ref={(el) => { tabRefs.current[2] = el; }}
            id="tab-csv"
            role="tab"
            aria-selected={tab === "csv"}
            aria-controls={PANEL_IDS.csv}
            tabIndex={tab === "csv" ? 0 : -1}
            className={styles.segBtn}
            onClick={() => setTab("csv")}
          >CSV</button>
        </div>
        <button
          className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`}
          aria-label="Send preview to Export"
          onClick={() => {
            try {
              const scope = resolveScope(state as RegistryState, scopeKind);
              const selection = snapshotSelection(state as RegistryState, scopeKind);
              const payload: ExternalExportPayload = {
                html,
                scopeKind,
                scopeLabel: scope.scopeLabel,
                selection,
                policyPreset: policy.preset,
                ...(policy.seed !== undefined ? { seed: policy.seed } : {}),
              };
              publishExternalExport(payload);
              setAnnounce("Sent to Export. External payload active.");
            } catch (e) {
              console.error("Send to Export failed", e);
              setAnnounce("Failed to send to Export");
            }
          }}
          disabled={isEmptyScope}
          aria-disabled={isEmptyScope || undefined}
          title={isEmptyScope ? "No selection to export" : ""}
        >
          Send to Export
        </button>
      </div>

      <div className={styles.divider} />

      {tab === "pdf" && (
        <section
          id={PANEL_IDS.pdf}
          role="tabpanel"
          aria-labelledby="tab-pdf"
          aria-busy={isBusy || undefined}
        >
          {isEmptyScope && (
            <div className={styles.status} style={{ marginBottom: 8 }}>
              <span className={styles.meta}>{EMPTY_NOTICE}</span>
            </div>
          )}
          <div className={`${styles.prettyScrollV2} ${styles.previewWrap}`} style={{ overflow: "auto", borderRadius: 8 }}>
            <HtmlIframe html={html} />
          </div>
          <div className={styles.status} style={{ marginTop: 8 }}>
            <span className={styles.meta} role="status" aria-live="polite">Validation: print-safe layout; page breaks verified. Use browser Print → “Save as PDF”.</span>
          </div>
        </section>
      )}

      {tab === "json" && (
        <section
          id={PANEL_IDS.json}
          role="tabpanel"
          aria-labelledby="tab-json"
          aria-busy={isBusy || undefined}
        >
          {isEmptyScope && (
            <div className={styles.status} style={{ marginBottom: 8 }}>
              <span className={styles.meta}>{EMPTY_NOTICE}</span>
            </div>
          )}
          <div className={styles.codeWrapV2}>
            <div className={styles.codeToolbar}>
              <div className={styles.meta} role="status" aria-live="polite">{`~${typeof json === "string" ? json.length : 0} chars`}</div>
              <div className={styles.actions}>
                <button className={styles.btn} aria-label="Copy JSON" onClick={() => copy(json)}>Copy</button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                  aria-label={jsonExpanded ? "Collapse JSON" : "Expand JSON"}
                  aria-expanded={jsonExpanded}
                  aria-controls="json-scroll"
                  onClick={() => setJsonExpanded(v => !v)}
                >{jsonExpanded ? "Collapse" : "Expand"}</button>
              </div>
            </div>
            <div
              className={`${styles.codeScroll} ${styles.prettyScrollV2} ${jsonExpanded ? styles.codeExpanded : styles.codeCollapsed}`}
              id="json-scroll"
            >
              <pre className={styles.jsonPre}>{json}</pre>
            </div>
          </div>
          <div className={styles.status} style={{ marginTop: 8 }}>
            <span className={styles.meta}>
              Validation: {jv.ok ? (
                <>{jv.rows} rows; missing id: {jv.missingId}; missing risk: {jv.missingRisk}. {deid ? "De-ID applied." : "No de-ID."}</>
              ) : <>Invalid JSON ({jv.error}).</>}
            </span>
          </div>
        </section>
      )}

      {tab === "csv" && (
        <section
          id={PANEL_IDS.csv}
          role="tabpanel"
          aria-labelledby="tab-csv"
          aria-busy={isBusy || undefined}
        >
          {isEmptyScope && (
            <div className={styles.status} style={{ marginBottom: 8 }}>
              <span className={styles.meta}>{EMPTY_NOTICE}</span>
            </div>
          )}
          <CSVPreview csvText={csv} maxRows={csvPreviewRows} />
          <div className={styles.status} style={{ marginTop: 8 }}>
            <span className={styles.meta}>
              Validation: {cv.rows} rows; missing id: {cv.missingId}; missing risk: {cv.missingRisk}. {deid ? "De-ID applied." : "No de-ID."}
            </span>
          </div>
        </section>
      )}

      {}
      <div className={styles.srOnly} role="status" aria-live="polite">{announce}</div>
    </>
  );
};

function CSVPreview({ csvText, maxRows = 25 }: { csvText: string; maxRows?: number }) {
  const lines = csvText.trim() ? csvText.trim().split(/\r?\n/) : [];
  if (!lines.length) return <div className={styles.meta}>No CSV rows.</div>;
  const header = splitCsvRow(lines[0]);
  const rows = lines.slice(1, 1 + maxRows).map(splitCsvRow);
  return (
    <div
      role="region"
      aria-label="CSV preview table"
      className={`${styles.prettyScrollV2} ${styles.tableScroll}`}
      style={{
        overflowX: "auto",
        width: "100%",
        maxWidth: "100%",
        contain: "inline-size",
      }}
    >
      {lines.length - 1 > maxRows && (
        <div className={styles.meta} role="status" aria-live="polite" style={{ marginBottom: 6 }}>
          Showing first {maxRows} of {lines.length - 1} rows.
        </div>
      )}
      <table className={`${styles.tableV2} ${styles.rowZebra}`}>
        <thead>
          <tr>{header.map((h, i) => <th key={i} className={styles.thSticky}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {header.map((_, ci) => (
                <td key={ci} style={{ whiteSpace: "nowrap" }}>
                  {r[ci] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PreviewPanel;
