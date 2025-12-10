


export interface TerminalSyntheticLog {
  channel: 'latex' | 'system' | 'build';
  level: 'info' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

export type TerminalLogListener = (log: TerminalSyntheticLog) => void;

const listeners = new Set<TerminalLogListener>();

export function subscribeTerminalLogs(fn: TerminalLogListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitTerminalLog(
  entry: Omit<TerminalSyntheticLog, 'timestamp'> & { timestamp?: Date }
) {
  const log: TerminalSyntheticLog = {
    timestamp: entry.timestamp || new Date(),
    ...entry,
  } as TerminalSyntheticLog;
  listeners.forEach(l => {
    try {
      l(log);
    } catch {}
  });
  return log;
}


export const terminalInfo = (
  message: string,
  channel: TerminalSyntheticLog['channel'] = 'system'
) => emitTerminalLog({ channel, level: 'info', message });
export const terminalSuccess = (
  message: string,
  channel: TerminalSyntheticLog['channel'] = 'system'
) => emitTerminalLog({ channel, level: 'success', message });
export const terminalError = (
  message: string,
  channel: TerminalSyntheticLog['channel'] = 'system'
) => emitTerminalLog({ channel, level: 'error', message });
