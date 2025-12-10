import { defaultKeymap } from './defaultKeymap';
import { detectPlatform } from './platform';
import type { Keybinding, KeyChord, KeymapPayloadV1, Platform, ScopeId } from './keymap.types';
import { emitCommand } from '@/ui/keys/commandsBus';

type Listener = (km: KeymapPayloadV1) => void;

function normMods(mods: string[]): ('Ctrl'|'Cmd'|'Alt'|'Opt'|'Shift')[] {
  const set = new Set(mods.map(m => (
    m === 'Meta' ? 'Cmd' : m === 'Option' ? 'Opt' : m
  )));
  const arr = Array.from(set) as any[];
  return arr.sort((a, b) => ['Cmd','Ctrl','Opt','Alt','Shift'].indexOf(a) - ['Cmd','Ctrl','Opt','Alt','Shift'].indexOf(b)) as any;
}

function normKey(key: string): string {
  if (!key) return '';
  if (key.length === 1) return key.toUpperCase();
  const map: Record<string, string> = { ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', Enter: 'Enter', Backspace: 'Backspace', Escape: 'Escape', Esc: 'Escape', Tab: 'Tab', F3: 'F3' };
  return map[key] || key;
}

function chordEquals(a: KeyChord | null, b: KeyChord | null): boolean {
  if (!a || !b) return false;
  if (a.key !== b.key) return false;
  if (a.mods.length !== b.mods.length) return false;
  return a.mods.every((m, i) => m === b.mods[i]);
}

class Service {
  private platform: Platform = detectPlatform();
  private state: KeymapPayloadV1 = defaultKeymap(this.platform);
  private listeners = new Set<Listener>();

  get(): KeymapPayloadV1 { return this.state; }
  set(next: KeymapPayloadV1) { this.state = next; this.emit(); }
  update(mutator: (m: KeymapPayloadV1) => void) { const copy = structuredClone(this.state); mutator(copy); this.state = copy; this.emit(); }
  onChange(fn: Listener) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private emit() { for (const l of this.listeners) { try { l(this.state); } catch {} } }

  normalizeChord(e: KeyboardEvent, platform: Platform = this.platform): KeyChord {
    const mods: string[] = [];
    if (e.ctrlKey) mods.push('Ctrl');
    if (e.metaKey) mods.push('Cmd');
    if (e.altKey) mods.push('Alt');
    if (e.shiftKey) mods.push('Shift');

    const m = new Set(normMods(mods));
    if (platform !== 'mac') { if (m.has('Cmd')) { m.delete('Cmd'); m.add('Ctrl'); } if (m.has('Opt')) { m.delete('Opt'); m.add('Alt'); } }
    const key = normKey(e.key);
    return { key, mods: normMods(Array.from(m) as any) };
  }

  findConflicts(binding: Keybinding): { with: Keybinding }[] {
    const out: { with: Keybinding }[] = [];
    if (!binding.chord) return out;
    const plat = binding.platform && binding.platform !== 'all' ? binding.platform : this.platform;
    for (const b of this.state.bindings) {
      if (b === binding) continue;
      const bPlat = b.platform && b.platform !== 'all' ? b.platform : this.platform;
      if (bPlat !== plat) continue;
      if (!b.chord) continue;
      const sameScope = b.scope === binding.scope;
      const globalVsScope = (b.scope === 'global' && binding.scope !== 'global') || (binding.scope === 'global' && b.scope !== 'global');
      if ((sameScope || globalVsScope) && chordEquals(b.chord, binding.chord)) {
        out.push({ with: b });
      }
    }
    return out;
  }

  dispatch(e: KeyboardEvent, scope: ScopeId): boolean {
    const chord = this.normalizeChord(e);
    const plat = this.platform;
    const hit = this.state.bindings.find(b => {
      const bPlat = b.platform && b.platform !== 'all' ? b.platform : plat;
      if (bPlat !== plat) return false;
      if (!b.chord) return false;
      if (!(b.scope === scope || b.scope === 'global')) return false;
      return chordEquals(b.chord, chord);
    });
    if (hit) {
      emitCommand(hit.command);
      return true;
    }
    return false;
  }
}

export const KeymapService = new Service();
