

export function uuid(): string {
  try {
    const v = globalThis.crypto?.randomUUID?.();
    if (typeof v === 'string' && v.length > 0) return v;
  } catch {

  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
