import React, { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';


const glitchLight = keyframes`
  0%, 100% {
    transform: translate(0);
    border-color: rgba(59, 130, 246, 0.2);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.1), 0 0 20px rgba(59, 130, 246, 0.05);
  }
  10% {
    transform: translate(-1px, 0.5px);
    border-color: rgba(59, 130, 246, 0.4);
  }
  20% {
    transform: translate(-0.5px, -0.5px);
    border-color: rgba(96, 165, 250, 0.3);
  }
  30% {
    transform: translate(0.5px, 1px);
    border-color: rgba(139, 92, 246, 0.3);
  }
  40% {
    transform: translate(1px, -0.5px);
    border-color: rgba(59, 130, 246, 0.3);
  }
  50% {
    transform: translate(-0.5px, 0.5px);
    border-color: rgba(96, 165, 250, 0.4);
  }
  60% {
    transform: translate(0.5px, 0.5px);
    border-color: rgba(59, 130, 246, 0.3);
  }
  70% {
    transform: translate(-1px, 0.5px);
    border-color: rgba(139, 92, 246, 0.3);
  }
  80% {
    transform: translate(1px, -1px);
    border-color: rgba(59, 130, 246, 0.4);
  }
  90% {
    transform: translate(0.5px, -0.5px);
    border-color: rgba(96, 165, 250, 0.3);
  }
`;

const glitchDark = keyframes`
  0%, 100% {
    transform: translate(0);
    border-color: rgba(99, 102, 241, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(99, 102, 241, 0.1);
  }
  10% {
    transform: translate(-1px, 0.5px);
    border-color: rgba(99, 102, 241, 0.4);
  }
  20% {
    transform: translate(-0.5px, -0.5px);
    border-color: rgba(139, 92, 246, 0.3);
  }
  30% {
    transform: translate(0.5px, 1px);
    border-color: rgba(168, 85, 247, 0.3);
  }
  40% {
    transform: translate(1px, -0.5px);
    border-color: rgba(99, 102, 241, 0.3);
  }
  50% {
    transform: translate(-0.5px, 0.5px);
    border-color: rgba(139, 92, 246, 0.4);
  }
  60% {
    transform: translate(0.5px, 0.5px);
    border-color: rgba(99, 102, 241, 0.3);
  }
  70% {
    transform: translate(-1px, 0.5px);
    border-color: rgba(168, 85, 247, 0.3);
  }
  80% {
    transform: translate(1px, -1px);
    border-color: rgba(99, 102, 241, 0.4);
  }
  90% {
    transform: translate(0.5px, -0.5px);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const glitchNeutral = keyframes`

  0%, 100% {
    transform: translate(0);
    border-color: rgba(0, 166, 215, 0.25);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 0 20px rgba(0, 166, 215, 0.12);
  }
  10% { transform: translate(-1px, 0.5px); border-color: rgba(0, 166, 215, 0.45); }
  20% { transform: translate(-0.5px, -0.5px); border-color: rgba(0, 166, 215, 0.35); }
  30% { transform: translate(0.5px, 1px); border-color: rgba(0, 166, 215, 0.40); }
  40% { transform: translate(1px, -0.5px); border-color: rgba(0, 166, 215, 0.38); }
  50% { transform: translate(-0.5px, 0.5px); border-color: rgba(0, 166, 215, 0.48); }
  60% { transform: translate(0.5px, 0.5px); border-color: rgba(0, 166, 215, 0.38); }
  70% { transform: translate(-1px, 0.5px); border-color: rgba(0, 166, 215, 0.42); }
  80% { transform: translate(1px, -1px); border-color: rgba(0, 166, 215, 0.50); }
  90% { transform: translate(0.5px, -0.5px); border-color: rgba(0, 166, 215, 0.40); }
`;


interface SimpleTextProps {
  children: string;
  delay?: number;
}

const FadeText = styled(motion.span)`
  display: inline-block;
  font-family:
    'Fira Code', 'JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Source Code Pro',
    Consolas, 'Courier New', monospace;
`;

const SimpleText: React.FC<SimpleTextProps> = ({ children, delay = 0 }) => {
  return (
    <FadeText
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.6,
        delay: delay / 1000,
        ease: 'easeOut',
      }}
    >
      {children}
    </FadeText>
  );
};

interface NeuralGlassCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  cardIndex?: number;
}


const getThemeStyles = (theme: string) => {
  switch (theme) {
    case 'light':
      return {
        iconColor: '#3B82F6',
        iconBackground: 'rgba(59, 130, 246, 0.15)',
        titleColor: '#3B82F6',
        descriptionColor: '#334155',
      };
    case 'dark':
      return {
        iconColor: '#6366f1',
        iconBackground: 'rgba(99, 102, 241, 0.2)',
        titleColor: '#6366f1',
        descriptionColor: '#CBD5E1',
      };
    case 'neutral':
      return {
        iconColor: '#00A6D7',
        iconBackground: 'rgba(0, 166, 215, 0.18)',
        titleColor: '#00A6D7',
        descriptionColor: '#F8FAFC',
      };
    default:
      return {
        iconColor: '#3B82F6',
        iconBackground: 'rgba(59, 130, 246, 0.15)',
        titleColor: '#3B82F6',
        descriptionColor: '#334155',
      };
  }
};


const CardContainer = styled(motion.div)<{ $themeName: string; $isGlitching: boolean }>`
  position: relative;

  background: ${({ $themeName }) => {
    switch ($themeName) {
      case 'light':
        return 'rgba(255, 255, 255, 0.1)';
      case 'dark':
        return 'rgba(0, 0, 0, 0.2)';
      case 'neutral':
        return 'rgba(248, 250, 252, 0.15)';
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  }};


  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 2.5px solid
    ${({ $themeName }) => {
      switch ($themeName) {
        case 'light':
          return 'rgba(59, 130, 246, 0.45)';
        case 'dark':
          return 'rgba(99, 102, 241, 0.55)';
        case 'neutral':
          return 'rgba(0, 166, 215, 0.55)';
        default:
          return 'rgba(59, 130, 246, 0.45)';
      }
    }};


  box-shadow: ${({ $themeName }) => {
    switch ($themeName) {
      case 'light':
        return '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 0 32px 4px rgba(59, 130, 246, 0.18), 0 0 0 4px rgba(59,130,246,0.10)';
      case 'dark':
        return '0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 32px 4px rgba(99, 102, 241, 0.22), 0 0 0 4px rgba(99,102,241,0.13)';
      case 'neutral':
        return '0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 32px 4px rgba(0, 166, 215, 0.22), 0 0 0 4px rgba(0,166,215,0.12)';
      default:
        return '0 8px 32px 0 rgba(31, 38, 135, 0.18), 0 0 32px 4px rgba(59, 130, 246, 0.18)';
    }
  }};


  &::before {
    content: '';
    position: absolute;
    inset: -5px;
    border-radius: 24px;
    pointer-events: none;
    z-index: 2;
    border: 2.5px solid transparent;
    box-shadow: ${({ $themeName }) => {
      switch ($themeName) {
        case 'light':
          return '0 0 12px 6px rgba(59,130,246,0.12), 0 0 0 2px rgba(59,130,246,0.18)';
        case 'dark':
          return '0 0 12px 6px rgba(99,102,241,0.12), 0 0 0 2px rgba(99,102,241,0.18)';
        case 'neutral':
          return '0 0 12px 6px rgba(0,166,215,0.18), 0 0 0 2px rgba(0,166,215,0.25)';
        default:
          return '0 0 12px 6px rgba(59,130,246,0.12)';
      }
    }};
    background: ${({ $themeName }) => {
      switch ($themeName) {
        case 'light':
          return 'linear-gradient(120deg, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.08) 100%)';
        case 'dark':
          return 'linear-gradient(120deg, rgba(99,102,241,0.18) 0%, rgba(0,0,0,0.10) 100%)';
        case 'neutral':
          return 'linear-gradient(120deg, rgba(0,166,215,0.22) 0%, rgba(255,255,255,0.06) 100%)';
        default:
          return 'linear-gradient(120deg, rgba(59,130,246,0.12) 0%, rgba(255,255,255,0.08) 100%)';
      }
    }};
    opacity: 0.95;
    transition:
      box-shadow 0.4s,
      background 0.4s;
  }


  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  max-width: 990px;
  width: 100%;
  min-height: 110px;
  padding: 1rem;
  margin: 2rem 0 2rem 2rem;
  align-self: flex-start;


  cursor: pointer;


  font-family:
    'Fira Code', 'JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Source Code Pro',
    Consolas, 'Courier New', monospace;


  scroll-snap-align: start;
  flex-shrink: 0;


  ${({ $isGlitching, $themeName }) =>
    $isGlitching &&
    css`
      animation: ${$themeName === 'light'
          ? glitchLight
          : $themeName === 'dark'
            ? glitchDark
            : $themeName === 'neutral'
              ? glitchNeutral
              : glitchLight}
        0.5s ease-in-out;
    `}


  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);


  &:hover {

  }

  &:active {

  }

  &:focus,
  &:focus-visible,
  &:focus-within {
    outline: none;
  }


  @media (max-width: 768px) {
    min-width: 0;
    max-width: 95vw;
    width: 100%;
    padding: 0.75rem;
    min-height: 110px;
    margin: 1rem 0 1rem 1rem;
    align-self: flex-start;
  }

  @media (max-width: 640px) {
    min-width: 0;
    max-width: 98vw;
    width: 100%;
    padding: 0.5rem;
    min-height: 100px;
    margin: 0.5rem 0 0.5rem 0.5rem;
    align-self: flex-start;
  }

  @media (max-width: 480px) {
    min-width: 0;
    max-width: 99vw;
    width: 100%;
    padding: 0.4rem;
    min-height: 90px;
    margin: 0.25rem 0 0.25rem 0.25rem;
    align-self: flex-start;
  }

  @media (max-width: 360px) {
    min-width: 0;
    max-width: 100vw;
    width: 100%;
    padding: 0.3rem;
    min-height: 80px;
    margin: 0.1rem 0 0.1rem 0.1rem;
    align-self: flex-start;
  }
`;

const Title = styled.h3<{ $themeName: string; $isGlitching?: boolean }>`

  font-family:
    'Fira Code', 'JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Source Code Pro',
    Consolas, 'Courier New', monospace;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
  color: ${({ $themeName }) => getThemeStyles($themeName).titleColor};
  margin: 0;


  border: none !important;
  outline: none !important;


  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;


  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  transition: color 0.3s ease;
  ${({ $isGlitching, $themeName }) =>
    $isGlitching &&
    css`
      animation: ${$themeName === 'light'
          ? glitchLight
          : $themeName === 'dark'
            ? glitchDark
            : $themeName === 'neutral'
              ? glitchNeutral
              : glitchLight}
        0.5s ease-in-out;
    `}
`;

const Description = styled.p<{ $themeName: string; $isGlitching?: boolean }>`

  font-family:
    'Fira Code', 'JetBrains Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Source Code Pro',
    Consolas, 'Courier New', monospace;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.5;
  color: ${({ $themeName }) => getThemeStyles($themeName).descriptionColor};
  margin: 0;
  flex-grow: 1;


  border: none !important;
  outline: none !important;


  text-align: justify;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  -webkit-hyphens: auto;
  -moz-hyphens: auto;
  -ms-hyphens: auto;


  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;

  transition: color 0.3s ease;
  ${({ $isGlitching, $themeName }) =>
    $isGlitching &&
    css`
      animation: ${$themeName === 'light'
          ? glitchLight
          : $themeName === 'dark'
            ? glitchDark
            : $themeName === 'neutral'
              ? glitchNeutral
              : glitchLight}
        0.5s ease-in-out;
    `}
`;

const NeuralGlassCard: React.FC<NeuralGlassCardProps> = ({
  title,
  description,
  onClick,
  className,
  cardIndex,
}) => {
  const { themeName } = useTheme();
  const [isGlitching, setIsGlitching] = useState(false);


  useEffect(() => {
    setIsGlitching(true);
    const timeout = setTimeout(() => setIsGlitching(false), 300);
    return () => clearTimeout(timeout);
  }, [themeName, cardIndex]);

  return (
    <CardContainer
      $themeName={themeName}
      $isGlitching={isGlitching}
      onClick={onClick}
      className={`neural-glass-card-final ${className || ''}`}
      data-component="neural-glass-card-final"
    >
      <div>
        <Title $themeName={themeName} $isGlitching={isGlitching}>
          <SimpleText delay={50}>{title}</SimpleText>
        </Title>
        <Description $themeName={themeName} $isGlitching={isGlitching}>
          <SimpleText delay={100}>{description}</SimpleText>
        </Description>
      </div>
    </CardContainer>
  );
};

export default NeuralGlassCard;
