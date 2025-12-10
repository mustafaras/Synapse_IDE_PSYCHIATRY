import { useMemo } from 'react';
import { usePsychStore } from '../store';
import type { Card } from '../lib/types';

export interface PsychFilterInput {
  query?: string;
  sectionId?: string;
  tags?: string[];
  favOnly?: boolean;
  recMode?: boolean;
}

export interface PsychFilterResult {
  cards: Card[];
  total: number;
  sectionCounts: Record<string, number>;
  activeTags: string[];
  query: string;
  favOnly: boolean;
  recMode: boolean;
  getRecScore: (id: string) => number;
}



interface FilterSlice {
  navQuery?: string;
  query?: string;
  selectedSectionId?: string;
  activeTags?: Set<string>;
  favOnly?: boolean;
  recMode?: boolean;
  visibleCards?: () => Card[];
  sectionCounts?: () => Record<string, number>;
  getRecScore?: (id: string) => number;
  favorites?: string[];
}

export function usePsychFilter(overrides: PsychFilterInput = {}): PsychFilterResult {
  const storeQuery = usePsychStore(s => (s as FilterSlice).navQuery ?? (s as FilterSlice).query ?? '');
  const storeSection = usePsychStore(s => (s as FilterSlice).selectedSectionId ?? 'all');
  const storeTagsSet = usePsychStore(s => (s as FilterSlice).activeTags ?? new Set<string>());
  const storeFavOnly = usePsychStore(s => (s as FilterSlice).favOnly ?? false);
  const storeRecMode = usePsychStore(s => (s as FilterSlice).recMode ?? false);
  const visibleCardsFn = usePsychStore(s => (s as FilterSlice).visibleCards);
  const sectionCountsFn = usePsychStore(s => (s as FilterSlice).sectionCounts);
  const getRecScoreFn = usePsychStore(s => (s as FilterSlice).getRecScore);
  const favorites = usePsychStore(s => (s as FilterSlice).favorites);
  const visibleCards = (visibleCardsFn ? visibleCardsFn() : []) as Card[];
  const sectionCounts = sectionCountsFn ? sectionCountsFn() : { all: 0 };
  const getRecScore = (id: string) => (getRecScoreFn ? getRecScoreFn(id) : 0);

  const query = overrides.query ?? storeQuery;
  const sectionId = overrides.sectionId ?? storeSection;
  const favOnly = overrides.favOnly ?? storeFavOnly;
  const recMode = overrides.recMode ?? storeRecMode;
  const activeTags = overrides.tags ?? Array.from(storeTagsSet as Set<string>);


  const depKey = `${query}|${sectionId}|${favOnly}|${recMode}|${activeTags.sort().join(',')}|${visibleCards.length}`;
  const cards = useMemo(() => {
    const base = visibleCards;
  const stSet = storeTagsSet as Set<string>;
  const isIdentity = query === storeQuery && sectionId === storeSection && favOnly === storeFavOnly && recMode === storeRecMode && activeTags.length === stSet.size && activeTags.every(t => stSet.has(t));
    if (isIdentity) return base;
    return base.filter(c => {
      if (sectionId !== 'all' && c.sectionId !== sectionId) return false;
      if (favOnly && favorites && !favorites.includes(c.id)) return false;
      if (activeTags.length) {
        const ct = new Set<string>((c.tags as string[] | undefined) || []);
        for (const t of activeTags) { if (!ct.has(t)) return false; }
      }
      if (query) {
        const q = query.toLowerCase();
        const hay = `${c.title} ${(c.summary || '')} ${(c.descriptionHtml || '')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

  }, [depKey]);

  return {
    cards,
    total: cards.length,
  sectionCounts,
    activeTags,
    query,
    favOnly,
    recMode,
    getRecScore: (id: string) => getRecScore(id),
  };
}
