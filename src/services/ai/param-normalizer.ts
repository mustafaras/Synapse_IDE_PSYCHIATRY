export type NormalizedParams = {
  model: string;
  system?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutput?: number;
  stop?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;
  jsonMode?: boolean;
};

export function clampParams(p: NormalizedParams): NormalizedParams {
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  const out: any = { ...p };
  if (p.temperature != null) out.temperature = clamp(p.temperature, 0, 2); else delete out.temperature;
  if (p.topP != null) out.topP = clamp(p.topP, 0, 1); else delete out.topP;
  if (p.topK != null) out.topK = Math.max(1, Math.floor(p.topK)); else delete out.topK;
  if (p.maxOutput != null) out.maxOutput = Math.max(1, Math.floor(p.maxOutput)); else delete out.maxOutput;
  return out as NormalizedParams;
}

export function toOpenAI(p: NormalizedParams) {
  const body: any = {
    model: p.model,
    messages: p.messages,
    temperature: p.temperature,
    top_p: p.topP,
    max_tokens: p.maxOutput,
    frequency_penalty: p.frequencyPenalty,
    presence_penalty: p.presencePenalty,
    stream: true,
  };
  if (p.jsonMode) body.response_format = { type: 'json_object' };
  return body;
}

export function toAnthropic(p: NormalizedParams) {
  return {
    model: p.model,
    system: p.system,
    messages: p.messages.filter((m) => m.role !== 'system'),
    temperature: p.temperature,
    top_p: p.topP,
    top_k: p.topK,
    max_output_tokens: p.maxOutput,
    stop_sequences: p.stop,
    stream: true,
  };
}

export function toGoogle(p: NormalizedParams) {
  return {
    contents: p.messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    systemInstruction: p.system ? { role: 'system', parts: [{ text: p.system }] } : undefined,
    generationConfig: {
      temperature: p.temperature,
      topP: p.topP,
      topK: p.topK,
      maxOutputTokens: p.maxOutput,
      stopSequences: p.stop,
      responseMimeType: p.jsonMode ? 'application/json' : 'text/plain',
    },
  };
}

export function toOllama(p: NormalizedParams) {
  const prompt = [
    p.system ? `System:\n${p.system}\n` : '',
    ...p.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`),
  ].join('\n');
  return {
    model: p.model,
    prompt,
    stream: true,
    options: {
      temperature: p.temperature,
      top_p: p.topP,
      top_k: p.topK,
      num_predict: p.maxOutput,
      stop: p.stop,
    },
  };
}
