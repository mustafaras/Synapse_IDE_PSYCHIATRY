


import { normalizeAssistantMessage } from '../lang/normalizeOutput';
import { getLangSpec } from '../lang/languageMap';
import { dedupeName, safeJoin } from '../lang/filename';
import { warnIfRiskyOutput } from '@/utils/safety/guard';
import type { ApplyAction, ApplyPlan } from './types';
import { getActiveTraceId, spanEnd, spanStart } from '@/utils/obs/instrument';

export interface BuildPlanInput {
  rawAssistantText: string;
  selectedLanguageId: string;
  mode: 'beginner' | 'pro';
  defaultDir?: string;
  existingPaths: Set<string>;
}

export function buildApplyPlan(input: BuildPlanInput): ApplyPlan {
  let span: string | null = null;
  const tid = getActiveTraceId();
  if (tid) { try { span = spanStart(tid, 'apply', 'build apply plan'); } catch {} }
  const spec = getLangSpec(input.selectedLanguageId);
  if (!spec) throw new Error(`Unsupported language: ${input.selectedLanguageId}`);

  const { files, warnings } = normalizeAssistantMessage(input.rawAssistantText, {
    selectedLang: spec,
    mode: input.mode,
    defaultDir: input.defaultDir || '',
  });


  try { warnIfRiskyOutput(input.rawAssistantText, 'safety:warn:apply'); } catch {}

  const items = files.map(f => {
    const baseDir = input.defaultDir || '';
    const safePath = safeJoin(baseDir, f.path);
    const exists = input.existingPaths.has(safePath);
    let action: ApplyAction;

    if (input.mode === 'beginner') {

      action = exists ? 'replace' : 'create';
    } else {

      action = 'create';
    }

    return { path: safePath, action, code: f.code, monaco: f.monaco, ext: f.ext, exists };
  });


  if (input.mode === 'pro') {
    const used = new Set<string>();
    for (const it of items) {
      const finalPath = used.has(it.path) || it.exists ? dedupeName(used, it.path) : it.path;
      used.add(finalPath);
      it.path = finalPath;
    }
  }

  const plan: ApplyPlan = { mode: input.mode, items, warnings };
  if (tid && span) { try { spanEnd(tid, span, { created: items.filter(i => i.action === 'create').length, replaced: items.filter(i => i.action === 'replace').length }); } catch {} }
  return plan;
}
