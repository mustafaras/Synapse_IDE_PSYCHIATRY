import React from 'react';
import type { StatusSnapshot } from './statusTypes';

let snapshot: StatusSnapshot = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  ai: { state: 'idle' },
};
const subs = new Set<(s: StatusSnapshot) => void>();

export const subscribe = (cb: (s: StatusSnapshot) => void) => {
  subs.add(cb);
  cb(snapshot);
  return () => {
    subs.delete(cb);
  };
};

export const emit = (update: Partial<StatusSnapshot>) => {
  snapshot = { ...snapshot, ...update, now: Date.now() };
  subs.forEach(cb => cb(snapshot));
};

export const mergeEmit = <K extends keyof StatusSnapshot>(
  key: K,
  partial: Partial<StatusSnapshot[K]>
) => {
  const cur = (snapshot as any)[key] ?? {};
  emit({ [key]: { ...cur, ...partial } } as any);
};

export const useStatus = () => {
  const [s, setS] = React.useState<StatusSnapshot>(snapshot);
  React.useEffect(() => {
    const unsub = subscribe(setS);
    return () => {
      unsub();
    };
  }, []);
  return s;
};
