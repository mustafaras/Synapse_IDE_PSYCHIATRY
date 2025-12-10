/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */



import React, { useEffect, useMemo, useRef, useState, useCallback, Suspense } from "react";
import { createPortal } from "react-dom";
import { usePsychStore, __setPsychLibrary, useSelectedCardId, selectSelectedCard } from "./store";
import { loadLibrary as loadPsychContent } from "./content/contentLoader";
import type { Library as ContentLibrary } from "./content/ContentSchema";
import type { Card, CardDetail, SectionId, EvidenceItem } from './lib/types';
import { SECTION_TREE } from './lib/sectionHierarchy';

import TopHeader from '@/features/psychiatry/header/TopHeader';

import CenterPanelShell from '@/centerpanel/CenterPanelShell';
import OutlineNav from '@/centerpanel/OutlineNav';
import { IconSend, IconCode, IconCopy, IconPrintSmall as IconPrint } from './icons';


const CenterPanel = CenterPanelShell;
import { RailContainer } from './rail/RailContainer';
import './rail/rail.css';
import { buildCamhsCards } from './seeds/camhs';
import { buildGroupsPrograms } from './seeds/groupsPrograms';
import { buildCaseLetters } from './seeds/caseLetters';
import { buildNeuroMedCards } from './seeds/neuroMed';
import { buildLegacyLibrary } from './legacyLibrary';
const RightPanelBoundary = React.lazy(() => import('./RightPanelFourBlock').then(m => ({ default: m.RightPanelBoundary })));
import { usePsychFilter } from './hooks/usePsychFilter';


let CONTENT_LIBRARY: ContentLibrary = [];
try { const loaded = loadPsychContent?.(); if (Array.isArray(loaded)) CONTENT_LIBRARY = loaded as ContentLibrary; } catch (err) { console.warn('[PsychContent] load failed', err); }
const LEGACY_LIBRARY: Card[] = buildLegacyLibrary();
function initializePsychLibrary(){ const builders=[buildCamhsCards,buildGroupsPrograms,buildCaseLetters,buildNeuroMedCards]; const existing=new Set(LEGACY_LIBRARY.map(c=>c.id)); for(const build of builders){ try{ const cards=build(existing); for(const card of cards){ if(!existing.has(card.id)){ LEGACY_LIBRARY.push(card); existing.add(card.id);} } } catch(err){ console.warn('[PsychLibrary] builder failed', err);} } }
initializePsychLibrary();
const CONTENT_IDS = new Set(CONTENT_LIBRARY.map((c: any) => c.id));
const MERGED_LIBRARY: Card[] = [
  ...CONTENT_LIBRARY.map<Card>((c: any) => ({
    id: c.id,
    title: c.title,
    sectionId: (c.sectionId as any),
    summary: c.info,
    tags: c.tags as any,
    examples: (c.examples || []).map((ex: any) => ({ id: ex.id, label: ex.label, html: ex.html })),
    evidence: (c.references || []).filter((r: any) => !!r.title).map((r: any) => { const ev: any = { title: r.title }; if (r.year !== undefined) ev.year = r.year; if (r.journal) ev.journal = r.journal; return ev as EvidenceItem; })
  })),
  ...LEGACY_LIBRARY.filter((x: Card) => !CONTENT_IDS.has(x.id))
];

let LIBRARY: Card[] = MERGED_LIBRARY.slice();
const bigFiveIdx = LIBRARY.findIndex(c => c.id === 'big5');
if (bigFiveIdx === 0) {

  const preferredIds = ['intake-hpi-structured','intake_hpi_structured','intake_hpi_template','mse-structured','mse_quick'];
  const targetIdx = LIBRARY.findIndex(c => preferredIds.includes(c.id));
  if (targetIdx > 0) {
    const [target] = LIBRARY.splice(targetIdx,1);
    const [big5] = LIBRARY.splice(0,1);
    LIBRARY = [target, ...LIBRARY, big5];
  } else if (LIBRARY.length > 1) {

    const first = LIBRARY[0];
    LIBRARY = [LIBRARY[1], first, ...LIBRARY.slice(2)];
  }
}


const __plainCache = new Map<string,string>();
const toPlainCached = (html:string)=>{ if(__plainCache.has(html)) return __plainCache.get(html)!; const v=toPlain(html); __plainCache.set(html,v); return v; };

function toPlain(html: string): string {
  if(!html) return '';
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  } catch { return html.replace(/<[^>]+>/g,' '); }
}


function useToast(){
  const [msg,setMsg]=useState<string|null>(null); const timer=useRef<number|null>(null);
  const show=(text:string,ms=2000)=>{ setMsg(text); if(timer.current) clearTimeout(timer.current); timer.current=window.setTimeout(()=>setMsg(null),ms) as unknown as number; };
  useEffect(()=>()=>{ if(timer.current) clearTimeout(timer.current); },[]);
  const Toast=()=> msg? (<div role="status" aria-live="polite" style={{position:'fixed',left:'50%',bottom:24,transform:'translateX(-50%)',background:'rgba(0,0,0,.85)',color:'#fff',padding:'8px 12px',borderRadius:10,fontSize:12,zIndex:2147483647,border:'1px solid rgba(255,255,255,.15)'}}>{msg}</div>): null;
  return { show, Toast };
}


export interface PsychiatryModalProps {
  open?: boolean;
  onClose?: () => void;
}

export default function PsychiatryModal({ open, onClose }: PsychiatryModalProps) {

  const [isClosing, setIsClosing] = useState(false);


  const libraryInjectedRef = useRef(false);
  const librarySig = useMemo(() => {
    try { return LIBRARY.map(c => c.id).sort().join('|'); } catch { return 'na'; }
  }, []);

  useEffect(() => {
    if (!libraryInjectedRef.current && LIBRARY.length) {
      try { __setPsychLibrary(LIBRARY); } catch {  }
      libraryInjectedRef.current = true;
    }
  }, []);

  const lastSigRef = useRef<string>(librarySig);
  useEffect(() => {
    const currentSig = librarySig;
    if (lastSigRef.current !== currentSig) {
      try { __setPsychLibrary(LIBRARY); } catch {  }

      try { usePsychStore.setState(s => ({ ...s })); } catch {  }
      lastSigRef.current = currentSig;
    }
  });

  const store = usePsychStore?.() as any;


  const active = open !== undefined ? open : (store?.isOpen ?? false);


  useEffect(() => {
    console.log('🔍 [PsychiatryModal] Props & State:', {
      openProp: open,
      storeIsOpen: store?.isOpen,
      computedActive: active
    });
  }, [open, store?.isOpen, active]);

  const setOpen = (v: boolean) => {
    console.log('🎬 [PsychiatryModal] setOpen called with:', v);
    if (!v) {

      setIsClosing(true);

      setTimeout(() => {
        setIsClosing(false);
        if (open === undefined) {
          store?.close?.();
        }
        onClose?.();
      }, 300);
    } else {
      if (open === undefined) {
        store?.open?.();
      }
    }
  };


  useEffect(() => {
    const handler = () => { setOpen(false); };
    window.addEventListener('synapse:ui:close' as any, handler as any);
    return () => window.removeEventListener('synapse:ui:close' as any, handler as any);
  }, []);


  const selectedId = useSelectedCardId();
  const selectedCard = usePsychStore(selectSelectedCard) as Card | null;


      const favoritesRaw = usePsychStore(s => s.favorites) as string[] | Record<string, true> | undefined;
      const favoritesMap = useMemo(() => {
        if (!favoritesRaw) return {} as Record<string, true>;
        if (Array.isArray(favoritesRaw)) {
          return favoritesRaw.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {} as Record<string, true>);
        }
        return favoritesRaw as Record<string, true>;
      }, [favoritesRaw]);

      const toggleFavoriteStore = usePsychStore(s => s.toggleFavorite) as (id: string)=>void;

  const [outputMode] = useState<"html" | "plain">(store?.settings?.outputMode ?? "html");
  const [settingsOpen, setSettingsOpen] = useState(false);


  const navSelectedSectionId = usePsychStore(s => (s as any).selectedSectionId) as SectionId;
  const navQuery = usePsychStore(s => (s as any).navQuery ?? (s as any).query ?? '');
  const navSetQuery = usePsychStore(s => (s as any).navSetQuery ?? (s as any).setQuery);
  const navToggleTag = usePsychStore(s => (s as any).navToggleTag);
  const activeTagsSet: Set<string> = usePsychStore(s => (s as any).activeTags ?? new Set());

  const { cards: filteredCards } = usePsychFilter();
  const activeTags = useMemo(()=> Array.from(activeTagsSet), [activeTagsSet]);

  const selectedSectionId: SectionId = navSelectedSectionId;

  function toggleTag(tag:string){ navToggleTag?.(tag); }


  const [localSearch, setLocalSearch] = useState(navQuery);
  useEffect(()=> { setLocalSearch(navQuery); }, [navQuery]);
  useEffect(()=> { if(localSearch===navQuery) return; const h=setTimeout(()=> navSetQuery?.(localSearch),150); return ()=> clearTimeout(h); }, [localSearch]);


  const includePromptsInPrint = usePsychStore((s: any) => s.includePromptsInPrint ?? false);


  const [statusMsg, setStatusMsg] = useState("");


  useEffect(() => {
    const st = usePsychStore.getState();
    if (!st.setSettings) return;
    if (st.settings?.outputMode === outputMode) return;
    st.setSettings({ outputMode });
  }, [outputMode]);


  const onSelectCard = useCallback((id: string) => {
    try {
      const s = usePsychStore.getState();
      s.setSelectedCardId(id);
      s.recordView(id);
    } catch (err) {

      console.error('[P1] onSelectCard error:', err);
    }
  }, []);

  useEffect(()=>{
    if(!active) return; const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape' && settingsOpen){ setSettingsOpen(false); }
  if(e.altKey && (e.key==='q' || e.key==='Q')){ e.preventDefault(); searchRef.current?.focus(); }
    }; window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey);
  },[active, settingsOpen]);


  const toggleFavorite = (id: string) => { toggleFavoriteStore(id); };


  const filtered: Card[] = filteredCards as Card[];


  const favOnly = usePsychStore(s => (s as any).favOnly) as boolean;
  const navClearFilters = usePsychStore(s => (s as any).navClearFilters) as (()=>void) | undefined;
  const navSetSection = usePsychStore(s => (s as any).navSetSection) as ((id:string)=>void) | undefined;


  useEffect(()=> {
  const label = (()=>{ if(selectedSectionId==='all') return 'All'; for(const g of SECTION_TREE){ if(g.id===selectedSectionId) return g.label; for(const c of (g.children||[])) if(c.id===selectedSectionId) return c.label; } return 'All'; })();
    const msg = `${filtered.length} item${filtered.length===1?"":"s"} in ${label} section${activeTags.length? `; filters: ${activeTags.join(', ')}`: ''}`;
    setStatusMsg(msg);
  }, [filtered.length, selectedSectionId, activeTags]);


  useEffect(() => {
    if (!selectedId) {
      const first = filtered[0]?.id ?? LIBRARY[0]?.id ?? null;
      if (first) {
        try { usePsychStore.getState().setSelectedCardId(first); } catch {  }
      }
    }
  }, [filtered, selectedId]);


  const selected = useMemo(() => {
    if (selectedCard) return selectedCard as Card;
    if (!selectedId) return LIBRARY[0];
    const inFiltered = filtered.find((c: Card) => c.id === selectedId);
    if (inFiltered) return inFiltered;
    const inAll = LIBRARY.find(c => c.id === selectedId);
    return inAll || LIBRARY[0];
  }, [filtered, selectedId, selectedCard]);


  useEffect(() => {

    console.log('[P1] selectedCardId →', selectedId);
  }, [selectedId]);


  useEffect(() => {
    if (!selected) return;
    const center = document.querySelector('.psy-center-header');
    if (center) center.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selected.id]);


  const toggleResultsStrip = useRef<(() => void) | null>(null);
  const scrollToAnchor = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'r') { toggleResultsStrip.current?.(); }
      if (k === 'o') { scrollToAnchor('overview'); }
      if (k === 'w') { scrollToAnchor('workflow'); }
      if (k === 'x') { scrollToAnchor('examples'); }
      if (k === 'e') { scrollToAnchor('evidence'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scrollToAnchor]);


  const [treeFocusId, setTreeFocusId] = useState<string | null>(null);

  const computeTreeItems = () => {
    const rail = railRef.current; if(!rail) return [] as HTMLElement[];
    return Array.from(rail.querySelectorAll<HTMLElement>('.railbtn--group, .railbtn--child'))
      .filter(btn => btn.offsetParent !== null);
  };

  useEffect(()=> {
    const items = computeTreeItems();
    if(!items.length) return;
    if(!treeFocusId || !items.some(i => i.dataset.treeId === treeFocusId)) {
      const first = items[0];
      if(first) setTreeFocusId(first.dataset.treeId || null);
    }
  }, [selectedSectionId, filtered.length, selectedId]);


  useEffect(()=> {
    if(!treeFocusId) return;
    const el = railRef.current?.querySelector<HTMLElement>(`[data-tree-id="${treeFocusId}"]`);

    if(el && document.activeElement && railRef.current?.contains(document.activeElement)) {
      el.focus();
    }
  }, [treeFocusId]);


  const detail: CardDetail | null = useMemo(() => {
    const c = selected; if(!c) return null;
    return {
      id: c.id,
      title: c.title,
      description: c.summary ? `<p>${c.summary}</p>` : '',
      html: c.html || '',
      plain: c.html ? toPlainCached(c.html) : (c.plain || ''),
      prompts: (c.prompts || []).map(p => ({ ...p }))
    };
  }, [selected]);


  const [editorValue, setEditorValue] = useState<string>('');


  useEffect(()=>{
    if(detail?.html) setEditorValue(detail.html);
    else if(detail?.plain) setEditorValue(detail.plain);
  else setEditorValue('');
  }, [detail?.id]);


  const editorPlain = useMemo(()=> toPlain(editorValue || ''), [editorValue]);


  const libraryRef = useRef<HTMLDivElement | null>(null);


  const railRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(()=> {
    if(active){
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setTimeout(()=>{ searchRef.current?.focus(); }, 60);
    } else if(previouslyFocused.current){
      previouslyFocused.current.focus();
    }
  }, [active]);


  const { show, Toast } = useToast();


  useEffect(() => {
    if (!active) return;
    try {
      const st = usePsychStore.getState() as any;
      const navQ: string = st.navQuery || '';
      const legacyQ: string = st.query || '';
      if (!navQ && legacyQ && legacyQ.trim()) {
        st.commitQuery?.('');
        show('Cleared saved search to restore results');
      }
    } catch {  }
  }, [active]);

  useEffect(() => {
    const keep = (() => { try { return new URLSearchParams(window.location.search).has('keepFilters'); } catch { return false; } })();
    if (keep) return;
    const hasAnyFilter = (activeTags.length > 0) || !!(navQuery && navQuery.trim()) || !!favOnly || selectedSectionId !== 'all';
    if (LIBRARY.length > 0 && filtered.length === 0 && hasAnyFilter) {
      try {
        navClearFilters?.();
        navSetSection?.('all');


        try {
          const st = usePsychStore.getState() as any;
          st.commitQuery?.('');
        } catch {  }
        show('No results with saved filters — filters reset');
      } catch {  }
    }
  }, [filtered.length, activeTags.length, navQuery, favOnly, selectedSectionId, navClearFilters, navSetSection, show]);


  const buildPayload = () => {
    const html = editorValue || '<p></p>';
    const plain = editorPlain || '';
    if (outputMode === 'plain') {

  const wrapped = `<section data-origin="psychiatry-plain">${plain.split(/\n\n+/).map((p: string)=>`<p>${p.replace(/</g,'&lt;')}</p>`).join('')}</section>`;
      return { htmlWrapped: wrapped, plain, htmlRaw: html };
    }
    return { htmlWrapped: html, plain, htmlRaw: html };
  };

  const copyOut = async () => {
    const { plain, htmlWrapped } = buildPayload();
    const payload = outputMode === 'plain' ? plain : htmlWrapped;
    try { await navigator.clipboard.writeText(payload); } catch {}
    show(outputMode === 'plain' ? 'Plain text copied' : 'HTML copied');
  };

  const sendToChat = async () => {
    const { plain, htmlWrapped } = buildPayload();
    const detailPayload: any = { plainText: plain, meta: { cardId: selected?.id, title: selected?.title } };
    if (outputMode === 'html') detailPayload.html = htmlWrapped;
    window.dispatchEvent(new CustomEvent('synapse:chat:insert', { detail: detailPayload }));
    try { await navigator.clipboard.writeText(outputMode === 'plain' ? plain : htmlWrapped); } catch {}
    show(outputMode === 'plain' ? 'Sent (plain copied)' : 'Sent (HTML copied)');
  };

  const insertToEditor = async () => {
    const { plain, htmlWrapped } = buildPayload();
    window.dispatchEvent(new CustomEvent('synapse:editor:insert', { detail: { html: htmlWrapped, plainText: plain } }));
    try { await navigator.clipboard.writeText(outputMode === 'plain' ? plain : htmlWrapped); } catch {}
    show(outputMode === 'plain' ? 'Inserted (plain copied)' : 'Inserted (HTML copied)');
  };


  const backdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setOpen(false);
  };


  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); copyOut(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, copyOut]);


  const modalRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ if(active){ searchRef.current?.focus(); } }, [active]);
  useEffect(() => {
    if (!active) return;
    const el = modalRef.current!;
    const selectable = () => Array.from(el.querySelectorAll<HTMLElement>("button,[href],input,textarea,select,[tabindex]:not([tabindex='-1'])")).filter(n=>!n.hasAttribute('disabled'));
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const items = selectable(); if(!items.length) return; const a = document.activeElement as HTMLElement | null; if (e.shiftKey) { if (a === items[0]) { e.preventDefault(); items[items.length-1].focus(); } } else { if (a === items[items.length-1]) { e.preventDefault(); items[0].focus(); } }
      }
    };
  const onFocusIn = (e: FocusEvent) => { if(!el.contains(e.target as Node)){ (searchRef.current ?? el).focus(); } };
    el.addEventListener('keydown', onKeyDown); document.addEventListener('focusin', onFocusIn);
    return () => { el.removeEventListener('keydown', onKeyDown); document.removeEventListener('focusin', onFocusIn); };
  }, [active]);

  function announce(msg:string){ if(!liveRef.current) return; liveRef.current.textContent = msg; setTimeout(()=>{ if(liveRef.current) liveRef.current.textContent=''; }, 1500); }
  const onModalKeyDown = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase(); const isMac = navigator.platform.toLowerCase().includes('mac'); const mod = isMac ? e.metaKey : e.ctrlKey;
    if (k === 'escape') return;
    if (mod && k === 'enter'){ e.preventDefault(); sendToChat(); announce('Sent to Chat'); }
    if (e.altKey && k === 'enter'){ e.preventDefault(); insertToEditor(); announce('Inserted to Editor'); }
    if (mod && e.shiftKey && k === 'c'){ e.preventDefault(); copyOut(); announce('Copied HTML'); }
    if (k === 'f6') {
      e.preventDefault();
      const order:(HTMLElement|null|undefined)[]=[searchRef.current, libraryRef.current, actionsRef.current];
      const idx = order.findIndex(el=>el===document.activeElement);
      const next = order[(idx+1)%order.length];
      (next ?? searchRef.current ?? modalRef.current)?.focus();
    }
  };


  if (!active && !isClosing) return null;


  const node = (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal={true}
      aria-labelledby="psy-modal-title"
      aria-describedby="psy-modal-desc results-status"
      data-print-prompts={includePromptsInPrint ? 'on':'off'}
      onMouseDown={backdropClick}
      onKeyDown={onModalKeyDown}
      className="psych-v2"
      style={{
        position: "fixed",
        inset: 0,
        background: "#0b0c0f",
        color: "#e6eaf2",
        zIndex: 2147483647,
        display: "grid",
        gridTemplateRows: "auto 1fr 68px",
        fontFamily: 'var(--codefont)',
        animation: isClosing
          ? 'psychModalFadeOut 0.3s ease-out forwards'
          : 'psychModalFadeIn 0.3s ease-out forwards',
        opacity: isClosing ? 1 : 0
      }}
    >
      {}
      {}

  {}
  <h1 id="psy-modal-title" style={{position:'absolute',width:1,height:1,margin:0,padding:0,overflow:'hidden',clip:'rect(0 0 0 0)',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0}}>Psychiatry Toolkit</h1>
  <p id="psy-modal-desc" style={{position:'absolute',width:1,height:1,margin:0,padding:0,overflow:'hidden',clip:'rect(0 0 0 0)',clipPath:'inset(50%)',whiteSpace:'nowrap',border:0}}>Clinical forms, prompts, and evidence with HTML editor and preview.</p>
  <a className="sr-only sr-only-focusable" style={{position:'absolute',left:-10000,top:'auto',width:1,height:1,overflow:'hidden'}} href="#psy-vars">Skip to Variables</a>
  <a className="sr-only sr-only-focusable" style={{position:'absolute',left:-10000,top:'auto',width:1,height:1,overflow:'hidden'}} href="#psy-gens">Skip to Generators</a>
  <a className="sr-only sr-only-focusable" style={{position:'absolute',left:-10000,top:'auto',width:1,height:1,overflow:'hidden'}} href="#psy-evidence">Skip to Evidence</a>
  <a className="sr-only sr-only-focusable" style={{position:'absolute',left:-10000,top:'auto',width:1,height:1,overflow:'hidden'}} href="#psy-figure">Skip to Figure</a>
  <div aria-live="polite" aria-atomic="true" ref={liveRef} className="visually-hidden" />
      {}
      <TopHeader />
      {}
      <div id="results-status" role="status" aria-live="polite" className="visually-hidden">{statusMsg}</div>
      <style
        dangerouslySetInnerHTML={{
          __html: `

@keyframes psychModalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}


@keyframes psychModalFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.98);
  }
}

:root {
  --bg:#0b0c0f; --panel:#0f1116; --panel-2:#121419;
  --text:#e6eaf2; --muted:rgba(230,234,242,.65);
  --line:rgba(255,255,255,.10);
  --accent:#0EA5FF; --accent-weak:rgba(14,165,255,.14);
  --amber:#ffb547; --amber-weak:rgba(255,181,71,.14);
  --accent-rgb:14,165,255;
  --brand-fx:linear-gradient(90deg,#5af3ff 0%,#0EA5FF 40%,#12b6ff 60%,#5af3ff 100%);
  --brand-glow:0 0 0 0 rgba(var(--accent-rgb),0.0);

  --codefont: "JetBrains Mono","Fira Code",ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;


  --close-size: 36px;
  --close-gap: 16px;
  --safe-right: calc(var(--close-size) + var(--close-gap) + env(safe-area-inset-right, 0px));

  --mid-min: 24px;
  --mid-max: 180px;
}

.topbar{ position:sticky; top:0; z-index:20; display:grid; grid-template-columns: 1fr minmax(520px, 1.6fr) auto; gap:12px; align-items:center; padding:10px 14px; padding-inline-end: var(--safe-right); background:linear-gradient(180deg, rgba(12,13,16,1) 0%, rgba(12,13,16,.85) 100%); border-bottom:1px solid var(--line);}


.topbar, .rail, .library, section, .panel, .bottombar,
input, textarea, select, button, .chip, .segmented > button, .railbtn,
.prose, pre, code { font-family: var(--codefont); }


.prose { line-height: 1.55; font-size: 13.5px; }
.library .summary { line-height: 1.45; }
pre { font-size: 13.5px; }


@media (max-width: 1280px){
  .detail-narrow { grid-template-columns: 260px minmax(0, 1fr) 480px !important; }
}


.accentline{position:fixed;top:0;left:0;right:0;height:2px;z-index:2147483648;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(14,165,255,1)0 90px,rgba(0,200,255,1)90px 180px,rgba(14,165,255,1)180px 270px);background-size:540px 100%;}

@media (prefers-reduced-motion: no-preference) {
  @keyframes shimmer {
    from { background-position: 0% 0; }
    to   { background-position: 200% 0; }
  }
  .accentline { animation: shimmer 12s linear infinite; }
}


.topbar .iconbtn:focus,
.topbar button:focus,
.topbar [role="button"]:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}


@media print {
  .accentline { display: none !important; }
}
.brand{display:flex; align-items:center; gap:10px; min-width:0;} .brand__title{font-weight:700; font-size:16px; letter-spacing:.03em; display:flex; gap:4px; align-items:center;} .brand__title--fx{background:var(--brand-fx); -webkit-background-clip:text; color:transparent; position:relative;}
.brand__title--fx::after{content:""; position:absolute; inset:0; background:radial-gradient(circle at 40% 60%,rgba(14,165,255,.35),transparent 60%); mix-blend-mode:color-dodge; opacity:.55; pointer-events:none;}
.brand__accent{filter:drop-shadow(0 0 4px rgba(14,165,255,.55));}
.version-badge{position:relative; overflow:hidden;}
.version-badge::before{content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(255,255,255,.05),rgba(255,255,255,.15),rgba(255,255,255,.05)); opacity:.4; mix-blend-mode:overlay; animation:ver-shine 5s linear infinite; background-size:200% 100%;}
@keyframes ver-shine{0%{background-position:0 0;}100%{background-position:200% 0;}}
.chip{display:inline-flex; align-items:center; gap:6px; font-size:11.5px; padding:4px 8px; border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--text);} .chip--dim{opacity:.85;} .chip--amber{background:var(--amber-weak); border-color:rgba(255,181,71,.45); color:#ffe5b8;} .hide-sm{display:inline;} @media (max-width: 1100px){ .hide-sm{display:none;} } .center{display:flex; align-items:center; gap:10px; min-width:0;}

.sec-popover{ position:absolute; top:50px; left:14px; z-index:30; width:300px; max-height:480px; overflow:auto; padding:10px 12px 14px; border-radius:14px; background:var(--panel); border:1px solid var(--line); box-shadow:0 10px 32px -4px rgba(0,0,0,.55);}
.sec-popover__filter{position:sticky; top:0; background:var(--panel); padding:0 0 8px; margin:-2px 0 6px;}
.sec-popover__filter input{width:100%; padding:6px 10px; border-radius:10px; border:1px solid var(--line); background:#16181c; color:var(--text); font-size:12.5px; outline:none;}
.sec-popover__filter input:focus{border-color:var(--accent); box-shadow:0 0 0 1px var(--accent);}
.sec-group{margin-bottom:10px;}
.sec-group:last-child{margin-bottom:4px;}
.sec-group__label{font-size:11px; letter-spacing:.08em; text-transform:uppercase; opacity:.55; margin:4px 2px 6px;}
.sec-group__items{display:grid; gap:4px;}
.sec-item{ width:100%; text-align:left; padding:8px 10px; border-radius:9px; background:transparent; border:1px solid transparent; color:var(--text); cursor:pointer; font-size:13px; display:flex; justify-content:space-between; align-items:center;}
.sec-item--child{padding-left:16px; font-size:12.5px;}
.sec-item:hover{ background:rgba(255,255,255,.05);} .sec-item.is-on{ background:var(--accent-weak); border-color:var(--accent);}
.search{ flex:1; display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:12px; border:1px solid var(--line); background:#14161a; position:relative;} .search--enhanced:focus-within{box-shadow:0 0 0 2px var(--accent-weak);} .search input{ flex:1; background:transparent; border:0; color:var(--text); outline:none; font-size:13px;} .kbd{ font-size:12px; opacity:.7; } .kbd--results{position:relative; top:1px;}
.actions{display:flex; align-items:center; gap:10px; position:relative;} .actions--modern{gap:12px;}
.primary-actions{display:flex; align-items:center; gap:8px;}
.btnpill{display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,.06); color:var(--text); font-size:12.5px; cursor:pointer; line-height:1;} .btnpill--primary{background:linear-gradient(90deg,var(--accent) 0%,#12b8ff 100%); color:#041c27; font-weight:600; border-color:var(--accent);} .btnpill--primary:hover{filter:brightness(1.1);} .btnpill:hover{background:rgba(255,255,255,.10);}
.segmented{ display:inline-flex; gap:2px; padding:2px; border-radius:12px; border:1px solid var(--line); background:rgba(255,255,255,.05); position:relative;} .segmented--view{min-width:180px;} .segmented > button{ border:0; background:transparent; color:var(--text); padding:6px 10px; border-radius:10px; font-size:12px; cursor:pointer; position:relative; font-weight:500; letter-spacing:.02em;} .segmented > button[aria-pressed="true"]{ background:linear-gradient(90deg,rgba(14,165,255,.18),rgba(14,165,255,.28)); border:1px solid var(--accent); box-shadow:0 0 0 1px rgba(14,165,255,.35),0 0 8px -2px rgba(14,165,255,.8);} .segmented--small{padding:2px; border-radius:10px;} .segmented--small > button{padding:4px 8px; font-size:11px;}
.iconbtn{ width:28px; height:28px; border-radius:10px; display:inline-flex; align-items:center; justify-content:center; border:1px solid var(--line); background:rgba(255,255,255,.06); color:var(--text); cursor:pointer;} .iconbtn--close{margin-left:4px;} .iconbtn:hover{ background:rgba(255,255,255,.10);} .iconbtn.is-on{ background:rgba(255,210,74,.15); color:#ffd24a; border-color:rgba(255,210,74,.45);}
.panel{ position:absolute; top:44px; right:0; width:320px; padding:12px; border-radius:14px; background:linear-gradient(180deg,rgba(20,23,29,.97)0%,rgba(14,16,20,.97)100%); border:1px solid var(--line); box-shadow:0 14px 38px -10px rgba(0,0,0,.65),0 4px 12px -2px rgba(0,0,0,.45); color:var(--text); font-size:12px; backdrop-filter:blur(6px);} .panel.menu{width:300px; top:42px;} .panel.mega{width:640px; padding:18px 20px;} .panel__title{font-weight:600; margin-bottom:6px;} .panel__row{display:flex; align-items:center; justify-content:space-between; gap:10px; margin:8px 0;} .panel__label{opacity:.8;} .panel__footer{display:flex; justify-content:flex-end; gap:8px; margin-top:4px;} .btn{display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:10px; border:1px solid var(--line); background:rgba(255,255,255,.06); color:var(--text); cursor:pointer;} .list{margin:0; padding-left:16px; line-height:1.6;} .menu__section{margin:6px 0 10px; display:grid; gap:6px;} .menu__label{font-size:11px; letter-spacing:.08em; text-transform:uppercase; opacity:.6;} .menu-wrap{position:relative;} .menu-wrap .menu{right:0; left:auto;} .mega__grid{display:grid; grid-template-columns:repeat(3,1fr); gap:24px;} .mega__col{display:grid; gap:10px; align-content:start;} .menu__subtext{font-size:11px; line-height:1.4; opacity:.55;} .menu__divider{border:0; height:1px; background:var(--line); margin:6px 0;} .setting-control--row{display:flex; align-items:center; gap:8px;} @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(234,84,85,.18)}50%{box-shadow:0 0 0 6px rgba(234,84,85,0)}}
@media (max-width: 900px){ .panel.mega{width:520px;}.mega__grid{grid-template-columns:repeat(2,1fr);} }
@media (max-width: 640px){ .panel.mega{width:380px;}.mega__grid{grid-template-columns:1fr;} }

.neuro-commandbar{ --cb-h:52px; --cb-bg:linear-gradient(180deg, rgba(18,22,28,0.88) 0%, rgba(12,14,18,0.88) 100%); --cb-border:rgba(255,255,255,0.08); --cb-shadow:0 2px 4px -1px rgba(0,0,0,.6),0 6px 18px -6px rgba(0,0,0,.5); --cb-glow:0 0 0 1px rgba(0,160,220,0.25); position:sticky; top:0; z-index:50; display:grid; grid-template-columns: 1fr 270px auto; align-items:center; gap:14px; padding:6px 14px 8px 16px; backdrop-filter:blur(10px) saturate(140%); background:var(--cb-bg); box-shadow:var(--cb-shadow); border-bottom:1px solid var(--cb-border); }
.neuro-commandbar .brand{display:flex; align-items:center; gap:8px; min-width:0; }
.neuro-commandbar .brand__title{font-size:15px; font-weight:600; letter-spacing:.4px; background:linear-gradient(90deg,#48b6ff,#00a6d7 60%,#58e0ff); -webkit-background-clip:text; color:transparent; white-space:nowrap; }
.neuro-commandbar .brand__accent{font-weight:400; opacity:.85;}
.neuro-commandbar .version-badge{font-size:11px; padding:3px 8px; border:1px solid var(--cb-border); background:rgba(255,255,255,0.05); border-radius:999px; letter-spacing:.5px;}
.neuro-commandbar .center{display:flex; align-items:center; gap:10px; min-width:0; }
.neuro-commandbar .sec-select-group{display:flex; align-items:center; gap:6px; }
.neuro-commandbar .sec-trigger{background:rgba(255,255,255,0.05); border:1px solid var(--cb-border); padding:6px 10px; border-radius:8px; font-size:12.5px; display:inline-flex; align-items:center; gap:4px; cursor:pointer; }
.neuro-commandbar .sec-trigger:hover{background:rgba(255,255,255,.09);}
.neuro-commandbar .search{flex:1; position:relative; display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid var(--cb-border); padding:4px 10px; border-radius:10px; }
.neuro-commandbar .search input{flex:1; background:transparent; border:none; font-size:13px; color:#fff; outline:none; min-width:0; }
.neuro-commandbar .search .kbd--results{font-size:11px; opacity:.6; letter-spacing:.4px; }
.neuro-commandbar .actions{display:flex; align-items:center; gap:14px; }
.neuro-commandbar .segmented--view{display:inline-flex; background:rgba(255,255,255,0.05); border:1px solid var(--cb-border); padding:4px; border-radius:10px; gap:4px; }
.neuro-commandbar .segmented--view button{background:transparent; border:none; padding:4px 10px; font-size:12px; border-radius:6px; color:#d0d6db; cursor:pointer; letter-spacing:.3px; }
.neuro-commandbar .segmented--view button[aria-pressed='true']{background:linear-gradient(90deg,#007ea8,#00a6d7); color:#fff; box-shadow:0 0 0 1px rgba(255,255,255,0.12); }
.neuro-commandbar .primary-actions{display:flex; align-items:center; gap:8px; }
.neuro-commandbar .btnpill{background:rgba(255,255,255,0.06); border:1px solid var(--cb-border); padding:6px 12px; font-size:12.5px; border-radius:999px; display:inline-flex; align-items:center; gap:6px; cursor:pointer; color:#d8dde2; line-height:1; transition:background .18s, border-color .18s, box-shadow .18s; }
.neuro-commandbar .btnpill--primary{background:linear-gradient(90deg,#0582c2,#00a6d7); color:#fff; }
.neuro-commandbar .btnpill:hover{background:rgba(255,255,255,0.12); }
.neuro-commandbar .btnpill--primary:hover{filter:brightness(1.08); }
.neuro-commandbar .iconbtn{background:rgba(255,255,255,0.06); border:1px solid var(--cb-border); padding:6px 10px; border-radius:8px; cursor:pointer; color:#d0d6db; display:inline-flex; align-items:center; gap:4px; font-size:12px; }
.neuro-commandbar .iconbtn:hover{background:rgba(255,255,255,0.12); }
.neuro-commandbar .menu-wrap{position:relative; }
.neuro-commandbar .brand__accent{color:#73e3ff; }
.neuro-commandbar:focus-within{box-shadow:var(--cb-glow);}
@media (max-width:1400px){ .neuro-commandbar{grid-template-columns:1fr 230px auto;} }
@media (max-width:1180px){ .neuro-commandbar{grid-template-columns:1fr 200px auto; gap:10px;} }
@media (max-width:1040px){ .neuro-commandbar .primary-actions span.hide-xs{display:none;} .neuro-commandbar{grid-template-columns: 1.2fr 1fr auto;} .neuro-commandbar .btnpill{padding:6px 10px;} }
@media (max-width:880px){ .neuro-commandbar .primary-actions{display:none;} .neuro-commandbar{grid-template-columns: 1fr auto;} }
@media (max-width: 880px){ .primary-actions{display:none;} .search input{font-size:12px;} .sec-popover{left:8px; width:260px;} }

.rail{  padding:12px; overflow-y:auto; background:linear-gradient(180deg, rgba(15,17,22,1) 0%, rgba(15,17,22,.95) 100%);} .rail__head{display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:8px;} .rail__title{font-size:12px; letter-spacing:.08em; text-transform:uppercase; opacity:.7;} .rail__toggles{display:flex; gap:6px;} .chip--on{ background:var(--accent-weak); border-color:var(--accent);} .chip--ghost{ background:transparent; border-color:var(--line); opacity:.85;} .rail__group{ padding:10px 0; border-top:1px solid var(--line);} .rail__grid{ display:grid; gap:6px;} .railbtn{ width:100%; text-align:left; padding:8px 10px; border-radius:10px; border:1px solid var(--line); background:rgba(255,255,255,.04); color:var(--text); cursor:pointer; font-size:13px;} .railbtn.is-on{ background:var(--accent-weak); border-color:var(--accent);} .rail__label{ font-size:12px; text-transform:uppercase; opacity:.7; margin:0 0 6px;} .rail__chips{ display:flex; flex-wrap:wrap; gap:6px;} .rail__search{ display:flex;} .rail__search input{ width:100%; padding:8px 10px; border-radius:10px; border:1px solid var(--line); background:#17181b; color:var(--text); font-size:13px;} .mini-list{ list-style:none; padding:0; margin:0; display:grid; gap:6px;} .mini-link{ background:transparent; border:0; color:#d5eaff; text-decoration:underline; font-size:13px; cursor:pointer;} .rail__empty{ font-size:12px; opacity:.6; }

.rail-group{position:relative; margin-bottom:4px;}
.rail-group__header{display:flex; align-items:center; gap:6px;}
.rail-group__chevron{display:inline-flex; width:16px; align-items:center; justify-content:center; margin-right:4px; opacity:.8; cursor:pointer; font-size:12px;}
.railbtn--group{display:flex; align-items:center; gap:6px; font-weight:600;}
.rail-group__title{flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.rail-group__count, .rail-child__count{font-size:11px; opacity:.7;}
.rail-group__collapsebtn{width:28px; height:28px; border-radius:8px; border:1px solid var(--line); background:rgba(255,255,255,.05); color:var(--text); cursor:pointer; font-size:14px; line-height:1;}
.rail-group.is-collapsed .rail-group__children{display:none;}
.rail-group__children{margin:6px 0 6px 4px; display:grid; gap:4px;}
.railbtn--child{font-size:12.5px; padding:6px 10px; background:rgba(255,255,255,.03);}
.railbtn--child.is-on{background:var(--accent-weak);}
.railbtn--group:focus, .railbtn--child:focus{outline:2px solid var(--accent); outline-offset:2px;}

.rail-tree{display:flex; flex-direction:column; gap:4px; margin-top:4px;}
.rail-group{background:linear-gradient(180deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.02) 100%); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:4px 4px 6px; box-shadow:0 1px 2px rgba(0,0,0,.4); transition:border-color .18s, background .18s;}
.rail-group.is-collapsed{padding-bottom:4px;}
.railbtn--group{border:0; background:transparent; padding:8px 10px; border-radius:10px; position:relative; font-size:12.5px; letter-spacing:.03em; text-transform:uppercase; font-weight:600; color:var(--text); width:100%; cursor:pointer; display:flex; align-items:center; gap:8px;}
.railbtn--group:not(.is-on):hover{background:rgba(255,255,255,.05);}
.railbtn--group.is-on{background:linear-gradient(90deg, rgba(14,165,255,.18), rgba(14,165,255,.10)); box-shadow:0 0 0 1px var(--accent-weak) inset, 0 0 0 1px rgba(14,165,255,.25);}
.railbtn--group .chev{display:inline-flex; width:16px; height:16px; align-items:center; justify-content:center; font-size:13px; opacity:.85; transition:transform .18s;}
.rail-group.is-collapsed .railbtn--group .chev{transform:rotate(-90deg);}
.rail-group__count{margin-left:auto; background:rgba(255,255,255,.08); padding:2px 6px; border-radius:999px; font-size:11px; line-height:1;}
.rail-group.is-collapsed .rail-group__children{display:none;}
.rail-group__children{padding:2px 4px 0 28px; margin:0; border-left:1px solid rgba(255,255,255,.08);}
.railbtn--child{border:0; display:flex; align-items:center; gap:8px; background:transparent; border-radius:8px; font-size:13px; font-weight:500; letter-spacing:.01em; position:relative;}
.railbtn--child:not(.is-on):hover{background:rgba(255,255,255,.05);}
.railbtn--child.is-on{background:linear-gradient(90deg, rgba(14,165,255,.25), rgba(14,165,255,.08)); box-shadow:0 0 0 1px rgba(14,165,255,.35) inset;}
.railbtn--child .rail-child__count{margin-left:auto; background:rgba(255,255,255,.10); padding:2px 6px; border-radius:999px;}
.rail-tree-instructions{position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden;}


.library .item{ background:rgba(255,255,255,.03); border:1px solid var(--line);} .library .item:hover{ background:rgba(255,255,255,.05);} .library .item.on{ background:var(--accent-weak); border-color:var(--accent);} .tag{ font-size:11.5px; padding:3px 8px; border-radius:999px; border:1px solid rgba(255,255,255,.14); background:rgba(30,31,36,1);} .note--amber{ margin:10px 0; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,181,71,.45); background:var(--amber-weak); color:#ffe3b3; font-size:13px;}

.bottombar{ border-top:1px solid var(--line); background:linear-gradient(180deg, rgba(15,17,22,.98) 0%, rgba(15,17,22,.98) 100%); display:flex; align-items:center; justify-content:center; padding:10px 12px;} .btnline{ display:flex; align-items:center; gap:8px; flex-wrap:wrap;} .btnpill{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:14px; border:1px solid var(--line); background:rgba(255,255,255,.06); color:var(--text); font-size:13px; cursor:pointer;} .btnpill:hover{ background:rgba(255,255,255,.10);} .btnpill--accent{ background:rgba(255,210,74,.15); color:#ffd24a; border-color:rgba(255,210,74,.45);}

.detail-pane .panel{ background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:10px; padding:10px; position:static; width:auto; box-shadow:none; font-size:12.5px; }
.detail-pane .panel-title{ font-weight:600; margin-bottom:8px; font-size:12.5px; }
.detail-pane .segmented{ display:inline-flex; gap:6px; background:rgba(255,255,255,.06); padding:4px; border-radius:8px; border:1px solid var(--line); }
.detail-pane .segmented > button{ padding:6px 10px; border-radius:6px; border:1px solid transparent; font-size:12px; }
.detail-pane .segmented > button[aria-pressed="true"]{ background:rgba(255,255,255,.15); border-color:rgba(255,255,255,.25); }
.detail-pane .muted{ opacity:.75; }

.acad-panel{margin-top:4px; background:linear-gradient(180deg,rgba(255,255,255,.035)0%,rgba(255,255,255,.02)100%); border:1px solid rgba(255,255,255,.10); border-radius:18px; padding:18px 20px 24px; position:relative; box-shadow:0 4px 18px -4px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.04) inset; backdrop-filter:blur(4px);}
.acad-panel__head{display:flex; flex-direction:column; gap:4px; margin-bottom:14px;}
.acad-panel__head h3{margin:0; font-size:15px; letter-spacing:.04em; font-weight:600; background:linear-gradient(90deg,#9ddfff 0%,#0EA5FF 60%); -webkit-background-clip:text; color:transparent;}
.acad-meta{font-size:11px; opacity:.6; letter-spacing:.04em; text-transform:uppercase;}
.acad-nav{display:flex; flex-wrap:wrap; gap:6px; margin:-2px 0 12px;}
.acad-nav__link{font-size:11.5px; padding:5px 10px; border-radius:999px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.10); color:var(--text); text-decoration:none; line-height:1;}
.acad-nav__link:hover, .acad-nav__link:focus{background:var(--accent-weak); border-color:var(--accent); outline:none;}
.acad-body{display:grid; gap:20px;}
.acad-block{position:relative; padding:14px 16px 16px; border:1px solid rgba(255,255,255,.08); border-radius:14px; background:rgba(255,255,255,.03);}
.acad-block__title{margin:0 0 8px; font-size:13px; font-weight:600; letter-spacing:.03em; text-transform:uppercase; opacity:.85;}
.acad-block__content p{margin:0 0 10px; font-size:13px; line-height:1.5;}
.acad-block__content ul, .acad-block__content ol{margin:4px 0 10px 18px; padding:0; font-size:12.5px; line-height:1.45; display:grid; gap:4px;}
.acad-tag{display:inline-flex; align-items:center; font-size:11px; padding:3px 8px; border-radius:999px; background:rgba(14,165,255,.12); border:1px solid rgba(14,165,255,.4); margin:2px 6px 2px 0;}
.risk-banner{margin-top:12px; font-size:12.5px; line-height:1.4; background:var(--amber-weak); border:1px solid rgba(255,181,71,.45); color:#ffe3b3; padding:10px 12px; border-radius:12px;}
.acad-evidence-list{list-style:disc; margin:6px 0 0 18px; padding:0; display:grid; gap:4px; font-size:12.5px;}
.acad-evidence-list li{line-height:1.4;}
.cite-title{font-weight:500;}
.cite-meta{margin-left:6px; opacity:.6; font-size:11.5px;}
.impl-steps{counter-reset:impl; display:grid; gap:6px; margin:6px 0 0 18px; font-size:12.5px; line-height:1.5;}
.impl-steps li{position:relative;}
.bullet-grid{list-style:disc; margin:6px 0 0 18px; display:grid; gap:4px;}
@media (max-width:1200px){ .acad-panel{padding:16px 16px 20px;} }
@media (max-width:980px){ .acad-panel{display:none;} }

.library{border-left:1px solid var(--line); border-right:1px solid var(--line);}
`
        }}
      />

      {}
      <section
        className="psy-shell"
        style={{
          ['--left-w' as any]: '500px',
          ['--right-w' as any]: '600px',
        }}
      >
        {}
        <div className="leftRail">
          <RailContainer
            cards={LIBRARY as any}
            favorites={favoritesMap as any}
            toggleFavorite={toggleFavorite as any}
            onSelectCard={onSelectCard}
            selectedCardId={selectedId as any}
            activeTags={activeTags as any}
            onToggleTag={(tag:string)=>{ toggleTag(tag); }}
            riskTagIds={['risk','suicide','psychosis']}
          />
        </div>
        {}
        <div className="midCol" aria-hidden={false} style={{ pointerEvents: 'auto', overflow: 'hidden' }}>
          <div style={{ height: '100%', overflow: 'auto' }}>
            <CenterPanel
              title="Clinician Copilot"
              subtitle="P1 — Guide skeleton with Outline • coder font"
              outlineSlot={<OutlineNav />}
            />
          </div>
        </div>

  {}
        {}
        <aside className="rightPane" style={{ position:'relative', overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {}
          <Suspense fallback={<div className="rp-panel" aria-busy="true" />}>
            <RightPanelBoundary
              key={selected.id}
              card={{...selected}}
              onClose={()=> { const { setSelectedCardId } = usePsychStore.getState() as any; setSelectedCardId?.(null); }}
            />
          </Suspense>
        </aside>
      </section>

      {}

      {}
      <div role="toolbar" aria-label="Actions" className="bottombar psy-actions" ref={actionsRef}>
        <div className="btnline">
          <button className="btnpill" onClick={sendToChat}><IconSend/> <span>Send to Chat</span></button>
          <button className="btnpill" onClick={insertToEditor}><IconCode/> <span>Insert to Editor</span></button>
          <button className="btnpill" onClick={copyOut}><IconCopy/> <span>Copy</span></button>
          <button
            className={`btnpill ${selected.id && favoritesMap[selected.id] ? 'btnpill--accent' : ''}`}
            onClick={() => toggleFavorite(selected.id)}
            aria-pressed={!!(selected.id && favoritesMap[selected.id])}
            title="Favorite"
          >★ <span>{selected.id && favoritesMap[selected.id] ? 'Unstar' : 'Star'}</span></button>
          <button className="btnpill" onClick={()=>window.print()}><IconPrint/> <span>Print</span></button>
        </div>
      </div>
      <Toast />
      <style>{`
        .sr-only { position:absolute !important; left:-10000px !important; width:1px !important; height:1px !important; padding:0 !important; margin:-1px !important; overflow:hidden !important; clip:rect(0 0 0 0) !important; white-space:nowrap !important; border:0 !important; }
        .sr-only-focusable:focus { position:static !important; left:auto !important; width:auto !important; height:auto !important; overflow:visible; }
        .setting-row { display:grid; grid-template-columns: 140px 1fr; gap: 8px; align-items:center; font-size: 12.5px; margin:8px 0 4px; }
        .setting-label { opacity:.8 }
        .setting-control { display:flex; gap:8px; align-items:center; font-size:12.5px; }
        @media print { .ready-prompts[data-print="off"] { display:none !important; } }
        .prompt-item button { font-size:12px; }
        @media print { .safety-banner { break-inside: avoid; } }
        .visually-hidden { position:absolute !important; width:1px !important; height:1px !important; padding:0 !important; margin:-1px !important; overflow:hidden !important; clip:rect(0 0 0 0) !important; white-space:nowrap !important; border:0 !important; }

        @media print {
          .btn, .btn-group, .tag, .psy-actions, .psy-gens label, input[type="range"] { display: none !important; }
          .psy-figure-preview, .psy-preview, .psy-code-textarea { border: none !important; background:#fff !important; color:#000 !important; }
          .psy-evidence .muted { color: #000 !important; opacity: 1; }
          body { color:#000 !important; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
          h2, h3 { page-break-after: avoid; }
          figure, table, .evidence { page-break-inside: avoid; }
          @page { margin: 14mm; }
          [data-print-prompts='off'] #rp-cmds { display:none !important; }
        }

  :root { --left-w:500px; --right-w:600px; }
        .psych-v2, .psych-v2 * { box-sizing:border-box; }
        .psych-v2 .psy-shell{
          display: grid;
          grid-template-columns: var(--left-w) minmax(0,1fr) var(--right-w);
          gap: 0;
          width: 100vw;
          max-width: 100vw;
          overflow-x: hidden;
          height: 100%;
        }

        :root { --app-bottom-bar-h: 40px; }
        .psych-v2 .leftRail { max-height: calc(100dvh - var(--app-bottom-bar-h)); }
        .psych-v2 .leftRail .psy-rail { height:100%; }
        .psych-v2 .leftRail .psy-rail__scroll { flex:1; }

        .psych-v2 .leftRail, .psych-v2 .rightPane { background:#0f1116 !important; }

        .psych-v2 .leftRail .psy-rail__scroll, .psych-v2 .leftRail { padding-right:0 !important; margin-right:0 !important; }
        .psych-v2 .leftRail .psy-rail__item, .psych-v2 .leftRail .psy-rail__groupBtn { margin-right:0 !important; }

        .psych-v2 .rightPane { border-left:1px solid rgba(255,255,255,0.06); box-shadow: -1px 0 0 0 rgba(255,255,255,0.04); }
        .psych-v2 .leftRail{
          grid-column: 1;
          position: relative;
          z-index: 1;
          margin: 0 !important;
          padding: 0 !important;

          height: 100%;
          overflow-y: auto;
        }
        .psych-v2 .midCol{
          grid-column: 2;
          min-width: 0;
          width: auto;
          max-width: none;
          pointer-events: auto;
          position: relative;
          z-index: 0;
        }
        .psych-v2 .midCol::before,
        .psych-v2 .midCol::after{
          content: none !important;
        }
        .psych-v2 .rightPane{
          grid-column: 3;
          position: relative;
          z-index: 1;
          min-width: var(--right-w);
          max-width: var(--right-w);
          width: var(--right-w);
          overflow-y: auto;
        }
        .topbar{ position: sticky; top: 0; z-index: 20; }

        @media (max-width:1024px){
          .psych-v2 .leftRail, .psych-v2 .midCol{display:none;}
          .psych-v2 .psy-shell{grid-template-columns:1fr;}
          .psych-v2 .rightPane{grid-column:1; min-width:0; max-width:100%; width:100%;}
        }
      `}</style>
    </div>
  );

  return createPortal(node, document.body);
}


