import { create } from 'zustand';
import type { ActionPlan } from '@/services/actions/schema';
import type { DryRunResult } from '@/services/actions/runner';

export type ChangeSet = {
  id: string;
  title: string;
  createdAt: number;
  plan: ActionPlan;
  review: DryRunResult[];
  status: 'planned'|'applied'|'reverted'|'aborted';
};

type State = {
  items: ChangeSet[];
  upsert(cs: ChangeSet): void;
  mark(id: string, status: ChangeSet['status']): void;
  getById(id: string): ChangeSet | undefined;
  trim(max: number): void;
};

export const useChangeSetStore = create<State>((set, get) => ({
  items: [],
  upsert(cs) { set(s => ({ items: [cs, ...s.items].slice(0, 10) })); },
  mark(id, status) { set(s => ({ items: s.items.map(x => x.id === id ? { ...x, status } : x) })); },
  getById(id) { return get().items.find(x => x.id === id); },
  trim(max) { set(s => ({ items: s.items.slice(0, max) })); },
}));
