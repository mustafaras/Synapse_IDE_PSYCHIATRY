


import type { Patient, Encounter, Filter, RegistryState } from "../../registry/types";
import { filterPatients } from "../../registry/state";

export type ScopeKind = "encounter" | "patient" | "cohort" | "empty";

export interface ScopeResult {
  scopeKind: ScopeKind;
  scopeLabel: string;
  encounters?: Encounter[];
  patients?: Patient[];
}


export function getDefaultScopeKind(state: RegistryState): ScopeKind {
  const hasEncounter =
    Boolean(state.selectedEncounterId) ||
    (state.selectedPatientId &&
      Array.isArray(findPatientEncounters(state, state.selectedPatientId)) &&
      findPatientEncounters(state, state.selectedPatientId)!.length > 0);

  if (hasEncounter) return "encounter";
  if (state.selectedPatientId) return "patient";

  const hasPatients = Array.isArray(state.patients) && state.patients.length > 0;
  return hasPatients ? "cohort" : "empty";
}


function findActivePatient(state: RegistryState): Patient | undefined {
  if (!state.selectedPatientId) return undefined;
  return (state.patients || []).find((p) => p.id === state.selectedPatientId);
}


function findPatientEncounters(state: RegistryState, patientId: string): Encounter[] {
  const p = (state.patients || []).find((pt) => pt.id === patientId);
  const arr = (p?.encounters || []).slice();
  arr.sort((a, b) => (b.when ?? 0) - (a.when ?? 0));
  return arr;
}


function describeCohort(state: RegistryState, totalCount: number, filteredCount: number): string {
  const isAll = filteredCount === totalCount;
  if (isAll) return "Cohort: All";
  const f: Filter = state.filter || ({} as any);
  const bits: string[] = [];
  if (f.cohorts && f.cohorts.length && !(f.cohorts.length === 1 && f.cohorts[0] === "All")) bits.push(`Scope:${f.cohorts.join("+")}`);
  if (f.risk && f.risk.length) bits.push(`Risk:${f.risk.join(",")}`);
  if (f.tags && f.tags.length) bits.push(`Tags:${f.tags.join(",")}`);
  const q = (f as any).search;
  if (q && String(q).trim()) bits.push(`Search:“${String(q).trim()}”`);
  return bits.length ? `Cohort: ${bits.join(" • ")}` : "Cohort: Filters active";
}


export function resolveScope(state: RegistryState, scopeKind?: ScopeKind): ScopeResult {
  const kind = scopeKind ?? getDefaultScopeKind(state);

  if (kind === "empty") {
    return { scopeKind: "empty", scopeLabel: "Empty", encounters: [], patients: [] };
  }

  if (kind === "encounter") {

    const patientId = state.selectedPatientId;
    if (!patientId) {
      return { scopeKind: "encounter", scopeLabel: "Encounter: none", encounters: [] };
    }
    const encs = findPatientEncounters(state, patientId);
    let selected: Encounter[] = [];
    if (state.selectedEncounterId) {
      const hit = encs.find((e) => e.id === state.selectedEncounterId);
      if (hit) selected = [hit];
    }
    if (!selected.length && encs.length) selected = [encs[0]];
    const label = selected.length ? "Encounter: 1" : "Encounter: none";
    return { scopeKind: "encounter", scopeLabel: label, encounters: selected };
  }

  if (kind === "patient") {
    const p = findActivePatient(state);
    const label = p ? "Patient: 1" : "Patient: none";
    return { scopeKind: "patient", scopeLabel: label, patients: p ? [p] : [] };
  }


  const all = state.patients || [];
  const filtered = filterPatients(state) || [];
  const label = describeCohort(state, all.length, filtered.length);
  return { scopeKind: "cohort", scopeLabel: label, patients: filtered };
}


export interface ActiveContext {
  kind: ScopeKind;

  encounter?: Encounter;
  patientOfEncounter?: Patient;

  patient?: Patient;

  cohort?: Patient[];

  label: string;
}


export function resolveActiveContext(state: RegistryState): ActiveContext {
  const resolved = resolveScope(state);
  if (resolved.scopeKind === "encounter") {
    const e = (resolved.encounters || [])[0];

    const pId = state.selectedPatientId;
    const owner = pId ? (state.patients || []).find((p) => p.id === pId) : undefined;
    const out: ActiveContext = { kind: "encounter", label: resolved.scopeLabel } as ActiveContext;
    if (e) (out as any).encounter = e;
    if (owner) (out as any).patientOfEncounter = owner;
    return out;
  }
  if (resolved.scopeKind === "patient") {
    const p = (resolved.patients || [])[0];
    const out: ActiveContext = { kind: "patient", label: resolved.scopeLabel } as ActiveContext;
    if (p) (out as any).patient = p;
    return out;
  }
  if (resolved.scopeKind === "cohort") {
    return { kind: "cohort", cohort: resolved.patients || [], label: resolved.scopeLabel };
  }
  return { kind: "empty", label: "Empty" };
}


export function getPatientId(p: Patient): string {
  return (p as any).id ?? "";
}


export function getEncounterId(e: Encounter): string {
  return (e as any).id ?? "";
}


export function getPatientLastEncounterISO(p: Patient): string {
  const encs: Encounter[] = ((p as any).encounters || []).slice().sort((a: any, b: any) => (b.when ?? 0) - (a.when ?? 0));
  const latest = encs[0];
  if (!latest) return "";
  const ts = (latest as any).when;
  if (typeof ts === "number" && isFinite(ts)) return new Date(ts).toISOString();
  const iso = (latest as any).startISO || (latest as any).endISO;
  return typeof iso === "string" ? iso : "";
}


export function getPatientRiskGrade(p: Patient): number {
  const r = (p as any).risk;
  if (r == null) return 0;
  const n = Number(r);
  return Number.isFinite(n) ? n : 0;
}
