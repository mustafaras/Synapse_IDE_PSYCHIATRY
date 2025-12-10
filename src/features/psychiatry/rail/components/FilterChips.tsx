import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GROUP_LABELS, resolveGroup, TAG_GROUPS } from '../tagGroups';


export interface FilterChipsProps {
  active: string[];
  tags: string[];
  onToggle(tag: string): void;
  onClearAll?: () => void;
  onAfterResetFocusSearch?: () => void;
}

type Chip = { key: string; label: string };
type GroupId = keyof typeof GROUP_LABELS;
interface RenderGroup { id: GroupId; label: string; chips: Chip[]; }

function groupFor(key: string): GroupId {
  const k = key.toLowerCase();
  return (TAG_GROUPS[k] ?? 'other') as GroupId;
}

function groupChipsForRender(chips: Chip[], selectedSet: Set<string>): RenderGroup[] {
  const order = Object.keys(GROUP_LABELS) as GroupId[];
  const buckets = new Map<GroupId, { sel: Chip[]; unsel: Chip[] }>();
  for (const id of order) buckets.set(id, { sel: [], unsel: [] });
  for (const c of chips) {
    const gid = groupFor(c.key);
    const bucket = buckets.get(gid)!;
    (selectedSet.has(c.key.toLowerCase()) ? bucket.sel : bucket.unsel).push(c);
  }
  const out: RenderGroup[] = [];
  for (const gid of order) {
    const bucket = buckets.get(gid)!;
    const merged = [...bucket.sel, ...bucket.unsel];
    if (!merged.length) continue;
    out.push({ id: gid, label: GROUP_LABELS[gid], chips: merged });
  }
  return out;
}


function useRenders(label: string){
  const ref = useRef(0); ref.current++;
  if (import.meta.env.MODE !== 'production') {

    const g: any = (window as any);
    g.__railMetrics ||= {}; g.__railMetrics[label] = (g.__railMetrics[label] || 0) + 1;
  }
}

const FilterChipsBase: React.FC<FilterChipsProps> = ({ active, tags, onToggle, onClearAll, onAfterResetFocusSearch }) => {
  useRenders('ChipBar');

  const LS_KEY = 'psy/rail:chipsExpanded:v2';
  const [expanded, setExpanded] = useState<boolean>(() => { try { return localStorage.getItem(LS_KEY) === '1'; } catch { return false; } });
  useEffect(() => { try { localStorage.setItem(LS_KEY, expanded ? '1' : '0'); } catch {  } }, [expanded]);

  const selectedSet = useMemo(() => new Set(active.map(a => a.toLowerCase())), [active]);
  const chips: Chip[] = useMemo(() => tags.map(t => ({ key: t, label: t })), [tags]);


  const recencyRef = useRef<Record<string, number>>({});
  const seqRef = useRef(0);
  const prevSelectedRef = useRef<string[]>(active);
  useEffect(() => {
    const prev = new Set(prevSelectedRef.current.map(s => s.toLowerCase()));
    for (const k of active) {
      const lk = k.toLowerCase();
      if (!prev.has(lk)) { recencyRef.current[lk] = ++seqRef.current; }
    }
    prevSelectedRef.current = active.slice();
  }, [active]);


  const [selectedList, unselectedList] = useMemo(() => {
    const sel: Chip[] = []; const unsel: Chip[] = [];
    for (const c of chips) { (selectedSet.has(c.key.toLowerCase()) ? sel : unsel).push(c); }

    sel.sort((a, b) => (recencyRef.current[b.key.toLowerCase()] || 0) - (recencyRef.current[a.key.toLowerCase()] || 0));
    return [sel, unsel];
  }, [chips, selectedSet]);

  const renderList = useMemo(() => [...selectedList, ...unselectedList], [selectedList, unselectedList]);
  const hasSelection = selectedSet.size > 0;


  const grouped = useMemo(() => groupChipsForRender(renderList, selectedSet), [renderList, selectedSet]);


  const btnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const registerRef = (idx: number) => (el: HTMLButtonElement | null) => { btnRefs.current[idx] = el; };
  const moveFocus = (from: number, delta: number) => {
    const list = btnRefs.current.filter(Boolean);
    if (!list.length) return;
    let next = from + delta;
    if (next < 0) next = 0; else if (next >= list.length) next = list.length - 1;
    list[next]?.focus();
  };
  const focusFirst = () => btnRefs.current.filter(Boolean)[0]?.focus();
  const focusLast = () => { const list = btnRefs.current.filter(Boolean); list[list.length - 1]?.focus(); };

  const onChipKey = (idx: number, key?: string, handler?: () => void) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); moveFocus(idx, +1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); moveFocus(idx, -1); }
    else if (e.key === 'Home') { e.preventDefault(); focusFirst(); }
    else if (e.key === 'End') { e.preventDefault(); focusLast(); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); key ? onToggle(key) : handler?.(); }
  };

  const handleReset = useCallback(() => {
    if (!hasSelection) return;
    if (onClearAll) onClearAll(); else active.forEach(t => onToggle(t));
    onAfterResetFocusSearch?.();
  }, [hasSelection, onClearAll, active, onToggle, onAfterResetFocusSearch]);

  let refIndex = 0;

  return (
    <div role="group" aria-label="Filters" className={`psy-chipbar ${expanded ? 'is-expanded' : 'is-compact'}`}>
      {}
      {expanded ? (
        grouped.map(g => (
          <div
            key={g.id}
            className="psy-chipgroup"
            role="group"
            aria-labelledby={`chipgroup-${g.id}`}
          >
            <div id={`chipgroup-${g.id}`} className="group-label">{g.label}</div>
            {g.chips.map(chip => {
              const selected = selectedSet.has(chip.key.toLowerCase());
              const idx = refIndex++;
              return (
                <button
                  key={chip.key}
                  ref={registerRef(idx)}
                  type="button"
                  className={`psy-chip${selected ? ' is-pinned' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onToggle(chip.key)}
                  onKeyDown={onChipKey(idx, chip.key)}
                >
                  <span className="psy-chip__label">{chip.label}</span>
                </button>
              );
            })}
          </div>
        ))
      ) : (
        grouped.map(g => (
          <div key={g.id} className="psy-chipgroup" role="group" aria-labelledby={`chipgroup-${g.id}`}
            style={{ display: 'inline-block', verticalAlign: 'top', marginRight: 12 }}
          >
            <span id={`chipgroup-${g.id}`} className="group-label compact-inline">{g.label}</span>
            {g.chips.map(chip => {
              const selected = selectedSet.has(chip.key.toLowerCase());
              const idx = refIndex++;
              return (
                <button
                  key={chip.key}
                  ref={registerRef(idx)}
                  type="button"
                  className={`psy-chip${selected ? ' is-pinned' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onToggle(chip.key)}
                  onKeyDown={onChipKey(idx, chip.key)}
                  data-group={resolveGroup(chip.key)}
                >
                  <span className="psy-chip__label">{chip.label}</span>
                </button>
              );
            })}
          </div>
        ))
      )}
      {}
      <button
        ref={registerRef(refIndex)}
        type="button"
        className="psy-chip moreless"
        aria-label={expanded ? 'Show fewer filters' : 'Show more filters'}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={onChipKey(refIndex, undefined, () => setExpanded(e => !e))}
      >
        {expanded ? 'Less' : 'More…'}
      </button>
      {(() => { refIndex++; return null; })()}
      {!!hasSelection && (
        <button
          ref={registerRef(refIndex)}
          type="button"
            className="psy-chip reset"
          aria-label="Reset filters"
          onClick={handleReset}
          onKeyDown={onChipKey(refIndex, undefined, handleReset)}
        >
          Reset
        </button>
      )}
    </div>
  );
};

export const FilterChips = memo(FilterChipsBase);
FilterChips.displayName = 'FilterChips';

