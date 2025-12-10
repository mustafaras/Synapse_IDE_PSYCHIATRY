import type { SettingsProfile } from './settings.types';
import { defaultKeymap } from '@/lib/keys/defaultKeymap';
import { detectPlatform } from '@/lib/keys/platform';

export function exportProfile(profile: SettingsProfile, opts?: { includeSecrets?: boolean }): Blob {
  const include = !!opts?.includeSecrets;
  const { data, keymap, ...rest } = profile as any;
  const copy: any = { ...rest, data: { ...data, secrets: { ...data.secrets }, meta: { ...(data.meta ?? {}) } }, keymap, exportedAt: new Date().toISOString(), appVersion: 'dev' };
  if (!include || !copy.data.secrets.rememberSecrets || copy.data.secrets.source === 'env') {
    delete copy.data.secrets.apiKey;
    if (!copy.data.secrets.rememberSecrets) delete copy.data.secrets.proxyUrl;
  }
  const blob = new Blob([JSON.stringify(copy, null, 2)], { type: 'application/json' });
  return blob;
}

export async function importProfile(file: File): Promise<SettingsProfile> {
  const text = await file.text();
  const j = JSON.parse(text);
  if (!j || !j.data || j.data.version !== 2) throw new Error('Invalid profile file');
  const p: SettingsProfile = {
    id: (globalThis.crypto?.randomUUID?.() || `profile-${  Math.random().toString(36).slice(2)}`) as string,
    name: typeof j.name === 'string' ? `${String(j.name)  } (imported)` : 'Imported',
    data: { ...j.data, secrets: { ...j.data.secrets, rememberSecrets: false } },
    updatedAt: Date.now(),
    isDefault: false,
    keymap: j.keymap || defaultKeymap(detectPlatform()),
  };
  return p;
}
