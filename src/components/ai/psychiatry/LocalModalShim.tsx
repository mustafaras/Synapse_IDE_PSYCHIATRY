import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';


type Size = 'full' | 'xl' | 'lg' | 'md' | 'sm';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  variant?: string;
  children: React.ReactNode;
  className?: string;
  ['aria-labelledby']?: string;
}

export const LocalModal: React.FC<Props> = ({ isOpen, onClose, title, size = 'full', children, ...rest }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const handleKey = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKey, true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', handleKey, true); document.body.style.overflow = originalOverflow; };
  }, [isOpen, handleKey]);

  if (!isOpen || typeof document === 'undefined') return null;

  if (!containerRef.current) {
    containerRef.current = document.createElement('div');
    containerRef.current.setAttribute('data-psych-modal-root','');
    document.body.appendChild(containerRef.current);
  }

  const modalNode = (
    <div
      role="dialog" aria-modal="true" {...rest}
      style={{ position: 'fixed', inset: 0, zIndex: 2147483647, isolation:'isolate', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,10,16,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: size === 'full' ? '100vw' : 'min(1200px,96vw)',
          height: size === 'full' ? '100vh' : 'min(88vh, 900px)',
          maxWidth: '100vw', maxHeight: '100vh',
          background: 'linear-gradient(180deg, rgba(9,13,18,0.98), rgba(9,13,18,0.94))',
          border: '1px solid rgba(60,199,255,0.18)',
          boxShadow: '0 24px 64px rgba(0,0,0,.55)',
          borderRadius: size === 'full' ? 0 : 12,
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(60,199,255,.12)'}}>
          <h2 style={{margin:0,fontSize:16,color:'#E6EAF2'}}>{title || 'Psychiatry Toolkit'}</h2>
          <button aria-label="Close" onClick={onClose}
            style={{width:32,height:32,borderRadius:9999,border:'1px solid rgba(148,163,184,.35)', background:'rgba(255,255,255,.05)',color:'#CBD5E1',cursor:'pointer'}}>×</button>
        </div>
        <div style={{flex:1,minHeight:0,overflow:'auto',padding:18}}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, containerRef.current);
};

export default LocalModal;
