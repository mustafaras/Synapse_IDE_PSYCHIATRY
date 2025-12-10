

export type SearchDoc = { id: string; name: string; content: string };

let worker: Worker | null = null;
let ready = false;
const pending: ((results: any) => void)[] = [];

function ensureWorker() {
  if (!worker) {


    worker = new Worker(new URL('../workers/searchWorker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data || {};
      if (type === 'indexed') ready = true;
      if (type === 'results') {
        const cb = pending.shift();
        if (cb) cb(payload?.results || []);
      }
    };
  }
}

export function indexDocs(docs: SearchDoc[]) {
  ensureWorker();
  ready = false;
  worker!.postMessage({ type: 'index', payload: { docs } });
}

export function queryDocs(q: string, limit = 200): Promise<any[]> {
  ensureWorker();
  return new Promise(resolve => {
    const send = () => worker!.postMessage({ type: 'query', payload: { q, limit } });
    pending.push(resolve);
    if (!ready) {

      setTimeout(send, 10);
    } else {
      send();
    }
  });
}
