
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelRoot } from './styles';
import styled from 'styled-components';

import { PanelHeader } from './Header';
import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import { deriveModelMeta } from '@/ai/modelMeta';
import MessageList from './MessageList';

import UnifiedComposer from './UnifiedComposer';
import { useChatFSM } from '@/features/chat/state/useChatFSM';
import { useSynapseChat } from './hooks/useSynapseChat';
import { type AiProvider, useAiStreaming } from '@/hooks/useAiStreaming';
import { useSimpleOpenAIStream } from '@/hooks/useSimpleOpenAIStream';
import { phaseLabel, useStreamingPhaseController } from '@/hooks/useStreamingPhaseController';

import DebugTray from './DebugTray';
import { flags } from '@/config/flags';
import { beginTrace, endTraceError, endTraceOk, spanEnd, spanStart } from '@/utils/obs/instrument';
import { useObs } from '@/utils/obs/store';
import { logger } from '@/lib/logger';
import { useSettingsStore } from '@/store/useSettingsStore';
import { buildNormalizedPrompt } from './utils/normalize';

export interface NormalizedError { code?: string; status?: number; userMessage?: string; detail?: string; retryAfterMs?: number | null; category?: string; providerCode?: string }
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { showToast } from '@/ui/toast/api';
import { buildContextBundle, type BuiltContext } from '@/lib/ai/context';
import { useCtxAttachStore } from '@/features/attachments/store';
import { resolveProviderKey } from '@/ai/utils/resolveKey';

export const SynapseCoreAIPanel: React.FC = () => {
  const ui = useAiSettingsStore(s => s.ui);


  type Mode = 'implement';
  const mode: Mode = 'implement';


  const systemByMode = useMemo<Record<Mode,string>>(() => ({
    implement: 'You are a senior coding copilot. Provide concise, production-ready code answers. Focus on applicability to the current project.',
  }), []);
  function buildContextHint(scope: 'selection'|'file'|'workspace'|'pinned') {
    switch(scope){
      case 'selection': return 'Context scope: Use ONLY the current editor selection if provided.';
      case 'file': return 'Context scope: Operate within the active file.';
      case 'workspace': return 'Context scope: Consider relevant files in the workspace.';
      case 'pinned': return 'Context scope: Prioritize the pinned snippets.';
      default: return 'Context scope: Scoped context.';
    }
  }
  const composeSystemPrefix = useCallback((currentMode: Mode) => {
    const { defaults, context, tokenBudget } = useAiSettingsStore.getState();
    return [
      systemByMode[currentMode],
      buildContextHint(context.scope),
      `Hard token budget: ${tokenBudget}. Temperature: ${defaults.temperature}, Max tokens: ${defaults.maxTokens}.`
    ].join(' ');
  }, [systemByMode]);


  const { canSend, send, open, delta, done, fail, cancel } = useChatFSM();

  const traces = useObs((s) => s.traces);
  const sessionTokens = useMemo(() => {

    return traces.reduce((acc, t) => acc + (t.usage?.prompt || 0) + (t.usage?.completion || 0), 0);
  }, [traces]);
  const lastContextRef = useRef<BuiltContext | null>(null);
  const attachments = useCtxAttachStore(s => s.items);
  const chat = useSynapseChat();

  const simpleEnabled = flags.simpleStream === true;
  const simpleHook = useSimpleOpenAIStream();
  const fullStream = useAiStreaming({});
  const stream = simpleEnabled ? {
    startStreaming: (p: any) => {
      if (p.provider !== 'openai') {

        return fullStream.startStreaming(p);
      }
      console.debug('[SIMPLE_STREAM] start', p.modelId);
      simpleHook.start({
        prompt: p.prompt,
        model: p.modelId,
        systemPrompt: p.systemPrompt,
        temperature: p.temperature,
        topP: p.topP,
        maxTokens: p.maxTokens,
        apiKey: p.openai || p.runtime?.apiKey,
        onDelta: (d) => { p.onDelta?.(d); },
        onComplete: (f) => { p.onComplete?.(f); },
        onError: (e) => { p.onError?.(e); },
      });
      return { opToken: 'simple', abort: () => simpleHook.abort(), groupKey: p.modelId };
    },
    abortStreaming: (_reason?: string) => { simpleHook.abort(); },
    getLastMeta: () => ({
      attempts: 1,
      lastHttpStatus: simpleHook.state.error ? 500 : 200,
      lastError: simpleHook.state.error,
      startedAt: simpleHook.state.startedAt,
      endedAt: simpleHook.state.endedAt,
    }),
    streamState: { isStreaming: simpleHook.state.isStreaming, isTyping: simpleHook.state.isStreaming, abortReason: null, activeJobId: null, provider: 'openai', queuedJobs: 0 },
  } : fullStream;

  const phaseCtl = useStreamingPhaseController();
  const [lastError, setLastError] = useState<NormalizedError | null>(null);
  interface SwitchState { from?: string | null; to?: string | null }
  const [uiSwitching, setUiSwitching] = useState<SwitchState | null>(null);
  const lastUserPromptRef = useRef<string>('');
  const traceRef = useRef<{ id: string | null; net?: string | null; stream?: string | null }>({ id: null });

  const onStart = React.useCallback(() => {
    try {
      if (traceRef.current.id && traceRef.current.net) {
        spanEnd(traceRef.current.id, traceRef.current.net, {});
        traceRef.current.stream = spanStart(traceRef.current.id, 'stream', 'Tokens');
      }
    } catch {}
  }, []);
  const onDelta = React.useCallback((chunk: string) => {
    try {
      if (traceRef.current.id && traceRef.current.stream) {
        spanEnd(traceRef.current.id, traceRef.current.stream, { bytes: chunk.length });
        traceRef.current.stream = spanStart(traceRef.current.id, 'stream', 'Tokens');
      }
    } catch {}
  }, []);
  const onComplete = React.useCallback(() => {
    try {
      if (traceRef.current.id) {
        endTraceOk(traceRef.current.id);
        traceRef.current = { id: null };
        setLastError(null);
      }
    } catch {}
  }, []);
  const onError = React.useCallback((err: unknown) => {
    const e = err as Record<string, unknown> | null | undefined;
    const rec = e as { code?: string; providerCode?: string; status?: number; userMessage?: string; message?: string; detail?: string; raw?: unknown; causeClass?: unknown; retryAfterMs?: number; category?: string } | null | undefined;
    const userMessage: string = rec?.userMessage || rec?.message || (typeof err === 'string' ? err : 'error');
    const detail = typeof rec?.detail === 'string' ? rec.detail : (rec?.raw ? String(rec.raw) : (rec?.causeClass ? String(rec.causeClass) : (rec?.code ? String(rec.code) : '')));
    const mapped: NormalizedError = {
      userMessage,
      detail,
      retryAfterMs: typeof rec?.retryAfterMs === 'number' ? rec.retryAfterMs : null,
    };
    if (rec?.code || rec?.providerCode) mapped.code = (rec.code || rec?.providerCode)!;
    if (rec?.providerCode) mapped.providerCode = rec.providerCode;
    if (typeof rec?.status === 'number') mapped.status = rec.status;
    if (rec?.category) mapped.category = rec.category;

    setLastError(mapped);
    try {
      if (traceRef.current.id) {
        const traceErr: { code: string; status?: number; message?: string } = { code: String(mapped.code || 'unknown'), message: mapped.userMessage || '' };
        if (typeof mapped.status === 'number') traceErr.status = mapped.status;
        endTraceError(traceRef.current.id, traceErr);
      }
    } catch {}
    if (flags.aiTrace) logger.error('[AI][ERROR]', mapped.code, mapped.status, mapped.userMessage);
  }, []);

  interface ProfileData { settings?: { provider?: string; model?: string; jsonMode?: boolean; ollamaBaseUrl?: string }; provider?: string; model?: string; keys?: Record<string, { apiKey?: string } | string>; sampling?: { temperature?: number; top_p?: number; max_output_tokens?: number | null }; meta?: { systemPrompt?: string } }
  const getActiveProfileData = useCallback((): ProfileData => {
    const s = useSettingsStore.getState();
    const active = s.profiles.find(p => p.id === s.activeProfileId);
    return (active?.data as unknown as ProfileData) || {};
  }, []);

  const retry = React.useCallback(async () => {

    let text = (lastUserPromptRef.current || '').trim();
    if (!text) {

      for (let i = chat.messages.length - 1; i >= 0; i--) {
        const m = chat.messages[i];
        if (m.role === 'user' && m.content) { text = m.content.trim(); break; }
      }
    }
    if (!text) return;

    if (!canSend) {

      try { stream.abortStreaming('manual_retry'); } catch {}
  try { cancel('provider_abort'); } catch {}
      await new Promise(r => setTimeout(r, 25));
    }

    setLastError(null);
    phaseCtl.onStart();

    try {
      const id = beginTrace({ requestId: `ui_retry_${Date.now()}`, provider: 'n/a', model: 'n/a', userTextBytes: text.length, attachmentsCount: attachments.length });
      traceRef.current = { id, net: spanStart(id, 'network_connect', 'Connect'), stream: null };
    } catch {}

    const active = getActiveProfileData();
    const provider = (active.settings?.provider || active.provider || 'openai') as AiProvider;
    const model = (active.settings?.model || active.model || 'gpt-4o-mini');
    const keys = active.keys || {};
    const stg = active.settings || {};
    const sampling = active.sampling || { temperature: 0.3, top_p: 1, max_output_tokens: null };
    const sysPrompt = active.meta?.systemPrompt || '';
    const jsonMode = !!stg?.jsonMode;
    const route = { provider, model } as const;
    lastUserPromptRef.current = text;
    chat.appendUser(text, route);
    const assistant = chat.appendAssistantPlaceholder(route);
    const { prompt, systemPrompt: normSystem } = buildNormalizedPrompt({ userText: text });
    let finalSystemPrompt: string | undefined = normSystem;
    send(text, route.provider, route.model);
    const { rid, signal } = open();
    const sysPrefix = composeSystemPrefix(mode);
    try {
      const settings = useAiSettingsStore.getState();
      const bundle = buildContextBundle({
        scope: settings.context.scope as 'selection'|'file'|'workspace'|'pinned',
        tokenBudget: settings.tokenBudget,
        responseTokens: settings.defaults.maxTokens,
        pinned: attachments.filter(a => a.type === 'selection').map(a => ({ path: a.path || '', name: a.label, content: a.text })),
        attachments: attachments.map(a => ({ path: a.path || '', name: a.label, content: a.text })),
        editor: { getActiveFilePath: () => undefined, getActiveFileContent: () => undefined, getSelection: () => undefined },
      });
      lastContextRef.current = bundle;
      const pieces = [sysPrefix, sysPrompt, normSystem, bundle.text].filter(Boolean);
      finalSystemPrompt = pieces.join('\n\n');
    } catch {}


    const providerForKey = (provider === 'gemini' ? 'google' : provider) as 'openai' | 'anthropic' | 'google';
    const resolvedKey = resolveProviderKey(providerForKey, keys, useAiSettingsStore.getState().keys);
    const bypassKeys = flags.e2e === true;
    if (!resolvedKey && provider !== 'ollama' && !bypassKeys) {
      showToast({ kind: 'error', message: `No API key configured for ${provider}. Open Settings → Providers & Keys.`, contextKey: 'ai:no-key' });
      try { window.dispatchEvent(new Event('ai:openKeys')); } catch {}
      return;
    }
    if (flags.aiTrace) logger.info('[AI][RETRY] (manual) provider=', provider, 'model=', model, 'hasKey=', !!resolvedKey);
    const keyPayload: Partial<Record<'openai'|'anthropic'|'google', string>> =
      provider === 'openai' ? { openai: resolvedKey as string } :
      provider === 'anthropic' ? { anthropic: resolvedKey as string } :
      provider === 'gemini' ? { google: resolvedKey as string } : {};

    stream.startStreaming({
      provider: route.provider,
      modelId: route.model,
      prompt,
      ...(finalSystemPrompt ? { systemPrompt: finalSystemPrompt } : {}),
      temperature: Number(sampling?.temperature ?? 0.3),
      topP: Number(sampling?.top_p ?? 1),
      ...(typeof (sampling?.max_output_tokens) === 'number' ? { maxTokens: Number(sampling?.max_output_tokens) } : {}),
      jsonMode: !!jsonMode,
      ...(stg.ollamaBaseUrl ? { ollama: stg.ollamaBaseUrl } : {}),
      ...keyPayload,
  onStart: (_m) => { onStart(); phaseCtl.onConnect(); },
      onFirstByte: () => { phaseCtl.onFirstByte(); },
      onDelta: (chunk) => { phaseCtl.onDelta(); chat.mergeAssistantDelta(assistant.id, chunk); try { delta(rid, chunk); } catch {} },
      onComplete: (_full) => { chat.finalizeAssistant(assistant.id); try { done(rid); } catch {}; onComplete(); phaseCtl.onFinal(); },
      onError: (err) => {
        const e = err as { message?: string };
        const msg = e?.message || String(err ?? 'error');
        chat.setErrorOnAssistant(assistant.id, msg);
        try { fail(msg, undefined, rid); } catch {}
        onError(err); phaseCtl.onError(err);
      },
    }, { groupKey: `assistant:${assistant.id}`, signal });
  }, [attachments, canSend, cancel, chat, delta, done, fail, onComplete, onError, onStart, open, send, stream, mode, phaseCtl, composeSystemPrefix, getActiveProfileData]);


  const handleOpenSettings = useCallback(() => { try { window.dispatchEvent(new Event('ai:openKeys')); } catch {} }, []);

  interface StartWrapperParams { provider: AiProvider; modelId: string; prompt: string; systemPrompt?: string; onStart?: (meta: { requestId: string }) => void; onConnect?: () => void; onFirstByte?: () => void; onDelta?: (c: string)=>void; onComplete?: (f: string)=>void; onError?: (e: unknown)=>void; assistantId?: string; id?: string }
  const handleStartStreaming = useCallback((params: StartWrapperParams, opts?: { groupKey?: string; signal?: AbortSignal }) => {
    try {
      lastUserPromptRef.current = params.prompt || '';
  const id = beginTrace({ requestId: `ui_${Date.now()}`, provider: params.provider, model: params.modelId, userTextBytes: (params.prompt || '').length, attachmentsCount: 0 });
      traceRef.current.id = id;
      traceRef.current.net = spanStart(id, 'network_connect', 'Connect');
      phaseCtl.onStart();
    } catch {}
    const sysPrefix = composeSystemPrefix(mode);

    const nextParams: StartWrapperParams & { systemPrompt?: string } = { ...params };
    nextParams.systemPrompt = nextParams.systemPrompt ? `${sysPrefix}\n${nextParams.systemPrompt}` : sysPrefix;
    try {
      const settings = useAiSettingsStore.getState();
      const bundle = buildContextBundle({
        scope: settings.context.scope as 'selection'|'file'|'workspace'|'pinned',
        tokenBudget: settings.tokenBudget,
        responseTokens: settings.defaults.maxTokens,
        pinned: attachments.filter(a => a.type === 'selection').map(a => ({ path: a.path || '', name: a.label, content: a.text })),
        attachments: attachments.map(a => ({ path: a.path || '', name: a.label, content: a.text })),
        editor: { getActiveFilePath: () => undefined, getActiveFileContent: () => undefined, getSelection: () => undefined },
      });
      lastContextRef.current = bundle;
      nextParams.systemPrompt = nextParams.systemPrompt ? `${nextParams.systemPrompt}\n\n${bundle.text}` : bundle.text;
    } catch {}
    const activeProvider = nextParams.provider as AiProvider;
    const keyLookup = (() => {
      const legacyStore = useSettingsStore.getState();
      const legacyProfile = legacyStore.profiles.find(p => p.id === legacyStore.activeProfileId);
      type LegacyKeys = Record<string, { apiKey?: string }>;
      const legacyKeys = (legacyProfile?.data as { keys?: LegacyKeys })?.keys || {};
      const resolved = resolveProviderKey((activeProvider === 'gemini' ? 'google' : activeProvider) as 'openai'|'anthropic'|'google', legacyKeys, useAiSettingsStore.getState().keys);
      return resolved;
    })();
    const bypass = flags.e2e === true;
    if (!keyLookup && activeProvider !== 'ollama' && !bypass) {
      showToast({ kind: 'error', message: `No API key for ${activeProvider}. Open Settings → Providers & Keys.`, contextKey: 'ai:no-key-send' });
      try { window.dispatchEvent(new Event('ai:openKeys')); } catch {}

      try { chat.finalizeLatestStreamingAssistant('Missing API key'); } catch {}
      return { opToken: 'no_key', abort: () => {}, groupKey: opts?.groupKey || 'assistant' } as { opToken: string; abort: () => void; groupKey: string };
    }
    const creds: Partial<{ openai: string; anthropic: string; google: string }> = {};
    if (activeProvider === 'openai' && keyLookup) creds.openai = keyLookup;
    if (activeProvider === 'anthropic' && keyLookup) creds.anthropic = keyLookup;
    if (activeProvider === 'gemini' && keyLookup) creds.google = keyLookup;
    return stream.startStreaming({
      ...nextParams,
      ...creds,
      onStart: (m) => { onStart(); phaseCtl.onConnect(); params.onStart?.(m); },
      onFirstByte: () => { phaseCtl.onFirstByte(); params.onFirstByte?.(); },
      onDelta: (c) => { phaseCtl.onDelta(); onDelta(c); params.onDelta?.(c); },
      onComplete: (f) => {

        try {
          if (params.assistantId) chat.finalizeAssistant(params.assistantId); else chat.finalizeLatestStreamingAssistant();
        } catch {}
        onComplete();
        params.onComplete?.(f);
        phaseCtl.onFinal();
      },
      onError: (e) => {

        try {
          const msg = (e as { message?: string })?.message || 'error';
          if (params.assistantId) chat.finalizeAssistant(params.assistantId); else chat.finalizeLatestStreamingAssistant(msg);
        } catch {}
        onError(e);
        params.onError?.(e);
        phaseCtl.onError(e);
      },
    }, { ...opts, groupKey: opts?.groupKey || (params?.assistantId ? `assistant:${params.assistantId}` : (params?.id ? `assistant:${params.id}` : 'assistant')) });
  }, [attachments, chat, composeSystemPrefix, mode, onStart, onDelta, onComplete, onError, phaseCtl, stream]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const detail = (ev as CustomEvent<{ from?: string; to?: string; reason?: string }>).detail || {};
      const from = detail.from ?? null; const to = detail.to ?? null;
      console.warn?.('[AI][UI] SWITCHING_PROVIDER', { from, to, reason: detail.reason });
      setUiSwitching({ from, to });
      window.clearTimeout((handler as unknown as { t?: number }).t);
      (handler as unknown as { t?: number }).t = window.setTimeout(() => { setUiSwitching(null); }, 2200);
    };
    window.addEventListener('ai:providerSwitch', handler as EventListener);

    const mismatch = (ev: Event) => {
      const d = (ev as CustomEvent<{ provider: string; attemptedModel: string }>).detail; if(!d) return;
      try { showToast?.({ kind:'warning', message:`Model "${d.attemptedModel}" is not valid for ${d.provider}`, contextKey:'ai:model-mismatch' }); } catch {}
    };
    const autoAdj = (ev: Event) => {
      const d = (ev as CustomEvent<{ fromProvider:string; toProvider:string; previousModel:string; newModel:string }>).detail; if(!d) return;
      try { showToast?.({ kind:'info', message:`Model adjusted to ${d.newModel} for ${d.toProvider}`, contextKey:'ai:model-auto' }); } catch {}
    };
    const failover = (ev: Event) => {
      const d = (ev as CustomEvent<{ from:string; to:string; category?:string; code?:string; attempt:number }>).detail; if(!d) return;
      try { showToast?.({ kind:'info', message:`Failover ${d.from} → ${d.to} (${d.category||d.code||'retry'})`, contextKey:'ai:failover' }); } catch {}
    };
    window.addEventListener('ai:modelProviderMismatch', mismatch as EventListener);
    window.addEventListener('ai:modelAutoAdjusted', autoAdj as EventListener);
    window.addEventListener('ai:failoverNotice', failover as EventListener);
    return () => {
      window.removeEventListener('ai:providerSwitch', handler as EventListener);
      window.removeEventListener('ai:modelProviderMismatch', mismatch as EventListener);
      window.removeEventListener('ai:modelAutoAdjusted', autoAdj as EventListener);
      window.removeEventListener('ai:failoverNotice', failover as EventListener);
      window.clearTimeout((handler as unknown as { t?: number }).t);
    };
  }, []);
  const dismissSwitch = useCallback(() => { setUiSwitching(null); }, []);
  const handleOpenKeys = useCallback(() => { try { window.dispatchEvent(new Event('ai:openKeys')); } catch {} }, []);
  const handleOpenLogs = useCallback(() => { try { window.dispatchEvent(new Event('ai:openLogs')); } catch {} }, []);
  return (
    <PanelRoot
      role="complementary"
      aria-label="SynapseCore AI"
      tabIndex={-1}
      data-testid="assistant-panel"
      style={{ fontSize: ui.fontSize, lineHeight: ui.compactMode ? 1.3 : 1.45, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
    >
      <PanelHeader />
      <PanelStatusStrip sessionTokens={sessionTokens} />
      {uiSwitching ? (
        <InfoBar from={uiSwitching.from || undefined} to={uiSwitching.to || undefined} onClose={dismissSwitch} />
      ) : null}
      {}
      {!stream.streamState.isStreaming && lastError ? (
        <ErrorCard
          message={lastError.userMessage || 'Streaming failed'}
          onSwitch={handleOpenKeys}
          onOpenLogs={handleOpenLogs}
        />
      ) : null}
      <MessageList messages={chat.messages} />
      {}
      <ContextTokenSummary ctxRef={lastContextRef} />
      {flags.aiTrace ? <DebugTrayWrap><DebugTray /></DebugTrayWrap> : null}
      <UnifiedComposer
        draft={chat.draft}
        setDraft={chat.setDraft}
        messages={chat.messages}
        appendUser={chat.appendUser}
        appendAssistantPlaceholder={chat.appendAssistantPlaceholder}
        mergeAssistantDelta={chat.mergeAssistantDelta}
        finalizeAssistant={chat.finalizeAssistant}
        setErrorOnAssistant={chat.setErrorOnAssistant}
        fsm={{ canSend, send, open, delta, done, fail, cancel: (r: unknown) => { try { (cancel as unknown as (reason: unknown) => void)(r); } catch {} } }}
        clearAll={chat.clearAll}
        onRetry={retry}
        hasError={!!lastError}
        onOpenSettings={handleOpenSettings}
        abortStreaming={stream.abortStreaming}
        startStreaming={handleStartStreaming}
      />
      <PhaseStrip aria-live="polite">
        {phaseLabel(phaseCtl.phase) && <span>{phaseLabel(phaseCtl.phase)}</span>}
        {stream.streamState.isStreaming ? <span style={{ marginLeft: 8 }}>Generating…</span> : null}
      </PhaseStrip>
    </PanelRoot>
  );
};

export default SynapseCoreAIPanel;


const PanelStatusStrip: React.FC<{ sessionTokens: number }> = ({ sessionTokens }) => {

  const provider = useAiConfigStore(AiSelectors.provider);
  const model = useAiConfigStore(AiSelectors.model);
  const keyStatus = useAiConfigStore((s) => s.keyStatus?.[s.provider as keyof typeof s.keyStatus]);
  const refreshKeyStatus = useAiConfigStore((s) => s.refreshKeyStatus);
  const meta = model ? deriveModelMeta(provider, model) : null;
  const metaSubset = meta ? { family: meta.family, tags: meta.tags, ctx: meta.ctx } : null;
  const handleRefreshKey = useCallback(() => { void refreshKeyStatus(); }, [refreshKeyStatus]);
  const handleToggleOpen = useCallback(() => { setOpen(o => !o); }, []);
  const [open, setOpen] = React.useState<boolean>(() => {
    try { const v = localStorage.getItem('synapse.ai.statusStrip.open'); if (v === '0') return false; } catch {} return true;
  });
  useEffect(() => { try { localStorage.setItem('synapse.ai.statusStrip.open', open ? '1':'0'); } catch {} }, [open]);
  const [now, setNow] = React.useState<number>(Date.now());
  React.useEffect(()=>{ const t = setInterval(()=> setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const state: string = keyStatus?.state || 'unknown';
  const retryIn = state === 'rate-limited' && keyStatus?.retryAt ? Math.max(0, keyStatus.retryAt - now) : 0;
  const retrySecs = Math.ceil(retryIn/1000);
  const palette: Record<string,string> = { verified:'#2ECC71', invalid:'#E67E22', 'rate-limited':'#E1C542', missing:'#E74C3C', unknown:'#777' };
  const color = palette[state] || '#777';
  const last = keyStatus?.checkedAt ? new Date(keyStatus.checkedAt).toLocaleTimeString() : '—';


  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 900;
  return (
    <StatusStripRoot data-expanded={open ? 'true' : 'false'}>
      <StatusTopRow>
        <StatusLeft>
          <StatusPill label={provider} value={model || '—'} meta={metaSubset} />
          {meta ? <MiniTag text={(meta.family && meta.family !== model) ? meta.family : 'family'} subtle /> : null}
          {meta ? meta.tags?.slice(0, isNarrow ? 1 : 3).map(t => <MiniTag key={t} text={t} />) : null}
          <KeyMetaGroup>
            <KeyDot style={{ background: color, boxShadow: `0 0 4px ${color}55` }} title={`Key: ${state}`} />
            {!isNarrow && <span className="syn-label">Key {state.replace('-', ' ')}</span>}
            {retrySecs > 0 && <span className="syn-retry" aria-live="polite">retry in {retrySecs}s</span>}
            {!isNarrow && <span className="syn-last">last {last}</span>}
          </KeyMetaGroup>
        </StatusLeft>
        <ActionBtnRow>
          <StatusBtn onClick={handleRefreshKey} title='Re-validate key' aria-label='Re-validate key'>↻</StatusBtn>
          <StatusBtn onClick={handleToggleOpen} aria-expanded={open} aria-label='Toggle panel status' title={open ? 'Collapse status' : 'Expand status'}>{open ? '−' : '+'}</StatusBtn>
        </ActionBtnRow>
      </StatusTopRow>
      <StatusDetails data-open={open ? 'true' : 'false'}>
        <StatusDetailInner>
          {meta?.ctx ? <InfoStat label='Ctx' value={meta.ctx.toString()} /> : null}
          <InfoStat label='Session tokens' value={sessionTokens.toString()} />
          {!isNarrow && <InfoStat label='Model count' value={useAiConfigStore.getState().modelList[provider]?.length.toString()} />}
            {!isNarrow && <InfoStat label='Favorites' value={(useAiConfigStore.getState().favorites?.[provider]?.length || 0).toString()} />}
          {!isNarrow && <InfoStat label='Status' value={state} />}
        </StatusDetailInner>
      </StatusDetails>
    </StatusStripRoot>
  );
};


const sharedPanelBorder = 'var(--color-border-subtle, #FFFFFF10)';
const subtleBgGrad = 'linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))';

const DebugTrayWrap = styled.div`
  padding: 0 14px 8px;
`;

const PhaseStrip = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  font-size: 10px;
  font-family: var(--font-mono);
  opacity: 0.55;
`;

const StatusStripRoot = styled.div`
  border-bottom: 1px solid ${sharedPanelBorder};
  background: ${subtleBgGrad};
  padding: 4px 10px 6px;
  font-size: 11px;
  font-family: var(--font-mono);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusTopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const StatusLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const KeyMetaGroup = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  .syn-label { opacity: .7; }
  .syn-retry { font-size: 10px; color: var(--color-status-warning, #E1C542); }
  .syn-last { font-size: 10px; opacity: .55; }
`;

const KeyDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const ActionBtnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusBtn = styled.button`
  font-size: 11px;
  padding: 2px 7px;
  border: 1px solid var(--color-border-default, #FFFFFF18);
  border-radius: 6px;
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.05));
  color: var(--color-text-secondary, #ddd);
  cursor: pointer;
  line-height: 1.2;
  transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
  &:hover { background: var(--color-bg-surface, rgba(255,255,255,0.08)); }
  &:focus-visible { outline: 2px solid var(--color-accent-primary, #00a6d7); outline-offset: 2px; }
`;

const StatusDetails = styled.div`
  overflow: hidden;
  transition: max-height 260ms cubic-bezier(.2,.8,.2,1), opacity 220ms 40ms;
  max-height: 0;
  opacity: 0;
  &[data-open='true'] { max-height: 120px; opacity: 1; }
`;

const StatusDetailInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 2px 2px 4px;
`;

interface MetaSubset { family?: string; tags?: string[]; ctx?: number | undefined }
const StatusPillWrap = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--color-border-default, #FFFFFF14);
  border-radius: 20px;
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.04));
  max-width: 220px;
`;
const StatusPillLabel = styled.span`
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: .5px;
  opacity: .8;
`;
const StatusPillValue = styled.span`
  font-size: 11px;
  max-width: 140px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const StatusPill: React.FC<{ label: string; value: string; meta: MetaSubset | null }> = ({ label, value, meta }) => (
  <StatusPillWrap title={`${label}\n${value}${meta?.family ? `\nFamily: ${meta.family}` : ''}`}>
    <StatusPillLabel>{label}</StatusPillLabel>
    <StatusPillValue>{value}</StatusPillValue>
  </StatusPillWrap>
);

const MiniTagBase = styled.span<{ $subtle: boolean }>`
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 6px;
  background: ${({ $subtle }) => $subtle ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'};
  border: 1px solid var(--color-border-subtle, #FFFFFF12);
  letter-spacing: .5px;
  text-transform: uppercase;
  opacity: ${({ $subtle }) => $subtle ? 0.6 : 0.9};
`;
const MiniTag: React.FC<{ text: string; subtle?: boolean }> = ({ text, subtle = false }) => (
  <MiniTagBase $subtle={subtle}>{text}</MiniTagBase>
);

const InfoStatWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 70px;
`;
const InfoStatLabel = styled.span`
  font-size: 9px;
  letter-spacing: .5px;
  text-transform: uppercase;
  opacity: .55;
`;
const InfoStatValue = styled.span`
  font-size: 11px;
`;
const InfoStat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <InfoStatWrap>
    <InfoStatLabel>{label}</InfoStatLabel>
    <InfoStatValue>{value}</InfoStatValue>
  </InfoStatWrap>
);


interface InfoBarProps { from?: string | null | undefined; to?: string | null | undefined; onClose?: () => void }
const InfoBarWrap = styled.div`
  border-bottom: 1px solid var(--color-border-subtle, var(--color-border, rgba(255,255,255,0.08)));
  background: linear-gradient(90deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04));
  padding: 6px 10px;
  font-size: 11px;
  display: flex;
  gap: 8px;
  align-items: center;
  .msg { opacity: .8; }
  button { margin-left: auto; font-size: 11px; opacity: .8; background: transparent; border: none; color: inherit; cursor: pointer; }
  button:focus-visible { outline: 2px solid var(--color-accent-primary, #00a6d7); outline-offset: 2px; }
`;
const InfoBar: React.FC<InfoBarProps> = ({ from, to, onClose }) => (
  <InfoBarWrap aria-live="polite">
    <span className="msg">Switching provider… {from ? `${from} → ` : ''}{to ?? 'next'}</span>
    <button onClick={onClose} aria-label="Dismiss" title="Dismiss">✕</button>
  </InfoBarWrap>
);


interface ErrorCardProps { message: string; onSwitch: () => void; onOpenLogs: () => void }
const ErrorCardWrap = styled.div`
  border: 1px solid var(--color-border-default, var(--color-border, rgba(255,255,255,0.08)));
  background: color-mix(in oklab, var(--color-status-danger, #ff4d4d), transparent 88%);
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  margin: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  h4 { font-weight: 600; margin: 0; }
  .msg { opacity: .9; }
  .actions { display: flex; gap: 8px; }
`;
const ErrorActionBtn = styled.button`
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border-default, var(--color-border, rgba(255,255,255,0.12)));
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 12px;
  &:focus-visible { outline: 2px solid var(--color-accent-primary, #00a6d7); outline-offset: 2px; }
`;
const ErrorCard: React.FC<ErrorCardProps> = ({ message, onSwitch, onOpenLogs }) => (
  <ErrorCardWrap role="alert">
    <h4>Streaming failed</h4>
    <div className="msg">{message}</div>
    <div className="actions">
      <ErrorActionBtn onClick={onSwitch}>Switch provider/model</ErrorActionBtn>
      <ErrorActionBtn onClick={onOpenLogs}>Open logs</ErrorActionBtn>
    </div>
  </ErrorCardWrap>
);


const ContextTokenSummary: React.FC<{ ctxRef: React.MutableRefObject<BuiltContext | null> }> = ({ ctxRef }) => {
  if (!ctxRef.current) return null;
  const { tokens, included } = ctxRef.current;
  return (
    <ContextSummary title={included.slice(0,3).map(i=>i.path||i.label).join('\n')}>
      Context ≈ {tokens.used}/{tokens.budget} tok
    </ContextSummary>
  );
};

const ContextSummary = styled.div`
  padding: 2px 10px 6px;
  font-size: 10px;
  color: var(--color-text-secondary, #888);
`;
