import { useEffect, useRef, useState } from 'react';
import type { KeyChord, Platform } from '@/lib/keys/keymap.types';
import { KeymapService } from '@/lib/keys/keymap.service';
import { modGlyph } from '@/lib/keys/platform';

export function ShortcutRecorder({
  value,
  onChange,
  platform,
  ariaLabel,
}: {
  value: KeyChord | null;
  onChange: (next: KeyChord | null) => void;
  platform: Platform;
  ariaLabel?: string;
}) {
  const [recording, setRecording] = useState(false);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!recording) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((globalThis as any).__KEY_ROUTER_SUSPENDED__) {

        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if (e.key === 'Escape') { setRecording(false); return; }
      const chord = KeymapService.normalizeChord(e, platform);
      onChange(chord);
      setRecording(false);
      try { if (liveRef.current) liveRef.current.textContent = `Captured ${describeChord(chord, platform)}`; } catch {}
    };


    try { window.removeEventListener('keydown', onKeyDown as any, true); } catch {}
    window.addEventListener('keydown', onKeyDown, { capture: false });
    return () => window.removeEventListener('keydown', onKeyDown as any, false);
  }, [recording, onChange, platform]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button
        type="button"
        aria-label={ariaLabel || 'Record shortcut'}
        onClick={() => setRecording(!recording)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setRecording(!recording); }}
        style={{ padding: '2px 8px' }}
      >{recording ? 'Press keys… (Esc to cancel)' : (value ? renderChord(value, platform) : 'Unbound')}</button>
      {value ? <button type="button" aria-label="Clear shortcut" onClick={() => onChange(null)}>Clear</button> : null}
      <div aria-live="polite" ref={liveRef} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(1px, 1px, 1px, 1px)' }} />
    </div>
  );
}

function describeChord(ch: KeyChord, platform: Platform) {
  const mods = ch.mods.map(m => modGlyph(m as any, platform)).join('+');
  return `${mods}${mods ? '+' : ''}${ch.key}`;
}

function renderChord(ch: KeyChord, platform: Platform) {
  return describeChord(ch, platform);
}

export default ShortcutRecorder;
