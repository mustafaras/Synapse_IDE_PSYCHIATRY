



type Payload = string | { input: string };
type WorkerContext = { postMessage: (msg: string | null) => void };
const ctx = self as unknown as WorkerContext;

self.onmessage = async (e: MessageEvent<Payload>) => {
  try {
    const input = e.data;
    const str = typeof input === 'string' ? input : input?.input;
    if (typeof str !== 'string') { ctx.postMessage(null); return; }
    const data = new TextEncoder().encode(str);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    ctx.postMessage(hex);
  } catch {
    ctx.postMessage(null);
  }
};

export {};