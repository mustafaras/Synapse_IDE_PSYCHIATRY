import React from 'react';
import styled, { css } from 'styled-components';
import type { ButtonProps } from '@/types';
import { DURATION, EASING } from '@/styles/theme';
import { SYNAPSE_ACCENT, SYNAPSE_ANIM, SYNAPSE_ELEVATION, SYNAPSE_FOCUS, SYNAPSE_LAYOUT } from '@/ui/theme/synapseTheme';


const ButtonVariants = {
  primary: css`
    background: ${SYNAPSE_ACCENT.gold};
    color: #0E0E0E;
    border: 1px solid ${SYNAPSE_ACCENT.gold};
    box-shadow: ${SYNAPSE_ELEVATION.shadowSm};

    &:hover:not(:disabled) {
      background: ${SYNAPSE_ACCENT.goldHover};
      border-color: ${SYNAPSE_ACCENT.goldHover};
      transform: translateY(-0.5px);
      box-shadow: ${SYNAPSE_ELEVATION.shadowMd};
    }

    &:active:not(:disabled) {
      background: ${SYNAPSE_ACCENT.goldActive};
      transform: translateY(0.5px);
      box-shadow: ${SYNAPSE_ELEVATION.shadowSm};
    }
  `,
  secondary: css`
    background: ${SYNAPSE_ELEVATION.surface};
    color: inherit;
    border: 1px solid ${SYNAPSE_ELEVATION.border};
    box-shadow: ${SYNAPSE_ELEVATION.shadowSm};

    &:hover:not(:disabled) {
      background: ${SYNAPSE_ELEVATION.surfaceHover};
      transform: translateY(-0.5px);
      box-shadow: ${SYNAPSE_ELEVATION.shadowMd};
    }

    &:active:not(:disabled) {
      background: ${SYNAPSE_ELEVATION.surfaceActive};
      transform: translateY(0.5px);
      box-shadow: ${SYNAPSE_ELEVATION.shadowSm};
    }
  `,
  ghost: css`
    background: transparent;
    color: inherit;
    border: 1px solid transparent;

    &:hover:not(:disabled) {
      background: ${SYNAPSE_ELEVATION.surfaceHover};
      border-color: ${SYNAPSE_ELEVATION.border};
      box-shadow: ${SYNAPSE_ELEVATION.shadowSm};
    }

    &:active:not(:disabled) {
      background: ${SYNAPSE_ELEVATION.surfaceActive};
    }
  `,
  danger: css`
    background: var(--color-error);
    color: white;
    border: 1px solid var(--color-error);
    box-shadow: ${SYNAPSE_ELEVATION.shadowSm};

    &:hover:not(:disabled) {
      background: var(--color-error);
      border-color: var(--color-error);
  transform: translateY(-0.5px);
  box-shadow: ${SYNAPSE_ELEVATION.shadowMd};
    }

    &:active:not(:disabled) {
  transform: translateY(0.5px);
  box-shadow: ${SYNAPSE_ELEVATION.shadowSm};
    }
  `,
};

const ButtonSizes = {
  sm: css`
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-sm);
    min-height: 2rem;
  `,
  md: css`
  padding: ${SYNAPSE_LAYOUT.padSm} ${SYNAPSE_LAYOUT.padMd};
    font-size: var(--font-size-base);
  border-radius: ${SYNAPSE_LAYOUT.radiusMd};
    min-height: 2.5rem;
  `,
  lg: css`
  padding: ${SYNAPSE_LAYOUT.padMd} ${SYNAPSE_LAYOUT.padLg};
    font-size: var(--font-size-lg);
  border-radius: ${SYNAPSE_LAYOUT.radiusLg};
    min-height: 3rem;
  `,
};

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $loading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition: background ${SYNAPSE_ANIM.base}, box-shadow ${SYNAPSE_ANIM.base}, transform ${SYNAPSE_ANIM.fast};
  cursor: pointer;
  position: relative;
  overflow: hidden;

  ${({ $size = 'md' }) => ButtonSizes[$size]}
  ${({ $variant = 'primary' }) => ButtonVariants[$variant]}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 ${SYNAPSE_FOCUS.width} ${SYNAPSE_FOCUS.ring},
      0 0 0 calc(${SYNAPSE_FOCUS.width} * 2) ${SYNAPSE_FOCUS.ringOffset};
    border-radius: ${SYNAPSE_FOCUS.radius};
  }

  ${({ $loading }) =>
    $loading &&
    css`
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        width: 1rem;
        height: 1rem;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}


  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.1), transparent);
    transition: left ${DURATION.slow} ${EASING.bauhaus};
  }

  &:hover::before {
    left: 100%;
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $position }) =>
    $position === 'right' &&
    css`
      order: 1;
    `}
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  onClick,
  type = 'button',
  ...rest
}) => {
  const { loading: _omitLoading, variant: _omitVariant, size: _omitSize, ...safeRest } = rest as any;
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      className={className}
      onClick={onClick}
      type={type}
      $loading={loading}
      {...safeRest}
    >
      {icon ? <IconWrapper $position={iconPosition}>{icon}</IconWrapper> : null}
      {!loading && children}
    </StyledButton>
  );
};

export default Button;
