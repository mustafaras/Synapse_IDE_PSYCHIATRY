import React, { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ShellConfig, ShellType } from '../types/shellTypes';
import { COMMON_COMMANDS, SHELL_CONFIGS } from '../types/shellTypes';

interface TerminalInputProps {
  shell: ShellType;
  currentDirectory: string;
  onCommand: (command: string, args: string[]) => void;
  onDirectoryChange?: (newDir: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  currentInput: string;
  setCurrentInput: (input: string) => void;
  onHistoryNavigate: (direction: 'up' | 'down') => void;
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  shell,
  currentDirectory,
  onCommand,
  onDirectoryChange: _onDirectoryChange,
  disabled = false,
  autoFocus = true,
  currentInput,
  setCurrentInput,
  onHistoryNavigate,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);

  const shellConfig: ShellConfig = SHELL_CONFIGS[shell];


  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [autoFocus, disabled]);


  const generateSuggestions = (input: string) => {
    if (!input.trim()) return [];

    const commands = [...shellConfig.commands, ...COMMON_COMMANDS];
    const filtered = commands.filter(cmd => cmd.toLowerCase().startsWith(input.toLowerCase()));

    return filtered.slice(0, 8);
  };

  const handleInputChange = (value: string) => {
    setCurrentInput(value);


    const words = value.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.length > 0) {
      const newSuggestions = generateSuggestions(lastWord);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit();
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        } else {
          onHistoryNavigate('up');
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (showSuggestions) {
          setSelectedSuggestion(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        } else {
          onHistoryNavigate('down');
        }
        break;

      case 'Tab':
        e.preventDefault();
        if (showSuggestions && suggestions.length > 0) {
          applySuggestion(suggestions[selectedSuggestion]);
        }
        break;

      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const applySuggestion = (suggestion: string) => {
    const words = currentInput.split(' ');
    words[words.length - 1] = suggestion;
    const newInput = `${words.join(' ')  } `;
    setCurrentInput(newInput);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (!currentInput.trim()) return;

    const trimmed = currentInput.trim();
    const [command, ...args] = trimmed.split(' ');

    onCommand(command, args);
    setCurrentInput('');
    setShowSuggestions(false);
  };

  const formatPrompt = () => {
    const config = SHELL_CONFIGS[shell];
    const dir = currentDirectory.replace(/\\/g, '/');

    switch (shell) {
      case 'powershell':
        return `PS ${dir}>`;
      case 'cmd':
        return `${dir}>`;
      case 'bash':
        return `${dir.split('/').pop() || '~'} $ `;
      case 'node':
        return '> ';
      case 'python':
        return '>>> ';
      default:
        return config.prompt;
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 0',
          fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
          fontSize: '13px',
        }}
      >
        {}
        <span
          style={{
            color: '#00A6D7',
            fontWeight: '600',
            flexShrink: 0,
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#00A6D7',
              filter: 'drop-shadow(0 0 6px rgba(194, 167, 110, 0.3))',
            }}
          >
            {React.createElement(shellConfig.icon, {
              size: 14,
              strokeWidth: 2.5,
            })}
          </div>
          {formatPrompt()}
        </span>

        {}
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#E0E0E0',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            padding: '0',
            caretColor: '#00A6D7',
          }}
          placeholder={disabled ? '' : `Type a command... (${shell})`}
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {}
      {showSuggestions && suggestions.length > 0 ? <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            right: '0',
            background: 'linear-gradient(135deg, #1A1A1A, #121212)',
            border: '1px solid #FFFFFF10',
            borderRadius: '8px',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '8px',
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              onClick={() => applySuggestion(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background:
                  index === selectedSuggestion
                    ? 'rgba(255, 255, 255, 0.04)'
                    : 'transparent',
                color: index === selectedSuggestion ? '#00A6D7' : '#E0E0E0',
                fontSize: '12px',
                fontFamily: 'JetBrains Mono, monospace',
                borderBottom:
                  index < suggestions.length - 1
                    ? '1px solid #FFFFFF10'
                    : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setSelectedSuggestion(index)}
            >
              <ChevronRight
                size={12}
                style={{
                  display: 'inline-block',
                  marginRight: '6px',
                  opacity: index === selectedSuggestion ? 1 : 0.5,
                }}
              />
              {suggestion}
            </div>
          ))}

          {}
          <div
            style={{
              padding: '6px 12px',
              fontSize: '10px',
              color: '#2ECC71',
              fontStyle: 'italic',
              borderTop: '1px solid #FFFFFF10',
              background: 'rgba(255, 255, 255, 0.04)',
            }}
          >
            Press Tab to autocomplete, ↑↓ to navigate
          </div>
        </div> : null}
    </div>
  );
};
