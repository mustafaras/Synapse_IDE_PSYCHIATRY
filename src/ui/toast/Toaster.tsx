import React from 'react';
import { createPortal } from 'react-dom';
import { useToastStore } from './store';
import './Toaster.css';

const kindIcon = (k: string) => {
  if (k === 'success') return '✓';
  if (k === 'error') return '✕';
  if (k === 'warning') return '!';
  return '•';
};


export const Toaster: React.FC = () => {
  const items = useToastStore(s => s.items);
  const dismiss = useToastStore(s => s.dismiss);

  if (typeof document === 'undefined') return null;
  const container = document.body;

  const handleActionClick = (id: string, cb?: () => void) => () => {
    try { cb?.(); } finally { dismiss(id); }
  };
  const handleDismissClick = (id: string) => () => dismiss(id);

  return createPortal(
    <div className="ai-toaster-layer" data-testid="toaster">
      <div className="ai-toaster-stack">
        {items.map(t => {
          return (
            <div key={t.id} className={`ai-toast ai-toast--${t.kind}`} data-autofade={t.duration !== undefined && t.duration > 0 ? 'true' : 'false'} data-testid="toast" data-kind={t.kind}>
              <div className="ai-toast__icon" aria-hidden>{kindIcon(t.kind)}</div>
              <div className="ai-toast__body">
                {t.title ? <div className="ai-toast__title">{t.title}</div> : null}
                <div className="ai-toast__message">{t.message}</div>
                {t.action ? (
                  <button className="ai-toast__action" onClick={handleActionClick(t.id, t.action.onClick)}>{t.action.label}</button>
                ) : null}
              </div>
              <button className="ai-toast__close" onClick={handleDismissClick(t.id)} aria-label="Dismiss">×</button>
            </div>
          );
        })}
      </div>
    </div>,
    container
  );
};

export default Toaster;
