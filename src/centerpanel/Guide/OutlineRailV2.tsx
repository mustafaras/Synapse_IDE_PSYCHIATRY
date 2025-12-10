

import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Plus } from "lucide-react";
import rail from "../styles/guides.rail.module.css";
import note from "../styles/note.module.css";
import { MAIN_SCROLL_ROOT_ID } from "../sections";
import { useRegistry } from "../registry/state";
import { announce } from "./a11y/announce";

type Item = { id: string; title: string; category: string; snippet?: string };

const cssEscape = (s: string) => {

  const CSSAny = (window as any).CSS;
  if (CSSAny && typeof CSSAny.escape === "function") return CSSAny.escape(s);
  return s.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
};

export default function OutlineRailV2() {
  const { state, actions } = useRegistry();
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [focusIndex, setFocusIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");

  const [cat, setCat] = useState<string>("All");


  useEffect(() => {
    let raf = 0;
    const init = () => {
      const region = document.querySelector('[role="region"][aria-label="Guide list"]') as HTMLElement | null;
      if (!region) { raf = requestAnimationFrame(init); return; }
      rootRef.current = region;
      const cards = Array.from(region.querySelectorAll('[data-guide-id]')) as HTMLElement[];
      const mapped: Item[] = cards.map(el => ({
        id: el.getAttribute('data-guide-id') || '',
        title: (el.querySelector('[data-guide-title]')?.textContent || '').trim(),
        category: el.getAttribute('data-guide-cat') || '',
        snippet: (el.querySelector('.block')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 110),
      })).filter(i => !!i.id && !!i.title);

      const seen = new Set<string>();
      const uniq: Item[] = [];
      for (const it of mapped) { if (!seen.has(it.id)) { seen.add(it.id); uniq.push(it); } }
      setItems(uniq);
    };
    raf = requestAnimationFrame(init);
    return () => cancelAnimationFrame(raf);
  }, []);


  useEffect(() => {
    const mainRoot = document.getElementById(MAIN_SCROLL_ROOT_ID) as HTMLElement | null;
    if (!mainRoot) return;
    const cards = Array.from(document.querySelectorAll('[data-guide-id]')) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter(e => e.isIntersecting).sort((a,b)=>a.boundingClientRect.top - b.boundingClientRect.top);
      const top = vis[0]?.target as HTMLElement | undefined;
      if (top) setActiveId(top.getAttribute('data-guide-id'));
    }, { root: mainRoot, threshold: 0.25 });
    cards.forEach(c => io.observe(c));
    return () => { io.disconnect(); };
  }, [items.length]);

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const base = items.filter(it => {
      const matchesWords = words.every(w => (`${it.title} ${it.category}`).toLowerCase().includes(w));
      const matchesCat = cat === 'All' || it.category === cat;
      return matchesWords && matchesCat;
    });
    return base;
  }, [items, q, cat]);

  const rows = useMemo(() => {
    const out: Array<{ kind: 'sep'; label: string } | { kind: 'item'; item: Item }> = [];
    let last = '';
    for (const it of filtered) {
      if (it.category && it.category !== last) { out.push({ kind: 'sep', label: it.category }); last = it.category; }
      out.push({ kind: 'item', item: it });
    }
    return out;
  }, [filtered]);


  useEffect(() => {
    const list = listRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (!list || !list.contains(document.activeElement)) return;
      const onlyItems = rows.filter(r => r.kind === 'item');
      const max = Math.max(0, onlyItems.length - 1);
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusIndex(i => Math.min(i + 1, max)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setFocusIndex(i => Math.max(i - 1, 0)); }
      if (e.key === 'Home')      { e.preventDefault(); setFocusIndex(0); }
      if (e.key === 'End')       { e.preventDefault(); setFocusIndex(max); }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

  const id = (onlyItems[focusIndex] as any)?.item?.id as string | undefined;
        if (id) jumpTo(id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rows, focusIndex]);

  useEffect(() => {
    if (focusIndex < 0) return;
    const list = listRef.current;
    const onlyItems = rows.filter(r => r.kind === 'item');

  const id = (onlyItems[focusIndex] as any)?.item?.id as string | undefined;
    if (!list || !id) return;
    const target = list.querySelector(`[data-rail-id="${cssEscape(id)}"]`) as HTMLElement | null;
    target?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex, rows]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  useEffect(() => {
    window.dispatchEvent(new CustomEvent('guide:setSearch', { detail: { q } }));
  }, [q]);

  function jumpTo(id: string) {
    const mainRoot = document.getElementById(MAIN_SCROLL_ROOT_ID) as HTMLElement | null;
    if (!mainRoot) return;
    const el = document.querySelector(`[data-guide-id="${cssEscape(id)}"]`) as HTMLElement | null;
    if (!el) return;
    try {
      const rootRect = mainRoot.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const top = mainRoot.scrollTop + (elRect.top - rootRect.top) - 8;
      mainRoot.scrollTo({ top, behavior: 'smooth' });
    } catch {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function copyAllOf(id: string) {
    const el = document.querySelector(`[data-guide-id="${cssEscape(id)}"]`) as HTMLElement | null;
    const text = el ? Array.from(el.querySelectorAll('.block')).map(b => (b as HTMLElement).textContent || '').join('\n\n').trim() : '';
    if (text) { navigator.clipboard.writeText(text); announce('Copied guide section'); }
  }

  function insertAllOf(id: string) {
    const el = document.querySelector(`[data-guide-id="${cssEscape(id)}"]`) as HTMLElement | null;
    const text = el ? Array.from(el.querySelectorAll('.block')).map(b => (b as HTMLElement).textContent || '').join('\n\n').trim() : '';
    if (!text) return;
    const pid = state.selectedPatientId;
    const eid = state.selectedEncounterId;
  if (!pid || !eid) { announce('Select a patient and encounter in Registry'); return; }
    const enc = state.patients.find(p => p.id === pid)?.encounters.find(e => e.id === eid);

  const slot = (document.documentElement.dataset['guideSlot'] as any) || 'plan';

  const prev = (enc?.noteSlots as any)?.[slot] ?? '';
  const next = prev ? `${prev.trimEnd()}\n\n${text}` : text;

  actions.setEncounterSlots(pid, eid, { [slot]: next } as any);
  announce(`Inserted into ${String(slot)}`);
  }

  const onlyItems = rows.filter(r => r.kind === 'item') as Array<{ kind:'item'; item: Item }>;
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) if (it.category) set.add(it.category);
    return ["All", ...Array.from(set).sort((a,b)=>a.localeCompare(b))];
  }, [items]);

  return (
    <nav className={rail.root} aria-label="Guide left rail">
      <div className={rail.header}>
        <div className={rail.title}>Guides</div>
        <span className={rail.count} title="Visible guides count">{onlyItems.length}</span>
      </div>
      <div className={rail.card}>
        <div className={rail.cardTitle}>Search & View</div>
        <div className={rail.toolsRow}>
          <input
            ref={searchRef}
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className={rail.search}
            placeholder="Search (press / to focus)"
            aria-label="Search guides"
            onFocus={(e)=>e.currentTarget.select()}
          />
        </div>
      </div>

      <div className={rail.card}>
        <div className={rail.cardTitle}>Categories</div>
        <div className={rail.chipsWrap}>
          {categories.map(c => (
            <button key={c} className={`${note.microBtn ?? note.btnSm ?? ''} ${rail.chip}`} data-active={cat===c} onClick={()=>setCat(c)}>{c}</button>
          ))}
        </div>
      </div>

      <div className={rail.card}>
        <div className={rail.cardTitle}>All Guides</div>
        <div ref={listRef} className={rail.list} role="list">
        {rows.map((r, idx) => r.kind === 'sep' ? (
          <div key={`sep-${idx}`} role="separator" aria-label={r.label} className={rail.sep}>{r.label}</div>
        ) : (
          <div role="listitem" key={r.item.id} className={rail.row} data-rail-id={r.item.id} data-active={activeId === r.item.id ? 'true' : 'false'}>
            <span className={rail.accent} aria-hidden="true" />
            <button
              className={rail.rowBtn}
              aria-current={activeId === r.item.id || undefined}
              onClick={() => jumpTo(r.item.id)}
              onFocus={() => setFocusIndex(onlyItems.findIndex(x => x.item.id === r.item.id))}
            >
              <span className={rail.key}>{r.item.title.split('—')[0].split('-')[0].trim()}</span>
            </button>
            <div className={rail.quick}>
              <button className={rail.qBtn} title="Copy" aria-label={`Copy ${r.item.title}`} onClick={() => copyAllOf(r.item.id)}>
                <Copy size={14} />
              </button>
              <button className={rail.qBtn} title="Insert" aria-label={`Insert ${r.item.title}`} onClick={() => insertAllOf(r.item.id)}>
                <Plus size={14} />
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </nav>
  );
}
