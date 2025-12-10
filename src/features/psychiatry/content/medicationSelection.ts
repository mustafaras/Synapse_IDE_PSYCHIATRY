

export type Reference = { citation: string };

export type MedItem = {
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

export const MEDICATION_SELECTION: MedItem[] = [
  {
    id: "ssri-snri-navigator",
    title: "Antidepressant Selection Navigator (SSRI/SNRI)",
    clinical_summary: [
      "First-line agents for major depressive and many anxiety disorders; match drug to targets (sadness/anhedonia, anxiety, pain) and patient priorities (e.g., weight, sexual effects, sedation).",
      "SSRIs: sertraline, escitalopram, fluoxetine, paroxetine, citalopram; SNRIs: venlafaxine XR, desvenlafaxine, duloxetine.",
      "Past response (self/family), comorbidities (OCD, panic, neuropathic pain, hepatic/renal disease), drug–drug interactions (CYP 2D6/2C19/1A2), QT risk (notably citalopram/escitalopram).",
      "Screen bipolar disorder & mania risk before initiation; monitor suicidality especially <25 yrs.",
      "Start low → titrate to minimum effective dose; allow 2–4 wks for early response, 6–8 wks for full trial; optimize adherence and psychotherapy integration.",
      "Common AEs: GI upset, activation/insomnia or somnolence, sexual dysfunction, hyponatremia (SIADH risk ↑ in older adults), bleeding risk with NSAIDs/anticoagulants."
    ],
    indications: [
      "Major depressive disorder; generalized anxiety, panic disorder, social anxiety; OCD (often higher doses; fluvoxamine/fluoxetine/sertraline); PTSD; PMDD."
    ],
    contraindications: [
      "Concomitant or recent MAOI use (washout: typically 14 days; longer for fluoxetine); hypersensitivity; uncontrolled mania.",
      "Caution: hepatic/renal impairment (dose adjust), pregnancy/lactation specifics, QT prolongation risk, bleeding risk, hyponatremia history."
    ],
    outcome_measures: [
      "PHQ-9 or QIDS-SR16 (baseline → q2–4 wks); GAD-7 if comorbid anxiety; FIBSER for side effects; adherence checks; ECG/electrolytes when QT risk present."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>SSRI/SNRI Selection Navigator</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      .pill{border:1px solid #bbb;border-radius:999px;padding:2px 8px;font-size:12px;display:inline-block}
      @media print{header{border:0}}
    </style></head><body>
    <header>
      <h1>SSRI/SNRI Selection Navigator</h1>
      <div class="pill">baseline labs/ECG per local policy • bipolar screen • suicidality each visit</div>
    </header>
    <main>
      <section class="grid">
        <div>
          <h2>Targets & Priorities</h2>
          <label>Primary targets</label><br><input placeholder="depressed mood, anhedonia, anxiety, pain" style="width:100%">
          <label>Side-effect priorities (avoid)</label><br><input placeholder="weight gain, sexual dysfunction, sedation" style="width:100%">
          <label>Past response (patient/family)</label><br><input style="width:100%">
        </div>
        <div>
          <h2>Comorbidity & Risks</h2>
          <label>Medical/psychiatric</label><br><input placeholder="cardiac/QT, hepatic, renal, seizure, pregnancy" style="width:100%">
          <label>Concomitant meds</label><br><input placeholder="anticoagulant, NSAID, linezolid, triptan, antipsychotic..." style="width:100%">
        </div>
      </section>
      <section>
        <h2>Agent Considerations</h2>
        <table><thead><tr><th>Agent</th><th>Pros</th><th>Cautions</th><th>Notes</th></tr></thead><tbody>
          <tr><td>Sertraline</td><td>anxiety/PTSD data; flexible dosing</td><td>GI upset early</td><td>often first-line</td></tr>
          <tr><td>Escitalopram</td><td>well tolerated</td><td>QT risk dose-related</td><td>ECG if risk factors</td></tr>
          <tr><td>Fluoxetine</td><td>activating, long t½ (missed doses forgiving)</td><td>CYP2D6 inhibitor; insomnia</td><td>watch interactions</td></tr>
          <tr><td>Duloxetine</td><td>pain syndromes, neuropathy</td><td>hepatotoxicity risk, nausea</td><td>avoid severe hepatic disease</td></tr>
          <tr><td>Venlafaxine XR</td><td>anxiety spectrum; potent at higher doses</td><td>BP ↑ dose-related, discontinuation syndrome</td><td>taper carefully</td></tr>
        </tbody></table>
      </section>
      <section class="grid">
        <div>
          <h2>Initial Dosing Plan</h2>
          <label>Chosen agent</label><br><input style="width:100%">
          <label>Start dose</label><br><input style="width:100%">
          <label>Titration schedule</label><br><textarea style="width:100%;height:80px"></textarea>
        </div>
        <div>
          <h2>Monitoring</h2>
          <label>Measures</label><br><input placeholder="PHQ-9, GAD-7, FIBSER" style="width:100%">
          <label>Safety</label><br><input placeholder="ECG, Na+, bleeding risk, mania screen" style="width:100%">
        </div>
      </section>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable page for an SSRI/SNRI selection navigator including sections for targets/priorities, comorbidities/risks, agent comparison table, initial dosing plan, and monitoring (PHQ-9/GAD-7/FIBSER). Use semantic HTML and simple print CSS.",
      "Create a code in HTML for an antidepressant comparison table with columns for pros, cautions, and notes covering sertraline, escitalopram, fluoxetine, duloxetine, and venlafaxine XR.",
      "Create a code in HTML for a baseline safety checklist (bipolar screen, suicidality, ECG/QT risk, bleeding risk, hyponatremia) with checkboxes and sign-off block."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2022). Depression in adults: Treatment and management (NG222)." },
      { citation: "Cipriani, A., et al. (2018). Comparative efficacy and acceptability of 21 antidepressant drugs for the acute treatment of adults with major depressive disorder: A network meta-analysis. The Lancet, 391(10128), 1357–1366." },
      { citation: "American Psychiatric Association. (2010/updated guidance). Practice guideline for the treatment of patients with major depressive disorder." },
      { citation: "Stahl, S. M. (2021). Stahl’s essential psychopharmacology (4th ed.) and Prescriber’s Guide." }
    ]
  },

  {
    id: "augmentation-switch-map",
    title: "Augmentation & Switch Map (Depression/Anxiety)",
    clinical_summary: [
      "After adequate trial (6–8 weeks at therapeutic dose) and partial response: consider augmentation; no response/intolerable AEs: consider switch.",
      "Common augmentation: aripiprazole, brexpiprazole, quetiapine XR (MDD adjunct); bupropion or mirtazapine add-on; lithium; liothyronine (T3); buspirone for anxiety.",
      "Switch strategies: within-class (SSRI→SSRI) or across-class (SSRI↔SNRI, NDRI, NaSSA). Use cross-taper when safe; observe washouts for MAOIs.",
      "Risk management: metabolic monitoring for atypicals; lithium levels/renal/thyroid; serotonin syndrome awareness when combining serotonergic agents; mania risk.",
      "Integrate psychotherapy (CBT/BA) and adherence supports; reassess diagnosis and comorbidities."
    ],
    indications: [
      "MDD or anxiety disorders with partial/non-response, intolerance, or patient-priority misfit after an adequate trial."
    ],
    contraindications: [
      "Uncontrolled mania, unstable medical disease, pregnancy-specific restrictions (e.g., valproate contraindicated in pregnancy), QT or metabolic red flags without monitoring."
    ],
    outcome_measures: [
      "ΔPHQ-9 ≥5 points, response/remission thresholds; side-effect burden (FIBSER), metabolic panel for atypicals, lithium level (12 h trough), TSH/Cr."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Augmentation & Switch Map</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
      @media print{header{border:0}}
    </style></head><body>
    <header><h1>Augmentation & Switch Map</h1><div>Use after adequate trial; monitor safety per agent</div></header>
    <main>
      <section class="grid">
        <div>
          <h2>Current Regimen</h2>
          <input placeholder="agent • dose • weeks at dose" style="width:100%">
          <label>Response</label><br><input placeholder="none / partial / full" style="width:100%">
          <label>Adverse effects</label><br><input style="width:100%">
        </div>
        <div>
          <h2>Decision Path</h2>
          <label>Choose</label><br>
          <select style="width:100%"><option>Augment</option><option>Switch</option></select>
          <label>Rationale</label><br><textarea style="width:100%;height:90px"></textarea>
        </div>
      </section>
      <section>
        <h2>Augmentation Options</h2>
        <table><thead><tr><th>Agent</th><th>Dose (typical)</th><th>Key Monitoring</th><th>Notes</th></tr></thead><tbody>
          <tr><td>Aripiprazole</td><td>2–15 mg/d</td><td>weight, lipids, glucose, EPS/akathisia</td><td>MDD adjunct</td></tr>
          <tr><td>Quetiapine XR</td><td>150–300 mg hs</td><td>metabolic, sedation, QT</td><td>MDD adjunct</td></tr>
          <tr><td>Lithium</td><td>target 0.6–0.8 mEq/L</td><td>levels, Cr/eGFR, TSH, Na+, drug interactions</td><td>anti-suicidal data</td></tr>
          <tr><td>Liothyronine (T3)</td><td>25–50 mcg/d</td><td>TSH/T4, HR/BP</td><td>augment for residual symptoms</td></tr>
          <tr><td>Bupropion</td><td>150–300 mg/d</td><td>BP, insomnia, seizure threshold</td><td>sexual AEs offset</td></tr>
          <tr><td>Mirtazapine</td><td>15–45 mg hs</td><td>weight, lipids</td><td>sleep/appetite aid</td></tr>
        </tbody></table>
      </section>
      <section>
        <h2>Switch Plan</h2>
        <table><thead><tr><th>From</th><th>To</th><th>Method</th><th>Notes</th></tr></thead><tbody>
          <tr><td>SSRI</td><td>SNRI</td><td>cross-taper</td><td>watch for serotonin syndrome</td></tr>
          <tr><td>Fluoxetine</td><td>any</td><td>washout/slow cross-taper</td><td>long half-life</td></tr>
          <tr><td>Any</td><td>MAOI</td><td>full washout per label</td><td>strict dietary/interaction rules</td></tr>
        </tbody></table>
      </section>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML for an augmentation & switch planner including current regimen, decision path (augment vs switch), augmentation options table with monitoring, and a switch plan grid. Include print CSS.",
      "Create a code in HTML for a lithium augmentation checklist (baseline labs, trough timing, drug interactions) with signature/date fields.",
      "Create a code in HTML for a cross-taper schedule table that prints cleanly and allows weekly dose entries."
    ],
    references: [
      { citation: "CANMAT. (2016/updates). Clinical guidelines for the management of adults with major depressive disorder." },
      { citation: "American Psychiatric Association. Practice guideline for the treatment of patients with major depressive disorder." },
      { citation: "Thase, M. E., et al. (2007–2015). Atypical antipsychotic augmentation in MDD: evidence reviews." }
    ]
  },

  {
    id: "side-effect-tradeoff-matrix",
    title: "Side-Effect Trade-off Matrix (Sedation/Weight/Sexual/QT/GI)",
    clinical_summary: [
      "Use a neutral matrix to match patient priorities with pharmacologic profiles; document shared decision making.",
      "Lower sexual dysfunction risk: bupropion, mirtazapine; likely higher: paroxetine, sertraline; variable across individuals.",
      "Weight gain/sedation: mirtazapine > paroxetine > others (class trends; individual variation).",
      "QT: citalopram/escitalopram dose-related; additive with other QT-prolonging agents/electrolyte abnormalities.",
      "GI upset early is class-common; venlafaxine may elevate BP at higher doses."
    ],
    indications: [ "Choice clarification when side-effect concerns drive adherence and satisfaction." ],
    contraindications: [ "None specific; avoid simplistic rules—use individualized risk assessment." ],
    outcome_measures: [ "FIBSER, adherence, weight/BMI, BP, ECG when indicated." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Side-Effect Trade-off Matrix</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      @media print{header{border:0}}
    </style></head><body>
    <header><h1>Side-Effect Trade-off Matrix</h1><div>Shared decision-making aid</div></header>
    <main>
      <table><thead><tr><th>Effect</th><th>Prefer</th><th>Avoid/Caution</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Sexual dysfunction</td><td>Bupropion, Mirtazapine</td><td>Paroxetine, Sertraline</td><td>Consider adjunct bupropion</td></tr>
        <tr><td>Weight gain</td><td>Bupropion</td><td>Mirtazapine, Paroxetine</td><td>Lifestyle support</td></tr>
        <tr><td>Sedation/Insomnia</td><td>Mirtazapine (hs), Doxepin low-dose</td><td>Fluoxetine (activating)</td><td>Align with sleep issues</td></tr>
        <tr><td>QT risk</td><td>Sertraline, Bupropion</td><td>Citalopram/Escitalopram (dose)</td><td>ECG & electrolytes</td></tr>
        <tr><td>Blood pressure</td><td>SSRIs</td><td>Venlafaxine (dose)</td><td>Monitor BP</td></tr>
      </tbody></table>
      <p>Patient priorities & notes:</p>
      <textarea style="width:100%;height:100px"></textarea>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML for a side-effect trade-off matrix covering sexual effects, weight, sedation/insomnia, QT, and blood pressure with prefer/avoid columns and a notes area.",
      "Create a code in HTML for a patient priorities capture sheet that prints a ranked list of side-effect concerns and links them to candidate agents."
    ],
    references: [
      { citation: "Stahl, S. M. (2021). Prescriber’s Guide." },
      { citation: "Cipriani, A., et al. (2018). Lancet network meta-analysis of antidepressants." }
    ]
  },

  {
    id: "perinatal-ssri-snri",
    title: "Perinatal Considerations — SSRI/SNRI (Outline)",
    clinical_summary: [
      "Shared decision-making across psychiatry–obstetrics–pediatrics; weigh relapse risk of untreated illness vs. medication risks.",
      "Often-preferred SSRI in pregnancy/lactation: sertraline; fluoxetine acceptable; avoid paroxetine in 1st trimester when alternatives exist due to fetal cardiac risk signals.",
      "Monitor for PPHN risk signal (absolute risk small) and neonatal adaptation syndrome; plan delivery-period monitoring.",
      "Breastfeeding: sertraline has low milk/plasma ratios; individualize based on infant prematurity, jaundice risk, and maternal response.",
      "Nonpharmacologic care remains foundational; screen for bipolar disorder prior to antidepressants."
    ],
    indications: [ "Perinatal depression/anxiety requiring pharmacotherapy or continuation to prevent relapse." ],
    contraindications: [
      "MAOI use; specific obstetric contraindications; untreated bipolar disorder (risk of mania)."
    ],
    outcome_measures: [ "EPDS/PHQ-9, anxiety scales, maternal functioning, obstetric/neonatal outcomes." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Perinatal SSRI/SNRI Outline</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      @media print{header{border:0}}
    </style></head><body>
    <header><h1>Perinatal SSRI/SNRI — Risk–Benefit Outline</h1><div>Coordinate with OB & pediatrics • Document shared decisions</div></header>
    <main>
      <section class="grid">
        <div>
          <h2>Clinical Context</h2>
          <input placeholder="Dx, severity, relapse history" style="width:100%">
          <input placeholder="Psychotherapy status/supports" style="width:100%">
        </div>
        <div>
          <h2>Medication Plan</h2>
          <input placeholder="Agent & dose (e.g., sertraline)" style="width:100%">
          <input placeholder="Rationale (past response, risk profile)" style="width:100%">
        </div>
      </section>
      <section>
        <h2>Key Considerations</h2>
        <ul>
          <li>First trimester: weigh malformation signals (paroxetine)</li>
          <li>Late pregnancy: neonatal adaptation; PPHN signal (absolute risk small)</li>
          <li>Breastfeeding: milk/plasma ratios; infant monitoring</li>
          <li>Bipolar screen before antidepressants</li>
        </ul>
      </section>
      <section>
        <h2>Liaison & Monitoring</h2>
        <table><thead><tr><th>Discipline</th><th>Task</th><th>When</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>Psychiatry</td><td>EPDS/PHQ-9 monitoring</td><td>q2–4 wks</td><td>dose adjust if needed</td></tr>
          <tr><td>OB</td><td>Fetal growth, obstetric risks</td><td>per schedule</td><td>PPHN counseling</td></tr>
          <tr><td>Pediatrics</td><td>Neonatal adaptation watch</td><td>peripartum</td><td>feeding, jaundice</td></tr>
        </tbody></table>
      </section>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML for a perinatal SSRI/SNRI risk–benefit outline including clinical context, medication plan, key considerations (malformations, PPHN, neonatal adaptation, breastfeeding), and a liaison/monitoring table. Include print CSS.",
      "Create a code in HTML for a breastfeeding compatibility note that captures agent, milk/plasma evidence, infant monitoring plan, and pediatric liaison contact."
    ],
    references: [
      { citation: "American College of Obstetricians and Gynecologists (ACOG). (2023). Perinatal mental health guidance." },
      { citation: "National Institute for Health and Care Excellence. (2020). Antenatal and postnatal mental health guideline." },
      { citation: "LactMed. (current). Drugs and Lactation Database." }
    ]
  },

  {
    id: "geriatrics-anticholinergic-burden",
    title: "Geriatric Polypharmacy & Anticholinergic Burden",
    clinical_summary: [
      "Older adults: start low, go slow; review all meds for anticholinergic load, orthostasis, falls, cognition, and hyponatremia.",
      "Avoid high anticholinergic antidepressants (paroxetine, TCAs) when possible; prefer sertraline, escitalopram with ECG/electrolyte attention as indicated.",
      "Citalopram dose cap often 20 mg/day ≥60 yrs; monitor QT and electrolytes as per local policy.",
      "Hyponatremia SIADH risk: baseline and early follow-up sodium if risk factors (diuretics, low body weight).",
      "Use Beers Criteria and deprescribing where appropriate; simplify regimens and align with goals of care."
    ],
    indications: [ "Late-life depression/anxiety with multimorbidity/polypharmacy." ],
    contraindications: [ "None absolute; tailor to comorbidities (renal/hepatic, cardiac conduction, cognition)." ],
    outcome_measures: [ "PHQ-9, GAD-7, falls, cognition/Delirium screens, Na+, ECG as indicated." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Geriatric Polypharmacy & Anticholinergic Burden</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      @media print{header{border:0}}
    </style></head><body>
    <header><h1>Geriatric Polypharmacy & Anticholinergic Burden</h1><div>Use AGS Beers Criteria; simplify regimens</div></header>
    <main>
      <section>
        <h2>Medication List & Anticholinergic Score</h2>
        <table><thead><tr><th>Drug</th><th>Indication</th><th>Anticholinergic (0–3)</th><th>Action</th></tr></thead>
        <tbody><tr><td><input></td><td><input></td><td><input type="number" min="0" max="3"></td><td><input></td></tr></tbody></table>
      </section>
      <section>
        <h2>Geriatric Safety Checks</h2>
        <ul>
          <li>Orthostasis/falls</li><li>Cognition/delirium</li><li>Na+ (SIADH risk)</li><li>QT/ECG where indicated</li>
        </ul>
      </section>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML for a geriatric antidepressant review sheet including a medication list with anticholinergic scoring (0–3), safety checks (falls, cognition, hyponatremia, QT), and deprescribing actions.",
      "Create a code in HTML for a citalopram geriatric monitoring note with fields for dose (≤20 mg ≥60 yrs), ECG date/result, electrolytes, and risk/benefit discussion."
    ],
    references: [
      { citation: "American Geriatrics Society. (2023). AGS Beers Criteria® for potentially inappropriate medication use in older adults." },
      { citation: "Coupland, C., et al. (2011). Antidepressant use and risk of adverse outcomes in older people. BMJ." }
    ]
  },

  {
    id: "cyp-qt-awareness",
    title: "CYP/QT Interaction Awareness — Brief Navigator",
    clinical_summary: [
      "CYP inhibitors: fluvoxamine (1A2, 2C19), fluoxetine/paroxetine/bupropion (2D6); inducers: carbamazepine, phenytoin, rifampin; tobacco smoke induces 1A2.",
      "High QT concern: citalopram/escitalopram (dose-dependent), some TCAs; additive risk with macrolides, fluoroquinolones, methadone, antipsychotics, electrolyte imbalance.",
      "Check electrolytes (K+, Mg2+), baseline ECG for risk, and avoid dual QT-prolongers when possible.",
      "Document shared risk–benefit and mitigation (dose limits, ECG schedule, alternative agents)."
    ],
    indications: [ "Any antidepressant prescribing with major interaction or QT risk." ],
    contraindications: [ "Concomitant agents with known dangerous interactions (per label) without mitigation." ],
    outcome_measures: [ "ECG/QTc values, electrolyte correction, adverse event avoidance." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CYP/QT Interaction Navigator</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>
      body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
      header{padding:16px 20px;border-bottom:1px solid #ddd}
      main{padding:20px;max-width:1100px;margin:0 auto}
      .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
      table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
      @media print{header{border:0}}
    </style></head><body>
    <header><h1>CYP/QT Interaction Awareness — Brief Navigator</h1><div>Check ECG/electrolytes; avoid dangerous combos</div></header>
    <main>
      <section class="grid">
        <div>
          <h2>Current Medications</h2>
          <textarea style="width:100%;height:120px" placeholder="name • dose • freq"></textarea>
        </div>
        <div>
          <h2>CYP & QT Notes</h2>
          <ul>
            <li><b>Inhibitors:</b> fluvoxamine(1A2,2C19), fluoxetine/paroxetine/bupropion(2D6)</li>
            <li><b>Inducers:</b> carbamazepine, phenytoin, rifampin; smoking→1A2</li>
            <li><b>QT risk:</b> citalopram/escitalopram (dose), TCAs; additivity with macrolides, FQs, methadone, antipsychotics</li>
          </ul>
        </div>
      </section>
      <section>
        <h2>Mitigation Plan</h2>
        <table><thead><tr><th>Risk</th><th>Action</th><th>When</th><th>Owner</th></tr></thead>
        <tbody>
          <tr><td>QT prolongation</td><td>Baseline ECG, electrolytes; limit dose; choose lower-QT agent</td><td><input></td><td><input></td></tr>
          <tr><td>CYP DDI</td><td>Check for inhibitor/inducer; adjust dose or alternative</td><td><input></td><td><input></td></tr>
        </tbody></table>
      </section>
    </main></body></html>`,
    prompts: [
      "Create a code in HTML for a CYP/QT interaction navigator with medication textbox, CYP inhibitor/inducer reminders, QT risk list, and a mitigation table (action/when/owner). Include print CSS.",
      "Create a code in HTML for a QT monitoring sheet with fields for baseline QTc, follow-up QTc, electrolyte results, and decision notes."
    ],
    references: [
      { citation: "CredibleMeds®. (current). QTdrugs lists and risk categories." },
      { citation: "FDA/EMA product labels for citalopram/escitalopram and other agents regarding QT risk." },
      { citation: "Stahl, S. M. (2021). Prescriber’s Guide." }
    ]
  }
];
