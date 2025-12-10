import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '../molecules/Modal';
import { SYNAPSE_COLORS, SYNAPSE_TYPO, withAlpha } from '../../ui/theme/synapseTheme';
import styled from 'styled-components';
import { type Command as Cmd, fuzzyFilter, listCommands } from '../../services/commandRegistry';
import { useFileExplorerStore } from '../../stores/fileExplorerStore';
import { useEditorStore, useTabActions } from '../../stores/editorStore';
import type { FileNode } from '../../types/state';

type Mode = 'files' | 'tabs' | 'symbols' | 'commands';


const PaletteRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
const ModeRow = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;
const ModeChip = styled.button<{ $active: boolean }>`
  position: relative;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.2;
  background: ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.14) : 'transparent')};
  color: ${({ $active }) => ($active ? '#E6EAF2' : SYNAPSE_COLORS.textSecondary)};
  border: none;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? '#3CC7FF' : 'transparent')};
  cursor: pointer;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
  &:hover { background: ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.20) : withAlpha('#ffffff', 0.05))}; }
  &:focus-visible { outline: 2px solid #3CC7FF; outline-offset: 2px; }
`;
const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: ${withAlpha('#ffffff', 0.04)};
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  padding: 0 12px;
  height: 46px;
  transition: border-color 160ms ease, background 160ms ease;
  &:focus-within { border-color: ${withAlpha('#3CC7FF', 0.6)}; background: ${withAlpha('#3CC7FF', 0.08)}; }
`;
const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E6EAF2;
  font-family: ${SYNAPSE_TYPO.fontFamily};
  font-size: 14px;
  line-height: 1.4;
  &::placeholder { color: ${withAlpha('#E6EAF2', 0.45)}; }
`;
const HintBar = styled.div`
  display: flex;
  gap: 24px;
  font-size: 12px;
  color: #93A1B3;
  padding: 0 2px;
`;
const ResultsViewport = styled.div`
  display: grid;
  gap: 10px;
  max-height: 56vh;
  overflow: auto;
  padding-right: 4px;
`;
const GroupHeading = styled.div`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${withAlpha('#93A1B3', 0.9)};
  padding: 4px 2px 0;
`;
const ResultButton = styled.button<{ $active: boolean; $dense?: boolean }>`
  text-align: left;
  padding: 12px 14px;
  border-radius: 6px;
  border: 1px solid
    ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.50) : 'rgba(255,255,255,0.08)')};
  background: ${({ $active }) =>
    $active ? withAlpha('#3CC7FF', 0.16) : withAlpha('#ffffff', 0.02)};
  color: #E6EAF2;
  font-family: ${SYNAPSE_TYPO.fontFamily};
  display: grid;
  gap: 4px;
  cursor: pointer;
  min-height: 52px;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  &:hover { background: ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.20) : withAlpha('#ffffff', 0.05))}; }
  &:focus-visible { outline: 2px solid #3CC7FF; outline-offset: 2px; }
`;
const ResultMeta = styled.small`
  color: #93A1B3;
  font-size: 12px;
`;
const NoResults = styled.div`
  color: #93A1B3;
  font-size: 13px;
  padding: 12px 4px;
`;
const FooterBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 12px;
  color: #93A1B3;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  margin-top: 4px;
`;


const MRU_KEY = 'synapse.palette.mru.v1';
function useMRU() {
  const [mru, setMru] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(MRU_KEY) || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(MRU_KEY, JSON.stringify(mru.slice(0, 30)));
    } catch {}
  }, [mru]);
  const touch = (id: string) => setMru(prev => [id, ...prev.filter(x => x !== id)].slice(0, 30));
  return { mru, touch };
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const out: FileNode[] = [];
  const walk = (list: FileNode[]) => {
    for (const n of list) {
      if (n.type === 'file') out.push(n);
      if (n.children && n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const mid = text.slice(i, i + query.length);
  const after = text.slice(i + query.length);
  return (
    <>
      {before}
  <mark style={{ background: withAlpha('#00A6D7', 0.25), color: SYNAPSE_COLORS.textPrimary }}>
        {mid}
      </mark>
      {after}
    </>
  );
}

function extractSymbols(content: string, language?: string) {
  const syms: { name: string; kind: string }[] = [];
  try {
    const lines = content.split(/\r?\n/);
    const push = (n: string, k: string) => {
      if (n.trim()) syms.push({ name: n.trim(), kind: k });
    };
    if ((language || '').includes('ts') || (language || '').includes('js')) {
      const reFn = /function\s+([a-zA-Z0-9_]+)/;
      const reCls = /class\s+([A-Za-z0-9_]+)/;
      const reConstFn = /const\s+([A-Za-z0-9_]+)\s*=\s*\(/;
      for (const ln of lines) {
        const m1 = ln.match(reFn);
        if (m1) push(m1[1], 'function');
        const m2 = ln.match(reCls);
        if (m2) push(m2[1], 'class');
        const m3 = ln.match(reConstFn);
        if (m3) push(m3[1], 'function');
      }
    } else if ((language || '').includes('md')) {
      const reH = /^(#+)\s+(.*)$/;
      for (const ln of lines) {
        const m = ln.match(reH);
        if (m) push(m[2], `h${m[1].length}`);
      }
    }
  } catch {}
  return syms;
}

export const CommandPalette: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  commands?: Cmd[];
}> = ({ isOpen, onClose, commands }) => {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('files');
  const listRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { mru, touch } = useMRU();
  const files = useFileExplorerStore(s => s.files);
  const tabs = useEditorStore(s => s.tabs);
  const { openTab, setActiveTab } = useTabActions();


  useEffect(() => {
    if (!isOpen) {
      setQ('');
      setMode('files');
      setActiveIndex(0);
    }
  }, [isOpen]);


  useEffect(() => {
    if (!q) return;
    if (q.startsWith('>')) setMode('commands');
    else if (q.startsWith('@')) setMode('symbols');
    else if (q.startsWith('#')) setMode('tabs');
    else setMode('files');
  }, [q]);

  const filesFlat = useMemo(() => flattenFiles(files), [files]);
  const allCmds = useMemo(() => commands ?? listCommands(), [commands, isOpen]);
  const qStripped = useMemo(
    () => (q.startsWith('>') || q.startsWith('@') || q.startsWith('#') ? q.slice(1) : q),
    [q]
  );

  const fileResults = useMemo(() => {
    const v = qStripped.trim().toLowerCase();
    const base = !v
      ? filesFlat.slice(0, 200)
      : filesFlat.filter(f => f.name.toLowerCase().includes(v) || f.path.toLowerCase().includes(v));

    const byId = new Map(base.map(f => [f.id, f] as const));
    const prioritized: typeof base = [] as any;
    mru.forEach(id => {
      const f = byId.get(id);
      if (f) {
        prioritized.push(f);
        byId.delete(id);
      }
    });
    const rest = Array.from(byId.values());
    return [...prioritized, ...rest].slice(0, 50);
  }, [filesFlat, qStripped]);

  const tabResults = useMemo(() => {
    const v = qStripped.trim().toLowerCase();
    const base = !v ? tabs : tabs.filter(t => t.name.toLowerCase().includes(v));
    const byId = new Map(base.map(t => [t.id, t] as const));
    const prioritized: typeof base = [] as any;
    mru.forEach(id => {
      const t = byId.get(id);
      if (t) {
        prioritized.push(t);
        byId.delete(id);
      }
    });
    return [...prioritized, ...Array.from(byId.values())];
  }, [tabs, qStripped]);

  const symbolResults = useMemo(() => {
    const v = qStripped.trim().toLowerCase();
    const list: Array<{
      tabId: string;
      tabName: string;
      symbol: string;
      kind: string;
      line: number;
    }> = [];
    tabs.forEach(t => {
      const syms = extractSymbols(t.content || '', t.language);
      const lines = (t.content || '').split(/\r?\n/);
      syms.forEach(s => {

        const idx = Math.max(
          0,
          lines.findIndex(l => l.includes(s.name))
        );
        list.push({
          tabId: t.id,
          tabName: t.name,
          symbol: s.name,
          kind: s.kind,
          line: (idx || 0) + 1,
        });
      });
    });
    if (!v) return list.slice(0, 100);
    return list.filter(s => s.symbol.toLowerCase().includes(v)).slice(0, 100);
  }, [tabs, qStripped]);

  const commandResults = useMemo(() => fuzzyFilter(qStripped, allCmds), [qStripped, allCmds]);

  const commandGroups = useMemo(() => {
    if (!commandResults.length || mode !== 'commands') return [] as Array<{ name: string; items: Cmd[] }>;
    const map = new Map<string, Cmd[]>();
    commandResults.forEach(cmd => {
      const cat = cmd.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(cmd);
    });
    return Array.from(map.entries()).map(([name, items]) => ({ name, items }));
  }, [commandResults, mode]);


  const fileGroups = useMemo(() => {
    if (mode !== 'files') return [] as Array<{ name: string; items: typeof fileResults }>;
    const mruSet = new Set(mru);
    const recent: typeof fileResults = [] as any;
    const others: typeof fileResults = [] as any;
    fileResults.forEach(f => (mruSet.has(f.id) ? recent.push(f) : others.push(f)));
    const out: Array<{ name: string; items: typeof fileResults }> = [];
    if (recent.length) out.push({ name: 'Recent', items: recent });
    if (others.length) out.push({ name: 'Files', items: others });
    return out;
  }, [fileResults, mode, mru]);

  const activeListLength = useMemo(() => {
    switch (mode) {
      case 'files':
        return fileResults.length;
      case 'tabs':
        return tabResults.length;
      case 'symbols':
        return symbolResults.length;
      case 'commands':
        return commandResults.length;
      default:
        return 0;
    }
  }, [mode, fileResults, tabResults, symbolResults, commandResults]);

  const placeholder = useMemo(() => {
    switch (mode) {
      case 'commands':
        return 'Run a command… (prefix with >)';
      case 'symbols':
        return 'Search symbols in open files… (prefix with @)';
      case 'tabs':
        return 'Switch to tab… (prefix with #)';
      default:
        return 'Search files…';
    }
  }, [mode]);


  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        const order: Mode[] = ['files', 'tabs', 'symbols', 'commands'];
        const idx = order.indexOf(mode);
        setMode(order[(idx + (e.shiftKey ? order.length - 1 : 1)) % order.length]);
        setActiveIndex(0);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const len =
          mode === 'files'
            ? fileResults.length
            : mode === 'tabs'
              ? tabResults.length
              : mode === 'symbols'
                ? symbolResults.length
                : commandResults.length;
        if (len === 0) return;
        setActiveIndex(i => {
          const delta = e.key === 'ArrowDown' ? 1 : -1;
          const next = (i + delta + len) % len;

          const container = listRef.current;
          if (!container) return next;
          const item = container.querySelector(`[data-idx="${next}"]`) as HTMLElement | null;
          item?.scrollIntoView({ block: 'nearest' });
          return next;
        });
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const runPick = (fn: (() => void) | null) => {
          if (fn) fn();
        };
        if (mode === 'files') {
          const f = fileResults[activeIndex];
          if (!f) return;
          touch(f.id);
          const t = tabs.find(t => t.fileId === f.id);
          runPick(() => {
            t ? setActiveTab(t.id) : openTab(f);
            onClose();
          });
        } else if (mode === 'tabs') {
          const t = tabResults[activeIndex];
          if (!t) return;
          touch(t.id);
          runPick(() => {
            setActiveTab(t.id);
            onClose();
          });
        } else if (mode === 'symbols') {
          const s = symbolResults[activeIndex];
          if (!s) return;
          touch(`sym:${s.tabId}:${s.symbol}`);
          runPick(() => {
            setActiveTab(s.tabId);

            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent('synapse.editor.reveal', {
                  detail: { tabId: s.tabId, line: s.line, column: 1 },
                })
              );
            }, 50);
            onClose();
          });
        } else {
          const c = commandResults[activeIndex];
          if (!c) return;
          touch(`cmd:${c.id}`);
          runPick(() => {
            c.run();
            onClose();
          });
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    isOpen,
    mode,
    activeIndex,
    fileResults,
    tabResults,
    symbolResults,
    commandResults,
    onClose,
    openTab,
    setActiveTab,
    tabs,
    touch,
  ]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette" size="palette" variant="palette">
      <PaletteRoot>
        <ModeRow role="tablist" aria-label="Palette modes">
          {([
            { key: 'files', label: 'Files' },
            { key: 'tabs', label: 'Tabs' },
            { key: 'symbols', label: 'Symbols' },
            { key: 'commands', label: 'Commands' },
          ] as Array<{ key: Mode; label: string }>).map(m => (
            <ModeChip
              key={m.key}
              $active={mode === m.key}
              role="tab"
              aria-selected={mode === m.key}
              onClick={() => setMode(m.key)}
            >
              {m.label}
            </ModeChip>
          ))}
        </ModeRow>
        <InputWrapper>
          <SearchInput
            autoFocus
            placeholder={placeholder}
            value={q}
            aria-label="Command palette search"
            onChange={e => setQ(e.target.value)}
          />
        </InputWrapper>
        <HintBar>
          <span>Tip: &gt; Commands, @ Symbols, # Tabs</span>
        </HintBar>
        <ResultsViewport ref={listRef} role="listbox" aria-label="Results">
          {}
          <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px,1px,1px,1px)' }} aria-live="polite">
            {activeListLength} results
          </div>
          {mode === 'files' && fileGroups.map(group => {
            return (
              <React.Fragment key={group.name}>
                <GroupHeading>{group.name}</GroupHeading>
                {group.items.map(f => {
                  const i = fileResults.indexOf(f);
                  const active = activeIndex === i;
                  return (
                    <ResultButton
                      key={f.id}
                      data-idx={i}
                      aria-selected={active}
                      onClick={() => {
                        const t = tabs.find(t => t.fileId === f.id);
                        touch(f.id);
                        if (t) setActiveTab(t.id); else openTab(f);
                        onClose();
                      }}
                      $active={active}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{highlight(f.name, qStripped)}</span>
                      <ResultMeta>{highlight(f.path, qStripped)}</ResultMeta>
                    </ResultButton>
                  );
                })}
              </React.Fragment>
            );
          })}

          {mode === 'tabs' &&
            tabResults.map((t, i) => (
              <ResultButton
                key={t.id}
                data-idx={i}
                aria-selected={activeIndex === i}
                onClick={() => {
                  touch(t.id);
                  setActiveTab(t.id);
                  onClose();
                }}
                $active={activeIndex === i}
                $dense
              >
                <span>{highlight(t.name, qStripped)}</span>
                {t.isDirty ? <ResultMeta>• unsaved</ResultMeta> : null}
              </ResultButton>
            ))}

          {mode === 'symbols' &&
            symbolResults.map((s, i) => (
              <ResultButton
                key={`${s.tabId}-${i}`}
                data-idx={i}
                aria-selected={activeIndex === i}
                onClick={() => {
                  touch(`sym:${s.tabId}:${s.symbol}`);
                  setActiveTab(s.tabId);
                  setTimeout(() => {
                    window.dispatchEvent(
                      new CustomEvent('synapse.editor.reveal', {
                        detail: { tabId: s.tabId, line: s.line, column: 1 },
                      })
                    );
                  }, 50);
                  onClose();
                }}
                $active={activeIndex === i}
              >
                <span style={{ fontWeight: 600, fontSize: 15 }}>{highlight(s.symbol, qStripped)}</span>
                <ResultMeta>
                  {s.kind} — {s.tabName} (Ln {s.line})
                </ResultMeta>
              </ResultButton>
            ))}

          {mode === 'commands' && commandGroups.map(group => (
            <React.Fragment key={group.name}>
              <GroupHeading>{group.name}</GroupHeading>
              {group.items.map(cmd => {
                const i = commandResults.indexOf(cmd);
                const active = activeIndex === i;
                return (
                  <ResultButton
                    key={cmd.id}
                    data-idx={i}
                    aria-selected={active}
                    onClick={() => {
                      touch(`cmd:${cmd.id}`);
                      cmd.run();
                      onClose();
                    }}
                    $active={active}
                    $dense
                  >
                    <span>{highlight(cmd.label, qStripped)}</span>
                    {cmd.shortcut ? <ResultMeta>{cmd.shortcut}</ResultMeta> : null}
                  </ResultButton>
                );
              })}
            </React.Fragment>
          ))}

          {(mode === 'files' && fileResults.length === 0) ||
          (mode === 'tabs' && tabResults.length === 0) ||
          (mode === 'symbols' && symbolResults.length === 0) ||
          (mode === 'commands' && commandResults.length === 0) ? (
            <NoResults>No results</NoResults>
          ) : null}
        </ResultsViewport>
        <FooterBar>
          <span>↑↓ navigate</span>
          <span>Enter run/open</span>
          <span>Tab cycle modes</span>
            <span>Esc close</span>
          <span>{activeListLength} results</span>
        </FooterBar>
      </PaletteRoot>
    </Modal>
  );
};

export default CommandPalette;
