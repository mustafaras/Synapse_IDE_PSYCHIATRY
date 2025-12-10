const en = {
  help: {
    open: "Open Help",
    title: "Consult — Help",
    clinicianPoint1: "Supports clinical documentation; does not provide treatment directives. Apply professional judgment.",
    clinicianPoint2: "Enable Redaction when handling PHI; independently validate and cite outputs before use.",
    clinicianPoint3: "Adhere to local guidelines and policies; model responses may be incomplete or uncertain.",
    canaryNote: "Note: This feature may be limited to a subset of users during canary rollout.",
    openDeveloper: "Open Developer Guide",
    openPlan: "Open Plan & Guardrails",
    close: "Close"
  },
  tabs: {
    notes: "Notes",
    analytics: "Analytics",
    collaboration: "Collaboration"
  }
} as const;

export type EnMessages = typeof en;
export default en;
