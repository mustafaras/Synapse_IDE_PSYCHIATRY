import type { NoteSlots } from "./Note";


export function computeExportGaps(input: Pick<NoteSlots, "summary" | "plan">): { missingRisk?: boolean; missingFollow?: boolean } {
  const summary = String(input.summary || "");
  const plan = String(input.plan || "");

  const riskTerms = /(\bsi\b|suicid|\bhi\b|homicid|self[-\s]?harm|safety\s*plan|contract\s*for\s*safety)/i;
  const denialTerms = /(denies|no\s+suicid(?:al)?\s+ideation|no\s+hi|no\s+intent|no\s+plan)/i;
  const protectiveTerms = /(protective\s+factor|support|family|friends|future|goal|religion|faith|pet|reasons?\s+for\s+living)/i;

  const hasRiskSignal = riskTerms.test(summary) || denialTerms.test(summary) || protectiveTerms.test(summary);
  const missingRisk = summary.trim().length > 0 && !hasRiskSignal;

  const followPtn = /((follow\s*-?\s*up|f\/u|return|review)\s*(in|on|at)?\s*(\d+\s*(day|days|wk|wks|week|weeks|mo|mos|month|months)|tomorrow|next\s+(week|month)|\b\d{1,2}\/\d{1,2}\b))/i;
  const missingFollow = plan.trim().length > 0 && !followPtn.test(plan);

  return { missingRisk, missingFollow };
}
