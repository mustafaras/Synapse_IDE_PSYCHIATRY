import { useResilience } from './store';
import type { OutboxItem } from './types';
import { fetchWithRetry } from './fetchWithRetry';
import { nextDelayMs } from './policy';

let running = false;
let intervalId: number | null = null;

export function startOutboxWorker() {
  if (running) return;
  running = true;
  const tick = async () => {
  const { online, outbox } = useResilience.getState();
    if (!online) return;


    const now = Date.now();
    const item = outbox.find(i => i.status === 'queued' && i.nextAt <= now);
    if (!item) return;
    await processItem(item);
  };

  intervalId = window.setInterval(tick, 750);
}

export function stopOutboxWorker() {
  running = false;
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
}

async function processItem(item: OutboxItem) {
  const st = useResilience.getState();
  const { env } = item;
  st.update(env.id, { status: 'running' });

  try {
    const res = await fetchWithRetry(env.url, {
      method: env.method,
      headers: { 'Content-Type': 'application/json', ...(env.headers || {}) },
      body: env.body ? JSON.stringify(env.body) : null,
    } as RequestInit, {
      timeoutMs: env.timeoutMs ?? 15000,
      maxAttempts: 4,
      backoffMs: (a) => nextDelayMs(a, { baseMs: 800, factor: 1.8, jitter: 0.25, maxMs: 30_000 })
    });

    if (!res.ok) {
      const errText = await safeText(res);
      const nextAt = Date.now() + nextDelayMs(item.attempt + 1);
      st.update(env.id, { status: 'queued', attempt: item.attempt + 1, nextAt, lastError: `HTTP ${res.status} ${res.statusText}: ${errText}` });
      return;
    }


    st.remove(env.id);
  } catch (e) {
    const nextAt = Date.now() + nextDelayMs(item.attempt + 1);
    st.update(env.id, { status: 'queued', attempt: item.attempt + 1, nextAt, lastError: (e as Error)?.message || 'network error' });
  }
}

async function safeText(res: Response): Promise<string> {
  try { return await res.text(); } catch { return ''; }
}
