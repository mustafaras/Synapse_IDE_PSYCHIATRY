export type RiskLevel = 1 | 2 | 3 | 4 | 5;
export type Tag =
  | "SUD"
  | "Bipolar"
  | "FEP"
  | "Elderly"
  | "PostPartum"
  | "Trauma"
  | "Anxiety"
  | "Depression"
  | "Custom";

export type AssessmentKind = "PHQ9" | "GAD7" | "BFCRS";

export interface Assessment {
  id: string;
  kind: AssessmentKind;
  when: number;
  score: number;
}

export interface Task {
  id: string;
  label: string;
  createdAt: number;
  due?: number;
  done?: boolean;
}

export interface EncounterSlots {
  summary?: string;
  plan?: string;
  refs?: string;
  outcome?: string;
  vitals?: string;

  outcomes?: Array<{
    flowId: string;
    insertedAt: number;
    paragraph: string;
  }>;

  refsList?: string[];
}


export interface CompletedRun {

  runId?: string;
  flowId: string;
  label: string;
  insertedAt: number;

  paragraph: string;

  paragraphPreview?: string;

  paragraphFull?: string;
}

export interface Encounter {
  id: string;
  when: number;
  location?: "ED" | "Inpatient" | "OPD";
  noteSlots: EncounterSlots;

  sessionMsTotal?: number;

  flags?: {

    seclusionLikeContainment?: boolean;
    continuousOneToOne?: boolean;

    behavioralContainmentActive?: boolean;
    constantObservationActive?: boolean;
    secureRoomInUse?: boolean;
    violentSelfHarmAttempt?: boolean;
    violentAssaultAttempt?: boolean;

    recentSelfHarmDisclosure?: boolean;
    safetyConcernsRaised?: boolean;
    agitationEpisodeActive?: boolean;
    securityInvolved?: boolean;
    deescalationAttemptsMade?: boolean;
    catatoniaObserved?: boolean;
    lorazepamChallengeDiscussed?: boolean;
    refusalOfRecommendedCare?: boolean;
    attemptingToLeaveAMA?: boolean;
    questionableCapacityForDecision?: boolean;
    highMedicalRiskIfRefuses?: boolean;
  };

  completedFlows?: string[];

  completedRuns?: CompletedRun[];

  snapshots?: Array<{ id: string; when: number; slots: EncounterSlots }>;
}

export interface Patient {
  id: string;
  name?: string;
  age?: number;
  sex?: "F" | "M" | "X";
  risk: RiskLevel;

  grade?: number;
  phq9Score?: number;
  phq9Delta?: number;
  bfcrsScoreCurrent?: number;
  tags: Tag[];
  assessments: Assessment[];
  encounters: Encounter[];
  tasks?: Task[];
}

export interface Filter {
  cohorts: Array<"All" | "Inpatients" | "Outpatients" | "Today" | "Mine">;
  risk?: RiskLevel[];
  tags?: Tag[];
  status?: { overdue?: boolean; activeFlow?: boolean; newResults?: boolean };
  search?: string;
}

export interface RegistryState {
  patients: Patient[];
  selectedPatientId?: string;
  selectedEncounterId?: string;
  filter: Filter;

  version: 1;
}


export interface ScoreDelta {
  kind: AssessmentKind;
  latest?: number;
  previous?: number;
  delta?: number;
}
