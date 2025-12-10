import type { ShowToastInput } from './types';


export const DEFAULT_DURATION = 3000;
export const MAX_CONCURRENT = 3;
export const RATE_LIMIT_MS = 2500;

export function makeKey(input: ShowToastInput): string {
  const base = `${input.kind}:${input.title ?? ''}:${input.message}`.trim();
  return input.contextKey ? `${base}@${input.contextKey}` : base;
}

export function shouldSuppress(lastSeenAt: Record<string, number>, input: ShowToastInput, now = Date.now()): boolean {
  const key = makeKey(input);
  const last = lastSeenAt[key] || 0;
  if (now - last < RATE_LIMIT_MS) return true;
  lastSeenAt[key] = now;
  return false;
}
