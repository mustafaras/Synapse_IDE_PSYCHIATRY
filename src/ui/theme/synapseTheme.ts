


export const SYNAPSE_COLORS = {

  bgDark: '#121212',

  bgSecondary: '#1A1A1A',

  bgOverlay: 'rgba(255, 255, 255, 0.04)',

  bgTertiary: '#252525',


  textPrimary: '#E0E0E0',

  textSecondary: '#A0A0A0',

  textAccent: '#00A6D7',

  textTertiary: '#6B7280',


  goldPrimary: '#00A6D7',

  goldSecondary: '#5FD6F5',

  goldHover: '#5FD6F5',


  blueGray: '#AAB2BD',

  blueGrayHover: '#B8C0CC',


  success: '#2ECC71',
  warning: '#E1C542',
  error: '#E74C3C',


  border: 'rgba(255, 255, 255, 0.06)',

  borderSubtle: '#FFFFFF10',

  hover: 'rgba(0, 166, 215, 0.10)',

  selected: 'rgba(0, 166, 215, 0.18)',

  divider: 'rgba(255, 255, 255, 0.08)',


  softShadow: 'rgba(0, 0, 0, 0.3)',
  shadowSoft: '0 1px 3px rgba(0, 0, 0, 0.3)',
  shadowElevated: '0 2px 6px rgba(0, 0, 0, 0.2)',
  shadowModal: '0 3px 12px rgba(0, 0, 0, 0.25)',
  borderHighlight: 'rgba(0, 166, 215, 0.5)',
  glowSubtle: '0 0 6px rgba(0, 166, 215, 0.45)',
} as const;


export const SYNAPSE_TYPO = {

  fontFamily: `'JetBrains Mono', 'Fira Code', 'Menlo', monospace`,

  fontSize: {

    small: '12px',

    base: '13px',

    medium: '14px',

    large: '16px',
  },

  fontWeight: {

    normal: 400,

    medium: 500,

    semibold: 600,
  },

  lineHeight: {

    tight: 1.2,

    normal: 1.4,

    relaxed: 1.6,
  },
} as const;


export function withAlpha(hex: string, a: number): string {
  const clean = hex.replace('#', '').trim();
  const isShort = clean.length === 3;
  const r = parseInt(isShort ? clean[0] + clean[0] : clean.slice(0, 2), 16);
  const g = parseInt(isShort ? clean[1] + clean[1] : clean.slice(2, 4), 16);
  const b = parseInt(isShort ? clean[2] + clean[2] : clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}


export function focusOutline(): string {
  return `2px solid ${SYNAPSE_COLORS.goldPrimary}`;
}


export function elevate(level: 0 | 1 | 2 | 3 = 1) {
  switch (level) {
    case 0:
      return 'none';
    case 1:
      return SYNAPSE_COLORS.shadowSoft;
    case 2:
      return SYNAPSE_COLORS.shadowElevated;
    case 3:
      return SYNAPSE_COLORS.shadowModal;
  }

  return SYNAPSE_COLORS.shadowSoft;
}


export function transition(props: string = 'all', speed: string = '180ms'): string {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const duration = prefersReduced ? '50ms' : speed;
  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';
  return `${props} ${duration} ${easing}`;
}

export type SynapseColors = typeof SYNAPSE_COLORS;
export type SynapseTypography = typeof SYNAPSE_TYPO;


export const SYNAPSE_ELEVATION = {
  surface: withAlpha('#FFFFFF', 0.04),
  surfaceHover: withAlpha('#FFFFFF', 0.06),
  surfaceActive: withAlpha('#FFFFFF', 0.08),
  border: withAlpha('#FFFFFF', 0.10),
  borderStrong: withAlpha('#FFFFFF', 0.16),
  shadowSm: '0 1px 2px rgba(0,0,0,0.35)',
  shadowMd: '0 4px 14px rgba(0,0,0,0.40)',
  shadowLg: '0 10px 24px rgba(0,0,0,0.45)'
} as const;

export const SYNAPSE_ACCENT = {
  gold: '#00A6D7',
  goldHover: '#5FD6F5',
  goldActive: '#036E8D',
  goldMuted: withAlpha('#00A6D7', 0.25),
} as const;

export const SYNAPSE_FOCUS = {
  ring: '#00A6D7',
  ringOffset: '#000000',
  width: '2px',
  radius: '12px',
} as const;

export const SYNAPSE_LAYOUT = {
  radiusSm: '8px',
  radiusMd: '12px',
  radiusLg: '16px',
  gapXs: '6px',
  gapSm: '8px',
  gapMd: '12px',
  gapLg: '16px',
  gapXl: '24px',
  padSm: '8px',
  padMd: '12px',
  padLg: '16px',
  padXl: '24px',
} as const;

export const SYNAPSE_ANIM = {
  fast: '120ms cubic-bezier(.2,.8,.2,1)',
  base: '200ms cubic-bezier(.2,.8,.2,1)',
  slow: '320ms cubic-bezier(.2,.8,.2,1)',
} as const;


export const SYNAPSE_OVERLAY = {
  backdrop: 'rgba(10,12,14,0.60)',
  backdropAlt: 'linear-gradient(rgba(10,12,14,0.72), rgba(10,12,14,0.60))',
  blur: 'blur(12px) brightness(0.9)',
  vignette: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)',
  surface: '#101317',
  surfaceBorder: 'rgba(255,255,255,0.09)',
  surfaceGlow: '0 0 0 1px rgba(255,255,255,0.05), 0 4px 18px -4px rgba(0,0,0,0.55)',
  focusRing: '0 0 0 2px rgba(0,166,215,0.55)',
} as const;


