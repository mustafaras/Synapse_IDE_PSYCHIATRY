export interface CapacityFormState {

  decisionContext: string;


  understandingLevel: "adequate" | "partial" | "inaccurate" | "unable" | "not_assessed";
  understandingVerbatim: string;


  appreciationLevel: "acknowledges_risks_benefits" | "minimizes_or_denies_personal_relevance" | "distorted_by_delusion" | "not_assessed";
  appreciationVerbatim: string;


  reasoningLevel: "can_compare_options_coherently" | "somewhat_linear_but_limited" | "severely_impacted_by_thought_disorder" | "not_assessed";
  reasoningEvidence: string;


  expressedChoice: string;
  choiceStability: "consistent_and_clear" | "fluctuating_or_ambivalent" | "unable_to_state_choice" | "not_assessed";
  choiceNotes: string;


  clinicianCapacityImpression: string;
  followupPlan: string;
}

export const defaultCapacityFormState: CapacityFormState = {
  decisionContext: "",
  understandingLevel: "not_assessed",
  understandingVerbatim: "",
  appreciationLevel: "not_assessed",
  appreciationVerbatim: "",
  reasoningLevel: "not_assessed",
  reasoningEvidence: "",
  expressedChoice: "",
  choiceStability: "not_assessed",
  choiceNotes: "",
  clinicianCapacityImpression: "",
  followupPlan: "",
};
