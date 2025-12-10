


import { setTasksHandler } from './tasksBridge';
import { terminalError, terminalInfo } from '@/components/terminal/terminalLogBus';

declare global {
  interface Window {
    acquireVsCodeApi?: () => { postMessage: (msg: any) => void };
    __runTask?: (kind: 'run' | 'build') => void;
  }
}

(() => {
  try {
    if (typeof window !== 'undefined') {
      if (typeof window.acquireVsCodeApi === 'function') {
        const vscode = window.acquireVsCodeApi!();
        setTasksHandler(kind => {
          vscode.postMessage({ type: 'synapse:task', kind });
          terminalInfo(`Requested VS Code task: ${kind}`, 'build');
        });

        window.addEventListener('message', (event: MessageEvent) => {
          const data = event.data;
          if (!data || typeof data !== 'object') return;
          if (data.type === 'synapse:task:log' && typeof data.message === 'string') {
            terminalInfo(data.message, data.channel || 'build');
          }
          if (data.type === 'synapse:task:error' && typeof data.message === 'string') {
            terminalError(data.message, data.channel || 'build');
          }
        });
        return;
      }
      if (typeof window.__runTask === 'function') {
        setTasksHandler(kind => {
          try {
            window.__runTask!(kind);
          } catch {}
        });

      }
    }
  } catch {

  }

})();

export {};
