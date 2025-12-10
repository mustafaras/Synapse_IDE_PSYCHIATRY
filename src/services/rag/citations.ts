import type { Result } from './types';

export type Citation = { marker: string; path: string; from: number; to: number };

export function cite(results: Result[]): { textSuffix: string; citations: Citation[] } {
  const cs = results.slice(0, Math.min(8, results.length)).map((r) => ({
    marker: `[${r.chunk.path}:${r.chunk.fromLine}-${r.chunk.toLine}]`,
    path: r.chunk.path,
    from: r.chunk.fromLine,
    to: r.chunk.toLine,
  }));
  return { textSuffix: cs.length ? (`\n\n${  cs.map(c => c.marker).join(' ')}`) : '', citations: cs };
}
