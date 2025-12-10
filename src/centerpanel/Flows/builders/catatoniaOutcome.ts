import type { CatatoniaFormState } from "../types/CatatoniaFormState";

function tsLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} (local)`;
}

function listObservedFeatures(f: CatatoniaFormState["observedFeatures"]): string[] {
  const items: string[] = [];
  if (f.mutism) items.push("mutism / markedly reduced verbal output");
  if (f.stuporOrImmobility) items.push("stupor / immobility");
  if (f.posturingOrCatalepsy) items.push("posturing / catalepsy");
  if (f.rigidity) items.push("rigidity");
  if (f.negativism) items.push("negativism");
  if (f.echolaliaOrEchopraxia) items.push("echolalia / echopraxia");
  if (f.waxyFlexibility) items.push("waxy flexibility");
  if (f.staringFixed) items.push("fixed staring / minimal blinking");
  if (f.withdrawalRefusalToEatDrink) items.push("withdrawal / refusal of oral intake");
  if (f.autonomicInstability) items.push("autonomic instability");
  return items;
}

function severityToEnglish(code: string): string {
  switch (code) {
    case "mild_functional_impairment":
      return "mild functional impairment (reduced spontaneity but interactive)";
    case "moderate_significant_impairment":
      return "moderate significant impairment (marked psychomotor slowing / rigidity / limited intake)";
    case "severe_requires_urgent_intervention":
      return "severe / urgent concern (profound immobility, autonomic instability, unable to maintain nutrition/hydration)";
    case "not_assessed":
      return "not assessed";
    default:
      return "[not recorded]";
  }
}

export function buildCatatoniaOutcome(form: CatatoniaFormState, insertedAtMs: number): string {
  const ts = tsLocal(insertedAtMs);

  const features = listObservedFeatures(form.observedFeatures);
  const featuresText = features.length ? features.join(", ") : "[not recorded]";
  const obsNarr = (form.observedNarrative || "").trim();

  const medDiff = (form.medicalDifferential || "").trim() || "[not recorded]";
  const hydration = (form.hydrationNutritionStatus || "").trim() || "[not recorded]";
  const vitalsAuto = (form.vitalsAndAutonomic || "").trim() || "[not recorded]";

  const severity = severityToEnglish(form.bfcrsSeverityLevel || "");
  const functional = (form.functionalImpact || "").trim() || "[not recorded]";
  const risks = (form.riskFactors || "").trim() || "[not recorded]";

  const monitor = (form.monitoringPlan || "").trim() || "[not recorded]";
  const handoff = (form.handoffCommunication || "").trim() || "[not recorded]";

  const paragraph = [
    `A catatonia / BFCRS-style assessment was documented this encounter. Observed features included ${featuresText}${obsNarr ? `, with time-linked description: ${obsNarr}` : ""}.`,
    `Medical / neurologic differential considerations included ${medDiff}, and autonomic / hydration / nutrition concerns were described as ${hydration} with vitals/autonomic findings ${vitalsAuto}.`,
    `Functional impact and severity were documented as ${severity} with noted risks ${risks}, including ability/inability to maintain nutrition/hydration and autonomic stability (${functional}).`,
    `Monitoring / reassessment plan was recorded as ${monitor}, and handoff / services notified were ${handoff}.`,
    `This documentation supports clinical communication, safety monitoring, and escalation planning for suspected catatonia. It does not, by itself, authorize medication administration, sedation protocol, seclusion, restraint, constant observation, or legal custody / hold status, and it does not replace local policy, supervising clinician review, or urgent medical / neurologic evaluation if instability progresses. Recorded ${ts}.`
  ].join(" ");

  return paragraph;
}
