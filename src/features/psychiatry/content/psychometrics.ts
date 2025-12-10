

export type Reference = { citation: string };

export type PsychometricItem = {
  id: string;
  title: string;
  kind: 'autoscore' | 'diary';
  subtype?: 'phq9' | 'gad7' | 'pcl5' | 'ybocs' | 'auditc' | 'mood' | 'sleep' | 'drsp' | string;
  clinical_summary: string[];
  indications: string[];
  contraindications: string[];
  outcome_measures: string[];
  prompts: string[];
  references: Reference[];
};

export const PSYCHOMETRICS: PsychometricItem[] = [
  {
    id: 'pm-phq9',
    title: 'PHQ-9 — Depression Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'phq9',
    clinical_summary: [
      'Validated 9-item depression severity scale with item 9 (suicidality) alerting.',
      'Typical cutoffs: 0–4 minimal; 5–9 mild; 10–14 moderate; 15–19 moderately severe; 20–27 severe.',
      'Use serially in Measurement-Based Care (MBC) to track response/remission.'
    ],
    indications: [ 'Baseline severity; follow-up tracking in MDD; primary care/psychiatry settings.' ],
    contraindications: [ 'None; if active suicidality is endorsed, triage to safety plan / acute pathway.' ],
    outcome_measures: [ 'PHQ-9 total; item 9; % change from baseline; remission ≤4 maintained.' ],
    prompts: [
      'Create a code in HTML as page that autoscores PHQ-9 with item-level inputs and shows severity band and safety alert on item 9.',
      'Create a code in HTML as page that compares baseline and current PHQ-9 and displays % change and response/remission status.'
    ],
    references: [
      { citation: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. J Gen Intern Med. 2001.' },
      { citation: 'APA Practice Guideline for MDD (4th ed.). 2023.' }
    ]
  },
  {
    id: 'pm-isi',
    title: 'ISI — Insomnia Severity Index (Autoscore)',
    kind: 'autoscore',
    subtype: 'isi',
    clinical_summary: [ '7-item insomnia severity index; 0–28 total.' ],
    indications: [ 'Insomnia symptoms monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'ISI total; severity band.' ],
    prompts: [ 'Create a code in HTML as page that autoscores ISI and shows severity bands with print CSS.' ],
    references: [ { citation: 'Bastien CH, Vallières A, Morin CM. Validation of the Insomnia Severity Index. Sleep Med. 2001.' } ]
  },
  {
    id: 'pm-gad7',
    title: 'GAD-7 — Anxiety Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'gad7',
    clinical_summary: [
      'Validated 7-item anxiety severity scale.',
      'Typical cutoffs: 5 mild; 10 moderate; 15 severe.',
      'Use serially in MBC to monitor anxiety treatment response.'
    ],
    indications: [ 'GAD and anxiety spectrum baseline and follow-up monitoring.' ],
    contraindications: [ 'None; interpret in clinical context and comorbidity.' ],
    outcome_measures: [ 'GAD-7 total; % change from baseline; response/remission.' ],
    prompts: [
      'Create a code in HTML as page that autoscores GAD-7 with severity bands and a printable summary.',
      'Create a code in HTML as page that charts serial GAD-7 scores with dates and % change.'
    ],
    references: [ { citation: 'Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder: the GAD-7. Arch Intern Med. 2006.' } ]
  },
  {
    id: 'pm-oasis',
    title: 'OASIS — Anxiety Severity & Impairment (Autoscore)',
    kind: 'autoscore',
    subtype: 'oasis',
    clinical_summary: [ '5-item severity/impairment scale; ≥8 suggests clinically significant anxiety.' ],
    indications: [ 'Anxiety monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'OASIS total.' ],
    prompts: [ 'Create a code in HTML as page that autoscores OASIS and flags threshold.' ],
    references: [ { citation: 'Norman SB et al. Psychometric properties of the OASIS. Psychol Assess. 2006.' } ]
  },
  {
    id: 'pm-pdss-sr',
    title: 'PDSS-SR — Panic Disorder Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'pdss-sr',
    clinical_summary: [ '7-item self-report panic severity; program thresholds vary (e.g., ≥8).' ],
    indications: [ 'Panic disorder monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'PDSS-SR total.' ],
    prompts: [ 'Create a code in HTML as page that autoscores PDSS-SR and shows interpretation.' ],
    references: [ { citation: 'Houck PR et al. PDSS-SR psychometrics. J Psychiatr Res. 2002.' } ]
  },
  {
    id: 'pm-spin',
    title: 'SPIN — Social Phobia Inventory (Autoscore)',
    kind: 'autoscore',
    subtype: 'spin',
    clinical_summary: [ '17-item social anxiety scale; common threshold ≥19.' ],
    indications: [ 'Social anxiety monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'SPIN total.' ],
    prompts: [ 'Create a code in HTML as page that autoscores SPIN and prints a summary.' ],
    references: [ { citation: 'Connor KM et al. The SPIN. Br J Psychiatry. 2000.' } ]
  },
  {
    id: 'pm-asrm',
    title: 'ASRM — Mania Self-Rating (Autoscore)',
    kind: 'autoscore',
    subtype: 'asrm',
    clinical_summary: [ '5-item mania self-rating; ≥6 suggests hypomania/mania.' ],
    indications: [ 'Bipolar symptom monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'ASRM total.' ],
    prompts: [ 'Create a code in HTML as page that autoscores ASRM and flags threshold.' ],
    references: [ { citation: 'Altman EG et al. Development of a mania rating scale. Biol Psychiatry. 1997.' } ]
  },
  {
    id: 'pm-epds',
    title: 'EPDS — Postnatal Depression (Autoscore)',
    kind: 'autoscore',
    subtype: 'epds',
    clinical_summary: [ '10-item perinatal depression scale; threshold commonly ≥13; item 10 risk-check.' ],
    indications: [ 'Perinatal depression screening/monitoring.' ],
    contraindications: [ 'None; triage risk if item 10 positive.' ],
    outcome_measures: [ 'EPDS total; risk item.' ],
    prompts: [ 'Create a code in HTML as page that autoscores EPDS and flags risk item.' ],
    references: [ { citation: 'Cox JL et al. Detection of postnatal depression. Br J Psychiatry. 1987.' } ]
  },
  {
    id: 'pm-pcl5',
    title: 'PCL-5 — PTSD Symptom Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'pcl5',
    clinical_summary: [ '20-item PTSD symptom severity scale; follow local validation thresholds.', 'Use serially to monitor treatment.' ],
    indications: [ 'PTSD screening/monitoring in appropriate contexts.' ],
    contraindications: [ 'None; ensure trauma-informed administration; consider distress management.' ],
    outcome_measures: [ 'PCL-5 total; % change from baseline.' ],
    prompts: [ 'Create a code in HTML as page that autoscores PCL-5 and highlights cluster scores (B–E).' ],
    references: [ { citation: 'Weathers FW et al. The PTSD Checklist for DSM-5 (PCL-5). National Center for PTSD.' } ]
  },
  {
    id: 'pm-k10',
    title: 'K10 — Psychological Distress (Autoscore)',
    kind: 'autoscore',
    subtype: 'k10',
    clinical_summary: [ '10-item distress scale; 10–50 total; severity bands.' ],
    indications: [ 'General distress screening/monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'K10 total; severity band.' ],
    prompts: [ 'Create a code in HTML as page that autoscores K10 and shows banding.' ],
    references: [ { citation: 'Kessler RC et al. K10 validation studies.' } ]
  },
  {
    id: 'pm-phq15',
    title: 'PHQ-15 — Somatic Symptom Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'phq15',
    clinical_summary: [ '15-item somatic symptoms; 0–30 total with low/medium/high.' ],
    indications: [ 'Somatization; primary care.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'PHQ-15 total.' ],
    prompts: [ 'Create a code in HTML as page that autoscores PHQ-15 and prints summary.' ],
    references: [ { citation: 'Kroenke K et al. PHQ-15. Psychosom Med. 2002.' } ]
  },
  {
    id: 'pm-oci-r',
    title: 'OCI-R — Obsessive-Compulsive Inventory (Autoscore)',
    kind: 'autoscore',
    subtype: 'oci-r',
    clinical_summary: [ '18-item OCI-R; 0–72 total; subscales.' ],
    indications: [ 'OCD symptom monitoring.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'OCI-R global and subscales.' ],
    prompts: [ 'Create a code in HTML as page that autoscores OCI-R with subscale totals.' ],
    references: [ { citation: 'Foa EB et al. OCI-R. Psychol Assess. 2002.' } ]
  },
  {
    id: 'pm-ybocs',
    title: 'Y-BOCS — OCD Severity (Autoscore)',
    kind: 'autoscore',
    subtype: 'ybocs',
    clinical_summary: [ 'Clinician-rated OCD severity; include patient self-report version when applicable.', 'Use serially to monitor response.' ],
    indications: [ 'OCD symptom severity assessment.' ],
    contraindications: [ 'None; ensure consistent rater if possible.' ],
    outcome_measures: [ 'Y-BOCS total; % change.' ],
    prompts: [ 'Create a code in HTML as page that captures Y-BOCS items, totals, and prints a summary.' ],
    references: [ { citation: 'Goodman WK et al. The Yale–Brown Obsessive Compulsive Scale. Arch Gen Psychiatry. 1989.' } ]
  },
  {
    id: 'pm-audit',
    title: 'AUDIT — Alcohol Use Disorders Identification Test (Autoscore)',
    kind: 'autoscore',
    subtype: 'audit',
    clinical_summary: [ '10-item hazardous/harmful alcohol use screener; thresholds vary by program.' ],
    indications: [ 'Alcohol use screening.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'AUDIT total; risk category.' ],
    prompts: [ 'Create a code in HTML as page that autoscores AUDIT and prints brief-intervention note.' ],
    references: [ { citation: 'Saunders JB et al. Development of the AUDIT. Addiction. 1993.' } ]
  },
  {
    id: 'pm-dast10',
    title: 'DAST-10 — Drug Abuse Screening Test (Autoscore)',
    kind: 'autoscore',
    subtype: 'dast10',
    clinical_summary: [ '10 yes/no items; 0–10 total with 0 none, 1–2 low, 3–5 moderate, 6–8 substantial, 9–10 severe.' ],
    indications: [ 'Drug use risk screening.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'DAST-10 total; risk band.' ],
    prompts: [ 'Create a code in HTML as page that autoscores DAST-10 and shows risk band.' ],
    references: [ { citation: 'Skinner HA. The Drug Abuse Screening Test. Addict Behav. 1982.' } ]
  },
  {
    id: 'pm-assist',
    title: 'WHO ASSIST — Substance Involvement (Worksheet)',
    kind: 'autoscore',
    subtype: 'assist',
    clinical_summary: [ 'WHO ASSIST captures lifetime and recent substance involvement; use official form.' ],
    indications: [ 'Substance use assessment.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'Substance-specific risk scores.' ],
    prompts: [ 'Create a code in HTML as page that builds ASSIST worksheet with scoring guidance.' ],
    references: [ { citation: 'Humeniuk R et al. The ASSIST. WHO. 2008.' } ]
  },
  {
    id: 'pm-asrs',
    title: 'ASRS v1.1 — Adult ADHD Screener (Worksheet)',
    kind: 'autoscore',
    subtype: 'asrs',
    clinical_summary: [ '6-item Part A with decision rule; use official wording.' ],
    indications: [ 'Adult ADHD screening.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'Part A decision rule; symptom count.' ],
    prompts: [ 'Create a code in HTML as page that renders ASRS Part A and computes decision rule.' ],
    references: [ { citation: 'Kessler RC et al. The ASRS v1.1. World Psychiatry. 2005.' } ]
  },
  {
    id: 'pm-vanderbilt',
    title: 'Vanderbilt — ADHD (Worksheet)',
    kind: 'autoscore',
    subtype: 'vanderbilt',
    clinical_summary: [ 'Parent/Teacher forms; symptom and performance sections; use official form.' ],
    indications: [ 'Pediatric ADHD assessment.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'Symptom counts; performance impairment.' ],
    prompts: [ 'Create a code in HTML as page that renders Vanderbilt worksheet with autosum.' ],
    references: [ { citation: 'Wolraich ML et al. Vanderbilt ADHD Diagnostic Rating Scales.' } ]
  },
  {
    id: 'pm-snap-iv',
    title: 'SNAP-IV — ADHD/ODD (Worksheet)',
    kind: 'autoscore',
    subtype: 'snap-iv',
    clinical_summary: [ 'ADHD/ODD symptoms; use licensed items.' ],
    indications: [ 'Pediatric ADHD/ODD assessment.' ],
    contraindications: [ 'None.' ],
    outcome_measures: [ 'Symptom totals by domain.' ],
    prompts: [ 'Create a code in HTML as page that renders SNAP-IV worksheet with domain totals.' ],
    references: [ { citation: 'Swanson JM. SNAP-IV.' } ]
  },
  {
    id: 'pm-c-ssrs',
    title: 'C-SSRS — Columbia Suicide Severity Rating Scale (Screening Worksheet)',
    kind: 'autoscore',
    subtype: 'c-ssrs',
    clinical_summary: [ 'Screening version; follow institutional policies and official instrument.' ],
    indications: [ 'Suicide risk screening; triage.' ],
    contraindications: [ 'None; ensure safety protocol.' ],
    outcome_measures: [ 'Risk categorization per instrument guidance.' ],
    prompts: [ 'Create a code in HTML as page that renders C-SSRS screen skeleton with risk summary.' ],
    references: [ { citation: 'Posner K et al. The Columbia–Suicide Severity Rating Scale.' } ]
  },
  {
    id: 'pm-auditc',
    title: 'AUDIT-C — Alcohol Use (Autoscore)',
    kind: 'autoscore',
    subtype: 'auditc',
    clinical_summary: [ '3-item hazardous alcohol use screener; institutional thresholds vary.', 'Use serially to monitor risk reduction.' ],
    indications: [ 'Alcohol use screening in adult populations.' ],
    contraindications: [ 'None; interpret with context and collateral.' ],
    outcome_measures: [ 'AUDIT-C total; threshold crossing; serial change.' ],
    prompts: [ 'Create a code in HTML as page that autoscores AUDIT-C and flags threshold crossing with brief counseling script.' ],
    references: [ { citation: 'Bush K et al. The AUDIT Alcohol Consumption Questions (AUDIT-C). Arch Intern Med. 1998.' } ]
  },
  {
    id: 'pm-mood-diary',
    title: 'Daily Mood Diary (Printable)',
    kind: 'diary',
    subtype: 'mood',
    clinical_summary: [ 'One-page daily mood diary to capture mood, anxiety, sleep, activities, and notes.', 'Supports BA/CBT and medication monitoring.' ],
    indications: [ 'Behavioral activation, CBT, general monitoring.' ],
    contraindications: [ 'None; adapt literacy and language.' ],
    outcome_measures: [ 'Self-rated mood/anxiety over days; adherence to activities; sleep hours.' ],
    prompts: [ 'Create a code in HTML as printable mood diary with a weekly grid and 0–10 sliders for mood/anxiety.' ],
    references: [ { citation: 'CBT behavior monitoring tools — educational templates.' } ]
  },
  {
    id: 'pm-sleep-diary',
    title: 'Sleep Diary (Printable)',
    kind: 'diary',
    subtype: 'sleep',
    clinical_summary: [ 'Weekly sleep diary with bedtime, SOL, awakenings, total sleep time, and sleep quality.', 'Supports CBT-I and medication monitoring.' ],
    indications: [ 'Insomnia, circadian issues, SSRI/SNRI titration effects.' ],
    contraindications: [ 'None; adjust for shift work.' ],
    outcome_measures: [ 'TST; SOL; WASO; sleep quality.' ],
    prompts: [ 'Create a code in HTML as printable sleep diary grid for 7 days with key fields and totals.' ],
    references: [ { citation: 'CBT-I educational sleep diary templates.' } ]
  },
  {
    id: 'pm-drsp',
    title: 'Daily Record of Severity of Problems (DRSP) — Diary (Printable)',
    kind: 'diary',
    subtype: 'drsp',
    clinical_summary: [ 'Diary to track premenstrual symptom patterns across cycles (non-proprietary educational layout).', 'Use to support PMDD assessment and monitoring with local tools.' ],
    indications: [ 'PMDD/PME assessment and tracking.' ],
    contraindications: [ 'None; adapt to local validated instruments and policies.' ],
    outcome_measures: [ 'Symptom severity over cycle days; functional impact.' ],
    prompts: [ 'Create a code in HTML as printable DRSP-style diary grid across cycle days with symptom ratings.' ],
    references: [ { citation: 'Endorsed clinical resources for PMDD monitoring — educational templates.' } ]
  }
];
