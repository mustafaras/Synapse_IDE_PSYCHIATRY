export const SB_COLORS = {

  bgPrimary: '#00A6D7',
  bgSecondary: '#036E8D',
  bgOverlay: 'rgba(0,0,0,0.04)',
  textPrimary: '#14120B',
  textSecondary: '#2E2B22',
  textAccent: '#14120B',
  goldSoft: '#00A6D7',
  goldMuted: '#5FD6F5',
  grayBlue: '#6B7280',
  borderSoft: 'rgba(0,0,0,0.35)',
  success: '#2E7D32',
  warning: '#5FD6F5',
  error: '#B00020',
  softShadow: 'rgba(0,0,0,0.18)',
  borderHighlight: 'rgba(0,0,0,0.5)',
  glowSubtle: '0 0 0 rgba(0,0,0,0)',
} as const;

export const sbFont = 'JetBrains Mono, Fira Code, SF Mono, Consolas, monospace';
export const alpha = (hex: string, a: number) => {
  if (!hex || !hex.startsWith('#')) return hex;
  const h = hex.replace('#', '');
  const to255 = (str: string) => parseInt(str, 16);
  let r = 0,
    g = 0,
    b = 0;
  if (h.length === 3) {
    r = to255(h[0] + h[0]);
    g = to255(h[1] + h[1]);
    b = to255(h[2] + h[2]);
  } else if (h.length === 6) {
    r = to255(h.substring(0, 2));
    g = to255(h.substring(2, 4));
    b = to255(h.substring(4, 6));
  }
  const alphaClamped = Math.max(0, Math.min(1, a));
  return `rgba(${r}, ${g}, ${b}, ${alphaClamped})`;
};
