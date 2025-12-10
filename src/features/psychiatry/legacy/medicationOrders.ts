import type { Card } from '../lib/types';

export const medicationOrderCards: Card[] = [
  {
    id: 'mo-lithium',
    title: 'Lithium — Order & Monitoring Sheet',
    sectionId: 'medication-orders',
    tags: ['lithium','bipolar','monitoring','renal','thyroid'],
    summary: 'Order template with target range, trough timing, baseline & ongoing labs, interaction cautions, follow-up cadence.',
    html: `\n<h2>Lithium — Order & Monitoring</h2>\n<p><strong>Patient:</strong> {{patient}} &nbsp; <strong>Date:</strong> {{date}} &nbsp; <strong>Indication:</strong> {{indication}}</p>\n\n<h3>Order</h3>\n<ul>\n  <li><strong>Product/brand:</strong> {{brand}}</li>\n  <li><strong>Dose & schedule:</strong> {{dose}}</li>\n  <li><strong>Target trough range:</strong> {{target_range}}</li>\n  <li><strong>Trough timing:</strong> {{trough_timing}}</li>\n</ul>\n\n<h3>Baseline</h3>\n<ul>\n  <li><strong>Renal:</strong> {{renal_baseline}}</li>\n  <li><strong>Thyroid & calcium:</strong> {{thyroid_ca}}</li>\n  {{?pregnancy_block: <li><strong>Pregnancy (if applicable):</strong> {{pregnancy_block}}</li>}}\n  {{?ecg: <li><strong>ECG (if risk):</strong> {{ecg}}</li>}}\n</ul>\n\n<h3>Ongoing Monitoring</h3>\n<ul>\n  <li><strong>Trough levels:</strong> {{trough_levels}}</li>\n  <li><strong>Renal (eGFR/BUN/Cr):</strong> {{renal_follow}}</li>\n  <li><strong>Thyroid (TSH ± free T4):</strong> {{thyroid_follow}}</li>\n  <li><strong>Other labs (Ca, weight/BMI):</strong> {{other_labs}}</li>\n</ul>\n\n<h3>Counseling & Risk Mitigation</h3>\n<p>{{counseling}}</p>\n<p class="muted" style="font-size:12px">12–14h post-dose trough; avoid dehydration/NSAIDs; educational support tool only.</p>\n`,
    prompts: [{
      id: 'mo-lithium-base',
      label: 'Lithium — base order',
      template: '',
      variables: [
        { key:'patient', label:'Patient/ID', type:'text', required:true },
        { key:'date', label:'Date', type:'date', required:true },
        { key:'indication', label:'Indication', type:'select', options:['Acute mania','Maintenance','Augmentation (depression)','Suicidality reduction'] },
        { key:'brand', label:'Product/brand', type:'text', placeholder:'IR vs ER (sustained-release)' },
        { key:'dose', label:'Dose & schedule', type:'text', placeholder:'e.g., 300 mg AM + 600 mg HS; consolidate HS if tolerated' },
        { key:'target_range', label:'Target trough range', type:'select', options:['0.6–0.8 (maintenance)','0.8–1.0 (acute)','Other (specify in notes)'] },
        { key:'trough_timing', label:'Trough timing', type:'text', placeholder:'12–14h post-dose (morning draw)' },
        { key:'renal_baseline', label:'Baseline renal', type:'text', placeholder:'eGFR, BUN/Cr, urinalysis (if indicated)' },
        { key:'thyroid_ca', label:'Baseline thyroid/calcium', type:'text', placeholder:'TSH ± free T4; Ca' },
        { key:'pregnancy_block', label:'Pregnancy status', type:'text', placeholder:'test if applicable; counsel first-trimester risk' },
        { key:'ecg', label:'ECG (if risk factors)', type:'text' },
        { key:'trough_levels', label:'Trough level schedule', type:'text', placeholder:'5–7d after change; q3–6mo when stable' },
        { key:'renal_follow', label:'Renal follow-up', type:'text', placeholder:'eGFR q6–12mo (more if CKD)' },
        { key:'thyroid_follow', label:'Thyroid follow-up', type:'text', placeholder:'TSH q6–12mo' },
        { key:'other_labs', label:'Other labs/monitoring', type:'text', placeholder:'weight/BMI; Ca annually' },
        { key:'counseling', label:'Counseling', type:'multiline', required:true }
      ],
      generators: [
        { id:'order', label:'Create order set' },
        { id:'monitoring', label:'Make monitoring schedule' },
        { id:'bilingual', label:'Create bilingual (EN/TR)' },
        { id:'printfriendly', label:'Make print-friendly' }
      ]
    }],
    evidence: [
      { title:'Lithium monitoring (SPS/NHS)', authors:'SPS', year:'2021', link:'https://www.sps.nhs.uk/monitorings/lithium-monitoring/' },
      { title:'Shared-care lithium guidelines', authors:'TEWV NHS', year:'2024', link:'https://www.tewv.nhs.uk/wp-content/uploads/2022/01/Lithium-Shared-Care-Guidelines.pdf' }
    ],
    figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Lithium — Monitoring Core</figcaption>\n  <ul style="font-size:12px">\n    <li>Trough 12–14h post-dose</li>\n    <li>Renal & thyroid baseline → q6–12mo</li>\n    <li>Watch DDIs (NSAIDs, ACEi/ARBs, diuretics)</li>\n  </ul>\n</figure>`
  },
  {
    id: 'mo-valproate',
    title: 'Valproate — Order, Monitoring & PPP Compliance',
    sectionId: 'medication-orders',
    tags: ['valproate','divalproex','PPP','liver','platelets','teratogenicity'],
    summary: 'Therapeutic range notes, LFT/CBC schedule, pancreatitis warnings, PPP compliance block.',
    html: `\n<h2>Valproate — Order & Monitoring</h2>\n<p><strong>Patient:</strong> {{patient}} &nbsp; <strong>Date:</strong> {{date}} &nbsp; <strong>Indication:</strong> {{indication}}</p>\n\n<h3>Order</h3>\n<ul>\n  <li><strong>Formulation:</strong> {{formulation}}</li>\n  <li><strong>Dose & schedule:</strong> {{dose}}</li>\n  <li><strong>Trough target (if checked):</strong> {{trough_target}}</li>\n</ul>\n\n<h3>Baseline</h3>\n<ul>\n  <li><strong>Liver:</strong> {{liver_baseline}}</li>\n  <li><strong>Hematology:</strong> {{cbc_baseline}}</li>\n  {{?pregnancy_block: <li><strong>PPP / pregnancy status (if applicable):</strong> {{pregnancy_block}}</li>}}\n</ul>\n\n<h3>Ongoing Monitoring</h3>\n<ul>\n  <li><strong>Valproate levels:</strong> {{levels_schedule}}</li>\n  <li><strong>LFT/CBC cadence:</strong> {{labs_schedule}}</li>\n  <li><strong>Adverse effect watch:</strong> {{se_watch}}</li>\n</ul>\n\n<h3>Counseling & Risk Mitigation</h3>\n<p>{{counseling}}</p>\n<p class="muted" style="font-size:12px">Major teratogenic/neurodevelopmental risks in pregnancy; PPP required where applicable. Support tool; not a substitute for clinical judgment.</p>\n`,
    prompts: [{
      id: 'mo-valproate-base',
      label: 'Valproate — base order',
      template: '',
      variables: [
        { key:'patient', label:'Patient/ID', type:'text', required:true },
        { key:'date', label:'Date', type:'date', required:true },
        { key:'indication', label:'Indication', type:'select', options:['Bipolar mania','Maintenance','Other'] },
        { key:'formulation', label:'Formulation', type:'text', placeholder:'divalproex ER / sodium valproate' },
        { key:'dose', label:'Dose & schedule', type:'text', placeholder:'e.g., ER 25 mg/kg qHS; titrate' },
        { key:'trough_target', label:'Trough target (µg/mL)', type:'select', options:['50–100 (maintenance)','50–125 (mania)','Not using levels routinely'], required:true },
        { key:'liver_baseline', label:'Baseline liver', type:'text', placeholder:'LFTs ± PT/INR; hepatic history' },
        { key:'cbc_baseline', label:'Baseline hematology', type:'text', placeholder:'CBC/platelets' },
        { key:'pregnancy_block', label:'PPP/pregnancy status', type:'textarea', placeholder:'contraindicated without PPP; contraception; consent/RAFs' },
        { key:'levels_schedule', label:'Level schedule', type:'text', placeholder:'check after titration/changes; q3–6mo when stable' },
        { key:'labs_schedule', label:'LFT/CBC cadence', type:'text', placeholder:'closely during first 6 months → periodic (e.g., q3–6mo)' },
        { key:'se_watch', label:'Adverse effect watch', type:'tags', placeholder:'hepatitis; thrombocytopenia; pancreatitis; weight; tremor; teratogenicity' },
        { key:'counseling', label:'Counseling & risk mitigation', type:'textarea', required:true }
      ],
      generators: [
        { id:'order', label:'Create order set' },
        { id:'monitoring', label:'Make monitoring schedule', hint:'levels + LFT/CBC cadence' },
        { id:'ppp', label:'Compose PPP compliance note', hint:'eligibility, contraception, consent' },
        { id:'bilingual', label:'Create bilingual (EN/TR)' },
        { id:'printfriendly', label:'Make print-friendly' }
      ]
    }],
    evidence: [
      { title:'SPS — Valproic acid/sodium valproate monitoring', authors:'SPS', year:'2021', link:'https://www.sps.nhs.uk/monitorings/valproic-acid-and-sodium-valproate-monitoring/' },
      { title:'MHRA — Valproate reproductive risks / PPP', authors:'MHRA (UK)', year:'2025', link:'https://www.gov.uk/guidance/valproate-reproductive-risks' },
      { title:'NICE CG185 — Valproate + PPP', authors:'NICE', year:'2023', link:'https://www.nice.org.uk/guidance/cg185' },
      { title:'StatPearls — Valproic acid', authors:'NCBI Bookshelf', year:'2024', link:'https://www.ncbi.nlm.nih.gov/books/NBK559112/' }
    ],
    figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Valproate — Monitoring Highlights</figcaption>\n  <ul style="font-size:12px">\n    <li>LFT/CBC: close in first 6 mo → periodic</li>\n    <li>Levels (if used): 50–100 (maintenance), up to 50–125 (mania)</li>\n    <li>PPP required (where applicable)</li>\n  </ul>\n</figure>`
  },
  {
    id: 'mo-clozapine',
    title: 'Clozapine — Initiation, ANC & Safety Tracker',
    sectionId: 'medication-orders',
    tags: ['clozapine','ANC','myocarditis','CIGH','metabolic'],
    summary: 'Initiation with ANC baseline/schedule, myocarditis screen, constipation (CIGH) prevention, metabolic monitoring.',
    html: `\n<h2>Clozapine — Initiation, ANC & Safety</h2>\n<p><strong>Patient:</strong> {{patient}} &nbsp; <strong>Date:</strong> {{date}} &nbsp; <strong>Indication:</strong> {{indication}}</p>\n\n<h3>Pre-Initiation</h3>\n<ul>\n  <li><strong>Baseline ANC:</strong> {{anc_baseline}}</li>\n  <li><strong>Other baseline:</strong> {{baseline_other}}</li>\n  <li><strong>REMS note:</strong> {{rems_note}}</li>\n</ul>\n\n<h3>Initiation / Titration</h3>\n<ul>\n  <li><strong>Starting dose & schedule:</strong> {{start_dose}}</li>\n  <li><strong>CRP/troponin monitoring (wks 1–4+):</strong> {{myocarditis_monitor}}</li>\n  <li><strong>Constipation prevention (CIGH):</strong> {{cigh_plan}}</li>\n</ul>\n\n<h3>ANC Monitoring</h3>\n<ul>\n  <li><strong>Schedule:</strong> {{anc_schedule}}</li>\n  <li><strong>BEN thresholds (if applicable):</strong> {{ben_thresholds}}</li>\n</ul>\n\n<h3>Metabolic & Other Safety</h3>\n<ul>\n  <li><strong>Metabolic:</strong> {{metabolic}}</li>\n  <li><strong>Other safety:</strong> {{other_safety}}</li>\n</ul>\n\n<h3>Plan</h3>\n<p>{{plan}}</p>\n<p class="muted" style="font-size:12px">FDA removed REMS (Aug 27 2025); ANC monitoring continues per label. Support tool; not a substitute for clinical judgment.</p>\n`,
    prompts: [{
      id: 'mo-clozapine-base',
      label: 'Clozapine — base',
      template: '',
      variables: [
        { key:'patient', label:'Patient/ID', type:'text', required:true },
        { key:'date', label:'Date', type:'date', required:true },
        { key:'indication', label:'Indication', type:'select', options:['TRS (≥2 adequate trials)','Suicidality in schizophrenia','Severe aggression','Other'] },
        { key:'anc_baseline', label:'Baseline ANC', type:'text', placeholder:'≥1500/µL (or BEN per label)' },
        { key:'baseline_other', label:'Other baseline', type:'tags', placeholder:'ECG; weight/BMI/waist/BP; A1c/glucose; lipids; CRP/troponin; bowel history' },
        { key:'rems_note', label:'REMS note', type:'text', placeholder:'FDA removed REMS (Aug 27, 2025); ANC monitoring continues per label' },
        { key:'start_dose', label:'Starting dose & titration', type:'textarea', placeholder:'e.g., 12.5 mg once/twice day 1 → slow titration' },
        { key:'myocarditis_monitor', label:'CRP/troponin schedule', type:'text', placeholder:'weekly wks 1–4 (± extend to 6–8 if risk)' },
        { key:'cigh_plan', label:'Constipation/CIGH prevention', type:'textarea', placeholder:'education; hydration/fibre; prophylactic osmotic ± stimulant; review anticholinergics' },
        { key:'anc_schedule', label:'ANC schedule', type:'text', placeholder:'weekly 6 mo → every 2 wks 6 mo → monthly thereafter' },
        { key:'ben_thresholds', label:'BEN thresholds (if applicable)', type:'text', placeholder:'per local label' },
        { key:'metabolic', label:'Metabolic monitoring', type:'textarea', placeholder:'baseline → ~3 mo → annual (more often if indicated)' },
        { key:'other_safety', label:'Other safety watch', type:'tags', placeholder:'seizure risk at high doses; sialorrhea; orthostasis' },
        { key:'plan', label:'Integrated plan text', type:'textarea', required:true }
      ],
      generators: [
        { id:'order', label:'Create initiation order & safety checklist' },
        { id:'anc', label:'Make ANC calendar', hint:'weekly → q2w → monthly' },
        { id:'myocarditis', label:'Compose myocarditis screen plan', hint:'CRP/troponin + stop rules' },
        { id:'cigh', label:'Make constipation/CIGH prevention plan' },
        { id:'printfriendly', label:'Make print-friendly' }
      ]
    }],
    evidence: [
      { title:'FDA — Clozapine REMS removed; ANC per labeling continues', authors:'FDA', year:'2025', link:'https://www.fda.gov/drugs/drug-safety-and-availability/fda-removes-risk-evaluation-and-mitigation-strategy-rems-program-antipsychotic-drug-clozapine' },
      { title:'Clozapine Prescribing Information — ANC algorithm', authors:'Teva (US PI)', year:'2025', link:'https://www.tevaclozapine.com/globalassets/clozapine/clozapinepi.pdf' }
    ],
    figureHtml: `\n<figure>\n  <figcaption style="font-size:12px;margin-bottom:6px">Clozapine — Early Safety Map</figcaption>\n  <ol style="font-size:12px;padding-left:16px">\n    <li>Baseline: ANC, vitals, ECG, metabolic labs</li>\n    <li>Weeks 1–4: CRP/troponin weekly; ANC weekly</li>\n    <li>GI: proactive constipation plan (CIGH)</li>\n    <li>ANC: weekly → q2w (months 7–12) → monthly</li>\n  </ol>\n</figure>`
  }
];
