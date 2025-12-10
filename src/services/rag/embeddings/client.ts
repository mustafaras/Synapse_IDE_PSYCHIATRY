import type { EmbeddingModel } from '../types';

export type Embedder = {
  embed(texts: string[], model: EmbeddingModel, signal?: AbortSignal): Promise<number[][]>;
  dim(model: EmbeddingModel): number;
};

export const embeddingClient: Embedder = {
  async embed(texts, model, signal) {
    switch (model.provider) {
      case 'openai':
        return callOpenAI(texts, model, signal);
  case 'gemini':
        return callGoogle(texts, model, signal);
      case 'anthropic':
        return callAnthropicProxy(texts, model, signal);
      case 'ollama':
        return callOllama(texts, model, signal);
      default:
        return texts.map(() => new Array((model as any).dim ?? 0).fill(0));
    }
  },
  dim(model) { return model.dim; },
};

async function callOpenAI(_texts: string[], _model: EmbeddingModel, _signal?: AbortSignal): Promise<number[][]> {

  return _texts.map(() => []);
}
async function callGoogle(_texts: string[], _model: EmbeddingModel, _signal?: AbortSignal): Promise<number[][]> {
  return _texts.map(() => []);
}
async function callAnthropicProxy(_texts: string[], _model: EmbeddingModel, _signal?: AbortSignal): Promise<number[][]> {
  return _texts.map(() => []);
}
async function callOllama(texts: string[], model: EmbeddingModel, _signal?: AbortSignal): Promise<number[][]> {

  const base = (typeof window !== 'undefined') ? '/ollama' : 'http://localhost:11434';
  try {
    const init: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: (model as any).name, input: texts }),
      ...( _signal ? { signal: _signal as any } : {} ),
    };
    const resp = await fetch(`${base}/api/embeddings`, init);
    if (!resp.ok) throw new Error(`Ollama embeddings HTTP ${resp.status}`);
    const json = await resp.json();

    const arr: number[][] = json.embeddings ?? (json.embedding ? [json.embedding] : []);
    return arr as number[][];
  } catch {
    return texts.map(() => []);
  }
}
