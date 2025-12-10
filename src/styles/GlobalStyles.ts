import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`











  :root {

  --font-system-primary: var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace);
  --font-system-brand: var(--font-code, 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace);


    --timing-function-global: cubic-bezier(0.4, 0, 0.2, 1);


    --grid-columns: repeat(12, 1fr);
    --grid-gap: clamp(1rem, 2.5vw, 2rem);
    --container-max-width: 1440px;
    --container-padding: clamp(1rem, 5vw, 4rem);


    --contrast-high: 21:1;
    --contrast-medium: 7:1;
    --contrast-low: 4.5:1;


    --logo-color-primary: #3B82F6;
    --logo-color-secondary: #9333EA;


  --header-bg: linear-gradient(180deg, rgba(26,26,26,0.96), rgba(18,18,18,0.96));
  --header-border: 1px solid #FFFFFF10;
  --header-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 6px 16px rgba(0,0,0,0.35);
  --header-z: 1001;
  }


  :root {
    --font-ui: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-code: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;

    --font-family-primary: var(--font-code);
    --font-family-brand: var(--font-code);
    --font-family-mono: var(--font-code);
  }


  .neural-glass-card-final,
  .neural-glass-card-final *,
  .neural-glass-card-final *:before,
  .neural-glass-card-final *:after,
  .neural-glass-card-final *::before,
  .neural-glass-card-final *::after,
  [data-component="neural-glass-card-final"],
  [data-component="neural-glass-card-final"] *,
  [data-component="neural-glass-card-final"] *:before,
  [data-component="neural-glass-card-final"] *:after,
  [data-component="neural-glass-card-final"] *::before,
  [data-component="neural-glass-card-final"] *::after {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 0 !important;
    border-width: 0 !important;
    border-style: none !important;
    border-color: transparent !important;
    border-radius: 0 !important;
    outline: 0 !important;
    outline-width: 0 !important;
    outline-style: none !important;
    outline-color: transparent !important;
    outline-offset: 0 !important;
    box-shadow: none !important;
    text-shadow: none !important;
    -webkit-appearance: none !important;
    -moz-appearance: none !important;
    appearance: none !important;
  }


  .neural-glass-card-final {
    background: transparent !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
  }


  .neural-glass-card-final:hover,
  .neural-glass-card-final:focus,
  .neural-glass-card-final:active {
    background: transparent !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    box-shadow: none !important;
    border: 0 !important;
    outline: 0 !important;
  }


  html body * .neural-glass-card-final,
  html body * .neural-glass-card-final * {
    background: transparent !important;
    background-color: transparent !important;
    border: 0 !important;
    outline: 0 !important;
    box-shadow: none !important;
  }


  [data-theme="light"] {
    --logo-color-primary: #3B82F6;
    --logo-color-secondary: #60A5FA;
    --logo-glow-color: #60A5FA;
  }

  [data-theme="dark"] {
    --logo-color-primary: #6366f1;
    --logo-color-secondary: #8B5CF6;
    --logo-glow-color: #8B5CF6;
  }

  [data-theme="neutral"] {
    --logo-color-primary: #FBBF24;
    --logo-color-secondary: #FACC15;
    --logo-glow-color: #FACC15;
  }


  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 10px var(--logo-glow-color)) drop-shadow(0 0 20px var(--logo-glow-color));
      transform: scale(1);
    }
    50% {
      filter: drop-shadow(0 0 20px var(--logo-glow-color)) drop-shadow(0 0 40px var(--logo-glow-color));
      transform: scale(1.05);
    }
  }

  @keyframes glow-text-pulse {
    0%, 100% {
      text-shadow: 0 0 4px var(--color-primary)30;
    }
    50% {
      text-shadow: 0 0 4px var(--color-primary)30;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }


  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }


  .neural-glass-card,
  .neural-glass-card *,
  .neural-glass-card *::before,
  .neural-glass-card *::after {
    border: none !important;
    border-width: 0 !important;
    border-style: none !important;
    border-color: transparent !important;
    outline: none !important;
    outline-width: 0 !important;
    outline-style: none !important;
    outline-color: transparent !important;
  }


  .neural-glass-card.glass-surface,
  [data-component="neural-glass-card"].glass-surface {
    border: none !important;
    border-width: 0 !important;
    border-style: none !important;
    border-color: transparent !important;
    outline: none !important;
    outline-width: 0 !important;
    outline-style: none !important;
    outline-color: transparent !important;
  }

  html {
    font-size: 16px;
    line-height: var(--line-height-normal, 1.5);
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    scroll-behavior: smooth;

    transition: var(--transition-theme, all 300ms var(--timing-function-global));
  }


  :root {

    transition: var(--transition-theme, all 300ms var(--timing-function-global));
  }


  * {

    transition: background-color 300ms var(--timing-function-global),
                color 300ms var(--timing-function-global),
                border-color 300ms var(--timing-function-global),
                box-shadow 300ms var(--timing-function-global),
                backdrop-filter 300ms var(--timing-function-global);
  }


  *:where(.no-transition, .no-transition *) {
    transition: none !important;
  }


  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    html {
      scroll-behavior: auto;
    }
  }


  body {

    background: var(--color-background);
    color: var(--color-text);

  font-family: var(--font-code);
    font-size: var(--font-size-md);
    line-height: var(--line-height-normal);
    font-weight: 400;
    font-feature-settings: 'liga' 1, 'kern' 1;


    overflow-x: hidden;
    min-height: 100vh;
    position: relative;


    transition: var(--transition-theme, all 300ms var(--timing-function-global));
  }


  .container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding-inline: var(--container-padding);
    width: 100%;
  }

  .grid {
    display: grid;
    grid-template-columns: var(--grid-columns);
    gap: var(--grid-gap);
    width: 100%;
  }

  .grid-responsive {
    display: grid;
    gap: var(--grid-gap);
    grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  }


  .col-1 { grid-column: span 1; }
  .col-2 { grid-column: span 2; }
  .col-3 { grid-column: span 3; }
  .col-4 { grid-column: span 4; }
  .col-5 { grid-column: span 5; }
  .col-6 { grid-column: span 6; }
  .col-7 { grid-column: span 7; }
  .col-8 { grid-column: span 8; }
  .col-9 { grid-column: span 9; }
  .col-10 { grid-column: span 10; }
  .col-11 { grid-column: span 11; }
  .col-12 { grid-column: span 12; }


  @media (max-width: 768px) {
    .col-md-1 { grid-column: span 1; }
    .col-md-2 { grid-column: span 2; }
    .col-md-3 { grid-column: span 3; }
    .col-md-4 { grid-column: span 4; }
    .col-md-6 { grid-column: span 6; }
    .col-md-12 { grid-column: span 12; }
  }

  @media (max-width: 480px) {
    .col-sm-12 { grid-column: span 12; }
  }


  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 25% 25%, var(--color-primary)03 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, var(--color-accent)03 0%, transparent 50%),
      linear-gradient(135deg, transparent 0%, var(--color-primary)01 50%, transparent 100%);
    pointer-events: none;
    z-index: var(--z-hide);
    transition: background var(--duration-medium) var(--easing-ease-out);
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }



  .glass-surface {
    background: var(--glass-background, rgba(255, 255, 255, 0.1));
    backdrop-filter: var(--blur-glass, blur(10px));
    -webkit-backdrop-filter: var(--blur-glass, blur(10px));
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-glass);
    transition: all 300ms var(--timing-function-global);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--glass-border, rgba(255, 255, 255, 0.3)), transparent);
      opacity: 0.6;
    }

    &:hover {
      background: var(--glass-background-hover, rgba(255, 255, 255, 0.15));
      border-color: var(--glass-border-hover, rgba(255, 255, 255, 0.3));
      box-shadow: var(--shadow-hover);
      transform: translateY(-2px);
    }
  }


  .split-resizer {
    width: 4px;
    cursor: col-resize;
    position: relative;
    user-select: none;
    padding: 0 2px;
    background: linear-gradient(180deg, var(--color-accent)40, var(--color-accent)20, var(--color-accent)40);
    box-shadow: 0 0 8px var(--color-accent)20;
    transition: all var(--duration-medium) var(--easing-ease-out);
  }
  .split-resizer:hover {
    background: linear-gradient(180deg, var(--color-accent)60, var(--color-accent)40, var(--color-accent)60);
    box-shadow: 0 0 12px var(--color-accent)40;
  }


  .preview-surface {
    background: var(--color-background);
    border-left: 1px solid var(--color-border);
    backdrop-filter: var(--blur-glass, blur(10px));
    -webkit-backdrop-filter: var(--blur-glass, blur(10px));
  }


  .syn-preview-toolbar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 4px 6px;
    background: var(--color-panel, rgba(20,20,20,0.6));
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 2;
    backdrop-filter: var(--blur-glass, blur(8px));
    -webkit-backdrop-filter: var(--blur-glass, blur(8px));
  }
  .syn-preview-toolbar .ptb-btn,
  .syn-preview-toolbar .ptb-seg,
  .syn-preview-toolbar .ptb-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--button-background, #00000066);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    line-height: 1;
  }
  .syn-preview-toolbar .ptb-btn:hover,
  .syn-preview-toolbar .ptb-seg:hover,
  .syn-preview-toolbar .ptb-toggle:hover {
    filter: brightness(1.1);
  }
  .syn-preview-toolbar .ptb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .syn-preview-toolbar .ptb-sep { width: 1px; height: 24px; background: var(--color-border); margin: 0 2px; }
  .syn-preview-toolbar .ptb-segment { display: inline-flex; gap: 4px; }
  .syn-preview-toolbar .ptb-seg.is-active { outline: 2px solid var(--color-accent); outline-offset: 0; }
  .syn-preview-toolbar .ptb-toggle input { position: absolute; opacity: 0; pointer-events: none; }
  .syn-preview-toolbar .ptb-toggle-ui { display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; }
  .syn-preview-toolbar .ptb-text { display: inline-block; }
  .syn-preview-toolbar .ptb-select { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; }
  .syn-preview-toolbar .ptb-select select {
    appearance: none;
    background: var(--button-background, #00000066);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 4px 8px;
    margin-left: 6px;
    font-size: 12px;
  }


  @media (max-width: 1280px) {
  .syn-preview-toolbar { gap: 4px; padding: 4px; }
    .syn-preview-toolbar .ptb-text { display: none; }
    .syn-preview-toolbar .ptb-btn,
    .syn-preview-toolbar .ptb-seg,
  .syn-preview-toolbar .ptb-toggle { padding: 4px; }
  }


  .glow-text {
    font-family: var(--font-system-brand);
    font-weight: 600;
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 0 4px var(--color-primary)30;
    transition: all 300ms var(--timing-function-global);
    position: relative;

    &:hover {
      text-shadow: 0 0 4px var(--color-primary)30;
      transform: scale(1.02);
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, var(--color-primary)20, var(--color-accent)20);
      border-radius: var(--border-radius-sm);
      opacity: 0;
      transition: opacity 300ms var(--timing-function-global);
      z-index: -1;
    }

    &:hover::after {
      opacity: 1;
    }
  }


  .focus-ring {
    outline: none;
    transition: all 200ms var(--timing-function-global);
    position: relative;

    &:focus,
    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px var(--color-primary)20;
    }

    &:focus:not(:focus-visible) {
      outline: none;
      box-shadow: none;
    }
  }


  .active-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    background: var(--glass-background, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.2));
    border-radius: var(--border-radius-full);
    font-family: var(--font-system-primary);
    font-size: var(--font-size-sm);
    font-weight: 500;
    color: var(--color-text);
    cursor: pointer;
    transition: all 200ms var(--timing-function-global);
    user-select: none;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, var(--color-primary)30, transparent);
      transition: left 500ms var(--timing-function-global);
    }

    &:hover {
      background: var(--color-primary)20;
      border-color: var(--color-primary)40;
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);

      &::before {
        left: 100%;
      }
    }

    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &.active {
      background: var(--color-primary);
      color: white;
      border-color: var(--color-primary);
      box-shadow: var(--shadow-glow);
    }
  }


  @media (prefers-contrast: high) {
    .glass-surface {
      border-width: 2px;
      backdrop-filter: none;
      background: var(--color-surface);
    }

    .glow-text {
      text-shadow: 0 0 2px var(--color-primary)20;
      -webkit-text-fill-color: var(--color-text);
    }

    .focus-ring:focus,
    .focus-ring:focus-visible {
      outline-width: 3px;
      outline-offset: 3px;
    }
  }


  h1, h2, h3, h4, h5, h6 {
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-text);

    font-family: var(--font-code);
    transition: color var(--duration-medium) var(--easing-ease-out);
  }

  h1 {
    font-size: var(--font-size-xxxl);
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    font-size: var(--font-size-xxl);
    margin-bottom: var(--spacing-lg);
  }

  h3 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-md);
  }

  h4 {
    font-size: var(--font-size-lg);
    margin-bottom: var(--spacing-md);
  }

  h5 {
    font-size: var(--font-size-md);
    margin-bottom: var(--spacing-sm);
  }

  h6 {
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-sm);
  }

  p {
    margin-bottom: var(--spacing-md);
    line-height: var(--line-height-relaxed);
    color: var(--color-text-secondary);
    transition: color var(--duration-medium) var(--easing-ease-out);
  }


  a {
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--duration-fast) var(--easing-ease-out);
    border-radius: var(--border-radius-xs);
  }

  a:hover {
    color: var(--color-accent);
    text-decoration: underline;
  }

  a:focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
  }


  code {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-sm);
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    color: var(--color-text);
    transition: all var(--duration-fast) var(--easing-ease-out);
  }

  pre {
    font-family: var(--font-family-mono);
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    overflow-x: auto;
    margin-bottom: var(--spacing-md);
    box-shadow: var(--shadow-sm);
    transition: all var(--duration-medium) var(--easing-ease-out);
  }

  pre code {
    background: none;
    border: none;
    padding: 0;
  }


  input, textarea, select, button {
    font-family: var(--font-family-primary);
    font-size: var(--font-size-md);
    transition: all var(--duration-fast) var(--easing-ease-out);
  }


  select {
    color: var(--color-text-primary, #e5e7eb);
    background-color: var(--color-background-tertiary, #1f2937);
  }

  select option {
    background-color: var(--color-background-secondary, #374151) !important;
    color: var(--color-text-primary, #e5e7eb) !important;
    padding: 8px 12px !important;
    border: none !important;
  }

  select option:hover {
  background-color: var(--color-primary, #00a6d7) !important;
    color: var(--color-background-dark, #111827) !important;
  }

  select option:checked,
  select option:focus {
  background-color: var(--color-primary, #00a6d7) !important;
    color: var(--color-background-dark, #111827) !important;
  }


  @-moz-document url-prefix() {
    select option {
      background: var(--color-background-secondary, #374151);
      color: var(--color-text-primary, #e5e7eb);
    }

    select option:hover {
  background: var(--color-primary, #00a6d7);
      color: var(--color-background-dark, #111827);
    }
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
    color: inherit;
    border-radius: var(--border-radius-sm);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: var(--disabled-background);
    color: var(--disabled-text);
    border-color: var(--disabled-border);
  }


  :focus-visible {
    outline: var(--focus-ring);
    outline-offset: var(--focus-ring-offset);
    border-radius: var(--border-radius-xs);
  }


  ::selection {
    background: var(--color-primary);
    color: var(--color-background);
    text-shadow: none;
  }

  ::-moz-selection {
    background: var(--color-primary);
    color: var(--color-background);
    text-shadow: none;
  }


  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: var(--color-background);
    border-radius: var(--border-radius-md);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-xs);
    transition: all var(--duration-fast) var(--easing-ease-out);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--hover-background);
    border-color: var(--hover-border);
    box-shadow: var(--shadow-sm);
  }

  ::-webkit-scrollbar-thumb:active {
    background: var(--active-background);
    border-color: var(--active-border);
  }

  ::-webkit-scrollbar-corner {
    background: var(--color-background);
  }


  * {
    scrollbar-width: thin;
    scrollbar-color: var(--glass-background) var(--color-background);
  }


  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }


  .text-high-contrast {
    color: var(--text-secondary-high-contrast) !important;
    font-weight: 600;
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.3),
      0 0 8px rgba(0, 0, 0, 0.1);
  }

  .text-aa-contrast {
    color: var(--text-contrast-aa) !important;
  }

  .text-aaa-contrast {
    color: var(--text-contrast-aaa) !important;
  }



  .description-text {
    max-width: 360px;
    font-size: 1rem;
    line-height: 1.6;
    margin-top: 1rem;
    color: var(--color-text-description);
    font-family: var(--font-system-primary);
    font-weight: 400;
    text-align: left;


    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;


    @media (max-width: 768px) {
      max-width: 320px;
      font-size: 0.95rem;
      line-height: 1.65;
      text-align: center;
    }

    @media (max-width: 480px) {
      max-width: 280px;
      font-size: 0.9rem;
      line-height: 1.7;
    }
  }



  .theme-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
    cursor: pointer;
    border-radius: 50px;


    svg {
      transition: all 0.3s ease-in-out;
      color: var(--color-text);
    }

    &:hover {
      transform: scale(1.1);

      svg {
        color: var(--color-primary);
      }
    }

    &[aria-pressed="true"] {
      background: var(--color-primary)20;

      svg {
        color: var(--color-primary);
      }
    }
  }

  .theme-indicator--light:hover {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
    text-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
  }

  .theme-indicator--dark:hover {
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.8);
    text-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
  }

  .theme-indicator--neutral:hover {
    box-shadow: 0 0 20px rgba(251, 191, 36, 0.6);
    text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
  }



  .logo-focal {
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;
    transition: all 300ms var(--timing-function-global);

    &:hover {
      transform: scale(1.1);
      animation-play-state: paused;
    }
  }

  .logo-glow {
    filter: drop-shadow(0 0 10px var(--color-primary)30);
    animation: pulse-glow 3s ease-in-out infinite;
  }



  .bauhaus-heading {
    font-family: var(--font-system-primary);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.1;
    color: var(--color-text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    background: none;
    text-shadow: none;
    border: none;
    transition: color 300ms var(--timing-function-global);
  }

  .bauhaus-heading--primary {
    font-size: clamp(1.5rem, 3vw, 2.5rem);
  }

  .bauhaus-heading--secondary {
    font-size: clamp(1.25rem, 2.5vw, 2rem);
  }

  .bauhaus-heading--tertiary {
    font-size: clamp(1rem, 2vw, 1.5rem);
  }


  .glass-surface {
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-glass);
    border-radius: var(--border-radius-md);
    transition: all var(--duration-medium) var(--easing-glass);
  }

  .glass-card {
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop-filter);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    box-shadow:
      var(--shadow-glass),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
    transition: all var(--duration-medium) var(--easing-glass);
  }

  .glass-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.4),
      transparent
    );
  }

  .glass-card:hover {
    box-shadow:
      var(--shadow-hover),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
  }


  .feature-card {
    min-height: 320px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-block: 2rem;


    @media (min-width: 768px) {
      min-height: 320px;
    }

    @media (max-width: 1024px) {
      min-height: 300px;
    }

    @media (max-width: 768px) {
      min-height: 280px;
    }

    @media (max-width: 480px) {
      min-height: 260px;
    }
  }


  .feature-card-debug::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: var(--color-primary, #007bff);
    opacity: 0.3;
    pointer-events: none;
  }


  .bauhaus-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--spacing-md);
    max-width: var(--container-xl);
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }


  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(var(--spacing-sm));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideInLeft {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes glassShimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }







  @keyframes themeTransitionIn {
    from {
      opacity: 0.8;
      transform: scale(0.99);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes themeTransitionOut {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0.8;
      transform: scale(0.99);
    }
  }


  body.theme-transitioning {
    animation: themeTransitionOut 150ms ease-out forwards,
               themeTransitionIn 150ms ease-in 150ms forwards;
  }


  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    transition: all var(--duration-hover) var(--easing-hover);
  }

  .hover-glow:hover {
    box-shadow:
      var(--shadow-glow),
      var(--assistant-glow);
    transition: all var(--duration-hover) var(--easing-hover);
  }

  .hover-scale:hover {
    transform: scale(1.02);
    transition: all var(--duration-hover) var(--easing-hover);
  }


  @media (max-width: 768px) {
    html {
      font-size: 14px;
    }

    .bauhaus-grid {
      grid-template-columns: repeat(4, 1fr);
      gap: var(--spacing-sm);
      padding: 0 var(--spacing-sm);
    }

    body {
      font-size: var(--font-size-sm);
    }
  }

  @media (max-width: 480px) {
    html {
      font-size: 13px;
    }

    .bauhaus-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
  }


  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  @media (prefers-contrast: high) {
    .glass-surface,
    .glass-card {
      background: var(--card-background);
      backdrop-filter: none;
      border: 2px solid var(--card-border);
    }

    ::selection {
      background: var(--color-primary);
      color: var(--color-background);
    }
  }


  @media print {
    body::before {
      display: none;
    }

    .glass-surface,
    .glass-card {
      background: white !important;
      backdrop-filter: none !important;
      border: 1px solid #ddd !important;
      box-shadow: none !important;
    }
  }


  .theme-dark {
    body::before {
      background:
        radial-gradient(circle at 25% 25%, var(--color-primary)05 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, var(--color-accent)05 0%, transparent 50%),
        linear-gradient(135deg, transparent 0%, var(--color-primary)02 50%, transparent 100%);
    }
  }

  .theme-neutral {
    body::before {
      background:
        radial-gradient(circle at 25% 25%, var(--color-primary)04 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, var(--color-accent)04 0%, transparent 50%),
        linear-gradient(135deg, transparent 0%, var(--color-primary)015 50%, transparent 100%);
    }
  }

  .theme-light {
    body::before {
      background:
        radial-gradient(circle at 25% 25%, var(--color-primary)03 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, var(--color-accent)03 0%, transparent 50%),
        linear-gradient(135deg, transparent 0%, var(--color-primary)01 50%, transparent 100%);
    }
  }



  [data-component="status-bar"],
  .status-bar {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    z-index: 9999 !important;
  height: 26px !important;
  }


  [data-component="ai-assistant"],
  .ai-assistant,
  .ai-assistant-container {

  bottom: 26px !important;
  max-height: calc(100vh - 26px) !important;
  z-index: 9998 !important;
  }
`;
