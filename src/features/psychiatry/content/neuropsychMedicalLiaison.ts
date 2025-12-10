

export type Reference = { citation: string };

export type NeuroItem = {
  id: string;
  title: string;
  clinical_summary: string[];
  indications: string[];
  contraindications: string[];
  outcome_measures: string[];
  example_html: string;
  prompts: string[];
  references: Reference[];
};

export const NEUROPSYCH_MED_LIAISON: NeuroItem[] = [

  {
    id: "cognitive-screen-referral",
    title: "Cognitive Screen & Referral Triggers (Non-proprietary)",
    clinical_summary: [
      "When to screen: memory/attention complaints, functional decline, medication concerns (anticholinergic load, sedatives), psychiatric presentations with cognitive symptoms, post-delirium follow-up, or caregiver concern.",
      "Minimal workup for potentially reversible contributors: CBC, CMP (Na/Ca/glucose), TSH, B12 (± folate), LFTs, renal function, depression screen, review for OSA, alcohol/benzodiazepines/anticholinergics; consider HIV/syphilis per risk.",
      "Referral red flags (urgent neurology): rapidly progressive decline, focal neurologic signs, new gait disturbance/falls, onset <65 y, seizures, severe headache, personality/behavioral change with disinhibition, hallucinations early in course, or abnormal neuro exam.",
      "Non-proprietary first-line screens: Mini-Cog (3-word recall + clock draw), Mini-ACE (if permitted), MoCA alternatives where licensing allows (T-MoCA).",
    ],
    indications: [
      "Outpatient mental health visits where cognition may affect diagnosis, adherence, or safety."
    ],
    contraindications: [
      "Acute delirium or intoxication—stabilize first; language/sensory barriers without appropriate accommodations."
    ],
    outcome_measures: [
      "Mini-Cog pass/fail and qualitative errors, education level, collateral history, functional impact (IADLs), and follow-up plan."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Cognitive Screen & Referral Triggers</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left;vertical-align:top}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  .card{border:1px solid var(--b);border-radius:8px;padding:10px;background:#fafafa}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Cognitive Screen & Referral Triggers</h1><div class="muted">Non-proprietary screening • Risk-aware</div></header>
<main>
<section class="grid">
  <div class="card"><h2>Mini-Cog</h2>
    <ol><li>3-word registration</li><li>Clock draw: “10 past 11”</li><li>3-word recall</li></ol>
    <table><thead><tr><th>Registration</th><th>Clock</th><th>Recall</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td></tr></tbody></table>
    <p>Result: <input placeholder="pass/fail"> • Notes: <input style="width:70%"></p>
  </div>
  <div class="card"><h2>Reversible Factors Checklist</h2>
    <ul>
      <li>Medications (anticholinergic burden, benzo, opioids) — <input></li>
      <li>Depression screen (PHQ-9) — <input></li>
      <li>TSH/B12/CMP — <input></li>
      <li>Sleep/OSA risk, alcohol — <input></li>
    </ul>
  </div>
  </section>
<section>
  <h2>Referral Triggers (Initial each)</h2>
  <table>
    <tbody>
      <tr><td><input type="checkbox"></td><td>Rapid progression or onset < 65 years</td></tr>
      <tr><td><input type="checkbox"></td><td>Focal deficit, seizures, gait disorder/falls</td></tr>
      <tr><td><input type="checkbox"></td><td>New personality/behavioral change</td></tr>
      <tr><td><input type="checkbox"></td><td>Abnormal neuro exam or systemic “red flags”</td></tr>
    </tbody>
  </table>
</section>
<section><h2>Plan</h2><textarea style="width:100%;height:90px" placeholder="Labs, imaging if indicated, neurology referral, cognitive clinic, safety/caregiver guidance"></textarea></section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a cognitive screening sheet using Mini-Cog with result fields, a reversible factors checklist (medications, depression, labs, sleep, alcohol), explicit neurology referral triggers with checkboxes, and a plan text area. Print CSS required.",
      "Create a code in HTML for an anticholinergic burden calculator summary panel that can be appended to notes.",
      "Create a code in HTML for an IADL/ADL functional impact grid (finance, meds, transport, cooking, hygiene) with carer input."
    ],
    references: [
      { citation: "NICE. (2022). Dementia: assessment, management and support for people living with dementia and their carers (NG97 updates)." },
      { citation: "Borson, S., Scanlan, J. M., Brush, M., Vitaliano, P., & Dokmak, A. (2000). The Mini-Cog: a cognitive 'vital signs' measure. International Journal of Geriatric Psychiatry, 15(11), 1021–1027." },
      { citation: "American Academy of Neurology. (2018). Practice guideline update: Mild cognitive impairment." }
    ]
  },


  {
    id: "seizure-tbi-liaison",
    title: "Seizure/TBI — Psychiatry ⇔ Neurology Liaison Checklist",
    clinical_summary: [
      "Capture event timing, semiology, precipitants (sleep loss, alcohol), AED adherence and levels (if applicable), and post-ictal features; screen for PNES features and comorbidity.",
      "Psychotropic interactions & seizure threshold: avoid or use caution with bupropion (dose-dependent risk), clozapine, tramadol; SSRIs/SNRIs generally safe; check QT/cardiometabolic interactions with AEDs.",
      "Post-TBI: track headache, cognition, mood, sleep, PTSD; consider early neurorehabilitation and return-to-activity guidance.",
      "Driving and safety counsel per jurisdiction; SUDEP discussion for epilepsy; perinatal contraception/teratogenicity for valproate and enzyme-inducing AEDs.",
    ],
    indications: [
      "Patients with seizures, spells, or TBI receiving psychiatric care; coordination before med changes."
    ],
    contraindications: [
      "Uncontrolled status epilepticus, new focal deficit, or head injury with red flags → emergency transfer."
    ],
    outcome_measures: [
      "Seizure diary, AED levels/adherence, mood/anxiety scales, sleep metrics, return-to-activity milestones."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Seizure/TBI — Psychiatry ⇔ Neurology Liaison</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Seizure/TBI — Liaison Checklist</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Seizure Event</h2>
    <table><thead><tr><th>When</th><th>Semilogy</th><th>Trigger</th></tr></thead>
      <tbody><tr><td><input type="date"></td><td><input placeholder="focal→bilateral tonic-clonic; absence; myoclonic"></td><td><input></td></tr></tbody></table>
    <label>Post-ictal features</label><input style="width:100%">
  </div>
  <div>
    <h2>Medication</h2>
    <table><thead><tr><th>AED</th><th>Dose</th><th>Level/Date</th><th>Adherence</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td><td><input placeholder="%"></td></tr></tbody></table>
    <label>Psychotropics/Interactions</label><input style="width:100%">
  </div>
</section>
<section>
  <h2>TBI Snapshot</h2>
  <table><thead><tr><th>Injury date/severity</th><th>Symptoms</th><th>Return-to-activity</th></tr></thead>
    <tbody><tr><td><input></td><td><input placeholder="headache, sleep, mood, cognition"></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Safety & Counsel</h2>
  <ul><li>Driving/work restrictions reviewed</li><li>SUDEP / contraception / pregnancy counselling as applicable</li></ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a liaison checklist for seizure/TBI capturing event details, AED regimen with levels/adherence, psychotropic interactions, TBI symptoms/return-to-activity, and safety counselling. Add print CSS.",
      "Create a code in HTML for a seizure diary (date, type, duration, triggers, injuries, rescue meds).",
      "Create a code in HTML for a PNES vs epileptic comparative features sheet with observation checklist."
    ],
    references: [
      { citation: "Krumholz, A., et al. (2015). Evidence-based guideline: Management of an unprovoked first seizure in adults. Neurology, 84(16), 1705–1713 (AAN/AES)." },
      { citation: "Brooks, B. L., et al. (2016). Return to activity after concussion: A systematic review. Clinical Journal of Sport Medicine, 26(4), 262–267." },
      { citation: "Mula, M. (2013). Psychiatric adverse events of antiepileptic drugs. Epilepsy & Behavior, 28, 297–300." }
    ]
  },


  {
    id: "sleep-circadian-workup",
    title: "Sleep & Circadian Workup Outline",
    clinical_summary: [
      "Differentiate insomnia, hypersomnia, circadian rhythm disorders, OSA, RLS/PLMD, parasomnias; characterize schedule, duration, latency, awakenings, quality, naps, caffeine/alcohol/cannabis.",
      "Screen tools: Insomnia Severity Index (ISI), Epworth Sleepiness Scale (ESS), STOP-Bang for OSA risk; sleep diary 2 weeks.",
      "CBT-I is first-line for chronic insomnia; treat OSA per AASM pathways; evaluate meds (sedatives, activating agents) and psychiatric comorbidity.",
      "Red flags: witnessed apneas, loud snoring with daytime somnolence, cataplexy, sleep-related injurious behaviors—prompt sleep medicine referral.",
    ],
    indications: [ "Any psychiatric presentation where sleep may perpetuate symptoms or impair function." ],
    contraindications: [ "Untreated severe OSA with daytime sleepiness—avoid sedatives; parasomnia violence risk—ensure safety first." ],
    outcome_measures: [ "ISI/ESS change, diary metrics, adherence to CBT-I/CPAP, mood/anxiety change." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Sleep & Circadian Workup Outline</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Sleep & Circadian Workup</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Sleep Schedule (2-Week Averages)</h2>
    <table><thead><tr><th>Bedtime</th><th>Latency</th><th>Awakenings</th><th>Rise</th><th>Total Sleep</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
  <div>
    <h2>Screens</h2>
    <table><thead><tr><th>Tool</th><th>Score</th><th>Date</th></tr></thead>
      <tbody><tr><td>ISI / ESS / STOP-Bang</td><td><input></td><td><input type="date"></td></tr></tbody></table>
  </div>
</section>
<section><h2>Phenotype & Contributors</h2>
  <table><thead><tr><th>Type</th><th>Evidence</th><th>Plan</th></tr></thead>
    <tbody><tr><td>Insomnia / OSA / RLS / CRD</td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section><h2>CBT-I & Sleep Hygiene Plan</h2>
  <ul><li>Stimulus control & sleep restriction</li><li>Regular wake time</li><li>Caffeine/alcohol limits</li></ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a sleep & circadian workup page with schedule table, screening scores (ISI/ESS/STOP-Bang), phenotype/contributors table, and CBT-I plan bullets. Include print CSS.",
      "Create a code in HTML for a 2-week sleep diary grid with automatic totals placeholders.",
      "Create a code in HTML for an OSA referral data sheet (STOP-Bang items, ESS, neck circumference, comorbidities)."
    ],
    references: [
      { citation: "American Academy of Sleep Medicine. (2021). Clinical practice guideline for the pharmacologic treatment of chronic insomnia in adults." },
      { citation: "Johns, M. W. (1991). A new method for measuring daytime sleepiness: the Epworth Sleepiness Scale. Sleep, 14(6), 540–545." },
      { citation: "Chung, F., et al. (2016). STOP-Bang Questionnaire: a practical approach to screen for OSA. Chest, 149(3), 631–638." }
    ]
  },


  {
    id: "delirium-encephalopathy",
    title: "Delirium / Encephalopathy Workup (4AT / CAM-ICU)",
    clinical_summary: [
      "Use validated rapid screens: 4AT (acute change/fluctuation, attention, alertness, AMT4) for general wards; CAM-ICU/bCAM in ICU/ED.",
      "Identify precipitants: infection, hypoxia, electrolyte/glucose derangements, dehydration, pain, urinary retention/constipation, meds (anticholinergics/benzodiazepines/opioids), alcohol/benzodiazepine withdrawal, organ failure, stroke.",
      "Initial workup: vitals, glucose, CBC, CMP, Ca/Mg/PO4, LFTs, renal function, O2 saturation/ABG as indicated, urinalysis (avoid over-diagnosis), ECG/QTc, review meds; brain imaging only with focal deficit/trauma/fever with neck stiffness, new seizure.",
      "Management: treat cause, non-pharm bundle (reorient, glasses/hearing aids, mobilize, sleep hygiene), avoid restraints where possible; antipsychotics only for severe distress/safety (avoid in Lewy body dementia/parkinsonism).",
    ],
    indications: [ "Acute change in attention/awareness or fluctuating cognition/behavior." ],
    contraindications: [ "None for screening; for medications, check QT/prolongation and parkinsonism." ],
    outcome_measures: [ "4AT/CAM-ICU results, TIME MAPS bundle adherence, length of stay, complications, readmission." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Delirium / Encephalopathy Workup</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Delirium / Encephalopathy — Rapid Workup</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Screen (select)</h2>
    <table><thead><tr><th>Tool</th><th>Score/Result</th><th>Time</th></tr></thead>
      <tbody><tr><td>4AT / CAM-ICU / bCAM</td><td><input></td><td><input type="datetime-local"></td></tr></tbody></table>
  </div>
  <div>
    <h2>Likely Precipitants</h2>
    <ul><li><input placeholder="infection, hypoxia, electrolytes, meds, withdrawal, organ failure"></li></ul>
  </div>
</section>
<section>
  <h2>Core Labs/Tests</h2>
  <table><thead><tr><th>Test</th><th>Ordered?</th><th>Result/Date</th></tr></thead>
    <tbody><tr><td>CBC, CMP, Ca/Mg/PO4, glucose</td><td><input></td><td><input></td></tr>
           <tr><td>O2 sat/ABG (if hypoxic)</td><td><input></td><td><input></td></tr>
           <tr><td>ECG/QTc</td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Management Plan</h2>
  <ul><li>Non-pharm bundle (reorientation, sleep/wake, mobilize, sensory aids)</li>
      <li>Address pain, retention, constipation</li>
      <li>Medication review: stop deliriogenic agents where possible</li></ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a delirium/encephalopathy rapid workup page including screen selection (4AT/CAM-ICU/bCAM), precipitants list, core lab/tests table, and a non-pharmacologic management checklist. Include print CSS.",
      "Create a code in HTML for a 4AT scoring card with auto-sum placeholders and interpretation bands.",
      "Create a code in HTML for a delirium medication review sheet with anticholinergic/QTc flags."
    ],
    references: [
      { citation: "NICE. (2019 update). Delirium: prevention, diagnosis and management (CG103/NG)."},
      { citation: "Inouye, S. K., et al. (2014). The CAM-ICU and 3D-CAM validation work. Annals of Internal Medicine." },
      { citation: "Bellelli, G., et al. (2014). The 4AT: a rapid clinical test for delirium. Age and Ageing, 43(4), 496–502." }
    ]
  },


  {
    id: "cognitive-screen-library",
    title: "Cognitive Screening Library & Summary (Mini-Cog/MoCA/SLUMS)",
    clinical_summary: [
      "Mini-Cog: rapid, language-light; good for primary screen.",
      "MoCA: sensitive for MCI; education adjustment (+1 point ≤12 years education); licensing terms apply.",
      "SLUMS: includes executive and memory; cutoffs vary by education level; non-proprietary for clinical use per local policy.",
      "Interpret with function, education, language, and mood; avoid sole diagnosis; track MBC over time.",
    ],
    indications: [ "Baseline and serial cognitive screening; summary for referral." ],
    contraindications: [ "Acute delirium/intoxication; severe sensory/language barriers without accommodation." ],
    outcome_measures: [ "Scores with education/language notes, qualitative errors, and functional correlation." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Cognitive Screening Library & Summary</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Cognitive Screening Library & Summary</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Mini-Cog</h2>
    <table><thead><tr><th>Pass/Fail</th><th>Notes</th></tr></thead><tbody><tr><td><input></td><td><input></td></tr></tbody></table>
  </div>
  <div>
    <h2>MoCA</h2>
    <table><thead><tr><th>Score (/30)</th><th>+1 education applied?</th><th>Version</th></tr></thead>
      <tbody><tr><td><input></td><td><input placeholder="Y/N"></td><td><input placeholder="MoCA v7.1/Blind/T-MoCA"></td></tr></tbody></table>
  </div>
  <div>
    <h2>SLUMS</h2>
    <table><thead><tr><th>Score</th><th>Education band</th><th>Interpretation</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
</section>
<section>
  <h2>Functional & Collateral Summary</h2>
  <textarea style="width:100%;height:100px" placeholder="IADLs/ADLs, caregiver inputs, safety concerns"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a cognitive screening library & summary with Mini-Cog, MoCA (education adjustment), and SLUMS tables, plus a functional/collateral summary box. Print CSS required.",
      "Create a code in HTML for a MoCA summary card noting version, education adjustment, domain items, and interpretation bands.",
      "Create a code in HTML for a longitudinal cognitive tracker (sparkline placeholders across visits)."
    ],
    references: [
      { citation: "Nasreddine, Z. S., et al. (2005). The Montreal Cognitive Assessment (MoCA): validation. Journal of the American Geriatrics Society, 53, 695–699." },
      { citation: "Folstein, M. F., Folstein, S. E., & McHugh, P. R. (1975). 'Mini-mental state'. Journal of Psychiatric Research, 12(3), 189–198. (Licensing may apply.)" },
      { citation: "Tariq, S. H., Tumosa, N., Chibnall, J. T., Perry, M. H., & Morley, J. E. (2006). The SLUMS exam. American Journal of Geriatric Psychiatry, 14(11), 900–910." }
    ]
  },


  {
    id: "capacity-mca-appelbaum",
    title: "Decision-Making Capacity — MCA Two-Stage + Appelbaum 4-Abilities",
    clinical_summary: [
      "Decision-specific and time-specific. **MCA Two-Stage**: (1) Is there an impairment/disturbance of the mind or brain? (2) Does it mean the person cannot make the specific decision when needed?",
      "Appelbaum 4 abilities: **Understand** relevant information; **Appreciate** situation/consequences; **Reason**/use & weigh; **Express a choice** consistently.",
      "Optimize capacity: treat reversible factors (delirium, pain), provide supports (interpreters, visual aids), and re-attempt when optimal.",
      "Document risk–benefit of decision, least restrictive alternatives, and involvement of surrogate/advocates when lacking capacity.",
    ],
    indications: [ "Consent for treatment/medication, discharge planning, refusal of essential care, research consent." ],
    contraindications: [ "Do not conflate disagreement with incapacity; avoid undue influence." ],
    outcome_measures: [ "Structured notes showing two-stage test and 4-abilities with examples; decision outcome; review date." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Decision-Making Capacity — MCA + Appelbaum</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Decision-Making Capacity Assessment</h1></header>
<main>
<section>
  <h2>MCA Two-Stage Test</h2>
  <table><thead><tr><th>Stage</th><th>Finding</th><th>Evidence</th></tr></thead>
    <tbody><tr><td>1) Impairment of mind/brain?</td><td><input></td><td><input></td></tr>
           <tr><td>2) Unable for this decision?</td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Appelbaum 4 Abilities (examples required)</h2>
  <table><thead><tr><th>Ability</th><th>Assessment prompt</th><th>Observed response</th></tr></thead>
    <tbody>
      <tr><td>Understand</td><td>“Tell me in your own words what the treatment is for.”</td><td><textarea></textarea></td></tr>
      <tr><td>Appreciate</td><td>“How does this apply to you?”</td><td><textarea></textarea></td></tr>
      <tr><td>Reason</td><td>“What are the pros and cons you’re considering?”</td><td><textarea></textarea></td></tr>
      <tr><td>Express a choice</td><td>“What is your decision?” (consistency)</td><td><textarea></textarea></td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Conclusion & Plan</h2>
  <textarea style="width:100%;height:100px" placeholder="Decision capacity present/absent; best interests/surrogate if absent; review date"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a capacity assessment form combining the MCA two-stage test and Appelbaum 4-abilities with example-based text boxes and a final decision/plan section. Include print CSS.",
      "Create a code in HTML for a best-interests decision record with options considered, risks/benefits, least-restrictive alternative, and participants.",
      "Create a code in HTML for a capacity optimization checklist (communication aids, timing, reversible factors)."
    ],
    references: [
      { citation: "Appelbaum, P. S. (2007). Assessment of patients’ competence to consent to treatment. New England Journal of Medicine, 357(18), 1834–1840." },
      { citation: "UK Department for Constitutional Affairs. (2007). Mental Capacity Act Code of Practice (and updates)." },
      { citation: "Grisso, T., & Appelbaum, P. S. (1998). Assessing Competence to Consent to Treatment. Oxford University Press." }
    ]
  },


  {
    id: "eeg-mri-referral",
    title: "EEG / MRI Referral Templates (First Seizure; Red Flags) — RISK",
    clinical_summary: [
      "First unprovoked seizure: order EEG as soon as feasible (within 24–48 h if possible) and brain MRI with epilepsy protocol; CT head in ED if acute bleed/trauma suspected.",
      "Red flags supporting urgent imaging/neurology: focal onset or persistent deficit, new severe headache, immunosuppression, cancer, pregnancy, fever with meningismus, age >60 with first seizure, anticoagulation/trauma.",
      "EEG details: routine vs sleep-deprived, photic/hyperventilation as tolerated; capture description of event, triggers, and recovery.",
      "Coordinate driving/safety restrictions per jurisdiction; provide written rescue/emergency instructions.",
    ],
    indications: [ "First seizure, change in seizure pattern, or concerning spells with neurological signs." ],
    contraindications: [ "MRI contraindications (implants/metal) and contrast allergies—screen appropriately." ],
    outcome_measures: [ "Referral completeness, time to EEG/MRI, diagnostic yield, treatment initiation when indicated." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>EEG / MRI Referral — First Seizure / Red Flags</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd} body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)} main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>EEG / MRI Referral — First Seizure / Red Flags</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Patient & Event</h2>
    <table><thead><tr><th>Date/Time</th><th>Semilogy</th><th>Post-ictal</th></tr></thead>
      <tbody><tr><td><input type="datetime-local"></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
  <div>
    <h2>Risk Factors / Red Flags</h2>
    <ul><li><input placeholder="focal deficit, cancer, immunosuppression, head trauma, anticoagulation"></li></ul>
  </div>
</section>
<section>
  <h2>EEG Request</h2>
  <table><thead><tr><th>Type</th><th>Reason</th><th>Notes</th></tr></thead>
    <tbody><tr><td><input placeholder="routine / sleep-deprived"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>MRI (Epilepsy Protocol) Request</h2>
  <table><thead><tr><th>Urgency</th><th>Contraindications Screened</th><th>Clinical Question</th></tr></thead>
    <tbody><tr><td><input placeholder="urgent / routine"></td><td><input placeholder="implants/metal checked"></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Safety & Advice</h2>
  <ul><li>No driving/operating machinery until cleared per law</li><li>Rescue plan provided</li></ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as an EEG/MRI referral template for first seizure including event summary, red flags, EEG type/notes, MRI epilepsy-protocol fields with contraindications, and safety counsel. Print CSS required.",
      "Create a code in HTML for an ED first-seizure checklist (labs, pregnancy test, toxicology, CT indications, discharge safety advice).",
      "Create a code in HTML for a seizure witness statement form capturing key semiology and timing for diagnostic yield."
    ],
    references: [
      { citation: "Krumholz, A., et al. (2015). Management of an unprovoked first seizure in adults. Neurology, 84(16), 1705–1713 (AAN/AES guideline)." },
      { citation: "Fisher, R. S., et al. (2014). ILAE official report: A practical clinical definition of epilepsy. Epilepsia, 55(4), 475–482." },
      { citation: "American College of Emergency Physicians. (2014/2017). Clinical policy: Adult patients presenting to the ED with seizures." }
    ]
  }
];
