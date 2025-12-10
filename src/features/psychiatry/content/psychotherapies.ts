

export type Reference = { citation: string };

export type PsychotherapyItem = {
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

export const PSYCHOTHERAPIES: PsychotherapyItem[] = [
  {
    id: "cbt-depression-6-session",
    title: "CBT for Depression — 6-Session Brief Protocol",
    clinical_summary: [
      "Brief CBT targets current depressive symptoms via behavioral activation (BA), cognitive restructuring, and relapse prevention within 6 focused sessions.",
      "Structure: S1 psychoeducation & BA start; S2 activity scheduling & mood monitoring; S3 cognitive model & thought records; S4 alternative beliefs & problem solving; S5 core beliefs & relapse triggers; S6 relapse prevention plan & consolidation.",
      "Homework is essential (daily mood/activity logs, thought records, mastery/pleasure ratings).",
      "Suicide risk must be screened every visit; safety planning precedes CBT work if risk is moderate–high.",
      "Combine with SSRIs/SNRIs for moderate–severe MDD as indicated; collaborative care improves adherence and outcomes."
    ],
    indications: [
      "Major depressive disorder (mild to moderate), persistent depressive disorder, subthreshold depression with functional impairment."
    ],
    contraindications: [
      "Acute suicidality without a safety plan, psychotic depression, manic/mixed state, severe substance intoxication/withdrawal, severe cognitive impairment."
    ],
    outcome_measures: [
      "PHQ-9 (weekly), GAD-7 (comorbidity), WSAS (functioning), QIDS-SR16 or BDI-II (symptom depth)."
    ],
    example_html: `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CBT for Depression — 6-Session Brief Protocol</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; }
  header { padding: 16px 20px; border-bottom: 1px solid #ddd; }
  main { padding: 20px; max-width: 1100px; margin: 0 auto; }
  h1, h2, h3 { margin: 0 0 8px; }
  section { margin: 18px 0 22px; }
  .grid { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
  .muted { color: #666; font-size: 0.9rem; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; border: 1px solid #bbb; font-size: 12px; }
  @media print {
    header { border: 0; }
    .no-print { display: none; }
    a { color: black; text-decoration: none; }
  }
 </style>
 </head>
 <body>
 <header>
  <h1>CBT for Depression — 6-Session Brief Protocol</h1>
  <div class="muted">Printable worksheet • Use with weekly PHQ-9 tracking • Safety screening each visit</div>
 </header>
 <main>
  <section class="grid" aria-label="Patient & Clinician Identifiers">
    <div>
      <h3>Patient</h3>
      <label>Full name</label><br><input type="text" style="width:100%">
      <div class="grid">
        <div><label>DOB</label><br><input type="date" style="width:100%"></div>
        <div><label>MRN</label><br><input type="text" style="width:100%"></div>
      </div>
    </div>
    <div>
      <h3>Clinician</h3>
      <label>Name</label><br><input type="text" style="width:100%">
      <div class="grid">
        <div><label>Discipline</label><br><input type="text" style="width:100%"></div>
        <div><label>Date</label><br><input type="date" style="width:100%"></div>
      </div>
    </div>
  </section>

  <section aria-label="Risk Screening">
    <h2>Risk Screening <span class="pill">must do</span></h2>
    <table aria-describedby="risk-desc">
      <thead><tr><th>Domain</th><th>Current</th><th>Plan</th></tr></thead>
      <tbody>
        <tr><td>Suicidal ideation/intent</td><td><input type="text" style="width:100%"></td><td><input type="text" style="width:100%"></td></tr>
        <tr><td>Self-harm/violence</td><td><input type="text" style="width:100%"></td><td><input type="text" style="width:100%"></td></tr>
        <tr><td>Substance intox/withdrawal</td><td><input type="text" style="width:100%"></td><td><input type="text" style="width:100%"></td></tr>
      </tbody>
    </table>
    <div id="risk-desc" class="muted">Stabilize risk before CBT; document safety plan if any risk is present.</div>
  </section>

  <section aria-label="Session Planner">
    <h2>6-Session Planner</h2>
    <table>
      <thead>
        <tr><th>Session</th><th>Focus</th><th>Homework</th><th>Measures</th></tr>
      </thead>
      <tbody>
        <tr><td>S1</td><td>Psychoeducation; start Behavioral Activation; activity & mood monitoring</td><td>Daily activity log + mood (0–10); schedule 3 mastery/pleasure tasks</td><td>PHQ-9, WSAS baseline</td></tr>
        <tr><td>S2</td><td>Refine BA; values → activities; barriers troubleshooting</td><td>Update schedule; rate mastery/pleasure (0–10)</td><td>PHQ-9</td></tr>
        <tr><td>S3</td><td>Cognitive model; identify NATs; 5-column thought record</td><td>3 thought records; evidence for/against</td><td>PHQ-9</td></tr>
        <tr><td>S4</td><td>Alternative beliefs; problem solving</td><td>Behavioral experiments; continue thought records</td><td>PHQ-9</td></tr>
        <tr><td>S5</td><td>Core beliefs; schema-level work; relapse trigger map</td><td>Relapse triggers & coping strategies</td><td>PHQ-9</td></tr>
        <tr><td>S6</td><td>Relapse prevention plan; early-warning signs; boosters</td><td>Maintain schedule; follow-up plan</td><td>PHQ-9, WSAS</td></tr>
      </tbody>
    </table>
  </section>

  <section aria-label="Behavioral Activation">
    <h2>Behavioral Activation — Activity Schedule</h2>
    <table>
      <thead><tr><th>Day</th><th>Planned Activity</th><th>Mastery (0–10)</th><th>Pleasure (0–10)</th><th>Completed?</th></tr></thead>
      <tbody>
        <tr><td>Mon</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Tue</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Wed</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Thu</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Fri</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Sat</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
        <tr><td>Sun</td><td><input type="text" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="number" min="0" max="10" style="width:100%"></td><td><input type="checkbox"></td></tr>
      </tbody>
    </table>
  </section>

  <section aria-label="Thought Record">
    <h2>Five-Column Thought Record</h2>
    <table>
      <thead><tr><th>Situation</th><th>Automatic Thought</th><th>Emotion (0–100)</th><th>Evidence For/Against</th><th>Alternative Thought</th></tr></thead>
      <tbody>
        <tr>
          <td><textarea style="width:100%;height:70px"></textarea></td>
          <td><textarea style="width:100%;height:70px"></textarea></td>
          <td><input type="number" min="0" max="100" style="width:100%"></td>
          <td><textarea style="width:100%;height:70px"></textarea></td>
          <td><textarea style="width:100%;height:70px"></textarea></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section aria-label="Relapse Prevention">
    <h2>Relapse Prevention Plan</h2>
    <div class="grid">
      <div>
        <h3>Early Warning Signs</h3>
        <textarea style="width:100%;height:90px"></textarea>
      </div>
      <div>
        <h3>Coping Actions</h3>
        <textarea style="width:100%;height:90px"></textarea>
      </div>
      <div>
        <h3>Support Map</h3>
        <textarea style="width:100%;height:90px"></textarea>
      </div>
    </div>
  </section>
 </main>
 </body>
 </html>`,
    prompts: [
      "Create a code in HTML as a printable A4 page for a 6-session CBT for Depression protocol with sections: identifiers, risk screening, 6-session planner, behavioral activation schedule (mastery/pleasure 0–10), five-column thought record, relapse prevention plan, and weekly PHQ-9 space. Use semantic HTML, accessible labels, and simple CSS without frameworks.",
      "Create a code in HTML for a depression activity scheduling form that captures day-by-day planned activities, completion checkboxes, and mastery/pleasure ratings (0–10), with a total weekly adherence percentage shown via minimal inline JavaScript.",
      "Create a code in HTML for a CBT thought record (five columns) with print styles and aria-labels so clinicians can export to PDF cleanly.",
      "Create a code in HTML for a therapy progress page that prints a weekly PHQ-9 table (6 rows), WSAS fields, and a text area for medication/side-effects notes.",
      "Create a code in HTML for a relapse prevention worksheet including early warning signs, coping strategies, social support contacts, and follow-up scheduling block."
    ],
    references: [
      { citation: "Beck, J. S. (2011). Cognitive behavior therapy: Basics and beyond (2nd ed.). Guilford Press." },
      { citation: "Cuijpers, P., Karyotaki, E., Reijnders, M., & Purgato, M. (2023). Meta-analyses and mega-analyses of the effectiveness of cognitive behavior therapy for depression. World Psychiatry, 22(1), 105–115." },
      { citation: "National Institute for Health and Care Excellence. (2022). Depression in adults: Treatment and management (NG222)." },
      { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with major depressive disorder (4th ed.)." }
    ]
  },

  {
    id: "behavioral-activation-quick-start",
    title: "Behavioral Activation — Quick Start",
    clinical_summary: [
      "BA targets avoidance and withdrawal by scheduling values-based, reinforcing activities to restore environmental reward.",
      "Core tools: TRAP→TRAC analysis (Trigger–Response–Avoidance Pattern → Trigger–Response–Alternative Coping), activity hierarchies, mastery/pleasure ratings.",
      "Works for unipolar depression and comorbid anxiety; can be delivered brief or as a module in CBT."
    ],
    indications: [
      "Depressive episode with prominent anhedonia/avoidance; residual symptoms; relapse prevention."
    ],
    contraindications: [
      "Acute mania/mixed state; severe agitation; uncontrolled substance withdrawal; high suicide risk without a safety plan."
    ],
    outcome_measures: [
      "PHQ-9 weekly; Behavioral Activation for Depression Scale (BADS) if available; WSAS."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Behavioral Activation — Quick Start</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}header{padding:16px 20px;border-bottom:1px solid #ddd}main{padding:20px;max-width:1100px;margin:0 auto}h1,h2,h3{margin:0 0 8px}section{margin:18px 0 22px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}@media print{header{border:0}}</style></head><body>
<header><h1>Behavioral Activation — Quick Start</h1><div>Values → activities; mastery & pleasure ratings; TRAP→TRAC</div></header>
<main>
<section>
  <h2>Values & Activities</h2>
  <table><thead><tr><th>Value Domain</th><th>Activity Ideas</th></tr></thead>
  <tbody>
    <tr><td>Health</td><td><textarea style="width:100%;height:60px"></textarea></td></tr>
    <tr><td>Relationships</td><td><textarea style="width:100%;height:60px"></textarea></td></tr>
    <tr><td>Education/Work</td><td><textarea style="width:100%;height:60px"></textarea></td></tr>
  </tbody></table>
 </section>
 <section>
  <h2>Weekly Schedule (Mastery/Pleasure)</h2>
  <table><thead><tr><th>Day</th><th>Planned Activity</th><th>Mastery (0–10)</th><th>Pleasure (0–10)</th><th>Done?</th></tr></thead>
  <tbody>
    <tr><td>Mon</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Tue</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Wed</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Thu</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Fri</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Sat</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
    <tr><td>Sun</td><td><input style="width:100%"></td><td><input type="number" min="0" max="10"></td><td><input type="number" min="0" max="10"></td><td><input type="checkbox"></td></tr>
  </tbody></table>
 </section>
 <section>
  <h2>TRAP → TRAC</h2>
  <table><thead><tr><th>Trigger</th><th>Response</th><th>Avoidance Pattern</th><th>Alternative Coping</th></tr></thead>
  <tbody><tr>
    <td><textarea style="width:100%;height:60px"></textarea></td>
    <td><textarea style="width:100%;height:60px"></textarea></td>
    <td><textarea style="width:100%;height:60px"></textarea></td>
    <td><textarea style="width:100%;height:60px"></textarea></td>
  </tr></tbody></table>
 </section>
 </main></body></html>`,
    prompts: [
      "Create a code in HTML for a Behavioral Activation worksheet with three sections: values-to-activities table, weekly activity schedule with mastery/pleasure ratings (0–10), and a TRAP→TRAC table. Include basic print CSS.",
      "Create a code in HTML for a BA adherence tracker that calculates completion percentage and mean mastery/pleasure ratings with minimal inline JavaScript.",
      "Create a code in HTML for a values clarification page that lists value domains and lets the clinician add activity ideas with textarea fields and printable layout."
    ],
    references: [
      { citation: "Martell, C. R., Dimidjian, S., & Herman-Dunn, R. (2010). Behavioral activation for depression: A clinician’s guide. Guilford Press." },
      { citation: "Cuijpers, P., van Straten, A., & Warmerdam, L. (2007). Behavioral activation treatments of depression: A meta-analysis. Clinical Psychology Review, 27(3), 318–326." }
    ]
  },

  {
    id: "cbt-i-ladder",
    title: "CBT-I Ladder — First-Line Insomnia Steps",
    clinical_summary: [
      "CBT-I is first-line for chronic insomnia: stimulus control, sleep restriction therapy (SRT), sleep hygiene, cognitive therapy, and relapse prevention.",
      "Sleep diary (2 weeks) precedes SRT. Start Time in Bed (TIB) = average Total Sleep Time (TST) + 30–60 min (min 5 h). Adjust ±15–30 min based on sleep efficiency (SE).",
      "Avoid in uncontrolled bipolar mania, untreated sleep apnea, and high-risk occupations needing alertness until stabilized."
    ],
    indications: [
      "Chronic insomnia disorder (≥3 months, ≥3 nights/week) with daytime impairment."
    ],
    contraindications: [
      "Untreated OSA, acute mania, parasomnias with injury risk, severe circadian rhythm disorders needing specialist care."
    ],
    outcome_measures: [
      "Insomnia Severity Index (ISI), Pittsburgh Sleep Quality Index (PSQI), sleep efficiency from diary."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>CBT-I Ladder — First-Line Steps</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}header{padding:16px 20px;border-bottom:1px solid #ddd}main{padding:20px;max-width:1100px;margin:0 auto}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}@media print{header{border:0}}</style></head><body>
<header><h1>CBT-I Ladder — First-Line Insomnia Steps</h1><div>Diary → Stimulus Control → SRT → Cognitive & Relapse Prevention</div></header>
<main>
<section><h2>Sleep Diary (7 days)</h2>
<table><thead><tr><th>Day</th><th>Bedtime</th><th>SL (min)</th><th>Awakenings</th><th>WASO (min)</th><th>Rise</th><th>TST (h)</th><th>SE (%)</th></tr></thead>
<tbody>
<tr><td>Mon</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Tue</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Wed</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Thu</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Fri</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Sat</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
<tr><td>Sun</td><td><input></td><td><input type="number"></td><td><input type="number"></td><td><input type="number"></td><td><input></td><td><input type="number" step="0.1"></td><td><input type="number"></td></tr>
 </tbody></table></section>
 <section><h2>Stimulus Control</h2>
 <ul>
  <li>Bed only for sleep (and sex); no screens; get up if awake &gt; 20 minutes and do a quiet activity.</li>
  <li>Fixed wake time daily; avoid naps initially.</li>
 </ul></section>
 <section><h2>Sleep Restriction Therapy (SRT) — Initial Prescription</h2>
 <div class="grid">
  <div><label>Avg TST (h)</label><input type="number" step="0.1" style="width:100%"></div>
  <div><label>TIB Start (TST + 0.5h, min 5h)</label><input type="number" step="0.1" style="width:100%"></div>
  <div><label>Target Bedtime</label><input style="width:100%"></div>
  <div><label>Target Rise Time</label><input style="width:100%"></div>
 </div>
 <p class="muted">Adjust ±15–30 min weekly by sleep efficiency (SE = TST/TIB × 100%).</p>
 </section>
 </main></body></html>`,
    prompts: [
      "Create a code in HTML for a CBT-I worksheet that includes a 7-day sleep diary (bedtime, sleep latency, awakenings, WASO, rise, TST, SE), a stimulus control checklist, and an SRT initial prescription block with fields for TST, TIB, bedtime, and rise time. Include print CSS.",
      "Create a code in HTML that calculates sleep efficiency (SE) per day and shows a weekly mean using minimal inline JavaScript and accessible table markup.",
      "Create a code in HTML for a patient-facing CBT-I instruction sheet (stimulus control rules and safety notes) designed for clean printing."
    ],
    references: [
      { citation: "Edinger, J. D., & Carney, C. E. (2014). Overcoming insomnia: A cognitive-behavioral therapy approach (therapist guide). Oxford University Press." },
      { citation: "Qaseem, A., et al. (2016). Management of chronic insomnia disorder in adults: A clinical practice guideline from the American College of Physicians. Annals of Internal Medicine, 165(2), 125–133." },
      { citation: "Riemann, D., et al. (2017). The European guideline for the diagnosis and treatment of insomnia. Journal of Sleep Research, 26(6), 675–700." }
    ]
  },

  {
    id: "exposure-hierarchy-builder",
    title: "Exposure Hierarchy Builder (Anxiety/PTSD/OCD)",
    clinical_summary: [
      "Graduated exposure reduces avoidance and conditioned fear across interoceptive, in-vivo, and imaginal modalities.",
      "Use SUDS (0–100) ratings; eliminate safety behaviors; repeat exposures until within- and between-session habituation/learning occurs.",
      "Risk check: active suicidality, severe dissociation, or unstable psychosis require stabilization or modified protocol."
    ],
    indications: [
      "Panic disorder (with/without agoraphobia), social anxiety, specific phobia, PTSD (trauma-focused), OCD (ERP)."
    ],
    contraindications: [
      "Unstable medical/psychiatric conditions; exposure tasks that would be genuinely unsafe; lack of consent/capacity."
    ],
    outcome_measures: [
      "SUDS trajectory; disorder-specific scales (e.g., PDSS, LSAS, PCL-5, Y-BOCS)."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Exposure Hierarchy Builder</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}header{padding:16px 20px;border-bottom:1px solid #ddd}main{padding:20px;max-width:1100px;margin:0 auto}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}@media print{header{border:0}}</style></head><body>
<header><h1>Exposure Hierarchy Builder (Anxiety/PTSD/OCD)</h1><div>SUDS 0–100 • Remove safety behaviors • Track habituation</div></header>
<main>
<section>
  <h2>Psychoeducation — Fear/Avoidance Cycle</h2>
  <p>Identify triggers, feared predictions, safety behaviors, and how avoidance maintains fear.</p>
 </section>
 <section>
  <h2>Hierarchy</h2>
  <table><thead><tr><th>Item</th><th>Modality</th><th>Details</th><th>Safety Behaviors to Drop</th><th>Initial SUDS</th></tr></thead>
  <tbody>
    <tr><td>1</td><td><select><option>In-vivo</option><option>Interoceptive</option><option>Imaginal</option></select></td><td><textarea style="width:100%;height:60px"></textarea></td><td><textarea style="width:100%;height:60px"></textarea></td><td><input type="number" min="0" max="100"></td></tr>
    <tr><td>2</td><td><select><option>In-vivo</option><option>Interoceptive</option><option>Imaginal</option></select></td><td><textarea style="width:100%;height:60px"></textarea></td><td><textarea style="width:100%;height:60px"></textarea></td><td><input type="number" min="0" max="100"></td></tr>
    <tr><td>3</td><td><select><option>In-vivo</option><option>Interoceptive</option><option>Imaginal</option></select></td><td><textarea style="width:100%;height:60px"></textarea></td><td><textarea style="width:100%;height:60px"></textarea></td><td><input type="number" min="0" max="100"></td></tr>
  </tbody></table>
 </section>
 <section>
  <h2>Exposure Log (Repeat Until SUDS ↓)</h2>
  <table><thead><tr><th>Date</th><th>Hierarchy Item</th><th>Start SUDS</th><th>Peak</th><th>End</th><th>Learning Notes</th></tr></thead>
  <tbody>
    <tr><td><input type="date"></td><td><input></td><td><input type="number" min="0" max="100"></td><td><input type="number" min="0" max="100"></td><td><input type="number" min="0" max="100"></td><td><textarea style="width:100%;height:60px"></textarea></td></tr>
  </tbody></table>
 </section>
 </main></body></html>`,
    prompts: [
      "Create a code in HTML for an exposure hierarchy builder with columns: modality (in-vivo/interoceptive/imaginal), details, safety behaviors to drop, and initial SUDS (0–100), plus a repeated exposure log that tracks start/peak/end SUDS and learning notes. Include print CSS.",
      "Create a code in HTML for a psychoeducation page explaining the fear-avoidance cycle with space for personalized feared predictions and safety behaviors.",
      "Create a code in HTML for an ERP session sheet (for OCD) with fields for obsession, ritual prevented, distress ratings every 5 minutes, and habituation summary."
    ],
    references: [
      { citation: "Foa, E. B., Hembree, E., & Rothbaum, B. O. (2007). Prolonged exposure therapy for PTSD: Emotional processing of traumatic experiences. Oxford University Press." },
      { citation: "Craske, M. G., Treanor, M., Conway, C. C., Zbozinek, T., & Vervliet, B. (2014). Maximizing exposure therapy: An inhibitory learning approach. Behaviour Research and Therapy, 58, 10–23." },
      { citation: "Abramowitz, J. S., McKay, D., & Taylor, S. (2008). Obsessive-compulsive disorder. Elsevier." }
    ]
  },

  {
    id: "relapse-prevention-worksheet",
    title: "Relapse Prevention Worksheet (Therapy)",
    clinical_summary: [
      "Identify high-risk situations, early warning signs, coping strategies, and support resources to maintain gains and reduce relapse risk.",
      "Use plan review at each follow-up; integrate medication adherence and lifestyle anchors (sleep, exercise, substances).",
      "Include a personalized crisis plan with contacts and access steps."
    ],
    indications: [
      "Maintenance phase after acute treatment; recurrent depression/anxiety; substance use disorders (adjunctive)."
    ],
    contraindications: [
      "None specific; ensure acute risk is addressed via safety planning first."
    ],
    outcome_measures: [
      "Relapse/recurrence tracking; PHQ-9/GAD-7 trend; adherence markers."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Relapse Prevention Worksheet</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}header{padding:16px 20px;border-bottom:1px solid #ddd}main{padding:20px;max-width:1100px;margin:0 auto}h1,h2{margin:0 0 8px}section{margin:18px 0 22px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}@media print{header{border:0}}</style></head><body>
<header><h1>Relapse Prevention Worksheet</h1><div>High-risk situations • Early warning signs • Coping plan • Supports • Crisis steps</div></header>
<main>
<section><h2>High-Risk Situations</h2><textarea style="width:100%;height:90px"></textarea></section>
<section><h2>Early Warning Signs</h2><textarea style="width:100%;height:90px"></textarea></section>
<section><h2>Coping Strategies</h2><textarea style="width:100%;height:90px"></textarea></section>
<section><h2>Support Map</h2>
<table><thead><tr><th>Name</th><th>Role</th><th>Phone</th><th>Availability</th></tr></thead>
<tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
 <section><h2>Crisis Plan</h2>
 <ol>
  <li>Call: <input placeholder="Clinic / Crisis line"></li>
  <li>Go to: <input placeholder="Nearest ER / Safe location"></li>
  <li>Remove means / increase supervision: <input></li>
 </ol>
 </section>
 </main></body></html>`,
    prompts: [
      "Create a code in HTML for a relapse prevention plan page including sections for high-risk situations, early warning signs, coping strategies, support map (table), and a 3-step crisis plan. Include print CSS.",
      "Create a code in HTML for a patient handout summarizing relapse warning signs and specific coping scripts with a signature/date block."
    ],
    references: [
      { citation: "Witkiewitz, K., & Marlatt, G. A. (2004). Relapse prevention for alcohol and drug problems: That was Zen, this is Tao. American Psychologist, 59(4), 224–235." },
      { citation: "Marlatt, G. A., & Donovan, D. M. (Eds.). (2005). Relapse prevention: Maintenance strategies in the treatment of addictive behaviors (2nd ed.). Guilford Press." }
    ]
  }
];
