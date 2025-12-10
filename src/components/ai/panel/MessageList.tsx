import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { EmptyState, JumpToLatestButton, ScrollArea } from './styles';
import MessageItem from './MessageItem';
import type { UiMessage } from './types';

type Props = { messages: UiMessage[] };

const SIMPLE_AUTO_BOTTOM_THRESHOLD = 32;

const MessageList: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<string | null>(null);
  const atBottomRef = useRef(true);


  useEffect(() => {
    const el = scrollRef.current; if (!el) return undefined;
    const onScroll = () => {
      const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
      atBottomRef.current = dist <= SIMPLE_AUTO_BOTTOM_THRESHOLD;
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); };
  }, []);


  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    const last = messages[messages.length - 1];
    if (!last) return;
    const idSig = `${last.id}:${last.content?.length || 0}:${last.isStreaming?'1':'0'}`;

    if (atBottomRef.current || lastRef.current === idSig) {

      requestAnimationFrame(() => { el.scrollTop = el.scrollHeight - el.clientHeight; });
    }
    lastRef.current = idSig;
  }, [messages]);

  const count = messages.length;

  const handleMeasured = useCallback(() => {  }, []);
  const handleJump = useCallback(() => {
    const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight - el.clientHeight;
  }, []);

  const rendered = useMemo(() => (
    messages.map((m, i) => (
      <MessageItem
        key={m.id}
        index={i}
        message={m}
        style={{ position: 'relative' }}
        onMeasured={handleMeasured}
      />
    ))
  ), [messages, handleMeasured]);
  return (
    <ScrollArea
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      aria-label="Chat messages"
      style={{ position:'relative' }}
    >
      {count === 0 ? (
        <EmptyState>No messages yet. Ask something to get started.</EmptyState>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {rendered}
        </div>
      )}
      {!atBottomRef.current && count > 0 && (
        <JumpToLatestButton
          onClick={handleJump}
          aria-label="Jump to latest messages"
          title="Jump to latest"
        >
          ↓
        </JumpToLatestButton>
      )}
    </ScrollArea>
  );
};

export default MessageList;
