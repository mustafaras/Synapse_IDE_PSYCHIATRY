import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from '../molecules/Modal';
import { SYNAPSE_COLORS, SYNAPSE_TYPO, withAlpha } from '../../ui/theme/synapseTheme';
import styled from 'styled-components';
import { useEditorStore, useTabActions } from '../../stores/editorStore';
import { indexDocs, queryDocs } from '../../services/search';
import { useFileExplorerStore } from '../../stores/fileExplorerStore';

export const GlobalSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const tabs = useEditorStore(s => s.tabs);
  const files = useFileExplorerStore(s => s.files);
  const { setActiveTab, openTab } = useTabActions();
  const [q, setQ] = useState('');
  useEffect(() => {
    if (!isOpen) setQ('');
  }, [isOpen]);
  const [results, setResults] = useState<
    {
      tabId: string;
      tabName: string;
      line: number;
      preview: string;
      matchIndex?: number;
      matchLength?: number;
    }[]
  >([]);


  useEffect(() => {
    if (!isOpen) return;

    const flatten = (nodes: any[]): any[] => {
      const out: any[] = [];
      nodes.forEach(n => {
        if (n.type === 'file') out.push(n);
        if (n.children) out.push(...flatten(n.children));
      });
      return out;
    };
    const explorerFiles = flatten(files);

    const openByPath = new Map<string, any>();
    tabs.forEach(t => openByPath.set(t.path, { id: t.id, name: t.name, content: t.content || '' }));
    const docs = explorerFiles.map(
      f => openByPath.get(f.path) || { id: f.id, name: f.name, content: f.content || '' }
    );
    indexDocs(docs);
  }, [isOpen, tabs, files]);

  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      return;
    }
    const v = q.trim();
    if (!v) {
      setResults([]);
      return;
    }
    let cancelled = false;
    queryDocs(v, 300).then(list => {
      if (cancelled) return;
      const mapped = list.map((r: any) => ({
        tabId: r.docId,
        tabName: r.docName,
        line: r.line,
        preview: r.preview,
        matchIndex: r.matchIndex,
        matchLength: r.matchLength,
      }));
      setResults(mapped);
    });
    return () => {
      cancelled = true;
    };
  }, [q, isOpen]);

  const highlight = useMemo(() => {
    const v = q.trim();
    return (text: string, idx?: number, len?: number) => {
      if (!v) return text;
      const i = typeof idx === 'number' ? idx : text.toLowerCase().indexOf(v.toLowerCase());
      const l = typeof len === 'number' ? len : v.length;
      if (i < 0) return text;
      return (
        <>
          {text.slice(0, i)}
          <mark style={{ background: 'rgba(0,166,215,0.25)', color: SYNAPSE_COLORS.textPrimary }}>
            {text.slice(i, i + l)}
          </mark>
          {text.slice(i + l)}
        </>
      );
    };
  }, [q]);


  const Root = styled.div`
    display: flex; flex-direction: column; gap: 16px;
  `;
  const InputWrapper = styled.div`
    position: relative; display: flex; align-items: center;
    background: ${withAlpha('#ffffff', 0.04)}; border: 1px solid rgba(255,255,255,0.08);
    border-radius: 6px; padding: 0 12px; height: 46px;
    transition: background 160ms ease, border-color 160ms ease;
    &:focus-within { background: ${withAlpha('#3CC7FF', 0.08)}; border-color: ${withAlpha('#3CC7FF', 0.6)}; }
  `;
  const SearchInput = styled.input`
    flex: 1; background: transparent; border: none; outline: none; color: #E6EAF2;
    font-family: ${SYNAPSE_TYPO.fontFamily}; font-size: 14px; line-height: 1.4;
    &::placeholder { color: ${withAlpha('#E6EAF2', 0.45)}; }
  `;
  const Results = styled.div`
    display: grid; gap: 10px; max-height: 56vh; overflow: auto; padding-right: 4px;
  `;
  const Row = styled.button<{ $active?: boolean }>`
    text-align: left; padding: 12px 14px; border-radius: 6px; cursor: pointer; border: 1px solid
      ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.50) : 'rgba(255,255,255,0.08)')};
    background: ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.16) : withAlpha('#ffffff', 0.02))};
    color: #E6EAF2; font-family: ${SYNAPSE_TYPO.fontFamily}; display: grid; gap: 4px; min-height: 52px;
    transition: background 120ms ease, border-color 120ms ease;
    &:hover { background: ${({ $active }) => ($active ? withAlpha('#3CC7FF', 0.20) : withAlpha('#ffffff', 0.05))}; }
    &:focus-visible { outline: 2px solid #3CC7FF; outline-offset: 2px; }
  `;
  const Meta = styled.div`
    font-size: 12px; color: #93A1B3;
  `;
  const Empty = styled.div`
    font-size: 13px; color: #93A1B3; padding: 12px 4px;
  `;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Search" size="palette" variant="palette">
      <Root>
        <InputWrapper>
          <SearchInput
            autoFocus
            placeholder="Search across open tabs…"
            value={q}
            aria-label="Global search"
            onChange={e => setQ(e.target.value)}
          />
        </InputWrapper>
        <Results role="listbox" aria-label="Search results">
          {results.map((r, i) => (
            <Row
              key={i}
              onClick={() => {
                const exists = tabs.find(t => t.id === r.tabId || t.name === r.tabName);
                if (exists) setActiveTab(exists.id);
                else {
                  const flatten = (nodes: any[]): any[] =>
                    nodes.flatMap((n: any) => (n.type === 'file' ? [n] : n.children ? flatten(n.children) : []));
                  const explorerFiles = flatten(files);
                  const match = explorerFiles.find((f: any) => f.name === r.tabName);
                  if (match) openTab(match);
                }
                setTimeout(() => {
                  const target = tabs.find(t => t.id === r.tabId || t.name === r.tabName);
                  const targetId = target?.id || r.tabId;
                  window.dispatchEvent(
                    new CustomEvent('synapse.editor.reveal', {
                      detail: { tabId: targetId, line: r.line, column: 1 },
                    })
                  );
                }, 60);
                onClose();
              }}
            >
              <Meta>
                Tab: {r.tabName} • Line {r.line}
              </Meta>
              <div style={{ whiteSpace: 'pre-wrap' }}>{highlight(r.preview, r.matchIndex, r.matchLength)}</div>
            </Row>
          ))}
          {results.length === 0 && <Empty>Type to search open tabs</Empty>}
        </Results>
      </Root>
    </Modal>
  );
};

export default GlobalSearch;
