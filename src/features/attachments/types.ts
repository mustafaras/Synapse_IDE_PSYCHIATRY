export type AttachKind = 'text' | 'code' | 'json' | 'csv' | 'image' | 'pdf' | 'other';

export interface AttachmentMeta {
  id: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
  kind: AttachKind;
  hash: string;
  createdAt: number;
  previewUrl?: string | undefined;
  textExcerpt?: string | undefined;
  textFull?: string | undefined;
  parseWarnings?: string[] | undefined;
}
