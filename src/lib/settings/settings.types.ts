export type ProviderId = 'openai' | 'anthropic' | 'google' | 'ollama' | 'proxy';

export interface SamplingConfig {
  temperature: number;
  top_p: number;
  max_output_tokens?: number | null;
}

export interface EmbeddingsConfig {
  provider: ProviderId;
  model: string;
  dim?: number | null;
}

export interface ProviderSecrets {
  apiKey?: string;
  proxyUrl?: string;
  rememberSecrets?: boolean;
  source?: 'manual' | 'env';
}

export interface SettingsPayloadV2 {
  version: 2;
  provider: ProviderId;
  model: string;
  sampling: SamplingConfig;
  embeddings: EmbeddingsConfig;
  flags: {
    wrapCode: boolean;
    compactBubbles: boolean;
    confirmBeforeApply: boolean;
    shareSelection: boolean;
    telemetryUsageOnly: boolean;
    ligatures?: boolean;
  };
  secrets: ProviderSecrets;

  settings?: {
    provider: ProviderId;
    model: string;
    sampling?: Partial<SamplingConfig>;

    ollamaBaseUrl?: string | null;
  };

  keys?: {
    openai?: { apiKey?: string };
    anthropic?: { apiKey?: string };
    google?: { apiKey?: string };
  };

  meta?: {

    lastPresetId?: string | null;

  lastSceneId?: import('@/lib/ai/scenes/scenes.types').SceneId | null;
  schedulerPolicyOverride?: Partial<Record<ProviderId, import('@/lib/ai/scheduler/scheduler.types').RatePolicy>>;
  };
}

export interface SettingsProfile {
  id: string;
  name: string;
  data: SettingsPayloadV2;
  updatedAt: number;
  isDefault?: boolean;

  keymap?: import('@/lib/keys/keymap.types').KeymapPayloadV1;
}

export interface SettingsStateV2 {
  profiles: SettingsProfile[];
  activeProfileId: string;
  dirty: boolean;
}
