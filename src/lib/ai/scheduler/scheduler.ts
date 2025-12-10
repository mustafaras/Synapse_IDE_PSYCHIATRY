import type { JobPriority, ProviderId, RatePolicy, ScheduleJob } from './scheduler.types';
import { logEvent } from '@/utils/telemetry';


type Bucket = {
  rpm: number; tpm: number; burst: number;
  reqTokens: number; tokTokens: number;
  lastRefill: number;
  status: 'idle' | 'limited_rpm' | 'limited_tpm' | 'backoff';
  backoffMs?: number;
};

const DEFAULTS: Record<ProviderId, RatePolicy> = {
  openai: { rpm: 60, tpm: 60_000, burst: 5 },
  anthropic: { rpm: 60, tpm: 60_000, burst: 5 },
  google: { rpm: 60, tpm: 120_000, burst: 5 },
  ollama: { rpm: 120, tpm: 200_000, burst: 8 },
  proxy: { rpm: 60, tpm: 60_000, burst: 5 },
};

class SchedulerEngine {
  private buckets = new Map<ProviderId, Bucket>();
  private q: ScheduleJob[] = [];
  private running = new Set<string>();
  private policy: Partial<Record<ProviderId, RatePolicy>> = {};
  private timer: number | null = null;

  setPolicy(provider: ProviderId, p: RatePolicy) { this.policy[provider] = p; }
  getPolicy(provider: ProviderId): RatePolicy { return this.policy[provider] || DEFAULTS[provider]; }

  private getBucket(provider: ProviderId): Bucket {
    const now = Date.now();
    let b = this.buckets.get(provider);
    if (!b) {
      const p = this.getPolicy(provider);
      b = { rpm: p.rpm ?? 60, tpm: p.tpm ?? 60_000, burst: p.burst ?? 5, reqTokens: p.burst ?? 5, tokTokens: p.tpm ?? 60_000, lastRefill: now, status: 'idle' };
      this.buckets.set(provider, b);
    }

    const dt = (now - b.lastRefill) / 1000;
    if (dt > 0) {
      const reqPerSec = (b.rpm / 60);
      const tokPerSec = (b.tpm / 60);
      b.reqTokens = Math.min(b.burst, b.reqTokens + reqPerSec * dt);
      b.tokTokens = Math.min(b.tpm, b.tokTokens + tokPerSec * dt);
      b.lastRefill = now;
    }
    return b;
  }

  enqueue(job: ScheduleJob) {
    this.q.push(job);

    const priorityOrder: Record<JobPriority, number> = { user: 0, test: 1, background: 2 };
    this.q.sort((a,b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    logEvent('scheduler_enqueue', { provider: job.provider, priority: job.priority });
    this.tick();
  }

  snapshot(provider: ProviderId) {
    const b = this.getBucket(provider);
    return { status: b.status, backoffMs: b.backoffMs ?? 0 } as const;
  }

  private scheduleNextTick(ms: number) {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => this.tick(), ms);
  }

  private tick() {
    let ranOne = false;
    for (let i = 0; i < this.q.length; i++) {
      const job = this.q[i];
      if (this.running.has(job.id)) continue;
      const b = this.getBucket(job.provider);

      if (b.reqTokens < 1) { b.status = 'limited_rpm'; b.backoffMs = Math.ceil((1 - b.reqTokens) * 1000); continue; }

      const need = Math.max(100, job.estTokens ?? 1000);
      if (b.tokTokens < need) { b.status = 'limited_tpm'; b.backoffMs = Math.ceil(((need - b.tokTokens) / (b.tpm/60)) * 1000); continue; }

      b.reqTokens -= 1;
      b.tokTokens -= need;
  b.status = 'idle'; delete b.backoffMs;
      const controller = new AbortController();
      this.running.add(job.id);
      const remove = () => { this.running.delete(job.id); };
      job.exec(controller.signal)
        .then((res) => { job.onSuccess?.(res); })
        .catch((err) => {

          const msg = String((err as any)?.message || '');
          const code = (err as any)?.code ?? (/(\b\d{3}\b)/.exec(msg)?.[1]);
          if (code === '429' || /429|Too Many/i.test(msg) || /5\d\d/.test(String(code))) {
            const attempt = Math.floor(Math.random()*3);
            const next = Math.min(30_000, Math.floor(500 * Math.pow(2, attempt)) + Math.floor(Math.random()*200));
            b.status = 'backoff'; b.backoffMs = next;
            this.scheduleNextTick(next);
          }
          job.onError?.(err);
        })
        .finally(() => { remove(); this.tick(); });
      this.q.splice(i, 1); i--; ranOne = true;
    }
    if (!ranOne && this.q.length) {

      let minMs = 500;
      for (const j of this.q) {
        const b = this.getBucket(j.provider);
        minMs = Math.min(minMs, b.backoffMs ?? 500);
      }
      this.scheduleNextTick(minMs);
    }
  }
}

export const Scheduler = new SchedulerEngine();
