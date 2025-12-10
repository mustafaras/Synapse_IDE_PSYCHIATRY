import { HybridIndex } from './index';
import { chunkFile } from './chunkers';
import type { EmbeddingModel, FileRef, IndexStats } from './types';
import { isBlockedPath, isWhitelistedPath } from '@/services/actions/safety';

export async function buildIndex(files: FileRef[], readText: (p: string) => Promise<string>, model: EmbeddingModel) {
  const idx = new HybridIndex();
  await idx.init(model);
  const visible = files.filter(f => isWhitelistedPath(f.path) && !isBlockedPath(f.path) && f.size < 1_000_000);
  for (const f of visible) {
    const chunks = await chunkFile(f, readText);
    await idx.add(chunks);
  }
  return idx;
}

export type { IndexStats };
