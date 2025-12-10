

import React from 'react';

export type SectionId =
  | 'all' | 'rapid_triage' | 'intake_hpi' | 'risk_safety'
  | 'scales_measures' | 'diagnosis' | 'treatment_plan'
  | 'medications' | 'psychotherapy' | 'follow_up'
  | 'psychoeducation' | 'ethics_consent'
  | 'progress_letters'
  | 'medication-orders'
  | 'mbc'
  | 'handouts'
  | 'camhs'
  | 'groups-programs'
  | 'case-letters'
  | 'neuro-med'
  | 'psychometrics'

  | 'psychometrics-daily'
  | 'psychometrics-weekly'
  | 'psychometrics-biweekly'
  | 'psychometrics-monthly'
  | 'psychometrics-longer';

export type CardTag =
  | 'anxiety' | 'depression' | 'psychosis' | 'mania' | 'sleep' | 'trauma'
  | 'substance' | 'adolescent' | 'risk' | 'alcohol' | 'ptsd' | 'stress'
  | 'insomnia' | 'perinatal' | 'bipolar' | 'mood' | 'suicide' | 'cbt'
  | 'intake' | 'adult' | 'brief' | 'mse' | 'scid-5' | 'whodas'
  | 'guardian' | 'school' | 'comprehensive' | 'collateral' | 'child'
  | 'triage' | 'agitation' | 'catatonia'
  | 'progress' | 'documentation' | 'outpatient' | 'telehealth'
  | 'letter' | 'referral' | 'consult' | 'bilingual'
  | 'work' | 'accommodations' | 'return-to-work' | 'apso'
  | 'lithium' | 'monitoring' | 'renal' | 'thyroid' | 'valproate' | 'divalproex'
  | 'PPP' | 'liver' | 'platelets' | 'teratogenicity' | 'clozapine' | 'ANC'
  | 'myocarditis' | 'CIGH' | 'metabolic'

  | 'deescalation' | 'delirium' | 'medical' | 'redflags' | 'escalation'
  | 'safetyplan' | 'violence' | 'capacity' | 'consent' | 'means' | 'safety'
  | 'forensic';

export type PromptVariable = {
  key: string; label: string;
  type?: 'text' | 'number' | 'select' | 'multiline' | 'textarea' | 'checkbox' | 'date' | 'tags';
  placeholder?: string; options?: string[]; required?: boolean; default?: string;
};
export type PromptSpec = {
  id: string; label: string; template: string;
  variables?: PromptVariable[]; intent?: 'note'|'risk'|'education'|'treatment'|'followup';
  safety?: 'info'|'judgement'|'crisis';
  generators?: Array<{ id: string; label: string; hint?: string }>;
};
export type EvidenceItem = {
  title: string;
  authors?: string;
  year?: string | number;
  journal?: string;
  doi?: string;
  link?: string;
  level?: 'Guideline' | 'Meta-analysis' | 'RCT' | 'Cohort' | 'Case' | 'Review';
  note?: string;
};
export type Card = {
  id: string;
  title: string;
  sectionId: SectionId;
  summary?: string;
  tags?: CardTag[];
  descriptionHtml?: string;
  html?: string;
  plain?: string;
  prompts?: PromptSpec[];
  evidence?: EvidenceItem[];
  figureHtml?: string;
  examples?: Array<{ id: string; label: string; html: string }>;
};
export type CardDetail = { id: string; title: string; description: string; html: string; plain: string; prompts: PromptSpec[] };

export type SectionMeta = {
  id: SectionId;
  label: string;
  tooltip?: string;
  aliases?: string[];
  icon?: React.FC;
};
