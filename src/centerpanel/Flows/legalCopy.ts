



export const GLOBAL_FLOW_SUBTITLE =
  "This structured flow supports clinical documentation and does not constitute treatment directives.";

export const GLOBAL_WARN_NEUTRAL_LANGUAGE =
  "Use neutral, observable language. Document safety/monitoring as communication, not as standing orders.";



export const GLOBAL_FLOW_BOUNDARY_LINE =
  "This documentation supports clinical communication and safety monitoring. It is not a seclusion/restraint order, constant-observation order, involuntary hold authorization, medication directive, or legal custody/hold determination.";


export const GLOBAL_BOUNDARY_LINE = GLOBAL_FLOW_BOUNDARY_LINE;


export const NOTE_GLOBAL_FOOTER =
  "This clinical note is prepared to support communication and continuity of care. It is not a treatment directive, order, or authorization for seclusion/restraint.";


export const NOTE_SECTION_DISCLAIMER =
  "Section content supports clinical communication and continuity. It is not a treatment directive, order, or authorization.";




export const SAFETY_WARN =
  "If imminent self-harm risk is suspected, escalate evaluation and observation per clinician judgment and local policy. Use neutral, patient-centered language. This documentation does not replace real-time safety actions and does not create treatment directives.";

export const AGITATION_WARN =
  "Use neutral, observable language (e.g., ‘pacing rapidly, shouting, striking at staff’) rather than pejorative labels. Document medical contributors evaluated (delirium, hypoxia, intoxication/withdrawal, metabolic issues). Describe non-pharmacological de-escalation attempts and the safety-based rationale for any escalation. This documentation does not itself authorize restraint, seclusion, physical hold, emergency medication, or custody / hold status. Escalate in real time per clinician judgment and local policy.";

export const CAPACITY_WARN =
  "This assessment documents the patient’s decision-specific ability in four domains: (1) Understanding of the clinical situation; (2) Appreciation of potential consequences of accepting or refusing care; (3) Reasoning about options in a manner that is coherent with their stated values; and (4) Ability to express a stable treatment choice.\nThis note supports clinical communication and handoff. It is not, by itself, a legal capacity adjudication, involuntary treatment authorization, or custody / hold determination. Escalate capacity-related concerns per supervising clinician and local policy.";

export const CATATONIA_WARN =
  "Document observable motor / behavioral features (e.g., mutism, posturing, echolalia, rigidity) and autonomic / medical concerns in neutral, descriptive language. Consider medical and neurologic contributors (encephalopathy, intoxication / withdrawal, neuroleptic malignant syndrome, metabolic derangement). This form supports communication and ongoing monitoring of suspected catatonia and does not, by itself, authorize medication, sedation protocol, seclusion, restraint, or legal hold.";

export const OBSERVATION_WARN =
  "Use neutral, time-linked, observable language when describing behavior (e.g., ‘repeatedly striking wall with closed fist at ~13:12; verbal threats directed at staff; attempting to run toward exit’) and imminent risk (risk to self or others). Document least-restrictive strategies attempted (verbal de-escalation, reassurance, environmental reduction of stimulation) and why those were insufficient for immediate safety. Describe current observation / containment level as a safety-based, time-limited measure under supervising clinician / policy oversight. This form supports communication and safety monitoring. It does not, by itself, authorize seclusion, restraint, involuntary hold, custody status, or any ongoing restriction.";

export const LORAZEPAM_WARN =
  "If a lorazepam challenge is discussed or administered, document the clinical rationale as diagnostic clarification / acute safety stabilization, pre-dose baseline mental status, dose and route as communicated by the treating clinician, post-dose observed response, and airway / vital sign monitoring. This documentation does not itself authorize medication administration, chemical restraint, seclusion, restraint, or custody / hold status. Escalate per supervising clinician and local policy.";


export const FLOW_LABELS = {
  safety: "Acute Safety / Suicide Risk Review",
  agitation: "Agitation / Behavioral Emergency",
  capacity: "Capacity & Consent Check",
  catatonia: "Catatonia / BFCRS Assessment",
  lorazepam: "Lorazepam Challenge",
  observation: "Observation / Containment Justification",
} as const;
