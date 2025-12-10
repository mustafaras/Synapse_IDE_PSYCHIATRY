

export type Doc = { id: string; name: string; content: string };

let docs: Doc[] = [];

self.onmessage = (e: MessageEvent) => {
  const { type, payload } = e.data || {};
  if (type === 'index') {
    docs = payload?.docs || [];

    (self as any).postMessage({ type: 'indexed', payload: { count: docs.length } });
    return;
  }
  if (type === 'query') {
    const q: string = String(payload?.q || '').toLowerCase();
    const limit: number = payload?.limit ?? 200;
    if (!q) {
      (self as any).postMessage({ type: 'results', payload: { results: [] } });
      return;
    }
    const results: any[] = [];
    for (const d of docs) {
      const lines = (d.content || '').split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const idx = line.toLowerCase().indexOf(q);
        if (idx !== -1) {
          const start = Math.max(0, idx - 40);
          const end = Math.min(line.length, idx + q.length + 40);
          const preview = line.slice(start, end);
          results.push({
            docId: d.id,
            docName: d.name,
            line: i + 1,
            preview,
            matchIndex: idx - start,
            matchLength: q.length,
          });
          if (results.length >= limit) break;
        }
      }
      if (results.length >= limit) break;
    }
    (self as any).postMessage({ type: 'results', payload: { results } });
  }
};
