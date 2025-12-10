

import type { MicroGuide } from "./guideTypes";

export const MICRO_GUIDES: MicroGuide[] = [

  {
    id: "catatonia",
    title: "Catatonia — recognition & documentation",
    category: "Catatonia",
    updated: "2025-01-15",
    abstract:
`Syndrome of psychomotor disturbance with hypo-, hyper-, or mixed features. Clinically important because it can be life-threatening but frequently responds to supportive care and appropriate consultation. This guide aids **documentation**, emphasizing objective description of motor phenomena, differential considerations, and safety monitoring. It intentionally avoids prescriptive directives.`,
    criteria:
`**Diagnostic scaffolding for the note**
• Employ DSM-5-TR descriptors or BFCRS items to structure documentation.
• Common features: stupor or extreme psychomotor change; mutism; negativism; posturing/catalepsy/waxy flexibility; echolalia/echopraxia; mannerisms/stereotypies; purposeless agitation; grimacing; ambitendency.
• Record: onset and course; precipitating factors (medical, psychiatric, medication changes); orientation/attention (for delirium screen); and objective exam findings rather than interpretive labels.`,
    differential:
`Delirium (fluctuating consciousness, inattention); neuroleptic malignant syndrome (lead-pipe rigidity, elevated CK, dopamine blockade exposure); serotonin toxicity (clonus, hyperreflexia, serotonergic exposure); severe mood/psychotic episode with motor phenomena; akinetic mutism; stiff-person spectrum; autoimmune encephalitis; non-convulsive status; parkinsonism; severe negative symptom schizophrenia.`,
    riskStrat:
`Immediate concerns: airway compromise from immobility/posture; dehydration and rhabdomyolysis; pressure injury; aspiration; venous thrombosis; autonomic instability; fever/rigidity (consider malignant catatonia vs NMS/serotonin toxicity). Document protective factors (close observation, family support), uncertainties, and need for short-interval reassessment.`,
    redFlags:
`Hypoxia or airway compromise; fever with marked rigidity; rising CK with dark urine; rapidly fluctuating level of consciousness; new focal neurological deficits; severe autonomic instability; severe malnutrition/dehydration.`,
    monitoring:
`**Documentation block (Vitals slot)**
• Observation level; calm, low-stimulus environment noted.
• Vitals q4–8h (site policy); intake/output; daily weight when feasible.
• Trend **BFCRS** items over time to capture response trajectory.
• Skin integrity and mobility/positioning documented.
• Labs if clinically indicated: CK, CMP (hydration, renal function).
• If the primary team uses benzodiazepines under local protocol, record **timing**, **observations**, and any change in BFCRS items; include sedation/respiratory observation language.`,
    communication:
`Capacity and consent discussion recorded when feasible; align expectations with patient/family. Document shared understanding that this note supports **documentation** and coordination rather than prescriptive management.`,
    coordination:
`Medical team for rhabdomyolysis risk and hydration; nursing for positioning and falls; PT/OT; consider ECT service consultation per course and local availability.`,
    followUp:
`Short-interval reassessment with BFCRS trend; revisit differential as new information (labs, imaging, collateral) emerges; document disposition considerations.`,
    docPhrases:
`"Presentation with psychomotor phenomena consistent with a **catatonia-spectrum syndrome**. Documented BFCRS features: […]. Differential includes delirium, neuroleptic malignant syndrome, serotonin toxicity, severe mood/psychotic episode, and medical/neurologic mimics. Supportive care emphasis and safety monitoring captured; teams informed. This text supports **documentation** only (non-directive)."`,
    references:
`DSM-5-TR catatonia criteria; BFCRS user materials; narrative reviews on recognition, outcomes, and supportive care pathways.`,
    tags: ["BFCRS","Delirium ddx","ECT consult"],
    meta: {
      criteria:   { evidence: "B" },
      monitoring: { evidence: "B" },
      docPhrases: { evidence: "D" },
    },
    version: "1.1",
    reviewedBy: ["Consultation-Liaison Psychiatrist, MD"]
  },


  {
    id: "lithium-tdm",
    title: "Lithium — therapeutic drug monitoring (TDM) documentation",
    category: "Lithium TDM",
    updated: "2025-01-15",
    abstract:
`Documentation scaffold for lithium **therapeutic drug monitoring**. Emphasizes timing of levels, safety labs, interaction review, and patient counseling notations. Purposefully avoids dose recommendations, respecting local policies and prescriber judgment.`,
    criteria:
`**When documenting**
• Indication context (maintenance vs acute treatment; prevention of relapse; augmentation).
• Trough timing: **12 h after last dose** for once-daily; immediately pre-dose for divided regimens.
• Cite local/standard target ranges without directing a dose.
• Note renal/thyroid status and pregnancy considerations as context.`,
    differential:
`Adverse effect descriptors vs toxicity (GI upset, coarse tremor, ataxia, confusion). Distinguish medication exacerbators: NSAIDs, ACEi/ARBs, thiazides; dehydration/illness; low sodium intake; drug interactions; consider adherence/administration timing in interpretation of levels.`,
    riskStrat:
`Higher risk with renal impairment, dehydration, infection with poor intake, sodium balance changes, interacting medications, older age. Protective/mitigating factors: reliable follow-up, caregiver support, clear lab scheduling.`,
    redFlags:
`Progressive neurological signs (confusion, ataxia); persistent vomiting/diarrhea; severe tremor; new polyuria/polydipsia with hypernatremia concerns; pregnancy.`,
    monitoring:
`**Documentation block (Vitals slot)**
• Level timing documented (12-h trough vs pre-dose).
• Labs: Na, Cr/eGFR; TSH; weight/BMI.
• ECG/QTc if comorbidity/risk profile suggests.
• Interaction review (NSAIDs/ACEi/ARBs/thiazides); patient counseling noted.
• Follow-up plan and point of contact recorded.`,
    communication:
`Notes include discussion of interactions, toxicity symptoms, when to seek urgent care, and coordination with primary care. Acknowledge shared decision-making; avoid prescriptive phrasing.`,
    followUp:
`State who orders labs, how results will be communicated, and the re-check interval; highlight any barrier addressed (transport, lab access).`,
    docPhrases:
`"Lithium monitoring plan documented. Level timing (trough) and safety labs listed; interaction review and counseling recorded. Coordination arranged with primary team. This documentation does not provide dosing directives."`,
    references:
`Consensus summaries on lithium monitoring; general TDM primers.`,
    tags: ["Bipolar","TDM","Renal/Thyroid"],
    meta: { monitoring: { evidence: "B" }, docPhrases: { evidence: "D" } },
    version: "1.1"
  },


  {
    id: "switch-matrix",
    title: "Antidepressant switch — documentation matrix",
    category: "Antidepressant Switch",
    updated: "2025-01-15",
    abstract:
`A structured note helper for **switching antidepressants**. Captures rationale, method (direct, cross-taper, washout), risk mitigation, and monitoring. Avoids prescribing instructions; focuses on documentation quality and risk communication.`,
    criteria:
`• Presenting indication, prior response, and adverse effects.
• Half-life and interaction profile of the outgoing agent; discontinuation risk (paroxetine, venlafaxine).
• **MAOI** considerations and washout intervals; **fluoxetine** long half-life implications.
• QTc or seizure risk factors; hepatic/renal context.
• Document shared decision-making and patient preferences.`,
    differential:
`Medication adverse effect vs relapse; bipolar spectrum activation; substance-induced symptoms; comorbid anxiety; medical contributors (thyroid/anemia/OSA/pain).`,
    riskStrat:
`Serotonin toxicity risk with overlapping serotonergic agents; withdrawal/discontinuation symptoms; suicidality shifts with initiation/change; manic switch in vulnerable individuals.`,
    redFlags:
`Agitation, confusion, diaphoresis, hyperreflexia/clonus (serotonin toxicity features). New or escalating suicidality; severe insomnia/activation; significant QTc prolongation if relevant medications are involved.`,
    monitoring:
`**Documentation block (Vitals slot)**
• Early adverse-effect check-ins; PHQ-9/GAD-7 trend.
• Vitals; if QTc-relevant agents, document ECG plan/availability.
• Sleep/appetite/energy diary; family/caregiver observations when available.`,
    communication:
`Education: rationale for switch, expected timelines, early side-effects, and who to contact. Record discussion of alternative options and patient values/preferences.`,
    followUp:
`Schedule for review (e.g., 1–2 weeks early check-in), crisis plan information, and coordination with psychotherapy when applicable.`,
    docPhrases:
`"Switch plan documented (rationale, outgoing medication profile, chosen method). Risk mitigation and **monitoring** plan recorded; safety language and contact pathways included. Documentation support only; no dosing directives included."`,
    references:
`Consensus reviews on antidepressant switching and serotonin toxicity risk mitigation.`,
    tags: ["MDD","Anxiety","Serotonin syndrome","PHQ-9/GAD-7"],
    meta: { monitoring: { evidence: "C" }, docPhrases: { evidence: "D" } }
  },


  {
    id: "acute-agitation",
    title: "Acute agitation — de-escalation & documentation ladder",
    category: "Acute Agitation",
    updated: "2025-01-15",
    abstract:
`Documentation scaffold for **stepped de-escalation**. Prioritizes environment, engagement, and safety; if medications are used by the primary team per local policy, records rationale and observation plan. This text supports documentation (not directives).`,
    criteria:
`• Rapid screen for medical precipitants (delirium/intoxication/withdrawal; pain; hypoxia).
• Triggers and stressors; history of trauma or sensory sensitivities.
• Verbal de-escalation strategies and patient preferences captured.
• Capacity/consent discussion when feasible.`,
    differential:
`Delirium; substance intoxication/withdrawal; acute psychosis; mood dysregulation; TBI sequelae; autism spectrum with sensory overload; akathisia from dopamine-blocking agents; pain/urinary retention.`,
    riskStrat:
`Imminent harm to self/others; elopement; falls; restraints-related risks. Protective factors include therapeutic alliance elements and family presence.`,
    redFlags:
`Airway compromise, hypoxia, hyperthermia/rigidity (NMS/serotonin toxicity), new focal deficits, severe intoxication/withdrawal, trauma risk.`,
    monitoring:
`**Documentation block (Vitals slot)**
• Vitals and observation level frequency recorded.
• Agitation/sedation scale (RASS/SAS) trended.
• If medications used by primary team → side-effect watch documented (airway/respiratory, extrapyramidal symptoms, orthostasis/QTc when relevant).
• Debrief and identified triggers noted.`,
    communication:
`Respectful, person-first language; safety expectations; participation of trusted supports where helpful. Distinctly document **what was tried** and the patient’s response.`,
    followUp:
`Re-evaluate triggers, screen for underlying delirium/substance states, and capture next-step plan and handover notes.`,
    docPhrases:
`"De-escalation pathway documented: non-pharmacologic strategies emphasized; if medication(s) were used by the primary team under local policy, rationale and monitoring documented. Note supports documentation; no prescriptive directives."`,
    references:
`Emergency/inpatient agitation consensus statements; non-pharmacologic de-escalation literature.`,
    tags: ["RASS","SAS","Safety"],
    meta: { monitoring: { evidence: "B" }, docPhrases: { evidence: "D" } }
  },


  {
    id: "clozapine-anc",
    title: "Clozapine — ANC documentation checkpoints",
    category: "Clozapine ANC",
    updated: "2025-01-15",
    abstract:
`Note helper for **ANC monitoring** in clozapine treatment. Focuses on documenting current ANC values, trends, infection symptoms, and coordination requirements. Not a prescribing protocol.`,
    criteria:
`• Latest ANC and trend; benign ethnic neutropenia context when relevant.
• Infection symptoms review and sick contacts.
• Local program requirements and frequency of labs; coordination roles noted.`,
    differential:
`Transient viral neutropenia; other marrow suppressants; sample/processing issues; lab variability.`,
    riskStrat:
`Higher risk early in treatment, with concurrent myelosuppressants, or systemic infection. Protective: reliable lab access, program enrollment, education.`,
    redFlags:
`Fever or systemic infection; rapidly falling ANC; symptoms consistent with myocarditis (time-linked).`,
    monitoring:
`**Documentation block (Vitals slot)**
• ANC value and date, trend description.
• Symptom checks and when to seek urgent care.
• Coordination with pharmacy/hematology/local program.
• Contact pathway and follow-up interval recorded.`,
    communication:
`Patient/family understanding of monitoring regimen captured; preferred contact method for critical results documented.`,
    followUp:
`Re-check schedule and responsibility (clinic vs program); reminders/alerts if your system supports them.`,
    docPhrases:
`"Clozapine ANC monitoring documented. Latest ANC [x] with trend […]. Infection symptom screen recorded; coordination with program/pharmacy noted. Documentation support only."`,
    references:
`Clozapine monitoring concepts and common ANC thresholds; review articles on hematologic safety.`,
    tags: ["Schizophrenia","REMS","Hematology"],
    meta: { monitoring: { evidence: "B" }, docPhrases: { evidence: "D" } }
  },


  {
    id: "peripartum-psych",
    title: "Peripartum psychiatry — documentation scaffold",
    category: "Peripartum Psych",
    updated: "2025-01-15",
    abstract:
`Documentation support for psychiatric assessment in **antenatal or postpartum** settings. Emphasizes timing relative to pregnancy, obstetric liaison, lactation considerations, risk assessment, and shared decision-making language.`,
    criteria:
`• Gestational age or postpartum timing; obstetric issues; lactation status.
• Past episodes (especially bipolar, psychosis, severe depression, postpartum psychosis).
• Medication compatibility notes (documentation only) and obstetric/pediatric coordination.`,
    differential:
`Postpartum blues vs postpartum depression; postpartum psychosis; thyroid disease; anemia; infection; medication effects; substance use.`,
    riskStrat:
`Suicidality, infanticide risk, severe dehydration/poor intake, preeclampsia features; protective factors: partner/family support, access to urgent contact, good insight.`,
    redFlags:
`Acute psychosis, severe agitation, new neurological deficits, severe hypertension/preeclampsia signs, thoughts of harming infant or self.`,
    monitoring:
`**Documentation block (Vitals slot)**
• Risk surveillance and supports; plan for rapid contact if deterioration occurs.
• Coordination with obstetrics and pediatrics (lactation issues noted).
• Screening scales where appropriate (EPDS, PHQ-9, GAD-7).`,
    communication:
`Nonjudgmental, collaborative language; lactation and infant care concerns acknowledged; document shared decisions around medication/risk trade-offs without directives.`,
    followUp:
`Clear handover plan and scheduled review; who to contact and when; supports enlisted.`,
    docPhrases:
`"Peripartum psychiatric assessment documented. Context (timing, lactation) recorded; coordination with OB/peds; risk monitoring plan stated; psychoeducation provided. Documentation support only."`,
    references:
`Peripartum mental health guidance summaries; lactation compatibility resources (general concepts).`,
    tags: ["OB","Lactation","Risk"],
    meta: { monitoring: { evidence: "C" }, docPhrases: { evidence: "D" } }
  },


  {
    id: "suicide-risk",
    title: "Suicidality — structured documentation scaffold",
    category: "Acute Agitation",
    updated: "2025-01-15",
    abstract:
`Structured, concise documentation for **acute suicide risk** assessment. Captures risk/protective factors, immediacy, uncertainties, and monitoring plan without directing treatment.`,
    criteria:
`**Include**: current ideation, intent, plan, means access, rehearsal/attempts; precipitating stressors; psychiatric and substance history; prior attempts; medical comorbidities; family history; protective factors (reasons for living, supports).`,
    riskStrat:
`Synthesize into *acute risk* vs baseline risk; record uncertainties and contingencies (e.g., collateral pending).`,
    redFlags:
`Imminent intent with plan and access to means; recent near-lethal attempt; severe agitation/intoxication; inability to ensure safety.`,
    monitoring:
`Observation level, removal of means where applicable, safety checks frequency, follow-up contact plan.`,
    docPhrases:
`"Acute suicide risk **appraised** with the following contributors: […risk factors…] and **protectors**: […]. Immediacy estimated as [low/moderate/high] with uncertainties [..]. Monitoring and contact plan documented. Note supports documentation and coordination."`,
    references: `Practice frameworks for suicide risk documentation; structured professional judgment literature.`,
    tags: ["Risk","SPJ","Safety"],
    meta: { docPhrases: { evidence: "D" } }
  },


  {
    id: "delirium-psychiatry",
    title: "Delirium vs primary psychiatric disorder — documentation",
    category: "Catatonia",
    updated: "2025-01-15",
    abstract:
`Documentation cues to distinguish **delirium** from primary psychiatric presentations in hospital settings; supports concise yet high-value notes.`,
    criteria:
`Fluctuating attention/awareness; disorganized thinking; altered sleep-wake; acute change from baseline; precipitating medical factors; CAM or 4AT screen results included in the note.`,
    redFlags:
`Hypoxia, sepsis, stroke, intoxication/withdrawal, metabolic crises.`,
    monitoring:
`Observation level; reorientation; sleep-wake measures; sensory aids; involvement of medical colleagues recorded.`,
    docPhrases:
`"Delirium suspected/being ruled out. Objective screen documented (e.g., CAM); medical evaluation and supportive measures recorded. Documentation support only."`,
    references:`Delirium bedside screening tools summaries.`,
    tags:["Delirium","4AT","CAM"]
  },


  {
    id: "qtc-psychotropics",
    title: "QTc — documentation scaffold for psychotropics",
    category: "Antidepressant Switch",
    updated: "2025-01-15",
    abstract:
`Compact note helper to record **QTc considerations** when psychotropics or polypharmacy raise concern.`,
    criteria:
`Baseline QTc (if known), patient risk factors (age, cardiac disease, electrolytes), interacting medications; ECG availability; documentation of shared risk language without prescribing directives.`,
    redFlags:
`Syncope or presyncope, palpitations with instability, marked electrolyte abnormalities, family history of sudden cardiac death.`,
    monitoring:
`Vitals; symptom checks (syncope/presyncope/palpitations); electrolyte review; ECG coordination if indicated in local practice.`,
    docPhrases:
`"QTc risk context recorded (baseline factors, concurrent meds). ECG coordination documented as per local practice. This note records risk communication and monitoring plan; it does not specify medication directives."`,
    references:`General QTc risk resources and consensus statements.`,
    tags:["ECG","Polypharmacy"]
  },


  {
    id: "ect-doc",
    title: "ECT — documentation scaffold for consultation & handover",
    category: "Peripartum Psych",
    updated: "2025-01-15",
    abstract:
`Brief structure for **ECT** consultation documentation, focusing on indication context, medical clearance coordination, and consent principles.`,
    criteria:
`Indication context (e.g., severe depression w/ psychosis, catatonia); medical comorbidity; anesthetic risk liaison; capacity/consent process recorded.`,
    redFlags:
`Acute medical instability prohibiting anesthesia; severe agitation or delirium requiring optimization before procedure days.`,
    monitoring:
`Observation language for peri-ECT days (mood, psychosis, motor phenomena, nutrition/hydration) and side-effect watch (headache, memory complaints) documented.`,
    docPhrases:
`"ECT consultation requested/under discussion; indication context and medical liaison documented. Consent/capacity discussion recorded. This note supports documentation only."`,
    references:`ECT consensus resource summaries.`,
    tags:["ECT","Consent","Liaison"]
  },


  {
    id: "sip-eval",
    title: "Substance-induced psychosis — documentation helper",
    category: "Acute Agitation",
    updated: "2025-01-15",
    abstract:
`Documentation scaffold for **substance-induced psychosis** evaluation; emphasizes time course, tox data, and risk communication.`,
    criteria:
`Temporal relationship to substance exposure/withdrawal; tox results; pattern of prior psychosis in abstinence; collateral info; medical contributors.`,
    redFlags:
`Severe withdrawal syndromes (e.g., delirium tremens), hyperthermia or rigidity (serotonin toxicity/NMS), severe agitation unresponsive to de-escalation.`,
    monitoring:
`Observation level; withdrawal monitoring scales where applicable; follow-up linkage for substance use treatment; harm reduction education noted.`,
    docPhrases:
`"Psychosis temporally associated with substance exposure/withdrawal; differential includes primary psychotic disorder and delirium. Documentation captures data pending, safety measures, and linkage planning."`,
    references:`Substance-induced psychosis reviews.`,
    tags:["SUD","Withdrawal","Tox"]
  },


  {
    id: "metabolic-antipsychotics",
    title: "Antipsychotics — metabolic monitoring documentation",
    category: "Clozapine ANC",
    updated: "2025-01-15",
    abstract:
`Note helper for **metabolic monitoring** with antipsychotics; records weight/BMI, waist, BP, glucose/lipids, and counseling language.`,
    criteria:
`Baseline weight/BMI/waist; BP; glucose/A1c; lipid profile; cardiovascular risk factors. Scheduling responsibility and communication plan documented.`,
    redFlags:
`Rapid weight gain with metabolic decompensation; symptomatic hyperglycemia; hypertensive urgency; signs of pancreatitis.`,
    monitoring:
`**Vitals slot**: anthropometrics trend, BP, labs completion status, lifestyle counseling notes, care coordination.`,
    docPhrases:
`"Metabolic monitoring documentation recorded (anthropometrics, BP, labs). Counseling and coordination noted. Documentation support only."`,
    references:`Metabolic syndrome and antipsychotics monitoring summaries.`,
    tags:["Metabolic","A1c","Lipid","BP"]
  },
];
