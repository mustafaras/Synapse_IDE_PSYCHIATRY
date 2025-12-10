


import type { Patient, Encounter, RegistryState } from "../../registry/types";
import {
  resolveScope,
  type ScopeResult,
  type ScopeKind,
  resolveActiveContext,
  getPatientId,
  getEncounterId,
  getPatientLastEncounterISO,
  getPatientRiskGrade,
} from "./scope";
import { NOTE_GLOBAL_FOOTER } from "../../Flows/legalCopy";


import * as exporters from "../../lib/exporters";

export type DeidPreset = "none" | "limited" | "safe";

export interface DeidPolicy {
  preset: DeidPreset;
  seed?: string | number;
  anonymize?: boolean;
}

export interface ExportPayload {
  html: string;
  json: string;
  csv: string;
}


function hashSeed(seed: string | number | undefined): number {
  const str = String(seed ?? "tools-seed");
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeStableRng(seed: string | number | undefined) {
  let s = hashSeed(seed);
  return function next() {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


function makeExportersPolicy(policy: DeidPolicy): exporters.DeidPolicy | undefined {
  try {
    const base = exporters.deidMakePolicy(policy.preset as any);

    (base as any).saltRef = String(policy.seed ?? "tools-seed");
    return base;
  } catch {
    return undefined;
  }
}

function applyDeidToPatient(p: Patient, policy: DeidPolicy, _rng: () => number): Patient {
  if (policy.preset === "none") return p;
  const expPolicy = makeExportersPolicy(policy);
  if (expPolicy && typeof exporters.deidApplyRecord === "function") {

    return exporters.deidApplyRecord<Patient>({ ...(p as any) }, expPolicy, { patientId: p.id });
  }

  const masked: Patient = { ...p };
  if (masked.name) {
    const parts = String(masked.name).split(/\s+/).filter(Boolean);
    masked.name = parts.map((w) => (w[0] ? w[0].toUpperCase() + "." : "")).join(" ");
  }
  if (typeof masked.age === "number") {
    const a = masked.age;
    masked.age = a >= 90 ? 90 : Math.round(a / 5) * 5;
  }
  return masked;
}

function applyDeidToEncounter(e: Encounter, policy: DeidPolicy, rng: () => number, ownerPatientId?: string): Encounter {
  if (policy.preset === "none") return e;
  let out: Encounter = { ...e };
  const expPolicy = makeExportersPolicy(policy);
  if (expPolicy && typeof exporters.deidApplyRecord === "function") {

    out = exporters.deidApplyRecord<Encounter>({ ...(e as any), encounterId: e.id } as any, expPolicy, ownerPatientId ? { patientId: ownerPatientId } : undefined);
  }

  if (typeof out.when === "number") {
    const days = policy.preset === "limited" ? 2 : policy.preset === "safe" ? 7 : 0;
    if (days > 0) {
      const offsetDays = Math.floor(rng() * (2 * days + 1)) - days;
      out.when = out.when + offsetDays * 24 * 60 * 60 * 1000;
    }
  }

  if (policy.preset === "safe" && (out as any).location) {
    (out as any).location = "Generalized location" as any;
  }
  return out;
}


function fmtDate(ts?: number): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(+d)) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  };
  return d.toLocaleString(undefined, opts);
}

function esc(s: any): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}


function renderNoteSlots(slots?: Partial<Record<string, any>>): string {
  if (!slots || typeof slots !== "object") return "";

  const order: Array<[string, string]> = [["summary", "Summary"], ["plan", "Plan"], ["outcome", "Outcomes"], ["vitals", "Vitals"]];
  let out = "";
  for (const [key, label] of order) {
    const val = (slots as any)[key];
    if (!val) continue;
    out += `<h3>${esc(label)}</h3>\n<p>${esc(val)}</p>\n`;
  }
  return out;
}

function computeAssessmentShorts(p: Patient): Array<{ label: string; latest?: number; delta?: number }> {
  const out: Array<{ label: string; latest?: number; delta?: number }> = [];

  if ((p as any).phq9Score != null) out.push({ label: "PHQ‑9", latest: (p as any).phq9Score, delta: (p as any).phq9Delta });
  if ((p as any).bfcrsScoreCurrent != null) out.push({ label: "BFCRS", latest: (p as any).bfcrsScoreCurrent });

  const kinds = ["PHQ9", "GAD7", "BFCRS"] as const;
  for (const k of kinds) {
    const hasAlready = out.some(o => (k === "PHQ9" && o.label.startsWith("PHQ")) || (k === "BFCRS" && o.label === "BFCRS") || (k === "GAD7" && o.label === "GAD‑7"));
    if (hasAlready) continue;
    const list = (p.assessments || []).filter(a => a.kind === (k as any)).sort((a,b)=> (b.when??0)-(a.when??0));
    if (!list.length) continue;
    const latest = list[0]?.score;
    const prev = list[1]?.score;
    const deltaVal = (latest != null && prev != null) ? (latest - prev) : undefined;
    const label = k === "PHQ9" ? "PHQ‑9" : k === "GAD7" ? "GAD‑7" : "BFCRS";
    const row: { label: string; latest?: number; delta?: number } = { label };
    if (latest != null) row.latest = latest;
    if (deltaVal != null) row.delta = deltaVal;
    out.push(row);
  }
  return out;
}


function buildHtmlSummary(state: RegistryState, scope: ScopeResult, policy: DeidPolicy, rng: () => number): string {
  let title = "Clinical Summary";
  let headerMeta = "";
  let body = "";

  if (scope.scopeKind === "encounter") {
    const e = (scope.encounters || [])[0];
    title = "Clinical Summary — Encounter";
    if (e) {
      const owner = findOwnerPatient(state, e.id);
      const de = applyDeidToEncounter(e, policy, rng, owner?.id);
      headerMeta = `Date: ${esc(fmtDate(de.when))}` + ((de as any).location ? ` — ${esc((de as any).location)}` : "");

      if (owner) {
        const pd = applyDeidToPatient(owner, policy, rng);
        body += `<h2>Patient</h2>\n<ul>`;
        body += `<li>ID: ${esc(pd.id)}</li>`;
        body += `<li>Name: ${esc(pd.name ?? "—")}</li>`;
        body += `<li>Age: ${esc(pd.age ?? "—")}</li>`;
        body += `<li>Sex: ${esc(pd.sex ?? "—")}</li>`;
        body += `<li>Risk: ${esc((pd as any).risk ?? "—")}</li>`;
        body += `</ul>\n`;
      }

      const flags = (e as any).flags || {};
      const flagLabels: string[] = [];
      for (const k of Object.keys(flags)) { if (flags[k]) flagLabels.push(k.replace(/([A-Z])/g, ' $1').toLowerCase()); }
      if (flagLabels.length) {
        body += `<p class="muted">Flags: ${esc(flagLabels.join(" • "))}</p>`;
      }

      if (Array.isArray((e as any).completedRuns) && (e as any).completedRuns.length) {
        const latest = (e as any).completedRuns.slice().sort((a:any,b:any)=> (b.insertedAt??0)-(a.insertedAt??0))[0];
        body += `<p class="muted">Documentation runs: ${(e as any).completedRuns.length} (latest: ${esc(latest?.label ?? "run")} at ${esc(fmtDate(latest?.insertedAt))})</p>`;
      }
      if (Array.isArray((e as any).snapshots) && (e as any).snapshots.length) {
        body += `<p class="muted">Snapshots: ${(e as any).snapshots.length}</p>`;
      }
      body += renderNoteSlots((e as any).noteSlots);
    } else {
      headerMeta = "No encounter selected.";
    }
  }

  if (scope.scopeKind === "patient") {
    const p = (scope.patients || [])[0];
    title = "Clinical Summary — Patient";
    if (p) {
      const pd = applyDeidToPatient(p, policy, rng);
      body += `<h2>Demographics & Risk</h2>\n<ul>`;
      body += `<li>ID: ${esc(pd.id)}</li>`;
      body += `<li>Name: ${esc(pd.name ?? "—")}</li>`;
      body += `<li>Age: ${esc(pd.age ?? "—")}</li>`;
      body += `<li>Sex: ${esc(pd.sex ?? "—")}</li>`;
      body += `<li>Risk: ${esc((pd as any).risk ?? "—")}</li>`;
      body += `</ul>\n`;

      if (Array.isArray((p as any).tags) && (p as any).tags.length) {
        body += `<p class="muted">Tags: ${esc((p as any).tags.join(", "))}</p>`;
      }


      const shorts = computeAssessmentShorts(p);
      if (shorts.length) {
        body += `<h2>Assessments</h2>\n<ul>`;
        for (const s of shorts) {
          const delta = s.delta == null ? "" : (s.delta === 0 ? " (±0)" : s.delta > 0 ? ` (+${s.delta})` : ` (${s.delta})`);
          body += `<li>${esc(s.label)}: ${esc(s.latest ?? "—")}${delta}</li>`;
        }
        body += `</ul>`;
      }


      if (Array.isArray((p as any).tasks)) {
        const open = (p as any).tasks.filter((t:any)=> !t.done).length;
        const done = (p as any).tasks.filter((t:any)=>  t.done).length;
        body += `<p class="muted">Tasks — Open: ${open}, Done: ${done}</p>`;
      }

      const encs = (p.encounters || []).slice().sort((a, b) => (b.when ?? 0) - (a.when ?? 0));
      if (encs.length) {
        body += `<h2>Encounters</h2>\n<ol>`;
        for (const raw of encs.slice(0, 10)) {
          const de = applyDeidToEncounter(raw, policy, rng, p.id);
          const summary = (raw as any).noteSlots?.summary ?? "";
          body += `<li><strong>${esc(fmtDate(de.when))}</strong>${(de as any).location ? ` — ${esc((de as any).location)}` : ""}${summary ? ` — ${esc(summary)}` : ""}</li>`;
        }
        if (encs.length > 10) body += `<li class="muted">+${encs.length - 10} more…</li>`;
        body += `</ol>\n`;


        const latest = encs[0];
        if (latest) {
          body += `<h2>Latest Notes</h2>`;
          body += renderNoteSlots((latest as any).noteSlots);
        }
      }
    } else {
      headerMeta = "No patient selected.";
    }
  }

  if (scope.scopeKind === "cohort") {
    const list = scope.patients || [];
    title = "Clinical Summary — Cohort";
    headerMeta = `${list.length} patient(s)`;
    body += `<h2>Patients</h2>\n<ol>`;
    for (const p of list.slice(0, 20)) {
      const pd = applyDeidToPatient(p, policy, rng);
      body += `<li>${esc(pd.id)} — ${esc(pd.name ?? "—")} — Age ${esc(pd.age ?? "—")} — ${esc(pd.sex ?? "—")} — Risk ${esc((pd as any).risk ?? "—")}</li>`;
    }
    if (list.length > 20) body += `<li class="muted">+${list.length - 20} more…</li>`;
    body += `</ol>\n`;
  }

  const footer = `<footer class="footer">\n<small class="disclaimer">${esc(NOTE_GLOBAL_FOOTER || "Documentation supports clinical communication and does not constitute treatment directives.")}</small>\n</footer>`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>

  body { font: 13px/1.45 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica, Arial; margin: 24px; color: #eee; background: #111; }
  h1 { margin: 0 0 6px 0; font-size: 18px; }
  h2 { margin: 16px 0 6px 0; font-size: 15px; }
  h3 { margin: 12px 0 4px 0; font-size: 13px; }
  ul, ol { margin: 8px 0 0 20px; }
  .muted { color: rgba(255,255,255,0.5); }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1); }
  .disclaimer { color: rgba(255,255,255,0.5); }
  @media print {
    html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { background: #fff; color: #000; }
    .muted { color: #444; }
    .footer { border-top: 1px solid #999; }
    h1, h2 { break-inside: avoid; page-break-inside: avoid; }
    h2:not(:first-child) { break-before: page; page-break-before: always; }
    .section, .enc-list, .assess-list { break-inside: avoid; page-break-inside: avoid; }
    table { page-break-inside: auto; }
    tr, td, th { page-break-inside: avoid; page-break-after: auto; }
  }
  @media (forced-colors: active) {
    body { forced-color-adjust: auto; }
  }
</style>
</head>
<body>
  <header>
    <h1>${esc(title)}</h1>
    ${headerMeta ? `<div class="muted">${esc(headerMeta)}</div>` : ``}
  </header>
  <main>
    ${body}
  </main>
  ${footer}
</body>
</html>`;
}


function filterToPatients(state: RegistryState, scope: ScopeResult, policy: DeidPolicy, rng: () => number): Patient[] {
  if (scope.scopeKind === "encounter") {
    const e = (scope.encounters || [])[0];
    if (!e) return [];
    const owner = findOwnerPatient(state, e.id);
    return owner ? [applyPatientWithEncounters(owner, policy, rng)] : [];
  }
  if (scope.scopeKind === "patient") {
    const p = (scope.patients || [])[0];
    return p ? [applyPatientWithEncounters(p, policy, rng)] : [];
  }

  return (scope.patients || [])
    .slice()
    .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0))
    .map((p) => applyPatientWithEncounters(p, policy, rng));
}

function applyPatientWithEncounters(p: Patient, policy: DeidPolicy, rng: () => number): Patient {
  const pd = applyDeidToPatient(p, policy, rng);
  const encs = (p.encounters || [])
    .slice()
    .sort((a, b) => (b.when ?? 0) - (a.when ?? 0))
    .map((e) => applyDeidToEncounter(e, policy, rng, p.id));
  return { ...(pd as any), encounters: encs } as Patient;
}

function buildJsonForScope(state: RegistryState, scope: ScopeResult, policy: DeidPolicy, rng: () => number): string {
  const patients = filterToPatients(state, scope, policy, rng);
  if (typeof (exporters as any).buildRegistryJSON === "function") {
    return (exporters as any).buildRegistryJSON(patients, { anonymize: policy.anonymize ?? (policy.preset !== "none") });
  }
  return JSON.stringify({ scope: scope.scopeKind, patients }, null, 2);
}

function buildCsvForScope(state: RegistryState, scope: ScopeResult, policy: DeidPolicy, rng: () => number): string {
  const patients = filterToPatients(state, scope, policy, rng);
  if (typeof (exporters as any).buildRegistryCSV === "function") {
    return (exporters as any).buildRegistryCSV(patients);
  }

  const header = ["patient_id","name","age","sex","risk"].join(",");
  const rows = patients.map((pd) => [pd.id, pd.name ?? "", (pd.age ?? ""), (pd.sex ?? ""), ((pd as any).risk ?? "")]
    .map(String).map(csvEscape).join(","));
  return [header, ...rows].join("\n");
}

function csvEscape(s: string): string {
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}


function findOwnerPatient(state: RegistryState, encounterId: string): Patient | undefined {
  for (const p of state.patients || []) {
    if ((p.encounters || []).some((e) => e.id === encounterId)) return p;
  }
  return undefined;
}


export function assembleForPreview(
  state: RegistryState,
  scopeOrKind: ScopeResult | ScopeKind | undefined,
  policy: DeidPolicy
): ExportPayload {
  const rng = makeStableRng(policy.seed);
  const scope: ScopeResult =
    typeof scopeOrKind === "object" && scopeOrKind && "scopeKind" in scopeOrKind
      ? scopeOrKind
      : resolveScope(state, scopeOrKind as ScopeKind | undefined);

  const html = buildHtmlSummary(state, scope, policy, rng);
  const json = buildJsonForScope(state, scope, policy, rng);
  const csv  = buildCsvForScope(state, scope, policy, rng);
  return { html, json, csv };
}


export type ConsultDeidPolicy = "none" | "limited" | "safe";

type ISO = string;

export interface PatientTeaser {
  id: string;
  alias: string;
  age?: number | null;
  sex?: string | null;
  risk?: number | null;
}

export interface PatientSlim extends PatientTeaser {
  dobISO?: ISO | null;
  city?: string | null;
  tags?: string[] | null;
  lastEncounterISO?: ISO | null;
}

export interface EncounterSlim {
  id: string;
  startISO?: ISO | null;
  endISO?: ISO | null;
  type?: string | null;
}

export interface ConsultItemEncounter { type: "encounter"; encounter: EncounterSlim; patient: PatientSlim; }
export interface ConsultItemPatient   { type: "patient";   patient: PatientSlim; }

export interface ConsultContext {
  scopeKind: ScopeKind;
  items: Array<ConsultItemEncounter | ConsultItemPatient>;
  label: string;
  seed: string;
  count?: number;
  policy: ConsultDeidPolicy;
}


export function canonicalize(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map((v) => canonicalize(v));
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
      const v = src[key];
      if (v === undefined) continue;
      out[key] = canonicalize(v);
    }
    return out;
  }
  return value;
}

export function canonicalJSONStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}


function seedFromString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h | 0) >>> 0;
}

function xorshift32(seed: number) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x >>> 0) / 0xFFFFFFFF;
  };
}


const PSEUDO_FIRST = ["Alex","Casey","Jamie","Riley","Taylor","Morgan","Jordan","Cameron","Drew","Avery"] as const;
const PSEUDO_LAST  = ["Lee","Kim","Patel","Morgan","Reed","Shaw","Ng","Ali","Ivanov","Silva"] as const;

function pseudonym(seedStr: string): string {
  const rnd = xorshift32(seedFromString("psn|" + seedStr));
  const f = PSEUDO_FIRST[Math.floor(rnd() * PSEUDO_FIRST.length)];
  const l = PSEUDO_LAST[Math.floor(rnd() * PSEUDO_LAST.length)];
  const n = Math.floor(rnd() * 900 + 100);
  return `${f} ${l} #${n}`;
}

function deidDobISO(dobISO: ISO | undefined | null, policy: ConsultDeidPolicy): ISO | null {
  if (!dobISO) return null;


  if (policy === "none" || policy === "limited") return dobISO;
  const d = new Date(dobISO);
  if (Number.isNaN(d.getTime())) return null;

  return null;
}

function deidCity(city: string | null | undefined, policy: ConsultDeidPolicy): string | null {
  if (policy === "none") return city ?? null;
  if (!city) return null;
  if (policy === "limited") return city;
  return null;
}

function deidAlias(name: string | null | undefined, seed: string, policy: ConsultDeidPolicy): string {
  const base = name && name.trim() ? name.trim() : "Patient";
  if (policy === "none") return base;
  return pseudonym(seed);
}


function sortPatientsStable(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => {
    const ra = getPatientRiskGrade(a) | 0;
    const rb = getPatientRiskGrade(b) | 0;
    if (ra !== rb) return rb - ra;
    const da = getPatientLastEncounterISO(a);
    const db = getPatientLastEncounterISO(b);
    if (da !== db) return (db > da ? 1 : db < da ? -1 : 0);
    const ia = getPatientId(a);
    const ib = getPatientId(b);
    return ia < ib ? -1 : ia > ib ? 1 : 0;
  });
}

function capStable<T>(arr: T[], cap: number): T[] {
  if (arr.length <= cap) return arr;
  return arr.slice(0, cap);
}


function toPatientSlim(p: Patient, policy: ConsultDeidPolicy): PatientSlim {
  const id = getPatientId(p);
  const seed = `patient|${id}`;
  const lastISO = getPatientLastEncounterISO(p) || null;
  const tags = Array.isArray((p as any).tags) ? [...(p as any).tags].sort() : null;
  return {
    id,
    alias: deidAlias((p as any).name ?? null, seed, policy),
    age: (p as any).age ?? null,
    sex: (p as any).sex ?? null,
    risk: getPatientRiskGrade(p) ?? null,
    dobISO: deidDobISO((p as any).dobISO ?? null, policy),
    city: deidCity((p as any).city ?? null, policy),
    tags,
    lastEncounterISO: lastISO,
  };
}

function toEncounterSlim(e: Encounter): EncounterSlim {
  return {
    id: getEncounterId(e),
    startISO: (e as any).startISO ?? ((e as any).when ? new Date((e as any).when).toISOString() : null),
    endISO: (e as any).endISO ?? null,
    type: (e as any).type ?? null,
  };
}


function labelForEncounter(e: Encounter, p: Patient): string {
  const pe = getPatientId(p);
  const eid = getEncounterId(e);
  const start = (e as any).startISO ?? ((e as any).when ? new Date((e as any).when).toISOString() : "");
  return `Encounter ${eid} • Patient ${pe} • ${start}`.trim();
}

function labelForPatient(p: Patient): string {
  return `Patient ${getPatientId(p)}`;
}

function labelForCohort(count: number, cap: number, base: string): string {
  return count > cap ? `${base}: ${cap}+ (of ${count})` : `${base}: ${count}`;
}


function deepMaskConsultContext(ctx: ConsultContext, opts?: { seed?: string }): ConsultContext {
  const seed = String(opts?.seed ?? ctx.seed ?? "scope|seed");
  const toHex = (n: number) => n.toString(16).padStart(8, "0");
  const maskId = (val: unknown): string => {
    const s = String(val ?? "");
    const h = hashSeed(seed + "|" + s);
    return "id_" + toHex(h);
  };
  const reEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const rePhone = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4})/;
  const reAddress = /\b(st(reet)?|ave(nue)?|rd|road|dr(ive)?|ln|lane|blvd|boulevard)\b/i;

  const visit = (value: unknown, _keyHint?: string): unknown => {
    if (value == null) return value;
    if (Array.isArray(value)) return value.map((v) => visit(v));
    if (typeof value === "object") {
      const src = value as Record<string, unknown>;
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(src)) {
        const lk = k.toLowerCase();
        const v = src[k];
        if (lk === "id") { out[k] = maskId(v); continue; }
        if (lk.includes("dob")) { out[k] = null; continue; }
        if (lk === "city") { out[k] = null; continue; }

        if (lk === "alias") { out[k] = v; continue; }
        out[k] = visit(v, k);
      }
      return out;
    }
    if (typeof value === "string") {
      let s = value;
      if (reEmail.test(s)) s = s.replace(reEmail, "[email]");
      if (rePhone.test(s)) s = s.replace(rePhone, "[phone]");
      if (reAddress.test(s)) s = s.replace(reAddress, "[address]");
      return s;
    }
    return value;
  };

  return visit(ctx) as ConsultContext;
}

export function assembleConsultContext(
  state: RegistryState,
  policy: ConsultDeidPolicy,
  cap = 50,
  opts?: { redact?: boolean }
): ConsultContext {
  const ctx = resolveActiveContext(state);
  let scopeKind: ScopeKind = ctx.kind;
  let items: Array<ConsultItemEncounter | ConsultItemPatient> = [];
  let label = ctx.label || "Context";
  let seed = "scope|none";

  if (ctx.kind === "encounter" && ctx.encounter && ctx.patientOfEncounter) {
    const e = ctx.encounter;
    const p = ctx.patientOfEncounter;
    const pId = getPatientId(p);
    const eId = getEncounterId(e);

  items = [{ type: "encounter", encounter: toEncounterSlim(e), patient: toPatientSlim(p, policy) }];
    seed = `encounter|${pId}|${eId}`;
    label = labelForEncounter(e, p);
  } else if (ctx.kind === "patient" && ctx.patient) {
    const p = ctx.patient;
    const pId = getPatientId(p);
    items = [{ type: "patient", patient: toPatientSlim(p, policy) }];
    seed = `patient|${pId}`;
    label = labelForPatient(p);
  } else if (ctx.kind === "cohort" && ctx.cohort) {
    const sorted = sortPatientsStable(ctx.cohort);
    const sliced = capStable(sorted, cap);
    items = sliced.map((p) => ({ type: "patient", patient: toPatientSlim(p, policy) }));
    const base = ctx.label || "Cohort";
    label = labelForCohort(ctx.cohort.length, cap, base);
    const ids = sliced.map(getPatientId);
    seed = `cohort|${ids.join("|")}`;
  } else {
    scopeKind = "empty" as ScopeKind;
    items = [];
    label = "Empty";
    seed = "scope|empty";
  }

  const out: ConsultContext = { scopeKind, items, label, seed, count: items.length, policy };

  if (opts?.redact) {
    try { return deepMaskConsultContext(out, { seed }); } catch {  }
  }
  return out;
}
