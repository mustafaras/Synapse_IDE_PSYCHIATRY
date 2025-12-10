


export type Section8Key = 'psqi' | 'ghq12' | 'edeq';

export interface TitleMeta {
  displayTitle: string;
  shortTitle: string;
  badge?: string;
  aliases?: string[];
}

export const SECTION8_TITLES: Record<Section8Key, TitleMeta> = {
  psqi: {
    displayTitle: 'PSQI — Pittsburgh Sleep Quality Index (1-month)',
    shortTitle:  'PSQI — Pittsburgh Sleep Quality Index',
    badge: 'Demo',
    aliases: [
      'PSQI - Pittsburgh Sleep Quality Index',
      'PSQI — Pittsburgh SLeep Quality Index',
      'PSQI (Worksheet)', 'PSQI (Work…)', 'PSQI — … (Work…)'
    ]
  },
  ghq12: {
    displayTitle: 'GHQ-12 — General Health Questionnaire (12-item)',
    shortTitle:  'GHQ-12 — General Health Questionnaire',
    badge: 'Demo',
    aliases: [
      'GHQ12 — General Health Questionnaire',
      'GHQ-12 - General Health Questionnaire',
      'GHQ 12 (Worksheet)', 'GHQ-12 (Work…)'
    ]
  },
  edeq: {
    displayTitle: 'EDE-Q — Eating Disorder Examination Questionnaire (28-day)',
    shortTitle:  'EDE-Q — Eating Disorder Examination',
    badge: 'Demo',
    aliases: [
      'EDE-Q — Eating Disorder Examination Question…',
      'EDE Q — Eating Disorder Examination Questionnaire',
      'EDE-Q (Worksheet)', 'EDE-Q (Work…)'
    ]
  }
};

export function resolveSection8Key(input: string | undefined | null): Section8Key | undefined {
  if (!input) return undefined;
  const raw = String(input);
  const id = raw.toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9_]/g,'');
  if (id === 'psqi') return 'psqi';
  if (id === 'ghq12') return 'ghq12';
  if (id === 'edeq') return 'edeq';

  const low = raw.toLowerCase();
  for (const [k, meta] of Object.entries(SECTION8_TITLES) as [Section8Key, TitleMeta][]) {
    if (meta.aliases?.some(a => a.toLowerCase().includes(low) || low.includes(a.toLowerCase()))) return k;
  }
  return undefined;
}
