import { create } from "zustand";

export type AccessMode = "edit" | "readonly" | "locked";
export type Role = "clinician" | "viewer" | "admin";

type State = {
  mode: AccessMode;
  role: Role;
  user: string | undefined;
  changedAt: number;
  setMode: (m: AccessMode) => void;
  setRole: (r: Role) => void;
  setUser: (u: string | undefined) => void;
  canEdit: () => boolean;
  isReadOnly: () => boolean;
  isLocked: () => boolean;
  isAdmin: () => boolean;
};

export const useAccessStore = create<State>((set, get) => ({
  mode: "edit",
  role: "clinician",
  user: undefined,
  changedAt: Date.now(),
  setMode: (m) => set({ mode: m, changedAt: Date.now() }),
  setRole: (r) => set({ role: r, changedAt: Date.now() }),
  setUser: (u) => set({ user: u }),
  canEdit: () => get().mode === "edit",
  isReadOnly: () => get().mode !== "edit",
  isLocked: () => get().mode === "locked",
  isAdmin: () => get().role === "admin",
}));
