import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { DURATION, EASING } from '@/styles/theme';

interface DropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface ThemedDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
}

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownLabel = styled.label`
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text);
  font-size: var(--font-size-sm);
  font-weight: 500;
`;

const DropdownTrigger = styled.button<{ isOpen: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--theme-glass);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--theme-shadow);
  color: var(--color-text);
  font-size: var(--font-size-base);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all ${DURATION.normal} ${EASING.bauhaus};
  outline: none;

  &:hover:not(:disabled) {
    border-color: var(--color-border);
    background: var(--color-surface);
    box-shadow: var(--assistant-glow), var(--theme-shadow);
  }

  &:focus-visible {
    border-color: var(--theme-primary);
    box-shadow: var(--assistant-glow), var(--theme-shadow);
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      border-color: var(--theme-primary);
      box-shadow: var(--assistant-glow), var(--theme-shadow);
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
    `}
`;

const DropdownContent = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex: 1;
  text-align: left;
`;

const DropdownIcon = styled.span`
  display: flex;
  align-items: center;
  color: var(--theme-primary);
`;

const ChevronIcon = styled(ChevronDown)<{ isOpen: boolean }>`
  transition: transform ${DURATION.normal} ${EASING.bauhaus};
  color: var(--color-text-secondary);

  ${({ isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10060;
  margin-top: var(--spacing-xs);
  background: var(--theme-glass);
  backdrop-filter: var(--glass-backdrop-filter);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow:
    var(--theme-shadow),
    0 8px 32px rgba(0, 0, 0, 0.12);
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? 'visible' : 'hidden')};
  transform: ${({ isOpen }) => (isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all ${DURATION.normal} ${EASING.bauhaus};
  max-height: 16rem;
  overflow-y: auto;
`;

const OptionItem = styled.div<{ isFocused: boolean; isSelected: boolean }>`
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  transition: all ${DURATION.fast} ${EASING.bauhaus};
  border-bottom: 1px solid var(--glass-border);

  &:last-child {
    border-bottom: none;
  }

  ${({ isFocused }) =>
    isFocused &&
    css`
      background: var(--color-surface);
      box-shadow: inset 2px 0 0 var(--theme-primary);
    `}

  ${({ isSelected }) =>
    isSelected &&
    css`
      background: var(--theme-glass);
      color: var(--theme-primary);
      font-weight: 500;
    `}

  &:hover {
    background: var(--color-surface);
    box-shadow: inset 2px 0 0 var(--theme-primary);
  }
`;

const OptionLabel = styled.div`
  color: var(--color-text);
  font-size: var(--font-size-base);
`;

const OptionDescription = styled.div`
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
`;

export const ThemedDropdown: React.FC<ThemedDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  disabled = false,
  label,
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  function handleTriggerClick() {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }
  function handleTriggerFocus() {
    if (disabled) return;
    setIsOpen(true);
  }
  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange]);
  const handleOptionEnter = useCallback((idx: number) => setFocusedIndex(idx), []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => (prev < options.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => (prev > 0 ? prev - 1 : options.length - 1));
          break;
        case 'Enter':
          event.preventDefault();
          if (focusedIndex >= 0) {
            onChange(options[focusedIndex].value);
            setIsOpen(false);
            setFocusedIndex(-1);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, options, onChange]);

  const selectedOption = options.find(option => option.value === value);

  type OptionRowProps = {
    option: DropdownOption;
    index: number;
    focusedIndex: number;
    selectedValue: string;
    onSelect: (value: string) => void;
    onFocusIdx: (idx: number) => void;
  };

  const OptionRow: React.FC<OptionRowProps> = React.memo(({ option, index, focusedIndex, selectedValue, onSelect, onFocusIdx }) => {
    const isFocused = focusedIndex === index;
    const isSelected = selectedValue === option.value;
    const onClick = useCallback(() => onSelect(option.value), [onSelect, option.value]);
    const onMouseEnter = useCallback(() => onFocusIdx(index), [onFocusIdx, index]);
    return (
      <OptionItem
        key={option.value}
        isFocused={isFocused}
        isSelected={isSelected}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        role="option"
        aria-selected={isSelected}
      >
        <OptionLabel>{option.label}</OptionLabel>
        {option.description ? <OptionDescription>{option.description}</OptionDescription> : null}
      </OptionItem>
    );
  });
  OptionRow.displayName = 'OptionRow';

  return (
    <DropdownContainer ref={dropdownRef}>
      {label ? <DropdownLabel>
          {icon ? <DropdownIcon>{icon}</DropdownIcon> : null}
          {label}
        </DropdownLabel> : null}

      <DropdownTrigger
        type="button"
        isOpen={isOpen}
        disabled={disabled}

  onClick={handleTriggerClick}

  onFocus={handleTriggerFocus}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <DropdownContent>{selectedOption ? selectedOption.label : placeholder}</DropdownContent>
        <ChevronIcon size={16} isOpen={isOpen} />
      </DropdownTrigger>

      <DropdownMenu isOpen={isOpen} role="listbox">
        {options.map((option, index) => (
          <OptionRow
            key={option.value}
            option={option}
            index={index}
            focusedIndex={focusedIndex}
            selectedValue={value}
            onSelect={handleSelect}
            onFocusIdx={handleOptionEnter}
          />
        ))}
      </DropdownMenu>
    </DropdownContainer>
  );
};
