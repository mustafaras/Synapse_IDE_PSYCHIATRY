import { CONFIG } from '@/config/env';

type Snap = {
  id: string;
  at: number;
  messageId: string;
  text: string;
  tokensApprox: number;
};

const KEY = 'ai.snapshots.v1';
function loadAll(): Record<string, Snap> { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
function saveAll(obj: Record<string, Snap>) { localStorage.setItem(KEY, JSON.stringify(obj)); }

export class SnapshotManager {
  private lastAt = 0;
  private lastTok = 0;
  private convoId: string;
  constructor(convoId: string) { this.convoId = convoId; }

  maybeSave(partial: { messageId: string; text: string; tokensApprox: number }) {
    const now = Date.now();
    if (now - this.lastAt < CONFIG.flags.snapshotIntervalSec * 1000 && (partial.tokensApprox - this.lastTok) < CONFIG.flags.snapshotTokenStep) return;
    const all = loadAll();
    all[this.convoId] = { id: this.convoId, at: now, ...partial } as Snap;
    saveAll(all);
    this.lastAt = now; this.lastTok = partial.tokensApprox;
  }

  restore(): Snap | null {
    const all = loadAll(); return all[this.convoId] ?? null;
  }

  clear() {
    const all = loadAll(); delete all[this.convoId]; saveAll(all);
  }
}
