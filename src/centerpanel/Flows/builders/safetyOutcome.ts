import { formatLocalTimestamp } from "../time/format";


export type SafetyFormState = {
  ideationStatus: "" | "denies" | "passive" | "active" | "withheld" | "not_assessed";
  intentPlanStatus: "" | "denies" | "passive_no_plan" | "active_general" | "active_intent" | "not_assessed";
  patientVerbatim: string;
  meansAccess: "" | "no_access" | "potential_access" | "direct_access" | "not_assessed";
  acuteRiskFactors: string;
  protectiveFactors: string;
  alertWillingness: "" | "will_alert" | "ambivalent_but_agrees" | "declines" | "not_discussed";
  observationDiscussed: "" | "brief_supportive" | "continuous_observation_discussed" | "other" | "not_discussed";
  observationNotes: string;
};

export function buildSafetyOutcome(form: SafetyFormState, insertedAtMs: number): string {
  const tsStr = formatLocalTimestamp(insertedAtMs);
  const parts: string[] = [];
  parts.push("Suicide / safety review was conducted this encounter.");
  parts.push(buildIdeationSentence(form));
  parts.push(buildRiskSentence(form));
  parts.push(buildProtectiveSentence(form));
  parts.push(buildObservationSentence(form));
  parts.push(
    "This documentation supports clinical communication and safety monitoring and does not, by itself, authorize seclusion / restraint, create a standing suicide-prevention directive, establish legal custody / hold status, or replace required local policy / supervision."
  );
  parts.push(`Recorded ${tsStr}.`);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function buildIdeationSentence(f: SafetyFormState): string {
  const ideation = (() => {
    switch (f.ideationStatus) {
      case "denies": return "patient reports no current suicidal thoughts";
      case "passive": return "patient reports passive suicidal ideation";
      case "active": return "patient reports active suicidal ideation";
      case "withheld": return "patient withheld or did not disclose current suicidal ideation";
      case "not_assessed": return "current suicidal ideation was not assessed this encounter";
      default: return "current suicidal ideation status not specified";
    }
  })();
  const intent = (() => {
    switch (f.intentPlanStatus) {
      case "denies": return "and denies intent or plan";
      case "passive_no_plan": return "with passive thoughts only and no plan reported";
      case "active_general": return "with active thoughts and a general plan noted";
      case "active_intent": return "with stated plan and intent to act";
      case "not_assessed": return "and intent/plan was not assessed";
      default: return "";
    }
  })();
  const quote = (f.patientVerbatim || "").trim();
  const quotePart = quote ? ` Patient states, "${quote}".` : "";
  return `${ideation} ${intent}.`.replace(/\s+\./g, ".") + quotePart;
}

function buildRiskSentence(f: SafetyFormState): string {
  if (f.meansAccess === "not_assessed") {
    return "Access to means and immediate risk escalators were not assessed in full this encounter.";
  }
  const means = (() => {
    switch (f.meansAccess) {
      case "no_access": return "patient reports no access to lethal means";
      case "potential_access": return "patient reports potential access to medication or other means at home";
      case "direct_access": return "patient reports direct access to a specific means";
      default: return "access to means not specified";
    }
  })();
  const drivers = (f.acuteRiskFactors || "").trim();
  const driverPart = drivers ? ` and describes ${drivers}` : "";
  return `${means}${driverPart}.`;
}

function buildProtectiveSentence(f: SafetyFormState): string {
  const prot = (f.protectiveFactors || "").trim();
  const willingness = (() => {
    switch (f.alertWillingness) {
      case "will_alert": return "states willingness to alert staff if suicidal urges intensify";
      case "ambivalent_but_agrees": return "expresses ambivalence but agrees to alert staff if distress spikes";
      case "declines": return "did not agree to notify staff if urges worsen";
      case "not_discussed": return "discussion of willingness to alert was not conducted";
      default: return "willingness to alert not specified";
    }
  })();
  if (prot && willingness) {
    return `Patient identifies protective factors including ${prot} and ${willingness}.`;
  }
  if (prot) return `Patient identifies protective factors including ${prot}.`;
  return `Patient did not identify protective factors and ${willingness}.`;
}

function buildObservationSentence(f: SafetyFormState): string {
  const base = (() => {
    switch (f.observationDiscussed) {
      case "brief_supportive":
        return "Supportive observation and brief check-ins were discussed as a means to monitor distress and reduce immediate self-harm risk.";
      case "continuous_observation_discussed":
        return "Continuous observation / sitter presence was discussed with the patient in the context of imminent self-harm concern; rationale was framed in terms of immediate safety, not punishment.";
      case "other":
        return "An individualized observation / monitoring approach was discussed in safety-focused terms.";
      case "not_discussed":
        return "Observation / monitoring approach was not discussed during this encounter.";
      default:
        return "Observation / monitoring strategies were discussed in supportive, safety-focused terms.";
    }
  })();
  const notes = (f.observationNotes || "").trim();
  return notes ? `${base} ${notes.trim().endsWith(".") ? notes : `${notes}.`}` : base;
}
