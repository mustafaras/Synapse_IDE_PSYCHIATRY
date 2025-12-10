import { getModel } from '@/utils/ai/models/registry';

export interface BudgetPlan {
  modelId: string;
  contextWindow: number;
  inputTokens: number;
  reservedOutput: number;
  total: number;
  willOverflow: boolean;
  clampOutputTo?: number | undefined;
}

export function makeBudgetPlan(args: {
  modelId: string;
  contextWindow: number;
  inputTokens: number;
  desiredOutput?: number;
}): BudgetPlan {
  const { modelId, contextWindow, inputTokens, desiredOutput } = args;
  const reservedOutput = Math.max(0, Math.floor(desiredOutput ?? Math.ceil(inputTokens * 0.5)));
  const total = inputTokens + reservedOutput;
  const willOverflow = total > contextWindow;
  let clampOutputTo: number | undefined;
  if (willOverflow) {
    const safe = Math.max(128, contextWindow - inputTokens - 32);
    clampOutputTo = Math.max(0, safe);
  }
  return { modelId, contextWindow, inputTokens, reservedOutput, total, willOverflow, clampOutputTo } as BudgetPlan;
}

export function getModelContextWindow(modelId: string): number {
  const m = getModel(modelId);
  return m?.capTokens ?? 32000;
}
