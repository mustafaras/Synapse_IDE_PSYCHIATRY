
export type CacheKey = { hash: string; provider: string; name: string; dim: number };
export type Cache = {
  get(keys: CacheKey[]): Promise<(number[] | null)[]>;
  put(keys: CacheKey[], vectors: number[][]): Promise<void>;
  stats(): Promise<{ rows: number }>;
};


export function createCache(): Cache {
  const mem = new Map<string, number[]>();
  const key = (k: CacheKey) => `${k.provider}:${k.name}:${k.dim}:${k.hash}`;
  return {
    async get(keys) {
      return keys.map(k => mem.get(key(k)) ?? null);
    },
    async put(keys, vecs) {
      keys.forEach((k, i) => mem.set(key(k), vecs[i]));
    },
    async stats() { return { rows: mem.size }; },
  };
}
