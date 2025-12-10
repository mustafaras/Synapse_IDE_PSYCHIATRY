import React, { useEffect, useId, useRef, useState } from 'react';
import styled from 'styled-components';
import { useSettingsStore } from '@/store/useSettingsStore';
import { showToast } from '@/ui/toast/api';


const GOLD = '#00A6D7';
const GOLD_HOVER = '#5FD6F5';
const BG = '#000';
const BG_ALT = '#0f0f10';
const BORDER = '#1a1a1a';
const BORDER_SOFT = '#222';
const TEXT = GOLD;
const TEXT_MUTED = '#b3b3b3';
const TEXT_FAINT = '#6b6b6b';

const focusRing = () => `0 0 0 2px rgba(201,178,106,0.35)`;

const Backdrop = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 2200;
  font-family: var(--font-mono, var(--font-code, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;
const Dialog = styled.div`
  width: 520px; max-width: 95vw; border-radius: 12px; padding: 18px 20px 20px;
  background: ${BG};
  border: 1px solid ${BORDER};
  font-family: inherit;
  color: ${TEXT};
  box-shadow: 0 0 0 1px #000;
`;
const Tabs = styled.div` display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; `;
const TabBtn = styled.button<{ $active?: boolean }>`
  padding: 6px 12px; border-radius: 7px; font-size: 12px; cursor: pointer; line-height:1.2;
  background: ${p => p.$active ? GOLD : BG_ALT};
  color: ${p => p.$active ? '#000' : TEXT_MUTED};
  border: 1px solid ${p => p.$active ? GOLD : BORDER_SOFT};
  font-family: inherit; font-weight: 500; letter-spacing:.3px;
  transition: background .18s ease, color .18s ease, border-color .18s ease, transform .18s ease;
  position: relative;
  &:hover { background: ${p => p.$active ? GOLD_HOVER : '#141414'}; color: ${p => p.$active ? '#000' : GOLD}; }
  &:focus-visible { outline: none; box-shadow: ${focusRing()}; }
  &:active { transform: translateY(1px); }
`;
const Row = styled.label`
  display: grid; grid-template-columns: 120px 1fr auto; gap: 10px; align-items: center; margin: 10px 0; font-size: 12px; font-family: inherit;
  color:${TEXT_MUTED};
  > div:first-child { text-transform: uppercase; letter-spacing:.5px; font-size:10px; color:${TEXT_FAINT}; }
`;
const Input = styled.input`
  width: 100%; padding: 7px 9px; border-radius: 8px; border: 1px solid ${BORDER_SOFT};
  background: ${BG_ALT}; color: ${TEXT}; font-family: inherit; font-size:12px;
  outline: none; transition: border-color .18s ease, background .18s ease, box-shadow .18s ease;
  &::placeholder { color:${TEXT_FAINT}; }
  &:focus { border-color: ${GOLD}; background:#141414; box-shadow:${focusRing()}; }
  &:disabled { opacity:.5; cursor:not-allowed; }
`;
const Actions = styled.div` display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; `;
const ActionBtn = styled.button<{ $primary?: boolean }>`
  min-width: 90px; height:34px; padding:0 16px; border-radius:7px; font-size:12px; cursor:pointer; font-family:inherit; font-weight:500; letter-spacing:.4px;
  background: ${p=>p.$primary?GOLD:BG_ALT};
  color: ${p=>p.$primary?'#000':TEXT_MUTED};
  border:1px solid ${p=>p.$primary?GOLD:BORDER_SOFT};
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition: background .2s ease, color .2s ease, border-color .2s ease, transform .15s ease;
  &:hover { background:${p=>p.$primary?GOLD_HOVER:'#141414'}; color:${p=>p.$primary?'#000':GOLD}; }
  &:focus-visible { outline:none; box-shadow:${focusRing()}; }
  &:active { transform:translateY(1px); }
`;
const ToggleBtn = styled.button`
  padding:6px 10px; border-radius:7px; font-size:11px; cursor:pointer; font-family:inherit; background:#0f0f10; color:${TEXT_MUTED}; border:1px solid ${BORDER_SOFT};
  transition: background .18s, color .18s, border-color .18s;
  &:hover { background:#141414; color:${GOLD}; border-color:${GOLD}; }
  &:focus-visible { outline:none; box-shadow:${focusRing()}; }
`;

export const KeysModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const id = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusEl = useRef<HTMLElement | null>(null);
  const { profiles, activeProfileId, setApiKey, setOllamaBaseUrl } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const keys = (active?.data as any)?.keys || {};
  const settings = (active?.data as any)?.settings || {};
  const [tab, setTab] = useState<'openai'|'anthropic'|'gemini'|'ollama'>('openai');
  const [show, setShow] = useState(false);
  const [openai, setOpenai] = useState(keys?.openai?.apiKey || '');
  const [anthropic, setAnthropic] = useState(keys?.anthropic?.apiKey || '');
  const [google, setGoogle] = useState(keys?.google?.apiKey || '');
  const [ollama, setOllama] = useState(settings?.ollamaBaseUrl || '');

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    if (open) document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); };
  }, [open, onClose]);


  useEffect(() => {
    if (!open) return;

    restoreFocusEl.current = (document.activeElement as HTMLElement) || null;

    const node = dialogRef.current;
    if (node) {
      const focusables = node.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      if (first) setTimeout(() => first.focus(), 0);
    }
    return () => {

      if (restoreFocusEl.current) {
        try { restoreFocusEl.current.focus(); } catch {}
      }
    };
  }, [open]);

  const onKeyDownTrap = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const node = dialogRef.current;
    if (!node) return;
    const focusables = Array.from(node.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ));
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey) {
      if (!active || active === first) { e.preventDefault(); last.focus(); }
    } else {
      if (!active || active === last) { e.preventDefault(); first.focus(); }
    }
  };

  if (!open) return null;

  const save = () => {
    if (openai) setApiKey('openai', openai);
    if (anthropic) setApiKey('anthropic', anthropic);
  if (google) setApiKey('gemini', google);
    setOllamaBaseUrl(ollama || '');
    try { showToast({ kind: 'success', message: 'Keys updated' }); } catch {}
    onClose();
  };

  const mask = (v: string) => v ? `Saved ••••${String(v).slice(-4)}` : '';

  const tabIds = {
    openai: `${id}-tab-openai`,
    anthropic: `${id}-tab-anthropic`,
    gemini: `${id}-tab-gemini`,
    ollama: `${id}-tab-ollama`,
  } as const;
  const panelIds = {
    openai: `${id}-panel-openai`,
    anthropic: `${id}-panel-anthropic`,
    gemini: `${id}-panel-gemini`,
    ollama: `${id}-panel-ollama`,
  } as const;

  return (
    <Backdrop aria-hidden={!open}>
      <Dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        data-testid="keys-modal"
        onKeyDown={onKeyDownTrap}
      >
        <div id={`${id}-title`} style={{ fontWeight:700, marginBottom:12, fontSize:14, letterSpacing:.5, textTransform:'uppercase', color:GOLD }}>Provider Keys</div>
        <Tabs role="tablist" aria-label="Providers">
          {(['openai','anthropic','gemini','ollama'] as const).map(p => (
            <TabBtn
              key={p}
              id={tabIds[p]}
              role="tab"
              aria-selected={tab===p}
              aria-controls={panelIds[p]}
              $active={tab===p}
              onClick={() => setTab(p)}
            >
              {(p[0].toUpperCase()+p.slice(1))}
            </TabBtn>
          ))}
        </Tabs>
        {tab !== 'ollama' ? (
          <div role="tabpanel" id={panelIds[tab]} aria-labelledby={tabIds[tab]}>
            <Row>
              <div>API KEY</div>
              <Input id={`${id}-key`} type={show ? 'text' : 'password'} placeholder={mask(tab==='openai'?openai:tab==='anthropic'?anthropic:google)} value={tab==='openai'?openai:tab==='anthropic'?anthropic:google} onChange={e => {
                const v = e.target.value; if (tab==='openai') setOpenai(v); else if (tab==='anthropic') setAnthropic(v); else setGoogle(v);
              }} />
              <ToggleBtn onClick={() => setShow(s => !s)} aria-pressed={show} aria-label={show ? 'Hide API key' : 'Show API key'}>{show ? 'Hide' : 'Show'}</ToggleBtn>
            </Row>
          </div>
        ) : (
          <div role="tabpanel" id={panelIds[tab]} aria-labelledby={tabIds[tab]}>
            <Row>
              <div>BASE URL</div>
              <Input id={`${id}-ollama`} type="text" placeholder="http://localhost:11434" value={ollama} onChange={e => setOllama(e.target.value)} />
              <div />
            </Row>
          </div>
        )}
        <Actions>
          <ActionBtn onClick={onClose} aria-label="Cancel and close keys modal">Cancel</ActionBtn>
          <ActionBtn $primary onClick={save} aria-label="Save provider keys">Save</ActionBtn>
        </Actions>
      </Dialog>
    </Backdrop>
  );
};

export default KeysModal;
