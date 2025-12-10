


export const MSE = `Mental Status Examination (Scaffold)
Appearance: (grooming, hygiene, attire)
Behavior: (cooperative, eye contact, psychomotor activity)
Speech: (rate, volume, tone, fluency)
Mood: (patient-stated)
Affect: (range, stability, congruence)
Thought Process: (linear, goal-directed, circumstantial, tangential, disorganized)
Thought Content: (risk content, unusual beliefs, obsessions)
Perception: (hallucinations, illusions, derealization, depersonalization)
Cognition: (orientation, attention, memory, abstraction)
Insight: (intact / limited / minimal)
Judgment: (intact / limited)
Risk: (self-harm, others, protective factors)
Plan: (concise next steps; avoid PHI)`;

export const SOAP_NOTE = `SOAP Note (General)
Subjective:
- Chief concern:
- History of present illness (concise, patient quotes if relevant)
- Pertinent review of systems
- Past psychiatric history (if needed)
- Medications / allergies (avoid PHI)
Objective:
- Mental Status Examination summary
- Pertinent vitals / observations (if applicable)
Assessment:
- Summary of key findings
- Differential considerations (non-diagnostic phrasing)
Plan:
- Therapeutic approach (supportive/CBT principles/etc.)
- Monitoring / safety
- Patient education (general, no PHI)
- Follow-up`;

export const SAFETY_PLAN = `Safety Plan Outline (Educational)
Warning Signs:
-
Internal Coping Strategies:
-
Distraction (people / places, non-identifying):
-
Supportive Contacts (non-identifying):
-
Professional / Crisis Resources:
- 988 (US) or local emergency services
- Local mental health helplines
Means Safety Steps:
-
Protective Factors:
-
Next Steps / Review:
- Encourage early outreach; avoid PHI.`;

export const PHQ9_INSTR = `PHQ-9 Patient Instructions
Over the last 2 weeks, how often have you been bothered by the following problems?
0 = Not at all | 1 = Several days | 2 = More than half the days | 3 = Nearly every day
Answer for each of the 9 items.`;

export const GAD7_INSTR = `GAD-7 Patient Instructions
Over the last 2 weeks, how often have you been bothered by the following problems?
0 = Not at all | 1 = Several days | 2 = More than half the days | 3 = Nearly every day
Answer for each of the 7 items.`;



export const RISK_TRIAGE = `You are assisting a clinician with suicide/self-harm risk triage.
Return a concise interview checklist:
1) Presenting ideation: passive vs active; intent; plan; access; preparation.
2) History: past attempts; NSSI; hospitalizations; diagnoses; substance use; agitation.
3) Protective factors: reasons for living; supports; responsibilities; values/spirituality.
4) Acute risks: intoxication; severe insomnia; mixed/manic features; command AH; recent losses.
5) Means safety today: firearms, medications, ligatures—specific feasible steps.
6) Clinical impression: LOW / MODERATE / HIGH (state uncertainty).
7) Next steps: observation level, collateral, safety plan, crisis resources, follow-up window.
Neutral tone. No diagnoses or treatment directives.`;

export const CAPACITY_ASSESS = `Decision-making capacity documentation helper.
Summarize the 4 abilities with prompts:
- Understanding: patient's own words for condition/recommendation.
- Appreciation: acknowledges how information applies personally.
- Reasoning: compares options/risks/benefits consistently.
- Expressing a choice: stable, voluntary.
Include reversible factors (delirium/intoxication/psychosis), communication aids, and time-course.`;


export const HEADSSS_PROMPT = `HEADSSS adolescent interview scaffold:
Home; Education/Employment; Activities; Drugs; Sexuality; Safety; Suicide/Self-harm; Strengths.
Use collaborative, non-judgmental, developmentally appropriate phrasing.`;

export const SBIRT_BRIEF = `SBIRT 5–7 minute brief intervention (risky alcohol use):
1) Ask permission + reflect AUDIT-C results.
2) Explore pros/cons and goals.
3) Advice + options menu; elicit commitment.
4) Follow-up plan & supports. Tone: empathic and autonomy-supportive.`;


export const SLEEP_PSYCHOED = `Compact sleep hygiene handout:
Regular schedule; stimulus control; limit late caffeine/alcohol; light exposure (AM light / PM dim);
wind-down routine; device limits; when to seek medical care (e.g., suspected OSA or RLS).`;

export const TRAUMA_INFORMED = `Trauma-informed engagement script:
Safety first; choice; collaboration; empowerment; cultural humility. Avoid pressuring disclosure.
Offer grounding skills (5-4-3-2-1 senses, paced breathing).`;

export const MANIA_SCREEN = `Hypomania/mania screen prompts:
Episodic elevated/irritable mood; decreased need for sleep; increased goal-directed activity;
risk-taking; pressured speech; racing thoughts; distractibility; functional change from baseline.`;

export const PSYCHOSIS_INTERVIEW = `Psychosis interview skeleton:
Onset/time course; stressors; sleep/substances; hallucinations (modality, frequency, control);
delusions (themes, conviction); disorganization; negative symptoms; insight; risk.`;


export const MED_ADHERENCE = `Medication adherence review:
Current regimen; missed doses; routines; barriers (side effects, cost, beliefs);
shared plan to simplify and reminder strategies; safety-net instructions.`;


export const DEPRESSION_PSYCHOED = `Patient education: depression
- Common features: mood, anhedonia, energy, sleep/appetite, concentration.
- What helps: activity scheduling/behavioural activation; pleasant events; social support; regular sleep.
- When to get urgent help: thoughts of death/self-harm, severe worsening, substance binges.`

export const ANXIETY_TOOLBOX = `Patient education: anxiety toolbox
- Body: paced breathing, grounding, muscle relaxation, exercise.
- Thinking: probability re-rating, compassionate self-talk.
- Behaviour: approach in steps (graded exposure), reduce safety behaviours.
- Plan a tiny daily practice (5–10 min).`;

export const PANIC_ACTION_PLAN = `Panic plan (one-page):
1) Name it (“this is a panic surge”), 2) Sit + breathe (4-6 breaths/min),
3) Focus on one neutral cue, 4) Let the wave pass (10–20 min), 5) Resume task.
Avoid caffeine/nicotine spikes; schedule brief daily exposure practices.`;


export const EVIDENCE_DSM5TR = `DSM-5-TR sections (educational index):
Neurodevelopmental; Schizophrenia Spectrum; Bipolar; Depressive; Anxiety; Obsessive-Compulsive and Related; Trauma- and Stressor-Related; Dissociative; Somatic Symptom; Feeding and Eating; Sleep-Wake; Sexual Dysfunctions; Gender Dysphoria; Disruptive/Impulse-Control and Conduct; Substance-Related and Addictive; Neurocognitive; Personality; Paraphilic.`;

export const EVIDENCE_NICE = `Selected NICE topics (educational list):
Depression (adults; children/YP); Generalised anxiety/panic; PTSD; Bipolar disorder; Psychosis/schizophrenia;
Self-harm; Eating disorders; Autism (adults); ADHD. Use official NICE for current guidance.`;

export const EVIDENCE_WHO_MHGAP = `WHO mhGAP (educational summary):
Depression; Psychosis; Epilepsy; Child/adolescent behavioural problems; Dementia; Substance use; Self-harm/suicide; Other complaints. See latest WHO mhGAP guide for algorithms.`;

export const EVIDENCE_APA = `APA Practice Guideline topics (educational index):
Major depressive disorder; Substance use disorders; Schizophrenia; PTSD; Bipolar disorder; Suicide risk assessment.
Consult APA for full guidance and updates.`;


export const GAD7_JSON_SCHEMA = {
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"title": "GAD-7",
	"type": "object",
	"additionalProperties": false,
	"properties": Object.fromEntries(Array.from({length:7},(_,i)=>[`q${i+1}`,{ "type":"integer","minimum":0,"maximum":3 }])),
	"required": Array.from({length:7},(_,i)=>`q${i+1}`)
} as const;
