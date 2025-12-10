import { withSpan } from '@/observability/spans';
import { routeAndStream } from '@/services/ai/router/service';
import { parseWithSchema } from '@/services/ai/structured/safejson';
import { type ActionPlan as StructuredActionPlan, ZActionPlan, ZTaskPlan } from '@/services/ai/structured/schemas';
import { redact } from '@/services/ai/guardrails/redact';
import { dryRun } from '@/services/actions/runner';
import { useChangeSetStore } from '@/stores/changesetStore';
import { runTask } from '@/services/tools/runner';
import { PRESETS } from '@/services/tools/registry';
import { METRICS } from '@/observability/otel';
import { SYSTEM_CODER, SYSTEM_CRITIC, SYSTEM_PLANNER, SYSTEM_TESTER } from './roles';
import { CRITIC_RUBRIC } from './rubrics';
import type { ActionPlan as ActionsActionPlan } from '@/services/actions/schema';
import { TOOL_POLICY } from './policy';

export type OrchestratorConfig = {
  maxRounds: number;
  maxPlanActions: number;
  hardTimeMs: number;
  jsonReask: { provider:'anthropic'|'openai'|'gemini'|'ollama', model:string };
};

export type OrchestratorInput = {
  userPrompt: string;
  contextText?: string;
  routeCtx: any;
};

export type OrchestratorResult = {
  status: 'ok'|'aborted'|'timeout'|'failed';
  rounds: number;
  planId?: string;
  decision?: string;
};

export async function runOrchestrator(cfg: OrchestratorConfig, input: OrchestratorInput): Promise<OrchestratorResult> {
  const tStart = performance.now();
  let round = 0;
  let lastCritique = '';

  while (round < cfg.maxRounds && (performance.now() - tStart) < cfg.hardTimeMs) {
    round++;


    const planText = await withSpan('orchestrator.plan', { round }, async () => complete('Planner', input, SYSTEM_PLANNER, input.userPrompt, input.contextText));
  const planParsed = await parseWithSchema(planText, ZActionPlan, cfg.jsonReask);
  if (planParsed.actions.length > cfg.maxPlanActions) throw new Error('Plan too large');
  const plan: ActionsActionPlan = mapStructuredPlan(planParsed);


    const review = await withSpan('orchestrator.dryrun', { round }, async () => dryRun(plan));
    useChangeSetStore.getState().upsert({ id: plan.id, title: plan.title, createdAt: plan.createdAt, plan, review, status: 'planned' });


    const coderBrief = `Refine plan if needed. Keep <=${cfg.maxPlanActions} actions.`;
    const coderText = await withSpan('orchestrator.code', { round }, async () => complete('Coder', input, SYSTEM_CODER, coderBrief, JSON.stringify(plan)));
    let plan2 = plan;
    try {
      const refined = await parseWithSchema(coderText, ZActionPlan, cfg.jsonReask);
      if (refined.actions.length <= cfg.maxPlanActions) {
        plan2 = mapStructuredPlan(refined);
      }
    } catch {}


    const testerText = await withSpan('orchestrator.testplan', { round }, async () => complete('Tester', input, SYSTEM_TESTER, 'Propose tests for this plan.', JSON.stringify(plan2)));
    const tasks: any[] = [];

    try { const maybe = await parseWithSchema(testerText, ZTaskPlan, cfg.jsonReask).catch(()=>null); if (maybe) tasks.push(maybe); } catch {}
    if (!tasks.length) {
      const node = PRESETS.find(p => p.id==='node:test' && p.detect());
      if (node) tasks.push(node.buildPlan());
    }


    const logs: string[] = [];
    for (const p of tasks) {

      if (p.timeoutMs && p.timeoutMs > TOOL_POLICY.maxCmdTimeoutMs) p.timeoutMs = TOOL_POLICY.maxCmdTimeoutMs;
      const res = await withSpan('orchestrator.task', { round, tool: p.tool }, async () => runTask(p, (ln)=>logs.push(ln)));
      logs.push(`STATUS ${res.status} EXIT ${res.exitCode ?? ''} MS ${res.ms}`);
    }


    const critiqueInput = [
      'Plan:', JSON.stringify(plan2).slice(0,2000),
      '\nDry-Run (files):', review.map(r=>`${r.file} +${r.added}/-${r.removed}${r.blocked?' BLOCKED':''}`).join('\n'),
      '\nTest Logs (tail):', logs.slice(-80).join('\n')
    ].join('\n');
    const criticText = await withSpan('orchestrator.critic', { round }, async () => complete('Critic', input, SYSTEM_CRITIC, `${CRITIC_RUBRIC  }\nReview strictly.`, critiqueInput));
    lastCritique = redact(criticText).text;
    const ready = /READY-TO-APPLY/i.test(lastCritique);

    if (ready) {
      return { status:'ok', rounds: round, planId: plan2.id, decision:'READY-TO-APPLY' };
    }

    if ((performance.now() - tStart) > cfg.hardTimeMs) break;
  }

  return { status:'ok', rounds: round, decision: 'REQUIRES-MANUAL-REVIEW' };
}

async function complete(role: 'Planner'|'Coder'|'Tester'|'Critic', input: OrchestratorInput, system: string, instruction: string, extra?: string) {
  const normalized: { system?: string; messages: { role:'system'|'user'|'assistant'; content: string }[]; jsonMode?: boolean; maxOutput?: number } = {
    system,
    messages: [
      { role:'user', content: instruction },
      ...(input.contextText ? [{ role:'user' as const, content: `Context:\n${input.contextText}` }] : []),
      ...(extra ? [{ role:'user' as const, content: extra }] : []),
    ],
    jsonMode: role!=='Critic',
    maxOutput: role==='Critic' ? 1200 : 1500,
  };
  const { text } = await routeAndStream({ normalized, route: input.routeCtx, allowCache: false });
  METRICS.costUsd.add?.(0);
  return text ?? '';
}

function mapStructuredPlan(p: StructuredActionPlan): ActionsActionPlan {

  return {
    id: p.id,
    title: p.title,
    createdAt: p.createdAt,
    note: p.note,
    actions: p.actions.map(a => ({ ...a }) as any),
  } as ActionsActionPlan;
}
