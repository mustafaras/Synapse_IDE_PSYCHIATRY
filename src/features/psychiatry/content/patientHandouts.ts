

export type Reference = { citation: string };

export type HandoutItem = {
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

export const PATIENT_HANDOUTS: HandoutItem[] = [

  {
    id: "patient-handout-depression",
    title: "Patient Handout — Depression (Print-ready Handout)",
    clinical_summary: [
      "Major depressive disorder is a medical illness affecting mood, thinking, sleep, appetite, energy, and functioning within a biopsychosocial framework.",
      "Treatments: CBT/Behavioral Activation, antidepressants (SSRI/SNRI), combined therapy; set expectations (early change 2–4 weeks; full trial 6–8+ weeks).",
      "Measurement-Based Care: track PHQ-9 every visit; response ≈ ≥50% reduction; remission often ≤4–5.",
      "Relapse prevention: continue medication 6–12 months post-remission (longer if recurrent); maintain skills, sleep regularity, physical activity, and social activation.",
      "Safety: screen suicidality each contact; provide a safety plan/crisis contacts; consider bipolar screening prior to antidepressants where indicated."
    ],
    indications: [
      "New diagnosis or exacerbation of depression; family education; discharge or after-visit summary."
    ],
    contraindications: [
      "None to education; if acute risk, mania, or medical instability is suspected, prioritize urgent assessment."
    ],
    outcome_measures: [
      "PHQ-9 trajectory, functional status (WSAS), adherence and tolerability (FIBSER), follow-up attendance."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Depression — What to Know & What Helps (Print-ready)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  h1,h2{margin:.2rem 0 .6rem}
  ul{margin:0 0 10px 18px}
  .note{border:1px solid var(--b);padding:10px;border-radius:8px;background:#fafafa}
  .muted{color:var(--t);font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Depression — What to Know & What Helps</h1>
  <div class="muted">This handout supports — not replaces — care from your clinician.</div>
</header>
<main>
<section class="grid">
  <div>
    <h2>What is Depression?</h2>
    <ul><li>A medical condition that affects how you feel, think, sleep, eat, and function.</li>
        <li>It is common and treatable. It arises from biology, psychology, and life stress — not weakness.</li></ul>
  </div>
  <div>
    <h2>How Treatment Works</h2>
    <ul><li><b>Therapy:</b> CBT & Behavioral Activation teach skills to change patterns keeping depression going.</li>
        <li><b>Medicines:</b> SSRIs/SNRIs help mood/anxiety; benefits build over weeks.</li>
        <li>Often, therapy + medicine together works best.</li></ul>
  </div>
</section>
<section>
  <h2>Timeline & Monitoring</h2>
  <ul><li>Early change in 2–4 weeks; reassess at 6–8+ weeks.</li>
      <li>We track progress with the <b>PHQ-9</b> every visit.</li></ul>
</section>
<section class="grid">
  <div>
    <h2>Self-Care That Helps</h2>
    <ul><li>Regular sleep and wake times; daylight and activity daily.</li>
        <li>Plan pleasant/valued activities; limit alcohol/substances.</li>
        <li>Stay connected with supportive people.</li></ul>
  </div>
  <div>
    <h2>Medicines — What to Expect</h2>
    <ul><li>Common early effects: nausea, headache, sleep change — often fade in 1–2 weeks.</li>
        <li>Do not stop suddenly; call your clinician to adjust the dose.</li></ul>
  </div>
</section>
<section class="note">
  <h2>When to Call Urgently</h2>
  <ul><li>New/worsening thoughts of self-harm or suicide</li>
      <li>Severe agitation/restlessness, chest pain, or allergic reactions (rash/swelling)</li></ul>
  <p>Use your local emergency number. In the U.S., call or text <b>988</b>.</p>
</section>
<section>
  <h2>Your Notes</h2>
  <textarea style="width:100%;height:110px" placeholder="Personal goals, next visit date, questions"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready depression handout with sections: What is depression, How treatment works (therapy + medication), Timeline & monitoring (PHQ-9), Self-care, Medicines (what to expect), When to call urgently, and a notes area. Use plain language and print-friendly CSS.",
      "Create a code in HTML for a weekly depression action plan including PHQ-9 score boxes, activity scheduling grid, and relapse-prevention steps with checkboxes.",
      "Create a code in HTML for a bilingual (English/Turkish) depression handout with mirrored columns and shared print styles."
    ],
    references: [
      { citation: "NICE. (2022). Depression in adults: Treatment and management (NG222)." },
      { citation: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613." },
      { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with major depressive disorder (4th ed.)." }
    ]
  },


  {
    id: "sleep-hygiene-checklist",
    title: "Sleep Hygiene Checklist (Printable)",
    clinical_summary: [
      "Core CBT-I hygiene: consistent sleep/wake time, wind-down routine, bed for sleep/sex only, leave bed if unable to sleep, and morning light/activity.",
      "Environment: dark, quiet, cool; avoid screens ≥1h pre-bed; avoid heavy meals late.",
      "Substances: limit caffeine after early afternoon; avoid nicotine/alcohol near bedtime (alcohol fragments sleep).",
      "If insomnia persists, consider stimulus control and sleep restriction therapy; evaluate comorbidities (OSA, RLS, mood/anxiety)."
    ],
    indications: [ "Insomnia; sleep disturbance with depression/anxiety; medication changes affecting sleep." ],
    contraindications: [ "Untreated severe OSA or safety-sensitive jobs require tailored plans; avoid aggressive sleep restriction in bipolar disorder." ],
    outcome_measures: [ "Sleep diary (time in bed/asleep, awakenings), Sleep Efficiency (%), daytime function." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Sleep Hygiene Checklist (Printable)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse; table-layout: fixed}
  th,td{border:1px solid var(--b);padding:6px 8px;text-align:left; overflow:hidden; text-overflow:ellipsis}
  ul{margin:0 0 8px 18px}

  input:not([type="checkbox"]), textarea { width:100%; box-sizing:border-box }
  @media print{header{border:0}}
</style></head><body>
<header><h1>Sleep Hygiene Checklist</h1><div>Use with a 1–2 week sleep diary</div></header>
<main>
<section>
  <h2>Daily Habits</h2>
  <table>
    <thead><tr><th>Item</th><th>Done?</th><th>Notes</th></tr></thead>
    <tbody>
      <tr><td>Regular bedtime/waketime (±30 min)</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Wind-down routine 30–60 min</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Morning light & activity</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Bed only for sleep/sex (no TV/phone)</td><td><input type="checkbox"></td><td><input></td></tr>
    </tbody>
  </table>
  </section>
<section>
  <h2>Environment & Substances</h2>
  <ul>
    <li>Dark, quiet, cool room; minimize noise and light.</li>
    <li>No screens in the last hour; avoid caffeine after early afternoon.</li>
    <li>Avoid nicotine/alcohol near bedtime; no heavy meals late.</li>
  </ul>
</section>
<section>
  <h2>1-Week Sleep Diary</h2>
  <table>
    <thead><tr><th>Date</th><th>Bedtime</th><th>Wake time</th><th>Time asleep (h)</th><th>Awakenings</th><th>Sleep efficiency (%)</th></tr></thead>
    <tbody><tr><td><input type="date"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td><td><input type="text"></td></tr></tbody>
  </table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable sleep hygiene checklist with daily habits table, an environment/substances section, and a 1-week sleep diary including sleep efficiency. Include print CSS.",
      "Create a code in HTML for a simple CBT-I stimulus-control plan (go to bed when sleepy, leave bed if >20 min awake, fixed wake time) with a patient signature box.",
      "Create a code in HTML for a two-column handout contrasting helpful vs. unhelpful sleep habits with checkboxes and a weekly goal tracker."
    ],
    references: [
      { citation: "American Academy of Sleep Medicine. (2017). Clinical practice guideline for chronic insomnia." },
      { citation: "Qaseem, A., et al. (2016). Nonpharmacologic vs pharmacologic treatment of chronic insomnia. Ann Intern Med, 165(2), 125–133." },
      { citation: "Perlis, M. L., et al. (2005). Cognitive Behavioral Treatment of Insomnia. Springer." }
    ]
  },


  {
    id: "crisis-resources-card",
    title: "Crisis Resources Card (Wallet-size Layout Option)",
    clinical_summary: [
      "Compact, personalized resource card with local emergency numbers, crisis lines, clinic contacts, trusted supports, and brief safety steps (warning signs, coping, reasons for living, means safety).",
      "Avoid sensitive detail that risks privacy if lost; initials may be used for contacts.",
      "Base content on evidence-supported safety planning (e.g., Stanley–Brown) and update when risk changes."
    ],
    indications: [ "History of suicide risk, recurrent crises, severe mood/anxiety/PTSD; discharge planning." ],
    contraindications: [ "None; ensure consent for names/numbers on card." ],
    outcome_measures: [ "Card provided/updated, teach-back confirmed, usage reported during crises." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Crisis Resources Card — Wallet Size</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:#eee}
  .sheet{width:860px;margin:16px auto;display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .card{background:#fff;border:1px solid #ddd;border-radius:8px;padding:12px;height:260px}
  h2{margin:0 0 6px} label{font-size:12px;color:#555} input,textarea{width:100%;font-size:12px}
  .tiny{font-size:11px;color:#666} @media print{body{background:#fff}.sheet{gap:8px}}
</style></head><body>
<div class="sheet">
  <div class="card">
    <h2>Crisis Resources</h2>
    <label>Local Emergency (e.g., 911)</label><input>
    <label>Crisis Line (e.g., 988)</label><input>
    <label>Clinic (daytime)</label><input>
    <label>After-hours</label><input>
    <label>Trusted Support</label><input placeholder="Name / phone (initials ok)">
    <div class="tiny">If life-threatening emergency, call your local emergency number.</div>
  </div>
  <div class="card">
    <h2>Personal Safety Steps</h2>
    <label>Warning signs</label><textarea rows="2"></textarea>
    <label>Coping strategies</label><textarea rows="2"></textarea>
    <label>Reasons for living</label><textarea rows="2"></textarea>
    <label>Means safety plan</label><textarea rows="2"></textarea>
  </div>
</div>
</body></html>`,
    prompts: [
      "Create a code in HTML for a two-sided wallet-size crisis resources card with fields for local emergency number, crisis line, clinic daytime/after-hours, trusted support, and safety-plan back (warning signs, coping strategies, reasons for living, means safety). Print-optimized.",
      "Create a code in HTML for a full-page safety plan (Stanley-Brown style) with steps: warning signs, internal coping, social settings/people, family/friends for help, professionals/clinics, means safety, and reasons for living.",
      "Create a code in HTML for a crisis magnet (quarter-page) summarizing 3 coping steps and emergency contacts with large fonts for visibility."
    ],
    references: [
      { citation: "Stanley, B., & Brown, G. K. (2012). Safety Planning Intervention. Cognitive and Behavioral Practice, 19(2), 256–264." },
      { citation: "NICE. (2022). Self-harm: assessment, management and preventing recurrence (NG225)." },
      { citation: "Zero Suicide Institute. (current). Safety planning and lethal means safety resources." }
    ]
  },


  {
    id: "medication-start-generic",
    title: "Medication Start — Generic Info Sheet (SSRI/SNRI/Atypical)",
    clinical_summary: [
      "Plain-language overview of antidepressants: purpose, how/when to take, expected onset, common side effects and what to do, missed-dose rules, discontinuation symptoms, interactions (alcohol/OTC), and pregnancy/lactation considerations.",
      "Stress adherence and not stopping suddenly; include black-box warning for suicidality in young people where applicable; provide contact routes and teach-back.",
      "Reinforce early change in 2–4 weeks and full effect by 6–8+ weeks; advise against abrupt PRN changes without clinician input."
    ],
    indications: [ "Initiation or switch of SSRI/SNRI/atypical antidepressant; discharge/transition of care." ],
    contraindications: [ "Tailor for MAOIs, bipolar disorder, pregnancy/lactation, or complex comorbidity with specialist guidance." ],
    outcome_measures: [ "Adherence, FIBSER tolerability, patient questions answered, follow-up kept." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Medication Start — Antidepressant Information</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse; table-layout: fixed}
  th,td{border:1px solid var(--b);padding:6px 8px;text-align:left; overflow:hidden; text-overflow:ellipsis}
  .muted{color:var(--t);font-size:.9rem}
  input, textarea { width:100%; box-sizing:border-box }
  @media print{header{border:0}}
</style></head><body>
<header><h1>Medication Start — Antidepressant Information</h1>
<div class="muted">Use with your clinician’s advice. Do not stop suddenly.</div></header>
<main>
<section>
  <h2>Your Medication</h2>
  <table><thead><tr><th>Name</th><th>Dose & When</th><th>What it’s for</th><th>Start date</th></tr></thead>
  <tbody><tr><td><input></td><td><input placeholder="e.g., morning with food"></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>
<section>
  <h2>What to Expect</h2>
  <ul><li>Early change in 2–4 weeks; full benefit 6–8+ weeks.</li>
      <li>Common effects: nausea, headache, sleep/appetite change — usually lessen in 1–2 weeks.</li>
      <li>Call urgently for severe restlessness, chest pain, rash, or thoughts of self-harm.</li></ul>
</section>
<section>
  <h2>How to Take / Missed Dose</h2>
  <ul><li>Take at the same time daily. If you miss a dose, take when remembered unless close to the next dose.</li>
      <li>Do not stop suddenly; withdrawal symptoms can include flu-like feelings or irritability.</li></ul>
</section>
<section>
  <h2>Safety & Interactions</h2>
  <ul><li>Alcohol/OTC/herbal products may interact — check before use.</li>
      <li>Tell all clinicians/pharmacists you take this medicine.</li>
      <li>Pregnancy/breastfeeding: discuss risks/benefits and options.</li></ul>
</section>
<section>
  <h2>Questions & Contact</h2>
  <table><tbody><tr><td>Clinic daytime</td><td><input></td></tr>
                 <tr><td>After-hours</td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a patient-friendly antidepressant start sheet with sections for medication details, what to expect (timeline & side effects), how to take/missed dose, safety & interactions (including pregnancy/lactation note), and clinic contacts. Print-optimized.",
      "Create a code in HTML for a medication reconciliation + teach-back page: current meds table, discontinued meds with reasons, allergies/intolerances, patient questions, and a signature/acknowledgment area.",
      "Create a code in HTML for a one-page SSRI/SNRI comparison table (common agents, usual dose range, common side effects, counseling points) with patient-friendly language."
    ],
    references: [
      { citation: "NICE. (2022). Depression in adults: Treatment and management (NG222)." },
      { citation: "U.S. Food and Drug Administration. (current). Antidepressant use — boxed warning information." },
      { citation: "Institute for Safe Medication Practices (ISMP). (2019). Strategies to improve medication education and adherence." }
    ]
  }
];
