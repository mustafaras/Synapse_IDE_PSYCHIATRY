

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ComposerContainer, Hint, MetaRow, RightSide, SendButton, StopButton, TextArea, TokenText } from './styles';
import type { UiMessage } from './types';
import { buildNormalizedPrompt } from './utils/normalize';
import type { AiProvider } from '@/hooks/useAiStreaming';
import { showToast } from '@/ui/toast/api';
import { useSettingsStore } from '@/store/useSettingsStore';
import { selectEffectiveRoute, useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { isComposingIME } from '@/ui/keys/dom';
import { estimatePromptAndCompletion } from '@/lib/ai/context/estimator';
import { getModelContextWindow } from '@/lib/ai/context/budget';

type Props = {
  draft: string;
  setDraft: (v: string) => void;
  appendUser: (text: string, route?: { provider?: string; model?: string }) => UiMessage;
  appendAssistantPlaceholder: (route?: { provider?: string; model?: string }) => UiMessage;
  mergeAssistantDelta: (id: string, chunk: string) => void;
  finalizeAssistant: (id: string) => void;
  setErrorOnAssistant: (id: string, message: string) => void;
  fsm: { canSend: boolean; send: (text: string, provider: string, model: string) => void; open: () => { rid: number; signal: AbortSignal }; delta: (rid: number, chunk: string) => void; done: (rid: number) => void; fail: (message: string, code?: string, rid?: number) => void; cancel: (reason: any) => void };
  startStreaming: (params: { provider: AiProvider; modelId: string; prompt: string; systemPrompt?: string; temperature?: number; topP?: number; maxTokens?: number; jsonMode?: boolean; onStart?: (meta: { requestId: string }) => void; onDelta?: (chunk: string) => void; onComplete?: (full: string) => void; onError?: (err: unknown) => void; openai?: string; anthropic?: string; google?: string; ollama?: string }, options?: { groupKey?: string; signal?: AbortSignal }) => { opToken: string; abort: () => void; groupKey: string };
  abortStreaming: (reason?: string) => void;
};

const Composer: React.FC<Props> = ({ draft, setDraft, appendUser, appendAssistantPlaceholder, mergeAssistantDelta, finalizeAssistant, setErrorOnAssistant, fsm, startStreaming, abortStreaming }) => {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [hint, setHint] = useState<{ prompt: number; window: number } | null>(null);

  useMemo(() => null, []);


  const activeProfile = useSettingsStore(s => s.profiles.find(p => p.id === s.activeProfileId));
  const legacyProvider = ((activeProfile?.data as any)?.settings?.provider || activeProfile?.data?.provider || 'openai') as AiProvider;
  const legacyModel = ((activeProfile?.data as any)?.settings?.model || activeProfile?.data?.model || 'gpt-4o-mini') as string;

  const eff = useAiSettingsStore(selectEffectiveRoute);
  const provider = (eff?.provider || legacyProvider) as AiProvider;
  const model = (eff?.model || legacyModel) as string;
  const legacyKeys = (activeProfile?.data as any)?.keys || {};
  const stg = (activeProfile?.data as any)?.settings || {};
  const sampling = (activeProfile?.data as any)?.sampling || { temperature: 0.3, top_p: 1, max_output_tokens: null };
  const sysPrompt = (activeProfile?.data as any)?.meta?.systemPrompt || '';
  const jsonMode = !!stg?.jsonMode;
  const aiVault = useAiSettingsStore(s => s.keys);
  const activeRoute = { provider, model, keys: legacyKeys, stg, sampling, sysPrompt, jsonMode };
  const canSend = fsm?.canSend && draft.trim().length > 0;

  const trySend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    if (!fsm.canSend) {
      showToast({ kind: 'info', message: 'Busy, please wait…', contextKey: 'ai:busy' });
      return;
    }
    const route = { provider: activeRoute.provider, model: activeRoute.model } as const;
    appendUser(text, route);
    const assistant = appendAssistantPlaceholder(route);
    const { prompt, systemPrompt } = buildNormalizedPrompt({ userText: text });
    setDraft('');
    fsm.send(text, route.provider, route.model);
    const { rid, signal } = fsm.open();


    const legacy = (activeRoute.keys as any) || {};


    const openaiKey     = legacy?.openai?.apiKey     || aiVault.openai;
    const anthropicKey  = legacy?.anthropic?.apiKey  || aiVault.anthropic;
    const googleKey     = legacy?.google?.apiKey     || aiVault.gemini;


    let providerKey: string | undefined;
    if (route.provider === 'openai')       providerKey = openaiKey;
    else if (route.provider === 'anthropic') providerKey = anthropicKey;
  else if (route.provider === 'gemini')    providerKey = googleKey;

    if (!providerKey) {
      showToast({ kind: 'error', message: 'Missing API key for the selected provider.', contextKey: `ai:no-key-${route.provider}` });
      return;
    }

    startStreaming({
      provider: route.provider as AiProvider,
      modelId: route.model,
      prompt,

  ...(systemPrompt || activeRoute.sysPrompt ? { systemPrompt: [activeRoute.sysPrompt, systemPrompt].filter(Boolean).join('\n\n') } : {}),

  temperature: Number(activeRoute.sampling?.temperature ?? 0.3),
  topP: Number(activeRoute.sampling?.top_p ?? 1),
  ...(typeof (activeRoute.sampling?.max_output_tokens) === 'number' ? { maxTokens: Number(activeRoute.sampling?.max_output_tokens) } : {}),
  jsonMode: !!activeRoute.jsonMode,

      ...(route.provider === 'openai' ? { openai: providerKey } : {}),
      ...(route.provider === 'anthropic' ? { anthropic: providerKey } : {}),
  ...(route.provider === 'gemini' ? { gemini: providerKey } : {}),
      ollama: (activeRoute.stg as any)?.ollamaBaseUrl,
      onStart: () => {},
      onDelta: (chunk) => {
        mergeAssistantDelta(assistant.id, chunk);
        try { fsm.delta(rid, chunk); } catch {}
      },
      onComplete: (_full) => {
        finalizeAssistant(assistant.id);
        try { fsm.done(rid); } catch {}
      },
      onError: (err) => {
        console.error('[Stream error]', err);
        const msg = (err as any)?.message || String(err ?? 'error');
        setErrorOnAssistant(assistant.id, msg);
        fsm.fail(msg, undefined, rid);
      },

  }, { groupKey: `assistant:${assistant.id}` as string, signal });
  }, [draft, fsm, activeRoute, appendUser, appendAssistantPlaceholder, mergeAssistantDelta, finalizeAssistant, setErrorOnAssistant, setDraft, startStreaming]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {


      if ((e as any).isComposing || isComposingIME(e.nativeEvent as any)) return;
      if (e.shiftKey) return;
      e.preventDefault();
      trySend();
    }
  }, [trySend]);


  useEffect(() => {
    const el = taRef.current; if (!el) return;
    el.style.height = 'auto';
    const next = Math.min(160, Math.max(40, el.scrollHeight));
    el.style.height = `${next}px`;
  }, [draft]);

  useEffect(() => {

    taRef.current?.focus();
  }, []);


  useEffect(() => {
    const onDocKey = (e: KeyboardEvent) => {

      const anyE = e as any;
      if (anyE.isComposing || isComposingIME(e)) return;
      if (e.key === 'Escape') {
        abortStreaming?.('user_cancel');
        try { fsm.cancel('user_escape'); } catch {}
      }
    };
    window.addEventListener('keydown', onDocKey as any, true);
    return () => window.removeEventListener('keydown', onDocKey as any, true);
  }, [fsm, abortStreaming]);


  useEffect(() => {
    let t: any;
    t = setTimeout(async () => {
      try {
        const model = activeRoute.model;
        const txt = draft.trim();
        if (!model || txt.length === 0) { setHint(null); return; }
        const est = await estimatePromptAndCompletion(model, { system: '', messages: [{ role: 'user', content: txt }] });
        const ctx = getModelContextWindow(model);
        setHint({ prompt: est.prompt ?? 0, window: ctx ?? 0 });
      } catch {
        setHint(null);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [draft, activeRoute.model]);

  return (
    <ComposerContainer aria-label="Composer">
      <TextArea
        ref={taRef}
        placeholder="Type a message…"
        aria-label="Chat input"
        data-chat-input
        data-testid="prompt-input"
        aria-describedby="composer-hint"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
      />
      <RightSide>
        {!fsm?.canSend ? null : (
          <SendButton aria-label="Send message" data-testid="send-btn" onClick={trySend} disabled={!canSend}>Send</SendButton>
        )}
        {!fsm?.canSend ? (
          <StopButton aria-label="Stop generating" data-testid="stop-btn" onClick={() => { abortStreaming?.('user_cancel'); try { fsm.cancel('user_escape'); } catch {} }}>Stop</StopButton>
        ) : null}
      </RightSide>
      <MetaRow>
        {hint ? <TokenText>{hint.prompt} tokens • context {hint.window}</TokenText> : <span />}
        <Hint id="composer-hint">Enter = Send • Shift+Enter = New line</Hint>
      </MetaRow>
    </ComposerContainer>
  );
};

export default Composer;
