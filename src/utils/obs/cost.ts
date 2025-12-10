type Pricing = {
  currency: 'USD';
  prompt: number | null;
  completion: number | null;
};

export const COST_REGISTRY: Record<string, Pricing> = {


};

export function estimateCost(provider: string | undefined, model: string | undefined, usage?: { prompt: number; completion: number }) {
  if (!provider || !model || !usage) return undefined;
  const key = `${provider}:${model}`;
  const p = COST_REGISTRY[key];
  if (!p || p.prompt == null || p.completion == null) return undefined;
  const promptCost = (usage.prompt / 1000) * p.prompt;
  const completionCost = (usage.completion / 1000) * p.completion;
  const total = promptCost + completionCost;
  return {
    currency: 'USD' as const,
    prompt: +promptCost.toFixed(6),
    completion: +completionCost.toFixed(6),
    total: +total.toFixed(6),
  };
}
