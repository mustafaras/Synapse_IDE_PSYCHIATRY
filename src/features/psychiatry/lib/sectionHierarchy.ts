import type { SectionId, SectionMeta } from './types';


export interface SectionNode {
  id: string;
  label: string;
  order: number;
  parentId?: string;
  tooltip?: string;
  keywords?: string[];
  children?: SectionNode[];
}


export const SECTION_TREE: SectionNode[] = [
  {
    id: 'grp-assessment',
    label: 'Assessment & Initial Encounter',
    order: 10,
    tooltip: 'Intake, baseline severity and measurement-based care foundation',
    keywords: ['intake','HPI','assessment','baseline','MSE','scales','MBC','severity','response','remission'],
    children: [
      { id: 'intake_hpi', label: 'Intake & HPI', order: 11, tooltip: 'Present illness, history & MSE scaffold', keywords: ['intake','HPI','history','mse'] },
      { id: 'scales_measures', label: 'Scales & Measures', order: 12, tooltip: 'PHQ-9, GAD-7 and other rating tools', keywords: ['scales','measures','rating','phq9','gad7'] },
      { id: 'mbc', label: 'Measurement-Based Care (MBC)', order: 13, tooltip: 'Serial tracking & treatment response', keywords: ['mbc','measurement','tracking','response','remission'] },
    ],
  },
  {
    id: 'grp-risk',
    label: 'Risk, Safety & Acute Triage',
    order: 20,
    tooltip: 'Rapid crisis pathways and structured safety planning',
    keywords: ['risk','safety','suicide','triage','acute','agitation','catatonia','delirium','crisis'],
    children: [
  { id: 'rapid_triage', label: 'Acute Triage & Emergencies', order: 21, tooltip: 'Agitation / catatonia / delirium rapid pathway', keywords: ['agitation','catatonia','delirium','red flags','escalation'] },
  { id: 'risk_safety', label: 'Risk Assessment & Safety Planning', order: 22, tooltip: 'Suicidality, C-SSRS gating & means safety', keywords: ['suicide','safety plan','violence risk','capacity','means safety','forensic'] },
    ],
  },
  {
    id: 'grp-diagnosis',
    label: 'Diagnosis & Formulation',
    order: 30,
    tooltip: 'Differential construction and biopsychosocial formulation',
    keywords: ['diagnosis','differential','formulation','dsm','icd','dx'],
    children: [
      { id: 'diagnosis', label: 'Diagnosis & Differential', order: 31, tooltip: 'DSM/ICD differentials & formulation hints', keywords: ['differential','dx','diagnosis','formulation'] },
    ],
  },
  {
    id: 'grp-treatment',
    label: 'Treatment Planning & Interventions',
    order: 40,
    tooltip: 'Multimodal pharmacologic and psychotherapeutic strategy',
    keywords: ['treatment','plan','intervention','pharmacotherapy','psychotherapy','goals'],
    children: [
      { id: 'treatment_plan', label: 'Treatment Planning', order: 41, tooltip: 'Goals, modalities, measurable outcomes', keywords: ['treatment','plan','goals','modalities','outcomes'] },
      { id: 'psychotherapy', label: 'Psychotherapies', order: 42, tooltip: 'CBT/BA/IPT/trauma-focused & brief protocols', keywords: ['psychotherapy','cbt','ipt','trauma','therapy'] },
      { id: 'medications', label: 'Medication Selection', order: 43, tooltip: 'Choice, titration & side-effect management', keywords: ['medication','selection','titration','side effects'] },
      { id: 'medication-orders', label: 'Medication Orders & Monitoring', order: 44, tooltip: 'Lithium / valproate / clozapine orders & labs', keywords: ['orders','lithium','valproate','clozapine','monitoring'] },
    ],
  },
  {
    id: 'grp-followup',
    label: 'Follow-up & Documentation',
    order: 50,
    tooltip: 'Ongoing care, monitoring metrics and clinical documentation',
    keywords: ['follow-up','monitoring','notes','documentation','soap','apso','letters'],
    children: [
      { id: 'follow_up', label: 'Follow-up & Monitoring', order: 51, tooltip: 'Serial scales, side-effects, cadence', keywords: ['follow-up','monitoring','serial','scales','side effects'] },
      { id: 'progress_letters', label: 'Progress Notes & Letters', order: 52, tooltip: 'SOAP/APSO, referrals, summaries', keywords: ['progress','notes','letters','soap','apso','referral'] },
    ],
  },
  {
    id: 'grp-education',
    label: 'Education, Consent & Handouts',
    order: 60,
    tooltip: 'Clinician psychoeducation, patient handouts and consent',
    keywords: ['education','handouts','consent','ethics','psychoeducation','patient materials'],
    children: [
      { id: 'psychoeducation', label: 'Psychoeducation', order: 61, tooltip: 'Brief clinician education notes', keywords: ['education','psychoeducation','clinician'] },
      { id: 'handouts', label: 'Patient Handouts', order: 62, tooltip: 'Print-ready patient materials', keywords: ['handouts','patient','materials','education'] },
      { id: 'ethics_consent', label: 'Ethics & Consent', order: 63, tooltip: 'Consent/assent, capacity & boundaries', keywords: ['ethics','consent','capacity','boundaries'] },
    ],
  },
  {
    id: 'grp-special',
    label: 'Special Populations & Liaison',
    order: 70,
    tooltip: 'Population-specific and liaison psychiatry contexts',
    keywords: ['child','adolescent','groups','programs','letters','neuro','liaison'],
    children: [
      { id: 'camhs', label: 'Child & Adolescent (CAMHS)', order: 71, tooltip: 'ADHD/ASD tools, school supports', keywords: ['child','adolescent','camhs','adhd','asd','school'] },
      { id: 'groups-programs', label: 'Group Visits & Programs', order: 72, tooltip: 'Family psychoeducation, CBT groups, DBT skills', keywords: ['group','program','family','cbt','dbt'] },
      { id: 'case-letters', label: 'Case Forms & Letters', order: 73, tooltip: 'Employment / education / fitness / travel letters', keywords: ['case','forms','letters','employment','fitness','travel'] },
      { id: 'neuro-med', label: 'Neuropsychiatry & Medical Liaison', order: 74, tooltip: 'Neurology liaison, cognitive screens, capacity', keywords: ['neuro','liaison','cognitive','capacity','medical'] },
    ],
  },

  {
    id: 'grp-psychometrics',
    label: 'Psychometric Scales & Diaries',
    order: 80,
    tooltip: 'Validated rating scales, daily diaries, and autoscore utilities',
    keywords: ['psychometric','scales','diaries','mbc','measurement','phq9','gad7','pcl5','ybocs','auditc','sleep','mood','drsp'],
    children: [

      { id: 'psychometrics-daily', label: 'Daily (Prospective) Diaries', order: 81, tooltip: 'DRSP, Consensus Sleep Diary, Life-Chart, DBT diary', keywords: ['daily','diary','drsp','sleep','lcm','dbt'] },
      { id: 'psychometrics-weekly', label: 'Weekly (Past 7 Days)', order: 82, tooltip: 'HAM-D, MADRS, QIDS, OASIS, PDSS-SR, SPIN, Y-BOCS, ASRM, YMRS, EPDS, PANSS, BPRS, FIBSER', keywords: ['weekly','7 days','depression','anxiety','panic','social','ocd','mania','perinatal','psychosis','fibser'] },
      { id: 'psychometrics-biweekly', label: 'Biweekly (Past 14 Days)', order: 83, tooltip: 'PHQ-9, GAD-7, ISI', keywords: ['biweekly','14 days','phq9','gad7','isi'] },
      { id: 'psychometrics-monthly', label: 'Monthly (Past 28–30 Days)', order: 84, tooltip: 'PSQI, PCL-5, OCI-R, PHQ-15, K10, GHQ-12, EDE-Q, ESS', keywords: ['monthly','28 days','30 days','psqi','pcl5','oci-r','phq15','k10','ghq12','ede-q','ess'] },
      { id: 'psychometrics-longer', label: 'Longer Windows / Baseline Screeners', order: 85, tooltip: 'ASRS, Vanderbilt, SNAP-IV, AUDIT-C/AUDIT, DAST-10, ASSIST, C-SSRS', keywords: ['6 months','12 months','asrs','vanderbilt','snap-iv','audit','audit-c','dast10','assist','cssrs'] },

      { id: 'psychometrics', label: 'All Scales & Diaries', order: 89, tooltip: 'All instruments', keywords: ['psychometrics','scales','diary','autoscore'] },
    ],
  },
];


export interface SectionIndex {
  flat: SectionNode[];
  byId: Record<string, SectionNode>;
  parentToChildren: Record<string, string[]>;
  leafToParent: Record<string, string>;
}

export function buildSectionIndex(tree: SectionNode[] = SECTION_TREE): SectionIndex {
  const flat: SectionNode[] = [];
  const byId: Record<string, SectionNode> = {};
  const parentToChildren: Record<string, string[]> = {};
  const leafToParent: Record<string, string> = {};

  for (const parent of tree.slice().sort((a,b)=> a.order-b.order)) {

  const { children, ...restParent } = parent;
    const pCopy: SectionNode = { ...restParent } as SectionNode;
    flat.push(pCopy); byId[parent.id] = pCopy; parentToChildren[parent.id] = [];
    for (const child of (children || []).slice().sort((a,b)=> a.order-b.order)) {
      const leaf: SectionNode = { ...child, parentId: parent.id };
      flat.push(leaf); byId[leaf.id] = leaf; parentToChildren[parent.id].push(leaf.id); leafToParent[leaf.id] = parent.id;
    }
  }
  return { flat, byId, parentToChildren, leafToParent };
}

export const SECTION_INDEX: SectionIndex = buildSectionIndex();


export function resolveSectionFilter(id: string | undefined | null): string[] {
  if (!id || id === 'all') return [];
  if (SECTION_INDEX.parentToChildren[id]) return SECTION_INDEX.parentToChildren[id];
  return [id];
}


export const LEGACY_SECTION_LEAVES: SectionMeta[] = SECTION_INDEX.flat
  .filter(n => n.parentId && (n.id as string))
  .map(n => ({ id: n.id as SectionId, label: n.label }));
