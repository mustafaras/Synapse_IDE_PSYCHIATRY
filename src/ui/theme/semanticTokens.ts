

import { SYNAPSE_COLORS, SYNAPSE_ELEVATION, withAlpha } from './synapseTheme';


export const RADIUS_SCALE = {

  sm: '6px',
  md: '10px',
  lg: '16px',
  xl: '20px',
  pill: '999px',
} as const;

export const SPACING_SCALE = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',

  x4: '4px',
  x8: '8px',
  x12: '12px',
  x16: '16px',
  x20: '20px',
  x24: '24px',
} as const;

export const SHADOW_SCALE = {
  sm: SYNAPSE_ELEVATION.shadowSm,
  md: SYNAPSE_ELEVATION.shadowMd,
  lg: SYNAPSE_ELEVATION.shadowLg,
  overlay: '0 0 0 1px rgba(255,255,255,0.04), 0 4px 28px rgba(0,0,0,0.55)',
  focus: '0 0 0 3px rgba(0,166,215,0.35)',
} as const;


export const SEMANTIC_COLORS = {
  bg: {
    app: SYNAPSE_COLORS.bgDark,
    surface: SYNAPSE_COLORS.bgSecondary,
    surfaceAlt: SYNAPSE_COLORS.bgTertiary,
    surfaceHover: withAlpha('#FFFFFF', 0.06),
    surfaceActive: withAlpha('#FFFFFF', 0.08),
    overlay: SYNAPSE_COLORS.bgOverlay,
    inverse: '#000000',
  },
  text: {
    primary: SYNAPSE_COLORS.textPrimary,
    secondary: SYNAPSE_COLORS.textSecondary,
    muted: SYNAPSE_COLORS.textTertiary,
    accent: SYNAPSE_COLORS.textAccent,
    inverse: '#0F0F0F',
    danger: SYNAPSE_COLORS.error,
    success: SYNAPSE_COLORS.success,
    warning: SYNAPSE_COLORS.warning,
  },
  border: {
    subtle: SYNAPSE_COLORS.borderSubtle,
    default: SYNAPSE_COLORS.border,
    strong: withAlpha('#FFFFFF', 0.16),
    focus: SYNAPSE_COLORS.borderHighlight,
  },
  accent: {
    primary: SYNAPSE_COLORS.goldPrimary,
    primaryHover: SYNAPSE_COLORS.goldSecondary,
    primaryActive: withAlpha(SYNAPSE_COLORS.goldPrimary, 0.85),
    primarySoft: SYNAPSE_COLORS.hover,
    primarySubtle: SYNAPSE_COLORS.selected,
    fgOn: '#111111',
  },
  status: {
    success: SYNAPSE_COLORS.success,
    warning: SYNAPSE_COLORS.warning,
    danger: SYNAPSE_COLORS.error,
    info: SYNAPSE_COLORS.blueGray,
  },
} as const;


export const FOCUS_VARIANTS = {
  default: {
    outline: `2px solid ${SYNAPSE_COLORS.goldPrimary}`,
    outlineOffset: '2px',
  },
  critical: {
    outline: '2px solid #E74C3C',
    outlineOffset: '2px',
  },
  subtle: {
    outline: '1px solid rgba(255,255,255,0.22)',
    outlineOffset: '2px',
  },
} as const;


export const AI_PALETTE = {
  surface: '#000000',
  surfaceAlt: '#0f0f10',
  border: '#1f1f20',
  borderStrong: '#2a2a2b',
  gold: '#00A6D7',
  goldSoft: '#5FD6F5',
  textSecondary: '#8a8a8a',
  danger: '#b33939',
} as const;


export const SEMANTIC_TOKENS = {
  color: SEMANTIC_COLORS,
  radius: RADIUS_SCALE,
  space: SPACING_SCALE,
  shadow: SHADOW_SCALE,
  focus: FOCUS_VARIANTS,
  aiPalette: AI_PALETTE,
} as const;

export type SemanticTokens = typeof SEMANTIC_TOKENS;


export function focusStyle(variant: keyof typeof FOCUS_VARIANTS = 'default') {
  const v = FOCUS_VARIANTS[variant];
  return `${v.outline}; outline-offset:${v.outlineOffset};`;
}
