export interface BackoffOpts {
  baseMs?: number;
  factor?: number;
  jitter?: number;
  maxMs?: number;
}

export function nextDelayMs(attempt: number, opts: BackoffOpts = {}): number {
  const base = opts.baseMs ?? 800;
  const factor = opts.factor ?? 1.8;
  const max = opts.maxMs ?? 30_000;
  const jitter = opts.jitter ?? 0.25;
  const exp = Math.min(max, Math.floor(base * Math.pow(factor, Math.max(0, attempt))))
  const j = 1 + (Math.random() * 2 - 1) * jitter;
  return Math.max(0, Math.floor(exp * j));
}

export function parseRetryAfter(h: string | null): number | null {
  if (!h) return null;
  const seconds = Number(h);
  if (!Number.isNaN(seconds) && seconds > 0) return seconds * 1000;
  const when = Date.parse(h);
  if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  return null;
}
