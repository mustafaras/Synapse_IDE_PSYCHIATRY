import { css, type DefaultTheme } from 'styled-components';

export type SynapseTheme = DefaultTheme & {
  colors: {
    bg900: string; surface800: string; border700: string;
    gold500: string; gold300: string;
    text100: string; text400: string;
    danger400: string; success400: string;
  };
  radius: { sm: string; md: string; lg: string; pill: string };
  space: { x4: string; x8: string; x12: string; x16: string; x20: string; x24: string };
  shadow: { elev: string };
  z: { modal: number; popover: number; header: number };
  fonts: { mono: string; sans: string };

  focusRing: (offsetPx?: number) => ReturnType<typeof css>;
};

export const synapseTheme: SynapseTheme = {
  colors: {
    bg900: 'var(--syn-bg-900)',
    surface800: 'var(--syn-surface-800)',
    border700: 'var(--syn-border-700)',
    gold500: 'var(--syn-gold-500)',
    gold300: 'var(--syn-gold-300)',
    text100: 'var(--syn-text-100)',
    text400: 'var(--syn-text-400)',
    danger400: 'var(--syn-danger-400)',
    success400: 'var(--syn-success-400)',
  },
  radius: { sm: '12px', md: '16px', lg: '20px', pill: '999px' },
  space: { x4: '4px', x8: '8px', x12: '12px', x16: '16px', x20: '20px', x24: '24px' },
  shadow: { elev: '0 8px 24px rgba(0,0,0,.35)' },
  z: { modal: 1000, popover: 900, header: 800 },
  fonts: {
    mono: 'var(--font-mono)',
    sans: 'var(--font-sans)',
  },
  focusRing: (offsetPx = 2) => css`
    outline: ${offsetPx}px solid var(--syn-gold-300);
    outline-offset: 2px;
  `,
};



