


export type SuicideRiskOption = {
  value: string;
  label: string;
  tooltip: string;
};

export type ViolenceRiskOption = {
  value: string;
  label: string;
  tooltip: string;
};

export type CapacityOption = {
  value: string;
  label: string;
  tooltip: string;
};


export const SUICIDE_RISK_OPTIONS: SuicideRiskOption[] = [
  {
    value: "none",
    label: "No SI",
    tooltip: "Denies suicidal ideation or self-harm intent."
  },
  {
    value: "passive",
    label: "Passive SI",
    tooltip: "Passive wish to be dead / passive SI without plan or intent."
  },
  {
    value: "active-noplan",
    label: "Active SI (no plan)",
    tooltip: "Active suicidal ideation but denies specific plan or immediate intent."
  },
  {
    value: "active-plan",
    label: "Active SI (plan)",
    tooltip: "Has a specific plan but denies imminent attempt at this moment."
  },
  {
    value: "imminent",
    label: "Imminent risk",
    tooltip: "Active SI with plan and intent, or recent attempt / imminent self-harm risk."
  }
];


export const VIOLENCE_RISK_OPTIONS: ViolenceRiskOption[] = [
  {
    value: "calm",
    label: "Calm",
    tooltip: "Calm / cooperative; no threats, no agitation."
  },
  {
    value: "verbal-agitation",
    label: "Agitated verbal",
    tooltip: "Agitated / yelling / verbally escalating but not threatening physical harm."
  },
  {
    value: "threats",
    label: "Threats",
    tooltip: "Verbal threats or intimidation suggesting possible harm to others."
  },
  {
    value: "attempted-assault",
    label: "Attempted assault",
    tooltip: "Recent attempt to strike / grab / harm someone."
  },
  {
    value: "weapon-access",
    label: "Weapon access",
    tooltip: "Access to weapon(s) and concerning statements/behaviors."
  }
];


export const CAPACITY_OPTIONS: CapacityOption[] = [
  {
    value: "adequate",
    label: "Adequate capacity",
    tooltip: "Understands situation, can weigh risks/benefits, communicates a choice."
  },
  {
    value: "questionable",
    label: "Questionable",
    tooltip: "Orientation / judgment impaired; may not fully grasp consequences."
  },
  {
    value: "lacks",
    label: "Lacks capacity",
    tooltip: "Cannot demonstrate understanding of condition or consequences of refusal."
  }
];
