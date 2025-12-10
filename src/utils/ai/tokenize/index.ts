export type TokenEstimate = { prompt: number; completion: number; total: number };

export function estimateTokensApprox(text: string): number {
  return Math.ceil((text || '').length / 4);
}

export async function estimateForModel(
  _model: string,
  inputs: { system?: string; messages: { role: string; content: string }[]; maxOutput?: number }
): Promise<TokenEstimate> {
  const promptText = `${inputs.system ?? ''}\n${  inputs.messages.map((m) => m.content).join('\n')}`;
  const prompt = estimateTokensApprox(promptText);
  const completion = inputs.maxOutput ?? Math.ceil(prompt * 0.5);
  return { prompt, completion, total: prompt + completion };
}
