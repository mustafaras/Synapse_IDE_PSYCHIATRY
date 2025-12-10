import type { SectionMeta } from './types';



export const SECTIONS: SectionMeta[] = [
  { id: 'all',              label: 'All', tooltip: 'Show all sections' },
  { id: 'intake_hpi',       label: 'Intake & HPI', tooltip: 'Present illness, key history & MSE scaffold', aliases: ['intake','HPI'] },
  { id: 'scales_measures',  label: 'Scales & Measures', tooltip: 'Baseline & serial severity instruments (PHQ-9, GAD-7, etc.)', aliases: ['scales','measures','forms','Scales & Forms'] },
  { id: 'mbc',              label: 'Measurement-Based Care (MBC)', tooltip: 'Serial severity tracking, response/remission rules', aliases: ['MBC','measurement based care','Measurement-Based Care'] },
  { id: 'rapid_triage',     label: 'Acute Triage & Emergencies', tooltip: 'Agitation/catatonia/delirium rapid pathway', aliases: ['rapid triage','acute','emergencies'] },
  { id: 'risk_safety',      label: 'Risk Assessment & Safety Planning', tooltip: 'Suicidality, C-SSRS gating, safety & means restriction', aliases: ['risk & safety','c-ssrs','safety plan','suicide plan','means safety'] },
  { id: 'diagnosis',        label: 'Diagnosis & Differential', tooltip: 'Differentials, medical red flags, and 5Ps formulation.', aliases: ['differential','dx','differential diagnosis','formulation'] },
  { id: 'treatment_plan',   label: 'Treatment Planning', tooltip: 'SMART goals, cadence, SDM, care level, relapse prevention', aliases: ['treatment plan','planning','SMART goals','care level'] },
  { id: 'psychotherapy',    label: 'Psychotherapies', tooltip: 'CBT/BA/CBT-I, exposure, relapse prevention', aliases: ['psychotherapy','therapies','therapy','CBT-I','exposure'] },
  { id: 'medications',      label: 'Medication Selection', tooltip: 'Selection logic, augmentation, trade-offs, perinatal, geriatric, interactions', aliases: ['medications','pharmacotherapy','med selection','augmentation','perinatal','geriatric'] },
  { id: 'medication-orders',label: 'Medication Orders & Monitoring', tooltip: 'Orders & monitoring sheets, metabolic/QT trackers', aliases: ['orders','monitoring sheets','labs','metabolic','QT','ECG'] },
  { id: 'follow_up',        label: 'Follow-up & Monitoring', tooltip: 'APSO follow-ups, side-effects/adherence, MBC trends, cadence, coordination', aliases: ['follow-up','monitoring'] },
  { id: 'progress_letters', label: 'Progress Notes & Letters', tooltip: 'Progress notes, referrals, accommodations, fitness, discharge/transfer', aliases: ['notes','progress notes','letters','documentation'] },
  { id: 'psychoeducation',  label: 'Psychoeducation', tooltip: 'Plain-language clinical explainers (depression, anxiety/panic, bipolar, exposure)' },
  { id: 'handouts',         label: 'Patient Handouts', tooltip: 'Print-ready patient handouts (depression, sleep, crisis, med start)', aliases: ['handouts','patient materials'] },
  { id: 'ethics_consent',   label: 'Ethics & Consent', tooltip: 'Medication/therapy/telehealth consent, confidentiality explainer', aliases: ['consent','ethics'] },
  { id: 'camhs',            label: 'Child & Adolescent (CAMHS)', tooltip: 'Child/adolescent intake, ADHD supports, autism accommodations', aliases: ['child','adolescent','pediatric','camhs'] },
  { id: 'groups-programs',  label: 'Group Visits & Programs', tooltip: 'Psychoeducation, DBT skills, family sessions', aliases: ['groups','programs'] },
  { id: 'case-letters',     label: 'Case Forms & Letters', tooltip: 'Function-focused letters for benefits, travel, reintegration', aliases: ['forms','case letters'] },
  { id: 'neuro-med',        label: 'Neuropsychiatry & Medical Liaison', tooltip: 'Cognitive screen, seizure/TBI liaison, sleep/circadian workup', aliases: ['neuropsychiatry','neuro-med','medical liaison'] },
];


export const SECTION_KEYWORDS: Record<string, string[]> = {
  intake_hpi: ['intake','HPI','history','mse','collateral','functional','risk','onset','symptoms'],
  scales_measures: ['screening','cutoffs','phq-9','gad-7','audit-c','dast','mdq','baseline','severity'],
  mbc: ['measurement','response','remission','serial','tracking','percent change','longitudinal'],
  rapid_triage: ['agitation','catatonia','delirium','red flags','escalation'],
  risk_safety: ['suicide','safety plan','violence risk','capacity','means safety','forensic'],
  diagnosis: ['diagnosis','differential','5Ps','mania','psychosis','PTSD','OCD','ADHD','ASD','personality','red flags','formulation','medical'],
  treatment_plan: ['plan','SMART','cadence','SDM','care level','relapse','follow-up','goals','interventions'],
  psychotherapy: ['CBT','behavioural activation','CBT-I','exposure','relapse prevention','homework','therapy'],
  medications: ['selection','augmentation','side effects','perinatal','geriatric','CYP','QT','monitoring'],
  'medication-orders': ['lithium','valproate','clozapine','anc','orders','monitoring','levels','metabolic','QT','ECG'],
  follow_up: ['follow-up','APSO','side-effects','adherence','MBC','trend','coordination','RTC'],
  progress_letters: ['note','letter','referral','accommodation','fitness','discharge','transfer'],
  psychoeducation: ['education','explainers','depression','anxiety','panic','bipolar','exposure'],
  handouts: ['handout','print','depression','sleep','crisis','medication start','FAQ'],
  ethics_consent: ['consent','therapy','telehealth','confidentiality','privacy','boundaries'],
  camhs: ['child','adolescent','school','ADHD','autism','accommodations','family'],
  'groups-programs': ['group','DBT','psychoeducation','family','program'],
  'case-letters': ['letter','benefits','disability','travel','return to work/school'],
  'neuro-med': ['cognitive','neurology','TBI','seizure','sleep','circadian','liaison'],
};
