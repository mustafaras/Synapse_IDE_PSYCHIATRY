import React, { useEffect, useRef } from 'react';
import { Check, Copy, Rocket } from 'lucide-react';
import type { TerminalCommand } from '../types/shellTypes';

interface TerminalOutputProps {
  commands: TerminalCommand[];
  className?: string;
  autoScroll?: boolean;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  commands,
  className = '',
  autoScroll = true,
}) => {
  const outputRef = useRef<HTMLDivElement>(null);
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);


  useEffect(() => {
    if (autoScroll && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [commands, autoScroll]);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderCommandLine = (cmd: TerminalCommand, index: number) => {
    const commandText = `${cmd.command}${cmd.args.length > 0 ? ` ${  cmd.args.join(' ')}` : ''}`;

    return (
      <div key={index} style={{ marginBottom: '12px' }}>
        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px',
            fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
            fontSize: '13px',
          }}
        >
          {}
          <span
            style={{
              color: '#A0A0A0',
              fontSize: '11px',
              minWidth: '60px',
              opacity: 0.7,
            }}
          >
            {formatTimestamp(cmd.timestamp)}
          </span>

          {}
          <span
            style={{
              color: '#00A6D7',
              fontWeight: '600',
            }}
          >
            $
          </span>

          <span
            style={{
              color: '#E0E0E0',
              flex: 1,
            }}
          >
            {commandText}
          </span>

          {}
          <button
            onClick={() => handleCopy(commandText, index)}
            style={{
              background: 'transparent',
              border: 'none',
              color: copiedIndex === index ? '#2ECC71' : '#A0A0A0',
              cursor: 'pointer',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.6,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.background = 'rgba(194, 167, 110, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '0.6';
              e.currentTarget.style.background = 'transparent';
            }}
            title="Copy command"
          >
            {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {}
        {cmd.output ? <div
            style={{
              color: '#E0E0E0',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
              fontSize: '12px',
              lineHeight: '1.4',
              marginLeft: '76px',
              marginBottom: '8px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {cmd.output}
          </div> : null}

        {}
        {cmd.error ? <div
            style={{
              color: '#E74C3C',
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
              fontSize: '12px',
              lineHeight: '1.4',
              marginLeft: '76px',
              marginBottom: '8px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #FFFFFF10',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '4px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              ⚠️ Error
              {cmd.exitCode !== undefined && (
                <span style={{ opacity: 0.7 }}>(Exit Code: {cmd.exitCode})</span>
              )}
            </div>
            {cmd.error}
          </div> : null}

        {}
        {cmd.exitCode === 0 && !cmd.error && cmd.output ? <div
            style={{
              marginLeft: '76px',
              fontSize: '11px',
              color: '#2ECC71',
              opacity: 0.7,
              fontStyle: 'italic',
            }}
          >
            ✓ Command completed successfully
          </div> : null}
      </div>
    );
  };

  return (
    <div
      ref={outputRef}
      className={className}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
        fontSize: '13px',
        lineHeight: '1.4',
        background: '#121212',

        scrollbarWidth: 'thin',
  scrollbarColor: '#00A6D7 transparent',
      }}
    >
      {commands.length === 0 ? (
        <div
          style={{
            color: '#A0A0A0',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '0px 20px',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '100px',
            maxHeight: 'calc(100vh - 150px)',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              marginBottom: '6px',
              opacity: 0.6,
              color: '#00A6D7',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Rocket size={18} /> {}
          </div>
          <div
            style={{
              marginBottom: '4px',
              lineHeight: '1.3',
            }}
          >
            Terminal ready. Type a command to get started.
          </div>
          <div
            style={{
              fontSize: '10px',
              marginTop: '2px',
              opacity: 0.8,
              lineHeight: '1.2',
            }}
          >
            Try: <span style={{ color: '#00A6D7' }}>help</span>,{' '}
            <span style={{ color: '#00A6D7' }}>ls</span>, or{' '}
            <span style={{ color: '#00A6D7' }}>dir</span>
          </div>
        </div>
      ) : (
        commands.map((cmd, index) => renderCommandLine(cmd, index))
      )}

      {}
      <div style={{ height: '1px' }} />
    </div>
  );
};
