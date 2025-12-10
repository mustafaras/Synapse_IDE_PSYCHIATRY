



export type ScoreBand = { label: string; min: number; max: number };
export type ScoreResult = {
  total: number;
  severity: string;
  bands: ScoreBand[];
  flags: string[];
  breakdown?: Record<string, unknown>;
};

function clamp(n: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, n)); }
function sum(a: number[]) { return a.reduce((s, n) => s + n, 0); }
function coerce(items: number[], len: number, lo: number, hi: number): number[] {
  const v = Array.isArray(items) ? items.slice(0, len) : [];
  while (v.length < len) v.push(0);
  for (let i = 0; i < v.length; i++) v[i] = Number.isFinite(v[i]) ? clamp(v[i], lo, hi) : 0;
  return v;
}


export function phq9Score(items: number[]): ScoreResult {
  const x = coerce(items, 9, 0, 3);
  const total = sum(x);
  const bands: ScoreBand[] = [
    { label: 'None', min: 0, max: 4 },
    { label: 'Mild', min: 5, max: 9 },
    { label: 'Moderate', min: 10, max: 14 },
    { label: 'Moderately severe', min: 15, max: 19 },
    { label: 'Severe', min: 20, max: 27 },
  ];
  const severity = bands.find(b => total >= b.min && total <= b.max)?.label ?? 'Unknown';
  const flags: string[] = [];
  if (x[8] > 0) flags.push('Item 9 > 0 — discuss safety today');
  return { total, severity, bands, flags };
}


export function gad7Score(items: number[]): ScoreResult {
  const x = coerce(items, 7, 0, 3);
  const total = sum(x);
  const bands: ScoreBand[] = [
    { label: 'None', min: 0, max: 4 },
    { label: 'Mild', min: 5, max: 9 },
    { label: 'Moderate', min: 10, max: 14 },
    { label: 'Severe', min: 15, max: 21 },
  ];
  const severity = bands.find(b => total >= b.min && total <= b.max)?.label ?? 'Unknown';
  return { total, severity, bands, flags: [] };
}


export function pcl5Score(items: number[]): ScoreResult {
  const x = coerce(items, 20, 0, 4);
  const total = sum(x);
  const bands: ScoreBand[] = [
    { label: 'Subthreshold', min: 0, max: 32 },
    { label: 'Probable PTSD (screen)', min: 33, max: 80 },
  ];
  const severity = total >= 33 ? 'Probable PTSD (screen)' : 'Subthreshold';
  const atLeast = (arr: number[], need: number) => arr.filter(v => v >= 2).length >= need;
  const B = atLeast(x.slice(0, 5), 1);
  const C = atLeast(x.slice(5, 7), 1);
  const D = atLeast(x.slice(7, 14), 2);
  const E = atLeast(x.slice(14, 20), 2);
  const clusterOK = B && C && D && E;
  const flags: string[] = [];
  if (total >= 33) flags.push('Total ≥ 33 — positive screen');
  if (clusterOK) flags.push('Cluster criteria met (B≥1, C≥1, D≥2, E≥2 with items ≥2)');
  return { total, severity, bands, flags, breakdown: { B, C, D, E } };
}


export function ybocsScore(items: number[]): ScoreResult {
  const x = coerce(items, 10, 0, 4);
  const total = sum(x);
  const bands: ScoreBand[] = [
    { label: 'Subclinical', min: 0, max: 7 },
    { label: 'Mild', min: 8, max: 15 },
    { label: 'Moderate', min: 16, max: 23 },
    { label: 'Severe', min: 24, max: 31 },
    { label: 'Extreme', min: 32, max: 40 },
  ];
  const severity = bands.find(b => total >= b.min && total <= b.max)?.label ?? 'Unknown';
  return { total, severity, bands, flags: [] };
}


export function auditCScore(items: number[], sex: 'M' | 'F' | 'Other' = 'Other'): ScoreResult {
  const x = coerce(items, 3, 0, 4);
  const total = sum(x);
  const bands: ScoreBand[] = [
    { label: 'Low', min: 0, max: (sex === 'F' ? 2 : 3) },
    { label: 'Screen positive', min: (sex === 'F' ? 3 : 4), max: 12 },
  ];
  const severity = total >= (sex === 'F' ? 3 : 4) ? 'Screen positive' : 'Low';
  const flags: string[] = [];
  if (x[2] >= 4) flags.push('Q3 ≥ 4 — heavy episodic use flag');
  return { total, severity, bands, flags };
}

export type MeasureId = 'phq9' | 'gad7' | 'pcl5' | 'ybocs' | 'auditc';
export type RenderOpts = { title?: string; patient?: string; date?: string; sex?: 'M' | 'F' | 'Other' };

export function renderAutoscoreHTML(measure: MeasureId, answers: number[], opts: RenderOpts = {}): string {
  const title = opts.title ?? measure.toUpperCase();
  const patient = opts.patient ?? 'Jane Doe (32F)';
  const date = opts.date ?? new Date().toISOString().slice(0, 10);

  let res: ScoreResult;
  let items: number[] = [];

  switch (measure) {
    case 'phq9': items = coerce(answers, 9, 0, 3); res = phq9Score(items); break;
    case 'gad7': items = coerce(answers, 7, 0, 3); res = gad7Score(items); break;
    case 'pcl5': items = coerce(answers, 20, 0, 4); res = pcl5Score(items); break;
    case 'ybocs': items = coerce(answers, 10, 0, 4); res = ybocsScore(items); break;
    case 'auditc': items = coerce(answers, 3, 0, 4); res = auditCScore(items, opts.sex); break;
    default: items = []; res = { total: 0, severity: 'Unknown', bands: [], flags: [] }; break;
  }

  const anchors = res.bands.map(b => `${b.label}: ${b.min}–${b.max}`).join(' · ');
  const flags = res.flags.length ? `<li><strong>Flags:</strong> ${res.flags.map(f=>escapeHtml(f)).join('; ')}</li>` : '';

  const rows = items.map((v, i) =>
    `<tr><td style="padding:6px 8px;border:1px solid #d0d0d0">Item ${i + 1}</td><td style="padding:6px 8px;border:1px solid #d0d0d0;text-align:center">${v}</td></tr>`).join('');

  return `
<section class="mini-page print-friendly">
  <header><h2>${escapeHtml(title)}</h2></header>
  <p><strong>Patient:</strong> ${escapeHtml(patient)} &nbsp; <strong>Date:</strong> ${escapeHtml(date)}</p>

  <h3>Items</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr><th style="text-align:left;border:1px solid #d0d0d0;padding:6px 8px">Item</th>
               <th style="text-align:center;border:1px solid #d0d0d0;padding:6px 8px">Score</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <h3>Computed</h3>
  <ul>
    <li><strong>Total:</strong> ${res.total}</li>
    <li><strong>Severity:</strong> ${escapeHtml(res.severity)}</li>
    ${flags}
  </ul>

  <p><em>Severity anchors:</em> ${escapeHtml(anchors)}.</p>
  <p style="font-size:12px;opacity:.8">Use clinical judgement; follow local protocols.</p>
</section>`.trim();
}

function escapeHtml(s: string) {
  return (s ?? '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


export const __internal = { clamp, sum, coerce };
