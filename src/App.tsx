/* eslint-disable no-console */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { GlobalStyles } from './styles/GlobalStyles';
import Button from './components/atoms/Button';
import Input from './components/atoms/Input';
import AppThemeProvider from '@/app/AppThemeProvider';
import StatusBar from './components/StatusBar/StatusBar';
import NewProjectModal from './components/molecules/NewProjectModal';
import ErrorBoundary from './components/utilities/ErrorBoundary';
import TestHarness from './components/utilities/TestHarness';
import { AiAssistant } from './components/ai.ts';
import PsychiatryModal from '@/features/psychiatry/PsychiatryModal';
import WelcomeModal from '@/features/psychiatry/header/WelcomeModal';
import '@/styles/fonts.css';
import '@/styles/ui.css';
import SynapseHomepage from './components/templates/SynapseHomepage';
import { EnhancedIDE } from './components/ide/EnhancedIDE';
import CenterPanelShell from '@/centerpanel/CenterPanelShell';
import { FileExplorer } from './components/file-explorer/FileExplorer';

import { Code, FolderOpen, Monitor, Moon, Plus, Sun } from 'lucide-react';
import { storage } from './services/storage';
import { initializeSampleData } from './utils/sampleData';
import { wireNetworkEvents } from './utils/resilience/netEvents';
import { flags } from './config/flags';
import { useSettingsStore } from '@/store/useSettingsStore';


const ThemeToggle: React.FC = () => {
  const { themeName, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (themeName) {
      case 'light':
        return <Sun size={16} />;
      case 'dark':
        return <Moon size={16} />;
      case 'neutral':
        return <Monitor size={16} />;
      default:
        return <Monitor size={16} />;
    }
  };

  return (
    <Button
      className="active-chip focus-ring"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      icon={getIcon()}
      aria-label={`Switch to ${themeName === 'light' ? 'dark' : themeName === 'dark' ? 'neutral' : 'light'} theme`}
    >
      {themeName}
    </Button>
  );
};

interface DemoPageProps { onOpenPsychiatry: () => void }
const DemoPage: React.FC<DemoPageProps> = ({ onOpenPsychiatry }) => {

  const loadPersisted = useSettingsStore(s => s.loadPersisted);
  useEffect(() => { try { loadPersisted().catch(() => {}); } catch {} }, [loadPersisted]);
  useEffect(() => { wireNetworkEvents(); }, []);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const [recentProjects, setRecentProjects] = useState(() => storage.getRecentProjects());

  const handleCreateProject = async (projectData: {
    name: string;
    template: string;
    description?: string;
  }) => {

    const newProject = {
      id: Date.now().toString(),
      name: projectData.name,
      template: projectData.template,
      description: projectData.description,
      createdAt: new Date().toISOString(),
    };


    const updatedProjects = [newProject, ...recentProjects].slice(0, 10);
    setRecentProjects(updatedProjects);
    storage.setRecentProjects(updatedProjects);

    console.log('Project created:', newProject);
  };

  const handleOpenProject = (project: any) => {
    console.log('Opening project:', project);

  };


  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-background)',
        fontFamily: 'var(--font-family-primary)',
        transition: 'all 300ms var(--timing-function-global)',
      }}
    >
      <header
        className="glass-surface"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--glass-background)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            paddingInline: 'clamp(1rem, 5vw, 4rem)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--spacing-lg) clamp(1rem, 5vw, 4rem)',
            transition: 'all 300ms var(--timing-function-global)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Code size={24} color="white" />
            </div>
            <div>
              <h1
                className="glow-text"
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-xl)',
                  fontFamily: 'var(--font-family-brand)',
                  fontWeight: 'var(--font-weight-bold)',
                  lineHeight: 'var(--line-height-tight)',
                }}
              >
                SynapseIDE
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--color-text-secondary)',
                  fontFamily: 'var(--font-family-primary)',
                }}
              >
                Professional Development Environment
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            {}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {}
      <section
        style={{
          background: `linear-gradient(135deg,
            var(--color-background) 0%,
            var(--color-primary)05 50%,
            var(--color-background) 100%)`,
          borderBottom: '1px solid var(--color-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            paddingInline: 'clamp(1rem, 5vw, 4rem)',
            padding: 'var(--spacing-xxl) clamp(1rem, 5vw, 4rem) var(--spacing-xl)',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: 'var(--spacing-lg)',
              animation: 'pulse-glow 3s ease-in-out infinite',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                minWidth: '80px',
                minHeight: '80px',
                filter: 'drop-shadow(0 0 20px currentColor)',
              }}
            >
              <defs>
                <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--logo-color-primary)" />
                  <stop offset="100%" stopColor="var(--logo-color-secondary)" />
                </linearGradient>
              </defs>
              {}
              <circle
                cx="40"
                cy="40"
                r="38"
                stroke="url(#logo-gradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.3"
              />
              <circle
                cx="40"
                cy="40"
                r="28"
                stroke="url(#logo-gradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <circle
                cx="40"
                cy="40"
                r="18"
                stroke="url(#logo-gradient)"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
              />
              <circle cx="40" cy="40" r="8" fill="url(#logo-gradient)" />
              {}
              <line
                x1="20"
                y1="20"
                x2="35"
                y2="35"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line
                x1="60"
                y1="20"
                x2="45"
                y2="35"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line
                x1="20"
                y1="60"
                x2="35"
                y2="45"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <line
                x1="60"
                y1="60"
                x2="45"
                y2="45"
                stroke="url(#logo-gradient)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              {}
              <circle cx="20" cy="20" r="3" fill="url(#logo-gradient)" opacity="0.8" />
              <circle cx="60" cy="20" r="3" fill="url(#logo-gradient)" opacity="0.8" />
              <circle cx="20" cy="60" r="3" fill="url(#logo-gradient)" opacity="0.8" />
              <circle cx="60" cy="60" r="3" fill="url(#logo-gradient)" opacity="0.8" />
            </svg>
          </div>

          {}
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-text-secondary)',
              margin: '0 0 var(--spacing-md) 0',
              fontFamily: 'var(--font-family-primary)',
            }}
          >
            Welcome To
          </p>

          {}
          <h1
            style={{
              fontSize: 'clamp(3.5rem, 8vw, 5rem)',
              fontWeight: '800',
              lineHeight: '0.9',
              margin: '0 0 var(--spacing-lg) 0',
              background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(59, 130, 246, 0.5)',
              fontFamily: 'var(--font-family-brand)',
              letterSpacing: '-0.02em',
              filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))',
            }}
          >
            SynapseIDE
          </h1>

          {}
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              fontVariant: 'small-caps',
              letterSpacing: '1rem',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '0 0 var(--spacing-xl) 0',
              fontFamily: 'var(--font-family-primary)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            }}
          >
            The Future of Development
          </p>

          {}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            <div className="active-chip" style={{ padding: 'var(--spacing-xs) var(--spacing-md)' }}>
              <span
                style={{
                  fontFamily: 'var(--font-family-primary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                ⚡ Inter Typography
              </span>
            </div>
            <div
              className="active-chip"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                background:
                  'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #00A6D7, #036E8D)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  color: '#00A6D7',
                  letterSpacing: '0.5px',
                }}
              >
                Glassmorphism
              </span>
            </div>
            <div
              className="active-chip"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                background:
                  'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  background: 'linear-gradient(45deg, #00A6D7, #036E8D)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  color: '#00A6D7',
                  letterSpacing: '0.5px',
                }}
              >
                12-Column Grid
              </span>
            </div>
            <div
              className="active-chip"
              style={{
                padding: 'var(--spacing-xs) var(--spacing-md)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                background:
                  'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.05))',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                borderRadius: '6px',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #6A9955, #4CAF50)',
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-family-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  color: '#6A9955',
                  letterSpacing: '0.5px',
                }}
              >
                Max Contrast
              </span>
            </div>
          </div>
        </div>
      </section>

      <main
        style={{
          flex: 1,
          background: 'var(--color-background)',
          transition: 'all 300ms var(--timing-function-global)',
          padding: 'var(--spacing-xl) 0',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            paddingInline: 'clamp(1rem, 5vw, 4rem)',
          }}
        >
          <div className="grid" style={{ gap: 'var(--spacing-lg)', alignItems: 'start' }}>
            {}
            <div className="col-12 col-md-6">
              <div
                className="glass-surface"
                style={{ padding: 'var(--spacing-xl)', height: '100%' }}
              >
                <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                  <h2
                    className="glow-text"
                    style={{
                      marginBottom: 'var(--spacing-md)',
                      fontSize: 'var(--font-size-xxl)',
                      fontFamily: 'var(--font-family-brand)',
                      fontWeight: 'var(--font-weight-bold)',
                      lineHeight: 'var(--line-height-tight)',
                    }}
                  >
                    Welcome to SynapseIDE
                  </h2>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family-primary)',
                      fontSize: 'var(--font-size-md)',
                      lineHeight: 'var(--line-height-relaxed)',
                      marginBottom: 'var(--spacing-lg)',
                    }}
                  >
                    A revolutionary IDE with advanced AI assistance, glassmorphism design, and
                    maximum contrast for accessibility. Built with modern web technologies and
                    Bauhaus design principles.
                  </p>
                </div>

                {}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: 'var(--spacing-md)',
                    marginBottom: 'var(--spacing-lg)',
                  }}
                >
                  <Button
                    className="focus-ring"
                    variant="primary"
                    icon={<Plus size={16} />}
                    onClick={() => setIsNewProjectModalOpen(true)}
                  >
                    New Project
                  </Button>
                  <Button
                    className="focus-ring"
                    variant="secondary"
                    icon={<FolderOpen size={16} />}
                  >
                    Open File
                  </Button>
                  <Button
                    className="focus-ring"
                    variant="ghost"
                    onClick={onOpenPsychiatry}
                  >
                    Psychiatry
                  </Button>
                </div>

                {}
                <div className="focus-ring">
                  <Input
                    label="Quick Search"
                    placeholder="Search projects, files, or commands..."
                  />
                </div>
              </div>
            </div>

            {}
            <div className="col-12 col-md-6">
              <div
                className="glass-surface"
                style={{ padding: 'var(--spacing-xl)', height: '100%' }}
              >
                <h3
                  className="glow-text"
                  style={{
                    marginBottom: 'var(--spacing-lg)',
                    fontSize: 'var(--font-size-xl)',
                    fontFamily: 'var(--font-family-brand)',
                    fontWeight: 'var(--font-weight-semibold)',
                    lineHeight: 'var(--line-height-tight)',
                  }}
                >
                  Recent Projects
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {recentProjects.length > 0 ? (
                    recentProjects.slice(0, 5).map((project: any, index: number) => (
                      <div
                        key={project.id || index}
                        className="active-chip focus-ring"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOpenProject(project); } }}
                        onClick={() => handleOpenProject(project)}
                        style={{
                          padding: 'var(--spacing-md)',
                          cursor: 'pointer',
                          borderRadius: 'var(--border-radius-md)',
                          transition: 'all 300ms var(--timing-function-global)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                color: 'var(--color-text)',
                                fontWeight: 'var(--font-weight-medium)',
                                fontFamily: 'var(--font-family-primary)',
                                fontSize: 'var(--font-size-md)',
                                marginBottom: 'var(--spacing-xs)',
                              }}
                            >
                              {project.name}
                            </div>
                            {project.template ? <div
                                style={{
                                  fontSize: 'var(--font-size-sm)',
                                  color: 'var(--color-text-secondary)',
                                  fontFamily: 'var(--font-family-primary)',
                                }}
                              >
                                {project.template}
                              </div> : null}
                          </div>
                          <Button variant="ghost" size="sm" className="focus-ring">
                            Open
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className="glass-surface"
                      style={{
                        padding: 'var(--spacing-xl)',
                        textAlign: 'center',
                        border: '2px dashed var(--color-border)',
                        borderRadius: 'var(--border-radius-lg)',
                      }}
                    >
                      <p
                        style={{
                          color: 'var(--color-text-secondary)',
                          fontStyle: 'italic',
                          fontFamily: 'var(--font-family-primary)',
                          fontSize: 'var(--font-size-md)',
                          margin: 0,
                        }}
                      >
                        No recent projects. Create your first project to get started!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            <div className="col-12">
              <div className="glass-surface" style={{ padding: 'var(--spacing-xl)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                  <h3
                    className="glow-text"
                    style={{
                      marginBottom: 'var(--spacing-md)',
                      fontSize: 'var(--font-size-xxl)',
                      fontFamily: 'var(--font-family-brand)',
                      fontWeight: 'var(--font-weight-bold)',
                      lineHeight: 'var(--line-height-tight)',
                    }}
                  >
                    Powerful IDE Features
                  </h3>
                  <p
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-family-primary)',
                      fontSize: 'var(--font-size-lg)',
                      lineHeight: 'var(--line-height-relaxed)',
                      maxWidth: '600px',
                      margin: '0 auto',
                    }}
                  >
                    Experience next-generation development tools designed for modern workflows
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'var(--spacing-lg)',
                    maxWidth: '1200px',
                    margin: '0 auto',
                  }}
                >
                  {[
                    {
                      name: 'Monaco Editor',
                      desc: 'Industry-standard code editor with advanced IntelliSense',
                      icon: '⚡',
                    },
                    {
                      name: 'AI Assistant',
                      desc: 'Intelligent code completion and AI-powered suggestions',
                      icon: '🤖',
                    },
                    {
                      name: 'Multi-Language',
                      desc: 'Support for 30+ programming languages and frameworks',
                      icon: '🌐',
                    },
                    {
                      name: 'Git Integration',
                      desc: 'Built-in version control with visual diff and merge tools',
                      icon: '🔄',
                    },
                    {
                      name: 'Live Collaboration',
                      desc: 'Real-time team coding with synchronized editing',
                      icon: '👥',
                    },
                    {
                      name: 'Plugin System',
                      desc: 'Extensible architecture with rich ecosystem support',
                      icon: '🔧',
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="active-chip focus-ring"
                      style={{
                        padding: 'var(--spacing-lg)',
                        textAlign: 'center',
                        background: 'var(--glass-background)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--border-radius-lg)',
                        transition: 'all 300ms var(--timing-function-global)',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '2rem',
                          marginBottom: 'var(--spacing-md)',
                          lineHeight: 1,
                        }}
                      >
                        {feature.icon}
                      </div>
                      <h4
                        style={{
                          margin: 0,
                          marginBottom: 'var(--spacing-sm)',
                          fontSize: 'var(--font-size-lg)',
                          fontWeight: 'var(--font-weight-semibold)',
                          color: 'var(--color-text)',
                          fontFamily: 'var(--font-family-brand)',
                          lineHeight: 'var(--line-height-tight)',
                        }}
                      >
                        {feature.name}
                      </h4>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 'var(--line-height-relaxed)',
                          fontFamily: 'var(--font-family-primary)',
                        }}
                      >
                        {feature.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {}
      {(() => {
        try {
          const sp = new URLSearchParams(window.location.search);
          if (sp.get('tests') === '1') {
            return <TestHarness />;
          }
        } catch {}
        return null;
      })()}

      <footer
        className="glass-surface"
        style={{
          marginTop: 'auto',
          background: 'var(--glass-background)',
          borderTop: '1px solid var(--color-border)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
        }}
      >
        <div
          className="container"
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            paddingInline: 'clamp(1rem, 5vw, 4rem)',
            padding: 'var(--spacing-lg) clamp(1rem, 5vw, 4rem)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <div>
              <h4
                className="glow-text"
                style={{
                  margin: 0,
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: 'var(--font-size-md)',
                  fontFamily: 'var(--font-family-brand)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                SynapseIDE
              </h4>
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                }}
              >
                Next-generation development environment
              </p>
            </div>

            <div>
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'var(--font-family-primary)',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                Built with ❤️ using React, TypeScript, and Bauhaus design principles.
                <br />
                <span className="glow-text" style={{ fontSize: 'var(--font-size-xs)' }}>
                  Experience the future of development
                </span>
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: 'var(--spacing-md)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-primary)',
              }}
            >
              Design System: Glassmorphism • Typography: Inter/Poppins • Animation:
              cubic-bezier(0.4, 0, 0.2, 1)
            </span>
          </div>
        </div>
      </footer>

  {}

      {}
      {isNewProjectModalOpen ? <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        /> : null}
    </div>
  );
};

interface MainAppProps { onOpenPsychiatry: () => void }
const MainApp: React.FC<MainAppProps> = ({ onOpenPsychiatry }) => {
  const [currentView, setCurrentView] = useState<'homepage' | 'demo' | 'ide' | 'fileexplorer' | 'clinician' | 'test'>(() => {

    if (flags.e2e) return 'ide';
    try {
      const sp = new URLSearchParams(window.location.search);
      const v = sp.get('view');
  if (v === 'ide' || v === 'homepage' || v === 'demo' || v === 'fileexplorer' || v === 'clinician' || v === 'test') return v as any;
    } catch {}
    return 'homepage';
  });

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);


  useEffect(() => {

    initializeSampleData();

    const handleNavigateToHome = (event: CustomEvent) => {
      console.log('🏠 Received home navigation event from:', event.detail?.source);
      setCurrentView('homepage');
    };

    window.addEventListener('navigateToHome', handleNavigateToHome as EventListener);


    try {
      if (typeof window !== 'undefined') {
        (window as any).e2e = (window as any).e2e || {};
        (window as any).e2e.setView = (v: 'homepage'|'demo'|'ide'|'fileexplorer') => setCurrentView(v);
        (window as any).e2e.openAssistant = async () => {
          try {
            const { useAppStore } = await import('./stores/appStore');
            useAppStore.getState().updateLayout({ aiChatVisible: true });
          } catch {}
          setIsAiAssistantOpen(true);
          await new Promise(r => setTimeout(r, 0));
        };
        (window as any).e2e.setAiChatVisible = async (v: boolean) => {
          try {
            const { useAppStore } = await import('./stores/appStore');
            useAppStore.getState().updateLayout({ aiChatVisible: !!v });
          } catch {}
          setIsAiAssistantOpen(!!v);
        };
        (window as any).e2e.toggleAI = async () => {
          try {
            const { useAppStore } = await import('./stores/appStore');
            const cur = !!useAppStore.getState().layout.aiChatVisible;
            useAppStore.getState().updateLayout({ aiChatVisible: !cur });
          } catch {}
          setIsAiAssistantOpen((v) => !v);
        };
      }
    } catch {}

  return () => {
      window.removeEventListener('navigateToHome', handleNavigateToHome as EventListener);
    };
  }, []);

  const handleLaunchWorkspace = () => {
    console.log('🚀 Launch workspace clicked');
    setCurrentView('ide');
  };


  const handleBackToHome = () => {
    console.log('🏠 Back to home clicked');
    setCurrentView('homepage');
  };


  return (
    <div style={{ minHeight: '100vh', paddingBottom: currentView === 'homepage' ? 0 : '22px', overflow: currentView === 'homepage' ? 'hidden' : undefined }}>
      {}
      <div
        data-testid="app-main-content"
        style={{
          pointerEvents: currentView !== 'ide' && isAiAssistantOpen ? 'none' : 'auto',


          visibility: currentView !== 'ide' && isAiAssistantOpen ? 'hidden' : 'visible',
        }}
        {...(currentView !== 'ide' && isAiAssistantOpen ? { inert: '' as any } : {})}
      >
    {}
        {currentView === 'homepage' ? (
          <SynapseHomepage onLaunchIDE={handleLaunchWorkspace} />
        ) : currentView === 'ide' ? (
          <div style={{ position: 'relative' }} data-testid="ide-root">
            <EnhancedIDE />
          </div>
        ) : currentView === 'clinician' ? (
          <div style={{ position: 'relative', minHeight: '100vh' }}>
            <CenterPanelShell />
          </div>
        ) : currentView === 'fileexplorer' ? (

          <div style={{ position: 'relative', minHeight: '100vh' }}>
            {}
            <div
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 1000,
              }}
            >
              <Button icon={<FolderOpen />} onClick={handleBackToHome} className="glass-button" />
            </div>
            <div style={{ padding: '60px 20px 20px 20px' }}>
              <FileExplorer />
            </div>
          </div>
        ) : (

          <div style={{ position: 'relative' }}>
            {}
            <div
              style={{
                position: 'fixed',
                top: 'var(--spacing-md)',
                left: 'var(--spacing-md)',
                zIndex: 1000,
              }}
            >
              <div className="glass-surface" style={{ padding: 'var(--spacing-xs)' }}>
                <Button
                  className="focus-ring"
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToHome}
                  icon={<Code size={16} />}
                >
                  Back to Home
                </Button>
              </div>
            </div>
            <DemoPage onOpenPsychiatry={onOpenPsychiatry} />
          </div>
        )}

        {}
        {currentView === 'ide' && (
          <StatusBar
            language="javascript"
            content="// Welcome to Synapse IDE"
            cursorPosition={{ line: 1, column: 1 }}
            encoding="UTF-8"
            lineEnding="LF"
            tabSize={2}
            indentation="spaces"
            fontSize={14}
            errors={0}
            warnings={0}
            isLiveServer={false}
            gitBranch="main"
            isModified={false}
          />
        )}
      </div>

    {}
  {currentView !== 'ide' && isAiAssistantOpen ? (
        <div
          aria-hidden="true"

          style={{ position: 'fixed', inset: 0, zIndex: 2147482990, background: 'transparent', pointerEvents: 'none' }}
        />
      ) : null}

    {}
  {currentView !== 'ide' && isAiAssistantOpen ? (
        <div
          data-component="ai-assistant"
          data-testid="assistant-modal"
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: 500,
    zIndex: 2147483647,
            background: 'var(--color-background)',
            boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 20px',
            display: 'flex',
            flexDirection: 'column',
    pointerEvents: 'auto',
    isolation: 'isolate',
          }}
        >
          <AiAssistant onClose={() => setIsAiAssistantOpen(false)} />
        </div>
      ) : null}
    </div>
  );
};

function App() {
  console.log('🚀 App component rendering...');

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPsychiatryModal, setShowPsychiatryModal] = useState(false);


  useEffect(() => {
    console.log('🧹 [App] Cleaning localStorage psychiatry state...');
    try {
      const keys = Object.keys(localStorage);
      const psychKeys = keys.filter(k => k.includes('psychiatry') || k.includes('psych'));
      console.log('🔑 [App] Found psychiatry keys:', psychKeys);


      const storeKey = psychKeys.find(k => k.includes('psychiatry') || k.includes('psych'));
      if (storeKey) {
        const data = localStorage.getItem(storeKey);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log('📦 [App] Current store data:', parsed);
            if (parsed.state?.isOpen) {
              parsed.state.isOpen = false;
              localStorage.setItem(storeKey, JSON.stringify(parsed));
              console.log('✅ [App] Forced isOpen to false in localStorage');
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error('❌ [App] localStorage cleanup failed:', e);
    }
  }, []);


  useEffect(() => {
    console.log('📝 [App] showWelcomeModal changed:', showWelcomeModal);
  }, [showWelcomeModal]);

  useEffect(() => {
    console.log('📝 [App] showPsychiatryModal changed:', showPsychiatryModal);
  }, [showPsychiatryModal]);


  const handleOpenPsychiatry = () => {
    console.log('🎯 [App] handleOpenPsychiatry called!');
    setShowWelcomeModal(true);
  };

  const handleWelcomeClose = () => {
    console.log('👋 [App] handleWelcomeClose called!');
    setShowWelcomeModal(false);

    setShowPsychiatryModal(true);
  };


  useEffect(() => {
    console.log('🔍 [App] Setting up PsychStore listener...');

    import('./features/psychiatry/store').then(({ usePsychStore }) => {
      console.log('✅ [App] PsychStore imported');

      let previousIsOpen = usePsychStore.getState().isOpen;
      console.log('📊 [App] Initial store.isOpen:', previousIsOpen);

      const unsubscribe = usePsychStore.subscribe((state) => {
        const currentIsOpen = state.isOpen;
        console.log('🔔 [App] Store changed - isOpen:', currentIsOpen, 'previous:', previousIsOpen);


        if (!previousIsOpen && currentIsOpen) {
          console.log('🚀 [App] Triggering Welcome modal!');

          setShowWelcomeModal(true);

          usePsychStore.getState().close?.();
        }
        previousIsOpen = currentIsOpen;
      });
      return () => {
        console.log('🧹 [App] Cleaning up PsychStore listener');
        unsubscribe();
      };
    });
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AppThemeProvider>
          <GlobalStyles />
          <Router>
            <div className="psych-v2">
              <MainApp onOpenPsychiatry={handleOpenPsychiatry} />

              {}
              <WelcomeModal
                open={showWelcomeModal}
                onClose={handleWelcomeClose}
              />

              <PsychiatryModal
                open={showPsychiatryModal}
                onClose={() => setShowPsychiatryModal(false)}
              />

              {}
              {}
            </div>
          </Router>
          {}
        </AppThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
