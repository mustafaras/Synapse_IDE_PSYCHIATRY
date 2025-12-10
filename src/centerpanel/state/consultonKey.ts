

export type PersistBackend = 'session' | 'none';

export interface ConsultonKeyState {

  key: string | null;

  persisting: boolean;

  backend: PersistBackend;
}

export const STORAGE_KEYS = {
  KEY: 'CONSULTON_KEY',
} as const;


export const WARN_NO_LOCALSTORAGE =
  'Do not persist API keys in localStorage. Use sessionStorage only when the user opts in.';


let _key: string | null = null;
let _persisting = false;
let _backend: PersistBackend = 'none';

type Listener = (s: ConsultonKeyState) => void;
const _listeners = new Set<Listener>();


function hasWindow(): boolean {
  return typeof window !== 'undefined';
}

function hasSessionStorage(): boolean {
  if (!hasWindow()) return false;
  try {
    const ss = window.sessionStorage;
    if (!ss) return false;
    const t = '__CONSULTON_SS_TEST__';
    ss.setItem(t, '1');
    ss.removeItem(t);
    return true;
  } catch {
    return false;
  }
}

function readFromSession(): string | null {
  if (!hasSessionStorage()) return null;
  try {
    const v = window.sessionStorage.getItem(STORAGE_KEYS.KEY);
    return v ?? null;
  } catch {
    return null;
  }
}

function writeToSession(value: string | null): boolean {
  if (!hasSessionStorage()) return false;
  try {
    const ss = window.sessionStorage;
    if (value == null) {
      ss.removeItem(STORAGE_KEYS.KEY);
    } else {
      ss.setItem(STORAGE_KEYS.KEY, value);
    }
    return true;
  } catch {
    return false;
  }
}

function emit() {
  const snapshot = getConsultonKeyState();
  for (const cb of _listeners) {
    try {
      cb(snapshot);
    } catch {

    }
  }
}


(function init() {


  const ssKey = readFromSession();
  if (ssKey) {
    _key = ssKey;
    _persisting = true;
    _backend = 'session';
  } else {
    _key = null;
    _persisting = false;
    _backend = 'none';
  }
})();


export function getConsultonKey(): string | null {
  return _key;
}

export function getConsultonKeyState(): ConsultonKeyState {
  return { key: _key, persisting: _persisting, backend: _backend };
}


export function setConsultonKey(k: string): void {

  const next = typeof k === 'string' ? k.trim() : '';
  _key = next.length ? next : '';

  if (_persisting && hasSessionStorage()) {

    const ok = writeToSession(_key);
    _backend = ok && _key != null ? 'session' : 'none';
  } else {

    writeToSession(null);
    _backend = 'none';
  }
  emit();
}


export function forgetConsultonKey(): void {
  _key = null;

  writeToSession(null);
  _backend = 'none';

  _persisting = false;
  emit();
}


export function isConsultonKeyPersisting(): boolean {
  return _persisting;
}


export function setConsultonKeyPersisting(b: boolean): boolean {
  if (b === _persisting) {

    emit();
    return true;
  }

  if (b) {
    if (!hasSessionStorage()) {

      _persisting = false;
      _backend = 'none';
      emit();
      return false;
    }
    _persisting = true;

    if (_key !== null) {
      const ok = writeToSession(_key);
      _backend = ok && _key != null ? 'session' : 'none';
      if (!ok) {
        _persisting = false;
        _backend = 'none';
        emit();
        return false;
      }
    } else {

      _backend = 'none';
    }
    emit();
    return true;
  } else {

    writeToSession(null);
    _persisting = false;
    _backend = 'none';
    emit();
    return true;
  }
}


export function subscribeConsultonKey(cb: (s: ConsultonKeyState) => void): () => void {
  _listeners.add(cb);
  try {
    cb(getConsultonKeyState());
  } catch {

  }
  return () => {
    _listeners.delete(cb);
  };
}


export function getPersistBackend(): PersistBackend {
  return _backend;
}


export function getConsultonKeyMasked(): string {
  const k = getConsultonKey();
  if (!k) return "";
  const tail = k.slice(-4);
  return `****${tail}`;
}
