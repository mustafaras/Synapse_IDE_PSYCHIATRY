import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Clock,
  Code2,
  CornerDownLeft,
  Cpu,
  FileCode,
  FileText,
  GitBranch,
  Hash,
  MapPin,
  MemoryStick,
  Scissors,
  Settings,
  Type,
  Wifi,
  WifiOff,
  XCircle,
  Zap,
} from 'lucide-react';

interface StatusBarProps {
  language: string;
  content: string;
  cursorPosition?: { line: number; column: number };
  encoding?: string;
  lineEnding?: string;
  tabSize?: number;
  indentation?: 'spaces' | 'tabs';
  fontSize?: number;
  errors?: number;
  warnings?: number;
  isLiveServer?: boolean;
  gitBranch?: string;
  isModified?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  language = 'javascript',
  content,
  cursorPosition = { line: 1, column: 1 },
  encoding = 'UTF-8',
  lineEnding = 'LF',
  tabSize = 2,
  indentation = 'spaces',
  errors = 0,
  warnings = 0,
  isLiveServer = false,
  gitBranch = 'main',
  isModified = false,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cpuUsage, setCpuUsage] = useState(Math.floor(Math.random() * 20) + 5);
  const [memoryUsage, setMemoryUsage] = useState(Math.floor(Math.random() * 30) + 40);


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(Math.random() * 30) + 5);
      setMemoryUsage(Math.floor(Math.random() * 40) + 30);
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  const lineCount = content.split('\n').length;
  const charCount = content.length;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  const selectedText = '';
  const selectedChars = selectedText.length;

  const getLanguageIcon = (lang: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
  javascript: <Code2 size={12} color="#00A6D7" />,
      typescript: <Code2 size={12} color="#3178C6" />,
      html: <FileCode size={12} color="#E34F26" />,
      css: <Type size={12} color="#1572B6" />,
  json: <FileText size={12} color="#00A6D7" />,
      python: <Code2 size={12} color="#3776AB" />,
      java: <Code2 size={12} color="#ED8B00" />,
      cpp: <Zap size={12} color="#00599C" />,
      csharp: <Code2 size={12} color="#239120" />,
      go: <Code2 size={12} color="#00ADD8" />,
      rust: <Settings size={12} color="#CE422B" />,
      php: <Code2 size={12} color="#777BB4" />,
      ruby: <Code2 size={12} color="#CC342D" />,
      swift: <Code2 size={12} color="#FA7343" />,
      kotlin: <Code2 size={12} color="#0095D5" />,
    };
  return iconMap[lang.toLowerCase()] || <FileText size={12} color="#00A6D7" />;
  };

  return (
    <div
      data-component="status-bar"
      className="status-bar"
      style={{
        height: '24px',
        background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)',
        borderTop: '2px solid transparent',
        borderImage:
          'linear-gradient(90deg, rgba(255, 215, 0, 0.6), rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.6)) 1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, Fira Code, SF Mono, Consolas, monospace',
        fontWeight: '500',
  color: '#00A6D7',
        userSelect: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        overflow: 'hidden',
        boxShadow:
          '0 -4px 16px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(255, 215, 0, 0.2), inset 0 1px 0 rgba(255, 215, 0, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1.5px solid rgba(255, 215, 0, 0.35)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.55)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
          }}
        >
          <GitBranch size={12} color="#00A6D7" />
          <span style={{ color: '#00A6D7', fontWeight: 'bold', fontSize: '10px' }}>
            {gitBranch}
          </span>
          {isModified ? <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#FF6B6B',
                marginLeft: '4px',
              }}
            /> : null}
        </div>

        {}
        {isLiveServer ? <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: 'rgba(106, 153, 85, 0.2)',
              border: '1px solid rgba(106, 153, 85, 0.4)',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <Activity size={12} color="#6A9955" />
            <span style={{ color: '#6A9955', fontSize: '10px', fontWeight: 'bold' }}>LIVE</span>
          </div> : null}

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1.5px solid rgba(255, 215, 0, 0.35)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.55)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
          }}
        >
          {getLanguageIcon(language)}
          <span
            style={{
              color: '#00A6D7',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              fontSize: '10px',
            }}
          >
            {language}
          </span>
        </div>

        {}
        {(errors > 0 || warnings > 0) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
            }}
          >
            {errors > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                  background: 'rgba(244, 71, 71, 0.2)',
                  border: '1px solid rgba(244, 71, 71, 0.4)',
                  borderRadius: '4px',
                }}
              >
                <XCircle size={12} color="#F44747" />
                <span style={{ color: '#F44747', fontSize: '10px', fontWeight: 'bold' }}>
                  {errors}
                </span>
              </div>
            )}
            {warnings > 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 6px',
                  background: 'rgba(255, 140, 0, 0.2)',
                  border: '1px solid rgba(255, 140, 0, 0.4)',
                  borderRadius: '4px',
                }}
              >
                <AlertTriangle size={12} color="#FF8C00" />
                <span style={{ color: '#FF8C00', fontSize: '10px', fontWeight: 'bold' }}>
                  {warnings}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            color: '#D4D4D4',
            fontSize: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FileText size={10} color="#00A6D7" />
            <span style={{ color: '#00A6D7' }}>{lineCount}</span>
            <span style={{ color: '#888888', fontSize: '9px' }}>lines</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Type size={10} color="#00A6D7" />
            <span style={{ color: '#00A6D7' }}>{wordCount}</span>
            <span style={{ color: '#888888', fontSize: '9px' }}>words</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Hash size={10} color="#00A6D7" />
            <span style={{ color: '#00A6D7' }}>{charCount}</span>
            <span style={{ color: '#888888', fontSize: '9px' }}>chars</span>
          </div>
          {selectedChars > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Scissors size={10} color="#00CED1" />
              <span style={{ color: '#00CED1' }}>{selectedChars}</span>
              <span style={{ color: '#888888', fontSize: '9px' }}>selected</span>
            </div>
          )}
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#D4D4D4',
            fontSize: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              background: cpuUsage > 80 ? 'rgba(244, 71, 71, 0.2)' : 'rgba(255, 215, 0, 0.1)',
              border: `1px solid ${cpuUsage > 80 ? 'rgba(244, 71, 71, 0.4)' : 'rgba(255, 215, 0, 0.3)'}`,
              borderRadius: '3px',
            }}
          >
            <Cpu size={10} color={cpuUsage > 80 ? '#F44747' : '#00A6D7'} />
            <span style={{ color: cpuUsage > 80 ? '#F44747' : '#00A6D7', fontWeight: 'bold' }}>
              {cpuUsage}%
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 6px',
              background: memoryUsage > 85 ? 'rgba(244, 71, 71, 0.2)' : 'rgba(255, 215, 0, 0.1)',
              border: `1px solid ${memoryUsage > 85 ? 'rgba(244, 71, 71, 0.4)' : 'rgba(255, 215, 0, 0.3)'}`,
              borderRadius: '3px',
            }}
          >
            <MemoryStick size={10} color={memoryUsage > 85 ? '#F44747' : '#00A6D7'} />
            <span style={{ color: memoryUsage > 85 ? '#F44747' : '#00A6D7', fontWeight: 'bold' }}>
              {memoryUsage}%
            </span>
          </div>
        </div>
      </div>

      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            background: 'rgba(255, 215, 0, 0.12)',
            border: '1.5px solid rgba(255, 215, 0, 0.35)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 8px rgba(255, 215, 0, 0.2)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.22)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.55)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 215, 0, 0.3)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.35)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.2)';
          }}
        >
          <MapPin size={12} color="#00A6D7" />
          <span style={{ color: '#00A6D7', fontWeight: 'bold', fontSize: '10px' }}>
            {cursorPosition.line}:{cursorPosition.column}
          </span>
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            color: '#D4D4D4',
            padding: '2px 6px',
            borderRadius: '3px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Settings size={10} color="#888888" />
          <span style={{ fontSize: '10px', color: '#888888' }}>
            {indentation === 'spaces' ? `${tabSize} Spaces` : `${tabSize} Tabs`}
          </span>
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#D4D4D4',
            cursor: 'pointer',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <FileCode size={10} color="#888888" />
          <span style={{ color: '#888888' }}>{encoding}</span>
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#D4D4D4',
            cursor: 'pointer',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '3px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <CornerDownLeft size={10} color="#888888" />
          <span style={{ color: '#888888' }}>{lineEnding}</span>
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontSize: '10px',
            padding: '4px 6px',
            background: isOnline ? 'rgba(106, 153, 85, 0.2)' : 'rgba(244, 71, 71, 0.2)',
            border: `1px solid ${isOnline ? 'rgba(106, 153, 85, 0.4)' : 'rgba(244, 71, 71, 0.4)'}`,
            borderRadius: '4px',
          }}
        >
          {isOnline ? <Wifi size={10} color="#6A9955" /> : <WifiOff size={10} color="#F44747" />}
          <span style={{ color: isOnline ? '#6A9955' : '#F44747', fontWeight: 'bold' }}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '4px 10px',
            background: 'rgba(255, 215, 0, 0.25)',
            border: '1.5px solid rgba(255, 215, 0, 0.5)',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 2px 12px rgba(255, 215, 0, 0.3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.35)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.7)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 215, 0, 0.25)';
            e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.5)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(255, 215, 0, 0.3)';
          }}
        >
          <Clock size={10} color="#00A6D7" />
          <span style={{ color: '#00A6D7' }}>
            {currentTime.toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {}
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .status-bar {
          animation: slideIn 0.3s ease-out;
        }


        .status-bar::-webkit-scrollbar {
          height: 2px;
        }

        .status-bar::-webkit-scrollbar-track {
          background: rgba(255, 215, 0, 0.1);
        }

        .status-bar::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.5);
          border-radius: 1px;
        }

        .status-bar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 215, 0, 0.8);
        }


        @media (max-width: 768px) {
          .status-bar {
            padding: 0 8px;
            font-size: 10px;
          }
        }


        @media (prefers-contrast: high) {
          .status-bar {
            background: #000000 !important;
            border-top: 2px solid #00A6D7 !important;
            color: #FFFFFF !important;
          }
        }


        @media (prefers-reduced-motion: reduce) {
          .status-bar,
          .status-bar * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};
