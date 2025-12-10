import type { TaskPlan } from './schema';
import { isAllowedCommand, isHighRiskCommand, sanitizeEnv } from './safety';
import { logEvent } from '@/utils/telemetry';

export type TaskStatus = 'planned'|'running'|'ok'|'failed'|'aborted'|'timeout';
export type TaskResult = { status: TaskStatus; exitCode?: number; ms: number; artifacts?: { label:string; path:string }[] };

export async function runTask(plan: TaskPlan, onData: (line:string)=>void, signal?: AbortSignal): Promise<TaskResult> {
  if (!isAllowedCommand(plan.command)) throw new Error(`Command not allowed: ${plan.command}`);
  if (isHighRiskCommand(plan.command, plan.args)) throw new Error('High-risk command requires explicit approval.');

  const env = sanitizeEnv(plan.env ?? {});
  const t0 = performance.now();
  logEvent('task_start', { tool: plan.tool, cmd: plan.command, args: plan.args });

  const execOpts: any = { timeoutMs: plan.timeoutMs ?? 600000, env };
  if (signal) execOpts.signal = signal;
  const { exitCode, timedOut } = await execBridge(plan, onData, execOpts);

  const ms = performance.now() - t0;
  const status: TaskStatus = timedOut ? 'timeout' : (exitCode === 0 ? 'ok' : 'failed');
  logEvent('task_end', { tool: plan.tool, status, exitCode, ms });

  const artifacts = await findArtifacts(plan.produceArtifacts ?? []);
  return { status, exitCode, ms, artifacts };
}


declare function execBridge(plan: TaskPlan, onData: (chunk:string)=>void, opts: { timeoutMs:number; env:Record<string,string>; signal?:AbortSignal }): Promise<{ exitCode:number, timedOut:boolean }>;
declare function findArtifacts(specs: { pattern:string; label:string }[]): Promise<{ label:string; path:string }[]>;
