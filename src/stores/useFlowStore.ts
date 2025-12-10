import { create } from "zustand";

export type Route = "IV" | "IM" | "PO";
export type EffectQuality = "clear" | "partial" | "none";

export type ChallengeStep = 0 | 1 | 2 | 3 | 4;

export interface ChallengeState {

  step: ChallengeStep;


  eligibilityAt?: number;
  baselineAt?: number;
  doseAt?: number;
  reassessAt?: number;
  completedAt?: number;


  eligible: boolean | null;
  contraindications: string;

  baselineBFCRS?: number;
  baselineNotes: string;

  doseMg: number;
  route: Route;

  responseMinutes?: number;
  postBFCRS?: number;
  effect: EffectQuality;
  adverse: string;

  outcomeText?: string;


  setStep: (s: ChallengeStep) => void;
  next: () => void;
  prev: () => void;
  set<K extends keyof ChallengeState>(k: K, v: ChallengeState[K]): void;
  mark: (which: "eligibilityAt"|"baselineAt"|"doseAt"|"reassessAt"|"completedAt") => void;
  reset: () => void;
  buildOutcome: () => string;
}

const initial: Omit<ChallengeState, "setStep"|"next"|"prev"|"set"|"mark"|"reset"|"buildOutcome"> = {
  step: 0,
  eligible: null,
  contraindications: "",
  baselineNotes: "",
  doseMg: 1,
  route: "IV",
  effect: "none",
  adverse: "",
};

export const useFlowStore = create<ChallengeState>((set, get) => ({
  ...initial,

  setStep: (s) => set({ step: s }),
  next: () => set({ step: (Math.min(4, get().step + 1) as ChallengeStep) }),
  prev: () => set({ step: (Math.max(0, get().step - 1) as ChallengeStep) }),
  set: (k, v) => set({ [k]: v } as any),
  mark: (which) => set({ [which]: Date.now() } as any),

  reset: () => set({ ...initial }),

  buildOutcome: () => {
    const s = get();
    const ts = (n?: number) => (n ? new Date(n).toLocaleTimeString([], {hour12:false}) : "—");
    const elig = s.eligible === true ? "eligible" : s.eligible === false ? "not eligible" : "undetermined";
    const delta = (typeof s.baselineBFCRS === "number" && typeof s.postBFCRS === "number")
      ? ` (Δ = ${s.postBFCRS - s.baselineBFCRS})` : "";

    const parts = [
      `Lorazepam challenge — Outcome`,
      `Eligibility: ${elig}${s.contraindications ? `; considerations: ${s.contraindications}` : ""}.`,
      `Baseline: BFCRS ${s.baselineBFCRS ?? "n/a"}; notes: ${s.baselineNotes || "—"}.`,
      `Administered: ${s.doseMg} mg ${s.route} at ${ts(s.doseAt)}.`,
      `Reassessed: ${s.responseMinutes ? `${s.responseMinutes} min later` : "time n/a"}; post-BFCRS ${s.postBFCRS ?? "n/a"}${delta}.`,
      `Observed effect: ${s.effect}. Adverse effects: ${s.adverse || "none reported"}.`,
      `Timestamps — eligibility: ${ts(s.eligibilityAt)}, baseline: ${ts(s.baselineAt)}, dose: ${ts(s.doseAt)}, reassess: ${ts(s.reassessAt)}, completed: ${ts(s.completedAt)}.`,
      `Use clinical judgement and follow local protocols.`
    ];
    return parts.join("\n");
  }
}));
