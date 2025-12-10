

export type Reference = { citation: string };

export type FollowItem = {
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

export const FOLLOWUP_MONITORING: FollowItem[] = [

    {
        id: "apso-followup",
        title: "Follow-up Visit — APSO (Risk-inclusive)",
        clinical_summary: [
            "APSO (Assessment–Plan–Subjective–Objective) prioritizes decision-making at the top while preserving SOAP elements.",
            "Include interval change (symptoms, function, side effects), MBC scores (e.g., PHQ-9/GAD-7 trend), and risk screening (suicide/self-harm/violence).",
            "Document safety planning if risk present before proceeding to medication/therapy adjustments.",
            "Brief MSE and diagnostic impression update, plus shared decision-making with informed consent for changes."
        ],
        indications: [
            "Any outpatient psychiatric follow-up where concise, action-forward documentation is preferred."
        ],
        contraindications: [
            "None to documentation; if acute risk or medical instability is identified, escalate to emergency pathway."
        ],
        outcome_measures: [
            "PHQ-9, GAD-7, WSAS/functional notes; risk status vs. prior visit; adherence and adverse effect burden."
        ],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Follow-up Visit — APSO (Risk-inclusive)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{background:#fff !important;color:#111 !important;border:1px solid #d0d7de;border-radius:10px;padding:18px;max-width:1100px;margin:0 auto}
  .paper header{padding:0 0 10px;border-bottom:1px solid #e5e5e5}
  .paper main{padding-top:10px}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .paper table{width:100%;border-collapse:collapse;margin-top:8px;background:#fff !important}
  .paper th,.paper td{border:1px solid #d0d0d0 !important;padding:6px 8px;text-align:left;background:#fff !important}
  .paper thead th{background:#f6f8fa !important;color:#111}
  .paper label{display:block;margin-top:6px;font-weight:600;color:#222}
  .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border:1px solid #bdbdbd !important;border-radius:6px;padding:6px 8px;min-height:32px}
  .paper input[type="checkbox"]{width:auto;min-height:auto}
  .paper .muted{color:#666 !important;font-size:.9rem}
  @media (prefers-color-scheme: dark){ .paper{background:#fff !important;color:#111 !important} }
  @media print{.paper{box-shadow:none;border-color:#ccc}}
</style></head><body>
<div class="paper" style="background:#fff !important;color:#111 !important;">
<header>
  <h1>Follow-up Visit — APSO (Risk-inclusive)</h1>
  <div class="muted">Action-first note with risk screening and MBC anchors</div>
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
    </div>
  </section>

  <section aria-label="Assessment & Plan">
    <h2>Assessment & Plan (AP)</h2>
    <textarea style="width:100%;height:120px" placeholder="Diagnosis/status, response/remission status, rationale for changes, patient preferences"></textarea>
    <table>
      <thead><tr><th>Change</th><th>Rationale</th><th>Follow-up/Monitoring</th></tr></thead>
      <tbody>
        <tr><td>Medication</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
        <tr><td>Psychotherapy</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
        <tr><td>Labs/ECG</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
      </tbody>
    </table>
  </section>

  <section class="grid" aria-label="Subjective & Objective">
    <div>
      <h2>Subjective</h2>
      <textarea style="width:100%;height:110px" placeholder="Interval change in mood/anxiety/sleep/energy/function; adherence; side effects"></textarea>
    </div>
    <div>
      <h2>Objective / MSE</h2>
      <textarea style="width:100%;height:110px" placeholder="Appearance/behavior; speech; mood/affect; thought process/content; perception; cognition; insight/judgment"></textarea>
    </div>
  </section>

  <section aria-label="Risk Screen">
    <h2>Risk Screen</h2>
    <table>
      <thead><tr><th>Domain</th><th>Current</th><th>Plan</th></tr></thead>
      <tbody>
        <tr><td>Suicidal ideation/intent</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
        <tr><td>Self-harm/violence</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
        <tr><td>Safety plan status</td><td><input style="width:100%"></td><td><input style="width:100%"></td></tr>
      </tbody>
    </table>
    <div class="muted">If risk present, complete safety plan and adjust care level before closing visit.</div>
  </section>

  <section aria-label="MBC Snapshot">
    <h2>MBC Snapshot</h2>
    <table>
      <thead><tr><th>Date</th><th>Instrument</th><th>Score</th><th>Δ Baseline</th><th>Δ Last</th></tr></thead>
      <tbody>
        <tr><td><input type="date"></td><td><input placeholder="PHQ-9/GAD-7"></td><td><input></td><td><input></td><td><input></td></tr>
      </tbody>
    </table>
  </section>
</main>
</div></body></html>`,
        prompts: [
            "Create a code in HTML as a printable APSO follow-up note that includes: Assessment & Plan at top (with change/rationale/monitoring table), Subjective & Objective with a brief MSE, a risk screening table (suicidal/self-harm/violence, safety plan), and an MBC snapshot table (date, instrument, score, delta). Use semantic HTML and simple print CSS.",
            "Create a code in HTML for a concise Mental Status Exam (MSE) form with labeled textareas for appearance/behavior, speech, mood/affect, thought process/content, perception, cognition, and insight/judgment, designed for printing.",
            "Create a code in HTML for a safety plan recap that captures warning signs, coping strategies, contacts, and restrictions, to be attached to follow-up notes."
        ],
        references: [
            { citation: "American Psychiatric Association. (2023). Practice guideline for the treatment of patients with major depressive disorder (4th ed.)." },
            { citation: "Fortney, J. C., Unützer, J., Wrenn, G., et al. (2017). A tipping point for measurement-based care. Psychiatric Services, 68(2), 179–188." },
            { citation: "Posner, K., et al. (2011). The Columbia–Suicide Severity Rating Scale (C-SSRS): Initial validity and internal consistency. American Journal of Psychiatry, 168(12), 1266–1277." }
        ]
    },


    {
        id: "sidefx-adherence",
        title: "Side-Effects & Adherence Review — CheckList",
        clinical_summary: [
            "Brief, structured review each visit improves adherence and detection of adverse effects.",
            "Use FIBSER (Frequency, Intensity, Burden of Side Effects Rating) to quantify tolerability alongside targeted domain review (GI, CNS, sexual, sleep, weight/metabolic).",
            "Assess adherence barriers (forgetfulness, cost, beliefs, side effects) with a brief self-report (e.g., MMAS-8) and problem-solve with the patient.",
            "Document mitigation: dose adjust, administration timing, switch/augment, non-pharmacologic supports."
        ],
        indications: [
            "Any pharmacotherapy follow-up; especially during titration/early months."
        ],
        contraindications: [
            "None to checklist; if severe AE (e.g., rash, mania, suicidality) is reported, prioritize urgent management documentation."
        ],
        outcome_measures: [
            "FIBSER total/trajectory; MMAS-8 adherence; weight/BP; symptom scales."
        ],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Side-Effects & Adherence — CheckList</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{background:#fff !important;color:#111 !important;border:1px solid #d0d7de;border-radius:10px;padding:18px;max-width:1100px;margin:0 auto}
  .paper header{padding:0 0 10px;border-bottom:1px solid #e5e5e5}
  .paper main{padding-top:10px}
  .paper table{width:100%;border-collapse:collapse;background:#fff !important}
  .paper th,.paper td{border:1px solid #d0d0d0 !important;padding:6px 8px;text-align:left;background:#fff !important}
  .paper thead th{background:#f6f8fa !important;color:#111}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border:1px solid #bdbdbd !important;border-radius:6px;padding:6px 8px;min-height:32px}
  .paper input[type="checkbox"]{width:auto;min-height:auto}
  @media (prefers-color-scheme: dark){ .paper{background:#fff !important;color:#111 !important} }
  @media print{.paper{box-shadow:none;border-color:#ccc}}
</style></head><body>
<div class="paper">
<header><h1>Side-Effects & Adherence — CheckList</h1><div>FIBSER + domain review + adherence barriers</div></header>
<main>
<section>
  <h2>FIBSER (0–6 each)</h2>
  <table><thead><tr><th>Frequency</th><th>Intensity</th><th>Burden</th><th>Total</th></tr></thead>
  <tbody><tr>
    <td><input type="number" min="0" max="6"></td>
    <td><input type="number" min="0" max="6"></td>
    <td><input type="number" min="0" max="6"></td>
    <td><input></td>
  </tr></tbody></table>
</section>
<section class="grid">
  <div>
    <h2>Domains</h2>
    <table><thead><tr><th>Domain</th><th>Present</th><th>Severity</th><th>Onset</th></tr></thead>
    <tbody>
      <tr><td>GI (nausea, appetite)</td><td><input type="checkbox"></td><td><input></td><td><input></td></tr>
      <tr><td>CNS (activation, sedation)</td><td><input type="checkbox"></td><td><input></td><td><input></td></tr>
      <tr><td>Sexual</td><td><input type="checkbox"></td><td><input></td><td><input></td></tr>
      <tr><td>Sleep</td><td><input type="checkbox"></td><td><input></td><td><input></td></tr>
      <tr><td>Weight/Metabolic</td><td><input type="checkbox"></td><td><input></td><td><input></td></tr>
    </tbody></table>
  </div>
  <div>
    <h2>Adherence</h2>
    <table><thead><tr><th>Barrier</th><th>Present</th><th>Mitigation</th></tr></thead>
    <tbody>
      <tr><td>Forgetfulness</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Cost/Access</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Beliefs/Concerns</td><td><input type="checkbox"></td><td><input></td></tr>
      <tr><td>Side Effects</td><td><input type="checkbox"></td><td><input></td></tr>
    </tbody></table>
  </div>
</section>
</main></div></body></html>`,
        prompts: [
            "Create a code in HTML for a side-effects & adherence checklist including FIBSER (0–6 for frequency, intensity, burden), a domain table (GI, CNS, sexual, sleep, weight/metabolic), and an adherence barriers table with mitigation fields. Include print CSS.",
            "Create a code in HTML for a brief MMAS-8 adherence capture with a total score box and mitigation plan section."
        ],
        references: [
            { citation: "Wisniewski, S. R., et al. (2006). Self-rated global measure of the burden of side effects (FIBSER) from STAR*D. Journal of Psychiatric Research, 40(1), 41–47." },
            { citation: "Morisky, D. E., et al. (2008). Predictive validity of a medication adherence measure in hypertension (MMAS-8). Journal of Clinical Hypertension, 10(5), 348–354." },
            { citation: "NICE. (2022). Depression in adults: Treatment and management (NG222)." }
        ]
    },


    {
        id: "mbc-mini-dashboard",
        title: "MBC Trend — Mini Dashboard (PHQ-9/GAD-7)",
        clinical_summary: [
            "Measurement-Based Care (MBC) uses systematic symptom tracking to guide treatment changes.",
            "PHQ-9: response ≈ ≥50% reduction from baseline; remission often ≤4–5. GAD-7: response ≈ ≥50% reduction; remission often ≤5.",
            "Display date, instrument, score, Δ baseline, and Δ last visit to support shared decisions."
        ],
        indications: ["Any depressive/anxiety disorder follow-up where PHQ-9/GAD-7 are tracked."],
        contraindications: ["None; scores supplement, not replace, clinical judgment."],
        outcome_measures: ["PHQ-9 and GAD-7 level/trajectory; response/remission status."],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>MBC Trend — Mini Dashboard (PHQ-9/GAD-7)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{background:#fff !important;color:#111 !important;border:1px solid #d0d7de;border-radius:10px;padding:18px;max-width:1100px;margin:0 auto}
  .paper header{padding:0 0 10px;border-bottom:1px solid #e5e5e5}
  .paper main{padding-top:10px}
  .paper table{width:100%;border-collapse:collapse;background:#fff !important}
  .paper th,.paper td{border:1px solid #d0d0d0 !important;padding:6px 8px;text-align:left;background:#fff !important}
  .paper thead th{background:#f6f8fa !important;color:#111}
  .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border:1px solid #bdbdbd !important;border-radius:6px;padding:6px 8px;min-height:32px}
  .paper .muted{color:#666 !important;font-size:.9rem}
  @media (prefers-color-scheme: dark){ .paper{background:#fff !important;color:#111 !important} }
  @media print{.paper{box-shadow:none;border-color:#ccc}}
</style></head><body>
<div class="paper">
<header><h1>MBC Trend — Mini Dashboard</h1><div class="muted">PHQ-9/GAD-7 with deltas to baseline and last visit</div></header>
<main>
  <section>
    <h2>Scores</h2>
    <table><thead><tr><th>Date</th><th>Instrument</th><th>Score</th><th>Δ Baseline</th><th>Δ Last</th><th>Status (resp/remit)</th></tr></thead>
    <tbody>
      <tr><td><input type="date"></td><td><input placeholder="PHQ-9/GAD-7"></td><td><input></td><td><input></td><td><input></td><td><input placeholder="e.g., response"></td></tr>
    </tbody></table>
    <p class="muted">Typical thresholds: PHQ-9 response ≥50% reduction; remission ≤4–5. GAD-7 response ≥50% reduction; remission ≤5.</p>
  </section>
</main></div></body></html>`,
        prompts: [
            "Create a code in HTML for a mini MBC dashboard that tabulates Date, Instrument (PHQ-9/GAD-7), Score, delta from baseline, delta from last visit, and an editable status field (response/remission). Include print CSS.",
            "Create a code in HTML that calculates percent change from baseline for PHQ-9/GAD-7 in a small table with minimal inline JavaScript and prints cleanly."
        ],
        references: [
            { citation: "Fortney, J. C., et al. (2017). A tipping point for measurement-based care. Psychiatric Services, 68(2), 179–188." },
            { citation: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613." },
            { citation: "Spitzer, R. L., Kroenke, K., Williams, J. B. W., & Löwe, B. (2006). A brief measure for assessing generalized anxiety disorder: the GAD-7. Archives of Internal Medicine, 166(10), 1092–1097." }
        ]
    },


    {
        id: "care-coordination-log",
        title: "Care Coordination Log (Liaison & Tasks)",
        clinical_summary: [
            "Track interprofessional communication (PCP, therapist, OB, pediatrics, social work) with clear asks, due dates, and outcomes.",
            "Ensure consent/ROI (release of information) compliance; document phone/fax/secure message trails.",
            "Close the loop by recording callback outcomes and patient notification."
        ],
        indications: ["Complex cases needing multi-disciplinary coordination and task tracking."],
        contraindications: ["None; follow privacy laws and clinic policy."],
        outcome_measures: ["Task completion, timeliness, patient-reported outcomes after coordination."],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Care Coordination Log (Liaison & Tasks)</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{--accent:#06b6d4;--bg:#0b0f19;--card:#111827;--ink:#e5e7eb;--muted:#94a3b8;--line:#334155;--input-bg:#0f172a;--input-br:#334155;--input-ink:#e5e7eb;background:var(--bg) !important;color:var(--ink) !important;border:1px solid #1f2937;border-radius:14px;padding:22px;max-width:920px;margin:0 auto;font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Ubuntu,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
  .paper header{padding:0 0 12px;border-bottom:1px solid #1f2937;margin-bottom:6px}
  .paper h1{margin:0 0 6px;font-weight:700;font-size:1.5rem}
  .paper h2{margin:16px 0 10px;font-size:1.1rem;color:#e2e8f0;padding-left:12px;border-left:4px solid var(--accent)}
  .paper main{padding-top:8px}
  .paper label{display:block;margin:2px 0 6px;font-weight:600;color:#cbd5e1}
  .paper input,.paper select,.paper textarea{width:100%;background:var(--input-bg) !important;color:var(--input-ink) !important;border:1px solid var(--input-br) !important;border-radius:10px;padding:9px 12px;min-height:38px;transition:border-color .15s, box-shadow .15s}
  .paper input::placeholder,.paper textarea::placeholder{color:#64748b}
  .paper input:focus,.paper select:focus,.paper textarea:focus{outline:none;border-color:var(--accent) !important;box-shadow:0 0 0 3px rgba(6,182,212,.22)}
  .paper input[type="checkbox"]{width:auto;min-height:auto}
  .muted{color:var(--muted) !important;font-size:.92rem}
  .section{margin:16px 0}
  .card{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:16px;margin:12px 0;box-shadow:0 2px 6px rgba(0,0,0,.25)}
  .grid{display:grid;gap:12px}
  .grid.two{grid-template-columns:1fr}
  @media(min-width:760px){ .grid.two{grid-template-columns:1fr 1fr} }

  @media print{
    .paper{background:#fff !important;color:#111 !important;border-color:#ccc;box-shadow:none}
    .card{background:#fff !important;border-color:#ddd;box-shadow:none}
    .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border-color:#bbb !important;box-shadow:none}
    .paper h2{color:#111;border-left-color:#555}
  }
</style></head><body>
 <div class="paper">
<header>
  <h1>Care Coordination Log (Liaison & Tasks)</h1>
  <div class="muted">Record contact, topic, ask, status, due date, and callback outcomes</div>
  <div class="muted">Tip: Duplicate the entry card below for additional contacts/tasks as needed.</div>
</header>
<main>
  <section class="section" aria-label="Contacts & Tasks">
    <h2>Contacts & Tasks</h2>
    <div class="card" aria-label="Contact Task Entry">
      <div class="grid two">
        <div class="field">
          <label for="cc-date">Date</label>
          <input id="cc-date" type="date" />
        </div>
        <div class="field">
          <label for="cc-contact">Discipline / Contact</label>
          <input id="cc-contact" placeholder="e.g., PCP — Dr. X" />
        </div>
        <div class="field">
          <label for="cc-topic">Topic</label>
          <input id="cc-topic" placeholder="e.g., lab coordination" />
        </div>
        <div class="field">
          <label for="cc-ask">Ask</label>
          <input id="cc-ask" placeholder="Specific request or question" />
        </div>
        <div class="field">
          <label for="cc-status">Status</label>
          <input id="cc-status" placeholder="open / closed" />
        </div>
        <div class="field">
          <label for="cc-due">Due</label>
          <input id="cc-due" type="date" />
        </div>
        <div class="field" style="grid-column:1/-1">
          <label for="cc-callback">Callback Info / Outcome</label>
          <input id="cc-callback" placeholder="Who responded, summary, next steps" />
        </div>
      </div>
    </div>
  </section>

  <section class="section" aria-label="Consent / Release of Information">
    <h2>Consent / Release of Information</h2>
    <div class="card">
      <div class="grid two">
        <div class="field">
          <label for="roi-onfile">ROI On File?</label>
          <input id="roi-onfile" type="checkbox" />
        </div>
        <div class="field">
          <label for="roi-date">Date Signed</label>
          <input id="roi-date" type="date" />
        </div>
        <div class="field" style="grid-column:1/-1">
          <label for="roi-notes">Scope / Notes</label>
          <input id="roi-notes" placeholder="e.g., PCP only; med list; for 1 year" />
        </div>
      </div>
    </div>
  </section>
</main></div></body></html>`,
        prompts: [
            "Create a code in HTML for a care coordination log with a contacts & tasks table (date, discipline/contact, topic, ask, status, due date, callback info) and a Release of Information section (on file, date, scope/notes). Include print CSS.",
            "Create a code in HTML for a liaison summary letter template to another clinician with patient identifiers, current meds, problem list, and specific asks."
        ],
        references: [
            { citation: "Agency for Healthcare Research and Quality. (2018). Care coordination measures atlas update." },
            { citation: "The Joint Commission. (2019). National Patient Safety Goals — transitions of care communication." }
        ]
    },


    {
        id: "rtc-monitoring-planner",
        title: "RTC & Monitoring Cadence Planner",
        clinical_summary: [
            "Return-to-clinic (RTC) cadence depends on severity, risk, phase of treatment, and recent changes.",
            "Typical anchors: weekly/biweekly during initiation/titration or elevated risk; monthly when stable; sooner for new AEs or lab abnormalities.",
            "Pair RTC with planned monitoring (scales, labs/ECG, vitals) and explicit early-contact triggers."
        ],
        indications: ["All ongoing pharmacotherapy/psychotherapy care."],
        contraindications: ["None; escalate interval if risk increases."],
        outcome_measures: ["Attendance, adherence, MBC trend, safety events, completion of planned labs/ECG."],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>RTC & Monitoring Cadence Planner</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{background:#fff !important;color:#111 !important;border:1px solid #d0d7de;border-radius:10px;padding:18px;max-width:1100px;margin:0 auto}
  .paper header{padding:0 0 10px;border-bottom:1px solid #e5e5e5}
  .paper main{padding-top:10px}
  .paper table{width:100%;border-collapse:collapse;background:#fff !important}
  .paper th,.paper td{border:1px solid #d0d0d0 !important;padding:6px 8px;text-align:left;background:#fff !important}
  .paper thead th{background:#f6f8fa !important;color:#111}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border:1px solid #bdbdbd !important;border-radius:6px;padding:6px 8px;min-height:32px}
  .paper input[type="checkbox"]{width:auto;min-height:auto}
  @media (prefers-color-scheme: dark){ .paper{background:#fff !important;color:#111 !important} }
  @media print{.paper{box-shadow:none;border-color:#ccc}}
</style></head><body>
<div class="paper">
<header><h1>RTC & Monitoring Cadence Planner</h1><div>Link severity/risk to follow-up interval and monitoring</div></header>
<main>
<section class="grid">
  <div>
    <h2>Clinical Anchors</h2>
    <label>Severity/Risk</label><br><input placeholder="e.g., moderate depression; low risk" style="width:100%">
    <label>Recent Changes</label><br><input placeholder="new med / dose change / AE" style="width:100%">
  </div>
  <div>
    <h2>Next Steps</h2>
    <label>Next RTC Date</label><br><input type="date" style="width:100%">
    <label>Interim Contact Trigger</label><br><input placeholder="worsening mood, AE, safety concern" style="width:100%">
  </div>
</section>
<section>
  <h2>Monitoring Plan</h2>
  <table><thead><tr><th>Item</th><th>When</th><th>Responsible</th><th>Notes</th></tr></thead>
  <tbody>
    <tr><td>PHQ-9/GAD-7</td><td><input></td><td><input></td><td><input></td></tr>
    <tr><td>Labs/ECG</td><td><input></td><td><input></td><td><input></td></tr>
    <tr><td>Vitals/Weight</td><td><input></td><td><input></td><td><input></td></tr>
  </tbody></table>
</section>
</main></div></body></html>`,
        prompts: [
            "Create a code in HTML for an RTC planner that captures severity/risk, recent changes, next RTC date, interim contact triggers, and a monitoring plan table (scales, labs/ECG, vitals). Include print CSS.",
            "Create a code in HTML for a follow-up schedule table listing weekly/biweekly/monthly options with checkboxes and a free-text rationale box."
        ],
        references: [
            { citation: "American Psychiatric Association. (2023). MDD practice guideline — follow-up and monitoring recommendations." },
            { citation: "NICE. (2022). Depression in adults: Monitoring and review intervals (NG222)." }
        ]
    },


    {
        id: "noshow-doc-skeleton",
        title: "No-Show / Cancellation — Documentation Skeleton",
        clinical_summary: [
            "Comprehensive documentation reduces risk: record date/time, reason (if known), risk concerns, outreach attempts, and next steps.",
            "If risk is suspected, escalate (call patient, emergency contacts per consent, welfare check per policy) and document outcomes.",
            "Record barriers and mitigation (transport, cost, reminders) and rescheduling details."
        ],
        indications: ["Missed appointments or late cancellations."],
        contraindications: ["None; follow privacy and emergency policies."],
        outcome_measures: ["Successful contact made, risk assessed, rescheduled visit, adherence to policy timelines."],
        example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>No-Show / Cancellation — Documentation Skeleton</title><meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *,*::before,*::after{box-sizing:border-box}
  .paper{background:#fff !important;color:#111 !important;border:1px solid #d0d7de;border-radius:10px;padding:18px;max-width:1100px;margin:0 auto}
  .paper header{padding:0 0 10px;border-bottom:1px solid #e5e5e5}
  .paper main{padding-top:10px}
  .paper table{width:100%;border-collapse:collapse;background:#fff !important}
  .paper th,.paper td{border:1px solid #d0d0d0 !important;padding:6px 8px;text-align:left;background:#fff !important}
  .paper thead th{background:#f6f8fa !important;color:#111}
  .paper input,.paper select,.paper textarea{background:#fff !important;color:#111 !important;border:1px solid #bdbdbd !important;border-radius:6px;padding:6px 8px;min-height:32px}
  @media (prefers-color-scheme: dark){ .paper{background:#fff !important;color:#111 !important} }
  @media print{.paper{box-shadow:none;border-color:#ccc}}
</style></head><body>
<div class="paper">
<header><h1>No-Show / Cancellation — Documentation Skeleton</h1><div>Risk-aware outreach and policy-compliant documentation</div></header>
<main>
<section>
  <h2>Event Details</h2>
  <table><thead><tr><th>Date/Time</th><th>Type</th><th>Reason (if known)</th><th>Reschedule</th></tr></thead>
  <tbody><tr>
    <td><input type="datetime-local"></td>
    <td><input placeholder="no-show / late cancellation"></td>
    <td><input></td>
    <td><input placeholder="date/time or pending"></td>
  </tr></tbody></table>
</section>
<section>
  <h2>Risk & Outreach</h2>
  <table><thead><tr><th>Attempt</th><th>Method</th><th>Time</th><th>Outcome</th></tr></thead>
  <tbody>
    <tr><td>1</td><td><input placeholder="call/SMS/portal"></td><td><input type="datetime-local"></td><td><input></td></tr>
    <tr><td>2</td><td><input></td><td><input type="datetime-local"></td><td><input></td></tr>
  </tbody></table>
  <label>Risk Concern</label><br><input style="width:100%" placeholder="none / possible / significant — action taken">
</section>
<section>
  <h2>Barriers & Mitigation</h2>
  <table><thead><tr><th>Barrier</th><th>Mitigation</th><th>Assigned To</th></tr></thead>
  <tbody><tr><td><input placeholder="transport/cost/reminder"></td><td><input></td><td><input></td></tr></tbody></table>
</section>
</main></div></body></html>`,
        prompts: [
            "Create a code in HTML for a no-show/cancellation documentation sheet including event details (type, reason, reschedule), outreach attempts table (method/time/outcome), risk concern field, and barriers/mitigation table. Include print CSS.",
            "Create a code in HTML for a patient outreach log that captures time-stamped contact attempts with fields for consent scope and escalation steps (e.g., welfare check)."
        ],
        references: [
            { citation: "The Joint Commission. (2019). National Patient Safety Goals — communication and follow-up expectations." },
            { citation: "Agency for Healthcare Research and Quality. (2019). Missed appointments: Safety and risk management considerations." }
        ]
    }
];
