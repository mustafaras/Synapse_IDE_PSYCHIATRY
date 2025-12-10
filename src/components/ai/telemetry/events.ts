

export type TelemetryEvent = { type: string; [k: string]: unknown };
export function emit(evt: TelemetryEvent) {
  try {
    (window as any).telemetry = (window as any).telemetry || {};
    const q: TelemetryEvent[] = ((window as any).telemetry.queue ||= []);
    q.push(evt);

    if (process.env.NODE_ENV !== 'production') console.log('[telemetry]', evt);
  } catch {}
}
