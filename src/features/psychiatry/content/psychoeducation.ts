

export type Reference = { citation: string };

export type EduItem = {
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

export const PSYCHOEDUCATION: EduItem[] = [

  {
    id: "depression-onepager",
    title: "Depression — Clinician One-Pager (Talking Points)",
    clinical_summary: [
      "Major depressive disorder (MDD) is a common, recurrent medical illness affecting mood, thinking, sleep/appetite, and function; onset often follows stressors but may occur without them.",
      "Explain the bio-psycho-social model: genetics, neurobiology (monoaminergic circuits, stress/BDNF), cognitive/behavioral patterns, and environmental factors.",
      "Treatment works: evidence-supported options include CBT/BA, SSRIs/SNRIs, combination therapy; 2–4 weeks for early change, 6–8 weeks for full trial; optimize dose/adherence before switching.",
      "Measurement-Based Care: track PHQ-9 at baseline and each follow-up; response ≈ ≥50% reduction; remission often ≤4–5.",
      "Relapse prevention: continue meds 6–12 months after remission (longer for recurrent episodes), maintain psychotherapy skills, sleep regularity, exercise, social activation.",
      "Risk & safety: screen suicidality each contact; provide safety plan and crisis contacts; consider bipolar screening before antidepressants."
    ],
    indications: [
      "Initial and follow-up visits for MDD or depressive symptoms; family education."
    ],
    contraindications: [
      "None to psychoeducation; if acute risk/mania or medical instability is suspected, prioritize emergency assessment."
    ],
    outcome_measures: [
      "PHQ-9 trend, functioning (WSAS), adherence, side-effect burden (FIBSER)."
    ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Depression — Clinician Talking Points (One-Pager)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1000px;margin:0 auto}
  .grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
  ul{margin:0 0 8px 18px}
  .pill{display:inline-block;border:1px solid #bbb;border-radius:999px;padding:2px 8px;font-size:12px;margin-right:6px}
  @media print{header{border:0}}
 </style></head><body>
<header>
  <h1>Depression — Clinician Talking Points</h1>
  <div><span class="pill">Explain illness</span><span class="pill">What helps</span><span class="pill">Safety & follow-up</span></div>
</header>
<main>
<section class="grid">
  <div>
    <h2>What is Depression?</h2>
    <ul>
      <li>Medical condition affecting mood, thinking, sleep, appetite, energy, and function.</li>
      <li>Caused by a mix of biology, psychology, and environment; it is not a weakness.</li>
    </ul>
  </div>
  <div>
    <h2>How Treatment Works</h2>
    <ul>
      <li><b>Therapies:</b> CBT/Behavioral Activation; problem-solving skills.</li>
      <li><b>Medications:</b> SSRIs/SNRIs; benefit builds over weeks; side effects often fade.</li>
      <li>Combine approaches when moderate–severe or when partial response.</li>
    </ul>
  </div>
</section>
<section>
  <h2>Monitoring & Timeline</h2>
  <ul>
    <li>Expect early change in 2–4 wks; reassess at 6–8 wks for full effect.</li>
    <li>Track scores: <b>PHQ-9</b> baseline → every visit; response ≥50% reduction; remission ≤4–5.</li>
  </ul>
</section>
<section class="grid">
  <div>
    <h2>Self-Care & Relapse Prevention</h2>
    <ul>
      <li>Regular sleep/activity; pace & plan pleasant/valued activities.</li>
      <li>Continue meds 6–12 months after remission (longer if recurrent).</li>
    </ul>
  </div>
  <div>
    <h2>Safety</h2>
    <ul>
      <li>Ask about suicidal thoughts each visit; make a safety plan and provide crisis numbers.</li>
      <li>Let us know urgently if mood drops fast, sleep goes days without rest, or if you feel unsafe.</li>
    </ul>
  </div>
</section>
<section>
  <h2>Notes for Today</h2>
  <textarea style="width:100%;height:100px" placeholder="Key messages given, plan, next check-in date"></textarea>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable clinician one-pager for depression with sections: What is depression, How treatment works (therapy + medication), Monitoring & timeline (PHQ-9), Relapse prevention, and Safety. Use plain but professional language and print-friendly CSS.",
      "Create a code in HTML for a patient-facing depression handout that includes a symptom list, treatment options (CBT/BA and SSRI/SNRI), expected time course, when to call urgently, and a notes area for personalized advice."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2022). Depression in adults: treatment and management (NG222)." },
      { citation: "Kroenke, K., Spitzer, R. L., & Williams, J. B. W. (2001). The PHQ-9: Validity of a brief depression severity measure. Journal of General Internal Medicine, 16(9), 606–613." },
      { citation: "Fortney, J. C., Unützer, J., Wrenn, G., et al. (2017). A tipping point for measurement-based care. Psychiatric Services, 68(2), 179–188." }
    ]
  },


  {
    id: "anxiety-vs-panic",
    title: "Anxiety vs Panic — Quick Explainer",
    clinical_summary: [
      "Generalized anxiety (GAD) = persistent, excessive worry with tension and sleep disturbance; Panic disorder = recurrent, unexpected panic attacks + worry/avoidance.",
      "Panic attack physiology: rapid surge of autonomic arousal; benign but uncomfortable; fear of fear maintains the cycle.",
      "Effective treatments: CBT with exposure/interoceptive exercises; SSRIs/SNRIs; short-term benzodiazepines only with caution and clear plan.",
      "Skill targets: reattribution of bodily sensations, diaphragmatic/slow breathing (as pacing tool, not safety behavior), graded exposure, and avoidance reduction.",
      "Measurement: GAD-7 and PDSS-SR (panic); track frequency, severity, and avoidance."
    ],
    indications: [ "Education at diagnosis; preparing for CBT/exposure; explaining medication rationale." ],
    contraindications: [ "If medical red flags for chest pain/syncope exist, rule out acute medical causes first." ],
    outcome_measures: [ "GAD-7, PDSS-SR or panic frequency logs, avoidance inventory." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Anxiety vs Panic — Quick Explainer</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Anxiety vs Panic — Quick Explainer</h1><div class="muted">Use with GAD-7 / PDSS-SR tracking</div></header>
<main>
<section>
  <h2>What’s the Difference?</h2>
  <table>
    <thead><tr><th>Feature</th><th>Generalized Anxiety (GAD)</th><th>Panic Disorder</th></tr></thead>
    <tbody>
      <tr><td>Core</td><td>Persistent worry, tension</td><td>Sudden intense fear (panic attacks)</td></tr>
      <tr><td>Duration</td><td>Most days for ≥6 months</td><td>Minutes; recurrent & unexpected</td></tr>
      <tr><td>Common Body Sensations</td><td>Restlessness, fatigue</td><td>Palpitations, shortness of breath, dizziness</td></tr>
      <tr><td>Maintaining Factors</td><td>Worry cycles, avoidance</td><td>Fear of sensations, avoidance of triggers</td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>What Helps</h2>
  <ul>
    <li>CBT with exposure (situational & interoceptive) to retrain fear learning.</li>
    <li>Medications: SSRIs/SNRIs. If used, allow several weeks; avoid PRN benzodiazepine during exposure practice.</li>
  </ul>
</section>
<section>
  <h2>Practice Log (Interoceptive Exposure)</h2>
  <table>
    <thead><tr><th>Date</th><th>Exercise</th><th>Peak Fear (0–10)</th><th>Time to Settle</th><th>Notes</th></tr></thead>
    <tbody><tr><td><input type="date"></td><td><input placeholder="e.g., straw breathing 60s"></td><td><input></td><td><input></td><td><input style="width:100%"></td></tr></tbody>
  </table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable ‘Anxiety vs Panic’ explainer including a comparison table (features, duration, sensations, maintaining factors), a ‘what helps’ section (CBT with exposure; SSRIs/SNRIs), and an interoceptive exposure practice log table. Include print CSS.",
      "Create a code in HTML for a panic cycle diagram (trigger → sensations → catastrophic thoughts → avoidance) with editable text boxes and a space to write alternative responses."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2011, updated 2019). Generalised anxiety disorder and panic disorder in adults: management (CG113)." },
      { citation: "Barlow, D. H. (2014). Anxiety and its disorders (2nd ed.). Guilford Press." },
      { citation: "Craske, M. G., et al. (2014). Maximizing exposure therapy: An inhibitory learning approach. Behaviour Research and Therapy, 58, 10–23." }
    ]
  },


  {
    id: "bipolar-monitoring-matters",
    title: "Bipolar Spectrum — Why Monitoring Matters",
    clinical_summary: [
      "Bipolar spectrum includes bipolar I/II and related conditions; mood episodes are episodic with inter-episode vulnerability.",
      "Monitoring enables early intervention and prevents relapse: regular sleep/wake schedule, mood charting, medication adherence, and trigger management.",
      "Warning signs: decreased need for sleep, increased goal-directed activity, irritability/grandiosity; or depressive re-emergence (anhedonia, suicidal ideation).",
      "Work with family/supports for relapse signatures; discuss medication safety (lithium/valproate/atypicals) and lab monitoring where applicable."
    ],
    indications: [ "All patients with bipolar spectrum disorders; family psychoeducation." ],
    contraindications: [ "None to psychoeducation; prioritize safety if mania/psychosis or suicidality escalates." ],
    outcome_measures: [ "Mood chart adherence, relapse rate/time to relapse, hospitalization/ER visits, functioning." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Bipolar Spectrum — Why Monitoring Matters</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>Bipolar Spectrum — Why Monitoring Matters</h1><div class="muted">Sleep regularity • Mood chart • Early warning signs</div></header>
<main>
<section>
  <h2>Weekly Mood & Sleep Chart</h2>
  <table>
    <thead><tr><th>Date</th><th>Mood (−5…+5)</th><th>Hours Slept</th><th>Triggers/Events</th><th>Med Adherence</th></tr></thead>
    <tbody>
      <tr><td><input type="date"></td><td><input placeholder="−5 dep to +5 hyp/mania"></td><td><input></td><td><input></td><td><input placeholder="missed?"></td></tr>
    </tbody>
  </table>
</section>
<section>
  <h2>Early Warning Signs</h2>
  <ul>
    <li>↓ need for sleep, ↑ energy/talking, impulsive spending/risks</li>
    <li>New depression signs: hopelessness, anhedonia, social withdrawal</li>
  </ul>
</section>
<section>
  <h2>Action Plan</h2>
  <table><thead><tr><th>Sign</th><th>Action</th><th>Who/When</th></tr></thead>
  <tbody>
    <tr><td><input placeholder="awake until 3am"></td><td><input placeholder="stabilize sleep, call clinic"></td><td><input></td></tr>
  </tbody></table>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable bipolar monitoring handout with a weekly mood/sleep chart (mood −5…+5), an early-warning signs list, and an action plan table with responsible person and timing. Include print CSS.",
      "Create a code in HTML for a family/significant-other relapse signature worksheet capturing personalized mania and depression cues with contact/escalation steps."
    ],
    references: [
      { citation: "National Institute for Health and Care Excellence. (2014, updated). Bipolar disorder: assessment and management (CG185)." },
      { citation: "Yatham, L. N., et al. (2018, updates). CANMAT guidelines for the management of patients with bipolar disorder. Bipolar Disorders, 20(2), 97–170." },
      { citation: "Goodwin, F. K., & Jamison, K. R. (2007). Manic-Depressive Illness (2nd ed.). Oxford University Press." }
    ]
  },


  {
    id: "ptsd-ocd-exposure-rationale",
    title: "PTSD & OCD — Exposure Rationale (Non-proprietary)",
    clinical_summary: [
      "Exposure therapies (PE for PTSD; ERP for OCD) rely on learning processes: fear activation, expectation violation, and new inhibitory learning—not just habituation.",
      "Rationale to convey: avoidance and rituals reduce short-term distress but maintain the problem; approaching memories/feared cues without rituals allows corrective learning.",
      "Safety & structure: collaboratively develop hierarchies; monitor SUDS; include between-session practice; avoid compulsions/safety behaviors during exposure.",
      "Medications (e.g., SSRIs) may be combined with therapy; ensure consistent homework and relapse prevention planning."
    ],
    indications: [ "PTSD and OCD where evidence-based psychotherapy is planned or underway." ],
    contraindications: [ "Acute instability (e.g., imminent risk, untreated mania/psychosis) — stabilize before intensive exposure." ],
    outcome_measures: [ "PTSD Checklist (PCL-5), Yale-Brown Obsessive Compulsive Scale (Y-BOCS), SUDS trajectories." ],
    example_html: `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>PTSD & OCD — Exposure Rationale (Non-proprietary)</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0}
  header{padding:16px 20px;border-bottom:1px solid #ddd}
  main{padding:20px;max-width:1000px;margin:0 auto}
  table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}
  .muted{color:#666;font-size:.9rem}
  @media print{header{border:0}}
</style></head><body>
<header><h1>PTSD & OCD — Exposure Rationale</h1><div class="muted">Inhibitory learning • Expectancy violation • No rituals</div></header>
<main>
<section>
  <h2>Why Exposure Works</h2>
  <ul>
    <li>Facing memories/cues teaches the brain that feared outcomes do not occur (or can be tolerated).</li>
    <li>Staying in the situation <em>without rituals/avoidance</em> allows new learning to compete with old fear pathways.</li>
  </ul>
</section>
<section>
  <h2>Build a Hierarchy</h2>
  <table><thead><tr><th>Item</th><th>Trigger/Cue</th><th>SUDS (0–100)</th><th>First Step</th></tr></thead>
  <tbody><tr><td><input></td><td><input></td><td><input type="number" min="0" max="100"></td><td><input></td></tr></tbody></table>
</section>
<section>
  <h2>Session Practice Log</h2>
  <table><thead><tr><th>Date</th><th>Exercise</th><th>Peak SUDS</th><th>End SUDS</th><th>Learning/Notes</th></tr></thead>
  <tbody><tr><td><input type="date"></td><td><input placeholder="e.g., imaginal exposure 30 min"></td><td><input></td><td><input></td><td><input style="width:100%"></td></tr></tbody></table>
</section>
<section>
  <h2>Between-Session Plan</h2>
  <ul>
    <li>Daily practice of assigned exposures; prevent rituals/compulsions.</li>
    <li>Track new learning and triggers; bring log next session.</li>
  </ul>
</section>
</main></body></html>`,
    prompts: [
      "Create a code in HTML as a printable exposure rationale page (non-proprietary) that explains why exposure works (inhibitory learning), includes a hierarchy table (item, trigger, SUDS, first step), a session practice log (peak/end SUDS, learning), and a between-session plan. Include print CSS.",
      "Create a code in HTML for an ERP homework sheet with columns for trigger, obsessive thought, ritual to block, exposure task, SUDS ratings, and learning statements."
    ],
    references: [
      { citation: "U.S. Department of Veterans Affairs & Department of Defense. (2023). VA/DoD Clinical Practice Guideline for the Management of Posttraumatic Stress Disorder." },
      { citation: "National Institute for Health and Care Excellence. (2018). Post-traumatic stress disorder (NG116)." },
      { citation: "National Institute for Health and Care Excellence. (2005). Obsessive-compulsive disorder and body dysmorphic disorder: treatment (CG31)." },
      { citation: "Craske, M. G., Treanor, M., Conway, C., Zbozinek, T., & Vervliet, B. (2014). Maximizing exposure therapy: An inhibitory learning approach. Behaviour Research and Therapy, 58, 10–23." }
    ]
  }
];
