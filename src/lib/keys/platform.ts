import type { Platform } from './keymap.types';

export function detectPlatform(): Platform {
  try {

    const nav = typeof navigator !== 'undefined' ? navigator : ({} as any);
    const ua = (nav.userAgent || '').toLowerCase();
    if (/mac|darwin/.test(ua)) return 'mac';
    if (/win/.test(ua)) return 'win';
    if (/linux/.test(ua)) return 'linux';
  } catch {}
  try {

    const p = (process as any)?.platform;
    if (p === 'darwin') return 'mac';
    if (p === 'win32') return 'win';
    return 'linux';
  } catch {}
  return 'win';
}

export function modGlyph(mod: 'Cmd' | 'Opt' | 'Ctrl' | 'Alt' | 'Shift', platform: Platform): string {
  if (platform !== 'mac') return mod;
  if (mod === 'Cmd') return '⌘';
  if (mod === 'Opt') return '⌥';
  if (mod === 'Shift') return '⇧';
  if (mod === 'Ctrl') return '⌃';
  if (mod === 'Alt') return '⌥';
  return mod;
}
