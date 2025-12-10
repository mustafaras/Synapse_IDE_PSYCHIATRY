

export const GROUP_LABELS = {
  symptom: 'Symptom',
  risk: 'Risk & Safety',
  diagnosis: 'Diagnosis',
  modality: 'Intervention / Modality',
  medication: 'Medication & Monitoring',
  docs: 'Documentation',
  legal: 'Legal & Education',
  population: 'Population / Setting',
  other: 'Other'
} as const;

export type GroupKey = keyof typeof GROUP_LABELS;



export const TAG_GROUPS: Record<string, GroupKey> = {

  depression: 'symptom', anxiety: 'symptom', insomnia: 'symptom', mania: 'symptom', ptsd: 'symptom', ocd: 'symptom', adhd: 'symptom', trauma: 'symptom', irritability: 'symptom', sleep: 'symptom', headache: 'symptom',

  suicide: 'risk', suicidality: 'risk', 'self-harm': 'risk', safety: 'risk', risk: 'risk', violence: 'risk', intoxication: 'risk', withdrawal: 'risk', 'safety-plan': 'risk', 'safetyplan_html': 'risk', 'safety plan': 'risk', 'risk_triage': 'risk',

  mdd: 'diagnosis', 'major-depression': 'diagnosis', gad: 'diagnosis', bpad: 'diagnosis', scz: 'diagnosis', schizophrenia: 'diagnosis', sud: 'diagnosis', substance: 'diagnosis', adhd_dx: 'diagnosis', ptsd_dx: 'diagnosis',

  cbt: 'modality', dbt: 'modality', mi: 'modality', mindfulness: 'modality', psychoeducation: 'modality', psychoed: 'modality', ipt: 'modality', sbirt: 'modality', 'brief-protocols': 'modality', brief: 'modality', engagement: 'modality', trauma_informed: 'modality', psychosis_interview: 'modality', mania_screen: 'modality', headsss: 'modality', intake: 'modality', assessment: 'modality', scoring: 'modality',

  lithium: 'medication', clozapine: 'medication', ssri: 'medication', snri: 'medication', benzodiazepine: 'medication', 'anc': 'medication', ecg: 'medication', labs: 'medication', monitoring: 'medication', 'phq9-score-ts': 'medication', 'gad7-score-ts': 'medication',

  documentation: 'docs', mse: 'docs', mse_html: 'docs', soap: 'docs', soap_html: 'docs', 'soap note': 'docs', plan: 'docs', response: 'docs', remission: 'docs', 'safety plan outline': 'docs', 'capacity assessment outline': 'docs', 'mse scaffold': 'docs',

  consent: 'legal', disclaimer: 'legal', education: 'legal', handout: 'legal', capacity_assess: 'legal', 'capacity': 'legal', ethics: 'legal', 'legal': 'legal',

  perinatal: 'population', geriatric: 'population', adolescent: 'population', pediatric: 'population', youth: 'population', child: 'population', inpatient: 'population', 'primary care': 'population', 'primary-care': 'population', ed: 'population', outpatient: 'population', 'follow-up': 'population'
  ,

  phq9: 'docs', gad7: 'docs', pcl5: 'docs', triage: 'risk', psychosis: 'symptom', bipolar: 'diagnosis'
};

export function resolveGroup(key: string): GroupKey {
  const k = key.toLowerCase();
  return TAG_GROUPS[k] || 'other';
}

export interface GroupedChip<T> { group: GroupKey; items: T[]; }

export function groupChips<T extends { key: string }>(chips: T[]): GroupedChip<T>[] {
  const buckets: Record<GroupKey, T[]> = {
    symptom: [], risk: [], diagnosis: [], modality: [], medication: [], docs: [], legal: [], population: [], other: []
  };
  for (const c of chips) { buckets[resolveGroup(c.key)].push(c); }
  const ordered: GroupKey[] = ['symptom','risk','diagnosis','modality','medication','docs','legal','population','other'];
  return ordered
    .map(g => ({ group: g, items: buckets[g] }))
    .filter(g => g.items.length > 0);
}
