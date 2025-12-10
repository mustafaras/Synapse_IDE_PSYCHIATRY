export type Profile = 'dev' | 'staging' | 'prod';

export type AppConfig = {
  profile: Profile;
  flags: {
    debugPanels: boolean;
    allowCache: boolean;
    strictGuardrails: boolean;
    enableTracing: boolean;
    enableMetrics: boolean;
    snapshotIntervalSec: number;
    snapshotTokenStep: number;
  };
  otel: {
    serviceName: string;
    otlpEndpoint?: string;
    samplingRatio: number;
  };
  rl: {
    perUserPerMin: number;
    perSessionConcurrent: number;
    perProviderPerMin: number;
  };
};


const profile = ((typeof import.meta !== 'undefined' ? (import.meta.env as ImportMetaEnv).VITE_PROFILE : undefined) as Profile) ?? 'dev';

export const CONFIG: AppConfig = {
  profile,
  flags: {
    debugPanels: profile !== 'prod',
    allowCache: true,
    strictGuardrails: profile !== 'dev',
    enableTracing: true,
    enableMetrics: true,
    snapshotIntervalSec: 6,
    snapshotTokenStep: 400,
  },
  otel: {
    serviceName: 'ai-assistant-ui',
    otlpEndpoint: (typeof import.meta !== 'undefined' ? (import.meta.env as ImportMetaEnv).VITE_OTLP_HTTP : undefined),
    samplingRatio: profile === 'prod' ? 0.15 : 1.0,
  },
  rl: {
    perUserPerMin: profile === 'prod' ? 40 : 120,
    perSessionConcurrent: 1,
    perProviderPerMin: 60,
  },
};
