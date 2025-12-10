import type { SupportedLang } from '@/services/editorBridge';

export type PsychiatryItemKind = 'prompt' | 'code';

export interface PsychiatryItem {
  id: string;
  kind: PsychiatryItemKind;
  label: string;
  description?: string;
  tags?: string[];
  payload: string;
  lang?: SupportedLang | string;
}

export interface PsychiatryPack {
  id: string;
  label: string;
  items: PsychiatryItem[];
  description?: string;
}

export type PsychiatryCatalog = PsychiatryPack[];
