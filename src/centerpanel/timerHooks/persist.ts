


export interface PersistDoc<T> { schema_version: number; data: T; updated_at: string; }

export function makePersist<T>(ns: string, version = 1) {
  const key = `timerModal.hook.${ns}.v${version}`;
  return {
    load(defaultData: T): T {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return defaultData;
        const doc = JSON.parse(raw) as PersistDoc<T> | T;
        if ((doc as any)?.schema_version === version) return (doc as PersistDoc<T>).data;

        return (doc as any)?.data ?? (doc as any) ?? defaultData;
      } catch {
        return defaultData;
      }
    },
    save(data: T) {
      try {
        const doc: PersistDoc<T> = { schema_version: version, data, updated_at: new Date().toISOString() };
        localStorage.setItem(key, JSON.stringify(doc));
      } catch {  }
    },
    clear() { try { localStorage.removeItem(key); } catch {  } },
    key
  };
}
