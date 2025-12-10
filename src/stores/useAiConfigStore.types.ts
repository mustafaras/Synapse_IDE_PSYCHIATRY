


export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'custom';
export type ModelId = string;

export type Sampling = {
  temperature: number;
  top_p?: number;
  max_tokens?: number | undefined;
  json_mode: boolean;
  system_prompt?: string;
};

export type ProviderKey = { apiKey?: string; baseUrl?: string };

export type ProviderCaps = {
  streaming: boolean;
  jsonMode: boolean;
  supportsTopP: boolean;
  tokenLimit?: number;
};

export interface AiConfigState {
  provider: ProviderId;
  model: ModelId | null;
  sampling: Sampling;
  keys: Record<ProviderId, ProviderKey>;
  modelList: Record<ProviderId, ModelId[]>;
  caps: Record<ProviderId, ProviderCaps>;
  isStreaming: boolean;
  configVersion: number;

  registryVersion?: number;
  favorites: Record<ProviderId, ModelId[]>;
  keyStatus: Record<ProviderId, { state: 'unknown'|'verified'|'invalid'|'rate-limited'; checkedAt?: number; message?: string; retryAt?: number }>;
  setProvider(p: ProviderId): Promise<void>;
  setModel(m: ModelId): void;
  setSampling(patch: Partial<Sampling>): void;
  setKey(p: ProviderId, key: ProviderKey): Promise<void>;
  refreshModels(p?: ProviderId): Promise<void>;
  toggleFavorite(p: ProviderId, m: ModelId): void;
  refreshKeyStatus(p?: ProviderId): Promise<void>;
  _migrateLegacyStorage(): void;
  clearAllKeys(): void;
}


export interface RuntimeConfig {
  provider: ProviderId;
  model: ModelId | null;
  apiKey?: string;
  baseUrl?: string;
  headers?: Record<string,string>;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  streaming: boolean;
}
