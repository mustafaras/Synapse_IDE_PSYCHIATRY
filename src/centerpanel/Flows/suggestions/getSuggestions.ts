import type { Encounter, Patient } from "../../registry/types";
import type { FlowId } from "../flowTypes";

export interface FlowSuggestion {
  flowId: FlowId;
  priority: number;
  titleLine: string;
  explainerLine: string;
  reasonCode?: string;
}

function latestScore(patient: Patient | undefined, kind: "PHQ9" | "GAD7" | "BFCRS"): number | undefined {
  if (!patient || !Array.isArray(patient.assessments)) return undefined;
  const arr = patient.assessments
    .filter((a) => a && a.kind === kind)
    .sort((a, b) => (b.when ?? 0) - (a.when ?? 0));
  return arr[0]?.score;
}


export function getSuggestions(patient?: Patient, encounter?: Encounter): FlowSuggestion[] {
  const out: FlowSuggestion[] = [];
  const flags = encounter?.flags || {};
  const completed = new Set<string>(Array.isArray(encounter?.completedFlows) ? (encounter!.completedFlows as string[]) : []);


  const phq9 = typeof patient?.phq9Score === "number" ? patient!.phq9Score : latestScore(patient, "PHQ9");
  const grade = typeof patient?.grade === "number" ? patient!.grade : (typeof patient?.risk === "number" ? patient!.risk : undefined);
  const bfcrs = typeof patient?.bfcrsScoreCurrent === "number" ? patient!.bfcrsScoreCurrent : latestScore(patient, "BFCRS");


  const push = (s: FlowSuggestion) => { out.push(s); };


  const safetyTrigger = (
    (typeof phq9 === "number" && phq9 >= 20) ||
    (typeof grade === "number" && grade >= 4) ||
    flags.recentSelfHarmDisclosure === true ||
    flags.safetyConcernsRaised === true
  );
  const safetyCooldownAllows = (
    !completed.has("safety") || flags.recentSelfHarmDisclosure === true || flags.safetyConcernsRaised === true
  );
  if (safetyTrigger && safetyCooldownAllows) {
    push({
      flowId: "safety",
      priority: 1,
      titleLine: "Consider Acute Safety / Suicide Risk Review",
      explainerLine:
        "High depressive burden and recent escalation → document current self-harm / safety status.",
      reasonCode: "HIGH_SELF_HARM_CONCERN",
    });
  }


  const agitationEvent = (
    flags.agitationEpisodeActive === true ||
    flags.securityInvolved === true ||
    flags.deescalationAttemptsMade === true
  );
  const agitationCooldownAllows = (!completed.has("agitation") || agitationEvent);
  if (agitationEvent && agitationCooldownAllows) {
    push({
      flowId: "agitation",
      priority: 2,
      titleLine: "Consider Agitation / Behavioral Emergency",
      explainerLine:
        "Marked agitation noted → document observed behavior, de-escalation efforts, and safety-based escalation rationale.",
      reasonCode: "AGITATION_EVENT",
    });
  }


  const catatoniaSignal = (
    (typeof bfcrs === "number" && bfcrs >= 8) ||
    flags.catatoniaObserved === true ||
    flags.lorazepamChallengeDiscussed === true
  );
  if (catatoniaSignal) {

    if (flags.lorazepamChallengeDiscussed === true && !completed.has("lorazepam")) {
      push({
        flowId: "lorazepam",
        priority: 3,
        titleLine: "Consider Lorazepam Challenge",
        explainerLine:
          "Catatonia workup underway → document pre-dose baseline, lorazepam dose/route/time as communicated by the treating clinician, observed response, and airway / vital sign monitoring.",
        reasonCode: "LORAZEPAM_CHALLENGE_IN_PROGRESS",
      });
    }
    if (!completed.has("catatonia")) {
      push({
        flowId: "catatonia",
        priority: 3,
        titleLine: "Consider Catatonia / BFCRS Documentation",
        explainerLine:
          "Catatonia features observed → document BFCRS-style findings, autonomic stability, and monitoring / handoff.",
        reasonCode: (typeof bfcrs === "number" && bfcrs >= 8) ? "BFCRS_HIGH" : "CATATONIA_FEATURES",
      });
    }
  }


  const capacityTrigger = (
    flags.refusalOfRecommendedCare === true ||
    flags.attemptingToLeaveAMA === true ||
    flags.questionableCapacityForDecision === true ||
    flags.highMedicalRiskIfRefuses === true
  );
  const capacityCooldownAllows = (!completed.has("capacity") || flags.questionableCapacityForDecision === true);
  if (capacityTrigger && capacityCooldownAllows) {
    push({
      flowId: "capacity",
      priority: 4,
      titleLine: "Consider Capacity & Consent Check",
      explainerLine:
        "Patient is declining recommended care with possible high risk → document understanding, appreciation, reasoning, and expressed choice.",
      reasonCode: "CAPACITY_CONCERN",
    });
  }


  const observationSignal = (
    flags.behavioralContainmentActive === true ||
    flags.constantObservationActive === true ||
    flags.secureRoomInUse === true ||
    flags.seclusionLikeContainment === true ||
    flags.continuousOneToOne === true
  );
  if (observationSignal && !completed.has("observation")) {
    push({
      flowId: "observation",
      priority: 2,
      titleLine: "Consider Observation / Containment Justification",
      explainerLine:
        "Containment-level observation in effect → document objective behavior, least-restrictive attempts, safety-based rationale, and monitoring / step-down plan.",
      reasonCode: "OBSERVATION_CONTAINMENT_ACTIVE",
    });
  }


  return out.sort((a, b) => (a.priority - b.priority));
}
