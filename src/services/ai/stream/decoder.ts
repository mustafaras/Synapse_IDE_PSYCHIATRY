export type ChunkHandler = (text: string) => void;

export async function readTextStream(
  body: ReadableStream<Uint8Array>,
  onChunk: ChunkHandler,
  opts?: { heartbeatMs?: number; idleTimeoutMs?: number; signal?: AbortSignal; onTimeout?: () => void }
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const heartbeatMs = opts?.heartbeatMs ?? 10_000;
  const idleTimeoutMs = opts?.idleTimeoutMs ?? 30_000;
  let lastTs = Date.now();

  const idleTimer = setInterval(() => {
    if (Date.now() - lastTs > idleTimeoutMs) {
      clearInterval(idleTimer);
      try { reader.cancel('Idle timeout'); } catch {}
      try { opts?.onTimeout?.(); } catch {}
    }
  }, heartbeatMs);

  try {
    while (true) {
      if (opts?.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const { value, done } = await reader.read();
      if (done) break;
      lastTs = Date.now();
      if (!value) continue;
      const text = decoder.decode(value, { stream: true });
      if (text) onChunk(text);
    }
  } finally {
    clearInterval(idleTimer);
    try { reader.releaseLock(); } catch {}
  }
}


export function forEachSSELine(buffer: string, emit: (data: string) => void) {
  const events = buffer.split('\n\n');
  for (let i = 0; i < events.length - 1; i++) {
    const lines = events[i].split('\n');
    const dataLines = lines.filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart());
    if (dataLines.length) emit(dataLines.join('\n'));
  }
  return events[events.length - 1];
}
