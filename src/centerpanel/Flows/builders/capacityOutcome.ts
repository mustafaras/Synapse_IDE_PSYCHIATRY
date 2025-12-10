import type { CapacityFormState } from "../types/CapacityFormState";
import { formatLocalTimestamp } from "../time/format";

function mapUnderstanding(level: CapacityFormState["understandingLevel"]): string {
  switch (level) {
    case "adequate":
      return "clinically assessed as adequate";
    case "partial":
      return "clinically assessed as partial / limited";
    case "inaccurate":
      return "clinically assessed as inaccurate";
    case "unable":
      return "patient unable or declined to describe";
    case "not_assessed":
    default:
      return "not assessed during this encounter";
  }
}

function mapAppreciation(level: CapacityFormState["appreciationLevel"]): string {
  switch (level) {
    case "acknowledges_risks_benefits":
      return "clinically assessed as acknowledging personal risk/benefit";
    case "minimizes_or_denies_personal_relevance":
      return "clinically assessed as minimizing or denying personal relevance of risk";
    case "distorted_by_delusion":
      return "clinically assessed as distorted by delusional belief / severe confusion";
    case "not_assessed":
    default:
      return "not assessed during this encounter";
  }
}

function mapReasoning(level: CapacityFormState["reasoningLevel"]): string {
  switch (level) {
    case "can_compare_options_coherently":
      return "clinically assessed as coherent comparison of options";
    case "somewhat_linear_but_limited":
      return "clinically assessed as somewhat linear but limited";
    case "severely_impacted_by_thought_disorder":
      return "clinically assessed as severely impacted by disorganized thought / psychosis / intoxication";
    case "not_assessed":
    default:
      return "not assessed during this encounter";
  }
}

function mapChoiceStability(level: CapacityFormState["choiceStability"]): string {
  switch (level) {
    case "consistent_and_clear":
      return "clinically assessed as consistent and clearly communicated";
    case "fluctuating_or_ambivalent":
      return "clinically assessed as fluctuating / ambivalent";
    case "unable_to_state_choice":
      return "clinically assessed as unable to communicate a stable choice";
    case "not_assessed":
    default:
      return "not assessed during this encounter";
  }
}

function quoteIf(text: string): string {
  const t = (text || "").trim();
  if (!t) return "[not recorded]";

  const hasLeadingQuote = t.startsWith("\"") || t.startsWith("‘") || t.startsWith("“");
  const hasTrailingQuote = t.endsWith("\"") || t.endsWith("’") || t.endsWith("”");
  return hasLeadingQuote && hasTrailingQuote ? t : `"${t}"`;
}

export function buildCapacityOutcome(form: CapacityFormState, insertedAtMs: number): string {
  const ts = formatLocalTimestamp(insertedAtMs);

  const decisionContext = (form.decisionContext || "").trim() || "[not recorded]";

  const understandingLevel = mapUnderstanding(form.understandingLevel);
  const understandingVerbatim = quoteIf(form.understandingVerbatim);

  const appreciationLevel = mapAppreciation(form.appreciationLevel);
  const appreciationVerbatim = quoteIf(form.appreciationVerbatim);

  const reasoningLevel = mapReasoning(form.reasoningLevel);
  const reasoningEvidence = quoteIf(form.reasoningEvidence);

  const expressedChoice = quoteIf(form.expressedChoice);
  const choiceStability = mapChoiceStability(form.choiceStability);
  const choiceNotes = (form.choiceNotes || "").trim() || "[not recorded]";

  const clinicianCapacityImpression = (form.clinicianCapacityImpression || "").trim() || "[not recorded]";
  const followupPlan = (form.followupPlan || "").trim() || "[not recorded]";


  const parts: string[] = [];
  parts.push(
    `A decision-specific capacity & consent assessment was discussed this encounter regarding ${decisionContext}.`
  );
  parts.push(
    `Understanding: Patient’s ability to describe the clinical situation and recommended care was documented as ${understandingLevel}, with statements including ${understandingVerbatim}.`
  );
  parts.push(
    `Appreciation: Patient’s ability to acknowledge personal risks / benefits and likely consequences of accepting or refusing care was documented as ${appreciationLevel}, with statements including ${appreciationVerbatim}.`
  );
  parts.push(
    `Reasoning: Patient’s ability to compare options and provide a coherent rationale was documented as ${reasoningLevel}, supported by ${reasoningEvidence}.`
  );
  parts.push(
    `Choice / Consistency: Patient’s expressed decision was recorded as ${expressedChoice}, and the stability/clarity of that choice was documented as ${choiceStability}, with additional notes ${choiceNotes}.`
  );
  parts.push(`Clinical impression: ${clinicianCapacityImpression}.`);
  parts.push(`Follow-up / supervision plan: ${followupPlan}.`);
  parts.push(
    `This note supports clinical communication and handoff regarding decision-specific capacity elements. It is not, by itself, a legal adjudication of capacity, an involuntary treatment authorization, a custody / hold order, or a substitute for local policy, supervising clinician review, or formal legal processes. Recorded ${ts}.`
  );

  return parts.join("\n");
}
