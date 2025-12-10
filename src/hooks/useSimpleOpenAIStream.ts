import { useCallback, useRef, useState } from 'react';

interface SimpleStreamParams {
  prompt: string;
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  apiKey?: string;
  onDelta?: (chunk: string) => void;
  onComplete?: (full: string) => void;
  onError?: (err: unknown) => void;
}

interface SimpleStreamState {
  isStreaming: boolean;
  startedAt?: number;
  firstByteAt?: number;
  endedAt?: number;
  error?: string;
}


export function useSimpleOpenAIStream() {
  const [state, setState] = useState<SimpleStreamState>({ isStreaming: false });
  const abortRef = useRef<AbortController | null>(null);
  const accRef = useRef('');

  const start = useCallback((p: SimpleStreamParams) => {
    if (state.isStreaming) return;
    const model = p.model || 'gpt-4o-mini';
    const controller = new AbortController();
    abortRef.current = controller;
    accRef.current = '';
    setState({ isStreaming: true, startedAt: Date.now() });


    const body = {
      model,
      messages: [
        ...(p.systemPrompt ? [{ role: 'system', content: p.systemPrompt }] : []),
        { role: 'user', content: p.prompt },
      ],
      temperature: p.temperature,
      top_p: p.topP,
      max_tokens: p.maxTokens,
      apiKey: p.apiKey,
      stream: true,
    };

    const tryFetch = async () => {

      let resp = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      }).catch(() => null);
      if (!resp || resp.status === 404) {

        resp = await fetch('/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: p.apiKey ? `Bearer ${p.apiKey}` : '',
          },
          body: JSON.stringify({ ...body, stream: true }),
          signal: controller.signal,
        }).catch(e => { throw e; });
      }
      if (!resp.ok || !resp.body) throw new Error(`http_${resp.status}`);

      const reader = (resp.body as ReadableStream<Uint8Array>).getReader();
      const dec = new TextDecoder();
      let firstByte = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        const txt = dec.decode(value, { stream: true });

        const lines = txt.split(/\n/).map(l => l.trim());
        for (const line of lines) {
          if (!line || line.startsWith(':')) continue;
          if (line.startsWith('event: error')) continue;
          if (line.startsWith('data:')) {
            const payload = line.slice(5).trim();
            if (payload === '[DONE]' || payload === ':done') continue;
            try {

              const j = JSON.parse(payload);
              const delta = j?.choices?.[0]?.delta?.content;
              if (delta) {
                if (!firstByte) { firstByte = true; setState(s => ({ ...s, firstByteAt: Date.now() })); }
                accRef.current += delta;
                p.onDelta?.(delta);
              }
            } catch {

            }
          }
        }
      }
    };

    (async () => {
      try {
        await tryFetch();
        setState(s => ({ ...s, isStreaming: false, endedAt: Date.now() }));
        p.onComplete?.(accRef.current);
      } catch (e: any) {
        setState(s => ({ ...s, isStreaming: false, endedAt: Date.now(), error: e?.message || 'stream_error' }));
        p.onError?.(e);
      }
    })();
  }, [state.isStreaming]);

  const abort = useCallback(() => { try { abortRef.current?.abort(); } catch {}; setState(s => ({ ...s, isStreaming: false, error: s.error || 'aborted', endedAt: Date.now() })); }, []);

  return { start, abort, state } as const;
}

export default useSimpleOpenAIStream;
