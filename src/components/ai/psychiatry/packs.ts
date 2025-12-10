import { ANXIETY_TOOLBOX, CAPACITY_ASSESS, DEPRESSION_PSYCHOED, EVIDENCE_APA, EVIDENCE_DSM5TR, EVIDENCE_NICE, EVIDENCE_WHO_MHGAP, GAD7_INSTR, GAD7_JSON_SCHEMA, HEADSSS_PROMPT, MANIA_SCREEN, MED_ADHERENCE, MSE, PANIC_ACTION_PLAN, PHQ9_INSTR, PSYCHOSIS_INTERVIEW, RISK_TRIAGE, SAFETY_PLAN, SBIRT_BRIEF, SLEEP_PSYCHOED, SOAP_NOTE, TRAUMA_INFORMED } from './prompts';
import { PHQ9_JSON_SCHEMA } from './schemas';
import { SCORE_GAD7_TS, SCORE_PHQ9_PY, SCORE_PHQ9_TS } from './score';
import { ASRSv11_HTML, AUDITC_HTML, GAD7_HTML, MDQ_HTML, MSE_HTML, PCL5_HTML, PHQ9_HTML, SAFETY_PLAN_HTML, SOAP_HTML } from './forms/htmlForms';
import type { PsychiatryCatalog } from './types';


const PHQ9_SCHEMA_EXPORT = `// PHQ-9 JSON Schema (Draft 2020-12)\nexport const PHQ9_SCHEMA = ${JSON.stringify(PHQ9_JSON_SCHEMA, null, 2)};`;

export const psychiatryCatalog: PsychiatryCatalog = [
  {
    id: 'screeners',
    label: 'Screeners',
    items: [
      { id: 'phq9-instr', kind: 'prompt', label: 'PHQ-9 Instructions', description: 'Neutral patient-facing instructions (9 items, 0–3 scale).', payload: PHQ9_INSTR, tags: ['phq9','patient','instructions','intake','depression'] },
      { id: 'gad7-instr', kind: 'prompt', label: 'GAD-7 Instructions', description: 'Patient instructions (7 items, 0–3 scale) for generalized anxiety screening.', payload: GAD7_INSTR, tags: ['gad7','patient','instructions','anxiety','intake'] },
      { id: 'phq9-schema', kind: 'code', label: 'PHQ-9 JSON Schema', description: 'JSON Schema for validating PHQ-9 answer payloads (0–3 each).', payload: PHQ9_SCHEMA_EXPORT, lang: 'javascript', tags: ['phq9','schema','json','validation'] },
    ],
  },
  {
    id: 'clinical-notes',
    label: 'Clinical Notes',
    items: [
      { id: 'mse', kind: 'prompt', label: 'MSE Scaffold', description: 'Structured mental status exam outline (appearance, behavior, cognition).', payload: MSE, tags: ['note','mse','structure','assessment'] },
      { id: 'soap', kind: 'prompt', label: 'SOAP Note', description: 'General-purpose SOAP format scaffold (subjective, objective, assessment, plan).', payload: SOAP_NOTE, tags: ['note','soap','structure','documentation'] },
      { id: 'safety-plan', kind: 'prompt', label: 'Safety Plan Outline', description: 'Supportive safety plan template (coping, contacts, resources).', payload: SAFETY_PLAN, tags: ['plan','safety','risk','support'] },
    ],
  },
  {
    id: 'scoring-code',
    label: 'Scoring Code',
    items: [
      { id: 'phq9-score-ts', kind: 'code', label: 'PHQ-9 Scorer (TS)', description: 'TypeScript helper to sum and classify PHQ-9 answer arrays.', payload: SCORE_PHQ9_TS, lang: 'typescript', tags: ['phq9','code','ts','scoring'] },
      { id: 'gad7-score-ts', kind: 'code', label: 'GAD-7 Scorer (TS)', description: 'TypeScript function computing total and severity bands for GAD-7.', payload: SCORE_GAD7_TS, lang: 'typescript', tags: ['gad7','code','ts','scoring'] },
      { id: 'phq9-score-py', kind: 'code', label: 'PHQ-9 Scorer (Python)', description: 'Python snippet (function + DataFrame comment) for PHQ-9 scoring.', payload: SCORE_PHQ9_PY, lang: 'python', tags: ['phq9','code','python','scoring'] },
    ],
  },

  {
    id: 'html_forms',
    label: 'HTML Forms',
    items: [
      { id: 'phq9_html',   kind: 'code', lang: 'html', label: 'PHQ-9 — HTML Form',      tags: ['phq9','form','html','screen'], payload: PHQ9_HTML, description: 'Accessible PHQ-9 with inline scoring (0–27). Educational; not diagnostic.' },
      { id: 'gad7_html',   kind: 'code', lang: 'html', label: 'GAD-7 — HTML Form',      tags: ['gad7','form','html','screen'], payload: GAD7_HTML, description: 'Accessible GAD-7 with inline scoring (0–21). Educational; not diagnostic.' },
      { id: 'pcl5_html',   kind: 'code', lang: 'html', label: 'PCL-5 — HTML Form',      tags: ['pcl5','ptsd','form'], payload: PCL5_HTML, description: '20-item PTSD checklist (0–80). Includes only an educational scoring summary.' },
      { id: 'asrs_html',   kind: 'code', lang: 'html', label: 'ASRS v1.1 — HTML Form',  tags: ['asrs','adhd','form'], payload: ASRSv11_HTML, description: 'Adult ADHD Part A, 6 items; positive screen if ≥4 above-threshold.' },
      { id: 'mdq_html',    kind: 'code', lang: 'html', label: 'MDQ — HTML Form',        tags: ['mdq','bipolar','form'], payload: MDQ_HTML, description: 'MDQ heuristic: ≥7 yes + clustering yes + moderate/severe impairment.' },
      { id: 'auditc_html', kind: 'code', lang: 'html', label: 'AUDIT-C — HTML Form',    tags: ['audit-c','alcohol','form'], payload: AUDITC_HTML, description: '3-item alcohol use screener; thresholds vary by sex/setting.' },
    ],
  },

  {
    id: 'clinical_html',
    label: 'Clinical HTML',
    items: [
      { id: 'mse_html',        kind: 'code', lang: 'html', label: 'MSE — HTML Template',         tags: ['mse','notes','html'], payload: MSE_HTML },
      { id: 'soap_html',       kind: 'code', lang: 'html', label: 'SOAP Note — HTML Template',   tags: ['soap','notes','html'], payload: SOAP_HTML },
      { id: 'safetyplan_html', kind: 'code', lang: 'html', label: 'Safety Plan — HTML Template', tags: ['safety','notes','html'], payload: SAFETY_PLAN_HTML },
    ],
  },
];


psychiatryCatalog.push(
  {
    id: 'clinical_prompts_pro',
    label: 'Clinical Prompts (Pro)',
    items: [
      { id:'risk_triage', kind:'prompt', label:'Suicide/Self-harm Risk Triage', tags:['risk','safety'], payload:RISK_TRIAGE },
      { id:'capacity_assess', kind:'prompt', label:'Capacity Assessment Outline', tags:['capacity','documentation'], payload:CAPACITY_ASSESS },
      { id:'headsss', kind:'prompt', label:'HEADSSS Interview (Adolescent)', tags:['youth','interview'], payload:HEADSSS_PROMPT },
      { id:'sbirt', kind:'prompt', label:'SBIRT Brief Intervention', tags:['substance','alcohol'], payload:SBIRT_BRIEF },
      { id:'sleep_psychoed', kind:'prompt', label:'Sleep Hygiene – Handout', tags:['sleep','education'], payload:SLEEP_PSYCHOED },
      { id:'trauma_informed', kind:'prompt', label:'Trauma-informed Conversation', tags:['trauma','engagement'], payload:TRAUMA_INFORMED },
      { id:'mania_screen', kind:'prompt', label:'Mania/Hypomania Screen', tags:['bipolar','mania'], payload:MANIA_SCREEN },
      { id:'psychosis_interview', kind:'prompt', label:'Psychosis Interview Skeleton', tags:['psychosis','interview'], payload:PSYCHOSIS_INTERVIEW },
      { id:'med_adherence', kind:'prompt', label:'Medication Adherence Review', tags:['medication','adherence'], payload:MED_ADHERENCE },
    ],
  },
  {
    id: 'patient_education',
    label: 'Patient Education',
    items: [
      { id:'depression_handout', kind:'prompt', label:'Depression — Quick Handout', tags:['education','depression'], payload:DEPRESSION_PSYCHOED },
      { id:'anxiety_toolbox', kind:'prompt', label:'Anxiety Toolbox', tags:['education','anxiety'], payload:ANXIETY_TOOLBOX },
      { id:'panic_action', kind:'prompt', label:'Panic Action Plan', tags:['education','panic'], payload:PANIC_ACTION_PLAN },
    ],
  },
  {
    id: 'evidence_resources',
    label: 'Evidence & Resources',
    items: [
      { id:'dsm5tr_index', kind:'prompt', label:'DSM-5-TR Sections (index)', tags:['evidence','DSM-5-TR'], payload:EVIDENCE_DSM5TR },
      { id:'nice_topics', kind:'prompt', label:'NICE guideline topics (index)', tags:['evidence','NICE'], payload:EVIDENCE_NICE },
      { id:'who_mhgap', kind:'prompt', label:'WHO mhGAP summary (index)', tags:['evidence','WHO'], payload:EVIDENCE_WHO_MHGAP },
      { id:'apa_guidelines', kind:'prompt', label:'APA Practice Guideline topics (index)', tags:['evidence','APA'], payload:EVIDENCE_APA },
    ],
  },
  {
    id: 'json_schemas_extra',
    label: 'JSON Schemas (Extra)',
    items: [
      { id:'gad7_schema_js', kind:'code', lang:'javascript', label:'GAD-7 JSON Schema (JS export)', tags:['forms','json','schema','gad7'], payload:`export const GAD7_JSON_SCHEMA = ${JSON.stringify(GAD7_JSON_SCHEMA, null, 2)};` },
    ],
  }
);

export default psychiatryCatalog;
