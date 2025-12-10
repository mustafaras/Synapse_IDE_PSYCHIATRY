import { create } from 'zustand';
import type { AttachmentMeta } from './types';
import { estimateTokensApprox } from '@/utils/ai/tokenize';


export type LegacyAttachState = {
  list: AttachmentMeta[];
  addMany: (items: AttachmentMeta[]) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useAttachStore = create<LegacyAttachState>()((set) => ({
  list: [],
  addMany: (items) => set(s => ({ list: [...items, ...s.list] })),
  remove: (id) => set(s => ({ list: s.list.filter(x => x.id !== id) })),
  clear: () => set({ list: [] }),
}));

export const useAttachments = () => useAttachStore(s => s.list);


export type Attachment = {
  id: string;
  type: 'selection'|'file'|'paste';
  label: string;
  path?: string;
  text: string;
  tokens: number;
  blocked?: boolean;
};

type AttachCtxState = {
  items: Attachment[];
  add: (a: Omit<Attachment,'id'|'tokens'|'blocked'>) => void;
  remove: (id: string) => void;
  clear: () => void;
  refreshTokens: () => void;
};

const SECRET_PATTERNS = [
  /\.env/i, /id_rsa/i, /\.pem$/i, /\.p12$/i, /\.key$/i, /secrets?\./i, /-----BEGIN\s+PRIVATE\s+KEY-----/i
];

export const useCtxAttachStore = create<AttachCtxState>((set) => ({
  items: [],
  add(a) {
    const label = a.label || a.path || 'Attachment';
    const blocked = SECRET_PATTERNS.some(rx => (a.path ?? label).match(rx) || a.text.match(rx));
    const tokens = estimateTokensApprox(a.text);
    set(s => ({ items: s.items.concat({ ...a, id: crypto.randomUUID(), tokens, blocked }) }));
  },
  remove(id) { set(s => ({ items: s.items.filter(x=>x.id!==id) })); },
  clear() { set({ items: [] }); },
  refreshTokens() { set(s => ({ items: s.items.map(x => ({ ...x, tokens: estimateTokensApprox(x.text) })) })); },
}));

export { SECRET_PATTERNS };
