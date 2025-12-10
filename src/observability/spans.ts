


import { getTracer, METRICS } from './otel';

export async function withSpan<T>(name: string, attrs: Record<string, any>, fn: () => Promise<T>): Promise<T> {
  const tr = getTracer();
  const span = tr.startSpan?.(name, { attributes: attrs });
  const t0 = performance.now();
  try {
    const res = await fn();
    try { span?.setAttribute?.('ok', true); } catch {}
    span?.end?.();
    try { METRICS.reqLatencyMs.record?.(performance.now() - t0); } catch {}
    return res;
  } catch (e: any) {
    try {
      span?.setAttribute?.('ok', false);
      span?.setAttribute?.('error', e?.message ?? String(e));
    } catch {}
    span?.end?.();
    try { METRICS.errors.add?.(1); } catch {}
    throw e;
  }
}
