export type SceneId =
  | 'code_review'
  | 'bug_fix'
  | 'doc_writer'
  | 'rag_search'
  | 'brainstorm';

export interface SceneMeta {
  id: SceneId;
  title: string;
  description?: string;
}

export interface ScenePatch {
  sampling?: Partial<import('@/lib/settings/settings.types').SettingsPayloadV2['sampling']>;
  flags?: Partial<import('@/lib/settings/settings.types').SettingsPayloadV2['flags']>;
  systemPromptKey?: string | null;
}

export interface Scene {
  meta: SceneMeta;
  patch: ScenePatch;
}
