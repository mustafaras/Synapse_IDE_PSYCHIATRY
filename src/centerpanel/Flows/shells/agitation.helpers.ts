



export type AgitationOutcomeInput = {
  observedBehavior?: string;
  medicalContribs?: string;
  deescalationTechniques?: string;
  responseToDeescalation?: string;
  escalationJustification?: string;
  monitoringPlan?: string;
  outcomeSummary?: string;
};

export function buildAgitationOutcomeParagraph(state: AgitationOutcomeInput): string {
  const ts = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  const timestamp = `${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())} ${pad(ts.getHours())}:${pad(ts.getMinutes())}`;

  const behavior = (state.observedBehavior || "").trim();
  const med = (state.medicalContribs || "").trim();
  const deesc = (state.deescalationTechniques || "").trim();
  const resp = (state.responseToDeescalation || "").trim();
  const just = (state.escalationJustification || "").trim();
  const outcome = [state.outcomeSummary, state.monitoringPlan].filter(Boolean).join(" ").trim();

  return (
    `Behavioral emergency / agitation response was documented this encounter. ` +
    `Patient presented with ${behavior || "[not recorded]"}. ` +
    `Medical contributors considered included ${med || "[not recorded]"}. ` +
    `Non-pharmacological de-escalation strategies were attempted, including ${deesc || "[not recorded]"}, ` +
    `with observed response ${resp || "[not recorded]"}. ` +
    `Escalation, if any, was based on imminent safety concerns ${just || "[not recorded]"} and accompanied by ongoing monitoring. ` +
    `Current status / monitoring plan: ${outcome || "[not recorded]"}. ` +
    `This documentation supports clinical communication and safety monitoring and does not constitute seclusion / restraint authorization or standing medication directives. ` +
    `Recorded ${timestamp}.`
  );
}
