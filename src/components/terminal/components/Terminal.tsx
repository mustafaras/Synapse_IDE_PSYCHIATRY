/* eslint-disable no-case-declarations */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-duplicate-imports */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw, Terminal as TerminalIcon, X } from 'lucide-react';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { useTerminalHistory } from '../hooks/useTerminalHistory';
import type { ShellType, TerminalCommand } from '../types/shellTypes';
import { SHELL_CONFIGS } from '../types/shellTypes';
import { subscribeTerminalLogs } from '../terminalLogBus';
import type { TerminalSyntheticLog } from '../terminalLogBus';

interface TerminalProps {
  shell?: ShellType;
  onShellChange?: (shell: ShellType) => void;
  onClose?: () => void;
  height?: number;
  onHeightChange?: (height: number) => void;
  className?: string;
  aiAssistantWidth?: number;
  fileExplorerWidth?: number;
}


const HEIGHT_CONST = {
  MIN: 28,
  DEFAULT: 320,
  MAX_RATIO: 0.7,
  SNAP_THRESHOLD_MIN: 12,
  SNAP_THRESHOLD_MAX: 16,
};

export const Terminal: React.FC<TerminalProps> = ({
  shell = 'powershell',
  onShellChange,
  onClose,

  height: _height = HEIGHT_CONST.DEFAULT,
  onHeightChange,
  className = '',
  aiAssistantWidth = 500,
  fileExplorerWidth = 300,
}) => {
  const [currentShell, setCurrentShell] = useState<ShellType>(shell);
  const [currentDirectory, setCurrentDirectory] = useState('C:\\Users\\Desktop');
  const [isMaximized, setIsMaximized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);


  const persistedHeightRef = useRef<number | null>(null);
  const previousNonMinHeightRef = useRef<number>(_height || HEIGHT_CONST.DEFAULT);

  const dragHeightRef = useRef<number | null>(null);


  useEffect(() => {
    try {
      const stored = localStorage.getItem('synTerminal:height');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed) && parsed > HEIGHT_CONST.MIN) {
          onHeightChange?.(parsed);
          previousNonMinHeightRef.current = parsed;
          persistedHeightRef.current = parsed;
        }
      }
    } catch {

    }

  }, []);

  const { history, currentInput, setCurrentInput, addCommand, navigateHistory, clearHistory } =
    useTerminalHistory();


  useEffect(() => {
    const isDev = (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') || false;
    let count = 0;
    const unsub = subscribeTerminalLogs((log: TerminalSyntheticLog) => {
      if (isDev) console.warn('[DEV][store] terminal log', ++count);
      addCommand({
        command: `[${log.channel}]`,
        args: [],
        timestamp: log.timestamp,
        output: `${log.level.toUpperCase()}: ${log.message}`,
        exitCode: 0,
      });
    });
    return () => {
      try {
        unsub();
      } catch {}
    };
  }, [addCommand]);

  const handleShellChange = (newShell: ShellType) => {
    setCurrentShell(newShell);
    onShellChange?.(newShell);
  };

  const handleCommand = useCallback(
    async (command: string, args: string[]) => {
      const timestamp = new Date();
      setIsProcessing(true);

      try {

        const result = await processCommand(command, args, currentShell, currentDirectory);

        const terminalCommand: TerminalCommand = {
          command,
          args,
          timestamp,
          ...(result.output && { output: result.output }),
          ...(result.error && { error: result.error }),
          exitCode: result.exitCode,
        };

        addCommand(terminalCommand);


        if (result.newDirectory) {
          setCurrentDirectory(result.newDirectory);
        }
      } catch (error) {
        const terminalCommand: TerminalCommand = {
          command,
          args,
          timestamp,
          error: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          exitCode: 1,
        };
        addCommand(terminalCommand);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentShell, currentDirectory, addCommand]
  );

  const applySnappedHeight = useCallback(
    (raw: number) => {
      const maxHeight = Math.floor(window.innerHeight * HEIGHT_CONST.MAX_RATIO);
      let target = raw;

      if (Math.abs(raw - HEIGHT_CONST.MIN) <= HEIGHT_CONST.SNAP_THRESHOLD_MIN) {
        target = HEIGHT_CONST.MIN;
      } else if (Math.abs(raw - maxHeight) <= HEIGHT_CONST.SNAP_THRESHOLD_MAX) {
        target = maxHeight;
      }

      target = Math.min(Math.max(target, HEIGHT_CONST.MIN), maxHeight);
      onHeightChange?.(target);
      if (target > HEIGHT_CONST.MIN && target < maxHeight) {
        previousNonMinHeightRef.current = target;
        persistedHeightRef.current = target;
        try {
          localStorage.setItem('synTerminal:height', String(target));
        } catch {}
      }
    },
    [onHeightChange]
  );

  const handleToggleMaximize = () => {

    if (isMinimized) {
      setIsMinimized(false);
      const restoreMin = previousNonMinHeightRef.current || HEIGHT_CONST.DEFAULT;
      onHeightChange?.(restoreMin);
      return;
    }
    if (isMaximized) {
      setIsMaximized(false);
      const restore = previousNonMinHeightRef.current || HEIGHT_CONST.DEFAULT;
      onHeightChange?.(restore);
    } else {
      setIsMaximized(true);
      const maxH = Math.floor(window.innerHeight * HEIGHT_CONST.MAX_RATIO);
      onHeightChange?.(maxH);
    }
  };

  const handleToggleMinimize = () => {
    if (isMinimized) {
      setIsMinimized(false);
      const target = previousNonMinHeightRef.current || HEIGHT_CONST.DEFAULT;
      onHeightChange?.(target);
    } else {
      if (_height > HEIGHT_CONST.MIN) {
        previousNonMinHeightRef.current = _height;
      }
      setIsMinimized(true);
      onHeightChange?.(HEIGHT_CONST.MIN);
      setIsMaximized(false);
    }
  };


  useEffect(() => {
    if (!isMaximized && !isMinimized && _height < HEIGHT_CONST.MIN) {
      onHeightChange?.(HEIGHT_CONST.MIN);
    }
  }, [_height, isMaximized, isMinimized, onHeightChange]);

  const handleClearTerminal = () => {
    clearHistory();
  };


  const effectiveHeight = isMaximized
    ? Math.floor(window.innerHeight * HEIGHT_CONST.MAX_RATIO)
    : _height;

  const isUltraCompact = isMinimized || _height <= HEIGHT_CONST.MIN + 2;

  const terminalContainer = (
    <div
      className={`${className} syn-terminal-container`}
      style={{
        height: `${effectiveHeight}px`,

        background: '#121212',
        backdropFilter: 'none',
        border: '1px solid #FFFFFF10',
        borderBottom: 'none',
        borderTop: '1px solid #FFFFFF10',
        color: '#E0E0E0',
        fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
        fontSize: '13px',
        overflow: 'hidden',
        position: 'absolute',

        bottom: '22px',

        left: fileExplorerWidth && fileExplorerWidth > 0 ? `${fileExplorerWidth}px` : 0,
        right: aiAssistantWidth ? `${aiAssistantWidth}px` : 0,
        zIndex: 2147483647,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
      }}
    >
      {}
      <div
        onMouseDown={e => {
          const startY = e.clientY;
          const startHeight = _height;
          dragHeightRef.current = startHeight;
          const onMove = (moveEvt: MouseEvent) => {
            const delta = startY - moveEvt.clientY;
            const newH = startHeight + delta;
            if (!isMaximized && !isMinimized) {
              onHeightChange?.(Math.max(newH, HEIGHT_CONST.MIN));
              dragHeightRef.current = Math.max(newH, HEIGHT_CONST.MIN);
            }
          };
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            if (!isMaximized && !isMinimized) {

              applySnappedHeight(dragHeightRef.current ?? _height);
            }
            setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          cursor: 'row-resize',
          zIndex: 10,
          background: '#0b0b0b',
        }}
      />
      {}
      <div
        style={{
          background: '#000',
          borderBottom: '1px solid #1a1a1a',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
        onDoubleClick={handleToggleMinimize}
        title={isMinimized ? 'Restore Height (Double Click)' : 'Minimize (Double Click)'}
      >
        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                background: '#1d1d1d',
                borderRadius: '50%',
                width: '8px',
                height: '8px',
              }}
            />
            <TerminalIcon size={16} color="#00A6D7" />
            <span
              style={{
                color: '#00A6D7',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '.5px',
              }}
            >
              Terminal
            </span>
          </div>

          {}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {}
            <div
              style={{
                color: SHELL_CONFIGS[currentShell].color,
                display: 'flex',
                alignItems: 'center',
                filter: 'none',
              }}
            >
              {React.createElement(SHELL_CONFIGS[currentShell].icon, {
                size: 16,
                strokeWidth: 2,
              })}
            </div>

            <div style={{ position: 'relative' }}>
              <select
                value={currentShell}
                onChange={e => handleShellChange(e.target.value as ShellType)}
                className="terminal-shell-select"
                style={{
                  background: '#0f0f10',
                  border: '1px solid #222',
                  borderRadius: '6px',
                  color: '#00A6D7',
                  fontSize: '12px',
                  fontWeight: 500,
                  padding: '6px 24px 6px 10px',
                  cursor: 'pointer',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'background .18s ease, border-color .18s ease, color .18s ease',
                  boxShadow: 'none',
                  backdropFilter: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                  minWidth: '120px',

                  margin: 0,
                  textIndent: 0,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.borderColor = '#333'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0f0f10'; e.currentTarget.style.borderColor = '#222'; }}
              >
                {Object.entries(SHELL_CONFIGS).map(([key, config]) => (
                  <option key={key} value={key} className="terminal-shell-option">
                    {config.name}
                  </option>
                ))}
              </select>

              {}
              <div
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#00A6D7',
                  pointerEvents: 'none',
                  fontSize: '10px',
                  opacity: 0.8,
                }}
              >
                ▼
              </div>
            </div>
          </div>

          {}
          <span
            style={{
              fontSize: '11px',
              color: '#7d7d7d',
              fontFamily: 'inherit',
              opacity: 0.8,
            }}
          >
            {currentDirectory}
          </span>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {}
          {isProcessing ? <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #1f1f1f',
                borderTop: '2px solid #00A6D7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            /> : null}

          {}
          <button
            onClick={handleClearTerminal}
            title="Clear terminal"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7d7d7d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#00A6D7';
              e.currentTarget.style.background = '#161616';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#7d7d7d';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <RotateCcw size={14} />
          </button>

          {}
          <button
            onClick={handleToggleMaximize}
            onContextMenu={e => {
              e.preventDefault();
              handleToggleMinimize();
            }}
            title={isMinimized ? 'Restore Size' : isMaximized ? 'Restore Size' : 'Maximize'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#7d7d7d',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#00A6D7';
              e.currentTarget.style.background = '#161616';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#7d7d7d';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isMinimized ? (
              <Minimize2 size={14} style={{ transform: 'rotate(180deg)' }} />
            ) : isMaximized ? (
              <Minimize2 size={14} />
            ) : (
              <Maximize2 size={14} />
            )}
          </button>

          {}
          {onClose ? <button
              onClick={onClose}
              title="Close terminal"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#7d7d7d',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#d14f4f';
                e.currentTarget.style.background = '#201111';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#7d7d7d';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={14} />
            </button> : null}
        </div>
      </div>

      {}
      {!isUltraCompact && (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
          }}
        >
          {}
          <TerminalOutput commands={history.commands} />

          {}
          <div
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              borderTop: '1px solid #1a1a1a',
              background: '#060606',
              minHeight: '34px',
            }}
          >
            <TerminalInput
              shell={currentShell}
              currentDirectory={currentDirectory}
              onCommand={handleCommand}
              currentInput={currentInput}
              setCurrentInput={setCurrentInput}
              onHistoryNavigate={navigateHistory}
              disabled={isProcessing}
            />
          </div>
        </div>
      )}

      {}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }


          .syn-terminal-container button[title="Clear terminal"]:hover,
          .syn-terminal-container button[title="Maximize"]:hover,
          .syn-terminal-container button[title="Restore"]:hover,
          .syn-terminal-container button[title="Close terminal"]:hover,
          .syn-terminal-container button[title="Copy command"]:hover {
            background: #161616 !important;
          }


          .terminal-shell-select:hover {
            background: #141414 !important;
          }


          .terminal-shell-select {
            position: relative;
          }


          .terminal-shell-select::-ms-expand {
            display: none;
          }

          .terminal-shell-select:focus {
            border-color: rgba(194, 167, 110, 0.4) !important;
            box-shadow: 0 0 0 2px rgba(194, 167, 110, 0.2) !important;
            outline: none !important;
          }


          .terminal-shell-select option {
            background: #0f0f10 !important;
            color: #00A6D7 !important;
            padding: 12px 16px !important;
            border: none !important;
            font-weight: 500 !important;
            font-size: 12px !important;
            margin: 0 !important;
            outline: none !important;
          }

          .terminal-shell-select option:hover {
            background: #161616 !important;
            color: #00A6D7 !important;
            outline: none !important;
            border: none !important;
          }

          .terminal-shell-select option:checked,
          .terminal-shell-select option:selected {
            background: #101010 !important;
            color: #00A6D7 !important;
            font-weight: 600 !important;
            outline: none !important;
            border: none !important;
          }


          .syn-terminal-container,
          .syn-terminal-container * {
            scrollbar-width: thin;
            scrollbar-color: #00A6D7 transparent;
          }
          .syn-terminal-container::-webkit-scrollbar,
          .syn-terminal-container *::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .syn-terminal-container::-webkit-scrollbar-thumb,
          .syn-terminal-container *::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #00A6D7, #036E8D);
            border-radius: 8px;
          }
          .syn-terminal-container::-webkit-scrollbar-track,
          .syn-terminal-container *::-webkit-scrollbar-track {
            background: transparent;
          }


          @-moz-document url-prefix() {
            .terminal-shell-select {
              background: #0f0f10 !important;
              color: #00A6D7 !important;
              border: 1px solid #222 !important;
              outline: none !important;
            }

            .terminal-shell-select option {
              background: #0f0f10 !important;
              color: #00A6D7 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }

            .terminal-shell-select option:hover,
            .terminal-shell-select option:focus {
              background: #161616 !important;
              color: #00A6D7 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }

            .terminal-shell-select option:checked {
              background: #101010 !important;
              color: #00A6D7 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }

            .terminal-shell-select:focus {
              border: 1px solid rgba(201, 178, 106, 0.5) !important;
              outline: none !important;
              box-shadow: 0 0 0 2px rgba(201, 178, 106, 0.25) !important;
            }
          }


          @media screen and (-webkit-min-device-pixel-ratio:0) {
            .terminal-shell-select {
              background: #0f0f10 !important;
              border: 1px solid #222 !important;
              outline: none !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }

            .terminal-shell-select:focus {
              border-color: rgba(201, 178, 106, 0.5) !important;
              box-shadow: 0 0 0 2px rgba(201, 178, 106, 0.25) !important;
              outline: none !important;
            }

            .terminal-shell-select option {
              background: #0f0f10 !important;
              color: #00A6D7 !important;
              border: none !important;
              outline: none !important;
              box-shadow: none !important;
            }


            .syn-terminal-container button[title="Clear terminal"]:hover,
            .syn-terminal-container button[title="Maximize"]:hover,
            .syn-terminal-container button[title="Restore"]:hover,
            .syn-terminal-container button[title="Close terminal"]:hover,
            .syn-terminal-container button[title="Copy command"]:hover {
              background: #161616 !important;
            }


            .terminal-shell-select:hover {
              background: #141414 !important;
            }
          }


          @supports (-ms-ime-align: auto) {
            .terminal-shell-select {
              background: #0f0f10 !important;
              border: 1px solid #222 !important;
              outline: none !important;
            }
          }


          .terminal-shell-select::-webkit-scrollbar {
            width: 8px;
            background: #0f0f10 !important;
          }

          .terminal-shell-select::-webkit-scrollbar-track {
            background: #0f0f10 !important;
            border-radius: 4px;
            border: none !important;
            outline: none !important;
          }

          .terminal-shell-select::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #00A6D7, #036E8D) !important;
            border-radius: 4px;
            border: none !important;
            outline: none !important;
          }

          .terminal-shell-select::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5FD6F5, #7b7b7b) !important;
          }


          .terminal-shell-select,
          .terminal-shell-select * {
            outline: none !important;
            box-shadow: none !important;
          }

          .terminal-shell-select:focus,
          .terminal-shell-select:focus * {
            border-color: rgba(201, 178, 106, 0.5) !important;
            box-shadow: 0 0 0 2px rgba(201, 178, 106, 0.25) !important;
            outline: none !important;
          }
        `}
      </style>
    </div>
  );

  return terminalContainer;
};


async function processCommand(
  command: string,
  args: string[],
  _shell: ShellType,
  currentDirectory: string
): Promise<{
  output?: string;
  error?: string;
  exitCode: number;
  newDirectory?: string;
}> {

  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 100));


  switch (command.toLowerCase()) {
    case 'help':
      return {
        output: `Available commands:\n  help - Show this help\n  clear - Clear terminal\n  echo - Print text\n  ls/dir - List files\n  cd - Change directory\n  pwd - Print working directory\n  date - Show current date\n  whoami - Show current user\n  git - Git commands\n  npm - NPM commands`,
        exitCode: 0,
      };

    case 'clear':
    case 'cls':
      return { output: '', exitCode: 0 };

    case 'echo':
      return { output: args.join(' '), exitCode: 0 };

    case 'date':
      return { output: new Date().toString(), exitCode: 0 };

    case 'whoami':
      return { output: 'synapse-user', exitCode: 0 };

    case 'pwd':
      return { output: currentDirectory, exitCode: 0 };

    case 'ls':
    case 'dir':
      return {
        output: `Directory of ${currentDirectory}\n\n📁 src\n📁 public\n📄 package.json\n📄 README.md\n📄 tsconfig.json`,
        exitCode: 0,
      };

    case 'cd':
      if (args.length === 0) {
        return { output: currentDirectory, exitCode: 0 };
      }
      const newDir = args[0] === '..' ? 'C:\\Users' : `${currentDirectory}\\${args[0]}`;
      return {
        output: '',
        exitCode: 0,
        newDirectory: newDir,
      };

    case 'git':
      if (args[0] === 'status') {
        return {
          output: `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`,
          exitCode: 0,
        };
      }
      return {
        output: `git ${args.join(' ')}\nSimulated git command executed.`,
        exitCode: 0,
      };

    case 'npm':
      return {
        output: `npm ${args.join(' ')}\nSimulated npm command executed.\n\nFor actual npm commands, use a real terminal.`,
        exitCode: 0,
      };

    case 'ruby':
    case 'irb':
      if (args.length === 0) {
        return {
          output: `Ruby ${process.version || '3.0.0'} interactive shell\nType 'exit' to quit.`,
          exitCode: 0,
        };
      }
      return {
        output: `=> ${args.join(' ')}\nSimulated Ruby execution.`,
        exitCode: 0,
      };

    case 'php':
      if (args.length === 0) {
        return {
          output: `PHP ${process.version || '8.1.0'} interactive shell\nType 'exit' to quit.`,
          exitCode: 0,
        };
      }
      return {
        output: `<?php ${args.join(' ')}\nSimulated PHP execution.`,
        exitCode: 0,
      };

    case 'docker':
      if (args[0] === 'ps') {
        return {
          output: `CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES\nNo containers running.`,
          exitCode: 0,
        };
      }
      if (args[0] === 'images') {
        return {
          output: `REPOSITORY   TAG       IMAGE ID   CREATED   SIZE\nNo images found.`,
          exitCode: 0,
        };
      }
      return {
        output: `docker ${args.join(' ')}\nSimulated Docker command executed.`,
        exitCode: 0,
      };

    case 'composer':
      return {
        output: `Composer ${args.join(' ')}\nSimulated Composer command executed.`,
        exitCode: 0,
      };

    default:
      return {
        error: `'${command}' is not recognized as an internal or external command.\nType 'help' for available commands.`,
        exitCode: 1,
      };
  }
}
