

export type Reference = { citation: string };

export type MedOrderItem = {
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

export const MEDICATION_ORDERS_MONITORING: MedOrderItem[] = [

  {
    id: "ap-metabolic-schedule",
    title: "Antipsychotic Metabolic Monitoring — Schedule",
    clinical_summary: [
      "Second-generation antipsychotics increase risk of weight gain, dyslipidemia, and dysglycemia; establish baseline and scheduled surveillance.",
      "Baseline: personal/family metabolic risk, weight/BMI, waist circumference, BP, fasting plasma glucose (or HbA1c), fasting lipids; consider prolactin if symptomatic agents.",
      "Schedule: 4–12 weeks after start/change → weight/BMI, BP, glucose, lipids; then 3–6 months, and annually (or per local policy) thereafter.",
      "Higher-risk agents for weight/metabolic effects (class trend, individual variability): clozapine, olanzapine; moderate: quetiapine, risperidone/paliperidone; lower: ziprasidone, aripiprazole, lurasidone, cariprazine.",
      "Intervene early: lifestyle, switch to lower-risk agent when appropriate, add-on metformin per guidelines and shared decision making."
    ],
    indications: [
      "Any patient initiating or receiving antipsychotics (first- or second-generation), especially SGAs."
    ],
    contraindications: [
      "None to monitoring; ensure culturally sensitive measuring and informed consent for blood tests."
    ],
    outcome_measures: [
      "Weight/BMI trajectory, waist circumference, BP, fasting glucose/HbA1c, fasting lipids; documentation of cardiometabolic counseling."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Antipsychotic Metabolic Monitoring — Schedule</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Antipsychotic Metabolic Monitoring — Schedule</h1>
  <div class="muted">Baseline • 4–12w • 3–6m • annually — follow local policy</div>
</header>
<main>
  <section class="grid">
    <div>
      <h2>Identifiers</h2>
      <label>Patient</label><br><input style="width:100%">
      <label>DOB / MRN</label><br><input style="width:100%">
    </div>
    <div>
      <h2>Current Antipsychotic</h2>
      <label>Agent & dose</label><br><input style="width:100%">
      <label>Start/change date</label><br><input type="date" style="width:100%">
    </div>
  </section>
  <section>
    <h2>Baseline & Follow-up Table</h2>
    <table>
      <thead><tr><th>Timepoint</th><th>Weight/BMI</th><th>Waist</th><th>BP</th><th>Glucose/HbA1c</th><th>Lipids</th><th>Action/Notes</th></tr></thead>
      <tbody>
        <tr><td>Baseline</td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
        <tr><td>4–12 weeks</td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
        <tr><td>3–6 months</td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
        <tr><td>Annually</td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
      </tbody>
    </table>
  </section>
  <section>
    <h2>Counseling & Interventions</h2>
    <textarea style="width:100%;height:100px" placeholder="Lifestyle, metformin, switch strategy, referrals"></textarea>
  </section>
</main>
</body></html>`,
    prompts: [
      "Create a code in HTML as a printable page for antipsychotic metabolic monitoring with a baseline/4–12w/3–6m/annual table (weight/BMI, waist, BP, glucose/HbA1c, lipids) and a counseling notes section.",
      "Create a code in HTML for a cardiometabolic risk counseling handout summarizing weight, diet, activity, smoking, and metformin considerations with signature/date fields."
    ],
    references: [
      { citation: "American Diabetes Association, American Psychiatric Association, American Association of Clinical Endocrinologists, & North American Association for the Study of Obesity. (2004). Consensus development conference on antipsychotic drugs and obesity/diabetes. Diabetes Care, 27(2), 596–601." },
      { citation: "National Institute for Health and Care Excellence. (2014, updated). Psychosis and schizophrenia in adults: prevention and management (CG178)." },
      { citation: "American Psychiatric Association. (2020). The APA practice guideline for the treatment of patients with schizophrenia." }
    ]
  },


  {
    id: "li-vpa-condensed-monitoring",
    title: "Lithium & Valproate — Condensed Monitoring Table",
    clinical_summary: [
      "Lithium: 12-hour trough levels after steady state (5–7 days); target typically 0.6–1.0 mEq/L (maintenance lower, acute higher per clinical context).",
      "Baseline for lithium: BMP/eGFR, TSH (±T4), weight/BMI, pregnancy test when relevant, ECG if cardiac risk; ongoing: level, Cr/eGFR, TSH, electrolytes.",
      "Valproate: baseline LFTs, CBC with platelets, weight/BMI, pregnancy test (teratogenic; avoid in pregnancy when alternatives exist); monitor VPA level, LFT/CBC, pancreatitis/hepatotoxicity signs.",
      "DDI awareness: NSAIDs, ACEI/ARBs, thiazides raise lithium; enzyme inducers affect VPA; aspirin may alter VPA protein binding.",
      "Patient education: hydration, salt stability (lithium), contraception counseling (valproate), toxicity symptoms."
    ],
    indications: [
      "Bipolar I/II disorder maintenance/acute phases; augmentation in depression (lithium) as indicated."
    ],
    contraindications: [
      "Lithium: significant renal impairment, sodium depletion, pregnancy (risk) unless specialist plan. Valproate: pregnancy (contraindicated for many indications), active liver disease, urea cycle disorders."
    ],
    outcome_measures: [
      "Lithium level (12-h trough), VPA total level, side-effect burden, renal/thyroid/hepatic function, weight/metabolic indices."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Lithium & Valproate — Condensed Monitoring Table</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Lithium & Valproate — Condensed Monitoring Table</h1><div class="muted">Use 12-hour trough for lithium; follow local lab ranges</div></header>
<main>
  <table>
    <thead><tr><th>Drug</th><th>Baseline</th><th>Early (1–2 wks)</th><th>Stabilization (q1–3 m)</th><th>Maintenance (q3–6 m)</th><th>Notes</th></tr></thead>
    <tbody>
      <tr>
        <td>Lithium</td>
        <td>BMP/eGFR, TSH(±T4), weight/BMI, pregnancy test, ECG if risk</td>
        <td>Level (5–7 d after dose change), BMP/electrolytes</td>
        <td>Level; Cr/eGFR; TSH; electrolytes</td>
        <td>Level; Cr/eGFR; TSH; weight</td>
        <td>Hydration, salt stability; toxicity education</td>
      </tr>
      <tr>
        <td>Valproate</td>
        <td>LFTs, CBC/platelets, weight/BMI, pregnancy test</td>
        <td>Level after 3–5 d; LFT/CBC if symptomatic</td>
        <td>Level; LFT/CBC</td>
        <td>Level; LFT/CBC; weight</td>
        <td>Teratogenic; pancreatitis/hepatotoxicity warning</td>
      </tr>
    </tbody>
  </table>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a condensed monitoring table comparing lithium and valproate across baseline, early, stabilization, and maintenance phases, including space for levels and notes.",
      "Create a code in HTML for a drug–interaction checklist focused on lithium (NSAIDs, ACEI/ARB, thiazides) and valproate (enzyme inducers, aspirin) with mitigation actions."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2020, updates). Bipolar disorder: assessment and management (CG185/NG)." },
      { citation: "Yatham, L. N., et al. (2018/updates). Canadian Network for Mood and Anxiety Treatments (CANMAT) guidelines for bipolar disorder." },
      { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with bipolar disorder (updates/companion resources)." }
    ]
  },


  {
    id: "qt-risk-ecg-plan",
    title: "QT Risk CheckList & ECG Plan",
    clinical_summary: [
      "Identify congenital/acquired long QT risk, concomitant QT-prolonging drugs (antipsychotics, macrolides, fluoroquinolones, methadone), and electrolyte abnormalities.",
      "Baseline ECG when risk factors present; correct K+/Mg2+; avoid dual QT-prolongers if possible; document dose limits and follow-up ECG schedule.",
      "Use CredibleMeds® categories for risk awareness; consider cardiology input for QTc ≥500 ms or ΔQTc ≥60 ms from baseline."
    ],
    indications: [ "Initiation or dose increase of QT-prolonging psychotropics or combinations with other QT-prolongers." ],
    contraindications: [ "Persistent QTc ≥500 ms, significant bradyarrhythmia, untreated electrolyte disturbances — defer until mitigated." ],
    outcome_measures: [ "Baseline and follow-up QTc values, electrolyte normalization, adverse event avoidance." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>QT Risk CheckList & ECG Plan</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>QT Risk CheckList & ECG Plan</h1><div>Use with CredibleMeds® and local ECG policy</div></header>
<main>
  <section>
    <h2>Risk Checklist</h2>
    <table>
      <thead><tr><th>Risk Factor</th><th>Present?</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>Congenital LQTS / family history</td><td><input type="checkbox"></td><td>Cardiology consult</td></tr>
        <tr><td>QT-prolonging drugs combination</td><td><input type="checkbox"></td><td>Choose alternatives / dose limits</td></tr>
        <tr><td>Electrolyte abnormalities (K+, Mg2+)</td><td><input type="checkbox"></td><td>Correct prior to start</td></tr>
        <tr><td>Cardiac disease, bradycardia</td><td><input type="checkbox"></td><td>Baseline ECG & monitoring</td></tr>
      </tbody>
    </table>
  </section>
  <section>
    <h2>ECG Plan</h2>
    <table>
      <thead><tr><th>When</th><th>QTc</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>Baseline</td><td><input></td><td><input></td></tr>
        <tr><td>After dose change</td><td><input></td><td><input></td></tr>
        <tr><td>Follow-up</td><td><input></td><td><input></td></tr>
      </tbody>
    </table>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a QT risk checklist with risk factors, present checkboxes, and mitigation actions, plus an ECG schedule table (baseline, post-titration, follow-up). Include print CSS.",
      "Create a code in HTML for a QT monitoring note that records QTc trends and decisions (continue, reduce dose, switch, cardiology consult)."
    ],
    references: [
      { citation: "CredibleMeds®. (current). QTdrugs lists and risk categories." },
      { citation: "FDA/EMA product labels for QT-prolonging psychotropics (e.g., citalopram/escitalopram, haloperidol)." },
      { citation: "American Heart Association. (2010/updates). Recommendations for ECG interpretation and QT interval monitoring." }
    ]
  },


  {
    id: "lithium-order-monitoring",
    title: "Lithium — Order & Monitoring Sheet",
    clinical_summary: [
      "Target serum trough commonly 0.6–0.8 mEq/L for maintenance; higher for acute mania per clinical judgment; collect 12-hour post-dose levels.",
      "Monitoring: levels after dose changes or illness/dehydration; periodic BMP/eGFR, TSH; consider calcium/parathyroid if hypercalcemia signs.",
      "Toxicity red flags: GI upset, tremor progressing to ataxia/confusion; stop and obtain urgent level; manage fluid/electrolytes; review interacting meds.",
      "Pre-treatment bipolar education, contraception when relevant, and sick-day rules (hold during febrile dehydration)."
    ],
    indications: [
      "Bipolar maintenance/mania; augmentation for treatment-resistant depression; suicide risk reduction evidence."
    ],
    contraindications: [
      "Significant renal impairment, sodium depletion/dehydration, concomitant MAOIs not an absolute but caution; pregnancy considerations; breastfeeding typically avoided."
    ],
    outcome_measures: [
      "Lithium trough, symptom scales, relapse/ER visits, renal/thyroid function, side-effect burden."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Lithium — Order & Monitoring Sheet</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Lithium — Order & Monitoring Sheet</h1><div>12-hour trough; renal/thyroid surveillance</div></header>
<main>
  <section class="grid">
    <div>
      <h2>Order</h2>
      <label>Formulation & dose</label><br><input style="width:100%">
      <label>Target range</label><br><input placeholder="e.g., 0.6–0.8 mEq/L maintenance" style="width:100%">
      <label>Level timing</label><br><input placeholder="12 h post-dose; after 5–7 days of steady dosing" style="width:100%">
    </div>
    <div>
      <h2>Baseline Labs</h2>
      <textarea style="width:100%;height:120px" placeholder="BMP/eGFR, TSH(±T4), pregnancy test, ECG if cardiac risk"></textarea>
    </div>
  </section>
  <section>
    <h2>Monitoring Log</h2>
    <table>
      <thead><tr><th>Date</th><th>Lithium Level</th><th>Creat/eGFR</th><th>TSH</th><th>Notes/Adjustments</th></tr></thead>
      <tbody><tr><td><input type="date"></td><td><input></td><td><input></td><td><input></td><td><input style="width:100%"></td></tr></tbody>
    </table>
  </section>
  <section>
    <h2>Toxicity & Sick-day Rules</h2>
    <textarea style="width:100%;height:100px" placeholder="Hold during dehydration, febrile illness; avoid NSAIDs unless coordinated; seek urgent care for confusion/ataxia"></textarea>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a lithium order sheet capturing formulation/dose, target serum range, 12-hour trough timing, baseline labs, and a monitoring log (date, level, creat/eGFR, TSH, notes). Include print CSS.",
      "Create a code in HTML for a lithium patient education page summarizing hydration, salt stability, drug interactions (NSAIDs, ACEI/ARB, thiazides), and toxicity warning signs."
    ],
    references: [
      { citation: "NICE. (2020). Bipolar disorder guideline (monitoring lithium)." },
      { citation: "Yatham, L. N., et al. (2018/updates). CANMAT bipolar disorder guidelines." },
      { citation: "Bauer, M., et al. (2010/updates). World Federation of Societies of Biological Psychiatry (WFSBP) guidelines for bipolar disorder." }
    ]
  },


  {
    id: "valproate-order-monitoring-ppp",
    title: "Valproate — Order, Monitoring & PPP Compliance",
    clinical_summary: [
      "Valproate is teratogenic (neural tube defects, neurodevelopmental risks); many regions require Pregnancy Prevention Programs (PPP) with documented contraception counseling and risk acknowledgment.",
      "Baseline: LFTs, CBC with platelets, weight/BMI, pregnancy test (when relevant). Ongoing: VPA level, LFT/CBC, weight; monitor for pancreatitis, hepatotoxicity, thrombocytopenia.",
      "Drug interactions: enzyme inducers (↓VPA), inhibitors (↑levels); caution with lamotrigine (skin rash risk when combined).",
      "Patient education: contraception, warning signs (abdominal pain, jaundice, easy bruising), and adherence to PPP documentation."
    ],
    indications: [
      "Bipolar mania/mixed states, maintenance in selected cases; (outside psychiatry: seizures, migraine)."
    ],
    contraindications: [
      "Pregnancy (contraindicated for many psychiatric indications), active liver disease, mitochondrial disorders (e.g., POLG)."
    ],
    outcome_measures: [
      "VPA level, symptom control, LFT/CBC trends, weight/metabolic indices, PPP forms completion."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Valproate — Order, Monitoring & PPP Compliance</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Valproate — Order, Monitoring & PPP Compliance</h1><div>Teratogenic — ensure PPP documentation and contraception counseling</div></header>
<main>
  <section class="grid">
    <div>
      <h2>Order</h2>
      <label>Formulation & dose</label><br><input style="width:100%">
      <label>Target VPA level</label><br><input placeholder="per local lab range" style="width:100%">
    </div>
    <div>
      <h2>Baseline</h2>
      <textarea style="width:100%;height:120px" placeholder="LFTs, CBC/platelets, weight/BMI, pregnancy test"></textarea>
    </div>
  </section>
  <section>
    <h2>Monitoring Log</h2>
    <table>
      <thead><tr><th>Date</th><th>VPA Level</th><th>LFT</th><th>CBC/Plt</th><th>Notes</th></tr></thead>
      <tbody><tr><td><input type="date"></td><td><input></td><td><input></td><td><input></td><td><input style="width:100%"></td></tr></tbody>
    </table>
  </section>
  <section>
    <h2>PPP Checklist</h2>
    <table>
      <thead><tr><th>Item</th><th>Completed</th><th>Date</th><th>Comments</th></tr></thead>
      <tbody>
        <tr><td>Risk discussion & written acknowledgement</td><td><input type="checkbox"></td><td><input type="date"></td><td><input></td></tr>
        <tr><td>Contraception plan documented</td><td><input type="checkbox"></td><td><input type="date"></td><td><input></td></tr>
        <tr><td>Pregnancy test (baseline/periodic per policy)</td><td><input type="checkbox"></td><td><input type="date"></td><td><input></td></tr>
      </tbody>
    </table>
  </section>
  <section>
    <h2>Notes</h2>
    <p style="font-size:12px;color:#666">This educational aid does not replace clinical judgment. Follow local policies and PPP requirements.</p>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a valproate order & monitoring page with sections for order details, baseline labs, a monitoring log (VPA level, LFT, CBC/Plt), and a PPP checklist table. Include print CSS.",
      "Create a code in HTML for a PPP consent/acknowledgement form for valproate that includes risk statements, contraception plan, and signatures."
    ],
    references: [
      { citation: "European Medicines Agency. (2018/updates). Valproate and related substances: measures to avoid exposure in pregnancy (PPP)." },
      { citation: "NICE. (2020). Bipolar disorder guidance (valproate in women of childbearing potential)." },
      { citation: "FDA product label for valproate (current) — boxed warning on pregnancy, hepatotoxicity, pancreatitis." }
    ]
  },


  {
    id: "clozapine-anc-safety",
    title: "Clozapine — Initiation, ANC & Safety Tracker",
    clinical_summary: [
      "Indicated for treatment-resistant schizophrenia or intolerable EPS with other agents; requires ANC monitoring via national REMS/CPMS systems.",
      "ANC thresholds (typical): start if ANC ≥1500/μL (≥1000/μL for BEN); monitoring weekly for 6 months, every 2 weeks for next 6 months, then monthly if eligible; follow local program rules.",
      "Early myocarditis risk: monitor symptoms; many protocols obtain weekly CRP/troponin during first 4 weeks; manage tachycardia/fever promptly.",
      "Dose titration slow to reduce orthostasis/sedation/seizures; avoid strong CYP1A2 inhibitors/inducers; adjust with smoking changes (1A2 induction).",
      "Seizure risk increases with dose >600 mg/d; consider prophylaxis in high risk; monitor constipation/ileus (serious)."
    ],
    indications: [
      "Treatment-resistant schizophrenia; suicidal behavior in schizophrenia/schizoaffective disorder (label-dependent)."
    ],
    contraindications: [
      "History of clozapine-induced agranulocytosis/myocarditis, uncontrolled epilepsy, severe cardiac disease; inability to comply with ANC monitoring."
    ],
    outcome_measures: [
      "ANC trajectory per schedule, symptom response, side-effect burden (constipation scale), myocarditis screen (CRP/troponin per protocol)."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Clozapine — Initiation, ANC & Safety Tracker</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Clozapine — Initiation, ANC & Safety Tracker</h1><div>Follow national REMS/CPMS rules; weekly → q2w → q4w ANC schedule</div></header>
<main>
  <section class="grid">
    <div>
      <h2>Initiation Plan</h2>
      <label>Start dose & titration</label><br><input style="width:100%" placeholder="e.g., 12.5 mg once/twice day 1; slow titration">
      <label>Co-medications</label><br><input style="width:100%">
    </div>
    <div>
      <h2>Baseline Safety</h2>
      <textarea style="width:100%;height:120px" placeholder="ECG, CRP/troponin, vitals, constipation risk, seizure history"></textarea>
    </div>
  </section>
  <section>
    <h2>ANC Monitoring</h2>
    <table>
      <thead><tr><th>Date</th><th>ANC (/μL)</th><th>Schedule (wk/q2w/q4w)</th><th>Action</th></tr></thead>
      <tbody><tr><td><input type="date"></td><td><input></td><td><input></td><td><input></td></tr></tbody>
    </table>
  </section>
  <section>
    <h2>Myocarditis Screen (first 4 weeks)</h2>
    <table>
      <thead><tr><th>Date</th><th>CRP</th><th>Troponin</th><th>Symptoms/Notes</th></tr></thead>
      <tbody><tr><td><input type="date"></td><td><input></td><td><input></td><td><input style="width:100%"></td></tr></tbody>
    </table>
  </section>
  <section>
    <h2>Constipation & Seizure Safety</h2>
    <textarea style="width:100%;height:100px" placeholder="Bowel regimen, red-flag symptoms; seizure prophylaxis if indicated"></textarea>
  </section>
  <section>
    <h2>Notes</h2>
    <p style="font-size:12px;color:#666">Educational aid; follow national program rules and local policies.</p>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a clozapine initiation and ANC tracker with tables for ANC schedule (weekly→q2w→q4w), myocarditis screen (weekly CRP/troponin in first month), and safety notes (constipation, seizure risk). Include print CSS.",
      "Create a code in HTML for a clozapine titration schedule that prints cleanly and captures orthostasis/sedation notes and missed-dose rules."
    ],
    references: [
      { citation: "U.S. Clozapine REMS Program / UK CPMS (current). Mandatory ANC monitoring requirements." },
      { citation: "Ronaldson, K. J., et al. (2011). Clozapine-induced myocarditis: time course, diagnosis, and management. CNS Drugs, 25(6), 517–526." },
      { citation: "APA. (2020). Schizophrenia practice guideline (clozapine sections)." }
    ]
  }
];
