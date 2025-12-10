import React, { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComposerContainer, Hint, IconButton, MetaRow, QuickActionsBar, RightSide, SendButton, StopButton, TextArea, TokenText } from './styles';
import type { UiMessage } from './types';
import type { AiProvider } from '@/hooks/useAiStreaming';
import { buildNormalizedPrompt } from './utils/normalize';
import { Brain, Clipboard, ClipboardPaste, Eraser, KeyRound, Paperclip, Settings, Square } from 'lucide-react';

const PsychiatryModal = lazy(() => import('@/features/psychiatry/PsychiatryModal').catch(err => { console.warn('[Psych] module load failed', err); return { default: () => null }; }));
const WelcomeModal = lazy(() => import('@/features/psychiatry/header/WelcomeModal').catch(err => { console.warn('[WelcomeModal] load failed', err); return { default: () => null }; }));
const FEATURE_PSYCH = (import.meta as any).env?.VITE_FEATURE_PSYCH_TOOLKIT !== 'false';
import editorBridge from '@/services/editorBridge';
import { mapFenceToLangAndExt } from './code-lang';
import { showToast } from '@/ui/toast/api';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import { resolveProviderKey } from '@/ai/utils/resolveKey';


interface ProviderKeyBag {
  openai?: { apiKey?: string };
  anthropic?: { apiKey?: string };
  gemini?: { apiKey?: string };
  google?: { apiKey?: string };
}

import { isComposingIME } from '@/ui/keys/dom';
import { estimatePromptAndCompletion } from '@/lib/ai/context/estimator';
import { getModelContextWindow } from '@/lib/ai/context/budget';


export interface UnifiedComposerProps {
  draft: string;
  setDraft: (v: string) => void;
  messages: Array<{ role: string; content: string; error?: string }>;
  appendUser: (text: string, route?: { provider?: string; model?: string }) => UiMessage;
  appendAssistantPlaceholder: (route?: { provider?: string; model?: string }) => UiMessage;
  mergeAssistantDelta: (id: string, chunk: string) => void;
  finalizeAssistant: (id: string) => void;
  setErrorOnAssistant: (id: string, message: string) => void;
  fsm: { canSend: boolean; send: (text: string, provider: string, model: string) => void; open: () => { rid: number; signal: AbortSignal }; delta: (rid: number, chunk: string) => void; done: (rid: number) => void; fail: (message: string, code?: string, rid?: number) => void; cancel: (reason: unknown) => void };
  startStreaming: (params: { provider: AiProvider; modelId: string; prompt: string; systemPrompt?: string; temperature?: number; topP?: number; maxTokens?: number; jsonMode?: boolean; onStart?: (meta: { requestId: string }) => void; onDelta?: (chunk: string) => void; onComplete?: (full: string) => void; onError?: (err: unknown) => void; openai?: string; anthropic?: string; google?: string; ollama?: string }, options?: { groupKey?: string; signal?: AbortSignal }) => { opToken: string; abort: () => void; groupKey: string };
  abortStreaming: (reason?: string) => void;
  clearAll: () => void;
  onRetry?: () => void;
  hasError?: boolean;
  onOpenSettings: () => void;
}

const UnifiedComposer: React.FC<UnifiedComposerProps> = ({
  draft,
  setDraft,
  messages,
  appendUser,
  appendAssistantPlaceholder,
  mergeAssistantDelta,
  finalizeAssistant,
  setErrorOnAssistant,
  fsm,
  startStreaming,
  abortStreaming,
  clearAll,
  onRetry,
  hasError = false,
  onOpenSettings,
}) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState<{ prompt: number; window: number } | null>(null);

  const [isPsychOpen, setPsychOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const handleOpenPsychiatry = () => {
    setShowWelcomeModal(true);
  };

  const handleWelcomeClose = () => {
    setShowWelcomeModal(false);
    setTimeout(() => setPsychOpen(true), 100);
  };
  const draftRef = useRef(draft);
  useEffect(() => { draftRef.current = draft; }, [draft]);


  const activeProfile = useSettingsStore(s => s.profiles.find(p => p.id === s.activeProfileId));
  interface ProfileDataShape { settings?: { model?: string; jsonMode?: boolean }; model?: string; sampling?: { temperature?: number; top_p?: number; max_output_tokens?: number | null }; meta?: { systemPrompt?: string }; keys?: Record<string, { apiKey?: string }>; }
  const profileData: ProfileDataShape | undefined = activeProfile?.data as unknown as ProfileDataShape | undefined;
  const legacyModel = (profileData?.settings?.model || profileData?.model || 'gpt-4o-mini');

  const runtime = useAiConfigStore(AiSelectors.runtime) as { provider: AiProvider; model?: string; temperature?: number; topP?: number; maxTokens?: number; jsonMode?: boolean; apiKey?: string };
  const provider = runtime.provider as AiProvider;
  const model = (runtime.model || legacyModel) as string;

  const stg = useMemo(() => profileData?.settings || {}, [profileData?.settings]);
  const profileSampling = useMemo(() => profileData?.sampling || { temperature: 0.3, top_p: 1, max_output_tokens: null }, [profileData?.sampling]);
  const sampling = useMemo(() => ({
    ...profileSampling,
    temperature: runtime.temperature ?? profileSampling.temperature,
    top_p: runtime.topP ?? profileSampling.top_p,
    max_output_tokens: runtime.maxTokens ?? profileSampling.max_output_tokens,
  }), [profileSampling, runtime.temperature, runtime.topP, runtime.maxTokens]);
  const sysPrompt = profileData?.meta?.systemPrompt || '';
  const jsonMode = !!(runtime.jsonMode ?? stg?.jsonMode);
  const aiVault = useAiSettingsStore(s => s.keys);
  const activeRoute = useMemo(() => ({ provider, model, keys: profileData?.keys || {}, stg, sampling, sysPrompt, jsonMode }), [provider, model, profileData?.keys, stg, sampling, sysPrompt, jsonMode]);


  const isQuotaBlocked = false;
  const canSend = fsm?.canSend && draft.trim().length > 0;


  const sendOrRetryRef = useRef<() => void>(() => {});


  type Status = 'untested' | 'verifying' | 'ok' | 'invalid' | 'rate';
  const [status, setStatus] = useState<Status>('untested');
  const abortRef = useRef<AbortController | null>(null);
  const openaiKey    = activeRoute.keys?.openai?.apiKey    ?? aiVault.openai ?? (provider==='openai'? runtime.apiKey: undefined);
  const anthropicKey = activeRoute.keys?.anthropic?.apiKey ?? aiVault.anthropic ?? (provider==='anthropic'? runtime.apiKey: undefined);
  const geminiKey    = activeRoute.keys?.gemini?.apiKey    ?? aiVault.gemini ?? (provider==='gemini'? runtime.apiKey: undefined);
  const keyOk = useMemo(() => {
    if (provider === 'openai') return !!openaiKey;
    if (provider === 'anthropic') return !!anthropicKey;
  if (provider === 'gemini') return !!geminiKey;
    if (provider === 'ollama') return true;
    return false;
  }, [provider, openaiKey, anthropicKey, geminiKey]);

  useEffect(() => {
    if (provider === 'ollama') { setStatus('ok'); return undefined; }
    setStatus(keyOk ? 'verifying' : 'untested');
    const run = async () => {
      if (!keyOk) return;
      abortRef.current?.abort();
      const ac = new AbortController(); abortRef.current = ac;
      try {
        let resp: Response | null = null;
        if (provider === 'openai' && openaiKey) {
          resp = await fetch('/api/openai/verify', { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ key: openaiKey }), signal: ac.signal });
        } else if (provider === 'anthropic' && anthropicKey) {
          resp = await fetch('https://api.anthropic.com/v1/models', { headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' }, signal: ac.signal });
        } else if (provider === 'gemini' && geminiKey) {
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
    const t = setTimeout(run, 600);
    return () => { clearTimeout(t); abortRef.current?.abort(); };
  }, [provider, openaiKey, anthropicKey, geminiKey, keyOk]);

  const statusColor = (st: Status): string => {
    if (st === 'ok') return '#2ECC71';
    if (st === 'invalid') return '#E74C3C';
    if (st === 'rate') return '#E1C542';
    if (st === 'verifying') return '#3498DB';
    return '#A0A0A0';
  };
  const statusLabel = (st: Status): string => {
    if (provider === 'ollama') return 'Local (no key)';
    if (st === 'ok') return 'API key verified';
    if (st === 'invalid') return 'API key invalid';
    if (st === 'rate') return 'Rate limited';
    if (st === 'verifying') return 'Verifying key…';
    return keyOk ? 'Key present (untested)' : 'Key missing';
  };

  const lastAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
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
    const lang = (monaco || 'plaintext') as Parameters<typeof editorBridge.insertIntoActive>[0]['language'];

    await editorBridge.insertIntoActive({ code: blk.code, language: (lang || 'plaintext') as Exclude<typeof lang, undefined> });
  }, [lastAssistant, extractFirstCode]);

  const hasCode = !!(lastAssistant && extractFirstCode(lastAssistant.content));

  const attachInputId = 'composer-attach-input';
  const onTriggerAttach = useCallback(() => {
    const el = document.getElementById(attachInputId) as HTMLInputElement | null; el?.click();
  }, []);
  const onFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const count = (e.target.files || []).length; if (count) {  }
  }, []);

  const trySend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    if (!fsm.canSend) { showToast({ kind: 'info', message: 'Busy, please wait…', contextKey: 'ai:busy' }); return; }
    const route = { provider: activeRoute.provider, model: activeRoute.model } as const;
    appendUser(text, route);
    const assistant = appendAssistantPlaceholder(route);
    if (!assistant || !assistant.id) {
      showToast({ kind: 'error', message: 'Assistant placeholder oluşturulamadı.' });
      return;
    }
    const { prompt, systemPrompt } = buildNormalizedPrompt({ userText: text });
    setDraft('');
    fsm.send(text, route.provider, route.model);
    const { rid, signal } = fsm.open();

  const legacyKeys: ProviderKeyBag = (activeRoute.keys as ProviderKeyBag) || {};
  const providerForKey = (route.provider === 'gemini' ? 'google' : route.provider) as 'openai'|'anthropic'|'google';
  const providerKey = runtime.apiKey || resolveProviderKey(providerForKey, legacyKeys, aiVault as ProviderKeyBag);
  const bypassKeys = (typeof window !== 'undefined') && (() => { try { const sp = new URLSearchParams(location.search); return sp.get('e2e') === '1'; } catch { return false; } })();
  if (!providerKey && route.provider !== 'ollama' && !bypassKeys) { showToast({ kind: 'error', message: 'Missing API key for provider.' }); return; }
  const assistantContentRef = { current: '' };

    const streamParams: {
      provider: AiProvider;
      modelId: string;
      prompt: string;
      runtime: typeof runtime;
      systemPrompt?: string;
      onDelta: (chunk: string) => void;
      onComplete: () => void;
      onError: (err: unknown) => void;
      openai?: string; anthropic?: string; gemini?: string;
    } = {
      provider: route.provider as AiProvider,
      modelId: route.model,
      prompt,
      runtime: runtime,
      ...(systemPrompt || activeRoute.sysPrompt ? { systemPrompt: [activeRoute.sysPrompt, systemPrompt].filter(Boolean).join('\n\n') } : {}),
      onDelta: (chunk: string) => { assistantContentRef.current += chunk; mergeAssistantDelta(assistant.id, chunk); try { fsm.delta(rid, chunk); } catch {} },
      onComplete: () => { finalizeAssistant(assistant.id); try { fsm.done(rid); } catch {} },
      onError: (err: unknown) => {

        const rec = err as { message?: string; category?: string; providerCode?: string };
        const msg = rec?.message || String(err ?? 'error');

        console.warn?.('[AI][UI] STREAM_ERROR_FINAL', { reason: rec?.category, code: rec?.providerCode });
        setErrorOnAssistant(assistant.id, msg);
        fsm.fail(msg, undefined, rid);
      },
    };

    if (!runtime.apiKey) {
      if (route.provider === 'openai' && providerKey) streamParams.openai = providerKey;
      if (route.provider === 'anthropic' && providerKey) streamParams.anthropic = providerKey;
  if (route.provider === 'gemini' && providerKey) (streamParams as Record<string, unknown>).gemini = providerKey;
    }
  if (!providerKey && !runtime.apiKey && route.provider !== 'ollama' && !bypassKeys) { showToast({ kind: 'error', message: 'Missing API key for provider.' }); return; }

  try {
    startStreaming(streamParams, { groupKey: `assistant:${assistant.id}`, signal });
  } catch {
    showToast({ kind: 'error', message: 'Streaming başlatılamadı.' });
  }
  }, [draft, fsm, activeRoute, appendUser, appendAssistantPlaceholder, mergeAssistantDelta, finalizeAssistant, setErrorOnAssistant, setDraft, startStreaming, aiVault, runtime]);


  const sendOrRetry = useCallback(() => {
    if (hasError && onRetry) {
      onRetry();
      return;
    }
    trySend();
  }, [hasError, onRetry, trySend]);
  sendOrRetryRef.current = sendOrRetry;

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {

      if ((e as any).isComposing || isComposingIME(e.nativeEvent as any)) return;
      if (e.shiftKey) return;
      e.preventDefault();
      sendOrRetryRef.current();
    }
  }, []);


  useEffect(() => {
    const el = taRef.current; if (!el) return; el.style.height = 'auto'; el.style.height = `${Math.min(160, Math.max(40, el.scrollHeight))}px`;
  }, [draft]);
  useEffect(() => { taRef.current?.focus(); }, []);
  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {

      if ((e as any).isComposing || isComposingIME(e)) return;
      if (e.key === 'Escape') { abortStreaming?.('user_cancel'); try { fsm.cancel('user_escape'); } catch {} }
    };
    window.addEventListener('keydown', onDocKey, true);
    return () => window.removeEventListener('keydown', onDocKey, true);
  }, [fsm, abortStreaming]);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const m = activeRoute.model;
        const txt = draft.trim();
        if (!m || txt.length === 0) { setHint(null); return; }
        const est = await estimatePromptAndCompletion(m, { system: '', messages: [{ role: 'user', content: txt }] });
        const ctx = getModelContextWindow(m); setHint({ prompt: est.prompt ?? 0, window: ctx ?? 0 });
      } catch { setHint(null); }
    }, 300);
    return () => { clearTimeout(t); };
  }, [draft, activeRoute.model]);


  const handleClear = useCallback(() => { clearAll(); }, [clearAll]);
  const handleStop = useCallback(() => { abortStreaming('user_cancel'); try { fsm.cancel('user_escape'); } catch {} }, [abortStreaming, fsm]);
  const handleChangeDraft = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => { setDraft(e.target.value); }, [setDraft]);

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <QuickActionsBar aria-label="Composer Actions" style={{ padding: '4px 8px' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {!!FEATURE_PSYCH && (
            <IconButton
              aria-label="Psychiatry toolkit"
              title="Psychiatry toolkit"
              onClick={handleOpenPsychiatry}
              data-testid="btn-psych-kit"
              style={{
                width: 'auto',
                height: 'auto',
                padding: '8px 12px',
                borderRadius: 9999,
                background: 'linear-gradient(135deg,#00A6D7 0%,#3CC7FF 50%,#7EE0FF 100%)',
                border: '0',
                color: '#041017',
                boxShadow: '0 4px 14px -2px rgba(0,166,215,0.45)',
                transform: 'translateY(0)',
                transition: 'transform 120ms ease, box-shadow 140ms ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px -2px rgba(0,166,215,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px -2px rgba(0,166,215,0.45)'; }}
            >
              <Brain size={16} />
              <span style={{
                marginLeft: 8,
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '.25px',
                color: '#041017',
                textTransform: 'none',
                whiteSpace: 'nowrap'
              }}>Psychiatry toolkit</span>
            </IconButton>
          )}
          <IconButton aria-label="Copy last reply" title="Copy last reply" disabled={!lastAssistant} onClick={onCopyLast}><Clipboard size={16} /></IconButton>
          <IconButton aria-label="Insert first code block" title="Insert first code block" disabled={!hasCode} onClick={onInsertLast}><ClipboardPaste size={16} /></IconButton>
          <IconButton aria-label="Attach files" title="Attach files" onClick={onTriggerAttach} data-testid="composer-attach-btn"><Paperclip size={16} /></IconButton>
          <input id={attachInputId} type="file" style={{ display: 'none' }} multiple onChange={onFilesSelected} aria-hidden="true" />
          <IconButton aria-label="Clear chat" title="Clear chat" onClick={handleClear} disabled={!!isQuotaBlocked}><Eraser size={16} /></IconButton>
          <IconButton aria-label="Stop streaming" title="Stop streaming" onClick={handleStop}><Square size={16} /></IconButton>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <IconButton aria-label={statusLabel(status)} title={statusLabel(status)} onClick={onOpenSettings} style={{ color: statusColor(status) }} data-testid="ai-key-status"><KeyRound size={16} /></IconButton>
          <IconButton aria-label="Settings" title="Settings" onClick={onOpenSettings}><Settings size={16} /></IconButton>
        </div>
      </QuickActionsBar>
      <ComposerContainer aria-label="Composer" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
        <TextArea
          ref={taRef}
          placeholder="Type a message…"
          aria-label="Chat input"
          data-chat-input
          data-testid="prompt-input"
          aria-describedby="composer-hint"
          value={draft}
          onChange={handleChangeDraft}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={!!isQuotaBlocked}
        />
        <RightSide>
          {!fsm?.canSend ? null : (
            <SendButton aria-label="Send message" data-testid="send-btn" onClick={sendOrRetry} disabled={!canSend}>{isQuotaBlocked ? 'Blocked' : (hasError ? 'Retry' : 'Send')}</SendButton>
          )}
          {!fsm?.canSend ? (
            <StopButton aria-label="Stop generating" data-testid="stop-btn" onClick={handleStop}>Stop</StopButton>
          ) : null}
        </RightSide>
        <MetaRow>
          {hint ? <TokenText>{hint.prompt} tokens • context {hint.window}</TokenText> : <span />}
          <Hint id="composer-hint">Enter = Send • Shift+Enter = New line</Hint>
        </MetaRow>
      </ComposerContainer>
    </div>
    {!!FEATURE_PSYCH && (
      <Suspense fallback={null}>
        {showWelcomeModal && (
          <WelcomeModal
            open={showWelcomeModal}
            onClose={handleWelcomeClose}
          />
        )}
        {isPsychOpen ? (
          <PsychiatryModal
            open={isPsychOpen}
            onClose={() => { setPsychOpen(false); setTimeout(() => { try { (document.querySelector('[data-testid=btn-psych-kit]') as HTMLElement | null)?.focus(); } catch {} }, 0); }}
          />
        ) : null}
      </Suspense>
    )}
    </>
  );
};

export default UnifiedComposer;
