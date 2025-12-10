import type { Action, ActionPlan } from './schema';
import { computeUnifiedDiff } from './textdiff';
import { editorBridge } from '@/services/editor/bridge';
import { isBlockedPath, isWhitelistedPath } from './safety';

export type DryRunResult = {
  file: string;
  before: string;
  after: string;
  diff: string;
  added: number;
  removed: number;
  blocked?: boolean;
};

export async function dryRun(plan: ActionPlan): Promise<DryRunResult[]> {
  const results: DryRunResult[] = [];
  for (const a of plan.actions) {
    if (a.kind === 'rename') {
      const before = await editorBridge.readFileText(a.from).catch(() => '');
      const after = before;
      const diff = `--- ${a.from}\n+++ ${a.to}\n(Rename planned)\n`;
      results.push({ file: `${a.from} → ${a.to}`, before, after, diff, added: 0, removed: 0, blocked: false });
      continue;
    }
    if ('path' in a) {
      const p = a.path;
      const blocked = !isWhitelistedPath(p) || isBlockedPath(p);
      const before = await editorBridge.readFileText(p).catch(() => '');
      const after = await simulate(a, before);
      const diff = computeUnifiedDiff(p, before, after);
      const { added, removed } = countDiffLines(diff);
      results.push({ file: p, before, after, diff, added, removed, blocked });
    }
  }
  return results;
}

export async function applyPlanAtomically(plan: ActionPlan, chosen: Set<string>) {

  const chosenPaths = Array.from(new Set(plan.actions.flatMap(a =>
    a.kind === 'rename' ? [a.from, a.to] : ('path' in a ? [a.path] : [])
  ).filter(p => !!p)));
  const snapshot = await editorBridge.snapshotMany(chosenPaths);
  try {
    for (const a of plan.actions) {
      if (a.kind === 'rename') {
        await editorBridge.renameFile(a.from, a.to);
        continue;
      }
      if ('path' in a && !chosen.has(a.path)) continue;
      await apply(a);
    }
  } catch (e) {
    await editorBridge.restoreSnapshotMany(snapshot);
    throw e;
  }
}

async function apply(a: Action) {
  switch (a.kind) {
    case 'create':
      await editorBridge.writeFileText(a.path, a.text, a.language);
      return;
    case 'replace':
      await editorBridge.writeFileText(a.path, a.text);
      return;
    case 'modify':

      {
        const before = await editorBridge.readFileText(a.path).catch(() => '');
        const after = simulateEdits(before, a.edits);
        await editorBridge.writeFileText(a.path, after);
      }
      return;
    case 'delete':
      await editorBridge.deleteFile(a.path);
      break;
    case 'format':

  }
}

async function simulate(a: Action, before: string): Promise<string> {
  switch (a.kind) {
    case 'create': return a.text;
    case 'replace': return a.text;
    case 'modify': return simulateEdits(before, a.edits);
    case 'delete': return '';
    case 'format': return before;
  default: return before;
  }
}

function simulateEdits(src: string, edits: { range: [number, number, number, number]; text: string }[]) {
  const lines = src.split('\n');
  const toOffset = (L: number, C: number) => {
    let o = 0; for (let i = 1; i < L; i++) o += (lines[i - 1]?.length ?? 0) + 1; return o + (C - 1);
  };
  const ranges = edits.map(e => ({ s: toOffset(e.range[0], e.range[1]), e: toOffset(e.range[2], e.range[3]), t: e.text }))
    .sort((a, b) => b.s - a.s);
  let out = src;
  for (const r of ranges) out = out.slice(0, r.s) + r.t + out.slice(r.e);
  return out;
}

function countDiffLines(diff: string) {
  const added = (diff.match(/^\+/gm) || []).length;
  const removed = (diff.match(/^-/gm) || []).length;
  return { added, removed };
}
