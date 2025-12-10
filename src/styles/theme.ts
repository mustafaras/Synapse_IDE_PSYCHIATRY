import { DESIGN_TOKENS, GLASSMORPHISM_PRESETS } from '../constants/design';


export interface ThemeColors {
  background: string;
  backgroundSecondary?: string;
  backgroundTertiary?: string;
  text: string;
  textPrimary?: string;
  textSecondary: string;
  textTertiary?: string;
  textDescription: string;
  primary: string;
  primaryHover?: string;
  secondary?: string;
  accent: string;
  glass: string;
  glassBorder: string;
  aiBackground: string;
  shadowHover: string;
  surface: string;
  border: string;
  borderLight?: string;
  borderFocus?: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface Theme {
  name: 'light' | 'dark' | 'neutral';
  colors: ThemeColors;
  shadows: typeof DESIGN_TOKENS.shadows;
  blur: typeof DESIGN_TOKENS.blur;
  spacing: typeof DESIGN_TOKENS.spacing;
  borderRadius: typeof DESIGN_TOKENS.borderRadius;
  transitions: typeof DESIGN_TOKENS.transitions;
  typography: typeof DESIGN_TOKENS.typography;
  glassmorphism: typeof DESIGN_TOKENS.glassmorphism;
}


export const lightTheme: Theme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f1f3f4',
    surface: 'rgba(255,255,255,0.6)',
    text: '#1f2937',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textDescription: '#1f2937',
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderFocus: '#3b82f6',
    primary: '#0066cc',
    primaryHover: '#0052a3',
    secondary: '#7c3aed',
    accent: '#0066cc',
    glass: 'rgba(255,255,255,0.6)',
    glassBorder: 'rgba(255,255,255,0.8)',
    aiBackground: 'rgba(255,255,255,0.8)',
    shadowHover: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    success: '#10b981',
    warning: '#00A6D7',
    error: '#ef4444',
    info: '#3b82f6',
  },
  shadows: DESIGN_TOKENS.shadows,
  blur: DESIGN_TOKENS.blur,
  spacing: DESIGN_TOKENS.spacing,
  borderRadius: DESIGN_TOKENS.borderRadius,
  transitions: DESIGN_TOKENS.transitions,
  typography: DESIGN_TOKENS.typography,
  glassmorphism: DESIGN_TOKENS.glassmorphism,
};


export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    background: '#0f0f0f',
    surface: 'rgba(255,255,255,0.05)',
    text: '#f9fafb',
    textDescription: '#D1D5DB',
    textSecondary: '#d1d5db',
    border: '#1F2937',
    primary: '#6366f1',
    accent: '#6366f1',
    glass: 'rgba(255,255,255,0.05)',
    glassBorder: 'rgba(255,255,255,0.1)',
    aiBackground: 'rgba(255,255,255,0.08)',
    shadowHover: '0 8px 32px rgba(0, 0, 0, 0.37)',
    success: DESIGN_TOKENS.colors.semantic.success,
    warning: DESIGN_TOKENS.colors.semantic.warning,
    error: DESIGN_TOKENS.colors.semantic.error,
    info: DESIGN_TOKENS.colors.semantic.info,
  },
  shadows: DESIGN_TOKENS.shadows,
  blur: DESIGN_TOKENS.blur,
  spacing: DESIGN_TOKENS.spacing,
  borderRadius: DESIGN_TOKENS.borderRadius,
  transitions: DESIGN_TOKENS.transitions,
  typography: DESIGN_TOKENS.typography,
  glassmorphism: DESIGN_TOKENS.glassmorphism,
};


export const neutralTheme: Theme = {
  name: 'neutral',
  colors: {
    background: '#1e1e1e',
    surface: 'rgba(250,250,250,0.03)',
    text: '#e5e7eb',
    textDescription: '#F3F4F6',
    textSecondary: '#d1d5db',
    border: '#374151',
    primary: '#FBBF24',
    accent: '#FBBF24',
    glass: 'rgba(250,250,250,0.03)',
    glassBorder: 'rgba(251,191,36,0.2)',
    aiBackground: 'rgba(250,250,250,0.05)',
    shadowHover: '0 8px 32px rgba(251,191,36,0.15)',
    success: DESIGN_TOKENS.colors.semantic.success,
    warning: DESIGN_TOKENS.colors.semantic.warning,
    error: DESIGN_TOKENS.colors.semantic.error,
    info: DESIGN_TOKENS.colors.semantic.info,
  },
  shadows: DESIGN_TOKENS.shadows,
  blur: DESIGN_TOKENS.blur,
  spacing: DESIGN_TOKENS.spacing,
  borderRadius: DESIGN_TOKENS.borderRadius,
  transitions: DESIGN_TOKENS.transitions,
  typography: DESIGN_TOKENS.typography,
  glassmorphism: DESIGN_TOKENS.glassmorphism,
};


export const themes = {
  light: lightTheme,
  dark: darkTheme,
  neutral: neutralTheme,
} as const;


export const getTheme = (themeName: keyof typeof themes): Theme => {
  return themes[themeName];
};


export const createCSSVariables = (theme: Theme) => {
  return {

    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-border': theme.colors.border,
    '--color-primary': theme.colors.primary,
    '--color-accent': theme.colors.accent,


    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,


    '--glass-background': theme.colors.glass,
    '--glass-backdrop': DESIGN_TOKENS.glassmorphism.backdrop.glass,
    '--glass-border': theme.colors.glassBorder,
    '--glass-shadow': DESIGN_TOKENS.shadows.glass,
    '--ai-background': theme.colors.aiBackground,
    '--shadow-hover': theme.colors.shadowHover,


    '--font-family-primary': theme.typography.fontFamily.primary,
    '--font-family-brand': theme.typography.fontFamily.brand,
    '--font-family-mono': theme.typography.fontFamily.mono,
    '--font-size-xs': theme.typography.fontSize.xs,
    '--font-size-sm': theme.typography.fontSize.sm,
    '--font-size-md': theme.typography.fontSize.md,
    '--font-size-lg': theme.typography.fontSize.lg,
    '--font-size-xl': theme.typography.fontSize.xl,
    '--font-size-xxl': theme.typography.fontSize.xxl,
    '--font-size-xxxl': theme.typography.fontSize.xxxl,
    '--font-size-display': theme.typography.fontSize.display,
    '--font-size-hero': theme.typography.fontSize.hero,


    '--font-weight-thin': theme.typography.fontWeight.thin.toString(),
    '--font-weight-light': theme.typography.fontWeight.light.toString(),
    '--font-weight-normal': theme.typography.fontWeight.normal.toString(),
    '--font-weight-medium': theme.typography.fontWeight.medium.toString(),
    '--font-weight-semibold': theme.typography.fontWeight.semibold.toString(),
    '--font-weight-bold': theme.typography.fontWeight.bold.toString(),
    '--font-weight-extrabold': theme.typography.fontWeight.extrabold.toString(),
    '--font-weight-black': theme.typography.fontWeight.black.toString(),


    '--line-height-none': theme.typography.lineHeight.none.toString(),
    '--line-height-tight': theme.typography.lineHeight.tight.toString(),
    '--line-height-normal': theme.typography.lineHeight.normal.toString(),
    '--line-height-relaxed': theme.typography.lineHeight.relaxed.toString(),
    '--line-height-loose': theme.typography.lineHeight.loose.toString(),


    '--spacing-xs': theme.spacing.xs,
    '--spacing-sm': theme.spacing.sm,
    '--spacing-md': theme.spacing.md,
    '--spacing-lg': theme.spacing.lg,
    '--spacing-xl': theme.spacing.xl,
    '--spacing-xxl': theme.spacing.xxl,
    '--spacing-glass': theme.spacing.glass,
    '--spacing-hover': theme.spacing.hover,
    '--spacing-glass-dark': theme.spacing.glassDark,


    '--border-radius-xs': theme.borderRadius.xs,
    '--border-radius-sm': theme.borderRadius.sm,
    '--border-radius-md': theme.borderRadius.md,
    '--border-radius-lg': theme.borderRadius.lg,
    '--border-radius-xl': theme.borderRadius.xl,
    '--border-radius-glass': theme.borderRadius.glass,
    '--border-radius-hover': theme.borderRadius.hover,
    '--border-radius-glass-dark': theme.borderRadius.glassDark,
    '--border-radius-full': theme.borderRadius.full,
    '--border-radius-geometric': theme.borderRadius.geometric,


    '--shadow-xs': theme.shadows.xs,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl,
    '--shadow-glass': theme.shadows.glass,
    '--shadow-glass-dark': theme.shadows.glassDark,
    '--shadow-inner': theme.shadows.inner,
    '--shadow-glow': theme.shadows.glow,
    '--shadow-premium': theme.shadows.premium,


    '--blur-xs': theme.blur.xs,
    '--blur-sm': theme.blur.sm,
    '--blur-md': theme.blur.md,
    '--blur-lg': theme.blur.lg,
    '--blur-xl': theme.blur.xl,
    '--blur-glass': theme.blur.glass,
    '--blur-hover': theme.blur.hover,
    '--blur-glass-dark': theme.blur.glassDark,
    '--blur-premium': theme.blur.premium,
    '--blur-subtle': theme.blur.subtle,


    '--transition-xs': theme.transitions.xs,
    '--transition-sm': theme.transitions.sm,
    '--transition-md': theme.transitions.md,
    '--transition-lg': theme.transitions.lg,
    '--transition-xl': theme.transitions.xl,
    '--transition-glass': theme.transitions.glass,
    '--transition-hover': theme.transitions.hover,
    '--transition-glass-dark': theme.transitions.glassDark,
    '--transition-bounce': theme.transitions.bounce,
    '--transition-elastic': theme.transitions.elastic,
    '--transition-spring': theme.transitions.spring,


    '--duration-fast': DESIGN_TOKENS.animation.duration.fast,
    '--duration-medium': DESIGN_TOKENS.animation.duration.medium,
    '--duration-slow': DESIGN_TOKENS.animation.duration.slow,
    '--duration-glass': DESIGN_TOKENS.animation.duration.glass,
    '--duration-hover': DESIGN_TOKENS.animation.duration.hover,
    '--duration-glass-dark': DESIGN_TOKENS.animation.duration.glassDark,

    '--easing-ease-out': DESIGN_TOKENS.animation.easing.easeOut,
    '--easing-ease-in': DESIGN_TOKENS.animation.easing.easeIn,
    '--easing-ease-in-out': DESIGN_TOKENS.animation.easing.easeInOut,
    '--easing-bounce': DESIGN_TOKENS.animation.easing.bounce,
    '--easing-glass': DESIGN_TOKENS.animation.easing.glass,
    '--easing-hover': DESIGN_TOKENS.animation.easing.hover,
    '--easing-glass-dark': DESIGN_TOKENS.animation.easing.glassDark,
    '--easing-elastic': DESIGN_TOKENS.animation.easing.elastic,


    '--z-hide': DESIGN_TOKENS.zIndex.hide.toString(),
    '--z-auto': DESIGN_TOKENS.zIndex.auto,
    '--z-base': DESIGN_TOKENS.zIndex.base.toString(),
    '--z-docked': DESIGN_TOKENS.zIndex.docked.toString(),
    '--z-dropdown': DESIGN_TOKENS.zIndex.dropdown.toString(),
    '--z-sticky': DESIGN_TOKENS.zIndex.sticky.toString(),
    '--z-fixed': DESIGN_TOKENS.zIndex.fixed.toString(),
    '--z-backdrop': DESIGN_TOKENS.zIndex.backdrop.toString(),
    '--z-modal': DESIGN_TOKENS.zIndex.modal.toString(),
    '--z-popover': DESIGN_TOKENS.zIndex.popover.toString(),
    '--z-tooltip': DESIGN_TOKENS.zIndex.tooltip.toString(),
    '--z-toast': DESIGN_TOKENS.zIndex.toast.toString(),
  };
};


export const getGlassmorphismPreset = (variant: keyof typeof GLASSMORPHISM_PRESETS) => {
  return GLASSMORPHISM_PRESETS[variant];
};


export const getThemeGlass = (theme: Theme) => {
  return {
    background: theme.colors.glass,
    backdropFilter: DESIGN_TOKENS.glassmorphism.backdrop.glass,
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: DESIGN_TOKENS.borderRadius.glass,
    boxShadow: DESIGN_TOKENS.shadows.glass,
    transition: DESIGN_TOKENS.transitions.glass,
  };
};


export type ThemeName = 'light' | 'dark' | 'neutral' | 'auto';
export type ActiveThemeName = Exclude<ThemeName, 'auto'>;
export type ThemeType = (typeof themes)[ActiveThemeName];


export const DURATION = DESIGN_TOKENS.animation.duration;
export const EASING = DESIGN_TOKENS.animation.easing;
