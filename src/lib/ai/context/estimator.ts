



import { estimateTokensApprox as approx, estimateForModel as existingEstimateForModel } from '@/utils/ai/tokenize';

export function estimateTokens(text: string): number {
  try {
    return approx(text || '');
  } catch {
    return Math.ceil((text || '').length / 4);
  }
}

export function estimateTokensForParts(parts: { text?: string; code?: string }[]): number {
  try {
    const joined = (parts || [])
      .map((p) => (p.text ?? '') + (p.code ? `\n${p.code}` : ''))
      .join('\n');
    return estimateTokens(joined);
  } catch {
    return 0;
  }
}

export async function estimatePromptAndCompletion(model: string, inputs: { system?: string; messages: { role: string; content: string }[]; maxOutput?: number }) {
  try {

    return await existingEstimateForModel(model, inputs as any);
  } catch {
    const promptText = `${inputs.system ?? ''}\n${  inputs.messages.map((m) => m.content).join('\n')}`;
    const prompt = estimateTokens(promptText);
    const completion = inputs.maxOutput ?? Math.ceil(prompt * 0.5);
    return { prompt, completion, total: prompt + completion };
  }
}
