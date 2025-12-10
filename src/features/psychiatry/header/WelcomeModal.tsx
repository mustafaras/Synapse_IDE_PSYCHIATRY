import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
  const ref = useRef<HTMLDivElement|null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 400);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      const el = ref.current?.querySelector('button') as HTMLElement | null;
      el?.focus();
    }
  }, [open]);

  if (!open && !isClosing) return null;

  const modalContent = (
    <div
      className={`welcome-modal ${isClosing ? 'welcome-modal--closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Psychiatry Toolkit"
      style={{ zIndex: 2147483648 }}
    >
      <div className="welcome-modal__backdrop" onClick={handleClose} />
      <div className="welcome-modal__panel" ref={ref}>
        {}
        <div className="welcome-hero">
          <div className="welcome-hero__background" aria-hidden="true">
            <div className="hero-orb hero-orb--1" />
            <div className="hero-orb hero-orb--2" />
            <div className="hero-orb hero-orb--3" />
            <div className="hero-orb hero-orb--4" />
            <div className="hero-particles">
              <div className="particle particle--1" />
              <div className="particle particle--2" />
              <div className="particle particle--3" />
              <div className="particle particle--4" />
              <div className="particle particle--5" />
              <div className="particle particle--6" />
              <div className="particle particle--7" />
              <div className="particle particle--8" />
            </div>
            <div className="hero-grid" />
            <div className="hero-waves">
              <div className="wave wave--1" />
              <div className="wave wave--2" />
              <div className="wave wave--3" />
            </div>
            <div className="hero-rings">
              <div className="ring ring--1" />
              <div className="ring ring--2" />
              <div className="ring ring--3" />
            </div>
          </div>

          <div className="welcome-hero__content">
            <div className="hero-icon" aria-hidden="true">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <defs>
                  <linearGradient id="heroGrad" x1="0" y1="0" x2="80" y2="80">
                    <stop offset="0%" stopColor="#3CC7FF">
                      <animate attributeName="stop-color" values="#3CC7FF;#00d4ff;#3CC7FF" dur="4s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="50%" stopColor="#00a8e8">
                      <animate attributeName="stop-color" values="#00a8e8;#0096d6;#00a8e8" dur="4s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" stopColor="#0077b6">
                      <animate attributeName="stop-color" values="#0077b6;#005f94;#0077b6" dur="4s" repeatCount="indefinite"/>
                    </stop>
                  </linearGradient>
                  <radialGradient id="heroRadial" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3CC7FF" stopOpacity="0.6">
                      <animate attributeName="stop-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite"/>
                    </stop>
                    <stop offset="100%" stopColor="#0077b6" stopOpacity="0"/>
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <g filter="url(#glow)">
                  <circle cx="40" cy="40" r="38" stroke="url(#heroGrad)" strokeWidth="2" opacity="0.9">
                    <animate attributeName="r" values="38;39;38" dur="3s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="40" cy="40" r="32" stroke="url(#heroGrad)" strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values="32;33;32" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="40" cy="40" r="30" fill="url(#heroRadial)" opacity="0.3">
                    <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4s" repeatCount="indefinite"/>
                  </circle>
                  <path d="M40 16 L40 40 M40 40 L56 40 M40 40 L40 64 M40 40 L24 40" stroke="url(#heroGrad)" strokeWidth="4" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate" from="0 40 40" to="360 40 40" dur="20s" repeatCount="indefinite"/>
                  </path>
                  <circle cx="40" cy="40" r="5" fill="url(#heroGrad)">
                    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="r" values="5;6;5" dur="2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="24" cy="24" r="3" fill="#3CC7FF" opacity="0.9">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="56" cy="56" r="3" fill="#0077b6" opacity="0.9">
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="56" cy="24" r="2.5" fill="#3CC7FF" opacity="0.7">
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.2s" repeatCount="indefinite"/>
                  </circle>
                  <circle cx="24" cy="56" r="2.5" fill="#00a8e8" opacity="0.7">
                    <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
                  </circle>
                </g>
              </svg>
            </div>

            <h1 className="hero-title">
              <span className="hero-title__line">Welcome to</span>
              <span className="hero-title__brand">
                <span className="brand-text brand-text--primary">Psychiatry</span>
                <span className="brand-separator">·</span>
                <span className="brand-text brand-text--secondary">Toolkit</span>
                <span className="brand-badge">AI</span>
              </span>
            </h1>

            <p className="hero-subtitle">
              Specialized Clinical Decision Support System Built on Synapse IDE Architecture
            </p>

            <div className="hero-stats" aria-hidden="true">
              <div className="stat-item">
                <div className="stat-value">60+</div>
                <div className="stat-label">Clinical Scales</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">DSM-5-TR</div>
                <div className="stat-label">Evidence-Based</div>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <div className="stat-value">AI-Enhanced</div>
                <div className="stat-label">Clinical Workflow</div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="welcome-content">
          {}
          <section className="welcome-section">
            <div className="section-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="16" cy="16" r="3" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="section-title">About Psychiatry Toolkit</h2>
            <p className="section-text">
              The <strong>Psychiatry Toolkit</strong> is a specialized clinical decision support system
              designed exclusively for mental health professionals. Built upon the robust
              <strong> Synapse IDE</strong> framework (
              <a
                href="https://github.com/mustafaras/Synapse_IDE"
                target="_blank"
                rel="noopener noreferrer"
                style={{color: '#3CC7FF', textDecoration: 'none', borderBottom: '1px solid rgba(60,199,255,0.3)'}}
              >
                github.com/mustafaras/Synapse_IDE
              </a>
              ), this platform extends modern AI-powered development tools to the clinical psychiatry domain.
              Our mission is to enhance diagnostic accuracy, streamline assessment workflows, and provide
              evidence-based decision support that respects the complexity of psychiatric practice.
            </p>
          </section>

          {}
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2"/>
                  <path d="M14 8v6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Comprehensive Assessment Library</h3>
              <p className="feature-desc">
                Access 60+ validated psychiatric rating scales including PHQ-9, GAD-7, BPRS, PANSS,
                Y-BOCS, HAM-D, and specialized pediatric measures (SCARED, SDQ, Conners-3). All tools
                include automatic scoring, normed interpretation, and clinical documentation templates.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="8" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 4v4M20 4v4M4 12h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">DSM-5-TR Diagnostic Criteria</h3>
              <p className="feature-desc">
                Integrated diagnostic criteria sets for all major psychiatric disorders, including
                differential diagnosis guidance, severity specifiers, and ICD-11 cross-mapping.
                Supports structured clinical interviews and diagnostic formulation workflows.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M4 14h7l3 6 6-12 3 6h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Measurement-Based Care (MBC)</h3>
              <p className="feature-desc">
                Longitudinal symptom tracking with automated change detection, treatment response
                monitoring, and outcome visualization. Export progress reports compatible with electronic
                health records and quality improvement initiatives.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M18 11l-6 6-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-title">AI Clinical Assistant</h3>
              <p className="feature-desc">
                Context-aware AI suggestions for differential diagnosis, medication interactions,
                risk assessment, and evidence-based treatment protocols. All recommendations include
                citations to peer-reviewed literature and clinical practice guidelines.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4v20M4 14h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="14" cy="14" r="3" fill="currentColor"/>
                  <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
                  <circle cx="14" cy="20" r="1.5" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Risk & Safety Assessment</h3>
              <p className="feature-desc">
                Structured suicide risk evaluation (Columbia-Suicide Severity Rating Scale), violence
                risk assessment, and safety planning tools. Automated alerts for high-risk indicators
                and crisis intervention protocol suggestions with documented clinical decision support.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 4L18 8M14 4L10 8M14 4v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="4" y="16" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 20h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Treatment Planning & Algorithms</h3>
              <p className="feature-desc">
                Evidence-based treatment algorithms for major depressive disorder, bipolar disorder,
                schizophrenia, and anxiety disorders. Step-by-step pharmacotherapy guidance with
                dosing recommendations, monitoring schedules, and augmentation strategies per APA/CANMAT.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="6" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="10" cy="12" r="2" fill="currentColor"/>
                  <circle cx="18" cy="12" r="2" fill="currentColor"/>
                  <circle cx="10" cy="18" r="2" fill="currentColor"/>
                  <circle cx="18" cy="18" r="2" fill="currentColor"/>
                </svg>
              </div>
              <h3 className="feature-title">Patient Registry & Data Management</h3>
              <p className="feature-desc">
                Secure patient database with longitudinal clinical data storage, multi-session tracking,
                and cohort analytics. HIPAA-compliant encryption, audit logs, and customizable data
                fields for research protocols and quality assurance programs.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="8" cy="14" r="4" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="20" cy="14" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 14h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Clinical Consultation System</h3>
              <p className="feature-desc">
                Structured case presentation templates, peer consultation workflows, and supervision
                documentation tools. Support for multidisciplinary team conferences with integrated
                assessment summaries, medication lists, and treatment recommendations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M8 14l3 3 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="4" y="4" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h3 className="feature-title">Export & Reporting Tools</h3>
              <p className="feature-desc">
                Generate professional clinical reports in PDF, Word, or FHIR-compliant JSON formats.
                Automated progress notes, discharge summaries, and insurance authorization documents
                with customizable templates and institutional branding options.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M8 4h12a2 2 0 012 2v16a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-title">Evidence-Based Library</h3>
              <p className="feature-desc">
                Curated collection of clinical practice guidelines, meta-analyses, and systematic
                reviews from APA, NICE, CANMAT, and Cochrane. Quick-reference drug monographs,
                interaction checker, and FDA safety alerts integrated within clinical workflows.
              </p>
            </div>
          </div>

          {}
          <section className="welcome-section welcome-section--highlight">
            <div className="section-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <circle cx="16" cy="16" r="4" fill="currentColor"/>
              </svg>
            </div>
            <h2 className="section-title">Built on Synapse IDE Foundation</h2>
            <p className="section-text">
              This platform leverages the <strong>Synapse IDE</strong> core architecture—an advanced
              AI-powered integrated development environment—to deliver clinical-grade intelligence
              for psychiatric practice. By adapting Synapse IDE's natural language processing,
              semantic code analysis, and context-aware assistance capabilities, we've created a
              domain-specific tool that understands psychiatric terminology, diagnostic reasoning,
              and evidence-based treatment protocols. The system integrates large language models
              fine-tuned on psychiatric literature, clinical guidelines (APA, NICE, CANMAT), and
              pharmacological databases to provide contextually relevant suggestions that augment—never
              replace—clinical judgment.
            </p>
            <div className="tech-badges">
              <span className="tech-badge">Synapse Core</span>
              <span className="tech-badge">Clinical NLP</span>
              <span className="tech-badge">DSM-5-TR Engine</span>
              <span className="tech-badge">LLM Integration</span>
              <span className="tech-badge">Evidence Synthesis</span>
            </div>
          </section>

          {}
          <section className="welcome-section">
            <h2 className="section-title">Clinical Workflow Integration</h2>
            <div className="steps-list">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4 className="step-title">Access Clinical Resources</h4>
                  <p className="step-desc">Use the intelligent search to find rating scales, diagnostic criteria, treatment algorithms, and risk assessment tools. Filter by disorder category, age group, or clinical context.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4 className="step-title">Conduct Structured Assessments</h4>
                  <p className="step-desc">Administer validated instruments with automatic scoring and interpretation. Generate structured clinical documentation and progress notes with embedded measurement data.</p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4 className="step-title">Leverage AI-Enhanced Decision Support</h4>
                  <p className="step-desc">Consult the clinical AI assistant for differential diagnosis suggestions, medication interaction checks, evidence-based treatment recommendations, and risk stratification guidance—all with peer-reviewed citations.</p>
                </div>
              </div>
            </div>
          </section>

          {}
          <section className="welcome-section">
            <div className="section-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 16l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="section-title">Clinical Validation & Standards</h2>
            <p className="section-text">
              All assessment instruments and diagnostic criteria are sourced from peer-reviewed literature
              and official clinical guidelines. The platform adheres to standards established by the
              American Psychiatric Association (APA), National Institute for Health and Care Excellence (NICE),
              Canadian Network for Mood and Anxiety Treatments (CANMAT), and the World Health Organization (WHO).
              Rating scales include psychometric validation data, normative samples, and clinically meaningful
              change thresholds. AI-generated recommendations are grounded in evidence synthesis from PubMed,
              Cochrane Reviews, and major psychiatric journals, with transparent citation provenance.
            </p>
          </section>
        </div>

        {}
        <div className="welcome-footer">
          <div className="footer-content">
            <p className="footer-text">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '8px'}}>
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 4v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Version 2.1.0 • November 2025
            </p>
            <p className="footer-text" style={{marginTop: '8px', fontSize: '12px', color: '#64748B'}}>
              Developed by <strong style={{color: '#94A3B8'}}>Mustafa Raşit Şahin, PhD</strong> •
              Built on <a
                href="https://github.com/mustafaras/Synapse_IDE"
                target="_blank"
                rel="noopener noreferrer"
                style={{color: '#3CC7FF', textDecoration: 'none', borderBottom: '1px solid rgba(60,199,255,0.2)', marginLeft: '4px'}}
              >
                Synapse IDE
              </a>
            </p>
          </div>
          <button className="btn-close-welcome" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9l3 3 9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Got it, Let's Start
          </button>
        </div>
      </div>

      <style>{`

        .welcome-modal {
          position: fixed !important;
          inset: 0 !important;
          z-index: 2147483648 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          animation: fadeIn 0.3s ease-out;
        }
        .welcome-modal--closing {
          animation: fadeOut 0.4s ease-in forwards;
        }
        .welcome-modal--closing .welcome-modal__panel {
          animation: slideDown 0.4s cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
        .welcome-modal--closing .welcome-modal__backdrop {
          animation: backdropFadeOut 0.4s ease-in forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .welcome-modal__backdrop {
          position: fixed !important;
          inset: 0 !important;
          z-index: -1 !important;
          background: rgba(0, 0, 0, 0.95) !important;
          backdrop-filter: blur(40px) !important;
          -webkit-backdrop-filter: blur(40px) !important;
          animation: backdropFadeIn 0.3s ease-out;
        }
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
          }
        }
        @keyframes backdropFadeOut {
          from {
            opacity: 1;
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
          }
          to {
            opacity: 0;
            backdrop-filter: blur(0px);
            -webkit-backdrop-filter: blur(0px);
          }
        }

        .welcome-modal__panel {
          position: relative;
          width: min(1400px, calc(100vw - 48px));
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(155deg,
            rgba(10, 14, 19, 0.98) 0%,
            rgba(12, 16, 22, 0.96) 50%,
            rgba(17, 22, 28, 0.94) 100%);
          border: 1px solid rgba(60, 199, 255, 0.25);
          border-radius: 32px;
          box-shadow:
            0 32px 120px -16px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(255, 255, 255, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 60px rgba(60, 199, 255, 0.15);
          overflow: hidden;
          animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(40px) scale(0.94);
          }
        }


        .welcome-hero {
          position: relative;
          padding: 36px 60px 32px;
          overflow: hidden;
          background: linear-gradient(180deg,
            rgba(60, 199, 255, 0.08) 0%,
            transparent 100%);
          border-bottom: 1px solid rgba(60, 199, 255, 0.2);
          flex-shrink: 0;
        }

        .welcome-hero__background {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: pulse 8s ease-in-out infinite;
        }
        .hero-orb--1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #3CC7FF 0%, transparent 70%);
          top: -150px;
          right: -100px;
          animation: orbitPulse1 12s ease-in-out infinite, float1 8s ease-in-out infinite;
        }
        .hero-orb--2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #00a8e8 0%, transparent 70%);
          bottom: -100px;
          left: -80px;
          animation: orbitPulse2 10s ease-in-out infinite 1s, float2 7s ease-in-out infinite 1s;
        }
        .hero-orb--3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, #0077b6 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbitPulse3 14s ease-in-out infinite 2s, rotate360 20s linear infinite;
        }
        .hero-orb--4 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, #00d4ff 0%, transparent 70%);
          top: -50px;
          left: -50px;
          animation: orbitPulse4 9s ease-in-out infinite 1.5s, float3 6s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes orbitPulse1 {
          0%, 100% { opacity: 0.25; transform: scale(1) translateX(0); }
          25% { opacity: 0.35; transform: scale(1.15) translateX(30px); }
          50% { opacity: 0.3; transform: scale(1.1) translateX(0); }
          75% { opacity: 0.4; transform: scale(0.95) translateX(-30px); }
        }
        @keyframes orbitPulse2 {
          0%, 100% { opacity: 0.3; transform: scale(1) translateY(0); }
          33% { opacity: 0.4; transform: scale(1.2) translateY(-40px); }
          66% { opacity: 0.25; transform: scale(0.9) translateY(20px); }
        }
        @keyframes orbitPulse3 {
          0%, 100% { opacity: 0.2; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.45; transform: translate(-50%, -50%) scale(1.25); }
        }
        @keyframes orbitPulse4 {
          0%, 100% { opacity: 0.3; transform: scale(1) translate(0, 0); }
          25% { opacity: 0.4; transform: scale(1.1) translate(20px, -20px); }
          50% { opacity: 0.35; transform: scale(1.15) translate(0, -30px); }
          75% { opacity: 0.3; transform: scale(1.05) translate(-20px, -10px); }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(25px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(35px); }
        }
        @keyframes rotate360 {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }


        .hero-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #3CC7FF;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(60, 199, 255, 0.8);
        }
        .particle--1 {
          top: 20%;
          left: 10%;
          animation: particleFloat1 8s ease-in-out infinite, particleFade 4s ease-in-out infinite;
        }
        .particle--2 {
          top: 40%;
          left: 80%;
          width: 3px;
          height: 3px;
          animation: particleFloat2 10s ease-in-out infinite 1s, particleFade 5s ease-in-out infinite 1s;
        }
        .particle--3 {
          top: 60%;
          left: 15%;
          width: 5px;
          height: 5px;
          animation: particleFloat3 12s ease-in-out infinite 2s, particleFade 6s ease-in-out infinite 2s;
        }
        .particle--4 {
          top: 80%;
          left: 70%;
          animation: particleFloat4 9s ease-in-out infinite 0.5s, particleFade 4.5s ease-in-out infinite 0.5s;
        }
        .particle--5 {
          top: 15%;
          left: 50%;
          width: 3px;
          height: 3px;
          background: #00d4ff;
          animation: particleFloat1 11s ease-in-out infinite 1.5s, particleFade 5.5s ease-in-out infinite 1.5s;
        }
        .particle--6 {
          top: 70%;
          left: 40%;
          animation: particleFloat2 13s ease-in-out infinite 2.5s, particleFade 6.5s ease-in-out infinite 2.5s;
        }
        .particle--7 {
          top: 30%;
          left: 90%;
          width: 4px;
          height: 4px;
          background: #00a8e8;
          animation: particleFloat3 10s ease-in-out infinite 0.8s, particleFade 5s ease-in-out infinite 0.8s;
        }
        .particle--8 {
          top: 50%;
          left: 25%;
          width: 3px;
          height: 3px;
          animation: particleFloat4 14s ease-in-out infinite 3s, particleFade 7s ease-in-out infinite 3s;
        }

        @keyframes particleFloat1 {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -40px); }
          50% { transform: translate(60px, -20px); }
          75% { transform: translate(30px, -60px); }
        }
        @keyframes particleFloat2 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(-40px, 30px); }
          66% { transform: translate(-20px, 60px); }
        }
        @keyframes particleFloat3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(50px, -50px) rotate(180deg); }
        }
        @keyframes particleFloat4 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-30px, -30px) scale(1.2); }
          50% { transform: translate(-60px, 0) scale(0.8); }
          75% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes particleFade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }


        .hero-waves {
          position: absolute;
          inset: 0;
          overflow: hidden;
          opacity: 0.15;
        }
        .wave {
          position: absolute;
          width: 200%;
          height: 100%;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(60, 199, 255, 0.3) 25%,
            rgba(60, 199, 255, 0.5) 50%,
            rgba(60, 199, 255, 0.3) 75%,
            transparent 100%);
        }
        .wave--1 {
          top: 0;
          left: -100%;
          animation: waveMove1 15s linear infinite;
        }
        .wave--2 {
          top: 30%;
          left: -100%;
          height: 40%;
          animation: waveMove2 20s linear infinite 5s;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 212, 255, 0.2) 25%,
            rgba(0, 212, 255, 0.4) 50%,
            rgba(0, 212, 255, 0.2) 75%,
            transparent 100%);
        }
        .wave--3 {
          bottom: 0;
          left: -100%;
          height: 60%;
          animation: waveMove3 25s linear infinite 10s;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 168, 232, 0.25) 25%,
            rgba(0, 168, 232, 0.45) 50%,
            rgba(0, 168, 232, 0.25) 75%,
            transparent 100%);
        }
        @keyframes waveMove1 {
          from { transform: translateX(0); }
          to { transform: translateX(50%); }
        }
        @keyframes waveMove2 {
          from { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(25%) scaleY(1.2); }
          to { transform: translateX(50%) scaleY(1); }
        }
        @keyframes waveMove3 {
          from { transform: translateX(0) scaleY(1); }
          33% { transform: translateX(16.5%) scaleY(0.9); }
          66% { transform: translateX(33%) scaleY(1.1); }
          to { transform: translateX(50%) scaleY(1); }
        }


        .hero-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          pointer-events: none;
        }
        .ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 2px solid rgba(60, 199, 255, 0.2);
        }
        .ring--1 {
          width: 300px;
          height: 300px;
          animation: ringExpand1 6s ease-in-out infinite;
        }
        .ring--2 {
          width: 400px;
          height: 400px;
          animation: ringExpand2 8s ease-in-out infinite 2s;
          border-color: rgba(0, 212, 255, 0.15);
        }
        .ring--3 {
          width: 500px;
          height: 500px;
          animation: ringExpand3 10s ease-in-out infinite 4s;
          border-color: rgba(0, 168, 232, 0.1);
        }
        @keyframes ringExpand1 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.6;
          }
        }
        @keyframes ringExpand2 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.7) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
            opacity: 0.5;
          }
        }
        @keyframes ringExpand3 {
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.6) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.4) rotate(-180deg);
            opacity: 0.4;
          }
        }
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1) translate(var(--tx, 0), var(--ty, 0)); opacity: 0.25; }
          50% { transform: scale(1.2) translate(var(--tx, 0), var(--ty, 0)); opacity: 0.4; }
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(60, 199, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(60, 199, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.3;
          animation: gridShift 20s linear infinite;
        }
        @keyframes gridShift {
          from { background-position: 0 0, 0 0; }
          to { background-position: 50px 50px, 50px 50px; }
        }

        .welcome-hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .hero-icon {
          margin-bottom: 4px;
          filter: drop-shadow(0 0 30px rgba(60, 199, 255, 0.4));
          animation: iconLevitate 4s ease-in-out infinite;
        }
        .hero-icon svg {
          width: 52px;
          height: 52px;
          animation: iconRotate 20s linear infinite;
        }

        @keyframes iconLevitate {
          0%, 100% {
            transform: translateY(0px);
            filter: drop-shadow(0 0 30px rgba(60, 199, 255, 0.4));
          }
          50% {
            transform: translateY(-8px);
            filter: drop-shadow(0 4px 40px rgba(60, 199, 255, 0.7));
          }
        }
        @keyframes iconRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-title {
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }
        .hero-title__line {
          font-size: 14px;
          font-weight: 400;
          color: #94A3B8;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .hero-title__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 38px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .brand-text--primary {
          background: linear-gradient(135deg, #E6EAF2 0%, #94A3B8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 3s ease-in-out infinite;
        }
        .brand-separator {
          color: rgba(60, 199, 255, 0.6);
          font-weight: 300;
          font-size: 48px;
          animation: separatorPulse 2s ease-in-out infinite;
        }
        .brand-text--secondary {
          background: linear-gradient(135deg, #3CC7FF 0%, #00a8e8 65%, #0077b6 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientFlow 4s ease-in-out infinite;
        }
        .brand-badge {
          font-size: 18px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 10px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.22), rgba(60, 199, 255, 0.15));
          border: 1px solid rgba(60, 199, 255, 0.45);
          color: #3CC7FF;
          text-shadow: 0 0 12px rgba(60, 199, 255, 0.7);
          box-shadow: 0 4px 12px rgba(60, 199, 255, 0.3);
          align-self: flex-start;
          margin-top: 8px;
          animation: badgePulse 2.5s ease-in-out infinite;
        }

        @keyframes textShimmer {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        @keyframes separatorPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        @keyframes gradientFlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes badgePulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(60, 199, 255, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 6px 20px rgba(60, 199, 255, 0.5);
          }
        }

        .hero-subtitle {
          margin: 0;
          font-size: 16px;
          color: #64748B;
          max-width: 600px;
          line-height: 1.5;
          animation: subtitleFade 3s ease-in-out infinite;
        }

        @keyframes subtitleFade {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 28px;
          margin-top: 10px;
          padding: 14px 32px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.08), rgba(60, 199, 255, 0.03));
          border: 1px solid rgba(60, 199, 255, 0.2);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          animation: statFloat 3s ease-in-out infinite;
        }
        .stat-item:nth-child(1) { animation-delay: 0s; }
        .stat-item:nth-child(3) { animation-delay: 0.5s; }
        .stat-item:nth-child(5) { animation-delay: 1s; }

        .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: #3CC7FF;
          text-shadow: 0 0 16px rgba(60, 199, 255, 0.5);
          animation: statGlow 2s ease-in-out infinite;
        }
        .stat-label {
          font-size: 11px;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .stat-divider {
          width: 1px;
          height: 36px;
          background: linear-gradient(180deg, transparent, rgba(60, 199, 255, 0.3), transparent);
          animation: dividerPulse 3s ease-in-out infinite;
        }

        @keyframes statFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes statGlow {
          0%, 100% {
            text-shadow: 0 0 16px rgba(60, 199, 255, 0.5);
            filter: brightness(1);
          }
          50% {
            text-shadow: 0 0 24px rgba(60, 199, 255, 0.8);
            filter: brightness(1.2);
          }
        }
        @keyframes dividerPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }


        .welcome-content {
          flex: 1;
          overflow: auto;
          padding: 48px 60px 32px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }
        .welcome-content::-webkit-scrollbar { width: 10px; }
        .welcome-content::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
        .welcome-content::-webkit-scrollbar-thumb {
          background: rgba(60, 199, 255, 0.25);
          border-radius: 5px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .welcome-content::-webkit-scrollbar-thumb:hover {
          background: rgba(60, 199, 255, 0.4);
          background-clip: padding-box;
        }

        .welcome-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .welcome-section--highlight {
          padding: 32px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.06), rgba(60, 199, 255, 0.02));
          border: 1px solid rgba(60, 199, 255, 0.15);
          border-radius: 20px;
        }

        .section-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.12), rgba(60, 199, 255, 0.06));
          border: 1px solid rgba(60, 199, 255, 0.25);
          color: #3CC7FF;
          box-shadow: 0 4px 20px rgba(60, 199, 255, 0.15);
        }

        .section-title {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: #E6EAF2;
        }

        .section-text {
          margin: 0;
          font-size: 15px;
          line-height: 1.8;
          color: #94A3B8;
        }


        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .feature-card {
          padding: 28px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
          border: 1px solid rgba(60, 199, 255, 0.12);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.3s ease;
        }
        .feature-card:hover {
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.08), rgba(60, 199, 255, 0.03));
          border-color: rgba(60, 199, 255, 0.3);
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(60, 199, 255, 0.15);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.12), rgba(60, 199, 255, 0.06));
          border: 1px solid rgba(60, 199, 255, 0.25);
          color: #3CC7FF;
        }

        .feature-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #E6EAF2;
        }

        .feature-desc {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.6;
          color: #64748B;
        }


        .tech-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 8px;
        }
        .tech-badge {
          padding: 8px 16px;
          background: linear-gradient(145deg, rgba(60, 199, 255, 0.15), rgba(60, 199, 255, 0.08));
          border: 1px solid rgba(60, 199, 255, 0.3);
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          color: #3CC7FF;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }


        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .step-item {
          display: flex;
          gap: 20px;
          align-items: flex-start;
        }
        .step-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: linear-gradient(135deg, #3CC7FF, #00a8e8);
          color: #001018;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(60, 199, 255, 0.3);
        }
        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .step-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #E6EAF2;
        }
        .step-desc {
          margin: 0;
          font-size: 14px;
          line-height: 1.6;
          color: #64748B;
        }


        .welcome-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          padding: 24px 60px 32px;
          border-top: 1px solid rgba(60, 199, 255, 0.15);
          background: linear-gradient(180deg, transparent 0%, rgba(60, 199, 255, 0.04) 100%);
        }

        .footer-content {
          flex: 1;
        }
        .footer-text {
          margin: 0;
          font-size: 13px;
          color: #64748B;
          display: flex;
          align-items: center;
        }

        .btn-close-welcome {
          padding: 14px 32px;
          border-radius: 14px;
          border: 1px solid rgba(60, 199, 255, 0.5);
          background: linear-gradient(135deg, #3CC7FF 0%, #00a8e8 100%);
          color: #001018;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow:
            0 4px 20px rgba(60, 199, 255, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.2s ease;
        }
        .btn-close-welcome:hover {
          transform: translateY(-2px);
          box-shadow:
            0 6px 28px rgba(60, 199, 255, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          filter: brightness(1.08);
        }
        .btn-close-welcome:active {
          transform: translateY(0);
        }


        @media (max-width: 768px) {
          .welcome-hero {
            padding: 48px 32px;
          }
          .hero-title__brand {
            font-size: 36px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .welcome-content {
            padding: 32px 32px 24px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .welcome-footer {
            flex-direction: column;
            padding: 20px 32px 24px;
          }
          .hero-stats {
            flex-direction: column;
            gap: 16px;
          }
          .stat-divider {
            width: 80%;
            height: 1px;
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default WelcomeModal;
