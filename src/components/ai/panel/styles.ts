import styled from 'styled-components';


export const PanelRoot = styled.aside`

  width: 100%;
  min-width: 0;
  max-width: none;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;

  background: var(--ai-surface, var(--color-bg-inverse, #000));
  border-left: 1px solid var(--ai-border, var(--color-border-subtle, #1a1a1a));
  color: var(--color-text-primary, #f5f5f5);
  font-family: var(--font-code, "JetBrains Mono", "Coder", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace);
  box-shadow: none;

  --ai-black: var(--ai-surface, #000000);
  --ai-black-alt: var(--ai-surface-alt, #0f0f10);
  --ai-border: var(--ai-border, #1f1f20);
  --ai-border-strong: var(--ai-border-strong, #2a2a2b);
  --ai-gold: var(--ai-gold, #00A6D7);
  --ai-gold-soft: var(--ai-gold-soft, #5FD6F5);
  --ai-text-secondary: var(--ai-text-secondary, #8a8a8a);
  & button,
  & select,
  & input,
  & textarea { font-family: inherit; }
`;

export const Section = styled.section`
  padding: 12px 14px;
  color: var(--color-text, var(--text-1));
`;

export const HeaderRow = styled(Section)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-height: 56px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--ai-border, var(--color-border-subtle, #1a1a1a));
  background: var(--ai-surface, var(--color-bg-inverse, #000));
`;

export const TitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
  align-items: flex-start;
  text-align: left;
`;

export const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--ai-gold-soft, var(--color-accent-primary-hover, #5FD6F5));
`;

export const Subtitle = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: var(--ai-text-secondary, var(--color-text-secondary, #8a8a8a));
  letter-spacing: 0.3px;
`;


export const ProvidersRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
`;


export const Brand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export const BrandIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, var(--color-bg-surface-alt, #1c1c1c), var(--color-bg-surface, #141414));
  border: 1px solid color-mix(in oklab, var(--ai-gold, var(--color-accent-primary, #00a6d7)), transparent 65%);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.05),
    0 2px 10px rgba(0,0,0,0.35);
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    left: 12px;
    top: 12px;
    border-radius: 50%;
  background: var(--ai-gold, var(--color-accent-primary, #00a6d7));
    box-shadow:
  12px 0 0 0 var(--ai-gold, var(--color-accent-primary, #00a6d7)),
  0 12px 0 0 var(--ai-gold, var(--color-accent-primary, #00a6d7)),
  12px 12px 0 0 var(--ai-gold, var(--color-accent-primary, #00a6d7));
  filter: drop-shadow(0 0 3px rgba(0,166,215,0.45));
  }
`;

export const BrandText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.15;
  align-items: flex-start;
`;

export const ControlsRow = styled(Section)`
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px dashed var(--color-border, rgba(255,255,255,0.08));
`;


export const QuickActionsBar = styled(Section)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 10px 4px;
  background: var(--ai-surface, var(--color-bg-inverse, #000));
  border-top: 1px solid var(--ai-border, #101010);
  border-bottom: none;
`;

export const GhostButton = styled.button`
  appearance: none;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.12));
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.04));
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
  cursor: not-allowed;
`;

export const ScrollArea = styled(Section)`
  flex: 1;
  overflow: auto;
  padding: 12px 14px 8px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
`;

export const EmptyState = styled.div`
  font-size: 12px;
  opacity: 0.8;
`;

export const ComposerContainer = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 4px;
  position: relative;
  z-index: 5;
  margin-top: auto;
  background: var(--ai-surface, var(--color-bg-inverse, #000));
  border-top: none;
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 40px;
  max-height: 160px;
  resize: none;
  border-radius: 8px;
  border: 1px solid var(--ai-border-strong, #222);
  background: var(--ai-surface-alt, var(--color-bg-surface-alt, #0f0f10));
  color: var(--color-text-primary, #fafafa);
  padding: 10px 12px;
  font-family: var(--font-code, "JetBrains Mono", "Coder", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace);
  font-size: 12px;
  line-height: 1.5;
  outline: none;
  &::placeholder { color: var(--color-text-muted, #555); }
  &:focus { border-color: var(--ai-gold, var(--color-accent-primary, #00A6D7)); box-shadow: 0 0 0 1px var(--ai-gold, var(--color-accent-primary, #00A6D7)); }
`;

export const Hint = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
`;

export const RightSide = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

export const ActionButton = styled.button`
  appearance: none;
  border: 1px solid var(--ai-border-strong, #2a2a2b);
  background: var(--color-bg-surface-alt, #101010);
  color: var(--color-text-primary, #f4f4f4);
  height: 34px;
  padding: 0 12px;
  border-radius: 8px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  &:hover { background: var(--color-bg-surface, #161616); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--ai-gold, var(--color-accent-primary, #00A6D7)); outline-offset: 2px; }
`;

export const SendButton = styled(ActionButton)`
  background: var(--ai-gold, var(--color-accent-primary, #00A6D7));
  border-color: var(--ai-gold, var(--color-accent-primary, #00A6D7));
  color: var(--color-text-inverse, #111);
  font-weight: 600;
  &:hover { background: var(--ai-gold-soft, var(--color-accent-primary-hover, #5FD6F5)); border-color: var(--ai-gold-soft, var(--color-accent-primary-hover, #5FD6F5)); }
`;

export const StopButton = styled(ActionButton)`
  background: var(--ai-danger, var(--color-status-danger, #b33939));
  border-color: var(--ai-danger, var(--color-status-danger, #b33939));
  color: #fff;
  &:hover { background: color-mix(in oklab, var(--ai-danger, #b33939), white 12%); }
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const TokenText = styled.small`
  color: var(--ai-text-secondary);
  font-size: 11px;
`;


export const JumpToLatestButton = styled.button`
  position: absolute;
  right: 12px;
  bottom: 12px;
  appearance: none;
  border: 1px solid color-mix(in oklab, var(--brand-primary, #00a6d7), transparent 70%);
  background: color-mix(in oklab, var(--brand-primary, #00a6d7), transparent 85%);
  color: var(--color-text, #fff);
  border-radius: 9999px;
  padding: 8px 10px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
  cursor: pointer;
  line-height: 1;
  font-size: 14px;
  transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
  z-index: 2;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(0,0,0,0.3);
  }

  &:focus-visible {
  outline: 2px solid color-mix(in oklab, var(--brand-primary, #00a6d7), transparent 30%);
    outline-offset: 2px;
  }
`;



export const Bubble = styled.div<{ $variant: 'user' | 'assistant' }>`
  max-width: 92%;
  padding: ${({ $variant }) => ($variant === 'user' ? '8px 10px' : '10px 12px')};
  border-radius: ${({ $variant }) => ($variant === 'user' ? '8px' : '10px')};
  color: var(--color-text-primary, #f5f5f5);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: ${({ $variant }) => ($variant === 'user' ? '11.5px' : '13px')};
  line-height: 1.55;
  letter-spacing: .15px;
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'assistant'
        ? 'var(--ai-border-strong, #222)'
  : 'var(--ai-gold, var(--color-accent-primary, #00A6D7))'};
  background:
    ${({ $variant }) =>
      $variant === 'assistant'
        ? 'var(--ai-surface-alt, var(--color-bg-surface-alt, #0f0f10))'
        : 'var(--color-bg-surface, #111)'};
  box-shadow: ${({ $variant }) => ($variant === 'user' ? '0 0 0 1px var(--color-accent-primary-soft, rgba(201,178,106,0.15)) inset' : 'none')};
  transition: background 120ms ease, border-color 120ms ease;
  &:hover { background: ${({ $variant }) => ($variant === 'user' ? 'var(--color-bg-surface-alt, #141414)' : 'var(--color-bg-surface-alt, #141414)')}; }
`;


export const Row = styled.div<{ $align: 'start' | 'end' }>`
  display: flex;
  justify-content: ${({ $align }) => ($align === 'end' ? 'flex-end' : 'flex-start')};
  padding: 6px 4px;
`;


import { codeInline, heading, text } from '../../../ui/theme/typography';

export const MarkdownRoot = styled.div`

  ${text('body')};
  font-family: var(--font-code, var(--font-mono, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace));
  color: var(--color-text-primary, #fff);
  p { margin: 0 0 8px; }
  ul, ol { margin: 0 0 8px 18px; padding: 0; }
  li { margin: 4px 0; }
  a { color: color-mix(in oklab, var(--brand-primary, #00a6d7), white 10%); text-decoration: underline; }
  code { ${codeInline()}; background: color-mix(in oklab, var(--ai-background, rgba(255,255,255,0.06)), transparent 30%); padding: 1px 4px; border-radius: 6px; }
  h1, h2, h3 { margin: 10px 0 6px; color: var(--color-text, #fff); }
  h1 { ${heading(1)} }
  h2 { ${heading(2)} }
  h3 { ${heading(3)} }
  h4, h5, h6 { ${text('body')}; font-weight:600; opacity:.9; }
`;

export const CodeBlockRoot = styled.div`
  position: relative;
  margin: 8px 0;
  border-radius: 10px;
  padding: 10px 12px 12px 12px;
  background: var(--code-bg, color-mix(in oklab, var(--color-bg-surface-alt, rgba(255,255,255,0.04)), black 8%));
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.12));

  pre { margin: 0; overflow: auto; }
  code { font-family: var(--font-code, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace); font-size: 12.5px; line-height: 1.55; white-space: pre; }
`;

export const CodeToolbar = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  display: inline-flex;
  gap: 6px;
`;

export const CodeButton = styled.button`
  appearance: none;
  border: 1px solid var(--color-border-default, rgba(255,255,255,0.2));
  background: color-mix(in oklab, var(--color-bg-surface-alt, rgba(255,255,255,0.06)), transparent 20%);
  color: var(--color-text-primary, #fff);
  font-size: 11px;
  padding: 3px 6px;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  transition: transform 120ms ease, background 120ms ease, border-color 120ms ease;

  &:hover { transform: translateY(-1px); }
  &:focus-visible { outline: 2px solid color-mix(in oklab, var(--brand-primary, #00a6d7), transparent 30%); outline-offset: 2px; }
`;


export const QuickRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  flex-wrap: wrap;
`;

export const MiniInput = styled.input`
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.12));
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.04));
  color: var(--color-text-primary, #fff);
  font-size: 12px;
`;

export const MiniSelect = styled.select`
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.12));
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.04));
  color: var(--color-text-primary, #fff);
  font-size: 12px;
`;

export const MiniSlider = styled.input.attrs({ type: 'range' })`
  height: 28px;
  accent-color: var(--brand-primary, #00a6d7);
`;

export const MiniToggle = styled.input.attrs({ type: 'checkbox' })`
  height: 16px;
  width: 32px;
  accent-color: var(--brand-primary, #00a6d7);
`;

export const MiniButton = styled.button`
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--color-border-subtle, rgba(255,255,255,0.12));
  background: var(--color-bg-surface-alt, rgba(255,255,255,0.04));
  color: var(--color-text-primary, #fff);
  font-size: 12px;
  cursor: pointer;
  &:focus-visible { outline: 2px solid color-mix(in oklab, var(--brand-primary, #00a6d7), transparent 30%); outline-offset: 2px; }
`;


export const IconButton = styled.button`
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--ai-border, #1f1f20);
  background: var(--ai-surface-alt, #0f0f10);
  color: var(--color-text-secondary, #d4d4d4);
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
  &:hover { background: var(--color-bg-surface, #161616); border-color: var(--ai-gold, var(--color-accent-primary, #00A6D7)); color: var(--ai-gold-soft, var(--color-accent-primary-hover, #5FD6F5)); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid var(--ai-gold, var(--color-accent-primary, #00A6D7)); outline-offset: 2px; }
`;

export const Badge = styled.span`
  font-size: 11px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
`;


export const ErrorBannerRoot = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--color-border, rgba(255,255,255,0.12));
  border-radius: 10px;
  background: color-mix(in oklab, var(--color-surface, rgba(255,255,255,0.04)), black 6%);
`;
export const ErrorIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 9999px;
  background: color-mix(in oklab, var(--color-error, #ff6b6b), transparent 70%);
  color: var(--color-error, #ff6b6b);
  font-size: 12px;
  line-height: 1;
`;
export const ErrorText = styled.div`
  font-size: 12px;
  color: var(--color-text, #fff);
`;
export const ErrorActions = styled.div`
  display: inline-flex;
  gap: 6px;
`;


export const DebugTrayRoot = styled.div`
  margin: 6px 0 0;
  padding: 6px 8px;
  border: 1px dashed var(--color-border, rgba(255,255,255,0.12));
  border-radius: 8px;
  color: var(--color-text-secondary, rgba(255,255,255,0.75));
  font-size: 11px;
`;
export const DebugRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
`;
export const DebugCol = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: max-content;
  gap: 8px;
`;
