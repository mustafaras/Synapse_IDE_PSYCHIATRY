import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { SYNAPSE_COLORS, SYNAPSE_ELEVATION } from '@/ui/theme/synapseTheme';

type Props = { children: React.ReactNode; enabled?: boolean };

const ideTheme = {
  colors: {
    background: SYNAPSE_COLORS.bgDark,
    surface: SYNAPSE_COLORS.bgSecondary,
    glass: SYNAPSE_COLORS.bgOverlay,
    text: SYNAPSE_COLORS.textPrimary,
    textSecondary: SYNAPSE_COLORS.textSecondary,
    border: SYNAPSE_ELEVATION.border,
    brandPrimary: SYNAPSE_COLORS.goldPrimary,
    brandAccent: SYNAPSE_COLORS.goldHover,
  },
  elevation: {
    e0: 'none',
    e1: SYNAPSE_ELEVATION.shadowSm,
    e2: SYNAPSE_ELEVATION.shadowMd,
    e3: SYNAPSE_ELEVATION.shadowLg,
  },
  radius: {
    md: '16px',
    lg: '20px',
  },
};

export const IdeThemeScope: React.FC<Props> = ({ children, enabled = true }) => {
  if (!enabled) return <>{children}</>;
  return (
    <div className="theme-ide-pro">
      <StyledThemeProvider theme={ideTheme}>{children}</StyledThemeProvider>
    </div>
  );
};

export default IdeThemeScope;
