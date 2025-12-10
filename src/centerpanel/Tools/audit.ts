


import { assembleForPreview, type DeidPolicy } from "./lib/assemble";
import type { Patient, RegistryState } from "../registry/types";
import type { ScopeResult } from "./lib/scope";
import { filterPatients } from "../registry/state";
import { type ConsultPdfManifest, getRecipe, type RecipeId } from "./recipes";

export type AuditAction = "download" | "copy" | "print" | "open";
export type AuditMime = "application/json" | "text/csv" | "text/html" | "application/pdf";
export type ScopeKind = "encounter" | "patient" | "cohort";

export interface SelectionSnapshot {
  patientId?: string;
  encounterId?: string;
  patientIds?: string[];
  filter?: RegistryState["filter"];
}

export interface AuditRecord {
  id: string;
  ts: number;
  userId?: string;
  scopeKind: ScopeKind;
  scopeLabel: string;
  selection: SelectionSnapshot;
  policyPreset: "none" | "limited" | "safe";
  seed?: string | number;
  count: number;
  mime: AuditMime;
  action: AuditAction;
  filename: string;
  checksum: string;

  source?: "tools" | "consult";

  recipeId?: RecipeId;
  manifest?: string;

  storedText?: string;
  storedTruncated?: boolean;
}

const LS_KEY = "tools.audit.v1";
const LS_STORE_TEXT_KEY = "tools.audit.storeText.enabled";
const CAP = 100;
const MAX_STORE_BYTES = 200 * 1024;


function textEncoder() {
  return new TextEncoder();
}

function toHex(buffer: ArrayBuffer): string {
  const view = new Uint8Array(buffer);
  let s = "";
  for (let i = 0; i < view.length; i++) s += view[i].toString(16).padStart(2, "0");
  return s;
}

function fnv1a(str: string): string {

  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }

  const n = (h >>> 0).toString(16).padStart(8, "0");
  return `fnv_${n}`;
}

function normalizeHtmlForChecksum(html: string): string {


  let s = html.replace(/<meta[^>]*name=["']?generator-time["']?[^>]*>/gi, "");

  s = s.replace(/\s+/g, " ").trim();
  return s;
}


export async function computeChecksumHex(text: string, mime: AuditMime): Promise<string> {
  let normalized = text;
  if (mime === "text/html" || mime === "application/pdf") {
    normalized = normalizeHtmlForChecksum(text);
  }
  try {
    const subtle: SubtleCrypto | undefined = typeof window !== "undefined" ? window.crypto?.subtle : undefined;
    if (subtle) {
      const buf = await subtle.digest("SHA-256", textEncoder().encode(normalized));
      return toHex(buf);
    }
  } catch {

  }
  return fnv1a(normalized);
}


function readAll(): AuditRecord[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(list: AuditRecord[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, CAP)));
  } catch {

  }
}

export function listRecent(limit = 5): AuditRecord[] {
  const all = readAll();
  return all.slice(0, limit);
}

export function appendAudit(rec: AuditRecord) {
  const all = readAll();
  const next = [rec, ...all].slice(0, CAP);
  writeAll(next);
}


export function clearAuditAll(): void {
  try { writeAll([]); } catch {}
}


export function isStoreTextEnabled(): boolean {
  try {
    const v = localStorage.getItem(LS_STORE_TEXT_KEY);
    if (v == null) return true;
    return v === "1" || v === "true";
  } catch {
    return true;
  }
}

export function setStoreTextEnabled(enabled: boolean) {
  try {
    localStorage.setItem(LS_STORE_TEXT_KEY, enabled ? "1" : "0");
  } catch {

  }
}


export function snapshotSelection(state: RegistryState, scopeKind: ScopeKind): SelectionSnapshot {
  if (scopeKind === "encounter") {
    const out: SelectionSnapshot = {};
    if (state.selectedPatientId) out.patientId = state.selectedPatientId;
    if (state.selectedEncounterId) out.encounterId = state.selectedEncounterId;
    return out;
  }
  if (scopeKind === "patient") {
    const out: SelectionSnapshot = {};
    if (state.selectedPatientId) out.patientId = state.selectedPatientId;
    return out;
  }

  const cohort = filterPatients(state);
  const out: SelectionSnapshot = { patientIds: cohort.map((p: Patient) => p.id) };
  out.filter = state.filter;
  return out;
}


function reconstructScopeFromSnapshot(state: RegistryState, rec: AuditRecord) {
  const kind = rec.scopeKind;
  if (kind === "encounter") {
    const patient = (state.patients || []).find(p => p.id === rec.selection.patientId);
    const enc = patient?.encounters?.find(e => e.id === rec.selection.encounterId);
    return { scopeKind: "encounter", scopeLabel: rec.scopeLabel, encounters: enc ? [enc] : [], patients: [] };
  }
  if (kind === "patient") {
    const patient = (state.patients || []).find(p => p.id === rec.selection.patientId);
    return { scopeKind: "patient", scopeLabel: rec.scopeLabel, patients: patient ? [patient] : [], encounters: [] };
  }

  const ids = new Set(rec.selection.patientIds || []);

  const patients = (state.patients || [])
    .filter(p => ids.has(p.id))
    .slice()
    .sort((a, b) => (a.id > b.id ? 1 : a.id < b.id ? -1 : 0));
  return { scopeKind: "cohort", scopeLabel: rec.scopeLabel, patients, encounters: [] };
}


export function policyFromRecord(rec: AuditRecord): DeidPolicy {
  const base: DeidPolicy = { preset: rec.policyPreset, anonymize: rec.policyPreset !== "none" };
  if (rec.seed !== undefined) base.seed = rec.seed;
  return base;
}

export async function rerunAndChecksum(
  state: RegistryState,
  rec: AuditRecord
): Promise<{ out: { html: string; json: string; csv: string }, checksum: string, matches: boolean }> {

  if (rec.recipeId && rec.manifest && (rec.mime === "application/pdf" || rec.mime === "text/html")) {
    try {
      const recipe = getRecipe(rec.recipeId);
      if (!recipe) throw new Error("recipe not found");
      const manifest = JSON.parse(rec.manifest) as ConsultPdfManifest;
      const rendered = recipe.render(manifest);
      const html = rendered.html;
      const newCs = await computeChecksumHex(html, rec.mime);
      return { out: { html, json: "", csv: "" }, checksum: newCs, matches: newCs === rec.checksum };
    } catch {

    }
  }
  const scope = reconstructScopeFromSnapshot(state, rec);
  const policy = policyFromRecord(rec);
  const out = assembleForPreview(state, scope as ScopeResult, policy);
  let content = "";
  if (rec.mime === "application/json") content = out.json;
  else if (rec.mime === "text/csv") content = out.csv;
  else content = out.html;
  const newCs = await computeChecksumHex(content, rec.mime);
  return { out, checksum: newCs, matches: newCs === rec.checksum };
}


export function makeAuditRecord(args: {
  userId?: string;
  state: RegistryState;
  scopeKind: ScopeKind;
  scopeLabel: string;
  selection: SelectionSnapshot;
  policyPreset: "none" | "limited" | "safe";
  seed?: string | number;
  count: number;
  mime: AuditMime;
  action: AuditAction;
  filename: string;
  checksum: string;
  storeText?: string;
  source?: "tools" | "consult";
  recipeId?: RecipeId;
  manifest?: string;
}): AuditRecord {
  const rec: Partial<AuditRecord> = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    scopeKind: args.scopeKind,
    scopeLabel: args.scopeLabel,
    selection: args.selection,
    policyPreset: args.policyPreset,
    count: args.count,
    mime: args.mime,
    action: args.action,
    filename: args.filename,
    checksum: args.checksum,
    source: args.source ?? "tools",
  };
  if (args.userId !== undefined) rec.userId = args.userId;
  if (args.seed !== undefined) rec.seed = args.seed;
  if (args.recipeId) rec.recipeId = args.recipeId;
  if (typeof args.manifest === "string") rec.manifest = args.manifest;

  if (isStoreTextEnabled() && (args.mime === "application/json" || args.mime === "text/csv") &&
      typeof args.storeText === "string") {
    try {
      const enc = new TextEncoder().encode(args.storeText);
      if (enc.byteLength <= MAX_STORE_BYTES) {
        rec.storedText = args.storeText;
      } else {

        let bytes = 0;
        let cut = 0;
        while (cut < args.storeText.length && bytes < MAX_STORE_BYTES) {
          const code = args.storeText.charCodeAt(cut);

          bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
          if (bytes <= MAX_STORE_BYTES) cut++;
        }
        rec.storedText = `${args.storeText.slice(0, cut)}\n… [truncated]`;
        rec.storedTruncated = true;
      }
    } catch {

    }
  }

  return rec as AuditRecord;
}


export function truncateChecksum(cs: string, n = 10) {
  return cs.length > n ? cs.slice(0, n) : cs;
}

export function fmtWhen(ts: number) {
  const d = new Date(ts);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}


function splitLines(s: string): string[] {

  return s.replace(/\r\n/g, "\n").split("\n");
}


export function diffUnified(oldText: string, newText: string): string {
  const a = splitLines(oldText);
  const b = splitLines(newText);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  let ai = a.length - 1;
  let bi = b.length - 1;
  while (ai >= i && bi >= i && a[ai] === b[bi]) { ai--; bi--; }

  if (i > ai && i > bi) {
    return "No differences";
  }

  const parts: string[] = [];


  for (let k = i; k <= ai; k++) parts.push(`- ${a[k]}`);

  for (let k = i; k <= bi; k++) parts.push(`+ ${b[k]}`);
  return parts.join("\n");
}


export type ConsultOutcome = "ok" | "canceled" | "error";
export type ConsultErrorKind =
  | "unauthorized" | "forbidden" | "rate_limited" | "server_error"
  | "network_error" | "bad_request" | "aborted" | "unknown";

export type ConsultRunAudit = {
  id: string;
  model: string;
  tsStart: number;
  tsEnd?: number;
  durationMs?: number;
  outcome?: ConsultOutcome;


  status?: number;
  errorKind?: ConsultErrorKind;
  retryInMs?: number;


  promptChars?: number;
  contextChars?: number;
  outputChars?: number;
  chunks?: number;

  tokensPromptEst?: number;
  tokensContextEst?: number;
  tokensOutputEst?: number;

  redacted?: boolean;
};

const LS_OPTIN = "CONSULT_TELEMETRY_OPTIN";
const MAX_RUNS = 50;

let optIn = false;
try {
  const s = localStorage.getItem(LS_OPTIN);
  optIn = s === "1" || (s ? s.toLowerCase() === "true" : false);
} catch {
  optIn = false;
}

export function isTelemetryOptIn(): boolean { return !!optIn; }
export function setTelemetryOptIn(v: boolean): void {
  optIn = !!v;
  try { localStorage.setItem(LS_OPTIN, v ? "1" : "0"); } catch {}
  notifyConsult();
}


const consultRuns: ConsultRunAudit[] = [];
type ConsultSub = (list: ConsultRunAudit[]) => void;
const consultSubs = new Set<ConsultSub>();

function notifyConsult() {
  const list = consultRuns.slice().reverse();
  consultSubs.forEach(fn => { try { fn(list); } catch {  } });
}

export function subscribeConsultAudit(cb: ConsultSub): () => void {
  consultSubs.add(cb);
  try { cb(consultRuns.slice().reverse()); } catch {  }
  return () => void consultSubs.delete(cb);
}

export function getConsultAuditRuns(): ConsultRunAudit[] {
  return consultRuns.slice().reverse();
}

export function getConsultAuditRun(id: string): ConsultRunAudit | undefined {
  return consultRuns.find(r => r.id === id);
}


export function clearConsultAudit(): void {
  consultRuns.length = 0;
  notifyConsult();
}


function tok(n: number | undefined): number | undefined {
  if (typeof n !== "number" || !isFinite(n)) return undefined;
  return Math.ceil(n / 4);
}

export function diagRunStart(meta: {
  id: string; model: string; tsStart: number;
  promptChars?: number; contextChars?: number;

  redacted?: boolean;
}): void {
  if (!optIn) return;
  const item: ConsultRunAudit = {
    id: meta.id,
    model: meta.model,
    tsStart: meta.tsStart,
  } as ConsultRunAudit;
  item.chunks = 0;
  item.outputChars = 0;
  if (typeof meta.promptChars === "number") item.promptChars = meta.promptChars;
  if (typeof meta.contextChars === "number") item.contextChars = meta.contextChars;
  if (typeof meta.redacted === "boolean") item.redacted = !!meta.redacted;
  const tp = tok(meta.promptChars);
  const tc = tok(meta.contextChars);
  if (typeof tp === "number") item.tokensPromptEst = tp;
  if (typeof tc === "number") item.tokensContextEst = tc;
  consultRuns.push(item);
  while (consultRuns.length > MAX_RUNS) consultRuns.shift();
  notifyConsult();
}

export function diagRunChunk(id: string, deltaChars: number): void {
  if (!optIn) return;
  const r = consultRuns.find(x => x.id === id); if (!r) return;
  r.chunks = (r.chunks || 0) + 1;
  r.outputChars = (r.outputChars || 0) + Math.max(0, deltaChars | 0);
  notifyConsult();
}

export function diagRunFinish(id: string, outcome: ConsultOutcome, extra?: {
  status?: number; errorKind?: ConsultErrorKind; retryInMs?: number; tsEnd?: number;
}): void {
  if (!optIn) return;
  const r = consultRuns.find(x => x.id === id); if (!r) return;
  r.outcome = outcome;
  if (typeof extra?.status === "number") r.status = extra.status;
  if (extra?.errorKind) r.errorKind = extra.errorKind;
  if (typeof extra?.retryInMs === "number") r.retryInMs = extra.retryInMs;
  if (typeof extra?.tsEnd === "number") r.tsEnd = extra.tsEnd;
  const end = r.tsEnd ?? Date.now();
  r.durationMs = Math.max(0, end - r.tsStart);
  const to = tok(r.outputChars);
  if (typeof to === "number") r.tokensOutputEst = to;
  notifyConsult();
}


export type ConsultEvent =
  | { type: "consult.start"; ts: number; model: string; estPromptTokens: number; estContextTokens: number }
  | { type: "consult.ttfb"; ts: number; ttfbMs: number }
  | { type: "consult.chunk"; ts: number; bytes: number }
  | { type: "consult.finish"; ts: number; tokensOut: number; durationMs: number }
  | { type: "consult.cancel"; ts: number; durationMs: number }
  | { type: "consult.error"; ts: number; kind: "auth"|"throttle"|"server"|"network"|"other" };

type Rollup = {
  windowStart: number;
  starts: number;
  finishes: number;
  cancels: number;
  errors: number;
  errorKinds: Record<string, number>;
  tokensIn: number;
  tokensOut: number;
  ttfbMs: number[];
};

const MAX_TTFB = 200;
let rollup: Rollup = (() => {

  try {
    const raw = sessionStorage.getItem("CONSULTON_ROLLUP");
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        return {
          windowStart: obj.windowStart || Date.now(),
          starts: obj.starts || 0,
          finishes: obj.finishes || 0,
          cancels: obj.cancels || 0,
          errors: obj.errors || 0,
          errorKinds: obj.errorKinds || {},
          tokensIn: obj.tokensIn || 0,
          tokensOut: obj.tokensOut || 0,
          ttfbMs: Array.isArray(obj.ttfbMs) ? obj.ttfbMs.slice(-MAX_TTFB) : [],
        } as Rollup;
      }
    }
  } catch {  }
  return {
    windowStart: Date.now(),
    starts: 0, finishes: 0, cancels: 0, errors: 0,
    errorKinds: {}, tokensIn: 0, tokensOut: 0, ttfbMs: []
  } as Rollup;
})();

export function emitConsultEvent(e: ConsultEvent) {

  const DAY = 24 * 60 * 60 * 1000;
  if (Date.now() - rollup.windowStart > DAY) {
    rollup = { windowStart: Date.now(), starts: 0, finishes: 0, cancels: 0, errors: 0, errorKinds: {}, tokensIn: 0, tokensOut: 0, ttfbMs: [] };
  }
  switch (e.type) {
    case "consult.start":
      rollup.starts++;
      rollup.tokensIn += (e.estPromptTokens || 0) + (e.estContextTokens || 0);
      break;
    case "consult.ttfb":
      if (rollup.ttfbMs.length >= MAX_TTFB) rollup.ttfbMs.shift();
      rollup.ttfbMs.push(Math.max(0, Math.round(e.ttfbMs)));
      break;
    case "consult.finish":
      rollup.finishes++;
      rollup.tokensOut += e.tokensOut || 0;
      break;
    case "consult.cancel":
      rollup.cancels++;
      break;
    case "consult.error":
      rollup.errors++;
      rollup.errorKinds[e.kind] = (rollup.errorKinds[e.kind] || 0) + 1;
      break;
  }
  try { sessionStorage.setItem("CONSULTON_ROLLUP", JSON.stringify(rollup)); } catch {}
}

export function getConsultRollupSnapshot() {
  const w = (Date.now() - rollup.windowStart) / 1000;
  const avgTtfb = rollup.ttfbMs.length ? Math.round(rollup.ttfbMs.reduce((a,b)=>a+b,0)/rollup.ttfbMs.length) : 0;
  const errRate = rollup.starts ? +(rollup.errors/rollup.starts).toFixed(3) : 0;
  const cancelRate = rollup.starts ? +(rollup.cancels/rollup.starts).toFixed(3) : 0;
  const avgTokensIn = rollup.starts ? Math.round(rollup.tokensIn / Math.max(1, rollup.starts)) : 0;
  const avgTokensOut = rollup.finishes ? Math.round(rollup.tokensOut / Math.max(1, rollup.finishes)) : 0;
  return {
    windowSec: Math.round(w),
    starts: rollup.starts,
    finishes: rollup.finishes,
    cancels: rollup.cancels,
    errors: rollup.errors,
    errorKinds: rollup.errorKinds,
    errRate,
    cancelRate,
    avgTtfbMs: avgTtfb,
    avgTokensIn,
    avgTokensOut,
  } as const;
}


export function estimateTokensFromChars(chars: number): number {
  return Math.max(1, Math.round(chars / 4));
}
