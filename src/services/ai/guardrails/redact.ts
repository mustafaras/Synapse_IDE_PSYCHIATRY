import { RX } from './patterns';

export type Redaction = { kind:'secret'|'pii'|'riskCmd'|'exfilUrl'; match: string; start: number; end: number };
export type GuardResult = { text: string; redactions: Redaction[]; warnings: string[] };

export function redact(text: string): GuardResult {
  const redactions: Redaction[] = [];
  function apply(kind: Redaction['kind'], rx: RegExp) {
    let m: RegExpExecArray | null;
    const r = new RegExp(rx.source, rx.flags.includes('g') ? rx.flags : `${rx.flags  }g`);
    while ((m = r.exec(text)) !== null) {
      redactions.push({ kind, match: m[0], start: m.index, end: m.index + m[0].length });
    }
  }
  [...RX.secrets.map(rx=>['secret',rx] as const),
   ...RX.pii.map(rx=>['pii',rx] as const),
   ...RX.riskCmd.map(rx=>['riskCmd',rx] as const),
   ...RX.exfilUrl.map(rx=>['exfilUrl',rx] as const)
  ].forEach(([k,rx])=> apply(k, rx as RegExp));

  let safe = text;
  for (const r of redactions.sort((a,b)=> b.start - a.start)) {
    safe = `${safe.slice(0,r.start)  }[REDACTED:${r.kind}]${  safe.slice(r.end)}`;
  }
  const warnings:string[] = [];
  if (redactions.some(r=> r.kind==='secret')) warnings.push('Secrets were redacted.');
  if (redactions.some(r=> r.kind==='pii')) warnings.push('PII-like patterns were redacted.');
  if (redactions.some(r=> r.kind==='riskCmd')) warnings.push('Potentially dangerous commands detected.');
  if (redactions.some(r=> r.kind==='exfilUrl')) warnings.push('Potential exfiltration URLs detected.');
  return { text: safe, redactions, warnings };
}
