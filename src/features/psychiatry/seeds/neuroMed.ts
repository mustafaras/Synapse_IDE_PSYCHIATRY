import type { Card, CardTag, PromptVariable } from '../lib/types';

interface P19EvidenceItem { title: string; year?: string|number; org?: string; journal?: string; link?: string; note?: string }
interface P19VariableSeed { id: string; label: string; type?: 'text'|'textarea'|'number'|'select'|'checkbox'|'date'|'tags'; placeholder?: string; required?: boolean; help?: string; options?: string[]; default?: string|number|string[]; min?: number; max?: number; step?: number }
interface P19PromptSeed { name: string; variables: P19VariableSeed[]; generators?: Array<{ id: string; label: string; hint?: string }> }
interface P19CardSeed { id: string; title: string; tags?: string[]; description?: string; html: string; prompts: P19PromptSeed[]; evidence?: P19EvidenceItem[]; figureHtml?: string }


const nm_card_delirium: P19CardSeed = {
  id: 'nm-delirium-workup',
  title: 'Delirium / Encephalopathy Workup (4AT / CAM-ICU aware)',
  tags: ['delirium','workup','safety'],
  description: 'Rapid, evidence-aligned workup/plan with screen references, risk reduction, and reversible causes. Avoids proprietary tool text.',
  html: `\n<h2>Delirium / Encephalopathy — Clinical Scaffold</h2>\n<p><strong>Date:</strong> {{date}} &nbsp; <strong>Clinician:</strong> {{clinician}} &nbsp; <strong>Setting:</strong> {{setting}}</p>\n\n<h3>Summary</h3>\n<p>Acute fluctuating disturbance in attention/awareness with medical trigger(s); rapid identification & reversible cause management reduce morbidity.</p>\n\n<h3>Key Criteria / Inclusion</h3>\n<ul>\n  <li>Acute onset + fluctuating course (collateral / chart)</li>\n  <li>Inattention + altered level of consciousness</li>\n  <li>Cognitive change (disorientation, memory, language, perception)</li>\n  <li>Not better explained by established neurocognitive disorder or coma</li>\n</ul>\n<p><strong>Screen:</strong> {{screen}} {{?screen_score: (Score {{screen_score}})}} | <strong>Subtype:</strong> {{subtype}} | <strong>Fluctuation:</strong> {{fluctuation}}</p>\n\n<h3>Assessment Steps</h3>\n<ol>\n  <li>Rapid ABC / vitals / glucose / O2; identify immediate threats</li>\n  <li>History & collateral (baseline cognition, onset, meds, substances)</li>\n  <li>Focused exam (neuro; infection; dehydration; pain; retention; constipation)</li>\n  <li>Labs: {{#each labs}}<span>{{item}}</span>{{/each}}</li>\n  <li>Targeted tests: UA/CXR/drug levels as indicated</li>\n  <li>Neuroimaging if {{neuro_imaging_indication}}</li>\n</ol>\n\n<h3>Management / Interventions</h3>\n<ul>\n  <li><strong>Non‑pharmacologic bundle (apply to all):</strong></li>\n  {{#each nonpharm}}<li class="indent">{{item}}</li>{{/each}}\n  <li><strong>Medication review:</strong> deprescribe anticholinergic / sedative burden; optimize analgesia; avoid BZDs unless withdrawal</li>\n  <li><strong>Severe agitation jeopardizing safety:</strong> lowest dose antipsychotic (monitor QTc, EPS, orthostasis)</li>\n</ul>\n\n<h3>Red Flags / Escalation</h3>\n<ul>\n  <li>Uncontrolled agitation risking line removal or airway compromise</li>\n  <li>Focal deficit / concern for stroke, seizure, meningitis → urgent imaging / lumbar puncture per pathway</li>\n  <li>Refractory hypoxia, sepsis, hemodynamic instability</li>\n</ul>\n\n<h3>Documentation Points</h3>\n<ul>\n  <li>Screen tool + score + subtype</li>\n  <li>Predisposing: {{#each predisposing}}<span>{{item}}</span>{{/each}}</li>\n  <li>Precipitating: {{#each precipitating}}<span>{{item}}</span>{{/each}}</li>\n  <li>Capacity / risk communications with family/caregivers (if applicable)</li>\n  <li>Plan for reorientation, mobilization, review interval: {{plan}}</li>\n</ul>\n\n<h3>References</h3>\n<p class="muted" style="font-size:12px">NICE CG103; SCCM PADIS; AGS Beers (2023); 4AT & CAM‑ICU validation literature. Support tool only; not a substitute for clinical judgement or emergency services.</p>\n`,
  prompts: [{
    name: 'Delirium — base',
    variables: [
      { id:'date', label:'Date', type:'date', required:true },
      { id:'clinician', label:'Clinician', type:'text', required:true },
      { id:'setting', label:'Setting', type:'select', options:['ED','Ward','ICU','LTC','Clinic'], default:'Ward' },
      { id:'screen', label:'Screen used', type:'select', options:['4AT','CAM-ICU','ICDSC','Other'], required:true },
      { id:'screen_score', label:'Screen score', type:'text' },
      { id:'subtype', label:'Phenotype', type:'select', options:['Hyperactive','Hypoactive','Mixed','Unspecified'], default:'Mixed' },
      { id:'fluctuation', label:'Fluctuation noted (Y/N)', type:'select', options:['Yes','No'], default:'Yes' },
      { id:'predisposing', label:'Predisposing risks', type:'tags', default:['Dementia/cognitive impairment','Age ≥65','Severe illness','Sensory impairment','Frailty','Substance use'] },
      { id:'precipitating', label:'Precipitating factors', type:'tags', default:['Infection','Electrolyte/metabolic derangement','Dehydration','Hypoxia','New meds (anticholinergic/opioid/BZD)','Pain/retention/constipation'] },
      { id:'labs', label:'Labs panel', type:'tags', default:['CBC','CMP/U&E + Ca/Mg/PO4','Renal & LFT','CRP','TSH ± B12/folate','HbA1c/glucose','VBG/ABG if hypoxia','Toxicology/drug levels (if relevant)'] },
      { id:'neuro_imaging_indication', label:'Neuroimaging (if…)', type:'text', default:'Head trauma, focal deficit, anticoagulation head injury, fever with nuchal signs, new seizure, unclear dx' },
      { id:'nonpharm', label:'Non-pharm bundle', type:'tags', default:['Orientation cues & visible clock/calendar','Mobilize; minimize tethers/restraints','Hydration & nutrition; treat pain','Glasses/hearing aids','Sleep hygiene (lights/noise; daytime light)','Avoid nighttime disturbances'] },
      { id:'med_notes', label:'Medication notes', type:'textarea', default:'Review for anticholinergic burden & sedatives (avoid BZDs except withdrawal). If antipsychotic needed for severe distress/threat to safety, use lowest dose with QTc/orthostasis monitoring.' },
      { id:'plan', label:'Plan / reviews', type:'textarea', placeholder:'frequency of review; family engagement; expected course' }
    ],
    generators: [
      { id:'create_initial_plan', label:'Create initial delirium workup & plan' },
      { id:'make_nonpharm_bundle', label:'Make non-pharmacologic bundle handover' },
      { id:'compose_med_review', label:'Compose medication risk review (Beers/anticholinergic)' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'NICE CG103 — Delirium (updated 2023)', org:'NICE', link:'https://www.nice.org.uk/guidance/cg103' },
    { title:'4AT — rapid delirium screen (validation/systematic reviews)', org:'4AT', link:'https://www.the4at.com/' },
    { title:'CAM-ICU / ICDSC & PADIS', org:'SCCM', link:'https://www.sccm.org/clinical-resources/guidelines/guidelines/guidelines-for-the-prevention-and-management-of-pa' },
    { title:'AGS Beers 2023 — anticholinergic burden & delirium risk', org:'AGS', link:'https://geriatrictoolkit.missouri.edu/drug/Beers-Criteria-AGS-2023.pdf' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Delirium — Quick Loop</figcaption>\n  <ol style="font-size:12px;padding-left:16px">\n    <li>Screen (4AT/CAM-ICU) → classify subtype</li>\n    <li>Find triggers (I WATCH DEATH style) → labs/imaging as indicated</li>\n    <li>Non-pharm bundle for all; meds review (anticholinergics/BZDs)</li>\n    <li>Reassess daily; communicate plan</li>\n  </ol>\n</figure>`
};

const nm_card_cog: P19CardSeed = {
  id: 'nm-cognitive-library',
  title: 'Cognitive Screening Library & Summary (Mini-Cog / ACE-III / RUDAS / MoCA policy)',
  tags: ['cognitive','summary'],
  description: 'Choose a brief screen and generate a standardized, licensing-aware summary note with functional framing.',
  html: `\n<h2>Cognitive Screening — Summary</h2>\n<p><strong>Date:</strong> {{date}} &nbsp; <strong>Clinician:</strong> {{clinician}} &nbsp; <strong>Setting:</strong> {{setting}}</p>\n\n<h3>Tool & Context</h3>\n<ul>\n  <li><strong>Tool administered:</strong> {{tool}} {{?score: | <strong>Score:</strong> {{score}}}</li>\n  <li><strong>Language/education/culture notes:</strong> {{context_notes}}</li>\n  <li><strong>Functional impact (ICF):</strong> {{functional}}</li>\n</ul>\n\n<h3>Interpretation (screen ≠ diagnosis)</h3>\n<p>{{interpretation}}</p>\n\n<h3>Next Steps</h3>\n<ul>{{#each next_steps}}<li>{{item}}</li>{{/each}}</ul>\n\n<p class="muted" style="font-size:12px">Respect licensing: MMSE text not reproduced; MoCA requires training/certification; follow local policies.</p>\n`,
  prompts: [{
    name: 'Cognitive Library — base',
    variables: [
      { id:'date', label:'Date', type:'date', required:true },
      { id:'clinician', label:'Clinician', type:'text', required:true },
      { id:'setting', label:'Setting', type:'select', options:['Clinic','Ward','ED','Community'], default:'Clinic' },
      { id:'tool', label:'Tool', type:'select', options:['Mini-Cog','ACE-III','RUDAS','MoCA (certified)'], required:true },
      { id:'score', label:'Score (if applicable)', type:'text' },
      { id:'context_notes', label:'Language/Education/Culture notes', type:'textarea', placeholder:'interpreter; low literacy; bilingual; sensory issues' },
      { id:'functional', label:'Functional impact (ICF framing)', type:'textarea', placeholder:'attention, memory, way-finding, ADLs/IADLs' },
      { id:'next_steps', label:'Next steps', type:'tags', default:['Review meds & delirium screen if acute change','Bloods for reversible causes','Neuropsychology referral if indicated','Driving/safety advice as per law','Follow-up cognitive clinic'] },
  { id:'language', label:'Language', type:'select', options:['English','Turkish','Bilingual (EN/Turkish)'], default:'English' },
      { id:'interpretation', label:'Interpretation', type:'textarea', placeholder:'Brief narrative: domain strengths/weaknesses; context; caution about screening limits' }
    ],
    generators: [
      { id:'create_summary', label:'Create cognitive screen summary note' },
      { id:'make_patient_info', label:'Make patient-friendly explanation' },
      { id:'compose_referral', label:'Compose referral (memory clinic/neuropsychology)' },
      { id:'printfriendly', label:'Make print-friendly' },
      { id:'bilingual', label:'Compose bilingual (EN/TR)' }
    ]
  }],
  evidence: [
    { title:'Mini-Cog official site (instructions/scoring)', org:'Mini-Cog', link:'https://mini-cog.com/' },
    { title:'ACE-III overview & evidence', org:'Brain & Mind Centre', link:'https://www.sydney.edu.au/brain-mind/our-clinics/dementia-test.html' },
    { title:'RUDAS administration/validation (multicultural)', org:'RUDAS', link:'https://multiculturalmentalhealth.ca/' },
    { title:'MoCA — mandatory training & certification (since 2019)', org:'MoCA', link:'https://mocacognition.com/permission/' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Pick the Right Screen</figcaption>\n  <ul style="font-size:12px">\n    <li>Mini-Cog: very brief (3–5 min)</li>\n    <li>ACE-III: rich domain profile (longer)</li>\n    <li>RUDAS: culturally inclusive</li>\n    <li>MoCA: mild impairment — training required</li>\n  </ul>\n</figure>`
};

const nm_card_capacity: P19CardSeed = {
  id: 'nm-capacity-assessment',
  title: 'Decision-Making Capacity — MCA Two-Stage + Appelbaum Four Abilities',
  tags: ['capacity','documentation'],
  description: 'Decision- & time-specific assessment scaffold with functional test (understand, retain, weigh, communicate).',
  html: `\n<h2>Decision-Making Capacity Assessment</h2>\n<p><strong>Date/time:</strong> {{date}} &nbsp; <strong>Assessor:</strong> {{assessor}} &nbsp; <strong>Decision:</strong> {{decision}}</p>\n\n<h3>Legal/Ethical Frame</h3>\n<p><strong>Jurisdiction:</strong> {{jurisdiction}} &nbsp; <strong>Test applied:</strong> {{test_applied}}</p>\n\n<h3>Two-Stage Test (MCA-style)</h3>\n<ul>\n  <li><strong>Impairment of mind/brain:</strong> {{impairment}}</li>\n  <li><strong>Functional inability because of impairment:</strong> {{causality}}</li>\n</ul>\n\n<h3>Functional Abilities (Appelbaum & Grisso)</h3>\n<ul>\n  <li><strong>Understand:</strong> {{understand}}</li>\n  <li><strong>Retain:</strong> {{retain}}</li>\n  <li><strong>Weigh/Reason:</strong> {{weigh}}</li>\n  <li><strong>Communicate choice:</strong> {{communicate}}</li>\n</ul>\n\n<h3>Enhancements Tried</h3>\n<p>{{enhancements}}</p>\n\n<h3>Conclusion & Best-Interests (if lacking)</h3>\n<p>{{conclusion}}</p>\n`,
  prompts: [{
    name: 'Capacity — base',
    variables: [
      { id:'date', label:'Date/time', type:'date', required:true },
      { id:'assessor', label:'Assessor', type:'text', required:true },
      { id:'decision', label:'Specific decision assessed', type:'text', required:true },
      { id:'jurisdiction', label:'Jurisdiction', type:'select', options:['England/Wales (MCA 2005)','Other'], default:'England/Wales (MCA 2005)' },
      { id:'test_applied', label:'Test applied', type:'text', default:'MCA two-stage test + 4 abilities (Appelbaum & Grisso)' },
      { id:'impairment', label:'Stage 1 — impairment', type:'textarea', required:true },
      { id:'causality', label:'Stage 2 — because of impairment?', type:'textarea', required:true },
      { id:'understand', label:'Understand', type:'textarea', required:true },
      { id:'retain', label:'Retain', type:'textarea', required:true },
      { id:'weigh', label:'Weigh/Reason', type:'textarea', required:true },
      { id:'communicate', label:'Communicate choice', type:'textarea', required:true },
      { id:'enhancements', label:'Enhancements tried (support to decide)', type:'textarea', placeholder:'simplified info, interpreter, aids, timing/location adjustments' },
      { id:'conclusion', label:'Conclusion & best-interests (if lacking)', type:'textarea', required:true }
    ],
    generators: [
      { id:'create_capacity_note', label:'Create capacity assessment note' },
      { id:'make_best_interests_record', label:'Make best-interests decision record' },
      { id:'compose_patient_explanation', label:'Compose patient-friendly explanation' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'Mental Capacity Act — two-stage test & principles', org:'NHS', link:'https://www.nhs.uk/' },
    { title:'Four abilities model of capacity', org:'Appelbaum & Grisso', link:'https://www.nejm.org/doi/abs/10.1056/NEJM198812223192504' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Capacity — Decision-Specific Flow</figcaption>\n  <ul style="font-size:12px">\n    <li>Support to decide → apply two-stage test</li>\n    <li>Document 4 abilities with quotes/examples</li>\n    <li>If lacking → best-interests checklist & record</li>\n  </ul>\n</figure>`
};

const nm_card_referrals: P19CardSeed = {
  id: 'nm-referrals',
  title: 'EEG / MRI Referral Templates (First Seizure; Psychosis with Neuro Flags)',
  tags: ['referral','psychosis'],
  description: 'Criteria-based referral text for EEG and MRI/CT that aligns with first-seizure & FEP guidance.',
  html: `\n<h2>EEG / MRI Referral</h2>\n<p><strong>Date:</strong> {{date}} &nbsp; <strong>Referrer:</strong> {{referrer}} &nbsp; <strong>Service:</strong> {{service}}</p>\n\n<h3>EEG — First Unprovoked Seizure</h3>\n<ul>\n  <li><strong>Clinical summary:</strong> {{seizure_summary}}</li>\n  <li><strong>EEG timing:</strong> {{eeg_timing}}</li>\n  <li><strong>Safety/legal notes:</strong> {{driving}}</li>\n</ul>\n\n<h3>MRI/CT — Psychosis (when indicated)</h3>\n<ul>\n  <li><strong>Indication:</strong> {{psychosis_imaging_indication}}</li>\n  <li><strong>Neuro flags present:</strong> {{#each neuro_flags}}<span>{{item}}</span>{{/each}}</li>\n  <li><strong>Requested modality:</strong> {{modality}} (contrast: {{contrast}})</li>\n</ul>\n\n<h3>Attachments</h3>\n<ul>{{#each attachments}}<li>{{item}}</li>{{/each}}</ul>\n`,
  prompts: [{
    name: 'EEG/MRI — base',
    variables: [
      { id:'date', label:'Date', type:'date', required:true },
      { id:'referrer', label:'Referrer', type:'text', required:true },
      { id:'service', label:'Service', type:'text', default:'Psychiatry / Neuropsychiatry' },
      { id:'seizure_summary', label:'Seizure clinical summary', type:'textarea', placeholder:'witnessed features, focality, post-ictal, meds, tox, provoking factors' },
      { id:'eeg_timing', label:'EEG timing', type:'text', default:'Request EEG within 24h–72h if possible (sleep-deprived if initial normal)' },
      { id:'driving', label:'Driving/safety note (jurisdictional)', type:'textarea', placeholder:'advise per local law' },
      { id:'psychosis_imaging_indication', label:'Imaging indication (FEP)', type:'textarea', default:'NOT routine; request only if neurological signs, head trauma, seizure, atypical/catatonia, late onset, or clinical suspicion of organic cause' },
      { id:'neuro_flags', label:'Neuro red flags', type:'tags', default:['Focal neuro deficit','Seizure-like episode','Head trauma/anticoagulation','New severe headache','Late-onset psychosis','Progressive cognitive change'] },
      { id:'modality', label:'Modality', type:'select', options:['MRI brain','CT head'], default:'MRI brain' },
      { id:'contrast', label:'Contrast?', type:'select', options:['No','Yes (per protocol)'], default:'No' },
      { id:'attachments', label:'Attachments', type:'tags', default:['Neurology notes','Medication list','Abnormal labs/imaging','Collateral history'] }
    ],
    generators: [
      { id:'create_eeg_referral', label:'Create EEG referral (first seizure)' },
      { id:'make_mri_referral', label:'Make MRI/CT referral (psychosis with flags)' },
      { id:'compose_patient_info', label:'Compose patient safety/driving info' },
      { id:'printfriendly', label:'Make print-friendly' }
    ]
  }],
  evidence: [
    { title:'EEG after first unprovoked seizure', org:'AAN/AES', link:'https://www.aafp.org/pubs/afp/issues/2022/0500/p507.html' },
    { title:'Structural neuroimaging in first-episode psychosis — not routine', org:'NICE TA136', link:'https://www.nice.org.uk/guidance/ta136' }
  ],
  figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">When to Image in Psychosis</figcaption>\n  <ul style="font-size:12px">\n    <li>NOT routine in uncomplicated FEP</li>\n    <li>Do image if neuro red flags or atypical course</li>\n    <li>Prefer MRI; CT for trauma/acute bleed suspicion</li>\n  </ul>\n</figure>`
};

export function buildNeuroMedCards(existingIds: Set<string>): Card[] {
  const seeds: P19CardSeed[] = [nm_card_delirium, nm_card_cog, nm_card_capacity, nm_card_referrals];
  const out: Card[] = [];
  for(const seed of seeds){
    if(existingIds.has(seed.id)) continue;
    const allowed: CardTag[] = (seed.tags||[]).filter(t => ['psychosis','risk','documentation','workup','safety'].includes(t)) as CardTag[];
    const card: Card = {
      id: seed.id,
      title: seed.title,
      sectionId: 'neuro-med',
      summary: seed.description,
      tags: allowed.length ? allowed : ['documentation'],
      html: seed.html,
      prompts: seed.prompts.map(p=>({
        id:`${seed.id}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`.replace(/-+/g,'-'),
        label:p.name,
        template:'',
        variables: p.variables.map(v=>{ const pv: PromptVariable = { key:v.id, label:v.label, type: v.type==='textarea' ? 'multiline': (v.type as Exclude<PromptVariable['type'], undefined>) }; if(v.placeholder) pv.placeholder=v.placeholder; if(v.required!==undefined) pv.required=v.required; if(v.options) pv.options=v.options; if(v.default!==undefined) pv.default = v.default as string; return pv; }),
        generators: p.generators
      })),
      evidence: seed.evidence?.map(e=>({ title:e.title, authors:(e.org||''), year:e.year, journal:e.journal, link:e.link, note:e.note })) ?? [],
      figureHtml: seed.figureHtml
    } as Card;
    out.push(card);
  }
  return out;
}
