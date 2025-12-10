import type * as monacoNs from 'monaco-editor';
import { SYNAPSE_COLORS } from '@/ui/theme/synapseTheme';


export const defineSynapseMonacoTheme = (monaco: typeof monacoNs) => {

  const bg = SYNAPSE_COLORS?.bgDark ?? '#0f1115';
  const panel = SYNAPSE_COLORS?.bgSecondary ?? '#14161b';
  const border = SYNAPSE_COLORS?.border ?? '#23262d';
  const muted = SYNAPSE_COLORS?.textSecondary ?? '#9aa4b2';
  const text = SYNAPSE_COLORS?.textPrimary ?? '#e6e9ef';
  const accent = SYNAPSE_COLORS?.goldPrimary ?? '#f5a80b';
  const error = SYNAPSE_COLORS?.error ?? '#ff6b6b';
  const warn = SYNAPSE_COLORS?.warning ?? '#ffd166';
  const info = SYNAPSE_COLORS?.blueGray ?? '#64b5f6';
  const add = '#2e7d32';
  const del = '#c62828';

  monaco.editor.defineTheme('synapse-ide-pro', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: text.replace('#', ''), background: bg.replace('#', '') },
      { token: 'comment', foreground: muted.replace('#', '') },
      { token: 'string', foreground: 'd7ba7d' },
      { token: 'keyword', foreground: 'c792ea', fontStyle: 'bold' },
      { token: 'number', foreground: 'f78c6c' },
      { token: 'type', foreground: '82aaff' },
      { token: 'delimiter', foreground: 'a6accd' },
      { token: 'invalid', foreground: 'ffffff', background: error.replace('#', '') },
    ],
    colors: {
      'editor.background': bg,
      'editor.foreground': text,
      'editor.lineHighlightBackground': `${panel}66`,
      'editor.selectionBackground': `${accent}33`,
      'editor.inactiveSelectionBackground': `${accent}22`,
      'editorCursor.foreground': accent,
      'editorIndentGuide.background': `${border}`,
      'editorIndentGuide.activeBackground': `${accent}55`,
      'editorLineNumber.foreground': muted,
      'editorLineNumber.activeForeground': accent,
      'editorBracketMatch.border': `${accent}88`,
      'editorWhitespace.foreground': `${muted}55`,
      'editorGutter.addedBackground': `${add}aa`,
      'editorGutter.deletedBackground': `${del}aa`,
      'editorGutter.modifiedBackground': `${info}aa`,
      'editorWidget.background': panel,
      'dropdown.background': panel,
      'dropdown.border': border,
      'input.background': panel,
      'input.border': border,
      'scrollbarSlider.background': '#ffffff22',
      'scrollbarSlider.hoverBackground': '#ffffff33',
      'scrollbarSlider.activeBackground': '#ffffff44',
      'panel.border': border,
      'editorError.foreground': error,
      'editorWarning.foreground': warn,
      'editorInfo.foreground': info,
    },
  });
};

export default defineSynapseMonacoTheme;
