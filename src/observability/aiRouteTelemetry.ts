import { emit as telemetryEmit } from '@/components/ai/telemetry/events';
import { showToast } from '@/ui/toast/api';


let pending: { prev: { provider: string; model: string }; curr: { provider: string; model: string } } | null = null;
let timer: number | null = null;
const DEBOUNCE_MS = 300;

export function emitAiRouteChanged(previous: { provider: string; model: string }, current: { provider: string; model: string }) {
  pending = { prev: previous, curr: current };
  if (timer) { clearTimeout(timer); }
  timer = window.setTimeout(() => {
    if (!pending) return;
    const { prev, curr } = pending;
    telemetryEmit({ type: 'ai_route_changed', previous: prev, current: curr } as any);
    try {
      const label = `${friendlyProvider(curr.provider)} • ${curr.model}`;
      showToast({ kind: 'info', message: `AI route: ${label}`, contextKey: 'ai:route-change' });
    } catch {}
    pending = null; timer = null;
  }, DEBOUNCE_MS);
}

function friendlyProvider(p: string): string {
  if (p === 'google' || p === 'gemini') return 'Gemini';
  if (p === 'openai') return 'OpenAI';
  if (p === 'anthropic') return 'Anthropic';
  if (p === 'ollama') return 'Ollama';
  return p;
}
