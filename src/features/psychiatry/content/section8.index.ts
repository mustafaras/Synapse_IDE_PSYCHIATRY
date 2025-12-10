


import type { RPBundle } from '../rightPanelTypes';

export { SECTION8_TITLES, resolveSection8Key, type Section8Key, type TitleMeta } from './section8.titles';

export type InstrumentKey =
  | 'psqi' | 'ghq12' | 'edeq'
  | 'auditc' | 'audit' | 'dast10' | 'assist'
  | 'asrs_v1_1' | 'vanderbilt_parent' | 'vanderbilt_teacher'
  | 'snap_iv' | 'cssrs';

export type ExampleField =
  | { id: string; type: 'radio'|'checkbox'|'select'|'number'|'text'; label: string; options?: string[]; required?: boolean }
  | { id: string; type: 'scale'; label: string; min: number; max: number; anchors: string[]; required?: boolean };

export interface ExampleForm {
  title: string;
  instructions?: string;
  fields: ExampleField[];
  scoring?: { type: 'sum'|'rule'; details: string };
  requiresLicense?: boolean;
}

export interface ContentPack {
  title: string; shortTag?: string;
  overview: string;
  clinicalUse: string[];
  cautions?: string[];
  psychometrics?: string[];
  exampleForm: ExampleForm;
  prompts: string[];
  references: { label: string; url: string }[];
  licensingNote?: string;
}


export function assertContentPack(key: string, pack: ContentPack): void {
  try {
    const errs: string[] = [];
    if (!pack.overview?.trim()) errs.push('overview');
    if (!Array.isArray(pack.clinicalUse) || pack.clinicalUse.length < 3) errs.push('clinicalUse(>=3)');
    const minFields = key === 'auditc' ? 3 : 6;
    if (!Array.isArray(pack.exampleForm?.fields) || pack.exampleForm.fields.length < minFields) errs.push(`exampleForm.fields(>=${minFields})`);
    if (!Array.isArray(pack.prompts) || pack.prompts.length < 10) errs.push('prompts(>=10)');
    if (!Array.isArray(pack.references) || pack.references.length < 3) errs.push('references(>=3)');
    if (pack.exampleForm.requiresLicense && !pack.licensingNote) errs.push('licensingNote');
    if (errs.length) console.warn(`[section8] ${key} content incomplete: ${errs.join(', ')}`);
  } catch {}
}


function esc(s: string): string { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c] as string)); }
function fieldToHtml(f: ExampleField): string {
  if (f.type === 'scale') {
    const scale = f as Extract<ExampleField, {type:'scale'}>;
    const opts = Array.from({ length: (scale.max - scale.min + 1) }).map((_, i) => {
      const val = scale.min + i;
      const label = scale.anchors[i] ?? String(val);
      const id = `${esc(f.id)}_${val}`;
      return `<label><input type="radio" name="${esc(f.id)}" id="${id}" value="${val}" ${f.required? 'required':''} /> ${esc(label)}</label>`;
    }).join(' ');
    const descId = `${esc(f.id)}_desc`;
    return `<fieldset><legend>${esc(scale.label)}</legend><div id="${descId}" class="muted">${esc(scale.anchors[0] || '')} … ${esc(scale.anchors[scale.anchors.length-1] || '')}</div><div role="group" aria-describedby="${descId}" class="scale">${opts}</div></fieldset>`;
  }
  if (f.type === 'radio' || f.type === 'checkbox') {
    const kind = f.type;
    const name = kind === 'radio' ? f.id : `${f.id}[]`;
    const opts = (f.options || []).map((opt, idx) => {
      const id = `${esc(f.id)}_${idx}`;
      return `<label><input type="${kind}" name="${esc(name)}" id="${id}" value="${esc(opt)}" ${f.required? 'required':''} /> ${esc(opt)}</label>`;
    }).join(' ');
    return `<fieldset><legend>${esc(f.label)}</legend><div class="choices">${opts}</div></fieldset>`;
  }
  if (f.type === 'select') {
    const opts = (f.options || []).map(opt => `<option value="${esc(opt)}">${esc(opt)}</option>`).join('');
    return `<label for="${esc(f.id)}">${esc(f.label)}</label><select id="${esc(f.id)}" name="${esc(f.id)}" ${f.required? 'required':''}>${opts}</select>`;
  }
  if (f.type === 'number' || f.type === 'text') {
    const type = f.type;
    return `<label for="${esc(f.id)}">${esc(f.label)}</label><input type="${type}" id="${esc(f.id)}" name="${esc(f.id)}" ${f.required? 'required':''} />`;
  }

  const lbl = (f as { label?: string }).label || f.id;
  return `<label>${esc(lbl)}</label>`;
}

export function renderFormHtml(form: ExampleForm): string {
  const header = `<h2>${esc(form.title)}</h2>${form.instructions ? `<p class="muted" id="form_instruct">${esc(form.instructions)}</p>` : ''}`;
  const fields = form.fields.map(fieldToHtml).join('\n');
  const scoring = form.scoring ? `<aside class="muted" data-testid="demo-scoring"><strong>Scoring:</strong> ${esc(form.scoring.details)}</aside>` : '';
  const license = form.requiresLicense ? `<aside class="muted" role="note"><strong>Note:</strong> This demo uses paraphrased items; use official wording and scoring when deploying clinically.</aside>` : '';
  return `<section class="example-form" role="form" aria-describedby="form_instruct">${header}<div class="form-grid">${fields}</div>${scoring}${license}</section>`;
}

export function packToBundle(pack: ContentPack): RPBundle {
  const infoCards = [
    { title: 'Overview', body: [pack.overview] },
    pack.clinicalUse?.length ? { title: 'Clinical use', body: pack.clinicalUse } : null,
    pack.psychometrics?.length ? { title: 'Psychometrics', body: pack.psychometrics } : null,
    pack.cautions?.length ? { title: 'Cautions', body: pack.cautions } : null,
    pack.licensingNote ? { title: 'Licensing', body: [pack.licensingNote] } : null,
  ].filter(Boolean) as RPBundle['infoCards'];
  const exampleHtml = renderFormHtml(pack.exampleForm);
  const prompts = pack.prompts || [];
  const references = (pack.references || []).map(r => `${r.label} — ${r.url}`);
  return { infoCards, exampleHtml, prompts, references };
}


export function normalizeInstrumentId(id: string): InstrumentKey | null {
  const raw = (id || '').toLowerCase().replace(/[^a-z0-9_-]+/g,'');
  const map: Record<string, InstrumentKey> = {

    'psqi': 'psqi', 'ghq12': 'ghq12', 'ghq-12': 'ghq12', 'edeq': 'edeq', 'ede-q': 'edeq',
    'auditc': 'auditc', 'audit-c': 'auditc', 'audit': 'audit', 'dast10': 'dast10', 'assist': 'assist',
    'asrs': 'asrs_v1_1', 'asrs_v1_1': 'asrs_v1_1',
    'vanderbilt': 'vanderbilt_parent', 'vanderbilt_parent': 'vanderbilt_parent', 'vanderbilt_teacher': 'vanderbilt_teacher',
    'snapiv': 'snap_iv', 'snap-iv': 'snap_iv', 'snap_iv': 'snap_iv',
    'cssrs': 'cssrs', 'c-ssrs': 'cssrs', 'c_ssrs': 'cssrs'
  };
  return map[raw] ?? null;
}

export const SECTION8_CONTENT: Record<InstrumentKey, ContentPack> = {
  psqi: {
    title: 'PSQI — Pittsburgh Sleep Quality Index',
    shortTag: 'Sleep (1‑month)',
    overview: 'Assesses overall sleep quality over the past month across subjective quality, latency, duration, efficiency, disturbances, medication use, and daytime dysfunction.',
    clinicalUse: [
      'Baseline and longitudinal tracking of sleep complaints',
      'Context for insomnia, depression, PTSD, medical comorbidity',
      'Pre/post intervention comparison (CBT‑I, medication, hygiene)'
    ],
    cautions: ['Self‑report; corroborate with sleep diary/actigraphy when feasible'],
    psychometrics: ['Widely validated across clinical and community samples'],
    exampleForm: {
      title: 'PSQI (Paraphrased Demo)',
      instructions: 'Think about the last 30 days.',
      fields: [
        { id: 'overall_quality', type: 'scale', label: 'Overall sleep quality', min: 0, max: 3, anchors: ['Very good','Fairly good','Fairly poor','Very poor'], required: true },
        { id: 'latency_min', type: 'number', label: 'Minutes it usually takes to fall asleep', required: true },
        { id: 'bed_time', type: 'text', label: 'Usual bedtime (HH:MM, 24h)', required: true },
        { id: 'wake_time', type: 'text', label: 'Usual wake time (HH:MM, 24h)', required: true },
        { id: 'sleep_hours', type: 'number', label: 'Hours actually slept per night (avg)', required: true },
        { id: 'med_use', type: 'radio', label: 'Used sleep medication', options: ['Never','<1/week','1–2/week','≥3/week'], required: true },
        { id: 'daytime_impair', type: 'scale', label: 'Sleepiness interfered with daytime activities', min:0, max:3, anchors:['Not at all','Mild','Moderate','Severe'], required:true }
      ],
      requiresLicense: true
    },
    prompts: [
      'Create an accessible HTML page for a paraphrased PSQI demo (last 30 days) with scale inputs, number fields for latency/sleep hours, and no scoring; include a notes box.',
      'Compose an HTML form with PSQI-like components (quality, latency, duration, efficiency proxy, meds, daytime dysfunction) and clear labels/placeholders.',
      'Build a printable PSQI demo form (paraphrased) with fieldset/legend and aria-describedby for scale anchors; no external CSS.',
      'Generate an HTML form capturing bedtime, wake time, and total sleep hours with a computed sleep efficiency readout (hours slept / time in bed).',
      'Create a PSQI-style monthly sleep summary page with sections for disturbances and daytime impacts; no scoring.',
      'Produce an HTML form including a medication use frequency radio group and a free-text sleep notes textarea.',
      'Write an HTML form with required attributes where appropriate and a summary panel that lists entered values.',
      'Make an HTML template that can be reused monthly, with placeholders for month/year and average values.',
      'Create a PSQI-like data capture form with keyboard-accessible controls and labels tied via for/id.',
      'Generate a minimal HTML+JS page that validates HH:MM inputs for bedtime and wake time (24h).'
    ],
    references: [
      { label:'UPMC PSQI Overview', url:'https://www.sleep.pitt.edu/instruments/' },
      { label:'American Academy of Sleep Medicine', url:'https://aasm.org/' },
      { label:'Sleep medicine review on PSQI (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'PSQI components and scoring require permission from authors/distributors.'
  },

  ghq12: {
    title: 'GHQ‑12 — General Health Questionnaire',
    shortTag: 'Distress (12)',
    overview: 'Brief screen for general psychological distress over recent weeks; commonly used in epidemiology and primary care.',
    clinicalUse: ['Baseline distress tracking', 'Population or clinic screening', 'Outcome monitoring (non-diagnostic)'],
    exampleForm: {
      title:'GHQ‑12 (Paraphrased Demo)',
      instructions: 'Think about the last few weeks.',
      fields: [
        { id:'enjoy', type:'select', label:'Able to enjoy day-to-day activities', options:['More than usual','As usual','Less than usual','Much less than usual'], required:true },
        { id:'strain', type:'select', label:'Feeling under strain lately', options:['Not at all','No more than usual','Rather more than usual','Much more than usual'], required:true },
        { id:'sleep', type:'select', label:'Loss of sleep over worry', options:['Not at all','No more than usual','Rather more than usual','Much more than usual'], required:true },
        { id:'depressed', type:'select', label:'Feeling unhappy or depressed', options:['Not at all','No more than usual','Rather more than usual','Much more than usual'], required:true }
      ],
      requiresLicense:true
    },
    prompts: [
      'Compose an HTML GHQ‑12 demo with paraphrased items and 4-point change anchors; do not compute scores.',
      'Generate a compact GHQ‑12 capture for tablets with clear legends and required fields.',
      'Create an HTML form that groups items under mood, sleep, and functioning headings (paraphrased).',
      'Build a printable GHQ‑12 (paraphrased) with signature/date lines.',
      'Create a Likert-style radio layout (0–3) for GHQ‑12 anchors with accessible labels.',
      'Produce a page that stores responses in a summary box for copy‑paste into notes.',
      'Generate an HTML snippet showing both GHQ and Likert scoring modes as informational text (no computation).',
      'Create an HTML form that includes an optional free‑text concerns field at the end.',
      'Compose an HTML version suitable for waiting room kiosks with large touch targets.',
      'Generate a split‑column layout grouping six items per column (no external CSS).'
    ],
    references: [
      { label:'GHQ information (GL Assessment)', url:'https://www.gl-assessment.co.uk/products/general-health-questionnaire-ghq/' },
      { label:'Validation literature (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' },
      { label:'Population norms review', url:'https://onlinelibrary.wiley.com/' }
    ],
    licensingNote:'Use licensed GHQ‑12 for clinical deployment.'
  },

  edeq: {
    title: 'EDE‑Q — Eating Disorder Examination Questionnaire',
    shortTag: 'Eating disorder (28‑day)',
    overview: 'Self‑report of eating pathology across restraint, eating, shape, and weight concerns over the past 28 days.',
    clinicalUse: ['Baseline severity and follow‑up in eating disorder care', 'Track specific domains (restraint/eating/shape/weight)', 'Contextualize with weight history and medical status'],
    exampleForm: {
      title:'EDE‑Q (Paraphrased Demo)',
      instructions: 'Think about the last 28 days.',
      fields: [
        { id:'restraint', type:'select', label:'Tried to restrict food to influence weight/shape', options:['Never','Rarely','Sometimes','Often','Very often'], required:true },
        { id:'concern', type:'select', label:'Preoccupation with eating/shape/weight', options:['Never','Rarely','Sometimes','Often','Very often'], required:true },
        { id:'loss_control', type:'select', label:'Episodes of loss of control over eating', options:['Never','Rarely','Sometimes','Often','Very often'], required:true }
      ],
      requiresLicense:true
    },
    prompts: [
      'Generate an HTML EDE‑Q demo (paraphrased) with 28‑day recall and separate domain headings.',
      'Compose a follow‑up version that displays side‑by‑side comparison placeholders.',
      'Create an HTML form capturing frequency anchors and a notes area for dietary patterns (paraphrased).',
      'Build a printable EDE‑Q demo sheet with sections for restraint/eating/shape/weight.',
      'Produce an HTML layout that allows quick review of change since baseline (no scoring).',
      'Create a clean radio‑based version for mobile devices with accessible labels.',
      'Generate an HTML template that includes height/weight/BMI placeholders (no calculations).',
      'Compose an HTML form with brief safety note about medical instability red flags.',
      'Create an HTML capture for binge/purge behaviors (paraphrased, non‑verbatim).',
      'Generate an HTML page with clinician signature/date at bottom (print‑ready).'
    ],
    references: [
      { label:'EDE‑Q information (PsyToolkit)', url:'https://www.psytoolkit.org/' },
      { label:'Clinical guidance (NICE)', url:'https://www.nice.org.uk/' },
      { label:'Psychometric reviews (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote:'Use official EDE‑Q materials in clinical care.'
  },

  auditc: {
    title: 'AUDIT‑C — Alcohol Use (3‑item)',
    shortTag: 'Alcohol quick screen',
    overview: 'Three‑item alcohol screen for hazardous drinking and active alcohol use.'
      + ' Quick to administer; suitable for primary care and psychiatry intake.',
    clinicalUse: [
      'Primary care alcohol screening',
      'Baseline risk and brief intervention planning',
      'Monitoring response to counseling or pharmacotherapy'
    ],
    psychometrics: ['Good sensitivity/specificity for risky drinking in primary care'],
    exampleForm: {
      title: 'AUDIT‑C (Paraphrased)',
      fields: [
        { id:'freq', type:'select', label:'How often do you have a drink containing alcohol?', options:['Never','Monthly or less','2–4 times/month','2–3 times/week','4+ times/week'], required:true },
        { id:'typical', type:'select', label:'On a typical day when you drink, how many drinks?', options:['0–2','3–4','5–6','7–9','10 or more'], required:true },
        { id:'binge', type:'select', label:'How often do you have ≥6 drinks on one occasion?', options:['Never','< monthly','Monthly','Weekly','Daily or almost daily'], required:true }
      ],
      scoring: { type:'sum', details:'Score each 0–4 left→right; consider sex‑specific cut points (e.g., ≥3 women, ≥4 men positive screen).' }
    },
    prompts: [
      'Create an HTML form for AUDIT‑C with 3 select inputs, compute total (0–12) and show risk band text below the form.',
      'Make a minimal HTML+JS page for AUDIT‑C that auto‑updates a total score badge and brief feedback line.',
      'Compose an HTML form with a printable summary including date and clinician initials.',
      'Generate a single‑page HTML for AUDIT‑C that stores selections in local state and supports keyboard navigation.',
      'Create an HTML form for AUDIT‑C with aria‑live region announcing the updated score.',
      'Produce an HTML snippet for embedding AUDIT‑C in portals, with inline JS scoring only.',
      'Build an HTML page with a reset button and “share to note” copy‑to‑clipboard section.',
      'Create an HTML template that highlights positive screens with a yellow banner (non‑diagnostic).',
      'Generate a version that includes optional fields: drinks/week estimate and preferred beverage.',
      'Make an HTML form that provides brief intervention prompts when score ≥ cutoff.'
    ],
    references: [
      { label:'WHO AUDIT resources', url:'https://www.who.int/publications/i/item/audit-the-alcohol-use-disorders-identification-test' },
      { label:'VA/DoD brief alcohol screen guidance', url:'https://www.healthquality.va.gov/' },
      { label:'Evidence summary (AUDIT‑C, PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ]
  },

  audit: {
    title: 'AUDIT — Alcohol Use Disorders Identification Test (10‑item)',
    shortTag: 'Alcohol risk (10)',
    overview: 'Ten‑item screen for risky use, dependence symptoms, and alcohol‑related harm.' +
      ' Suitable for comprehensive screening and triage to level of care.',
    clinicalUse: ['Comprehensive alcohol screen', 'Level‑of‑care triage', 'Outcome tracking'],
    exampleForm: {
      title: 'AUDIT (Paraphrased)',
      instructions: 'Think about the past 12 months.',
      fields: Array.from({length:10}).map((_,i)=>({
        id:`q${i+1}`,
        type:'select' as const,
        label:`Paraphrased item ${i+1} (0–4)`,
        options:['0','1','2','3','4'],
        required:true
      })),
      scoring: { type:'sum', details:'Total 0–40; 0–7 low, 8–15 moderate, 16–19 high, ≥20 probable dependence (contextualize clinically).' }
    },
    prompts: [
      'Generate an HTML page for a paraphrased 10‑item AUDIT with 0–4 anchors and live total + risk band.',
      'Compose an HTML form that separates consumption (1–3), dependence (4–6), harms (7–10) sections with subtotals.',
      'Create an HTML layout that flags total ≥16 with a caution banner and suggests further assessment.',
      'Produce a printable AUDIT result summary with patient‑friendly feedback.',
      'Make an HTML AUDIT form with keyboard‑only operability and clear focus styles.',
      'Create a version that displays suggested brief advice scripts for moderate risk.',
      'Generate an HTML form with optional “days per week drinking” numeric input.',
      'Build a page that explains non‑diagnostic nature of the screen and next steps.',
      'Create an HTML version that saves responses to a summary block for copying.',
      'Produce an HTML that includes a link to WHO manual and local referral info.'
    ],
    references: [
      { label:'WHO AUDIT manual', url:'https://www.who.int/publications/i/item/audit-the-alcohol-use-disorders-identification-test' },
      { label:'Clinical implementation guide (NICE)', url:'https://www.nice.org.uk/' },
      { label:'Validation meta‑analyses (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ]
  },

  dast10: {
    title: 'DAST‑10 — Drug Use Problems (10‑item)',
    shortTag: 'Drugs (10‑item)',
    overview: 'Screens for problems related to non‑alcohol drug use in the last 12 months.',
    clinicalUse: ['Primary care or mental health intake', 'Track change after intervention', 'Triage to specialty care when high risk'],
    exampleForm: {
      title: 'DAST‑10 (Paraphrased)',
      fields: Array.from({length:10}).map((_,i)=>({
        id:`q${i+1}`, type:'radio' as const,
        label:`Paraphrased yes/no item ${i+1} about drug‑related problems`,
        options:['No','Yes'], required:true
      })),
      scoring: { type:'sum', details:'Yes=1; 0 none, 1–2 low, 3–5 moderate, 6–8 substantial, 9–10 severe. Confirm timeframe per protocol.' }
    },
    prompts: [
      'Create an HTML yes/no DAST‑10 form with live total and risk band explanation (non‑diagnostic).',
      'Make an accessible radio‑based DAST‑10 demo with a printable summary section.',
      'Compose a version that includes a brief safety notice about overdose risk and resources.',
      'Generate a DAST‑10 page with a reset button and aria‑live score announcement.',
      'Create a form with optional field for primary substance of concern.',
      'Produce a DAST‑10 result card that outlines brief intervention steps for moderate risk.',
      'Build a version that includes a copy‑to‑clipboard summary for notes.',
      'Generate an HTML form that groups questions under behavior/consequence themes.',
      'Create an HTML layout that supports printing and signing.',
      'Make a page that links to SBIRT resources for follow‑up.'
    ],
    references: [
      { label:'DAST information (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' },
      { label:'SBIRT resources (SAMHSA)', url:'https://www.samhsa.gov/sbirt' },
      { label:'Clinical review (AAFP)', url:'https://www.aafp.org/' }
    ]
  },

  assist: {
    title: 'WHO ASSIST — Substance Involvement',
    shortTag: 'Multi‑substance',
    overview: 'Assesses risk across multiple substance classes with lifetime and recent use; use official manual for full scoring.',
    clinicalUse: ['Screen multi‑substance risk', 'Brief intervention targeting highest‑risk class', 'Referral to specialty care when indicated'],
    exampleForm: {
      title: 'ASSIST (Paraphrased Demo)',
      instructions: 'Select substances used and frequency in the past 3 months.',
      fields: [
        { id:'subs', type:'checkbox', label:'Substances used (ever)', options:['Tobacco','Alcohol','Cannabis','Cocaine/Amphetamines','Opioids','Sedatives','Hallucinogens','Inhalants','Other'] },
        { id:'freq_alc', type:'select', label:'Alcohol frequency (3 mo.)', options:['Never','Monthly','Weekly','Daily/Almost daily'] },
        { id:'freq_cann', type:'select', label:'Cannabis frequency (3 mo.)', options:['Never','Monthly','Weekly','Daily/Almost daily'] },
        { id:'concern', type:'scale', label:'Concern from others about your use (3 mo.)', min:0, max:4, anchors:['Never','Rarely','Sometimes','Often','Very often'] }
      ],
      scoring: { type:'rule', details:'Provide qualitative risk hints per class; full ASSIST scoring is complex—refer to manual.' }
    },
    prompts: [
      'Compose an HTML page to capture ASSIST‑like multi‑substance frequencies with per‑class risk hints (no full scoring).',
      'Generate a form that conditionally shows frequency fields only for checked substances.',
      'Create a page with sections per substance class and a final brief advice note area.',
      'Build an HTML form that summarizes selected substances and frequencies in a table.',
      'Make a version with a safety reminder about overdose and mixing substances.',
      'Create an HTML layout with a risk legend (low/moderate/high) for clinician use.',
      'Produce a page that includes a brief intervention checklist after submission.',
      'Generate an HTML form that allows “Other” substance text entry.',
      'Compose a single‑page app that prints a summary card for the chart.',
      'Create a form with aria‑live feedback when high‑risk patterns are selected.'
    ],
    references: [
      { label:'WHO ASSIST manual', url:'https://www.who.int/substance_abuse/activities/assist/en/' },
      { label:'Brief intervention guide (WHO)', url:'https://www.who.int/' },
      { label:'Peer‑reviewed overview (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ]
  },

  asrs_v1_1: {
    title: 'ASRS v1.1 — Adult ADHD Screener (Part A)',
    shortTag: 'Adult ADHD (6)',
    overview: 'Six‑item screener for adult ADHD; frequency anchors from never to very often. Positive screen suggests full assessment.',
    clinicalUse: ['Initial adult ADHD screen in primary care or psychiatry', 'Monitor change with treatment (trend only)', 'Triage for full diagnostic interview when positive'],
    exampleForm: {
      title: 'ASRS v1.1 Part A (Paraphrased)',
      fields: Array.from({length:6}).map((_,i)=>({
        id:`q${i+1}`, type:'select' as const,
        label:`Paraphrased attentional/hyperactive symptom ${i+1} (past 6 months)`,
        options:['Never','Rarely','Sometimes','Often','Very often'],
        required:true
      })),
      scoring: { type:'rule', details:'Positive screen if ≥4 items are “Often/Very often” at the keyed positions (demo rule).' }
    },
    prompts: [
      'Create an HTML ASRS Part A form with a rule that marks “Positive screen” when ≥4 keyed items are Often/Very Often.',
      'Generate an HTML page with a results panel explaining that a positive screen is not a diagnosis.',
      'Compose an HTML form that includes a patient info header (name/DOB/date).',
      'Build a version that groups items under inattention vs hyperactivity headings (paraphrased).',
      'Create an HTML layout with keyboard‑navigable radio/select inputs and visible focus.',
      'Produce a results banner that suggests next steps for positive screens.',
      'Generate a printable summary with clinician signature/date lines.',
      'Create a page that includes optional impairment checkboxes (work/school/home).',
      'Make an HTML form that highlights keyed items visually (demo only).',
      'Compose an HTML snippet that can embed ASRS A in other pages with minimal CSS.'
    ],
    references: [
      { label:'ASRS information (Harvard/NCS)', url:'https://www.hcp.med.harvard.edu/ncs/asrs.php' },
      { label:'Validation studies (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' },
      { label:'Clinical practice notes (UpToDate)', url:'https://www.uptodate.com/' }
    ]
  },

  vanderbilt_parent: {
    title: 'Vanderbilt ADHD — Parent',
    shortTag: 'Child ADHD (Parent)',
    overview: 'Parent report of ADHD symptoms and functional impairment; used in pediatrics with teacher counterpart.',
    clinicalUse: ['Pediatric ADHD assessment across settings', 'Baseline and follow‑up ratings', 'Identify impairment at home/school'],
    exampleForm: {
      title: 'Vanderbilt Parent (Paraphrased Demo)',
      instructions: 'Rate frequency over the past 6 months.',
      fields: [
        { id:'inattentive_1', type:'select', label:'Often loses track or misses details', options:['Never','Occasionally','Often','Very often'], required:true },
        { id:'hyper_1', type:'select', label:'Fidgets or has trouble staying seated', options:['Never','Occasionally','Often','Very often'], required:true },
        { id:'impair_school', type:'scale', label:'School performance impact', min:0, max:3, anchors:['None','Mild','Moderate','Severe'], required:true }
      ],
      requiresLicense: true
    },
    prompts: [
      'Compose an HTML demo of Vanderbilt Parent with paraphrased core items and an impairment section; no scoring.',
      'Create a parent‑facing printable HTML with clear legends and a signature line.',
      'Generate an HTML form with sections for inattention, hyperactivity, and performance.',
      'Build a page that includes guidance text for guardians (paraphrased).',
      'Produce a layout that supports multiple children (name/grade fields).',
      'Create a form with optional teacher contact details to pair with school form.',
      'Generate a printable summary that lists any items rated “Very often”.',
      'Compose a page with brief privacy/consent note for sharing ratings.',
      'Make an HTML layout that allows adding comments per domain.',
      'Create a version that includes a reminder to use official forms for clinical decisions.'
    ],
    references: [
      { label:'NICHQ Vanderbilt resources', url:'https://nichq.org/' },
      { label:'AAP ADHD guidelines', url:'https://publications.aap.org/' },
      { label:'DSM‑5‑TR ADHD overview', url:'https://doi.org/' }
    ],
    licensingNote: 'Use official Vanderbilt forms for clinical deployment.'
  },

  vanderbilt_teacher: {
    title: 'Vanderbilt ADHD — Teacher',
    shortTag: 'Child ADHD (Teacher)',
    overview: 'Teacher report across classroom behaviors; impairment ratings; complements parent input.',
    clinicalUse: ['Corroborates cross‑setting symptoms required for ADHD diagnosis', 'Track response to school interventions', 'Identify classroom impairment'],
    exampleForm: {
      title: 'Vanderbilt Teacher (Paraphrased Demo)',
      fields: [
        { id:'inattentive_class', type:'select', label:'Struggles to sustain attention on tasks', options:['Never','Occasionally','Often','Very often'], required:true },
        { id:'disruptive', type:'select', label:'Interrupts or intrudes in class', options:['Never','Occasionally','Often','Very often'], required:true },
        { id:'impair_class', type:'scale', label:'Classroom impairment', min:0, max:3, anchors:['None','Mild','Moderate','Severe'], required:true }
      ],
      requiresLicense: true
    },
    prompts: [
      'Create a teacher‑facing HTML with paraphrased Vanderbilt items and a classroom impairment scale.',
      'Generate a clean printable teacher report page with date/time and teacher ID placeholders.',
      'Compose a page with sections for behavior, attention, and work completion.',
      'Build a version that includes optional accommodations checklist.',
      'Produce a layout that supports multiple classes/subjects.',
      'Create an HTML form with a free‑text narrative summary box.',
      'Generate a page that prints cleanly in black‑and‑white.',
      'Compose a template that includes a guardian contact field.',
      'Make a version with an optional section for observed strengths.',
      'Create an HTML page with brief guidance to use official forms clinically.'
    ],
    references: [
      { label:'NICHQ Vanderbilt resources', url:'https://nichq.org/' },
      { label:'School psychiatry toolkit', url:'https://med.stanford.edu/schoolpsychiatry.html' },
      { label:'Evidence reviews (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'Use official Vanderbilt forms for clinical deployment.'
  },

  snap_iv: {
    title: 'SNAP‑IV — ADHD/ODD',
    shortTag: 'ADHD/ODD (26)',
    overview: 'Symptom ratings for inattentive, hyperactive/impulsive, and oppositional domains across informants.',
    clinicalUse: ['Multi‑informant symptom tracking', 'Response to treatment over time', 'Identify domains with highest impairment'],
    exampleForm: {
      title: 'SNAP‑IV (Paraphrased Short Demo)',
      fields: [
        { id:'inatt1', type:'select', label:'Has trouble sustaining focus on tasks', options:['Not at all','Just a little','Pretty much','Very much'], required:true },
        { id:'hyper1', type:'select', label:'Often “on the go” or restless', options:['Not at all','Just a little','Pretty much','Very much'], required:true },
        { id:'odd1', type:'select', label:'Argues with adults more than peers', options:['Not at all','Just a little','Pretty much','Very much'], required:true }
      ],
      requiresLicense: true
    },
    prompts: [
      'Compose an HTML SNAP‑IV short demo with three domains separated by headings and a printable summary.',
      'Build an HTML form that can duplicate sections to support multiple informants.',
      'Create a page with an impairment checklist (home/school/peers).',
      'Generate a form that includes a comments box for examples of behaviors.',
      'Produce a layout that separates inattention, hyperactivity, and ODD visually.',
      'Create a printable report with domain averages (no scoring logic).',
      'Generate a caregiver‑facing form variant with larger touch targets.',
      'Compose a teacher‑facing variant with class/subject fields.',
      'Make a form with a simple progress note summary generator.',
      'Create an HTML template that references official SNAP‑IV materials for clinical use.'
    ],
    references: [
      { label:'SNAP‑IV info', url:'https://cpsyjournal.org/' },
      { label:'Clinical ADHD/ODD guidelines (NICE)', url:'https://www.nice.org.uk/' },
      { label:'Psychometric summaries (PubMed index)', url:'https://pubmed.ncbi.nlm.nih.gov/' }
    ],
    licensingNote: 'Use official SNAP‑IV forms for clinical deployment.'
  },

  cssrs: {
    title: 'C‑SSRS — Columbia Suicide Severity Rating Scale (Screening)',
    shortTag: 'Suicide risk (screen)',
    overview: 'Structured screening for suicidal ideation and behavior with gated severity prompts. Use institutional pathway for any positive responses.',
    clinicalUse: ['Universal screening in medical/behavioral settings', 'Determines need for full risk assessment and safety planning', 'Documents ideation and behavior systematically'],
    cautions: ['Immediate action required for positive responses; use emergency pathways'],
    exampleForm: {
      title: 'C‑SSRS Screen (Paraphrased/Gated)',
      instructions: 'Start with the first question; additional questions appear only if needed.',
      fields: [
        { id:'q1', type:'radio', label:'Any thoughts about ending your life?', options:['No','Yes'], required:true },
        { id:'q2', type:'radio', label:'If yes: Have you thought about how you might do it?', options:['No','Yes'] },
        { id:'q3', type:'radio', label:'Any intention or plan to act on these thoughts?', options:['No','Yes'] },
        { id:'q4', type:'radio', label:'Any actions or preparations toward ending your life?', options:['No','Yes'] }
      ],
      requiresLicense: true
    },
    prompts: [
      'Create an HTML C‑SSRS screening demo with conditional questions and a bold safety notice; do not compute risk scores.',
      'Generate a static HTML with emergency contact banner and clear next‑steps placeholders.',
      'Compose a page that logs yes/no answers and prints a structured risk note.',
      'Build an HTML form with a prominent “If Yes, stop and follow policy” banner.',
      'Create a page with a safety plan placeholder block (if any yes answers).',
      'Produce a layout with a large red notice for emergency procedures.',
      'Generate an HTML form that includes clinician signature/date lines.',
      'Create a kiosk‑friendly version with large buttons and clear language.',
      'Compose an HTML template that emphasizes non‑diagnostic, triage‑only purpose.',
      'Build a form that includes links to local emergency resources.'
    ],
    references: [
      { label:'Official C‑SSRS site', url:'https://cssrs.columbia.edu/' },
      { label:'APA suicide assessment resources', url:'https://www.psychiatry.org/' },
      { label:'NIMH suicide prevention', url:'https://www.nimh.nih.gov/' }
    ],
    licensingNote: 'Exact wording/scoring require permission; use approved materials in clinical care.'
  }
};
