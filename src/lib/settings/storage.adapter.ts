import type { SettingsPayloadV2, SettingsProfile, SettingsStateV2 } from './settings.types';

const STORAGE_KEY = 'synapse.settings.v2';


let _timer: any = null;
let _pending: SettingsStateV2 | null = null;

function safeParse<T>(s: string | null): T | null {
  if (!s) return null;
  try { return JSON.parse(s) as T; } catch { return null; }
}


function sanitizeForSave(state: SettingsStateV2): SettingsStateV2 {
  const profiles: SettingsProfile[] = state.profiles.map(p => {
    const d: SettingsPayloadV2 = { ...p.data, secrets: { ...p.data.secrets } };
    const remember = !!d.secrets.rememberSecrets;
    const src = d.secrets.source || 'manual';
    if (!remember || src === 'env') {
      delete d.secrets.apiKey;

      if (!remember) delete (d.secrets as any).proxyUrl;
    }
    return { ...p, data: d };
  });
  return { ...state, profiles };
}

export function load(): SettingsStateV2 | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = safeParse<SettingsStateV2>(raw);
    if (parsed && Array.isArray(parsed.profiles) && typeof parsed.activeProfileId === 'string') {
      return { ...parsed, dirty: false };
    }
    return null;
  } catch {
    return null;
  }
}

export function save(state: SettingsStateV2) {
  try {
    const toWrite = sanitizeForSave(state);
    _pending = toWrite;
    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_pending)); } catch {}
      _pending = null;
    }, 300);
  } catch {}
}

export function storageKey() { return STORAGE_KEY; }
