import type { Card } from '../lib/types';

export const rapidTriageCards: Card[] = [
  {
    id: 'rt-agitation-catatonia-path',
    title: 'Agitation & Catatonia Quick Path (BETA + RASS + BFCRS)',
    sectionId: 'rapid_triage',
    tags: ['triage','agitation','catatonia','risk'],
    summary: 'Rapid de-escalation scaffold, RASS severity anchor, BFCRS positive item capture, and intervention/disposition planning.',
    descriptionHtml: '<p>Integrates Project BETA verbal de-escalation principles with RASS scoring and BFCRS screening cues for early catatonia recognition.</p>',
    html: `\n<h2>Agitation & Catatonia — Quick Path</h2>\n<p><strong>Scenario:</strong> {{scenario}}</p>\n\n<h3>Severity & First Steps</h3>\n<ul>\n  <li><strong>RASS:</strong> {{rass}}</li>\n  <li><strong>Immediate safety:</strong> {{safety}}</li>\n  <li><strong>Medical contributors considered:</strong> {{#each medical_causes}}<span>{{item}}</span>{{/each}}</li>\n</ul>\n\n<h3>Verbal De-escalation (BETA)</h3>\n<ol>\n  <li>Respect personal space; single lead; calm tone</li>\n  <li>Active listening; identify needs</li>\n  <li>Offer choices; collaborative limits</li>\n  <li>Avoid power struggles; clear, brief statements</li>\n  <li>Consider medication only if necessary & proportionate</li>\n</ol>\n\n<h3>Catatonia (BFCRS Screening — positives)</h3>\n<ul style="columns:2">\n  {{#each bfcrs_pos}}<li>{{item}}</li>{{/each}}\n</ul>\n\n<h3>Interventions & Disposition</h3>\n<p><strong>Interventions:</strong> {{interventions}}</p>\n<p><strong>Monitoring:</strong> {{monitoring}}</p>\n<p><strong>Disposition:</strong> {{disposition}}</p>\n`,
    prompts: [{
      id: 'rt-agitation-catatonia-path-base',
      label: 'Agitation + Catatonia — base',
      template: '',
      variables: [
        { key:'scenario', label:'Scenario', type:'multiline' },
        { key:'rass', label:'RASS score', type:'select', options:['+4 Combative','+3 Very agitated','+2 Agitated','+1 Restless','0 Alert & calm','-1 Drowsy','-2 Light sedation','-3 Moderate','-4 Deep','-5 Unarousable'] },
        { key:'safety', label:'Immediate safety actions', type:'multiline' },
        { key:'medical_causes', label:'Medical contributors', type:'tags' },
        { key:'bfcrs_pos', label:'BFCRS positive items', type:'tags' },
        { key:'interventions', label:'Interventions', type:'multiline' },
        { key:'monitoring', label:'Monitoring', type:'multiline', placeholder:'Vitals, repeat RASS, verbal de-escalation attempts, lorazepam challenge…' },
        { key:'disposition', label:'Disposition', type:'select', options:['Continue observation','Medical admission','Psychiatric admission','Crisis stabilization'] }
      ],
      generators: [
        { id:'compact', label:'Create compact version' },
        { id:'extended', label:'Make extended version' },
        { id:'summary', label:'Compose clinical summary' },
        { id:'bilingual', label:'Create bilingual (EN/TR)' },
        { id:'printfriendly', label:'Make print-friendly' }
      ]
    }],
    evidence: [
      { title:'Verbal De-escalation of the Agitated Patient (Project BETA)', authors:'Richmond JS, et al.', year:'2012', journal:'West J Emerg Med' },
      { title:'Best practices in Evaluation and Treatment of Agitation (BETA)', authors:'Holloman GH Jr, Zeller SL', year:'2012', journal:'West J Emerg Med' },
      { title:'Richmond Agitation–Sedation Scale (RASS) validation', authors:'Sessler CN, et al.', year:'2002', journal:'Am J Respir Crit Care Med' },
      { title:'Bush–Francis Catatonia Rating Scale (BFCRS)', authors:'Bush G, Fink M, Petrides G, Dowling F, Francis A', year:'1996', journal:'Acta Psychiatr Scand' }
    ]
  }
  ,

  {
    id: 'rt-deescalation-ladder',
    title: 'Rapid De-escalation Ladder (Verbal → PRN)',
    sectionId: 'rapid_triage',
  tags: ['triage','agitation','deescalation','risk'],
    summary: 'Step-wise approach from environment optimization through verbal techniques to PRN medication per local protocol.',
    html: `\n<h2>Rapid De-escalation Ladder</h2>\n<ol>\n  <li><strong>Step 1 – Environment & Safety:</strong> room safety check, staff alert, exits clear, remove hazards.</li>\n  <li><strong>Step 2 – Verbal De-escalation:</strong> calm tone, validate distress, offer choices, allow time-out option.</li>\n  <li><strong>Step 3 – Supportive Measures:</strong> hydration, snack, reduce sensory load (quiet room), brief reassurance.</li>\n  <li><strong>Step 4 – Medication PRN:</strong> <em>See local protocol</em>. Agent/Class: {{prn_agent}}; Dose range: {{prn_dose_range}}; Route: {{prn_route}}; Onset notes: {{prn_onset}}.</li>\n</ol>\n<p><strong>Documentation:</strong> triggers, non-pharm steps, patient response, vitals, adverse effects, plan.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'rt-deesc-note', label:'Compose brief de-escalation note', template:'Compose a concise de-escalation progress note (≤120 words) summarizing steps attempted (environment, verbal, supportive, PRN if used), patient response, and next steps. PRN Agent: {{prn_agent}} Dose Range: {{prn_dose_range}} Route: {{prn_route}} Observed Response: {{response}}.' , variables:[{ key:'prn_agent', label:'PRN Agent/Class', type:'text' },{ key:'prn_dose_range', label:'Dose Range', type:'text' },{ key:'prn_route', label:'Route', type:'text' },{ key:'response', label:'Patient Response', type:'multiline' }]},
      { id:'rt-prn-rationale', label:'Generate PRN rationale', template:'Generate a neutral rationale for PRN use including risk-benefit, monitoring, and alternative strategies attempted. Agent: {{prn_agent}} Dose Range: {{prn_dose_range}} Route: {{prn_route}} Onset: {{prn_onset}}.', variables:[{ key:'prn_agent', label:'PRN Agent/Class', type:'text' },{ key:'prn_dose_range', label:'Dose Range', type:'text' },{ key:'prn_route', label:'Route', type:'text' },{ key:'prn_onset', label:'Onset Notes', type:'text' }] }
    ],
    evidence: []
  },
  {
    id: 'rt-catatonia-bfcrs-lorazepam',
    title: 'Catatonia — BFCRS Clues & Lorazepam Challenge (Outline)',
    sectionId: 'rapid_triage',
    tags: ['triage','catatonia','risk'],
    summary: 'Recognize core catatonia signs and outline a lorazepam challenge observation sequence.',
    html: `\n<h2>Catatonia — BFCRS Clues & Lorazepam Challenge</h2>\n<p><strong>Clues (examples, non-exhaustive):</strong> mutism, stupor, posturing, waxy flexibility, negativism, echolalia, echopraxia.</p>\n<p><em>Screening note:</em> Use locally approved tools; BFCRS commonly referenced – confirm licensing if required.</p>\n<h3>Lorazepam Test Dose</h3>\n<ul>\n  <li>Dose: {{lorazepam_dose}}</li>\n  <li>Route: {{lorazepam_route}}</li>\n  <li>Time given: {{lorazepam_time}}</li>\n</ul>\n<h3>Observation</h3>\n<ul>\n  <li>5 min: {{response_5}}</li>\n  <li>10 min: {{response_10}}</li>\n  <li>30 min: {{response_30}}</li>\n</ul>\n<p><strong>Monitor:</strong> vitals, respiratory status, sedation.</p>\n<p><strong>Escalation:</strong> Poor response or medical concern → medical evaluation.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'rt-catatonia-note', label:'Compose catatonia progress note', template:'Summarize findings supporting catatonia and response to test dose; include safety monitoring and next steps. Signs: {{signs}} Dose: {{lorazepam_dose}} Route: {{lorazepam_route}} Responses: 5m {{response_5}} 10m {{response_10}} 30m {{response_30}}.', variables:[{ key:'signs', label:'Observed Signs', type:'multiline' },{ key:'lorazepam_dose', label:'Dose', type:'text' },{ key:'lorazepam_route', label:'Route', type:'text' },{ key:'response_5', label:'Response 5m', type:'text' },{ key:'response_10', label:'Response 10m', type:'text' },{ key:'response_30', label:'Response 30m', type:'text' }] },
      { id:'rt-catatonia-abnormal-motor', label:'Abnormal-motor-only bullets', template:'List abnormal motor signs only with clinical implication (one per line). Signs: {{signs}}', variables:[{ key:'signs', label:'Observed Signs', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'rt-delirium-quick-screen',
    title: 'Delirium Quick Screen & Reversible Causes (Outline)',
    sectionId: 'rapid_triage',
  tags: ['triage','delirium','risk','medical'],
    summary: 'Core features, common reversible categories, and immediate actions in suspected delirium.',
    html: `\n<h2>Delirium Quick Screen & Reversible Causes</h2>\n<p><strong>Core Features:</strong> acute onset/fluctuation, inattention, disorganized thinking, altered consciousness.</p>\n<p><strong>Reversible Categories:</strong> infection, withdrawal/intoxication, metabolic, hypoxia, endocrine, neurologic, iatrogenic (anticholinergic load), pain/urinary retention/constipation.</p>\n<p><strong>Immediate Actions:</strong> vitals, basic labs, medication review, optimize environment (orientation cues, lighting, sleep hygiene), coordinate with medical team.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'rt-delirium-triage-summary', label:'Triage summary', template:'Write a 6–8 bullet triage summary for suspected delirium with immediate checks and liaison notes. Presenting Features: {{features}} Reversible Suspicions: {{reversible}} Initial Actions: {{actions}}', variables:[{ key:'features', label:'Presenting Features', type:'multiline' },{ key:'reversible', label:'Reversible Suspicion', type:'multiline' },{ key:'actions', label:'Initial Actions', type:'multiline' }] },
      { id:'rt-delirium-family-explanation', label:'Family explanation', template:'Draft a 100–120 word family-facing explanation of delirium (neutral tone). Patient context: {{context}}', variables:[{ key:'context', label:'Context', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'rt-red-flags-escalation',
    title: 'Red Flags & Escalation (ED/ICU Triggers — Outline)',
    sectionId: 'rapid_triage',
  tags: ['triage','redflags','escalation','risk'],
    summary: 'Outline of critical red flags requiring emergency escalation.',
    html: `\n<h2>Red Flags & Escalation (ED/ICU Triggers)</h2>\n<p><strong>Examples (non-exhaustive):</strong> NMS-like signs, severe rigidity/hyperthermia, serotonergic toxicity features, suspected lithium toxicity, severe intoxication/withdrawal, unstable vitals, new focal neuro deficits, prolonged QT/syncope, rapidly worsening consciousness.</p>\n<p><strong>Action:</strong> Escalate per local emergency pathways; ensure handoff clarity (time course, interventions tried, vitals, pending labs).</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'rt-escalation-note', label:'Compose escalation note', template:'Compose a neutral escalation note to ED/ICU including observed red flags, time course, and handoff checklist. Red Flags: {{red_flags}} Time Course: {{time_course}} Interventions: {{interventions}} Vitals: {{vitals}}', variables:[{ key:'red_flags', label:'Red Flags', type:'multiline' },{ key:'time_course', label:'Time Course', type:'multiline' },{ key:'interventions', label:'Interventions Attempted', type:'multiline' },{ key:'vitals', label:'Key Vitals', type:'multiline' }] },
      { id:'rt-safety-checklist', label:'Safety checklist', template:'Generate a bedside safety checklist for the next 30–60 minutes given red flags: {{red_flags}} Current Plan: {{plan}}', variables:[{ key:'red_flags', label:'Red Flags', type:'multiline' },{ key:'plan', label:'Current Plan', type:'multiline' }] }
    ],
    evidence: []
  },

  {
    id: 'safety-plan-stanley-brown-cssrs-gated',
    title: 'Suicide Safety Plan (Stanley–Brown, C-SSRS-Gated)',
    sectionId: 'risk_safety',
  tags: ['risk','suicide','safetyplan'],
    summary: 'Structured safety plan with gating questions, coping strategies, supports, means safety, and reasons for living.',
    html: `\n<h2>Suicide Safety Plan (Stanley–Brown, C-SSRS-Gated)</h2>\n<h3>Gate (Outline)</h3>\n<ul>\n  <li>Recent Ideation: {{gating_ideation}}</li>\n  <li>Intent: {{gating_intent}}</li>\n  <li>Plan: {{gating_plan}}</li>\n  <li>Past Attempt: {{gating_attempt}}</li>\n  <li>Protective Factors: {{protective_factors}}</li>\n</ul>\n<h3>Plan Sections</h3>\n<ul>\n  <li><strong>Warning Signs:</strong> {{warning_signs}}</li>\n  <li><strong>Internal Coping:</strong> {{internal_coping}}</li>\n  <li><strong>Social Settings (Distraction):</strong> {{social_distractions}}</li>\n  <li><strong>People Who Can Help:</strong> {{people_help}}</li>\n  <li><strong>Professionals / Agencies:</strong> {{professionals}}</li>\n  <li><strong>Means Safety:</strong> {{means_safety}}</li>\n  <li><strong>Reasons for Living:</strong> {{reasons_living}}</li>\n</ul>\n<p style="font-size:11px">C-SSRS trademarks/rights with respective owners; use local licensed tools as required.</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'safety-plan-draft', label:'Draft safety plan text', template:'Compose a patient-facing safety plan from the fields (clear, non-stigmatizing, include crisis contacts). Warning Signs: {{warning_signs}} Internal Coping: {{internal_coping}} Social: {{social_distractions}} People: {{people_help}} Professionals: {{professionals}} Means: {{means_safety}} Reasons: {{reasons_living}} Protective: {{protective_factors}}', variables:[{ key:'warning_signs', label:'Warning Signs', type:'multiline' },{ key:'internal_coping', label:'Internal Coping', type:'multiline' },{ key:'social_distractions', label:'Social Settings', type:'multiline' },{ key:'people_help', label:'People Who Can Help', type:'multiline' },{ key:'professionals', label:'Professionals/Agencies', type:'multiline' },{ key:'means_safety', label:'Means Safety', type:'multiline' },{ key:'reasons_living', label:'Reasons for Living', type:'multiline' },{ key:'protective_factors', label:'Protective Factors', type:'multiline' }] },
      { id:'safety-plan-clinician-summary', label:'Clinician summary', template:'Summarize risk state, gating answers (ideation {{gating_ideation}}, intent {{gating_intent}}, plan {{gating_plan}}, past attempt {{gating_attempt}}), protective factors {{protective_factors}}, and rationale for outpatient vs higher care (≤120 words).', variables:[{ key:'gating_ideation', label:'Ideation', type:'text' },{ key:'gating_intent', label:'Intent', type:'text' },{ key:'gating_plan', label:'Plan', type:'text' },{ key:'gating_attempt', label:'Past Attempt', type:'text' },{ key:'protective_factors', label:'Protective Factors', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'violence-risk-brief',
    title: 'Violence Risk — Brief, Non-Proprietary Factors',
    sectionId: 'risk_safety',
    tags: ['risk','violence'],
    summary: 'Historical, clinical, contextual, and protective violence risk factor structure.',
    html: `\n<h2>Violence Risk — Brief Factors</h2>\n<ul>\n  <li><strong>Historical:</strong> past violence, early onset, weapons history ({{historical}})</li>\n  <li><strong>Clinical:</strong> substance use, psychosis threat/control override, impulsivity, untreated mania, TBI ({{clinical}})</li>\n  <li><strong>Context:</strong> access to victims, stressors, non-adherence, poor supports ({{context_factors}})</li>\n  <li><strong>Protective:</strong> engagement, housing, supports, insight ({{protective}})</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'violence-risk-formulation', label:'Risk formulation', template:'Create a structured violence risk formulation with 2–3 risk scenarios and prevention steps. Historical: {{historical}} Clinical: {{clinical}} Context: {{context_factors}} Protective: {{protective}}', variables:[{ key:'historical', label:'Historical', type:'multiline' },{ key:'clinical', label:'Clinical', type:'multiline' },{ key:'context_factors', label:'Context', type:'multiline' },{ key:'protective', label:'Protective', type:'multiline' }] },
      { id:'violence-risk-care-level', label:'Care level suggestion', template:'Given factors (Historical {{historical}} Clinical {{clinical}} Context {{context_factors}} Protective {{protective}}) propose an observation/care level with justification.', variables:[{ key:'historical', label:'Historical', type:'multiline' },{ key:'clinical', label:'Clinical', type:'multiline' },{ key:'context_factors', label:'Context', type:'multiline' },{ key:'protective', label:'Protective', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'capacity-brief-4-abilities',
    title: 'Capacity to Consent — 4 Abilities Brief',
    sectionId: 'risk_safety',
    tags: ['risk','capacity','consent'],
    summary: 'Framework for documenting the four abilities and reversible barriers.',
    html: `\n<h2>Capacity to Consent — 4 Abilities</h2>\n<ul>\n  <li><strong>Understand:</strong> {{understand}}</li>\n  <li><strong>Appreciate:</strong> {{appreciate}}</li>\n  <li><strong>Reason:</strong> {{reason}}</li>\n  <li><strong>Express a Choice:</strong> {{choice}}</li>\n</ul>\n<p><strong>Reversible Barriers:</strong> {{barriers}}</p>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'capacity-note', label:'Capacity note', template:'Compose a concise capacity assessment note referencing four abilities and reversible barriers. Understand {{understand}} Appreciate {{appreciate}} Reason {{reason}} Choice {{choice}} Barriers {{barriers}}', variables:[{ key:'understand', label:'Understand', type:'multiline' },{ key:'appreciate', label:'Appreciate', type:'multiline' },{ key:'reason', label:'Reason', type:'multiline' },{ key:'choice', label:'Choice', type:'multiline' },{ key:'barriers', label:'Barriers', type:'multiline' }] },
      { id:'capacity-barrier-mitigation', label:'Barrier mitigation list', template:'List immediate steps to mitigate barriers before re-assessing capacity. Current Barriers: {{barriers}}', variables:[{ key:'barriers', label:'Barriers', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'means-safety-counseling-script',
    title: 'Means Safety Counseling — Script & Checklist',
    sectionId: 'risk_safety',
    tags: ['risk','means','safety'],
    summary: 'Script skeleton for collaborative lethal means counseling and follow-up planning.',
    html: `\n<h2>Means Safety Counseling — Script & Checklist</h2>\n<p><strong>Script Skeleton:</strong> collaborative framing → assess access → storage/removal options → third-party involvement → documentation reminders.</p>\n<ul>\n  <li><strong>Means Discussed:</strong> {{means_list}}</li>\n  <li><strong>Storage/Removal Plan:</strong> {{storage_plan}}</li>\n  <li><strong>Third-party Involvement:</strong> {{third_party}}</li>\n  <li><strong>Documentation Notes:</strong> {{documentation_notes}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'means-script-generate', label:'Generate script', template:'Generate a brief collaborative script tailored to the patient context and chosen means safety options. Means: {{means_list}} Storage Plan: {{storage_plan}} Third-Party: {{third_party}}', variables:[{ key:'means_list', label:'Means', type:'multiline' },{ key:'storage_plan', label:'Storage Plan', type:'multiline' },{ key:'third_party', label:'Third-party', type:'multiline' }] },
      { id:'means-follow-up-plan', label:'Follow-up plan', template:'Draft follow-up checkpoints (who / when / how to verify implementation). Means: {{means_list}} Storage Plan: {{storage_plan}}', variables:[{ key:'means_list', label:'Means', type:'multiline' },{ key:'storage_plan', label:'Storage Plan', type:'multiline' }] }
    ],
    evidence: []
  },
  {
    id: 'forensic-risk-opinion-outline',
    title: 'Forensic Risk Opinion — Non-Jurisdictional Outline',
    sectionId: 'risk_safety',
    tags: ['risk','forensic'],
    summary: 'Structured outline for a neutral forensic-style clinical risk opinion without legal conclusions.',
    html: `\n<h2>Forensic Risk Opinion — Outline</h2>\n<ul>\n  <li><strong>Referral Question:</strong> {{referral_question}}</li>\n  <li><strong>Sources Reviewed:</strong> {{sources}}</li>\n  <li><strong>Psychiatric History & Current Presentation:</strong> {{history_presentation}}</li>\n  <li><strong>Risk Factors:</strong> {{risk_factors}}</li>\n  <li><strong>Protective Factors:</strong> {{protective_factors}}</li>\n  <li><strong>Opinion (Clinical Risk Only):</strong> {{opinion}}</li>\n  <li><strong>Limitations:</strong> {{limitations}}</li>\n  <li><strong>Recommendations (Tx/Monitoring/Environment):</strong> {{recommendations}}</li>\n</ul>\n<p class="muted" style="font-size:11px">For clinical education; confirm with local policies/protocols.</p>\n`,
    prompts: [
      { id:'forensic-outline-prose', label:'Outline to prose', template:'Convert the outline into a formal, neutral forensic-style clinical risk opinion (no legal conclusions). Referral: {{referral_question}} Sources: {{sources}} History: {{history_presentation}} Risk: {{risk_factors}} Protective: {{protective_factors}} Opinion: {{opinion}} Limitations: {{limitations}} Recommendations: {{recommendations}}', variables:[{ key:'referral_question', label:'Referral Question', type:'multiline' },{ key:'sources', label:'Sources Reviewed', type:'multiline' },{ key:'history_presentation', label:'History & Presentation', type:'multiline' },{ key:'risk_factors', label:'Risk Factors', type:'multiline' },{ key:'protective_factors', label:'Protective Factors', type:'multiline' },{ key:'opinion', label:'Opinion (Clinical Risk Only)', type:'multiline' },{ key:'limitations', label:'Limitations', type:'multiline' },{ key:'recommendations', label:'Recommendations', type:'multiline' }] },
      { id:'forensic-limitations-paragraph', label:'Limitations paragraph', template:'Draft a limitations paragraph (sources, time constraints, collateral gaps). Sources: {{sources}} Limitations: {{limitations}}', variables:[{ key:'sources', label:'Sources Reviewed', type:'multiline' },{ key:'limitations', label:'Limitations', type:'multiline' }] }
    ],
    evidence: []
  }
];
