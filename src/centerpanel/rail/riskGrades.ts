import type { RiskLevel } from "../registry/types";

export type RiskGradeInfo = {
  uiLabel: string;
  colorClass: string;
  tooltip: string;
};

export function getRiskGradeInfo(grade?: RiskLevel | null): RiskGradeInfo {
  switch (grade) {
    case 1:
      return {
        uiLabel: "G1 • Low",
        colorClass: "riskLow",
        tooltip: "Low observed acute risk; routine monitoring.",
      };
    case 2:
      return {
        uiLabel: "G2 • Low",
        colorClass: "riskLow",
        tooltip: "Mild concern, but no active SI/HI or severe agitation.",
      };
    case 3:
      return {
        uiLabel: "G3 • Moderate",
        colorClass: "riskMod",
        tooltip: "Moderate concern; notable symptoms or situational stressors.",
      };
    case 4:
      return {
        uiLabel: "G4 • High",
        colorClass: "riskHigh",
        tooltip: "High acute concern; may need close observation / urgent plan.",
      };
    case 5:
      return {
        uiLabel: "G5 • Critical",
        colorClass: "riskCritical",
        tooltip: "Imminent danger to self/others; emergency management required.",
      };
    default:
      return {
        uiLabel: "No grade",
        colorClass: "riskNone",
        tooltip: "No risk grade selected.",
      };
  }
}


export function getRiskGradeDisplay(grade?: RiskLevel | null) {
  const { uiLabel, colorClass } = getRiskGradeInfo(grade);
  return { label: uiLabel, colorClass };
}
