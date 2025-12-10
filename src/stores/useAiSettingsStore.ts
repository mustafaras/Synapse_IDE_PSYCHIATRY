
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import type { AiConfigState, ProviderId, Sampling } from '@/stores/useAiConfigStore.types';


export type Provider = 'openai' | 'anthropic' | 'gemini';

export interface ApiKeyVault {
  openai?: string;
  anthropic?: string;
  gemini?: string;
  enc?: boolean;
  lastUpdated?: number;
}

export interface GenParams {
  provider: Provider;
  model: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
}

export interface AiUI {
  panelWidth: number;
  fontSize: number;
  compactMode: boolean;
  autoInsertToEditor: boolean;
  confirmOverwrite: boolean;
}

export interface ContextPrefs {
  scope: 'selection' | 'file' | 'workspace' | 'pinned';
  includeComments: boolean;
}


export interface Advanced {
  flushMs: number;
  maxRetries: number;
  retryBackoffMs: number;
}


export interface Flags {
  aiStreamingV2: boolean;
  logAiEvents: boolean;
  simpleStream?: boolean;
}

export interface AiSettingsState {
  keys: ApiKeyVault;
  defaults: GenParams;
  ui: AiUI;
  context: ContextPrefs;
  tokenBudget: number;
  advanced: Advanced;
  flags: Flags;
  hydrated: boolean;
  setKey: (p: Provider, key: string, opts?: { encrypt?: boolean; passphrase?: string }) => Promise<void>;
  clearKey: (p: Provider) => void;
  clearAllKeys: () => void;
  setDefaults: (patch: Partial<GenParams>) => void;
  setUI: (patch: Partial<AiUI>) => void;
  setContext: (patch: Partial<ContextPrefs>) => void;
  setTokenBudget: (n: number) => void;
  setAdvanced: (patch: Partial<Advanced>) => void;
  setFlags: (patch: Partial<Flags>) => void;
  getDecryptedKey: (p: Provider, passphrase?: string) => Promise<string | undefined>;
}


export const DEFAULT_MODELS: Record<Provider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'],
  anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
};

const STORAGE_KEY = 'synapse.ai.settings.v1';


async function maybeEncrypt(value: string, passphrase?: string): Promise<string> {
  if (!passphrase) return value;
  try {
    const { encryptString } = await import('@/utils/crypto/localVault');
    return encryptString(value, passphrase);
  } catch {
    return value;
  }
}
async function maybeDecrypt(value: string | undefined, enc: boolean | undefined, passphrase?: string): Promise<string | undefined> {
  if (!value) return undefined;
  if (!enc) return value;
  if (!passphrase) return undefined;
  try {
    const { decryptString } = await import('@/utils/crypto/localVault');
    return await decryptString(value, passphrase);
  } catch {
    return undefined;
  }
}


const initial: Omit<AiSettingsState, 'setKey' | 'clearKey' | 'clearAllKeys' | 'setDefaults' | 'setUI' | 'setContext' | 'setTokenBudget' | 'setAdvanced' | 'setFlags' | 'getDecryptedKey'> = {
  keys: { enc: false, lastUpdated: 0 },
  defaults: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 2048 },
  ui: { panelWidth: 450, fontSize: 13, compactMode: false, autoInsertToEditor: false, confirmOverwrite: true },
  context: { scope: 'selection', includeComments: false },
  tokenBudget: 8000,
  advanced: { flushMs: 48, maxRetries: 1, retryBackoffMs: 800 },
  flags: { aiStreamingV2: true, logAiEvents: false, simpleStream: true },
  hydrated: false,
};

export const useAiSettingsStore = create<AiSettingsState>()(
  persist(
    (set, get) => ({
      ...initial,
      async setKey(p, key, opts) {
        const { encrypt, passphrase } = opts || {};
        let stored = key;
        let encFlag = get().keys.enc === true;
        if (encrypt && passphrase) {
          stored = await maybeEncrypt(key, passphrase);
          encFlag = true;
        }
        set((s) => ({ keys: { ...s.keys, [p]: stored, enc: encFlag, lastUpdated: Date.now() } }));
      },

      clearKey(p) {
        set((s) => {
          const clone: ApiKeyVault = { ...s.keys };
          delete clone[p];
          clone.lastUpdated = Date.now();
          clone.enc = !!s.keys.enc;
          return { keys: clone } as Partial<AiSettingsState>;
        });
      },

      clearAllKeys() {
        set((s) => ({ keys: { enc: !!s.keys.enc, lastUpdated: Date.now() } } as Partial<AiSettingsState>));
      },

      setDefaults(patch) {
        set((s) => {
          const prev = s.defaults;
            const next = { ...prev, ...patch } as typeof s.defaults;
            const keys = Object.keys(next) as (keyof typeof next)[];
            const changed = keys.some(k => next[k] !== prev[k]);
            if (changed) {
              try {

                if (patch.provider && patch.provider !== useAiConfigStore.getState().provider) {

                  void useAiConfigStore.getState().setProvider(patch.provider as ProviderId);
                }
                if (patch.model && patch.model !== useAiConfigStore.getState().model) {
                  useAiConfigStore.getState().setModel(patch.model);
                }
                if (patch.temperature !== undefined || patch.maxTokens !== undefined || patch.topP !== undefined) {
                  const samplingPatch: Partial<Sampling> = {};
                  if (patch.temperature !== undefined) samplingPatch.temperature = patch.temperature;
                  if (patch.topP !== undefined) samplingPatch.top_p = patch.topP;
                  if (patch.maxTokens !== undefined) samplingPatch.max_tokens = patch.maxTokens;
                  if (Object.keys(samplingPatch).length) {
                    useAiConfigStore.getState().setSampling(samplingPatch);
                  }
                }
              } catch {}
              return { defaults: next } as Partial<AiSettingsState>;
            }
            return {} as Partial<AiSettingsState>;
        });
      },

      setUI(patch) { set((s) => ({ ui: { ...s.ui, ...patch } })); },
      setContext(patch) { set((s) => ({ context: { ...s.context, ...patch } })); },
      setTokenBudget(n) { set({ tokenBudget: n }); },
      setAdvanced(patch) { set((s) => ({ advanced: { ...s.advanced, ...patch } })); },
      setFlags(patch) { set((s) => ({ flags: { ...s.flags, ...patch } })); },


      async getDecryptedKey(p, passphrase) {
        const { keys } = get();
        const raw = (keys as Record<Provider, string | undefined>)[p];
        if (!raw) return undefined;
        return maybeDecrypt(raw, keys.enc, passphrase);
      },
    }) as AiSettingsState,
    {
      name: STORAGE_KEY,
      version: 3,
  onRehydrateStorage: () => (_state, error) => {
        try {
          if (!error) {

            useAiSettingsStore.setState({ hydrated: true });
            try { window.dispatchEvent(new CustomEvent('ai:settingsHydrated')); } catch {}
          }
        } catch {}
      },
      migrate: (state: unknown, version) => {
        const draft = state as Record<string, unknown> | null | undefined;
        try {
          if (version < 3 && draft && typeof draft === 'object') {
            const d = draft as { defaults?: { provider?: string }; keys?: Record<string, unknown> };
            if (d.defaults?.provider === 'google') d.defaults.provider = 'gemini';
            if (d.keys && 'google' in d.keys) {
              if (!( 'gemini' in d.keys) && d.keys.google) (d.keys as Record<string, unknown>).gemini = d.keys.google;
              delete (d.keys as Record<string, unknown>).google;
            }
          }
        } catch {}
        return draft as typeof state;
      },
    }
  )
);


export const selectProvider = (_s: AiSettingsState) => AiSelectors.provider(useAiConfigStore.getState() as AiConfigState);

export const selectModel = (_s: AiSettingsState) => AiSelectors.model(useAiConfigStore.getState() as AiConfigState) as string;
export const selectUI = (s: AiSettingsState) => s.ui;
export const selectTokenBudget = (s: AiSettingsState) => s.tokenBudget;
export const selectAdvanced = (s: AiSettingsState) => s.advanced;
export const selectKeysEnc = (s: AiSettingsState) => s.keys.enc === true;
export const selectHasAnyKey = (s: AiSettingsState) => Boolean(s.keys.openai || s.keys.anthropic || s.keys.gemini);
export const selectFlags = (s: AiSettingsState) => s.flags;


let __effectiveRouteCache: { provider: string; model: string } = { provider: 'openai', model: '' };

export const selectEffectiveRoute = (_s: AiSettingsState) => {
  const r = AiSelectors.runtime(useAiConfigStore.getState() as AiConfigState) as { provider?: string; model?: string } | null;
  const provider = r?.provider || __effectiveRouteCache.provider;
  const model = r?.model || '';
  if (__effectiveRouteCache.provider !== provider || __effectiveRouteCache.model !== model) {
    __effectiveRouteCache = { provider, model };
  }
  return __effectiveRouteCache;
};


