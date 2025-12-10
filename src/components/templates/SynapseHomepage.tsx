import React, { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useTheme } from '../../contexts/ThemeContext';
import { HeroSection } from './HeroSection';

import NeuralBackground from '../atoms/NeuralBackground';
import NeuralGlassCard from '../atoms/NeuralGlassCardFinal';


const neuralCards = [
  {
    id: 1,
    title: 'Multi‑Model Orchestration',
    description:
      'Provider‑agnostic model registry and sampling mapper enabling task‑aware routing across local and hosted backends. Deterministic temperature/top‑p/penalty controls and versioned presets support reproducible experiments and scientifically interpretable results across diverse workloads.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 12L11 14L15 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 3C12 3 15 6 15 12S12 21 12 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 3C12 3 9 6 9 12S12 21 12 21"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Retrieval‑Augmented Workflows',
    description:
      'Domain‑tuned RAG pipelines integrate a structured prompt/snippet library with citation tracking and evidence linking. Knowledge stores, embeddings, and templated outputs support transparent clinical reasoning and repeatable information synthesis.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 6V8M16 8L14 10M16 16L14 14M12 18V16M8 16L10 14M8 8L10 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 3,
    title: 'Privacy, Redaction & Governance',
    description:
      'Consent‑aware access controls, encrypted secrets handling, and privacy‑preserving redaction tokens minimize PHI exposure while maintaining analytic utility. Audit‑ready artifacts and policy‑aligned guardrails support compliant use in regulated environments.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18 10H22L18 6L14 10H18Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 6V14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 18C4.34315 18 3 16.6569 3 15C3 13.3431 4.34315 12 6 12C6.35064 10.8885 7.3712 10.0952 8.55279 10.0091C8.82399 8.84815 9.86563 8 11.1111 8C12.6717 8 13.9778 9.22386 14.0899 10.7486"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 4,
    title: 'Observability, Evaluation & Export',
    description:
      'OpenTelemetry‑based spans with temporal and semantic correlation provide deep observability of model and UI pathways. Integrated unit/E2E evaluation harnesses and PDF/JSON export produce auditable, reproducible results aligned with scientific best practices.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 12H18L15 21L9 3L6 12H2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="1" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 8L12 12L16 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 16L12 12L16 16"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const PageContainer = styled.div<{ $theme: any }>`
  min-height: 100vh;
  background: transparent;
  font-family: var(--font-family-primary);
  transition: all 300ms var(--timing-function-global);
  overflow: hidden;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$theme.background};
    z-index: -2;
    transition: all 300ms var(--timing-function-global);
  }
`;

const MainGrid = styled.div`

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;


  width: 100%;
  margin: 0;
  padding-inline: 0;
  min-height: 100vh;
  position: relative;


  .branding-section {
    display: flex;
    flex-direction: column;
    padding-block: 0 4rem;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: left;
    gap: var(--spacing-lg);


    width: fit-content;
    min-width: 0;
    max-width: none;


    padding-left: clamp(2rem, 5vw, 3rem);
    padding-right: 0;


    [data-homepage-logo] {

      margin-left: 0rem;
      align-self: flex-start;
      transition: margin-left 300ms ease;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    [data-homepage-logo] .homepage-tagline {

      margin-top: -0.3rem;
      margin-bottom: 2.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 0.35rem;
      font-family: 'Proto Mono','ProtoMono','Proto-Mono','JetBrains Mono','Fira Code','SF Mono',Consolas,'Roboto Mono',monospace;
      user-select: none;
      pointer-events: none;
      position: relative;
      opacity: 0;
      animation: taglineReveal 900ms cubic-bezier(.25,.6,.3,1) 120ms forwards;
    }


    @keyframes vGlitchCycle {
      0%, 80% { transform: none; filter: none; text-shadow: 0 0 4px rgba(0,0,0,0.55),0 4px 10px rgba(0,0,0,0.5),0 0 12px rgba(255,30,30,0.4); }
      82% { transform: translate(-2px,1px) skewX(8deg); text-shadow: -2px 0 #ff1e1e, 2px 0 #7a0000,0 0 10px rgba(255,30,30,0.6); }
      84% { transform: translate(2px,-1px) skewX(-6deg); text-shadow: 2px 0 #ff3d3d,-2px 0 #7a0000,0 0 12px rgba(255,50,50,0.7); }
      86% { transform: translate(-1px,0) skewX(4deg); text-shadow: -1px 0 #ff1e1e,1px 0 #7a0000,0 0 8px rgba(255,30,30,0.6); }
      88% { transform: translate(1px,-1px) skewX(-3deg); }
      90% { transform: translate(-1px,1px); }
      92% { transform: translate(0,0) skewX(0deg); }
      100% { transform: none; filter: none; }
    }


    @keyframes taglineReveal {
      0% { opacity: 0; transform: translateY(-10px) scale(.98); filter: blur(4px); }
      60% { opacity: 1; transform: translateY(2px) scale(1); filter: blur(0); }
      100% { opacity: 1; transform: translateY(0) scale(1); filter: none; }
    }


    [data-homepage-logo] .homepage-tagline::after {
      content: '';
      display: block;
      width: 72%;
      max-width: 420px;
      height: 2px;
      margin-top: 0.65rem;
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%);
      opacity: .55;
      border-radius: 2px;
      box-shadow: 0 0 6px -1px rgba(255,255,255,0.35);
      backdrop-filter: blur(2px);
    }

    [data-homepage-logo] .homepage-tagline .tagline-v {
      font-size: clamp(3.6rem,5.2vw,5.4rem);
      font-weight: 950;
      color: #ff2020;
      -webkit-text-stroke: 1.6px #4a0000;
      text-shadow:
        0 0 3px rgba(0,0,0,0.65),
        0 4px 12px rgba(0,0,0,0.6),
        0 0 16px rgba(255,40,40,0.55),
        0 0 28px rgba(255,60,60,0.35);
      letter-spacing: 1.2px;
      line-height: 0.85;
      animation: vGlitchCycle 3s infinite;
      position: relative;
      transform: translateY(-2px);
    }

    [data-homepage-logo] .homepage-tagline .tagline-rest {
      font-size: clamp(1.1rem,2vw,2rem);
      font-weight: 700;
      background: linear-gradient(90deg,#5FD6F5,#00A6D7,#036E8D);
      background-size: 200% 200%;
      animation: taglineGradient 8s ease-in-out infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      letter-spacing: -0.5px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.35);
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      [data-homepage-logo] .homepage-tagline .tagline-v {
        font-size: clamp(2.8rem,9vw,3.6rem);
        -webkit-text-stroke: 1px #600000;
      }
      [data-homepage-logo] .homepage-tagline .tagline-rest {
        font-size: clamp(0.95rem,3.4vw,1.4rem);
      }
      [data-homepage-logo] .homepage-tagline {
        margin-bottom: 1.1rem;
      }
    }

    @media (max-width: 1024px) and (min-width: 641px) {
      [data-homepage-logo] .homepage-tagline { margin-bottom: 1.6rem; }
    }

    @media (max-width: 480px) {
      [data-homepage-logo] .homepage-tagline { margin-bottom: 0.9rem; }
    }
  }


  @media (max-width: 1024px) {
    .branding-section {
      padding-block: 0 3rem;
      align-items: center;
      text-align: center;
      max-width: none;

      [data-homepage-logo] {

        margin-left: 0;
      }
    }
  }

  @media (max-width: 768px) {
    .branding-section {
      width: 100%;
      padding-block: 0 2rem;
      padding-inline: var(--spacing-md);
      align-items: center;
      text-align: center;
      max-width: none;

      [data-homepage-logo] {
        margin-left: 0;
      }
    }
  }
`;


const BrandTitle = styled.h1<{ $theme?: any }>`

  font-family:
    'Proto Mono', 'ProtoMono', 'Proto-Mono', 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas,
    'Roboto Mono', monospace;
  font-size: clamp(5rem, 10vw, 10rem);
  font-weight: 950;
  line-height: var(--line-height-tight);
  letter-spacing: -0.02em;


  text-shadow:
    1px 1px 0px rgba(0, 0, 0, 0.1),
    2px 2px 0px rgba(0, 0, 0, 0.05);


  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;


  text-align: left;
  align-self: flex-start;


  background: ${props => {
    const theme = props.$theme;
    if (!theme)
      return 'linear-gradient(270deg, var(--color-primary), var(--color-accent), var(--color-primary))';

    const themeName = theme.name || 'light';

    switch (themeName) {
      case 'light':
        return `linear-gradient(270deg, #3B82F6, #60A5FA, #8B5CF6, #3B82F6)`;
      case 'dark':
        return `linear-gradient(270deg, #6366F1, #8B5CF6, #A855F7, #6366F1)`;
      case 'neutral':
  return `linear-gradient(270deg, #5FD6F5, #00A6D7, #036E8D, #5FD6F5)`;
      default:
        return 'linear-gradient(270deg, var(--color-primary), var(--color-accent), var(--color-primary))';
    }
  }};
  background-size: 400% 400%;
  animation: gradientShift 4s ease infinite;

  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;


  filter: drop-shadow(0 3px 10px rgba(0, 0, 0, 0.15));

  margin: 0;
  margin-bottom: 0rem;
  transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.02);
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2));
  }


  .cursor {
    animation: blink 1s infinite;

    background: inherit;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;

    transform: scaleY(1.1) scaleX(1.1);
    display: inline-block;
    transform-origin: center bottom;
  }


  &.glitch {
    animation: glitch 0.3s ease-in-out;
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
    10% {
      transform: translate(-2px, 1px);
      text-shadow: ${props => {
        const theme = props.$theme;
        const themeName = theme?.name || 'light';

        switch (themeName) {
          case 'light':
            return `
              -2px 0 #3B82F6,
              2px 0 #60A5FA,
              0 0 10px #3B82F6,
              0 0 20px #60A5FA
            `;
          case 'dark':
            return `
              -2px 0 #6366F1,
              2px 0 #8B5CF6,
              0 0 10px #6366F1,
              0 0 20px #8B5CF6
            `;
          case 'neutral':
            return `
              -2px 0 #10B981,
              2px 0 #34D399,
              0 0 10px #10B981,
              0 0 20px #34D399
            `;
          default:
            return `
              -2px 0 #3B82F6,
              2px 0 #60A5FA,
              0 0 10px #3B82F6
            `;
        }
      }};
    }
    20% {
      transform: translate(-1px, -1px);
    }
    30% {
      transform: translate(1px, 2px);
      filter: hue-rotate(90deg);
    }
    40% {
      transform: translate(2px, -1px);
    }
    50% {
      transform: translate(-1px, 1px);
      text-shadow: ${props => {
        const theme = props.$theme;
        const themeName = theme?.name || 'light';

        switch (themeName) {
          case 'light':
            return `
              1px 1px #3B82F6,
              -1px -1px #60A5FA,
              0 0 5px #3B82F6
            `;
          case 'dark':
            return `
              1px 1px #6366F1,
              -1px -1px #8B5CF6,
              0 0 5px #6366F1
            `;
          case 'neutral':
            return `
              1px 1px #10B981,
              -1px -1px #34D399,
              0 0 5px #10B981
            `;
          default:
            return `
              1px 1px #3B82F6,
              -1px -1px #60A5FA
            `;
        }
      }};
    }
    60% {
      transform: translate(1px, 1px);
    }
    70% {
      transform: translate(-2px, 1px);
      filter: hue-rotate(180deg);
    }
    80% {
      transform: translate(2px, -2px);
    }
    90% {
      transform: translate(1px, -1px);
    }
    100% {
      transform: translate(0);
      filter: hue-rotate(0deg);
      text-shadow: none;
    }
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }


  @keyframes taglineGradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }


  @media (max-width: 1024px) {
    font-size: clamp(4rem, 8vw, 7rem);
    text-align: center;
    align-self: center;
  }

  @media (max-width: 768px) {
    font-size: clamp(3rem, 7vw, 5rem);
    text-align: center;
    align-self: center;
  }

  @media (max-width: 480px) {
    font-size: clamp(2.5rem, 6vw, 4rem);
  }
`;


const BottomLeftCards = styled.div`

  position: fixed;
  bottom: 0rem;
  left: clamp(1rem, 3vw, 2rem);
  z-index: 50;


  display: flex;
  gap: 1.5rem;
  width: 1200px;
  max-width: 1200px;
  overflow-x: auto;
  overflow-y: visible;


  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;


  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }


  background: transparent;
  border: none;
  padding: 0;
  padding-bottom: 2rem;


  transition: none;


  will-change: auto;


  -webkit-overflow-scrolling: touch;


  @media (max-width: 1024px) {
    bottom: 1.5rem;
    left: clamp(1.5rem, 4vw, 2.5rem);
    width: min(930px, calc(100vw - 3rem));
    max-width: min(930px, calc(100vw - 3rem));
    gap: 1.25rem;
  }

  @media (max-width: 768px) {
    bottom: 1rem;
    left: 1rem;
    width: calc(100vw - 2rem);
    max-width: calc(100vw - 2rem);
    gap: 1rem;
  }

  @media (max-width: 640px) {
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    width: calc(100vw - 1.5rem);
    max-width: calc(100vw - 1.5rem);
    gap: 0.75rem;
  }

  @media (max-width: 480px) {
    bottom: 0.5rem;
    left: 0.5rem;
    right: 0.5rem;
    width: calc(100vw - 1rem);
    max-width: calc(100vw - 1rem);
    gap: 0.5rem;
  }


  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;


const glitchLine = keyframes`
  0% { opacity: 0; transform: scaleX(0.1) translateX(-50%) skewX(0deg); filter: blur(8px) brightness(2); }
  20% { opacity: 1; transform: scaleX(1.1) translateX(-50%) skewX(10deg); filter: blur(2px) brightness(1.5); }
  40% { opacity: 1; transform: scaleX(0.95) translateX(-50%) skewX(-8deg); filter: blur(1px) brightness(1.2); }
  60% { opacity: 1; transform: scaleX(1.02) translateX(-50%) skewX(4deg); filter: blur(0.5px) brightness(1.1); }
  80% { opacity: 1; transform: scaleX(1) translateX(-50%) skewX(0deg); filter: blur(0px) brightness(1); }
  100% { opacity: 1; transform: scaleX(1) translateX(-50%) skewX(0deg); filter: none; }
`;

const GlitchLine = styled.div<{ $themeName: string; $animate: boolean }>`
  width: 110vw;
  height: 2px;
  background: ${({ $themeName }) =>
    $themeName === 'dark'
      ? 'linear-gradient(90deg, #6366F1, #8B5CF6, #A855F7)'
      : $themeName === 'neutral'
  ? 'linear-gradient(90deg, #5FD6F5, #00A6D7, #036E8D)'
        : 'linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6)'};
  margin: 0px 0 6px 0;
  position: relative;
  left: -12%;
  transform: translateX(-50%);
  border-radius: 3px;
  box-shadow: 0 2px 12px 0 rgba(80, 80, 120, 0.12);
  opacity: 1;
  ${({ $animate }) =>
    $animate &&
    css`
      animation: ${glitchLine} 1.5s cubic-bezier(0.7, 0, 0.3, 1);
    `}
`;

interface SynapseHomepageProps { onLaunchIDE?: () => void }
const SynapseHomepage: React.FC<SynapseHomepageProps> = ({
  onLaunchIDE,
}) => {
  const { theme, themeName, setTheme } = useTheme();
  const [isGlitching, setIsGlitching] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [lineGlitch, setLineGlitch] = useState(true);


  useEffect(() => {
    const cardCycleInterval = setInterval(() => {
      setCurrentCardIndex(prevIndex => (prevIndex + 1) % neuralCards.length);
    }, 3000);

    return () => clearInterval(cardCycleInterval);
  }, []);


  useEffect(() => {
    const fullText = 'Synapse_IDE';
    let currentIndex = 0;

    const triggerTyping = () => {
      setIsTyping(true);
      setDisplayText('');
      currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayText(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setTimeout(() => setIsTyping(false), 500);
        }
      }, 100);
    };


    triggerTyping();


    const typingInterval = setInterval(triggerTyping, 30000);

    return () => clearInterval(typingInterval);
  }, []);


  useEffect(() => {
    const fullText = 'Synapse_IDE';
    let currentIndex = 0;

    setIsTyping(true);
    setDisplayText('');
    currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setIsTyping(false), 500);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [themeName]);


  useEffect(() => {
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    };

    const getRandomInterval = () => Math.random() * 7000 + 8000;

    let timeoutId: NodeJS.Timeout;

    const scheduleNextGlitch = () => {
      timeoutId = setTimeout(() => {
        triggerGlitch();
        scheduleNextGlitch();
      }, getRandomInterval());
    };

    scheduleNextGlitch();


    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);


  useEffect(() => {
    setLineGlitch(true);
    const t = setTimeout(() => setLineGlitch(false), 3000);
    return () => clearTimeout(t);
  }, [themeName]);


  React.useEffect(() => {
    if (themeName !== 'neutral') {
      setTheme('neutral');
    }
  }, [themeName, setTheme]);


  React.useEffect(() => {
    const holder = document.querySelector('[data-homepage-logo]');
    if (holder && !holder.querySelector('.homepage-tagline')) {
      const span = document.createElement('div');
      span.className = 'homepage-tagline';
      span.innerHTML = `<span class="tagline-v">V</span><span class="tagline-rest">for Psychiatry Professionals</span>`;
      holder.appendChild(span);
    }
  }, []);

  return (
    <PageContainer $theme={theme}>
      <NeuralBackground />
      {}
      <MainGrid>
        {}
        <section className="branding-section">
          <BrandTitle
            $theme={{ name: themeName }}
            className={isGlitching ? 'glitch' : ''}
            data-theme={themeName}
          >
            {isTyping ? (
              <>
                {displayText}
                <span className="cursor">_</span>
              </>
            ) : (
              <>
                Synapse<span className="cursor">_</span>IDE
              </>
            )}
          </BrandTitle>
          {}
          <GlitchLine $themeName={themeName} $animate={lineGlitch} />
          <HeroSection onLaunchIDE={onLaunchIDE || (() => {})} />
        </section>
      </MainGrid>
      <BottomLeftCards>
        <div>
          <NeuralGlassCard
            title={neuralCards[currentCardIndex].title}
            description={neuralCards[currentCardIndex].description}
            onClick={() => console.warn(`Clicked on ${neuralCards[currentCardIndex].title}`)}
          />
        </div>
      </BottomLeftCards>
    </PageContainer>
  );
};

export default SynapseHomepage;


