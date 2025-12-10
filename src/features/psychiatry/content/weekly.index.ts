



import type { RPBundle } from '../rightPanelTypes';
import {
  assertContentPack,
  type ContentPack,
  type ExampleForm,
  packToBundle,
} from './section8.index';

export type WeeklyKey = 'oasis' | 'pdss_sr' | 'spin' | 'asrm' | 'epds' | 'ybocs';

export function normalizeWeeklyId(id: string): WeeklyKey | null {
  const raw = (id || '').toLowerCase().replace(/[^a-z0-9_-]+/g, '');
  const map: Record<string, WeeklyKey> = {
    oasis: 'oasis',
    'pdss-sr': 'pdss_sr', pdss_sr: 'pdss_sr', pdss: 'pdss_sr',
    spin: 'spin',
    asrm: 'asrm',
    epds: 'epds',
    ybocs: 'ybocs', 'y-bocs': 'ybocs', 'y_bocs': 'ybocs',
  };
  return map[raw] ?? null;
}


const scale = (id: string, label: string, anchors: string[] = ['0 None','1 Mild','2 Moderate','3 Severe','4 Extreme']): ExampleForm['fields'][number] => ({
  id, type: 'scale', label, min: 0, max: anchors.length - 1, anchors,
});

export const WEEKLY_CONTENT: Record<WeeklyKey, ContentPack> = {
  oasis: {
    title: 'OASIS — Overall Anxiety Severity and Impairment Scale',
    shortTag: 'Anxiety (7d)',
    overview: 'Five-item scale of anxiety severity and related impairment over the past 7 days. Higher totals reflect greater burden.',
    clinicalUse: [
      'Track anxiety symptom change over time (weekly window).',
      'Screen for clinically significant anxiety (programs commonly use thresholds around ≥8).',
      'Complement disorder-specific tools or functional measures in care plans.'
    ],
    psychometrics: ['Brief, reliable; suitable for serial use in MBC workflows.'],
    exampleForm: {
      title: 'OASIS (Paraphrased Weekly Demo)',
      instructions: 'Think about the past 7 days. Choose the option that best fits.',
      fields: [
        scale('oasis_freq', 'How often did you feel anxious, tense, or on edge?', ['0 Never','1 Rarely','2 Sometimes','3 Often','4 Almost always']),
        scale('oasis_intensity', 'How intense was your anxiety when present?', ['0 Not at all','1 A little','2 Moderate','3 Quite a bit','4 Extreme']),
        scale('oasis_avoid', 'How much did you avoid situations because of anxiety?', ['0 Not at all','1 A little','2 Somewhat','3 Much','4 Extreme']),
        scale('oasis_interfere_social', 'How much did anxiety interfere with social life?', ['0 Not at all','1 A little','2 Somewhat','3 Much','4 Extreme']),
        scale('oasis_interfere_work', 'How much did anxiety interfere with work/home responsibilities?', ['0 Not at all','1 A little','2 Somewhat','3 Much','4 Extreme'])
      ],
      scoring: { type: 'sum', details: 'Add 0–4 across five items (range 0–20). Programs often flag ≥8 as clinically significant. No computation here.' }
    },
    prompts: [
      'Create a code in HTML as page that captures a weekly OASIS with five 0–4 scales and a summary panel (no calculation).',
      'Compose a code in HTML as form that clearly labels frequency, intensity, avoidance, and interference domains for OASIS.',
      'Make a code in HTML as page with fieldset/legend groups for OASIS and print-friendly styling (no external CSS).',
      'Create a code in HTML as page that stores OASIS selections and renders a copy-paste summary for notes.',
      'Compose a code in HTML as form with keyboard-accessible radio groups and aria-describedby for anchor text.',
      'Make a code in HTML as page that displays a caution if many 3/4 selections are chosen (informational only).',
      'Create a code in HTML as page that lets the user add a brief free-text comment about anxiety triggers this week.',
      'Compose a code in HTML as form that shows a static note: programs commonly flag totals ≥8 (no auto-score).',
      'Make a code in HTML as page with a button to print a one-page OASIS summary.',
      'Create a code in HTML as page that includes date and who completed fields at the top.'
    ],
    references: [
      { label: 'Norman SB et al. OASIS psychometrics (2006).', url: 'https://pubmed.ncbi.nlm.nih.gov/17154731/' },
      { label: 'Measurement-Based Care overview (APA / practice resources).', url: 'https://www.psychiatry.org/' }
    ]
  },

  pdss_sr: {
    title: 'PDSS‑SR — Panic Disorder Severity (Self‑Report)',
    shortTag: 'Panic (7d)',
    overview: 'Seven-item self‑report scale of panic symptoms and impairment over the past week. Paraphrased demo only.',
    clinicalUse: [
      'Monitor weekly panic severity and impairment.',
      'Contextualize treatment response alongside avoidance and anticipatory anxiety.',
      'Support shared decision‑making and treatment adjustments.'
    ],
    cautions: ['Use paraphrased items here; refer to official instrument for wording/scoring if deploying clinically.'],
    exampleForm: {
      title: 'PDSS‑SR (Paraphrased Weekly Demo)',
      instructions: 'Past 7 days. Choose the best option.',
      fields: [
        scale('pdss_freq', 'How often did panic attacks occur?'),
        scale('pdss_distress', 'How distressing were the attacks?'),
        scale('pdss_anticip', 'Anticipatory anxiety (worry about next attack)?'),
        scale('pdss_avoid_situ', 'Avoidance of situations due to fear of attacks?'),
        scale('pdss_avoid_physical', 'Avoidance of physical sensations/activity (fear of triggering)?'),
        scale('pdss_impair_work', 'Interference with work/home responsibilities?'),
        scale('pdss_impair_social', 'Interference with social life?')
      ],
      scoring: { type: 'sum', details: 'Sum 0–4 across seven items (range 0–28). Programs vary; do not compute here.' },
      requiresLicense: true
    },
    prompts: [
      'Create a code in HTML as page for a weekly PDSS‑SR demo with seven 0–4 scales and clear legends.',
      'Compose a code in HTML as form that summarizes panic frequency, anticipatory anxiety, avoidance, and impairment.',
      'Make a code in HTML as page that includes a free‑text box for triggers and coping strategies used this week.',
      'Create a code in HTML as page with a static note reminding that official scoring rules apply in clinical use.',
      'Compose a code in HTML as form with required attributes on all PDSS‑SR items.',
      'Make a code in HTML as page that renders a printable summary (no computation).',
      'Create a code in HTML as page that includes date/time completed and initials fields.',
      'Compose a code in HTML as form using <fieldset>/<legend> for semantic grouping.'
    ],
    references: [
      { label: 'Houck PR et al. PDSS‑SR properties. J Psychiatr Res. 2002.', url: 'https://pubmed.ncbi.nlm.nih.gov/12490198/' },
      { label: 'Panic disorder assessment overview (review).', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'Official PDSS‑SR wording/scoring may require permission; this demo uses paraphrased items.'
  },

  spin: {
    title: 'SPIN — Social Phobia Inventory',
    shortTag: 'Social Anxiety (7d)',
    overview: 'Self‑report inventory of social anxiety symptoms/severity over the past week. Paraphrased demo subset.',
    clinicalUse: [
      'Monitor social anxiety symptom burden weekly.',
      'Track change with psychotherapy/exposure or medication.',
      'Contextualize impairment and avoidance for treatment planning.'
    ],
    cautions: ['Paraphrased demo subset shown; refer to official instrument when used clinically.'],
    exampleForm: {
      title: 'SPIN (Paraphrased Weekly Demo — Subset)',
      instructions: 'Past 7 days. Rate from 0 (Not at all) to 4 (Extremely).',
      fields: [
        scale('spin_fear_eval', 'Fear of being judged negatively by others?'),
        scale('spin_avoid_groups', 'Avoided social gatherings or groups?'),
        scale('spin_blush', 'Blushing, shaking, or other visible anxiety signs?'),
        scale('spin_speaking', 'Fear or difficulty speaking in front of others?'),
        scale('spin_interfere', 'Did anxiety interfere with social or work life?'),
        scale('spin_safety_beh', 'Use of “safety behaviors” (e.g., avoiding eye contact)?'),
        scale('spin_endure', 'Endured social situations with marked distress?'),
        scale('spin_anticip', 'Anticipatory anxiety before social events?')
      ],
      scoring: { type: 'sum', details: 'Sum 0–4 across items (full instrument has 17 items). No calculation here.' },
      requiresLicense: true
    },
    prompts: [
      'Create a code in HTML as page for a weekly SPIN demo (subset) with clear labels and anchors 0–4.',
      'Compose a code in HTML as form that groups SPIN items into fear, avoidance, and impairment domains.',
      'Make a code in HTML as page that warns this is a paraphrased demo and not a full instrument.',
      'Create a code in HTML as page that includes a free‑text box for key feared situations this week.',
      'Compose a code in HTML as form with keyboard accessible radio groups and aria-describedby anchor text.',
      'Make a code in HTML as page to render a print‑ready one‑page summary.',
      'Create a code in HTML as page that includes date and initials fields for documentation.',
      'Compose a code in HTML as page that lists common, non‑specific coping tips (educational note).'
    ],
    references: [
      { label: 'Connor KM et al. SPIN development. Br J Psychiatry. 2000.', url: 'https://pubmed.ncbi.nlm.nih.gov/11136208/' },
      { label: 'Social anxiety assessment overview (review).', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'Official SPIN wording/scoring may require permission; this demo uses paraphrased items.'
  },

  asrm: {
    title: 'ASRM — Altman Self‑Rating Mania Scale',
    shortTag: 'Mania (7d)',
    overview: 'Five‑item self‑rating of manic symptoms over the past week. Paraphrased anchors; intended for serial use.',
    clinicalUse: [
      'Track hypomanic/manic symptoms weekly.',
      'Screen for activation during antidepressant therapy (context‑dependent).',
      'Support shared decision‑making about treatment adjustments.'
    ],
    exampleForm: {
      title: 'ASRM (Paraphrased Weekly Demo)',
      instructions: 'Past 7 days. Choose the option that best fits for each area.',
      fields: [
        scale('asrm_mood', 'Elevated or irritable mood?'),
        scale('asrm_sleep', 'Decreased need for sleep?'),
        scale('asrm_talk', 'More talkative or pressured speech?'),
        scale('asrm_activity', 'Increased activity or restlessness?'),
        scale('asrm_risk', 'Risky or uncharacteristic behaviors?')
      ],
      scoring: { type: 'sum', details: 'Sum 0–4 across five items (range 0–20). Many programs flag ≥6. No calculation here.' }
    },
    prompts: [
      'Create a code in HTML as page for a weekly ASRM demo (5 items) with 0–4 anchors and clear legends.',
      'Compose a code in HTML as form that includes a static note: values ≥6 are commonly flagged (informational only).',
      'Make a code in HTML as page that adds a comments box for notable behaviors or sleep changes.',
      'Create a code in HTML as page that renders a concise copy‑paste summary.',
      'Compose a code in HTML as form with required fields and keyboard‑friendly inputs.',
      'Make a code in HTML as page with a print‑friendly single page layout.'
    ],
    references: [
      { label: 'Altman EG et al. Development of a mania rating scale. Biol Psychiatry. 1997.', url: 'https://pubmed.ncbi.nlm.nih.gov/9334427/' },
      { label: 'Bipolar disorder measurement‑based care overview.', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
    ]
  },

  epds: {
    title: 'EPDS — Edinburgh Postnatal Depression Scale',
    shortTag: 'Perinatal (7d)',
    overview: 'Ten‑item perinatal depression screening scale over the past 7 days. Includes a risk‑screen item for self‑harm thoughts.',
    clinicalUse: [
      'Screen for postnatal depression in perinatal care settings.',
      'Monitor symptom change and inform further assessment/referral.',
      'Trigger safety steps when risk item is positive.'
    ],
    cautions: [
      'Safety: If self‑harm thoughts are endorsed (risk item), implement urgent risk assessment and safety planning per local policy.',
      'Paraphrased demo; use official wording/scoring in clinical deployment.'
    ],
    exampleForm: {
      title: 'EPDS (Paraphrased Weekly Demo)',
      instructions: 'Past 7 days. Safety note: seek urgent help if self‑harm thoughts occur. Choose one option per item.',
      fields: [
        scale('epds_enjoy', 'Able to enjoy things as before?', ['0 As much as ever','1 Less than before','2 Much less','3 Not at all']),
        scale('epds_laughter', 'Able to see the funny side of things?', ['0 As much as ever','1 Not quite so much','2 Definitely not so much','3 Not at all']),
        scale('epds_selfblame', 'Blamed yourself unnecessarily when things went wrong?', ['0 No, never','1 Not very often','2 Yes, some of the time','3 Yes, most of the time']),
        scale('epds_anxious', 'Anxious or worried for no good reason?', ['0 No, not at all','1 Hardly ever','2 Yes, sometimes','3 Yes, very often']),
        scale('epds_panic', 'So anxious or panicky that it felt unmanageable?', ['0 No, not at all','1 Hardly ever','2 Yes, sometimes','3 Yes, quite often']),
        scale('epds_overwhelm', 'Things have been getting on top of you?', ['0 No, coping well','1 Most of the time coping','2 Sometimes not coping','3 No, not coping at all']),
        scale('epds_sleep', 'Difficulty sleeping due to unhappiness?', ['0 No, not at all','1 Hardly ever','2 Yes, sometimes','3 Yes, most of the time']),
        scale('epds_sad', 'Felt sad or miserable?', ['0 No, never','1 Not very often','2 Yes, quite often','3 Yes, most of the time']),
        scale('epds_tearful', 'So unhappy that you have been crying?', ['0 No, never','1 Only occasionally','2 Yes, fairly often','3 Yes, very often']),
        scale('epds_selfharm', 'The thought of harming yourself has occurred to you?', ['0 Never','1 Hardly ever','2 Sometimes','3 Yes, quite often'])
      ],
      scoring: { type: 'sum', details: 'Sum 0–3 per item (reverse‑scoring applies to some items in the official version). Do not compute here.' },
      requiresLicense: true
    },
    prompts: [
      'Create a code in HTML as page for a weekly EPDS demo with 10 items (0–3 anchors) and a prominent safety note.',
      'Compose a code in HTML as form that highlights the self‑harm risk item with an aria‑label warning.',
      'Make a code in HTML as page that adds a crisis resources note below the form.',
      'Create a code in HTML as page that includes date, weeks postpartum (optional), and who completed fields.',
      'Compose a code in HTML as form with clear labels and keyboard accessible radio groups.',
      'Make a code in HTML as page that renders a print‑ready single page summary (no calculation).',
      'Create a code in HTML as page with a static reminder to follow local protocols for positive screens.',
      'Compose a code in HTML as form that allows an optional comments box for supports/protective factors.'
    ],
    references: [
      { label: 'Cox JL et al. Detection of postnatal depression (EPDS). Br J Psychiatry. 1987.', url: 'https://pubmed.ncbi.nlm.nih.gov/3651732/' },
      { label: 'Perinatal mental health guideline (institutional/APA).', url: 'https://www.psychiatry.org/' }
    ],
    licensingNote: 'Official EPDS wording/scoring/licensing applies; this demo uses paraphrased items only.'
  },

  ybocs: {
    title: 'Y‑BOCS — Yale–Brown Obsessive–Compulsive Scale (Worksheet Demo)',
    shortTag: 'OCD (7d)',
    overview: 'Clinician‑rated OCD severity anchored to the past week. Provided here as a generic worksheet demo; use official materials for actual administration.',
    clinicalUse: [
      'Track OCD severity with serial Y‑BOCS ratings when appropriate.',
      'Support clinical decision‑making and exposure/response prevention planning.',
      'Provide a structured anchor for symptom change over weekly intervals.'
    ],
    cautions: ['This is a neutral worksheet demo with paraphrased labels. Use official Y‑BOCS instruments/scoring in clinical settings.'],
    exampleForm: {
      title: 'Y‑BOCS (Weekly Worksheet — Paraphrased)',
      instructions: 'Past 7 days. Clinician‑oriented worksheet fields for obsessions/compulsions (no scoring).',
      fields: [
        scale('ybocs_obs_time', 'Obsessions — time occupied'),
        scale('ybocs_obs_distress', 'Obsessions — distress'),
        scale('ybocs_obs_control', 'Obsessions — control'),
        scale('ybocs_comp_time', 'Compulsions — time spent'),
        scale('ybocs_comp_resist', 'Compulsions — resistance'),
        scale('ybocs_comp_control', 'Compulsions — control')
      ],
      requiresLicense: true
    },
    prompts: [
      'Create a code in HTML as page for a weekly Y‑BOCS worksheet demo with obsessions/compulsions sections.',
      'Compose a code in HTML as page that includes free‑text boxes for top triggers and rituals (worksheet style).',
      'Make a code in HTML as page with a print‑friendly one‑page layout and signature lines.',
      'Create a code in HTML as page that displays a neutral licensing note (no scoring, paraphrased labels).',
      'Compose a code in HTML as form that groups items under Obsessions and Compulsions with legends.'
    ],
    references: [
      { label: 'Goodman WK et al. Y‑BOCS development. Arch Gen Psychiatry. 1989.', url: 'https://pubmed.ncbi.nlm.nih.gov/2510699/' },
      { label: 'OCD assessment and ERP overview (review).', url: 'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'Y‑BOCS is licensed; use official forms and scoring when clinically administering.'
  },
};

export function getWeeklyBundleFromId(id: string): RPBundle {
  const key = normalizeWeeklyId(id || '') as WeeklyKey | null;
  if (!key || !WEEKLY_CONTENT[key]) return { infoCards: [], exampleHtml: '', prompts: [], references: [] };
  const pack = WEEKLY_CONTENT[key];
  try { assertContentPack(key, pack); } catch {  }
  return packToBundle(pack);
}
