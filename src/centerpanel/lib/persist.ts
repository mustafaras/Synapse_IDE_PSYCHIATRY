

import type { Patient } from "../registry/types";

export const PERSIST_KEY = "cp3.session";
export const PERSIST_VERSION = 2;

export type PersistBlob = {
  ver: number;
  name?: string;
  savedAt: number;
  note: any;
  calc: any;
  flow: any;
  access?: { mode?: string; role?: string };


  registry?: {
    patients: Patient[];
  };
};

export function safeParse<T>(raw: string | null): T | null {
  try { return raw ? (JSON.parse(raw) as T) : null; } catch { return null; }
}

function migratePersistBlob(incoming: any): PersistBlob {
  const base: any = { ...(incoming || {}) };
  if (!base || typeof base !== "object") {
    return { ver: PERSIST_VERSION, savedAt: 0, note: {}, calc: {}, flow: {}, registry: { patients: [] } } as PersistBlob;
  }

  if (!base.registry || !Array.isArray(base.registry.patients)) {
    base.registry = { patients: [] };
  }

  base.ver = PERSIST_VERSION;
  if (typeof base.savedAt !== "number") base.savedAt = 0;
  if (!base.note) base.note = {};
  if (!base.calc) base.calc = {};
  if (!base.flow) base.flow = {};
  return base as PersistBlob;
}

export function persistLoad(): PersistBlob {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return migratePersistBlob({});
    const parsed = JSON.parse(raw);
    return migratePersistBlob(parsed);
  } catch {
    return migratePersistBlob({});
  }
}

export function loadPersist(): PersistBlob | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return migratePersistBlob(parsed);
  } catch {
    return null;
  }
}

export function persistSave(blob: PersistBlob) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify(blob)); } catch {  }
}

export function savePersist(blob: PersistBlob) {
  return persistSave(blob);
}

export function clearPersist() {
  try { localStorage.removeItem(PERSIST_KEY); } catch {}
}


export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 750) {
  let id: any;
  return (...args: Parameters<T>) => { clearTimeout(id); id = setTimeout(() => fn(...args), ms); };
}


export const fmtClock = (t?: number) =>
  (t ? new Date(t).toLocaleTimeString([], { hour12: false }) : "—");
