export type ToolKind = 'test' | 'lint' | 'format' | 'build' | 'run' | 'depGraph' | 'securityScan';

export type TaskPlan = {
  id: string;
  title: string;
  createdAt: number;
  tool: ToolKind;
  cwd?: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  timeoutMs?: number;
  allowNetwork?: boolean;
  produceArtifacts?: { pattern: string; label: string }[];
  note?: string;
};

export type TaskRun = {
  plan: TaskPlan;
  startedAt: number;
  pid?: number;
};
