

export type ProviderId = 'openai' | 'gemini' | 'anthropic' | 'ollama';

export type EmbeddingModel =
  | { provider: 'openai'; name: string; dim: number }
  | { provider: 'gemini'; name: string; dim: number }
  | { provider: 'anthropic'; name: string; dim: number }
  | { provider: 'ollama'; name: string; dim: number };

export type FileRef = { path: string; lang: string; size: number };

export type Chunk = {
  id: string;
  path: string;
  lang: string;
  fromLine: number;
  toLine: number;
  text: string;
  tokens: number;
  hash: string;
};

export type SearchFilters = { lang?: string[]; pathPrefix?: string; fileGlob?: string };
export type Result = { chunk: Chunk; score: number; bm25: number; cosine: number };

export type IndexStats = { files: number; chunks: number; dim: number; model: EmbeddingModel };
