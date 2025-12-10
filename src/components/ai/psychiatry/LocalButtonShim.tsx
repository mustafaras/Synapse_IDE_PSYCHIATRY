import React from 'react';

interface LocalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const LocalButton: React.FC<LocalButtonProps> = ({ variant='secondary', size='md', icon, children, ...rest }) => {
  let padding = '8px 12px';
  if (size === 'sm') padding = '4px 8px';
  if (size === 'lg') padding = '12px 16px';

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: size === 'lg' ? 13.5 : 12,
    fontWeight: variant === 'primary' ? 600 : 500,
    fontFamily: 'inherit',
    lineHeight: 1.2,
    padding,
    borderRadius: variant === 'primary' ? 9999 : 8,
    cursor: 'pointer',
    position: 'relative',
    transition: 'filter 120ms ease, background 140ms ease, box-shadow 140ms ease, transform 120ms ease',
    outline: 'none',
  };

  let style: React.CSSProperties;
  if (variant === 'primary') {
    style = {
      ...base,
      background: 'linear-gradient(135deg, #00A6D7 0%, #3CC7FF 50%, #7EE0FF 100%)',
      color: '#041017',
      border: '0',
      boxShadow: '0 4px 14px -2px rgba(0,166,215,0.45), 0 0 0 1px rgba(0,166,215,0.35)',
    };
  } else if (variant === 'secondary') {
    style = {
      ...base,
      background: 'rgba(60,199,255,0.18)',
      color: '#E6EAF2',
      border: '1px solid rgba(60,199,255,0.55)',
      boxShadow: '0 0 0 1px rgba(60,199,255,0.25) inset',
      backdropFilter: 'blur(2px)',
    };
  } else if (variant === 'ghost') {
    style = {
      ...base,
      background: 'rgba(255,255,255,0.04)',
      color: '#E6EAF2',
      border: '1px solid rgba(255,255,255,0.18)',
    };
  } else {
    style = {
      ...base,
      background: 'rgba(255,255,255,0.06)',
      color: '#E6EAF2',
      border: '1px solid rgba(148,163,184,0.28)',
      width: 36,
      height: 36,
      padding: 0,
      borderRadius: 9999,
      gap: 0,
      fontSize: 0,
    };
  }

  return (
    <button
      type="button"
      style={style}
      onMouseEnter={e => { if (variant === 'primary') (e.currentTarget.style.filter = 'brightness(1.08)'); }}
      onMouseLeave={e => { if (variant === 'primary') (e.currentTarget.style.filter = 'brightness(1)'); }}
      onFocus={e => { if (variant === 'primary') { e.currentTarget.style.boxShadow = '0 0 0 2px #00A6D7, 0 4px 14px -2px rgba(0,166,215,0.45)'; } else { e.currentTarget.style.outline = '2px solid #00A6D7'; e.currentTarget.style.outlineOffset = '2px'; } }}
      onBlur={e => { if (variant === 'primary') { e.currentTarget.style.boxShadow = '0 4px 14px -2px rgba(0,166,215,0.45), 0 0 0 1px rgba(0,166,215,0.35)'; } else { e.currentTarget.style.outline = 'none'; } }}
      {...rest}
    >
      {icon ? <span style={{display:'inline-flex'}}>{icon}</span> : null}
      {variant !== 'icon' && children}
    </button>
  );
};
export default LocalButton;
