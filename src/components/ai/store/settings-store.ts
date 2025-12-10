import { create } from 'zustand';

export type AssistantSettings = {
  settings: { provider: string; model: string; temperature?: number; top_p?: number; ollamaBaseUrl?: string | null };
  ui: { codeWrap?: boolean; compact?: boolean; safeModeConfirmEdits?: boolean } & Record<string, unknown>;
  keys?: Record<string, string> | null;
};

type Store = {
  data: AssistantSettings;
  setProvider(p: string): void;
  setModel(m: string): void;
  setTemperature(t: number): void;
  setTopP(v: number): void;
  setUIPref<K extends keyof Store['data']['ui']>(k: K, v: Store['data']['ui'][K]): void;
  setBudgetAlloc?(v: any): void;
};

export const useAssistantSettings = create<Store>((set) => ({
  data: {
    settings: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.3, top_p: 1, ollamaBaseUrl: null },
    ui: { codeWrap: true, compact: false, safeModeConfirmEdits: false },
    keys: null,
  },
  setProvider(p) { set(s => ({ data: { ...s.data, settings: { ...s.data.settings, provider: p } } })); },
  setModel(m) { set(s => ({ data: { ...s.data, settings: { ...s.data.settings, model: m } } })); },
  setTemperature(t) { set(s => ({ data: { ...s.data, settings: { ...s.data.settings, temperature: t } } })); },
  setTopP(v) { set(s => ({ data: { ...s.data, settings: { ...s.data.settings, top_p: v } } })); },
  setUIPref(k, v) { set(s => ({ data: { ...s.data, ui: { ...s.data.ui, [k]: v } } })); },
  setBudgetAlloc(v) { set(s => ({ data: { ...s.data, ui: { ...s.data.ui, budgetAlloc: v } } })); },
}));
