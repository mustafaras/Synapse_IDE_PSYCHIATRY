


export type LocaleCode = "en" | "tr" | (string & {});
export type SectionId =
  | "rapid-triage" | "intake-hpi" | "risk-safety" | "scales-measures" | "mbc"
  | "diagnosis-ddx" | "treatment-plans" | "medications" | "psychotherapy"
  | "followup-monitoring" | "progress-notes-letters" | "psychoeducation"
  | "ethics-consent" | "orders-monitoring" | "camhs" | "groups-programs"
  | "case-forms-letters" | "neuro-medical" | "assessment" | (string & {});

export type ExampleVariant = {
  id: string;
  label: string;
  html: string;
};

export type Reference = {
  title: string;
  year?: string | number;
  journal?: string;
};

export type Command = {
  text: string;
  intent?: string;
  safety?: string;
};

export type LocaleBlock = {
  title?: string;
  info?: string;
  examples?: ExampleVariant[];
  references?: Reference[];
  commands?: Command[] | string[];
};

export type CardDoc = {
  schema_version: 1;
  id: string;
  sectionId: SectionId;
  tags?: string[];
  i18n: Record<LocaleCode, LocaleBlock>;
  meta?: {
    created_at?: string;
    updated_at?: string;
    author?: string;
  };
};

export type Card = {
  id: string;
  sectionId: SectionId;
  tags: string[];
  title: string;
  info: string;
  examples: ExampleVariant[];
  references: Reference[];
  commands: Command[];
  _sourcePath?: string;
};

export type Library = Card[];


export type TextSource =
  | { kind: 'inline'; value: string; format?: 'html' | 'md' }
  | { kind: 'ref'; path: string; format?: 'html' | 'md' };


export type ReferenceItem = {
  id?: string;
  title: string;
  authors?: string[];
  year?: string | number;
  venue?: string;
  doi?: string;
  url?: string;
};

export type ReferencesSource =
  | { kind: 'inline'; value: string; format?: 'html' | 'md' }
  | { kind: 'structured'; items: ReferenceItem[] }
  | { kind: 'ref'; path: string; format?: 'html' | 'md' };


export type PromptsSource =
  | { kind: 'inline'; value: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'ref'; path: string };


export type EvidenceSlice = {
  infoHtml?: string;
  exampleHtml?: string;
  referencesHtml?: string;
  promptsText?: string;
};


export type CardContent = {
  info?: TextSource;
  example?: TextSource;
  references?: ReferencesSource;
  prompts?: PromptsSource;
};


export type SliceCard = import('../lib/types').Card | {
  id: string;
  title?: string;
  type?: string;
  content?: CardContent;
  [k: string]: unknown;
};
