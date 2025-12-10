import { useCallback, useEffect, useReducer, useRef } from 'react';
import { flags } from '@/config/flags';
import { logger } from '@/lib/logger';
import { chatReducer, initialChatFSM } from './chat-fsm';
import type { AbortReason, ChatEvent } from './chat-fsm.types';
import { showToast } from '@/ui/toast/api';

const IDLE_TIMEOUT_MS = 25_000;
const HARD_DEADLINE_MS = 120_000;

export function useChatFSM(options?: { manageTimers?: boolean }) {
  const [fsm, dispatch] = useReducer(chatReducer, undefined, initialChatFSM);
  const manageTimers = options?.manageTimers !== false;
  const reqIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const idleTimer = useRef<number | null>(null);
  const hardTimer = useRef<number | null>(null);

  const log = (event: ChatEvent, prevState: string, nextState: string, rid?: number) => {
    if (!flags.aiTrace) return;
    logger.info('[FSM]', prevState, '→', event.type, '→', nextState, 'rid=', String(rid ?? '—'));
  };

  const clearTimers = () => {
    if (!manageTimers) return;
    if (idleTimer.current) { window.clearTimeout(idleTimer.current); idleTimer.current = null; }
    if (hardTimer.current) { window.clearTimeout(hardTimer.current); hardTimer.current = null; }
  };

  const refreshIdle = () => {
    if (!manageTimers) return;
    if (!idleTimer.current) return;
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => cancel('idle_timeout', true), IDLE_TIMEOUT_MS);
  };

  const startTimers = useCallback(() => {
    if (!manageTimers) return;
    clearTimers();
    idleTimer.current = window.setTimeout(() => cancel('idle_timeout', true), IDLE_TIMEOUT_MS);
    hardTimer.current = window.setTimeout(() => cancel('hard_deadline', true), HARD_DEADLINE_MS);
  }, [manageTimers]);

  const send = useCallback((text: string, provider: string, model: string) => {
    const ev: ChatEvent = { type: 'SEND', text, provider, model };
    const prev = fsm.state;
    const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state);
    dispatch(ev);
  }, [fsm]);

  const open = useCallback(() => {
    const rid = ++reqIdRef.current;

    try { abortRef.current?.abort(); } catch {}
    abortRef.current = new AbortController();
    const ev: ChatEvent = { type: 'OPEN', requestId: rid };
    const prev = fsm.state; const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state, rid);
    dispatch(ev);
    startTimers();
    return { rid, signal: abortRef.current.signal } as const;
  }, [fsm, startTimers]);

  const delta = useCallback((rid: number, chunk: string) => {
    const ev: ChatEvent = { type: 'DELTA', requestId: rid, chunk };
    const prev = fsm.state; const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state, rid);
    dispatch(ev);
    refreshIdle();
  }, [fsm]);

  const done = useCallback((rid: number) => {
    const ev: ChatEvent = { type: 'DONE', requestId: rid };
    const prev = fsm.state; const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state, rid);
    dispatch(ev);
  clearTimers();
    abortRef.current = null;
  }, [fsm]);

  const fail = useCallback((message: string, code?: string, rid?: number) => {
    const codePart = typeof code === 'string' ? { code } : {};
    const ev: ChatEvent = typeof rid === 'number'
      ? ({ type: 'ERROR', requestId: rid, message, ...codePart })
      : ({ type: 'ERROR', message, ...codePart });
    const prev = fsm.state; const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state, rid);
    dispatch(ev);
  clearTimers();
    abortRef.current = null;
    showToast({ kind: 'error', message, contextKey: `ai:error:${code || ''}` });
  }, [fsm]);

  const cancel = useCallback((reason: AbortReason, toast = false) => {
    try { if (abortRef.current && !abortRef.current.signal.aborted) abortRef.current.abort(); } catch {}
    const ev: ChatEvent = { type: 'ABORT', reason };
    const prev = fsm.state; const next = chatReducer({ state: fsm.state, ctx: fsm.ctx }, ev);
    log(ev, prev, next.state);
    dispatch(ev);
  clearTimers();
    abortRef.current = null;
    if (toast) {
      const msg = reason === 'idle_timeout'
        ? 'No response from the model (timed out).'
        : reason === 'hard_deadline'
          ? 'Generation exceeded time limit.'
          : 'Generation cancelled.';
      showToast({ kind: reason === 'idle_timeout' || reason === 'hard_deadline' ? 'error' : 'info', message: msg, contextKey: `ai:${reason}` });
    }
  }, [fsm]);






  useEffect(() => {
    return () => {
      const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
      if (!isProd) {

        clearTimers();

        abortRef.current = null;
        return;
      }

      cancel('unmount');
    };
  }, [cancel]);

  const canSend = fsm.state === 'idle';
  return { fsm, canSend, send, open, delta, done, fail, cancel, signalRef: abortRef } as const;
}
