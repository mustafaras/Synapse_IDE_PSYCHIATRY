export interface EnvHints {
  openaiKey?: 'present' | undefined;
  anthropicKey?: 'present' | undefined;
  googleKey?: 'present' | undefined;
  proxyUrl?: string | undefined;
}

export function detectEnv(): EnvHints {
  const out: EnvHints = {};
  try {
    const v: any = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) || {};
    const w: any = (typeof window !== 'undefined' ? (window as any).__ENV__ : undefined) || {};
    const p: any = (typeof process !== 'undefined' ? (process as any).env : undefined) || {};
    const openai = v.VITE_OPENAI_API_KEY || w.OPENAI_API_KEY || p.OPENAI_API_KEY;
    const anthropic = v.VITE_ANTHROPIC_API_KEY || w.ANTHROPIC_API_KEY || p.ANTHROPIC_API_KEY;
    const google = v.VITE_GOOGLE_API_KEY || w.GOOGLE_API_KEY || p.GOOGLE_API_KEY;
    const proxy = v.VITE_AI_PROXY_URL || w.AI_PROXY_URL || p.AI_PROXY_URL;
    if (openai) out.openaiKey = 'present';
    if (anthropic) out.anthropicKey = 'present';
    if (google) out.googleKey = 'present';
    if (proxy) out.proxyUrl = String(proxy);
  } catch {}
  return out;
}
