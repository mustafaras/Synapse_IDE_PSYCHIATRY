import { create } from "zustand";


export type BFCRSItem = { id: string; label: string };
export const BFCRS_ITEMS: BFCRSItem[] = [
  { id: "immobility",   label: "Immobility / stupor" },
  { id: "mutism",       label: "Mutism" },
  { id: "staring",      label: "Staring" },
  { id: "posturing",    label: "Posturing / catalepsy" },
  { id: "rigidity",     label: "Rigidity" },
  { id: "negativism",   label: "Negativism" },
  { id: "waxy",         label: "Waxy flexibility" },
  { id: "withdrawal",   label: "Withdrawal" },
  { id: "echolalia",    label: "Echolalia" },
  { id: "echopraxia",   label: "Echopraxia" },
  { id: "mannerisms",   label: "Mannerisms / stereotypy" },
  { id: "gegenhalten",  label: "Gegenhalten" },
  { id: "ambitendency", label: "Ambitendency" },
  { id: "automatic",    label: "Automatic obedience" },
];

export type BFCRSScores = Record<string, 0 | 1 | 2 | 3>;

type CalcState = {
  scores: BFCRSScores;
  total: number;
  updatedAt: number;
  setScore: (id: string, v: 0 | 1 | 2 | 3) => void;
  reset: () => void;
};

const initScores = (): BFCRSScores =>
  Object.fromEntries(BFCRS_ITEMS.map(i => [i.id, 0])) as BFCRSScores;

export const useCalcStore = create<CalcState>((set, get) => ({
  scores: initScores(),
  total: 0,
  updatedAt: Date.now(),
  setScore: (id, v) => {
    const prev = get().scores;
    const next = { ...prev, [id]: v };
  const total = Object.values(next).reduce<number>((s, n) => s + Number(n), 0);
    set({ scores: next, total, updatedAt: Date.now() });
  },
  reset: () => set({ scores: initScores(), total: 0, updatedAt: Date.now() }),
}));
