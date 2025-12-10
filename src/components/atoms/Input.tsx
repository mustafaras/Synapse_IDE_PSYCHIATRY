import React, { useCallback, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import type { InputProps } from '@/types';
import { DURATION, EASING } from '@/styles/theme';
import { SYNAPSE_ANIM, SYNAPSE_COLORS, SYNAPSE_ELEVATION, SYNAPSE_FOCUS, SYNAPSE_LAYOUT } from '@/ui/theme/synapseTheme';

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input<{ hasError: boolean; hasLabel: boolean }>`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: ${SYNAPSE_COLORS.textPrimary};
  background: ${SYNAPSE_ELEVATION.surface};
  border: 1px solid ${SYNAPSE_ELEVATION.border};
  border-radius: ${SYNAPSE_LAYOUT.radiusMd};
  box-shadow: ${SYNAPSE_ELEVATION.shadowSm};
  transition: background ${SYNAPSE_ANIM.base}, box-shadow ${SYNAPSE_ANIM.base}, border-color ${SYNAPSE_ANIM.base};
  outline: none;

  ${({ hasLabel }) =>
    hasLabel &&
    css`
      padding-top: var(--spacing-lg);
    `}

  &::placeholder {
  color: ${SYNAPSE_COLORS.textSecondary};
  opacity: 0.7;
  }

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 ${SYNAPSE_FOCUS.width} ${SYNAPSE_FOCUS.ring},
      0 0 0 calc(${SYNAPSE_FOCUS.width} * 2) ${SYNAPSE_FOCUS.ringOffset};
    border-radius: ${SYNAPSE_FOCUS.radius};
  }

  &:hover:not(:focus):not(:disabled) {
    background: ${SYNAPSE_ELEVATION.surfaceHover};
    box-shadow: ${SYNAPSE_ELEVATION.shadowMd};
  }

  ${({ hasError }) =>
    hasError &&
    css`
  border-color: var(--color-error);
    `}

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }


  &:focus-visible::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border: ${SYNAPSE_FOCUS.width} solid ${SYNAPSE_FOCUS.ring};
    border-radius: ${SYNAPSE_FOCUS.radius};
    opacity: 0.3;
    pointer-events: none;
  }
`;

const FloatingLabel = styled.label<{ isFocused: boolean; hasValue: boolean }>`
  position: absolute;
  left: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  pointer-events: none;
  transition: all ${DURATION.normal} ${EASING.bauhaus};
  background: var(--theme-glass);
  backdrop-filter: var(--glass-backdrop-filter);
  padding: 0 var(--spacing-xs);
  border-radius: var(--radius-sm);

  ${({ isFocused, hasValue }) =>
    isFocused || hasValue
      ? css`
          top: 0;
          transform: translateY(-50%);
          font-size: var(--font-size-xs);
          color: var(--theme-primary);
        `
      : css`
          top: 50%;
          transform: translateY(-50%);
        `}
`;

const ErrorMessage = styled.span`
  display: block;
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
  margin-left: var(--spacing-xs);
`;

const RequiredIndicator = styled.span`
  color: var(--color-error);
  margin-left: var(--spacing-xs);
`;

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  className,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  id,
  ...props
}) => {
  type SynapseInputEl = HTMLInputElement & {
    _synapse_onFocus?: (e: FocusEvent) => void;
    _synapse_onBlur?: (e: FocusEvent) => void;
    _synapse_onInput?: (e: Event) => void;
  };
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentRef = useRef<SynapseInputEl | null>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = Boolean(currentValue);


  const setInputRef = useCallback((el: HTMLInputElement | null) => {
    const prev = currentRef.current;
    if (prev) {
      if (prev._synapse_onFocus) prev.removeEventListener('focus', prev._synapse_onFocus);
      if (prev._synapse_onBlur) prev.removeEventListener('blur', prev._synapse_onBlur);
      if (prev._synapse_onInput) prev.removeEventListener('input', prev._synapse_onInput);
      delete prev._synapse_onFocus;
      delete prev._synapse_onBlur;
      delete prev._synapse_onInput;
    }
    if (el) {
      const onF = (e: FocusEvent) => {
        setIsFocused(true);
        onFocus?.(e as unknown as React.FocusEvent<HTMLInputElement>);
      };
      const onB = (e: FocusEvent) => {
        setIsFocused(false);
        onBlur?.(e as unknown as React.FocusEvent<HTMLInputElement>);
      };
      const onI = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (value === undefined) {
          setInternalValue(target.value);
        }
        onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
      };

      const ext = el as SynapseInputEl;
      ext._synapse_onFocus = onF;
      ext._synapse_onBlur = onB;
      ext._synapse_onInput = onI;
      ext.addEventListener('focus', onF);
      ext.addEventListener('blur', onB);
      ext.addEventListener('input', onI);
    }
    currentRef.current = el as SynapseInputEl | null;
  }, [onBlur, onChange, onFocus, value]);

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <InputWrapper className={className}>
      <StyledInput
        ref={setInputRef}
        id={inputId}
        value={currentValue}
        hasError={Boolean(error)}
        hasLabel={Boolean(label)}
        {...props}
      />
      {label ? <FloatingLabel htmlFor={inputId} isFocused={isFocused} hasValue={hasValue}>
          {label}
          {required ? <RequiredIndicator>*</RequiredIndicator> : null}
        </FloatingLabel> : null}
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}
    </InputWrapper>
  );
};

export default Input;
