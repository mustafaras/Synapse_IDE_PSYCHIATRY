export type ProviderId = 'openai' | 'anthropic' | 'google' | 'ollama' | 'proxy';

export interface RatePolicy {
  rpm?: number;
  tpm?: number;
  burst?: number;
}

export type JobPriority = 'user' | 'test' | 'background';

export interface ScheduleJob {
  id: string;
  provider: ProviderId;
  estTokens?: number;
  priority: JobPriority;
  exec: (signal: AbortSignal) => Promise<any>;
  onSuccess?: (res: any) => void;
  onError?: (err: unknown) => void;
}
