

export type Reference = { citation: string };

export type CaseLetterItem = {
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

export const CASE_FORMS_LETTERS: CaseLetterItem[] = [

  {
    id: "benefits-functional-impact",
    title: "Benefits/Disability Support Letter — Functional Impact Summary",
    clinical_summary: [
      "Focus on functional limitations (attention, memory, pace, persistence, social interaction, stress tolerance, sleep, mobility) rather than extensive diagnosis detail; use patient consented scope.",
      "Describe stability/course, expected duration, and evidence-based treatments tried/ongoing (psychotherapy, pharmacotherapy, rehabilitation).",
      "Anchor with measurement-based care (e.g., PHQ-9/GAD-7, WHO-DAS, WSAS). Document reliability of attendance and exacerbating factors (shift work, sensory load).",
      "Request reasonable supports (flexible schedule, reduced distractions, task chunking, additional supervision) and review dates; avoid prescribing specific HR actions."
    ],
    indications: [
      "Benefits/disability applications; housing/financial supports; vocational rehabilitation documentation."
    ],
    contraindications: [
      "No letter without explicit patient consent or if content could increase risk (e.g., legal proceedings) without risk/legal review."
    ],
    outcome_measures: [
      "Attach/quote recent scores: PHQ-9/GAD-7, WSAS/WHO-DAS; attendance; med adherence/tolerability; functional examples."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Benefits/Disability Support Letter — Functional Impact Summary</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:900px;margin:0 auto}
  .box{border:1px solid var(--b);border-radius:8px;padding:12px;background:#fafafa;margin-bottom:10px}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .muted{color:var(--t);font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Benefits/Disability Support — Functional Impact Summary</h1>
  <div class="muted">Provided with the patient's consent; for functional consideration only.</div>
</header>
<main>
<section class="box">
  <h2>Identifiers</h2>
  <table><tbody>
    <tr><td>Patient</td><td><input style="width:100%"></td><td>DOB/ID</td><td><input style="width:100%"></td></tr>
    <tr><td>Date</td><td><input type="date"></td><td>Clinician</td><td><input></td></tr>
  </tbody></table>
 </section>
<section>
  <h2>Clinical Summary (concise)</h2>
  <textarea style="width:100%;height:110px" placeholder="Condition overview; course; current treatment & response; risk considerations if relevant"></textarea>
 </section>
<section>
  <h2>Functional Impact (check/describe)</h2>
  <table>
    <thead><tr><th>Domain</th><th>Severity</th><th>Examples</th></tr></thead>
    <tbody>
      <tr><td>Attention & Concentration</td><td><input placeholder="mild/moderate/severe"></td><td><input placeholder="e.g., loses track with multi-step tasks"></td></tr>
      <tr><td>Processing Speed</td><td><input></td><td><input></td></tr>
      <tr><td>Memory (working/prospective)</td><td><input></td><td><input></td></tr>
      <tr><td>Social Interaction/Stress Tolerance</td><td><input></td><td><input></td></tr>
      <tr><td>Sleep/Fatigue</td><td><input></td><td><input></td></tr>
    </tbody>
  </table>
 </section>
<section>
  <h2>Measurement-Based Care</h2>
  <table><thead><tr><th>Instrument</th><th>Score</th><th>Date</th></tr></thead>
    <tbody><tr><td>PHQ-9 / GAD-7 / WHO-DAS / WSAS</td><td><input></td><td><input type="date"></td></tr></tbody></table>
 </section>
<section class="box">
  <h2>Recommended Supports</h2>
  <ul>
    <li>Flexible schedule or reduced hours during flare-ups</li>
    <li>Quiet workspace / noise reduction / task chunking</li>
    <li>Additional supervision/clear written instructions</li>
  </ul>
 </section>
<section>
  <h2>Review</h2>
  <table><tbody><tr><td>Suggested review date</td><td><input type="date" style="width:100%"></td></tr></tbody></table>
 </section>
<section>
  <h2>Clinician Attestation</h2>
  <p>I confirm the above information is accurate to the best of my knowledge and shared with the patient’s consent.</p>
  <table><tbody><tr><td>Signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready disability/benefits support letter emphasizing functional impact with sections: identifiers, concise clinical summary, functional domain table (severity and examples), measurement-based care scores (PHQ-9/GAD-7/WHO-DAS/WSAS), recommended supports, review date, and clinician attestation. Include print CSS.",
      "Create a code in HTML for a WHO-DAS/WSAS score summary widget that can be attached to any letter.",
      "Create a code in HTML for a functional capacity checklist (attention, pace, persistence, social interaction, stress tolerance) with observable examples."
    ],
    references: [
      { citation: "World Health Organization. (2010/2020). WHO Disability Assessment Schedule (WHODAS 2.0) manual." },
      { citation: "Mundt, J. C., Marks, I. M., Shear, M. K., & Greist, J. M. (2002). The Work and Social Adjustment Scale (WSAS). The British Journal of Psychiatry, 180(5), 461–464." },
      { citation: "Job Accommodation Network. (current). Accommodation ideas for mental health impairments." }
    ]
  },


  {
    id: "travel-letter-general",
    title: "Travel Letter — Medication & Contact Information",
    clinical_summary: [
      "Summarize condition stability, current medications (generic names), and clinician contact for verification; advise carrying medicines in original labeled containers with a copy of prescriptions.",
      "Include time-zone dosing advice (e.g., SSRIs once daily can slide 1–2 h/day), storage (temperature, lithium hydration), and list devices/consumables (syringes/needles if applicable).",
      "Direct travelers to official travel health advice (vaccinations, insurance, emergency numbers); advise carrying an extra supply and a medication list separate from luggage.",
    ],
    indications: [ "Patients traveling domestically/internationally needing proof of medication and provider contact." ],
    contraindications: [ "Do not disclose sensitive diagnoses without consent; consider separate privacy-safe version for non-medical gatekeepers." ],
    outcome_measures: [ "Successful border/airline passage; no missed doses; patient understanding of dosing/time-zone plan." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Travel Letter — Medication & Contact Information</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Travel Letter — Medication & Contact Information</h1>
</header>
<main>
<section>
  <h2>Patient & Clinician</h2>
  <table><tbody>
    <tr><td>Patient</td><td><input style="width:100%"></td><td>DOB/Passport</td><td><input></td></tr>
    <tr><td>Clinician</td><td><input></td><td>Contact</td><td><input placeholder="phone/email"></td></tr>
  </tbody></table>
 </section>
<section>
  <h2>Condition (brief) & Fitness to Travel</h2>
  <textarea style="width:100%;height:90px" placeholder="Stable; no contraindication to routine travel; emergency plan if needed"></textarea>
 </section>
<section>
  <h2>Current Medications (generic names preferred)</h2>
  <table><thead><tr><th>Name</th><th>Form/Strength</th><th>Dose</th><th>Timing/Notes</th></tr></thead>
    <tbody><tr><td><input placeholder="e.g., sertraline"></td><td><input></td><td><input></td><td><input placeholder="take with food; once daily"></td></tr></tbody></table>
 </section>
<section>
  <h2>Devices/Consumables</h2>
  <table><thead><tr><th>Item</th><th>Reason</th><th>Notes</th></tr></thead>
    <tbody><tr><td><input placeholder="syringes"></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
<section>
  <h2>Time-Zone Plan & Storage</h2>
  <textarea style="width:100%;height:90px" placeholder="Shift dose by 1–2 hours/day until local time; keep in carry-on; avoid extreme heat; stay hydrated if on lithium"></textarea>
 </section>
<section>
  <h2>Clinician Statement</h2>
  <p>I confirm the above medications are prescribed and medically necessary for this patient. Please allow carriage on board and through security/border checkpoints.</p>
  <table><tbody><tr><td>Signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a travel letter listing patient identifiers, clinician contact, concise fitness-to-travel statement, medications (generic names), devices/consumables, time-zone dosing/storage plan, and a clinician attestation with signature. Print CSS required.",
      "Create a code in HTML for a pocket medication list (wallet card) with generic names, doses, and emergency contact.",
      "Create a code in HTML for a time-zone dosing calculator table for once-daily and twice-daily medicines with shift schedule."
    ],
    references: [
      { citation: "World Health Organization. (2022). International Travel and Health." },
      { citation: "Centers for Disease Control and Prevention. (2024). CDC Yellow Book: Health Information for International Travel." },
      { citation: "International Air Transport Association (IATA). (current). Guidance on carriage of medicines, sharps, and medical equipment by passengers." }
    ]
  },


  {
    id: "reintegration-graduated-return",
    title: "School/Work Reintegration Plan — Graduated Return",
    clinical_summary: [
      "Plan phased return after illness/hospitalization/exacerbation; specify start date, staged hours/duties, breaks, supervision, and accommodations with review cadence.",
      "Use SMART goals tied to function (attendance, work completion, social/communication demands) and track with MBC instruments.",
      "Include relapse prevention and contact pathway if distress escalates; coordinate with employer/school leads."
    ],
    indications: [ "Students/workers resuming roles after acute episode or extended leave." ],
    contraindications: [ "Unsafe environment or patient not clinically ready; escalate to occupational health or higher level of care." ],
    outcome_measures: [ "Attendance %, work output, PHQ-9/GAD-7 change, supervisor/teacher check-ins met." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>School/Work Reintegration Plan — Graduated Return</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>School/Work Reintegration Plan — Graduated Return</h1></header>
<main>
<section>
  <h2>Parties</h2>
  <table><tbody>
    <tr><td>Individual</td><td><input style="width:100%"></td><td>Role/Grade</td><td><input></td></tr>
    <tr><td>Supervisor/School Contact</td><td><input></td><td>Clinician</td><td><input></td></tr>
  </tbody></table>
 </section>
<section>
  <h2>Schedule Progression</h2>
  <table>
    <thead><tr><th>Week</th><th>Hours</th><th>Duties/Tasks</th><th>Breaks</th><th>Check-in</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><input placeholder="e.g., 50%"></td><td><input></td><td><input></td><td><input placeholder="2×/week"></td></tr>
      <tr><td>2</td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
      <tr><td>3</td><td><input></td><td><input></td><td><input></td><td><input></td></tr>
    </tbody>
  </table>
 </section>
<section>
  <h2>Accommodations</h2>
  <table><thead><tr><th>Accommodation</th><th>Rationale</th><th>Owner</th></tr></thead>
    <tbody><tr><td><input placeholder="reduced noise workspace"></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
<section>
  <h2>Monitoring & Review</h2>
  <table><thead><tr><th>Measure</th><th>Baseline</th><th>Review date</th></tr></thead>
    <tbody><tr><td>PHQ-9/GAD-7/attendance</td><td><input></td><td><input type="date"></td></tr></tbody></table>
 </section>
<section>
  <h2>Escalation/Crisis</h2>
  <p>If significant deterioration or safety concerns arise: contact <input style="width:40%">; for emergencies, use local emergency number (e.g., 988 in the U.S.).</p>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready graduated return plan with parties table, week-by-week schedule progression, accommodations with rationale, monitoring measures and review dates, and escalation instructions. Include print CSS.",
      "Create a code in HTML for a supervisor/teacher check-in form aligned to the plan (attendance, workload, supports, concerns).",
      "Create a code in HTML for a values-aligned goal tracker that converts plan goals into weekly SMART tasks."
    ],
    references: [
      { citation: "OECD. (2021). Fitter Minds, Fitter Jobs: From Awareness to Change in Integrated Mental Health, Skills and Work Policies." },
      { citation: "National Institute for Health and Care Excellence. (2022). Depression in adults: treatment and management (return-to-work planning elements in NG222)." },
      { citation: "Royal College of Psychiatrists. (2018). Mental health and work: The evidence base and guidance for clinicians." }
    ]
  },


  {
    id: "minimal-disclosure-letter",
    title: "Minimal-Disclosure Supporting Letter (Benefits/Accommodations)",
    clinical_summary: [
      "Privacy-first template: confirm a health condition exists, affects function, and requires specific accommodations; omit diagnosis unless consented/necessary.",
      "Reference relevant legal framework generically (reasonable adjustments) without legal advice; specify review date and contact channel for verification.",
      "Avoid stigmatizing phrasing; use observable functional language and consented scope only."
    ],
    indications: [ "When third parties request confirmation but diagnosis disclosure is not required (housing, exams, workplace, travel assistance)." ],
    contraindications: [ "Active risk/legal complexity—seek legal/risk advice; do not misstate capacity or safety." ],
    outcome_measures: [ "Accommodations implemented; no privacy breaches; timely review." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Minimal-Disclosure Supporting Letter</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:900px;margin:0 auto}
  .muted{color:var(--t);font-size:.9rem}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Minimal-Disclosure Supporting Letter</h1><div class="muted">Shared with patient’s consent; diagnosis not disclosed unless necessary.</div></header>
<main>
<section>
  <h2>To Whom It May Concern</h2>
  <p>This letter confirms that <input style="width:50%" placeholder="patient name"> has a health condition that substantially impacts the following functional domains:</p>
  <ul>
    <li><input style="width:80%" placeholder="e.g., concentration and pace in high-noise settings"></li>
    <li><input style="width:80%" placeholder="e.g., early morning attendance due to medication effects"></li>
  </ul>
 </section>
<section>
  <h2>Requested Adjustments</h2>
  <table><thead><tr><th>Adjustment</th><th>Functional Rationale</th><th>Duration/Review</th></tr></thead>
    <tbody><tr><td><input placeholder="quiet testing room"></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
<section>
  <h2>Verification</h2>
  <p>For verification within the consented scope, contact: <input style="width:60%" placeholder="clinic phone/email">. Suggested review date: <input type="date"></p>
  <p>Sincerely,</p>
  <table><tbody><tr><td>Clinician</td><td><input style="width:100%"></td><td>Signature/Date</td><td><input style="width:100%"></td></tr></tbody></table>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a minimal-disclosure letter confirming functional impact and listing specific adjustments with rationales and a review date, without disclosing diagnosis. Include verification contact and print CSS.",
      "Create a code in HTML for a two-version generator (public vs confidential) where diagnosis appears only on the confidential print.",
      "Create a code in HTML for an accommodation outcome tracker (requested vs implemented vs effective)."
    ],
    references: [
      { citation: "U.S. Equal Employment Opportunity Commission. (current). Enforcement guidance on reasonable accommodation and undue hardship under the ADA." },
      { citation: "UK Equality and Human Rights Commission. (2020). Reasonable adjustments for disabled workers and students." },
      { citation: "Substance Abuse and Mental Health Services Administration. (2023). 42 CFR Part 2—Confidentiality of SUD patient records." }
    ]
  },


  {
    id: "fitness-study-work",
    title: "Fitness for Study/Work & Graded Return Plan",
    clinical_summary: [
      "Clinician opinion on current capacity and restrictions; tie capacity to observed function and objective measures; provide graded plan if partial capacity.",
      "Clarify safety-sensitive tasks (driving, operating machinery, hazardous work) and medication effects (sedation, reaction time) where relevant.",
      "Set review interval and conditions for re-evaluation (flare, medication change)."
    ],
    indications: [ "Employer/school requests confirmation of fitness to resume with or without restrictions." ],
    contraindications: [ "Insufficient information or unstable clinical status—defer and schedule reassessment." ],
    outcome_measures: [ "Attendance, output metrics, symptom scales, adverse effects logs; supervisor/teacher feedback." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Fitness for Study/Work & Graded Return Plan</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Fitness for Study/Work & Graded Return Plan</h1></header>
<main>
<section>
  <h2>Clinical Status (brief)</h2>
  <textarea style="width:100%;height:90px" placeholder="Stable/partial remission; monitoring plan; medications & effects"></textarea>
 </section>
<section>
  <h2>Capacity & Restrictions</h2>
  <table><thead><tr><th>Domain/Task</th><th>Fit? (Y/N)</th><th>Restriction</th><th>Rationale</th></tr></thead>
    <tbody><tr><td>Safety-sensitive tasks</td><td><input></td><td><input placeholder="no driving after sedating meds"></td><td><input></td></tr></tbody></table>
 </section>
<section>
  <h2>Graded Return (if applicable)</h2>
  <table><thead><tr><th>Week</th><th>Hours</th><th>Tasks</th><th>Supervision</th></tr></thead>
    <tbody><tr><td>1</td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
<section>
  <h2>Review & Follow-up</h2>
  <table><tbody><tr><td>Review date</td><td><input type="date"></td><td>Measures</td><td><input placeholder="PHQ-9/GAD-7/attendance"></td></tr></tbody></table>
 </section>
<section>
  <h2>Clinician Attestation</h2>
  <table><tbody><tr><td>Signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a fitness-to-study/work memo that includes clinical status, capacity and restrictions table (with safety-sensitive tasks), graded return schedule, review measures/dates, and clinician attestation. Print CSS required.",
      "Create a code in HTML for a supervisor occupational feedback form linked to this memo.",
      "Create a code in HTML for a medication side-effect impact checklist relevant to work/study tasks (sedation, attention, coordination)."
    ],
    references: [
      { citation: "American College of Occupational and Environmental Medicine. (2019). Guideline for return-to-work in mental health conditions." },
      { citation: "Royal College of Psychiatrists. (2018). Mental health and work: guidance for clinicians." },
      { citation: "NICE. (2022). Depression in adults: NG222 — return to usual activities and work planning." }
    ]
  },


  {
    id: "travel-medications-border",
    title: "Travel & Medications Letter (Air/Border, including Controlled Drugs)",
    clinical_summary: [
      "For air/border control: list generic medication names, doses, total quantity for trip, and necessity; specify controlled/schedule status if applicable and carry in original packaging with prescription copies.",
      "Advise carrying medicines in hand luggage; declare liquids/exempt medical supplies; provide clinician and pharmacy contacts; note legal import limits may vary by country.",
      "Include warnings for specific agents (e.g., MAOIs food interactions; lithium dehydration/toxicity; benzodiazepine import restrictions in some countries)."
    ],
    indications: [ "International travel, especially with controlled drugs/needles/medical devices." ],
    contraindications: [ "Do not promise legal clearance; recommend traveler verify destination rules with embassy/regulator." ],
    outcome_measures: [ "No border holds; no medication loss; adherence to dosing while traveling." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Travel & Medications Letter (Air/Border)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:900px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .note{border:1px solid var(--b);border-radius:8px;padding:10px;background:#fafafa}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Travel & Medications Letter (Air/Border)</h1></header>
<main>
<section>
  <h2>Patient & Itinerary</h2>
  <table><tbody>
    <tr><td>Patient</td><td><input style="width:100%"></td><td>Passport</td><td><input></td></tr>
    <tr><td>Travel dates</td><td><input></td><td>Destination(s)</td><td><input></td></tr>
  </tbody></table>
 </section>
<section>
  <h2>Medication Declaration</h2>
  <table>
    <thead><tr><th>Generic name</th><th>Form/Strength</th><th>Dose</th><th>Qty for trip</th><th>Controlled?</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td><td><input placeholder="Y/N"></td></tr></tbody>
  </table>
 </section>
<section>
  <h2>Medical Devices/Sharps</h2>
  <table><thead><tr><th>Item</th><th>Purpose</th><th>Notes</th></tr></thead>
    <tbody><tr><td><input placeholder="syringes/needles"></td><td><input></td><td><input></td></tr></tbody></table>
 </section>
<section class="note">
  <h2>Important Notes</h2>
  <ul>
    <li>Carry all medicines in original labeled packaging and in hand luggage.</li>
    <li>Bring printed prescriptions and this letter; check import rules with embassy/regulator before travel.</li>
    <li>Keep lithium users hydrated; MAOI diet restrictions apply; benzodiazepines/opioids may be restricted.</li>
  </ul>
 </section>
<section>
  <h2>Contacts</h2>
  <table><tbody>
    <tr><td>Prescribing clinician</td><td><input style="width:100%"></td><td>Phone/Email</td><td><input></td></tr>
    <tr><td>Pharmacy</td><td><input></td><td>Phone/Email</td><td><input></td></tr>
  </tbody></table>
 </section>
<section>
  <h2>Attestation</h2>
  <p>The above medications are prescribed and medically necessary for the named patient. Please allow carriage per aviation/security rules.</p>
  <table><tbody><tr><td>Signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr></tbody></table>
 </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as an air/border travel medication letter including itinerary, a medication declaration table with total quantities and controlled status, devices/sharps list, critical notes (packaging, legal limits, hydration/MAOI cautions), contacts, and attestation. Print CSS required.",
      "Create a code in HTML for a controlled-drug travel checklist (documents to carry, country import notes, contact list).",
      "Create a code in HTML for a dosing-time converter (home vs destination time) with editable schedule rows."
    ],
    references: [
      { citation: "International Narcotics Control Board. (2018/ongoing). Guidelines for national regulations concerning travelers carrying medicines containing controlled substances." },
      { citation: "Transportation Security Administration (TSA). (current). Traveling with medication." },
      { citation: "World Health Organization. (2022). International Travel and Health — medicines and special needs travelers." }
    ]
  }
];
