import React from "react";
import styles from "../styles/flows.module.css";
import { GLOBAL_FLOW_BOUNDARY_LINE, GLOBAL_FLOW_SUBTITLE } from "./legalCopy";
import type { FlowId } from "./flowTypes";
import SafetyFlowShell from "./shells/SafetyFlowShell";
import AgitationFlowShell from "./shells/AgitationFlowShell";
import BFCRSShell from "./shells/BFCRSShell";
import LorazepamChallengeShell from "./shells/LorazepamChallengeShell";
import CapacityFlowShell from "./shells/CapacityFlowShell";
import CompletedRunReviewShell from "./shells/CompletedRunReviewShell";
import CatatoniaFlowShell from "./shells/CatatoniaFlowShell";
import ObservationFlowShell from "./shells/ObservationFlowShell";
import ReadOnlyRunView from "./ReadOnlyRunView";
import { useFlowsUIStore } from "./uiStore";
import { useRegistry } from "../registry/state";

type FlowHostProps = {
  activeFlowId: FlowId;
  activeReviewRun?: { encounterId: string; runIndex: number } | null;
};

const FlowHost: React.FC<FlowHostProps> = ({ activeFlowId, activeReviewRun }) => {

  const { currentViewMode, currentFlowId, selectedRunId, activateFlow } = useFlowsUIStore();
  const { state } = useRegistry();

  if (currentViewMode === "runReview" && selectedRunId) {
    const patient = state.selectedPatientId
      ? state.patients.find((p) => p.id === state.selectedPatientId)
      : state.patients[0];
    const enc = patient?.encounters?.find((e) => e.id === state.selectedEncounterId)
      ?? (patient?.encounters ? [...patient.encounters].sort((a, b) => (b.when ?? 0) - (a.when ?? 0))[0] : undefined);
    const run = enc?.completedRuns?.find((r) => (r.runId || `${r.flowId}-${r.insertedAt}`) === selectedRunId);
    if (run) {
      return <ReadOnlyRunView run={run} onBackToFlows={() => activateFlow(currentFlowId ?? "bfcrs")} />;
    }

    return (
      <div className={styles.panel}>
        <div className={styles.flowTitle}>Completed Summary</div>
        <div className={styles.flowSubtitle}>That run could not be found. It may have been cleared from this demo session.</div>
      </div>
    );
  }

  if (currentViewMode === "flowActive" && currentFlowId) {
    switch (currentFlowId as FlowId) {
      case "safety":
        return <SafetyFlowShell />;
      case "agitation":
        return <AgitationFlowShell />;
      case "catatonia":
        return <CatatoniaFlowShell />;
      case "bfcrs":
        return <BFCRSShell />;
      case "lorazepam":
        return <LorazepamChallengeShell />;
      case "capacity":
        return <CapacityFlowShell />;
      case "observation":
        return <ObservationFlowShell />;
      case "observationContainment":
        return <ObservationFlowShell />;
      case "review":
        return <CompletedRunReviewShell reviewTarget={activeReviewRun ?? null} />;
      default:
        break;
    }
  }
  switch (activeFlowId) {
    case "safety":
      return <SafetyFlowShell />;
    case "agitation":
      return <AgitationFlowShell />;
    case "catatonia":
      return <CatatoniaFlowShell />;
    case "bfcrs":
      return <BFCRSShell />;
    case "lorazepam":
      return <LorazepamChallengeShell />;
    case "capacity":
      return <CapacityFlowShell />;
    case "observation":
      return <ObservationFlowShell />;
    case "observationContainment":
      return <ObservationFlowShell />;
    case "review":
      return <CompletedRunReviewShell reviewTarget={activeReviewRun ?? null} />;
    default:
      return (
        <div className={styles.emptyFlowPlaceholder}>
          <div className={styles.emptyFlowTitle}>Select a flow from the left</div>
          <div className={styles.emptyFlowHint}>{GLOBAL_FLOW_SUBTITLE}</div>
          <div className={styles.flowBoundaryLine}>{GLOBAL_FLOW_BOUNDARY_LINE}</div>
        </div>
      );
  }
};

export default FlowHost;
