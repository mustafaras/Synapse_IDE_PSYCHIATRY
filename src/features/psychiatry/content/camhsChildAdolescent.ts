

export type Reference = { citation: string };

export type CamhsItem = {
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

export const CAMHS_CHILD_ADOLESCENT: CamhsItem[] = [

  {
    id: "camhs-intake-liaison",
    title: "CAMHS Intake & School Liaison Summary (Scaffold)",
    clinical_summary: [
      "Intake must integrate caregiver + youth voice, developmental history, education trajectory, neurodevelopmental risks, medical comorbidity, medications, family context, and protective factors.",
      "School liaison essentials: attendance (last 12 mos), attainment vs expected, Individual Plan (IEP/504/EHCP) status, classroom observations, functional triggers, current accommodations, and response to interventions.",
      "Risk/safeguarding: suicidality/self-harm/violence, bullying, abuse/neglect concerns, online risks; document actions/escalation per policy.",
      "Measurement-Based Care anchors: SDQ/PSC, RCADS or SCARED (anxiety), PHQ-A, SNAP-IV/Vanderbilt (ADHD), C-SSRS for suicide risk as indicated."
    ],
    indications: [
      "First CAMHS contact; cross-agency liaison with school, pediatrician, or social services; pre-IEP/EHCP review."
    ],
    contraindications: [
      "None to assessment; if acute safety issues emerge, follow emergency pathway & safeguarding protocol immediately."
    ],
    outcome_measures: [
      "Baseline SDQ/RCADS/PHQ-A; attendance; functional goals; documented liaison plan and consent for information sharing."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>CAMHS Intake & School Liaison Summary (Scaffold)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1100px;margin:0 auto}
  h2{margin:.2rem 0 .4rem}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  .muted{color:var(--t);font-size:.9rem}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
  label{display:block;margin-top:6px;color:#555;font-size:.9rem}
</style></head><body>
<header>
  <h1>CAMHS Intake & School Liaison Summary</h1>
  <div class="muted">Developmental + school context • Risk-inclusive • Print-ready</div>
  <small class="muted">Disclaimer: Educational template; adapt to local policy and law.</small>
  </header>
<main>
<section class="grid" aria-label="Identifiers">
  <div><h2>Youth</h2><label>Name</label><br><input style="width:100%"><label>DOB / ID</label><br><input style="width:100%"></div>
  <div><h2>Caregivers</h2><input style="width:100%" placeholder="Names / legal authority / contact"></div>
  <div><h2>Visit</h2><input type="date" style="width:100%"><input style="width:100%" placeholder="Setting / referrer"></div>
</section>
<section><h2>Presenting Concerns & Goals</h2>
  <textarea style="width:100%;height:100px" placeholder="Youth & caregiver voice; duration; impairment; goals for school/home"></textarea>
  <div class="muted">Capture strengths and protective factors.</div>
  </section>
<section class="grid">
  <div><h2>Developmental & Medical</h2>
    <textarea style="width:100%;height:120px" placeholder="Pregnancy/birth; milestones; medical history; sleep/diet; neuro hx; meds/allergies"></textarea>
  </div>
  <div><h2>Mental Health Screen</h2>
    <table><thead><tr><th>Instrument</th><th>Baseline</th><th>Date</th></tr></thead>
      <tbody><tr><td>SDQ / PSC</td><td><input></td><td><input type="date"></td></tr>
             <tr><td>RCADS / SCARED</td><td><input></td><td><input type="date"></td></tr>
             <tr><td>PHQ-A</td><td><input></td><td><input type="date"></td></tr>
             <tr><td>SNAP-IV / Vanderbilt</td><td><input></td><td><input type="date"></td></tr></tbody></table>
  </div>
  </section>
<section><h2>School Liaison Snapshot</h2>
  <table>
    <thead><tr><th>School & Contact</th><th>Attendance (12 mo)</th><th>Attainment vs Expected</th><th>Plan (IEP/504/EHCP)</th><th>Current Supports</th></tr></thead>
    <tbody><tr><td><input></td><td><input placeholder="% / days missed"></td><td><input></td>
    <td><input placeholder="status / date"></td><td><input placeholder="SEN/SEMH, TA, SLP, OT, counseling"></td></tr></tbody>
  </table>
  <table>
    <thead><tr><th>Triggers/Contexts</th><th>Functional Impact</th><th>Accommodations tried</th><th>Response</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody>
  </table>
  </section>
<section><h2>Risk & Safeguarding</h2>
  <table><thead><tr><th>Domain</th><th>Current</th><th>Action</th></tr></thead>
    <tbody><tr><td>Suicide/self-harm</td><td><input></td><td><input></td></tr>
           <tr><td>Violence/bullying</td><td><input></td><td><input></td></tr>
           <tr><td>Abuse/neglect concerns</td><td><input></td><td><input></td></tr>
           <tr><td>Online safety</td><td><input></td><td><input></td></tr></tbody></table>
  <small class="muted">Follow local safeguarding policy and escalation thresholds.</small>
  </section>
<section><h2>Impressions & Plan</h2>
  <textarea style="width:100%;height:110px" placeholder="Differential; provisional diagnoses; liaison tasks; monitoring; follow-up"></textarea>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready CAMHS intake + school liaison summary with sections for presenting concerns/goals, developmental & medical history, MBC screening table (SDQ/RCADS/PHQ-A/SNAP-IV), a two-table school snapshot (attendance/attainment/IEP-504-EHCP + triggers/accommodations/response), safeguarding risk grid, and impressions/plan. Include print CSS.",
      "Create a code in HTML for a cross-agency information-sharing plan with fields for consent/assent, scope, recipients (school/SENCO/GP), review date, and safeguarding flags.",
      "Create a code in HTML for a one-page MSE for children/adolescents with behavior observations at home/school and strengths/protective factors."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2013, upd.). Social and emotional wellbeing in schools; and CG28/CG102 instruments guidance." },
      { citation: "American Academy of Pediatrics. (2018). Mental health competencies for pediatric practice." },
      { citation: "Goodman, R. (1997). The Strengths and Difficulties Questionnaire: A research note. Journal of Child Psychology and Psychiatry." }
    ]
  },


  {
    id: "adhd-supports-planner",
    title: "ADHD — Home/School Supports Planner (Non-proprietary)",
    clinical_summary: [
      "First-line supports: parent training in behavior management (PTBM), classroom behavior interventions, and organizational skills training; add medication when impairment persists per guidelines.",
      "Daily Report Card (DRC) with clear, observable targets and immediate reinforcement improves outcomes (home–school collaboration essential).",
      "Target domains: on-task behavior, work completion/accuracy, impulsivity, peer relations, homework routine, sleep, and screen hygiene.",
      "Medication monitoring: timing vs school day, appetite/sleep effects, blood pressure/heart rate if stimulant, and teacher feedback at dose changes."
    ],
    indications: [
      "ADHD diagnosis or suspected ADHD with school impairment; when coordinating targets with caregivers and teachers."
    ],
    contraindications: [
      "Do not set goals that are vague/non-observable; avoid punishment-heavy plans; screen for learning disorders/anxiety/depression when response is poor."
    ],
    outcome_measures: [
      "Vanderbilt/SNAP-IV teacher & parent scales; attendance; DRC % goals met; homework completion; adverse effects log."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>ADHD — Home/School Supports Planner</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
</style></head><body>
<header><h1>ADHD — Home/School Supports Planner</h1></header>
<main>
<section class="grid">
  <div><h2>Targets (observable)</h2>
    <table><thead><tr><th>Target</th><th>Definition</th><th>Setting</th></tr></thead>
      <tbody><tr><td><input placeholder="On-task"></td><td><input placeholder="Working w/o prompts for 10 min"></td><td><input placeholder="Math"></td></tr></tbody></table>
  </div>
  <div><h2>Reinforcement</h2>
    <table><thead><tr><th>Behavior</th><th>Points/Reward</th><th>When delivered</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input placeholder="immediately / end of period"></td></tr></tbody></table>
  </div>
</section>
<section><h2>Daily Report Card (DRC)</h2>
  <table><thead><tr><th>Date</th><th>Target 1</th><th>Target 2</th><th>Target 3</th><th>% Goals Met</th><th>Teacher</th><th>Parent Ack.</th></tr></thead>
  <tbody><tr><td><input type="date"></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td><td><input type="checkbox"></td></tr></tbody></table>
</section>
<section class="grid">
  <div><h2>Home Plan</h2><textarea style="width:100%;height:120px" placeholder="Homework start time; device rules; token economy; bedtime routine"></textarea></div>
  <div><h2>Medication & Monitoring</h2>
    <table><thead><tr><th>Drug</th><th>Dose</th><th>Time</th><th>Effect @ school</th><th>SE</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready ADHD supports planner with observable targets, reinforcement matrix, a Daily Report Card table, a home plan area (homework, token economy, bedtime), and a medication monitoring table. Include print CSS.",
      "Create a code in HTML for a teacher–parent communication log (weekly) tied to DRC metrics and medication timing.",
      "Create a code in HTML for an organizational skills checklist (backpack, planner, materials, due dates) with weekly scoring."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2018). ADHD: diagnosis and management (NG87)." },
      { citation: "Wolraich, M. L., et al. (2019). Clinical practice guideline for the diagnosis, evaluation, and treatment of ADHD in children and adolescents. Pediatrics, 144(4), e20192528." },
      { citation: "Fabiano, G. A., et al. (2010). A meta-analysis of behavioral treatments for ADHD including the Daily Report Card. School Psychology Review." }
    ]
  },


  {
    id: "autism-profile-accommodations",
    title: "Autism Profile & Accommodations Builder (Adaptable)",
    clinical_summary: [
      "Document communication profile (expressive/receptive, AAC use), social communication strengths & challenges, sensory sensitivities, rigidity/sameness, and interests.",
      "Translate profile into practical accommodations: visual schedules, task chunking, predictability, reduced sensory load, alternative communication supports, structured peer support, and transition planning.",
      "Consider co-occurring conditions (ADHD, anxiety, ID, epilepsy, sleep disorders, GI issues) and school/home safety plans for elopement or meltdowns.",
      "Partner with SLP/OT/education to align goals; include caregiver training and support for autistic strengths."
    ],
    indications: [ "Autism diagnosis or suspected ASD needing practical school/home adaptations." ],
    contraindications: [ "None to planning; ensure trauma-informed approach and avoid sensory overexposure in interventions." ],
    outcome_measures: [ "Attendance; engagement time; ABC charts; goal attainment scaling; caregiver/teacher ratings of function." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Autism Profile & Accommodations Builder</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
</style></head><body>
<header><h1>Autism Profile & Accommodations Builder</h1></header>
<main>
<section class="grid">
  <div><h2>Communication</h2>
    <table><thead><tr><th>Area</th><th>Description</th><th>Support</th></tr></thead>
      <tbody><tr><td>Expressive</td><td><input></td><td><input placeholder="visuals/AAC/choices"></td></tr>
             <tr><td>Receptive</td><td><input></td><td><input placeholder="step-by-step, visuals"></td></tr></tbody></table>
  </div>
  <div><h2>Sensory Profile</h2>
    <table><thead><tr><th>Modality</th><th>Sensitivity</th><th>Accommodation</th></tr></thead>
      <tbody><tr><td>Sound</td><td><input></td><td><input placeholder="noise-reducing space/headphones"></td></tr>
             <tr><td>Light/Visual</td><td><input></td><td><input placeholder="reduce glare, seat choice"></td></tr></tbody></table>
  </div>
</section>
<section><h2>Structure & Predictability</h2>
  <table><thead><tr><th>Need</th><th>Tool</th><th>Who/When</th></tr></thead>
    <tbody><tr><td>Transitions</td><td><input placeholder="visual schedule; countdown timers"></td><td><input></td></tr></tbody></table>
</section>
<section><h2>Safety & Distress Plan</h2>
  <table><thead><tr><th>Trigger</th><th>Early signs</th><th>De-escalation</th><th>Post-incident supports</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as an autism profile & accommodations planner covering communication (expressive/receptive/AAC), sensory profile, structure/predictability tools (visual schedules, task chunking), and a safety/distress plan table. Print CSS required.",
      "Create a code in HTML for a transitions support kit: visual schedule builder, first-then boards, and countdown timers with editable text.",
      "Create a code in HTML for a home–school communication notebook with sections for energy/sensory status, successes, triggers, and next-day plan."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2013/2016). Autism spectrum disorder in under 19s: support and management (CG170)." },
      { citation: "Hyman, S. L., et al. (2020). Identification, evaluation, and management of children with ASD. Pediatrics, 145(1), e20193447." },
      { citation: "Lord, C., Elsabbagh, M., Baird, G., & Veenstra-Vanderweele, J. (2018). Autism spectrum disorder. The Lancet, 392(10146), 508–520." }
    ]
  },


  {
    id: "consent-assent-safeguarding",
    title: "Consent/Assent & Safeguarding Summary",
    clinical_summary: [
      "Record who holds parental responsibility/legal authority, custody or court orders, and the young person’s capacity/assent; document information-sharing preferences and ROI.",
      "Safeguarding: capture current concerns, thresholds, mandated reporting status, actions already taken, and named safeguarding lead; include risk to self/others and contextual risks (bullying/online).",
      "Ensure the child’s voice is documented; provide crisis plan and escalation routes."
    ],
    indications: [ "At intake, when concerns arise, prior to information sharing, or before school liaison meetings." ],
    contraindications: [ "None; follow local child-protection law and organizational policy." ],
    outcome_measures: [ "Clear consent/assent status; timely safeguarding referrals; audit of information-sharing accuracy." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Consent/Assent & Safeguarding Summary</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
</style></head><body>
<header><h1>Consent/Assent & Safeguarding Summary</h1></header>
<main>
<section><h2>Authority & Contacts</h2>
  <table><thead><tr><th>Guardian(s)</th><th>Authority</th><th>Phone/Email</th><th>Notes/Court orders</th></tr></thead>
    <tbody><tr><td><input></td><td><input placeholder="PR/guardian/custody"></td><td><input></td><td><input></td></tr></tbody></table>
  <label>Young person’s assent/capacity</label><textarea style="width:100%;height:70px"></textarea>
</section>
<section><h2>Information Sharing & ROI</h2>
  <table><thead><tr><th>Recipient</th><th>Scope</th><th>Purpose</th><th>Expiry</th></tr></thead>
    <tbody><tr><td><input placeholder="School/SENCO/GP"></td><td><input placeholder="e.g., summary letter"></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>
<section><h2>Safeguarding</h2>
  <table><thead><tr><th>Concern</th><th>Risk Level</th><th>Action/Referral</th><th>Owner</th></tr></thead>
    <tbody><tr><td><input placeholder="self-harm/bullying/neglect"></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  <label>Crisis plan</label><textarea style="width:100%;height:80px"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a one-page Consent/Assent & Safeguarding summary capturing parental responsibility/legal authority, youth assent/capacity, Release-of-Information recipients/scope, safeguarding concerns with actions/owners, and a crisis plan area. Print-optimized.",
      "Create a code in HTML for a per-meeting liaison cover sheet (who attended, consent status verified, agenda, actions, review date).",
      "Create a code in HTML for a child’s voice page (strengths, worries, preferred supports) that can be attached to any plan."
    ],
    references: [
      { citation: "American Academy of Pediatrics. (2016). Informed consent in decision-making in pediatric practice. Pediatrics, 138(2), e20161485." },
      { citation: "HM Government (UK). (2018, upd.). Working Together to Safeguard Children." },
      { citation: "General Medical Council (UK). (2020). 0–18 years: guidance for all doctors." }
    ]
  },


  {
    id: "school-letters-support-plans",
    title: "School Letters & Support Plans (504/EHCP-style)",
    clinical_summary: [
      "Provide concise clinical summary tied to functional needs; request reasonable accommodations with rationale and review date; avoid unnecessary diagnosis detail without consent.",
      "Common accommodations: extended time, reduced homework load, quiet testing space, movement breaks, visual schedules, organizational coaching, seating, and exam adjustments.",
      "Embed progress monitoring: who measures what (attendance, DRC, ABC charts, grades) and when review occurs."
    ],
    indications: [ "Students needing formal support (Section 504/IDEA IEP in U.S.; EHCP in UK) or informal accommodations." ],
    contraindications: [ "Do not disclose beyond consented scope; coordinate with safeguarding when sharing sensitive information." ],
    outcome_measures: [ "Accommodation implementation; attendance and work completion; formal plan issued/renewed; review completed." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>School Letter & Support Plan (504/EHCP-style)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
</style></head><body>
<header><h1>School Letter & Support Plan</h1></header>
<main>
<section><h2>Recipient</h2>
  <table><tbody><tr><td>School / SENCO / Counselor</td><td><input style="width:100%"></td></tr>
                 <tr><td>Date</td><td><input type="date" style="width:100%"></td></tr></tbody></table>
</section>
<section><h2>Clinical Summary (consented)</h2>
  <textarea style="width:100%;height:100px" placeholder="Functional difficulties; strengths; agreed goals"></textarea>
</section>
<section><h2>Requested Accommodations</h2>
  <table><thead><tr><th>Accommodation</th><th>Rationale</th><th>Duration/Review</th><th>Owner</th></tr></thead>
    <tbody><tr><td><input placeholder="Quiet test space"></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section><h2>Monitoring & Review</h2>
  <table><thead><tr><th>Measure</th><th>Frequency</th><th>Data source</th><th>Next review</th></tr></thead>
    <tbody><tr><td>Attendance / DRC</td><td><input></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>
<section><h2>Signature</h2>
  <table><tbody><tr><td>Clinician</td><td><input></td><td>Guardian/Youth ack.</td><td><input></td></tr></tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready school letter & support plan including recipient block, consented clinical summary, accommodations with rationale/duration/owner, monitoring schedule, next review date, and signatures. Include print CSS.",
      "Create a code in HTML for a 504/IEP accommodation checklist with common options (extended time, reduced distractions, movement breaks, organizational supports) and free-text rationale fields.",
      "Create a code in HTML for a meeting minutes template (school–family–clinician) with actions, owners, and due dates."
    ],
    references: [
      { citation: "U.S. Department of Education. (2004/2017). IDEA & Section 504 guidance for students with disabilities." },
      { citation: "Department for Education (UK). (2015). SEND Code of Practice: 0 to 25 years (EHCP framework)." },
      { citation: "DuPaul, G. J., et al. (2011). ADHD in the Schools: Assessment and Intervention Strategies (3rd ed.)." }
    ]
  },


  {
    id: "adhd-asd-psychoeducation-behavior",
    title: "ADHD/ASD — Psychoeducation & Home–School Behavior Plan",
    clinical_summary: [
      "Provide clear, strengths-based psychoeducation about ADHD and ASD; normalize neurodevelopmental differences and focus on function and participation.",
      "Behavior plan uses ABC (Antecedent–Behavior–Consequence) analysis, proactive antecedent management, teaching replacement skills, and positive reinforcement; avoid coercive cycles.",
      "Coordinate home–school plan: consistent rules, token economy or point system, predictable routines, visual supports, and crisis/meltdown steps."
    ],
    indications: [ "ADHD/ASD with cross-setting behavior challenges; when building shared plan with caregivers & school." ],
    contraindications: [ "None; screen for trauma/learning disorders; adapt for intellectual disability or language delay." ],
    outcome_measures: [ "ABC chart trends, goal attainment scaling, DRC % goals met, caregiver stress ratings." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>ADHD/ASD — Psychoeducation & Home–School Behavior Plan</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#ddd}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:18px;max-width:1100px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
  @media print{header{border:0}}
  input,textarea{border:1px solid var(--b);padding:6px 8px;border-radius:4px}
</style></head><body>
<header><h1>ADHD/ASD — Psychoeducation & Home–School Behavior Plan</h1></header>
<main>
<section class="grid">
  <div><h2>Psychoeducation (Key Points)</h2>
    <ul>
      <li>ADHD involves attention regulation, impulsivity, and delay aversion; ASD involves social communication differences and sensory profiles.</li>
      <li>Skills can be taught; environments can be adapted; behavior is communication.</li>
      <li>Medication may help ADHD core symptoms; behavior strategies remain foundational.</li>
    </ul>
  </div>
  <div><h2>Goals</h2><textarea style="width:100%;height:110px" placeholder="2–3 measurable goals across home & school"></textarea></div>
</section>
<section><h2>ABC Analysis</h2>
  <table><thead><tr><th>Antecedent</th><th>Behavior</th><th>Consequence</th><th>Function (why?)</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input placeholder="escape/attention/sensory/tangible"></td></tr></tbody></table>
</section>
<section class="grid">
  <div><h2>Proactive Strategies</h2>
    <ul><li>Visual schedule & first-then boards</li><li>Task chunking & timers</li><li>Choice-making; movement breaks</li></ul>
  </div>
  <div><h2>Reinforcement Plan</h2>
    <table><thead><tr><th>Target skill</th><th>Reward</th><th>Criteria</th><th>When delivered</th></tr></thead>
      <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
  </div>
</section>
<section><h2>Home–School Consistency</h2>
  <table><thead><tr><th>Rule/Routine</th><th>Home</th><th>School</th><th>Owner</th></tr></thead>
    <tbody><tr><td><input placeholder="homework start"></td><td><input></td><td><input></td><td><input></td></tr></tbody></table>
</section>
<section><h2>Meltdown/Crisis Steps</h2>
  <ol><li>Reduce demands; offer safe space & sensory supports</li><li>Calm adult response; few words</li><li>Post-event debrief & teach replacement skills</li></ol>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a print-ready ADHD/ASD psychoeducation + behavior plan including key points, measurable goals, an ABC analysis table, proactive strategies list, a reinforcement plan table, home–school consistency table, and meltdown steps. Include print CSS.",
      "Create a code in HTML for a token economy sheet with reward menu, earnings log, and bonus contingencies.",
      "Create a code in HTML for an ABC observation log (15-min intervals) with summary graph placeholders."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2018). ADHD: diagnosis and management (NG87)." },
      { citation: "Hyman, S. L., et al. (2020). Management of children with ASD. Pediatrics, 145(1), e20193447." },
      { citation: "Evans, S. W., Owens, J. S., & Bunford, N. (2014). Evidence-based psychosocial treatments for children and adolescents with ADHD. Journal of Clinical Child & Adolescent Psychology." }
    ]
  }
];
