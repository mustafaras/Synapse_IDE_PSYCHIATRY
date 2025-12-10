/// <reference types="vite/client" />

declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare global {
  // Flag used by key router singleton
  // eslint-disable-next-line no-var
  var __KEY_ROUTER_ATTACHED__: boolean | undefined;
}



export type ThemeName = 'light' | 'dark' | 'neutral' | 'auto';


export type Theme = typeof import('./styles/theme').themes.light;


export interface ThemeContextType {
  theme: Theme;
  themeName: Exclude<ThemeName, 'auto'>;
  setTheme: (theme: ThemeName) => void;
  toggleTheme: () => void;
  designTokens: typeof import('./constants/design').DESIGN_TOKENS;
}


declare global {
  interface CSSStyleDeclaration {
    '--theme-glass': string;
    '--theme-primary': string;
    '--theme-shadow': string;
    '--glass-backdrop-filter': string;
    '--assistant-glow': string;
    '--assistant-bg': string;
    '--assistant-primary': string;
    '--assistant-shadow-hover': string;
    '--app-title-color': string;
  }
  interface Window {
    useAiSettingsStore?: any;
    useAiConfigStore?: any;
  }
}
