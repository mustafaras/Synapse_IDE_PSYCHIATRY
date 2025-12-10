
import * as Engine from "../components/timerEngine";

export type TimerAuditRecord = {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  mode: Engine.Mode;
  zeroBehavior: Engine.ZeroBehavior;
  phase: Engine.Phase;
  laps: { atMs: number; label?: string }[];
  segments: ReturnType<typeof Engine.segmentTotals>;

  segmentPct?: { assessment: number; therapy: number; break: number; documentation: number };
  spans?: Array<{ id: string; kind: Engine.SegmentKind; startMs: number; endMs: number; durationMs: number }>;
  splits?: Array<{ index: number; atMs: number; splitMs: number; label?: string }>;
  avgSplitMs?: number;
  snapshot: Engine.TimerSnapshot;
};

const LOG_KEY = "therapyTimer.audit@v1";

function readAll(): TimerAuditRecord[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as TimerAuditRecord[];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function writeAll(list: TimerAuditRecord[]) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(list)); } catch {}
}
function uid() { return `audit_${Math.random().toString(36).slice(2, 10)}`; }

export function addAudit(r: Omit<TimerAuditRecord, "id">): TimerAuditRecord {
  const rec: TimerAuditRecord = { id: uid(), ...r };
  const all = readAll();
  all.unshift(rec);
  writeAll(all.slice(0, 200));
  return rec;
}
export function listAudits(limit = 20): TimerAuditRecord[] {
  return readAll().slice(0, limit);
}
export function clearAudits() { writeAll([]); }

export function buildFromState(
  s: Engine.TimerState,
  startedAt: number,
  endedAt: number
): TimerAuditRecord {
  const durationMs = Engine.progressMs(s);
  const segments = Engine.segmentTotals(s);
  const laps = s.laps.map(l => (l.label !== undefined ? { atMs: l.atMs, label: l.label } : { atMs: l.atMs }));
  const pct = (() => {
    const d = durationMs > 0 ? durationMs : 1;
    const p = (x: number) => Math.round((x / d) * 1000) / 10;
    return {
      assessment: p(segments.assessment),
      therapy: p(segments.therapy),
      break: p(segments.break),
      documentation: p(segments.documentation),
    };
  })();

  const now = durationMs;
  const spans = (s.segments ?? []).map(sp => {
    const end = sp.endMs ?? now;
    const dur = Math.max(0, end - sp.startMs);
    return { id: sp.id, kind: sp.kind, startMs: sp.startMs, endMs: end, durationMs: dur };
  });

  let prev = 0;
  const splits = (s.laps ?? []).map((l, i) => {
    const splitMs = Math.max(0, l.atMs - prev); prev = l.atMs;
    return l.label !== undefined
      ? { index: i + 1, atMs: l.atMs, splitMs, label: l.label }
      : { index: i + 1, atMs: l.atMs, splitMs };
  });
  const avgSplitMs = splits.length ? Math.round(splits.reduce((sum, r) => sum + r.splitMs, 0) / splits.length) : 0;

  return {
    id: "pending",
    startedAt, endedAt, durationMs,
    mode: s.mode, zeroBehavior: s.zeroBehavior, phase: s.phase,
    laps, segments,
    segmentPct: pct,
    spans,
    splits,
    avgSplitMs,
    snapshot: Engine.snapshot(s),
  };
}

export function fmtIso(ms: number): string {
  try { return new Date(ms).toISOString(); } catch { return String(ms); }
}

export function summaryMarkdown(rec: TimerAuditRecord): string {
  const L = (ms: number) => Engine.fmtHMS(ms);
  const lines = [
    `# Therapy Timer Session`,
    ``,
    `**Started:** ${fmtIso(rec.startedAt)}`,
    `**Ended:**   ${fmtIso(rec.endedAt)}`,
    `**Duration:** ${L(rec.durationMs)}`,
    `**Mode:** ${rec.mode} · **End behavior:** ${rec.zeroBehavior} · **Phase:** ${rec.phase}`,
    ``,
    `## Segments`,
    `- Assessment: ${L(rec.segments.assessment)}`,
    `- Therapy: ${L(rec.segments.therapy)}`,
    `- Break: ${L(rec.segments.break)}`,
    `- Documentation: ${L(rec.segments.documentation)}`,
    ``,
    `## Laps (${rec.laps.length})`,
    `Index, Total, Split, Label`,
  ];

  let prev = 0;
  rec.laps.forEach((l, i) => {
    const split = Math.max(0, l.atMs - prev);
    prev = l.atMs;
    lines.push(`${i + 1}, ${L(l.atMs)}, ${L(split)}, ${l.label ?? ""}`);
  });
  lines.push("");
  lines.push(`> Snapshot v${rec.snapshot.v} stored for reproducibility.`);
  return lines.join("\n");
}


export function summaryHTML(rec: TimerAuditRecord): string {
  const L = (ms: number) => Engine.fmtHMS(ms);
  const style = `
  <style>
    :root { color-scheme: light dark; }
    @page { size: A4 portrait; margin: 12mm; }
    body { margin: 12mm; font: 12px/1.5 -apple-system, system-ui, Segoe UI, Roboto, sans-serif; color: #111; background: #fff; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    h2 { font-size: 14px; margin: 14px 0 8px; }
    .meta { opacity: .85; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 6px 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th, td { border-bottom: 1px solid rgba(127,127,127,.25); padding: 4px 6px; font-variant-numeric: tabular-nums; }
    th { text-align: left; opacity: .8; }
    .num { text-align: right; }
    @media print {
      body { margin: 12mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      a { color: inherit; text-decoration: none; }
    }
    .disclaimer { margin-top: 10px; font-size: 10px; opacity: .75; max-width: 80ch; }
  </style>
  `;
  const seg = rec.segments;
  const rows = (() => {
    let prev = 0, out = "";
    rec.laps.forEach((l, i) => {
      const split = Math.max(0, l.atMs - prev); prev = l.atMs;
      out += `<tr><td>${i + 1}</td><td class="num">${L(l.atMs)}</td><td class="num">${L(split)}</td><td>${l.label ?? ""}</td></tr>`;
    });
    if (!rec.laps.length) out = `<tr><td colspan="4" style="text-align:center; opacity:.7;">No laps</td></tr>`;
    return out;
  })();
  return `<!doctype html><html><head><meta charset="utf-8"><title>Therapy Timer Session</title>${style}</head>
  <body>
    <h1>Therapy Timer Session</h1>
    <div class="meta">
      <div><strong>Started:</strong> ${fmtIso(rec.startedAt)}</div>
      <div><strong>Ended:</strong> ${fmtIso(rec.endedAt)}</div>
      <div><strong>Duration:</strong> ${L(rec.durationMs)}</div>
      <div><strong>Mode:</strong> ${rec.mode} · <strong>End:</strong> ${rec.zeroBehavior} · <strong>Phase:</strong> ${rec.phase}</div>
    </div>

    <h2>Segments</h2>
    <div class="grid">
      <div>Assessment: <strong>${L(seg.assessment)}</strong></div>
      <div>Therapy: <strong>${L(seg.therapy)}</strong></div>
      <div>Break: <strong>${L(seg.break)}</strong></div>
      <div>Documentation: <strong>${L(seg.documentation)}</strong></div>
    </div>

    <h2>Laps (${rec.laps.length})</h2>
    <table><thead><tr><th>#</th><th>Total</th><th>Split</th><th>Label</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="disclaimer">This summary supports clinical documentation and quality review. It does not issue directives or replace clinical judgment.</div>
  </body></html>`;
}

