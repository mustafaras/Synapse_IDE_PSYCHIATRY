



export type StreamEvent =
  | { type: 'start'; requestId: string; meta?: Record<string, unknown> }
  | { type: 'delta'; requestId: string; text?: string; tool?: unknown }
  | { type: 'usage'; requestId: string; usage?: { prompt: number; completion: number } }
  | { type: 'done'; requestId: string; finishReason?: string }
  | { type: 'error'; requestId: string; error: Error & { code?: string; provider?: string } };

export interface ProviderAdapter {
  start(opts: {
    requestId: string;
    signal: AbortSignal;
    model: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    seed?: number | null;
    onEvent: (ev: StreamEvent) => void;
  }): Promise<void>;
}


const textDecoder = () => new TextDecoder();
const isDev = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') || (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true);


export const createOpenAIAdapter = (apiKey: string): ProviderAdapter => ({
  async start({ requestId, signal, model, messages, temperature, topP, seed, onEvent }) {
    onEvent({ type: 'start', requestId });
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        top_p: typeof topP === 'number' ? topP : undefined,
        seed: typeof seed === 'number' ? seed : undefined,
        stream: true,
      }),
      signal,
    });
    if (!resp.ok) {
      let details = '';
      try { const t = await resp.text(); try { details = JSON.parse(t)?.error?.message || t; } catch { details = t; } } catch {}
      throw Object.assign(new Error(`OpenAI API error: ${resp.status}${details ? ` - ${details}` : ''}`), { provider: 'openai' });
    }
    const reader = resp.body?.getReader();
    if (!reader) throw Object.assign(new Error('OpenAI: no stream'), { provider: 'openai' });
    const dec = textDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      const txt = dec.decode(value, { stream: true });
      for (const line of txt.split(/\n/)) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') {
          onEvent({ type: 'done', requestId, finishReason: 'stop' });
          continue;
        }
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onEvent({ type: 'delta', requestId, text: delta });
          const finish = json.choices?.[0]?.finish_reason;
          if (finish) onEvent({ type: 'done', requestId, finishReason: finish });
        } catch (e) {
          if (isDev) console.warn('[OpenAI SSE parse warn]', e);
        }
      }
    }
  }
});


export const createAnthropicAdapter = (apiKey: string): ProviderAdapter => ({
  async start({ requestId, signal, model, messages, temperature, topP, onEvent }) {
    onEvent({ type: 'start', requestId });

    const sys = messages.find(m => m.role === 'system')?.content || undefined;
    const user = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: 2000, messages: [{ role: 'user', content: sys ? `${sys}\n\n${user}` : user }], temperature, top_p: topP, stream: true }),
      signal,
    });
    if (!resp.ok) throw Object.assign(new Error(`Anthropic API error: ${resp.status}`), { provider: 'anthropic' });
    const reader = resp.body?.getReader();
    if (!reader) throw Object.assign(new Error('Anthropic: no stream'), { provider: 'anthropic' });
    const dec = textDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      const txt = dec.decode(value, { stream: true });
      for (const line of txt.split(/\n/)) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') { onEvent({ type: 'done', requestId, finishReason: 'stop' }); continue; }
        try {
          const json = JSON.parse(payload);
          const delta = json.delta?.text || json.content_block_delta?.text || '';
          if (delta) onEvent({ type: 'delta', requestId, text: delta });
        } catch {}
      }
    }
  }
});


export const createGeminiAdapter = (apiKey: string): ProviderAdapter => ({
  async start({ requestId, signal, model, messages, temperature, topP, seed, onEvent }) {
    onEvent({ type: 'start', requestId });
    const sys = messages.find(m => m.role === 'system')?.content || undefined;
    const user = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: sys ? `${sys}\n\n${user}` : user }] }], generationConfig: { maxOutputTokens: 2000, temperature: typeof temperature === 'number' ? temperature : 0.7, topP, seed } }), signal });
  if (!resp.ok) throw Object.assign(new Error(`Gemini API error: ${resp.status}`), { provider: 'gemini' });
    const data = await resp.json();
    const full: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!full) { onEvent({ type: 'done', requestId, finishReason: 'stop' }); return; }

    const chunks = full.match(/.{1,60}/g) || [full];
    for (const c of chunks) {
      if (signal.aborted) break;
      onEvent({ type: 'delta', requestId, text: c });
      await new Promise(r => setTimeout(r, 16));
    }
    onEvent({ type: 'done', requestId, finishReason: 'stop' });
  }
});


export const createOllamaAdapter = (baseUrl: string): ProviderAdapter => ({
  async start({ requestId, signal, model, messages, onEvent }) {
    onEvent({ type: 'start', requestId });
    const sys = messages.find(m => m.role === 'system')?.content || undefined;
    const user = messages.filter(m => m.role === 'user').map(m => m.content).join('\n\n');
    const configured = baseUrl || 'http://localhost:11434';
    const isLocalDefault = /localhost:11434\/?$/.test(configured);
    const base = isLocalDefault && typeof window !== 'undefined' ? '/ollama' : configured;
    const resp = await fetch(`${base}/api/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model, prompt: sys ? `${sys}\n\n${user}` : user, stream: true }), signal });
    if (!resp.ok) throw Object.assign(new Error(`Ollama API error: ${resp.status}`), { provider: 'ollama' });
    const reader = resp.body?.getReader();
    if (!reader) throw Object.assign(new Error('Ollama: no stream'), { provider: 'ollama' });
    const dec = textDecoder();
    let leftover = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!value) continue;
      leftover += dec.decode(value, { stream: true });
      const lines = leftover.split(/\n+/);
      leftover = lines.pop() || '';
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        try {
          const json = JSON.parse(t);
          const delta = json.response || '';
          if (delta) onEvent({ type: 'delta', requestId, text: delta });
          if (json.done) { onEvent({ type: 'done', requestId, finishReason: 'stop' }); }
        } catch {}
      }
    }
  }
});
