import type { AgitationFormState } from "../types/AgitationFormState";

function formatLocalTimestamp(insertedAtMs: number): string {
  const d = new Date(insertedAtMs);
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${y}-${m}-${day} ${hh}:${mm} (local)`;
}

function describeInjuryRisk(code: AgitationFormState["injuryRiskProfile"]): string {
  switch (code) {
    case "verbal_only":
      return "verbal escalation/threats only; no physical contact";
    case "attempted_self_harm":
      return "attempted self-harm";
    case "attempted_assault":
      return "attempted physical contact toward staff/others";
    case "property_damage":
      return "property destruction/throwing objects";
    case "not_assessed":
      return "not assessed/not observed";
    default:
      return "[not recorded]";
  }
}

function describeDeescalationTechniques(t: AgitationFormState["deescalationTechniques"]): string[] {
  const items: string[] = [];
  if (t.verbalDeescalation) items.push("verbal de-escalation/calm tone");
  if (t.calmEnvironment) items.push("calm environment/supportive setting");
  if (t.reducedStimuli) items.push("reduced stimulation/moved to quieter space");
  if (t.offeredSupportivePresence) items.push("supportive presence/reassurance");
  if (t.offeredNeedsFoodDrinkToileting) items.push("offered basic needs (water/food/restroom)");
  if (t.setClearRespectfulLimits) items.push("set clear, respectful limits/expectations");
  if (t.otherEnvironmental) items.push("other environmental/sensory modification");
  return items;
}

function describeEscalationType(code: AgitationFormState["escalationTypeDiscussed"]): string {
  switch (code) {
    case "verbal_limits_only":
      return "clear verbal limits/behavioral expectations only";
    case "prn_med_offer":
      return "PRN medication was offered to reduce acute agitation";
    case "emergency_med_administered":
      return "emergency medication was administered for imminent safety";
    case "physical_hold_or_containment":
      return "physical hold/environmental containment used for imminent safety";
    case "not_applicable":
      return "not applicable (no escalation beyond verbal support)";
    default:
      return "[not recorded]";
  }
}

export function buildAgitationOutcome(form: AgitationFormState, insertedAtMs: number): string {
  const ts = formatLocalTimestamp(insertedAtMs);

  const behavior = (form.objectiveBehavior || "").trim();
  const risk = describeInjuryRisk(form.injuryRiskProfile);
  const medical = (form.medicalContributorsConsidered || "").trim();

  const deescList = describeDeescalationTechniques(form.deescalationTechniques);
  const deescNarr = (form.deescalationNarrative || "").trim();
  const deescResp = (form.responseToDeescalation || "").replace(/_/g, " ");

  const escType = describeEscalationType(form.escalationTypeDiscussed);
  const leastRestrictive = (form.leastRestrictiveSummary || "").trim();
  const escRationale = (form.escalationRationale || "").trim();

  const post = (form.postInterventionStatus || "").trim();
  const reassess = (form.reassessmentPlan || "").trim();
  const notified = (form.staffNotified || "").trim();

  const parts: string[] = [];
  parts.push(
    `An acute agitation / behavioral emergency was addressed this encounter. Patient presentation was documented as ${behavior || "[not recorded]"} (${risk}).`
  );
  parts.push(
    `Possible medical / physiologic contributors (delirium, hypoxia, intoxication/withdrawal, pain, neurologic causes) were considered and documented as ${medical || "[not recorded]"}.`
  );

  const deescMeasures = deescList.length > 0 ? deescList.join(", ") : "[not recorded]";
  const deescRespPhrase = deescResp ? deescResp : "[not recorded]";
  parts.push(
    `Non-pharmacological de-escalation measures were attempted, including ${deescMeasures}${deescNarr ? `; timeline: ${deescNarr}` : ""}, emphasizing least-restrictive, supportive strategies. Observed response: ${deescRespPhrase}.`
  );

  parts.push(
    `Escalation (if any) was framed as an immediate safety measure rather than punishment, with rationale described as ${escRationale || "[not recorded]"}, after documenting least-restrictive attempts ${leastRestrictive || "[not recorded]"}, and characterized as ${escType}.`
  );

  parts.push(
    `Post-intervention, patient status was described as ${post || "[not recorded]"}, and a monitoring / reassessment plan was communicated as ${reassess || "[not recorded]"}, with continuity of care / handoff documented as ${notified || "[not recorded]"}.`
  );

  parts.push(
    `This documentation supports clinical communication, safety monitoring, and ongoing reassessment. It does not, by itself, authorize seclusion, restraint, physical hold, emergency medication, or custody / hold status, and it does not replace local policy, supervisory oversight, or real-time clinical judgment. Recorded ${ts}.`
  );

  return parts.join("\n");
}
