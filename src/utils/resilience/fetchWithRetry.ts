import { parseRetryAfter } from './policy';

export interface FetchRetryOpts {
  timeoutMs?: number;
  maxAttempts?: number;
  backoffMs?: (attempt: number) => number;
  signal?: AbortSignal;
}

export async function fetchWithRetry(url: string, init: RequestInit, opts: FetchRetryOpts): Promise<Response> {
  const maxAttempts = Math.max(1, opts.maxAttempts ?? 4);
  let attempt = 0;

  while (true) {
    const controller = new AbortController();
    const to = setTimeout(() => controller.abort(), opts.timeoutMs ?? 15000);
    const external = opts.signal ?? (init as any)?.signal as AbortSignal | undefined;
    const onAbort = () => { try { controller.abort(); } catch {} };
    if (external) {
      if ((external as any).aborted) { clearTimeout(to); throw new DOMException('Aborted', 'AbortError'); }
      try { external.addEventListener('abort', onAbort, { once: true }); } catch {}
    }
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      clearTimeout(to);
      if (external) { try { external.removeEventListener('abort', onAbort as any); } catch {} }
      if (res.ok) return res;


      if ([408, 429].includes(res.status) || (res.status >= 500 && res.status <= 599)) {
        if (attempt >= maxAttempts - 1) return res;
        const retryAfter = parseRetryAfter(res.headers.get('retry-after'));
        const delay = retryAfter ?? (opts.backoffMs ? opts.backoffMs(attempt) : 1000);
        await new Promise(r => setTimeout(r, delay));
        attempt += 1;
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(to);
      if (external) { try { external.removeEventListener('abort', onAbort as any); } catch {} }

      if (attempt >= maxAttempts - 1) throw e;
      const delay = opts.backoffMs ? opts.backoffMs(attempt) : 1000;
      await new Promise(r => setTimeout(r, delay));
      attempt += 1;
    }
  }
}
