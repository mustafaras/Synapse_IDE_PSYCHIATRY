

import type { NoteSlots } from "../tabs/Note";
import type { Assessment, Patient } from "../registry/types";
import { NOTE_GLOBAL_FOOTER } from "../Flows/legalCopy";

export function buildMarkdown(note: NoteSlots): string {
  return [
    `# Clinical Note`,
    `## Summary\n${note.summary || ""}`,
    `## Plan\n${note.plan || ""}`,
    `## Flow Outcome\n${note.outcome || ""}`,
    `## Vitals / Results\n${note.vitals || ""}`,
    `## References (APA)\n${note.refs || ""}`,
    `---`,
    `${NOTE_GLOBAL_FOOTER}`
  ].join("\n\n").trim();
}

export function buildHTML(note: NoteSlots): string {
  const md = buildMarkdown(note)
    .replace(/^# (.*)$/m, "<h1>$1</h1>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");
  const css = `
  <style>
    body{font-family:var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace); color:#e6e9ef; background:#0e1116; padding:24px;}
    h1,h2{margin:0 0 8px 0}
    h1{font-size:20px} h2{font-size:16px}
    p{margin:0 0 10px 0; line-height:1.5}
    @media print { body{background:#fff; color:#000} }
  </style>`;
  return `<!doctype html><meta charset="utf-8"><title>Clinical Note</title>${css}<p>${md}</p>`;
}


export interface ExportJsonOptions {
  anonymize?: boolean;
}


export function buildRegistryJSON(
  patients: Patient[],
  opts: ExportJsonOptions = {}
): string {
  const payload = opts.anonymize ? anonymizePatients(patients) : patients;
  return JSON.stringify({ kind: "registry.v1", patients: payload }, null, 2);
}


export function parseRegistryJSON(json: string): Patient[] {
  const parsed = JSON.parse(json);
  if (parsed && parsed.kind === "registry.v1" && Array.isArray(parsed.patients)) {
    return parsed.patients as Patient[];
  }
  if (Array.isArray(parsed)) return parsed as Patient[];
  throw new Error("Unrecognized JSON: expected { kind:'registry.v1', patients: [...] }");
}


export function buildRegistryCSV(patients: Patient[]): string {
  const header = [
    "id",
    "name",
    "age",
    "sex",
    "risk",
    "tags",
    "lastEncounterISO",
    "openTasks",
    "phq9_latest",
    "phq9_previous",
    "gad7_latest",
    "gad7_previous",
    "bfcrs_latest",
    "bfcrs_previous",
  ];
  const rows = patients.map((p) => {
    const lastEnc = (p.encounters ?? []).slice().sort((a,b)=>b.when-a.when)[0];
    const openTasks = (p.tasks ?? []).filter(t=>!t.done).length;
    const [phqL, phqP] = lastTwoScores(p, "PHQ9");
    const [gadL, gadP] = lastTwoScores(p, "GAD7");
    const [bfL, bfP] = lastTwoScores(p, "BFCRS");
    return [
      csv(p.id),
      csv(p.name ?? ""),
      csv(p.age ?? ""),
      csv(p.sex ?? ""),
      csv(p.risk ?? ""),
      csv((p.tags ?? []).join(";")),
      csv(lastEnc ? new Date(lastEnc.when).toISOString() : ""),
      csv(openTasks),
      csv(phqL ?? ""),
      csv(phqP ?? ""),
      csv(gadL ?? ""),
      csv(gadP ?? ""),
      csv(bfL ?? ""),
      csv(bfP ?? ""),
    ].join(",");
  });
  return [header.join(","), ...rows].join("\n");
}


export function parseRegistryCSV(csvText: string): Patient[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];
  const header = lines[0].split(",");
  const idx = (col: string) => header.indexOf(col);

  const out: Patient[] = [];
  for (let i = 1; i < lines.length; i++) {
    const row = splitCsv(lines[i]);
    if (!row.length) continue;
    const id = row[idx("id")]?.trim();
    if (!id) continue;
    const name = emptyToUndef(unCsv(row[idx("name")]));
    const ageStr = unCsv(row[idx("age")]);
    const age = ageStr ? Number(ageStr) : undefined;
    const sex = (unCsv(row[idx("sex")]) || undefined) as Patient["sex"] | undefined;
    const riskStr = unCsv(row[idx("risk")]);
    const risk = riskStr ? (Number(riskStr) as Patient["risk"]) : (2 as Patient["risk"]);
    const tagsStr = unCsv(row[idx("tags")]) || "";
    const tags = tagsStr ? (tagsStr.split(";").filter(Boolean) as Patient["tags"]) : [];

    const obj: any = {
      id,
      risk: (risk ?? 2) as Patient["risk"],
      tags,
      assessments: [],
      encounters: [],
      tasks: [],
    };
    if (name !== undefined) obj.name = name;
    if (isFiniteNumber(age)) obj.age = age;
    if (sex) obj.sex = sex;
    out.push(obj as Patient);
  }
  return out;
}


export function downloadText(filename: string, text: string, mime = "text/plain"): void {
  const blob = new Blob([text], { type: mime + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


function anonymizePatients(patients: Patient[]): Patient[] {
  return patients.map((p) => {
    const copy: any = { ...p };
    delete copy.name;
    return copy as Patient;
  });
}

function lastTwoScores(p: Patient, kind: Assessment["kind"]): [number | undefined, number | undefined] {
  const arr = (p.assessments ?? []).filter(a => a.kind === kind).sort((a,b)=>b.when-a.when);
  return [arr[0]?.score, arr[1]?.score];
}

function isFiniteNumber(n: any): n is number {
  return typeof n === "number" && isFinite(n);
}

function csv(v: any): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function unCsv(v: string | undefined): string {
  if (!v) return "";
  let s = v;
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function emptyToUndef(x: string | undefined): string | undefined {
  if (x == null) return undefined;
  const t = x.trim();
  return t === "" ? undefined : t;
}


export type DeidPreset = 'none' | 'limited' | 'safe';

export interface DeidPolicy {
  preset: DeidPreset;
  saltRef: string;
  dateJitterDays: [number, number];
  bucketAges: boolean;
  dropFreeText: boolean;
  generalizeGeo: boolean;
  consentRequired: boolean;
  consentGiven?: boolean;
  consentSource?: string;
}

export type DeidNotes = { lines: string[]; sample?: any };

function _fnv1aSalted(input: string, salt: string): string {

  let str = `${salt}|${input}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const u = (h >>> 0).toString(16).padStart(8, '0');
  return u;
}

function _randBetweenFromHash(str: string, min: number, max: number): number {
  if (max <= min) return min;
  const h = parseInt(_fnv1aSalted(str, 'jitter').slice(0, 8), 16) >>> 0;
  const span = (max - min + 1);
  return min + (h % span);
}

function _jitterDaysForId(id: string, salt: string, range: [number, number]): number {
  const [min, max] = range;
  return _randBetweenFromHash(`${salt}|${id}`, min, max);
}

function _bucketAge(age: number): string {
  if (!Number.isFinite(age) || age < 0) return 'unknown';
  if (age >= 90) return '90+';
  const lo = Math.floor(age / 5) * 5;
  const hi = lo + 4;
  return `${lo}-${hi}`;
}

function _redactFreeText(text: any): string | null {
  if (text == null) return null;
  const s = String(text);
  if (!s.trim()) return '';
  return '[[redacted]]';
}

function _generalizeAddress(addr: any): any {
  if (!addr) return addr;
  const { city, state, country } = (typeof addr === 'object' ? addr : {} as any);
  return { region: [city, state, country].filter(Boolean).join(', ') };
}

function _makePolicy(preset: DeidPreset, opts?: Partial<Pick<DeidPolicy, 'consentGiven'|'consentSource'>>): DeidPolicy {
  const base: DeidPolicy = {
    preset,
    saltRef: 'session',
    dateJitterDays: [0, 0],
    bucketAges: false,
    dropFreeText: false,
    generalizeGeo: false,
    consentRequired: false,
  };
  if (typeof opts?.consentGiven === 'boolean') (base as any).consentGiven = opts?.consentGiven;
  if (typeof opts?.consentSource === 'string') (base as any).consentSource = opts?.consentSource;
  if (preset === 'limited') {
    base.dateJitterDays = [0, 3];
    base.bucketAges = true;
  } else if (preset === 'safe') {
    base.dateJitterDays = [0, 7];
    base.bucketAges = true;
    base.dropFreeText = true;
    base.generalizeGeo = true;
    base.consentRequired = true;
  }
  return base;
}

function _makeSamplePreview(input: { patientId?: string|number; name?: string; age?: number; sex?: string; note?: string; address?: any; lastSeen?: string | number | Date | null }, policy: DeidPolicy): DeidNotes {
  const sample = deidApplyRecord({
    patientId: input.patientId,
    name: input.name,
    age: input.age,
    sex: input.sex,
    note: input.note,
    address: input.address,
    lastSeen: input.lastSeen ?? undefined,
  }, policy, (input.patientId == null ? undefined : { patientId: input.patientId }));
  const lines = [
    `Preset: ${policy.preset}`,
    policy.consentRequired ? `Consent: ${policy.consentGiven ? 'given' : 'required'}` : 'Consent: not required',
  ];
  return { lines, sample };
}


export function deidMakePolicy(preset: 'none'|'limited'|'safe', consentGiven?: boolean, consentSource?: string): DeidPolicy {
  const opts: Partial<Pick<DeidPolicy, 'consentGiven'|'consentSource'>> = {};
  if (typeof consentGiven !== 'undefined') (opts as any).consentGiven = consentGiven;
  if (typeof consentSource !== 'undefined') (opts as any).consentSource = consentSource;
  return _makePolicy(preset, opts);
}


export function deidMakeSample(input: {
  patientId?: string | number;
  name?: string;
  age?: number;
  sex?: string;
  note?: string;
  address?: any;
  lastSeen?: string | number | Date | null;
}, policy: DeidPolicy): DeidNotes {
  return _makeSamplePreview(input, policy);
}


export function deidApplyRecord<T extends Record<string, any>>(rec: T, policy: DeidPolicy, context?: { patientId?: string|number }): T {

  const out: any = Array.isArray(rec) ? [...(rec as any)] : { ...(rec as any) };
  const pid = String(context?.patientId ?? (rec as any).patientId ?? (rec as any).id ?? '');


  if (policy.preset !== 'none') {
    const salt = policy.saltRef;
    if (out.patientId != null) out.patientId = _fnv1aSalted(String(out.patientId), salt);
    if (out.encounterId != null) out.encounterId = _fnv1aSalted(String(out.encounterId), salt);
    if (out.id != null && out.id !== out.patientId) out.id = _fnv1aSalted(String(out.id), salt);
  }


  const shift = policy.dateJitterDays[1] > 0 ? _jitterDaysForId(pid, policy.saltRef, policy.dateJitterDays) : 0;
  const tryShift = (v: any) => {
    if (!v || shift === 0) return v ?? null;
    const d = (v instanceof Date) ? new Date(v) : new Date(String(v));
    if (isNaN(d.getTime())) return v;
    d.setUTCDate(d.getUTCDate() + shift);
    return d.toISOString();
  };


  for (const k of Object.keys(out)) {
    const v = out[k];
    const lk = String(k).toLowerCase();
    if (lk.includes('date') || lk.includes('time') || v instanceof Date) {
      out[k] = tryShift(v);
      continue;
    }
    if (k === 'age' && policy.bucketAges && typeof v === 'number') {
      out[k] = _bucketAge(v);
      continue;
    }
    if ((k === 'note' || k === 'freeText') && policy.dropFreeText) {
      out[k] = (policy.preset === 'safe') ? null : _redactFreeText(v);
      continue;
    }
    if (k === 'address' && policy.generalizeGeo) {
      out[k] = _generalizeAddress(v);
      continue;
    }
  }

  return out as T;
}


export function deidRequireConsentOrThrow(policy: DeidPolicy): void {
  if (policy.consentRequired && !policy.consentGiven) {
    const msg = (policy.preset === 'safe')
      ? 'Export blocked: Research/Safe de-identification requires documented consent/IRB.'
      : 'Export blocked: Limited de-identification requires documented consent.';
    const err: any = new Error(msg);
    (err as any).code = 'DEID_CONSENT_REQUIRED';
    throw err;
  }
}


export type PreviewFormat = 'csv' | 'json' | 'md' | 'pdf' | 'fhir';

export type PreviewColumn = {
  id: string;
  label: string;
  kind: 'string'|'text'|'number'|'date'|'code'|'bool';
  order: number;
};

export type PreviewRow = Record<string, any>;

export type PreviewMetrics = {
  rowCount: number;
  missingPctByCol: Record<string, number>;
  outliersByCol: Record<string, number>;
};

export type PreviewPayload = {
  format: PreviewFormat;
  text?: string;
  json?: any;
  columns: PreviewColumn[];
  rows: PreviewRow[];
  metrics: PreviewMetrics;
};


export function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  const segs = path.split('.');
  let cur = obj;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
}


export function capRows<T>(arr: T[], cap = 50): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, Math.max(0, cap));
}


export function computePreviewMetrics(rows: PreviewRow[], cols: PreviewColumn[]): PreviewMetrics {
  const rowCount = rows.length;
  const missingPctByCol: Record<string, number> = {};
  const outliersByCol: Record<string, number> = {};

  for (const c of cols) {
    const values = rows.map(r => r[c.label]);

    const missing = values.filter(v => v == null || v === '' || (Number.isNaN(v))).length;
    missingPctByCol[c.label] = rowCount ? Math.round((missing / rowCount) * 100) : 0;


    if (c.kind === 'number') {
      const nums = values.map(v => Number(v)).filter(v => Number.isFinite(v));
      if (nums.length >= 4) {
        nums.sort((a,b)=>a-b);
        const q1 = quantile(nums, 0.25);
        const q3 = quantile(nums, 0.75);
        const iqr = q3 - q1;
        const lo = q1 - 1.5 * iqr;
        const hi = q3 + 1.5 * iqr;
        outliersByCol[c.label] = nums.filter(v => v < lo || v > hi).length;
      } else {
        outliersByCol[c.label] = 0;
      }
    } else {
      outliersByCol[c.label] = 0;
    }
  }

  return { rowCount, missingPctByCol, outliersByCol };

  function quantile(sorted: number[], p: number) {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    const w = idx - lo;
    return sorted[lo] * (1 - w) + sorted[hi] * w;
  }
}


export function previewAsCsv(columns: PreviewColumn[], rows: PreviewRow[]): string {
  const header = columns
    .sort((a,b)=>a.order-b.order)
    .map(c => escapeCsv(c.label))
    .join(',');
  const lines = rows.map(r => columns
    .sort((a,b)=>a.order-b.order)
    .map(c => escapeCsv(toCell(r[c.label])))
    .join(','));
  return [header, ...lines].join('\n');

  function escapeCsv(v: any) {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  function toCell(v: any) {
    if (v == null) return '';
    if (v instanceof Date) return v.toISOString();
    if (typeof v === 'object') return JSON.stringify(v);
    return v;
  }
}


export function previewAsJson(columns: PreviewColumn[], rows: PreviewRow[]): any[] {

  return rows.map(r => {
    const out: any = {};
    columns.sort((a,b)=>a.order-b.order).forEach(c => { out[c.label] = r[c.label]; });
    return out;
  });
}


export function previewAsMarkdown(columns: PreviewColumn[], rows: PreviewRow[]): string {
  const head = `# Export Preview\n\nRows: ${rows.length}\n\n`;
  if (!rows.length) return head + '_No data_\n';
  const thead = `| ${columns.sort((a,b)=>a.order-b.order).map(c=>c.label).join(' | ')} |\n| ${columns.map(()=> '---').join(' | ')} |`;
  const body = rows.map(r => `| ${columns.map(c => mdCell(r[c.label])).join(' | ')} |`).join('\n');
  return head + thead + '\n' + body + '\n';

  function mdCell(v: any) {
    if (v == null) return '';
    if (typeof v === 'object') return '`' + JSON.stringify(v) + '`';
    const s = String(v);
    return s.replace(/\n/g, ' ').slice(0, 200);
  }
}


export function previewAsPdfHtml(columns: PreviewColumn[], rows: PreviewRow[]): string {
  const css = `
    <style>
      body{font-family:system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell; color:#eee; background:#111;}
      .card{border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:12px; margin:8px 0; background:#181a1f;}
      h1{font-size:16px; margin:0 0 8px 0;}
      table{width:100%; border-collapse:collapse; font-size:12px;}
      th,td{border:1px solid rgba(255,255,255,0.1); padding:6px; text-align:left;}
      th{background:rgba(255,255,255,0.06);}
      .meta{opacity:0.75; font-size:11px; margin-bottom:8px;}
    </style>`;
  const head = `<div class="meta">Rows: ${rows.length}</div>`;
  const thead = `<tr>${columns.sort((a,b)=>a.order-b.order).map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}</tr>`;
  const body = rows.map(r => `<tr>${columns.map(c => `<td>${escapeHtml(cell(r[c.label]))}</td>`).join('')}</tr>`).join('');
  return `${css}<div class="card"><h1>Export Preview</h1>${head}<table><thead>${thead}</thead><tbody>${body}</tbody></table></div>`;

  function cell(v: any) {
    if (v == null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  }
  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[ch] as string));
  }
}


export function buildFhirBundleMinimal(args: {
  patient?: any;
  encounters?: any[];
  observations?: any[];
  questionnaireResponses?: any[];
}): any {
  const bundleId = `bundle-${Date.now().toString(36)}`;
  const entries: any[] = [];
  if (args.patient) entries.push(wrap('Patient', args.patient));
  (args.encounters ?? []).forEach(e => entries.push(wrap('Encounter', e)));
  (args.observations ?? []).forEach(o => entries.push(wrap('Observation', o)));
  (args.questionnaireResponses ?? []).forEach(q => entries.push(wrap('QuestionnaireResponse', q)));
  return { resourceType: 'Bundle', type: 'collection', id: bundleId, entry: entries };

  function wrap(rt: string, resource: any) {
    return { resource: { resourceType: rt, ...(resource ?? {}) } };
  }
}


export type FhirIssue = { level: 'info'|'warn'|'error', code: string, msg: string, path?: string };
export function validateFhirBundleLight(bundle: any): FhirIssue[] {
  const issues: FhirIssue[] = [];
  if (!bundle || bundle.resourceType !== 'Bundle') {
    issues.push({ level:'error', code:'NOT_BUNDLE', msg:'resourceType is not "Bundle"' });
    return issues;
  }
  if (!Array.isArray(bundle.entry)) {
    issues.push({ level:'warn', code:'NO_ENTRY', msg:'Bundle.entry missing or not array' });
    return issues;
  }
  for (let i=0; i<bundle.entry.length; i++) {
    const e = bundle.entry[i];
    const r = e?.resource;
    if (!r) { issues.push({ level:'warn', code:'NO_RESOURCE', msg:'Entry without resource', path:`entry[${i}]` }); continue; }
    if (!r.resourceType) issues.push({ level:'warn', code:'NO_RESOURCETYPE', msg:'Resource missing resourceType', path:`entry[${i}].resource` });

    if (r.resourceType === 'Patient') {
      if (!r.id && !r.identifier) issues.push({ level:'info', code:'PATIENT_ID', msg:'Patient lacks id/identifier', path:`entry[${i}].resource` });
    }
    if (r.resourceType === 'Encounter') {
      if (!r.status) issues.push({ level:'info', code:'ENCOUNTER_STATUS', msg:'Encounter.status missing', path:`entry[${i}].resource` });
      if (!r.class)  issues.push({ level:'info', code:'ENCOUNTER_CLASS',  msg:'Encounter.class missing',  path:`entry[${i}].resource` });
    }
    if (r.resourceType === 'Observation') {
      if (!r.code)   issues.push({ level:'info', code:'OBS_CODE', msg:'Observation.code missing', path:`entry[${i}].resource` });
      if (!r.valueQuantity && !r.valueString && !r.valueCodeableConcept) {
        issues.push({ level:'info', code:'OBS_VALUE', msg:'Observation value missing', path:`entry[${i}].resource` });
      }
    }
    if (r.resourceType === 'QuestionnaireResponse') {
      if (!r.status) issues.push({ level:'info', code:'QR_STATUS', msg:'QuestionnaireResponse.status missing', path:`entry[${i}].resource` });
    }
  }
  return issues;
}

