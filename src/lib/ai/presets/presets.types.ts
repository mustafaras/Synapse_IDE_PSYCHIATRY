import type { ProviderId } from '@/lib/settings/settings.types';
import type { SettingsPayloadV2 } from '@/lib/settings/settings.types';

export type PresetId =
  | 'deterministic_coding'
  | 'balanced_chat'
  | 'creative_ideation'
  | 'rag_qa'
  | 'tool_use_heavy';

export interface PresetMeta {
  id: PresetId;
  title: string;
  description?: string;
  providers?: ProviderId[];
  models?: string[];
}

export interface PresetPatch {

  provider?: ProviderId;
  model?: string;
  sampling?: Partial<SettingsPayloadV2['sampling']>;
  flags?: Partial<SettingsPayloadV2['flags']>;
  embeddings?: Partial<SettingsPayloadV2['embeddings']>;
}

export interface Preset {
  meta: PresetMeta;
  patch: PresetPatch;
}

export interface PresetDiffItem {
  path: string;
  from: unknown;
  to: unknown;
}

export interface PresetApplyPlan {
  presetId: PresetId;
  diffs: PresetDiffItem[];
  willChangeModel?: boolean;
}