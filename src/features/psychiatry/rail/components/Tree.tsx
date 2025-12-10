import React from 'react';
import { mapToLastLeafKey } from '@/features/psychiatry/content/lastLeaf.index';
import { resolveSection8Key, SECTION8_TITLES } from '@/features/psychiatry/content/section8.index';
import { getSection8TitleMeta } from '@/features/psychiatry/utils/titleResolver';

import type { SectionNode } from '../../lib/sectionHierarchy';
import type { Card } from '../../lib/types';


interface TreeProps {
  sections: SectionNode[];
  collapsed: Set<string>;
  toggleCollapse(id:string):void;
  cards: Card[];
  favorites: Record<string, true>;
  toggleFavorite(id:string):void;
  onSelectCard(id:string):void;
  selectedCardId?: string | undefined;
  riskTagIds?: string[] | undefined;
  focusIdsRef?: React.MutableRefObject<string[]>;
  totalBySection?: Record<string, number>;
  filteredBySection?: Record<string, number>;
}

export const Tree: React.FC<TreeProps> = ({ sections, collapsed, toggleCollapse, cards, favorites, toggleFavorite, onSelectCard, selectedCardId, riskTagIds, focusIdsRef, totalBySection = {}, filteredBySection = {} }) => {
  if (import.meta?.env?.MODE !== 'production') {

    console.debug('[LeftRail] mounted from rail/components/Tree.tsx');

    const section8Cards = cards.filter(c => ['pm-psqi', 'pm-ghq12', 'pm-ede-q'].includes(c.id));
    if (section8Cards.length) {

      console.debug('[Section8] Card titles in Tree:', section8Cards.map(c => ({ id: c.id, title: c.title })));
    }

    const probe = cards.find(c => /psqi|ghq|ede|y-?bocs|oasis|pdss|spin|asrm|epds/i.test(c.title));
    if (probe) {
      const k = mapToLastLeafKey(probe.title);

      console.debug('[LastLeaf] probe', { id: probe.id, title: probe.title, key: k });
    }
  }

  const cardsBySection = React.useMemo(() => {
    const map: Record<string, Card[]> = {};
    for (const c of cards) { (map[c.sectionId] ||= []).push(c); }
    return map;
  }, [cards]);


  const [childCollapsed, setChildCollapsed] = React.useState<Set<string>>(new Set());
  const toggleChild = React.useCallback((id: string) => {
    setChildCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);


  React.useEffect(() => {
    if (!selectedCardId) return;
    const found = cards.find(c => c.id === selectedCardId);
    const sid = found?.sectionId;
    if (!sid) return;
    setChildCollapsed(prev => {
      if (!prev.has(sid)) return prev;
      const next = new Set(prev); next.delete(sid); return next;
    });
  }, [selectedCardId, cards]);


  const collected: string[] = React.useMemo(() => {
    const ids: string[] = [];
    for (const group of sections) {
      if (collapsed.has(group.id)) continue;
      for (const child of (group.children || [])) {
        if (childCollapsed.has(child.id)) continue;
        const list = cardsBySection[child.id] || [];
        ids.push(...list.map(c => c.id));
      }
    }
    return ids;
  }, [sections, collapsed, childCollapsed, cardsBySection]);

  const tree = (
    <div className="psy-rail__tree" role="tree" aria-label="Sections (fallback)">
      {sections.map(group => {
        const collapsedGroup = collapsed.has(group.id);
        const children = group.children || [];
        return (
          <div className="rail-section" key={group.id} data-section-id={group.id}>
            <button
              type="button"
              className={`rail-row ${!collapsedGroup ? 'is-open': ''}`}
              aria-expanded={!collapsedGroup}
              onClick={() => toggleCollapse(group.id)}
            >
              <span className="chevron" aria-hidden="true">▶</span>
              <span className="rail-row__title">{group.label}</span>
              {(() => {

                const children = group.children || [];
                let total = 0; let shown = 0;
                for (const ch of children) {
                  total += (totalBySection[ch.id] || 0);
                  shown += (filteredBySection[ch.id] || 0);
                }
                return (
                  <span className="rail-badge" aria-label={`Items in ${group.label}: ${shown} shown out of ${total} total`}>{total} ▸ {shown}</span>
                );
              })()}
            </button>
            {!collapsedGroup && (
              <div className="rail-panel is-open" role="group" aria-label={group.label}>
                <div className="rail-panel__inner">
                  {children.map(child => {
                    const list = cardsBySection[child.id] || [];
                    if(!list.length) return null;
                    const childClosed = childCollapsed.has(child.id);
                    collected.push(...list.map(c=>c.id));
                    return (
                      <div key={child.id} className="psy-rail__groupChildBlock" data-child-id={child.id}>
                        <button
                          type="button"
                          className={`group-header ${childClosed ? '' : 'is-open'}`}
                          aria-expanded={!childClosed}
                          aria-controls={`child-panel-${child.id}`}
                          onClick={() => toggleChild(child.id)}
                        >
                          <span className="chevron" aria-hidden="true">▶</span>
                          <span className="hdr-title">{child.label}</span>
                          <span className="psy-rail__count" aria-label={`${list.length} items`}>{list.length}</span>
                        </button>
                        {!childClosed && (
                        <div id={`child-panel-${child.id}`} className="psy-rail__list" role="group" aria-label={`${child.label} items`}>
                          {list.map(card => {
                            const isActive = card.id === selectedCardId;
                            const isRisk = !!(riskTagIds && (card.tags||[]).some((t:string)=>riskTagIds.includes(t)));
                            const subtitle = typeof (card as { summary?: unknown }).summary === 'string' ? (card as { summary?: string }).summary : undefined;
                            const meta = getSection8TitleMeta({ id: card.id, title: card.title });
                            const titleNode = meta ? (
                              <span title={meta.displayTitle} aria-label={meta.displayTitle}>{meta.shortTitle}</span>
                            ) : (
                              <>
                                {String(card.title || '')}
                              </>
                            );
                            return (
                              <div key={card.id} className="leaf-row" role="treeitem" aria-level={2} aria-current={isActive? 'true': undefined} aria-selected={isActive ? true : undefined}>
                                <button
                                  type="button"
                                  className="psy-list__row"
                                  data-roving-id={card.id}
                                  tabIndex={0}
                                  onClick={() => onSelectCard(card.id)}
                                  title={meta?.displayTitle || String(card.title || '')}
                                >
                                  <div className="psy-list__main">
                                    <div className="psy-list__title">{titleNode}</div>
                                    {subtitle ? <div className="psy-list__meta" aria-label="Item details">{subtitle}</div> : null}
                                    {isRisk ? <span className="psy-badge psy-badge--risk" aria-label="Risk">RISK</span> : null}
                                  </div>
                                  <div className="psy-list__actions">
                                    <span
                                      className="fav-wrapper"
                                      role="button"
                                      tabIndex={0}
                                      onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); e.stopPropagation(); toggleFavorite(card.id); } }}
                                      onClick={(e)=>{ e.stopPropagation(); toggleFavorite(card.id); }}
                                    >
                                      {}
                                      {favorites[card.id] ? '★' : '☆'}
                                      {}
                                      {(() => { const k = resolveSection8Key(card.id) ?? resolveSection8Key(card.title); return k && SECTION8_TITLES[k].badge; })() ? (
                                        <span className="badge badge-neutral" aria-hidden="true" style={{ marginLeft: 6 }}>
                                          {(() => { const k = resolveSection8Key(card.id) ?? resolveSection8Key(card.title); return k ? SECTION8_TITLES[k].badge : null; })()}
                                        </span>
                                      ) : null}
                                    </span>
                                  </div>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
  React.useLayoutEffect(() => {
    if(!focusIdsRef) return;
    focusIdsRef.current = collected.slice();
  }, [collected, focusIdsRef]);
  return tree;
};


