
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./header.css";
import { performSearch } from "./searchAdapter";
import { emit, EVT, on } from "./events";
import { storage } from "./storage";
import PsychSettingsModal from "./PsychSettingsModal";
import WelcomeModal from "./WelcomeModal";
import { actCopy, actInsert, actSend, guardCopyShortcut, guardInsertShortcut, guardSendShortcut } from './ctaStubs';

type ViewMode = "card" | "prompts" | "evidence";
const MODE_ORDER: ViewMode[] = ["card", "prompts", "evidence"];
const PERSIST_KEY_MODE = "psy.header.viewMode";


function Announcer() {
  const [msg, setMsg] = useState<string>("");
  useEffect(() => {
    let timer: number | null = null;
    const set = (text: string) => {

      requestAnimationFrame(() => {
        setMsg("");
        requestAnimationFrame(() => setMsg(text));
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => setMsg(""), 3000);
      });
    };
    const onAnn = (e: Event) => set((e as CustomEvent).detail?.text ?? "");
    const onToast = (e: Event) => set((e as CustomEvent).detail?.message ?? "");
    window.addEventListener("synapse:ui:announce", onAnn as EventListener);
    window.addEventListener("synapse:ui:toast", onToast as EventListener);
    return () => {
      window.removeEventListener("synapse:ui:announce", onAnn as EventListener);
      window.removeEventListener("synapse:ui:toast", onToast as EventListener);
      if (timer) window.clearTimeout(timer);
    };
  }, []);
  return <div className="sr-announcer" aria-live="polite" aria-atomic="true">{msg}</div>;
}

export default function TopHeader() {


  const [query, setQuery] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [results, setResults] = useState<number>(0);


  const [isDirty, setIsDirty] = useState<boolean>(false);

  const [isMinimized, setIsMinimized] = useState<boolean>(false);


  const [starred] = useState<boolean>(false);


  const [available, setAvailable] = useState<Record<ViewMode, boolean>>({ card: true, prompts: true, evidence: true });
  const [counts, setCounts] = useState<Record<ViewMode, number>>({ card: 0, prompts: 0, evidence: 0 });
  const loadInitialMode = (): ViewMode => { const v = storage.get(PERSIST_KEY_MODE) as ViewMode | null; if (v && (MODE_ORDER as string[]).includes(v)) return v as ViewMode; return "card"; };
  const [view, setView] = useState<ViewMode>(loadInitialMode());
  useEffect(() => { storage.set(PERSIST_KEY_MODE, view); }, [view]);

  const ensureAvailable = useCallback((target?: ViewMode) => {
    const current = target ?? view;
    if (available[current]) return current;
    const next = MODE_ORDER.find(m => available[m]) ?? "card";
    if (next !== view) {
      setView(next);
  emit(EVT.MODE, { mode: next });
  try { window.dispatchEvent(new CustomEvent('psych:viewMode',{ detail:{ mode: next }})); } catch {}
      storage.set(PERSIST_KEY_MODE, next);
      emit(EVT.ANNOUNCE, { text: `Mode changed to ${next}` });
    }
    return next;
  }, [available, view]);


  useEffect(() => {
    const onAvail = (e: Event) => { const d = (e as CustomEvent).detail || {}; const m = d.mode as ViewMode; if (!m || !(MODE_ORDER as string[]).includes(m)) return;
      setAvailable(prev => ({ ...prev, [m]: Boolean(d.available) }));
    };
    const onCount = (e: Event) => { const d = (e as CustomEvent).detail || {}; const m = d.mode as ViewMode; const c = Number(d.count); if (!m || Number.isNaN(c)) return; setCounts(prev => ({ ...prev, [m]: c })); };
    const offAvail = on(EVT.MODE_AVAILABLE, onAvail as any);
    const offCount = on(EVT.MODE_COUNT, onCount as any);
    const onSet = (e: Event) => { const d = (e as CustomEvent).detail || {}; const m = d.mode as ViewMode; if (!m || !(MODE_ORDER as string[]).includes(m)) return; const valid = ensureAvailable(m); setView(valid); emit(EVT.MODE, { mode: valid }); emit(EVT.ANNOUNCE, { text: `Mode changed to ${valid}` }); };
    const offSet = on(EVT.MODE_SET, onSet as any);
    return () => { offAvail(); offCount(); offSet(); };
  }, [ensureAvailable]);


  useEffect(() => { ensureAvailable(); }, [available, ensureAvailable]);


  useEffect(() => {
    const onDirty = (e: Event) => { const d = (e as CustomEvent).detail || {}; if (typeof d.dirty === "boolean") setIsDirty(d.dirty); };
    const onMinSet = (e: Event) => { const d = (e as CustomEvent).detail || {}; if (typeof d.minimized === "boolean") setIsMinimized(d.minimized); };
    const onStarSet = () => {  };
    const offDirty = on(EVT.DIRTY, onDirty as any);
    const offMin = on(EVT.MINIMIZE_SET, onMinSet as any);
    const offStar = on(EVT.STAR_SET, onStarSet as any);
    return () => { offDirty(); offMin(); offStar(); };
  }, []);


  const runIdRef = useRef(0);
  const commitSearch = useCallback(async (q: string) => {
    const myId = ++runIdRef.current;
    setIsBusy(true);
    try {
      const count = await performSearch(q);
      if (myId === runIdRef.current && typeof count === 'number') {
        setResults(count);
        emit(EVT.SEARCH_RESULTS, { results: count });
  emit(EVT.ANNOUNCE, { text: count === 0 ? 'No results' : `${count} matches` });
      }
    } finally { if (myId === runIdRef.current) setIsBusy(false); }
  }, []);
  const onSearchChange = useCallback((v: string) => { setQuery(v); commitSearch(v); }, [commitSearch]);
  const clearSearch = useCallback(() => { setQuery(''); commitSearch(''); }, [commitSearch]);
  useEffect(() => {
    const handler = (e: Event) => { const detail = (e as CustomEvent).detail || {}; if (typeof detail.results === "number") setResults(detail.results); };
    const off = on(EVT.SEARCH_RESULTS, handler as any);
    return () => off();
  }, []);


  const confirmDanger = async (message: string): Promise<boolean> => {
    let decided: boolean | null = null;
    const onConfirm = (e: Event) => { const d = (e as CustomEvent).detail || {}; if (typeof d.ok === "boolean") decided = d.ok; };
  const off = on(EVT.CONFIRM_RESULT, onConfirm as any);
  emit(EVT.CONFIRM, { message });
    await Promise.resolve();
  off();

    return decided !== null ? decided : window.confirm(message);
  };
  const toggleStar = () => {  };
  const doClose = async () => { if (isDirty) { const ok = await confirmDanger("You have unsaved changes. Close anyway?"); if (!ok) return; } window.dispatchEvent(new CustomEvent("synapse:ui:close")); };

  const LS_LEFT = 'psy.hide.left';
  const LS_RIGHT = 'psy.hide.right';
  const [hideLeft, setHideLeft] = useState<boolean>(() => storage.get(LS_LEFT) === '1');
  const [hideRight, setHideRight] = useState<boolean>(() => storage.get(LS_RIGHT) === '1');

  const leftElsRef = useRef<HTMLElement[]>([]);
  const rightElsRef = useRef<HTMLElement[]>([]);
  const leftPrevDisplay = useRef<Map<HTMLElement,string>>(new Map());
  const rightPrevDisplay = useRef<Map<HTMLElement,string>>(new Map());
  const DISCOVERY_SELECTORS_LEFT = [
    '.left-rail', '.leftPanel', '[data-psy-left]', '[data-left-panel]',
    'aside[data-role="left"]', '[data-sidebar="left"]'
  ];
  const DISCOVERY_SELECTORS_RIGHT = [
    '.right-rail', '.rightPanel', '[data-psy-right]', '[data-right-panel]',
    'aside[data-role="right"]', '[data-sidebar="right"]'
  ];
  const discoverPanels = useCallback(() => {
    const uniq = <T extends HTMLElement>(arr: T[]) => Array.from(new Set(arr.filter(Boolean)));
    const leftFound: HTMLElement[] = [];
    DISCOVERY_SELECTORS_LEFT.forEach(sel => document.querySelectorAll<HTMLElement>(sel).forEach(el => leftFound.push(el)));
    leftElsRef.current = uniq(leftFound);
    const rightFound: HTMLElement[] = [];
    DISCOVERY_SELECTORS_RIGHT.forEach(sel => document.querySelectorAll<HTMLElement>(sel).forEach(el => rightFound.push(el)));
    rightElsRef.current = uniq(rightFound);
  }, []);


  const applyPanelVisibility = useCallback((side: 'left' | 'right', hide: boolean, forceRescan = false) => {
    if (forceRescan) discoverPanels();
    const targets = side === 'left' ? leftElsRef.current : rightElsRef.current;
    const prevMap = side === 'left' ? leftPrevDisplay.current : rightPrevDisplay.current;
    if (targets.length === 0) {
      discoverPanels();
    }
    (side === 'left' ? leftElsRef.current : rightElsRef.current).forEach(el => {
      if (hide) {
        if (!prevMap.has(el)) prevMap.set(el, el.style.display || '');
        el.dataset.psyHidden = '1';
        el.style.display = 'none';
      } else {
        if (prevMap.has(el)) {
          const old = prevMap.get(el) || '';
          el.style.display = old;
        } else {
          el.style.display = '';
        }
        delete el.dataset.psyHidden;
      }
    });
  }, [discoverPanels]);


  useEffect(() => {
    if (leftElsRef.current.length && rightElsRef.current.length) return;
    const observer = new MutationObserver(() => {
      const beforeL = leftElsRef.current.length;
      const beforeR = rightElsRef.current.length;
      discoverPanels();
      if (!beforeL && leftElsRef.current.length) applyPanelVisibility('left', hideLeft);
      if (!beforeR && rightElsRef.current.length) applyPanelVisibility('right', hideRight);
      if (leftElsRef.current.length && rightElsRef.current.length) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timeout = window.setTimeout(() => observer.disconnect(), 10000);
    return () => { observer.disconnect(); window.clearTimeout(timeout); };
  }, [discoverPanels, applyPanelVisibility, hideLeft, hideRight]);


  const peekLeftRef = useRef(false);
  const peekRightRef = useRef(false);
  const leftHoldTimer = useRef<number | null>(null);
  const rightHoldTimer = useRef<number | null>(null);
  const suppressNextClickLeft = useRef(false);
  const suppressNextClickRight = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      root.classList.toggle('psy-hide-left', hideLeft);
      root.classList.toggle('psy-hide-right', hideRight);

      root.setAttribute('data-psy-left-hidden', hideLeft ? '1' : '0');
      root.setAttribute('data-psy-right-hidden', hideRight ? '1' : '0');

      applyPanelVisibility('left', hideLeft);
      applyPanelVisibility('right', hideRight);

      setTimeout(() => {
        const evt = new Event('resize'); window.dispatchEvent(evt);
      }, 30);
    };
    apply();
    hideLeft ? storage.set(LS_LEFT, '1') : storage.del(LS_LEFT);
    hideRight ? storage.set(LS_RIGHT, '1') : storage.del(LS_RIGHT);
  }, [hideLeft, hideRight, applyPanelVisibility]);

  useEffect(() => { discoverPanels(); applyPanelVisibility('left', hideLeft); applyPanelVisibility('right', hideRight); }, []);
  const toggleLeft = () => {
    if (suppressNextClickLeft.current) { suppressNextClickLeft.current = false; return; }
    setHideLeft(v => {
      const next = !v;
      window.dispatchEvent(new CustomEvent('psy:panel:left', { detail: { hidden: next } }));
      emit(EVT.ANNOUNCE, { text: next ? 'Left panel hidden' : 'Left panel shown' });

      applyPanelVisibility('left', next, true);
      return next;
    });
  };
  const toggleRight = () => {
    if (suppressNextClickRight.current) { suppressNextClickRight.current = false; return; }
    setHideRight(v => {
      const next = !v;
      window.dispatchEvent(new CustomEvent('psy:panel:right', { detail: { hidden: next } }));
      emit(EVT.ANNOUNCE, { text: next ? 'Right panel hidden' : 'Right panel shown' });
      applyPanelVisibility('right', next, true);
      return next;
    });
  };

  useEffect(() => {
    const onExternalClose = () => { window.dispatchEvent(new CustomEvent("psychiatry:modal:requestClose")); };
    window.addEventListener("psychiatry:header:close", onExternalClose as any);
    return () => window.removeEventListener("psychiatry:header:close", onExternalClose as any);
  }, []);


  const [settingsOpen, setSettingsOpen] = useState(false);
  const openSettings = () => { setSettingsOpen(true); emit(EVT.ANNOUNCE, { text: "Advanced settings opened" }); };
  const closeSettings = () => { setSettingsOpen(false); emit(EVT.ANNOUNCE, { text: "Advanced settings closed" }); };


  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const openWelcome = () => { setWelcomeOpen(true); emit(EVT.ANNOUNCE, { text: "Welcome modal opened" }); };
  const closeWelcome = () => { setWelcomeOpen(false); emit(EVT.ANNOUNCE, { text: "Welcome modal closed" }); };


  useEffect(()=>{
    const auto = localStorage.getItem('psy.settings.autofocusSearch');
    if(auto !== '0') {
      setTimeout(()=>{
        if (typeof document === 'undefined') return;
        const input = document.querySelector<HTMLInputElement>('[data-testid="search-input"]');
        if(input && !document.activeElement?.matches('[data-testid="search-input"]')) input.focus();
      }, 120);
    }
  },[]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (guardSendShortcut(e)) { e.preventDefault(); actSend(); return; }
      if (guardInsertShortcut(e)) { e.preventDefault(); actInsert(); return; }
      if (guardCopyShortcut(e)) { e.preventDefault(); actCopy(); return; }
      if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "s") { e.preventDefault(); toggleStar(); return; }

      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === "x") { e.preventDefault(); doClose(); return; }
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'l') { e.preventDefault(); toggleLeft(); return; }
      if (e.altKey && e.shiftKey && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'r') { e.preventDefault(); toggleRight();  }

    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [starred, isDirty]);


  const [ovOpen, setOvOpen] = useState(false);
  const ovBtnRef = useRef<HTMLButtonElement | null>(null);
  const ovListRef = useRef<HTMLUListElement | null>(null);
  useEffect(() => {
    if (!ovOpen) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!ovListRef.current || !ovBtnRef.current) return;
      if (!ovListRef.current.contains(t) && !ovBtnRef.current.contains(t)) setOvOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [ovOpen]);
  const onOverflowKey = (e: React.KeyboardEvent) => {
    const items = ovListRef.current?.querySelectorAll<HTMLButtonElement>("button[role='menuitem']");
    if (!items || items.length === 0) return;
    const getIndex = () => Array.from(items).findIndex(el => el === document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(getIndex()+1) % items.length].focus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); items[(getIndex()-1+items.length) % items.length].focus(); }
    if (e.key === "Escape")    { e.preventDefault(); setOvOpen(false); ovBtnRef.current?.focus(); }
  };


  const [hasFixedRails, setHasFixedRails] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const left = document.querySelector<HTMLElement>(".left-rail, .leftPanel, [data-psy-left]");
    const right = document.querySelector<HTMLElement>(".right-rail, .rightPanel, [data-psy-right]");
    const applyVars = () => {
      const lw = left?.getBoundingClientRect().width ?? 0;
      const rw = right?.getBoundingClientRect().width ?? 0;
      root.style.setProperty("--left-rail-w", `${lw  }px`);
      root.style.setProperty("--right-rail-w", `${rw  }px`);
      const posL = left ? getComputedStyle(left).position : "static";
      const posR = right ? getComputedStyle(right).position : "static";
      setHasFixedRails(posL === "fixed" || posL === "sticky" || posR === "fixed" || posR === "sticky");
    };

  const SafeRO: typeof ResizeObserver | null = (typeof ResizeObserver !== 'undefined') ? ResizeObserver : null;
  const obsL = (left && SafeRO) ? new SafeRO(applyVars) : null;
  const obsR = (right && SafeRO) ? new SafeRO(applyVars) : null;
    obsL?.observe(left!); obsR?.observe(right!);
    applyVars();

    const scrollEl = document.querySelector<HTMLElement>(".psy-modal__body, [data-psy-scroll]") ?? document.scrollingElement ?? document.body;
    const onScroll = () => setIsScrolled((scrollEl instanceof HTMLElement ? scrollEl.scrollTop : window.scrollY) > 0);
    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true } as any);
    return () => {
      obsL?.disconnect(); obsR?.disconnect();
      scrollEl.removeEventListener("scroll", onScroll as any);
    };
  }, []);


  const headerClass = `psy-header ${isMinimized ? "is-minimized" : ""} ${hasFixedRails ? "has-fixed-rails" : ""} ${isScrolled ? "is-scrolled" : ""}`;


  const metricsLine = `Mode: ${view} • C/P/E: ${counts.card}/${counts.prompts}/${counts.evidence}`;
  const leftTip = `${hideLeft ? 'Show' : 'Hide'} Left Panel (Alt+Shift+L)\n${metricsLine}\nHold to Peek`;
  const rightTip = `${hideRight ? 'Show' : 'Hide'} Right Panel (Alt+Shift+R)\n${metricsLine}\nHold to Peek`;


  let statusBadge: string | null = null;
  if (hideLeft && hideRight) statusBadge = 'Zen';
  else if (!hideLeft && hideRight) statusBadge = 'Focus';
  else if (hideLeft && !hideRight) statusBadge = 'Context';


  const handleLeftMouseDown = () => {
    if (!hideLeft) return;
    leftHoldTimer.current = window.setTimeout(() => {

      const root = document.documentElement;
      root.classList.remove('psy-hide-left');
      root.setAttribute('data-psy-left-peek', '1');
      peekLeftRef.current = true;
      suppressNextClickLeft.current = true;

      applyPanelVisibility('left', false);
      emit(EVT.ANNOUNCE, { text: 'Peeking left panel' });
    }, 220);
  };
  const clearLeftHold = () => {
    if (leftHoldTimer.current) { window.clearTimeout(leftHoldTimer.current); leftHoldTimer.current = null; }
    if (peekLeftRef.current) {

      const root = document.documentElement;
      root.classList.add('psy-hide-left');
      root.removeAttribute('data-psy-left-peek');
      peekLeftRef.current = false;
      applyPanelVisibility('left', true);
      emit(EVT.ANNOUNCE, { text: 'Left panel hidden' });
    }
  };
  const handleRightMouseDown = () => {
    if (!hideRight) return;
    rightHoldTimer.current = window.setTimeout(() => {
      const root = document.documentElement;
      root.classList.remove('psy-hide-right');
      root.setAttribute('data-psy-right-peek', '1');
      peekRightRef.current = true;
      suppressNextClickRight.current = true;
      applyPanelVisibility('right', false);
      emit(EVT.ANNOUNCE, { text: 'Peeking right panel' });
    }, 220);
  };
  const clearRightHold = () => {
    if (rightHoldTimer.current) { window.clearTimeout(rightHoldTimer.current); rightHoldTimer.current = null; }
    if (peekRightRef.current) {
      const root = document.documentElement;
      root.classList.add('psy-hide-right');
      root.removeAttribute('data-psy-right-peek');
      peekRightRef.current = false;
      applyPanelVisibility('right', true);
      emit(EVT.ANNOUNCE, { text: 'Right panel hidden' });
    }
  };
  useEffect(() => {
    const onUp = () => { clearLeftHold(); clearRightHold(); };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mouseleave', onUp);
    window.addEventListener('touchend', onUp as any);
    window.addEventListener('touchcancel', onUp as any);
    return () => {
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mouseleave', onUp);
      window.removeEventListener('touchend', onUp as any);
      window.removeEventListener('touchcancel', onUp as any);
    };
  }, []);


  return (
    <>
      <Announcer />
      <header className={headerClass} role="banner" aria-label="Psychiatry Toolkit Header">
        <div className="psy-header__accent" aria-hidden="true" />
        <div className="psy-header__bar">
          {}
          <div className="psy-header__left" aria-label="Toolkit brand">
            <div className="brandCluster">
              <button className="brand brand--worldclass" data-testid="icon-help" onClick={openWelcome} aria-label="About Psychiatry Toolkit" data-tip="Welcome & About">
                <span className="brand__logomark" aria-hidden="true">
                  <svg className="brand__icon" viewBox="0 0 40 40" fill="none">
                    {}
                    <circle cx="20" cy="20" r="18" stroke="url(#brandGlow)" strokeWidth="1.5" opacity="0.6"/>
                    {}
                    <circle cx="20" cy="20" r="14" fill="url(#brandRadial)" opacity="0.12"/>
                    {}
                    <path d="M20 8 L20 20 M20 20 L28 20 M20 20 L20 32 M20 20 L12 20" stroke="url(#brandGlow)" strokeWidth="2.5" strokeLinecap="round"/>
                    {}
                    <circle cx="20" cy="20" r="2.5" fill="url(#brandGlow)">
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    {}
                    <circle cx="12" cy="12" r="1.5" fill="#3CC7FF" opacity="0.8"/>
                    <circle cx="28" cy="28" r="1.5" fill="#0077b6" opacity="0.8"/>
                    <defs>
                      <linearGradient id="brandGlow" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3CC7FF"/>
                        <stop offset="35%" stopColor="#00a8e8"/>
                        <stop offset="65%" stopColor="#0095ff"/>
                        <stop offset="100%" stopColor="#0077b6"/>
                      </linearGradient>
                      <radialGradient id="brandRadial" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#3CC7FF" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#0077b6" stopOpacity="0"/>
                      </radialGradient>
                    </defs>
                  </svg>
                  <span className="brand__glow" aria-hidden="true" />
                </span>
                <span className="brand__wordmark">
                  <span className="brand__primary">Psychiatry</span>
                  <span className="brand__separator">·</span>
                  <span className="brand__secondary">Toolkit</span>
                  <span className="brand__badge">AI</span>
                </span>
              </button>
            </div>
          </div>

          {}
          <div className="psy-header__center" aria-label="Global search">
            <div className={`search search--compact ${isBusy ? "is-busy" : ""}`} aria-busy={isBusy}>
              <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" fill="none"/><line x1="16.5" y1="16.5" x2="22" y2="22" stroke="currentColor"/></svg>
              <input
                data-testid="search-input"
                value={query}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search…"
                aria-label="Search clinical library"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { (e.target as HTMLInputElement).select(); }
                  else if (e.key === 'Enter') { commitSearch((e.target as HTMLInputElement).value); }
                  else if (e.key === 'Escape') { clearSearch(); }
                }}
              />
              {!!query && <button className="clear" data-testid="search-clear" onClick={clearSearch} aria-label="Clear search" data-tip="Clear">×</button>}
              <kbd className="hint" aria-hidden="true">⌘/Ctrl+K</kbd>
              {!!isBusy && <svg className="spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" fill="none" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20"/></svg>}
              <span className="results" role="status" aria-live="polite">{results > 0 ? `${results} matches` : ''}</span>
            </div>
          </div>

          {}
          <div className="psy-header__right">
            <div className="segmented psy-mode" role="tablist" aria-label="View mode">
              <button data-testid="tab-card" role="tab" aria-selected={view === "card"} aria-disabled={!available.card}
                className={`${view === "card" ? "is-active" : ""} ${!available.card ? "is-disabled" : ""}`}
                onClick={() => available.card && (setView(ensureAvailable("card")), emit(EVT.MODE, { mode: "card" }), window.dispatchEvent(new CustomEvent('psych:viewMode',{detail:{mode:'card'}})))}
                data-tip="Card view">Card{counts.card > 0 && <span className="badge">{counts.card}</span>}
              </button>
              <button data-testid="tab-prompts" role="tab" aria-selected={view === "prompts"} aria-disabled={!available.prompts}
                className={`${view === "prompts" ? "is-active" : ""} ${!available.prompts ? "is-disabled" : ""}`}
                onClick={() => available.prompts && (setView(ensureAvailable("prompts")), emit(EVT.MODE, { mode: "prompts" }), window.dispatchEvent(new CustomEvent('psych:viewMode',{detail:{mode:'prompts'}})))}
                data-tip="Prompts">Prompts{counts.prompts > 0 && <span className="badge">{counts.prompts}</span>}
              </button>
              <button data-testid="tab-evidence" role="tab" aria-selected={view === "evidence"} aria-disabled={!available.evidence}
                className={`${view === "evidence" ? "is-active" : ""} ${!available.evidence ? "is-disabled" : ""}`}
                onClick={() => available.evidence && (setView(ensureAvailable("evidence")), emit(EVT.MODE, { mode: "evidence" }), window.dispatchEvent(new CustomEvent('psych:viewMode',{detail:{mode:'evidence'}})))}
                data-tip="Evidence">Evidence{counts.evidence > 0 && <span className="badge">{counts.evidence}</span>}
              </button>
            </div>
            {!!statusBadge && <span className="psy-statusBadge" data-badge={statusBadge}>{statusBadge}</span>}

            <div className="actions" role="group" aria-label="Primary actions (choose with Alt+Shift+1/2/3)">
              {}
              <button
                ref={ovBtnRef}
                className="overflow"
                aria-haspopup="menu"
                aria-expanded={ovOpen}
                aria-controls="psy-overflow-menu"
                onClick={() => setOvOpen(o => !o)}
                data-tip="More…"
                data-testid="overflow-trigger"
              >⋯</button>

              {!!ovOpen && (
                <ul
                  id="psy-overflow-menu"
                  className="overflow__menu"
                  role="menu"
                  aria-label="More actions"
                  ref={ovListRef}
                  onKeyDown={onOverflowKey}
                  data-testid="overflow-menu"
                 />
              )}
            </div>

            <div className="railToggles" role="group" aria-label="Panel visibility">
              <button
                className={`iconbtn ghost railToggle ${hideLeft ? 'is-off' : 'is-on'}`}
                onClick={toggleLeft}
                onMouseDown={handleLeftMouseDown}
                onTouchStart={handleLeftMouseDown as any}
                onMouseUp={clearLeftHold}
                onMouseLeave={clearLeftHold}
                onTouchEnd={clearLeftHold as any}
                aria-pressed={!hideLeft}
                aria-label={hideLeft ? 'Show left panel' : 'Hide left panel'}
                data-tip={leftTip}
                data-panel="left"
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <rect x="3" y="5" width="8" height="22" rx="2" className="rail" />
                  <rect x="13" y="5" width="16" height="22" rx="4" className="content" />
                  <path d="M12 16 l-4 -4 M12 16 l-4 4" className="arrow" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className={`iconbtn ghost railToggle ${hideRight ? 'is-off' : 'is-on'}`}
                onClick={toggleRight}
                onMouseDown={handleRightMouseDown}
                onTouchStart={handleRightMouseDown as any}
                onMouseUp={clearRightHold}
                onMouseLeave={clearRightHold}
                onTouchEnd={clearRightHold as any}
                aria-pressed={!hideRight}
                aria-label={hideRight ? 'Show right panel' : 'Hide right panel'}
                data-tip={rightTip}
                data-panel="right"
              >
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <rect x="21" y="5" width="8" height="22" rx="2" className="rail" />
                  <rect x="3" y="5" width="16" height="22" rx="4" className="content" />
                  <path d="M20 16 l4 -4 M20 16 l4 4" className="arrow" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <div className="icons" role="group" aria-label="Utility icons">
              <button
                data-testid="icon-settings"
                className="iconbtn"
                onClick={openSettings}
                aria-label="Advanced Settings"
                data-tip="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M12 15.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm9.4-3.2c0-.6-.05-1-.14-1.5l2.1-1.6a.7.7 0 0 0 .15-.9l-2-3.5a.7.7 0 0 0-.86-.3l-2.5 1a8 8 0 0 0-2.6-1.5l-.4-2.6A.7.7 0 0 0 12.9 1h-3.8a.7.7 0 0 0-.7.6l-.4 2.6a8 8 0 0 0-2.6 1.5l-2.5-1a.7.7 0 0 0-.86.3l-2 3.5a.7.7 0 0 0 .15.9l2.1 1.6c-.1.5-.14.9-.14 1.5 0 .5.05 1 .14 1.5l-2.1 1.6a.7.7 0 0 0-.15.9l2 3.5c.2.3.56.4.86.3l2.5-1c.74.63 1.63 1.15 2.6 1.5l.4 2.6c.07.33.36.57.7.57h3.8c.34 0 .63-.24.68-.57l.4-2.6a8 8 0 0 0 2.6-1.5l2.5 1c.3.1.66 0 .86-.3l2-3.5a.7.7 0 0 0-.15-.9l-2.1-1.6c.1-.5.14-1 .14-1.5Z" fill="currentColor"/>
                </svg>
              </button>
              <button data-testid="icon-close" className="iconbtn danger" onClick={doClose} aria-label="Close Toolkit" data-tip="Close Toolkit (Alt+Shift+X)">×</button>
            </div>
          </div>
        </div>
      </header>
      {}
      {!!settingsOpen && <PsychSettingsModal open={settingsOpen} onClose={closeSettings} />}
      {!!welcomeOpen && <WelcomeModal open={welcomeOpen} onClose={closeWelcome} />}
    </>
  );
}
