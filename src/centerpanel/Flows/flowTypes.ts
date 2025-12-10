

export type FlowId =
  | "safety"
  | "agitation"
  | "catatonia"
  | "bfcrs"
  | "lorazepam"
  | "capacity"
  | "observation"
  | "observationContainment"

  | "review";


export type StepPill = {
  key: string;
  label: string;
};
