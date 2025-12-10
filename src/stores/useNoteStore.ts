import { create } from "zustand";

export type NoteSlots = {
  summary: string;
  plan: string;
  refs: string;
  outcome: string;
  vitals: string;
  updatedAt: number;
};

export type SlotKey = "summary" | "plan" | "refs" | "outcome" | "vitals";

type Actions = {
  setSlot: (k: keyof NoteSlots, v: string) => void;
  append: (k: keyof NoteSlots, v: string) => void;
  clear: () => void;
  mergeRefs: (apaBlock: string) => void;
  setActiveSlot: (k: SlotKey) => void;
};

const initial: NoteSlots & { activeSlot: SlotKey } = {
  summary: "",
  plan: "",
  refs: "",
  outcome: "",
  vitals: "",
  updatedAt: Date.now(),
  activeSlot: "summary",
};

const dedupeLines = (s: string) => {
  const uniq = new Set(
    s.split(/\r?\n/).map(t => t.trim()).filter(Boolean)
  );
  return Array.from(uniq).join("\n");
};

export const useNoteStore = create<NoteSlots & Actions & { activeSlot: SlotKey }>((set, get) => ({
  ...initial,
  setSlot: (k, v) => set({ [k]: v, updatedAt: Date.now() } as any),
  append: (k, v) => set({ [k]: (get()[k] as string) + (v ? ((get()[k] as string) ? "\n\n" : "") + v : ""), updatedAt: Date.now() } as any),
  clear: () => set({ ...initial, updatedAt: Date.now(), activeSlot: "summary" }),
  mergeRefs: (apaBlock) => {
    const next = dedupeLines([(get().refs || "").trim(), (apaBlock || "").trim()].filter(Boolean).join("\n"));
    set({ refs: next, updatedAt: Date.now() });
  },
  setActiveSlot: (k) => set({ activeSlot: k })
}));
