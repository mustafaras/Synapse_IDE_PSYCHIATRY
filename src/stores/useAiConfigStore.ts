import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AiConfigState, ModelId, ProviderId, ProviderKey, RuntimeConfig, Sampling } from './useAiConfigStore.types';

type UnknownRecord = Record<string, unknown>;
import { __MODEL_REGISTRY_VERSION, getCaps, getDefaultModel, getStaticModels, listModelsDynamic } from '../ai/modelRegistry';


function logConfigChanged(_prev: { provider: ProviderId; model: ModelId | null }, _next: { provider: ProviderId; model: ModelId | null }) {  }
function logSamplingChanged(_sampling: Sampling) {  }

const STORAGE_KEY = 'synapse.aiConfig.v3';
const DEFAULT_PROVIDER: ProviderId = 'openai';
const DEFAULT_SAMPLING: Sampling = { temperature: 0.2, top_p: 1, max_tokens: 2048, json_mode: false, system_prompt: '' };

type Internal = {

  _abortActiveStream: (reason?: string) => void;
  _setAborter(fn: ((reason?: string) => void) | undefined): void;
};

let __refreshSeq = 0;


let _lastSet: (patch: Partial<AiConfigState & Internal>) => void;
let _lastGet: () => (AiConfigState & Internal);
type UpdateOpts = { bumpVersion?: boolean };

type SlicePartial = Partial<AiConfigState & Internal>;
type SetFn = (partial: SlicePartial | ((state: AiConfigState & Internal) => SlicePartial)) => void;
const createSlice = (set: SetFn, get: () => (AiConfigState & Internal)): (AiConfigState & Internal) => ({
  _abortActiveStream: () => {},
  provider: DEFAULT_PROVIDER,
  model: getDefaultModel(DEFAULT_PROVIDER),
  sampling: DEFAULT_SAMPLING,
  keys: { openai: {}, anthropic: {}, gemini: {}, ollama: {}, custom: {} },
  modelList: {
    openai: getStaticModels('openai'),
    anthropic: getStaticModels('anthropic'),
  gemini: getStaticModels('gemini'),
    ollama: getStaticModels('ollama'),
    custom: [],
  },
  favorites: { openai: [], anthropic: [], gemini: [], ollama: [], custom: [] },
  caps: {
    openai: getCaps('openai'),
    anthropic: getCaps('anthropic'),
  gemini: getCaps('gemini'),
    ollama: getCaps('ollama'),
    custom: getCaps('custom'),
  },
  keyStatus: { openai:{state:'unknown'}, anthropic:{state:'unknown'}, gemini:{state:'unknown'}, ollama:{state:'unknown'}, custom:{state:'unknown'} },
  isStreaming: false,
  configVersion: 0,
  registryVersion: __MODEL_REGISTRY_VERSION,
  async setProvider(p: ProviderId, opts: UpdateOpts = { bumpVersion: true }) {
    const prev = { provider: get().provider, model: get().model } as const;

    const caps = getCaps(p);
    const modelList = getStaticModels(p);
    set((s: AiConfigState & Internal) => {
      const sampling: Sampling = {
        ...s.sampling,
        json_mode: caps.jsonMode ? s.sampling.json_mode : false,
        max_tokens: clampMaxTokens(s.sampling.max_tokens, caps.tokenLimit),
      };
      const nextModel = resolveModel(s.model, modelList, p);

      if (s.model && s.model !== nextModel) {
        try { window.dispatchEvent(new CustomEvent('ai:modelAutoAdjusted', { detail: { fromProvider: prev.provider, toProvider: p, previousModel: s.model, newModel: nextModel } })); } catch {  }
      }
      const next = {
        provider: p,
        caps: { ...s.caps, [p]: caps },
        modelList: { ...s.modelList, [p]: modelList },
        model: nextModel,
        sampling,
        configVersion: opts.bumpVersion === false ? s.configVersion : s.configVersion + 1,
      };
      logConfigChanged(prev, { provider: p, model: nextModel });
      return next;
    });
    void get().refreshModels(p);
  },
  setModel(m: ModelId, opts: UpdateOpts = { bumpVersion: true }) {
    const prev = { provider: get().provider, model: get().model } as const;
    set((s: AiConfigState & Internal) => {
      const activeProvider = s.provider;
      const validModels = s.modelList?.[activeProvider] || [];
      if (!validModels.includes(m)) {

        try { window.dispatchEvent(new CustomEvent('ai:modelProviderMismatch', { detail: { provider: activeProvider, attemptedModel: m } })); } catch {  }
        return {  configVersion: opts.bumpVersion === false ? s.configVersion : s.configVersion + 1 };
      }
      const next: Partial<AiConfigState & Internal> = { model: m, configVersion: opts.bumpVersion === false ? s.configVersion : s.configVersion + 1 };
      logConfigChanged(prev, { provider: s.provider, model: m });
      return next;
    });
  },
  setSampling(patch: Partial<Sampling>, opts: UpdateOpts = { bumpVersion: true }) {
    set((s: AiConfigState & Internal) => {
      const caps = s.caps[s.provider];
      const next: Sampling = {
        ...s.sampling,
        ...patch,
        json_mode: caps.jsonMode ? (patch.json_mode ?? s.sampling.json_mode) : false,
        max_tokens: clampMaxTokens(patch.max_tokens ?? s.sampling.max_tokens, caps.tokenLimit),
      };
      logSamplingChanged(next);
  return { sampling: next, configVersion: opts.bumpVersion === false ? s.configVersion : s.configVersion + 1 };
    });
  },
  async setKey(p: ProviderId, key: ProviderKey) {
    set((s: AiConfigState & Internal) => ({ keys: { ...s.keys, [p]: { ...s.keys[p], ...key } } }));

  set((s: AiConfigState & Internal) => ({ keyStatus: { ...s.keyStatus, [p]: { state:'unknown', checkedAt: Date.now() } } }));
    await get().refreshModels(p);
  },
  async refreshModels(p?: ProviderId) {
    const provider = p ?? get().provider;
    const seq = ++__refreshSeq;
    const staticList = getStaticModels(provider);
    set((s: AiConfigState & Internal) => ({
      modelList: { ...s.modelList, [provider]: staticList },
      model: resolveModel(s.model, staticList, provider),
    }));
    const keys = get().keys[provider] ?? {};
    const remote = await listModelsDynamic(provider, keys).catch(() => []);
    if (seq !== __refreshSeq) return;
    const merged = Array.from(new Set([...staticList, ...remote]));
    set((s: AiConfigState & Internal) => ({
      modelList: { ...s.modelList, [provider]: merged },
      model: resolveModel(s.model, merged, provider),
    }));
  },
  toggleFavorite(p: ProviderId, m: ModelId) {
    set((s: AiConfigState & Internal) => {
      const list = s.favorites[p] || [];
      const has = list.includes(m);
      const next = has ? list.filter(x => x !== m) : [...list, m];
  return { favorites: { ...s.favorites, [p]: next } } as Partial<AiConfigState & Internal>;
    });
  },
  clearAllKeys() {
    set(() => ({
      keys: { openai: {}, anthropic: {}, gemini: {}, ollama: {}, custom: {} },
      keyStatus: { openai:{state:'unknown'}, anthropic:{state:'unknown'}, gemini:{state:'unknown'}, ollama:{state:'unknown'}, custom:{state:'unknown'} },
    }));
  },
  async refreshKeyStatus(p?: ProviderId) {
    const provider = p ?? get().provider;
    const key = get().keys[provider]?.apiKey;
  const existing = get().keyStatus[provider];
    if (existing?.retryAt && Date.now() < existing.retryAt) {
      return;
    }
    if (!key && provider !== 'ollama') {
  set((s: AiConfigState & Internal) => ({ keyStatus: { ...s.keyStatus, [provider]: { state:'invalid', message:'No key set', checkedAt: Date.now() } } }));
      return;
    }
  const update = (state: 'unknown'|'verified'|'invalid'|'rate-limited', message?: string, retryAt?: number) => { set(s => ({ keyStatus: { ...s.keyStatus, [provider]: { state, message, checkedAt: Date.now(), retryAt } } })); };
    try {
      if (provider === 'openai') {

        const r = await fetch('/api/openai/verify', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ key }) });
        if (r.status === 200) { update('verified'); return; }
        if (r.status === 429) { update('rate-limited','Rate limited', Date.now()+60_000); return; }
        if ([401,403].includes(r.status)) { update('invalid', 'Unauthorized'); return; }
        update('unknown'); return;
      }
      if (provider === 'anthropic') {
        const r = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': key || '', 'anthropic-version': '2023-06-01' } });
        if (r.status === 200) { update('verified'); return; }
        if (r.status === 429) { update('rate-limited','Rate limited', Date.now()+60_000); return; }
        if ([401,403].includes(r.status)) { update('invalid','Unauthorized'); return; }
        update('unknown'); return;
      }
      if (provider === 'gemini') {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(key || '')}`);
        if (r.status === 200) { update('verified'); return; }
        if (r.status === 429) { update('rate-limited','Rate limited', Date.now()+60_000); return; }
        if ([400,401,403].includes(r.status)) { update('invalid'); return; }
        update('unknown'); return;
      }
      if (provider === 'ollama') {

        const base = get().keys.ollama.baseUrl || 'http://localhost:11434';
        const url = `${base.replace(/\/$/,'')}/api/tags`;
        const r = await fetch(url);
        if (r.ok) { update('verified'); return; }
        update('invalid', 'Ollama unreachable');
      }

      if (provider === 'custom') {
        const base = get().keys.custom.baseUrl;
        if (!base) { update('unknown'); return; }
        try {
          const r = await fetch(base, { method:'HEAD' });
          if (r.ok) { update('verified'); return; }
          update('invalid');
        } catch { update('invalid'); }
      }
    } catch (e) {
      const msg = (e as Error)?.message || 'Unknown error';
      update('unknown', msg);
    }
  },
  async _migrateLegacyStorage() {
    try {
      const legacyProvider = localStorage.getItem('ai.provider') as ProviderId | null;
      const legacyModel = localStorage.getItem('ai.model') as string | null;
      if (legacyProvider) {
  await get().setProvider(legacyProvider as ProviderId);
    if (legacyModel) await get().setModel(legacyModel as ModelId);
        localStorage.removeItem('ai.provider');
        localStorage.removeItem('ai.model');
      }
    } catch {}
  },
  _setAborter(fn: ((reason?: string) => void) | undefined) { set((s) => ({ ...s, _abortActiveStream: fn || (() => {}) })); },
});

export const useAiConfigStore = create<AiConfigState & Internal>()(persist(
  (set, get) => { _lastSet = set as unknown as (patch: Partial<AiConfigState & Internal>) => void; _lastGet = get; return createSlice(set as unknown as SetFn, get); },
  { name: STORAGE_KEY,
    version: 3,
    migrate: async (prev: unknown, from: number) => {
      if (!prev) return prev;

  const draft = prev as UnknownRecord;
      try {
        if (from < 3) {
          const draftObj = draft as UnknownRecord & { provider?: ProviderId | 'google' };
          if (draftObj.provider === 'google') draftObj.provider = 'gemini';
          const sections = ['keys','modelList','favorites','caps','keyStatus'] as const;
          for (const section of sections) {
            const bucket = draftObj[section] as UnknownRecord | undefined;
            if (bucket && 'google' in bucket && !('gemini' in bucket)) {
              const b = bucket as UnknownRecord & { gemini?: unknown; google?: unknown };
              b.gemini = b.google;
            }
            if (bucket && 'google' in bucket) {
              delete (bucket as UnknownRecord & { google?: unknown }).google;
            }
          }
        }
      } catch {}
      return draft;
    },
    onRehydrateStorage: () => () => {
      try {
        const st = _lastGet();
        if (st.registryVersion === __MODEL_REGISTRY_VERSION) return;
        const providers: ProviderId[] = ['openai','anthropic','gemini','ollama','custom'];
  const updated: Record<ProviderId, string[]> = { ...st.modelList } as Record<ProviderId, string[]>;
        let mutated = false;
        for (const p of providers) {
          const seeds = getStaticModels(p);
          const existing = updated[p] || [];
          const merged = Array.from(new Set([...seeds, ...existing]));
          if (merged.length !== existing.length) { updated[p] = merged; mutated = true; }
        }
        if (mutated || st.registryVersion !== __MODEL_REGISTRY_VERSION) {
          _lastSet({ modelList: updated, registryVersion: __MODEL_REGISTRY_VERSION });
        }
      } catch {}
    }
  }
));


function clampMaxTokens(v: number | undefined, cap?: number) {
  if (v == null) return v;
  if (!cap) return v;
  return Math.min(v, cap);
}
function resolveModel(current: ModelId | null, list: ModelId[], provider: ProviderId): ModelId | null {
  if (current && list.includes(current)) return current;
  return list.length ? list[0] : getDefaultModel(provider);
}


type _S = AiConfigState;
export const AiSelectors = {
  provider: (s: _S) => s.provider,
  model: (s: _S) => s.model,
  sampling: (s: _S) => s.sampling,
  caps: (s: _S) => s.caps[s.provider],
  modelsForActive: (s: _S) => s.modelList[s.provider] ?? [],
  keysForActive: (s: _S) => s.keys[s.provider] ?? {},
  favoritesForActive: (s: _S) => s.favorites[s.provider] ?? [],
  keyStatusForActive: (s: _S) => s.keyStatus[s.provider] || { state:'unknown' },

  apiKey: (s: _S) => { const k = s.keys?.[s.provider]?.apiKey; return k || undefined; },
  baseUrl: (s: _S) => { const k = s.keys?.[s.provider]?.baseUrl; return k || undefined; },
  headers: (_s: _S) => ({} as Record<string,string>),
  runtime: (() => {
    let cache: RuntimeConfig | null = null;
    let sig = '';
    return (s: _S): RuntimeConfig => {
      const apiKey = s.keys?.[s.provider]?.apiKey;
      const baseUrl = s.keys?.[s.provider]?.baseUrl;
      const sampling = s.sampling;
      const nextSig = [
        s.provider,
        s.model || '',
        apiKey || '',
        baseUrl || '',
        sampling?.temperature ?? '',
        sampling?.top_p ?? '',
        sampling?.max_tokens ?? '',
        sampling?.json_mode ? '1' : '0'
      ].join('|');
      if (cache && sig === nextSig) return cache;

      const runtime: RuntimeConfig = {
        provider: s.provider,
        model: s.model,
        streaming: true,
      };
      if (apiKey) runtime.apiKey = apiKey;
      if (baseUrl) runtime.baseUrl = baseUrl;
      const headers = AiSelectors.headers(s); if (headers && Object.keys(headers).length) runtime.headers = headers;
      if (typeof sampling?.temperature === 'number') runtime.temperature = sampling.temperature;
      if (typeof sampling?.top_p === 'number') runtime.topP = sampling.top_p;
      if (typeof sampling?.max_tokens === 'number') runtime.maxTokens = sampling.max_tokens;
      if (typeof sampling?.json_mode === 'boolean') runtime.jsonMode = sampling.json_mode;
      cache = Object.freeze(runtime);
      sig = nextSig;
      return cache;
    };
  })(),
};


export const selectCurrentProvider = AiSelectors.provider;
export const selectCurrentModel = AiSelectors.model;
export const selectSampling = AiSelectors.sampling;
export const selectApiKey = AiSelectors.apiKey;
export const selectBaseUrl = AiSelectors.baseUrl;
export const selectHeaders = AiSelectors.headers;
export const selectRuntimeConfig = AiSelectors.runtime;
