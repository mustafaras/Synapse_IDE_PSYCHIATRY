import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';


import Fuse from 'fuse.js';
import { resolveSectionFilter, SECTION_TREE } from '../lib/sectionHierarchy';
import { type PsychStateV2, usePsychStore } from '../store';
import { FavoriteStar } from './components/FavoriteStar';
import SearchBar from './components/SearchBar';
import { Tree } from './components/Tree';

import type { Card } from '../lib/types';


const NOOP: (() => void) = () => {};

export interface RailContainerProps {
  cards: Card[];
  favorites: Record<string, true>;
  toggleFavorite(id: string): void;
  onSelectCard(id: string): void;
  selectedCardId?: string;

  activeTags: string[];
  onToggleTag(tag: string): void;
  riskTagIds?: string[];
}


const LS_KEY = 'psy/rail:v2';

interface PersistedState { width: number; collapsed: string[]; }

function loadPersist(): PersistedState {
  try { const raw = localStorage.getItem(LS_KEY); if(raw) return JSON.parse(raw); } catch {  }
  return { width: 420, collapsed: [] };
}
function savePersist(next: PersistedState){ try{ localStorage.setItem(LS_KEY, JSON.stringify(next)); }catch {  } }

export const RailContainer: React.FC<RailContainerProps> = (props) => {
  const { cards, favorites, toggleFavorite, onSelectCard, selectedCardId, riskTagIds, activeTags, onToggleTag } = props;

  const safeMode = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('railSafe'); } catch { return false; }
  }, []);
  const persistRef = useRef<PersistedState>(loadPersist());

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set(persistRef.current.collapsed));

  type LibSlice = { library?: { loading?: boolean; error?: unknown; retryLoad?: () => void; ui?: { density?: 'comfortable'|'compact' } } };

  const queryDraft = usePsychStore(s => (s as PsychStateV2).queryDraft || '');
  const query = usePsychStore(s => (s as PsychStateV2).query || '');


  const actionsRef = useRef({
    setQueryDraft: usePsychStore.getState().setQueryDraft!,
    commitQuery: usePsychStore.getState().commitQuery!,
  });


  useLayoutEffect(() => {

    const st = usePsychStore.getState();
    actionsRef.current.setQueryDraft = st.setQueryDraft!;
    actionsRef.current.commitQuery = st.commitQuery!;
  }, []);


  if (import.meta?.env?.MODE !== 'production') {
    try {

      const rc: any = (window as any).__psyRenderCount || { n: 0, t: Date.now() };

      (window as any).__psyRenderCount = rc;
      rc.n++;
      const now = Date.now();
      if (now - rc.t > 1000) { rc.n = 1; rc.t = now; }
  if (rc.n > 60) { console.warn('[Psych] High render frequency in RailContainer:', rc.n, 'per second'); }
    } catch {  }
  }

  const [focusId, setFocusId] = useState<string | null>(null);
  const focusIdsRef = useRef<string[]>([]);

  const rootRef = useRef<HTMLElement | null>(null);


  useLayoutEffect(()=>{ persistRef.current.collapsed = Array.from(collapsedGroups); savePersist(persistRef.current); },[collapsedGroups]);


  const favoriteCards = useMemo(()=> cards.filter(c => favorites[c.id]).sort((a,b)=> a.title.localeCompare(b.title)), [cards, favorites]);


  const sectionParentMap = useMemo(() => {
    const map: Record<string,string> = {};
    for (const parent of SECTION_TREE) {
      for (const child of (parent.children||[])) { map[child.id] = parent.id; }
    }
    return map;
  }, []);


  const allTags = useMemo(()=> {
    const set = new Set<string>();
    for(const c of cards){ for(const t of (c.tags||[])) set.add(String(t)); }
    return Array.from(set).sort((a,b)=> a.localeCompare(b));
  }, [cards]);


  useEffect(()=> {
    const handler = (e: KeyboardEvent) => { if(e.shiftKey && (e.key === 'l' || e.key === 'L')) { e.preventDefault(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);


  const allGroupIds = useMemo(() => SECTION_TREE.map(g => g.id), []);
  const isAllExpanded = collapsedGroups.size === 0 || allGroupIds.every(id => !collapsedGroups.has(id));


  const [sectionFilter, setSectionFilter] = useState<string>('all');

  useEffect(()=>{
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {}; const id = d.id as string | undefined; if(!id) return;

      try {

        for(const parent of SECTION_TREE){
          if(parent.children?.some(ch => ch.id === id)) { setSectionFilter(parent.id); return; }
        }

        if(SECTION_TREE.some(p=> p.id === id)) setSectionFilter(id);
      } catch {  }
    };
  window.addEventListener('psy:section:set', handler);
  return ()=> window.removeEventListener('psy:section:set', handler);
  },[]);


  const fuse = useMemo(()=> new Fuse(cards, { keys:[{name:'title', weight:0.8},{name:'tags', weight:0.2}], threshold:0.38, ignoreLocation:true, minMatchCharLength:2 }), [cards]);
  const normalizedQ = query.trim();
  const baseFiltered: Card[] = normalizedQ ? (fuse.search(normalizedQ) as Array<{ item: Card }>).map(r=> r.item) : cards;


  useEffect(() => {
    if (!cards?.length) return;
    if (!normalizedQ) return;
    if (baseFiltered.length > 0) return;
    try { actionsRef.current.commitQuery(''); } catch {  }
  }, [cards?.length, normalizedQ, baseFiltered.length]);
  const sectionLeafIds = useMemo(()=> resolveSectionFilter(sectionFilter), [sectionFilter]);
  const filteredAfterSection = sectionLeafIds.length
    ? baseFiltered.filter(c => {
  const sid = (c as Partial<Card>).sectionId;
        return sid ? sectionLeafIds.includes(sid) : false;
      })
    : baseFiltered;

  const [filtersEnabled, setFiltersEnabled] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(false);


  const prevCollapsedBeforeTagRef = useRef<Set<string> | null>(null);
  const autoOpenedParentsRef = useRef<Set<string>>(new Set());
  const manualCollapsedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!filtersEnabled) return;
    if (activeTags.length === 0) {

      if (prevCollapsedBeforeTagRef.current) {
        setCollapsedGroups(new Set(prevCollapsedBeforeTagRef.current));
        prevCollapsedBeforeTagRef.current = null;
      }
      return;
    }

    if (!prevCollapsedBeforeTagRef.current) {
      prevCollapsedBeforeTagRef.current = new Set(collapsedGroups);
    }

    const selectedSet = new Set(activeTags.map(t => t.toLowerCase()));
    const groupsToOpen = new Set<string>();
    for (const c of cards) {
      const ct = (c.tags || []) as string[];
      if (ct.some(t => selectedSet.has(t.toLowerCase()))) {
  const sid = (c as Partial<Card>).sectionId;
        if (sid) {
          const parent = sectionParentMap[sid];
            if (parent) groupsToOpen.add(parent);
        }
      }
    }
    if (groupsToOpen.size) {
      setCollapsedGroups(prev => {
        let changed = false;
        const next = new Set(prev);
        groupsToOpen.forEach(g => {
          if (manualCollapsedRef.current.has(g)) return;
          if (next.has(g)) { next.delete(g); changed = true; autoOpenedParentsRef.current.add(g); }
        });
        return changed ? next : prev;
      });
    }
  }, [activeTags, cards, sectionParentMap, filtersEnabled, collapsedGroups]);


  useEffect(() => {
    if (!selectedCardId) return;
    const card = cards.find(c => c.id === selectedCardId);
    if (!card) return;
    const sid = (card as unknown as { sectionId?: string }).sectionId;
    if (!sid) return;
    const parent = sectionParentMap[sid];
    if (!parent) return;
    if (manualCollapsedRef.current.has(parent)) return;
    if (collapsedGroups.has(parent)) {
      setCollapsedGroups(prev => { const next = new Set(prev); next.delete(parent); autoOpenedParentsRef.current.add(parent); return next; });
    }
  }, [selectedCardId, cards, sectionParentMap, collapsedGroups]);


  const toggleGroup = (id: string)=> setCollapsedGroups(s => {
    const next = new Set(s);
    if(next.has(id)) {
      next.delete(id);
      manualCollapsedRef.current.delete(id);
    } else {
      next.add(id);
      manualCollapsedRef.current.add(id);
      autoOpenedParentsRef.current.delete(id);
    }
    return next;
  });


  const expandAll = useCallback(() => {
    setCollapsedGroups(() => new Set());

    manualCollapsedRef.current.clear();
  }, []);
  const collapseAll = useCallback(() => {
    setCollapsedGroups(() => new Set(allGroupIds));

    manualCollapsedRef.current = new Set(allGroupIds);
    autoOpenedParentsRef.current.clear();
  }, [allGroupIds]);


  const density = usePsychStore(s => (s as LibSlice).library?.ui?.density);
  const densityClass = useMemo(() => `psy-rail psy-sidebar rail-minimal ${density === 'compact' ? 'density-compact' : 'density-comfortable'}`, [density]);
  const libraryLoading = usePsychStore(s => (s as LibSlice).library?.loading ?? false);
  const libraryError = usePsychStore(s => (s as LibSlice).library?.error ?? null) as unknown as Error | string | null;


  const lastFocusSigRef = useRef<string | null>(null);
  const disableFocusSyncRef = useRef<boolean>( (() => { try { return new URLSearchParams(window.location.search).has('nofocus'); } catch { return false; } })() );
  const debugFocusRef = useRef<boolean>( (() => { try { return new URLSearchParams(window.location.search).has('debugFocus'); } catch { return false; } })() );
  const debugLoopCounterRef = useRef(0);
  const focusIdRef = useRef<string | null>(focusId);
  useEffect(()=> { focusIdRef.current = focusId; }, [focusId]);


  const moveFocus = useCallback((direction: 'next'|'prev'|'home'|'end') => {
    const order = focusIdsRef.current;
    if(!order.length) return;
    const idx = focusId ? order.indexOf(focusId) : 0;
    let nextIdx = idx < 0 ? 0 : idx;
    if(direction==='next') nextIdx = Math.min(order.length-1, idx+1);
    else if(direction==='prev') nextIdx = Math.max(0, idx-1);
    else if(direction==='home') nextIdx = 0;
    else if(direction==='end') nextIdx = order.length-1;
    const nextId = order[nextIdx];
    if(nextId && nextId!==focusId) {
      setFocusId(prev => prev === nextId ? prev : nextId);
    }
  }, [focusId]);

  const onGlobalKey = useCallback((e: React.KeyboardEvent)=>{
    if(e.key==='ArrowDown'){ e.preventDefault(); moveFocus('next'); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); moveFocus('prev'); }
    else if(e.key==='Home'){ e.preventDefault(); moveFocus('home'); }
    else if(e.key==='End'){ e.preventDefault(); moveFocus('end'); }
    else if(e.key==='Enter' || e.key===' '){
      if(focusId){ e.preventDefault(); onSelectCard(focusId); }
    }
  }, [focusId, moveFocus, onSelectCard]);


  useLayoutEffect(()=>{
    if(process.env.NODE_ENV === 'production') return;
    const el = rootRef.current; if(!el) return;

    requestAnimationFrame(()=>{
      try {
        const rect = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const chipCount = el.querySelectorAll('.psy-chip').length;

        const sectionNodes = Array.from(el.querySelectorAll('[role="list"]')) as HTMLElement[];
        const itemsPerSection = sectionNodes.map(n => n.querySelectorAll('li,[role="listitem"]').length);

        const sectionCount = sectionNodes.length;


        console.log('[PsychSidebarInventory]', {
          widthPx: Math.round(rect.width),
            paddingTop: cs.paddingTop,
            paddingBottom: cs.paddingBottom,
            chipCount,
            sectionCount,
            itemsPerSection
        });
  } catch(err){ console.warn('[PsychSidebarInventory] measure failed', err); }
    });
  }, []);


  useEffect(() => {
    let id: number | undefined;
    if (queryDraft !== query) {
      id = window.setTimeout(() => { const st = usePsychStore.getState(); if (st.query !== st.queryDraft) actionsRef.current.commitQuery(st.queryDraft ?? ''); }, 400) as unknown as number;
    }
    return () => { if (id !== undefined) { clearTimeout(id); } };
  }, [queryDraft, query]);


  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const focusSearch = useCallback(() => { searchInputRef.current?.focus(); }, []);

  const handleSearchChange = useCallback((next: string) => {
    actionsRef.current.setQueryDraft(next);
    actionsRef.current.commitQuery(next);

    focusIdsRef.current = [];
  }, []);

  const handleSearchClear = useCallback(() => {
    if (!queryDraft && !query) return;
    actionsRef.current.setQueryDraft('');
    actionsRef.current.commitQuery('');
    requestAnimationFrame(() => focusSearch());
  }, [queryDraft, query, focusSearch]);


  const retryLoad = usePsychStore(s => (s as LibSlice).library?.retryLoad || NOOP);

  const tagFiltered = (filtersEnabled && activeTags && activeTags.length)
    ? filteredAfterSection.filter(c => {
        const ct = (c.tags || []) as unknown as string[];
        return activeTags.every(t => ct.includes(t));
      })
    : filteredAfterSection;
  const finalCards = tagFiltered;
  const isEmpty = !libraryLoading && !libraryError && finalCards.length === 0;


  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail || {}; const q: string = (d.query || '').trim().toLowerCase();
      if (!q) return;

      const matched = finalCards.filter(c => {
        const title = (c.title || '').toLowerCase();
        const tags = (c.tags || []) as string[];
        return title.includes(q) || tags.some(t => String(t).toLowerCase().includes(q));
      });
      if (!matched.length) return;

      const parentsToOpen = new Set<string>();
      matched.slice(0, 50).forEach(c => {
        const sid = (c as Partial<Card>).sectionId; if (!sid) return; const parent = sectionParentMap[sid]; if (parent) parentsToOpen.add(parent);
      });
      if (parentsToOpen.size) {
        setCollapsedGroups(prev => { const next = new Set(prev); let changed = false; parentsToOpen.forEach(p => { if (next.has(p)) { next.delete(p); changed = true; } }); return changed ? next : prev; });
      }

      if (matched.length && !matched.some(c => c.id === selectedCardId)) {
        const first = matched[0];

        onSelectCard(first.id);

        setTimeout(() => { try { document.querySelector(`[data-card-id="${first.id}"]`)?.scrollIntoView({ block: 'nearest' }); } catch {  } }, 50);
      }
    };
    window.addEventListener('synapse:ui:search', handler as EventListener);
    return () => window.removeEventListener('synapse:ui:search', handler as EventListener);
  }, [finalCards, sectionParentMap, selectedCardId, onSelectCard]);


  const focusSig = useMemo(() => {
    return `${finalCards.map((c: Card) => c.id).join('|')}__sel:${selectedCardId || ''}`;
  }, [finalCards, selectedCardId]);


  type LeafItem = { id: string; sectionId?: string };
  const groupCountBySection = useCallback((items: LeafItem[]) => {
    const out: Record<string, number> = Object.create(null);
    for (const it of items) { if (!it.sectionId) continue; out[it.sectionId] = (out[it.sectionId] || 0) + 1; }
    return out;
  }, []);
  const totalBySection = useMemo(() => groupCountBySection(cards as LeafItem[]), [cards, groupCountBySection]);
  const filteredBySection = useMemo(() => groupCountBySection(finalCards as LeafItem[]), [finalCards, groupCountBySection]);
  const globalTotal = cards.length;
  const globalFiltered = finalCards.length;

  useEffect(() => {
    if (disableFocusSyncRef.current) return;
    if (libraryLoading || libraryError) return;
    if (focusSig === lastFocusSigRef.current) return;
    const current = focusIdRef.current;
    const focusStillValid = !!(current && finalCards.some((c: Card) => c.id === current));
    let nextFocus: string | null = current || null;
    if (!focusStillValid) {
      if (selectedCardId && finalCards.some((c: Card) => c.id === selectedCardId)) {
        nextFocus = selectedCardId ?? null;
      } else {
        nextFocus = focusIdsRef.current[0] || finalCards[0]?.id || null;
      }
    } else if (selectedCardId && selectedCardId !== current && finalCards.some((c: Card) => c.id === selectedCardId)) {
      nextFocus = selectedCardId;
    }
    if (nextFocus && nextFocus !== current) {
      setFocusId(prev => prev === nextFocus ? prev : nextFocus);
      focusIdRef.current = nextFocus;
      if (debugFocusRef.current) {
        console.warn('[RailContainer][focus-sync] setFocusId ->', nextFocus, 'sig:', focusSig);
      }
    }
    lastFocusSigRef.current = focusSig;
    if (debugFocusRef.current) {
      debugLoopCounterRef.current += 1;
      if (debugLoopCounterRef.current > 60) {
        console.warn('[RailContainer][focus-sync] exceeded 60 runs; disabling focus sync');
        (lastFocusSigRef as React.MutableRefObject<string | null>).current = '__DISABLED__';
      }
    }
  }, [focusSig, finalCards, selectedCardId, libraryLoading, libraryError]);


  const errRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (libraryError && errRef.current) { errRef.current.focus(); } }, [libraryError]);

  const handleCopyError = useCallback(() => {
    if (!libraryError) return;
    try { navigator.clipboard?.writeText(String(libraryError)); } catch {  }
  }, [libraryError]);

  const handleResetSearch = useCallback(() => {
    const blank = '';
    if (queryDraft !== blank) actionsRef.current.setQueryDraft(blank);
    if (query !== blank) actionsRef.current.commitQuery(blank);
    if (sectionFilter !== 'all') setSectionFilter('all');
    if (activeTags.length) activeTags.forEach(t => onToggleTag(t));
    if (!filtersEnabled) setFiltersEnabled(true);
    requestAnimationFrame(() => focusSearch());
  }, [queryDraft, query, sectionFilter, activeTags, onToggleTag, filtersEnabled, focusSearch]);


  if (safeMode) {
    const basicList = cards.slice(0, 50);
    return (
      <aside className="psy-rail psy-sidebar safe-mode" data-psy-left aria-label="Psychiatry Toolkit Library (Safe Mode)">
        <div style={{padding:'8px 12px', background:'#ffe8c4', borderBottom:'1px solid #e0b070', fontSize:12}}>
          <strong>Rail Safe Mode</strong> – internal effects disabled. Remove <code>?railSafe=1</code> to restore full behavior.
        </div>
        <div style={{padding:12}}>
          <input
            aria-label="Search (disabled in safe mode)"
            placeholder="Search disabled"
            disabled
            style={{width:'100%', padding:'6px 8px'}}
          />
          <ul style={{marginTop:12, listStyle:'none', padding:0}}>
            {basicList.map(c => (
              <li key={c.id} style={{marginBottom:4}}>
                <button
                  type="button"
                  onClick={() => onSelectCard(c.id)}
                  style={{
                    width:'100%', textAlign:'left', padding:'6px 8px', border:'1px solid #ddd', borderRadius:4,
                    background: c.id === selectedCardId ? '#eef6ff' : '#fff'
                  }}
                >{c.title}</button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside
      data-psy-left
      ref={rootRef}
      className={densityClass}
      aria-label="Psychiatry Toolkit Library"
      aria-busy={libraryLoading}
    >
      {}
      <div className="psy-rail-topline" aria-hidden="true" />

      {}
      <div className="psy-rail__header" role="group" aria-label="Library header">
        <div className="psy-rail__masthead" aria-labelledby="psy-rail-heading">
          <h2 id="psy-rail-heading" className="psy-rail__title" title="Clinical Library">Clinical <span className="accent">Library</span></h2>
          <p className="psy-rail__subtitle">Evidence‑based reference</p>
        </div>
        <div className="psy-rail__sectionRow">
          <label htmlFor="psy-section-filter" className="psy-rail__sectionLabel">Section</label>
          <select
            id="psy-section-filter"
            className="psy-rail__sectionSelect"
            aria-label="Section"
            value={sectionFilter}
            onChange={e => { const v = e.target.value; setSectionFilter(v); window.dispatchEvent(new CustomEvent('psy:section:fromRail',{ detail:{ id: v }})); }}
          >
            <option value="all">All Sections</option>
            {SECTION_TREE.map(parent => (
              <optgroup key={parent.id} label={parent.label}>
                {(parent.children||[]).map(child => (
                  <option key={child.id} value={child.id}>{child.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <span className="psy-rail__count" aria-live="polite" data-testid="library-result-count">{finalCards.length}</span>
        </div>
        <div className="psy-rail__filtersInline" role="group" aria-label="Filter controls">
          <button type="button" className="inline-btn" onClick={()=> setFiltersEnabled(f=>!f)} aria-pressed={filtersEnabled}>
            Filters: <strong>{filtersEnabled ? 'On' : 'Off'}</strong>
          </button>
          {Boolean(filtersEnabled) && (
            <button type="button" className="inline-btn" onClick={()=> setFiltersExpanded(e=>!e)} aria-expanded={filtersExpanded}>
              {filtersExpanded ? 'Hide Tags' : 'Show Tags'}{activeTags.length? ` (${activeTags.length})`: ''}
            </button>
          )}
          <button
            type="button"
            className="inline-btn"
            onClick={() => (isAllExpanded ? collapseAll() : expandAll())}
            aria-pressed={isAllExpanded}
            aria-label={isAllExpanded ? 'Collapse all sections' : 'Expand all sections'}
            data-testid="rail-expand-all"
          >{isAllExpanded ? 'Collapse All' : 'Expand All'}</button>
          {((Boolean(query) || sectionFilter !== 'all' || activeTags.length > 0)) ? (
            <button type="button" className="inline-btn danger" onClick={handleResetSearch}>Reset</button>
          ) : null}
        </div>
        {filtersEnabled && filtersExpanded && allTags.length ? (
          <div className="psy-rail__tagsMini" role="list" aria-label="Tag filters">
            {allTags.map(t => {
              const on = activeTags.includes(t);
              return (
                <div key={t} role="listitem" className="mini-chip-wrap">
                  <button
                    type="button"
                    className={`mini-chip ${on ? 'on': ''}`}
                    aria-pressed={on}
                    onClick={()=> onToggleTag(t)}
                  >{t}</button>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {}
      <SearchBar
        value={queryDraft}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
        placeholder="Search library…"
      />

      {}
      <div className="psy-rail__scroll" role="region" aria-label="Library navigation">
        <div className="psy-rail__fade psy-rail__fade--top" aria-hidden="true" />
        {}
        {!libraryLoading && (
          <>
            <div className="psy-rail__divider" role="separator" aria-hidden="true" />
            <div className="rail-results" role="status" aria-live="polite">
              <span className="rail-results-label">Results</span>
              <span className="rail-results-value" data-testid="rail-results-filtered">{globalFiltered}</span>
              <span className="rail-results-sep">of</span>
              <span className="rail-results-total" data-testid="rail-results-total">{globalTotal}</span>
            </div>
          </>
        )}

        <RailErrorBoundary>
          {libraryLoading ? (
            <RailLoadingSkeleton />
          ) : libraryError ? (
            <div
              ref={errRef}
              className="rail-error"
              role="alert"
              tabIndex={-1}
              data-testid="library-error"
            >
              <div className="rail-error-title">Something went wrong in the left panel.</div>
              <pre className="rail-error-msg">{libraryError instanceof Error ? libraryError.message : String(libraryError)}</pre>
              <div className="rail-error-actions">
                <button className="psy-chip" type="button" onClick={() => retryLoad?.()}>Retry</button>
                <button className="psy-chip reset" type="button" onClick={handleCopyError}>Copy diagnostics</button>
              </div>
            </div>
          ) : isEmpty ? (
            <RailEmptyState
              hasFilters={!!activeTags.length}
              hasSearch={!!query.trim()}
              onClearFilters={handleResetSearch}
              onClearSearch={handleResetSearch}
            />
          ) : (
            <>
              <div className="psy-rail__body" role="region" aria-label="Library results">
                <div
                  className="psy-rail__resultsTree"
                  role="tree"
                  aria-label="Sections"
                  tabIndex={0}
                  onKeyDown={onGlobalKey}
                >
                  {}
                  <RecentGroup title="Favorites" items={favoriteCards} onSelect={onSelectCard} selectedId={selectedCardId} toggleFavorite={toggleFavorite} riskTagIds={riskTagIds} totalBySection={totalBySection} filteredBySection={filteredBySection} />
                  <Tree
                    sections={SECTION_TREE}
                    collapsed={collapsedGroups}
                    toggleCollapse={toggleGroup}
                    cards={finalCards}
                    favorites={favorites}
                    onSelectCard={onSelectCard}
                    selectedCardId={selectedCardId}
                    toggleFavorite={toggleFavorite}
                    riskTagIds={riskTagIds}
                    focusIdsRef={focusIdsRef}
                    totalBySection={totalBySection}
                    filteredBySection={filteredBySection}
                  />
                </div>
              </div>
              <RailFooter total={finalCards.length} query={query} />
            </>
          )}
        </RailErrorBoundary>

        <div className="psy-rail__fade psy-rail__fade--bottom" aria-hidden="true" />
      </div>
    </aside>
  );
};


const RailFooter: React.FC<{ total: number; query: string; }> = ({ total, query }) => (
  <div className="psy-rail__footer">{total} results{query? ` • "${query}"` : ''}</div>
);


export function RailLoadingSkeleton(){
  return (
    <div className="rail-skel" aria-hidden="true">
      <div className="skel-chipbar">
        {Array.from({length:8}).map((_,i)=> <span key={i} className="skel skel-chip" />)}
      </div>
      <div className="skel-sections">
        {Array.from({length:7}).map((_,i)=>(
          <div key={i} className="skel skel-row">
            <span className="skel skel-chevron" />
            <span className="skel skel-title" />
            <span className="skel skel-badge" />
          </div>
        ))}
      </div>
      <div className="skel-leaflist">
        {Array.from({length:10}).map((_,i)=> <div key={i} className="skel skel-leaf" />)}
      </div>
    </div>
  );
}

export function RailEmptyState({ hasFilters, hasSearch, onClearFilters, onClearSearch }: { hasFilters:boolean; hasSearch:boolean; onClearFilters:()=>void; onClearSearch:()=>void; }){
  return (
    <div className="rail-empty" role="status" aria-live="polite" aria-describedby="rail-empty-desc">
      <div className="rail-empty-title">No items match your search and filters.</div>
      <div id="rail-empty-desc" className="rail-empty-sub">Try clearing filters or editing your query.</div>
      <div className="rail-empty-actions">
        {hasFilters ? (<button className="psy-chip reset" onClick={onClearFilters}>Reset filters</button>) : null}
        {hasSearch ? (<button className="psy-chip" onClick={onClearSearch} aria-label="Clear search">Clear search</button>) : null}
      </div>
    </div>
  );
}

class RailErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: unknown }>{
  constructor(props: { children: React.ReactNode }){ super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error: unknown){ return { error }; }
  handleRetry = () => this.setState({ error: null });
  handleCopy = () => {
    try {
      const err = this.state.error;
      const payload = {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? String(err.stack ?? '') : '',
        ts: new Date().toISOString(),
        area: 'left-rail'
      };
      navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    } catch {  }
  };
  override render(){
    if(!this.state.error) return this.props.children;
    const err = this.state.error;
    const msg = err instanceof Error ? err.message : String(err);
    return (
      <div className="rail-error" role="alert" aria-live="assertive">
        <div className="rail-error-title">Something went wrong in the left panel.</div>
        <pre className="rail-error-msg">{msg}</pre>
        <div className="rail-error-actions">
          <button className="psy-chip" onClick={this.handleRetry}>Retry</button>
          <button className="psy-chip reset" onClick={this.handleCopy}>Copy diagnostics</button>
        </div>
      </div>
    );
  }
}

interface SimpleGroupProps { title: string; items: Card[]; onSelect(id:string):void; selectedId?: string | undefined; toggleFavorite(id:string):void; riskTagIds?: string[] | undefined; collapsedByDefault?: boolean; favorites?: Record<string, true>; registerFocusIds?: (ids:string[])=>void; totalBySection?: Record<string, number>; filteredBySection?: Record<string, number>; }
const RecentGroup: React.FC<SimpleGroupProps> = (p) => <SimpleFlatGroup {...p}/>;


function useMeasuredHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [h, setH] = useState(0);
  const recalc = useCallback(() => {
    const el = ref.current;
    if(!el) return;
    const next = el.scrollHeight || 0;

    setH(prev => (prev !== next ? next : prev));
  }, []);
  useLayoutEffect(() => {
    recalc();
    const el = ref.current;
    if(!el || !('ResizeObserver' in window)) return undefined;
    const ro = new ResizeObserver(() => {

      requestAnimationFrame(() => recalc());
    });
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, [recalc]);
  return { ref, h, recalc };
}

const SimpleFlatGroup: React.FC<SimpleGroupProps> = ({ title, items, onSelect, selectedId, toggleFavorite, riskTagIds, collapsedByDefault, favorites = {}, registerFocusIds, totalBySection = {}, filteredBySection = {} }) => {
  const [collapsed, setCollapsed] = useState(!!collapsedByDefault);

  const { ref: panelInnerRef, h } = useMeasuredHeight<HTMLDivElement>();
  const open = !collapsed;

  useEffect(() => {
    if (registerFocusIds && open && items.length) {
      registerFocusIds(items.map(i => i.id));
    }
  }, [registerFocusIds, open, items]);
  if(!items.length) return null;
  const headingId = `psy-group-${title.replace(/\s+/g,'-').toLowerCase()}`;
  const regionId = `${headingId}-panel`;


  const count = items.length;

  const pseudoKey = title.toLowerCase();
  const tCount = totalBySection[pseudoKey] ?? count;
  const fCount = filteredBySection[pseudoKey] ?? count;

  const onHeaderKey = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCollapsed(c=>!c); }

    const root = (e.currentTarget.ownerDocument || document);
    if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){
      e.preventDefault();
      const headers = Array.from(root.querySelectorAll<HTMLButtonElement>('.psy-acc__header'));
      const idx = headers.indexOf(e.currentTarget);
      if(idx >= 0){
        if(e.key==='ArrowDown'){ headers[Math.min(headers.length-1, idx+1)]?.focus(); }
        else if(e.key==='ArrowUp'){ headers[Math.max(0, idx-1)]?.focus(); }
        else if(e.key==='Home'){ headers[0]?.focus(); }
        else if(e.key==='End'){ headers[headers.length-1]?.focus(); }
      }
    }
  };

  const lower = title.toLowerCase();
  const sectionExtra = lower === 'recents' ? ' is-recents' : (lower === 'favorites' ? ' is-favorites' : '');
  return (
    <div className={`psy-acc__section ${open ? 'is-open': ''}${sectionExtra}`} role="listitem" aria-labelledby={headingId}>
      <h3 className="psy-acc__heading" id={headingId}>
        <button
          type="button"
          className="psy-acc__header is-hoverable"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={()=> setCollapsed(c=>!c)}
          onKeyDown={onHeaderKey}
        >
          <span className="psy-acc__chev" aria-hidden="true">▸</span>
          <span className="psy-acc__title">{title}</span>
          <span className="rail-badge" aria-label={`Items in ${title}: ${fCount} shown out of ${tCount} total`}>{tCount} ▸ {fCount}</span>
        </button>
      </h3>
      <div
        id={regionId}
        role="region"
        aria-labelledby={headingId}
  className="psy-acc__panel"

  style={{ ['--acc-h' as string]: `${h}px` } as React.CSSProperties}
      >
        <div ref={panelInnerRef} className="psy-acc__panelInner">
          <div className="psy-rail__list" role="list">
            {items.map(card => {
              const active = card.id===selectedId;
              const isRisk = !!(riskTagIds && (card.tags||[]).some((t:string)=>riskTagIds.includes(t)));
              const subtitle = typeof (card as { summary?: unknown }).summary === 'string' ? (card as { summary?: string }).summary : undefined;
              return (
                <li key={card.id} id={`psy-item-${card.id}`} className="psy-list__item">
                  <button
                    type="button"
                    className="psy-list__row"
                    aria-current={active ? 'true' : undefined}
                    data-roving-id={card.id}
                    tabIndex={0}
                    onClick={()=> onSelect(card.id)}
                    onKeyDown={(e)=> { if(e.key===' '){ e.preventDefault(); onSelect(card.id); } }}
                    title={String(card.title || '')}
                  >
                    <div className="psy-list__main">
                      <div className="psy-list__title">{String(card.title || '')}</div>
                      {subtitle ? (
                        <div className="psy-list__meta" aria-label="Item details">{subtitle}</div>
                      ) : null}
                      {isRisk ? (
                        <span className="psy-badge psy-badge--risk" aria-label="Risk">RISK</span>
                      ) : null}
                    </div>
                    <div className="psy-list__actions">
                      <FavoriteStar
                        on={!!favorites[card.id]}
                        onToggle={()=> toggleFavorite(card.id)}
                        label={`${favorites[card.id] ? 'Remove' : 'Add'} favorite for ${card.title}`}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


