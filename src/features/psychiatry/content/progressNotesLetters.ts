

export type Reference = { citation: string };

export type PNItem = {
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

export const PROGRESS_NOTES_LETTERS: PNItem[] = [

  {
    id: "progress-apso-soap",
    title: "Progress Note — APSO / SOAP Toggle",
    clinical_summary: [
      "APSO (Assessment–Plan–Subjective–Objective) surfaces medical decision-making first; SOAP (Subjective–Objective–Assessment–Plan) remains widely accepted. Either structure must capture interval change, risk, and rationale for changes.",
      "Core elements: identifiers; interval history; MSE; MBC anchors (e.g., PHQ-9/GAD-7 trend); medication list with indications & side-effects; psychotherapy and behavioral targets; risk assessment (suicide/self-harm/violence).",
      "Plan must link to problems and monitoring tasks (labs/ECG/scales), document informed consent/shared decision-making, and specify follow-up interval with contingencies.",
      "Telehealth/time statements and collaborative care notes may be required by local policy; include only if applicable."
    ],
    indications: [
      "Any outpatient/telehealth psychiatry visit where concise, action-first documentation is preferred."
    ],
    contraindications: [
      "None to note style; if acute medical/psychiatric risk is identified, follow emergency pathway prior to closing."
    ],
    outcome_measures: [
      "MBC scores (PHQ-9/GAD-7), FIBSER for tolerability, WSAS/functional notes, risk status vs prior visit."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Progress Note — APSO / SOAP Toggle</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#666}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1100px;margin:0 auto}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  table{width:100%;border-collapse:collapse;margin-top:8px}
  th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .row{display:flex;gap:12px;align-items:center}
  .muted{color:var(--t);font-size:.9rem}
  .toggle{margin:8px 0}
  @media print{header{border:0}.toggle{display:none}}
</style>
<script>
  function switchMode(val){document.body.dataset.mode=val;}
</script></head><body>
<header>
  <h1>Progress Note — APSO / SOAP Toggle</h1>
  <div class="toggle">View as:
    <label><input type="radio" name="mode" checked onchange="switchMode('APSO')"> APSO</label>
    <label><input type="radio" name="mode" onchange="switchMode('SOAP')"> SOAP</label>
  </div>
  <div class="muted">Risk-inclusive • MBC-aware • Printable</div>
</header>
<main>
  <section class="grid" aria-label="Identifiers">
    <div>
      <h2>Patient</h2>
      <label>Name</label><br><input style="width:100%">
      <label>DOB / MRN</label><br><input style="width:100%">
    </div>
    <div>
      <h2>Visit</h2>
      <label>Date</label><br><input type="date" style="width:100%">
      <label>Interval since last</label><br><input style="width:100%">
      <label>Visit type</label><br><input placeholder="in-person / telehealth" style="width:100%">
    </div>
  </section>

  <section aria-label="Assessment & Plan">
    <h2>Assessment & Plan</h2>
    <textarea style="width:100%;height:120px" placeholder="Dx/status; response/remission; problem-linked plan; rationale; patient preferences"></textarea>
    <table>
      <thead><tr><th>Problem</th><th>Change</th><th>Rationale</th><th>Monitoring/Follow-up</th></tr></thead>
      <tbody>
        <tr><td><input placeholder="MDD"></td><td><input></td><td><input></td><td><input></td></tr>
        <tr><td><input placeholder="GAD"></td><td><input></td><td><input></td><td><input></td></tr>
      </tbody>
    </table>
  </section>

  <section class="grid" aria-label="SO-blocks">
    <div>
      <h2 data-so="S">Subjective</h2>
      <textarea style="width:100%;height:110px" placeholder="Interval change; adherence; SEs; function; goals"></textarea>
    </div>
    <div>
      <h2 data-so="O">Objective / MSE</h2>
      <textarea style="width:100%;height:110px" placeholder="Appearance/behavior; speech; mood/affect; TP/TC; perception; cognition; insight/judgment"></textarea>
    </div>
  </section>

  <section aria-label="Risk & MBC">
    <h2>Risk & MBC Snapshot</h2>
    <table>
      <thead><tr><th>Domain</th><th>Current</th><th>Plan</th></tr></thead>
      <tbody>
        <tr><td>Suicidal/self-harm/violence</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
        <tr><td>MBC scores (PHQ-9/GAD-7)</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
      </tbody>
    </table>
    <div class="muted">If risk present, complete safety plan and adjust level of care before closing.</div>
  </section>

  <section class="grid" aria-label="Medications & Time">
    <div>
      <h2>Medications</h2>
      <table><thead><tr><th>Drug</th><th>Dose</th><th>Indication</th><th>SE/Mitigation</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
    </div>
    <div>
      <h2>Attestations</h2>
      <label><input type="checkbox"> Shared decision-making & informed consent documented</label><br>
      <label><input type="checkbox"> Telehealth statement (if applicable)</label><br>
      <label>Time (min)</label><br><input style="width:100%" placeholder="optional, per policy">
    </div>
  </section>
</main>
</body></html>`,
    prompts: [
      "Create a code in HTML as a printable progress note with an APSO/SOAP toggle, sections for identifiers, Assessment & Plan (problem-linked change/rationale/monitoring table), Subjective, Objective/MSE, a risk & MBC snapshot, medications with indications, and attestations (consent/time). Use semantic HTML, accessible labels, and simple print CSS.",
      "Create a code in HTML for a compact SOAP note form with problem-oriented plan and a medication change log (old → new, reason, monitoring).",
      "Create a code in HTML for a telehealth addendum block including patient location, consent, limitations, and time statement that can be appended to a progress note."
    ],
    references: [
      { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with major depressive disorder (4th ed.)." },
      { citation: "Fortney, J. C., Unützer, J., & Wrenn, G. (2017). A tipping point for measurement-based care. Psychiatric Services, 68(2), 179–188." },
      { citation: "The Joint Commission. (2022). Documentation and patient safety requirements for behavioral health." }
    ]
  },


  {
    id: "referral-letter",
    title: "Referral Letter — Specialist / Service",
    clinical_summary: [
      "State the referral question(s), urgency, and safety concerns clearly; give a concise, problem-oriented history and treatment course with outcomes/SEs.",
      "Attach current medication list with indications, relevant labs/ECG, and MBC summaries; document ROI/consent and preferred communication channel.",
      "Close the loop by requesting acknowledgement and specifying follow-up responsibilities."
    ],
    indications: [ "Referral to psychotherapy subspecialty, psychiatry subspecialty, medical specialty, or community service." ],
    contraindications: [ "None; if risk is imminent, activate emergency pathway rather than routine referral." ],
    outcome_measures: [ "Referral accepted, time to appointment, question answered, loop closed." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Referral Letter — Specialist / Service</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Referral Letter — Specialist / Service</h1><div class="muted">Targeted questions • ROI on file • Close the loop</div></header>
<main>
<section>
  <h2>Recipient & Urgency</h2>
  <table><tbody>
    <tr><td>Specialist/Service</td><td><input style="width:100%"></td></tr>
    <tr><td>Contact</td><td><input style="width:100%"></td></tr>
    <tr><td>Urgency</td><td><input placeholder="routine / expedited / urgent"></td></tr>
  </tbody></table>
</section>
<section>
  <h2>Referral Question(s)</h2>
  <textarea style="width:100%;height:90px" placeholder="e.g., diagnostic clarification; ECT evaluation; ERP; perinatal psych consult"></textarea>
</section>
<section>
  <h2>Concise Clinical Summary</h2>
  <textarea style="width:100%;height:130px" placeholder="Onset & course; prior treatments & outcomes; risk considerations; psychosocial context"></textarea>
</section>
<section>
  <h2>Current Medications</h2>
  <table><thead><tr><th>Drug</th><th>Dose</th><th>Indication</th><th>Start</th></tr></thead>
  <tbody><tr><td><input></td><td><input></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>
<section>
  <h2>Relevant Tests & MBC</h2>
  <table><thead><tr><th>Test/Scale</th><th>Date</th><th>Result/Score</th><th>Comment</th></tr></thead>
  <tbody><tr><td><input placeholder="ECG, TSH, PHQ-9"></td><td><input type="date"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Consent / ROI</h2>
  <table><tbody><tr><td>ROI on file?</td><td><input type="checkbox"></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable referral letter with recipient & urgency, referral questions, concise clinical summary, a medications table with indications, a relevant tests/MBC table, and an ROI/consent block. Include print CSS.",
      "Create a code in HTML for a shared-care request letter that enumerates monitoring responsibilities (labs/ECG/scales), contact routes, and acknowledgement fields."
    ],
    references: [
      { citation: "NICE. (2022). Shared care protocols and referral guidance across primary–secondary care." },
      { citation: "Royal College of Psychiatrists & RCGP. (2019). Effective referral and communication standards." },
      { citation: "The Joint Commission. (2019). Transitions of care communication requirements." }
    ]
  },


  {
    id: "accommodation-letter",
    title: "Work/School Accommodation Letter — Generic",
    clinical_summary: [
      "Focus on functional limitations (with consent), requested accommodations, expected duration/review date, and safety considerations; avoid unnecessary diagnosis details.",
      "Common accommodations: flexible start times, temporary workload adjustments, quiet workspace, remote options, exam/time extensions, protected therapy time.",
      "Reference applicable frameworks (e.g., ADA; school disability policy) and specify that patient remains under active care with planned re-evaluation."
    ],
    indications: [ "Patients needing practical supports to perform essential tasks or academic requirements." ],
    contraindications: [ "Do not certify beyond scope or disclose diagnoses without explicit consent." ],
    outcome_measures: [ "Accommodation implemented; function and attendance improvement; scheduled review completed." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Work/School Accommodation Letter — Generic</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Work/School Accommodation Letter — Generic</h1></header>
<main>
<section>
  <h2>Recipient & Context</h2>
  <table><tbody>
    <tr><td>Organization/School</td><td><input style="width:100%"></td></tr>
    <tr><td>Role/Setting</td><td><input style="width:100%"></td></tr>
  </tbody></table>
</section>
<section>
  <h2>Functional Limitations (consented)</h2>
  <textarea style="width:100%;height:100px" placeholder="e.g., concentration fatigue, sleep–wake dysregulation, panic episodes"></textarea>
</section>
<section>
  <h2>Requested Accommodations</h2>
  <table><thead><tr><th>Accommodation</th><th>Rationale</th><th>Duration/Review</th></tr></thead>
  <tbody><tr><td><input placeholder="flexible start times"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Safety Statement & Follow-up</h2>
  <textarea style="width:100%;height:80px" placeholder="Fit for role with above accommodations / restrictions if any; review on [date]"></textarea>
</section>
<section>
  <h2>Clinician Signature</h2>
  <table><tbody><tr><td>Name/Discipline</td><td><input></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for an accommodation letter capturing functional limitations (with consent), requested accommodations with rationale and duration, a safety statement, and a clinician signature block. Include print CSS.",
      "Create a code in HTML for a student accommodations checklist (exam extensions, reduced course load, remote attendance, quiet room) with justification and review date fields."
    ],
    references: [
      { citation: "U.S. Equal Employment Opportunity Commission. (2023). The ADA: Guidance on reasonable accommodations for mental health conditions." },
      { citation: "Job Accommodation Network (JAN). (current). Accommodation ideas for mental health impairments." }
    ]
  },


  {
    id: "fitness-for-duty",
    title: "Fitness for Duty/Study — Clinical Outline",
    clinical_summary: [
      "Provide scope-limited, objective assessment of capacity to perform essential functions safely; separate from treatment notes; obtain explicit consent and clarify evaluator role.",
      "Elements: data sources; pertinent MSE/observations; mapping of capacities to essential duties; risk assessment to self/others; determination (fit / fit with restrictions / temporarily unfit) with duration and review.",
      "Avoid unnecessary diagnostic detail; focus on observable functioning and safety, aligned with occupational/academic standards."
    ],
    indications: [ "Return-to-work/study requests, safety-sensitive roles, post-leave evaluations." ],
    contraindications: [ "Conflict of interest; lack of consent/authority; acute instability needing treatment first." ],
    outcome_measures: [ "Clear determination, documented restrictions/plan, acceptance by employer/school." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Fitness for Duty/Study — Clinical Outline</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Fitness for Duty/Study — Clinical Outline</h1></header>
<main>
<section>
  <h2>Scope & Consent</h2>
  <textarea style="width:100%;height:90px" placeholder="Purpose, authority, consent obtained, evaluator role boundaries"></textarea>
</section>
<section>
  <h2>Essential Functions</h2>
  <table><thead><tr><th>Function</th><th>Requirements</th><th>Observed Capacity</th></tr></thead>
  <tbody><tr><td><input placeholder="attention, decision-making"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Pertinent Findings (incl. MSE)</h2>
  <textarea style="width:100%;height:120px" placeholder="Objective observations pertinent to duties/safety"></textarea>
</section>
<section>
  <h2>Risk Assessment</h2>
  <textarea style="width:100%;height:90px" placeholder="To self/others; triggers; mitigations; escalation plan"></textarea>
</section>
<section>
  <h2>Determination</h2>
  <table><thead><tr><th>Status</th><th>Restrictions</th><th>Duration/Review</th></tr></thead>
  <tbody><tr><td><input placeholder="fit / fit with restrictions / temporarily unfit"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML for a fitness-for-duty/study outline with sections for scope/consent, essential functions mapping, pertinent findings (incl. MSE), risk assessment, and a determination table (status/restrictions/duration). Include print CSS.",
      "Create a code in HTML for a return-to-work clearance form with duty restrictions (hours, tasks, environment), review date, and employer contact fields."
    ],
    references: [
      { citation: "American College of Occupational and Environmental Medicine (ACOEM). (2019). Practice guidelines for occupational evaluations." },
      { citation: "American Psychiatric Association. (2015). Resource document on evaluations for occupational functioning and fitness for duty." }
    ]
  },


  {
    id: "medication-summary-patient",
    title: "Medication Summary & Instructions (Patient-facing)",
    clinical_summary: [
      "Use plain-language, teach-back style; list purpose, how/when to take, common side-effects with self-management tips, missed-dose rules, serious warning signs, and contact routes.",
      "Provide an updated medication list with start dates and indications; reconcile changes and document allergies/intolerances.",
      "Add cultural/linguistic considerations and readability; offer translations where available."
    ],
    indications: [ "Initiation or change of medications; discharge; transitions of care." ],
    contraindications: [ "None; ensure accuracy and patient comprehension." ],
    outcome_measures: [ "Adherence, reduced errors/calls, teach-back documented." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Medication Summary & Instructions (Patient-facing)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Medication Summary & Instructions</h1><div class="muted">Bring this to all appointments • Update when changes occur</div></header>
<main>
<section>
  <h2>Your Medications</h2>
  <table><thead><tr><th>Name</th><th>Dose & Timing</th><th>What it’s for</th><th>Start date</th></tr></thead>
  <tbody><tr><td><input></td><td><input></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>
<section>
  <h2>How to Take & Missed Doses</h2>
  <ul>
    <li>Take exactly as prescribed. Do not stop suddenly without talking to your clinician.</li>
    <li>Missed dose: <input style="width:60%" placeholder="e.g., take when remembered unless close to next dose"></li>
  </ul>
</section>
<section>
  <h2>Side Effects — What to Do</h2>
  <table><thead><tr><th>Possible effect</th><th>Self-management tips</th><th>When to call urgently</th></tr></thead>
  <tbody><tr><td><input placeholder="nausea, headache, sleep changes"></td><td><input placeholder="take with food; adjust timing"></td><td><input placeholder="severe rash; chest pain; thoughts of self-harm"></td></tr></tbody></table>
</section>
<section>
  <h2>Safety & Interactions</h2>
  <ul>
    <li>Alcohol/OTC/herbal products can interact — check before use.</li>
    <li>Keep an updated list and show to all clinicians and pharmacists.</li>
  </ul>
</section>
<section>
  <h2>Contacts</h2>
  <table><tbody><tr><td>Clinic daytime</td><td><input></td></tr><tr><td>After-hours</td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a patient-facing medication summary that includes a medication list table, missed-dose rules, side-effects with actions, safety/interaction notes, and clinic contact information. Use plain language and print CSS.",
      "Create a code in HTML for a medication reconciliation form listing current meds, discontinued meds with reasons, allergies/intolerances, and a patient acknowledgement signature."
    ],
    references: [
      { citation: "Institute for Safe Medication Practices (ISMP). (2019). Strategies to improve medication education and adherence." },
      { citation: "AHRQ. (2020). Medication reconciliation and patient education during transitions of care." },
      { citation: "National Quality Forum. (2016). Best practices for patient medication lists." }
    ]
  },


  {
    id: "discharge-transfer-summary",
    title: "Discharge / Transfer Summary (Continuity of Care)",
    clinical_summary: [
      "Include problems/diagnoses, course & key results, final medication list with reasons for changes, follow-up appointments and responsible owners, pending items, and an explicit risk/safety plan.",
      "Send to receiving clinician and provide patient version; document teach-back and contact routes for questions.",
      "Timeliness and completeness reduce readmissions and adverse events; align with local transition standards."
    ],
    indications: [ "Any transfer of care or discharge from a program/setting." ],
    contraindications: [ "None; ensure privacy compliance and timely transmission." ],
    outcome_measures: [ "Timely receipt by next clinician, follow-up attendance, med reconciliation accuracy, adverse events." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Discharge / Transfer Summary (Continuity of Care)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Discharge / Transfer Summary</h1></header>
<main>
<section class="grid">
  <div>
    <h2>Patient</h2>
    <label>Name</label><br><input style="width:100%">
    <label>DOB / MRN</label><br><input style="width:100%">
  </div>
  <div>
    <h2>Episode Dates</h2>
    <label>Admission</label><br><input type="date" style="width:100%">
    <label>Discharge</label><br><input type="date" style="width:100%">
  </div>
</section>
<section>
  <h2>Problems & Diagnoses</h2>
  <table><thead><tr><th>Problem</th><th>ICD/DSM</th><th>Status</th></tr></thead>
  <tbody><tr><td><input></td><td><input></td><td><input placeholder="active/resolved"></td></tr></tbody></table>
</section>
<section>
  <h2>Course & Key Results</h2>
  <textarea style="width:100%;height:120px" placeholder="Treatments, response, complications, key labs/ECG/imaging"></textarea>
</section>
<section>
  <h2>Medication Reconciliation</h2>
  <table><thead><tr><th>Medication</th><th>Dose</th><th>Status</th><th>Reason for change</th></tr></thead>
  <tbody><tr><td><input></td><td><input></td><td><input placeholder="continue / stop / change"></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Follow-up & Pending</h2>
  <table><thead><tr><th>Appointment</th><th>Date/Time</th><th>Location/Contact</th><th>Owner</th></tr></thead>
  <tbody><tr><td><input></td><td><input type="datetime-local"></td><td><input></td><td><input></td></tr></tbody></table>
  <label>Pending results/tasks</label><br><textarea style="width:100%;height:80px"></textarea>
</section>
<section>
  <h2>Risk/Safety Plan & Patient Education</h2>
  <textarea style="width:100%;height:100px" placeholder="Warning signs, crisis contacts, means safety, medication safety; teach-back documented"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a discharge/transfer summary including problems/diagnoses, course & key results, medication reconciliation with reasons for changes, follow-up/pending items with responsible owners, and a risk/safety plan. Use print CSS.",
      "Create a code in HTML for a one-page continuity-of-care handoff summarizing current meds, allergies, active problems, last key lab dates, and next steps with contact information."
    ],
    references: [
      { citation: "Agency for Healthcare Research and Quality (AHRQ). (2019). Care transitions: Improving continuity and reducing readmissions." },
      { citation: "The Joint Commission. (2021). Transitions of care: Standards and best practices." },
      { citation: "Society of Hospital Medicine. (2015). Project BOOST discharge summary checklist (adapted for psychiatry)." }
    ]
  }
];
