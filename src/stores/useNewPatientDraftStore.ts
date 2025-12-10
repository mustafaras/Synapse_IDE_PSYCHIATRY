import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Assessment, AssessmentKind, Encounter, Patient, RiskLevel, Tag } from "../centerpanel/registry/types";


export type NewPatientErrors = {
  demographics?: { name?: string };
  risk?: { grade?: string };
  encounter?: { when?: string };
};

export type SaveOutcome =
  | { ok: true; patient: Patient }
  | { ok: false; errors: NewPatientErrors };

type State = {

  id: string;
  name: string;
  age: string;
  sex: Patient['sex'];

  risk: RiskLevel;

  suicideRisk: string;
  violenceRisk: string;
  capacity: string;
  tags: Tag[];

  encounter: {
    when: string;
    location: string;
    legalStatus: string;
    hpiText: string;
  };

  encs: Encounter[];

  assKind: AssessmentKind;
  assScore: string;
  assWhen: string;
  asses: Assessment[];

  tasks: Array<{
    text: string;
    category: string;
    due: string;
  }>;

  taskDraft: {
    text: string;
    category: string;
    due: string;
    editIndex: number | null;
  };
  hydrated?: boolean;

  newPatientDraftActive: boolean;

  assessmentDraft: {
    kind: string;
    score: string;
    when: string;
    editIndex: number | null;
  };

  newPatientErrors: NewPatientErrors;
};

type Actions = {

  setMrn: (v: string) => void;
  setName: (v: string) => void;
  setAge: (v: string) => void;
  setSex: (v: Patient['sex']) => void;

  setRisk: (r: RiskLevel) => void;
  setSuicideRisk: (level: string) => void;
  setViolenceRisk: (level: string) => void;
  setCapacity: (level: string) => void;
  toggleTag: (t: Tag) => void;

  setEncounterWhen: (v: string) => void;
  setEncounterLocation: (v: string) => void;
  setEncounterLegalStatus: (v: string) => void;
  setEncounterHpiText: (v: string) => void;
  commitEncounterDraft: () => void;

  setAssKind: (k: AssessmentKind) => void;
  setAssScore: (v: string) => void;
  setAssWhen: (v: string) => void;
  addAssessment: () => void;

  setAssessmentDraftField: (
    field: "kind" | "score" | "when",
    value: string
  ) => void;

  commitAssessmentDraft: () => void;

  removeAssessment: (index: number) => void;

  startEditAssessment: (index: number) => void;

  setTaskDraftField: (field: "text" | "category" | "due", value: string) => void;
  startEditTask: (index: number) => void;
  removeTask: (index: number) => void;
  commitTaskDraft: () => void;

  insertIntoEncounterHPI: (snippet: string) => void;

  addTaskFromAI: (taskText: string, category: string, dueHint?: string) => void;

  resetDraft: () => void;
  setNewPatientDraftActive: (active: boolean) => void;
  clearNewPatientDraft: () => void;
  setNewPatientErrors: (e: NewPatientErrors) => void;

  buildPatient: () => Patient;
  canSave: () => boolean;

  finalizeNewPatient: () => SaveOutcome;
};

const initial: State = {
  id: '',
  name: '',
  age: '',
  sex: 'F',
  risk: 3,
  suicideRisk: '',
  violenceRisk: '',
  capacity: '',
  tags: [],
  encounter: {
    when: '',
    location: '',
    legalStatus: '',
    hpiText: '',
  },
  encs: [],
  assKind: 'PHQ9',
  assScore: '',
  assWhen: '',
  asses: [],
  tasks: [],
  taskDraft: {
    text: "",
    category: "",
    due: "",
    editIndex: null,
  },
  hydrated: false,
  newPatientDraftActive: false,
  assessmentDraft: {
    kind: "",
    score: "",
    when: "",
    editIndex: null,
  },
  newPatientErrors: {},
};

function toEpoch(dtLocal: string | undefined): number | undefined {
  if (!dtLocal) return undefined;
  try {
    const d = new Date(dtLocal);
    const t = d.getTime();
    return Number.isFinite(t) ? t : undefined;
  } catch {}
  return undefined;
}

function rid() {
  try {
    const b = globalThis.crypto?.getRandomValues?.(new Uint8Array(8));
    if (b) return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
  } catch {}
  return Math.random().toString(36).slice(2, 10);
}

function validateDraftP8(s: State): NewPatientErrors {
  const errors: NewPatientErrors = {};
  const nameOK = (s.name || '').trim().length > 0;
  const mrnOK = (s.id || '').trim().length > 0;
  if (!nameOK && !mrnOK) {
    errors.demographics = { ...(errors.demographics || {}), name: 'Name or MRN/ID is required.' };
  }

  if (!s.risk) {
    errors.risk = { ...(errors.risk || {}), grade: 'Select one risk grade (1–5).' };
  }
  if (!((s.encounter?.when || '').trim())) {
    errors.encounter = { ...(errors.encounter || {}), when: 'Encounter date/time is required.' };
  }
  return errors;
}

function hasErrorsP8(e: NewPatientErrors): boolean {
  return Boolean(
    (e.demographics && (e.demographics.name)) ||
    (e.risk && e.risk.grade) ||
    (e.encounter && e.encounter.when)
  );
}

export const useNewPatientDraftStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      ...initial,

      setMrn: (v) => set((s) => {
        const next: Partial<State> = { id: v };
        if ((v || '').trim().length > 0 && s.newPatientErrors?.demographics?.name) {
          const e = { ...s.newPatientErrors };
          if (e.demographics) {
            delete e.demographics.name;
            if (Object.keys(e.demographics).length === 0) {
              delete e.demographics;
            }
          }
          next.newPatientErrors = e;
        }
        return next as State;
      }),
      setName: (v) => set((s) => {
        const next: Partial<State> = { name: v };
        if ((v || '').trim().length > 0 && s.newPatientErrors?.demographics?.name) {
          const e = { ...s.newPatientErrors };
          if (e.demographics) {
            delete e.demographics.name;
            if (Object.keys(e.demographics).length === 0) {
              delete e.demographics;
            }
          }
          next.newPatientErrors = e;
        }
        return next as State;
      }),
      setAge: (v) => set({ age: v }),
      setSex: (v) => set({ sex: v }),

      setRisk: (r) => set((s) => {
        const next: Partial<State> = { risk: r };
        if (r && s.newPatientErrors?.risk?.grade) {
          const e = { ...s.newPatientErrors };
          if (e.risk) {
            delete e.risk.grade;
            if (Object.keys(e.risk).length === 0) {
              delete e.risk;
            }
          }
          next.newPatientErrors = e;
        }
        return next as State;
      }),
  setSuicideRisk: (level) => set({ suicideRisk: level }),
  setViolenceRisk: (level) => set({ violenceRisk: level }),
  setCapacity: (level) => set({ capacity: level }),
      toggleTag: (t) => set(s => ({ tags: s.tags.includes(t) ? s.tags.filter(x => x !== t) : [...s.tags, t] })),

      setEncounterWhen: (v) => set((s) => {
        const next: Partial<State> = { encounter: { ...s.encounter, when: v } };
        if ((v || '').trim().length > 0 && s.newPatientErrors?.encounter?.when) {
          const e = { ...s.newPatientErrors };
          if (e.encounter) {
            delete e.encounter.when;
            if (Object.keys(e.encounter).length === 0) {
              delete e.encounter;
            }
          }
          next.newPatientErrors = e;
        }
        return next as State;
      }),
      setEncounterLocation: (v) => set(s => ({ encounter: { ...s.encounter, location: v } })),
      setEncounterLegalStatus: (v) => set(s => ({ encounter: { ...s.encounter, legalStatus: v } })),
      setEncounterHpiText: (v) => set(s => ({ encounter: { ...s.encounter, hpiText: v } })),
      commitEncounterDraft: () => set(s => {
        const e = s.encounter || { when: '', location: '', legalStatus: '', hpiText: '' };
        return {
          encounter: {
            when: (e.when || '').trim(),
            location: (e.location || '').trim(),
            legalStatus: (e.legalStatus || '').trim(),
            hpiText: (e.hpiText || '').trim(),
          }
        } as Partial<State> as State;
      }),

      setAssKind: (k) => set({ assKind: k }),
      setAssScore: (v) => set({ assScore: v }),
      setAssWhen: (v) => set({ assWhen: v }),
      addAssessment: () => set(s => {
        const when = toEpoch(s.assWhen) ?? Date.now();
        const score = Number(s.assScore);
        if (!Number.isFinite(score)) return {} as Partial<State> as State;
        const a: Assessment = { id: rid(), kind: s.assKind, when, score };
        return { asses: [a, ...s.asses], assScore: '', assWhen: '' } as Partial<State> as State;
      }),

      setAssessmentDraftField: (field, value) => set(s => ({ assessmentDraft: { ...s.assessmentDraft, [field]: value } } as Partial<State> as State)),
      commitAssessmentDraft: () => set((s) => {
        const d = s.assessmentDraft || { kind: '', score: '', when: '', editIndex: null };

        const kindRaw = (d.kind || '').trim();
        const kUpper = kindRaw.toUpperCase().replace(/\s+/g, '');
        let kind: Assessment["kind"] | null = null;
        if (kUpper === 'PHQ9' || kUpper === 'PHQ-9') kind = 'PHQ9';
        else if (kUpper === 'GAD7' || kUpper === 'GAD-7') kind = 'GAD7';
        else if (kUpper === 'BFCRS' || kUpper === 'BUSHFRANCIS' || kUpper === 'BUSH-FRANCIS') kind = 'BFCRS';

        const scoreNum = Number((d.score || '').trim());
        if (!kind || !Number.isFinite(scoreNum)) {

          return {} as Partial<State> as State;
        }

        const whenEpoch = toEpoch((d.when || '').trim()) ?? Date.now();

        const list = s.asses ? [...s.asses] : [];
        if (d.editIndex === null || d.editIndex < 0 || d.editIndex >= list.length) {

          const a: Assessment = { id: rid(), kind, score: scoreNum, when: whenEpoch };
          list.push(a);
        } else {

          const prev = list[d.editIndex];
          if (prev) list[d.editIndex] = { ...prev, kind, score: scoreNum, when: whenEpoch };
        }
        return {
          asses: list,
          assessmentDraft: { kind: '', score: '', when: '', editIndex: null },
        } as Partial<State> as State;
      }),
      removeAssessment: (index) => set((s) => {
        const list = s.asses ? [...s.asses] : [];
        if (index < 0 || index >= list.length) return {} as Partial<State> as State;
        list.splice(index, 1);
        const d = s.assessmentDraft;
        if (d && d.editIndex !== null) {
          if (d.editIndex === index) {

            return {
              asses: list,
              assessmentDraft: { kind: '', score: '', when: '', editIndex: null },
            } as Partial<State> as State;
          } else if (d.editIndex > index) {

            return { asses: list, assessmentDraft: { ...d, editIndex: d.editIndex - 1 } } as Partial<State> as State;
          }
        }
        return { asses: list } as Partial<State> as State;
      }),
      startEditAssessment: (index) => set((s) => {
        const entry = s.asses?.[index];
        if (!entry) return {} as Partial<State> as State;

        let whenStr = '';
        try {
          const d = new Date(entry.when);
          if (!Number.isNaN(d.getTime())) {
            const pad = (n: number) => String(n).padStart(2, '0');
            whenStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }
        } catch {}
        return {
          assessmentDraft: {
            kind: String(entry.kind),
            score: String(entry.score ?? ''),
            when: whenStr,
            editIndex: index,
          },
        } as Partial<State> as State;
      }),

      setTaskDraftField: (field, value) => set((s) => ({
        taskDraft: { ...s.taskDraft, [field]: value },
      } as Partial<State> as State)),
      startEditTask: (index) => set((s) => {
        const t = s.tasks?.[index];
        if (!t) return {} as Partial<State> as State;
        return {
          taskDraft: {
            text: t.text || "",
            category: t.category || "",
            due: t.due || "",
            editIndex: index,
          },
        } as Partial<State> as State;
      }),
      removeTask: (index) => set((s) => {
        const list = s.tasks ? [...s.tasks] : [];
        if (index < 0 || index >= list.length) return {} as Partial<State> as State;
        list.splice(index, 1);
        let d = s.taskDraft;
        if (d && d.editIndex !== null) {
          if (d.editIndex === index) {
            d = { text: "", category: "", due: "", editIndex: null };
          } else if (d.editIndex > index) {
            d = { ...d, editIndex: d.editIndex - 1 };
          }
        }
        return { tasks: list, taskDraft: d } as Partial<State> as State;
      }),
      commitTaskDraft: () => set((s) => {
        const d = s.taskDraft || { text: "", category: "", due: "", editIndex: null };
        const text = (d.text || "").trim();
        const category = (d.category || "").trim();
        const due = (d.due || "").trim();
        const list = s.tasks ? [...s.tasks] : [];
        if (d.editIndex === null || d.editIndex < 0 || d.editIndex >= list.length) {
          list.push({ text, category, due });
        } else {
          list[d.editIndex] = { text, category, due };
        }
        return {
          tasks: list,
          taskDraft: { text: "", category: "", due: "", editIndex: null },
        } as Partial<State> as State;
      }),

      insertIntoEncounterHPI: (snippet) => set((s) => {
        const existing = s.encounter?.hpiText || "";
        const needsGap = existing.trim().length > 0 ? "\n\n" : "";
        return {
          encounter: {
            ...s.encounter,
            hpiText: (existing + needsGap + String(snippet ?? '').trim()),
          },
        } as Partial<State> as State;
      }),
      addTaskFromAI: (taskText, category, dueHint) => set((s) => {
        const list = s.tasks ? [...s.tasks] : [];
        list.push({
          text: String(taskText ?? '').trim(),
          category: String(category ?? '').trim(),
          due: String(dueHint ?? '').trim(),
        });
        return { tasks: list } as Partial<State> as State;
      }),

  resetDraft: () => set(s => ({ ...initial, hydrated: s.hydrated, newPatientDraftActive: s.newPatientDraftActive } as State)),
  setNewPatientDraftActive: (active) => set({ newPatientDraftActive: active }),
  clearNewPatientDraft: () => set((s) => ({
    ...initial,
    hydrated: s.hydrated,
    newPatientDraftActive: s.newPatientDraftActive,
  } as State)),
  setNewPatientErrors: (e) => set({ newPatientErrors: e }),

      buildPatient: () => {
        const s = get();
        const ageNum = s.age ? Number(s.age) : undefined;
        const base: Patient = {
          id: (s.id || rid()).trim(),
          risk: s.risk,
          tags: s.tags,
          assessments: s.asses,
          encounters: s.encs,
          ...(s.name ? { name: s.name } : {}),
          ...(Number.isFinite(ageNum as number) ? { age: ageNum as number } : {}),
          ...(s.sex ? { sex: s.sex } : {}),

        };
        return base;
      },
      canSave: () => {
        const s = get();
        return Boolean((s.id || '').trim() || (s.name || '').trim());
      },
      finalizeNewPatient: (): SaveOutcome => {
        const s = get();
        const errs = validateDraftP8(s);
        set({ newPatientErrors: errs });
        if (hasErrorsP8(errs)) return { ok: false, errors: errs };

        const now = Date.now();
        const patientId = (s.id || rid()).trim();
        const whenEpoch = toEpoch(s.encounter?.when) ?? now;

        const locRaw = (s.encounter?.location || '').toUpperCase();
        const location = locRaw === 'ED' ? 'ED' : locRaw === 'INPATIENT' ? 'Inpatient' : 'OPD';

        const encounter0: Encounter = {
          id: `enc_${rid()}`,
          when: whenEpoch,
          location: (location as 'ED' | 'Inpatient' | 'OPD'),
          noteSlots: { summary: (s.encounter?.hpiText || '').trim() },
        } as unknown as Encounter;


        const assessmentsWithEncounterId = (s.asses || []).map(a => ({
          ...a,
          encounterId: encounter0.id,
        }));


        const tasks: Patient['tasks'] = (s.tasks || []).map((t) => {
          const dueMs = toEpoch(t.due);
          const label = t.category ? `[${t.category}] ${t.text}` : t.text;
          return {
            id: `task_${rid()}`,
            label,
            createdAt: now,
            ...(dueMs ? { due: dueMs } : {}),
            done: false,
          };
        });

        const ageNum = s.age ? Number(s.age) : undefined;
        const patient: Patient = {
          id: patientId,
          ...(s.name ? { name: s.name } : {}),
          ...(Number.isFinite(ageNum as number) ? { age: ageNum as number } : {}),
          ...(s.sex ? { sex: s.sex } : {}),
          risk: s.risk,
          tags: s.tags,
          assessments: assessmentsWithEncounterId,
          encounters: [encounter0],
          ...(tasks.length ? { tasks } : {}),
        } as Patient;


        set({ newPatientErrors: {} });
        return { ok: true, patient };
      },
    }),
    {
      name: 'synapse.newpatient.draft.v1',
      version: 3,
      migrate: (persistedState: unknown, version: number) => {

        interface LegacyV1State extends Partial<State> {
          encWhen?: string;
          encLocation?: string;
          encSummary?: string;
          encPlan?: string;
        }

        interface LegacyV2Task {
          label?: string;
          due?: number;
        }


        interface LegacyV2State {
          tasks?: LegacyV2Task[];
          taskLabel?: string;
          taskDue?: string;
        }


        if (version === 1 && persistedState && typeof persistedState === 'object') {
          const s = persistedState as LegacyV1State;
          const encounter = {
            when: (s.encWhen ?? '') as string,
            location: (s.encLocation ?? '') as string,
            legalStatus: '',
            hpiText: [s.encSummary, s.encPlan].filter(Boolean).join(' ').trim(),
          };
          const out: LegacyV1State = { ...s, encounter };
          delete out.encWhen;
          delete out.encLocation;
          delete out.encSummary;
          delete out.encPlan;
          return out;
        }

        if (version === 2 && persistedState && typeof persistedState === 'object') {
          const s = persistedState as LegacyV2State;
          const legacyTasks: LegacyV2Task[] = Array.isArray(s.tasks) ? s.tasks : [];
          const newTasks = legacyTasks.map((t) => {
            const text = (t?.label ?? '').toString();

            let due = '';
            try {
              const d = typeof t?.due === 'number' ? new Date(t.due) : null;
              if (d && !Number.isNaN(d.getTime())) {
                const pad = (n: number) => String(n).padStart(2, '0');
                due = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
              }
            } catch {  }
            return { text, category: '', due };
          });
          const out = { ...s, tasks: newTasks, taskDraft: { text: '', category: '', due: '', editIndex: null } };

          delete out.taskLabel;
          delete out.taskDue;
          return out;
        }
        return persistedState as Partial<State>;
      },
      onRehydrateStorage: () => (_state) => {
        try {

          useNewPatientDraftStore.setState({ hydrated: true });
        } catch {}
      },
      partialize: (s) => {

        const { hydrated, newPatientDraftActive, ...rest } = s as State;

        void hydrated; void newPatientDraftActive;
        return rest as unknown as State;
      },
    }
  )
);


export type NewPatientDraftSelector<T> = (s: State & Actions) => T;


export const selectEncounter: NewPatientDraftSelector<State['encounter']> = (s) => s.encounter;


export const selectDemographics: NewPatientDraftSelector<{ age: string; sex: string; name: string }> = (s) => ({
  age: s.age,
  sex: String(s.sex || ""),
  name: s.name,
});


export const selectRiskView: NewPatientDraftSelector<{ suicideRisk: string; violenceRisk: string; capacity: string }> = (s) => ({
  suicideRisk: s.suicideRisk,
  violenceRisk: s.violenceRisk,
  capacity: s.capacity,
});


export const selectTasks: NewPatientDraftSelector<State['tasks']> = (s) => s.tasks;
