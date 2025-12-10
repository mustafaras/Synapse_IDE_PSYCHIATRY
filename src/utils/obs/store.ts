import { create } from 'zustand';
import { uuid } from '@/utils/uuid';
import type { Span, Trace } from './types';

type ObsState = {
  traces: Trace[];
  startTrace: (t: Omit<Trace, 'spans' | 'status'>) => string;
  finishTrace: (id: string, patch?: Partial<Trace>) => void;
  addSpan: (traceId: string, s: Omit<Span, 'id'>) => string;
  endSpan: (traceId: string, spanId: string, patch?: Partial<Span>) => void;
  setUsage: (traceId: string, usage: Trace['usage']) => void;
  setCost: (traceId: string, cost: Trace['cost']) => void;
  setError: (traceId: string, err: NonNullable<Trace['error']>) => void;
  clear: () => void;
};

const MAX_TRACES = 100;

const genId = () => uuid();

export const useObs = create<ObsState>()((set, _get) => ({
  traces: [],
  startTrace: (t) => {
    const id = (t as unknown as { id?: string }).id ?? genId();
  const base: Trace = {
      id,
      requestId: t.requestId,
      startedAt: t.startedAt ?? Date.now(),
      status: 'pending',
      spans: [],
    } as Trace;

  const trace = { ...base } as Trace;
  if (t.provider !== undefined) (trace as unknown as { provider?: Trace['provider'] }).provider = t.provider as Trace['provider'];
  if (t.model !== undefined) (trace as unknown as { model?: string }).model = t.model;
  if (t.mode !== undefined) (trace as unknown as { mode?: 'beginner' | 'pro' }).mode = t.mode as 'beginner' | 'pro';
  if (t.notes !== undefined) (trace as unknown as { notes?: Record<string, string> }).notes = t.notes as Record<string, string>;
    set((s) => ({ traces: [trace, ...s.traces].slice(0, MAX_TRACES) }));
    return id;
  },
  finishTrace: (id, patch) =>
    set((s) => ({
      traces: s.traces.map((tr) =>
        tr.id === id
          ? {
              ...tr,
              finishedAt: Date.now(),
              status: tr.status === 'pending' ? 'ok' : tr.status,
              ...patch,
            }
          : tr
      ),
    })),
  addSpan: (traceId, s) => {
    const id = genId();
    set((st) => ({
      traces: st.traces.map((t) => (t.id === traceId ? { ...t, spans: [{ id, ...s }, ...t.spans] } : t)),
    }));
    return id;
  },
  endSpan: (traceId, spanId, patch) =>
    set((st) => ({
      traces: st.traces.map((t) =>
        t.id === traceId
          ? {
              ...t,
              spans: t.spans.map((sp) => (sp.id === spanId ? { ...sp, end: performance.now(), ...(patch || {}) } : sp)),
            }
          : t
      ),
    })),
  setUsage: (traceId, usage) =>
    set((st) => ({
      traces: st.traces.map((t) => (t.id === traceId ? (usage ? ({ ...(t as Trace), usage } as Trace) : (t as Trace)) : (t as Trace))),
    })),
  setCost: (traceId, cost) =>
    set((st) => ({
      traces: st.traces.map((t) => (t.id === traceId ? (cost ? ({ ...(t as Trace), cost } as Trace) : (t as Trace)) : (t as Trace))),
    })),
  setError: (traceId, error) =>
    set((st) => ({
      traces: st.traces.map((t) => (t.id === traceId ? { ...t, error, status: error.code === 'cancelled' ? 'cancelled' : 'error' } : t)),
    })),
  clear: () => set({ traces: [] }),
}));

export const selectTraces = () => useObs.getState().traces;
