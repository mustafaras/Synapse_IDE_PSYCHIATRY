import type { Card } from '../lib/types';


export function buildPsychometricsCards(): Card[] {

  const base = (id: string, title: string, sectionId: Card['sectionId'], tags: string[] = []): Card => ({
    id,
    title,
    sectionId,

    tags: (tags.filter(Boolean) as unknown as Card['tags']) || []
  });
  return [

    base('pm-phq9', 'PHQ-9 — Depression Severity (Autoscore)', 'psychometrics-biweekly', ['phq9','scales','mbc','psychometrics']),
    base('pm-gad7', 'GAD-7 — Anxiety Severity (Autoscore)', 'psychometrics-biweekly', ['gad7','scales','mbc','psychometrics']),
    base('pm-isi', 'ISI — Insomnia Severity Index (Autoscore)', 'psychometrics-biweekly', ['isi','sleep','psychometrics']),

    base('pm-ybocs', 'Y-BOCS — OCD Severity (Autoscore)', 'psychometrics-weekly', ['ybocs','scales','mbc','psychometrics']),
    base('pm-oasis', 'OASIS — Anxiety Severity & Impairment (Autoscore)', 'psychometrics-weekly', ['oasis','anxiety','psychometrics']),
    base('pm-pdss-sr', 'PDSS-SR — Panic Disorder Severity (Autoscore)', 'psychometrics-weekly', ['pdss-sr','panic','psychometrics']),
    base('pm-spin', 'SPIN — Social Phobia Inventory (Autoscore)', 'psychometrics-weekly', ['spin','social-anxiety','psychometrics']),
    base('pm-asrm', 'ASRM — Mania Self-Rating (Autoscore)', 'psychometrics-weekly', ['asrm','bipolar','psychometrics']),
    base('pm-epds', 'EPDS — Postnatal Depression (Autoscore)', 'psychometrics-weekly', ['epds','perinatal','psychometrics']),

    base('pm-pcl5', 'PCL-5 — PTSD Symptom Severity (Autoscore)', 'psychometrics-monthly', ['pcl5','scales','mbc','psychometrics']),
    base('pm-k10', 'K10 — Psychological Distress (Autoscore)', 'psychometrics-monthly', ['k10','distress','psychometrics']),
    base('pm-phq15', 'PHQ-15 — Somatic Symptom Severity (Autoscore)', 'psychometrics-monthly', ['phq15','somatic','psychometrics']),
    base('pm-oci-r', 'OCI-R — Obsessive-Compulsive Inventory (Autoscore)', 'psychometrics-monthly', ['oci-r','ocd','psychometrics']),
  base('pm-psqi', 'PSQI — Pittsburgh Sleep Quality Index', 'psychometrics-monthly', ['psqi','sleep','worksheet','psychometrics']),
  base('pm-ghq12', 'GHQ-12 — General Health Questionnaire', 'psychometrics-monthly', ['ghq12','screen','worksheet','psychometrics']),
  base('pm-ede-q', 'EDE-Q — Eating Disorder Examination Questionnaire', 'psychometrics-monthly', ['ede-q','eating','worksheet','psychometrics']),

    base('pm-auditc', 'AUDIT-C — Alcohol Use (Autoscore)', 'psychometrics-longer', ['auditc','scales','mbc','psychometrics']),
    base('pm-audit', 'AUDIT — Alcohol Use Disorders Identification Test (Autoscore)', 'psychometrics-longer', ['audit','alcohol','psychometrics']),
    base('pm-dast10', 'DAST-10 — Drug Abuse Screening Test (Autoscore)', 'psychometrics-longer', ['dast10','substance','psychometrics']),
    base('pm-assist', 'WHO ASSIST — Substance Involvement (Worksheet)', 'psychometrics-longer', ['assist','substance','worksheet','psychometrics']),
    base('pm-asrs', 'ASRS v1.1 — Adult ADHD Screener (Worksheet)', 'psychometrics-longer', ['asrs','adhd','worksheet','psychometrics']),
    base('pm-vanderbilt', 'Vanderbilt (Parent/Teacher) — ADHD (Worksheet)', 'psychometrics-longer', ['vanderbilt','adhd','worksheet','psychometrics']),
    base('pm-snap-iv', 'SNAP-IV — ADHD/ODD (Worksheet)', 'psychometrics-longer', ['snap-iv','adhd','worksheet','psychometrics']),
    base('pm-c-ssrs', 'C-SSRS — Columbia Suicide Severity Rating Scale (Screening Worksheet)', 'psychometrics-longer', ['c-ssrs','safety','worksheet','psychometrics']),

    base('pm-mood-diary', 'Daily Mood Diary (Printable)', 'psychometrics-daily', ['diary','mood','psychometrics']),
    base('pm-sleep-diary', 'Sleep Diary (Printable)', 'psychometrics-daily', ['diary','sleep','psychometrics']),
    base('pm-drsp', 'DRSP — Daily Record of Severity of Problems (Printable Diary)', 'psychometrics-daily', ['diary','drsp','psychometrics'])
  ];
}
