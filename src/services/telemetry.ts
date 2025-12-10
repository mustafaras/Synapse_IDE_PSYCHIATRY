

export interface AiTelemetryEvent {
  action: 'insert' | 'preview' | 'improve' | 'explain' | 'comment';
  model?: string | undefined;
  latencyMs?: number | undefined;
  tokensApprox?: number | undefined;
  success: boolean;
  errorType?: string | undefined;
  timestamp: string;
}

function isDev() {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')
      return true;


    if (typeof window !== 'undefined' && (window as any).importMetaEnvMode === 'development')
      return true;
  } catch {}
  return false;
}

export function logAiEvent(evt: AiTelemetryEvent) {
  if (!isDev()) return;


  console.debug('[AI_TELEMETRY]', {
    ...evt,
    timestamp: evt.timestamp || new Date().toISOString(),
  });
}


let _queue: AiTelemetryEvent[] = [];
let _flushTimer: any = null;
const FLUSH_INTERVAL = 5000;
const MAX_BATCH = 25;
let _persistFail = false;

function getEndpoint(): string | null {
  try {


    if (
      typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_AI_TELEMETRY_ENDPOINT
    ) {

      return import.meta.env.VITE_AI_TELEMETRY_ENDPOINT as string;
    }
  } catch {}
  try {
    if (typeof window !== 'undefined' && (window as any).__AI_TELEMETRY_ENDPOINT)
      return String((window as any).__AI_TELEMETRY_ENDPOINT);
  } catch {}
  return null;
}

function persistBuffer(buf: AiTelemetryEvent[]) {
  try {
    localStorage.setItem('synapse.ai.telemetryBuffer', JSON.stringify(buf));
  } catch {}
}
function loadPersisted(): AiTelemetryEvent[] {
  try {
    const raw = localStorage.getItem('synapse.ai.telemetryBuffer');
    if (raw) {
      localStorage.removeItem('synapse.ai.telemetryBuffer');
      return JSON.parse(raw) || [];
    }
  } catch {}
  return [];
}

function scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    try {
      flushTelemetryQueue();
    } finally {
      _flushTimer = null;
    }
  }, FLUSH_INTERVAL);
}

export function enqueueAiEvent(evt: AiTelemetryEvent) {
  if (!isDev()) return;
  _queue.push(evt);
  if (_queue.length >= MAX_BATCH) {
    flushTelemetryQueue();
  } else {
    scheduleFlush();
  }
}

export function flushTelemetryQueue() {
  if (!isDev()) {
    _queue = [];
    return;
  }
  if (!_queue.length) return;

  if (!_persistFail) {
    const leftover = loadPersisted();
    if (leftover.length) _queue.unshift(...leftover);
  }
  const batch = _queue.slice();
  _queue = [];
  const endpoint = getEndpoint();
  if (!endpoint) {
    console.debug('[AI_TELEMETRY_BATCH:console]', { count: batch.length, events: batch });
    return;
  }
  try {

    let sent = false;
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify({ events: batch, ts: Date.now() })], {
          type: 'application/json',
        });
        sent = navigator.sendBeacon(endpoint, blob);
      } catch {}
    }
    if (!sent) {

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: batch, ts: Date.now() }),
      }).catch(() => {
        throw new Error('fetch failed');
      });
    }
    _persistFail = false;
  } catch (e) {
    console.debug('[AI_TELEMETRY_BATCH:deferred]', {
      count: batch.length,
      error: (e as any)?.message,
    });
    persistBuffer(batch);
    _persistFail = true;
  }
}

export async function timeAndLog<T>(params: {
  action: AiTelemetryEvent['action'];
  model?: string;
  tokensApprox?: number;
  exec: () => Promise<T>;
}): Promise<T> {
  const start = performance.now();
  try {
    const result = await params.exec();
    const evt: AiTelemetryEvent = {
      action: params.action,
      model: params.model,
      latencyMs: Math.round(performance.now() - start),
      tokensApprox: params.tokensApprox,
      success: true,
      timestamp: new Date().toISOString(),
    };
    logAiEvent(evt);
    enqueueAiEvent(evt);
    return result;
  } catch (e: any) {
    const evt: AiTelemetryEvent = {
      action: params.action,
      model: params.model,
      latencyMs: Math.round(performance.now() - start),
      tokensApprox: params.tokensApprox,
      success: false,
      errorType: e?.message || 'error',
      timestamp: new Date().toISOString(),
    };
    logAiEvent(evt);
    enqueueAiEvent(evt);
    throw e;
  }
}


export function estimateTokens(text: string | undefined | null): number {
  if (!text) return 0;

  const words = text.trim().split(/\s+/).length;
  const chars = text.length;

  return Math.max(1, Math.round((chars / 4 + words) / 2));
}
