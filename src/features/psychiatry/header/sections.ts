export type Section = { id: string; label: string };

export const SECTIONS: Section[] = [
  { id: "intake_hpi", label: "Intake & HPI" },
  { id: "assessment", label: "Assessment & Initial Encounter" },
  { id: "risk", label: "Risk, Safety & Acute Triage" },
  { id: "diagnosis", label: "Diagnosis & Formulation" },
  { id: "treatment", label: "Treatment Planning & Interventions" },
  { id: "followup", label: "Follow-up & Documentation" },
  { id: "education", label: "Education, Consent & Handouts" },
  { id: "special", label: "Special Populations & Liaison" },
];
