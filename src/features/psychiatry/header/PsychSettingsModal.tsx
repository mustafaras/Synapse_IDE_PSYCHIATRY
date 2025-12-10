/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable consistent-return */
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface PsychSettingsModalProps { open: boolean; onClose: () => void; }


const LS_DENSITY = 'psy.settings.density';
const LS_BRAND_GRADIENT = 'psy.settings.brandGradient';
const LS_AUTOFOCUS = 'psy.settings.autofocusSearch';

const gradients: Record<string,string> = {
  ocean: 'linear-gradient(120deg,#00c2ff,#007bff 60%,#004d6f)',
  violet: 'linear-gradient(120deg,#a855f7,#6366f1 55%,#1d4ed8)',
  emerald: 'linear-gradient(120deg,#10b981,#059669 60%,#065f46)',
  amber: 'linear-gradient(120deg,#f59e0b,#f97316 55%,#b45309)',
};

const PsychSettingsModal: React.FC<PsychSettingsModalProps> = ({ open, onClose }) => {
  const ref = useRef<HTMLDivElement|null>(null);
  const [density, setDensity] = useState<string>(() => localStorage.getItem(LS_DENSITY) || 'comfortable');
  const [gradientKey, setGradientKey] = useState<string>(() => localStorage.getItem(LS_BRAND_GRADIENT) || 'ocean');
  const [autoFocus, setAutoFocus] = useState<boolean>(() => localStorage.getItem(LS_AUTOFOCUS) !== '0');


  useEffect(()=>{ document.documentElement.setAttribute('data-psy-density', density); localStorage.setItem(LS_DENSITY, density); },[density]);

  useEffect(()=>{ const g = gradients[gradientKey]; if(g){ document.documentElement.style.setProperty('--psy-brand-gradient', g); localStorage.setItem(LS_BRAND_GRADIENT, gradientKey); } },[gradientKey]);
  useEffect(()=>{ localStorage.setItem(LS_AUTOFOCUS, autoFocus ? '1':'0'); },[autoFocus]);

  useEffect(()=>{
    if(!open) return; const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape'){ onClose(); } }; window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey);
  },[open,onClose]);
  useEffect(()=>{ if(open){ const el = ref.current?.querySelector('button, input, select') as HTMLElement | null; el?.focus(); } },[open]);
  const focusSearch = useCallback(()=>{
    if(!autoFocus) return;
    const input = document.querySelector<HTMLInputElement>('[data-testid="search-input"]');
    input?.focus();
  },[autoFocus]);
  useEffect(()=>{ if(open) setTimeout(focusSearch, 30); },[open, focusSearch]);

  if(!open) return null;
  return (
    <div className="psy-settings" role="dialog" aria-modal aria-label="Clinical Workspace Configuration">
      <div className="psy-settings__backdrop" onClick={onClose} />
      <div className="psy-settings__panel" ref={ref}>
        <header className="psy-settings__header">
          <div className="header-content">
            <div className="header-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="url(#settingsGrad)" strokeWidth="1.5" opacity="0.6"/>
                <path d="M12 8v8M8 12h8" stroke="url(#settingsGrad)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="2" fill="url(#settingsGrad)" opacity="0.8"/>
                <defs>
                  <linearGradient id="settingsGrad" x1="0" y1="0" x2="24" y2="24">
                    <stop offset="0%" stopColor="#3CC7FF"/>
                    <stop offset="100%" stopColor="#0077b6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="header-text">
              <h2>Clinical Workspace Configuration</h2>
              <p className="header-subtitle">Customize your diagnostic environment and workflow preferences</p>
            </div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close configuration panel">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        <div className="psy-settings__body">
          {}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M6 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="section-title-group">
                <h3 className="section-title">Display & Interface</h3>
                <p className="section-desc">Visual density and spacing preferences for optimal readability</p>
              </div>
            </div>

            {}
            <div className="setting-label-group">
              <label className="setting-label">Information Density</label>
              <p className="setting-description">Adjust the spacing and size of UI elements</p>
            </div>
            <div className="density-selector" role="radiogroup" aria-label="Information density">
              {[
                { key: 'comfortable', label: 'Comfortable', desc: 'Spacious layout with enhanced readability' },
                { key: 'compact', label: 'Compact', desc: 'Condensed view for more information density' }
              ].map(d => (
                <button
                  key={d.key}
                  role="radio"
                  aria-checked={density===d.key}
                  className={density===d.key ? 'density-option active' : 'density-option'}
                  onClick={()=>setDensity(d.key)}
                  title={d.desc}
                >
                  <span className="option-label">{d.label}</span>
                  <span className="option-indicator" aria-hidden="true" />
                </button>
              ))}
            </div>

            {}
            <div className="setting-label-group" style={{marginTop: '24px'}}>
              <label className="setting-label">Psychiatry Toolkit Brand Theme</label>
              <p className="setting-description">Changes the header brand colors and accent throughout the interface</p>
            </div>
            <div className="theme-selector" role="radiogroup" aria-label="Brand color theme">
              {[
                { key: 'ocean', label: 'Ocean Blue', color: gradients.ocean },
                { key: 'violet', label: 'Deep Violet', color: gradients.violet },
                { key: 'emerald', label: 'Clinical Green', color: gradients.emerald },
                { key: 'amber', label: 'Warm Amber', color: gradients.amber }
              ].map(theme => (
                <button
                  key={theme.key}
                  role="radio"
                  aria-checked={gradientKey===theme.key}
                  className={gradientKey===theme.key ? 'theme-option active' : 'theme-option'}
                  style={{ background: theme.color }}
                  onClick={()=> setGradientKey(theme.key)}
                  aria-label={theme.label}
                  title={theme.label}
                >
                  {gradientKey===theme.key && (
                    <svg className="theme-check" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3 3 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </section>

          {}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                  <rect x="11" y="2" width="5" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
              <div className="section-title-group">
                <h3 className="section-title">Panel Management</h3>
                <p className="section-desc">Control visibility of auxiliary information panels</p>
              </div>
            </div>

            <div className="setting-row">
              <div className="panel-controls">
                <button
                  className="panel-toggle-btn"
                  onClick={()=>{ window.dispatchEvent(new KeyboardEvent('keydown',{altKey:true,shiftKey:true,key:'L'})); }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="3" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Toggle Left Sidebar</span>
                  <kbd className="kbd">Alt+Shift+L</kbd>
                </button>
                <button
                  className="panel-toggle-btn"
                  onClick={()=>{ window.dispatchEvent(new KeyboardEvent('keydown',{altKey:true,shiftKey:true,key:'R'})); }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="11" y="3" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 9h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Toggle Right Sidebar</span>
                  <kbd className="kbd">Alt+Shift+R</kbd>
                </button>
              </div>
            </div>
          </section>

          {}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2v14M2 9l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="section-title-group">
                <h3 className="section-title">Workflow & Behavior</h3>
                <p className="section-desc">Automated actions and interaction preferences</p>
              </div>
            </div>

            <label className="checkbox-setting">
              <input type="checkbox" checked={autoFocus} onChange={e=> setAutoFocus(e.target.checked)} />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">Auto-focus search on workspace open</span>
                <span className="checkbox-description">Automatically activate search input when opening the clinical workspace</span>
              </div>
            </label>

            <label className="checkbox-setting">
              <input type="checkbox" defaultChecked />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">Enable smooth animations</span>
                <span className="checkbox-description">Use smooth transitions and animations throughout the interface</span>
              </div>
            </label>

            <label className="checkbox-setting">
              <input type="checkbox" defaultChecked />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">Show keyboard shortcuts</span>
                <span className="checkbox-description">Display keyboard shortcut hints in tooltips and menus</span>
              </div>
            </label>
          </section>

          {}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="5" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M9 11v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="section-title-group">
                <h3 className="section-title">Accessibility</h3>
                <p className="section-desc">Options to improve usability for all users</p>
              </div>
            </div>

            <label className="checkbox-setting">
              <input type="checkbox" />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">High contrast mode</span>
                <span className="checkbox-description">Increase contrast ratios for better visibility</span>
              </div>
            </label>

            <label className="checkbox-setting">
              <input type="checkbox" />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">Reduce motion</span>
                <span className="checkbox-description">Minimize animations and transitions for motion sensitivity</span>
              </div>
            </label>

            <label className="checkbox-setting">
              <input type="checkbox" defaultChecked />
              <span className="checkbox-custom" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <div className="checkbox-label-group">
                <span className="checkbox-label">Screen reader optimizations</span>
                <span className="checkbox-description">Enhanced ARIA labels and semantic HTML for assistive technologies</span>
              </div>
            </label>
          </section>
        </div>

        <footer className="psy-settings__footer">
          <div className="footer-info">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Changes are saved automatically</span>
          </div>
          <div className="footer-actions">
            <button className="btn-secondary" onClick={onClose}>Close</button>
            <button className="btn-primary" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Apply Changes
            </button>
          </div>
        </footer>
      </div>
      <style>{`

      .psy-settings {
        position: fixed;
        inset: 0;
        z-index: 140;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

      .psy-settings__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.65);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      .psy-settings__panel {
        position: relative;
        width: min(820px, calc(100vw - 48px));
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(60,199,255,0.25);
        background: linear-gradient(155deg,
          rgba(17,22,28,0.96) 0%,
          rgba(12,16,22,0.97) 40%,
          rgba(10,14,19,0.98) 100%);
        border-radius: 24px;
        box-shadow:
          0 24px 80px -12px rgba(0,0,0,0.6),
          0 0 0 1px rgba(255,255,255,0.05),
          inset 0 1px 0 rgba(255,255,255,0.08);
        overflow: hidden;
        animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }


      .psy-settings__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 24px 28px 20px;
        border-bottom: 1px solid rgba(60,199,255,0.15);
        background: linear-gradient(180deg, rgba(60,199,255,0.08) 0%, transparent 100%);
      }
      .header-content {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        flex: 1;
      }
      .header-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: linear-gradient(145deg, rgba(60,199,255,0.16), rgba(60,199,255,0.08));
        border: 1px solid rgba(60,199,255,0.3);
        box-shadow: 0 4px 16px rgba(60,199,255,0.15);
        flex-shrink: 0;
      }
      .header-text {
        flex: 1;
        min-width: 0;
      }
      .psy-settings__header h2 {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.02em;
        background: linear-gradient(135deg, #E6EAF2 0%, #94A3B8 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .header-subtitle {
        margin: 0;
        font-size: 13px;
        color: #94A3B8;
        line-height: 1.5;
      }


      .psy-settings__panel button.close {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        border: 1px solid rgba(60,199,255,0.2);
        background: linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
        color: #94A3B8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      .psy-settings__panel button.close:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
        border-color: rgba(60,199,255,0.4);
        color: #E6EAF2;
      }


      .psy-settings__body {
        padding: 28px 28px 20px;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 32px;
        flex: 1;
      }
      .psy-settings__body::-webkit-scrollbar { width: 10px; }
      .psy-settings__body::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
      .psy-settings__body::-webkit-scrollbar-thumb {
        background: rgba(60,199,255,0.2);
        border-radius: 5px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .psy-settings__body::-webkit-scrollbar-thumb:hover { background: rgba(60,199,255,0.35); background-clip: padding-box; }


      .settings-section {
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .section-header {
        display: flex;
        gap: 14px;
        align-items: flex-start;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(60,199,255,0.12);
        margin-bottom: 6px;
      }
      .section-icon {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: linear-gradient(145deg, rgba(60,199,255,0.1), rgba(60,199,255,0.05));
        border: 1px solid rgba(60,199,255,0.2);
        color: #3CC7FF;
        flex-shrink: 0;
      }
      .section-title-group {
        flex: 1;
        min-width: 0;
      }
      .section-title {
        margin: 0 0 4px;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: #E6EAF2;
      }
      .section-desc {
        margin: 0;
        font-size: 12.5px;
        color: #64748B;
        line-height: 1.5;
      }


      .setting-label-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
      }
      .setting-label {
        font-size: 13.5px;
        font-weight: 600;
        color: #E6EAF2;
        letter-spacing: -0.01em;
      }
      .setting-description {
        font-size: 12px;
        color: #64748B;
        line-height: 1.5;
        margin: 0;
      }


      .density-selector {
        display: flex;
        gap: 10px;
        width: 100%;
      }
      .density-option {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1.5px solid rgba(255,255,255,0.08);
        background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        color: #94A3B8;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        position: relative;
      }
      .density-option:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
        border-color: rgba(60,199,255,0.25);
      }
      .density-option.active {
        background: linear-gradient(145deg, rgba(60,199,255,0.18), rgba(60,199,255,0.10));
        border-color: rgba(60,199,255,0.5);
        color: #E6EAF2;
        box-shadow:
          inset 2px 0 0 0 #3CC7FF,
          0 4px 16px rgba(60,199,255,0.15);
      }
      .option-label {
        font-weight: 600;
      }
      .option-indicator {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid currentColor;
        position: relative;
        transition: all 0.2s ease;
      }
      .density-option.active .option-indicator::after {
        content: "";
        position: absolute;
        inset: 3px;
        border-radius: 50%;
        background: #3CC7FF;
        box-shadow: 0 0 8px rgba(60,199,255,0.6);
      }


      .theme-selector {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .theme-option {
        width: 72px;
        height: 48px;
        border-radius: 12px;
        border: 2px solid transparent;
        cursor: pointer;
        position: relative;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }
      .theme-option:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      }
      .theme-option.active {
        border-color: rgba(255,255,255,0.7);
        box-shadow:
          0 0 0 3px rgba(60,199,255,0.25),
          0 4px 20px rgba(0,0,0,0.4);
      }
      .theme-check {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      }


      .panel-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 100%;
      }
      .panel-toggle-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.08);
        background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
        color: #E6EAF2;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.2s ease;
        text-align: left;
      }
      .panel-toggle-btn:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
        border-color: rgba(60,199,255,0.25);
      }
      .panel-toggle-btn svg {
        color: #3CC7FF;
        flex-shrink: 0;
      }
      .panel-toggle-btn span {
        flex: 1;
      }
      .kbd {
        padding: 4px 8px;
        border-radius: 6px;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        font-size: 11px;
        font-family: ui-monospace, monospace;
        color: #94A3B8;
        flex-shrink: 0;
      }


      .checkbox-setting {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
        padding: 14px 16px;
        border-radius: 12px;
        background: transparent;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
      .checkbox-setting:hover {
        background: linear-gradient(145deg, rgba(60,199,255,0.06), rgba(60,199,255,0.02));
        border-color: rgba(60,199,255,0.15);
      }
      .checkbox-setting input[type="checkbox"] {
        position: absolute;
        opacity: 0;
        pointer-events: none;
      }
      .checkbox-custom {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid rgba(60,199,255,0.3);
        background: linear-gradient(145deg, rgba(60,199,255,0.08), rgba(60,199,255,0.02));
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        flex-shrink: 0;
        margin-top: 2px;
      }
      .checkbox-custom svg {
        opacity: 0;
        transform: scale(0.7);
        transition: all 0.2s ease;
        color: #001018;
      }
      .checkbox-setting input[type="checkbox"]:checked + .checkbox-custom {
        background: linear-gradient(135deg, #3CC7FF 0%, #00a8e8 100%);
        border-color: #3CC7FF;
        box-shadow: 0 0 12px rgba(60,199,255,0.4), 0 2px 8px rgba(60,199,255,0.2);
      }
      .checkbox-setting input[type="checkbox"]:checked + .checkbox-custom svg {
        opacity: 1;
        transform: scale(1);
      }
      .checkbox-label-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .checkbox-label {
        font-size: 13.5px;
        font-weight: 600;
        color: #E6EAF2;
        letter-spacing: -0.01em;
      }
      .checkbox-description {
        font-size: 12px;
        color: #64748B;
        line-height: 1.5;
      }


      .psy-settings__footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        padding: 20px 28px 24px;
        border-top: 1px solid rgba(60,199,255,0.15);
        background: linear-gradient(180deg, transparent 0%, rgba(60,199,255,0.04) 100%);
      }
      .footer-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #64748B;
      }
      .footer-info svg {
        color: #3CC7FF;
        opacity: 0.7;
      }
      .footer-actions {
        display: flex;
        gap: 12px;
      }
      .btn-secondary {
        padding: 10px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.1);
        background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
        color: #94A3B8;
        font-size: 13.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-secondary:hover {
        background: linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
        border-color: rgba(255,255,255,0.2);
        color: #E6EAF2;
      }
      .btn-primary {
        padding: 10px 24px;
        border-radius: 12px;
        border: 1px solid rgba(60,199,255,0.5);
        background: linear-gradient(135deg, #3CC7FF 0%, #00a8e8 100%);
        color: #001018;
        font-size: 13.5px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow:
          0 4px 16px rgba(60,199,255,0.25),
          inset 0 1px 0 rgba(255,255,255,0.2);
        transition: all 0.2s ease;
      }
      .btn-primary:hover {
        transform: translateY(-1px);
        box-shadow:
          0 6px 24px rgba(60,199,255,0.35),
          inset 0 1px 0 rgba(255,255,255,0.3);
        filter: brightness(1.08);
      }
      .btn-primary:active {
        transform: translateY(0);
      }
      `}</style>
    </div>
  );
};

export default PsychSettingsModal;
