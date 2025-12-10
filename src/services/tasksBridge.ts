


import { terminalInfo } from '@/components/terminal/terminalLogBus';

type TaskKind = 'run' | 'build';

let handler: null | ((kind: TaskKind) => void) = null;

export function setTasksHandler(fn: ((kind: TaskKind) => void) | null) {
  handler = fn;
}

export function triggerTask(kind: TaskKind) {
  if (handler) {
    handler(kind);
    return;
  }

  if (kind === 'run') {
    terminalInfo(
      'Run: Starting dev server (simulated). Use the real terminal for actual processes.',
      'build'
    );
  } else {
    terminalInfo(
      'Build: Compiling project (simulated). Use the real terminal for actual builds.',
      'build'
    );
  }
}

export function hasCustomTasksHandler() {
  return !!handler;
}

export default { setTasksHandler, triggerTask, hasCustomTasksHandler };
