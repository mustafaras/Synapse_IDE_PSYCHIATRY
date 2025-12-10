import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { DESIGN_TOKENS } from '../constants/design';
import { type ActiveThemeName, type Theme, type ThemeName, themes } from '../styles/theme';

interface ThemeContextType {
  theme: Theme;
  themeName: ActiveThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  designTokens: typeof DESIGN_TOKENS;
  applyThemeTransition: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

interface ThemeProviderProps { children: React.ReactNode; defaultTheme?: ThemeName }

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, defaultTheme = 'dark' }) => {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    try {
      const stored = localStorage.getItem('theme') as ThemeName | null;
      if (stored && ['light','dark','neutral','auto'].includes(stored)) return stored as ThemeName;
    } catch {}
    return defaultTheme;
  });

  const resolveTheme = (t: ThemeName): ActiveThemeName => {
    if (t === 'auto') {
      try {
        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
      } catch {}

      return 'light';
    }
    return t as ActiveThemeName;
  };

  const activeThemeName = resolveTheme(themeName);
  const currentTheme = themes[activeThemeName];

  useEffect(() => {
    if (themeName !== 'auto') return;
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setThemeName('auto');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeName]);

  useEffect(() => {
    const root = document.documentElement;
    const applyKV = (k: string, v: string) => root.style.setProperty(k, v);

    Object.entries(currentTheme.colors).forEach(([k,v]) => applyKV(`--color-${k.replace(/([A-Z])/g,'-$1').toLowerCase()}`, v));


    applyKV('--glass-background', currentTheme.colors.glass);
    applyKV('--glass-border', currentTheme.colors.glassBorder);
    const glassBackdropFilter = activeThemeName === 'neutral'
      ? `${DESIGN_TOKENS.blur.glassDark} saturate(140%)`
      : activeThemeName === 'dark'
        ? `${DESIGN_TOKENS.blur.glass} saturate(180%)`
        : `${DESIGN_TOKENS.blur.glass} saturate(200%)`;
    applyKV('--glass-backdrop-filter', glassBackdropFilter);


    const tagHoverGlow = activeThemeName === 'dark'
      ? `0 4px 12px ${currentTheme.colors.accent}40, 0 0 20px ${currentTheme.colors.accent}30`
      : activeThemeName === 'light'
        ? `0 4px 12px ${currentTheme.colors.accent}25, 0 0 15px ${currentTheme.colors.accent}20`
        : `0 4px 12px ${currentTheme.colors.accent}35, 0 0 18px ${currentTheme.colors.accent}25`;
    const tagActiveGlow = activeThemeName === 'dark'
      ? `0 6px 16px ${currentTheme.colors.accent}50, 0 0 30px ${currentTheme.colors.accent}40`
      : activeThemeName === 'light'
        ? `0 6px 16px ${currentTheme.colors.accent}30, 0 0 25px ${currentTheme.colors.accent}25`
        : `0 6px 16px ${currentTheme.colors.accent}40, 0 0 28px ${currentTheme.colors.accent}30`;
    applyKV('--tag-hover-glow', tagHoverGlow);
    applyKV('--tag-active-glow', tagActiveGlow);
    applyKV('--tag-hover-accent', currentTheme.colors.accent);

    const appTitleColor = activeThemeName === 'dark' ? '#FFFFFF' : activeThemeName === 'light' ? '#1A1A1A' : '#2D3748';
    applyKV('--app-title-color', appTitleColor);
    const highContrastTextSecondary = activeThemeName === 'dark' ? '#d1d5db' : activeThemeName === 'light' ? '#475569' : '#d1d5db';
    applyKV('--text-secondary-high-contrast', highContrastTextSecondary);
    applyKV('--text-contrast-aa', activeThemeName === 'dark' ? '#ffffff' : '#000000');
    applyKV('--text-contrast-aaa', activeThemeName === 'dark' ? '#ffffff' : '#1a1a1a');


    document.documentElement.className = `theme-${activeThemeName}`;
    document.documentElement.setAttribute('data-theme', activeThemeName);
  }, [currentTheme, activeThemeName]);

  useEffect(() => { try { localStorage.setItem('theme', themeName); } catch {} }, [themeName]);

  const setTheme = React.useCallback((t: ThemeName) => {
    if (['light','dark','neutral','auto'].includes(t)) {
      setThemeName(t);
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    const order: ThemeName[] = ['light','dark','neutral','auto'];
    const idx = order.indexOf(themeName);
    setTheme(order[(idx + 1) % order.length]);
  }, [themeName, setTheme]);

  const applyThemeTransition = React.useCallback(() => {
    document.body.style.transition = 'all 300ms ease-in-out';
    document.documentElement.style.transition = 'all 300ms ease-in-out';

    setTimeout(() => {
      document.body.style.transition = '';
      document.documentElement.style.transition = '';
    }, 350);
  }, []);

  const value = React.useMemo<ThemeContextType>(() => ({
    theme: currentTheme,
    themeName: activeThemeName,
    setTheme,
    toggleTheme,
    designTokens: DESIGN_TOKENS,
    applyThemeTransition,
  }), [currentTheme, activeThemeName, setTheme, toggleTheme, applyThemeTransition]);

  return <ThemeContext.Provider value={value}><StyledThemeProvider theme={currentTheme}>{children}</StyledThemeProvider></ThemeContext.Provider>;
};
