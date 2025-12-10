export interface CatatoniaFormState {

  observedFeatures: {
    mutism: boolean;
    stuporOrImmobility: boolean;
    posturingOrCatalepsy: boolean;
    rigidity: boolean;
    negativism: boolean;
    echolaliaOrEchopraxia: boolean;
    waxyFlexibility: boolean;
    staringFixed: boolean;
    withdrawalRefusalToEatDrink: boolean;
    autonomicInstability: boolean;
  };
  observedNarrative: string;


  medicalDifferential: string;
  hydrationNutritionStatus: string;
  vitalsAndAutonomic: string;


  bfcrsSeverityLevel: string;

  functionalImpact: string;

  riskFactors: string;


  monitoringPlan: string;

  handoffCommunication: string;

}
