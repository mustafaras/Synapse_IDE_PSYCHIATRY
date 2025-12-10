import { CONFIG } from '@/config/env';


let tracer: any = { startSpan: (_name: string) => ({ setAttribute() {}, end() {} }) };
let meter: any = { createCounter: () => ({ add() {} }), createHistogram: () => ({ record() {} }) };

export function initOtelOnce() {
  if (!CONFIG.flags.enableTracing && !CONFIG.flags.enableMetrics) return;
  if ((window as any).__otel_inited) return; (window as any).__otel_inited = true;
  try {

    tracer = (window as any).otelTracer ?? tracer;
    meter = (window as any).otelMeter ?? meter;

    const setup = (window as any).__otel_setup;
    if (typeof setup === 'function') {
      const res = setup(CONFIG);
      if (res?.tracer) tracer = res.tracer;
      if (res?.meter) meter = res.meter;
    }
  } catch {

  }
}

export function getTracer() { return tracer; }
export function getMeter() { return meter; }


export const METRICS = {
  reqLatencyMs: meter.createHistogram?.('req_latency_ms') ?? { record() {} },
  promptTok: meter.createCounter?.('tokens_prompt') ?? { add() {} },
  complTok: meter.createCounter?.('tokens_completion') ?? { add() {} },
  costUsd: meter.createCounter?.('cost_usd') ?? { add() {} },
  errors: meter.createCounter?.('errors_total') ?? { add() {} },
  rlHits: meter.createCounter?.('rate_limit_hits') ?? { add() {} },
  cacheHits: meter.createCounter?.('cache_hits') ?? { add() {} },
};
