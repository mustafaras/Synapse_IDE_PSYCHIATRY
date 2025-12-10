import type { ChatContext, ChatEvent, ChatState } from './chat-fsm.types';

export type ChatFSM = { state: ChatState; ctx: ChatContext };

export function initialChatFSM(): ChatFSM {
  return { state: 'idle', ctx: { requestId: null, lastActivityAt: null, pendingText: null } };
}

export function chatReducer(fsm: ChatFSM, ev: ChatEvent): ChatFSM {
  const now = Date.now();
  switch (fsm.state) {
    case 'idle': {
      if (ev.type === 'SEND') {
        return {
          state: 'sending',
          ctx: { requestId: null, lastActivityAt: now, pendingText: ev.text.trim() },
        };
      }
      return fsm;
    }
    case 'sending': {
      if (ev.type === 'OPEN') {
        return { state: 'streaming', ctx: { ...fsm.ctx, requestId: ev.requestId, lastActivityAt: now } };
      }
      if (ev.type === 'ERROR' || ev.type === 'ABORT') {
        return { state: 'idle', ctx: { requestId: null, lastActivityAt: now, pendingText: null } };
      }
      return fsm;
    }
    case 'streaming': {
      if (ev.type === 'DELTA') {
        if (fsm.ctx.requestId !== ev.requestId) return fsm;
        return { state: 'streaming', ctx: { ...fsm.ctx, lastActivityAt: now } };
      }
      if (ev.type === 'DONE') {
        if (fsm.ctx.requestId !== ev.requestId) return fsm;
        return { state: 'idle', ctx: { requestId: null, lastActivityAt: now, pendingText: null } };
      }
      if (ev.type === 'ABORT' || ev.type === 'ERROR') {
        return { state: 'idle', ctx: { requestId: null, lastActivityAt: now, pendingText: null } };
      }
      return fsm;
    }
  }
}
