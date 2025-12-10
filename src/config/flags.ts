

type EnvGetter = (k: string, fallback?: string) => any;
const env: EnvGetter = (k, fallback) => (import.meta as any)?.env?.[k] ?? fallback;


function getClientId(): string {
  try {
    const k = "CONSULTON_CLIENT_ID";
    let v: string = localStorage.getItem(k) || "";
    if (!v) {
      v = (crypto as any)?.randomUUID?.() || String(Math.random()).slice(2);
      localStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}


function bucketOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 100;
}

const CANARY_ENV = (env("VITE_CONSULTON_CANARY_ENV", "staging") as any) as "staging" | "prod";
const CANARY_PCT = Math.max(0, Math.min(100, Number(env("VITE_CONSULTON_CANARY_PERCENT", "10"))));
const DISABLE_ALL = env("VITE_CONSULTON_DISABLE", "0") === "1";

export const flags = {
  aiTrace: Boolean(

    (import.meta as any)?.env?.VITE_AI_TRACE ||
      (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('trace') === '1') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('synapse.flags.aiTrace') === '1')
  ),

  e2e: (() => {
    try {


      const env = (import.meta as any)?.env?.VITE_E2E;
      if (env === '1' || env === true) return true;
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search).get('e2e');
        if (qs === '1') return true;
      }
    } catch {}
    return false;
  })(),
  a11yEnabled: (() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem('synapse.flags.a11y');
        if (v === '0') return false;
        if (v === '1') return true;
      }
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search).get('a11y');
        if (qs === '0') return false;
        if (qs === '1') return true;
      }
    } catch {}
    return false;
  })(),

  simpleStream: (() => {
    try {
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search).get('simpleStream');
        if (qs === '1' || qs === 'true') return true;
        if (qs === '0' || qs === 'false') return false;
      }
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem('synapse.flags.simpleStream');
        if (v === '1' || v === 'true') return true;
        if (v === '0' || v === 'false') return false;
      }
      const env = (import.meta as any)?.env?.VITE_SIMPLE_STREAM;
      if (env === '1' || env === 'true') return true;
    } catch {}
    return true;
  })(),

  synapseCoreAI: (() => {
    try {

      if (typeof window !== 'undefined') {
        const winAny = window as any;
        if (winAny.flags && typeof winAny.flags.synapseCoreAI === 'boolean') {
          return !!winAny.flags.synapseCoreAI;
        }
        const qs = new URLSearchParams(window.location.search).get('synapseCoreAI');
        if (qs === '1' || qs === 'true') return true;
        if (qs === '0' || qs === 'false') return false;
      }

      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem('synapse.flags.synapseCoreAI');
        if (v === '1' || v === 'true') return true;
        if (v === '0' || v === 'false') return false;
      }

      const env = (import.meta as any)?.env?.VITE_SYN_CORE_AI;
      if (env === '1' || env === 'true') return true;
  } catch {}
  return true;
  })(),

  consultonAI: (() => {
    try {
      if (typeof window !== 'undefined') {
        const qs = new URLSearchParams(window.location.search).get('consultonAI');
        if (qs === '1' || qs === 'true') return true;
        if (qs === '0' || qs === 'false') return false;
      }
      if (typeof localStorage !== 'undefined') {
        const v = localStorage.getItem('synapse.flags.consultonAI');
        if (v === '1' || v === 'true') return true;
        if (v === '0' || v === 'false') return false;
      }
      const v1 = (import.meta as any)?.env?.VITE_CONSULTON_AI;
      const v2 = (import.meta as any)?.env?.VITE_FEATURE_CONSULTON_AI;
      const val = v1 ?? v2;
      if (val === '1' || val === 'true') return true;
      if (val === '0' || val === 'false') return false;
    } catch {}
    return true;
  })(),

  consultonAICanary: (() => {
    try {
      const v = env('VITE_CONSULTON_CANARY', '1');
      return v === '1' || v === 'true';
    } catch { return true; }
  })(),
  consultonAICanaryPercent: CANARY_PCT,
  consultonAICanaryAllowList: (() => {
    try {
      const raw = env('VITE_CONSULTON_CANARY_ALLOWLIST', '') || '';
      return String(raw).split(',').map(s => s.trim()).filter(Boolean);
    } catch { return [] as string[]; }
  })(),
  consultonAIDisableAll: DISABLE_ALL,
} as const;

export type Flags = typeof flags;


export function isConsultonEnabled(): boolean {

  try {
    const mode = (import.meta as any)?.env?.MODE || (import.meta as any)?.env?.NODE_ENV;
    // Enable unconditionally in development and tests to bypass canary gating
    if (mode === 'test' || mode === 'development') return true;
  } catch {}

  if (flags.consultonAIDisableAll) return false;

  if (!flags.consultonAI) return false;

  const override = getConsultonCanaryOverride();
  if (override === 'on') return true;
  if (override === 'off') return false;

  if (!flags.consultonAICanary) return true;
  const id = getClientId();
  if (flags.consultonAICanaryAllowList.includes(id)) return true;
  const bucket = bucketOf(id);

  const pct = CANARY_ENV === 'staging' ? flags.consultonAICanaryPercent : 0;
  return bucket < pct;
}


export function consultonRolloutInfo() {
  const id = getClientId();
  return {
    env: CANARY_ENV,
    pct: flags.consultonAICanaryPercent,
    kill: flags.consultonAIDisableAll,
    clientBucket: bucketOf(id),
    clientId: id,
  } as const;
}


type CanaryOverride = 'on' | 'off' | null;
const OVERRIDE_KEY = 'synapse.flags.consultonCanaryOverride';

export function getConsultonCanaryOverride(): CanaryOverride {
  try {

    if (typeof window !== 'undefined') {
      const w: any = window as any;
      if (w.flags && typeof w.flags.consultonCanary === 'boolean') {
        return w.flags.consultonCanary ? 'on' : 'off';
      }
      const qs = new URLSearchParams(window.location.search).get('canary');
      if (qs === 'on' || qs === 'off') return qs;
    }

    if (typeof localStorage !== 'undefined') {
      const v = localStorage.getItem(OVERRIDE_KEY);
      if (v === 'on' || v === 'off') return v;
    }
  } catch {}
  return null;
}

export function setConsultonCanaryOverride(v: CanaryOverride) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (v === null) localStorage.removeItem(OVERRIDE_KEY);
      else localStorage.setItem(OVERRIDE_KEY, v);
    }

    if (typeof window !== 'undefined') {
      try { window.dispatchEvent(new CustomEvent('consult:canary:change')); } catch {}
    }
  } catch {}
}
