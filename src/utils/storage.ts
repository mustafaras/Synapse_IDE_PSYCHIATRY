


export type StorageRead<T> = { ok: true; value: T } | { ok: false; error: string; raw?: string };

export function safeGet<T = unknown>(key: string): StorageRead<T> {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return { ok: false, error: 'missing' };
    const value = JSON.parse(raw) as T;
    return { ok: true, value };
  } catch {

    const raw = (() => { try { return localStorage.getItem(key) ?? ''; } catch { return ''; } })();
    return { ok: false, error: 'parse', raw };
  }
}

export function safeSet<T = unknown>(key: string, value: T): { ok: true } | { ok: false; error: string } {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    return { ok: false, error: msg || 'storage_error' };
  }
}

export function remove(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

export function backupCorrupt(key: string, raw?: string) {
  try {
    if (!raw) return;
    const stamp = new Date().toISOString().split(':').join('-');
    localStorage.setItem(`${key}.corrupt.${stamp}`, raw);
  } catch {}
}
