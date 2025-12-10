import React, { useState } from 'react';
import { Bot, Maximize2, Minimize2, MoreHorizontal, Sparkles, X } from 'lucide-react';
interface AIAssistantHeaderProps {
  isExpanded?: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onToggleExpand?: () => void;
  title?: string;
  subtitle?: string;
}

export const AIAssistantHeader: React.FC<AIAssistantHeaderProps> = ({
  isExpanded = false,
  onClose,
  onMinimize,
  onToggleExpand,
  title = 'AI Assistant',
  subtitle = 'Your coding companion',
}) => {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const HeaderButton: React.FC<{
    id: string;
    icon: React.ReactNode;
    onClick: () => void;
    tooltip: string;
    variant?: 'default' | 'danger';
  }> = ({ id, icon, onClick, tooltip, variant = 'default' }) => {
    const isHovered = hoveredButton === id;
    const isDanger = variant === 'danger';

    return (
      <div style={{ position: 'relative' }}>
        <button
          onMouseEnter={() => setHoveredButton(id)}
          onMouseLeave={() => setHoveredButton(null)}
          onFocus={() => setHoveredButton(id)}
          onBlur={() => setHoveredButton(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: isHovered
              ? isDanger
                ? 'var(--color-error-background)'
                : 'var(--assistant-hover-bg)'
              : 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: isHovered
              ? isDanger
                ? 'var(--color-error)'
                : 'var(--assistant-text-primary)'
              : 'var(--assistant-text-secondary)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: isHovered ? 'blur(10px) saturate(150%)' : 'none',
            WebkitBackdropFilter: isHovered ? 'blur(10px) saturate(150%)' : 'none',
            transform:
              isHovered && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                ? 'scale(1.05)'
                : 'scale(1)',
            outline: 'none',
          }}
          onClick={onClick}
          aria-label={tooltip}
          tabIndex={0}
        >
          <div
            style={{
              transition: 'transform 0.2s ease',
              transform:
                isHovered && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'scale(1.1)'
                  : 'scale(1)',
            }}
          >
            {icon}
          </div>
        </button>

        {}
        {isHovered ? <div
            style={{
              position: 'absolute',
              bottom: '-36px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--assistant-bg)',
              border: '1px solid var(--assistant-border)',
              borderRadius: '6px',
              padding: '0.375rem 0.5rem',
              fontSize: '0.75rem',
              fontWeight: '500',
              color: 'var(--assistant-text-primary)',
              whiteSpace: 'nowrap',
              zIndex: 100,
              backdropFilter: 'blur(20px) saturate(200%)',
              WebkitBackdropFilter: 'blur(20px) saturate(200%)',
              boxShadow: 'var(--assistant-glow)',
              animation: 'fadeInUp 0.2s ease',
              pointerEvents: 'none',
            }}
          >
            {tooltip}

            {}
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderBottom: '5px solid var(--assistant-border)',
              }}
            />
          </div> : null}
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          position: 'sticky',
          top: 0,
          background: 'var(--assistant-bg)',
          border: '1px solid var(--assistant-border)',
          borderBottom: '1px solid var(--assistant-border)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '0.75rem 1rem',
          backdropFilter: 'var(--assistant-blur) var(--assistant-saturation)',
          WebkitBackdropFilter: 'var(--assistant-blur) var(--assistant-saturation)',
          boxShadow: 'var(--assistant-shadow)',
          zIndex: 10,
        }}
      >
        {}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            {}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'var(--assistant-gradient)',
                padding: '0.5rem',
                overflow: 'hidden',
              }}
            >
              {}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'var(--assistant-gradient)',
                  opacity: 0.8,
                  borderRadius: '12px',
                }}
              />

              {}
              <Bot
                size={20}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  color: '#ffffff',
                  filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                }}
              />

              {}
              <Sparkles
                size={12}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  color: '#ffffff',
                  opacity: 0.7,
                  animation: 'sparkle 2s ease-in-out infinite alternate',
                }}
              />
            </div>

            {}
            <div>
              <h2
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: 'var(--assistant-text-primary)',
                  lineHeight: '1.2',
                  margin: 0,

                  textShadow: 'none',
                  boxShadow: 'none',
                }}
              >
                {title}
              </h2>
              {subtitle ? <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '400',
                    color: 'var(--assistant-text-secondary)',
                    lineHeight: '1.2',
                    opacity: 0.8,
                  }}
                >
                  {subtitle}
                </div> : null}
            </div>
          </div>

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {}
            {onToggleExpand ? <HeaderButton
                id="expand"
                icon={isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                onClick={onToggleExpand}
                tooltip={isExpanded ? 'Minimize' : 'Maximize'}
              /> : null}

            {}
            {onMinimize ? <HeaderButton
                id="minimize"
                icon={<MoreHorizontal size={16} />}
                onClick={onMinimize}
                tooltip="Minimize"
              /> : null}

            {}
            <div
              style={{
                width: '1px',
                height: '24px',
                background: 'var(--assistant-border)',
                margin: '0 0.25rem',
                opacity: 0.5,
              }}
            />

            {}
            <HeaderButton
              id="close"
              icon={<X size={16} />}
              onClick={onClose}
              tooltip="Close AI Assistant"
              variant="danger"
            />
          </div>
        </div>
      </div>

      {}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }

          @keyframes sparkle {
            0% {
              opacity: 0.4;
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.1) rotate(180deg);
            }
            100% {
              opacity: 0.6;
              transform: scale(0.9) rotate(360deg);
            }
          }

          @keyframes headerGlow {
            0%, 100% {
              box-shadow: var(--assistant-shadow);
            }
            50% {
              box-shadow: var(--assistant-glow), var(--assistant-shadow);
            }
          }


          @media (prefers-reduced-motion: reduce) {
            * {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>
    </>
  );
};
