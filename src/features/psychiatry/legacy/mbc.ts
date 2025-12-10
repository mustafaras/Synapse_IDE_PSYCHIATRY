import type { Card } from '../lib/types';

export const mbcCards: Card[] = [
  {
    id: 'mbc-autoscore',
    title: 'Measurement-Based Care Overview',
    sectionId: 'mbc',
    tags: ['progress','documentation'],
    summary: 'Overview of MBC workflow, capturing serial PHQ-9 / GAD-7 scores and clinical response.',
    descriptionHtml: '<p>Measurement-based care (MBC) integrates routine outcome metrics (e.g., PHQ-9, GAD-7) into shared decision making and treatment adjustments.</p>',
    html: '<h2>MBC Overview</h2><p>Track standardized scales at baseline and follow-ups to gauge response, side effects, and functional change.</p>',
    prompts: [{
      id: 'mbc-progress-snippet',
      label: 'Progress Note Snippet',
      template: 'Scales today — PHQ-9: {{phq9}}; GAD-7: {{gad7}}. Change since last: {{change_notes}}. Impression: {{impression}}. Plan: {{plan}}.',
      variables: [
        { key:'phq9', label:'PHQ-9', type:'text' },
        { key:'gad7', label:'GAD-7', type:'text' },
        { key:'change_notes', label:'Change notes', type:'multiline' },
        { key:'impression', label:'Impression', type:'multiline' },
        { key:'plan', label:'Plan', type:'multiline' }
      ]
    }],
    examples: [
      {
        id: 'scientific-mbc-form',
        label: 'Scientific MBC Form',
        html: `
<article aria-label="Scientific MBC Form" style="--c:#cfe8ff;--b:rgba(255,255,255,.12);">
  <header>
    <h2 style="margin:0 0 6px 0">Measurement‑Based Care — Scientific Form</h2>
    <p style="margin:0;font-size:12.5px;opacity:.8">Capture standardized outcomes and classify response/remission to inform stepped care decisions.</p>
  </header>

  <section style="margin-top:12px">
    <h3 style="margin:0 0 6px">A. Outcomes</h3>
    <div style="display:grid;gap:8px">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        <label>PHQ‑9 (Baseline)<input name="phq9_base" type="number" min="0" max="27" placeholder="0–27"/></label>
        <label>PHQ‑9 (Current)<input name="phq9_now" type="number" min="0" max="27" placeholder="0–27"/></label>
        <label>GAD‑7 (Baseline)<input name="gad7_base" type="number" min="0" max="21" placeholder="0–21"/></label>
        <label>GAD‑7 (Current)<input name="gad7_now" type="number" min="0" max="21" placeholder="0–21"/></label>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">
        <label>Functioning (0–10)<input name="function" type="number" min="0" max="10" placeholder="0–10"/></label>
        <label>Side‑effects (0–3)<input name="se" type="number" min="0" max="3" placeholder="0–3"/></label>
        <label>Adherence (0–100%)<input name="adh" type="number" min="0" max="100" placeholder="%"/></label>
      </div>
    </div>
  </section>

  <section style="margin-top:10px">
    <h3 style="margin:0 0 6px">B. Response Classification</h3>
    <ul style="margin:6px 0 10px 18px;font-size:12.5px">
      <li>Response ≥50% reduction from baseline; Partial 25–49%; Non‑response &lt;25% or worse.</li>
      <li>Remission: PHQ‑9 ≤4 sustained ≥2 visits (consider GAD‑7 anchors 5/10/15 for anxiety).</li>
    </ul>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label>Computed %Δ PHQ‑9<input name="phq9_delta" type="text" placeholder="auto/hand"/></label>
      <label>Status<select name="status">
        <option value="">Select…</option>
        <option>Response</option>
        <option>Partial response</option>
        <option>Non‑response</option>
        <option>Remission</option>
      </select></label>
    </div>
  </section>

  <section style="margin-top:10px">
    <h3 style="margin:0 0 6px">C. Context & Risk</h3>
    <div style="display:grid;gap:8px">
      <label>Context notes<textarea rows="3" placeholder="Stressors, comorbidity, barriers"></textarea></label>
      <label>Risk/safety notes<textarea rows="2" placeholder="SI/HI, protections, escalation triggers"></textarea></label>
    </div>
  </section>

  <section style="margin-top:10px">
    <h3 style="margin:0 0 6px">D. Plan (Stepped Care)</h3>
    <ul style="margin:6px 0 10px 18px;font-size:12.5px">
      <li>Escalate if non‑response by 4–6 weeks, or any risk override.</li>
      <li>Extend interval after stability/remission; continue relapse plan.</li>
    </ul>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label>Visit cadence<select name="cadence"><option></option><option>Weekly</option><option>Biweekly</option><option>Monthly</option></select></label>
      <label>Next review date<input type="date" name="next"/></label>
    </div>
    <label style="display:block;margin-top:8px">Planned adjustments<textarea rows="3" placeholder="Medication/therapy changes; monitoring"></textarea></label>
  </section>

  <footer style="margin-top:10px;font-size:11.5px;opacity:.75">
    Educational scaffold; use official instrument wording/manuals for clinical deployment.
  </footer>
</article>`
      }
    ]
  }
  ,

  {
    id: 'intake-hpi-structured',
    title: 'Intake & HPI — Structured Template',
    sectionId: 'intake_hpi',
    summary: 'Structured intake scaffold with placeholders for chief complaint, onset, context, symptoms, risk, brief history, MSE, and initial impression.',
    html: `\n<h2>Intake & HPI — Structured Template</h2>\n<section><h3>Chief Complaint</h3><p>{{chief_complaint}}</p></section>\n<section><h3>Onset & Course</h3><p>{{onset}}</p></section>\n<section><h3>Context / Triggers</h3><p>{{context}}</p></section>\n<section><h3>Associated Symptoms</h3><p>{{associated_symptoms}}</p></section>\n<section><h3>Functioning (work/school/home)</h3><p>{{functioning}}</p></section>\n<section><h3>Risk Factors (acute/chronic)</h3><p>{{risk_factors}}</p></section>\n<section><h3>Past Psychiatric History (brief)</h3><p>{{pphx_brief}}</p></section>\n<section><h3>Substance Use</h3><p>{{substance_use}}</p></section>\n<section><h3>Medical Comorbidities</h3><p>{{medical}}</p></section>\n<section><h3>Medications & Allergies</h3><p>{{meds_allergies}}</p></section>\n<section><h3>Quick MSE</h3>\n<ul style="columns:2;font-size:12px">\n  <li><strong>Appearance:</strong> {{mse_appearance}}</li>\n  <li><strong>Behavior:</strong> {{mse_behavior}}</li>\n  <li><strong>Speech:</strong> {{mse_speech}}</li>\n  <li><strong>Mood:</strong> {{mse_mood}}</li>\n  <li><strong>Affect:</strong> {{mse_affect}}</li>\n  <li><strong>Thought Process:</strong> {{mse_tp}}</li>\n  <li><strong>Thought Content:</strong> {{mse_tc}}</li>\n  <li><strong>Perceptions:</strong> {{mse_perceptions}}</li>\n  <li><strong>Cognition:</strong> {{mse_cognition}}</li>\n  <li><strong>Insight:</strong> {{mse_insight}}</li>\n  <li><strong>Judgment:</strong> {{mse_judgment}}</li>\n</ul></section>\n<section><h3>Impression & Initial Plan</h3><p>{{impression_plan}}</p></section>\n`,
  examples: [
      {
        id: 'smart-form',
        label: 'SMART Goal Form',
        html: `
<form aria-label="SMART Goal Form" style="display:grid;gap:10px">
  <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:10px">
    <legend style="font-weight:600">Problem → SMART Goal</legend>
    <label style="display:block;margin:6px 0">Problem
      <input style="width:100%" placeholder="e.g., Low mood, inactivity" required />
    </label>
    <label style="display:block;margin:6px 0">Specific
      <input style="width:100%" placeholder="Behavior + context (who/what/when/where)" required />
    </label>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
      <label>Baseline <input type="number" min="0" style="width:100%" placeholder="e.g., PHQ‑9 18" /></label>
      <label>Current <input type="number" min="0" style="width:100%" placeholder="e.g., 14" /></label>
      <label>Target <input type="number" min="0" style="width:100%" placeholder="e.g., ≤4" /></label>
    </div>
    <label style="display:block;margin:6px 0">Achievable (feasibility)
      <input style="width:100%" placeholder="time, literacy, supports" />
    </label>
    <label style="display:block;margin:6px 0">Relevant (values/preferences)
      <input style="width:100%" placeholder="what matters most" />
    </label>
    <label style="display:block;margin:6px 0">Time-bound (deadline)
      <input type="date" />
    </label>
  </fieldset>
  <fieldset style="border:1px solid #d0d0d0;border-radius:8px;padding:10px">
    <legend style="font-weight:600">Follow-up & Safety</legend>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <label>Visit cadence
        <select style="width:100%"><option></option><option>Weekly</option><option>Biweekly</option><option>Monthly</option></select>
      </label>
      <label>Status
        <select style="width:100%"><option>On‑track</option><option>At‑risk</option><option>Off‑track</option></select>
      </label>
    </div>
    <label style="display:block;margin:6px 0">Risk notes
      <textarea rows="3" style="width:100%" placeholder="SI/HI, protections, crisis steps"></textarea>
    </label>
  </fieldset>
  <p style="font-size:12px;opacity:.8">Educational scaffold; use clinical judgement and local protocols.</p>
</form>`
      },
      {
        id: 'one-page-summary',
        label: 'One‑Page Summary',
        html: `
<section>
  <h3 style="margin:0 0 6px 0">Treatment Plan — SMART Goals</h3>
  <ul style="margin:6px 0 10px 18px">
    <li>Convert problems into SMART goals with measurable anchors (PHQ‑9/GAD‑7/sleep%).</li>
    <li>Review at 4–6 weeks; escalate if no ≥50% improvement or risk override.</li>
    <li>Align with patient values via SDM; document cadence and next three dates.</li>
  </ul>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr>
      <th style="border:1px solid #d0d0d0;padding:6px;text-align:left">Goal</th>
      <th style="border:1px solid #d0d0d0;padding:6px;text-align:left">Baseline → Target</th>
      <th style="border:1px solid #d0d0d0;padding:6px;text-align:left">Owner</th>
      <th style="border:1px solid #d0d0d0;padding:6px;text-align:left">Due</th>
      <th style="border:1px solid #d0d0d0;padding:6px;text-align:left">Status</th>
    </tr></thead>
    <tbody>
      <tr><td style="border:1px solid #d0d0d0;padding:6px">Behavioral activation</td><td style="border:1px solid #d0d0d0;padding:6px">PHQ‑9 18 → ≤4</td><td style="border:1px solid #d0d0d0;padding:6px">Patient</td><td style="border:1px solid #d0d0d0;padding:6px">2025‑11‑15</td><td style="border:1px solid #d0d0d0;padding:6px">At‑risk</td></tr>
    </tbody>
  </table>
  <p style="font-size:12px;opacity:.8;margin-top:6px">Print‑friendly block.</p>
</section>`
      },
      {
        id: 'stepped-care-mini',
        label: 'Stepped Care Mini',
        html: `
<section>
  <h3>Stepped Care — Severity → Cadence</h3>
  <ul style="margin-left:18px">
    <li>PHQ‑9: 0–4 Minimal, 5–9 Mild, 10–14 Moderate, 15–19 Mod‑Severe, 20–27 Severe.</li>
    <li>Cadence: Severe weekly → biweekly; Moderate biweekly → monthly; Mild monthly.</li>
    <li>Escalate if no ≥50% improvement by 4–6 weeks or any risk override.</li>
  </ul>
  <p style="font-size:12px;opacity:.8">Educational summary.</p>
</section>`
      },
      {
        id: 'sdm-grid-mini',
        label: 'SDM Option Grid',
        html: `
<section>
  <h3>SDM Option Grid (CBT / SSRI/SNRI / Combined / Watchful Waiting)</h3>
  <table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr><th style="border:1px solid #d0d0d0;padding:6px">Option</th><th style="border:1px solid #d0d0d0;padding:6px">Pros</th><th style="border:1px solid #d0d0d0;padding:6px">Cons</th></tr></thead>
    <tbody>
      <tr><td style="border:1px solid #d0d0d0;padding:6px">CBT</td><td style="border:1px solid #d0d0d0;padding:6px">Skills, relapse prevention</td><td style="border:1px solid #d0d0d0;padding:6px">Time/availability</td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px">SSRI/SNRI</td><td style="border:1px solid #d0d0d0;padding:6px">Broad efficacy</td><td style="border:1px solid #d0d0d0;padding:6px">SEs, adherence</td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px">Combined</td><td style="border:1px solid #d0d0d0;padding:6px">Higher response</td><td style="border:1px solid #d0d0d0;padding:6px">Cost/complexity</td></tr>
      <tr><td style="border:1px solid #d0d0d0;padding:6px">Watchful</td><td style="border:1px solid #d0d0d0;padding:6px">Low burden</td><td style="border:1px solid #d0d0d0;padding:6px">Risk of delay</td></tr>
    </tbody>
  </table>
  <p style="font-size:12px;opacity:.8">Patient values determine alignment.</p>
</section>`
      },
      {
        id: 'care-level-mini',
        label: 'Care Level Triage',
        html: `
<section>
  <h3>Care Level Criteria</h3>
  <ul style="margin-left:18px">
    <li><strong>OP:</strong> Stable, no imminent risk, supports adequate.</li>
    <li><strong>IOP:</strong> Moderate‑severe with decline; needs daily structure.</li>
    <li><strong>PHP:</strong> Severe symptoms; daily monitoring, not 24h.</li>
    <li><strong>Inpatient:</strong> Imminent SI/HI/psychosis/severe agitation.</li>
  </ul>
  <p style="font-size:12px;opacity:.8">Risk overrides severity alone.</p>
</section>`
      },
      {
        id: 'relapse-mini',
        label: 'Relapse Plan',
        html: `
<section>
  <h3>Relapse Prevention (Green/Yellow/Red)</h3>
  <ul style="margin-left:18px">
    <li><strong>Green:</strong> Maintain routine; skills practice weekly.</li>
    <li><strong>Yellow:</strong> Early signs → increase monitoring; add session.</li>
    <li><strong>Red:</strong> Crisis contacts; urgent visit; means safety.</li>
  </ul>
  <p style="font-size:12px;opacity:.8">Review every 3 months or post‑episode.</p>
</section>`
      }
    ],
    prompts: [
      {
        id: 'intake-hpi-apso',
        label: 'Compose APSO from Intake',
        template: 'Compose a concise APSO (Assessment, Plan, Subjective, Objective) using the captured intake fields. Include risk, functional impact, and a one-line initial plan. Keep ≤200 words.\nIntake Data:\nChief Complaint: {{chief_complaint}}\nOnset & Course: {{onset}}\nContext: {{context}}\nSymptoms: {{associated_symptoms}}\nFunctioning: {{functioning}}\nRisk Factors: {{risk_factors}}\nBrief PPHx: {{pphx_brief}}\nSubstance Use: {{substance_use}}\nMedical: {{medical}}\nMeds/Allergies: {{meds_allergies}}\nMSE: Appearance {{mse_appearance}}; Behavior {{mse_behavior}}; Speech {{mse_speech}}; Mood {{mse_mood}}; Affect {{mse_affect}}; TP {{mse_tp}}; TC {{mse_tc}}; Perceptions {{mse_perceptions}}; Cognition {{mse_cognition}}; Insight {{mse_insight}}; Judgment {{mse_judgment}}.\nImpression & Plan: {{impression_plan}}',
        variables: [
          { key:'chief_complaint', label:'Chief Complaint', type:'multiline' },
          { key:'onset', label:'Onset & Course', type:'multiline' },
          { key:'context', label:'Context / Triggers', type:'multiline' },
          { key:'associated_symptoms', label:'Associated Symptoms', type:'multiline' },
          { key:'functioning', label:'Functioning', type:'multiline' },
          { key:'risk_factors', label:'Risk Factors', type:'multiline' },
          { key:'pphx_brief', label:'Past Psych Hx (brief)', type:'multiline' },
          { key:'substance_use', label:'Substance Use', type:'multiline' },
          { key:'medical', label:'Medical Comorbidities', type:'multiline' },
          { key:'meds_allergies', label:'Meds & Allergies', type:'multiline' },
          { key:'mse_appearance', label:'MSE Appearance', type:'text' },
          { key:'mse_behavior', label:'MSE Behavior', type:'text' },
          { key:'mse_speech', label:'MSE Speech', type:'text' },
          { key:'mse_mood', label:'MSE Mood', type:'text' },
          { key:'mse_affect', label:'MSE Affect', type:'text' },
          { key:'mse_tp', label:'MSE Thought Process', type:'text' },
          { key:'mse_tc', label:'MSE Thought Content', type:'text' },
          { key:'mse_perceptions', label:'MSE Perceptions', type:'text' },
          { key:'mse_cognition', label:'MSE Cognition', type:'text' },
          { key:'mse_insight', label:'MSE Insight', type:'text' },
          { key:'mse_judgment', label:'MSE Judgment', type:'text' },
          { key:'impression_plan', label:'Impression & Plan', type:'multiline' }
        ]
      },
      {
        id: 'intake-hpi-referral',
        label: 'Summarize for referral',
        template: 'Summarize the Intake & HPI neutrally for external referral (120–150 words). Omit identifiers.\nData:\nChief Complaint: {{chief_complaint}}\nOnset & Course: {{onset}}\nContext: {{context}}\nSymptoms: {{associated_symptoms}}\nFunctioning: {{functioning}}\nRisk: {{risk_factors}}\nBrief PPHx: {{pphx_brief}}\nSubstance: {{substance_use}}\nMedical: {{medical}}\nMSE Highlights: Appearance {{mse_appearance}}; Behavior {{mse_behavior}}; Mood {{mse_mood}}; Affect {{mse_affect}}; TP {{mse_tp}}; TC {{mse_tc}}; Perceptions {{mse_perceptions}}; Cognition {{mse_cognition}}; Insight {{mse_insight}}; Judgment {{mse_judgment}}.',
        variables: []
      },
      {
        id: 'intake-hpi-problem-list',
        label: 'Problem list extraction',
        template: 'Extract a bullet Problem List (one issue per bullet) from the intake data. Include severity and chronicity tags. Data: Chief Complaint {{chief_complaint}}; Onset {{onset}}; Context {{context}}; Symptoms {{associated_symptoms}}; Functioning {{functioning}}; Risk {{risk_factors}}; Brief PPHx {{pphx_brief}}; Substance {{substance_use}}; Medical {{medical}}; MSE summary above.'
      }
    ],
    evidence: []
  },
  {
    id: 'mse-structured',
    title: 'Structured Mental Status Exam (MSE) — Quick Scaffold',
    sectionId: 'intake_hpi',
    summary: 'Compact list of MSE domains with placeholders for rapid structured documentation.',
    html: `\n<h2>Mental Status Exam — Quick Scaffold</h2>\n<table style="font-size:12px;width:100%;border-collapse:collapse">\n  <thead><tr><th style="text-align:left">Domain</th><th style="text-align:left">Notes</th></tr></thead>\n  <tbody>\n    <tr><td>Appearance</td><td>{{mse_appearance}}</td></tr>\n    <tr><td>Behavior</td><td>{{mse_behavior}}</td></tr>\n    <tr><td>Psychomotor</td><td>{{mse_psychomotor}}</td></tr>\n    <tr><td>Speech</td><td>{{mse_speech}}</td></tr>\n    <tr><td>Mood</td><td>{{mse_mood}}</td></tr>\n    <tr><td>Affect</td><td>{{mse_affect}}</td></tr>\n    <tr><td>Thought Process</td><td>{{mse_tp}}</td></tr>\n    <tr><td>Thought Content (SI/HI/Delusions/Obsessions)</td><td>{{mse_tc}}</td></tr>\n    <tr><td>Perceptions (AH/VH)</td><td>{{mse_perceptions}}</td></tr>\n    <tr><td>Cognition (Orientation/Attention/Memory)</td><td>{{mse_cognition}}</td></tr>\n    <tr><td>Insight</td><td>{{mse_insight}}</td></tr>\n    <tr><td>Judgment</td><td>{{mse_judgment}}</td></tr>\n  </tbody>\n</table>\n`,
    prompts: [
      {
        id: 'mse-compose',
        label: 'Compose MSE paragraph',
        template: 'Compose a single-paragraph MSE from the following domain notes. Use medically neutral tone; avoid value judgments; include risk-relevant findings. Appearance: {{mse_appearance}}; Behavior: {{mse_behavior}}; Psychomotor: {{mse_psychomotor}}; Speech: {{mse_speech}}; Mood: {{mse_mood}}; Affect: {{mse_affect}}; Thought Process: {{mse_tp}}; Thought Content: {{mse_tc}}; Perceptions: {{mse_perceptions}}; Cognition: {{mse_cognition}}; Insight: {{mse_insight}}; Judgment: {{mse_judgment}}.'
      },
      {
        id: 'mse-abnormalities',
        label: 'Flag abnormalities',
        template: 'List only abnormal MSE findings as bullets (Domain — abnormality — clinical implication). Data: Appearance {{mse_appearance}}; Behavior {{mse_behavior}}; Psychomotor {{mse_psychomotor}}; Speech {{mse_speech}}; Mood {{mse_mood}}; Affect {{mse_affect}}; TP {{mse_tp}}; TC {{mse_tc}}; Perceptions {{mse_perceptions}}; Cognition {{mse_cognition}}; Insight {{mse_insight}}; Judgment {{mse_judgment}}.'
      }
    ],
    evidence: []
  },
  {
    id: 'collateral-pphx-checklist',
    title: 'Collateral & Past Psychiatric History — Checklist',
    sectionId: 'intake_hpi',
    summary: 'Checklist structure for collateral and past psychiatric history domains.',
    html: `\n<h2>Collateral & Past Psychiatric History — Checklist</h2>\n<ul>\n  <li><strong>Prior Diagnoses:</strong> {{prior_dx}}</li>\n  <li><strong>Hospitalizations:</strong> {{hospitalizations}}</li>\n  <li><strong>Medication Trials (agent/dose/duration/response/SEs):</strong> {{med_trials}}</li>\n  <li><strong>Psychotherapy Modalities & Duration:</strong> {{psychotherapy_mods}}</li>\n  <li><strong>Suicide / Self-Injury History:</strong> {{suicide_hx}}</li>\n  <li><strong>Violence / Forensic History:</strong> {{violence_hx}}</li>\n  <li><strong>Family Psychiatric History:</strong> {{family_hx}}</li>\n  <li><strong>Prior MBC Baselines (PHQ-9 / GAD-7 etc.):</strong> {{mbc_baselines}}</li>\n  <li><strong>Collateral Sources & Attempts:</strong> {{collateral_sources}}</li>\n</ul>\n<p class="muted" style="font-size:12px">Use this checklist to ensure comprehensive risk & treatment context capture.</p>\n`,
    prompts: [
      {
        id: 'pphx-treatment-summary',
        label: 'Summarize prior treatment',
        template: 'Summarize prior treatments emphasizing adequate trials (dose/duration), responses, and side effects. Data: Med Trials {{med_trials}}; Psychotherapy {{psychotherapy_mods}}; Hospitalizations {{hospitalizations}}; Prior Dx {{prior_dx}}; Family Hx {{family_hx}}.'
      },
      {
        id: 'pphx-risk-relevant',
        label: 'Risk-relevant hx',
        template: 'Extract risk-relevant historical factors (2–4 bullets) explaining how they shape the current safety assessment. Suicide/Self-injury: {{suicide_hx}}; Violence/Forensic: {{violence_hx}}; Family Hx: {{family_hx}}; Collateral: {{collateral_sources}}.'
      }
    ],
    evidence: []
  },

  {
    id: 'scales-starter-index',
    title: 'Screening Scales — Starter Set & Cutoffs',
    sectionId: 'scales_measures',
    summary: 'Common screening instruments with typical severity bands and notes.',
    html: `\n<h2>Screening Scales — Starter Set & Cutoffs</h2>\n<table style="font-size:12px;border-collapse:collapse">\n<thead><tr><th style="text-align:left">Instrument</th><th style="text-align:left">Severity / Cutoff</th></tr></thead>\n<tbody>\n<tr><td>PHQ-9</td><td>0–4 minimal; 5–9 mild; 10–14 moderate; 15–19 moderately severe; 20–27 severe</td></tr>\n<tr><td>GAD-7</td><td>5 mild; 10 moderate; 15 severe</td></tr>\n<tr><td>AUDIT-C</td><td>≥4 men / ≥3 women suggests hazardous use (institutional thresholds vary)</td></tr>\n<tr><td>DAST-10</td><td>1–2 low; 3–5 moderate; 6–8 substantial; 9–10 severe</td></tr>\n<tr><td>MDQ</td><td>Positive: symptom threshold + clustering + functional impact (rules vary)</td></tr>\n</tbody></table>\n<p style="font-size:12px">Use instrument manuals / local policies for diagnostic thresholds; list is for initial triage.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines.</p>\n`,
    prompts: [
      { id: 'scales-pick-initial', label: 'Pick initial screens', template: 'Given the vignette, select 2–3 initial screening instruments (justify each in one line). Vignette: {{vignette}}', variables:[{ key:'vignette', label:'Vignette', type:'multiline' }] },
      { id: 'scales-cutoff-reasoning', label: 'Cutoff reasoning', template: 'Explain PHQ-9 and GAD-7 cutoff logic and how it guides next-visit planning (≤120 words). Current PHQ-9: {{phq9}}; Current GAD-7: {{gad7}}', variables:[{ key:'phq9', label:'PHQ-9', type:'text' },{ key:'gad7', label:'GAD-7', type:'text' }] }
    ],
    evidence: []
  },

  {
    id: 'mbc-logic-thresholds',
    title: 'MBC — Response & Remission Logic',
    sectionId: 'mbc',
    summary: 'Defines response, partial response, non-response, remission, and visit cadence anchors for serial PHQ-9 / GAD-7.',
    html: `\n<h2>MBC — Response & Remission Logic</h2>\n<ul>\n  <li><strong>Response:</strong> ≥50% reduction from baseline score.</li>\n  <li><strong>Partial response:</strong> 25–49% reduction.</li>\n  <li><strong>Non-response:</strong> &lt;25% reduction or worsening.</li>\n  <li><strong>Remission (PHQ-9):</strong> total ≤4 maintained across ≥2 visits (2–4 weeks apart depending on cadence).</li>\n  <li><strong>Visit cadence (example):</strong> weekly/biweekly early; extend when stable/remitted.</li>\n  <li><strong>GAD-7:</strong> apply same % change logic; anchor severities at 5 / 10 / 15.</li>\n</ul>\n<p><em>Reminder:</em> Use serial measurement, not single-visit scores, to guide adjustments.</p>\n`,
    prompts: [
      { id:'mbc-compute-status', label:'Compute status', template:'Given baseline PHQ-9 {{baseline_phq9}} (date {{baseline_date}}) and current PHQ-9 {{current_phq9}} (date {{current_date}}), compute % change and classify as response / partial / non-response / remission.', variables:[{ key:'baseline_phq9', label:'Baseline PHQ-9', type:'text' },{ key:'baseline_date', label:'Baseline Date', type:'date' },{ key:'current_phq9', label:'Current PHQ-9', type:'text' },{ key:'current_date', label:'Current Date', type:'date' }] },
      { id:'mbc-plan-suggest', label:'Plan suggestion', template:'Based on serial scores (baseline {{baseline_phq9}} → current {{current_phq9}}) and context {{context}}, suggest next-step plan cadence (monitor interval + flags).', variables:[{ key:'baseline_phq9', label:'Baseline PHQ-9', type:'text' },{ key:'current_phq9', label:'Current PHQ-9', type:'text' },{ key:'context', label:'Clinical Context', type:'multiline' }] }
    ],
    evidence: []
  },

  {
    id: 'dx-formulation-5ps',
    title: 'Diagnostic Formulation — 5 Ps (Structured)',
    sectionId: 'diagnosis',
    summary: 'Structured 5Ps (Presenting, Predisposing, Precipitating, Perpetuating, Protective) with biopsychosocial & working dx placeholders.',
    html: `\n<h2>5Ps Formulation — Structured</h2>\n<ul style="font-size:12px">\n  <li><strong>Presenting:</strong> {{presenting}}</li>\n  <li><strong>Predisposing:</strong> {{predisposing}}</li>\n  <li><strong>Precipitating:</strong> {{precipitating}}</li>\n  <li><strong>Perpetuating:</strong> {{perpetuating}}</li>\n  <li><strong>Protective:</strong> {{protective}}</li>\n</ul>\n<h3>Biopsychosocial Summary</h3>\n<p>{{bps_summary}}</p>\n<h3>Working Diagnosis & Rule-outs</h3>\n<p>{{working_dx}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-5ps-paragraph', label:'Compose 5Ps paragraph', template:'Convert the 5Ps fields into a cohesive biopsychosocial formulation (≤160 words). Presenting: {{presenting}} Predisposing: {{predisposing}} Precipitating: {{precipitating}} Perpetuating: {{perpetuating}} Protective: {{protective}} Summary: {{bps_summary}} Working Dx: {{working_dx}}' },
      { id:'dx-5ps-apso', label:'APSO from 5Ps', template:'Derive a concise APSO note from the 5Ps, include risk & functional impact. Presenting {{presenting}} Predisposing {{predisposing}} Precipitating {{precipitating}} Perpetuating {{perpetuating}} Protective {{protective}} Working Dx {{working_dx}} Summary {{bps_summary}}' }
    ],
    evidence: []
  },
  {
    id: 'dx-differential-matrix',
    title: 'Differential Diagnosis Matrix (Key Discriminators)',
    sectionId: 'diagnosis',
    summary: 'Compact discriminator list across mood, anxiety, psychosis, neurodevelopmental, substance, somatic and personality contexts.',
    html: `\n<h2>Differential Diagnosis Matrix — Key Discriminators</h2>\n<ul style="font-size:12px">\n  <li><strong>MDD vs Bipolar depression:</strong> episodicity; history of mania/hypomania; ↓sleep with ↑energy.</li>\n  <li><strong>Anxiety spectrum:</strong> GAD (worry domain breadth); Panic (abrupt surges); Social (performance/scrutiny); PTSD (exposure + intrusion/avoidance); OCD (ego-dystonic obsessions/compulsions, insight).</li>\n  <li><strong>Psychosis vs secondary:</strong> substance timeline; delirium fluctuation; neurologic signs; visual/olfactory phenomena (secondary more common).</li>\n  <li><strong>Adult ADHD vs Autism:</strong> childhood onset + multi-setting in ADHD; developmental social-communication + restricted patterns in Autism.</li>\n  <li><strong>Other considerations:</strong> substance/medication-induced; somatic symptom focus; personality (pervasive/trait-like); adjustment (stressor-linked, time-limited).</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-top3-differential', label:'Top-3 differential', template:'From the vignette, pick top 3 diagnoses with pro/con bullets and next tests. Vignette: {{vignette}}', variables:[{ key:'vignette', label:'Vignette', type:'multiline' }] },
      { id:'dx-ruleout-labs', label:'Rule-out set', template:'List prudent rule-out labs/checks for this presentation (neutral, non-jurisdictional). Presentation: {{presentation}}', variables:[{ key:'presentation', label:'Presentation Summary', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-med-neuro-red-flags',
    title: 'Medical/Neurological Red Flags (Escalation Outline)',
    sectionId: 'diagnosis',
    summary: 'Non-exhaustive medical & neurologic red flags prompting escalation and medical liaison.',
    html: `\n<h2>Medical / Neurological Red Flags — Outline</h2>\n<p><strong>Examples (non-exhaustive):</strong> fever/neck stiffness, new severe headache, focal neuro deficits, seizures, rapidly fluctuating consciousness, postpartum psychosis, NMS/serotonin toxicity features, steroid-induced symptoms, thyroid extremes, B12 deficiency, autoimmune encephalitis suspicion, tox screens.</p>\n<p><strong>Action:</strong> Escalate per local emergency pathways; clear handoff (time course, interventions, vitals).</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-redflag-liaison', label:'Liaison note', template:'Draft a concise liaison note to the medical team with red flags and immediate asks. Red Flags: {{red_flags}} Immediate Needs: {{needs}}', variables:[{ key:'red_flags', label:'Red Flags', type:'multiline' },{ key:'needs', label:'Immediate Needs', type:'multiline' }] },
      { id:'dx-redflag-checklist', label:'Rule-out checklist', template:'Generate a bedside checklist for urgent medical causes to exclude. Presentation: {{presentation}}', variables:[{ key:'presentation', label:'Presentation Summary', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-mania-hypomania-gate',
    title: 'Mania/Hypomania Gate (Mixed Features Aware)',
    sectionId: 'diagnosis',
    summary: 'Structured gate for elevated/irritable mood episodes including mixed features and antidepressant-emergent switches.',
    html: `\n<h2>Mania / Hypomania Gate</h2>\n<ul style="font-size:12px">\n  <li><strong>Mood (elevated/irritable):</strong> {{mood}}</li>\n  <li><strong>Goal-directed activity / energy:</strong> {{energy}}</li>\n  <li><strong>Decreased need for sleep:</strong> {{sleep}}</li>\n  <li><strong>Pressured speech:</strong> {{speech}}</li>\n  <li><strong>Grandiosity:</strong> {{grandiosity}}</li>\n  <li><strong>Racing thoughts / flight:</strong> {{thoughts}}</li>\n  <li><strong>Risk behaviors:</strong> {{risk_behaviors}}</li>\n  <li><strong>Duration & impairment:</strong> {{duration_impairment}}</li>\n  <li><strong>Antidepressant-induced switch:</strong> {{switch}}</li>\n  <li><strong>Mixed features (depressive signs present):</strong> {{mixed_features}}</li>\n  <li><strong>Family history (bipolar/psychosis):</strong> {{family_hx}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-mania-screen-narrative', label:'Screen from narrative', template:'From the narrative, extract evidence for/against mania/hypomania and state a gate result. Narrative: {{narrative}}', variables:[{ key:'narrative', label:'Narrative', type:'multiline' }] },
      { id:'dx-mania-psychoeducation', label:'Psychoeducation', template:'Write a 120-word neutral explanation of bipolar spectrum and why screening matters. Context: {{context}}', variables:[{ key:'context', label:'Context', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-psychosis-primary-secondary',
    title: 'Primary vs Secondary Psychosis (Outline)',
    sectionId: 'diagnosis',
    summary: 'Outline contrasting primary psychotic disorders vs secondary causes (substance, delirium, neurologic, medical).',
    html: `\n<h2>Primary vs Secondary Psychosis — Outline</h2>\n<ul style="font-size:12px">\n  <li><strong>Onset tempo:</strong> {{onset}}</li>\n  <li><strong>Mood congruence:</strong> {{mood_congruence}}</li>\n  <li><strong>Negative vs depressive features:</strong> {{negative_depressive}}</li>\n  <li><strong>Substance timeline:</strong> {{substance_timeline}}</li>\n  <li><strong>Visual/olfactory phenomena:</strong> {{sensory}}</li>\n  <li><strong>Cognitive decline:</strong> {{cognitive_decline}}</li>\n  <li><strong>Neurologic signs:</strong> {{neuro_signs}}</li>\n  <li><strong>Medication/medical contributors:</strong> {{contributors}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-psychosis-grid', label:'Differential grid', template:'Create a brief grid contrasting primary vs secondary psychosis for this case (evidence & gaps). Case: {{case}}', variables:[{ key:'case', label:'Case Narrative', type:'multiline' }] },
      { id:'dx-psychosis-safety-triggers', label:'Safety triggers', template:'List safety triggers that would escalate care level within 24–48h. Current Presentation: {{presentation}}', variables:[{ key:'presentation', label:'Presentation', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-anxiety-navigator',
    title: 'Anxiety-Related Spectrum Navigator',
    sectionId: 'diagnosis',
    summary: 'Discriminators across GAD, Panic, Social Anxiety, OCD, PTSD, Illness Anxiety, Somatic Symptom disorders.',
    html: `\n<h2>Anxiety-Related Spectrum Navigator</h2>\n<p style="font-size:12px"><strong>Discriminators:</strong> time course, triggers, avoidance pattern, bodily focus vs intrusive thoughts, compulsions/rituals, trauma exposure + intrusion/avoidance (PTSD), illness preoccupation (Illness Anxiety), symptom amplification (Somatic Symptom), social evaluation fear (Social), pervasive worry (GAD), episodic surges (Panic).</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-anxiety-initial-track', label:'Initial track', template:'Choose 2–3 initial screens and suggest therapy vs medication-first rationale (≤120 words). Case: {{case}}', variables:[{ key:'case', label:'Case Narrative', type:'multiline' }] },
      { id:'dx-anxiety-comorbidity-flags', label:'Comorbidity flags', template:'List red flags suggesting comorbidity (depression, SUD, OCD/PTSD overlap). Data: {{data}}', variables:[{ key:'data', label:'Data', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-adhd-adult-scaffold',
    title: 'Adult ADHD — Diagnostic Scaffold (Non-proprietary)',
    sectionId: 'diagnosis',
    summary: 'Adult ADHD diagnostic scaffold with childhood onset, multi-setting impairment, rule-outs and collateral placeholders.',
    html: `\n<h2>Adult ADHD — Diagnostic Scaffold</h2>\n<ul style="font-size:12px">\n  <li><strong>Childhood onset evidence:</strong> {{childhood_onset}}</li>\n  <li><strong>Multi-setting impairment:</strong> {{multi_setting}}</li>\n  <li><strong>Functional examples:</strong> {{functional_examples}}</li>\n  <li><strong>Collateral sources:</strong> {{collateral_sources}}</li>\n  <li><strong>Sleep deprivation screen:</strong> {{sleep_screen}}</li>\n  <li><strong>Rule-outs (mood/anxiety/SUD):</strong> {{ruleouts}}</li>\n  <li><strong>Note:</strong> Use locally approved rating scales.</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-adhd-summary', label:'Diagnostic summary', template:'Compose an ADHD diagnostic summary with evidence, impairment, and rule-outs. Data: Childhood {{childhood_onset}} Impairment {{multi_setting}} Functional {{functional_examples}} Rule-outs {{ruleouts}} Collateral {{collateral_sources}}', variables:[{ key:'childhood_onset', label:'Childhood Onset', type:'multiline' },{ key:'multi_setting', label:'Multi-setting Impairment', type:'multiline' },{ key:'functional_examples', label:'Functional Examples', type:'multiline' },{ key:'ruleouts', label:'Rule-outs', type:'multiline' },{ key:'collateral_sources', label:'Collateral Sources', type:'multiline' }] },
      { id:'dx-adhd-next-steps', label:'Next steps', template:'Outline next steps (collateral, rating scales, sleep screen, comorbidity checks). Current Data: {{data}}', variables:[{ key:'data', label:'Current Data', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-autism-adult-triage',
    title: 'Autism (Adult) — Brief Triage',
    sectionId: 'diagnosis',
    summary: 'Adult autism triage scaffold: developmental & social-communication history, RRBs, sensory profile, masking, strengths, referral criteria.',
    html: `\n<h2>Autism (Adult) — Brief Triage</h2>\n<ul style="font-size:12px">\n  <li><strong>Developmental & social-communication history:</strong> {{developmental_history}}</li>\n  <li><strong>Restricted/repetitive patterns:</strong> {{rrb}}</li>\n  <li><strong>Sensory profile:</strong> {{sensory}}</li>\n  <li><strong>Masking / camouflage:</strong> {{masking}}</li>\n  <li><strong>Strengths / interests:</strong> {{strengths}}</li>\n  <li><strong>ADHD co-occurrence check:</strong> {{adhd_check}}</li>\n  <li><strong>Referral criteria:</strong> {{referral_criteria}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-autism-referral-note', label:'Referral note', template:'Draft a neutral neuropsych referral note with reason, specific questions, and required materials. Data: {{data}}', variables:[{ key:'data', label:'Data', type:'multiline' }] },
      { id:'dx-autism-accommodations', label:'Accommodations', template:'List work/academic accommodations tailored to the profile provided. Profile: {{profile}}', variables:[{ key:'profile', label:'Profile', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-personality-frame',
    title: 'Personality Traits vs Disorders — Clinical Frame',
    sectionId: 'diagnosis',
    summary: 'Clinical frame distinguishing trait patterns vs disorders; alliance and modality considerations.',
    html: `\n<h2>Personality Traits vs Disorders — Clinical Frame</h2>\n<p style="font-size:12px"><strong>Consider:</strong> pervasiveness, stability, impairment; OCPD vs OCD (egosyntonic rigidity vs obsessions/compulsions), BPD core patterns (affect instability, identity disturbance, impulsivity), Avoidant (social inhibition + feelings of inadequacy), Narcissistic (grandiosity + need for admiration), crisis/attachment triggers, alliance strategies.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-personality-formulation', label:'Formulation addendum', template:'Write a personality formulation addendum (patterns, risks, therapy implications). Data: {{data}}', variables:[{ key:'data', label:'Data', type:'multiline' }] },
      { id:'dx-personality-modalities', label:'Modality suggestion', template:'Suggest candidate therapy modalities with one-line rationale each. Patterns: {{patterns}}', variables:[{ key:'patterns', label:'Patterns', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'dx-provisional-builder',
    title: 'Provisional Diagnosis Builder (Specifiers & Notes)',
    sectionId: 'diagnosis',
    summary: 'Fields for diagnosis name, specifiers, severity, rule-outs, context codes, and rationale.',
    html: `\n<h2>Provisional Diagnosis Builder</h2>\n<ul style="font-size:12px">\n  <li><strong>Diagnosis name:</strong> {{dx_name}}</li>\n  <li><strong>Specifiers:</strong> {{specifiers}}</li>\n  <li><strong>Severity:</strong> {{severity}}</li>\n  <li><strong>Medical/substance rule-outs:</strong> {{ruleouts}}</li>\n  <li><strong>Z-codes / Context:</strong> {{zcodes}}</li>\n  <li><strong>Rationale:</strong> {{rationale}}</li>\n</ul>\n<p><em>Note:</em> Add ICD code per your local coding sheet/payer rules.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with DSM/ICD manuals and local policies.</p>\n`,
    prompts: [
      { id:'dx-build-list', label:'Build diagnostic list', template:'From the case, compose a prioritized diagnostic list with specifiers/severity and one-line rationale each. Case: {{case}}', variables:[{ key:'case', label:'Case Narrative', type:'multiline' }] },
      { id:'dx-coding-note', label:'Coding note skeleton', template:'Create a neutral coding note skeleton (diagnosis → specifiers → code placeholder). Diagnoses: {{diagnoses}}', variables:[{ key:'diagnoses', label:'Diagnoses', type:'multiline' }] }
    ],
    evidence: []
  },

  {
    id: 'tp-smart-goals-builder',
    title: 'Treatment Plan Builder — SMART Goals',
    sectionId: 'treatment_plan',
    summary: 'Comprehensive treatment planning: SMART goals, stepped care, SDM, level of care, and relapse prevention.',
    html: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>PsyTx Right Panel — Treatment Planning & Interventions</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root {
      color-scheme: light dark;
      --bg: light-dark(#f7f7f8, #0f1115);
      --panel: light-dark(#ffffff, #151922);
      --card: light-dark(#fcfcfd, #171b24);
      --muted: light-dark(#eef0f3, #1d2430);
      --text: light-dark(#0a0a0b, #e9edf5);
      --text-muted: light-dark(#444950, #c5cbda);
      --accent: #4f8cff;
      --accent-2: #7dd3fc;
      --success: #10b981;
      --warn: #f59e0b;
      --danger: #ef4444;
      --chip: light-dark(#eef4ff, #19304e);
      --badge-on: #10b981;
      --badge-risk: #f59e0b;
      --badge-off: #ef4444;
      --focus: #a855f7;
      --sep: light-dark(#e7e9ee, #2b3444);
      --shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08);
      --radius: 10px;
      --radius-sm: 8px;
      --radius-xs: 6px;
      --kbd: light-dark(#f3f4f6, #273043);
    }
    html, body {
      margin: 0;
      padding: 0;
      background: var(--bg);
      color: var(--text);
      font: 14px/1.5 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, "Apple Color Emoji","Segoe UI Emoji";
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
    }
    a { color: var(--accent); text-decoration: none; }
    a:focus, button:focus, [role="tab"]:focus, [role="button"]:focus, summary:focus, input:focus, select:focus, textarea:focus {
      outline: 2px solid var(--focus);
      outline-offset: 2px;
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--focus) 40%, transparent);
    }
    .banner {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: linear-gradient(90deg, color-mix(in srgb, var(--warn) 35%, transparent), transparent);
      border-bottom: 1px solid var(--sep);
      color: var(--text);
      padding: 10px 16px;
      display: flex;
      align-items: start;
      gap: 12px;
    }
    .banner button {
      margin-left: auto;
      background: transparent;
      color: inherit;
      border: 1px solid var(--sep);
      border-radius: var(--radius-xs);
      padding: 6px 10px;
      cursor: pointer;
    }
    header {
      position: sticky;
      top: 44px;
      z-index: 999;
      background: var(--panel);
      border-bottom: 1px solid var(--sep);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      gap: 12px;
    }
    .title {
      display: flex;
      gap: 10px;
      align-items: baseline;
    }
    .title h1 {
      font-size: 16px;
      margin: 0;
      font-weight: 700;
    }
    .kpi {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      background: var(--chip);
      color: var(--text);
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid var(--sep);
      font-weight: 600;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }
    .toolbar button, .toolbar .toggle {
      background: linear-gradient(180deg, color-mix(in srgb, var(--panel) 80%, white), color-mix(in srgb, var(--panel) 60%, black));
      color: var(--text);
      border: 1px solid var(--sep);
      border-radius: var(--radius-xs);
      padding: 8px 12px;
      cursor: pointer;
    }
    .toolbar .toggle[aria-pressed="true"] {
      border-color: var(--accent);
      box-shadow: inset 0 0 0 1px var(--accent);
    }
    main {
      padding: 16px;
      max-width: 1100px;
      margin: 0 auto;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--sep);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .section {
      margin-bottom: 16px;
    }
    .accordion {
      display: grid;
      gap: 10px;
    }
    .acc-item {
      overflow: clip;
      border: 1px solid var(--sep);
      border-radius: var(--radius);
      background: var(--panel);
    }
    .acc-trigger {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 12px 14px;
      background: transparent;
      color: var(--text);
      border: none;
      cursor: pointer;
      text-align: left;
    }
    .acc-trigger h3 {
      font-size: 15px;
      margin: 0;
    }
    .acc-trigger .chev {
      transition: transform .2s ease;
    }
    .acc-trigger[aria-expanded="true"] .chev {
      transform: rotate(90deg);
    }
    .acc-panel {
      display: none;
      padding: 12px;
      border-top: 1px solid var(--sep);
      background: linear-gradient(180deg, color-mix(in srgb, var(--panel) 92%, white), color-mix(in srgb, var(--panel) 96%, black));
    }
    .acc-panel[aria-hidden="false"] {
      display: block;
    }
    .tabs {
      margin-top: 4px;
    }
    .tablist {
      display: flex;
      gap: 6px;
      list-style: none;
      padding: 0;
      margin: 0 0 8px 0;
      border-bottom: 1px solid var(--sep);
      overflow: auto hidden;
    }
    .tablist li { display: contents; }
    [role="tab"] {
      border: 1px solid var(--sep);
      border-bottom: none;
      border-radius: var(--radius-xs) var(--radius-xs) 0 0;
      padding: 8px 12px;
      background: color-mix(in srgb, var(--panel) 85%, white);
      cursor: pointer;
      color: var(--text);
    }
    [role="tab"][aria-selected="true"] {
      background: var(--card);
      font-weight: 700;
      box-shadow: 0 -1px 0 var(--accent) inset;
    }
    .tabpanel {
      display: none;
      border: 1px solid var(--sep);
      border-radius: 0 0 var(--radius) var(--radius);
      background: var(--card);
      padding: 12px;
    }
    .tabpanel[aria-hidden="false"] { display: block; }
    .infocards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 10px;
    }
    .infocard {
      border: 1px solid var(--sep);
      border-radius: var(--radius-sm);
      padding: 10px;
      background: linear-gradient(180deg, color-mix(in srgb, var(--card) 90%, white), color-mix(in srgb, var(--card) 95%, black));
    }
    .infocard h4 {
      margin: 0 0 6px 0;
      font-size: 14px;
    }
    .pearl, .pitfall, .measure {
      margin-top: 6px;
      font-size: 12px;
      padding: 6px 8px;
      border-radius: var(--radius-xs);
      border: 1px dashed var(--sep);
      background: color-mix(in srgb, var(--chip) 70%, transparent);
    }
    .pitfall { background: color-mix(in srgb, var(--danger) 20%, transparent); }
    .pearl { background: color-mix(in srgb, var(--success) 18%, transparent); }
    .measure { background: color-mix(in srgb, var(--accent) 15%, transparent); }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 999px;
      border: 1px solid var(--sep);
      background: var(--chip);
      font-size: 12px;
      font-weight: 600;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      color: white;
    }
    .on { background: var(--badge-on); }
    .risk { background: var(--badge-risk); }
    .off { background: var(--badge-off); }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 10px;
    }
    .col-12 { grid-column: span 12; }
    .col-6 { grid-column: span 6; }
    .col-4 { grid-column: span 4; }
    .col-3 { grid-column: span 3; }
    .col-2 { grid-column: span 2; }
    .field {
      display: grid;
      gap: 4px;
    }
    label { font-weight: 600; color: var(--text); }
    input[type="text"], input[type="number"], input[type="date"], select, textarea {
      width: 100%;
      padding: 8px 10px;
      border-radius: var(--radius-xs);
      border: 1px solid var(--sep);
      background: light-dark(#fff, #111828);
      color: var(--text);
    }
    textarea { min-height: 80px; resize: vertical; }
    .help { color: var(--text-muted); font-size: 12px; }
    .error {
      color: white; background: var(--danger); border-radius: var(--radius-xs);
      padding: 6px 8px; font-size: 12px;
    }
    .sr-only {
      position: absolute !important;
      width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;
    }
    .table-wrap {
      border: 1px solid var(--sep);
      border-radius: var(--radius-sm);
      overflow: auto;
      background: var(--card);
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      min-width: 640px;
    }
    thead th {
      position: sticky; top: 0;
      background: color-mix(in srgb, var(--card) 90%, white);
      border-bottom: 1px solid var(--sep);
      text-align: left;
      padding: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .02em;
    }
    tbody td {
      border-top: 1px solid var(--sep);
      padding: 8px;
    }
    tbody tr:nth-child(even) td {
      background: color-mix(in srgb, var(--card) 94%, white);
    }
    .row-actions button {
      border: 1px solid var(--sep);
      background: transparent;
      color: var(--text);
      padding: 4px 8px;
      border-radius: var(--radius-xs);
      cursor: pointer;
    }
    .kbd {
      background: var(--kbd); border: 1px solid var(--sep); border-bottom-width: 2px;
      padding: 1px 5px; border-radius: 4px; font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;
      font-size: 12px;
    }
    .inline { display: inline-flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .sep { height: 1px; background: var(--sep); margin: 8px 0; }
    .muted { color: var(--text-muted); }
    .right { margin-left: auto; }
    .no-print { }
    .print-area { display: none; }
    @media print {
      .banner, header, .no-print, .tablist, .acc-trigger, .toolbar, .actions, .json-wrap { display: none !important; }
      .acc-panel, .tabpanel { display: block !important; }
      body { background: #fff; color: #000; }
      .print-area { display: block !important; }
      .card, .acc-item, .tabpanel { border-color: #888 !important; box-shadow: none !important; }
      a { color: #000; }
    }
  </style>
</head>
<body>
  <div class="banner" role="region" aria-label="Disclaimer banner" id="disclaimer-banner">
    <div>
      <strong>Disclaimer:</strong>
      <span>This tool supports clinical workflow and does not replace clinical judgment or local policies.</span>
    </div>
    <button type="button" class="no-print" aria-label="Dismiss disclaimer" id="dismiss-banner">Dismiss</button>
  </div>

  <header role="banner">
    <div class="title">
      <h1>Treatment Planning (Right Panel)</h1>
      <span class="kpi" id="header-kpi">PHQ‑9: <strong id="kpi-phq">–</strong> | Band: <strong id="kpi-band">–</strong></span>
    </div>
    <div class="toolbar">
      <button type="button" id="printBtn" title="Print this plan (Ctrl/Cmd+P)"><span aria-hidden="true">🖨</span> Print</button>
      <button type="button" id="copyBtn" title="Export and copy JSON summary"><span aria-hidden="true">📋</span> Copy JSON</button>
      <button type="button" class="toggle" id="toggleJson" aria-pressed="false" aria-controls="jsonArea">Show JSON</button>
    </div>
  </header>

  <main role="main">
    <p class="muted">Keyboard: <span class="kbd">Tab</span>/<span class="kbd">Shift+Tab</span> to move, <span class="kbd">Enter</span>/<span class="kbd">Space</span> to toggle accordions & tabs, <span class="kbd">←</span>/<span class="kbd">→</span> to move across tabs, <span class="kbd">Home</span>/<span class="kbd">End</span> to jump.</p>

    <div aria-live="polite" aria-atomic="true" class="sr-only" id="live"></div>

    <section class="json-wrap section card" id="jsonWrap" style="display:none;">
      <fieldset style="border:none; margin:0; padding:12px;">
        <legend class="sr-only">JSON export</legend>
        <label for="jsonArea">Exported JSON summary</label>
        <textarea id="jsonArea" readonly spellcheck="false"></textarea>
        <p class="help">This read-only JSON is generated from the Example forms across sections. Use Copy JSON above to place it on the clipboard.</p>
      </fieldset>
    </section>

    <section class="accordion" aria-label="Right panel accordions" id="accordionRoot">
      <section class="acc-item" id="acc1">
        <button class="acc-trigger" aria-expanded="false" aria-controls="acc1-panel" id="acc1-trigger">
          <h3>ACCORDION 1 — Treatment Plan Builder — SMART Goals</h3>
          <span class="chev" aria-hidden="true">›</span>
        </button>
        <div class="acc-panel" id="acc1-panel" role="region" aria-labelledby="acc1-trigger" aria-hidden="true">
          <div class="tabs">
            <ul class="tablist" role="tablist" aria-label="Treatment Plan tabs" id="tp-tablist">
              <li><button role="tab" id="tp-tab-info" aria-controls="tp-panel-info" aria-selected="true" tabindex="0">Info</button></li>
              <li><button role="tab" id="tp-tab-example" aria-controls="tp-panel-example" aria-selected="false" tabindex="-1">Example</button></li>
              <li><button role="tab" id="tp-tab-prompts" aria-controls="tp-panel-prompts" aria-selected="false" tabindex="-1">Prompts</button></li>
              <li><button role="tab" id="tp-tab-refs" aria-controls="tp-panel-refs" aria-selected="false" tabindex="-1">References</button></li>
            </ul>
            <div class="tabpanel" id="tp-panel-info" role="tabpanel" aria-labelledby="tp-tab-info" aria-hidden="false">
              <div class="infocards">
                <article class="infocard">
                  <h4>Purpose & Scope</h4>
                  <p>Convert problems → SMART goals linked to diagnosis, functional impairment, and risk.</p>
                  <div class="pearl">Clinical Pearl: Tie each goal to a measurable anchor and a decision date.</div>
                  <div class="pitfall">Pitfall: Setting vague goals without numeric anchors or owner.</div>
                  <div class="measure">Threshold: Review 4–6 wks; escalation if no ≥50% symptom reduction.</div>
                </article>
                <article class="infocard">
                  <h4>SMART — Specific</h4>
                  <p>Target symptom/behavior + context + responsible actor.</p>
                  <div class="pearl">Use behavior + situation statements to concretize.</div>
                </article>
                <article class="infocard">
                  <h4>SMART — Measurable</h4>
                  <p>Numeric anchors (PHQ‑9, GAD‑7, ISI, sleep% etc.).</p>
                  <div class="measure">Response ≥50%, Partial 25–49%, Remission PHQ‑9 ≤4 sustained ≥2 visits.</div>
                </article>
                <article class="infocard">
                  <h4>SMART — Achievable</h4>
                  <p>Feasibility: literacy, time, EF, transport, cost.</p>
                  <div class="pitfall">Over-ambitious targets impair adherence.</div>
                </article>
                <article class="infocard">
                  <h4>SMART — Relevant</h4>
                  <p>Values/preferences (SDM), role functioning, comorbidity.</p>
                  <div class="pearl">Use option grid to align preferences.</div>
                </article>
                <article class="infocard">
                  <h4>SMART — Time-bound</h4>
                  <p>Deadline with milestones; review q1–2 wks early then q4–6 wks.</p>
                </article>
                <article class="infocard">
                  <h4>Risk-Informed Planning</h4>
                  <p>Current SI/HI, access to means, protections; crisis instructions.</p>
                  <div class="pitfall">Ignoring risk overrides undermines safety.</div>
                </article>
                <article class="infocard">
                  <h4>Review & Escalation</h4>
                  <p>Auto-label On-Track / At-Risk / Off-Track by progress vs target and risk.</p>
                </article>
              </div>
            </div>
            <div class="tabpanel" id="tp-panel-example" role="tabpanel" aria-labelledby="tp-tab-example" aria-hidden="true">
              <p class="help">Example form content would be here. (Fully interactive forms require external script deployment.)</p>
            </div>
            <div class="tabpanel" id="tp-panel-prompts" role="tabpanel" aria-labelledby="tp-tab-prompts" aria-hidden="true">
              <ul>
                <li>create a code in html as a form that converts problem list items into SMART goals with baseline/current/target metrics, auto-computes % change, and labels status as on-track/at-risk/off-track.</li>
                <li>compose a code in html as a page that implements measurement-based care for depression with PHQ-9 baselines, response thresholds (≥50%), and remission checks (≤4) tied to review cadence.</li>
                <li>make a code in html for a repeatable SMART goal block with milestone sub-rows, owner assignment, and feasibility checklist that gates submission if time-bound fields are empty.</li>
                <li>create a code in html as a printable treatment plan summary that aggregates all goals, interventions, and next review dates, with a signature section.</li>
                <li>compose a code in html for an adherence &amp; barriers panel listing side-effects and mitigation actions with free-text rationales.</li>
                <li>make a code in html that validates all SMART fields and shows accessible error messages with aria-live feedback.</li>
                <li>create a code in html as a matrix for psychotherapy modules (CBT/ACT/IPT) with frequency and homework tracking.</li>
                <li>compose a code in html to export the plan to a JSON textarea and include a "Copy to clipboard" button (no external JS).</li>
                <li>make a code in html that renders color badges based on computed progress thresholds and risk overrides.</li>
                <li>create a code in html to map "values &amp; preferences" into relevance scoring that must be ≥3/5 before marking goal as relevant.</li>
                <li>compose a code in html that includes sleep efficiency calculator (total sleep time / time in bed %) as a measurable SMART metric.</li>
                <li>make a code in html that attaches a dynamic safety section with crisis steps and escalation triggers linked to risk color.</li>
                <li>create a code in html to schedule review cadence (weekly/biweekly/monthly) and show the next three dates in a mini timeline.</li>
                <li>compose a code in html for a medication titration note block embedded inside a SMART goal with start/dose/side-effect watchlist.</li>
                <li>make a code in html for a progress dashboard of all goals with filters by owner, modality, and next review date.</li>
              </ul>
            </div>
            <div class="tabpanel" id="tp-panel-refs" role="tabpanel" aria-labelledby="tp-tab-refs" aria-hidden="true">
              <ol style="line-height:1.8;">
                <li><strong>Doran GT (1981).</strong> There's a S.M.A.R.T. way to write management's goals and objectives. <em>Management Review</em>, 70(11), 35-36.</li>
                <li><strong>Bovend'Eerdt TJH, Botell RE, Wade DT (2009).</strong> Writing SMART rehabilitation goals and achieving goal attainment scaling: a practical guide. <em>Clinical Rehabilitation</em>, 23(4), 352-361.</li>
                <li><strong>American Psychiatric Association (2023).</strong> Practice Guideline for the Treatment of Patients with Major Depressive Disorder (4th Edition). <em>APA Practice Guidelines</em>.</li>
                <li><strong>Zimmerman M, Martinez JH, Young D, et al. (2008).</strong> Severity classification on the Hamilton Depression Rating Scale. <em>Journal of Affective Disorders</em>, 150(2), 384-388.</li>
                <li><strong>Fortney JC, Unützer J, Wrenn G, et al. (2017).</strong> A tipping point for measurement-based care. <em>Psychiatric Services</em>, 68(2), 179-188.</li>
                <li><strong>National Institute for Health and Care Excellence (2022).</strong> Depression in adults: treatment and management. <em>NICE Guideline [NG222]</em>.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section class="acc-item" id="acc2">
        <button class="acc-trigger" aria-expanded="false" aria-controls="acc2-panel" id="acc2-trigger">
          <h3>ACCORDION 2 — Stepped Care Navigator (Severity → Cadence)</h3>
          <span class="chev" aria-hidden="true">›</span>
        </button>
        <div class="acc-panel" id="acc2-panel" role="region" aria-labelledby="acc2-trigger" aria-hidden="true">
          <div class="tabs">
            <ul class="tablist" role="tablist" aria-label="Stepped Care tabs" id="sc-tablist">
              <li><button role="tab" id="sc-tab-info" aria-controls="sc-panel-info" aria-selected="true" tabindex="0">Info</button></li>
              <li><button role="tab" id="sc-tab-example" aria-controls="sc-panel-example" aria-selected="false" tabindex="-1">Example</button></li>
              <li><button role="tab" id="sc-tab-prompts" aria-controls="sc-panel-prompts" aria-selected="false" tabindex="-1">Prompts</button></li>
              <li><button role="tab" id="sc-tab-refs" aria-controls="sc-panel-refs" aria-selected="false" tabindex="-1">References</button></li>
            </ul>
            <div class="tabpanel" id="sc-panel-info" role="tabpanel" aria-labelledby="sc-tab-info" aria-hidden="false">
              <div class="infocards">
                <article class="infocard">
                  <h4>Stepped Care Model</h4>
                  <p>Match intensity to severity & functional impairment. Start at lowest effective level, escalate if non-response.</p>
                  <div class="pearl">Clinical Pearl: Use PHQ-9/GAD-7 bands to trigger step changes automatically.</div>
                  <div class="measure">Threshold: Step up if ≥Moderate severity + no ≥50% improvement in 4–6 weeks.</div>
                </article>
                <article class="infocard">
                  <h4>Severity Bands</h4>
                  <p>PHQ-9: Minimal (0-4), Mild (5-9), Moderate (10-14), Mod-Severe (15-19), Severe (20-27).</p>
                  <p>GAD-7: Minimal (0-4), Mild (5-9), Moderate (10-14), Severe (15-21).</p>
                </article>
                <article class="infocard">
                  <h4>Visit Cadence</h4>
                  <p>Severe: Weekly × 4, then biweekly. Moderate: Biweekly × 4, then monthly. Mild: Monthly.</p>
                  <div class="pitfall">Pitfall: Insufficient follow-up cadence delays detection of non-response.</div>
                </article>
                <article class="infocard">
                  <h4>Step 1: Watchful Waiting</h4>
                  <p>Minimal-Mild, no risk, recent onset. Reassess 2 weeks.</p>
                </article>
                <article class="infocard">
                  <h4>Step 2: Low-Intensity</h4>
                  <p>Guided self-help, psychoeducation, behavioral activation.</p>
                </article>
                <article class="infocard">
                  <h4>Step 3: Moderate-Intensity</h4>
                  <p>CBT/IPT or SSRI/SNRI monotherapy. Standard outpatient care.</p>
                </article>
                <article class="infocard">
                  <h4>Step 4: High-Intensity</h4>
                  <p>Combination therapy (CBT + medication), intensive outpatient (IOP).</p>
                </article>
                <article class="infocard">
                  <h4>Step 5: Crisis/Inpatient</h4>
                  <p>Imminent risk, severe functional impairment, failed outpatient trials.</p>
                  <div class="pitfall">Pitfall: Delaying escalation when risk criteria met.</div>
                </article>
              </div>
            </div>
            <div class="tabpanel" id="sc-panel-example" role="tabpanel" aria-labelledby="sc-tab-example" aria-hidden="true">
              <p class="help">Interactive severity calculator and step recommendation form would be here.</p>
            </div>
            <div class="tabpanel" id="sc-panel-prompts" role="tabpanel" aria-labelledby="sc-tab-prompts" aria-hidden="true">
              <ul>
                <li>compose a code in html as a page that implements stepped care navigation with severity bands and visit cadence</li>
                <li>create a code in html as a triage form for PHQ-9/GAD-7 with auto-step assignment</li>
                <li>make a code in html for SDM option grid comparing CBT, SSRI/SNRT, Combined, and Watchful waiting</li>
                <li>compose a code in html to generate a visit schedule calendar based on severity band</li>
                <li>create a code in html with a stepped care flowchart showing escalation triggers</li>
              </ul>
            </div>
            <div class="tabpanel" id="sc-panel-refs" role="tabpanel" aria-labelledby="sc-tab-refs" aria-hidden="true">
              <ol style="line-height:1.8;">
                <li><strong>Bower P, Gilbody S (2005).</strong> Stepped care in psychological therapies. <em>British Journal of Psychiatry</em>, 186, 11-17.</li>
                <li><strong>Kroenke K, Spitzer RL, Williams JBW (2001).</strong> The PHQ-9: validity of a brief depression severity measure. <em>Journal of General Internal Medicine</em>, 16(9), 606-613.</li>
                <li><strong>Spitzer RL, Kroenke K, Williams JBW, Löwe B (2006).</strong> A brief measure for assessing generalized anxiety disorder. <em>Archives of Internal Medicine</em>, 166(10), 1092-1097.</li>
                <li><strong>NICE (2022).</strong> Depression in adults: treatment and management. <em>NICE Guideline [NG222]</em>.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section class="acc-item" id="acc3">
        <button class="acc-trigger" aria-expanded="false" aria-controls="acc3-panel" id="acc3-trigger">
          <h3>ACCORDION 3 — Shared Decision-Making (SDM) Script & Options</h3>
          <span class="chev" aria-hidden="true">›</span>
        </button>
        <div class="acc-panel" id="acc3-panel" role="region" aria-labelledby="acc3-trigger" aria-hidden="true">
          <div class="tabs">
            <ul class="tablist" role="tablist" aria-label="SDM tabs" id="sdm-tablist">
              <li><button role="tab" id="sdm-tab-info" aria-controls="sdm-panel-info" aria-selected="true" tabindex="0">Info</button></li>
              <li><button role="tab" id="sdm-tab-example" aria-controls="sdm-panel-example" aria-selected="false" tabindex="-1">Example</button></li>
              <li><button role="tab" id="sdm-tab-prompts" aria-controls="sdm-panel-prompts" aria-selected="false" tabindex="-1">Prompts</button></li>
              <li><button role="tab" id="sdm-tab-refs" aria-controls="sdm-panel-refs" aria-selected="false" tabindex="-1">References</button></li>
            </ul>
            <div class="tabpanel" id="sdm-panel-info" role="tabpanel" aria-labelledby="sdm-tab-info" aria-hidden="false">
              <div class="infocards">
                <article class="infocard">
                  <h4>SDM Core Principles</h4>
                  <p>Involve patients in treatment decisions, present options, elicit values & preferences, support autonomy.</p>
                  <div class="pearl">Clinical Pearl: Use option grids to visualize trade-offs between modalities.</div>
                  <div class="pitfall">Pitfall: Assuming one-size-fits-all treatment without discussing alternatives.</div>
                </article>
                <article class="infocard">
                  <h4>Treatment Options</h4>
                  <p>Psychotherapy (CBT, IPT, ACT), Pharmacotherapy (SSRI, SNRI), Combined, Watchful Waiting, Digital therapeutics.</p>
                </article>
                <article class="infocard">
                  <h4>Option Grid Dimensions</h4>
                  <p>Efficacy, Time to benefit, Side effects, Cost, Logistics, Patient preference alignment.</p>
                  <div class="measure">Threshold: Preference score ≥3/5 to mark option as aligned.</div>
                </article>
                <article class="infocard">
                  <h4>SDM Script Template</h4>
                  <p>"We have several options that can help. Let me walk you through the pros and cons of each..."</p>
                </article>
                <article class="infocard">
                  <h4>Values Clarification</h4>
                  <p>Ask: "What matters most to you? Speed? Avoiding meds? Talking it through?"</p>
                  <div class="pearl">Document patient's stated priorities in free text.</div>
                </article>
                <article class="infocard">
                  <h4>Informed Consent Elements</h4>
                  <p>Risks, benefits, alternatives, right to refuse, questions encouraged.</p>
                </article>
                <article class="infocard">
                  <h4>Cultural & Literacy Factors</h4>
                  <p>Tailor language, use teach-back, provide materials in preferred language.</p>
                  <div class="pitfall">Pitfall: Using jargon that reduces understanding and engagement.</div>
                </article>
                <article class="infocard">
                  <h4>Documenting SDM</h4>
                  <p>Record options discussed, patient's choice, rationale, and follow-up plan.</p>
                </article>
              </div>
            </div>
            <div class="tabpanel" id="sdm-panel-example" role="tabpanel" aria-labelledby="sdm-tab-example" aria-hidden="true">
              <p class="help">Interactive option grid and preference scoring form would be here.</p>
            </div>
            <div class="tabpanel" id="sdm-panel-prompts" role="tabpanel" aria-labelledby="sdm-tab-prompts" aria-hidden="true">
              <ul>
                <li>make a code in html for SDM option grid comparing CBT, SSRI/SNRI, Combined, and Watchful waiting</li>
                <li>create a code in html as a form for values clarification with 5-point Likert scales</li>
                <li>compose a code in html to generate patient-facing decision aid summary</li>
                <li>make a code in html that tracks SDM quality metrics (options discussed, patient choice documented)</li>
                <li>create a code in html with teach-back confirmation checklist</li>
              </ul>
            </div>
            <div class="tabpanel" id="sdm-panel-refs" role="tabpanel" aria-labelledby="sdm-tab-refs" aria-hidden="true">
              <ol style="line-height:1.8;">
                <li><strong>Elwyn G, Frosch D, Thomson R, et al. (2012).</strong> Shared decision making: a model for clinical practice. <em>Journal of General Internal Medicine</em>, 27(10), 1361-1367.</li>
                <li><strong>Charles C, Gafni A, Whelan T (1997).</strong> Shared decision-making in the medical encounter. <em>Social Science & Medicine</em>, 44(5), 681-692.</li>
                <li><strong>Stiggelbout AM, Van der Weijden T, De Wit MPT, et al. (2012).</strong> Shared decision making. <em>Health Expectations</em>, 15(1), 49-58.</li>
                <li><strong>Coulter A, Collins A (2011).</strong> Making shared decision-making a reality. <em>The King's Fund</em>.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section class="acc-item" id="acc4">
        <button class="acc-trigger" aria-expanded="false" aria-controls="acc4-panel" id="acc4-trigger">
          <h3>ACCORDION 4 — Care Level Criteria (OP / IOP / PHP / Inpatient)</h3>
          <span class="chev" aria-hidden="true">›</span>
        </button>
        <div class="acc-panel" id="acc4-panel" role="region" aria-labelledby="acc4-trigger" aria-hidden="true">
          <div class="tabs">
            <ul class="tablist" role="tablist" aria-label="Care Level tabs" id="loc-tablist">
              <li><button role="tab" id="loc-tab-info" aria-controls="loc-panel-info" aria-selected="true" tabindex="0">Info</button></li>
              <li><button role="tab" id="loc-tab-example" aria-controls="loc-panel-example" aria-selected="false" tabindex="-1">Example</button></li>
              <li><button role="tab" id="loc-tab-prompts" aria-controls="loc-panel-prompts" aria-selected="false" tabindex="-1">Prompts</button></li>
              <li><button role="tab" id="loc-tab-refs" aria-controls="loc-panel-refs" aria-selected="false" tabindex="-1">References</button></li>
            </ul>
            <div class="tabpanel" id="loc-panel-info" role="tabpanel" aria-labelledby="loc-tab-info" aria-hidden="false">
              <div class="infocards">
                <article class="infocard">
                  <h4>Level of Care Framework</h4>
                  <p>Match clinical severity, risk, functional impairment, and support needs to appropriate setting.</p>
                  <div class="pearl">Clinical Pearl: Use ASAM-like criteria to standardize placement decisions.</div>
                  <div class="measure">Threshold: Risk override always trumps severity-only assessment.</div>
                </article>
                <article class="infocard">
                  <h4>Outpatient (OP)</h4>
                  <p>Mild-Moderate severity, stable, no imminent risk, adequate support. Weekly to monthly visits.</p>
                </article>
                <article class="infocard">
                  <h4>Intensive Outpatient (IOP)</h4>
                  <p>Moderate-Severe, functional decline, needs structured daily support (3hrs/day, 3-5 days/week).</p>
                  <div class="pitfall">Pitfall: Keeping patient in standard OP when they need more structure.</div>
                </article>
                <article class="infocard">
                  <h4>Partial Hospitalization (PHP)</h4>
                  <p>Severe symptoms, high functional impairment, needs daily monitoring but not 24hr care (6hrs/day, 5 days/week).</p>
                </article>
                <article class="infocard">
                  <h4>Inpatient Psychiatric</h4>
                  <p>Imminent SI/HI with intent/plan, acute psychosis, severe agitation, failed lower levels.</p>
                  <div class="pitfall">Pitfall: Premature discharge without stabilization or safety plan.</div>
                </article>
                <article class="infocard">
                  <h4>Crisis Stabilization Unit</h4>
                  <p>Short-term (≤72hrs) for acute risk de-escalation before stepping down to lower level.</p>
                </article>
                <article class="infocard">
                  <h4>Medical Necessity Criteria</h4>
                  <p>Severity + impairment + risk + failed lower level + medical comorbidity.</p>
                </article>
                <article class="infocard">
                  <h4>Transition Planning</h4>
                  <p>Stepdown care: Inpatient → PHP → IOP → OP with warm handoffs and overlapping support.</p>
                  <div class="pearl">Schedule follow-up within 7 days of discharge to reduce readmissions.</div>
                </article>
              </div>
            </div>
            <div class="tabpanel" id="loc-panel-example" role="tabpanel" aria-labelledby="loc-tab-example" aria-hidden="true">
              <p class="help">Interactive level-of-care triage calculator form would be here.</p>
            </div>
            <div class="tabpanel" id="loc-panel-prompts" role="tabpanel" aria-labelledby="loc-tab-prompts" aria-selected="false" tabindex="-1">
              <ul>
                <li>create a code in html as a triage form for OP/IOP/PHP/Inpatient level of care recommendation</li>
                <li>make a code in html for medical necessity checklist with override logic</li>
                <li>compose a code in html to generate transition/stepdown plan with follow-up timeline</li>
                <li>create a code in html with risk-informed placement decision tree</li>
                <li>make a code in html that tracks readmission risk factors and mitigation</li>
              </ul>
            </div>
            <div class="tabpanel" id="loc-panel-refs" role="tabpanel" aria-labelledby="loc-tab-refs" aria-hidden="true">
              <ol style="line-height:1.8;">
                <li><strong>American Society of Addiction Medicine (2013).</strong> ASAM Criteria: Treatment Criteria for Addictive, Substance-Related, and Co-Occurring Conditions (3rd Edition).</li>
                <li><strong>Zimmerman M, Gazarian D, Multach MD, et al. (2020).</strong> A clinically useful self-report measure of psychiatric patients' reasons for hospitalization. <em>Journal of Clinical Psychiatry</em>, 81(1).</li>
                <li><strong>Substance Abuse and Mental Health Services Administration (2020).</strong> National Guidelines for Behavioral Health Crisis Care Best Practice Toolkit.</li>
                <li><strong>APA (2016).</strong> The American Psychiatric Association Practice Guidelines for the Psychiatric Evaluation of Adults (3rd Edition).</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section class="acc-item" id="acc5">
        <button class="acc-trigger" aria-expanded="false" aria-controls="acc5-panel" id="acc5-trigger">
          <h3>ACCORDION 5 — Relapse Prevention & Early Warning Signs</h3>
          <span class="chev" aria-hidden="true">›</span>
        </button>
        <div class="acc-panel" id="acc5-panel" role="region" aria-labelledby="acc5-trigger" aria-hidden="true">
          <div class="tabs">
            <ul class="tablist" role="tablist" aria-label="Relapse Prevention tabs" id="rp-tablist">
              <li><button role="tab" id="rp-tab-info" aria-controls="rp-panel-info" aria-selected="true" tabindex="0">Info</button></li>
              <li><button role="tab" id="rp-tab-example" aria-controls="rp-panel-example" aria-selected="false" tabindex="-1">Example</button></li>
              <li><button role="tab" id="rp-tab-prompts" aria-controls="rp-panel-prompts" aria-selected="false" tabindex="-1">Prompts</button></li>
              <li><button role="tab" id="rp-tab-refs" aria-controls="rp-panel-refs" aria-selected="false" tabindex="-1">References</button></li>
            </ul>
            <div class="tabpanel" id="rp-panel-info" role="tabpanel" aria-labelledby="rp-tab-info" aria-hidden="false">
              <div class="infocards">
                <article class="infocard">
                  <h4>Relapse Prevention Framework</h4>
                  <p>Identify triggers, early warning signs, protective factors, and action steps before relapse occurs.</p>
                  <div class="pearl">Clinical Pearl: Collaborate with patient to create personalized warning sign list.</div>
                  <div class="measure">Threshold: Review relapse plan every 3 months or after any episode.</div>
                </article>
                <article class="infocard">
                  <h4>Early Warning Signs</h4>
                  <p>Sleep disruption, social withdrawal, anhedonia, irritability, reduced self-care, skipping meds.</p>
                </article>
                <article class="infocard">
                  <h4>Prodromal Symptoms</h4>
                  <p>Subtle changes that precede full episode. Track PHQ-9/GAD-7 micro-changes (+3 points in 2 weeks).</p>
                  <div class="pitfall">Pitfall: Ignoring small symptom increases until crisis develops.</div>
                </article>
                <article class="infocard">
                  <h4>Trigger Mapping</h4>
                  <p>Stressors: work, relationships, anniversaries, seasonal, financial. Rate risk level for each.</p>
                </article>
                <article class="infocard">
                  <h4>Protective Factors</h4>
                  <p>Social support, coping skills, medication adherence, exercise, sleep hygiene, therapy engagement.</p>
                  <div class="pearl">Strengthen protective factors as part of maintenance phase.</div>
                </article>
                <article class="infocard">
                  <h4>Action Steps</h4>
                  <p>Green zone: maintain routine. Yellow zone: increase monitoring. Red zone: crisis contact, urgent visit.</p>
                </article>
                <article class="infocard">
                  <h4>Maintenance Medication</h4>
                  <p>Continue antidepressants ≥6-12 months after remission (≥2 years if recurrent episodes).</p>
                  <div class="pitfall">Pitfall: Premature discontinuation increases relapse risk significantly.</div>
                </article>
                <article class="infocard">
                  <h4>Booster Sessions</h4>
                  <p>Schedule quarterly check-ins or PRN sessions to reinforce skills and monitor for prodromal signs.</p>
                </article>
              </div>
            </div>
            <div class="tabpanel" id="rp-panel-example" role="tabpanel" aria-labelledby="rp-tab-example" aria-hidden="true">
              <p class="help">Interactive relapse prevention plan with triggers, warning signs, and action steps would be here.</p>
            </div>
            <div class="tabpanel" id="rp-panel-prompts" role="tabpanel" aria-labelledby="rp-tab-prompts" aria-hidden="true">
              <ul>
                <li>compose a code in html for relapse prevention plan with triggers, early signs, and action steps</li>
                <li>create a code in html as a form for tracking prodromal symptoms with threshold alerts</li>
                <li>make a code in html that generates a three-zone safety plan (green/yellow/red)</li>
                <li>compose a code in html to schedule booster sessions and maintenance check-ins</li>
                <li>create a code in html with medication continuation decision aid (duration, tapering)</li>
              </ul>
            </div>
            <div class="tabpanel" id="rp-panel-refs" role="tabpanel" aria-labelledby="rp-tab-refs" aria-hidden="true">
              <ol style="line-height:1.8;">
                <li><strong>Marlatt GA, Donovan DM (2005).</strong> Relapse Prevention: Maintenance Strategies in the Treatment of Addictive Behaviors (2nd Edition). <em>Guilford Press</em>.</li>
                <li><strong>Kuyken W, Watkins E, Holden E, et al. (2010).</strong> How does mindfulness-based cognitive therapy work? <em>Behaviour Research and Therapy</em>, 48(11), 1105-1112.</li>
                <li><strong>Geddes JR, Carney SM, Davies C, et al. (2003).</strong> Relapse prevention with antidepressant drug treatment. <em>Lancet</em>, 361(9358), 653-661.</li>
                <li><strong>Bockting CLH, Klein NS, Elgersma HJ, et al. (2018).</strong> Effectiveness of preventive cognitive therapy while tapering antidepressants. <em>JAMA Psychiatry</em>, 75(10), 1073-1082.</li>
              </ol>
            </div>
          </div>
        </div>
      </section>
    </section>

    <section class="section card print-area" style="padding:12px;">
      <h2 style="margin:0 0 8px 0; font-size:16px;">Summary</h2>
      <div id="summary-content">
        <p><strong>SMART goals:</strong> —</p>
        <p><strong>Severity & cadence:</strong> —</p>
        <p><strong>SDM option:</strong> —</p>
        <p><strong>Level of care:</strong> —</p>
        <p><strong>Relapse highlights:</strong> —</p>
      </div>
    </section>

    <details class="section">
      <summary>QA checklist</summary>
      <ul>
        <li>Focus order logical</li>
        <li>aria-labels and roles applied</li>
        <li>labels/ids bound</li>
        <li>High-contrast focus</li>
        <li>Keyboard toggles for accordions & tabs</li>
        <li>Print CSS hides chrome, shows print area</li>
        <li>No external assets</li>
      </ul>
    </details>
  </main>

  <script>
    (function () {
      const $ = (sel, el = document) => el.querySelector(sel);
      const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
      const live = $('#live');

      $('#dismiss-banner')?.addEventListener('click', () => {
        $('#disclaimer-banner')?.remove();
        document.querySelector('header').style.top = '0px';
      });

      $('#printBtn')?.addEventListener('click', () => window.print());
      $('#toggleJson')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const wrap = $('#jsonWrap');
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));
        wrap.style.display = pressed ? 'none' : 'block';
      });
      $('#copyBtn')?.addEventListener('click', async () => {
        const area = $('#jsonArea');
        if (!area.value.trim()) area.value = JSON.stringify({message: 'Treatment plan data'}, null, 2);
        area.select();
        try {
          document.execCommand('copy');
          live.textContent = 'JSON copied to clipboard.';
          setTimeout(() => (live.textContent = ''), 2000);
        } catch {  }
      });

      $$('.acc-trigger').forEach((btn, idx, arr) => {
        btn.addEventListener('click', () => toggleAccordion(btn));
        btn.addEventListener('keydown', (ev) => {
          const i = arr.indexOf(btn);
          if (['Enter',' '].includes(ev.key)) { ev.preventDefault(); toggleAccordion(btn); }
          if (ev.key === 'ArrowDown') { ev.preventDefault(); arr[(i+1)%arr.length].focus(); }
          if (ev.key === 'ArrowUp') { ev.preventDefault(); arr[(i-1+arr.length)%arr.length].focus(); }
          if (ev.key === 'Home') { ev.preventDefault(); arr[0].focus(); }
          if (ev.key === 'End') { ev.preventDefault(); arr[arr.length-1].focus(); }
        });
      });
      function toggleAccordion(btn) {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.setAttribute('aria-hidden', String(expanded));
        if (!expanded) {
          const firstTab = panel.querySelector('[role="tab"]');
          if (firstTab) selectTab(firstTab);
        }
      }

      $$('.tablist').forEach((tablist) => {
        const tabs = $$('[role="tab"]', tablist);
        tabs.forEach((tab, i) => {
          tab.addEventListener('click', () => selectTab(tab));
          tab.addEventListener('keydown', (ev) => {
            let idx = tabs.indexOf(tab);
            if (['Enter',' '].includes(ev.key)) { ev.preventDefault(); selectTab(tab); }
            if (ev.key === 'ArrowRight') { ev.preventDefault(); tabs[(idx+1)%tabs.length].focus(); }
            if (ev.key === 'ArrowLeft') { ev.preventDefault(); tabs[(idx-1+tabs.length)%tabs.length].focus(); }
            if (ev.key === 'Home') { ev.preventDefault(); tabs[0].focus(); }
            if (ev.key === 'End') { ev.preventDefault(); tabs[tabs.length-1].focus(); }
          });
        });
      });
      function selectTab(tab) {
        const list = tab.closest('.tabs');
        const allTabs = $$('[role="tab"]', list);
        const panels = $$('.tabpanel', list);
        allTabs.forEach(t => {
          t.setAttribute('aria-selected', String(t === tab));
          t.tabIndex = t === tab ? 0 : -1;
        });
        panels.forEach(p => p.setAttribute('aria-hidden', 'true'));
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) panel.setAttribute('aria-hidden', 'false');
      }
    })();
  </script>
</body>
</html>`,
    prompts: [
      { id:'tp-smart-compose', label:'SMART goals from problem list', template:'Turn problem list items into SMART goals with baseline, current, and target metrics; include one measurable outcome per goal.' },
      { id:'tp-smart-barriers', label:'Stepped-care follow-up plan', template:'Propose visit cadence and monitoring using PHQ‑9/GAD‑7 severity bands; add escalation/de‑escalation triggers.' },
      { id:'tp-sdm-grid', label:'SDM option grid', template:'Create a concise option grid comparing CBT, SSRI/SNRI, combined care, and watchful waiting across efficacy, time to benefit, side effects, logistics, and preference fit.' },
      { id:'tp-care-level', label:'Level of care triage', template:'Recommend OP/IOP/PHP/Inpatient with a short justification using risk, function, supports, medical complexity, and adherence factors.' },
      { id:'tp-relapse', label:'Relapse‑prevention outline', template:'Outline triggers, early warning signs, protective factors, and first‑day action steps; include a Green/Yellow/Red plan.' }
    ],
    evidence: [
      { title: "There's a S.M.A.R.T. way to write management's goals and objectives", year: 1981, journal: 'Management Review' },
      { title: 'Writing SMART rehabilitation goals and achieving goal attainment scaling: a practical guide', year: 2009, journal: 'Clinical Rehabilitation' },
      { title: 'Practice Guideline for the Treatment of Patients with Major Depressive Disorder (4th ed.)', year: 2023, journal: 'American Psychiatric Association' },
      { title: 'Remission definition and measurement in MDD', year: 2008, journal: 'Acta Psychiatrica Scandinavica' },
      { title: 'A tipping point for measurement‑based care', year: 2017, journal: 'Psychiatric Services' },
      { title: 'Depression in adults: treatment and management (NG222)', year: 2022, journal: 'NICE Guideline' }
    ]
  },
  {
    id: 'tp-stepped-care-navigator',
    title: 'Stepped Care Navigator (Severity → Cadence)',
    sectionId: 'treatment_plan',
    summary: 'Severity anchors, visit cadence, escalation and de-escalation triggers.',
    html: `\n<h2>Stepped Care Navigator</h2>\n<div class="infocards">\n  <article class="infocard">\n    <h4>Stepped Care Model</h4>\n    <p>Match intensity to severity & functional impairment. Start at lowest effective level, escalate if non-response.</p>\n    <div class="pearl">Clinical Pearl: Use PHQ-9/GAD-7 bands to trigger step changes automatically.</div>\n    <div class="measure">Threshold: Step up if ≥Moderate severity + no ≥50% improvement in 4–6 weeks.</div>\n  </article>\n  <article class="infocard">\n    <h4>Severity Bands</h4>\n    <p>PHQ-9: Minimal (0-4), Mild (5-9), Moderate (10-14), Mod-Severe (15-19), Severe (20-27).</p>\n    <p>GAD-7: Minimal (0-4), Mild (5-9), Moderate (10-14), Severe (15-21).</p>\n  </article>\n  <article class="infocard">\n    <h4>Visit Cadence</h4>\n    <p>Severe: Weekly × 4, then biweekly. Moderate: Biweekly × 4, then monthly. Mild: Monthly.</p>\n    <div class="pitfall">Pitfall: Insufficient follow-up cadence delays detection of non-response.</div>\n  </article>\n  <article class="infocard">\n    <h4>Step 1: Watchful Waiting</h4>\n    <p>Minimal-Mild, no risk, recent onset. Reassess 2 weeks.</p>\n  </article>\n  <article class="infocard">\n    <h4>Step 2: Low-Intensity</h4>\n    <p>Guided self-help, psychoeducation, behavioral activation.</p>\n  </article>\n  <article class="infocard">\n    <h4>Step 3: Moderate-Intensity</h4>\n    <p>CBT/IPT or SSRI/SNRI monotherapy. Standard outpatient care.</p>\n  </article>\n  <article class="infocard">\n    <h4>Step 4: High-Intensity</h4>\n    <p>Combination therapy (CBT + medication), intensive outpatient (IOP).</p>\n  </article>\n  <article class="infocard">\n    <h4>Step 5: Crisis/Inpatient</h4>\n    <p>Imminent risk, severe functional impairment, failed outpatient trials.</p>\n    <div class="pitfall">Pitfall: Delaying escalation when risk criteria met.</div>\n  </article>\n</div>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'tp-stepped-pick-cadence', label:'Visit cadence & monitoring', template:'Propose visit cadence and monitoring based on severity and risk (≤120 words). Severity: {{severity_anchors}} Risk: {{risk_context}} Response: {{current_response}}' },
      { id:'tp-stepped-escalate', label:'When to escalate', template:'State escalation criteria if no adequate response at 2–4 weeks. Severity: {{severity_anchors}} Non-response definition: {{non_response_def}}' }
    ],
    evidence: [
      { title: 'Stepped care in psychological therapies', year: 2005, journal: 'British Journal of Psychiatry' },
      { title: 'The PHQ‑9: validity of a brief depression severity measure', year: 2001, journal: 'Journal of General Internal Medicine' },
      { title: 'A brief measure for assessing generalized anxiety disorder (GAD‑7)', year: 2006, journal: 'Archives of Internal Medicine' },
      { title: 'Depression in adults: treatment and management (NG222)', year: 2022, journal: 'NICE Guideline' }
    ]
  },
  {
    id: 'tp-sdm-script',
    title: 'Shared Decision-Making (SDM) Script & Options',
    sectionId: 'treatment_plan',
    summary: 'Options, benefits/risks, values, practicalities, decision & follow-up placeholders.',
    html: `\n<h2>SDM Script & Options</h2>\n<div class="infocards">\n  <article class="infocard">\n    <h4>SDM Core Principles</h4>\n    <p>Involve patients in treatment decisions, present options, elicit values & preferences, support autonomy.</p>\n    <div class="pearl">Clinical Pearl: Use option grids to visualize trade-offs between modalities.</div>\n    <div class="pitfall">Pitfall: Assuming one-size-fits-all treatment without discussing alternatives.</div>\n  </article>\n  <article class="infocard">\n    <h4>Treatment Options</h4>\n    <p>Psychotherapy (CBT, IPT, ACT), Pharmacotherapy (SSRI, SNRI), Combined, Watchful Waiting, Digital therapeutics.</p>\n  </article>\n  <article class="infocard">\n    <h4>Option Grid Dimensions</h4>\n    <p>Efficacy, Time to benefit, Side effects, Cost, Logistics, Patient preference alignment.</p>\n    <div class="measure">Threshold: Preference score ≥3/5 to mark option as aligned.</div>\n  </article>\n  <article class="infocard">\n    <h4>SDM Script Template</h4>\n    <p>"We have several options that can help. Let me walk you through the pros and cons of each..."</p>\n  </article>\n  <article class="infocard">\n    <h4>Values Clarification</h4>\n    <p>Ask: "What matters most to you? Speed? Avoiding meds? Talking it through?"</p>\n    <div class="pearl">Document patient's stated priorities in free text.</div>\n  </article>\n  <article class="infocard">\n    <h4>Informed Consent Elements</h4>\n    <p>Risks, benefits, alternatives, right to refuse, questions encouraged.</p>\n  </article>\n  <article class="infocard">\n    <h4>Cultural & Literacy Factors</h4>\n    <p>Tailor language, use teach-back, provide materials in preferred language.</p>\n    <div class="pitfall">Pitfall: Using jargon that reduces understanding and engagement.</div>\n  </article>\n  <article class="infocard">\n    <h4>Documenting SDM</h4>\n    <p>Record options discussed, patient's choice, rationale, and follow-up plan.</p>\n  </article>\n</div>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'tp-sdm-summary', label:'SDM summary (clinician)', template:'Summarize SDM: options discussed, patient values/preferences, decision, and follow-up. Options: {{options}} Values: {{preferences}} Decision: {{decision_follow}}' },
      { id:'tp-sdm-handout', label:'SDM summary (patient)', template:'Write a patient-friendly paragraph about the chosen option and why it fits. Option: {{chosen_option}} Rationale: {{rationale}}' }
    ],
    evidence: [
      { title: 'Shared decision making: a model for clinical practice', year: 2012, journal: 'Journal of General Internal Medicine' },
      { title: 'Shared decision-making in the medical encounter', year: 1997, journal: 'Social Science & Medicine' },
      { title: 'Shared decision making (review)', year: 2012, journal: 'Health Expectations' },
      { title: 'Making shared decision-making a reality', year: 2011, journal: "The King's Fund" }
    ]
  },
  {
    id: 'tp-care-level-criteria',
    title: 'Care Level Criteria (OP / IOP / PHP / Inpatient) — Outline',
    sectionId: 'treatment_plan',
    summary: 'Neutral criteria outline for outpatient vs higher care decisions.',
    html: `\n<h2>Care Level Criteria — Outline</h2>\n<div class="infocards">\n  <article class="infocard">\n    <h4>Level of Care Framework</h4>\n    <p>Match clinical severity, risk, functional impairment, and support needs to appropriate setting.</p>\n    <div class="pearl">Clinical Pearl: Use ASAM-like criteria to standardize placement decisions.</div>\n    <div class="measure">Threshold: Risk override always trumps severity-only assessment.</div>\n  </article>\n  <article class="infocard">\n    <h4>Outpatient (OP)</h4>\n    <p>Mild-Moderate severity, stable, no imminent risk, adequate support. Weekly to monthly visits.</p>\n  </article>\n  <article class="infocard">\n    <h4>Intensive Outpatient (IOP)</h4>\n    <p>Moderate-Severe, functional decline, needs structured daily support (3hrs/day, 3-5 days/week).</p>\n    <div class="pitfall">Pitfall: Keeping patient in standard OP when they need more structure.</div>\n  </article>\n  <article class="infocard">\n    <h4>Partial Hospitalization (PHP)</h4>\n    <p>Severe symptoms, high functional impairment, needs daily monitoring but not 24hr care (6hrs/day, 5 days/week).</p>\n  </article>\n  <article class="infocard">\n    <h4>Inpatient Psychiatric</h4>\n    <p>Imminent SI/HI with intent/plan, acute psychosis, severe agitation, failed lower levels.</p>\n    <div class="pitfall">Pitfall: Premature discharge without stabilization or safety plan.</div>\n  </article>\n  <article class="infocard">\n    <h4>Crisis Stabilization Unit</h4>\n    <p>Short-term (≤72hrs) for acute risk de-escalation before stepping down to lower level.</p>\n  </article>\n  <article class="infocard">\n    <h4>Medical Necessity Criteria</h4>\n    <p>Severity + impairment + risk + failed lower level + medical comorbidity.</p>\n  </article>\n  <article class="infocard">\n    <h4>Transition Planning</h4>\n    <p>Stepdown care: Inpatient → PHP → IOP → OP with warm handoffs and overlapping support.</p>\n    <div class="pearl">Schedule follow-up within 7 days of discharge to reduce readmissions.</div>\n  </article>\n</div>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'tp-care-level-suggest', label:'Level of care recommendation', template:'Recommend OP/IOP/PHP/Inpatient and justify in 2–3 sentences using criteria. Risk: {{risk}} Function: {{function}} Supports: {{supports}} Medical: {{medical_complexity}} Adherence: {{adherence}}' },
      { id:'tp-care-level-handoff', label:'Transition handoff checklist', template:'Draft a handoff checklist for stepping to higher care. Criteria summary: {{criteria_summary}}' }
    ],
    evidence: [
      { title: 'ASAM Criteria: Treatment Criteria for Addictive, Substance-Related, and Co-Occurring Conditions (3rd ed.)', year: 2013, journal: 'ASAM' },
      { title: "Psychiatric patients' reasons for hospitalization — self‑report measure", year: 2020, journal: 'Journal of Clinical Psychiatry' },
      { title: 'National Guidelines for Behavioral Health Crisis Care', year: 2020, journal: 'SAMHSA' },
      { title: 'Psychiatric Evaluation of Adults (3rd ed.)', year: 2016, journal: 'APA Practice Guideline' }
    ]
  },
  {
    id: 'tp-relapse-prevention',
    title: 'Relapse Prevention & Early Warning Signs',
    sectionId: 'treatment_plan',
    summary: 'Triggers, early signs, action plan, notification, adherence, lifestyle anchors, review schedule.',
    html: `\n<h2>Relapse Prevention & Early Warning Signs</h2>\n<div class="infocards">\n  <article class="infocard">\n    <h4>Relapse Prevention Framework</h4>\n    <p>Identify triggers, early warning signs, protective factors, and action steps before relapse occurs.</p>\n    <div class="pearl">Clinical Pearl: Collaborate with patient to create personalized warning sign list.</div>\n    <div class="measure">Threshold: Review relapse plan every 3 months or after any episode.</div>\n  </article>\n  <article class="infocard">\n    <h4>Early Warning Signs</h4>\n    <p>Sleep disruption, social withdrawal, anhedonia, irritability, reduced self-care, skipping meds.</p>\n  </article>\n  <article class="infocard">\n    <h4>Prodromal Symptoms</h4>\n    <p>Subtle changes that precede full episode. Track PHQ-9/GAD-7 micro-changes (+3 points in 2 weeks).</p>\n    <div class="pitfall">Pitfall: Ignoring small symptom increases until crisis develops.</div>\n  </article>\n  <article class="infocard">\n    <h4>Trigger Mapping</h4>\n    <p>Stressors: work, relationships, anniversaries, seasonal, financial. Rate risk level for each.</p>\n  </article>\n  <article class="infocard">\n    <h4>Protective Factors</h4>\n    <p>Social support, coping skills, medication adherence, exercise, sleep hygiene, therapy engagement.</p>\n    <div class="pearl">Strengthen protective factors as part of maintenance phase.</div>\n  </article>\n  <article class="infocard">\n    <h4>Action Steps</h4>\n    <p>Green zone: maintain routine. Yellow zone: increase monitoring. Red zone: crisis contact, urgent visit.</p>\n  </article>\n  <article class="infocard">\n    <h4>Maintenance Medication</h4>\n    <p>Continue antidepressants ≥6-12 months after remission (≥2 years if recurrent episodes).</p>\n    <div class="pitfall">Pitfall: Premature discontinuation increases relapse risk significantly.</div>\n  </article>\n  <article class="infocard">\n    <h4>Booster Sessions</h4>\n    <p>Schedule quarterly check-ins or PRN sessions to reinforce skills and monitor for prodromal signs.</p>\n  </article>\n</div>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'tp-relapse-compose', label:'Relapse-prevention plan', template:'Write a personalized relapse-prevention plan with concrete first-day actions. Triggers: {{triggers}} Early signs: {{early_signs}} Actions: {{action_plan}} Adherence: {{adherence}} Lifestyle: {{lifestyle}} Review: {{review_schedule}}' },
      { id:'tp-relapse-follow', label:'Follow-up checklist (4 weeks)', template:'List follow-up tasks for patient and clinician over the next 4 weeks. Plan focus: {{action_plan}}' }
    ],
    evidence: [
      { title: 'Relapse Prevention: Maintenance Strategies in the Treatment of Addictive Behaviors (2nd ed.)', year: 2005, journal: 'Guilford Press' },
      { title: 'How does mindfulness-based cognitive therapy work?', year: 2010, journal: 'Behaviour Research and Therapy' },
      { title: 'Relapse prevention with antidepressant drug treatment', year: 2003, journal: 'The Lancet' },
      { title: 'Preventive cognitive therapy while tapering antidepressants — effectiveness', year: 2018, journal: 'JAMA Psychiatry' }
    ]
  },

  {
    id: 'psy-cbt-depression-6session',
    title: 'CBT for Depression — 6-Session Brief Protocol',
    sectionId: 'psychotherapy',
    summary: 'Session-by-session brief CBT protocol with activity scheduling, thought records, experiments, relapse prevention.',
    html: `\n<h2>CBT for Depression — 6-Session Brief Protocol</h2>\n<ol style="font-size:12px">\n  <li><strong>Session 1 (Engagement & Agenda):</strong> {{s1}}</li>\n  <li><strong>Session 2 (Mood/Behavior Link + Activity Scheduling):</strong> {{s2}}</li>\n  <li><strong>Session 3 (Thought Records Intro):</strong> {{s3}}</li>\n  <li><strong>Session 4 (Behavioral Experiments):</strong> {{s4}}</li>\n  <li><strong>Session 5 (Core Beliefs & Skills Consolidation):</strong> {{s5}}</li>\n  <li><strong>Session 6 (Relapse Prevention):</strong> {{s6}}</li>\n</ol>\n<p><strong>Homework Placeholders:</strong> {{homework}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'psy-cbt-session-plan', label:'Compose session plan', template:'Compose a Session 1 plan incl. homework and measurement check. Session 1: {{s1}} Measures: {{measures}}' },
      { id:'psy-cbt-homework-gen', label:'Generate homework', template:'Generate homework tailored to today’s themes. Themes: {{themes}}' }
    ],
    evidence: []
  },
  {
    id: 'psy-behavioural-activation',
    title: 'Behavioural Activation — Quick Start',
    sectionId: 'psychotherapy',
    summary: 'Values/activities list, mastery/pleasure ratings, weekly schedule and obstacles/solutions scaffold.',
    html: `\n<h2>Behavioural Activation — Quick Start</h2>\n<ul style="font-size:12px">\n  <li><strong>Values:</strong> {{values}}</li>\n  <li><strong>Activities List:</strong> {{activities}}</li>\n  <li><strong>Mastery/Pleasure Ratings:</strong> {{mp_ratings}}</li>\n  <li><strong>Weekly Schedule Grid:</strong> {{schedule}}</li>\n  <li><strong>Obstacles & Solutions:</strong> {{obstacles}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'psy-ba-schedule', label:'Create BA schedule', template:'Create a one-week BA schedule with mastery/pleasure targets. Activities: {{activities}} Ratings: {{mp_ratings}}' },
      { id:'psy-ba-obstacles', label:'Obstacle solver', template:'List common obstacles and matching solutions for adherence. Obstacles: {{obstacles}}' }
    ],
    evidence: []
  },
  {
    id: 'psy-cbt-i-ladder',
    title: 'CBT-I Ladder — First-Line Insomnia Steps',
    sectionId: 'psychotherapy',
    summary: 'Sleep diary, stimulus control, sleep restriction outline, substance/caffeine, wind-down, environment factors scaffold.',
    html: `\n<h2>CBT-I Ladder — First-Line Insomnia Steps</h2>\n<ul style="font-size:12px">\n  <li><strong>Sleep Diary:</strong> {{sleep_diary}}</li>\n  <li><strong>Stimulus Control:</strong> {{stimulus_control}}</li>\n  <li><strong>Sleep Restriction (outline):</strong> {{sleep_restriction}}</li>\n  <li><strong>Caffeine / Alcohol / Nicotine:</strong> {{substances}}</li>\n  <li><strong>Wind-down Routine:</strong> {{wind_down}}</li>\n  <li><strong>Light / Noise Environment:</strong> {{environment}}</li>\n  <li><strong>Medical Cause Check (rule-outs):</strong> {{medical_check}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'psy-cbt-i-plan', label:'Compose sleep plan', template:'Compose a CBT-I plan with bedtime/wake time targets and wind-down steps. Diary: {{sleep_diary}} Restriction: {{sleep_restriction}} Wind-down: {{wind_down}}' },
      { id:'psy-cbt-i-psychoed', label:'Psychoeducation', template:'Explain sleep restriction rationale in ≤120 words. Restriction: {{sleep_restriction}}' }
    ],
    evidence: []
  },
  {
    id: 'psy-exposure-hierarchy',
    title: 'Exposure Hierarchy Builder (Anxiety/PTSD/OCD)',
    sectionId: 'psychotherapy',
    summary: 'Stimuli list, SUDS ratings, ladder, safety statements, homework template scaffold.',
    html: `\n<h2>Exposure Hierarchy Builder</h2>\n<ul style="font-size:12px">\n  <li><strong>Stimuli List:</strong> {{stimuli}}</li>\n  <li><strong>SUDS Ratings:</strong> {{suds}}</li>\n  <li><strong>Ladder (lowest→highest):</strong> {{ladder}}</li>\n  <li><strong>Safety Statements:</strong> {{safety_statements}}</li>\n  <li><strong>Homework Template:</strong> {{homework}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'psy-exposure-build', label:'Build hierarchy', template:'Convert the stimuli into a graded exposure hierarchy (lowest→highest). Stimuli: {{stimuli}} SUDS: {{suds}}' },
      { id:'psy-exposure-homework', label:'Homework brief', template:'Create a homework plan for the next 7 days. Ladder: {{ladder}} Safety: {{safety_statements}}' }
    ],
    evidence: []
  },
  {
    id: 'psy-relapse-prevention',
    title: 'Relapse Prevention Worksheet (Therapy)',
    sectionId: 'psychotherapy',
    summary: 'Warning signs, coping strategies, support map, crisis steps, review dates.',
    html: `\n<h2>Relapse Prevention Worksheet (Therapy)</h2>\n<ul style="font-size:12px">\n  <li><strong>Warning Signs:</strong> {{warning_signs}}</li>\n  <li><strong>Coping Strategies:</strong> {{coping}}</li>\n  <li><strong>Support Map:</strong> {{support_map}}</li>\n  <li><strong>Crisis Steps:</strong> {{crisis_steps}}</li>\n  <li><strong>Review Dates:</strong> {{review_dates}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'psy-relapse-compose', label:'Compose worksheet', template:'Compose a relapse-prevention worksheet tailored to the case. Warning: {{warning_signs}} Coping: {{coping}} Supports: {{support_map}} Crisis: {{crisis_steps}}' },
      { id:'psy-relapse-support', label:'Support script', template:'Draft a short script to engage supports. Supports: {{support_map}}' }
    ],
    evidence: []
  },

  {
    id: 'med-select-antidepressant-navigator',
    title: 'Antidepressant Selection Navigator (SSRI/SNRI/Bupropion/Mirtazapine)',
    sectionId: 'medications',
    summary: 'Targets, past response, side-effect priorities, comorbidities, interactions, patient preference scaffold.',
    html: `\n<h2>Antidepressant Selection Navigator</h2>\n<ul style="font-size:12px">\n  <li><strong>Target Symptoms / Domains:</strong> {{targets}}</li>\n  <li><strong>Past Response / Trials:</strong> {{past_response}}</li>\n  <li><strong>Side-Effect Priorities (sedation/weight/sexual):</strong> {{se_priorities}}</li>\n  <li><strong>Medical Comorbids (seizure/QT/BP):</strong> {{medical}}</li>\n  <li><strong>Drug Interactions (outline):</strong> {{interactions}}</li>\n  <li><strong>Patient Preference:</strong> {{preference}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-select-rationale', label:'Compose rationale', template:'Compose an initial antidepressant choice with rationale and monitoring focus. Targets: {{targets}} Trials: {{past_response}} Side-effect Priorities: {{se_priorities}} Medical: {{medical}} Interactions: {{interactions}} Preference: {{preference}}' },
      { id:'med-select-switchover', label:'If prior non-response', template:'Propose a switch vs augmentation path and justify briefly. Past Response: {{past_response}} Current Status: {{current_status}}' }
    ],
    evidence: []
  },
  {
    id: 'med-augmentation-switch-map',
    title: 'Augmentation & Switch Map (Depression/Anxiety)',
    sectionId: 'medications',
    summary: 'When to consider, switch vs augment, generic augmentation options, monitoring foci.',
    html: `\n<h2>Augmentation & Switch Map (Depression/Anxiety)</h2>\n<ul style="font-size:12px">\n  <li><strong>When to Consider (adequate trial definition):</strong> {{when_consider}}</li>\n  <li><strong>Switch (intra-class vs inter-class):</strong> {{switch_logic}}</li>\n  <li><strong>Augment (generic options):</strong> {{augment_options}}</li>\n  <li><strong>Monitoring Foci (metabolic/QT/TSH/renal/hepatic):</strong> {{monitoring}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-augment-vs-switch', label:'Augment vs switch', template:'Given serial scores and side-effects, argue for augment vs switch in ≤120 words. Scores: {{scores}} Side-effects: {{side_effects}} Trial Adequacy: {{trial_adequacy}}' },
      { id:'med-monitoring-bullets', label:'Monitoring bullets', template:'List monitoring checkpoints for the chosen path. Path: {{path}}' }
    ],
    evidence: []
  },
  {
    id: 'med-side-effect-matrix',
    title: 'Side-Effect Trade-off Matrix (Sedation/Weight/Sexual/QT)',
    sectionId: 'medications',
    summary: 'Neutral matrix to discuss trade-offs and mitigation ideas.',
    html: `\n<h2>Side-Effect Trade-off Matrix</h2>\n<ul style="font-size:12px">\n  <li><strong>Sedation:</strong> {{sedation}}</li>\n  <li><strong>Weight:</strong> {{weight}}</li>\n  <li><strong>Sexual Effects:</strong> {{sexual}}</li>\n  <li><strong>QT:</strong> {{qt}}</li>\n  <li><strong>Mitigation Ideas:</strong> {{mitigation}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-se-counsel', label:'Counseling text', template:'Compose a patient-facing explanation of trade-offs and mitigation steps. Sedation: {{sedation}} Weight: {{weight}} Sexual: {{sexual}} QT: {{qt}}' },
      { id:'med-se-switch', label:'Switch logic', template:'If intolerable SE persists, outline a staged switch plan. Current Agent: {{current_agent}} SE: {{problem_se}}' }
    ],
    evidence: []
  },
  {
    id: 'med-perinatal-ssri-outline',
    title: 'Perinatal Considerations — SSRI/SNRI (Outline)',
    sectionId: 'medications',
    summary: 'Risk-benefit, past response, liaison, breastfeeding, non-pharm options, mother/infant monitoring scaffold.',
    html: `\n<h2>Perinatal Considerations — SSRI/SNRI</h2>\n<ul style="font-size:12px">\n  <li><strong>Risk-Benefit Framing:</strong> {{risk_benefit}}</li>\n  <li><strong>Past Response:</strong> {{past_response}}</li>\n  <li><strong>OB Liaison:</strong> {{ob_liaison}}</li>\n  <li><strong>Breastfeeding:</strong> {{breastfeeding}}</li>\n  <li><strong>Non-pharmacologic Options:</strong> {{non_pharm}}</li>\n  <li><strong>Mother/Infant Monitoring:</strong> {{monitoring}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-perinatal-ob-note', label:'OB liaison note', template:'Draft a liaison note to OB with clinical rationale and monitoring plan. Risk-Benefit: {{risk_benefit}} Past Response: {{past_response}} Monitoring: {{monitoring}}' },
      { id:'med-perinatal-summary', label:'Patient summary', template:'Write a 100–120 word summary for an informed discussion. Risk-Benefit: {{risk_benefit}} Options: {{non_pharm}}' }
    ],
    evidence: []
  },
  {
    id: 'med-geriatric-anticholinergic',
    title: 'Geriatric Polypharmacy & Anticholinergic Burden',
    sectionId: 'medications',
    summary: 'Falls/cognition risks, constipation/urinary retention, simplification strategies, deprescribing flags, anticholinergic burden awareness.',
    html: `\n<h2>Geriatric Polypharmacy & Anticholinergic Burden</h2>\n<ul style="font-size:12px">\n  <li><strong>Falls / Cognition Risks:</strong> {{falls_cognition}}</li>\n  <li><strong>Constipation / Urinary Retention:</strong> {{constipation_urinary}}</li>\n  <li><strong>Simplification Strategies:</strong> {{simplification}}</li>\n  <li><strong>Deprescribing Flags:</strong> {{deprescribing_flags}}</li>\n  <li><strong>Anticholinergic Burden Awareness:</strong> {{ach_burden}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-geriatric-risk-summary', label:'Risk summary', template:'Summarize geriatric polypharmacy risks and propose simplification steps. Med List: {{med_list}} Flags: {{deprescribing_flags}}' },
      { id:'med-geriatric-deprescribe', label:'Deprescribing plan', template:'Compose a staged deprescribing plan with monitoring. Med List: {{med_list}}' }
    ],
    evidence: []
  },
  {
    id: 'med-cyp-qt-navigator',
    title: 'CYP/QT Interaction Awareness — Brief Navigator',
    sectionId: 'medications',
    summary: 'Prompts to check CYP inhibitor/inducer status, QT-prolonging combos, ECG plan; instruct to use local interaction checker.',
    html: `\n<h2>CYP/QT Interaction Awareness — Brief Navigator</h2>\n<ul style="font-size:12px">\n  <li><strong>CYP Inhibitors / Inducers Check:</strong> {{cyp}}</li>\n  <li><strong>QT-Prolonging Combinations:</strong> {{qt_combos}}</li>\n  <li><strong>ECG Plan if Multiple Risks:</strong> {{ecg_plan}}</li>\n  <li><strong>Electrolyte Checks:</strong> {{electrolytes}}</li>\n  <li><strong>Local Interaction Checker:</strong> {{checker}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'med-interaction-scan', label:'Interaction scan', template:'Generate an interaction scan checklist to review before prescribing. Med List: {{med_list}}' },
      { id:'med-ecg-plan', label:'ECG plan', template:'Draft an ECG/monitoring note if QT risk is present. Risk Factors: {{risk_factors}}' }
    ],
    evidence: []
  },

  {
    id: 'mo-antipsychotic-metabolic-schedule',
    title: 'Antipsychotic Metabolic Monitoring — Schedule',
    sectionId: 'medication-orders',
    summary: 'Baseline / 4–12w / 3–6m / annual metabolic parameters table scaffold.',
    html: `\n<h2>Antipsychotic Metabolic Monitoring — Schedule</h2>\n<table style="font-size:12px;width:100%;border-collapse:collapse">\n  <thead><tr><th style="text-align:left">Interval</th><th style="text-align:left">Parameters</th></tr></thead>\n  <tbody>\n    <tr><td>Baseline</td><td>{{baseline_params}}</td></tr>\n    <tr><td>4–12 Weeks</td><td>{{w4_12_params}}</td></tr>\n    <tr><td>3–6 Months</td><td>{{m3_6_params}}</td></tr>\n    <tr><td>Annually</td><td>{{annual_params}}</td></tr>\n  </tbody>\n</table>\n<p><strong>Lifestyle Counseling Note:</strong> {{lifestyle_counsel}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'mo-metabolic-checklist', label:'Compose checklist', template:'Compose a metabolic monitoring checklist with due dates for the next 12 months. Baseline: {{baseline_params}} 4–12w: {{w4_12_params}} 3–6m: {{m3_6_params}} Annual: {{annual_params}}' },
      { id:'mo-metabolic-patient', label:'Patient summary', template:'Generate a brief patient-facing metabolic monitoring explanation. Focus: {{lifestyle_counsel}}' }
    ],
    evidence: []
  },
  {
    id: 'mo-li-vpa-condensed',
    title: 'Lithium & Valproate — Condensed Monitoring Table',
    sectionId: 'medication-orders',
    summary: 'Neutral baseline & ongoing table: levels, renal/hepatic panels, TSH, CBC, pregnancy test, toxicity signs.',
    html: `\n<h2>Lithium & Valproate — Condensed Monitoring Table</h2>\n<table style="font-size:12px;width:100%;border-collapse:collapse">\n  <thead><tr><th style="text-align:left">Domain</th><th style="text-align:left">Baseline</th><th style="text-align:left">Ongoing</th></tr></thead>\n  <tbody>\n    <tr><td>Levels (trough timing)</td><td>{{levels_baseline}}</td><td>{{levels_ongoing}}</td></tr>\n    <tr><td>Renal / Hepatic Panel</td><td>{{renal_hepatic_baseline}}</td><td>{{renal_hepatic_ongoing}}</td></tr>\n    <tr><td>TSH / Thyroid</td><td>{{thyroid_baseline}}</td><td>{{thyroid_ongoing}}</td></tr>\n    <tr><td>CBC / Platelets</td><td>{{cbc_baseline}}</td><td>{{cbc_ongoing}}</td></tr>\n    <tr><td>Pregnancy (if applicable)</td><td>{{pregnancy_baseline}}</td><td>{{pregnancy_ongoing}}</td></tr>\n    <tr><td>Toxicity Signs</td><td colspan="2">{{toxicity_signs}}</td></tr>\n  </tbody>\n</table>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'mo-li-vpa-level-plan', label:'Level plan', template:'Draft a level-check plan (dates & rationale) given start date and target range. Start Date: {{start_date}} Target Range: {{target_range}}' },
      { id:'mo-li-vpa-alert', label:'Alert list', template:'List toxicity alert symptoms and what to do. Toxicity Signs: {{toxicity_signs}}' }
    ],
    evidence: []
  },
  {
    id: 'mo-qt-checklist-ecg-plan',
    title: 'QT Risk Checklist & ECG Plan',
    sectionId: 'medication-orders',
    summary: 'Risk factors, drug list, ECG schedule, electrolyte checks scaffold.',
    html: `\n<h2>QT Risk Checklist & ECG Plan</h2>\n<ul style="font-size:12px">\n  <li><strong>Risk Factors (age/cardiac/electrolyte/polypharmacy):</strong> {{risk_factors}}</li>\n  <li><strong>Drug List (QT-prolonging):</strong> {{drug_list}}</li>\n  <li><strong>ECG Schedule:</strong> {{ecg_schedule}}</li>\n  <li><strong>Electrolyte Checks:</strong> {{electrolytes}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, formularies, and policies.</p>\n`,
    prompts: [
      { id:'mo-qt-ecg-note', label:'ECG note', template:'Compose an ECG plan and electrolyte check schedule tailored to this patient. Risk Factors: {{risk_factors}} Schedule: {{ecg_schedule}}' },
      { id:'mo-qt-risk-counsel', label:'Risk counseling', template:'Draft a neutral counseling paragraph about QT risk and monitoring. Drug List: {{drug_list}} Risk Factors: {{risk_factors}}' }
    ],
    evidence: []
  },

  {
    id: 'fu-apso-visit',
    title: 'Follow-up Visit — APSO (Risk-inclusive)',
    sectionId: 'follow_up',
    summary: 'APSO scaffold capturing interval changes, risk update, and MBC snapshot.',
    html: `\n<h2>Follow-up Visit — APSO (Risk-inclusive)</h2>\n<section><h3>Assessment</h3><p>{{assessment}}</p></section>\n<section><h3>Plan</h3><p>{{plan}}</p></section>\n<section><h3>Subjective (symptoms/function/adherence/stressors)</h3><p>{{subjective}}</p></section>\n<section><h3>Objective (vitals / MSE highlights)</h3><p>{{objective}}</p></section>\n<section><h3>Risk Update (SI/HI/self-harm/violence; means-safety)</h3><p>{{risk_update}}</p></section>\n<section><h3>MBC Snapshot (scores & dates)</h3><p>{{mbc_snapshot}}</p></section>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-apso-compose', label:'Compose APSO', template:'Compose a concise APSO follow-up note with risk and MBC context (≤180 words). Assessment: {{assessment}} Subjective: {{subjective}} Objective: {{objective}} Risk: {{risk_update}} MBC: {{mbc_snapshot}} Plan: {{plan}}' },
      { id:'fu-apso-delta', label:'Delta summary', template:'Summarize changes since last visit (symptoms, function, MBC, side-effects) in ≤6 bullets. Subjective: {{subjective}} MBC: {{mbc_snapshot}} Assessment: {{assessment}}' }
    ],
    evidence: []
  },
  {
    id: 'fu-sideeffects-adherence',
    title: 'Side-Effects & Adherence Review — Checklist',
    sectionId: 'follow_up',
    summary: 'Adverse effects grid (domains, onset, severity, mitigation) plus adherence patterns.',
    html: `\n<h2>Side-Effects & Adherence Review — Checklist</h2>\n<ul style="font-size:12px">\n  <li><strong>Sedation:</strong> {{sedation}}</li>\n  <li><strong>Weight/Appetite:</strong> {{weight_appetite}}</li>\n  <li><strong>GI:</strong> {{gi}}</li>\n  <li><strong>Sexual:</strong> {{sexual}}</li>\n  <li><strong>EPS/Akathisia:</strong> {{eps_akathisia}}</li>\n  <li><strong>Sleep:</strong> {{sleep}}</li>\n  <li><strong>Onset:</strong> {{onset}}</li>\n  <li><strong>Severity:</strong> {{severity}}</li>\n  <li><strong>Mitigation Tried:</strong> {{mitigation_tried}}</li>\n</ul>\n<h3>Adherence</h3>\n<ul style="font-size:12px">\n  <li><strong>Missed Doses (# / pattern):</strong> {{missed_doses}}</li>\n  <li><strong>Reasons:</strong> {{reasons}}</li>\n  <li><strong>Supports / Aids:</strong> {{supports}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-se-mitigation', label:'SE mitigation plan', template:'Generate a mitigation plan per reported side-effect; include monitoring items. Sedation: {{sedation}} Weight: {{weight_appetite}} GI: {{gi}} Sexual: {{sexual}} EPS/Akathisia: {{eps_akathisia}} Sleep: {{sleep}} Severity: {{severity}} Mitigation Tried: {{mitigation_tried}}' },
      { id:'fu-adherence-supports', label:'Adherence supports', template:'List 5 tailored adherence supports (reminders, packaging, routines, family). Missed Doses: {{missed_doses}} Reasons: {{reasons}} Supports: {{supports}}' }
    ],
    evidence: []
  },
  {
    id: 'fu-mbc-mini-dashboard',
    title: 'MBC Trend — Mini Dashboard (PHQ-9/GAD-7)',
    sectionId: 'follow_up',
    summary: 'Mini table: date, instrument, score, Δ baseline, Δ last; response/remission reminder.',
    html: `\n<h2>MBC Trend — Mini Dashboard (PHQ-9 / GAD-7)</h2>\n<table style="font-size:12px;width:100%;border-collapse:collapse">\n  <thead><tr><th style="text-align:left">Date</th><th style="text-align:left">Instrument</th><th style="text-align:left">Score</th><th style="text-align:left">Δ Baseline</th><th style="text-align:left">Δ Last</th></tr></thead>\n  <tbody>{{mbc_rows}}</tbody>\n</table>\n<p><em>Response/remission logic:</em> {{response_logic}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-mbc-status', label:'Compute status', template:'Given baseline and recent scores/dates, compute % change and classify response vs remission. Rows: {{mbc_rows}} Logic: {{response_logic}}' },
      { id:'fu-mbc-cadence', label:'Next cadence', template:'Propose monitoring cadence and next score due date. Current Rows: {{mbc_rows}}' }
    ],
    evidence: []
  },
  {
    id: 'fu-care-coordination-log',
    title: 'Care Coordination Log (Liaison & Tasks)',
    sectionId: 'follow_up',
    summary: 'Contacts, topic, ask, status, due date, callback info tracking.',
    html: `\n<h2>Care Coordination Log</h2>\n<table style="font-size:12px;width:100%;border-collapse:collapse">\n  <thead><tr><th style="text-align:left">Contact</th><th style="text-align:left">Topic</th><th style="text-align:left">Ask</th><th style="text-align:left">Status</th><th style="text-align:left">Due</th><th style="text-align:left">Callback</th></tr></thead>\n  <tbody>{{coordination_rows}}</tbody>\n</table>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-care-liaison-note', label:'Liaison note', template:'Draft a neutral liaison note with a clear ask and brief clinical context. Rows: {{coordination_rows}} Clinical Context: {{clinical_context}}' },
      { id:'fu-care-task-queue', label:'Task queue', template:'Summarize outstanding coordination tasks as a prioritized checklist. Rows: {{coordination_rows}}' }
    ],
    evidence: []
  },
  {
    id: 'fu-rtc-cadence-planner',
    title: 'RTC & Monitoring Cadence Planner',
    sectionId: 'follow_up',
    summary: 'Severity anchor, risk status, MBC trajectory, next RTC window, labs/ECG due, forward flags.',
    html: `\n<h2>RTC & Monitoring Cadence Planner</h2>\n<ul style="font-size:12px">\n  <li><strong>Severity Anchor:</strong> {{severity_anchor}}</li>\n  <li><strong>Risk Status:</strong> {{risk_status}}</li>\n  <li><strong>MBC Trajectory:</strong> {{mbc_trajectory}}</li>\n  <li><strong>Next RTC Window (1–2w / 4w / 8w):</strong> {{next_rtc_window}}</li>\n  <li><strong>Labs / ECG Due:</strong> {{labs_due}}</li>\n  <li><strong>Flags to Bring Forward:</strong> {{flags_forward}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-rtc-plan', label:'RTC plan', template:'Compose a return-to-clinic and monitoring plan with dates and triggers to advance care. Severity: {{severity_anchor}} Risk: {{risk_status}} MBC: {{mbc_trajectory}} Next Window: {{next_rtc_window}} Labs: {{labs_due}} Flags: {{flags_forward}}' },
      { id:'fu-rtc-patient-message', label:'Patient message', template:'Generate a patient-facing reminder paragraph (neutral tone). Plan Window: {{next_rtc_window}} Monitoring: {{labs_due}} Flags: {{flags_forward}}' }
    ],
    evidence: []
  },
  {
    id: 'fu-noshow-cancellation',
    title: 'No-Show / Cancellation — Documentation Skeleton',
    sectionId: 'follow_up',
    summary: 'Date/time, contact attempts, risk concerns, outreach actions, next steps.',
    html: `\n<h2>No-Show / Cancellation — Documentation Skeleton</h2>\n<ul style="font-size:12px">\n  <li><strong>Date / Time:</strong> {{date_time}}</li>\n  <li><strong>Contact Attempts:</strong> {{contact_attempts}}</li>\n  <li><strong>Risk Concerns:</strong> {{risk_concerns}}</li>\n  <li><strong>Follow-up Actions (messages/calls):</strong> {{follow_up_actions}}</li>\n  <li><strong>Next Steps:</strong> {{next_steps}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'fu-noshow-note', label:'No-show note', template:'Compose a neutral no-show note with risk check and outreach plan. Contact Attempts: {{contact_attempts}} Risk: {{risk_concerns}} Actions: {{follow_up_actions}} Next: {{next_steps}}' },
      { id:'fu-noshow-outreach', label:'Outreach script', template:'Draft a brief outreach script offering reschedule and safety resources. Risk: {{risk_concerns}} Next Steps: {{next_steps}}' }
    ],
    evidence: []
  },

  {
    id: 'pl-progress-note-toggle',
    title: 'Progress Note — APSO / SOAP Toggle',
    sectionId: 'progress_letters',
    summary: 'Shared fields with structure toggle placeholder (APSO vs SOAP).',
    html: `\n<h2>Progress Note — APSO / SOAP Toggle</h2>\n<p><strong>Structure:</strong> {{structure_choice}} (APSO or SOAP)</p>\n<ul style="font-size:12px">\n  <li><strong>Chief Update:</strong> {{chief_update}}</li>\n  <li><strong>Interim Events:</strong> {{interim_events}}</li>\n  <li><strong>MSE Highlights:</strong> {{mse_highlights}}</li>\n  <li><strong>Risk:</strong> {{risk}}</li>\n  <li><strong>Plan:</strong> {{plan}}</li>\n  <li><strong>Problem List:</strong> {{problem_list}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-progress-compose', label:'Compose progress note', template:'Compose a progress note in the selected APSO or SOAP structure (≤200 words). Structure: {{structure_choice}} Chief: {{chief_update}} Interim: {{interim_events}} MSE: {{mse_highlights}} Risk: {{risk}} Plan: {{plan}} Problems: {{problem_list}}' },
      { id:'pl-progress-problem-update', label:'Problem list update', template:'Update the problem list with status tags (improved/stable/worse). Current Problems: {{problem_list}} Interim Events: {{interim_events}}' }
    ],
    evidence: []
  },
  {
    id: 'pl-referral-letter',
    title: 'Referral Letter — Specialist / Service',
    sectionId: 'progress_letters',
    summary: 'Recipient, reason, salient history, treatments tried, status/risk, questions, attachments.',
    html: `\n<h2>Referral Letter — Specialist / Service</h2>\n<ul style="font-size:12px">\n  <li><strong>Recipient / Service:</strong> {{recipient}}</li>\n  <li><strong>Reason for Referral:</strong> {{reason}}</li>\n  <li><strong>Salient History:</strong> {{salient_history}}</li>\n  <li><strong>Treatments Tried:</strong> {{treatments_tried}}</li>\n  <li><strong>Current Status & Risk:</strong> {{current_status_risk}}</li>\n  <li><strong>Specific Questions:</strong> {{specific_questions}}</li>\n  <li><strong>Attachments:</strong> {{attachments}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-referral-compose', label:'Compose referral', template:'Draft a concise referral letter with clear questions and attachments list. Recipient: {{recipient}} Reason: {{reason}} History: {{salient_history}} Treatments: {{treatments_tried}} Status/Risk: {{current_status_risk}} Questions: {{specific_questions}} Attachments: {{attachments}}' },
      { id:'pl-referral-summary', label:'Summary paragraph', template:'Create a 120-word clinical summary for the referral. Reason: {{reason}} History: {{salient_history}} Treatments: {{treatments_tried}} Status/Risk: {{current_status_risk}}' }
    ],
    evidence: []
  },
  {
    id: 'pl-accommodation-letter',
    title: 'Work/School Accommodation Letter — Generic',
    sectionId: 'progress_letters',
    summary: 'Role/setting, limitations, requested accommodations, duration/review date, contact.',
    html: `\n<h2>Work/School Accommodation Letter — Generic</h2>\n<ul style="font-size:12px">\n  <li><strong>Role / Setting:</strong> {{role_setting}}</li>\n  <li><strong>Functional Limitations:</strong> {{functional_limitations}}</li>\n  <li><strong>Requested Accommodations:</strong> {{requested_accommodations}}</li>\n  <li><strong>Duration / Review Date:</strong> {{duration_review}}</li>\n  <li><strong>Contact:</strong> {{contact_info}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-accom-compose', label:'Compose letter', template:'Compose a neutral accommodation letter focusing on functional needs. Role: {{role_setting}} Limitations: {{functional_limitations}} Accommodations: {{requested_accommodations}} Duration: {{duration_review}} Contact: {{contact_info}}' },
      { id:'pl-accom-menu', label:'Accommodation menu', template:'List reasonable accommodation options tailored to the case. Limitations: {{functional_limitations}} Role: {{role_setting}}' }
    ],
    evidence: []
  },
  {
    id: 'pl-fitness-outline',
    title: 'Fitness for Duty/Study — Clinical Outline (Neutral)',
    sectionId: 'progress_letters',
    summary: 'Referral question, observations/course, functional assessment, risk management, recommendation, limits.',
    html: `\n<h2>Fitness for Duty/Study — Clinical Outline (Neutral)</h2>\n<ul style="font-size:12px">\n  <li><strong>Referral Question:</strong> {{referral_question}}</li>\n  <li><strong>Observations & Course:</strong> {{observations_course}}</li>\n  <li><strong>Functional Assessment:</strong> {{functional_assessment}}</li>\n  <li><strong>Risk Management:</strong> {{risk_management}}</li>\n  <li><strong>Recommendation (time-limited; neutral):</strong> {{recommendation}}</li>\n  <li><strong>Limits of Opinion:</strong> {{limits_opinion}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-fitness-prose', label:'Outline to prose', template:'Convert outline to a neutral Fitness-for-Duty/Study letter without legal conclusions. Referral Q: {{referral_question}} Observations: {{observations_course}} Functional: {{functional_assessment}} Risk: {{risk_management}} Recommendation: {{recommendation}} Limits: {{limits_opinion}}' },
      { id:'pl-fitness-limitations', label:'Limitations', template:'Draft a limitations paragraph (scope, data sources, time frame). Limits: {{limits_opinion}} Data Sources: {{observations_course}}' }
    ],
    evidence: []
  },
  {
    id: 'pl-medication-summary',
    title: 'Medication Summary & Instructions (Patient-Facing)',
    sectionId: 'progress_letters',
    summary: 'Current meds, purpose, common side-effects, missed dose guidance, when to call, follow-up date.',
    html: `\n<h2>Medication Summary & Instructions (Patient-Facing)</h2>\n<ul style="font-size:12px">\n  <li><strong>Current Medications (agent / dose / timing):</strong> {{current_meds}}</li>\n  <li><strong>Purpose:</strong> {{purpose}}</li>\n  <li><strong>Common Side-Effects:</strong> {{side_effects_common}}</li>\n  <li><strong>Missed Dose — What to Do:</strong> {{missed_dose}}</li>\n  <li><strong>When to Call:</strong> {{when_to_call}}</li>\n  <li><strong>Follow-up Date:</strong> {{follow_up_date}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-med-summary', label:'Patient summary', template:'Generate a patient-facing medication summary (clear, non-alarming, ≤160 words). Meds: {{current_meds}} Purpose: {{purpose}} SE: {{side_effects_common}} Missed Dose: {{missed_dose}} When to Call: {{when_to_call}} Follow-up: {{follow_up_date}}' },
      { id:'pl-med-instructions', label:'Instructions list', template:'Create a bullet list of key instructions and when to seek help. Meds: {{current_meds}} SE: {{side_effects_common}} When to Call: {{when_to_call}}' }
    ],
    evidence: []
  },
  {
    id: 'pl-discharge-transfer-summary',
    title: 'Discharge / Transfer Summary (Continuity of Care)',
    sectionId: 'progress_letters',
    summary: 'Presenting problems, course/response, diagnoses, meds at discharge, risk & means-safety, outstanding items, follow-up, receiving contact.',
    html: `\n<h2>Discharge / Transfer Summary (Continuity of Care)</h2>\n<ul style="font-size:12px">\n  <li><strong>Presenting Problems:</strong> {{presenting_problems}}</li>\n  <li><strong>Course & Response:</strong> {{course_response}}</li>\n  <li><strong>Diagnoses:</strong> {{diagnoses}}</li>\n  <li><strong>Medications at Discharge:</strong> {{meds_at_discharge}}</li>\n  <li><strong>Risk & Means-Safety:</strong> {{risk_means_safety}}</li>\n  <li><strong>Outstanding Tests / Consults:</strong> {{outstanding_tests_consults}}</li>\n  <li><strong>Follow-up Plan:</strong> {{follow_up_plan}}</li>\n  <li><strong>Receiving Service Contact:</strong> {{receiving_service_contact}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines/policies.</p>\n`,
    prompts: [
      { id:'pl-discharge-compose', label:'Compose discharge summary', template:'Compose a continuity-of-care summary with clear next steps. Presenting: {{presenting_problems}} Course: {{course_response}} Dx: {{diagnoses}} Meds: {{meds_at_discharge}} Risk: {{risk_means_safety}} Outstanding: {{outstanding_tests_consults}} Follow-up: {{follow_up_plan}} Receiving: {{receiving_service_contact}}' },
      { id:'pl-discharge-handoff', label:'Handoff checklist', template:'Generate a handoff checklist (what/when/who). Follow-up Plan: {{follow_up_plan}} Outstanding: {{outstanding_tests_consults}} Receiving: {{receiving_service_contact}}' }
    ],
    evidence: []
  },

  {
    id: 'pe-depression-onepager',
    title: 'Depression — Clinician One-Pager (Talking Points)',
    sectionId: 'psychoeducation',
    summary: 'Concise clinician talking points: definition, symptoms, course, treatments, self-management, warning signs.',
    html: `\n<h2>Depression — Clinician One-Pager</h2>\n<ul style="font-size:12px">\n  <li><strong>What it is:</strong> {{what_it_is}}</li>\n  <li><strong>What it is NOT:</strong> {{what_it_is_not}}</li>\n  <li><strong>Common Symptoms:</strong> {{common_symptoms}}</li>\n  <li><strong>Course & Prognosis:</strong> {{course_prognosis}}</li>\n  <li><strong>Treatment Options (therapy / medication / combined):</strong> {{treatment_options}}</li>\n  <li><strong>Self-Management (sleep / activity / substances):</strong> {{self_management}}</li>\n  <li><strong>Warning Signs & When to Seek Help:</strong> {{warning_signs}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'pe-depression-patient-summary', label:'Patient-facing summary', template:'Write a B1-level (plain English) patient-facing explanation of depression (120–150 words). Key Points: {{what_it_is}} Symptoms: {{common_symptoms}} Treatments: {{treatment_options}} Self-care: {{self_management}} Warning: {{warning_signs}}' },
      { id:'pe-depression-myth-fact', label:'Myth vs fact', template:'Generate 6 myth-vs-fact bullets about depression. Focus Areas: causes, weakness myth, “snap out of it”, treatment effectiveness, medication dependence, recovery.' }
    ],
    evidence: []
  },
  {
    id: 'pe-anxiety-panic-explainer',
    title: 'Anxiety vs Panic — Quick Explainer',
    sectionId: 'psychoeducation',
    summary: 'Overview: generalized anxiety vs panic attacks, avoidance cycle, exposure/CBT role, meds, self-regulation basics.',
    html: `\n<h2>Anxiety vs Panic — Quick Explainer</h2>\n<ul style="font-size:12px">\n  <li><strong>Anxiety Disorders Overview:</strong> {{anxiety_overview}}</li>\n  <li><strong>Panic Attack Features:</strong> {{panic_features}}</li>\n  <li><strong>Avoidance Cycle:</strong> {{avoidance_cycle}}</li>\n  <li><strong>Exposure / CBT Role:</strong> {{exposure_cbt_role}}</li>\n  <li><strong>When Medication Helps:</strong> {{med_help}}</li>\n  <li><strong>Self-Regulation (breathing / grounding):</strong> {{self_regulation}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'pe-anxiety-plain-brief', label:'Plain-language brief', template:'Create a 120-word brief comparing general anxiety vs panic attacks. Include avoidance and treatment basics.' },
      { id:'pe-anxiety-skills-list', label:'Skills list', template:'List 5 quick skills to practice (one line each): e.g., paced breathing, 5-4-3-2-1 grounding, muscle release, cognitive label, values micro-action.' }
    ],
    evidence: []
  },
  {
    id: 'pe-bipolar-monitoring',
    title: 'Bipolar Spectrum — Why Monitoring Matters',
    sectionId: 'psychoeducation',
    summary: 'Mood episodes, mixed features, sleep regularity, triggers, early warning signs, adherence & labs importance.',
    html: `\n<h2>Bipolar Spectrum — Why Monitoring Matters</h2>\n<ul style="font-size:12px">\n  <li><strong>Mood Episodes (depression / hypomania / mania):</strong> {{mood_episodes}}</li>\n  <li><strong>Mixed Features:</strong> {{mixed_features}}</li>\n  <li><strong>Sleep Regularity:</strong> {{sleep_regular}}</li>\n  <li><strong>Triggers:</strong> {{triggers}}</li>\n  <li><strong>Early Warning Signs:</strong> {{early_warning}}</li>\n  <li><strong>Adherence & Labs (neutral):</strong> {{adherence_labs}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'pe-bipolar-early-warning', label:'Early warning sheet', template:'Compose an early warning signs sheet (patient-facing, concise). Areas: {{early_warning}} Sleep: {{sleep_regular}} Triggers: {{triggers}}' },
      { id:'pe-bipolar-family-guidance', label:'Family guidance', template:'Draft guidance for family/supports (≤120 words) focusing on early signs, supportive monitoring, and neutral language.' }
    ],
    evidence: []
  },
  {
    id: 'pe-exposure-rationale',
    title: 'PTSD & OCD — Exposure Rationale (Non-proprietary)',
    sectionId: 'psychoeducation',
    summary: 'Why exposure works (habituation/inhibitory learning), safety & pacing, therapist role, home practice, concerns.',
    html: `\n<h2>PTSD & OCD — Exposure Rationale</h2>\n<ul style="font-size:12px">\n  <li><strong>Why Exposure Works (habituation / inhibitory learning):</strong> {{why_exposure}}</li>\n  <li><strong>Safety & Pacing:</strong> {{safety_pacing}}</li>\n  <li><strong>Therapist Role:</strong> {{therapist_role}}</li>\n  <li><strong>Home Practice:</strong> {{home_practice}}</li>\n  <li><strong>Common Concerns:</strong> {{common_concerns}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'pe-exposure-rationale-para', label:'Rationale paragraph', template:'Write a B1-level rationale for exposure therapy in PTSD/OCD (≤120 words). Emphasize safety, gradual steps, learning new associations.' },
      { id:'pe-exposure-homework-explainer', label:'Homework explainer', template:'Create a short homework explainer with 3 tips for success (consistency, tracking, coping strategies).' }
    ],
    evidence: []
  },

  {
    id: 'handout-depression-print',
  title: 'Patient Handout — Depression (Print-ready Handout)',
    sectionId: 'handouts',
    summary: 'Print-ready structure: what to expect, treatments, self-care, crisis contacts, follow-up space.',
    html: `\n<h2>Depression — Patient Handout</h2>\n<h3>What to Expect</h3><p>{{what_expect}}</p>\n<h3>Treatments</h3><p>{{treatments}}</p>\n<h3>Self-Care</h3><p>{{self_care}}</p>\n<h3>Crisis Contacts</h3><p>{{crisis_contacts}}</p>\n<h3>Follow-up Date</h3><p>{{follow_up_date}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'handout-depression-compose', label:'Compose handout', template:'Compose a print-ready handout (≤250 words), plain English, with headings and short lists. Core Points: {{what_expect}} Treatments: {{treatments}} Self-care: {{self_care}} Crisis: {{crisis_contacts}} Follow-up: {{follow_up_date}}' },
      { id:'handout-depression-avs', label:'After-visit summary', template:'Create an after-visit summary with next steps and contacts. Treatments: {{treatments}} Follow-up: {{follow_up_date}} Crisis: {{crisis_contacts}}' }
    ],
    evidence: []
  },
  {
    id: 'handout-sleep-hygiene',
    title: 'Sleep Hygiene Checklist (Printable)',
    sectionId: 'handouts',
    summary: 'Checklist: routine, environment, substances, screens, wind-down, activity timing.',
    html: `\n<h2>Sleep Hygiene Checklist</h2>\n<ul style="font-size:12px">\n  <li><strong>Bed/Wake Routine:</strong> {{routine}}</li>\n  <li><strong>Light / Noise:</strong> {{light_noise}}</li>\n  <li><strong>Caffeine / Alcohol / Nicotine:</strong> {{substances}}</li>\n  <li><strong>Screen Use:</strong> {{screens}}</li>\n  <li><strong>Wind-down:</strong> {{wind_down}}</li>\n  <li><strong>Activity Timing:</strong> {{activity_timing}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'handout-sleep-checklist', label:'Checklist', template:'Generate a numbered sleep hygiene checklist (10–12 items).' },
      { id:'handout-sleep-cbti-tie', label:'CBT-I tie-in', template:'Explain how these items support CBT-I in ≤100 words.' }
    ],
    evidence: []
  },
  {
    id: 'handout-crisis-card',
  title: 'Crisis Resources Card (Wallet-size Layout Option)',
    sectionId: 'handouts',
    summary: 'Local emergency number, clinic, after-hours, trusted contacts, safety steps placeholders.',
    html: `\n<h2>Crisis Resources Card</h2>\n<ul style="font-size:12px">\n  <li><strong>Emergency Number:</strong> {{emergency_number}}</li>\n  <li><strong>Clinic Line:</strong> {{clinic_line}}</li>\n  <li><strong>After-Hours:</strong> {{after_hours}}</li>\n  <li><strong>Trusted Contacts:</strong> {{trusted_contacts}}</li>\n  <li><strong>Safety Steps:</strong> {{safety_steps}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'handout-crisis-fill', label:'Fill card', template:'Fill the crisis card with placeholders replaced by clinic-specific labels. Emergency: {{emergency_number}} Clinic: {{clinic_line}} After-Hours: {{after_hours}} Contacts: {{trusted_contacts}}' },
      { id:'handout-crisis-safety', label:'Safety steps', template:'List step-by-step safety actions for imminent risk. Steps Context: {{safety_steps}}' }
    ],
    evidence: []
  },
  {
    id: 'handout-med-start-ssri-snri',
  title: 'Medication Start — Generic Info Sheet (SSRI/SNRI/Atypical)',
    sectionId: 'handouts',
    summary: 'Plain-language info: what it does, onset, common side effects, missed dose, when to call, follow-up.',
    html: `\n<h2>Medication Start — SSRIs / SNRIs</h2>\n<ul style="font-size:12px">\n  <li><strong>What it Does (plain):</strong> {{what_does}}</li>\n  <li><strong>How Long Until Effect:</strong> {{onset}}</li>\n  <li><strong>Common Side Effects:</strong> {{common_side_effects}}</li>\n  <li><strong>Missed Dose — What to Do:</strong> {{missed_dose}}</li>\n  <li><strong>When to Call:</strong> {{when_call}}</li>\n  <li><strong>Follow-up Date:</strong> {{follow_up_date}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'handout-medstart-patient', label:'Patient info', template:'Draft a B1-level patient info sheet for starting an SSRI/SNRI (≤200 words). Cover mechanism (plain), onset, side effects, adherence, when to call.' },
      { id:'handout-medstart-faq', label:'FAQ', template:'Generate 6 common FAQs with concise answers (onset, side effects, missed dose, dependence, lifestyle, follow-up).' }
    ],
    evidence: []
  },

  {
    id: 'consent-medication-generic',
    title: 'Informed Consent — Medication (Generic)',
    sectionId: 'ethics_consent',
    summary: 'Purpose/benefits, risks/side effects, alternatives (incl. no treatment), unknowns, interactions, questions, withdrawal rights.',
    html: `\n<h2>Informed Consent — Medication (Generic)</h2>\n<ul style="font-size:12px">\n  <li><strong>Purpose / Benefits:</strong> {{purpose_benefits}}</li>\n  <li><strong>Risks / Side Effects:</strong> {{risks_side_effects}}</li>\n  <li><strong>Alternatives (including no treatment):</strong> {{alternatives}}</li>\n  <li><strong>Unknowns / Uncertainties:</strong> {{unknowns}}</li>\n  <li><strong>Interaction Check Reminder:</strong> {{interaction_check}}</li>\n  <li><strong>Questions & Withdrawal Anytime:</strong> {{questions_withdrawal}}</li>\n  <li><strong>Signature / Date:</strong> {{signature_date}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'consent-med-summary', label:'Consent text', template:'Compose a neutral medication consent summary reflecting purpose/risks/alternatives in clear English (≤180 words). Context: {{purpose_benefits}} Risks: {{risks_side_effects}} Alternatives: {{alternatives}}' },
      { id:'consent-med-bullets', label:'Plain-language bullets', template:'Reduce to 10 bullets suitable for verbal consent documentation. Purpose: {{purpose_benefits}} Risks: {{risks_side_effects}} Alternatives: {{alternatives}} Unknowns: {{unknowns}}' }
    ],
    evidence: []
  },
  {
    id: 'consent-psychotherapy',
    title: 'Psychotherapy Consent & Boundaries',
    sectionId: 'ethics_consent',
    summary: 'Confidentiality & limits, session structure/frequency, goals & roles, attendance/cancellation, communication, emergencies, privacy note.',
    html: `\n<h2>Psychotherapy Consent & Boundaries</h2>\n<ul style="font-size:12px">\n  <li><strong>Confidentiality & Limits:</strong> {{confidentiality_limits}}</li>\n  <li><strong>Session Structure & Frequency:</strong> {{structure_frequency}}</li>\n  <li><strong>Goals & Roles:</strong> {{goals_roles}}</li>\n  <li><strong>Attendance / Cancellation:</strong> {{attendance_cancellation}}</li>\n  <li><strong>Communication Channels:</strong> {{communication_channels}}</li>\n  <li><strong>Emergencies:</strong> {{emergencies}}</li>\n  <li><strong>Privacy Note (laws vary):</strong> {{privacy_note}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'consent-therapy-summary', label:'Consent summary', template:'Write a therapy consent summary with boundaries and attendance policy. Boundaries: {{confidentiality_limits}} Attendance: {{attendance_cancellation}} Emergencies: {{emergencies}}' },
      { id:'consent-therapy-expect', label:'Expectations handout', template:'Generate a brief “what to expect in therapy” handout (structure, roles, communication, safety).' }
    ],
    evidence: []
  },
  {
    id: 'consent-telepsychiatry',
    title: 'Telepsychiatry Consent (Non-jurisdictional)',
    sectionId: 'ethics_consent',
    summary: 'Tech requirements, privacy/security limits, location verification, emergency procedures, recording policy, risks/benefits, fallback.',
    html: `\n<h2>Telepsychiatry Consent (Non-jurisdictional)</h2>\n<ul style="font-size:12px">\n  <li><strong>Technology Requirements:</strong> {{tech_requirements}}</li>\n  <li><strong>Privacy & Security Limitations:</strong> {{privacy_security}}</li>\n  <li><strong>Location Verification:</strong> {{location_verification}}</li>\n  <li><strong>Emergency Procedures:</strong> {{emergency_procedures}}</li>\n  <li><strong>Recording Policy:</strong> {{recording_policy}}</li>\n  <li><strong>Risks / Benefits:</strong> {{risks_benefits}}</li>\n  <li><strong>Fallback Plan:</strong> {{fallback_plan}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'consent-telehealth-paragraph', label:'Telehealth consent', template:'Compose a telepsychiatry consent paragraph (≤160 words), neutral and non-jurisdictional. Elements: technology, privacy, emergency, fallback.' },
      { id:'consent-telehealth-emergency', label:'Emergency plan', template:'Draft the emergency fallback plan section for remote visits. Plan: {{fallback_plan}} Emergency Procedures: {{emergency_procedures}} Location: {{location_verification}}' }
    ],
    evidence: []
  },
  {
    id: 'consent-confidentiality-explainer',
    title: 'Confidentiality & Limits — Patient Explainer',
    sectionId: 'ethics_consent',
    summary: 'Records use, access, limits (risk, abuse, court orders), patient rights, contact for questions.',
    html: `\n<h2>Confidentiality & Limits — Patient Explainer</h2>\n<ul style="font-size:12px">\n  <li><strong>How Records Are Used:</strong> {{records_use}}</li>\n  <li><strong>Who Can Access:</strong> {{who_access}}</li>\n  <li><strong>Limits (risk, abuse reporting, court orders):</strong> {{limits}}</li>\n  <li><strong>Patient Rights (access / corrections):</strong> {{patient_rights}}</li>\n  <li><strong>Contact for Questions:</strong> {{contact_questions}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local guidelines, policies, and applicable laws.</p>\n`,
    prompts: [
      { id:'consent-confidentiality-explain', label:'Plain-language explainer', template:'Write a B1-level explainer about confidentiality & its limits (≤140 words). Cover record use, access, limits, rights, contact.' },
      { id:'consent-confidentiality-qa', label:'Q&A', template:'Create a 5-item Q&A clarifying common privacy questions (record access, emergency disclosure, corrections, sharing limits, contact).' }
    ],
    evidence: []
  },

  {
    id: 'camhs-intake-school-liaison',
    title: 'CAMHS Intake & School Liaison Summary (Scaffold)',
    sectionId: 'camhs',
    summary: 'Presenting concerns, development/education history, IEP/504 placeholders, strengths, risk screen, supports, initial plan, school contact & consent.',
    html: `\n<h2>CAMHS Intake & School Liaison Summary</h2>\n<ul style="font-size:12px">\n  <li><strong>Presenting Concerns:</strong> {{presenting_concerns}}</li>\n  <li><strong>Developmental / Education History:</strong> {{development_history}}</li>\n  <li><strong>IEP / 504 (or equivalent) Status:</strong> {{iep_status}}</li>\n  <li><strong>Strengths & Interests:</strong> {{strengths_interests}}</li>\n  <li><strong>Risk Screen (self-harm / bullying / safety):</strong> {{risk_screen}}</li>\n  <li><strong>Family Supports:</strong> {{family_supports}}</li>\n  <li><strong>Initial Plan:</strong> {{initial_plan}}</li>\n  <li><strong>School Contact & Consent:</strong> {{school_contact_consent}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'camhs-liaison-note', label:'Compose liaison note', template:'Draft a neutral school liaison note outlining needs/goals and classroom supports. Presenting: {{presenting_concerns}} Strengths: {{strengths_interests}} Supports: {{family_supports}} Plan: {{initial_plan}} School Contact: {{school_contact_consent}}' },
      { id:'camhs-parent-summary', label:'Parent summary', template:'Generate a parent-facing summary with next steps and consent reminders (≤140 words). Presenting: {{presenting_concerns}} Plan: {{initial_plan}} Risk: {{risk_screen}} Consent: {{school_contact_consent}}' }
    ],
    evidence: []
  },
  {
    id: 'camhs-adhd-supports-planner',
    title: 'ADHD — Home/School Supports Planner (Non-proprietary)',
    sectionId: 'camhs',
    summary: 'Targets, classroom strategies, home strategies, homework plan, reward/feedback system, review dates.',
    html: `\n<h2>ADHD — Home/School Supports Planner</h2>\n<ul style="font-size:12px">\n  <li><strong>Targets (attention / impulsivity / organization):</strong> {{targets}}</li>\n  <li><strong>Classroom Strategies (seating / chunking / timers / movement breaks):</strong> {{classroom_strategies}}</li>\n  <li><strong>Home Strategies (routines / visual schedules):</strong> {{home_strategies}}</li>\n  <li><strong>Homework Plan:</strong> {{homework_plan}}</li>\n  <li><strong>Reward / Feedback System:</strong> {{reward_feedback}}</li>\n  <li><strong>Review Dates:</strong> {{review_dates}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'camhs-adhd-supports-list', label:'Supports list', template:'Create a tailored home & classroom supports list with measurable checkpoints. Targets: {{targets}} Classroom: {{classroom_strategies}} Home: {{home_strategies}} Homework: {{homework_plan}} Rewards: {{reward_feedback}}' },
      { id:'camhs-adhd-progress-grid', label:'Progress grid', template:'Generate a weekly progress grid parents/teachers can use. Targets: {{targets}} Review Dates: {{review_dates}}' }
    ],
    evidence: []
  },
  {
    id: 'camhs-autism-accommodations',
    title: 'Autism Profile & Accommodations Builder (Adolescent)',
    sectionId: 'camhs',
    summary: 'Communication style, sensory profile, transition supports, interest-based engagement, environment adjustments, peer support, exam accommodations, safety plan.',
    html: `\n<h2>Autism Profile & Accommodations (Adolescent)</h2>\n<ul style="font-size:12px">\n  <li><strong>Communication Style:</strong> {{communication_style}}</li>\n  <li><strong>Sensory Profile:</strong> {{sensory_profile}}</li>\n  <li><strong>Predictability / Transition Supports:</strong> {{transition_supports}}</li>\n  <li><strong>Interest-based Engagement:</strong> {{interest_engagement}}</li>\n  <li><strong>Environment Adjustments (noise / light / crowding):</strong> {{environment_adjustments}}</li>\n  <li><strong>Peer Support:</strong> {{peer_support}}</li>\n  <li><strong>Exam Accommodations:</strong> {{exam_accommodations}}</li>\n  <li><strong>Safety Plan:</strong> {{safety_plan}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'camhs-autism-accom-plan', label:'Accommodation plan', template:'Compose an accommodation plan for school with rationale tied to the profile. Communication: {{communication_style}} Sensory: {{sensory_profile}} Transitions: {{transition_supports}} Environment: {{environment_adjustments}} Exams: {{exam_accommodations}}' },
      { id:'camhs-autism-strengths-summary', label:'Strengths-based summary', template:'Write a strengths-based summary to share with teachers (≤120 words). Strengths/Interests: {{interest_engagement}} Peer Support: {{peer_support}} Safety: {{safety_plan}}' }
    ],
    evidence: []
  },

  {
    id: 'grp-psychoeducation-smi-6session',
    title: 'Psychoeducation Group — 6-Session Outline (Severe Mental Illness)',
    sectionId: 'groups-programs',
    summary: 'Session outline: illness overview, meds & monitoring, relapse prevention, stress & sleep, family involvement, crisis/resources.',
    html: `\n<h2>Psychoeducation Group — 6-Session Outline (SMI)</h2>\n<ol style="font-size:12px">\n  <li><strong>Session 1:</strong> {{session1}}</li>\n  <li><strong>Session 2:</strong> {{session2}}</li>\n  <li><strong>Session 3:</strong> {{session3}}</li>\n  <li><strong>Session 4:</strong> {{session4}}</li>\n  <li><strong>Session 5:</strong> {{session5}}</li>\n  <li><strong>Session 6:</strong> {{session6}}</li>\n</ol>\n<p><strong>Home Practice (each session):</strong> {{home_practice}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'grp-smi-session-plan', label:'Session plan', template:'Compose Session 1 plan with objectives, agenda, and take-home tasks. Session 1: {{session1}} Home Practice: {{home_practice}}' },
      { id:'grp-smi-attendance-note', label:'Attendance note', template:'Draft a brief attendance/progress note template for groups (fields: participation, engagement, homework, risk, plan).' }
    ],
    evidence: []
  },
  {
    id: 'grp-dbt-skills-picker',
    title: 'DBT Skills Group — Module Picker',
    sectionId: 'groups-programs',
    summary: 'Modules: Core Mindfulness, Distress Tolerance, Emotion Regulation, Interpersonal Effectiveness with skills & homework placeholders.',
    html: `\n<h2>DBT Skills Group — Module Picker</h2>\n<ul style="font-size:12px">\n  <li><strong>Core Mindfulness:</strong> {{core_mindfulness}}</li>\n  <li><strong>Distress Tolerance:</strong> {{distress_tolerance}}</li>\n  <li><strong>Emotion Regulation:</strong> {{emotion_regulation}}</li>\n  <li><strong>Interpersonal Effectiveness:</strong> {{interpersonal_effectiveness}}</li>\n  <li><strong>Practice Task:</strong> {{practice_task}}</li>\n  <li><strong>Homework:</strong> {{homework}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'grp-dbt-weekly-plan', label:'Weekly plan', template:'Create a weekly DBT skills plan (skills, in-group practice, homework). Modules: {{core_mindfulness}} {{distress_tolerance}} {{emotion_regulation}} {{interpersonal_effectiveness}}' },
      { id:'grp-dbt-coaching-script', label:'Coaching script', template:'Draft brief coaching scripts for two selected skills. Skills: {{core_mindfulness}} {{distress_tolerance}} {{emotion_regulation}} {{interpersonal_effectiveness}}' }
    ],
    evidence: []
  },
  {
    id: 'grp-family-psychoeducation',
    title: 'Family Psychoeducation — Single-Session Plan',
    sectionId: 'groups-programs',
    summary: 'Goals, ground rules, illness model, communication skills, support map, relapse warning signs, crisis steps, resources.',
    html: `\n<h2>Family Psychoeducation — Single Session Plan</h2>\n<ul style="font-size:12px">\n  <li><strong>Goals:</strong> {{goals}}</li>\n  <li><strong>Ground Rules:</strong> {{ground_rules}}</li>\n  <li><strong>Brief Illness Model:</strong> {{illness_model}}</li>\n  <li><strong>Communication Skills:</strong> {{communication_skills}}</li>\n  <li><strong>Support Map:</strong> {{support_map}}</li>\n  <li><strong>Relapse Warning Signs:</strong> {{relapse_warning}}</li>\n  <li><strong>Crisis Steps:</strong> {{crisis_steps}}</li>\n  <li><strong>Resources:</strong> {{resources}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'grp-family-outline', label:'Family session outline', template:'Generate a 60–90 min family session outline with timings. Goals: {{goals}} Warning Signs: {{relapse_warning}} Crisis: {{crisis_steps}}' },
      { id:'grp-family-handout', label:'Handout text', template:'Compose a family-facing handout summarizing supports and crisis steps. Supports: {{support_map}} Crisis: {{crisis_steps}} Resources: {{resources}}' }
    ],
    evidence: []
  },

  {
    id: 'case-benefits-functional-letter',
    title: 'Benefits/Disability Support Letter — Functional Framing',
    sectionId: 'case-letters',
    summary: 'Functional limitations, impact, reasonable supports, duration & review date (neutral, no legal conclusions).',
    html: `\n<h2>Benefits / Disability Support Letter — Functional Framing</h2>\n<ul style="font-size:12px">\n  <li><strong>Functional Limitations (attention / stamina / social / stress tolerance):</strong> {{functional_limitations}}</li>\n  <li><strong>Work/School Impact:</strong> {{impact}}</li>\n  <li><strong>Reasonable Supports:</strong> {{supports}}</li>\n  <li><strong>Duration & Review Date:</strong> {{duration_review}}</li>\n  <li><strong>Neutral Tone Notes:</strong> {{neutral_tone}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'case-benefits-compose', label:'Compose letter', template:'Compose a neutral function-focused support letter (no legal conclusions). Limitations: {{functional_limitations}} Impact: {{impact}} Supports: {{supports}} Duration: {{duration_review}}' },
      { id:'case-benefits-menu', label:'Accommodation menu', template:'List reasonable accommodations with one-line rationales. Limitations: {{functional_limitations}}' }
    ],
    evidence: []
  },
  {
    id: 'case-travel-med-letter',
    title: 'Travel Letter — Medication & Contact Information',
    sectionId: 'case-letters',
    summary: 'Minimal diagnosis phrasing, current generic medications, carrying instructions, clinic contact, fit-to-travel statement, emergency steps.',
    html: `\n<h2>Travel Letter — Medication & Contact</h2>\n<ul style="font-size:12px">\n  <li><strong>Diagnosis (minimal phrasing):</strong> {{diagnosis_minimal}}</li>\n  <li><strong>Current Medications (agent / dose / timing):</strong> {{current_meds}}</li>\n  <li><strong>Carrying / Storage Instructions:</strong> {{carrying_instructions}}</li>\n  <li><strong>Clinic Contact:</strong> {{clinic_contact}}</li>\n  <li><strong>Fit-to-Travel Statement (if appropriate):</strong> {{fit_travel}}</li>\n  <li><strong>Emergency Steps:</strong> {{emergency_steps}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'case-travel-compose', label:'Compose travel letter', template:'Draft a travel letter with medication list and emergency contact info. Meds: {{current_meds}} Contact: {{clinic_contact}} Emergency: {{emergency_steps}}' },
      { id:'case-travel-checklist', label:'Checklist', template:'Generate a pre-travel medication/safety checklist. Meds: {{current_meds}} Storage: {{carrying_instructions}} Emergency: {{emergency_steps}}' }
    ],
    evidence: []
  },
  {
    id: 'case-reintegration-plan',
    title: 'School/Work Reintegration Plan — Graduated Return',
    sectionId: 'case-letters',
    summary: 'Start date, hours progression, task adjustments, breaks/supports, review cadence, success criteria, contact person.',
    html: `\n<h2>School / Work Reintegration Plan — Graduated Return</h2>\n<ul style="font-size:12px">\n  <li><strong>Start Date:</strong> {{start_date}}</li>\n  <li><strong>Hours Progression:</strong> {{hours_progression}}</li>\n  <li><strong>Task Adjustments:</strong> {{task_adjustments}}</li>\n  <li><strong>Breaks & Supports:</strong> {{breaks_supports}}</li>\n  <li><strong>Review Cadence:</strong> {{review_cadence}}</li>\n  <li><strong>Success Criteria:</strong> {{success_criteria}}</li>\n  <li><strong>Contact Person:</strong> {{contact_person}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'case-reintegration-compose', label:'Reintegration plan', template:'Compose a graded return-to-school/work plan with milestones. Start: {{start_date}} Hours: {{hours_progression}} Tasks: {{task_adjustments}} Supports: {{breaks_supports}} Reviews: {{review_cadence}} Success: {{success_criteria}}' },
      { id:'case-reintegration-supervisor', label:'Supervisor note', template:'Draft a brief supervisor-facing note describing supports and review dates. Supports: {{breaks_supports}} Reviews: {{review_cadence}} Criteria: {{success_criteria}} Contact: {{contact_person}}' }
    ],
    evidence: []
  },

  {
    id: 'nm-cognitive-screen-triggers',
    title: 'Cognitive Screen & Referral Triggers (Non-proprietary)',
    sectionId: 'neuro-med',
    summary: 'When to screen, basic elements, red flags for referral, imaging/labs outline.',
    html: `\n<h2>Cognitive Screen & Referral Triggers</h2>\n<ul style="font-size:12px">\n  <li><strong>When to Screen (subjective decline / head injury / severe depression / psychosis + cognitive concerns):</strong> {{when_screen}}</li>\n  <li><strong>Basic Elements (orientation / attention / memory / executive):</strong> {{basic_elements}}</li>\n  <li><strong>Red Flags (refer neuro / geriatrics):</strong> {{red_flags}}</li>\n  <li><strong>Imaging / Labs Outline (neutral):</strong> {{imaging_labs}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'nm-cognitive-referral-summary', label:'Referral summary', template:'Draft a neuro/geriatrics referral summary with salient cognitive concerns. Triggers: {{when_screen}} Elements: {{basic_elements}} Red Flags: {{red_flags}}' },
      { id:'nm-cognitive-ruleout', label:'Rule-out checklist', template:'Generate a bedside rule-out checklist (thyroid, B12, OSA, meds, substance, delirium). Current Concerns: {{red_flags}}' }
    ],
    evidence: []
  },
  {
    id: 'nm-seizure-tbi-liaison',
    title: 'Seizure/TBI — Psychiatry ↔ Neurology Liaison Note',
    sectionId: 'neuro-med',
    summary: 'Event timing, triggers, AED adherence/levels, post-ictal features, injury details, psych symptom interplay, asks, safety advice.',
    html: `\n<h2>Seizure / TBI Liaison Note</h2>\n<ul style="font-size:12px">\n  <li><strong>Event Description & Timing:</strong> {{event_description}}</li>\n  <li><strong>Triggers:</strong> {{triggers}}</li>\n  <li><strong>AED Adherence / Levels:</strong> {{aed_adherence}}</li>\n  <li><strong>Post-ictal Features:</strong> {{post_ictal}}</li>\n  <li><strong>Injury Details:</strong> {{injury_details}}</li>\n  <li><strong>Psychiatric Symptom Interplay:</strong> {{psych_interplay}}</li>\n  <li><strong>Asks to Neurology (EEG / Imaging / Meds):</strong> {{asks_neuro}}</li>\n  <li><strong>Safety Advice:</strong> {{safety_advice}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'nm-seizure-liaison-note', label:'Liaison note', template:'Compose a concise neurology liaison note with clear questions and safety points. Event: {{event_description}} Triggers: {{triggers}} Adherence: {{aed_adherence}} Post-ictal: {{post_ictal}} Psych: {{psych_interplay}} Asks: {{asks_neuro}} Safety: {{safety_advice}}' },
      { id:'nm-seizure-patient-instructions', label:'Patient instructions', template:'Generate a neutral patient-facing instruction paragraph post-event (avoid hazards, medication adherence, when to seek emergency care). Event: {{event_description}} Safety: {{safety_advice}}' }
    ],
    evidence: []
  },
  {
    id: 'nm-sleep-circadian-workup',
    title: 'Sleep & Circadian Workup Outline',
    sectionId: 'neuro-med',
    summary: 'Sleep schedule, insomnia vs hypersomnia features, OSA risk, RLS/PLMD, med/substance review, CBT-I linkage, referral triggers.',
    html: `\n<h2>Sleep & Circadian Workup Outline</h2>\n<ul style="font-size:12px">\n  <li><strong>Sleep Schedule:</strong> {{sleep_schedule}}</li>\n  <li><strong>Insomnia vs Hypersomnia Features:</strong> {{insomnia_hypersomnia}}</li>\n  <li><strong>OSA Risk (snoring / apnea / STOP-BANG cues):</strong> {{osa_risk}}</li>\n  <li><strong>RLS / PLMD Symptoms:</strong> {{rls_plmd}}</li>\n  <li><strong>Medication / Substance Review:</strong> {{med_substance_review}}</li>\n  <li><strong>CBT-I Linkage:</strong> {{cbti_linkage}}</li>\n  <li><strong>When to Refer (Sleep Clinic):</strong> {{refer_triggers}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local pediatric/adult guidelines, school policies, and laws.</p>\n`,
    prompts: [
      { id:'nm-sleep-workup-plan', label:'Workup plan', template:'Compose a sleep workup plan with initial labs/steps and referral triggers. Schedule: {{sleep_schedule}} OSA Risk: {{osa_risk}} RLS/PLMD: {{rls_plmd}} Meds/Substances: {{med_substance_review}} Referral: {{refer_triggers}}' },
      { id:'nm-sleep-hygiene-bridge', label:'Hygiene + CBT-I bridge', template:'Explain how sleep hygiene connects to CBT-I in ≤120 words. Hygiene Items: {{cbti_linkage}}' }
    ],
    evidence: []
  },
];
