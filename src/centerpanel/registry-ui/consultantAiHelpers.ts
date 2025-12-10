

export type Demo = { age?: string | number; sex?: string; name?: string } | null | undefined;
export type EncounterView = { when?: string; location?: string; legalStatus?: string; hpiText?: string } | null | undefined;
export type RiskView = { suicideRisk?: string; violenceRisk?: string; capacity?: string } | null | undefined;

function toStr(x: unknown): string { return (x ?? "").toString(); }

function locLabel(locRaw?: string): string {
  switch (toStr(locRaw).trim().toLowerCase()) {
    case "ed": return "ED";
    case "inpatient": return "inpatient unit";
    case "opd": return "outpatient clinic";
    case "telehealth": return "telehealth setting";
    default: return "care setting";
  }
}

export function buildHpiSkeleton(demo: Demo, encounter: EncounterView, risk: RiskView): string | null {
  const ageRaw = demo?.age;
  let age = "age-unknown";
  if (ageRaw !== undefined && ageRaw !== null) {
    const n = Number(ageRaw);
    age = Number.isFinite(n) ? String(n) : toStr(ageRaw).trim() || "age-unknown";
  }
  const sex = toStr(demo?.sex).trim() || "patient";
  const locTxt = locLabel(encounter?.location);
  const legalStatus = toStr(encounter?.legalStatus).trim().toLowerCase();
  const legalTxt = legalStatus === "involuntary" ? "under involuntary hold" : (legalStatus === "voluntary" ? "seen voluntarily" : "seen in evaluation");

  let siTxt = "";
  switch (toStr(risk?.suicideRisk)) {
    case "none": siTxt = "denies suicidal ideation"; break;
    case "passive": siTxt = "reports passive SI without plan or intent"; break;
    case "active-noplan": siTxt = "endorses active SI without a specific plan"; break;
    case "active-plan": siTxt = "endorses active SI with a stated plan"; break;
    case "imminent": siTxt = "presents with imminent self-harm risk"; break;
    default: siTxt = "";
  }

  const base = `Pt is a ${age}-year-old ${sex} evaluated in ${locTxt} ${legalTxt}.${siTxt ? ` Patient ${siTxt}.` : ""}`;
  return base.trim() || null;
}

export function buildSafetyStatement(risk: RiskView): string | null {
  let siPart = "";
  switch (toStr(risk?.suicideRisk)) {
    case "none": siPart = "Patient denies suicidal ideation"; break;
    case "passive": siPart = "Patient reports passive SI without plan or intent"; break;
    case "active-noplan": siPart = "Patient endorses active SI without specific plan or intent"; break;
    case "active-plan": siPart = "Patient endorses active SI with stated plan; safety precautions discussed"; break;
    case "imminent": siPart = "Patient is considered imminent self-harm risk"; break;
    default: siPart = "Suicide risk discussed";
  }

  let hiPart = "";
  switch (toStr(risk?.violenceRisk)) {
    case "calm": hiPart = "denies homicidal ideation or intent to harm others"; break;
    case "verbal-agitation": hiPart = "is verbally agitated but denies intent to physically harm others"; break;
    case "threats": hiPart = "has made recent verbal threats toward others"; break;
    case "attempted-assault": hiPart = "recently attempted physical aggression"; break;
    case "weapon-access": hiPart = "has access to weapons and expresses concerning statements"; break;
    default: hiPart = "violence / agitation risk reviewed";
  }

  const body = `${siPart}; ${hiPart}. Will reassess in 24h and maintain safety checks.`;
  return body.trim() || null;
}

export function buildCapacityStatement(risk: RiskView): string | null {
  switch (toStr(risk?.capacity)) {
    case "adequate":
      return "Patient demonstrates capacity to understand current condition, weigh risks/benefits, and communicate an informed safety plan.";
    case "questionable":
      return "Patient's decisional capacity is questionable; understanding of risks/benefits and follow-up needs may be impaired. Ongoing assessment required.";
    case "lacks":
      return "Patient lacks decisional capacity to appreciate risks/benefits or to formulate a safe discharge plan; legal/guardianship or involuntary measures may be required.";
    default:
      return "Capacity and insight were assessed; ability to understand condition and participate in planning was discussed.";
  }
}

export function buildFollowupTasks(encounter: EncounterView, risk: RiskView): Array<{ text: string; category: string; dueHint?: string }> {
  const suggestions: Array<{ text: string; category: string; dueHint?: string }> = [];

  const si = toStr(risk?.suicideRisk);
  if (si === "passive" || si === "active-noplan" || si === "active-plan") {
    suggestions.push({
      text: "Follow up with caregiver within 24h to verify medications are secured / no firearm access.",
      category: "safety",
      dueHint: "24h",
    });
  }

  const vi = toStr(risk?.violenceRisk);
  if (["verbal-agitation", "threats", "attempted-assault", "weapon-access"].includes(vi)) {
    suggestions.push({
      text: "Reassess agitation / HI in 2h and document escalation or de-escalation.",
      category: "monitoring",
      dueHint: "2h",
    });
  }

  if (toStr(encounter?.legalStatus).toLowerCase() === "involuntary") {
    suggestions.push({
      text: "Complete / file involuntary hold documentation per policy.",
      category: "legal",
      dueHint: "now",
    });
  }

  suggestions.push({
    text: "Arrange outpatient follow-up / safety check-in call within 24h post-discharge.",
    category: "followup",
    dueHint: "24h",
  });

  return suggestions;
}
