export interface AgitationFormState {

  objectiveBehavior: string;
  injuryRiskProfile: "" | "verbal_only" | "attempted_self_harm" | "attempted_assault" | "property_damage" | "not_assessed";
  medicalContributorsConsidered: string;


  deescalationTechniques: {
    verbalDeescalation: boolean;
    calmEnvironment: boolean;
    reducedStimuli: boolean;
    offeredSupportivePresence: boolean;
    offeredNeedsFoodDrinkToileting: boolean;
    setClearRespectfulLimits: boolean;
    otherEnvironmental: boolean;
  };
  deescalationNarrative: string;
  responseToDeescalation: "" | "calmed" | "partially_calmed" | "no_effect" | "escalated";


  escalationTypeDiscussed: "" | "verbal_limits_only" | "prn_med_offer" | "emergency_med_administered" | "physical_hold_or_containment" | "not_applicable";
  leastRestrictiveSummary: string;
  escalationRationale: string;


  postInterventionStatus: string;
  reassessmentPlan: string;
  staffNotified: string;
}
