const ALLOW = ['npm','npx','yarn','pnpm','pytest','python','pip-audit','ruff','black','go','cargo','dotnet','cmake','swift','sbt','mvn','gradle','javac','java','php','vendor/bin/phpunit','bundle','rspec'];
const HIGH_RISK = [/install/i, /publish/i, /^git\s+push/i, /^docker\s+(push|login)/i];
const SECRET_ENV = [/AWS_/, /GOOGLE_/, /AZURE_/, /OPENAI/i, /ANTHROPIC/i, /GEMINI/i, /TOKEN/, /SECRET/, /PASSWORD/];

export function isAllowedCommand(cmd: string) { return ALLOW.some(a => cmd === a || cmd.endsWith(`/${  a}`)); }
export function isHighRiskCommand(cmd: string, args: string[]) { const s = `${cmd} ${args.join(' ')}`; return HIGH_RISK.some(rx => rx.test(s)); }
export function sanitizeEnv(env: Record<string, string>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (SECRET_ENV.some(rx => rx.test(k))) continue;
    out[k] = v;
  }
  return out;
}
