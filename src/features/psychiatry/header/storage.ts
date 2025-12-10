

export const storage = {
  get(key: string): string | null {
    try { if (typeof window === "undefined") return null; return window.localStorage.getItem(key); }
    catch { return null; }
  },
  set(key: string, val: string) {
    try { if (typeof window === "undefined") return; window.localStorage.setItem(key, val); }
    catch {}
  },
  del(key: string) {
    try { if (typeof window === "undefined") return; window.localStorage.removeItem(key); }
    catch {}
  },
};
