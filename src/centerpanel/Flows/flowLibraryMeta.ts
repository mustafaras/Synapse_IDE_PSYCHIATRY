import type { FlowId } from "./flowTypes";

export type FlowLibraryItem = {
  flowId: FlowId;
  title: string;
  category: "ACUTE_RISK" | "CAPACITY_NEURO";
  clinicalFocus: string;
  whatYouDocument: string[];
  boundary: string;
  isLocked?: boolean;
  lockReason?: string;
};

export const FLOW_LIBRARY_ITEMS: FlowLibraryItem[] = [
  {
    flowId: "safety",
    title: "Acute Safety / Suicide Risk Review",
    category: "ACUTE_RISK",
    clinicalFocus:
      "Self-harm / suicidal ideation, intent, access to means, acute risk factors, and protective factors during this encounter.",
    whatYouDocument: [
      "Patient’s own language about suicidal thoughts (passive vs active; plan / intent / means).",
      "Acute drivers (distress, recent escalation, intoxication, hopelessness) and protective factors (reasons to live, willingness to seek help).",
      "Safety / observation steps discussed with the patient (e.g., ‘will notify staff if urges intensify’).",
    ],
    boundary:
      "Documentation of self-harm risk, protective factors, and discussed safety steps. Not an involuntary hold, constant-observation order, or standing suicide-prevention directive.",
  },
  {
    flowId: "agitation",
    title: "Agitation / Behavioral Emergency",
    category: "ACUTE_RISK",
    clinicalFocus:
      "Objective description of acute agitation / behavioral emergency and immediate safety considerations.",
    whatYouDocument: [
      "Observed behavior in neutral terms (e.g., pacing rapidly, shouting, striking at staff).",
      "Medical contributors evaluated (delirium, hypoxia, intoxication/withdrawal, metabolic derangement).",
      "Non-pharmacological de-escalation attempts, and safety-based rationale for any escalation.",
    ],
    boundary:
      "Documents observed behavior, de-escalation attempts, and safety rationale. Not punishment, not a restraint/seclusion order, and not a custody / hold authorization.",
  },
  {
    flowId: "observation",
    title: "Observation / Containment Justification",
    category: "ACUTE_RISK",
    clinicalFocus:
      "Neutral, safety-focused documentation of elevated observation / containment with objective behavior, least-restrictive attempts, current monitoring plan, and explicit step-down intent.",
    whatYouDocument: [
      "Objective, time-linked behavior creating immediate safety risk (self-harm, harm to others, unsafe elopement, or hazardous property damage).",
      "Least-restrictive de-escalation attempted (verbal support, reduced stimulation, non-pharmacologic comfort).",
      "Current observation/containment level under supervising clinician and policy, monitoring / airway-vitals plan, and reassessment / de-escalation criteria.",
    ],
    boundary:
      "Supports clinical communication and safety monitoring. Not a seclusion/restraint order, not legal detention/custody authorization, and not a replacement for institutional policy or supervisory approval.",
  },
  {
    flowId: "capacity",
    title: "Capacity & Consent Check",
    category: "CAPACITY_NEURO",
    clinicalFocus:
      "Decision-specific ability to understand the situation, appreciate consequences, weigh options, and communicate a stable choice.",
    whatYouDocument: [
      "Does the patient state the clinical situation in their own words?",
      "Do they recognize possible consequences of accepting vs refusing care?",
      "Can they compare options and explain a consistent rationale aligned with their values?",
      "Are they able to communicate a stable preference without immediate coercion?",
    ],
    boundary:
      "Documents decision-specific capacity elements for communication and handoff. It is not, by itself, a legal determination of capacity or an involuntary treatment authorization.",
  },
  {
    flowId: "catatonia",
    title: "Catatonia / BFCRS",
    category: "CAPACITY_NEURO",
    clinicalFocus:
      "Document observed catatonic features, medical/neurologic differential, autonomic stability, functional impact, and monitoring plan.",
    whatYouDocument: [
      "Observed features (mutism, rigidity, posturing, echolalia/echopraxia, withdrawal).",
      "Medical/neurologic contributors considered; autonomic and hydration/nutrition status.",
      "Severity/functional impact and explicit monitoring / handoff plan.",
    ],
    boundary:
      "Supports clinical communication and safety monitoring; it is not a medication order or seclusion authorization.",
  },
  {
    flowId: "lorazepam",
    title: "Lorazepam Challenge",
    category: "CAPACITY_NEURO",
    clinicalFocus:
      "Rationale for lorazepam challenge in suspected catatonia, baseline status, dose/route/time as communicated by the treating clinician, observed response, airway/vitals monitoring, and follow-up plan.",
    whatYouDocument: [
      "Indication framed as diagnostic clarification / acute safety (not punishment).",
      "Pre-dose baseline (mental status, motor findings) and vitals/airway state.",
      "Dose/route/time as communicated by the treating clinician; immediate response and safety monitoring; follow-up / escalation plan.",
    ],
    boundary:
      "Not a standing medication directive or chemical restraint authorization.",
    isLocked: false,
  },
];
