
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import type {
  Assessment,
  AssessmentKind,
  Encounter,
  Filter,
  Patient,
  RegistryState,
  ScoreDelta,
} from "./types";
import { randomizePatientsEN, seedPatients } from "./demo";
import { withDemoNotesAndAssessments } from "./demoGenerate";
import { persistLoad, persistSave } from "../lib/persist";


function summarizePreview(text: string, n = 120): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length <= n ? t : `${t.slice(0, n - 1)}…`;
}

type Action =
  | { type: "loadSeed"; patients: Patient[] }
  | { type: "randomizeEN" }
  | { type: "populateDemoEN" }
  | { type: "setFilter"; patch: Partial<Filter> }
  | { type: "selectPatient"; id?: string }
  | { type: "selectEncounter"; id?: string }
  | { type: "addEncounter"; patientId: string; encounter: Encounter }
  | { type: "addPatient"; patient: Patient }
  | { type: "deletePatient"; patientId: string }
  | { type: "toggleTask"; patientId: string; taskId: string }
  | { type: "recordAssessment"; patientId: string; assessment: Assessment }
  | { type: "setEncounterSlots"; patientId: string; encounterId: string; slots: import("../tabs/Note").NoteSlots }

  | { type: "createEncounterSnapshot"; patientId: string; encounterId: string; slots?: import("../tabs/Note").NoteSlots }

  | { type: "appendSafetyOutcomeToNote"; patientId: string; encounterId: string; paragraph: string }

  | { type: "appendFlowOutcomeAtSelection"; flowId: string; label: string; paragraph: string }

  | { type: "appendCapacityOutcomeToNote"; patientId: string; encounterId: string; paragraph: string }

  | { type: "appendCatatoniaOutcomeToNote"; patientId: string; encounterId: string; paragraph: string }

  | { type: "appendObservationOutcomeToNote"; patientId: string; encounterId: string; paragraph: string }

  | { type: "appendAgitationOutcomeToNote"; patientId: string; encounterId: string; paragraph: string }

  | { type: "addEncounterSessionMs"; patientId: string; encounterId: string; deltaMs: number }
  | { type: "setEncounterSessionMs"; patientId: string; encounterId: string; totalMs: number };

const INITIAL: RegistryState = {
  patients: [],
  filter: { cohorts: ["All"] },
  version: 1,
};

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

function reducer(state: RegistryState, action: Action): RegistryState {
  switch (action.type) {
    case "loadSeed": {
      const next = clone(state);

      next.patients = clone(action.patients).map((p: any) => ({
        ...p,
        encounters: (p.encounters || []).map((enc: any) => normalizeEncounter(enc)),
      }));
      next.selectedPatientId = next.patients[0]?.id;
      next.selectedEncounterId = next.patients[0]?.encounters[0]?.id;
      return next;
    }
    case "setFilter": {
      return { ...state, filter: { ...state.filter, ...action.patch } };
    }
    case "randomizeEN": {
      const next = clone(state);
      next.patients = randomizePatientsEN(next.patients);

      const has = next.patients.find(p => p.id === state.selectedPatientId);
      if (!has) {
        next.selectedPatientId = next.patients[0]?.id;
        next.selectedEncounterId = next.patients[0]?.encounters[0]?.id;
      }
      return next;
    }
    case "populateDemoEN": {
      const next = clone(state);
      const baseSeed = Date.now() >>> 0;
      next.patients = next.patients.map((p, idx) => {
        const { patient: pp, addedAssessments } = withDemoNotesAndAssessments(p, baseSeed + idx);
        const latest = (pp.encounters || []).slice().sort((a,b)=>b.when-a.when)[0];
        if (latest) {
          const enc = (pp.encounters || []).find(e => e.id === latest.id);
          if (enc) {

            enc.noteSlots = { ...(enc.noteSlots || {}), ...latest.noteSlots } as any;
          }
        }
        const asses = Array.isArray(pp.assessments) ? pp.assessments.slice() : [];
        addedAssessments.forEach(a => asses.push(a));
        return { ...pp, assessments: asses } as Patient;
      });
      return next;
    }
    case "selectPatient": {
      const next: RegistryState & Record<string, any> = { ...state } as any;
      if (action.id !== undefined) next.selectedPatientId = action.id; else delete next.selectedPatientId;
      delete next.selectedEncounterId;
      return next as RegistryState;
    }
    case "selectEncounter": {
      const next: RegistryState & Record<string, any> = { ...state } as any;
      if (action.id !== undefined) next.selectedEncounterId = action.id; else delete next.selectedEncounterId;
      return next as RegistryState;
    }
    case "addEncounter": {
      const next = clone(state);
      const p = next.patients.find((x) => x.id === action.patientId);
      if (p) {

        const enc: any = normalizeEncounter(action.encounter as any);
        p.encounters.unshift(enc as Encounter);
        next.selectedPatientId = p.id;
        next.selectedEncounterId = enc.id;
      }
      return next;
    }
    case "addPatient": {
      const next = clone(state);

      next.patients = [clone(action.patient), ...next.patients];
      next.selectedPatientId = action.patient.id;
      next.selectedEncounterId = action.patient.encounters[0]?.id;
      return next;
    }
    case "deletePatient": {
      const next = clone(state);
      next.patients = next.patients.filter(p => p.id !== action.patientId);
      if (next.selectedPatientId === action.patientId) {
        delete (next as any).selectedPatientId;
        delete (next as any).selectedEncounterId;
      }
      return next;
    }
    case "toggleTask": {
      const next = clone(state);
      const p = next.patients.find((x) => x.id === action.patientId);
      const t = p?.tasks?.find((k) => k.id === action.taskId);
      if (t) t.done = !t.done;
      return next;
    }
    case "recordAssessment": {
      const next = clone(state);
      const p = next.patients.find((x) => x.id === action.patientId);
      if (p) p.assessments.push(action.assessment);
      return next;
    }
    case "setEncounterSlots": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId);
      if (enc) {
        enc.noteSlots = { ...(enc.noteSlots || {}), ...action.slots } as any;

        (enc as any).snapshots = Array.isArray((enc as any).snapshots) ? (enc as any).snapshots : [];
      }
      return next;
    }
    case "addEncounterSessionMs": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {
        const prev = typeof enc.sessionMsTotal === "number" ? enc.sessionMsTotal : 0;
        enc.sessionMsTotal = Math.max(0, prev + Math.max(0, action.deltaMs));
      }
      return next;
    }
    case "setEncounterSessionMs": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {
        enc.sessionMsTotal = Math.max(0, Math.floor(action.totalMs));
      }
      return next;
    }
    case "appendSafetyOutcomeToNote": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {

        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots & { outcomes?: Array<{flowId:string; insertedAt:number; paragraph:string}>; refsList?: string[] };
        const prevOutcome = String(slots.outcome ?? "");
        const add = String(action.paragraph ?? "").trim();
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = "Acute Safety / Suicide Risk Review documented this encounter.";
        const prevRefs = String(slots.refs ?? "");
        const hasRef = prevRefs.includes(refLine);
        if (!hasRef) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }


        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes("safety")) enc.completedFlows.push("safety");


        const nowMs = Date.now();
        const runId = `safety-${nowMs}`;
        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        enc.completedRuns.push({
          runId,
          flowId: "safety",
          label: "Safety Review",
          insertedAt: nowMs,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });

  slots.outcomes = Array.isArray(slots.outcomes) ? slots.outcomes : [];
  slots.outcomes.push({ flowId: "safety", insertedAt: nowMs, paragraph: add });
  slots.refsList = Array.isArray(slots.refsList) ? slots.refsList : [];
  if (!slots.refsList.includes(refLine)) slots.refsList.push(refLine);

        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
      }
      return next;
    }
    case "appendFlowOutcomeAtSelection": {
      const next = clone(state);
      const pid = next.selectedPatientId;
      const eid = next.selectedEncounterId;
      if (!pid || !eid) return state;
      const p = next.patients.find(x => x.id === pid);
      const enc = p?.encounters.find(e => e.id === eid) as any;
      if (enc) {
        const now = Date.now();
        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots & { outcomes?: Array<{flowId:string; insertedAt:number; paragraph:string}>; refsList?: string[] };
        const add = String(action.paragraph ?? "").trim();

        const prevOutcome = String(slots.outcome ?? "");
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = action.flowId === "safety"
          ? "Acute Safety / Suicide Risk Review documented this encounter."
          : `${action.label} documented this encounter.`;
        const prevRefs = String(slots.refs ?? "");
        if (!prevRefs.includes(refLine)) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }

        slots.outcomes = Array.isArray(slots.outcomes) ? slots.outcomes : [];
        slots.outcomes.push({ flowId: action.flowId, insertedAt: now, paragraph: add });
        slots.refsList = Array.isArray(slots.refsList) ? slots.refsList : [];
        if (!slots.refsList.includes(refLine)) slots.refsList.push(refLine);


        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes(action.flowId)) enc.completedFlows.push(action.flowId);
        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        const runId = `${action.flowId}-${now}`;
        enc.completedRuns.push({
          runId,
          flowId: action.flowId,
          label: action.label,
          insertedAt: now,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });
      }
      return next;
    }
    case "appendCapacityOutcomeToNote": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {

        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots;
        const prevOutcome = String(slots.outcome ?? "");
        const add = String(action.paragraph ?? "").trim();
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = "Capacity & Consent Check documented this encounter.";
        const prevRefs = String(slots.refs ?? "");
        const hasRef = prevRefs.includes(refLine);
        if (!hasRef) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }


        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes("capacity")) enc.completedFlows.push("capacity");


        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        const nowMs = Date.now();
        const runId = `capacity-${nowMs}`;
        enc.completedRuns.push({
          runId,
          flowId: "capacity",
          label: "Capacity & Consent Check",
          insertedAt: nowMs,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });

        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
      }
      return next;
    }
    case "appendCatatoniaOutcomeToNote": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {
        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots;
        const prevOutcome = String(slots.outcome ?? "");
        const add = String(action.paragraph ?? "").trim();
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = "Catatonia (BFCRS) / Lorazepam Challenge documented this encounter.";
        const prevRefs = String(slots.refs ?? "");
        const hasRef = prevRefs.includes(refLine);
        if (!hasRef) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }

        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes("catatonia")) enc.completedFlows.push("catatonia");

        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        const nowMs = Date.now();
        const runId = `catatonia-${nowMs}`;
        enc.completedRuns.push({
          runId,
          flowId: "catatonia",
          label: "Catatonia (BFCRS) / Lorazepam Challenge",
          insertedAt: nowMs,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });
        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
      }
      return next;
    }
    case "appendObservationOutcomeToNote": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {
        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots;
        const prevOutcome = String(slots.outcome ?? "");
        const add = String(action.paragraph ?? "").trim();
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = "Observation / Containment Justification documented this encounter.";
        const prevRefs = String(slots.refs ?? "");
        const hasRef = prevRefs.includes(refLine);
        if (!hasRef) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }

        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes("observation")) enc.completedFlows.push("observation");

        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        const nowMs = Date.now();
        const runId = `observation-${nowMs}`;
        enc.completedRuns.push({
          runId,
          flowId: "observation",
          label: "Observation / Containment Justification",
          insertedAt: nowMs,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });
        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
      }
      return next;
    }
    case "appendAgitationOutcomeToNote": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {

        enc.noteSlots = enc.noteSlots || {};
        const slots = enc.noteSlots as import("../tabs/Note").NoteSlots;
        const prevOutcome = String(slots.outcome ?? "");
        const add = String(action.paragraph ?? "").trim();
        const sep = prevOutcome ? "\n\n" : "";
        slots.outcome = prevOutcome + (add ? sep + add : "");

        const refLine = "Agitation / Behavioral Emergency documented this encounter.";
        const prevRefs = String(slots.refs ?? "");
        const hasRef = prevRefs.includes(refLine);
        if (!hasRef) {
          const refSep = prevRefs ? "\n" : "";
          slots.refs = prevRefs + refSep + refLine;
        }


        enc.completedFlows = Array.isArray(enc.completedFlows) ? enc.completedFlows : [];
        if (!enc.completedFlows.includes("agitation")) enc.completedFlows.push("agitation");


        enc.completedRuns = Array.isArray(enc.completedRuns) ? enc.completedRuns : [];
        const nowMs = Date.now();
        const runId = `agitation-${nowMs}`;
        enc.completedRuns.push({
          runId,
          flowId: "agitation",
          label: "Agitation / Behavioral Emergency",
          insertedAt: nowMs,
          paragraph: add,
          paragraphFull: add,
          paragraphPreview: summarizePreview(add),
        });

        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
      }
      return next;
    }
    case "createEncounterSnapshot": {
      const next = clone(state);
      const p = next.patients.find(x => x.id === action.patientId);
      const enc = p?.encounters.find(e => e.id === action.encounterId) as any;
      if (enc) {
        const now = Date.now();
        const id = `snap-${action.encounterId}-${now}`;
        const base: import("../tabs/Note").NoteSlots = enc.noteSlots ?? { summary:"", plan:"", refs:"", outcome:"", vitals:"" };
        const snapSlots: import("../tabs/Note").NoteSlots = action.slots ?? base;
        enc.snapshots = Array.isArray(enc.snapshots) ? enc.snapshots : [];
        enc.snapshots.push({ id, when: now, slots: snapSlots });
      }
      return next;
    }
    default:
      return state;
  }
}


function loadFromPersist(): Patient[] | undefined {
  try {
    const blob = persistLoad();
    const reg = (blob as any)?.registry;
    if (reg && Array.isArray(reg.patients)) return reg.patients as Patient[];
  } catch {}
  return undefined;
}

function saveToPersist(patients: Patient[]) {
  const blob = persistLoad();
  (blob as any).registry = { patients };
  persistSave(blob);
}


function normalizeEncounter(enc: any): any {
  const e = { ...enc };
  e.snapshots = Array.isArray(e.snapshots) ? e.snapshots : [];

  e.completedRuns = Array.isArray(e.completedRuns) ? e.completedRuns : [];

  e.sessionMsTotal = typeof e.sessionMsTotal === "number" && isFinite(e.sessionMsTotal) ? e.sessionMsTotal : 0;

  const baseFlags = {
    seclusionLikeContainment: false,
    continuousOneToOne: false,
    behavioralContainmentActive: false,
    constantObservationActive: false,
    secureRoomInUse: false,
    violentSelfHarmAttempt: false,
    violentAssaultAttempt: false,
    recentSelfHarmDisclosure: false,
    safetyConcernsRaised: false,
    agitationEpisodeActive: false,
    securityInvolved: false,
    deescalationAttemptsMade: false,
    catatoniaObserved: false,
    lorazepamChallengeDiscussed: false,
    refusalOfRecommendedCare: false,
    attemptingToLeaveAMA: false,
    questionableCapacityForDecision: false,
    highMedicalRiskIfRefuses: false,
  } as const;
  e.flags = { ...baseFlags, ...(e.flags || {}) };

  e.completedFlows = Array.isArray(e.completedFlows) ? e.completedFlows : [];
  return e;
}


export function selectPatientById(state: RegistryState, id?: string) {
  return id ? state.patients.find((p) => p.id === id) : undefined;
}

export function selectLastTwoScores(
  p: Patient | undefined,
  kind: AssessmentKind
): ScoreDelta {

  const list: Assessment[] = Array.isArray((p as any)?.assessments)
    ? ((p as any).assessments as Assessment[])
    : [];
  const arr = list
    .filter((a) => a && a.kind === kind)
    .sort((a, b) => (b.when ?? 0) - (a.when ?? 0));
  const latest = arr[0]?.score;
  const previous = arr[1]?.score;
  const out: any = { kind, latest, previous };
  if (typeof latest === "number" && typeof previous === "number") out.delta = latest - previous;
  return out as ScoreDelta;
}

export function filterPatients(state: RegistryState): Patient[] {
  const { filter } = state;
  const q = (filter.search ?? "").trim().toLowerCase();
  return state.patients.filter((p) => {
    const byRisk = !filter.risk?.length || filter.risk.includes(p.risk);
    const byTag = !filter.tags?.length || filter.tags.some((t) => p.tags.includes(t));
    const bySearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      (p.name ?? "").toLowerCase().includes(q);
    return byRisk && byTag && bySearch;
  });
}


interface Ctx {
  state: RegistryState;
  dispatch: React.Dispatch<Action>;
  actions: {
    setFilter(patch: Partial<Filter>): void;
    selectPatient(id?: string): void;
    selectEncounter(id?: string): void;
    addEncounter(patientId: string, encounter: Encounter): void;
    addPatient(patient: Patient): void;
    deletePatient(patientId: string): void;
    toggleTask(patientId: string, taskId: string): void;
    recordAssessment(patientId: string, assessment: Assessment): void;
    setEncounterSlots(patientId: string, encounterId: string, slots: import("../tabs/Note").NoteSlots): void;
    appendSafetyOutcomeToNote(patientId: string, encounterId: string, paragraph: string): void;
    appendCapacityOutcomeToNote(patientId: string, encounterId: string, paragraph: string): void;
    appendCatatoniaOutcomeToNote(patientId: string, encounterId: string, paragraph: string): void;
    appendObservationOutcomeToNote(patientId: string, encounterId: string, paragraph: string): void;
    appendAgitationOutcomeToNote(patientId: string, encounterId: string, paragraph: string): void;

  appendFlowOutcome(flowId: string, label: string, paragraph: string): void;

    addEncounterSessionMs(patientId: string, encounterId: string, deltaMs: number): void;
    setEncounterSessionMs(patientId: string, encounterId: string, totalMs: number): void;

    createEncounterSnapshot(patientId: string, encounterId: string, slots?: import("../tabs/Note").NoteSlots): { id: string; when: number } | void;

    randomizeEN(): void;

    populateDemoEN(): void;
  };
}


const REGISTRY_CTX_KEY = "__CCOPILOT_REGISTRY_CONTEXT__" as const;
type GlobalWithRegistryCtx = typeof globalThis & {
  [REGISTRY_CTX_KEY]?: React.Context<Ctx | null>;
};
const g = globalThis as GlobalWithRegistryCtx;
const RegistryContext = g[REGISTRY_CTX_KEY] ?? createContext<Ctx | null>(null);

g[REGISTRY_CTX_KEY] = RegistryContext;

export function RegistryProvider({ children }: { children: ReactNode }) {

  const [state, dispatch] = useReducer(
    reducer,
    undefined as unknown as RegistryState,
    () => {
      let patients = loadFromPersist() ?? [];
      if (!patients || patients.length === 0) {
        try {
          const seeded = seedPatients();
          saveToPersist(seeded);
          patients = seeded;

          console.info(`[Registry] Seeded ${patients.length} demo patients (lazy init)`);
        } catch {
          patients = [];
        }
      }
      const firstPatient = patients[0];
      const mostRecentEncounterId = firstPatient?.encounters && firstPatient.encounters.length
        ? [...firstPatient.encounters].sort((a, b) => (b.when ?? 0) - (a.when ?? 0))[0]?.id
        : undefined;
      return {
        ...INITIAL,
        patients,
        selectedPatientId: firstPatient?.id,
        selectedEncounterId: mostRecentEncounterId,
      } as RegistryState;
    }
  );


  useEffect(() => {
    saveToPersist(state.patients);
  }, [state.patients]);

  const actions: Ctx["actions"] = useMemo(
    () => ({
      setFilter(patch) { dispatch({ type: "setFilter", patch }); },
  selectPatient(id) { dispatch(id !== undefined ? { type: "selectPatient", id } : { type: "selectPatient" }); },
  selectEncounter(id) { dispatch(id !== undefined ? { type: "selectEncounter", id } : { type: "selectEncounter" }); },
      addEncounter(patientId, encounter) { dispatch({ type: "addEncounter", patientId, encounter }); },
      addPatient(patient) { dispatch({ type: "addPatient", patient }); },
      deletePatient(patientId) { dispatch({ type: "deletePatient", patientId }); },
      toggleTask(patientId, taskId) { dispatch({ type: "toggleTask", patientId, taskId }); },
      recordAssessment(patientId, assessment) { dispatch({ type: "recordAssessment", patientId, assessment }); },
      setEncounterSlots(patientId, encounterId, slots) { dispatch({ type: "setEncounterSlots", patientId, encounterId, slots }); },
  appendSafetyOutcomeToNote(patientId: string, encounterId: string, paragraph: string) { dispatch({ type: "appendSafetyOutcomeToNote", patientId, encounterId, paragraph }); },
    appendCapacityOutcomeToNote(patientId: string, encounterId: string, paragraph: string) { dispatch({ type: "appendCapacityOutcomeToNote", patientId, encounterId, paragraph }); },
    appendCatatoniaOutcomeToNote(patientId: string, encounterId: string, paragraph: string) { dispatch({ type: "appendCatatoniaOutcomeToNote", patientId, encounterId, paragraph }); },
    appendObservationOutcomeToNote(patientId: string, encounterId: string, paragraph: string) { dispatch({ type: "appendObservationOutcomeToNote", patientId, encounterId, paragraph }); },
  appendAgitationOutcomeToNote(patientId: string, encounterId: string, paragraph: string) { dispatch({ type: "appendAgitationOutcomeToNote", patientId, encounterId, paragraph }); },
  appendFlowOutcome(flowId: string, label: string, paragraph: string) { dispatch({ type: "appendFlowOutcomeAtSelection", flowId, label, paragraph }); },
    addEncounterSessionMs(patientId, encounterId, deltaMs) { dispatch({ type: "addEncounterSessionMs", patientId, encounterId, deltaMs }); },
    setEncounterSessionMs(patientId, encounterId, totalMs) { dispatch({ type: "setEncounterSessionMs", patientId, encounterId, totalMs }); },
      createEncounterSnapshot(patientId, encounterId, slots) {
        const now = Date.now();
        const id = `snap-${encounterId}-${now}`;
        const action: Action = slots
          ? { type: "createEncounterSnapshot", patientId, encounterId, slots }
          : { type: "createEncounterSnapshot", patientId, encounterId };
        dispatch(action);
        return { id, when: now };
      },
      randomizeEN() {
        dispatch({ type: "randomizeEN" });
      },
      populateDemoEN() {
        dispatch({ type: "populateDemoEN" });
      },
    }),
    []
  );

  const value = useMemo<Ctx>(() => ({ state, dispatch, actions }), [state, actions]);
  return React.createElement(RegistryContext.Provider, { value }, children);
}

export function useRegistry(): Ctx {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error("useRegistry must be used within <RegistryProvider>");
  return ctx;
}


export function useRegistryOptional(): Ctx | null {
  try {
    return useContext(RegistryContext);
  } catch {
    return null;
  }
}


export function ensureSeed(): void {
  const existing = loadFromPersist();
  if (!existing || existing.length === 0) {
    const seeded = seedPatients();
    saveToPersist(seeded);

    console.info(`[Registry] Seeded ${seeded.length} demo patients`);
  }
}


export function useAutoPopulateDemoOnce() {
  const { actions } = useRegistry();
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const demo = sp.get('demo');
      if (demo === '1' || demo === 'auto' || demo === 'en') {
        actions.populateDemoEN();
      }
    } catch {}
  }, [actions]);
}
