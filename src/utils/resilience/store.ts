import { create } from 'zustand';
import type { OutboxItem, RequestEnvelope } from './types';

const OUTBOX_KEY = 'synapse.outbox.v1';
const DRAFT_KEY = 'synapse.chatDraft.v1';

type NetState = {
  online: boolean;
  setOnline: (v: boolean) => void;

  outbox: OutboxItem[];
  enqueue: (env: RequestEnvelope) => void;
  update: (id: string, patch: Partial<OutboxItem>) => void;
  remove: (id: string) => void;
  clear: () => void;

  chatDraft: string;
  setChatDraft: (s: string) => void;
};

function loadOutbox(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(Boolean);
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]) {
  try { localStorage.setItem(OUTBOX_KEY, JSON.stringify(items.slice(0, 50))); } catch {}
}

function loadDraft(): string {
  try { return localStorage.getItem(DRAFT_KEY) || ''; } catch { return ''; }
}

function saveDraft(v: string) {
  try { localStorage.setItem(DRAFT_KEY, v || ''); } catch {}
}

export const useResilience = create<NetState>()((set, get) => ({
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (v) => set({ online: v }),
  outbox: loadOutbox(),
  enqueue: (env) => {
    const ob = get().outbox;
    if (ob.some(x => x.env.fingerprint === env.fingerprint && x.status !== 'failed')) return;
    const next = [{ env, attempt: 0, nextAt: Date.now(), status: 'queued' as const }, ...ob];
    set({ outbox: next });
    saveOutbox(next);
  },
  update: (id, patch) => set(s => {
    const next = s.outbox.map(x => x.env.id === id ? { ...x, ...patch } : x);
    saveOutbox(next);
    return { outbox: next };
  }),
  remove: (id) => set(s => {
    const next = s.outbox.filter(x => x.env.id !== id);
    saveOutbox(next);
    return { outbox: next };
  }),
  clear: () => { saveOutbox([]); set({ outbox: [] }); },
  chatDraft: loadDraft(),
  setChatDraft: (s) => { saveDraft(s); set({ chatDraft: s }); },
}));

export const useOnline = () => useResilience(s => s.online);
export const useOutbox = () => useResilience(s => s.outbox);
export const useDraft = () => useResilience(s => s.chatDraft);
