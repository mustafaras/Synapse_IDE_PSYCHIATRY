import { useCallback, useRef, useState } from 'react';
import type { TerminalCommand, TerminalHistory } from '../types/shellTypes';

export const useTerminalHistory = () => {
  const [history, setHistory] = useState<TerminalHistory>({
    commands: [],
    currentIndex: -1,
  });

  const [currentInput, setCurrentInput] = useState('');
  const originalInputRef = useRef('');

  const addCommand = useCallback((command: TerminalCommand) => {
    setHistory(prev => ({
      commands: [...prev.commands, command],
      currentIndex: -1,
    }));
  }, []);

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      setHistory(prev => {
        const { commands, currentIndex } = prev;

        if (commands.length === 0) return prev;

        let newIndex = currentIndex;

        if (direction === 'up') {
          if (currentIndex === -1) {

            originalInputRef.current = currentInput;
            newIndex = commands.length - 1;
          } else if (currentIndex > 0) {
            newIndex = currentIndex - 1;
          }
        } else if (direction === 'down') {
          if (currentIndex < commands.length - 1) {
            newIndex = currentIndex + 1;
          } else if (currentIndex === commands.length - 1) {

            newIndex = -1;
            setCurrentInput(originalInputRef.current);
            return { ...prev, currentIndex: newIndex };
          }
        }

        if (newIndex !== currentIndex && newIndex >= 0) {
          const historicCommand = commands[newIndex];
          const commandString = `${historicCommand.command}${historicCommand.args.length > 0 ? ` ${  historicCommand.args.join(' ')}` : ''}`;
          setCurrentInput(commandString);
        }

        return { ...prev, currentIndex: newIndex };
      });
    },
    [currentInput]
  );

  const clearHistory = useCallback(() => {
    setHistory({
      commands: [],
      currentIndex: -1,
    });
    setCurrentInput('');
    originalInputRef.current = '';
  }, []);

  const getLastCommand = useCallback(() => {
    if (history.commands.length === 0) return null;
    return history.commands[history.commands.length - 1];
  }, [history.commands]);

  const searchHistory = useCallback(
    (query: string) => {
      return history.commands.filter(
        cmd =>
          cmd.command.toLowerCase().includes(query.toLowerCase()) ||
          cmd.args.some(arg => arg.toLowerCase().includes(query.toLowerCase()))
      );
    },
    [history.commands]
  );

  return {
    history,
    currentInput,
    setCurrentInput,
    addCommand,
    navigateHistory,
    clearHistory,
    getLastCommand,
    searchHistory,
  };
};
