import { create } from "zustand";

type Meta = {
  lastSavedAt: number | undefined;
  lastLoadedAt: number | undefined;
  sessionName: string | undefined;
  setName: (s?: string) => void;
  markSaved: (t?: number) => void;
  markLoaded: (t?: number) => void;
};

export const usePersistMeta = create<Meta>((set) => ({
  lastSavedAt: undefined,
  lastLoadedAt: undefined,
  sessionName: undefined,
  setName: (s) => set({ sessionName: s }),
  markSaved: (t) => set({ lastSavedAt: t ?? Date.now() }),
  markLoaded: (t) => set({ lastLoadedAt: t ?? Date.now() }),
}));
