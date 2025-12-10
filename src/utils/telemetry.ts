export type StreamStatus = 'ok' | 'abort' | 'timeout' | 'error';

export function now() {
  try { return performance.now(); } catch { return Date.now(); }
}

export function logEvent(name: string, data: Record<string, any>) {
  try {

    console.debug(`[telemetry] ${name}`, data);
    const w = (window as any);
    w.__telemetry = w.__telemetry ?? [];
    w.__telemetry.push({ name, ts: Date.now(), data });
  } catch {}
}
