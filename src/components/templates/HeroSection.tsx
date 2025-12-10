import React from 'react';
import styled, { keyframes } from 'styled-components';
import Logo from '../atoms/Logo';
import styles from './HeroSection.module.css';
import { useTheme } from '../../contexts/ThemeContext';

const rocketPulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// Accept any theme object by loosening prop typing to unknown
const LaunchButtonStyled = styled.button<{ $theme: unknown; $themeName: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;


  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1.5px solid
    ${({ $themeName }) =>
      $themeName === 'light' ? 'rgba(59, 130, 246, 0.85)' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50px;


  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);

  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);


  animation: none !important;
  box-shadow: none !important;
  text-shadow: none !important;

  &:hover {
    animation: none !important;
    box-shadow: none !important;
    text-shadow: none !important;
    border-color: ${({ $themeName }) =>
      $themeName === 'light' ? 'rgba(59, 130, 246, 1)' : 'rgba(255, 255, 255, 0.3)'};
    transform: translateY(-4px) scale(1.05);
  }

  &:active {
    transform: translateY(-2px) scale(1.02);
  }
`;

const IconContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;


  ${LaunchButtonStyled}:hover & {
    animation: ${rocketPulse} 0.6s ease-in-out infinite;
  }


  svg {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    transition: all 0.3s ease;
  }
`;

const RocketIcon: React.FC = () => (
  <svg
    className="rocket-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

interface HeroSectionProps {
  onLaunchIDE?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onLaunchIDE }) => {
  const { theme, themeName } = useTheme();
  const handleLaunch = React.useCallback(() => {
    onLaunchIDE?.();
  }, [onLaunchIDE]);



  return (
    <section className="pt-24 pb-12">
      <div className="w-full px-0">
        {}
        <div
          className={`fade-in ${styles.logoWrap}`}
          data-homepage-logo
        >
          <Logo size={160} />
        </div>

        {}
        <h2
          id="coder-app-heading"
          className={`fade-in ${styles.heroHeading} ${styles.delay100}`}
        >
          A CODER-APP
        </h2>

        {}
        <div>
          <p
            className={`fade-in text-gray-600 dark:text-gray-400 ${styles.heroParagraph} ${styles.delay200}`}
          >
            Synapse IDE is a research‑grade, AI‑accelerated workspace for development and clinical
            reasoning. It unifies fast context‑aware editing (20+ languages), multi‑model
            inference with provider‑agnostic routing, retrieval‑augmented generation, and
            structured prompt engineering. Deterministic sampling controls, provenance‑preserving
            artifact capture, and reproducible experiment tracking support rigorous workflows.
            Built‑in safety includes PII/PHI redaction, guardrails, encrypted secrets management,
            and offline‑first persistence. The platform exposes an extensible model/tool registry,
            evidence‑aware knowledge stores, task orchestration, and low‑latency containerized
            previews. Comprehensive telemetry (OpenTelemetry spans with temporal + semantic
            correlation), evaluation harnesses, and PDF/JSON export enable auditable, high‑velocity
            delivery suitable for regulated clinical settings.
          </p>
        </div>

        {}
        <div
          className={`fade-in ${styles.launchWrap}`}
        >
          <LaunchButtonStyled
            $theme={theme}
            $themeName={themeName}
            onClick={handleLaunch}
          >
            <IconContainer>
              <RocketIcon />
            </IconContainer>
            <span>Launch IDE</span>
          </LaunchButtonStyled>
        </div>
      </div>
    </section>
  );
};

// No default export needed; use named import.
