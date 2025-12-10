import type { ObservationFormState } from "../types/ObservationFormState";

function tsLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} (local)`;
}

function riskTypeToHuman(code: string): string {
  switch (code) {
    case "self_harm_imminent":
      return "imminent self-harm risk";
    case "violence_threat_imminent":
      return "imminent risk of violence toward others";
    case "attempted_elopement_from_safe_area":
      return "repeated unsafe elopement attempts from a medically necessary environment";
    case "property_damage_creating_safety_hazard":
      return "destructive behavior creating immediate safety hazard";
    case "other_immediate_safety_risk":
      return "other immediate safety risk";
    case "not_assessed":
      return "not assessed";
    default:
      return "[not recorded]";
  }
}

function observationLevelToHuman(code: string): string {
  switch (code) {
    case "constant_observation_1to1_line_of_sight":
      return "continuous line-of-sight observation with dedicated staff presence";
    case "dedicated_safe_room_or_ligature_reduced_environment":
      return "placement in designated ligature-reduced safe room with direct monitoring";
    case "restricted_unit_area_close_monitor":
      return "restricted, closely monitored area per policy for imminent safety risk";
    case "temporary_physical_hold_per_policy":
      return "brief physical hold per policy for immediate safety / stabilization";
    case "other_policy_defined_level":
      return "other policy-defined safety containment measure";
    case "not_disclosed_here":
      return "not disclosed / unspecified here";
    default:
      return "[not recorded]";
  }
}

export function buildObservationOutcome(form: ObservationFormState, insertedAtMs: number): string {
  const ts = tsLocal(insertedAtMs);

  const behaviorNarrative = (form.behaviorNarrative || "").trim();
  const imminentRisk = riskTypeToHuman(form.imminentRiskType || "");
  const riskClarifier = (form.riskClarifier || "").trim();

  const deesc = (form.deescalationAttempts || "").trim();
  const comforts = (form.nonPharmComfortsOffered || "").trim();
  const leastWhy = (form.leastRestrictiveInsufficientWhy || "").trim();

  const levelHuman = observationLevelToHuman(form.observationLevel || "");
  const rationale = (form.observationRationale || "").trim();
  const monitoring = (form.monitoringPlanDetails || "").trim();

  const reassess = (form.reassessmentFrequencyPlan || "").trim();
  const criteria = (form.deescalationCriteria || "").trim();
  const handoff = (form.handoffAndSupervision || "").trim();

  const paragraph = [
    `An observation / containment-level safety status was documented this encounter. Reported behavior and immediate safety concern: ${behaviorNarrative || "[not recorded]"}, with acute safety axis identified as ${imminentRisk}. The situation was documented as immediately unsafe because ${riskClarifier || "[not recorded]"}.`,
    `Least-restrictive measures were attempted prior to elevated observation / containment (verbal de-escalation, supportive presence, environmental reduction of stimulation, comfort measures), specifically ${(deesc || comforts) ? [deesc, comforts].filter(Boolean).join("; ") : "[not recorded]"}, but these were insufficient because ${leastWhy || "[not recorded]"}.`,
    `A safety-based observation / containment level was then initiated under supervising clinician and local policy, described as ${levelHuman}, with rationale ${rationale || "[not recorded]"}. The monitoring / staffing / airway-vitals plan communicated was ${monitoring || "[not recorded]"}, including active observation for escalation or distress and attention to airway / respiratory / autonomic safety if sedation or marked agitation occurred.`,
    `Ongoing review / de-escalation intent was documented as ${reassess || "[not recorded]"}, with explicit step-down criteria ${criteria || "[not recorded]"} and handoff / supervision described as ${handoff || "[not recorded]"}.`,
    `This documentation supports clinical communication, immediate safety monitoring, accountability around least-restrictive practice, and explicit plans to reassess and de-escalate containment as soon as clinically safe. It does not, by itself, authorize seclusion, restraint, involuntary treatment, legal custody / hold status, or any ongoing restriction, and it does not replace local policy, supervising clinician review, or real-time judgment regarding discontinuation of enhanced observation. Recorded ${ts}.`
  ].join(" ");

  return paragraph;
}
