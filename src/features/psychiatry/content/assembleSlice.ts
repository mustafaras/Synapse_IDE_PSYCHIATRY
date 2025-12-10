

import type { SliceCard as Card, EvidenceSlice } from './ContentSchema';
import { resolvePromptsSource, resolveReferencesSource, resolveTextSource } from './contentLoader';




const cache = new Map<string, EvidenceSlice>();

function cacheKey(card: Card): string {
  return `${card.id}::${(card as any).updatedAt ?? (card as any).version ?? '0'}`;
}

async function naiveFourBlocks(card: Card): Promise<EvidenceSlice> {
  const content = (card as any).content ?? {};
  const [infoHtml, exampleHtml, referencesHtml, promptsText] = await Promise.all([
    resolveTextSource(content.info),
    resolveTextSource(content.example),
    resolveReferencesSource(content.references),
    resolvePromptsSource(content.prompts),
  ]);
  return {
    infoHtml: infoHtml ?? '',
    exampleHtml: exampleHtml ?? '',
    referencesHtml: referencesHtml ?? '',
    promptsText: promptsText ?? '',
  };
}

export async function assembleEvidenceSlice(card: Card): Promise<EvidenceSlice> {
  const key = cacheKey(card);
  const hit = cache.get(key);
  if (hit) return hit;

  let slice: EvidenceSlice | undefined;

  try {






  } catch {

  }

  if (!slice) {
    slice = await naiveFourBlocks(card);
  }

  const normalized: EvidenceSlice = {
    infoHtml: slice.infoHtml ?? '',
    exampleHtml: slice.exampleHtml ?? '',
    referencesHtml: slice.referencesHtml ?? '',
    promptsText: slice.promptsText ?? '',
  };
  cache.set(key, normalized);
  return normalized;
}
