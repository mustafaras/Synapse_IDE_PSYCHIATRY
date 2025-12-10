

export type Reference = { citation: string };

export type ConsentItem = {
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

export const ETHICS_CONSENT: ConsentItem[] = [

  {
    id: "consent-medication-generic",
    title: "Informed Consent — Medication (Generic)",
    clinical_summary: [
      "Core elements: diagnosis/target symptoms; proposed medication(s) & purpose; expected benefits; common and serious risks (incl. suicidality warning where applicable); alternatives (psychotherapy, watchful waiting, other drugs); and right to refuse/withdraw.",
      "Discuss administration (dose/timing, titration), monitoring (labs/ECG, scales), interactions (alcohol/OTC/herbals), pregnancy/lactation considerations, driving/impairment cautions, and cost/coverage.",
      "Use teach-back; check understanding and preferences; document shared decision-making and provide written materials.",
      "For youth: assent + guardian consent; for impaired capacity: follow capacity assessment and surrogate decision-maker policy.",
    ],
    indications: [
      "Initiation or change of psychotropic medication; periodic re-consent for long-term therapies."
    ],
    contraindications: [
      "Uncertain capacity without surrogate/guardian; emergent situations requiring stabilization prior to full consent (document emergency exception per policy)."
    ],
    outcome_measures: [
      "Patient verbalizes understanding (teach-back), questions answered, consent signed/dated, monitoring plan scheduled."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Informed Consent — Medication (Generic)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#dcdcdc;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  label{font-weight:600} .muted{color:var(--t);font-size:.9rem}
  .init{width:60px} .sig{width:100%}
  @media print{header{border:0}}
</style></head><body>
<header>
  <h1>Informed Consent — Medication (Generic)</h1>
  <div class="muted">This document summarizes a shared decision about starting or changing medication.</div>
</header>
<main>
<section>
  <h2>Patient & Visit</h2>
  <table><tbody>
    <tr><td>Patient name</td><td><input class="sig"></td><td>DOB/MRN</td><td><input class="sig"></td></tr>
    <tr><td>Date</td><td><input type="date" class="sig"></td><td>Clinician</td><td><input class="sig"></td></tr>
  </tbody></table>
</section>

<section>
  <h2>Proposed Medication(s) & Purpose</h2>
  <table>
    <thead><tr><th>Name</th><th>Target symptoms/diagnosis</th><th>Dose & timing</th><th>Titration plan</th></tr></thead>
    <tbody><tr><td><input></td><td><input></td><td><input></td><td><input></td></tr></tbody>
  </table>
</section>

<section>
  <h2>Benefits, Risks, and Alternatives (Initial each)</h2>
  <table>
    <tbody>
      <tr><td class="init"><input></td><td><b>Potential benefits</b> (e.g., improved mood, anxiety, sleep, function)</td></tr>
      <tr><td class="init"><input></td><td><b>Common side effects</b> and what to do (nausea, headache, sleep/appetite changes)</td></tr>
      <tr><td class="init"><input></td><td><b>Serious risks</b> (e.g., suicidality warning in youth, serotonin syndrome, arrhythmia/QT for select drugs, hyponatremia)</td></tr>
      <tr><td class="init"><input></td><td><b>Alternatives</b> (psychotherapy, different meds, no meds/watchful waiting)</td></tr>
      <tr><td class="init"><input></td><td><b>Interactions</b> (alcohol, OTC/herbals); <b>pregnancy/lactation</b> discussion</td></tr>
      <tr><td class="init"><input></td><td><b>Monitoring</b> (labs/ECG/scales) and follow-up schedule</td></tr>
      <tr><td class="init"><input></td><td><b>Right to refuse/withdraw</b> without losing access to other care</td></tr>
    </tbody>
  </table>
</section>

<section>
  <h2>Understanding Check (Teach-back)</h2>
  <textarea style="width:100%;height:90px" placeholder="Patient states in own words: purpose, major risks, what to do if side effects occur, follow-up plan"></textarea>
</section>

<section>
  <h2>Consent & Signatures</h2>
  <table><tbody>
    <tr><td>Patient / Legal representative signature</td><td><input class="sig"></td><td>Date</td><td><input type="date"></td></tr>
    <tr><td>Clinician signature</td><td><input class="sig"></td><td>Date</td><td><input type="date"></td></tr>
  </tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable medication informed consent form with sections for patient/visit identifiers, proposed medication(s) & purpose, benefits/risks/alternatives (with patient initials), interactions & pregnancy/lactation, monitoring plan, a teach-back notes area, and signature blocks. Use semantic HTML and print CSS.",
      "Create a code in HTML for an antidepressant-specific consent page including black-box warning text for younger patients, QT-risk checklist, and lab/ECG schedule table.",
      "Create a code in HTML for a pediatric psychopharmacology consent/assent form with guardian signature, youth assent, and space to document capacity assessment."
    ],
    references: [
      { citation: "American Medical Association. (2023). Code of Medical Ethics: Opinion 2.1.1—Informed Consent." },
      { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with major depressive disorder (4th ed.)." },
      { citation: "U.S. Food and Drug Administration. (current). Antidepressant use in children, adolescents, and adults—boxed warning." }
    ]
  },


  {
    id: "consent-psychotherapy",
    title: "Psychotherapy Consent & Boundaries",
    clinical_summary: [
      "Cover purpose and nature of therapy; evidence-based modalities to be used; expected benefits and potential risks (e.g., transient distress).",
      "Explain confidentiality and its limits; records and supervision/consultation; communication channels (phone/portal/email) and response times; boundaries (dual relationships, gifts, social media).",
      "Session structure: frequency/length, attendance, late/cancellation policy, fees/insurance, telehealth option, crisis procedures, and patient responsibilities between sessions.",
      "Obtain consent for audio/video recording only if used for care/training and per policy; clarify voluntary participation and right to stop.",
    ],
    indications: [ "Any new psychotherapy episode; significant change of modality; resumption after long gap." ],
    contraindications: [ "Acute risk/instability requiring higher level of care prior to outpatient therapy." ],
    outcome_measures: [ "Consent documented; patient articulates goals and understands boundaries; crisis plan acknowledged." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Psychotherapy Consent & Boundaries</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#dcdcdc;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse;margin:6px 0} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .init{width:60px}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Psychotherapy Consent & Boundaries</h1></header>
<main>
<section>
  <h2>Identifiers</h2>
  <table><tbody>
    <tr><td>Patient</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
    <tr><td>Clinician</td><td><input style="width:100%"></td><td>Modality</td><td><input placeholder="e.g., CBT, CPT, ERP"></td></tr>
  </tbody></table>
  </section>
<section>
  <h2>What Therapy Involves (Initial each)</h2>
  <table>
    <tbody>
      <tr><td class="init"><input></td><td>Goals and methods will be collaboratively set and may include homework between sessions.</td></tr>
      <tr><td class="init"><input></td><td>Benefits are expected but not guaranteed; temporary increases in distress can occur.</td></tr>
      <tr><td class="init"><input></td><td>Confidentiality applies, with legal/ethical limits described below.</td></tr>
      <tr><td class="init"><input></td><td>Attendance, punctuality, and participation are essential to outcomes.</td></tr>
    </tbody>
  </table>
  </section>
<section>
  <h2>Confidentiality & Boundaries</h2>
  <table>
    <thead><tr><th>Topic</th><th>Key points</th></tr></thead>
    <tbody>
      <tr><td>Limits of confidentiality</td><td>Imminent risk to self/others; suspected abuse/neglect; court orders; quality improvement/supervision per policy.</td></tr>
      <tr><td>Communication</td><td>Secure portal preferred; email may be used for scheduling only; typical response time: <input placeholder="e.g., 2 business days"></td></tr>
      <tr><td>Boundaries</td><td>No social media connections; no dual relationships; gifts discouraged; no private recordings without consent.</td></tr>
      <tr><td>Fees/No-show policy</td><td>Fee/copay: <input> • Late cancel window: <input> • No-show fee: <input></td></tr>
    </tbody>
  </table>
  </section>
<section>
  <h2>Crisis Plan</h2>
  <p>If you are in immediate danger, use your local emergency number. In the U.S., call/text <b>988</b>. Contact the clinic for urgent but non-emergent needs.</p>
  </section>
<section>
  <h2>Consent & Signatures</h2>
  <table><tbody>
    <tr><td>Patient signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
    <tr><td>Clinician signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
  </tbody></table>
  </section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a psychotherapy informed consent page covering: purpose/risks/benefits, confidentiality limits, session structure (length/frequency), communication boundaries, cancellation/fees, crisis plan, and signature blocks. Print-optimized.",
      "Create a code in HTML for a CBT patient agreement with homework tracker table, goals section, preferred contact method, and acknowledgement checkboxes.",
      "Create a code in HTML for an ERP therapy consent including exposure rationale, safety behavior prohibition statement, and between-session practice agreement."
    ],
    references: [
      { citation: "American Psychological Association. (2017). Ethical Principles of Psychologists and Code of Conduct." },
      { citation: "American Psychiatric Association. (2016). The Principles of Medical Ethics With Annotations Especially Applicable to Psychiatry." },
      { citation: "NICE. (2020–2024). Evidence-based psychotherapies across anxiety/depression guidelines (modality overviews)." }
    ]
  },


  {
    id: "consent-telepsychiatry",
    title: "Telepsychiatry Consent (Non-jurisdictional)",
    clinical_summary: [
      "Explain what telepsychiatry is; potential benefits (access, convenience) and risks (privacy/security limits, technical failures, limited exam).",
      "Confirm patient location at time of visit, emergency address, licensure/coverage limitations, identity verification, and who else may be present.",
      "Set expectations: technology requirements, environment (private/quiet), no driving during sessions, fallback to phone/in-person if needed, and recording policy (generally no recording).",
      "Privacy: how data are protected; platforms used; risks of email/SMS; patient rights and alternatives (in-person).",
    ],
    indications: [ "Remote visits for medication management or psychotherapy when appropriate and lawful." ],
    contraindications: [ "Urgent safety concerns requiring in-person evaluation; lack of privacy/technology; licensing restrictions." ],
    outcome_measures: [ "Consent signed; location and emergency plan documented each session; patient understands privacy/tech limits." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Telepsychiatry Consent</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#dcdcdc}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .init{width:60px}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Telepsychiatry Consent (Non-jurisdictional template)</h1></header>
<main>
<section>
  <h2>Visit Context</h2>
  <table><tbody>
    <tr><td>Patient</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
    <tr><td>Patient location (address)</td><td colspan="3"><input style="width:100%" placeholder="Required each session for emergency response"></td></tr>
    <tr><td>Emergency contact/plan</td><td colspan="3"><input style="width:100%" placeholder="Local emergency number; nearest ED; trusted adult"></td></tr>
  </tbody></table>
</section>
<section>
  <h2>Key Points (Initial each)</h2>
  <table>
    <tbody>
      <tr><td class="init"><input></td><td>Telepsychiatry uses secure video/phone; benefits and limits were explained.</td></tr>
      <tr><td class="init"><input></td><td>Privacy risks exist despite safeguards; I will choose a private location, and no one else will be present without my consent.</td></tr>
      <tr><td class="init"><input></td><td>No driving or operating machinery during sessions; I will ensure adequate connectivity and device power.</td></tr>
      <tr><td class="init"><input></td><td>My clinician may stop or reschedule if the connection is inadequate or safety concerns arise; fallback may be phone or in-person.</td></tr>
      <tr><td class="init"><input></td><td>I understand licensure/coverage limits may apply and in-person alternatives are available.</td></tr>
      <tr><td class="init"><input></td><td>Recording is not permitted unless both parties consent and local policy allows.</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Consent & Signatures</h2>
  <table><tbody>
    <tr><td>Patient signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
    <tr><td>Clinician signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
  </tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a telepsychiatry consent page including patient location and emergency plan fields, initials checklist (privacy, tech limits, no driving, licensure/coverage, fallback plan, recording policy), and signature blocks. Print CSS required.",
      "Create a code in HTML for a per-session telehealth attestation banner (location, privacy, emergency address) that can be appended to any progress note.",
      "Create a code in HTML for a youth telepsychiatry consent with guardian consent, minor assent, and school-based location workflow."
    ],
    references: [
      { citation: "American Psychiatric Association & American Telemedicine Association. (2018; updates). Best Practices in Videoconferencing-Based Telemental Health." },
      { citation: "U.S. Department of Health and Human Services. (current). HIPAA Privacy and Security Rules guidance for telehealth." },
      { citation: "World Psychiatric Association. (2021). Telepsychiatry guidance in mental health." }
    ]
  },


  {
    id: "confidentiality-explainer",
    title: "Confidentiality & Limits — Patient Explainer",
    clinical_summary: [
      "Explain how health information is used and shared (treatment, payment, operations), patient rights (access, amendment, restrictions, accounting, complaint), and how to authorize sharing (Release of Information).",
      "Describe limits of confidentiality: imminent risk to self/others; suspected abuse/neglect of children/elders/vulnerable adults; court orders/subpoenas; mandated reporting; and supervision/training within the care team.",
      "Clarify electronic communication risks, portal usage, and how to request privacy preferences; provide privacy officer contact.",
      "Encourage questions and provide a simple acknowledgement that the patient received and understood the explanation.",
    ],
    indications: [ "At intake and periodically; when privacy questions arise; at transitions of care." ],
    contraindications: [ "None; adapt to local law (HIPAA, GDPR, 42 CFR Part 2 for SUD programs) and institutional policy." ],
    outcome_measures: [ "Patient acknowledgement signed; ROI forms completed correctly when needed; fewer privacy-related complaints." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Confidentiality & Its Limits — Patient Explainer</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{--b:#dcdcdc;--t:#555}
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid var(--b)}
  main{padding:20px;max-width:1000px;margin:0 auto}
  .card{border:1px solid var(--b);border-radius:8px;padding:12px;margin-bottom:12px;background:#fafafa}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid var(--b);padding:6px 8px;text-align:left}
  .muted{color:var(--t);font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Confidentiality & Its Limits — Patient Explainer</h1><div class="muted">This page summarizes how your information is used and protected.</div></header>
<main>
<div class="card">
  <h2>How Your Information Is Used</h2>
  <ul>
    <li><b>Treatment:</b> sharing within your care team to coordinate your care.</li>
    <li><b>Payment:</b> billing/insurance as allowed by law.</li>
    <li><b>Operations:</b> quality improvement, training, auditing as permitted.</li>
  </ul>
</div>

<div class="card">
  <h2>Your Rights</h2>
  <ul>
    <li>Get a copy of your record; ask for corrections; request limits on sharing; choose how we contact you.</li>
    <li>See a list of certain disclosures; file a privacy complaint without penalty.</li>
  </ul>
</div>

<div class="card">
  <h2>Limits of Confidentiality</h2>
  <ul>
    <li>Immediate danger to yourself or others.</li>
    <li>Suspected abuse/neglect of children, elders, or vulnerable adults.</li>
    <li>Court orders/subpoenas or other legal requirements.</li>
    <li>Supervision/training in the care team and quality improvement processes.</li>
  </ul>
</div>

<section>
  <h2>Authorizing Sharing (Release of Information)</h2>
  <table><thead><tr><th>Recipient</th><th>Type of information</th><th>Purpose</th><th>Expiration date</th></tr></thead>
  <tbody><tr><td><input></td><td><input placeholder="e.g., med list, visit notes"></td><td><input></td><td><input type="date"></td></tr></tbody></table>
</section>

<section>
  <h2>Questions & Acknowledgement</h2>
  <p>Ask us anytime about privacy. Privacy Office contact: <input style="width:60%" placeholder="phone/email"></p>
  <table><tbody>
    <tr><td>Patient signature</td><td><input style="width:100%"></td><td>Date</td><td><input type="date"></td></tr>
  </tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a patient-facing confidentiality explainer with sections for permitted uses (treatment/payment/operations), patient rights, limits of confidentiality (risk, abuse/neglect, court orders, team/supervision), a Release-of-Information mini-form, privacy office contact, and acknowledgment signature. Print-optimized.",
      "Create a code in HTML for a standalone Release of Information (ROI) form with recipient, scope, purpose, expiration, revocation, and signatures, including a 42 CFR Part 2 checkbox for SUD programs.",
      "Create a code in HTML for a privacy FAQ page with expandable questions (details via <details> elements) covering portal messaging, email risks, and how to request restrictions."
    ],
    references: [
      { citation: "U.S. Department of Health and Human Services. (current). HIPAA Privacy Rule and Your Rights." },
      { citation: "European Union. (2016/2018). General Data Protection Regulation (GDPR) — data subject rights." },
      { citation: "Substance Abuse and Mental Health Services Administration. (2023). 42 CFR Part 2—Confidentiality of SUD patient records." },
      { citation: "Tarasoff v. Regents of the University of California, 17 Cal. 3d 425 (1976) — duty to protect (jurisdiction dependent)." }
    ]
  }
];
