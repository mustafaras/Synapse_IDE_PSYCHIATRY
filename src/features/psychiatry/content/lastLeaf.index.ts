


import type { RPBundle } from '../rightPanelTypes';
import { packToBundle as packToBundleS8 } from './section8.index';


export type ExampleField =
  | { id: string; type: 'text'|'number'|'select'|'radio'|'checkbox'; label: string; options?: string[]; required?: boolean }
  | { id: string; type: 'scale'; label: string; min: number; max: number; anchors: string[]; required?: boolean };

export interface ExampleForm {
  title: string;
  recallWindow?: string;
  instructions?: string;
  fields: ExampleField[];
  scoring?: {
    type: 'sum'|'rule';
    details: string;
    bands?: { label: string; range: [number, number] }[];
    reverseScoredIds?: string[];
  };
  safetyGates?: { id: string; when: 'equals'|'gte'|'contains'; value: string|number; action: 'showSafetyBanner'|'blockSubmit' }[];
  requiresLicense?: boolean;
}

export interface ContentPack {
  title: string;
  shortTag?: string;
  overview: string;
  clinicalUse: string[];
  cautions?: string[];
  psychometrics?: string[];
  exampleForm: ExampleForm;
  prompts: string[];
  references: { label: string; url: string }[];
  licensingNote?: string;
}

export type LastLeafKey =
  'psqi'|'ghq12'|'edeq'|'y_bocs'|'oasis'|'pdss_sr'|'spin'|'asrm'|'epds'|'unknown';


export function mapToLastLeafKey(input?: string): LastLeafKey {
  const s = (input || '').toLowerCase();
  if (s.includes('psqi')) return 'psqi';
  if (s.includes('ghq') && s.includes('12')) return 'ghq12';
  if ((s.includes('ede') && s.includes('q')) || s.includes('ede-q')) return 'edeq';

  if (s.includes('y-bocs') || s.includes('ybocs') || s.includes('y bocs') || s.includes('y_bocs')) return 'y_bocs';
  if (s.includes('oasis')) return 'oasis';
  if (s.includes('pdss') && s.includes('sr')) return 'pdss_sr';
  if (s.includes('spin') && (s.includes('social') || s.includes('phobia') || s.includes('inventory'))) return 'spin';
  if (s.includes('asrm')) return 'asrm';
  if (s.includes('epds')) return 'epds';
  return 'unknown';
}


const scale = (id: string, label: string, anchors: string[]): ExampleField => ({ id, type:'scale', label, min:0, max:anchors.length-1, anchors });

export const LAST_LEAF_CONTENT: Record<LastLeafKey, ContentPack> = {

  psqi: {
    title: 'PSQI — Pittsburgh Sleep Quality Index',
    shortTag: 'Sleep (1-month)',
    overview: 'Assesses overall sleep quality over the past month across latency, duration, efficiency, disturbances, medication use, and daytime dysfunction.',
    clinicalUse: ['Sleep complaint baseline & follow-up','Context for insomnia/medical comorbidities','Pre/post CBT-I or medication'],
    cautions: ['Exact items & scoring licensed—use official materials for clinical deployment.'],
    psychometrics: ['Extensively validated across clinical/community samples'],
    exampleForm: {
      title: 'PSQI (Paraphrased Demo)',
      recallWindow: 'Past month',
      instructions: 'Provide typical values for the last 30 days.',
      fields: [
        scale('overall', 'Overall sleep quality', ['Very good','Fairly good','Fairly poor','Very poor']),
        { id:'latency_min', type:'number', label:'Minutes to fall asleep (usual)', required:true },
        { id:'sleep_hours', type:'number', label:'Hours actually slept per night (avg)', required:true },
        { id:'med_use', type:'select', label:'Used sleep medicine', options:['Never','<1/week','1–2/week','≥3/week'], required:true },
        scale('daytime', 'Daytime impairment due to poor sleep', ['None','Mild','Moderate','Severe'])
      ],
      requiresLicense: true,
    },
    prompts: [
      'Create an accessible HTML capture for a paraphrased PSQI demo (30 days), with labeled inputs and no scoring; include a notes area.',
      'Generate a printable monthly sleep summary (demo) with bedtime, wake time, sleep hours, medications, and daytime impact.'
    ],
    references: [
      {label:'Official instrument portal', url:'https://www.sleep.pitt.edu/instruments/'},
      {label:'AASM guidance on insomnia care', url:'https://aasm.org/'}
    ],
    licensingNote: 'Use licensed PSQI forms & scoring for clinical use.'
  },
  ghq12: {
    title: 'GHQ-12 — General Health Questionnaire',
    shortTag: 'Distress (12)',
    overview: 'Brief screen for psychological distress over recent weeks.',
    clinicalUse: ['Population/baseline distress screening','Monitoring change across care episodes','Adjunct to diagnostic evaluation'],
    cautions: ['Use official wording/scoring in clinical deployment.'],
    exampleForm: {
      title:'GHQ-12 (Paraphrased Demo)',
      recallWindow:'Recent weeks',
      fields:[
        { id:'enjoy', type:'select', label:'Able to enjoy day-to-day activities', options:['More than usual','As usual','Less than usual','Much less than usual'], required:true },
        { id:'strain', type:'select', label:'Feeling under strain', options:['Not at all','No more than usual','Rather more than usual','Much more than usual'], required:true },
        { id:'sleep', type:'select', label:'Sleep loss due to worry', options:['Not at all','No more than usual','Rather more','Much more'], required:true },
        { id:'confidence', type:'select', label:'Loss of confidence', options:['No','Not more than usual','More than usual','Much more than usual'], required:true }
      ],
      requiresLicense: true
    },
    prompts:[
      'Compose a compact HTML capture for GHQ-12 (paraphrased), 4-point anchors, no scoring; include a “screening only” note.'
    ],
    references:[
      {label:'Instrument publisher info', url:'https://www.gl-assessment.co.uk/products/general-health-questionnaire-ghq/'},
      {label:'Validation overview', url:'https://pubmed.ncbi.nlm.nih.gov/'}
    ],
    licensingNote:'Use licensed GHQ-12 for clinical care.'
  },
  edeq: {
    title: 'EDE-Q — Eating Disorder Examination Questionnaire',
    shortTag: 'Eating pathology (28-day)',
    overview: 'Self-report of eating restraint, eating concern, shape/weight concern over 28 days.',
    clinicalUse: ['Baseline & follow-up in ED services','Track change with psychotherapy/medication','Support diagnostic formulation'],
    cautions:['Official items/scoring required for clinical deployment.'],
    exampleForm:{
      title:'EDE-Q (Paraphrased Demo)',
      recallWindow:'Past 28 days',
      fields:[
        { id:'restraint', type:'select', label:'Tried to restrict food to influence weight/shape', options:['Never','Rarely','Sometimes','Often','Very often'], required:true },
        { id:'preoccupation', type:'select', label:'Preoccupied with eating/shape/weight', options:['Never','Rarely','Sometimes','Often','Very often'], required:true },
        { id:'distress', type:'select', label:'Upset by shape/weight', options:['Never','Rarely','Sometimes','Often','Very often'], required:true }
      ],
      requiresLicense:true
    },
    prompts:[
      'Generate a sectioned HTML form for EDE-Q (paraphrased domains) with 28-day recall labels; no scoring.'
    ],
    references:[
      {label:'Clinical guidance (NICE)', url:'https://www.nice.org.uk/'},
      {label:'Measurement reviews', url:'https://pubmed.ncbi.nlm.nih.gov/'}
    ],
    licensingNote:'Use official EDE-Q in practice.'
  },


  y_bocs: {
    title: 'Y-BOCS — OCD Severity (Weekly)',
    overview: 'Rates severity of obsessions/compulsions over the past week (demo worksheet).',
    clinicalUse: [
      'Baseline severity & response to ERP/medication',
      'Weekly change tracking for OCD focused treatment',
      'Anchor thresholds to guide stepped‑care and treatment plans'
    ],
    cautions:[
      'Interview/self‑report variants exist; demo uses paraphrased labels.',
      'Use official Y‑BOCS instruments and anchors for clinical documentation.',
      'Consider differential diagnoses (e.g., psychosis, ASD) and functional impact.'
    ],
    exampleForm:{
      title:'Y-BOCS (Paraphrased, 0–4 each)',
      recallWindow:'Past 7 days',
      instructions:'Rate typical severity in the last week. Use official materials when practicing clinically. This demo omits proprietary wording but preserves structure.',
      fields:[
        scale('obs_time','Time on upsetting thoughts',['0 none','1 <1h','2 1–3h','3 3–8h','4 >8h']),
        scale('obs_dist','Distress from thoughts',['0 none','1 mild','2 moderate','3 severe','4 extreme']),
        scale('obs_func','Interference from thoughts',['0 none','1 slight','2 clear','3 marked','4 incapacitating']),
        scale('obs_resist','Effort to resist thoughts',['0 always','1 much','2 sometimes','3 rarely','4 none']),
        scale('obs_ctrl','Control over thoughts',['0 complete','1 good','2 moderate','3 little','4 none']),
        scale('comp_time','Time on rituals',['0 none','1 <1h','2 1–3h','3 3–8h','4 >8h']),
        scale('comp_dist','Distress if rituals prevented',['0 none','1 mild','2 moderate','3 severe','4 extreme']),
        scale('comp_func','Interference from rituals',['0 none','1 slight','2 clear','3 marked','4 incapacitating']),
        scale('comp_resist','Effort to resist rituals',['0 always','1 much','2 sometimes','3 rarely','4 none']),
        scale('comp_ctrl','Control over rituals',['0 complete','1 good','2 moderate','3 little','4 none']),
        { id:'primary_obsession', type:'text', label:'Primary obsession (free text)' },
        { id:'primary_compulsion', type:'text', label:'Primary compulsion (free text)' },
        { id:'notes', type:'text', label:'Clinician notes (optional)' }
      ],
      scoring:{ type:'sum', details:'Sum first 10 items (0–40). Common bands: 0–7 subclinical, 8–15 mild, 16–23 moderate, 24–31 severe, 32–40 extreme.' },
      requiresLicense:true
    },
    psychometrics:[
      '10 items scored 0–4; total 0–40 with conventional severity bands.',
      'High inter‑rater reliability reported for interview versions; responsive to change.'
    ],
    prompts:[
      'Create an accessible HTML Y‑BOCS demo (10 items, 0–4) with a live total and band text; include licensing disclaimer.',
      'Generate a printable weekly OCD severity worksheet with sections for obsessions and compulsions, plus free‑text triggers and rituals.',
      'Compose a clinician‑facing Y‑BOCS summary block that shows total, subdomain notes, and follow‑up plan placeholders.'
    ],
    references:[
      {label:'NICE — Obsessive‑compulsive disorder and BDD: assessment and management', url:'https://www.nice.org.uk/guidance/cg31'},
      {label:'APA Practice Guideline for the Treatment of Patients With OCD', url:'https://psychiatryonline.org/'},
      {label:'Measurement overview — PubMed (OCD scales)', url:'https://pubmed.ncbi.nlm.nih.gov/'},
      {label:'IOCDF — Assessment tools overview', url:'https://iocdf.org/'}
    ],
    licensingNote:'Use official Y-BOCS wording/scoring in clinical care.'
  },
  oasis: {
    title:'OASIS — Anxiety Severity & Impairment (Weekly)',
    overview:'5-item transdiagnostic anxiety measure (frequency, severity, avoidance, impairment).',
    clinicalUse:['Screening and outcome tracking','Serial measurement'],
    exampleForm:{
      title:'OASIS (0–4)', recallWindow:'Past 7 days',
      fields:[
        scale('freq','How often did anxiety occur?',['0 never','1 rarely','2 sometimes','3 often','4 nearly daily']),
        scale('sev','How intense was your worst anxiety?',['0 none','1 mild','2 moderate','3 severe','4 extreme']),
        scale('avoid','Avoidance due to anxiety',['0 never','1 rarely','2 sometimes','3 often','4 very often']),
        scale('work','Interference with work/chores',['0 none','1 mild','2 moderate','3 severe','4 extreme']),
        scale('social','Interference with social life',['0 none','1 mild','2 moderate','3 severe','4 extreme'])
      ],
      scoring:{ type:'sum', details:'Total 0–20; ≥8 often indicates clinically significant anxiety; interpret clinically.' }
    },
    prompts:[ 'Make an HTML OASIS form with live total and an informational note (≥8 commonly flagged).' ],
    references:[
      {label:'OASIS background', url:'https://pubmed.ncbi.nlm.nih.gov/'},
      {label:'Transdiagnostic anxiety measures (APA)', url:'https://www.apa.org/'}
    ]
  },
  pdss_sr: {
    title:'PDSS-SR — Panic Disorder Severity (Weekly)',
    overview:'7-item self-report of panic frequency/distress/anticipation/agoraphobic avoidance/impairment.',
    clinicalUse:['Panic disorder screening & tracking'],
    exampleForm:{
      title:'PDSS-SR (0–4)', recallWindow:'Past 7 days',
      fields: Array.from({length:7}).map((_,i)=>({ id:`q${i+1}`, type:'select', label:`Panic-related domain ${i+1} (0 none → 4 extreme)`, options:['0','1','2','3','4'], required:true })),
      scoring:{ type:'sum', details:'Total 0–28; ≥8–10 commonly used threshold; clinical judgment required.' }
    },
    prompts:[ 'Generate an HTML PDSS-SR form with seven 0–4 items and short interpretation text.' ],
    references:[ {label:'PDSS-SR validity overview', url:'https://pubmed.ncbi.nlm.nih.gov/'}, {label:'Guidelines (NICE)', url:'https://www.nice.org.uk/'} ]
  },
  spin: {
    title:'SPIN — Social Phobia Inventory (Weekly)',
    overview:'17-item measure of social anxiety; demo subset.',
    clinicalUse:['SAD screening','Outcome monitoring'],
    exampleForm:{
      title:'SPIN (subset demo, 0–4)', recallWindow:'Past 7 days',
      fields:[
        scale('fear_talk','Fear of speaking in groups',['0 not at all','1 a little','2 moderate','3 severe','4 very severe']),
        scale('avoid_events','Avoided social events',['0 never','1 rarely','2 sometimes','3 often','4 very often']),
        scale('physical','Blushing/shaking/heart racing socially',['0 not at all','1 a little','2 moderate','3 severe','4 very severe'])
      ],
      scoring:{ type:'sum', details:'Full SPIN 0–68; thresholds often ≈19 (moderate), ≈29 (probable SAD). Use judgment.' }
    },
    prompts:[ 'Create a full SPIN HTML (17 items) with live total and band hints; include a “screening only” disclaimer.' ],
    references:[ {label:'SPIN validation', url:'https://pubmed.ncbi.nlm.nih.gov/'}, {label:'SAD treatment guidance', url:'https://www.nice.org.uk/'} ],
    licensingNote:'Avoid verbatim wording when distributing.'
  },
  asrm: {
    title:'ASRM — Mania Self-Rating (Weekly)',
    overview:'5-item weekly self-rating of manic symptoms.',
    clinicalUse:['Bipolar symptom tracking','Response to treatment'],
    cautions:['Not diagnostic; evaluate for mixed features & risk.'],
    exampleForm:{
      title:'ASRM (0–4)', recallWindow:'Past 7 days',
      fields:[
        scale('elevated','Elevated/unusually good mood',['0 no','1 slight','2 moderate','3 marked','4 extreme']),
        scale('confidence','Increased self-confidence/grand ideas',['0','1','2','3','4']),
        scale('sleep','Less need for sleep, not tired',['0','1','2','3','4']),
        scale('talk','More talkative/pressured',['0','1','2','3','4']),
        scale('activity','Increased activity/restlessness',['0','1','2','3','4'])
      ],
      scoring:{ type:'sum', details:'Total 0–20; ≥6 often suggests clinically significant mania/hypomania.' }
    },
    prompts:[ 'Build an HTML ASRM (5 items) with live total and an interpretation line (≥6 often positive screen).' ],
    references:[ {label:'ASRM background', url:'https://pubmed.ncbi.nlm.nih.gov/'}, {label:'Bipolar care guidance (APA)', url:'https://www.psychiatry.org/'} ]
  },
  epds: {
    title:'EPDS — Postnatal Depression (Weekly)',
    overview:'10-item perinatal depression screen (past 7 days).',
    clinicalUse:['Perinatal screening & monitoring'],
    cautions:['Contains self-harm item; implement safety banner if endorsed.'],
    exampleForm:{
      title:'EPDS (paraphrased 0–3; some reverse-scored)', recallWindow:'Past 7 days',
      fields:[
        scale('enjoy','Able to laugh and feel enjoyment',['3 as before','2 somewhat less','1 much less','0 not at all']),
        scale('lookforward','Looking forward to things',['3 as before','2 somewhat less','1 much less','0 hardly at all']),
        scale('sad','Feeling sad or miserable',['0 never','1 rarely','2 sometimes','3 often']),
        scale('self_harm','Thoughts of harming myself',['0 never','1 hardly ever','2 sometimes','3 quite often'])
      ],
      scoring:{ type:'sum', details:'Total 0–30 with reverse scoring applied. Common: ≥10 possible; ≥13 probable. Self-harm >0 → safety banner.', bands:[{label:'Low', range:[0,9]},{label:'Possible', range:[10,12]},{label:'Probable', range:[13,30]}], reverseScoredIds:['enjoy','lookforward'] },
      safetyGates:[{ id:'self_harm', when:'gte', value:1, action:'showSafetyBanner' }],
      requiresLicense:true
    },
    prompts:[ 'Create an EPDS HTML (10 items) with reverse scoring notes and a red safety banner if self-harm > 0.' ],
    references:[ {label:'EPDS overview', url:'https://pubmed.ncbi.nlm.nih.gov/'}, {label:'Perinatal mental health guidance (NICE)', url:'https://www.nice.org.uk/'}, {label:'NIMH suicide prevention', url:'https://www.nimh.nih.gov/'} ],
    licensingNote:'Use official EPDS wording for clinical deployment.'
  },
  unknown: {
    title: 'Worksheet (Demo)',
    overview: 'Interactive example not available. Use official instrument.',
    clinicalUse: ['—'],
    exampleForm: { title: 'Worksheet', fields: [], instructions: 'Not available.' },
    prompts: [],
    references: []
  }
};

export function getLastLeafBundle(key: LastLeafKey | string | undefined): RPBundle {

  let k: LastLeafKey = 'unknown';
  if (typeof key === 'string') {
    const lower = key.toLowerCase();
    const isCanon = ['psqi','ghq12','edeq','y_bocs','oasis','pdss_sr','spin','asrm','epds'].includes(lower);
    k = (isCanon ? (lower as LastLeafKey) : mapToLastLeafKey(key)) || 'unknown';
  }
  const pack = LAST_LEAF_CONTENT[k];
  if (!pack) return { infoCards: [], exampleHtml: '', prompts: [], references: [] };
  return packToBundleS8(pack);
}
