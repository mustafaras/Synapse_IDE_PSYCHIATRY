export type ChatState = 'idle' | 'sending' | 'streaming';

export type AbortReason =
  | 'new_request'
  | 'idle_timeout'
  | 'hard_deadline'
  | 'user_escape'
  | 'unmount'
  | 'provider_abort';

export type ChatEvent =
  | { type: 'SEND'; text: string; provider: string; model: string }
  | { type: 'OPEN'; requestId: number }
  | { type: 'DELTA'; requestId: number; chunk: string }
  | { type: 'DONE'; requestId: number }
  | { type: 'ABORT'; reason: AbortReason }
  | { type: 'ERROR'; requestId?: number; message: string; code?: string };

export type ChatContext = {
  requestId: number | null;
  lastActivityAt: number | null;
  pendingText: string | null;
};
