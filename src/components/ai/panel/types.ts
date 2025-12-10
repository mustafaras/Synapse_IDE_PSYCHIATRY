import type { ChatMsg } from '@/state/chatPersistence';


export type UiMessage = ChatMsg & {
  isStreaming?: boolean;
  error?: string;
};

export type RouteHint = {
  provider?: string;
  model?: string;
};
