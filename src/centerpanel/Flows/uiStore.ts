import { create } from "zustand";

export type ViewMode = "flowActive" | "runReview";

interface FlowsUIState {
  currentViewMode: ViewMode;
  currentFlowId: string | null;
  selectedRunId: string | null;
  activateFlow: (flowId: string) => void;
  reviewRun: (runId: string) => void;
  reset: () => void;
}

export const useFlowsUIStore = create<FlowsUIState>((set) => ({
  currentViewMode: "flowActive",
  currentFlowId: null,
  selectedRunId: null,
  activateFlow: (flowId) =>
    set({ currentViewMode: "flowActive", currentFlowId: flowId, selectedRunId: null }),
  reviewRun: (runId) =>
    set({ currentViewMode: "runReview", currentFlowId: null, selectedRunId: runId }),
  reset: () => set({ currentViewMode: "flowActive", currentFlowId: null, selectedRunId: null }),
}));
