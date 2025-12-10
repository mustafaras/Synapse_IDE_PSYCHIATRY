import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'styled-components';
import { synapseTheme } from '@/theme/synapse';
import { GlobalSynapseStyles } from '@/theme/GlobalSynapseStyles';

export default function AppThemeProvider({ children }: PropsWithChildren) {


  return (
    <ThemeProvider
      theme={(outer) => ({
        ...(outer as any),

        synapse: synapseTheme,

        focusRing: synapseTheme.focusRing,
      })}
    >
      <GlobalSynapseStyles />
      {children}
    </ThemeProvider>
  );
}
