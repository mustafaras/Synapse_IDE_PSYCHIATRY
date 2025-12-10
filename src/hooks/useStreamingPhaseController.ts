import { useCallback, useEffect, useRef, useState } from 'react';


const CONNECT_TIMEOUT_DEFAULT = 15_000;
const STALL_TIMEOUT_DEFAULT = 20_000;

const CONNECT_TIMEOUT_MS = ((): number => {
  try { const v = (import.meta as any).env?.VITE_AI_CONNECT_TIMEOUT_MS; if (v) return Number(v) || CONNECT_TIMEOUT_DEFAULT; } catch {} return CONNECT_TIMEOUT_DEFAULT; })();
const STALL_TIMEOUT_MS = ((): number => {
  try { const v = (import.meta as any).env?.VITE_AI_STALL_TIMEOUT_MS; if (v) return Number(v) || STALL_TIMEOUT_DEFAULT; } catch {} return STALL_TIMEOUT_DEFAULT; })();

export type StreamPhase = 'idle' | 'connecting' | 'handshake' | 'firstByte' | 'streaming' | 'completed' | 'error' | 'aborted';


const ORDER: StreamPhase[] = ['idle','connecting','handshake','firstByte','streaming','completed'];

export interface StreamingPhaseController {
  phase: StreamPhase;
  reason: string | null;
  onStart: () => void;
  onConnect: (info?: { status?: number }) => void;
  onFirstByte: () => void;
  onDelta: () => void;
  onFinal: () => void;
  onError: (err?: unknown) => void;
  abort: (why?: string) => void;
  reset: () => void;
}

export function useStreamingPhaseController(): StreamingPhaseController {
  const [phase, setPhase] = useState<StreamPhase>('idle');
  const reasonRef = useRef<string | null>(null);
  const connectTimerRef = useRef<number | null>(null);
  const stallTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; clearTimers(); }, []);

  const setPhaseSafe = useCallback((next: StreamPhase) => {
    if (!mountedRef.current) return;
    setPhase(prev => {

      if (next === 'error' || next === 'aborted' || next === 'completed') return next;
      const prevIdx = ORDER.indexOf(prev);
      const nextIdx = ORDER.indexOf(next);
      if (nextIdx === -1) return prev;
      return nextIdx > prevIdx ? next : prev;
    });
  }, []);

  const clearTimers = useCallback(() => {
    if (connectTimerRef.current !== null) { clearTimeout(connectTimerRef.current); connectTimerRef.current = null; }
    if (stallTimerRef.current !== null) { clearTimeout(stallTimerRef.current); stallTimerRef.current = null; }
  }, []);

  const armStall = useCallback(() => {
    if (stallTimerRef.current !== null) clearTimeout(stallTimerRef.current);
    stallTimerRef.current = window.setTimeout(() => {
      reasonRef.current = 'stall_timeout';
      setPhaseSafe('error');
    }, STALL_TIMEOUT_MS);
  }, [setPhaseSafe]);

  const onStart = useCallback(() => {
    reasonRef.current = null;
    clearTimers();
    setPhaseSafe('connecting');
    connectTimerRef.current = window.setTimeout(() => {
      reasonRef.current = 'connect_timeout';
      setPhaseSafe('error');
    }, CONNECT_TIMEOUT_MS);
  }, [clearTimers, setPhaseSafe]);

  const onConnect = useCallback((_info?: { status?: number }) => {
    if (phase === 'connecting') {
      setPhaseSafe('handshake');
    }
    if (connectTimerRef.current !== null) { clearTimeout(connectTimerRef.current); connectTimerRef.current = null; }
    armStall();

  }, [phase, armStall]);

  const onFirstByte = useCallback(() => {
    setPhaseSafe('firstByte');
    armStall();
  }, [armStall, setPhaseSafe]);

  const onDelta = useCallback(() => {
    setPhaseSafe('streaming');
    armStall();
  }, [armStall, setPhaseSafe]);

  const onFinal = useCallback(() => {
    clearTimers();
    setPhaseSafe('completed');
  }, [clearTimers, setPhaseSafe]);

  const onError = useCallback((_err?: unknown) => {
    clearTimers();
    setPhaseSafe('error');
  }, [clearTimers, setPhaseSafe]);

  const abort = useCallback((why?: string) => {
    reasonRef.current = why || 'aborted';
    clearTimers();
    setPhaseSafe('aborted');
  }, [clearTimers, setPhaseSafe]);

  const reset = useCallback(() => {
    reasonRef.current = null;
    clearTimers();
    setPhase('idle');
  }, [clearTimers]);

  return { phase, reason: reasonRef.current, onStart, onConnect, onFirstByte, onDelta, onFinal, onError, abort, reset };
}


export function phaseLabel(p: StreamPhase): string {
  switch(p){
    case 'idle': return '';
    case 'connecting': return 'Connecting…';
    case 'handshake': return 'Connecting…';
    case 'firstByte': return 'Streaming…';
    case 'streaming': return 'Streaming…';
    case 'completed': return '';
    case 'error': return 'Error';
    case 'aborted': return 'Canceled';
  }
}
