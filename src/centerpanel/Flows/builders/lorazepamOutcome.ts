import type { LorazepamFormState } from "../types/LorazepamFormState";

function tsLocal(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())} (local)`;
}

export function buildLorazepamOutcome(form: LorazepamFormState, insertedAtMs: number): string {
  const ts = tsLocal(insertedAtMs);

  const indication = (form.indicationContext || "").trim() || "[not recorded]";
  const preMental = (form.preDoseMentalStatus || "").trim() || "[not recorded]";
  const preMotor = (form.preDoseMotorFindings || "").trim() || "[not recorded]";
  const preVitals = (form.preDoseVitalsAirway || "").trim() || "[not recorded]";
  const dose = (form.lorazepamDetails || "").trim() || "[not recorded]";
  const immediate = (form.immediateResponse || "").trim() || "[not recorded]";
  const safety = (form.safetyObservations || "").trim() || "[not recorded]";
  const follow = (form.followupMonitoringPlan || "").trim() || "[not recorded]";
  const reasses = (form.reassessmentNeeds || "").trim() || "[not recorded]";

  const paragraph = [
    `A lorazepam challenge was documented this encounter in the context of suspected catatonia, with indication described as ${indication}.`,
    `Pre-dose baseline status was recorded as ${preMental} with motor findings ${preMotor} and pre-dose vitals / airway / autonomic status ${preVitals}.`,
    `The treating clinician communicated administration details as ${dose}.`,
    `Immediate observed response included ${immediate}, and immediate safety / airway / vital sign observations were ${safety}.`,
    `Follow-up monitoring / reassessment plan was documented as ${follow}, including escalation considerations ${reasses} and notification / handoff to appropriate clinical staff.`,
    `This documentation supports clinical communication, diagnostic clarification of suspected catatonia, and safety monitoring after a lorazepam challenge. It does not, by itself, authorize ongoing medication administration, chemical restraint, seclusion, restraint, or legal custody / hold status, and it does not replace local policy, supervising clinician oversight, or urgent escalation for airway compromise or autonomic instability. Recorded ${ts}.`
  ].join(" ");

  return paragraph;
}
