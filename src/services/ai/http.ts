import { isAbortError, toUnifiedError } from './http.errors';

const IS_DEV: boolean = (() => {
  try { return typeof import.meta !== 'undefined' && !!((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV); } catch { return false; }
})();
import type { RequestJSONOptions, RequestSSEOptions, RequestSSEResult, RetryPolicy, UnifiedError } from './http.types';

export type ErrorCategory =
  | 'rate_limit'
  | 'auth'
  | 'server'
  | 'network'
  | 'abort'
  | 'transient'
  | 'unknown';


export const SETTINGS = {} as const;

export class ProviderError extends Error {
  category: ErrorCategory;
  providerCode: string | undefined;
  status: number | undefined;
  retriable: boolean;

  code?: string;
  constructor(
    message: string,
    opts: { category: ErrorCategory; providerCode?: string; status?: number; retriable?: boolean; code?: string }
  ) {
    super(message);
    this.name = 'ProviderError';
    this.category = opts.category;
    this.providerCode = opts.providerCode;
    this.status = opts.status;
    this.retriable = !!opts.retriable;
    this.code = opts.code || opts.category;
  }
}


function aiTrace(...args: unknown[]) {
  try {
  const enabled = typeof window !== 'undefined' && (window as { flags?: { aiTrace?: boolean } })?.flags?.aiTrace;
    if (enabled) console.warn('[AI-TRACE]', ...args);
  } catch {}
}

const DEFAULT_RETRY: RetryPolicy = {
  retries: 2,
  baseDelayMs: 300,
  maxDelayMs: 2000,
  retryOn: (status?: number, _code?: string) => {
    if (status === undefined) return true;
    if (status >= 500) return true;
    if (status === 429) return true;
    return false;
  },
};

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((res, rej) => {
    const t = setTimeout(res, ms);
    if (signal) {
      const onAbort = () => {
        clearTimeout(t);
  const err = new Error('Aborted');
  (err as { name: string }).name = 'AbortError';
  rej(err as Error);
      };
      if (signal.aborted) onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
}


function mergeAbortSignals(...signals: (AbortSignal | null | undefined)[]): AbortSignal | undefined {
  const active = signals.filter((s): s is AbortSignal => !!s && !s.aborted);
  if (active.length === 0) return undefined;
  if (active.length === 1) return active[0];
  const ctl = new AbortController();
  for (const s of active) s.addEventListener('abort', () => { try { ctl.abort(); } catch {} }, { once: true });
  if (IS_DEV) { try { console.warn('[ABORT][MERGE]', active.map(a => ({ aborted: a.aborted }))); } catch {} }
  return ctl.signal;
}

function jitteredBackoff(attempt: number, base: number, max: number) {
  const exp = Math.min(max, base * Math.pow(2, attempt));
  const jitter = Math.random() * 0.3 + 0.85;
  return Math.min(max, Math.floor(exp * jitter));
}


interface ParsedSseEvent { data: string; event?: string; id?: string; retry?: number }

class SseParser {
  private buffer = '';
  private readonly MAX_BUFFER = 1024 * 1024;
  private readonly TRIM_KEEP = 64 * 1024;
  private lastEventId: string | undefined;

  feed(chunk: string): ParsedSseEvent[] {
    if (!chunk) return [];
    this.buffer += chunk;
    const out: ParsedSseEvent[] = [];

    if (this.buffer.length > this.MAX_BUFFER) {

      const excess = this.buffer.length - this.TRIM_KEEP;
      this.buffer = this.buffer.slice(excess);
      try { console.warn('[SSE][BUFFER_TRIM]', { excess }); } catch {}
    }


    while (true) {
      const match = /\r?\n\r?\n/.exec(this.buffer);
      if (!match) break;
      const idx = match.index;
      const block = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + match[0].length);
      const parsed = this.parseBlock(block);
      if (parsed) out.push(parsed);
    }
    return out;
  }


  flushRemainder(): ParsedSseEvent[] {
    const rem = this.buffer.trim();
    if (!rem) return [];
    const parsed = this.parseBlock(rem);
    this.buffer = '';
    return parsed ? [parsed] : [];
  }

  private parseBlock(block: string): ParsedSseEvent | null {
    if (!block) return null;
    const lines = block.split(/\r?\n/);
    const dataLines: string[] = [];
    let eventType: string | undefined;
    let id: string | undefined;
    let retry: number | undefined;
    for (const rawLine of lines) {
      if (!rawLine) continue;
      if (rawLine.startsWith(':')) continue;
      const colon = rawLine.indexOf(':');
      let field: string;
      let value: string;
      if (colon === -1) { field = rawLine; value = ''; } else {
        field = rawLine.slice(0, colon);
        value = rawLine.slice(colon + 1);
        if (value.startsWith(' ')) value = value.slice(1);
      }
      switch(field){
        case 'data': dataLines.push(value); break;
        case 'event': eventType = value; break;
        case 'id': id = value; this.lastEventId = value; break;
        case 'retry': { const n = parseInt(value,10); if(!Number.isNaN(n)) retry = n; } break;
        default: break;
      }
    }
    if (!dataLines.length && id && !eventType) return null;
    if (!dataLines.length && !eventType && !id) return null;
    const data = dataLines.join('\n');
    const resolvedId = id ?? this.lastEventId;
    const evt: ParsedSseEvent = { data };
    if (eventType !== undefined) evt.event = eventType;
    if (resolvedId !== undefined) evt.id = resolvedId;
    if (retry !== undefined) evt.retry = retry;
    return evt;
  }
}


export const __sseTestUtils = { SseParser };

export function normalizeSseNewlines(input: string): string {
  if (!input) return '';
  return input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}


export function drainSseBuffer(buffer: string, emit: (raw: string) => void): string {


  while (true) {
    const match = /\r?\n\r?\n/.exec(buffer);
    if (!match) break;
    const idx = match.index;
    const block = buffer.slice(0, idx);
    buffer = buffer.slice(idx + match[0].length);
    if (block.trim().length === 0) continue;

    emit(block);
  }
  return buffer;
}

export async function requestJSON<T = unknown>(opts: RequestJSONOptions): Promise<T> {
  const { url, method = 'POST', headers = {}, body, signal, timeout, retry } = opts;
  const rp: RetryPolicy = { ...DEFAULT_RETRY, ...retry };
  let attempt = 0;
  const rootController = new AbortController();
  const rootSignals: AbortSignal[] = [rootController.signal];
  if (signal) rootSignals.push(signal);
  const onRootAbort = () => { try { rootController.abort(); } catch {} };
  rootSignals.forEach(s => s.addEventListener('abort', onRootAbort, { once: true }));

  try {
    while (true) {
      const thisAttempt = attempt;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      const perReq = new AbortController();
      if (timeout && timeout > 0) timeoutId = setTimeout(() => { try { perReq.abort(); } catch {} }, timeout);
      const merged = mergeAbortSignals(perReq.signal, ...rootSignals);

      const start = performance.now();
      aiTrace('[HTTP][INIT]', { url, method, attempt: thisAttempt });
      try {

        let _id: string | undefined;
        if (IS_DEV) {
          _id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`;
          try { console.warn(`HTTP[${_id}] START ${method} ${url}`, { signals: { ext: !!signal && !signal.aborted, timeout: !!timeout && timeout>0 } }); } catch {}
        }
        const res = await fetch(url, merged ? {
          method,
          headers: { 'content-type': 'application/json', ...headers },
          body: body !== undefined ? JSON.stringify(body) : null,
          signal: merged,
        } : {
          method,
          headers: { 'content-type': 'application/json', ...headers },
          body: body !== undefined ? JSON.stringify(body) : null,
        });
        clearTimeout(timeoutId);
        const elapsed = Math.round(performance.now() - start);
        if (_id && IS_DEV) { try { console.warn(`HTTP[${_id}] FIRST-BYTE`, { status: res.status }); } catch {} }
        if (!res.ok) {
          aiTrace('[HTTP][ERROR_STATUS]', { status: res.status, elapsed, attempt: thisAttempt });
          const ue = toUnifiedError(new Error(`HTTP ${res.status}`), { status: res.status });
          if (rp.retryOn(res.status, ue.code) && attempt < rp.retries) {
            const delay = jitteredBackoff(attempt, rp.baseDelayMs, rp.maxDelayMs);
            aiTrace('[HTTP][RETRY]', { attempt: thisAttempt + 1, delay });
            attempt++;
            await sleep(delay, signal);
            continue;
          }
          throw ue;
        }
        const json = (await res.json()) as T;
        aiTrace('[HTTP][DONE]', { elapsed });
        return json;
      } catch (e) {
        clearTimeout(timeoutId);
        if (isAbortError(e)) throw e;
  const ue = toUnifiedError(e as unknown);
        if (rp.retryOn(undefined, ue.code) && attempt < rp.retries && ue.retriable) {
          const delay = jitteredBackoff(attempt, rp.baseDelayMs, rp.maxDelayMs);
          aiTrace('[HTTP][RETRY]', { attempt: thisAttempt + 1, delay, code: ue.code });
          attempt++;
          await sleep(delay, signal);
          continue;
        }
        aiTrace('[HTTP][FAIL]', { code: ue.code });
        throw ue;
      }
    }
  } finally {
    rootSignals.forEach(s => s.removeEventListener('abort', onRootAbort));
  }
}

export function requestSSE(opts: RequestSSEOptions): RequestSSEResult {

  const { url, method = 'POST', headers = {}, body, signal, openTimeoutMs = 10_000, retry, onEvent, onConnect, onFirstByte } = opts;
  const rp: RetryPolicy = { ...DEFAULT_RETRY, ...retry };
  let attempt = 0;
  let closed = false;
  const controller = new AbortController();
  const userSignal = signal;

  let cancelReason: string | null = null;

  const cancel = (reason: string = 'unknown') => {
    closed = true;
    cancelReason = reason;
    try { aiTrace('[SSE][CANCEL]', { reason }); } catch {}
    controller.abort();
  };

  function attachUserAbort() {
    if (!userSignal) return;
    const onAbort = () => cancel('user_abort');
    if (userSignal.aborted) onAbort();
    userSignal.addEventListener('abort', onAbort, { once: true });
  }

  async function run() {
    attachUserAbort();
    while (!closed) {
      const thisAttempt = attempt;
  let openTimer: ReturnType<typeof setTimeout> | undefined;
      try {
  try {
    const authRaw = (headers as Record<string, unknown>).Authorization;
    const authPreview = authRaw ? `${String(authRaw).slice(0,12)}...` : undefined;
    const userAborted = !!(userSignal && (userSignal as AbortSignal).aborted);
    console.warn('[SSE][INIT]', { url, attempt: thisAttempt, hasAuth: !!authRaw, authPreview, userSignalAborted: userAborted });
  } catch {}
  aiTrace('[SSE][INIT]', { url, attempt: thisAttempt });
        const startedAt = performance.now();
        let res: Response;
        try {
          res = await fetch(url, {
          method,
          headers: { 'content-type': 'application/json', accept: 'text/event-stream', ...headers },
          body: body !== undefined ? JSON.stringify(body) : null,
          signal: controller.signal,
        });

          try {
            if (typeof onConnect === 'function') {
              const hdrs: Record<string,string> = {};
              res.headers.forEach((v,k)=> { hdrs[k.toLowerCase()] = v; });
              onConnect({ status: res.status, headers: hdrs });
            }
          } catch {}
  } catch (netErr) {

          const aborted = !!(netErr && typeof netErr === 'object' && (
            ('name' in netErr && (netErr as { name?: string }).name === 'AbortError') ||
            ('code' in netErr && (netErr as { code?: string }).code === 'ABORT_ERR')
          ));
          if (aborted) {
            try { console.warn('[SSE][FETCH_ABORTED_BEFORE_RESP]', { attempt: thisAttempt, cancelReason, userSignalAborted: !!(userSignal && (userSignal as AbortSignal).aborted) }); } catch {}
          } else {
            const nfMsg = (netErr && typeof netErr === 'object' && 'message' in netErr)
              ? String((netErr as { message?: unknown }).message)
              : String(netErr);
            try { console.warn('[SSE][FETCH_FAILED_BEFORE_RESP]', { attempt: thisAttempt, err: nfMsg }); } catch {}
          }
          const ue = toUnifiedError(netErr);
          ue.detail = 'network_fetch_failed';
          aiTrace('[SSE][NETWORK_ERROR]', { code: ue.code, detail: ue.detail });
          onEvent({ type: 'error', error: ue });
          return;
        }
  const latency = Math.round(performance.now() - startedAt);
  try { console.warn('[SSE][RESP_STATUS]', { status: res.status, latency, ok: res.ok }); } catch {}
  aiTrace('[SSE][RESP_STATUS]', { status: res.status, latency });
        if (!res.ok) {

          let body: unknown = null;
          try { body = await res.clone().json(); } catch {  }
          interface ErrShape { error?: { code?: string; type?: string; message?: string } }
          const eb = body as ErrShape | null;
          const code = eb?.error?.code ?? eb?.error?.type ?? undefined;
          const msg = eb?.error?.message ?? res.statusText ?? 'Provider request failed';
          let category: ErrorCategory = 'unknown';
          let retriable = false;

          if (res.status === 401) {
            category = 'auth';
            retriable = false;
          } else if (res.status === 429) {
            category = 'rate_limit';
            retriable = true;
          } else if (res.status >= 500) {
            category = 'server';
            retriable = true;
          } else {
            category = 'network';
            retriable = true;
          }

          const perrOpts: { category: ErrorCategory; providerCode?: string; status?: number; retriable?: boolean } = { category, status: res.status, retriable };
          if (code !== undefined) perrOpts.providerCode = code;
          const perr = new ProviderError(msg, perrOpts);
          try { console.warn('[SSE][ERROR_STATUS]', { status: res.status, attempt: thisAttempt, providerCode: code, category: perr.category, retriable: perr.retriable }); } catch {}
          aiTrace('[SSE][ERROR_STATUS]', { status: res.status, attempt: thisAttempt, providerCode: code, category: perr.category, retriable: perr.retriable });

          if (perr.retriable && rp.retryOn(res.status, perr.code) && attempt < rp.retries) {
            let retryAfterMs: number | undefined;
            try {
              const ra = res.headers.get('retry-after');
              if (ra) {
                const asNum = Number(ra);
                if (!Number.isNaN(asNum)) retryAfterMs = asNum * 1000;
              }
            } catch {}
            const delay = retryAfterMs ? Math.min(retryAfterMs, rp.maxDelayMs) : jitteredBackoff(attempt, rp.baseDelayMs, rp.maxDelayMs);
            aiTrace('[SSE][RETRY]', { attempt: thisAttempt + 1, delay, providerCode: code, category: perr.category });
            attempt++;
            await sleep(delay, signal);
            continue;
          }
          onEvent({ type: 'error', error: perr as unknown as UnifiedError });
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {

          try {
            const textFull = await res.text();
            const parser = new SseParser();
            onEvent({ type: 'open' });
            parser.feed(textFull);
            for (const ev of parser.flushRemainder()) {
              if (ev.data !== undefined) onEvent({ type: 'message', data: ev.data });
            }
            onEvent({ type: 'done' });
            return;
          } catch {
            const ue: UnifiedError = { code: 'parse', retriable: true, userMessage: 'No stream', detail: 'Missing body reader' };
            onEvent({ type: 'error', error: ue });
            return;
          }
        }

        let opened = false;
    openTimer = setTimeout(() => {
          if (!opened) {
            const ue: UnifiedError = { code: 'timeout', retriable: true, userMessage: 'Stream open timed out.' };
            aiTrace('[SSE][OPEN_TIMEOUT]');
            try { console.warn('[SSE][OPEN_TIMEOUT] possible slow provider or network issue'); } catch {}
            try { reader.cancel(); } catch {}
            onEvent({ type: 'error', error: ue });
      cancel('open_timeout');
          }
        }, openTimeoutMs);

  const decoder = new TextDecoder('utf-8');
  const parser = new SseParser();
        onEvent({ type: 'open' });
        opened = true;
  try { console.warn('[SSE][OPEN]'); } catch {}
  aiTrace('[SSE][OPEN]');
        let firstByteSeen = false;
        while (!closed) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!firstByteSeen && value && value.length > 0) {
            firstByteSeen = true;
            try { onFirstByte?.(); } catch {}
          }
          const chunk = decoder.decode(value, { stream: true });
          try { if ((globalThis as { flags?: { aiTrace?: boolean } })?.flags?.aiTrace) console.warn('[SSE][CHUNK]', { size: chunk.length }); } catch {}
          for (const ev of parser.feed(chunk)) {

            if (ev.data && ev.data.trim() === '[DONE]') {
              onEvent({ type: 'message', data: ev.data.trim() });

              continue;
            }
            if (ev.data !== undefined) onEvent({ type: 'message', data: ev.data });
          }
        }

        for (const ev of parser.flushRemainder()) {
          if (ev.data && ev.data.trim() === '[DONE]') {
            onEvent({ type: 'message', data: ev.data.trim() });
            continue;
          }
          if (ev.data !== undefined) onEvent({ type: 'message', data: ev.data });
        }
        clearTimeout(openTimer);
  onEvent({ type: 'done' });
  try { console.warn('[SSE][DONE]'); } catch {}
  aiTrace('[SSE][DONE]');
        return;
  } catch (e) {
        clearTimeout(openTimer);

        if (isAbortError(e) || closed) {
          const detail = cancelReason || (isAbortError(e) ? 'abort_error' : 'closed_flag');
          aiTrace('[SSE][ABORTED]', { detail });
          try { console.warn('[SSE][ABORTED]', detail, { closedFlag: closed, cancelReason, attempt: attempt }); } catch {}
          const perr = new ProviderError(`Request was canceled (${detail})`, { category: 'abort', retriable: false });
          (perr as ProviderError & { detail?: string }).detail = detail;
          onEvent({ type: 'error', error: perr as unknown as UnifiedError });
          return;
        }

        let perr: ProviderError;
        if (e && typeof e === 'object' && (e as { name?: string }).name === 'AbortError') {
          perr = new ProviderError('Request aborted', { category: 'abort', retriable: false });
        } else {
          const msg = (e && typeof e === 'object' && 'message' in e) ? String((e as { message?: unknown }).message) : 'Network/Unknown error';
          perr = new ProviderError(msg || 'Network/Unknown error', { category: 'network', retriable: true });
        }
        if (perr.retriable && rp.retryOn(undefined, perr.code) && attempt < rp.retries) {
          const delay = jitteredBackoff(attempt, rp.baseDelayMs, rp.maxDelayMs);
          aiTrace('[SSE][RETRY]', { attempt: thisAttempt + 1, delay, code: perr.code });
          attempt++;
          await sleep(delay, signal);
          continue;
        }
        onEvent({ type: 'error', error: perr as unknown as UnifiedError });
        return;
      }
    }
  }


  run();
  return { cancel };
}
export async function fetchWithAbort(input: RequestInfo, init?: RequestInit & { signal?: AbortSignal }) {
  return fetch(input, init);
}
