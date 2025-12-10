type Level = 'debug' | 'info' | 'warn' | 'error';
const PREFIX = '[AI-TRACE]';

function ts() {
  try {
    return performance.now().toFixed(2).padStart(8, ' ');
  } catch {
    return '--------';
  }
}

function log(level: Level, ...msg: unknown[]) {
  const line = [PREFIX, `[${ts()}]`, `[${level.toUpperCase()}]`, ...msg].join(' ');
  const consoleMethod = level === 'debug' ? console.log : console[level];
  consoleMethod(line);
}

export const logger = {
  debug: (...m: unknown[]) => log('debug', ...m),
  info: (...m: unknown[]) => log('info', ...m),
  warn: (...m: unknown[]) => log('warn', ...m),
  error: (...m: unknown[]) => log('error', ...m),
};
