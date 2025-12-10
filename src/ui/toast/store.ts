import { create } from 'zustand';
import type { ShowToastInput, ToastItem } from './types';
import { DEFAULT_DURATION, MAX_CONCURRENT, shouldSuppress } from './policy';

interface ToastState {
  items: ToastItem[];
  lastSeenAt: Record<string, number>;
  show: (input: ShowToastInput) => string | null;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>()((set, get) => ({
  items: [],
  lastSeenAt: {},
  show: (input: ShowToastInput) => {
    const suppressed = shouldSuppress(get().lastSeenAt, input);
    if (suppressed) return null;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration = typeof input.duration === 'number' ? input.duration : DEFAULT_DURATION;
    const item: ToastItem = {
      id,
      kind: input.kind,
      message: input.message,
      title: input.title,
      duration,
      contextKey: input.contextKey,
      action: input.action,
      createdAt: Date.now(),
    };
    set(state => {
      const next = [...state.items, item];

      if (next.length > MAX_CONCURRENT) {
        const idx = next.findIndex(t => t.kind !== 'error');
        if (idx >= 0) next.splice(idx, 1);
        else next.shift();
      }
      return { ...state, items: next };
    });
    if (duration >= 0) {
      window.setTimeout(() => {
        get().dismiss(id);
      }, duration || DEFAULT_DURATION);
    }
    return id;
  },
  dismiss: (id: string) => set(s => ({ ...s, items: s.items.filter(t => t.id !== id) })),
  clear: () => set(s => ({ ...s, items: [] })),
}));
