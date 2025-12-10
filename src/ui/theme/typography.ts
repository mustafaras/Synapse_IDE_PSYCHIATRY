



import { css } from 'styled-components';

export const TYPE_SCALE = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
} as const;

export type TypeScaleKey = keyof typeof TYPE_SCALE;

export const LINE_HEIGHTS = {
  body: 1.55,
  code: 1.5,
  heading: 1.25,
} as const;


export const typographyVarBlock = () => `
  --font-size-xs: ${TYPE_SCALE.xs}px;
  --font-size-sm: ${TYPE_SCALE.sm}px;
  --font-size-md: ${TYPE_SCALE.md}px;
  --font-size-base: ${TYPE_SCALE.base}px;
  --font-size-lg: ${TYPE_SCALE.lg}px;
  --font-size-xl: ${TYPE_SCALE.xl}px;
  --line-height-body: ${LINE_HEIGHTS.body};
  --line-height-code: ${LINE_HEIGHTS.code};
  --line-height-heading: ${LINE_HEIGHTS.heading};
`;


export const text = (role: 'body'|'muted'|'small'|'code') => {
  switch(role){
    case 'small':
      return css`font-size: ${TYPE_SCALE.sm}px; line-height: ${LINE_HEIGHTS.body};`;
    case 'muted':
      return css`font-size: ${TYPE_SCALE.base}px; line-height: ${LINE_HEIGHTS.body}; opacity: .75;`;
    case 'code':
      return css`font-family: var(--font-code); font-size: ${TYPE_SCALE.sm + 0.5}px; line-height: ${LINE_HEIGHTS.code};`;
    case 'body':
    default:
      return css`font-size: ${TYPE_SCALE.base}px; line-height: ${LINE_HEIGHTS.body};`;
  }
};

export const heading = (level: 1|2|3) => {

  const map: Record<number, number> = { 1: TYPE_SCALE.xl, 2: TYPE_SCALE.lg, 3: TYPE_SCALE.base + 1 };
  const size = map[level];
  return css`font-size: ${size}px; line-height: ${LINE_HEIGHTS.heading}; font-weight: 600;`;
};

export const codeInline = () => css`
  font-family: var(--font-code);
  font-size: ${TYPE_SCALE.sm + 0.5}px;
  line-height: ${LINE_HEIGHTS.code};
`;


let responsiveEnabled = false;
export const enableResponsiveTypography = () => { responsiveEnabled = true; };
export const maybeClamp = (px: number) => {
  if(!responsiveEnabled) return `${px}px`;
  const min = (px * 0.97).toFixed(2);
  const max = (px * 1.04).toFixed(2);
  return `clamp(${min}px, ${px/16}rem + 0.2vw, ${max}px)`;
};


export function contrastRatio(fg: string, bg: string): number {
  const toRGB = (hex: string) => {
    const h = hex.replace('#','');
    const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
    return [ (bigint>>16)&255, (bigint>>8)&255, bigint&255 ];
  };
  const rel = (c: number) => {
    const s = c/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4);
  };
  try {
    const [r1,g1,b1] = toRGB(fg); const [r2,g2,b2] = toRGB(bg);
    const L1 = 0.2126*rel(r1)+0.7152*rel(g1)+0.0722*rel(b1);
    const L2 = 0.2126*rel(r2)+0.7152*rel(g2)+0.0722*rel(b2);
    const light = Math.max(L1,L2); const dark = Math.min(L1,L2);
    return (light + 0.05) / (dark + 0.05);
  } catch { return 0; }
}

export const meetsAA = (ratio: number, largeText = false) => ratio >= (largeText ? 3 : 4.5);
