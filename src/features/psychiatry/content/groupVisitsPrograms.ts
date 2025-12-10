

export type Reference = { citation: string };

export type GroupItem = {
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

export const GROUP_VISITS_PROGRAMS: GroupItem[] = [

  {
    id: "psychoed-6-session",
    title: "Psychoeducation Group — 6-Session Outline (Structured)",
    clinical_summary: [
      "Evidence base: psychoeducation improves adherence, self-management, and relapse prevention across mood/anxiety/psychosis (NICE, WHO).",
      "6-session scaffold: (1) Illness model & MBC; (2) Medications & side-effects; (3) CBT/behavioral activation basics; (4) Sleep & lifestyle; (5) Relapse prevention & early warning signs; (6) Review & maintenance.",
      "Safety & process: set norms, confidentiality limits, crisis procedures; weekly risk screen; inclusive language; optional support person.",
      "Measurement-Based Care: PHQ-9/GAD-7 or illness-relevant scales at baseline, mid, discharge; track attendance & homework completion.",
    ],
    indications: [
      "Newly diagnosed patients; those starting treatment; step-care adjunct for depression/anxiety/bipolar/psychosis stabilization."
    ],
    contraindications: [
      "Acute safety risk, severe cognitive impairment, severe intoxication/withdrawal, or inability to adhere to group boundaries."
    ],
    outcome_measures: [
      "Attendance %, PHQ-9/GAD-7 change, knowledge quiz pre/post, medication adherence self-report, relapse-prevention plan completion."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Psychoeducation Group — 6-Session Outline</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left;vertical-align:top}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  .muted{color:var(--t);font-size:.9rem} .box{border:1px solid var(--b);padding:10px;border-radius:8px;background:#fafafa}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Psychoeducation Group — 6-Session Outline</h1>
  <div class="muted">Evidence-based • Risk-aware • Print-ready</div>
</header>
<main>
<section class="box">
  <h2>Ground Rules & Safety</h2>
  <ul>
    <li>Confidentiality limits reviewed (risk/abuse/court orders).</li>
    <li>Respectful language; 1 person speaks at a time; no recording.</li>
    <li>Crisis path: use local emergency number; clinic after-hours: <input style="width:40%"></li>
  </ul>
</section>

<section>
  <h2>6-Session Scaffold</h2>
  <table>
    <thead><tr><th>Session</th><th>Objectives</th><th>Activities</th><th>Materials</th><th>Homework</th></tr></thead>
    <tbody>
      <tr><td>1. Illness model & MBC</td><td>Normalize; introduce PHQ-9/GAD-7</td><td>Psychoeducation mini-lecture; Q&A</td><td>Slides; handout</td><td>Complete baseline scales</td></tr>
      <tr><td>2. Medications</td><td>Benefits/risks; adherence</td><td>Myths vs facts; side-effect mitigation</td><td>Med info sheets</td><td>List questions for prescriber</td></tr>
      <tr><td>3. CBT/BA</td><td>Link thoughts–behaviors–mood</td><td>Activity scheduling; cognitive reframe</td><td>Worksheet</td><td>Plan 3 activities</td></tr>
      <tr><td>4. Sleep & lifestyle</td><td>CBT-I basics; routines</td><td>Sleep diary demo</td><td>Sleep checklist</td><td>Track sleep for a week</td></tr>
      <tr><td>5. Relapse prevention</td><td>Early signs; coping plan</td><td>Warning-signs map; support list</td><td>Template</td><td>Draft relapse plan</td></tr>
      <tr><td>6. Review & maintenance</td><td>Consolidate skills</td><td>Post-test; graduation</td><td>Action plan</td><td>Follow-up plan</td></tr>
    </tbody>
  </table>
</section>

<section class="grid">
  <div class="box"><h2>Attendance Roster</h2>
    <table><thead><tr><th>Name</th><th>S1</th><th>S2</th><th>S3</th><th>S4</th><th>S5</th><th>S6</th></tr></thead>
      <tbody><tr><td><input></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox"></td><td><input type="checkbox"></td></tr></tbody></table>
  </div>
  <div class="box"><h2>MBC Snapshot</h2>
    <table><thead><tr><th>Instrument</th><th>Baseline</th><th>Mid</th><th>Post</th></tr></thead>
      <tbody><tr><td>PHQ-9</td><td><input></td><td><input></td><td><input></td></tr>
             <tr><td>GAD-7</td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable 6-session psychoeducation group outline with ground rules/safety, a session-by-session table (objectives, activities, materials, homework), an attendance roster, and a measurement snapshot (PHQ-9/GAD-7). Use semantic HTML and print CSS.",
      "Create a code in HTML for a patient-facing relapse-prevention worksheet with early warning signs, coping steps, support contacts, and review dates.",
      "Create a code in HTML for a brief knowledge pre/post quiz (10 items) with answer key area for clinician use."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2022). Depression in adults: treatment and management (NG222)." },
      { citation: "World Health Organization. (2016/2023). mhGAP intervention guide: psychoeducation components." },
      { citation: "Fava, G. A., & Tomba, E. (2009). Increasing psychological well-being and resilience by psychoeducation. CNS Drugs, 23(7), 543–559." }
    ]
  },


  {
    id: "dbt-module-picker",
    title: "DBT Skills Group — Module Picker",
    clinical_summary: [
      "DBT skills modules: Core Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness; optional Walking the Middle Path for adolescents/families.",
      "Structure: 90–120 min weekly; homework review; new skill teaching; in-group practice; diary card; chain analysis for problem behaviors.",
      "Risk management: crisis pathways, coaching boundaries, no-harm safety agreements; higher level of care when imminent risk.",
      "Fit: borderline traits/emotion dysregulation, recurrent self-harm, chronic suicidality; adapt to comorbidity (SUD, PTSD)."
    ],
    indications: [
      "Emotion dysregulation with self-harm/suicidality; BPD traits; treatment-resistant mood/anxiety with behavioral dyscontrol."
    ],
    contraindications: [
      "Acute intoxication/psychosis, uncontrolled mania, inability to commit to attendance/homework; consider pre-treatment phase."
    ],
    outcome_measures: [
      "Diary card behavior frequency, urges, skill use; C-SSRS; DERS; functioning and crisis utilization."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>DBT Skills Group — Module Picker</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .card{border:1px solid var(--b);border-radius:10px;padding:12px;background:#fafafa}
  ul{margin:0 0 8px 18px}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>DBT Skills Group — Module Picker</h1></header>
<main>
<section class="grid">
  <div class="card"><h2>Core Mindfulness</h2>
    <ul><li>Wise Mind (What/How skills)</li><li>Observe/Describe/Participate</li></ul>
    <label>Weeks</label> <input style="width:100%" placeholder="e.g., 2"></div>
  <div class="card"><h2>Distress Tolerance</h2>
    <ul><li>TIPP, STOP</li><li>Pros & Cons, ACCEPTS</li></ul>
    <label>Weeks</label> <input style="width:100%" placeholder="e.g., 3"></div>
  <div class="card"><h2>Emotion Regulation</h2>
    <ul><li>Model of emotion</li><li>PLEASE, Opposite Action</li></ul>
    <label>Weeks</label> <input style="width:100%" placeholder="e.g., 4"></div>
  <div class="card"><h2>Interpersonal Effectiveness</h2>
    <ul><li>DEAR MAN, GIVE, FAST</li></ul>
    <label>Weeks</label> <input style="width:100%" placeholder="e.g., 3"></div>
</section>
<section>
  <h2>Weekly Plan</h2>
  <table>
    <thead><tr><th>Week</th><th>Module</th><th>Skill(s)</th><th>Practice</th><th>Homework</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody>
  </table>
</section>
<section>
  <h2>Risk & Coaching Boundaries</h2>
  <ul><li>Use crisis line/local emergency for imminent risk; coaching for skills only; no therapy via text.</li></ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a DBT module picker page with four cards (Core Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness), a weekly plan table, and a risk/coaching boundaries section. Print CSS required.",
      "Create a code in HTML for a DBT diary card (urges/behaviors, emotions 0–10, skills used, coaching contacts).",
      "Create a code in HTML for a chain analysis worksheet (vulnerabilities → prompting event → links → behavior → consequences → skillful alternatives)."
    ],
    references: [
      { citation: "Linehan, M. M. (2015). DBT Skills Training Manual (2nd ed.). Guilford." },
      { citation: "American Psychiatric Association. (2023). Practice guideline for BPD—psychotherapies including DBT." },
      { citation: "Linehan, M. M., et al. (2006). Two-year randomized controlled trial of DBT in BPD. Archives of General Psychiatry, 63(7), 757–766." }
    ]
  },


  {
    id: "family-psychoed-single",
    title: "Family Psychoeducation — Single-Session Plan",
    clinical_summary: [
      "Brief family psychoeducation reduces relapse and improves adherence and communication; cover illness model, medications, early warning signs, stress–vulnerability model, and support roles.",
      "Structure (60–90 min): goals & norms; illness overview; communication skills (validating statements, brief problem-solving); resource mapping; safety planning.",
      "Confidentiality & consent: obtain ROI; discuss boundaries; include carer burden and strengths."
    ],
    indications: [ "New diagnosis; post-hospital follow-up; caregiver education; when engagement is low." ],
    contraindications: [ "Active domestic violence risk; uncontrolled mania/psychosis; severe family conflict requiring separate work first." ],
    outcome_measures: [ "Caregiver knowledge/confidence rating; adherence; relapse-prevention plan completion; emergency contact clarity." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Family Psychoeducation — Single-Session Plan</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  .card{border:1px solid var(--b);border-radius:8px;padding:12px;background:#fafafa;margin-bottom:10px}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Family Psychoeducation — Single-Session Plan</h1></header>
<main>
<div class="card">
  <h2>Agenda & Norms</h2>
  <ul><li>Goals: understanding, communication, relapse prevention</li>
      <li>Norms: respect, confidentiality limits, voluntary sharing</li></ul>
</div>
<section>
  <h2>Illness Overview & Medications</h2>
  <textarea style="width:100%;height:90px" placeholder="Brief bio-psycho-social model; current treatment"></textarea>
</section>
<section>
  <h2>Communication Skills Practice</h2>
  <table><thead><tr><th>Skill</th><th>Prompt</th><th>Family practice notes</th></tr></thead>
    <tbody><tr><td>Validate</td><td>“I can see this is hard…”</td><td><input></td></tr>
           <tr><td>Brief request</td><td>Use DEAR skill</td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Relapse Prevention & Safety</h2>
  <table><thead><tr><th>Early signs</th><th>Action</th><th>Who</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Resources & Contacts</h2>
  <table><thead><tr><th>Service</th><th>Phone/URL</th><th>Notes</th></tr></thead>
    <tbody><tr><td>Crisis / 988 (U.S.)</td><td><input></td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a family psychoeducation single-session plan including agenda/norms, illness overview, communication skills practice table, relapse-prevention & safety table, and local resource list. Print CSS required.",
      "Create a code in HTML for a caregiver burden & strengths screen with Likert items and space for supports mapping.",
      "Create a code in HTML for a family communication worksheet (validate, request, problem-solve) with examples and home practice."
    ],
    references: [
      { citation: "Dixon, L., et al. (2001). Evidence-based practices for services to families of people with psychiatric disabilities. Psychiatric Services, 52(7), 903–910." },
      { citation: "NICE. (2014; updates). Psychosis and schizophrenia in adults: family intervention recommendations (CG178)." },
      { citation: "McFarlane, W. R. (2016). Family psychoeducation for schizophrenia: A review. Psychiatric Times." }
    ]
  },


  {
    id: "multi-family-psychoed",
    title: "Multi-Family Psychoeducation (Schizophrenia/Schizoaffective) — 6–8 Sessions",
    clinical_summary: [
      "Adapted from McFarlane model: joining → psychoeducation → communication training → structured problem solving; reduces relapse and improves family functioning.",
      "Content domains: illness/relapse signatures; medication adherence & side-effects; stress reduction; communication; problem solving; crisis planning and early warning detection.",
      "Risk: incorporate relapse/crisis pathways; consider separate carer time; manage high expressed emotion and privacy boundaries.",
    ],
    indications: [ "Adults with schizophrenia/schizoaffective and supportive families willing to attend together." ],
    contraindications: [ "Active domestic violence, severe ongoing substance intoxication, uncontrolled aggression; consider individual work first." ],
    outcome_measures: [ "Relapse/readmission rates; adherence; family burden measures; attendance; early warning plan quality." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Multi-Family Psychoeducation — 6–8 Sessions</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .muted{color:var(--t);font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Multi-Family Psychoeducation — 6–8 Sessions</h1><div class="muted">Schizophrenia/Schizoaffective — McFarlane-informed</div></header>
<main>
<section>
  <h2>Session Map</h2>
  <table>
    <thead><tr><th>Session</th><th>Focus</th><th>Exercises</th><th>Homework</th></tr></thead>
    <tbody>
      <tr><td>1–2 Joining</td><td>Engagement, goals, norms</td><td>Dyad interviews</td><td>Bring relapse history</td></tr>
      <tr><td>3 Psychoeducation</td><td>Illness & meds</td><td>Q&A with prescriber</td><td>Side-effects log</td></tr>
      <tr><td>4 Communication</td><td>Low-EE skills</td><td>Expressing positives, requests</td><td>Practice script</td></tr>
      <tr><td>5–7 Problem solving</td><td>Identify & solve real problems</td><td>Structured steps</td><td>Implement plan</td></tr>
      <tr><td>8 Review</td><td>Relapse plan</td><td>Early warning checklist</td><td>Follow-up plan</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Relapse/Early Warning Checklist</h2>
  <table><thead><tr><th>Sign</th><th>Action</th><th>Who</th></tr></thead>
    <tbody><tr><td><input placeholder="sleep reversal, social withdrawal"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Family Contact & Consent (ROI)</h2>
  <table><thead><tr><th>Name/Relationship</th><th>Phone</th><th>Consent scope</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input placeholder="attendance, care coordination"></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable multi-family psychoeducation plan (6–8 sessions) with a session map, a relapse/early warning checklist, and a family contact/ROI table. Print CSS included.",
      "Create a code in HTML for a structured problem-solving worksheet (define problem, brainstorm, pros/cons, plan, responsibilities, review date).",
      "Create a code in HTML for a low–expressed emotion communication practice sheet with praise, requests, and limits."
    ],
    references: [
      { citation: "McFarlane, W. R. (2016). Family psychoeducation for schizophrenia: evidence and practice. World Psychiatry, 15(1), 57–58." },
      { citation: "NICE. (2014; updates). Psychosis and schizophrenia in adults (CG178): Family intervention recommendations." },
      { citation: "Pitschel-Walz, G., et al. (2001). Psychoeducation and relapse in schizophrenia: meta-analysis. Schizophrenia Bulletin, 27(4), 703–720." }
    ]
  },


  {
    id: "cbt-anxiety-8session",
    title: "CBT for Anxiety Group — 8-Session Core (GAD/Panic/Social)",
    clinical_summary: [
      "Core elements: psychoeducation, CBT model, monitoring, cognitive restructuring, behavioral experiments, graded exposure (including interoceptive for panic), and relapse prevention.",
      "Safety: screen suicidality each session; manage benzodiazepine use; address medical rule-outs for panic-like symptoms when indicated.",
      "Homework drives outcomes; use SMART exposure hierarchies and safety-behavior audits; ensure cultural/contextual fit.",
    ],
    indications: [ "GAD, panic, social anxiety, mixed anxiety presentations; motivated for exposure-based work." ],
    contraindications: [ "Active substance intoxication, untreated psychosis or mania, high suicide risk without stabilization." ],
    outcome_measures: [ "GAD-7, PDSS-SR, SPIN (per phenotype), avoidance/safety behavior counts, homework adherence." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>CBT for Anxiety Group — 8-Session Core</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>CBT for Anxiety Group — 8-Session Core</h1></header>
<main>
<section>
  <h2>Session Plan</h2>
  <table>
    <thead><tr><th>Session</th><th>Topics</th><th>Exercises</th><th>Homework</th></tr></thead>
    <tbody>
      <tr><td>1</td><td>Psychoeducation & CBT model</td><td>Case formulation lite</td><td>Monitoring log</td></tr>
      <tr><td>2</td><td>Safety behaviors & avoidance</td><td>Audit</td><td>Behavioral experiment</td></tr>
      <tr><td>3</td><td>Cognitive restructuring</td><td>Thought record</td><td>Restructure practice</td></tr>
      <tr><td>4</td><td>Exposure planning</td><td>Hierarchy build</td><td>First exposures</td></tr>
      <tr><td>5</td><td>Interoceptive exposure (panic)</td><td>Drills</td><td>Home drills</td></tr>
      <tr><td>6</td><td>Social exposures / behavioral experiments</td><td>In-group tasks</td><td>Graded tasks</td></tr>
      <tr><td>7</td><td>Generalization & values</td><td>Values map</td><td>Values-based exposures</td></tr>
      <tr><td>8</td><td>Relapse prevention</td><td>Plan</td><td>Maintenance</td></tr>
    </tbody>
  </table>
</section>
<section class="grid">
  <div><h2>Exposure Hierarchy</h2>
    <table><thead><tr><th>Item</th><th>SUDS (0–100)</th><th>Safety behaviors</th><th>Planned date</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td><td><input type="date"></td></tr></tbody></table>
  </div>
  <div><h2>Measures</h2>
    <table><thead><tr><th>Scale</th><th>Baseline</th><th>Mid</th><th>Post</th></tr></thead>
      <tbody><tr><td>GAD-7 / PDSS-SR / SPIN</td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable 8-session CBT for anxiety plan with a session table, an exposure hierarchy builder (item, SUDS, safety behaviors, date), and an outcomes table (GAD-7/PDSS-SR/SPIN). Include print CSS.",
      "Create a code in HTML for an interoceptive exposure worksheet with drill menu (e.g., hyperventilation, head shaking), SUDS tracking, inhibitory learning notes.",
      "Create a code in HTML for a behavioral experiment form (prediction, experiment, outcome, learning) with space for video/audio practice notes."
    ],
    references: [
      { citation: "Hofmann, S. G., Asnaani, A., Vonk, I. J., Sawyer, A. T., & Fang, A. (2012). The efficacy of CBT: A review of meta-analyses. Cognitive Therapy and Research, 36, 427–440." },
      { citation: "Craske, M. G., Treanor, M., Conway, C. C., Zbozinek, T., & Vervliet, B. (2014). Maximizing exposure therapy with inhibitory learning. Behaviour Research and Therapy, 58, 10–23." },
      { citation: "NICE. (2020–2023). Anxiety disorders guidelines (CG113/CG159/NG215) — CBT and exposure recommendations." }
    ]
  },


  {
    id: "dbt-12week-rotation",
    title: "DBT Skills Group — 12-Week Rotation (Mindfulness/DT/ER/IE)",
    clinical_summary: [
      "Rotation outline across modules: Mindfulness (2 w), Distress Tolerance (3 w), Emotion Regulation (4 w), Interpersonal Effectiveness (3 w); repeat cycles for longer programs.",
      "Weekly flow: mindfulness practice; homework review; new skill; in-group practice; homework assign; diary card.",
      "Risk inclusion: weekly C-SSRS screen; coaching boundaries; escalation plan; address self-harm urges via skills and team consult.",
    ],
    indications: [ "Patients needing structured DBT skills acquisition with finite cycle." ],
    contraindications: [ "Same as module picker; ensure readiness for skills-only group if no individual DBT available." ],
    outcome_measures: [ "Diary card skill use, target behavior frequency, urges ratings, attendance." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>DBT Skills Group — 12-Week Rotation</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin-top:8px} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .muted{color:#555}
  @media print{header{border:0}}
</style></head><body>
<header><h1>DBT Skills Group — 12-Week Rotation</h1><div class="muted">Mindfulness • Distress Tolerance • Emotion Regulation • Interpersonal Effectiveness</div></header>
<main>
<section>
  <h2>Rotation Schedule</h2>
  <table>
    <thead><tr><th>Week</th><th>Module</th><th>Skills</th><th>Homework</th></tr></thead>
    <tbody>
      <tr><td>1–2</td><td>Mindfulness</td><td>Wise Mind; What/How skills</td><td>Daily practice log</td></tr>
      <tr><td>3–5</td><td>Distress Tolerance</td><td>TIPP; STOP; ACCEPTS; Pros & Cons</td><td>Crisis kit build</td></tr>
      <tr><td>6–9</td><td>Emotion Regulation</td><td>PLEASE; Opposite Action; Check the Facts</td><td>Values actions</td></tr>
      <tr><td>10–12</td><td>Interpersonal Effectiveness</td><td>DEAR MAN; GIVE; FAST</td><td>Role-play tasks</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Diary Card (Weekly)</h2>
  <table><thead><tr><th>Day</th><th>Urges (0–5)</th><th>Behaviors</th><th>Skills Used</th><th>Notes</th></tr></thead>
    <tbody><tr><td>Mon</td><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </section>
<section>
  <h2>Risk Screen (C-SSRS brief)</h2>
  <table><thead><tr><th>Item</th><th>Yes/No</th><th>Action</th></tr></thead>
    <tbody><tr><td>Any suicidal ideation past week?</td><td><input></td><td><input></td></tr>
           <tr><td>Any self-harm behavior?</td><td><input></td><td><input></td></tr></tbody></table>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable 12-week DBT rotation schedule with module-by-week table, a weekly diary card, and a brief C-SSRS risk screen section. Include print CSS.",
      "Create a code in HTML for a DBT homework packet: mindfulness log, crisis survival skills checklist, PLEASE tracking, and DEAR MAN script boxes.",
      "Create a code in HTML for a facilitators’ attendance + homework review sheet with notes and skill-coaching flags."
    ],
    references: [
      { citation: "Linehan, M. M. (2015). DBT Skills Training Manual (2nd ed.). Guilford." },
      { citation: "Neacsiu, A. D., Eberle, J. W., Kramer, R., Wiesmann, T., & Linehan, M. M. (2014). DBT skills for emotion dysregulation: a randomized clinical trial. Journal of Consulting and Clinical Psychology, 82(1), 130–140." },
      { citation: "National Institute for Health and Care Excellence. (2009/2024). Borderline personality disorder: recognition and management (CG78, updates)." }
    ]
  }
];
