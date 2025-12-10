import type { Assessment, Encounter, Patient, RiskLevel, Tag, Task } from "./types";

const now = Date.now();
const days = (n: number) => n * 24 * 60 * 60 * 1000;

function mkId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function assess(
  kind: "PHQ9" | "GAD7" | "BFCRS",
  when: number,
  score: number
): Assessment {
  return { id: mkId("asmt"), kind, when, score };
}

function encounter(when: number, location: "ED" | "Inpatient" | "OPD"): Encounter {
  return { id: mkId("enc"), when, location, noteSlots: {} };
}

function task(label: string, due?: number): Task {
  const t: Task = { id: mkId("task"), label, createdAt: now - days(1), done: false };
  if (typeof due === "number") t.due = due;
  return t;
}

function patient(
  id: string,
  name: string,
  age: number,
  sex: "F" | "M" | "X",
  risk: RiskLevel,
  tags: Tag[],
  asmt: Assessment[],
  encs: Encounter[],
  tasksIn?: Task[]
): Patient {
  return {
    id,
    name,
    age,
    sex,
    risk,
    tags,
    assessments: asmt,
    encounters: encs,
    tasks: tasksIn ?? [],
  };
}

export function seedPatients(): Patient[] {

  const p1 = patient(
    "A1001",
    "A. Demir",
    34,
    "F",
    3,
    ["Trauma"],
    [
      assess("PHQ9", now - days(28), 18),
      assess("PHQ9", now - days(7), 12),
      assess("GAD7", now - days(28), 14),
      assess("GAD7", now - days(7), 9),
    ],
    [encounter(now - days(30), "OPD"), encounter(now - days(3), "OPD")],
    [task("Call back family", now + days(2))]
  );


  try {
    const encs = p1.encounters;
    const recent = encs && encs.length ? encs[encs.length - 1] as Encounter : undefined;
    if (recent) {
      const t1 = now - 8 * 60 * 1000;
      const t2 = now - 3 * 60 * 1000;
      const out1 = `Patient denies current suicidal ideation. No plan or intent expressed. Protective factors reviewed. Monitoring plan discussed with patient and team.`;
      const out2 = `Patient demonstrates capacity for this decision: communicates a choice, understands relevant information, appreciates consequences, and can reason about options.`;
      const outcome = `${out1}\n\n${out2}`;
      const refs = [
        "Acute Safety / Suicide Risk Review documented this encounter.",
        "Capacity & Consent Check documented this encounter."
      ].join("\n");
      recent.noteSlots = { ...(recent.noteSlots || {}), outcome, refs };
      recent.completedFlows = ["safety", "capacity"];
      recent.completedRuns = [
        { flowId: "safety", label: "Safety Review", insertedAt: t1, paragraph: out1 },
        { flowId: "capacity", label: "Capacity Check", insertedAt: t2, paragraph: out2 },
      ];
    }
  } catch {}

  const p2 = patient(
    "B4432",
    "M. Kaya",
    58,
    "M",
    4,
    ["Bipolar"],
    [assess("PHQ9", now - days(60), 12), assess("PHQ9", now - days(5), 20)],
    [encounter(now - days(61), "Inpatient"), encounter(now - days(5), "OPD")],
    [task("Lithium level check", now - days(1))]
  );

  const p3 = patient(
    "C3090",
    "S. Yılmaz",
    23,
    "F",
    2,
    ["PostPartum"],
    [assess("GAD7", now - days(10), 8), assess("GAD7", now - days(2), 6)],
    [encounter(now - days(12), "OPD")]
  );

  const p4 = patient(
    "D9821",
    "E. Arslan",
    41,
    "M",
    5,
    ["FEP"],
    [assess("BFCRS", now - days(14), 32), assess("BFCRS", now - days(1), 28)],
    [encounter(now - days(15), "Inpatient"), encounter(now - days(1), "Inpatient")],
    [task("Seclusion documentation review", now + days(1))]
  );

  const p5 = patient(
    "E7712",
    "H. Çetin",
    67,
    "M",
    3,
    ["Elderly"],
    [assess("PHQ9", now - days(20), 9)],
    [encounter(now - days(21), "OPD")]
  );

  const p6 = patient(
    "F1901",
    "N. Şahin",
    29,
    "F",
    1,
    [],
    [assess("PHQ9", now - days(14), 4), assess("PHQ9", now - days(2), 3)],
    [encounter(now - days(14), "OPD")]
  );

  const p7 = patient(
    "G5533",
    "Ö. Uçar",
    46,
    "M",
    2,
    ["SUD"],
    [assess("GAD7", now - days(40), 10), assess("GAD7", now - days(6), 11)],
    [encounter(now - days(41), "OPD")]
  );

  const p8 = patient(
    "H8888",
    "Anon-8888",
    31,
    "X",
    4,
    ["Trauma", "Custom"],
    [assess("PHQ9", now - days(9), 19)],
    [encounter(now - days(10), "ED")]
  );

  const p9 = patient(
    "I1234",
    "L. Aydın",
    38,
    "F",
    1,
    ["Anxiety"],
    [assess("GAD7", now - days(15), 12), assess("GAD7", now - days(1), 10)],
    [encounter(now - days(16), "OPD")]
  );

  const p10 = patient(
    "J5678",
    "Z. Öztürk",
    52,
    "M",
    3,
    ["Depression"],
    [assess("PHQ9", now - days(45), 22), assess("PHQ9", now - days(10), 18)],
    [encounter(now - days(46), "Inpatient"), encounter(now - days(10), "OPD")],
    [task("Consult with specialist", now + days(5))]
  );

  return [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
}


export function randomizePatientsEN(patients: Patient[], seed?: number): Patient[] {
  const firstNames = [
    "Alex","Jordan","Taylor","Morgan","Casey","Riley","Sam","Avery","Jamie","Cameron",
    "Quinn","Harper","Logan","Rowan","Parker","Drew","Skyler","Elliot","Blake","Reese"
  ];
  const lastNames = [
    "Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Wilson","Moore","Taylor",
    "Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson"
  ];
  const taskPool = [
    "Follow-up call to family",
    "Review medication reconciliation",
    "Schedule lab tests",
    "Coordinate outpatient appointment",
    "Safety plan check-in",
  ];
  const tagPool: Tag[] = ["SUD","Bipolar","FEP","Elderly","PostPartum","Trauma"];
  const pick = (arr: string[] | Tag[], r: () => number) => arr[Math.floor(r()*arr.length)];
  const mkRand = (s: number) => () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s>>>0) % 1_000_000) / 1_000_000; };
  const rng = typeof seed === 'number' ? mkRand(seed) : Math.random;

  const ensureDerived = (p: Patient): Patient => {
    const out: Patient = { ...p };
    out.grade = p.risk;
    const phqs = (p.assessments || []).filter(a=>a.kind==='PHQ9').sort((a,b)=>b.when-a.when);
    if (phqs[0]) out.phq9Score = phqs[0].score;
    if (phqs[0] && phqs[1]) out.phq9Delta = phqs[0].score - phqs[1].score;
    const bf = (p.assessments || []).filter(a=>a.kind==='BFCRS').sort((a,b)=>b.when-a.when);
    if (bf[0]) out.bfcrsScoreCurrent = bf[0].score;
    return out;
  };

  const english = (p: Patient): Patient => {
    const name = `${pick(firstNames, rng)} ${pick(lastNames, rng)}`;
    const tags = (p.tags && p.tags.length ? p.tags : [pick(tagPool, rng)] ) as Tag[];
    const tasks = Array.isArray(p.tasks) && p.tasks.length ? p.tasks : [{ id: `task_${Math.random().toString(36).slice(2,8)}`, label: pick(taskPool, rng), createdAt: Date.now(), done: false }];
    const encs = (p.encounters || []).map(e => ({
      ...e,
      noteSlots: {
        ...(e.noteSlots || {}),
        summary: (e.noteSlots?.summary ?? 'Brief summary documented.'),
        plan: (e.noteSlots?.plan ?? 'Plan reviewed with patient and team.'),
        vitals: (e.noteSlots?.vitals ?? 'BP 120/78, HR 72, afebrile.'),
      }
    }));
    return ensureDerived({ ...p, name, tags, tasks, encounters: encs });
  };

  return (patients || []).map(english);
}
