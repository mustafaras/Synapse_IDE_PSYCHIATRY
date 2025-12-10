import { DEFAULT_POLICY as P } from './policy';

export interface ScanFinding { code: 'prompt_injection'|'risky_api'|'suspicious_url'; detail: string; index?: number; }
export interface ScanReport { findings: ScanFinding[]; ok: boolean; }

export function scanAssistantText(raw: string): ScanReport {
  const text = String(raw || '');
  const findings: ScanFinding[] = [];

  const lower = text.toLowerCase();
  const inj = P.prompts.injectionPhrases.filter(p => lower.includes(p));
  inj.forEach(p => findings.push({ code: 'prompt_injection', detail: p }));

  P.codeRisk.riskyApis.forEach(tok => {
    const idx = text.indexOf(tok);
    if (idx >= 0) findings.push({ code: 'risky_api', detail: tok, index: idx });
  });

  const urlRx = /\bhttps?:\/\/[^\s)>'"]+/g;
  const urls = text.match(urlRx) || [];
  urls.forEach(u => {
    if (P.codeRisk.blocklistDomains.some(d => u.includes(d))) {
      findings.push({ code: 'suspicious_url', detail: u });
    }
  });

  return { findings, ok: findings.length === 0 };
}
