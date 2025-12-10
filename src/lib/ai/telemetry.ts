

export type AiEvent =
  | { t: 'start'; id: string; provider: string; model: string }
  | { t: 'chunk'; id: string; size: number }
  | { t: 'flush'; id: string; chars: number }
  | { t: 'final'; id: string; reason: 'ok' | 'error' | 'aborted'; durMs: number; attempts: number; http?: number; err?: string };

const listeners = new Set<(e: AiEvent) => void>();

export function onAiEvent(fn: (e: AiEvent) => void) {
  listeners.add(fn); return () => listeners.delete(fn);
}

export function emitAiEvent(e: AiEvent) {
  for (const fn of listeners) { try { fn(e); } catch {} }
  try {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      (window as any).__AI_EVENTS__ = (window as any).__AI_EVENTS__ || [];
      (window as any).__AI_EVENTS__.push(e);
      if ((window as any).__AI_EVENTS__.length > 1000) (window as any).__AI_EVENTS__.splice(0, (window as any).__AI_EVENTS__.length - 1000);
    }
  } catch {}
}

