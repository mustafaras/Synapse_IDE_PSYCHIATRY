import type { Assessment, Encounter, Patient } from "./types";


function makeRng(seed = Date.now() >>> 0) {
  let s = seed || 1;
  return function rand() {

    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;

    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function pick<T>(arr: T[], r: () => number) { return arr[Math.floor(r() * arr.length)]; }


const SUMMARY_LINES = [
  "Brief course with current presentation summarized succinctly.",
  "Patient engaged and oriented; mood and affect described.",
  "Key active problems and acute risks reviewed with team.",
  "Functional status and social context noted; collateral if relevant.",
];

const PLAN_LINES = [
  "Continue current medications; assess efficacy and adverse effects.",
  "Safety planning discussed; crisis resources reviewed.",
  "Therapy referral and psychoeducation; encourage adherence.",
  "Coordinate with outpatient providers and family as appropriate.",
];

const OUTCOME_LINES = [
  "Patient demonstrates understanding of recommendations and agrees to plan.",
  "No imminent risk identified; protective factors reinforced.",
  "Return precautions reviewed; follow-up timeframe specified.",
  "Questions addressed; patient verbalizes teach-back of key points.",
];

const REF_LINES = [
  "Kroenke K, Spitzer RL. J Gen Intern Med. 2001;16(9):606-613.",
  "Spitzer RL et al. Arch Intern Med. 2006;166(10):1092-1097.",
  "Bush G et al. Acta Psychiatr Scand. 1996;93(2):129-136.",
];

export type DemoNoteSlots = {
  summary: string;
  plan: string;
  vitals: string;
  outcome: string;
  refs: string;
  refsList?: string[];
};

export function buildDemoNoteSlots(seed?: number): DemoNoteSlots {
  const rng = makeRng((seed ?? Date.now()) >>> 0);
  const lines = (src: string[]) => Array.from({ length: 3 }, () => pick(src, rng)).join(" ");
  const vitals = `BP ${110 + Math.floor(rng()*30)}/${70 + Math.floor(rng()*15)}, HR ${60 + Math.floor(rng()*30)}, afebrile.`;
  const refsList = [pick(REF_LINES, rng), pick(REF_LINES, rng)];
  return {
    summary: lines(SUMMARY_LINES),
    plan: lines(PLAN_LINES),
    vitals,
    outcome: lines(OUTCOME_LINES),
    refs: refsList.join("\n"),
    refsList,
  };
}

export function generateAssessments(seed: number, when = Date.now()): Assessment[] {
  const rng = makeRng(seed >>> 0);
  const mk = (kind: Assessment["kind"], max: number): Assessment => ({
    id: `asmt_${Math.random().toString(36).slice(2, 10)}`,
    kind,
    when,
    score: Math.max(0, Math.min(max, Math.floor(rng() * (max + 1))))
  });
  return [mk("PHQ9", 27), mk("GAD7", 21), mk("BFCRS", 42)];
}

function lastEncounter(p: Patient): Encounter | undefined {
  return (p.encounters || []).slice().sort((a,b)=>b.when-a.when)[0];
}


export function withDemoNotesAndAssessments(p: Patient, seed?: number): { patient: Patient; addedAssessments: Assessment[] } {
  const slots = buildDemoNoteSlots(((seed ?? 0) + (Number(p.id.replace(/\D/g, "")) || 0)) >>> 0);
  const addedAssess: Assessment[] = generateAssessments(((seed ?? 0) + 137) >>> 0);
  const enc = lastEncounter(p);
  const encounters = (p.encounters || []).map(e => e.id === enc?.id ? ({ ...e, noteSlots: { ...(e.noteSlots || {}), ...slots } }) : e);
  const patient: Patient = { ...p, encounters };
  return { patient, addedAssessments: addedAssess };
}


export function toMarkdownSnapshot(p: Patient): string {
  const enc = lastEncounter(p);
  const s = enc?.noteSlots || {} as any;
  const head = `${p.name ?? "Anon"} • ${p.id}  \n${p.age ? p.age + "y" : "—"} / ${p.sex ?? "—"}`;
  return [
    `# Clinical Note\n`,
    head, "\n",
    `## SUMMARY\n`, s.summary || "—", "\n\n",
    `## PLAN\n`, s.plan || "—", "\n\n",
    `## VITALS / RESULTS\n`, s.vitals || "—", "\n\n",
    `## OUTCOME\n`, s.outcome || "—", "\n\n",
    `## REFERENCES (APA)\n`, (s.refsList && Array.isArray(s.refsList) ? s.refsList.join("\n") : (s.refs || "—")), "\n",
  ].join("");
}
