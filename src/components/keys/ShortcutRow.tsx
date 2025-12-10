import { useMemo, useState } from 'react';
import type { Keybinding, KeyChord, Platform } from '@/lib/keys/keymap.types';
import { COMMAND_META } from '@/lib/keys/commands.registry';
import ShortcutRecorder from './ShortcutRecorder';
import { KeymapService } from '@/lib/keys/keymap.service';

export function ShortcutRow({ binding, platform, onChange }: {
  binding: Keybinding;
  platform: Platform;
  onChange: (next: Keybinding) => void;
}) {
  const meta = COMMAND_META[binding.command];
  const [pending, setPending] = useState<KeyChord | null>(binding.chord);
  const conflicts = useMemo(() => KeymapService.findConflicts({ ...binding, chord: pending }), [binding, pending]);

  return (
    <div role="row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'center' }}>
      <div role="cell"><div style={{ fontWeight: 500 }}>{meta?.label || binding.command}</div><small style={{ color: 'var(--color-text-secondary)' }}>{meta?.description || ''}</small></div>
      <div role="cell"><ShortcutRecorder value={pending} onChange={(ch) => { setPending(ch); onChange({ ...binding, chord: ch }); }} platform={platform} /></div>
      <div role="cell" aria-live="polite">{conflicts.length ? <span style={{ color: 'var(--syn-danger-500,#E74C3C)' }}>Conflict</span> : null}</div>
    </div>
  );
}

export default ShortcutRow;
