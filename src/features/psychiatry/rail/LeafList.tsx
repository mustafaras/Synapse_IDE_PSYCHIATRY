import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Card } from '../lib/types';

export type LeafItem = Card & { id: string; title: string; sectionId: string; };

export type RowModel =
  | { kind: 'group'; id: string; title: string; sectionId: string; count: number }
  | { kind: 'leaf'; id: string; title: string; sectionId: string; card: LeafItem; isActive: boolean; subtitle?: string; isRisk?: boolean; favorite: boolean; onToggleFavorite(): void; onActivate(): void };

export interface LeafListProps {
  rows: RowModel[];
  focusedId?: string | null;
  onFocusChange?: (id: string | null) => void;
  onActivateLeaf?: (card: LeafItem) => void;
  registerVisibleIds?: (ids: string[]) => void;
}

const ITEM_SIZE = 36;
const OVERSCAN = 8;


import { FavoriteStar } from './components/FavoriteStar';

export const LeafList: React.FC<LeafListProps> = React.memo(({ rows, focusedId, onFocusChange, onActivateLeaf, registerVisibleIds }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [viewportH, setViewportH] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);


  const lastHeightRef = useRef<number>(-1);
  useEffect(() => {
    const el = scrollRef.current; if(!el) return;
    const measure = () => {
      const h = el.clientHeight || 0;
      if(h !== lastHeightRef.current) {
        lastHeightRef.current = h;
        setViewportH(h);
      }
    };
    measure();
    let ro: ResizeObserver | undefined;
    if('ResizeObserver' in window){
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {

      (window as Window).addEventListener('resize', measure);
    }
    return () => {
      if(ro) ro.disconnect();
      else (window as Window).removeEventListener('resize', measure);
    };
  }, []);


  useEffect(() => {
    const el = scrollRef.current; if(!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const count = rows.length;

  const disableVirt = useMemo(() => {
    try { return new URLSearchParams(window.location.search).has('noVirt'); } catch { return false; }
  }, []);
  const { startIndex, endIndex, padTop, padBottom } = useMemo(() => {
    if(!viewportH) return { startIndex: 0, endIndex: Math.min(count-1, 0), padTop: 0, padBottom: 0 };
    const rawStart = Math.floor(scrollTop / ITEM_SIZE) - OVERSCAN;
    const start = Math.max(0, rawStart);
    const rawEnd = Math.ceil((scrollTop + viewportH) / ITEM_SIZE) + OVERSCAN;
    const end = Math.min(count - 1, rawEnd);
    const padTop = start * ITEM_SIZE;
    const padBottom = (count - end - 1) * ITEM_SIZE;
    return { startIndex: start, endIndex: end, padTop, padBottom };
  }, [scrollTop, viewportH, count]);


  const lastVisibleKeyRef = useRef<string>('');
  useEffect(() => {
    if(!registerVisibleIds) return;
    const visibleLeafIds: string[] = [];
    for(let i=startIndex;i<=endIndex;i++){
      const r = rows[i];
      if(r?.kind === 'leaf') visibleLeafIds.push(r.id);
    }
    const key = visibleLeafIds.join('|');
    if(key !== lastVisibleKeyRef.current){
      lastVisibleKeyRef.current = key;
      registerVisibleIds(visibleLeafIds);
    }
  }, [startIndex, endIndex, rows, registerVisibleIds]);


  useEffect(() => {
    if (focusedId && !rows.some(r => r.kind === 'leaf' && r.id === focusedId)) {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      onFocusChange?.(rows.find(r => r.kind === 'leaf')?.id || null);
    }
  }, [rows, focusedId, onFocusChange]);

  const setFocusByDelta = useCallback((delta: number) => {
    const leafIds = rows.filter(r => r.kind==='leaf').map(r => r.id);
    if(!leafIds.length) return;
    const idx = focusedId ? leafIds.indexOf(focusedId) : 0;
    const nextIdx = Math.min(leafIds.length - 1, Math.max(0, idx + delta));
    const nextId = leafIds[nextIdx];
    if(nextId && nextId !== focusedId) onFocusChange?.(nextId);
  }, [rows, focusedId, onFocusChange]);

  const setFocusHomeEnd = useCallback((toEnd: boolean) => {
    const leafIds = rows.filter(r => r.kind==='leaf').map(r => r.id);
    if(!leafIds.length) return;
    onFocusChange?.(toEnd ? leafIds[leafIds.length-1] : leafIds[0]);
  }, [rows, onFocusChange]);

  const pageMove = useCallback((dir: 1 | -1) => {
    if(!scrollRef.current) return;
    const el = scrollRef.current;
    el.scrollTop += dir * (viewportH - ITEM_SIZE);

  }, [viewportH]);

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
    if(e.key === 'ArrowDown'){ e.preventDefault(); setFocusByDelta(1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); setFocusByDelta(-1); }
    else if(e.key === 'Home'){ e.preventDefault(); setFocusHomeEnd(false); }
    else if(e.key === 'End'){ e.preventDefault(); setFocusHomeEnd(true); }
    else if(e.key === 'PageDown'){ e.preventDefault(); pageMove(1); }
    else if(e.key === 'PageUp'){ e.preventDefault(); pageMove(-1); }
    else if(e.key === 'Enter' || e.key === ' ') {
      const targetLeaf = rows.find(r => r.kind === 'leaf' && r.id === focusedId) as RowModel | undefined;
      if(targetLeaf && targetLeaf.kind==='leaf') { e.preventDefault(); targetLeaf.onActivate(); onActivateLeaf?.(targetLeaf.card); }
    }
  }, [focusedId, rows, setFocusByDelta, setFocusHomeEnd, pageMove, onActivateLeaf]);

  const itemElements = useMemo(() => {

    if (disableVirt || viewportH === 0) {
      return rows.map(r => {
        if(r.kind==='group') {
          return (
            <div key={r.id} className="group-header" role="presentation" data-group-id={r.id}>{r.title} <span className="psy-rail__count" aria-label={`${r.count} items`}>{r.count}</span></div>
          );
        }
        const isFocused = r.id === focusedId;
        return (
          <div key={r.id} className={`leaf-row ${isFocused ? 'is-focused': ''}`} role="treeitem" aria-level={2} aria-current={r.isActive ? true : undefined} aria-selected={isFocused ? true : undefined}>
            <button
              type="button"
              className="psy-list__row"
              tabIndex={isFocused ? 0 : -1}
              data-roving-id={r.id}
              onClick={() => { r.onActivate(); onActivateLeaf?.(r.card); onFocusChange?.(r.id); }}
              onFocus={() => onFocusChange?.(r.id)}
              title={r.title}
            >
              <div className="psy-list__main">
                <div className="psy-list__title">{r.title}</div>
                {!!r.subtitle && <div className="psy-list__meta" aria-label="Item details">{r.subtitle}</div>}
                {!!r.isRisk && <span className="psy-badge psy-badge--risk" aria-label="Risk">RISK</span>}
              </div>
              <div className="psy-list__actions">
                <FavoriteStar on={r.favorite} onToggle={r.onToggleFavorite} label={`${r.favorite ? 'Remove' : 'Add'} favorite for ${r.title}`} />
              </div>
            </button>
          </div>
        );
      });
    }
    const slice = rows.slice(startIndex, endIndex + 1);
    return slice.map(r => {
      if(r.kind === 'group') {
        return (
          <div
            key={r.id}
            className="group-header"
            role="presentation"
            aria-hidden="false"
            data-group-id={r.id}
          >{r.title} <span className="psy-rail__count" aria-label={`${r.count} items`}>{r.count}</span></div>
        );
      }
      const isFocused = r.id === focusedId;
      return (
        <div key={r.id} className={`leaf-row ${isFocused ? 'is-focused': ''}`} role="treeitem" aria-level={2} aria-current={r.isActive ? true : undefined} aria-selected={isFocused ? true : undefined}>
          <button
            type="button"
            className="psy-list__row"
            tabIndex={isFocused ? 0 : -1}
            data-roving-id={r.id}
            onClick={() => { r.onActivate(); onActivateLeaf?.(r.card); onFocusChange?.(r.id); }}
            onFocus={() => onFocusChange?.(r.id)}
            title={r.title}
          >
            <div className="psy-list__main">
              <div className="psy-list__title">{r.title}</div>
              {!!r.subtitle && <div className="psy-list__meta" aria-label="Item details">{r.subtitle}</div>}
              {!!r.isRisk && <span className="psy-badge psy-badge--risk" aria-label="Risk">RISK</span>}
            </div>
            <div className="psy-list__actions">
              <FavoriteStar on={r.favorite} onToggle={r.onToggleFavorite} label={`${r.favorite ? 'Remove' : 'Add'} favorite for ${r.title}`} />
            </div>
          </button>
        </div>
      );
    });
  }, [rows, startIndex, endIndex, focusedId, onActivateLeaf, onFocusChange]);


  if (disableVirt) {
    return (
      <div role="group" aria-label="Section items" className="leaflist-scroll" style={{ maxHeight:'none', overflow:'visible' }}>
        {count === 0 ? <div className="leaflist-empty" role="status">No items. Broaden filters or clear search.</div> : itemElements}
      </div>
    );
  }

  return (
      <div
        ref={scrollRef}
        className="leaflist-scroll"
        role="group"
        aria-label="Section items"
        onKeyDown={onKeyDown}
        tabIndex={-1}
      >
        <div style={{ paddingTop: padTop, paddingBottom: padBottom }}>
          {count === 0 ? (
            <div className="leaflist-empty" role="status">No items. Broaden filters or clear search.</div>
          ) : itemElements}
        </div>
      </div>
    );
});
LeafList.displayName = 'LeafList';
