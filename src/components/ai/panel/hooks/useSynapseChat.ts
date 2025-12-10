import { useCallback, useEffect, useRef, useState } from 'react';
import { type ChatMsg, loadDraft, loadHistory, saveDraftDebounced, saveHistoryDebounced } from '@/state/chatPersistence';
import { uuid } from '@/utils/uuid';
import type { UiMessage } from '../types';

export function useSynapseChat() {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [draft, setDraftState] = useState<string>('');
  const mountedRef = useRef<boolean>(false);


  useEffect(() => {
    mountedRef.current = true;
    try {
      const d = loadDraft();
      if (d && typeof d.text === 'string') setDraftState(d.text);
    } catch {}
    try {
      const h = loadHistory();
      if (h && Array.isArray(h.messages)) setMessages(h.messages as UiMessage[]);
    } catch {}
    return () => { mountedRef.current = false; };
  }, []);


  useEffect(() => { saveDraftDebounced(draft); }, [draft]);
  useEffect(() => { saveHistoryDebounced(messages as ChatMsg[]); }, [messages]);

  const setDraft = useCallback((text: string) => { setDraftState(text); }, []);

  const appendUser = useCallback((text: string, route?: { provider?: string; model?: string }) => {
    const base: UiMessage = { id: uuid(), ts: Date.now(), role: 'user', content: text };
    const msg: UiMessage = {
      ...base,
      ...(route?.provider ? { provider: route.provider } : {}),
      ...(route?.model ? { model: route.model } : {}),
    } as UiMessage;
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const appendAssistantPlaceholder = useCallback((route?: { provider?: string; model?: string }) => {


    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant' && (last as UiMessage).isStreaming) {
      return last as UiMessage;
    }
    const msg: UiMessage = {
      id: uuid(),
      ts: Date.now(),
      role: 'assistant',
      content: '',
      isStreaming: true,
      ...(route?.provider ? { provider: route.provider } : {}),
      ...(route?.model ? { model: route.model } : {}),
    } as UiMessage;
    setMessages(prev => [...prev, msg]);
    return msg;
  }, [messages]);

  const mergeAssistantDelta = useCallback((id: string, chunk: string) => {
    if (!chunk) return;

    setMessages(prev => prev.map(m => (m.id === id && m.role === 'assistant') ? { ...m, content: (m.content || '') + chunk } : m));
  }, []);

  const finalizeAssistant = useCallback((id: string) => {
    setMessages(prev => prev.map(m => (m.id === id && m.role === 'assistant') ? { ...m, isStreaming: false } : m));
  }, []);

  const finalizeLatestStreamingAssistant = useCallback((message?: string) => {
    setMessages(prev => {
      const idx = [...prev].reverse().findIndex(m => m.role === 'assistant' && m.isStreaming);
      if (idx === -1) return prev;
      const i = prev.length - 1 - idx;
      const target = prev[i];
      const next = [...prev];
      next[i] = { ...target, isStreaming: false, ...(message ? { error: message } : {}) };
      return next;
    });
  }, []);

  const setErrorOnAssistant = useCallback((id: string, message: string) => {
    setMessages(prev => prev.map(m => (m.id === id && m.role === 'assistant') ? { ...m, isStreaming: false, error: message } : m));
  }, []);

  const clearAll = useCallback(() => {
    setMessages([]);
    setDraftState('');
  }, []);

  return {
    messages,
    draft,
    setDraft,
    appendUser,
    appendAssistantPlaceholder,
    mergeAssistantDelta,
    finalizeAssistant,
  finalizeLatestStreamingAssistant,
    setErrorOnAssistant,
    clearAll,
  } as const;
}

export default useSynapseChat;
