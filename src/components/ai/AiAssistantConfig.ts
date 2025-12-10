


export type ProviderId = 'openai' | 'anthropic' | 'ollama' | string;

export type QuickPrompt = { id: string; label: string; prompt: string };
export type ModelInfo = { id: string; label: string; provider: ProviderId };

export const aiModels: ModelInfo[] = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai' },
  { id: 'chatgpt-4o-latest', label: 'ChatGPT 4o Latest', provider: 'openai' },
  { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'anthropic' },
  { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'anthropic' },
  { id: 'llama3.1', label: 'Llama 3.1 (Ollama)', provider: 'ollama' },
];

export const quickPrompts: QuickPrompt[] = [
  { id: 'explain', label: 'Explain this code', prompt: 'Explain the following code step by step:' },
  { id: 'improve', label: 'Improve readability', prompt: 'Refactor to improve readability without changing behavior:' },
];


export function estimateTokens(text: string): number {
  const s = String(text || '');
  return Math.max(1, Math.ceil(s.length / 4));
}

export type StoredMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; ts?: number };


export function buildSummaryRequestPayload(t: { messages: StoredMessage[]; [k: string]: any }) {
  const messages = Array.isArray(t?.messages) ? t.messages : [];
  const keepTailFromIndex = Math.max(0, messages.length - 10 - 0);
  const system = 'Please compress prior conversation into a concise project brief.';
  const user = 'Summarize the following prior dialogue focusing on user intent and constraints.';
  return { keepTailFromIndex, system, user };
}


export function selectRecentForBudget(messages: StoredMessage[], baseTokens: number, budget: number, margin: number): StoredMessage[] {
  const out: StoredMessage[] = [];
  let acc = baseTokens;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    const cost = estimateTokens(`[${m.role}] ${m.content}\n`);
    if (acc + cost > budget - margin) break;
    out.push(m);
    acc += cost;
  }
  return out.reverse();
}

export function notify(level: 'success' | 'info' | 'warning' | 'error' | string, message: string) {
  try {

    (window as any)?.telemetry?.emit?.({ type: 'notify', level, message });


    console[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log']('[notify]', level, message);
  } catch {

  }
}


export function sanitizeHtmlForPreview(html: string, _opts?: any): string {
  return String(html ?? '');
}


export function computeSanitizeDiff(before: string, after: string): string {
  const a = String(before ?? '').split('\n');
  const b = String(after ?? '').split('\n');
  const max = Math.max(a.length, b.length);
  const out: string[] = [];
  for (let i = 0; i < max; i++) {
    const l = a[i];
    const r = b[i];
    if (l === r) out.push(` ${  l ?? ''}`);
    else {
      if (typeof l !== 'undefined') out.push(`-${  l}`);
      if (typeof r !== 'undefined') out.push(`+${  r}`);
    }
  }
  return out.join('\n');
}

export function buildSystemPrompt(opts: { mode: 'beginner' | 'pro'; preset: any; pinnedContext?: string[] }) {
  const ctx = (opts.pinnedContext || []).join('\n');
  if (opts.mode === 'beginner') {

    return `You are a helpful coding assistant.\n${ctx}`.trim();
  }

  return `PLAN:\n- Analyze request\n- Propose changes\nFILES:\n- List impacted files\n${ctx}`.trim();
}

export function buildSystemPromptV2(opts: { mode: 'beginner' | 'pro'; pinnedContext?: string[]; projectBrief?: string }) {
  const ctx = (opts.pinnedContext || []).join('\n');
  const brief = opts.projectBrief ? `PROJECT:\n${opts.projectBrief}\n` : '';
  if (opts.mode === 'beginner') {
    return { systemPrompt: `You are a patient mentor.\n${brief}${ctx}`.trim() };
  }

  return {
    systemPrompt: `PLAN:\n- Outline steps\nFILES:\n- Enumerate files\n${brief}${ctx}`.trim(),
  };
}

export function classifyProviderError(err: unknown): { retryable: boolean; type: 'rate_limit' | 'server' | 'auth' | 'network' | 'unknown'; status?: number } {
  const msg = String((err as any)?.message || err || '');
  const statusMatch = msg.match(/\b(\d{3})\b/);
  const status = statusMatch ? parseInt(statusMatch[1], 10) : undefined;
  if (/429|Too Many Requests/i.test(msg)) return { retryable: true, type: 'rate_limit', status: 429 } as const;
  if (/500|Server error/i.test(msg)) return { retryable: true, type: 'server', status: 500 } as const;
  if (/401|Unauthorized/i.test(msg)) return { retryable: false, type: 'auth', status: 401 } as const;
  if (/Failed to fetch|Network|ECONN|ENET|EAI_AGAIN/i.test(msg) || (err as any)?.name === 'AbortError') {
    const base = { retryable: true, type: 'network' as const };
    return typeof status === 'number' ? { ...base, status } : base;
  }
  const base = { retryable: false, type: 'unknown' as const };
  return typeof status === 'number' ? { ...base, status } : base;
}

export function selectFallbackModel(current: string, provider: ProviderId): string | null {
  const choices = aiModels.filter(m => (provider === 'auto' ? m.provider === 'openai' : m.provider === provider));
  const alt = choices.find(m => m.id !== current) || choices[0];
  return alt ? alt.id : null;
}
