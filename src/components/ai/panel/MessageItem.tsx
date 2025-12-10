import React, { useEffect, useMemo, useRef } from 'react';
import type { UiMessage } from './types';
import { Bubble, Row } from './styles';
import ErrorBanner from './ErrorBanner';
import Markdown from './Markdown';

const dotsKeyframes = `@keyframes typingDots { 0% { opacity: .2; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-1px) } 100% { opacity: .2; transform: translateY(0) } }`;

const typingStyles = `${`.typing-dot{animation: typingDots 1s infinite ease-in-out}`}${dotsKeyframes}`;
const TypingDots: React.FC = () => (
  <span aria-label="Assistant is typing" style={{ display: 'inline-flex', gap: 4, opacity: 0.9 }}>
    <style>{typingStyles}</style>
    <span className="typing-dot" style={{ animationDelay: '0ms' }}>•</span>
    <span className="typing-dot" style={{ animationDelay: '120ms' }}>•</span>
    <span className="typing-dot" style={{ animationDelay: '240ms' }}>•</span>
  </span>
);

export type MessageItemProps = {
  index: number;
  message: UiMessage;
  style: React.CSSProperties;
  onMeasured: (h: number) => void;
};

const MessageItemComp: React.FC<MessageItemProps> = ({ index: _index, message, style, onMeasured }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const measure = () => onMeasured(el.getBoundingClientRect().height || 0);
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    measure();

    return () => ro.disconnect();
  }, [onMeasured]);






  const prevSigRef = useRef<string>('');
  useEffect(() => {
    const sig = `${message.role}|${message.isStreaming?'1':'0'}|${message.error?'e':''}|${message.content?.length||0}`;
    if (sig !== prevSigRef.current) {
      prevSigRef.current = sig;
      const el = ref.current; if (el) {

        requestAnimationFrame(() => {
          onMeasured(el.getBoundingClientRect().height || 0);
        });
      }
    }
  }, [message.role, message.isStreaming, message.error, message.content, onMeasured]);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const ariaLabel = useMemo(() => (isUser ? 'User message' : 'Assistant message'), [isUser]);

  const content = message.content;
  const md = useMemo(() => (isAssistant ? <Markdown text={content || ''} /> : content), [isAssistant, content]);

  return (
    <div
      ref={ref}
      style={style}
      role="article"
      aria-label={ariaLabel}
      aria-live={isAssistant ? 'polite' : undefined}
      className={isAssistant ? 'message--assistant' : isUser ? 'message--user' : undefined}
    >
      <Row $align={isUser ? 'end' : 'start'}>
        <Bubble $variant={isUser ? 'user' : 'assistant'} className={`chat-message__bubble ai-bubble ${isAssistant ? 'assistant' : 'user'}`}>
          {isAssistant ? (content ? md : message.isStreaming ? <TypingDots /> : null) : (content || null)}
          {Boolean(message.error) && (
            <div style={{ marginTop: 6 }}>
              <ErrorBanner err={{ userMessage: String(message.error) }} />
              {}
              {}
            </div>
          )}
        </Bubble>
      </Row>
    </div>
  );
};

const MessageItem = React.memo(MessageItemComp, (prev, next) => {
  const pStyle = prev.style as React.CSSProperties;
  const nStyle = next.style as React.CSSProperties;
  const sameStyle = pStyle?.top === nStyle?.top && pStyle?.height === nStyle?.height;
  return (
    sameStyle &&
    prev.message.content === next.message.content &&
    prev.message.isStreaming === next.message.isStreaming &&
    prev.message.error === next.message.error &&
    prev.message.role === next.message.role
  );
});

export default MessageItem;
