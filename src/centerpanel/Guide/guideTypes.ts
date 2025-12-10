

export type GuideCategory =
  | "Catatonia"
  | "Lithium TDM"
  | "Antidepressant Switch"
  | "Acute Agitation"
  | "Clozapine ANC"
  | "Peripartum Psych";

export type GuideSectionKey =
  | "abstract"
  | "criteria"
  | "redFlags"
  | "monitoring"
  | "docPhrases"
  | "references"
  | "differential"
  | "riskStrat"
  | "communication"
  | "coordination"
  | "followUp"
  | "tools"

  | "risk"
  | "escalation";

export type EvidenceGrade = "A" | "B" | "C" | "D";

export type Citation = {
  key: string;
  title?: string;
  journal?: string;
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
};

export type ReferenceBlock = {
  evidence?: EvidenceGrade;
  citations?: Citation[];
};

export interface MicroGuide {
  id: string;
  title: string;
  category: GuideCategory;
  updated: string;
  abstract: string;
  criteria: string;
  redFlags: string;
  monitoring: string;
  docPhrases: string;
  references: string;

  differential?: string;
  riskStrat?: string;
  risk?: string;
  communication?: string;
  coordination?: string;
  followUp?: string;
  tools?: string;

  meta?: Partial<Record<GuideSectionKey, ReferenceBlock>>;

  slotMap?: Partial<Record<GuideSectionKey, "summary" | "plan" | "vitals" | "refs">>;
  tags?: string[];
  reviewedBy?: string[];
  version?: string;
}
