import type { Chunk, EmbeddingModel, IndexStats, Result, SearchFilters } from './types';
import { createCache } from './embeddings/cache';
import { embeddingClient } from './embeddings/client';

type VectorRow = { id: string; path: string; from: number; to: number; lang: string; vec: Float32Array; norm: number; text: string; bm25Tokens: number };
type LexRow = { id: string; tokens: Map<string, number> };

export class HybridIndex {
  private lex = new Map<string, LexRow>();
  private docs = new Map<string, VectorRow>();
  private idf = new Map<string, number>();
  private cache = createCache();
  private model!: EmbeddingModel;

  async init(model: EmbeddingModel) { this.model = model; }

  async add(chunks: Chunk[]) {
    for (const c of chunks) {
      const terms = tokenize(c.text);
      this.lex.set(c.id, { id: c.id, tokens: terms });
      this.docs.set(c.id, { id: c.id, path: c.path, from: c.fromLine, to: c.toLine, lang: c.lang, vec: new Float32Array(0), norm: 1, text: c.text, bm25Tokens: sumVals(terms) });
    }
    rebuildIdf(this.lex, this.idf);
    const keys = chunks.map(c => ({ hash: c.hash, provider: this.model.provider, name: (this.model as any).name, dim: (this.model as any).dim }));
    const cached = await this.cache.get(keys);
    const needIdx = cached.map((v, i) => v ? -1 : i).filter(i => i >= 0);
    let vecs: number[][] = [];
    if (needIdx.length) {
      const texts = needIdx.map(i => chunks[i].text);
      vecs = await embeddingClient.embed(texts, this.model);
      await this.cache.put(needIdx.map(i => keys[i]), vecs);
    }
    let j = 0;
    for (let i = 0; i < chunks.length; i++) {
      const v = cached[i] ?? vecs[j++];
      const f32 = Float32Array.from((v || []) as number[]);
      const norm = 1 / Math.max(1e-6, hypotFast(f32));
      const d = this.docs.get(chunks[i].id)!;
      d.vec = f32; d.norm = norm;
    }
  }

  stats(): IndexStats {
    return { files: new Set([...this.docs.values()].map(d => d.path)).size, chunks: this.docs.size, dim: (this.model as any).dim, model: this.model };
  }

  search(query: string, k = 8, filters?: SearchFilters): Result[] {
    const qterms = tokenize(query);
    const qvec = averageVectors(query.split(/\s+/).map(s => hash2vec(s, (this.model as any).dim)));
    const qnorm = 1 / Math.max(1e-6, hypotFastArr(qvec));
    const bmScores = new Map<string, number>();
    for (const [id, row] of this.lex) {
      const doc = this.docs.get(id)!;
      if (!passFilters(doc, filters)) continue;
      const bm = bm25(qterms, row.tokens, this.idf, 1.2, 0.75);
      if (bm > 0) bmScores.set(id, bm);
    }
    const results: Result[] = [];
    for (const [id, doc] of this.docs) {
      if (!passFilters(doc, filters)) continue;
      if (!doc.vec.length) continue;
      const cos = cosine(qvec, qnorm, doc.vec, doc.norm);
      const bm = bmScores.get(id) ?? 0;
      const score = 0.45 * z(bm) + 0.55 * z(cos);
      results.push({ chunk: { id, path: doc.path, lang: doc.lang, fromLine: doc.from, toLine: doc.to, text: doc.text, tokens: doc.bm25Tokens, hash: '' }, score, bm25: bm, cosine: cos });
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, k);
  }
}

function tokenize(text: string) {
  const terms = new Map<string, number>();
  text.toLowerCase().replace(/[\W_]+/g, ' ').split(/\s+/).filter(Boolean).forEach(t => terms.set(t, (terms.get(t) ?? 0) + 1));
  return terms;
}
function sumVals(m: Map<string, number>) { let s = 0; for (const v of m.values()) s += v; return s; }
function rebuildIdf(lex: Map<string, LexRow>, idf: Map<string, number>) {
  idf.clear(); const N = Math.max(1, lex.size);
  const df = new Map<string, number>();
  for (const row of lex.values()) for (const t of row.tokens.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  for (const [t, n] of df) idf.set(t, Math.log((N - n + 0.5) / (n + 0.5) + 1));
}
function bm25(q: Map<string, number>, d: Map<string, number>, idf: Map<string, number>, k1: number, b: number) {
  const dl = sumVals(d), avgdl = 200;
  let s = 0;
  for (const [term] of q) {
    const f = d.get(term) ?? 0; if (!f) continue;
    const idfw = idf.get(term) ?? 0;
    s += idfw * (f * (k1 + 1)) / (f + k1 * (1 - b + b * (dl / avgdl)));
  }
  return s;
}
function cosine(q: number[], qn: number, d: Float32Array, dn: number) {
  let dot = 0; const n = Math.min(q.length, d.length);
  for (let i = 0; i < n; i++) dot += q[i] * d[i];
  return dot * qn * dn;
}
function z(x: number) { return x; }
function passFilters(doc: VectorRow, f?: SearchFilters) {
  if (!f) return true;
  if (f.lang && !f.lang.includes(doc.lang)) return false;
  if (f.pathPrefix && !doc.path.startsWith(f.pathPrefix)) return false;
  return true;
}
function hash2vec(s: string, dim: number) { const v = new Array(dim).fill(0); for (let i = 0; i < s.length; i++) { v[i % dim] += (s.charCodeAt(i) % 13) - 6; } return v; }
function averageVectors(vs: number[][]) { if (!vs.length) return []; const dim = vs[0].length; const out = new Array(dim).fill(0); for (const v of vs) for (let i = 0; i < dim; i++) out[i] += v[i]; for (let i = 0; i < dim; i++) out[i] /= Math.max(1, vs.length); return out; }
function hypotFastArr(a: number[]) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s); }
function hypotFast(a: Float32Array) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return Math.sqrt(s); }

export type { IndexStats };
