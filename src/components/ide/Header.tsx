import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SYNAPSE_COLORS, SYNAPSE_TYPO, withAlpha } from '../../ui/theme/synapseTheme';

type TabLike = { id: string; name: string; isDirty?: boolean; isPinned?: boolean };

export type Density = 'compact' | 'comfortable' | 'relaxed';

interface HeaderProps {
  aiAssistantRightGutter: number;

  onNewFile: () => void;
  onClearAll: () => void;
  onToggleSidebar: () => void;
  onToggleTerminal: () => void;
  onToggleAI?: () => void;
  sidebarActive: boolean;
  terminalActive: boolean;
  aiActive?: boolean;

  tabs: TabLike[];
  activeTabId?: string | null;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onOpenCommandPalette?: () => void;
  onGlobalSearch?: () => void;
  onCloseOthers?: (id: string) => void;
  onCloseRight?: (id: string) => void;
  onTogglePin?: (id: string) => void;

  dirtyCount?: number;
  onSaveAll?: () => void;
  onRun?: () => void;
  onBuild?: () => void;
}

const ICON_SIZE = 16;

const useLocalStorageState = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue] as const;
};

export const Header: React.FC<HeaderProps> = ({
  aiAssistantRightGutter,
  onNewFile,
  onClearAll,
  onToggleSidebar,
  onToggleTerminal,
  onToggleAI,
  sidebarActive,
  terminalActive,
  aiActive = true,
  tabs,
  activeTabId,
  onTabClick,
  onTabClose,
  onReorder,
  onOpenCommandPalette,
  onGlobalSearch,
  onCloseOthers,
  onCloseRight,
  onTogglePin,
  dirtyCount = 0,
  onSaveAll,
  onRun,
  onBuild,
}) => {

  const [density, setDensity] = useLocalStorageState<Density>(
    'synapse.header.density',
    'comfortable'
  );

  const densityScale = useMemo(
    () =>
      ({
        compact: 0.9,
        comfortable: 1.0,
        relaxed: 1.1,
      })[density],
    [density]
  );

  const headerHeight = Math.round((density === 'compact' ? 56 : 64) * densityScale);
  const padInline = Math.round(16 * densityScale);
  const gap = Math.round(12 * densityScale);


  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);


  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const scrollTabs = (dir: 'left' | 'right') => {
    const el = tabsRef.current;
    if (!el) return;
    const delta = dir === 'left' ? -160 : 160;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };


  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) {

        const boost = 1.75;
        const dx = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * boost;
        el.scrollLeft += dx;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel as any);
  }, [tabsRef.current]);


  const dragFrom = useRef<number | null>(null);
  const autoScroll = (clientX: number) => {
    const el = tabsRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const edge = 40;
    if (clientX < rect.left + edge) el.scrollLeft -= 24;
    if (clientX > rect.right - edge) el.scrollLeft += 24;
  };

  const onDragStart = (index: number) => (e: React.DragEvent) => {
    dragFrom.current = index;
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch {}
  };
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    autoScroll(e.clientX);
  };
  const onDrop = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const from = dragFrom.current;
    dragFrom.current = null;
    setDropIndex(null);
    if (from === null) return;
    let to = index;

    if (from < to) to = to - 1;
    if (from === to) return;
    onReorder(from, to);
  };


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isAlt = e.altKey;
      const isShiftOrMeta = e.shiftKey || e.metaKey || e.ctrlKey;
      if (!isAlt || !isShiftOrMeta) return;
      if (!activeTabId) return;
      const i = tabs.findIndex(t => t.id === activeTabId);
      if (i < 0) return;
      if (e.key === 'ArrowLeft' && i > 0) {
        e.preventDefault();
        onReorder(i, i - 1);
      } else if (e.key === 'ArrowRight' && i < tabs.length - 1) {
        e.preventDefault();
        onReorder(i, i + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tabs, activeTabId, onReorder]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (isMeta && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
      if (isMeta && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        onGlobalSearch?.();
      }
      if (isMeta && !e.shiftKey && (e.key === 'p' || e.key === 'P')) {

        e.preventDefault();
        setMenuOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onOpenCommandPalette, onGlobalSearch]);

  const labelMuted = withAlpha(SYNAPSE_COLORS.textSecondary, 0.6);
  const [ctxOpenId, setCtxOpenId] = useState<string | null>(null);
  const ctxRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ctxRef.current?.contains(e.target as Node)) setCtxOpenId(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <header
      role="banner"
      aria-label="Synapse IDE header"
      style={{
        minHeight: headerHeight,
        display: 'flex',
        alignItems: 'center',
        paddingInline: padInline,
        gap,
        background:
          'var(--header-bg, linear-gradient(180deg, rgba(26,26,26,0.96), rgba(18,18,18,0.96)))',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: 'var(--header-border, 1px solid #FFFFFF10)',
        boxShadow:
          'var(--header-shadow, 0 1px 0 rgba(255,255,255,0.06), 0 6px 16px rgba(0,0,0,0.35))',
        position: 'relative',

        zIndex: 10020,
        userSelect: 'none',

        width: aiAssistantRightGutter > 0 ? `calc(100vw - ${aiAssistantRightGutter}px)` : '100vw',

        borderRight: aiAssistantRightGutter > 0 ? `1px solid ${withAlpha('#FFFFFF', 0.1)}` : 'none',
      }}
    >
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap, minWidth: 0 }}>
        <div
          aria-hidden="true"
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            background: 'linear-gradient(135deg, rgba(32,32,32,.95), rgba(22,22,22,.95))',
            border: '1px solid rgba(0,166,215,0.35)',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={SYNAPSE_COLORS.goldPrimary}
            aria-hidden="true"
          >
            <circle cx="6" cy="6" r="2" />
            <circle cx="18" cy="6" r="2" />
            <circle cx="6" cy="18" r="2" />
            <circle cx="18" cy="18" r="2" />
            <circle cx="12" cy="12" r="2.2" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontFamily: SYNAPSE_TYPO.fontFamily,
              fontSize: '16px',
              letterSpacing: '-0.01em',
              fontWeight: 600,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',

              background: 'linear-gradient(180deg, #5FD6F5 0%, #00A6D7 55%, #036E8D 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#5FD6F5',
              display: 'inline-block',
            }}
          >
            Synapse_IDE
          </div>
          <div
            className="hdr-sub"
            style={{
              fontFamily: SYNAPSE_TYPO.fontFamily,
              fontSize: '11px',
              fontWeight: 500,
              color: labelMuted,
              whiteSpace: 'nowrap',
            }}
          >
            AI‑Assisted IDE for Beginners
          </div>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap }}>
          <button
            aria-label="Create new file"
            title="New File (Ctrl+N)"
            onClick={onNewFile}
            style={{
              height: 32 * densityScale,
              padding: `0 ${Math.round(12 * densityScale)}px`,
              borderRadius: 10,
              border: '1px solid rgba(0,166,215,0.45)',
              background: 'linear-gradient(135deg, rgba(0,166,215,.18), rgba(0,166,215,.10))',
              color: '#00A6D7',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hdr-label">New</span>
          </button>

          <button
            aria-label="Clear workspace"
            title="Clear All"
            onClick={onClearAll}
            style={{
              height: 32 * densityScale,
              padding: `0 ${Math.round(12 * densityScale)}px`,
              borderRadius: 10,
              border: '1px solid rgba(231,76,60,0.45)',
              background: 'linear-gradient(135deg, rgba(231,76,60,.18), rgba(231,76,60,.10))',
              color: '#E74C3C',
              fontWeight: 600,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M3 6h18M8 6l1 14h6l1-14M10 6V4h4v2" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hdr-label">Clear</span>
          </button>
        </div>
      </div>

      {}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          aria-label="Scroll tabs left"
          title="Scroll left"
          onClick={() => scrollTabs('left')}
          style={chevStyle()}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M15 6l-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Editor tabs"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: Math.max(8, Math.round(12 * densityScale)),
            overflowX: 'auto',
            overflowY: 'hidden',
            scrollbarWidth: 'thin',
            paddingBlock: 6,
          }}
        >
          {tabs
            .map((t, i) => ({ t, i }))
            .sort((a, b) => Number(b.t.isPinned) - Number(a.t.isPinned) || a.i - b.i)
            .map(({ t, i: idx }) => (
              <div
                key={t.id}
                role="tab"
                aria-selected={t.id === activeTabId}
                title={t.name}
                draggable
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver}
                onDrop={onDrop(idx)}
                onDragEnter={() => setDropIndex(idx)}
                onContextMenu={e => {
                  e.preventDefault();
                  setCtxOpenId(t.id);
                }}
                onMouseDown={e => {
                  if (e.button === 1) {
                    e.preventDefault();
                    onTabClose(t.id);
                  }
                }}
                onClick={() => onTabClick(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: SYNAPSE_TYPO.fontFamily,
                  fontSize: 13,
                  fontWeight: t.id === (activeTabId ?? '') ? 600 : 500,
                  color:
                    t.id === (activeTabId ?? '')
                      ? SYNAPSE_COLORS.textAccent
                      : SYNAPSE_COLORS.textSecondary,
                  background:
                    t.id === (activeTabId ?? '')
                      ? withAlpha(SYNAPSE_COLORS.goldPrimary, 0.1)
                      : 'transparent',
                  border: `1px solid ${t.id === (activeTabId ?? '') ? withAlpha(SYNAPSE_COLORS.goldPrimary, 0.5) : 'transparent'}`,
                  position: 'relative',
                }}
              >
                {}
                {dropIndex === idx && (
                  <span
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: -4,
                      top: 6,
                      bottom: 6,
                      width: 2,
                      background: withAlpha(SYNAPSE_COLORS.goldPrimary, 0.9),
                      borderRadius: 2,
                    }}
                  />
                )}
                {t.isPinned ? <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill={withAlpha(SYNAPSE_COLORS.textSecondary, 0.9)}
                    aria-hidden
                    style={{ marginRight: 2 }}
                  >
                    <path d="M14 3l7 7-4 4-7-7 4-4zm-5 8l-5 10 10-5" />
                  </svg> : null}
                <span>{t.name}</span>
                {t.isDirty ? <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: SYNAPSE_COLORS.blueGray,
                    }}
                  /> : null}
                <button
                  aria-label={`Close ${t.name}`}
                  onClick={e => {
                    e.stopPropagation();
                    onTabClose(t.id);
                  }}
                  style={{
                    display: 'grid',
                    placeItems: 'center',
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    color: withAlpha(SYNAPSE_COLORS.textSecondary, 0.9),
                  }}
                >
                  <svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M6 6l12 12M18 6l-12 12" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>

                {ctxOpenId === t.id && (
                  <div
                    ref={ctxRef}
                    role="menu"
                    style={{
                      position: 'absolute',
                      marginTop: 36,
                      right: 0,
                      minWidth: 180,
                      background: 'rgba(22,22,22,0.98)',
                      border: `1px solid ${SYNAPSE_COLORS.border}`,
                      borderRadius: 8,
                      boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                      display: 'grid',
                    }}
                  >
                    <button
                      role="menuitem"
                      onClick={e => {
                        e.stopPropagation();
                        onTabClose(t.id);
                        setCtxOpenId(null);
                      }}
                      style={ctxItem()}
                    >
                      Close
                    </button>
                    <button
                      role="menuitem"
                      onClick={e => {
                        e.stopPropagation();
                        onCloseOthers?.(t.id);
                        setCtxOpenId(null);
                      }}
                      style={ctxItem()}
                    >
                      Close Others
                    </button>
                    <button
                      role="menuitem"
                      onClick={e => {
                        e.stopPropagation();
                        onCloseRight?.(t.id);
                        setCtxOpenId(null);
                      }}
                      style={ctxItem()}
                    >
                      Close to the Right
                    </button>
                    <button
                      role="menuitem"
                      onClick={e => {
                        e.stopPropagation();
                        onTogglePin?.(t.id);
                        setCtxOpenId(null);
                      }}
                      style={ctxItem()}
                    >
                      {t.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  </div>
                )}
              </div>
            ))}
        </div>

        <button
          aria-label="Scroll tabs right"
          title="Scroll right"
          onClick={() => scrollTabs('right')}
          style={chevStyle()}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {}
        <div style={{ position: 'relative', zIndex: 10030 }} ref={menuRef}>
          <button
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            title="All tabs (Ctrl+P)"
            onClick={() => setMenuOpen(v => !v)}
            style={chevStyle()}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {menuOpen ? <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                minWidth: 240,
                maxHeight: 300,
                overflow: 'auto',
                background: 'rgba(22,22,22,0.98)',
                border: `1px solid ${SYNAPSE_COLORS.border}`,
                borderRadius: 10,
                boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                padding: 8,
              }}
            >
              <TypeAhead
                tabs={tabs}
                onPick={id => {
                  onTabClick(id);
                  setMenuOpen(false);
                }}
                onDensityChange={setDensity}
                currentDensity={density}
              />
            </div> : null}
        </div>
      </div>

      {}
      <div className="hdr-right" style={{ display: 'flex', alignItems: 'center', gap }}>
        {}
        <button
          aria-label="Save All"
          title="Save All"
          onClick={() => onSaveAll?.()}
          style={ghostBtn(dirtyCount > 0)}
        >
          <div style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden
            >
              <path d="M5 5h14v14H5z" strokeWidth="2" />
              <path d="M7 5h6v6H7z" strokeWidth="2" />
            </svg>
            {dirtyCount > 0 && (
              <span
                aria-label={`${dirtyCount} unsaved`}
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                  background: '#E74C3C',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '0 5px',
                  fontSize: 10,
                  lineHeight: '14px',
                  minWidth: 14,
                  textAlign: 'center',
                  border: '1px solid #00000040',
                }}
              >
                {dirtyCount > 9 ? '9+' : dirtyCount}
              </span>
            )}
          </div>
        </button>

        {}
        <div style={{ position: 'relative', zIndex: 10030 }}>
          <details>
            <summary style={{ listStyle: 'none' }}>
              <button aria-haspopup="menu" title="Run / Build" style={ghostBtn(false)}>
                <svg
                  width={ICON_SIZE}
                  height={ICON_SIZE}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7z" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </button>
            </summary>
            <div
              role="menu"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                minWidth: 160,
                background: 'rgba(22,22,22,0.98)',
                border: `1px solid ${SYNAPSE_COLORS.border}`,
                borderRadius: 8,
                boxShadow: '0 12px 28px rgba(0,0,0,0.45)',
                padding: 6,
              }}
            >
              <button role="menuitem" onClick={() => onRun?.()} style={ctxItem()}>
                Run Dev Server
              </button>
              <button role="menuitem" onClick={() => onBuild?.()} style={ctxItem()}>
                Build Project
              </button>
            </div>
          </details>
        </div>
        <button
          aria-label="Toggle sidebar"
          title="Sidebar"
          onClick={onToggleSidebar}
          style={ghostBtn(sidebarActive)}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path d="M3 5h18M3 12h8M3 19h18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <button
          aria-label="Toggle terminal"
          title="Terminal"
          onClick={onToggleTerminal}
          style={ghostBtn(terminalActive)}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              d="M4 5h16v14H4zM7 9l4 3-4 3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {}
        <button
          data-testid="toggle-ai"
          aria-label="Toggle AI Assistant"
          title="AI Assistant"
          onClick={onToggleAI}
          style={ghostBtn(!!aiActive)}
        >
          {}
          <svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" aria-hidden>
            <circle cx="6" cy="6" r="1.8" fill="currentColor" />
            <circle cx="18" cy="6" r="1.8" fill="currentColor" />
            <circle cx="6" cy="18" r="1.8" fill="currentColor" />
            <circle cx="18" cy="18" r="1.8" fill="currentColor" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>
        {}
        <button
          aria-label="Global Search (Ctrl+Shift+F)"
          title="Global Search (Ctrl+Shift+F)"
          onClick={() => onGlobalSearch?.()}
          style={ghostBtn(false)}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {}
        <button
          aria-label="Command Palette (Ctrl+K)"
          title="Command Palette (Ctrl+K)"
          onClick={() => onOpenCommandPalette?.()}
          style={ghostBtn(false)}
        >
          <svg
            width={ICON_SIZE}
            height={ICON_SIZE}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="3" strokeWidth="2" />
            <path d="M7 9h10M7 13h6" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        {}
        <div
          aria-hidden="true"
          style={{
            fontFamily: SYNAPSE_TYPO.fontFamily,
            fontSize: 11,
            color: labelMuted,
            background: withAlpha('#fff', 0.06),
            border: `1px solid ${SYNAPSE_COLORS.border}`,
            padding: '4px 8px',
            borderRadius: 6,
            display: 'none',
          }}
        >
          Ctrl+K
        </div>

        {}
        <div style={{ position: 'relative', zIndex: 10030 }}>
          <button
            aria-haspopup="menu"
            title="More"
            onClick={() => setMenuOpen(v => !v)}
            style={ghostBtn(false)}
          >
            <svg
              width={ICON_SIZE}
              height={ICON_SIZE}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </div>

      {}
      <style>{`
        @media (max-width: 900px){
          .hdr-sub{ display:none; }
          .hdr-label{ display:none; }
          .hdr-right > *:not(:last-child){ display:none; }
        }
        @media (max-width: 1200px){
          [role="tablist"]{ gap: 8px !important; }
        }
  header button:focus-visible{ outline: none; box-shadow: 0 0 0 2px rgba(0,166,215,0.55); }
      `}</style>
    </header>
  );
};

function chevStyle(): React.CSSProperties {
  return {
    height: 30,
    width: 30,
    display: 'grid',
    placeItems: 'center',
    borderRadius: 8,
    border: `1px solid ${SYNAPSE_COLORS.border}`,
    color: SYNAPSE_COLORS.textPrimary,
    background: 'linear-gradient(135deg, rgba(255,255,255,.05), rgba(255,255,255,.03))',
  };
}

function ghostBtn(active: boolean): React.CSSProperties {
  return {
    height: 32,
    width: 36,
    borderRadius: 10,
  border: `1px solid ${active ? withAlpha(SYNAPSE_COLORS.goldPrimary, 0.5) : '#FFFFFF10'}`,
    background: active
      ? 'linear-gradient(135deg, rgba(0,166,215,.16), rgba(0,166,215,.08))'
      : 'linear-gradient(135deg, rgba(255,255,255,.05), rgba(255,255,255,.03))',
    color: active ? SYNAPSE_COLORS.textAccent : '#E0E0E0',
    display: 'grid',
    placeItems: 'center',
  };
}

function ctxItem(): React.CSSProperties {
  return {
    textAlign: 'left',
    padding: '8px 10px',
    background: 'transparent',
    color: SYNAPSE_COLORS.textPrimary,

    borderBottom: `1px solid ${withAlpha('#fff', 0.06)}`,
    fontFamily: SYNAPSE_TYPO.fontFamily,
  };
}

const TypeAhead: React.FC<{
  tabs: TabLike[];
  onPick: (id: string) => void;
  onDensityChange?: (d: Density) => void;
  currentDensity?: Density;
}> = ({ tabs, onPick, onDensityChange, currentDensity }) => {
  const [q, setQ] = useState('');
  const items = useMemo(() => {
    const v = q.trim().toLowerCase();
    return v ? tabs.filter(t => t.name.toLowerCase().includes(v)) : tabs;
  }, [q, tabs]);
  return (
    <div>
      <input
        autoFocus
        placeholder="Search tabs…"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Filter tabs"
        style={{
          width: '100%',
          padding: '8px 10px',
          borderRadius: 8,
          border: `1px solid ${SYNAPSE_COLORS.border}`,
          outline: 'none',
          background: withAlpha('#ffffff', 0.04),
          color: SYNAPSE_COLORS.textPrimary,
          fontFamily: SYNAPSE_TYPO.fontFamily,
          fontSize: 12,
          marginBottom: 8,
        }}
      />
      <div>
        {items.map(t => (
          <button
            key={t.id}
            role="menuitem"
            onClick={() => onPick(t.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '8px 10px',
              borderRadius: 8,
              marginBottom: 4,
              color: SYNAPSE_COLORS.textPrimary,
              background: 'transparent',
              border: `1px solid ${withAlpha('#fff', 0.04)}`,
            }}
          >
            {t.name}
          </button>
        ))}
        {items.length === 0 && (
          <div style={{ color: SYNAPSE_COLORS.textSecondary, fontSize: 12, padding: 6 }}>
            No matches
          </div>
        )}
      </div>
      <div
        style={{ borderTop: `1px solid ${withAlpha('#fff', 0.06)}`, marginTop: 8, paddingTop: 8 }}
      >
        <small style={{ color: SYNAPSE_COLORS.textSecondary }}>Density:</small>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {(['compact', 'comfortable', 'relaxed'] as Density[]).map(d => (
            <button
              key={d}
              onClick={() => onDensityChange?.(d)}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                fontSize: 11,
                border: `1px solid ${currentDensity === d ? withAlpha(SYNAPSE_COLORS.goldPrimary, 0.5) : withAlpha('#fff', 0.08)}`,
                background:
                  currentDensity === d
                    ? withAlpha(SYNAPSE_COLORS.goldPrimary, 0.12)
                    : 'transparent',
                color:
                  currentDensity === d ? SYNAPSE_COLORS.textAccent : SYNAPSE_COLORS.textSecondary,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
