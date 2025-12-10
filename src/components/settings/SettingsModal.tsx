import { useAppStore } from '@/stores/appStore';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Modal from '@/components/molecules/Modal';


import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import { getStaticModels } from '@/ai/modelRegistry';
import { deriveModelMeta } from '@/ai/modelMeta';
import { useSettingsStore } from '@/store/useSettingsStore';
import { selectAdvanced, selectFlags, selectKeysEnc, selectTokenBudget, selectUI, useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { showToast } from '@/ui/toast/api';

const Wrap = styled.div`
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 10px;
  min-height: 420px;
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));


  --bgPrimary: #121212;
  --bgSecondary: #1A1A1A;
  --bgOverlay: rgba(255,255,255,0.04);
  --textPrimary: #E0E0E0;
  --textSecondary: #A0A0A0;
  --textAccent: #00A6D7;
  --goldSoft: #00A6D7;
  --goldMuted: #5FD6F5;
  --grayBlueAccent: #AAB2BD;
  --borderSoft: #FFFFFF10;
  --success: #2ECC71;
  --warning: #E1C542;
  --error: #E74C3C;
  --softShadow: rgba(0,0,0,0.3);
  --borderHighlight: rgba(0,166,215,0.4);
  --glowSubtle: 0 0 6px rgba(0,166,215,0.3);


  color: var(--textPrimary);
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: var(--bgSecondary);
  border: 1px solid var(--borderSoft);
  border-radius: 10px;
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;

const NavBtn = styled.button<{ $active?: boolean }>`
  text-align: left;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => $active ? 'var(--borderHighlight)' : 'var(--borderSoft)'};
  background: ${({ $active }) => $active ? 'linear-gradient(135deg, rgba(0,166,215,0.28) 0%, rgba(0,166,215,0.08) 100%)' : 'rgba(255,255,255,0.04)'};
  color: ${({ $active }) => $active ? '#F8F8F8' : 'var(--textPrimary)'};
  font-size: 12px;
  letter-spacing: 0.4px;
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
  cursor: pointer;
  position: relative;
  transition: background 140ms ease, border-color 140ms ease, color 140ms ease, box-shadow 140ms ease;
  &:hover { border-color: var(--borderHighlight); background: ${({ $active }) => $active ? 'linear-gradient(135deg, rgba(0,166,215,0.35) 0%, rgba(0,166,215,0.10) 100%)' : 'rgba(255,255,255,0.07)'}; }
  &:focus-visible { outline: 2px solid var(--textAccent); outline-offset: 2px; box-shadow: 0 0 0 3px rgba(0,166,215,0.25); }
  &[aria-selected='true']::after { content: ''; position: absolute; inset: -1px; border-radius: 11px; pointer-events: none; box-shadow: 0 0 0 1px rgba(0,166,215,0.35), 0 0 8px -2px rgba(0,166,215,0.5); }
`;

const PanelShell = styled.section`
  background: linear-gradient(165deg, #161616 0%, #121212 60%);
  border: 1px solid var(--borderSoft);
  border-radius: 14px;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-family: inherit;
  position: relative;
  box-shadow: 0 4px 18px -6px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02);
  overflow: hidden;
  &:before { content:''; position:absolute; inset:0; pointer-events:none; background:radial-gradient(circle at 92% 8%, rgba(0,166,215,0.15), transparent 55%); }
`;

const TabsContentWrap = styled.div`
  display:flex;
  flex-direction:column;
  gap:0;
  min-height:360px;
`;

const TabPanel = styled.div<{ $active?: boolean }>`
  display: block;
  opacity: ${({ $active }) => $active ? 1 : 0};
  pointer-events: ${({ $active }) => $active ? 'auto' : 'none'};
  position: ${({ $active }) => $active ? 'relative' : 'absolute'};
  inset: 0;
  transition: opacity 160ms ease;
  &[data-hidden='true'] { visibility:hidden; }
`;


const Label = styled.div`
  font-size: 12px;
  color: var(--textSecondary);
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  background: rgba(255,255,255,0.045);
  border: 1px solid var(--borderSoft);
  border-radius: 8px;
  color: var(--textPrimary);
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
  font-size: 12px;
  transition: border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;
  &:hover { border-color: var(--borderHighlight); }
  &:focus-visible { outline: none; border-color: var(--borderHighlight); box-shadow: 0 0 0 2px rgba(0,166,215,0.35); background: rgba(255,255,255,0.07); }
`;

const KeyInput = styled(Input)<{ $invalid?: boolean }>`
  border-color: ${({ $invalid }) => $invalid ? 'var(--error)' : 'var(--borderSoft)'};
  box-shadow: ${({ $invalid }) => $invalid ? '0 0 0 2px rgba(231,76,60,0.25)' : 'none'};
  max-width: 420px;
`;


type KeyRowStatus = 'Untested' | 'Verified' | 'Invalid' | 'Rate-limited';
type KeyRowProv = 'openai' | 'anthropic' | 'gemini';

interface KeyRowNewProps {
  provider: KeyRowProv;
  label: string;
  value: string;
  placeholder?: string;
  show: boolean;
  status: KeyRowStatus;
  hasSaved: boolean;
  invalid?: boolean;
  onChange: (v: string) => void;
  onToggleShow: () => void;
  onClear: () => void;
  onTest: () => void;
}
const KeyRowNew: React.FC<KeyRowNewProps> = (props) => {
  const { provider: _prov, label, value, placeholder, show, status, hasSaved, invalid = false, onChange, onToggleShow, onClear, onTest } = props;


  _prov && null;
  return (
  <div style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr) auto auto', gap: 12, alignItems: 'center', marginBottom: 12 }}>
      <Label style={{ alignSelf: 'flex-start', paddingTop: 2 }}>{label}</Label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
        <KeyInput
          $invalid={invalid}
          type={show ? 'text' : 'password'}
          placeholder={placeholder || ''}
          value={value}
          onChange={e => onChange(e.target.value)}

          onMouseDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
          onPointerDownCapture={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
          onFocus={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
          onBlur={() => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} }}

          onKeyDownCapture={(e) => { if ((e as unknown as KeyboardEvent).key !== 'Escape') e.stopPropagation(); }}
          onKeyUpCapture={(e) => e.stopPropagation()}
          onKeyPressCapture={(e) => e.stopPropagation()}

          onKeyDown={(e) => { if (e.key !== 'Escape') e.stopPropagation(); }}
          onKeyPress={(e) => e.stopPropagation()}
          onBeforeInput={(e) => e.stopPropagation()}
          onCompositionStart={() => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} }}
          onCompositionEnd={() => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          inputMode="text"
          style={{ maxWidth: '100%' }}
        />
      </div>
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--borderSoft)', padding: '3px 6px', borderRadius: 10 }}>
        <IconButton style={{ width: 32, height: 32 }} onClick={() => { void onToggleShow(); }} aria-label={show ? 'Hide' : 'Show'} title={show ? 'Hide' : 'Show'}>
          {show ? <Icon.EyeOff /> : <Icon.Eye />}
        </IconButton>
        {!!hasSaved && !value && <IconButton style={{ width: 32, height: 32 }} onClick={onClear} aria-label="Clear" title="Clear">✕</IconButton>}
        <IconButton style={{ width: 32, height: 32 }} onClick={onTest} aria-label="Test" title="Test">
          <Icon.Flask />
        </IconButton>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}><span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--borderSoft)', color: status === 'Verified' ? 'var(--success)' : status === 'Invalid' ? 'var(--error)' : status === 'Rate-limited' ? 'var(--warning)' : 'var(--textSecondary)', lineHeight: 1 }}>{status}</span></div>
      {!!invalid && <div style={{ gridColumn: '2 / 5', fontSize: 11, color: 'var(--error)' }}>Invalid key format.</div>}
    </div>
  );
};


const Actions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
`;

const Button = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--borderSoft);
  background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
  color: var(--textPrimary);
  font-size: 12px;
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
  cursor: pointer;
  transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  &:hover { border-color: var(--borderHighlight); background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05)); }
  &:active { background: linear-gradient(145deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06)); }
  &:focus-visible { outline: 2px solid var(--textAccent); outline-offset: 2px; }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

const Primary = styled(Button)`
  background: linear-gradient(135deg, rgba(0,166,215,0.35) 0%, rgba(0,166,215,0.18) 60%, rgba(0,166,215,0.12) 100%);
  border-color: rgba(0,166,215,0.45);
  color: #fff;
  box-shadow: 0 0 0 1px rgba(0,166,215,0.35), 0 2px 6px -2px rgba(0,0,0,0.6), 0 0 10px -2px rgba(0,166,215,0.5);
  &:hover { background: linear-gradient(135deg, rgba(0,166,215,0.45) 0%, rgba(0,166,215,0.25) 70%, rgba(0,166,215,0.15) 100%); }
  &:active { filter:brightness(0.95); }
  &:disabled { box-shadow:none; }
`;

const Title = styled.h3`
  margin: 0;
  font-size: 14px;
  color: #fff;
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;

const Hint = styled.div`
  font-size: 11px;
  color: var(--textSecondary);
  font-family: var(--font-mono, var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
`;

const Divider = styled.hr`
  border: 0;
  border-top: 1px solid var(--borderSoft);
  margin: 6px 0 12px;
`;

const ProviderGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 0;
  margin-top: 6px;
  margin-bottom: 10px;
  overflow-x: auto;
`;

const RadioPill = styled.label<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 12px;
  height: 34px;
  min-width: 110px;
  border: 1px solid var(--borderSoft);
  border-radius: 999px;
  background: ${({ $active }) => $active ? 'rgba(0,166,215,0.15)' : 'rgba(255,255,255,0.05)'};
  box-shadow: ${({ $active }) => $active ? 'var(--glowSubtle)' : 'none'};
  cursor: pointer;
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.4px;
`;

const IconButton = styled(Button)`
  width: 28px;
  height: 28px;
  padding: 0;
  display: grid;
  place-items: center;
`;


const Icon = {
  Eye: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.64 21.64 0 0 1-3.22 4.22"/>
      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Flask: (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 2h12"/><path d="M9 2v5l-6 10a3 3 0 0 0 2.6 5h12.8A3 3 0 0 0 21 17L15 7V2"/>
    </svg>
  ),
};

type TabKey = 'general' | 'providers' | 'appearance' | 'advanced' | 'local';

export const SettingsModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const id = useId();
  const { profiles, activeProfileId, setOllamaBaseUrl, setDefaultProvider, savePersisted } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const settings = (active?.data as any)?.settings || {};
  const currentProvider: 'openai'|'anthropic'|'gemini'|'local' = useMemo(() => {
    const p = (settings?.provider || (active?.data as any)?.provider || 'openai') as string;
    if (p === 'ollama') return 'local';
    return (p as any);
  }, [settings?.provider, active?.data]);

  const [tab, setTab] = useState<TabKey>('providers');

  const uProvider = useAiConfigStore(AiSelectors.provider);
  const uModel = useAiConfigStore(AiSelectors.model);
  const uModels = useAiConfigStore(AiSelectors.modelsForActive);
  const favorites = useAiConfigStore(AiSelectors.favoritesForActive as any) as string[];
  const toggleFavorite = useAiConfigStore((s:any) => s.toggleFavorite);
  const uSampling = useAiConfigStore(AiSelectors.sampling);
  const uCaps = useAiConfigStore(AiSelectors.caps);
  const setUProvider = useAiConfigStore(s => s.setProvider);
  const setUModel = useAiConfigStore(s => s.setModel);
  const setUSampling = useAiConfigStore(s => s.setSampling);
  const refreshUModels = useAiConfigStore(s => s.refreshModels);
  const snapshotRef = React.useRef<{ provider: string; model: string | null; sampling: typeof uSampling } | null>(null);
  const [localSysPrompt, setLocalSysPrompt] = useState<string>('');
  const [dirtyUnified, setDirtyUnified] = useState(false);
  useEffect(() => {
    if (open) {
      snapshotRef.current = { provider: uProvider, model: uModel, sampling: { ...uSampling } };
      setLocalSysPrompt(uSampling.system_prompt || '');
      setDirtyUnified(false);
    }
  }, [open]);

  useEffect(() => { if (!open) return; if (!snapshotRef.current) return; const snap = snapshotRef.current; const changed = snap.provider!==uProvider || snap.model!==uModel || snap.sampling.temperature!==uSampling.temperature || snap.sampling.top_p!==uSampling.top_p || snap.sampling.max_tokens!==uSampling.max_tokens || snap.sampling.json_mode!==uSampling.json_mode || (snap.sampling.system_prompt||'') !== (uSampling.system_prompt||''); setDirtyUnified(changed); }, [uProvider,uModel,uSampling,open]);
  const providerOptions: { label: string; value: string }[] = [
    { label: 'OpenAI', value: 'openai' },
    { label: 'Anthropic', value: 'anthropic' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'Ollama', value: 'ollama' },
    { label: 'Custom', value: 'custom' },
  ];
  const staticLen = getStaticModels(uProvider as any)?.length || 0;
  const dynamicExtra = Math.max(0, (uModels?.length || 0) - staticLen);
  const [modelSearch, setModelSearch] = useState('');
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [modelCursor, setModelCursor] = useState<number>(0);
  const listRef = useRef<HTMLDivElement|null>(null);
  const filterModels = (models: string[], search: string, tags: string[], provider: string): string[] => {
    const lowered = search.trim().toLowerCase();
    let filtered = models.filter(m => !lowered || m.toLowerCase().includes(lowered));
    if (tags.length) {
      filtered = filtered.filter(m => {
        const meta = deriveModelMeta(provider as any, m);
        return tags.every(t => meta.tags.includes(t));
      });
    }

    const weight = (id: string) => {
      const v = id.toLowerCase();

      if (/^gpt-5/.test(v)) return 120;
      if (/^gpt-4\.1/.test(v)) return 110;
      if (/^gpt-4o/.test(v)) return 100;
      if (/^gpt-4-turbo/.test(v)) return 90;
      if (/^gpt-4(?!\.)/.test(v)) return 80;
      if (/^gpt-3\.5/.test(v)) return 70;
      if (/^o3/.test(v)) return 65;
      if (/^o1/.test(v)) return 60;
      if (/embedding/.test(v)) return 10;
      return 50;
    };
    filtered = [...filtered].sort((a,b) => {

      const af = favorites.includes(a) ? 1 : 0;
      const bf = favorites.includes(b) ? 1 : 0;
      if (af !== bf) return bf - af;
      const dw = weight(b) - weight(a); if (dw !== 0) return dw;
      return a.localeCompare(b);
    });
    return filtered;
  };
  const scrollIntoView = (id: string) => {
    const parent = listRef.current; if (!parent) return;
    const el = parent.querySelector<HTMLElement>(`#${CSS.escape(id)}`); if (!el) return;
    const top = el.offsetTop; const bottom = top + el.offsetHeight;
    if (top < parent.scrollTop) parent.scrollTop = top - 4; else if (bottom > parent.scrollTop + parent.clientHeight) parent.scrollTop = bottom - parent.clientHeight + 4;
  };

  useEffect(() => {
    const filtered = filterModels(uModels, modelSearch, tagFilters, uProvider);
    if (filtered.length === 0) { if (modelCursor !== 0) setModelCursor(0); return; }
    if (modelCursor >= filtered.length) setModelCursor(0);
  }, [uModels, modelSearch, tagFilters, uProvider]);

  const [, setScrollTick] = useState(0);
  useEffect(() => {
    const el = listRef.current; if (!el) return;
    const onScroll = () => setScrollTick(t => (t + 1) % 1000);
    el.addEventListener('scroll', onScroll);
    return () => { el.removeEventListener('scroll', onScroll); };
  }, [listRef.current]);
  const caps = uCaps;
  const onChangeProvider = async (p: string) => { await setUProvider(p as any); await refreshUModels(p as any); };
  const onChangeModel = (m: string) => { setUModel(m); };
  const clampTemp = (v: number) => Math.min(2, Math.max(0, v));
  const clampTopP = (v: number) => Math.min(1, Math.max(0, v));
  const clampMaxTok = (v: number) => { if (caps.tokenLimit) return Math.min(caps.tokenLimit, Math.max(1, v)); return Math.max(1, v); };
  const applyUnified = () => { setUSampling({ system_prompt: localSysPrompt }); snapshotRef.current = { provider: uProvider, model: uModel, sampling: { ...uSampling, system_prompt: localSysPrompt } }; setDirtyUnified(false); };
  const revertUnified = () => { if (!snapshotRef.current) return; const s = snapshotRef.current; void setUProvider(s.provider as any); if (s.model) setUModel(s.model); setUSampling({ ...s.sampling }); setLocalSysPrompt(s.sampling.system_prompt || ''); setDirtyUnified(false); };

  useEffect(() => {
    try {
      const aiKeys = (useAiSettingsStore.getState().keys as any) || {};
      const map: Array<[string,string|undefined]> = [
        ['openai', aiKeys.openai],
        ['anthropic', aiKeys.anthropic],
        ['gemini', aiKeys.gemini],
      ];
      const unified = useAiConfigStore.getState();
      const setKey = useAiConfigStore.getState().setKey;
      for (const [pid,key] of map) {
        if (!key) continue;
        if ((unified.keys as any)[pid]?.apiKey !== key) {
          void setKey(pid as any, { apiKey: key });
        }
      }
    } catch {}
  }, [open]);

  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [defaultProv, setDefaultProv] = useState<'openai'|'anthropic'|'gemini'|'local'>(currentProvider);
  const [ollama, setOllama] = useState(settings?.ollamaBaseUrl || '');


  useEffect(() => {
    if (!open) return;

  const s = (useSettingsStore.getState().profiles.find(p => p.id === useSettingsStore.getState().activeProfileId)?.data as any)?.settings || {};

    setOllama(s?.ollamaBaseUrl || '');
    const p = s?.provider || (active?.data as any)?.provider || 'openai';
  setDefaultProv(p === 'ollama' ? 'local' : p);
  }, [open]);


  const save = async () => {


    const toInternal = (p: 'openai'|'anthropic'|'gemini'|'local') => (p === 'local' ? 'ollama' : p);
    if (toInternal(defaultProv) !== (settings?.provider || (active?.data as any)?.provider || 'openai')) {
      const internal = (defaultProv === 'local' ? 'ollama' : defaultProv) as 'openai'|'anthropic'|'gemini'|'ollama';
      setDefaultProvider(internal as any);
    }
    setOllamaBaseUrl(ollama || '');

    try {
      const s = useSettingsStore.getState();

  s.updateActive(d => ({ ...d, settings: { ...(d as any).settings, ollamaBaseUrl: ollama || (d as any).settings?.ollamaBaseUrl } } as any));
    } catch {}
    try { await savePersisted(); } catch {}
    onClose();
  };


  type NewProv = 'openai' | 'anthropic' | 'gemini';
  type Status = 'Untested' | 'Verified' | 'Invalid' | 'Rate-limited';
  const aiKeys = useAiSettingsStore(s => s.keys);
  const setAiKey = useAiSettingsStore(s => s.setKey);
  const clearAiKey = useAiSettingsStore(s => s.clearKey);
  const getDecryptedKey = useAiSettingsStore(s => s.getDecryptedKey);
  const encEnabled = useAiSettingsStore(selectKeysEnc);

  const ui = useAiSettingsStore(selectUI);
  const setUI = useAiSettingsStore(s => s.setUI);
  const setAiAssistantWidth = useAppStore(s => s.setAiAssistantWidth);
  const layoutAiWidth = useAppStore(s => s.layout.aiAssistantWidth);

  const tokenBudget = useAiSettingsStore(selectTokenBudget);
  const setTokenBudget = useAiSettingsStore(s => s.setTokenBudget);
  const adv = useAiSettingsStore(selectAdvanced);
  const setAdvanced = useAiSettingsStore(s => s.setAdvanced);

  const flags = useAiSettingsStore(selectFlags);
  const setFlags = useAiSettingsStore(s => s.setFlags);

  const [showKey, setShowKey] = useState<Record<NewProv, boolean>>({ openai: false, anthropic: false, gemini: false });
  const [dirtyKeys, setDirtyKeys] = useState<Partial<Record<NewProv, string>>>({});
  const [revealed, setRevealed] = useState<Partial<Record<NewProv, string>>>({});
  const [status, setStatus] = useState<Record<NewProv, Status>>({ openai: 'Untested', anthropic: 'Untested', gemini: 'Untested' });
  const [encrypt, setEncrypt] = useState<boolean>(encEnabled);
  const [passphrase, setPassphrase] = useState<string>('');
  const providersScopeRef = useRef<HTMLDivElement | null>(null);
  const anyDirty = Object.keys(dirtyKeys).some(k => typeof (dirtyKeys as any)[k] === 'string');
  const hasSaved = (p: NewProv) => Boolean((aiKeys as any)[p]);
  const isDirty = (p: NewProv) => typeof dirtyKeys[p] === 'string';

  const saveDisabled = (encrypt && !passphrase.trim() && anyDirty);


  useEffect(() => {
    if (!open || tab !== 'providers') return;
    const root = providersScopeRef.current;
    if (!root) return;

    const onFocusIn = () => { try { (globalThis as any).__KEY_ROUTER_SUSPENDED__ = true; } catch {} };
    const onFocusOut = () => { try { delete (globalThis as any).__KEY_ROUTER_SUSPENDED__; } catch {} };

    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);


    if (document.activeElement && root.contains(document.activeElement)) onFocusIn();

    return () => { root.removeEventListener('focusin', onFocusIn); root.removeEventListener('focusout', onFocusOut); onFocusOut(); };
  }, [open, tab, providersScopeRef]);


  useEffect(() => {
    if (!open || tab !== 'providers') return;
    const root = providersScopeRef.current;
    if (!root) return;

    const stopCapture = (e: KeyboardEvent) => {

      if (e.key === 'Escape') return;
      e.stopPropagation();
    };
    const stopSimple = (e: Event) => e.stopPropagation();


    root.addEventListener('keydown', stopCapture, true);
    root.addEventListener('keypress', stopSimple, true);
    root.addEventListener('keyup', stopSimple, true);

    return () => {
      root.removeEventListener('keydown', stopCapture, true);
      root.removeEventListener('keypress', stopSimple, true);
      root.removeEventListener('keyup', stopSimple, true);
    };
  }, [open, tab, providersScopeRef]);


  const toggleShow = async (p: NewProv) => {

    const willShow = !showKey[p];
    setShowKey(s => ({ ...s, [p]: willShow }));
    if (willShow) {

      setRevealed(r => { const n = { ...r }; delete (n as any)[p]; return n; });
    }
  };
  const onChangeKey = (p: NewProv, v: string) => setDirtyKeys(d => ({ ...d, [p]: v }));
  const onClear = (p: NewProv) => { clearAiKey(p); setDirtyKeys(d => { const n = { ...d }; delete (n as any)[p]; return n; }); setRevealed(r => { const n = { ...r }; delete (n as any)[p]; return n; }); setStatus(s => ({ ...s, [p]: 'Untested' })); };

  async function testOpenAI(k: string): Promise<Status> {
    try {
      const r = await fetch('/api/openai/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: k }) });
      if (r.status === 200) return 'Verified'; if (r.status === 401 || r.status === 403) return 'Invalid'; if (r.status === 429) return 'Rate-limited'; return 'Untested';
    } catch { return 'Untested'; }
  }
  async function testAnthropic(k: string): Promise<Status> {
    try {
      const r = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': k, 'anthropic-version': '2023-06-01' } });
      if (r.status === 200) return 'Verified'; if (r.status === 401 || r.status === 403) return 'Invalid'; if (r.status === 429) return 'Rate-limited'; if (r.status === 404) return 'Untested'; return 'Untested';
    } catch { return 'Untested'; }
  }
  async function testGemini(k: string): Promise<Status> {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(k)}`);
      if (r.status === 200) return 'Verified'; if ([400,401,403].includes(r.status)) return 'Invalid'; if (r.status === 429) return 'Rate-limited'; return 'Untested';
    } catch { return 'Untested'; }
  }
  const testers: Record<NewProv, (k: string) => Promise<Status>> = { openai: testOpenAI, anthropic: testAnthropic, gemini: testGemini };

  const onTest = async (p: NewProv) => {
  const key = dirtyKeys[p] ?? revealed[p] ?? await getDecryptedKey(p, passphrase || undefined);
    if (!key) { setStatus(s => ({ ...s, [p]: 'Untested' })); return; }
    const res = await testers[p](key);
    setStatus(s => ({ ...s, [p]: res }));
  };
  const onTestAll = async () => {
    for (const p of ['openai','anthropic','gemini'] as NewProv[]) { await onTest(p); }
  };

  const saveKeys = async () => {
    const ops: Promise<void>[] = [];
    (['openai','anthropic','gemini'] as NewProv[]).forEach(p => {
      const val = dirtyKeys[p];
      if (typeof val === 'string') {
        ops.push(setAiKey(p, val, encrypt ? { encrypt: true, passphrase } : undefined));
      }
    });
    if (ops.length) await Promise.all(ops);
  setDirtyKeys({});
  setRevealed({});
  };


  const TAB_ORDER: Array<{ key: TabKey; label: string }> = useMemo(() => ([
    { key: 'general', label: 'General' },
    { key: 'providers', label: 'Providers & Keys' },
    { key: 'appearance', label: 'Appearance' },
    { key: 'advanced', label: 'Advanced' },
    { key: 'local', label: 'Local Models' },
  ]), []);
  const navRefs = useRef<Record<TabKey, HTMLButtonElement | null>>({ general: null, providers: null, appearance: null, advanced: null, local: null });
  const onKeyNav: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const idx = TAB_ORDER.findIndex(t => t.key === tab);
    if (idx === -1) return;
    let nextIdx = idx;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { nextIdx = (idx + 1) % TAB_ORDER.length; }
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { nextIdx = (idx - 1 + TAB_ORDER.length) % TAB_ORDER.length; }
    else if (e.key === 'Home') { nextIdx = 0; }
    else if (e.key === 'End') { nextIdx = TAB_ORDER.length - 1; }
    else { return; }
    e.preventDefault();
    const next = TAB_ORDER[nextIdx];
    setTab(next.key);
    requestAnimationFrame(() => navRefs.current[next.key]?.focus());
  };
  const panelLabelId = `${id}-panel-title-${tab}`;


  useEffect(() => {
    if (open && layoutAiWidth && ui.panelWidth !== layoutAiWidth) {
      setUI({ panelWidth: layoutAiWidth });
    }
  }, [open, layoutAiWidth]);

  return (
    <Modal isOpen={open} onClose={onClose} title="Settings" size="palette" variant="palette" className="settings-modal-palette">
      <style>{`
        .settings-modal-palette { --settings-accent:#3CC7FF; }
        .settings-modal-palette ${''}
        .settings-modal-palette [data-nav] { width:252px; flex-shrink:0; display:flex; flex-direction:column; gap:8px; padding:4px 0 8px; }
        .settings-modal-palette [data-nav] button { text-align:left; padding:10px 14px; border-radius:6px; font-size:13px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); color:#94A3B8; cursor:pointer; transition:background .15s,border-color .15s,color .15s; }
        .settings-modal-palette [data-nav] button:hover { background:rgba(255,255,255,0.08); }
        .settings-modal-palette [data-nav] button[aria-selected='true'] { background:rgba(60,199,255,0.16); color:#E6EAF2; border-color:rgba(60,199,255,0.45); box-shadow:inset 2px 0 0 0 #3CC7FF; }
        .settings-modal-palette [data-nav] button:focus-visible { outline:2px solid #3CC7FF; outline-offset:2px; }
        .settings-modal-palette .panel-shell { position:relative; flex:1; min-width:0; }
        .settings-modal-palette .panel-shell > * { background:transparent; }
        .settings-modal-palette .tab-panel { display:none; }
        .settings-modal-palette .tab-panel[data-active='true'] { display:block; }
        .settings-modal-palette h3.settings-section-title { font-size:14px; font-weight:600; margin:0 0 4px; color:#E6EAF2; }
        .settings-modal-palette .settings-divider { border:0; border-top:1px solid rgba(255,255,255,0.06); margin:8px 0 16px; }
        .settings-modal-palette input[type='text'],
        .settings-modal-palette input[type='password'],
        .settings-modal-palette select,
        .settings-modal-palette textarea { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; color:#E6EAF2; font-size:14px; padding:0 14px; min-height:46px; font-family:inherit; }
        .settings-modal-palette textarea { padding:12px 14px; min-height:120px; resize:vertical; }
        .settings-modal-palette input:focus, .settings-modal-palette select:focus, .settings-modal-palette textarea:focus { outline:2px solid #3CC7FF; outline-offset:2px; border-color:#3CC7FF; background:rgba(60,199,255,0.10); }
        .settings-modal-palette .tag-button { font-size:11px; padding:4px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.05); cursor:pointer; letter-spacing:.5px; }
        .settings-modal-palette .tag-button[data-active='true'] { background:rgba(60,199,255,0.25); border-color:rgba(60,199,255,0.5); }
        .settings-modal-palette .tag-button:focus-visible { outline:2px solid #3CC7FF; outline-offset:2px; }
        .settings-modal-palette .provider-segment { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; font-size:12px; border-radius:6px; cursor:pointer; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); }
        .settings-modal-palette .provider-segment[data-active='true'] { background:rgba(60,199,255,0.16); border-color:rgba(60,199,255,0.5); color:#E6EAF2; }
        .settings-modal-palette .provider-segment:hover { background:rgba(255,255,255,0.09); }
        .settings-modal-palette .provider-segment:focus-visible { outline:2px solid #3CC7FF; outline-offset:2px; }
        .settings-modal-palette .footer-bar { position:sticky; bottom:0; left:0; right:0; padding:16px 0 0; margin-top:24px; background:linear-gradient(180deg, rgba(15,20,26,0) 0%, rgba(15,20,26,0.85) 40%, #0F141A 70%); }
        .settings-modal-palette .footer-bar-inner { border-top:1px solid rgba(255,255,255,0.06); padding-top:16px; display:flex; flex-wrap:wrap; gap:12px; justify-content:flex-end; }
        .settings-modal-palette .footer-btn { padding:10px 18px; min-height:40px; border-radius:6px; font-size:13px; border:1px solid rgba(255,255,255,0.08); background:rgba(255,255,255,0.06); color:#E6EAF2; cursor:pointer; }
        .settings-modal-palette .footer-btn.primary { background:rgba(60,199,255,0.16); border-color:rgba(60,199,255,0.5); }
        .settings-modal-palette .footer-btn.danger { background:rgba(239,68,68,0.16); border-color:rgba(239,68,68,0.55); color:#FFECEC; }
        .settings-modal-palette .footer-btn:hover { background:rgba(255,255,255,0.10); }
        .settings-modal-palette .footer-btn.primary:hover { background:rgba(60,199,255,0.22); }
        .settings-modal-palette .footer-btn.danger:hover { background:rgba(239,68,68,0.22); }
        .settings-modal-palette .footer-btn:focus-visible { outline:2px solid #3CC7FF; outline-offset:2px; }
        .settings-modal-palette .footer-btn:disabled { opacity:.4; cursor:not-allowed; }
      `}</style>
      <Wrap style={open ? undefined : { visibility:'hidden', pointerEvents:'none' }}>
        <Nav role="tablist" aria-orientation="vertical" onKeyDown={onKeyNav} data-nav>
          {TAB_ORDER.map(t => (
            <NavBtn
              key={t.key}
              ref={el => { navRefs.current[t.key] = el; }}
              role="tab"
              id={`${id}-tab-${t.key}`}
              aria-selected={tab === t.key}
              aria-controls={`${id}-panel-${t.key}`}
              tabIndex={tab === t.key ? 0 : -1}
              $active={tab === t.key}
              onClick={() => setTab(t.key)}
            >{t.label}</NavBtn>
          ))}
        </Nav>
        <PanelShell>
          <TabsContentWrap>
            <TabPanel role="tabpanel" id={`${id}-panel-general`} aria-labelledby={`${id}-tab-general`} $active={tab==='general'} data-hidden={tab!=='general'}>
              <Title id={tab==='general'?panelLabelId:undefined}>General</Title>
              <Divider />
              <Hint>Unified AI configuration. Provider & model selection stays consistent across panels. Dynamic models appear after keys are set.</Hint>
              <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginTop:8 }}>
                <div style={{ display:'grid', gap:6 }}>
                  <Label>Provider</Label>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', maxWidth:480 }} role='radiogroup' aria-label='AI Provider'>
                    {providerOptions.map(opt => (
                      <label key={opt.value} style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', border:'1px solid var(--borderSoft)', borderRadius:20, cursor:'pointer', background: uProvider===opt.value ? 'rgba(0,166,215,0.15)':'rgba(255,255,255,0.05)' }}>
                        <input style={{ display:'none' }} type='radio' name='ai-prov' value={opt.value} checked={uProvider===opt.value} onChange={() => { void onChangeProvider(opt.value); }} />
                        <span style={{ fontSize:11 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display:'grid', gap:6, minWidth:260, maxWidth:360 }}>
                  <Label>Model</Label>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <input
                      type='text'
                      placeholder={`Search ${uModels.length} models…`}
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      style={{ padding:'6px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--borderSoft)', borderRadius:8, color:'var(--textPrimary)', fontSize:12 }}
                      aria-label='Filter models'
                    />
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {['reasoning','embed','audio','vision','legacy','chat'].map(tag => {
                        const active = tagFilters.includes(tag);
                        return <button key={tag} onClick={() => setTagFilters(f => active ? f.filter(t=>t!==tag) : [...f, tag])} style={{ fontSize:9, padding:'4px 6px', borderRadius:6, border:'1px solid var(--borderSoft)', background: active ? 'rgba(0,166,215,0.25)' : 'rgba(255,255,255,0.05)', cursor:'pointer', letterSpacing:0.5 }}>{tag}</button>;
                      })}
                      {!!tagFilters.length && <button onClick={()=>setTagFilters([])} style={{ fontSize:9, padding:'4px 6px', borderRadius:6, border:'1px solid var(--borderSoft)', background:'rgba(255,255,255,0.05)', cursor:'pointer' }}>reset</button>}
                    </div>
                    <div
                      role='listbox'
                      aria-label='Model list'
                      tabIndex={0}
                      onKeyDown={e => {
                        const filtered = filterModels(uModels, modelSearch, tagFilters, uProvider);
                        if (!filtered.length) return;
                        if (e.key === 'ArrowDown') { e.preventDefault(); setModelCursor(c => Math.min(filtered.length-1, c+1)); scrollIntoView(`model-item-${modelCursor+1}`); }
                        else if (e.key === 'ArrowUp') { e.preventDefault(); setModelCursor(c => Math.max(0, c-1)); scrollIntoView(`model-item-${modelCursor-1}`); }
                        else if (e.key === 'Enter') { const pick = filtered[modelCursor]; if (pick) onChangeModel(pick); }
                      }}
                      style={{
                        maxHeight:260,
                        overflowY:'auto',
                        padding:4,
                        display:'flex',
                        flexDirection:'column',
                        gap:4,
                        background:'rgba(255,255,255,0.04)',
                        border:'1px solid var(--borderSoft)',
                        borderRadius:8,
                        position:'relative'
                      }}
                      ref={listRef}
                    >
                      {(() => {
                        const filtered = filterModels(uModels, modelSearch, tagFilters, uProvider);
                        if (!filtered.length) return <div style={{ fontSize:11, opacity:0.6, padding:'4px 6px' }}>No matches</div>;
                        const staticSet = new Set(getStaticModels(uProvider as any));

                        const ITEM_H = 34;
                        const total = filtered.length;
                        const container = listRef.current;
                        let scrollTop = 0; let viewH = 260;
                        if (container) { scrollTop = container.scrollTop; viewH = container.clientHeight; }
                        const start = Math.max(0, Math.floor(scrollTop / ITEM_H) - 4);
                        const end = Math.min(total, Math.ceil((scrollTop + viewH)/ITEM_H) + 4);
                        const topSpacer = start * ITEM_H;
                        const bottomSpacer = (total - end) * ITEM_H;
                        const slice = filtered.slice(start, end);
                        return [
                          <div key='top' style={{ height: topSpacer }} />,
                          ...slice.map((m: string, i: number) => {
                            const idx = start + i;
                            const isSelected = m === uModel;
                            const isDynamic = !staticSet.has(m);
                            const isActive = idx === modelCursor;
                            const meta = deriveModelMeta(uProvider as any, m);
                            const fav = favorites.includes(m);
                            return (
                              <button
                                id={`model-item-${idx}`}
                                key={m}
                                role='option'
                                aria-selected={isSelected}
                                onClick={() => onChangeModel(m)}
                                onMouseEnter={() => setModelCursor(idx)}
                                style={{
                                  textAlign:'left', width:'100%', padding:'6px 10px',
                                  background:isSelected ? 'linear-gradient(90deg, rgba(0,166,215,0.32), rgba(0,166,215,0.12))' : (isActive ? 'rgba(255,255,255,0.08)' : 'transparent'),
                                  border:`1px solid ${  isSelected ? 'var(--borderHighlight)' : (isActive ? 'rgba(255,255,255,0.12)' : 'transparent')}`,
                                  borderRadius:8, cursor:'pointer', color:'var(--textPrimary)', fontSize:11, lineHeight:1.2,
                                  display:'flex', justifyContent:'space-between', alignItems:'center', outline:isActive ? '1px solid rgba(0,166,215,0.35)' : 'none'
                                }}
                                title={`${m}\nFamily: ${meta.family}${meta.ctx?`\nCtx≈${meta.ctx}`:''}\nTags: ${meta.tags.join(', ')}`}
                              >
                                <span style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:200 }}>
                                  {m}
                                  <span style={{ marginLeft:6, opacity:0.45, fontSize:9 }}>{meta.family !== m ? meta.family : ''}</span>
                                </span>
                                <span style={{ display:'flex', gap:4, alignItems:'center' }}>
                                  {}
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                                    onClick={(ev) => { ev.stopPropagation(); toggleFavorite(uProvider as any, m); }}
                                    onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); toggleFavorite(uProvider as any, m); } }}
                                    title={fav?'Unfavorite':'Favorite'}
                                    style={{ border:'none', background:'transparent', color: fav? '#00A6D7':'#777', cursor:'pointer', padding:0, fontSize:12, lineHeight:1 }}
                                  >★</span>
                                  {meta.tags.filter(t=>t!=='chat').slice(0,2).map(t => <span key={t} style={{ fontSize:8, padding:'2px 4px', background:'rgba(255,255,255,0.07)', borderRadius:4, textTransform:'uppercase', letterSpacing:0.5 }}>{t}</span>)}
                                  {!!fav && <span style={{ fontSize:8, padding:'2px 4px', background:'rgba(255,215,0,0.18)', borderRadius:4 }}>fav</span>}
                                  {!!isDynamic && <span style={{ fontSize:8, padding:'2px 4px', background:'rgba(80,170,255,0.18)', borderRadius:4 }}>dyn</span>}
                                </span>
                              </button>
                            );
                          }),
                          <div key='bottom' style={{ height: bottomSpacer }} />
                        ];
                      })()}
                    </div>
                    <div style={{ fontSize:10, opacity:0.55, padding:'4px 6px' }}>{uModels.length} total • {favorites.length} favorites</div>
                    <div style={{ fontSize:10, color:'var(--textSecondary)' }}>
                      {favorites.length>0 && <span style={{ marginRight:8 }}>Fav first: {favorites.slice(0,3).join(', ')}{favorites.length>3?'…':''}</span>}
                      {uModels.length ? `${uModels.length} models${dynamicExtra?` (${dynamicExtra} dynamic)`:''}` : 'No models'}
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => { void refreshUModels(uProvider as any); }} style={{ marginTop:0, fontSize:10, padding:'4px 8px', border:'1px solid var(--borderSoft)', borderRadius:6, background:'rgba(255,255,255,0.05)', cursor:'pointer' }}>Refresh</button>
                      {!!modelSearch && <button onClick={() => setModelSearch('')} style={{ marginTop:0, fontSize:10, padding:'4px 8px', border:'1px solid var(--borderSoft)', borderRadius:6, background:'rgba(255,255,255,0.05)', cursor:'pointer' }}>Clear</button>}
                    </div>
                  </div>
                </div>
                <div style={{ display:'grid', gap:6 }}>
                  <Label>JSON Mode</Label>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12 }} title={!caps.jsonMode ? 'Not supported by this provider' : ''}>
                    <input type='checkbox' disabled={!caps.jsonMode} checked={!!caps.jsonMode && uSampling.json_mode} onChange={e => setUSampling({ json_mode: e.target.checked })} />
                    <span style={{ opacity: caps.jsonMode?1:0.5 }}>Enable</span>
                  </label>
                </div>
              </div>
              <Divider />
              <div style={{ display:'grid', gap:10 }}>
                <Label>System Prompt</Label>
                <textarea placeholder='System prompt…' value={localSysPrompt} onChange={e => { setLocalSysPrompt(e.target.value); }} style={{ minHeight:70, resize:'vertical', padding:'8px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--borderSoft)', borderRadius:8, color:'var(--textPrimary)', fontSize:12 }} />
                <div style={{ display:'flex', gap:18, flexWrap:'wrap', alignItems:'flex-start' }}>
                  <div style={{ display:'grid', gap:4 }}>
                    <Label>Temperature <span style={{ fontSize:10, opacity:0.6 }}>({uSampling.temperature.toFixed(2)})</span></Label>
                    <input type='range' min={0} max={2} step={0.1} value={uSampling.temperature} onChange={e => setUSampling({ temperature: clampTemp(parseFloat(e.target.value)) })} style={{ width:200 }} />
                  </div>
                  <div style={{ display:'grid', gap:4 }}>
                    <Label>Top P <span style={{ fontSize:10, opacity:0.6 }}>{caps.supportsTopP ? `(${(uSampling.top_p ?? 1).toFixed(2)})` : '—'}</span></Label>
                    <input type='range' min={0} max={1} step={0.05} disabled={!caps.supportsTopP} value={caps.supportsTopP ? (uSampling.top_p ?? 1) : 1} onChange={e => setUSampling({ top_p: clampTopP(parseFloat(e.target.value)) })} style={{ width:180, opacity:caps.supportsTopP?1:0.4 }} />
                  </div>
                  <div style={{ display:'grid', gap:4 }}>
                    <Label>Max Tokens</Label>
                    <input type='number' placeholder={caps.tokenLimit?`≤ ${caps.tokenLimit}`:'max tokens'} value={uSampling.max_tokens ?? ''} onChange={e => { const v = e.target.value.trim()===''?undefined:clampMaxTok(Number(e.target.value)||0); setUSampling({ max_tokens: v }); }} style={{ width:120, padding:'6px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid var(--borderSoft)', borderRadius:8, color:'var(--textPrimary)', fontSize:12 }} />
                  </div>
                </div>
                <div style={{ fontSize:10, color:'var(--textSecondary)', marginTop:4 }}>
                  Provider change triggers automatic static list + async dynamic merge. Use Providers & Keys tab to set credentials; this panel reflects them live.
                </div>
              </div>
              <Actions>
                <Button onClick={() => { revertUnified(); onClose(); }}>Cancel</Button>
                <Button disabled={!dirtyUnified} onClick={revertUnified} title='Revert to snapshot'>Revert</Button>
                <Primary disabled={!dirtyUnified} onClick={() => { applyUnified(); onClose(); }}>Save</Primary>
              </Actions>
            </TabPanel>
            <TabPanel role="tabpanel" id={`${id}-panel-providers`} aria-labelledby={`${id}-tab-providers`} $active={tab==='providers'} data-hidden={tab!=='providers'} ref={tab==='providers'?providersScopeRef:undefined}>
              <Title id={tab==='providers'?panelLabelId:undefined}>Providers & API Keys</Title>
              <Divider />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <Hint style={{ flex:1 }}>Manage provider keys. Keys are stored locally. Visibility toggle only reveals current input text.</Hint>
                <div style={{ display:'flex', gap:8 }}>
                  <Button onClick={onTestAll} style={{ alignSelf:'flex-start' }}>Test All</Button>
                  <Button
                    onClick={async () => { await saveKeys(); }}
                    disabled={saveDisabled || !anyDirty}
                    style={{ alignSelf:'flex-start' }}
                    aria-label="Save API Keys"
                  >Save API Keys</Button>
                  <Button
                    onClick={() => {
                      try { useAiSettingsStore.getState().clearAllKeys(); } catch {}
                      try { useAiConfigStore.getState().clearAllKeys(); } catch {}
                      try { useSettingsStore.getState().clearAllApiKeys?.(); } catch {}
                      setDirtyKeys({});
                      setRevealed({});
                      setShowKey({ openai:false, anthropic:false, gemini:false });
                      setStatus({ openai:'Untested', anthropic:'Untested', gemini:'Untested' });
                      try { showToast({ kind: 'success', message: 'All API keys cleared locally' }); } catch {}
                    }}
                    style={{ alignSelf:'flex-start', background:'rgba(255,80,80,0.08)', borderColor:'var(--borderSoft)' }}
                    aria-label="Clear all API keys"
                    title="Remove all saved API keys"
                  >Clear All</Button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                <Label style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span>Default Provider</span>
                  {defaultProv === currentProvider && (
                    <span style={{ fontSize:10, padding:'2px 6px', border:'1px solid var(--borderSoft)', borderRadius:6, color:'var(--success)', background:'rgba(46,204,113,0.1)' }}>Applied</span>
                  )}
                </Label>
                <ProviderGroup role="radiogroup" aria-label="Default Provider">
                  {(['openai','anthropic','gemini','local'] as const).map(p => (
                    <RadioPill key={p} $active={defaultProv===p}>
                      <input
                        type="radio"
                        name={`${id}-prov`}
                        value={p}
                        checked={defaultProv === p}
                        onChange={() => {

                          setDefaultProv(p);

                          try {

                            useSettingsStore.getState().setDefaultProvider(p);
                          } catch {}
                        }}
                      />
                      <span>{p}</span>
                    </RadioPill>
                  ))}
                </ProviderGroup>
              </div>
              <Divider />
              <KeyRowNew
                provider="openai"
                label="OpenAI API Key"
                value={dirtyKeys.openai ?? revealed.openai ?? ''}
                placeholder={hasSaved('openai' as any) && !isDirty('openai' as any) && !revealed.openai ? '•••••••• (saved)' : ''}
                show={showKey.openai}
                status={status.openai}
                hasSaved={hasSaved('openai' as any)}
                invalid={false}
                onChange={(v) => onChangeKey('openai', v)}
                onToggleShow={() => { void toggleShow('openai'); }}
                onClear={() => onClear('openai')}
                onTest={() => onTest('openai')}
              />
              <KeyRowNew
                provider="anthropic"
                label="Anthropic API Key"
                value={dirtyKeys.anthropic ?? revealed.anthropic ?? ''}
                placeholder={hasSaved('anthropic' as any) && !isDirty('anthropic' as any) && !revealed.anthropic ? '•••••••• (saved)' : ''}
                show={showKey.anthropic}
                status={status.anthropic}
                hasSaved={hasSaved('anthropic' as any)}
                invalid={false}
                onChange={(v) => onChangeKey('anthropic', v)}
                onToggleShow={() => { void toggleShow('anthropic'); }}
                onClear={() => onClear('anthropic')}
                onTest={() => onTest('anthropic')}
              />
              <KeyRowNew
                provider="gemini"
                label="Gemini API Key"
                value={dirtyKeys.gemini ?? revealed.gemini ?? ''}
                placeholder={hasSaved('gemini' as any) && !isDirty('gemini' as any) && !revealed.gemini ? '•••••••• (saved)' : ''}
                show={showKey.gemini}
                status={status.gemini}
                hasSaved={hasSaved('gemini' as any)}
                invalid={false}
                onChange={(v) => onChangeKey('gemini', v)}
                onToggleShow={() => { void toggleShow('gemini'); }}
                onClear={() => onClear('gemini')}
                onTest={() => onTest('gemini')}
              />
              <Divider />
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <input type="checkbox" checked={encrypt} onChange={e => setEncrypt(e.target.checked)} /> Encrypt locally (AES-GCM)
                </label>
                {!!encrypt && (
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <Input type="password" placeholder="Passphrase (not stored)" value={passphrase} onChange={e => setPassphrase(e.target.value)} style={{ maxWidth:260 }} />
                    {!!encrypt && !passphrase.trim() && !!anyDirty && <span style={{ fontSize:11, color:'var(--warning)' }}>Enter a passphrase to enable encrypted save.</span>}
                  </div>
                )}
                <Hint>Keys are stored locally in your browser. Toggle visibility to verify.</Hint>
              </div>
              <Actions>
                <Button onClick={() => { setDirtyKeys({}); setShowKey({ openai:false, anthropic:false, gemini:false }); onClose(); }}>Cancel</Button>
                <Primary onClick={async () => { await saveKeys(); onClose(); }} disabled={saveDisabled || !anyDirty}>Save</Primary>
              </Actions>
            </TabPanel>
            <TabPanel role="tabpanel" id={`${id}-panel-appearance`} aria-labelledby={`${id}-tab-appearance`} $active={tab==='appearance'} data-hidden={tab!=='appearance'}>
              <Title id={tab==='appearance'?panelLabelId:undefined}>Appearance</Title>
              <Divider />
              <Hint>These preferences only affect the AI panel & code blocks. Appearance applies instantly and is saved locally.</Hint>
              <div style={{ display:'flex', flexDirection:'column', gap:14, marginTop:12 }}>
                {}
                <div style={{ display:'grid', gap:6 }}>
                  <Label>Panel Width</Label>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <input
                      aria-label="Panel Width"
                      type="range"
                      min={350}
                      max={900}
                      step={2}
                      value={ui.panelWidth}
                      onChange={e => { const v = parseInt(e.target.value,10); setUI({ panelWidth: v }); setAiAssistantWidth(v); try { document.documentElement.style.setProperty('--ai-panel-width', `${v  }px`); } catch {}; }}
                      style={{ width:260 }}
                    />
                    <span style={{ fontSize:11, padding:'2px 6px', border:'1px solid var(--borderSoft)', borderRadius:6 }}>{ui.panelWidth} px</span>
                  </div>
                </div>
                {}
                <div style={{ display:'grid', gap:6 }}>
                  <Label>Code Font Size</Label>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <input
                      aria-label="Code Font Size"
                      type="range"
                      min={11}
                      max={16}
                      step={1}
                      value={ui.fontSize}
                      onChange={e => { const v = parseInt(e.target.value,10); setUI({ fontSize: v }); try { document.documentElement.style.setProperty('--ai-code-font-size', `${v  }px`); } catch {} }}
                      style={{ width:180 }}
                    />
                    <span style={{ fontSize:11, padding:'2px 6px', border:'1px solid var(--borderSoft)', borderRadius:6 }}>{ui.fontSize} px</span>
                  </div>
                </div>
                {}
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <input type="checkbox" checked={ui.compactMode} onChange={e => setUI({ compactMode: e.target.checked })} /> Compact chat density
                </label>
                {}
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <input type="checkbox" checked={ui.autoInsertToEditor} onChange={e => setUI({ autoInsertToEditor: e.target.checked })} /> Auto-insert code to editor
                </label>
                {}
                <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                  <input type="checkbox" checked={ui.confirmOverwrite} onChange={e => setUI({ confirmOverwrite: e.target.checked })} /> Confirm overwrite before replace
                </label>
              </div>
            </TabPanel>
            <TabPanel role="tabpanel" id={`${id}-panel-advanced`} aria-labelledby={`${id}-tab-advanced`} $active={tab==='advanced'} data-hidden={tab!=='advanced'}>
              <Title id={tab==='advanced'?panelLabelId:undefined}>Advanced</Title>
              <Divider />
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'flex', flexDirection:'column', gap:8, background:'rgba(255,255,255,0.03)', padding:'8px 10px', border:'1px solid var(--borderSoft)', borderRadius:8 }}>
                  <Label style={{ fontSize:11, textTransform:'uppercase', letterSpacing:0.5 }}>Experimental / QA</Label>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                    <input type="checkbox" checked={flags.aiStreamingV2} onChange={e => setFlags({ aiStreamingV2: e.target.checked })} /> Use new streaming (rAF buffer)
                  </label>
                  <label style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:12 }}>
                    <input type="checkbox" checked={flags.logAiEvents} onChange={e => setFlags({ logAiEvents: e.target.checked })} /> Log AI events to QA panel
                  </label>
                  <Hint>Dev-only: events also pushed to <code style={{ fontSize:11 }}>window.__AI_EVENTS__</code>.</Hint>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  <Label>Token Budget</Label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Input type="number" min={1000} step={500} value={tokenBudget} onChange={e => setTokenBudget(Math.max(1, parseInt(e.target.value,10) || 0))} style={{ width:160 }} />
                    <span style={{ fontSize:11, color:'var(--textSecondary)' }}>Max tokens per request (hard cap).</span>
                  </div>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  <Label>Stream flush (ms)</Label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Input type="number" min={16} max={128} step={1} value={adv.flushMs} onChange={e => setAdvanced({ flushMs: Math.min(128, Math.max(16, parseInt(e.target.value,10) || 48)) })} style={{ width:120 }} />
                    <span style={{ fontSize:11, padding:'2px 6px', border:'1px solid var(--borderSoft)', borderRadius:6 }}>{adv.flushMs} ms</span>
                    <span style={{ fontSize:11, color:'var(--textSecondary)' }}>Lower = smoother stream, higher = fewer renders.</span>
                  </div>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  <Label>Max retries</Label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Input type="number" min={0} max={3} step={1} value={adv.maxRetries} onChange={e => setAdvanced({ maxRetries: Math.min(3, Math.max(0, parseInt(e.target.value,10) || 0)) })} style={{ width:100 }} />
                    <span style={{ fontSize:11, color:'var(--textSecondary)' }}>Retry attempts for 429/5xx.</span>
                  </div>
                </div>
                <div style={{ display:'grid', gap:8 }}>
                  <Label>Retry backoff (ms)</Label>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <Input type="number" min={200} max={4000} step={50} value={adv.retryBackoffMs} onChange={e => setAdvanced({ retryBackoffMs: Math.min(4000, Math.max(200, parseInt(e.target.value,10) || 800)) })} style={{ width:140 }} />
                    <span style={{ fontSize:11, padding:'2px 6px', border:'1px solid var(--borderSoft)', borderRadius:6 }}>{adv.retryBackoffMs} ms</span>
                  </div>
                </div>
                {}
                <Divider />
                <ExportImportSection />
                <Divider />
                <ResetSection clearAiKey={clearAiKey} setAdvanced={setAdvanced} setUI={setUI} setTokenBudget={setTokenBudget} />
              </div>
            </TabPanel>
            <TabPanel role="tabpanel" id={`${id}-panel-local`} aria-labelledby={`${id}-tab-local`} $active={tab==='local'} data-hidden={tab!=='local'}>
              <Title id={tab==='local'?panelLabelId:undefined}>Local Models (Ollama)</Title>
              <Divider />
              <Hint>Connect to a local Ollama instance, view pulled models, and set a default local model.</Hint>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:10 }}>
                <Label>Ollama Base URL</Label>
                <Input placeholder="http://localhost:11434" value={ollama} onChange={e => setOllama(e.target.value)} style={{ maxWidth:320 }} />
                <div style={{ display:'flex', gap:10 }}>
                  <Button onClick={async () => {
                    if (!ollama) { setOllamaError('Enter base URL'); return; }
                    setOllamaLoading(true); setOllamaError(null); setOllamaModels([]);
                    try {
                      const r = await fetch(`${ollama.replace(/\/$/, '')}/api/tags`);
                      if (!r.ok) throw new Error(`${r.status  }`);
                      const j: any = await r.json();
                      const names = Array.isArray(j?.models) ? j.models.map((m: any) => m.name).filter(Boolean) : [];
                      setOllamaModels(names);
                      if (names.length === 0) setOllamaError('No models found. Pull one via `ollama pull llama3` etc.');
                    } catch (e: any) {
                      setOllamaError('Failed to fetch models');
                    } finally { setOllamaLoading(false); }
                  }}>Fetch Models</Button>
                  <Button onClick={() => { setOllamaModels([]); setOllamaError(null); }}>Clear</Button>
                </div>
                {!!ollamaLoading && <div style={{ fontSize:12, color:'var(--textSecondary)' }}>Loading…</div>}
                {!!ollamaError && <div style={{ fontSize:12, color:'var(--error)' }}>{ollamaError}</div>}
                {ollamaModels.length > 0 && (
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <Label>Discovered Models</Label>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, maxWidth:560 }}>
                      {ollamaModels.map(m => (
                        <button
                          key={m}
                          onClick={() => {

                            useSettingsStore.getState().setProvider('ollama');
                            useSettingsStore.getState().setModel(m);
                            setDefaultProv('local');
                          }}
                          style={{ fontSize:11, padding:'6px 10px', border:'1px solid var(--borderSoft)', borderRadius:8, background:'rgba(255,255,255,0.05)', cursor:'pointer' }}
                        >{m}</button>
                      ))}
                    </div>
                  </div>
                )}
                <Divider />
                <Hint style={{ fontSize:11 }}>Use command line to pull more models. Example: <code style={{ fontSize:11 }}>ollama pull llama3</code>. Then click Fetch Models.</Hint>
              </div>
              <Actions>
                <Button onClick={onClose}>Close</Button>
                <Primary onClick={save}>Save</Primary>
              </Actions>
            </TabPanel>
          </TabsContentWrap>
        </PanelShell>
      </Wrap>
    </Modal>
  );
};


const ExportImportSection: React.FC = () => {
  const [includeKeys, setIncludeKeys] = useState(false);
  const [includeKeysImport, setIncludeKeysImport] = useState(false);
  const setUI = useAiSettingsStore(s => s.setUI);
  const setTokenBudget = useAiSettingsStore(s => s.setTokenBudget);
  const setAdvanced = useAiSettingsStore(s => s.setAdvanced);
  const setDefaults = useAiSettingsStore(s => s.setDefaults);
  const setContext = useAiSettingsStore(s => s.setContext);

  const keysEnc = useAiSettingsStore(selectKeysEnc);

  function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
  }

  const onExport = () => {
    const { keys, ...rest } = useAiSettingsStore.getState();
    const payload: any = { ...rest };
    if (includeKeys) {
      payload.keys = keys;
    } else {
      payload.keys = keysEnc ? { enc: true } : {};
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    download(blob, `ai-settings-${Date.now()}.json`);
  };

  const onImport: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return; e.target.value = '';
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (json.ui) setUI(json.ui);
      if (json.tokenBudget != null) setTokenBudget(json.tokenBudget);
      if (json.advanced) setAdvanced(json.advanced);
      if (json.defaults) setDefaults(json.defaults);
      if (json.context) setContext(json.context);
      if (includeKeysImport && json.keys) {
        try {
          const { openai, anthropic, gemini, enc } = json.keys as any;

          useAiSettingsStore.setState(s => ({
            ...s,
            keys: {
              ...s.keys,
              ...(openai ? { openai } : {}),
              ...(anthropic ? { anthropic } : {}),
              ...(gemini ? { gemini } : {}),
              enc: enc === true ? true : s.keys.enc === true,
              lastUpdated: Date.now(),
            }
          }));
          try { showToast({ kind: 'success', message: 'Settings imported' }); } catch {}
        } catch {}
      } else {
        try { showToast({ kind: 'success', message: 'Settings imported (keys skipped)' }); } catch {}
      }
    } catch {

      try { showToast({ kind: 'error', message: 'Import failed (invalid JSON)' }); } catch {}
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <Primary onClick={onExport}>Export</Primary>
        <label style={{ fontSize:12, display:'inline-flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={includeKeys} onChange={e => setIncludeKeys(e.target.checked)} /> Include keys (not recommended)
        </label>
        <div style={{ fontSize:11, color:'var(--textSecondary)' }}>Saves settings as JSON locally. Keys excluded by default.</div>
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
        <label style={{ fontSize:12, border:'1px dashed var(--borderSoft)', padding:'6px 10px', borderRadius:8, cursor:'pointer' }}>
          <input style={{ display:'none' }} type="file" accept="application/json" onChange={onImport} /> Import JSON
        </label>
        <label style={{ fontSize:12, display:'inline-flex', alignItems:'center', gap:6 }}>
          <input type="checkbox" checked={includeKeysImport} onChange={e => setIncludeKeysImport(e.target.checked)} /> Include keys on import
        </label>
        <div style={{ fontSize:11, color:'var(--textSecondary)' }}>Import merges fields; keys only if explicitly allowed.</div>
      </div>
    </div>
  );
};

interface ResetProps { clearAiKey: (p: 'openai'|'anthropic'|'gemini') => void; setUI: (p: any) => void; setTokenBudget: (n:number)=>void; setAdvanced: (p:any)=>void; }
const ResetSection: React.FC<ResetProps> = ({ clearAiKey, setUI, setTokenBudget, setAdvanced }) => {
  const setDefaults = useAiSettingsStore(s => s.setDefaults);
  const setContext = useAiSettingsStore(s => s.setContext);
  const defaultsGen = { provider: 'openai' as const, model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 2048 };
  const defaultsUI = { panelWidth: 450, fontSize: 13, compactMode: false, autoInsertToEditor: false, confirmOverwrite: true };
  const defaultsContext = { scope: 'selection', includeComments: false } as const;
  const defaultsAdvanced = { flushMs: 48, maxRetries: 1, retryBackoffMs: 800 };

  const resetKeepKeys = () => {
    setUI(defaultsUI);
    setDefaults(defaultsGen);
    setContext(defaultsContext);
    setTokenBudget(8000);
    setAdvanced(defaultsAdvanced);
  };
  const resetWipeKeys = () => {
    resetKeepKeys();
    clearAiKey('openai'); clearAiKey('anthropic'); clearAiKey('gemini');
  };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ fontSize:12, color:'var(--textSecondary)' }}>Reset AI settings:</div>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <Button onClick={resetKeepKeys}>Reset (keep keys)</Button>
        <Button onClick={resetWipeKeys}>Wipe keys too</Button>
      </div>
    </div>
  );
};

export default SettingsModal;
