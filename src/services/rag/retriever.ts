import type { Result, SearchFilters } from './types';
import { HybridIndex } from './index';
import { getAdapter } from '@/services/ai/adapters/index';

export async function retrieve(idx: HybridIndex, query: string, k = 8, filters?: SearchFilters, rerank?: { provider: 'openai' | 'anthropic' | 'gemini'; model: string }): Promise<Result[]> {
  const base = idx.search(query, Math.max(16, k * 2), filters);
  if (!rerank) return base.slice(0, k);
  try {
    const adapter = getAdapter(rerank.provider as any);
    const prompt = [
      'Score the relevance of each snippet to the query from 0 to 1.',
      `Query: ${query}`,
      ...base.map((r, i) => `#${i + 1} (${r.chunk.path}:${r.chunk.fromLine}-${r.chunk.toLine})\n${r.chunk.text.slice(0, 800)}`),
    ].join('\n\n');
  const { text } = await adapter.complete({ options: { model: rerank.model } as any, messages: [{ role: 'user', content: prompt } as any], timeoutMs: 8000 });
    const scores = parseScores(text || '');
    const ranked = base.map((r, i) => ({ r, s: scores[i] ?? r.score }));
    ranked.sort((a, b) => b.s - a.s);
    return ranked.slice(0, k).map(x => x.r);
  } catch {
    return base.slice(0, k);
  }
}

function parseScores(t: string) {
  const m = [...t.matchAll(/(\d+)\)\s*(0\.\d+|1(?:\.0+)?)/g)].map(x => ({ i: parseInt(x[1] || '0', 10) - 1, s: parseFloat(x[2] || '0') }));
  const arr: number[] = [];
  m.forEach(o => arr[o.i] = o.s);
  return arr;
}
