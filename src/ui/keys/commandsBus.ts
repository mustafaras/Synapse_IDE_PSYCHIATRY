import type { CommandId } from '@/lib/keys/keymap.types';

type Listener = (cmd: CommandId) => void;
const listeners = new Set<Listener>();

export function onCommand(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitCommand(cmd: CommandId) {
  for (const l of listeners) {
    try { l(cmd); } catch {}
  }
}
