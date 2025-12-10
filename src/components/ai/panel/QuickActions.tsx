import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconButton, QuickActionsBar } from './styles';
import { Clipboard, ClipboardPaste, Eraser, KeyRound, Paperclip, Settings, Square } from 'lucide-react';
import editorBridge from '@/services/editorBridge';
import { mapFenceToLangAndExt } from './code-lang';
import { showToast } from '@/ui/toast/api';
import { selectEffectiveRoute, useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';

type Props = {
  clearAll: () => void;
  fsm: { cancel: (reason: unknown) => void };
  abortStreaming: (reason?: string) => void;
  onOpenSettings: () => void;
  messages?: Array<{ role: string; content: string; error?: string }>;
};

const QuickActions: React.FC<Props> = ({ clearAll, fsm, abortStreaming, onOpenSettings, messages }) => {

  const { profiles, activeProfileId } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const legacyProvider = (active?.data as { settings?: { provider?: string }; provider?: string } | undefined)?.settings?.provider || (active?.data as { provider?: string } | undefined)?.provider || 'openai';
  const legacyKeys = (active?.data as { keys?: Record<string, { apiKey?: string }> } | undefined)?.keys || {};

  const eff = useAiSettingsStore(selectEffectiveRoute);

  const effectiveProvider = (eff?.provider || legacyProvider) as 'openai' | 'anthropic' | 'gemini' | 'ollama';


  const aiVault = useAiSettingsStore(s => s.keys);
  const setAiKey = useAiSettingsStore(s => s.setKey);


  useEffect(() => {
    if (!aiVault.openai) {
      const legacyOpen = legacyKeys?.openai?.apiKey;
      if (legacyOpen) { void setAiKey('openai', legacyOpen); }
    }

  }, []);


  const openaiKey    = legacyKeys?.openai?.apiKey    ?? aiVault.openai;
  const anthropicKey = legacyKeys?.anthropic?.apiKey ?? aiVault.anthropic;
  const geminiKey    = legacyKeys?.gemini?.apiKey    ?? aiVault.gemini;


  type Status = 'untested' | 'verifying' | 'ok' | 'invalid' | 'rate';
  const [status, setStatus] = useState<Status>('untested');
  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const keyOk = useMemo(() => {
    if (effectiveProvider === 'openai') return !!openaiKey;
    if (effectiveProvider === 'anthropic') return !!anthropicKey;
  if (effectiveProvider === 'gemini') return !!geminiKey;
    if (effectiveProvider === 'ollama') return true;
    return false;
  }, [effectiveProvider, openaiKey, anthropicKey, geminiKey]);


  useEffect(() => {
    if (effectiveProvider === 'ollama') { setStatus('ok'); return; }

  if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setStatus(keyOk ? 'verifying' : 'untested');
    const run = async () => {
      if (!keyOk) return;
      abortRef.current?.abort();
      const ac = new AbortController(); abortRef.current = ac;
      try {
        let resp: Response | null = null;
        if (effectiveProvider === 'openai' && openaiKey) {
          resp = await fetch('/api/openai/verify', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ key: openaiKey }), signal: ac.signal });
        } else if (effectiveProvider === 'anthropic' && anthropicKey) {
          resp = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' }, signal: ac.signal });
        } else if (effectiveProvider === 'gemini' && geminiKey) {
          resp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${encodeURIComponent(geminiKey)}`, { signal: ac.signal });
        }
        if (!resp) { setStatus('untested'); return; }
        if (resp.status === 200) setStatus('ok');
        else if (resp.status === 429) setStatus('rate');
        else if (resp.status === 401 || resp.status === 403) setStatus('invalid');
        else setStatus('untested');
      } catch {
        if (!abortRef.current?.signal.aborted) setStatus('untested');
      }
    };
  timeoutRef.current = setTimeout(run, 600);
  }, [effectiveProvider, openaiKey, anthropicKey, geminiKey, keyOk]);

  const statusColor = (st: Status): string => {
    if (st === 'ok') return '#2ECC71';
    if (st === 'invalid') return '#E74C3C';
    if (st === 'rate') return '#E1C542';
    if (st === 'verifying') return '#3498DB';
    return '#A0A0A0';
  };

  const statusLabel = (st: Status): string => {
    if (effectiveProvider === 'ollama') return 'Local (no key)';
    if (st === 'ok') return 'API key verified';
    if (st === 'invalid') return 'API key invalid';
    if (st === 'rate') return 'Rate limited';
    if (st === 'verifying') return 'Verifying key…';
    return keyOk ? 'Key present (untested)' : 'Key missing';
  };
  const lastAssistant = useMemo(() => {
    const arr = (messages || []) as Array<{ role: string; content: string; error?: string }>;
    for (let i = arr.length - 1; i >= 0; i--) {
      const m = arr[i];
      if (m.role === 'assistant' && !m.error && m.content) return m;
    }
    return null;
  }, [messages]);

  const extractFirstCode = useCallback((text: string): { code: string; info?: string | undefined } | null => {
    const re = /(^|\n)(`{3,}|~{3,})\s*([^\n]*)\n([\s\S]*?)\n\2(\n|$)/;
    const m = re.exec(text);
    if (!m) return null;
    return { code: (m[4] || '').replace(/\s+$/g, ''), info: (m[3] || '').trim() || undefined };
  }, []);

  const onCopyLast = useCallback(async () => {
    if (!lastAssistant) return;
    try { await navigator.clipboard.writeText(lastAssistant.content); showToast({ kind: 'success', message: 'Copied last reply' }); } catch {}
  }, [lastAssistant]);

  const onInsertLast = useCallback(async () => {
    if (!lastAssistant) return;
    const blk = extractFirstCode(lastAssistant.content); if (!blk) return;
    const { monaco } = mapFenceToLangAndExt(blk.info);

    const normalize = (m?: string): import('@/services/editorBridge').SupportedLang => {
      const v = (m || '').toLowerCase();
      if (v === 'ts' || v === 'tsx' || v === 'typescript') return 'typescript';
      if (v === 'js' || v === 'jsx' || v === 'javascript') return 'javascript';
      if (v === 'py' || v === 'python') return 'python';
      if (v === 'md' || v === 'markdown') return 'markdown';
      if (v === 'json') return 'json';
      if (v === 'css') return 'css';
      if (v === 'html' || v === 'htm') return 'html';
      return 'javascript';
    };
    await editorBridge.insertIntoActive({ code: blk.code, language: normalize(monaco) });
  }, [lastAssistant, extractFirstCode]);

  const last = lastAssistant;
  const hasCode = !!(lastAssistant && extractFirstCode(lastAssistant.content));

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onSelectFiles = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      showToast({ kind: 'info', message: `${files.length} file(s) attached (preview soon)` });
    }
  }, []);
  const triggerFile = useCallback(() => { fileInputRef.current?.click(); }, []);


  const handleClear = useCallback(() => { clearAll(); }, [clearAll]);
  const handleStop = useCallback(() => { abortStreaming('user_cancel'); fsm.cancel('user_escape'); }, [abortStreaming, fsm]);

  return (
    <QuickActionsBar aria-label="Quick Actions">
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton aria-label="Copy last reply" title="Copy last reply" disabled={!last} onClick={onCopyLast}>
          <Clipboard size={16} />
        </IconButton>
        <IconButton aria-label="Insert first code block" title="Insert first code block" disabled={!hasCode} onClick={onInsertLast}>
          <ClipboardPaste size={16} />
        </IconButton>
        <IconButton aria-label="Attach files" title="Attach files" onClick={triggerFile} data-testid="attach-files-btn">
          <Paperclip size={16} />
        </IconButton>
        <input ref={fileInputRef} type="file" multiple onChange={onSelectFiles} style={{ display: 'none' }} aria-hidden="true" />
        <IconButton aria-label="Clear chat" title="Clear chat" onClick={handleClear}>
          <Eraser size={16} />
        </IconButton>
        <IconButton aria-label="Stop streaming" title="Stop streaming" onClick={handleStop}>
          <Square size={16} />
        </IconButton>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <IconButton
          aria-label={statusLabel(status)}
          title={statusLabel(status)}
          onClick={onOpenSettings}
          style={{ color: statusColor(status) }}
          data-testid="ai-key-status"
        >
          <KeyRound size={16} />
        </IconButton>
        <IconButton aria-label="Settings" title="Settings" onClick={onOpenSettings}>
          <Settings size={16} />
        </IconButton>
      </div>
    </QuickActionsBar>
  );
};

export default QuickActions;
