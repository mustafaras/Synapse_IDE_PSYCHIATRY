import { useObs } from './store';
import { estimateCost } from '@/utils/obs/cost';
import { uuid } from '@/utils/uuid';
import type { Span, Trace } from './types';


const setActiveTraceGlobal = (id: string | null) => {
  try { (globalThis as unknown as { __synapseObsActiveTraceId?: string | null }).__synapseObsActiveTraceId = id; } catch {}
};
export const getActiveTraceId = (): string | null => {
  try { return (globalThis as unknown as { __synapseObsActiveTraceId?: string | null }).__synapseObsActiveTraceId ?? null; } catch { return null; }
};

export function beginTrace(init: { requestId: string; provider?: string; model?: string; mode?: 'beginner' | 'pro'; notes?: Record<string, string>; userTextBytes?: number; attachmentsCount?: number }) {
  try {
  const rid: string = uuid();
    const id = useObs.getState().startTrace({
      id: rid,
      requestId: init.requestId,
      provider: init.provider as Trace['provider'],
      model: init.model,
      mode: init.mode,
      startedAt: Date.now(),
      notes: init.notes,
  userTextBytes: init.userTextBytes,
  attachmentsCount: init.attachmentsCount,
    } as unknown as Trace);
    setActiveTraceGlobal(id);
    return id;
  } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}

export function endTraceOk(traceId: string) {
  try {
    const { traces, finishTrace } = useObs.getState();
    const tr = traces.find((t) => t.id === traceId);
    finishTrace(traceId, { status: tr?.status === 'pending' ? 'ok' : (tr?.status as Trace['status']) });
  } catch {}
  setActiveTraceGlobal(null);
}

export function endTraceError(traceId: string, error: { code: string; status?: number; message?: string }) {
  try {
    useObs.getState().setError(traceId, error as NonNullable<Trace['error']>);
    useObs.getState().finishTrace(traceId);
  } catch {}
  setActiveTraceGlobal(null);
}

export function spanStart(traceId: string, type: Span['type'], name: string, meta?: Record<string, unknown>) {
  try {
    const payload: Omit<Span, 'id'> = { type, name, start: performance.now(), ...(meta ? { meta: meta as unknown as Record<string, unknown> } : {}) } as unknown as Omit<Span, 'id'>;
    return useObs.getState().addSpan(traceId, payload);
  } catch { return ''; }
}
export function spanEnd(traceId: string, spanId: string, meta?: Record<string, unknown>) {
  try {
    const patch = meta ? ({ meta } as unknown as Partial<Span>) : ({} as Partial<Span>);
    useObs.getState().endSpan(traceId, spanId, patch);
  } catch {}
}

export function setUsageAndMaybeCost(traceId: string, provider?: string, model?: string, usage?: { prompt: number; completion: number }) {
  try {
    useObs.getState().setUsage(traceId, usage as Trace['usage']);
    const cost = estimateCost(provider, model, usage);
    if (cost) useObs.getState().setCost(traceId, cost);
  } catch {}
}

export function annotateTrace(traceId: string, notes: Record<string, string>) {
  try {
    const { traces, finishTrace } = useObs.getState();
    const tr = traces.find((t) => t.id === traceId);
    if (!tr) return;
    const merged = { ...(tr.notes || {}), ...notes };
    finishTrace(traceId, { notes: merged as Record<string, string> } as Partial<Trace>);
  } catch {}
}
