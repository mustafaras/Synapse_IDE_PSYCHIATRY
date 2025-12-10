

import type { FC } from 'react';
// NeuralGlassCard not required here
import { Loader2 } from 'lucide-react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'skeleton' | 'overlay';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
`;

const LoadingContainer = styled.div<{ fullScreen?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;

  ${props =>
    props.fullScreen &&
    `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--assistant-bg);
    backdrop-filter: var(--glass-backdrop-filter);
    z-index: 10080;
  `}
`;

const SpinnerWrapper = styled.div<{ size: 'sm' | 'md' | 'lg' }>`
  animation: ${spin} 1s linear infinite;
  color: var(--assistant-primary);
  filter: drop-shadow(var(--assistant-shadow-hover));
  transition: all var(--duration-normal) var(--easing-bauhaus);


  &[data-theme='dark'] {
    filter: drop-shadow(var(--assistant-shadow-hover)) brightness(1.2);
  }

  &[data-theme='light'] {
    filter: drop-shadow(var(--assistant-shadow-hover)) contrast(1.1);
  }

  &[data-theme='neutral'] {
    filter: drop-shadow(var(--assistant-shadow-hover)) saturate(0.9) brightness(1.05);
  }


  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(var(--assistant-glow)) brightness(1.1);
  }

  ${props => {
    switch (props.size) {
      case 'sm':
        return 'width: 1rem; height: 1rem;';
      case 'lg':
        return 'width: 3rem; height: 3rem;';
      default:
        return 'width: 2rem; height: 2rem;';
    }
  }}
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const Dot = styled.div<{ delay: number }>`
  width: 0.5rem;
  height: 0.5rem;
  background: var(--assistant-primary);
  border-radius: 50%;
  animation: ${pulse} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  box-shadow: var(--assistant-shadow-hover);
`;

const SkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 400px;
`;

const SkeletonLine = styled.div<{ width?: string }>`
  height: 1rem;
  background: linear-gradient(
    90deg,
    var(--assistant-bg) 25%,
    var(--theme-glass) 50%,
    var(--assistant-bg) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--border-radius-sm);
  animation: shimmer 1.5s infinite;
  width: ${props => props.width || '100%'};
  box-shadow: var(--assistant-shadow-hover);

  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
`;

const LoadingMessage = styled.p<{ size: 'sm' | 'md' | 'lg' }>`
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
  background: var(--assistant-bg);
  backdrop-filter: var(--glass-backdrop-filter);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--glass-border);
  box-shadow: var(--assistant-shadow-hover);

  ${props => {
    switch (props.size) {
      case 'sm':
        return 'font-size: var(--font-size-sm);';
      case 'lg':
        return 'font-size: var(--font-size-lg);';
      default:
        return 'font-size: var(--font-size-md);';
    }
  }}
`;

const Spinner: FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  return <ThemedSpinner size={size} />;
};

const Dots: FC = () => (
  <DotsContainer>
    <Dot delay={0} />
    <Dot delay={0.2} />
    <Dot delay={0.4} />
  </DotsContainer>
);

const Skeleton: FC = () => (
  <SkeletonContainer>
    <SkeletonLine />
    <SkeletonLine width="80%" />
    <SkeletonLine width="60%" />
  </SkeletonContainer>
);

export const Loading: FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullScreen = false,
  className,
}) => {
  const renderLoadingContent = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'skeleton':
        return <Skeleton />;
      case 'overlay':
        return <ThemeAwareOverlay size={size} {...(message && { message })} />;
      default:
        return <Spinner size={size} />;
    }
  };

  const content = (
    <LoadingContainer fullScreen={fullScreen} className={className}>
      {renderLoadingContent()}
      {message && variant !== 'overlay' && variant !== 'skeleton' ? <LoadingMessage size={size}>{message}</LoadingMessage> : null}
    </LoadingContainer>
  );

  if (fullScreen) {
    return content;
  }

  return content;
};


export const PageLoading: FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Loading variant="overlay" size="lg" message={message} fullScreen />
);

export const InlineLoading: FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message,
  size = 'sm',
}) => <Loading variant="spinner" size={size} {...(message && { message })} />;

export const SkeletonLoading: FC = () => <Loading variant="skeleton" />;

export default Loading;


const ThemedSpinner: FC<{ size: 'sm' | 'md' | 'lg' }> = ({ size }) => {
  const { themeName } = useTheme();
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 48 : 32;

  return (
    <SpinnerWrapper size={size} data-theme={themeName}>
      <Loader2 size={iconSize} />
    </SpinnerWrapper>
  );
};


const ThemeAwareOverlay: FC<{ size: 'sm' | 'md' | 'lg'; message?: string }> = ({
  size,
  message,
}) => {
  const { themeName } = useTheme();

  return (
    <div
      data-theme={themeName}
      style={{
        background: 'var(--assistant-bg)',
        backdropFilter: 'var(--glass-backdrop-filter)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'var(--assistant-shadow-hover)',
        padding: '1rem',
      }}
    >
      <ThemedSpinner size={size} />
      {message ? <LoadingMessage size={size}>{message}</LoadingMessage> : null}
    </div>
  );
};
