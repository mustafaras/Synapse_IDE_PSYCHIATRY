import { create } from 'zustand';
import type { SettingsPayloadV2, SettingsProfile, SettingsStateV2 } from '@/lib/settings/settings.types';
import { defaultKeymap } from '@/lib/keys/defaultKeymap';
import { detectPlatform } from '@/lib/keys/platform';
import * as Adapter from '@/lib/settings/storage.adapter';
import { migrateAny } from '@/lib/settings/migrate';
import { exportProfile as doExport, importProfile as doImport } from '@/lib/settings/exportImport';
import { emit as telemetryEmit } from '@/components/ai/telemetry/events';
import { emitAiRouteChanged } from '@/observability/aiRouteTelemetry';

function factoryDefaults(): SettingsPayloadV2 {
  return {
    version: 2,
    provider: 'openai',
    model: 'gpt-4o-mini',
    sampling: { temperature: 0.3, top_p: 1, max_output_tokens: null },
    embeddings: { provider: 'ollama', model: 'nomic-embed-text', dim: 768 },
    flags: { wrapCode: true, compactBubbles: false, confirmBeforeApply: false, shareSelection: false, telemetryUsageOnly: false },
    secrets: { rememberSecrets: false, source: 'manual' },
  };
}

function uuid() { try { return crypto.randomUUID(); } catch { return `profile-${  Math.random().toString(36).slice(2)}`; } }

type UiProvider = 'openai' | 'anthropic' | 'gemini' | 'local';


const STORAGE_KEY = 'synapse.ai.settings.v2';
const LEGACY_KEYS = ['synapse.ai.keys', 'synapse.ai.keys.v1'];
const te = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null as any;
const td = typeof TextDecoder !== 'undefined' ? new TextDecoder() : null as any;

async function deriveKey(): Promise<CryptoKey> {
  if (!(typeof window !== 'undefined' && 'crypto' in window && (window as any).isSecureContext && crypto.subtle)) {
    throw new Error('WebCrypto not available or insecure context');
  }
  const material = await crypto.subtle.digest('SHA-256', te.encode(location.origin));
  return crypto.subtle.importKey('raw', material, { name: 'AES-GCM' }, false, ['encrypt','decrypt']);
}
function toB64(u8: Uint8Array): string { let s=''; for (let i=0;i<u8.length;i++) s += String.fromCharCode(u8[i]); return btoa(s); }
function fromB64(b64: string): Uint8Array { const s = atob(b64); const u8 = new Uint8Array(s.length); for (let i=0;i<s.length;i++) u8[i] = s.charCodeAt(i) & 0xff; return new Uint8Array(u8); }
async function encryptJson(obj: unknown): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey();
  const data = te.encode(JSON.stringify(obj));
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  return JSON.stringify({ v: 2, iv: toB64(iv), data: toB64(new Uint8Array(buf)) });
}
async function decryptJson(payload: string): Promise<unknown | null> {
  try {
    const parsed = JSON.parse(payload);
    if (parsed?.v === 2 && parsed.iv && parsed.data) {

  const key: CryptoKey = await deriveKey();
  const iv: Uint8Array = fromB64(parsed.iv);
  const cipher: Uint8Array = fromB64(parsed.data);
  const buf: ArrayBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return JSON.parse(td.decode(buf));
    }

    return JSON.parse(payload);
  } catch { return null; }
}

export type SettingsStore = SettingsStateV2 & {

  aiUiPeek?: Partial<Record<UiProvider, boolean>>;
  load(): void;
  save(): void;

  clearAllApiKeys?: () => void;
  createProfile(name: string, base?: SettingsProfile | null): string;
  renameProfile(id: string, name: string): void;
  duplicateProfile(id: string): string;
  deleteProfile(id: string): void;
  setDefaultProfile(id: string): void;
  setActiveProfile(id: string): void;
  updateActive(updater: (d: SettingsPayloadV2) => SettingsPayloadV2): void;
  revertActiveToSaved(): void;
  resetActiveToFactory(): void;
  exportActive(opts?: { includeSecrets?: boolean }): Blob | null;
  importFromFile(file: File): Promise<string>;

  planPreset(presetId: import('@/lib/ai/presets/presets.types').PresetId): import('@/lib/ai/presets/presets.types').PresetApplyPlan | null;
  applyPreset(presetId: import('@/lib/ai/presets/presets.types').PresetId, opts?: { switchModel?: boolean }): void;

  setActiveScene(sceneId: import('@/lib/ai/scenes/scenes.types').SceneId | null): void;
  persistActiveSceneAsPreset(name?: string): void;

  getSchedulerPolicy(): Partial<Record<import('@/lib/ai/scheduler/scheduler.types').ProviderId, import('@/lib/ai/scheduler/scheduler.types').RatePolicy>>;
  updateSchedulerPolicy(provider: import('@/lib/ai/scheduler/scheduler.types').ProviderId, p: import('@/lib/ai/scheduler/scheduler.types').RatePolicy): void;

  setProvider(provider: 'openai'|'anthropic'|'gemini'|'ollama'): void;

  setModel: ((modelId: string) => void) & ((p: UiProvider, m: string) => void);
  setOllamaBaseUrl(url: string): void;
  setApiKey(provider: 'openai'|'anthropic'|'gemini', apiKey: string): void;

  setKey(p: UiProvider, v: string): void;
  setDefaultProvider(p: UiProvider): void;
  togglePeek(p: UiProvider, on?: boolean): void;

  savePersisted(): Promise<void>;
  loadPersisted(): Promise<void>;
  testKey(p: UiProvider): Promise<boolean>;
  persistInsecure?: boolean;

  setSystemPrompt(text: string): void;
  setTemperature(v: number): void;
  setTopP(v: number): void;
  setMaxOutputTokens(v: number | null): void;
  setJsonMode(enabled: boolean): void;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  profiles: [],
  activeProfileId: '',
  dirty: false,
  aiUiPeek: {},
  clearAllApiKeys() {
    const s = get();
    const profiles = s.profiles.map(p => {
      const data = { ...(p.data as any) };
      if (data && data.keys) {
        const nextKeys = { ...data.keys };
        try { delete nextKeys.openai; } catch {}
        try { delete nextKeys.anthropic; } catch {}
  try { delete nextKeys.gemini; } catch {}
        data.keys = nextKeys;
      }
      return { ...p, data, updatedAt: Date.now() } as SettingsProfile;
    });
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next);
    Adapter.save(next);
  },

  load() {
  const loaded = Adapter.load();
    if (loaded) { set({ ...loaded, dirty: false }); return; }

    try {

      const legacy = require('@/components/ai/persistence/settings-persistence');
      legacy.loadSettings().then((old: unknown) => {
        const migrated = migrateAny(old) || { profiles: [{ id: uuid(), name: 'Default', data: factoryDefaults(), updatedAt: Date.now(), isDefault: true }], activeProfileId: '', dirty: false };
        if (!migrated.activeProfileId) migrated.activeProfileId = migrated.profiles[0].id;

        const plat = detectPlatform();
        migrated.profiles = migrated.profiles.map(p => ({ ...p, keymap: p.keymap || defaultKeymap(plat) } as SettingsProfile));
        set(migrated);
        Adapter.save(migrated);
      }).catch(() => {
        const fresh = { profiles: [{ id: uuid(), name: 'Default', data: factoryDefaults(), updatedAt: Date.now(), isDefault: true, keymap: defaultKeymap(detectPlatform()) }], activeProfileId: '', dirty: false } as SettingsStateV2;
        fresh.activeProfileId = fresh.profiles[0].id;
        set(fresh);
        Adapter.save(fresh);
      });
    } catch {
      const fresh = { profiles: [{ id: uuid(), name: 'Default', data: factoryDefaults(), updatedAt: Date.now(), isDefault: true, keymap: defaultKeymap(detectPlatform()) }], activeProfileId: '', dirty: false } as SettingsStateV2;
      fresh.activeProfileId = fresh.profiles[0].id;
      set(fresh);
      Adapter.save(fresh);
    }
  },

  save() { Adapter.save(get()); },

  createProfile(name, base) {
    const s = get();
    const copy = base ? { ...base, id: uuid(), name, isDefault: false, updatedAt: Date.now() } : { id: uuid(), name, data: factoryDefaults(), updatedAt: Date.now(), isDefault: false, keymap: defaultKeymap(detectPlatform()) } as SettingsProfile;
    const next: SettingsStateV2 = { ...s, profiles: [...s.profiles, copy], activeProfileId: copy.id, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_create/rename/duplicate/delete' });
    return copy.id;
  },

  renameProfile(id, name) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === id ? { ...p, name, updatedAt: Date.now() } : p);
    const next = { ...s, profiles, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_create/rename/duplicate/delete' });
  },

  duplicateProfile(id) {
    const s = get();
    const src = s.profiles.find(p => p.id === id);
    const dup = src ? { ...src, id: uuid(), name: `${src.name} (copy)`, isDefault: false, updatedAt: Date.now() } : { id: uuid(), name: 'Copy', data: factoryDefaults(), updatedAt: Date.now(), keymap: defaultKeymap(detectPlatform()) } as SettingsProfile;
    const next: SettingsStateV2 = { ...s, profiles: [...s.profiles, dup], activeProfileId: dup.id, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_create/rename/duplicate/delete' });
    return dup.id;
  },

  deleteProfile(id) {
    const s = get();
    if (s.profiles.length <= 1) return;
    const profiles = s.profiles.filter(p => p.id !== id);
    const active = profiles[0].id;
    const next = { ...s, profiles, activeProfileId: active, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_create/rename/duplicate/delete' } as any);
  },

  setDefaultProfile(id) {
    const s = get();
    const profiles = s.profiles.map(p => ({ ...p, isDefault: p.id === id }));
    const next = { ...s, profiles, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_set_default' } as any);
  },

  setActiveProfile(id) {
    const s = get();
    if (!s.profiles.find(p => p.id === id)) return;
  const next = { ...s, activeProfileId: id, dirty: false };
  set(next);
  Adapter.save(next);
    telemetryEmit({ type: 'settings_profile_set_active' } as any);
  },

  updateActive(updater) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? { ...p, data: updater(p.data), updatedAt: Date.now() } : p);
    const next = { ...s, profiles, dirty: true };
    set(next); Adapter.save(next);
  },

  revertActiveToSaved() {
    const loaded = Adapter.load();
    if (!loaded) return;
    const { activeProfileId } = get();
    const savedActive = loaded.profiles.find(p => p.id === activeProfileId);
    if (!savedActive) return;
    const next = { ...loaded, dirty: false };
    set(next);
    telemetryEmit({ type: 'settings_revert_saved' } as any);
  },

  resetActiveToFactory() {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? { ...p, data: factoryDefaults(), updatedAt: Date.now() } : p);
    const next = { ...s, profiles, dirty: true };
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'settings_reset_factory' } as any);
  },

  exportActive(opts) {
    const s = get();
    const active = s.profiles.find(p => p.id === s.activeProfileId);
    if (!active) return null;
    telemetryEmit({ type: 'settings_export', includeSecrets: !!opts?.includeSecrets } as any);
    return doExport(active, { includeSecrets: !!opts?.includeSecrets });
  },

  async importFromFile(file) {
    try {
      const p = await doImport(file);
      const id = get().createProfile(p.name, p);
      telemetryEmit({ type: 'settings_import_success' } as any);
      return id;
    } catch {
      telemetryEmit({ type: 'settings_import_fail' } as any);
      throw new Error('Invalid profile');
    }
  },

  planPreset(presetId) {
    try {
      const { getPreset } = require('@/lib/ai/presets/presets.registry');
      const { makePresetPlan } = require('@/lib/ai/presets/applyPreset');
      const preset = getPreset(presetId);
      if (!preset) return null;
      const s = get();
      const active = s.profiles.find(p => p.id === s.activeProfileId);
      if (!active) return null;
      return makePresetPlan(active.data, preset);
    } catch {
      return null;
    }
  },

  applyPreset(presetId, opts) {
    try {
      const { getPreset } = require('@/lib/ai/presets/presets.registry');
      const { applyPreset } = require('@/lib/ai/presets/applyPreset');
      const preset = getPreset(presetId);
      if (!preset) return;
      const s = get();
      const profiles = s.profiles.map(p => {
        if (p.id !== s.activeProfileId) return p;
        let data = applyPreset(p.data, preset);
        if (!opts?.switchModel && preset.patch.model && preset.patch.model !== p.data.model) {

          data = { ...data, model: p.data.model };
        }
        return { ...p, data, updatedAt: Date.now() };
      });
      const next = { ...s, profiles, dirty: true };
      set(next); Adapter.save(next);
      telemetryEmit({ type: 'preset_apply', presetId, switchedModel: !!opts?.switchModel } as any);
    } catch {}
  },

  setActiveScene(sceneId) {
    try {
      const s = get();
      const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
        ...p,
        data: { ...p.data, meta: { ...(p.data.meta || {}), lastSceneId: sceneId } },
        updatedAt: Date.now(),
      } : p);
      const next = { ...s, profiles, dirty: false };
      set(next); Adapter.save(next);
      telemetryEmit({ type: sceneId ? 'scene_set' : 'scene_clear', sceneId } as any);
    } catch {}
  },

  persistActiveSceneAsPreset(_name) {
    try {
      const s = get();
      const active = s.profiles.find(p => p.id === s.activeProfileId);
      const sceneId = (active?.data as any)?.meta?.lastSceneId;
      if (!sceneId) return;
      const { getScene } = require('@/lib/ai/scenes/scenes.registry');
      const sc = getScene(sceneId);
      if (!sc || !active) return;

      const profiles = s.profiles.map(p => p.id === s.activeProfileId ? { ...p, data: { ...p.data, sampling: { ...p.data.sampling, ...(sc.patch.sampling||{}) }, flags: { ...p.data.flags, ...(sc.patch.flags||{}) } }, updatedAt: Date.now() } : p);
      const next = { ...s, profiles, dirty: true };
      set(next); Adapter.save(next);
      telemetryEmit({ type: 'scene_persist_as_preset', sceneId } as any);
    } catch {}
  },

  getSchedulerPolicy() {
    try {
      const s = get();
      const active = s.profiles.find(p => p.id === s.activeProfileId);
      return (active?.data?.meta?.schedulerPolicyOverride ?? {}) as any;
    } catch { return {}; }
  },
  updateSchedulerPolicy(provider, p) {
    try {
      const s = get();
      const profiles = s.profiles.map(pr => pr.id === s.activeProfileId ? {
        ...pr,
        data: { ...pr.data, meta: { ...(pr.data.meta || {}), schedulerPolicyOverride: { ...(pr.data.meta?.schedulerPolicyOverride || {}), [provider]: p } } },
        updatedAt: Date.now(),
      } : pr);
      const next = { ...s, profiles, dirty: true };
      set(next); Adapter.save(next);
      telemetryEmit({ type: 'limits_policy_update', provider, fields: Object.keys(p) } as any);
    } catch {}
  },


  setProvider(provider) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: {
        ...p.data,
        settings: { ...(p.data.settings || { provider: 'openai', model: p.data.model, sampling: { temperature: 0.3, top_p: 1, max_output_tokens: null } }), provider },
      },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);

    try {
      const { useAiSettingsStore } = require('@/stores/useAiSettingsStore');
      const ai = useAiSettingsStore.getState();
      if (ai.defaults.provider !== provider) {
        const before = { provider: ai.defaults.provider, model: ai.defaults.model };
        ai.setDefaults({ provider: provider as any });
        emitAiRouteChanged(before, { provider, model: before.model });
      }
    } catch {}
  },
  setModel(...args: [string] | [UiProvider, string]) {

    const modelId: string = (args.length === 1 ? args[0] : args[1]);
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: {
        ...p.data,
        model: modelId,
        settings: { ...(p.data.settings || { provider: p.data.provider, model: p.data.model, sampling: { temperature: 0.3, top_p: 1, max_output_tokens: null } }), model: modelId },
      },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);

    try {
      const { useAiSettingsStore } = require('@/stores/useAiSettingsStore');
      const ai = useAiSettingsStore.getState();
      const active = profiles.find(p => p.id === s.activeProfileId);
      const prov = active?.data?.settings?.provider || active?.data?.provider || 'openai';
      if (ai.defaults.provider === prov && ai.defaults.model !== modelId) {
        const prev = { provider: ai.defaults.provider, model: ai.defaults.model };
        ai.setDefaults({ model: modelId });
        emitAiRouteChanged(prev, { provider: prev.provider, model: modelId });
      }
    } catch {}
  },
  setOllamaBaseUrl(url) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: {
        ...p.data,
        settings: { ...(p.data.settings || { provider: p.data.provider, model: p.data.model, sampling: { temperature: 0.3, top_p: 1, max_output_tokens: null } }), ollamaBaseUrl: url },
      },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_ollama_base' } as any);
  },
  setApiKey(provider, apiKey) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: {
        ...p.data,
        keys: { ...(p.data.keys || {} as any), [provider]: { apiKey } },
      },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_api_key', provider } as any);
  },


  setKey(p, v) {
    const map: Record<UiProvider, 'openai'|'anthropic'|'gemini'|'ollama'> = {
      openai: 'openai', anthropic: 'anthropic', gemini: 'gemini', local: 'ollama',
    };
    const provider = map[p];
    if (provider === 'ollama') return;
    get().setApiKey(provider as 'openai'|'anthropic'|'gemini', v);
  },
  setDefaultProvider(p) {
    const map: Record<UiProvider, 'openai'|'anthropic'|'gemini'|'ollama'> = {
      openai: 'openai', anthropic: 'anthropic', gemini: 'gemini', local: 'ollama',
    };
    get().setProvider(map[p]);
  },
  togglePeek(p, on) {
    const cur = get().aiUiPeek || {};
    const nextPeek = { ...cur, [p]: (typeof on === 'boolean') ? on : !cur[p] };
    set({ aiUiPeek: nextPeek });
  },
  async savePersisted() {
    try {
      if (!(typeof window !== 'undefined')) return;
      const { profiles, activeProfileId } = get();
      const active = profiles.find(p => p.id === activeProfileId);
      if (!active) return;
      const provider = (active.data as any)?.settings?.provider || (active.data as any)?.provider || 'openai';
      const model = (active.data as any)?.settings?.model || (active.data as any)?.model || 'gpt-4o-mini';
      const keys = (active.data as any)?.keys || {};
      const models: Record<string,string> = { [provider]: model };
      if (!('crypto' in window) || !(window as any).isSecureContext || !crypto.subtle) {
        set({ persistInsecure: true });

        return;
      }
      const blob = await encryptJson({ keys: Object.fromEntries(Object.entries(keys).map(([k,v]) => [k, (v as { apiKey?: string })?.apiKey || ''] as [string, string])), defaultProvider: provider, models, ts: Date.now() });
      localStorage.setItem(STORAGE_KEY, blob);
    } catch (e) {

    }
  },
  async loadPersisted() {
    try {
      if (!(typeof window !== 'undefined')) return;
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const k of LEGACY_KEYS) { const legacy = localStorage.getItem(k); if (legacy) { raw = legacy; break; } }
      }
      if (!raw) return;

      interface PersistedData {
        keys?: Record<string, string | { apiKey?: string }>;
        defaultProvider?: string;
        models?: Record<string, string>;
      }

      let parsed: PersistedData | null = null;
      const secure = ('crypto' in window) && (window as any).isSecureContext && !!crypto.subtle;
      if (secure) parsed = (await decryptJson(raw)) as PersistedData;
      if (!secure) { try { parsed = JSON.parse(raw) as PersistedData; set({ persistInsecure: true }); } catch {} }
      if (!parsed) return;
      set(s => {
        const profiles = s.profiles.map(p => {
          if (p.id !== s.activeProfileId) return p;
            let data = { ...p.data };
            if (parsed.keys && typeof parsed.keys === 'object') {
              const existing = { ...(data.keys || {}) };
              Object.entries(parsed.keys).forEach(([prov, val]) => {
                if (val && (prov === 'openai' || prov === 'anthropic' || prov === 'google')) {
                  existing[prov] = { apiKey: typeof val === 'string' ? val : val.apiKey || '' };
                }
              });
              data = { ...data, keys: existing };
            }
            let prov = parsed.defaultProvider;
            if (prov === 'local') prov = 'ollama';


            let newModel: string | undefined;
            if (parsed.models && typeof parsed.models === 'object' && prov) {
              newModel = parsed.models[prov] || (parsed.defaultProvider ? parsed.models[parsed.defaultProvider] : undefined) || parsed.models[Object.keys(parsed.models)[0]];
            }


            if (prov && (prov === 'openai' || prov === 'anthropic' || prov === 'google' || prov === 'ollama')) {
              const modelToUse = (newModel && typeof newModel === 'string') ? newModel : data.model;
              if (modelToUse) {
                data = { ...data, provider: prov, model: modelToUse, settings: { ...(data.settings || {}), provider: prov, model: modelToUse } };
              }
            }
            return { ...p, data, updatedAt: Date.now() };
        });
        return { profiles } as Partial<SettingsStore>;
      });

      LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
      if (!localStorage.getItem(STORAGE_KEY) && secure) {
        try { const s = get(); const active = s.profiles.find(p => p.id === s.activeProfileId); if (active) await get().savePersisted(); } catch {}
      }
    } catch {}
  },
  async testKey(_p) {

    return true;
  },


  setSystemPrompt(text) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: { ...p.data, meta: { ...(p.data.meta || {}), systemPrompt: text } },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_system_prompt' } as any);
  },
  setTemperature(v) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: { ...p.data, sampling: { ...(p.data.sampling || {}), temperature: Math.max(0, Math.min(2, Number.isFinite(v) ? v : 0)) } },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_temperature' } as any);
  },
  setTopP(v) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: { ...p.data, sampling: { ...(p.data.sampling || {}), top_p: Math.max(0, Math.min(1, Number.isFinite(v) ? v : 1)) } as any },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_top_p' } as any);
  },
  setMaxOutputTokens(v) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: { ...p.data, sampling: { ...(p.data.sampling || {}), max_output_tokens: v === null ? null : Math.max(1, Math.floor(v as number)) } as any },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_max_tokens' } as any);
  },
  setJsonMode(enabled) {
    const s = get();
    const profiles = s.profiles.map(p => p.id === s.activeProfileId ? {
      ...p,
      data: { ...p.data, settings: { ...(p.data.settings || {} as any), jsonMode: !!enabled } as any },
      updatedAt: Date.now(),
    } : p);
    const next = { ...s, profiles, dirty: true } as SettingsStateV2;
    set(next); Adapter.save(next);
    telemetryEmit({ type: 'panel_set_json_mode', enabled } as any);
  },
}));
