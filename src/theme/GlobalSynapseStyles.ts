import { createGlobalStyle } from 'styled-components';

export const GlobalSynapseStyles = createGlobalStyle`
  :root {

  --syn-bg-900:#121212;
  --syn-surface-800:#1A1A1A;
  --syn-overlay: rgba(255,255,255,0.04);
  --syn-border-700:#FFFFFF10;
  --syn-gold-500:#00A6D7;
  --syn-gold-300:#5FD6F5;
  --syn-blue-gray:#AAB2BD;
  --syn-text-100:#E0E0E0;
  --syn-text-400:#A0A0A0;
  --syn-danger-400:#E74C3C;
  --syn-success-400:#2ECC71;
  --syn-warning-400:#E1C542;
  --syn-shadow-soft: rgba(0,0,0,0.3);
  --syn-border-highlight: rgba(0,166,215,0.4);
  --syn-glow-subtle: 0 0 6px rgba(0,166,215,0.3);



  --color-bg-app: var(--syn-bg-900);
  --color-bg-surface: var(--syn-surface-800);
  --color-bg-surface-alt: #252525;
  --color-bg-overlay: var(--syn-overlay);
  --color-bg-inverse: #000000;

  --color-text-primary: var(--syn-text-100);
  --color-text-secondary: var(--syn-text-400);
  --color-text-muted: #6B7280;
  --color-text-accent: var(--syn-gold-500);
  --color-text-inverse: #0F0F0F;
  --color-text-danger: var(--syn-danger-400);
  --color-text-success: var(--syn-success-400);
  --color-text-warning: var(--syn-warning-400);

  --color-border-subtle: var(--syn-border-700);
  --color-border-default: rgba(255,255,255,0.06);
  --color-border-strong: rgba(255,255,255,0.16);
  --color-border-focus: var(--syn-border-highlight);

  --color-accent-primary: var(--syn-gold-500);
  --color-accent-primary-hover: var(--syn-gold-300);
  --color-accent-primary-active: rgba(0,166,215,0.85);
  --color-accent-primary-soft: rgba(0,166,215,0.08);
  --color-accent-primary-subtle: rgba(0,166,215,0.12);

  --color-status-success: var(--syn-success-400);
  --color-status-warning: var(--syn-warning-400);
  --color-status-danger: var(--syn-danger-400);
  --color-status-info: var(--syn-blue-gray);

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 32px;
  --space-8: 40px;
  --space-x4: 4px;
  --space-x8: 8px;
  --space-x12: 12px;
  --space-x16: 16px;
  --space-x20: 20px;
  --space-x24: 24px;

  --shadow-sm: 0 1px 2px rgba(0,0,0,0.35);
  --shadow-md: 0 4px 14px rgba(0,0,0,0.40);
  --shadow-lg: 0 10px 24px rgba(0,0,0,0.45);
  --shadow-overlay: 0 0 0 1px rgba(255,255,255,0.04), 0 4px 28px rgba(0,0,0,0.55);
  --shadow-focus: 0 0 0 3px rgba(0,166,215,0.35);

  --focus-default-outline: 2px solid var(--syn-gold-500);
  --focus-critical-outline: 2px solid var(--syn-danger-400);
  --focus-subtle-outline: 1px solid rgba(255,255,255,0.22);

  --ai-surface: #000000;
  --ai-surface-alt: #0f0f10;
  --ai-border: #1f1f20;
  --ai-border-strong: #2a2a2b;
  --ai-gold: #00A6D7;
  --ai-gold-soft: #5FD6F5;
  --ai-text-secondary: #8a8a8a;
  --ai-danger: #b33939;


  --panel: var(--syn-surface-800);
  --text-1: var(--syn-text-100);
  --border: var(--syn-border-700);


  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, "Liberation Mono", Consolas, "Courier New", monospace;
  --font-sans: var(--font-mono);
  }


  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    background: var(--syn-bg-900);
    color: var(--syn-text-100);
    font-family: var(--font-mono);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }


  code, pre, kbd, samp { font-family: var(--font-mono); }


  a { color: var(--syn-gold-500); text-decoration: none; }
  a:hover { text-decoration: underline; }
  :focus-visible {
    outline: 2px solid var(--syn-gold-300);
    outline-offset: 2px;
  }


  .hairline { border: 1px solid var(--syn-border-700); }


  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-thumb { background: var(--syn-border-700); border-radius: 8px; }
  ::-webkit-scrollbar-thumb:hover { background: #2a2f40; }
  ::-webkit-scrollbar-track { background: transparent; }


  pre {
    background: var(--syn-surface-800);
    border: 1px solid var(--syn-border-700);
    border-radius: 16px;
    padding: 12px 14px;
    overflow: auto;
    line-height: 1.6;
  }
`;
