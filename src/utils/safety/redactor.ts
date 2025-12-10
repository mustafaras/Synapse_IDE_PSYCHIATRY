import { DEFAULT_POLICY as P } from './policy';
import { findEmails, findIpv4, findPhones } from './pii';

export function redactContext(text: string): { clean: string; hits: string[] } {
  const hits: string[] = [];
  let out = text || '';


  out = out.replace(/```+/g, '``');
  out = out.replace(/\r\n/g, '\n');

  if (P.pii.detectEmails) for (const m of findEmails(out)) { hits.push(`email:${m}`); out = out.split(m).join('[REDACTED_EMAIL]'); }
  if (P.pii.detectPhones) for (const m of findPhones(out)) { hits.push(`phone:${m}`); out = out.split(m).join('[REDACTED_PHONE]'); }
  if (P.pii.detectIpv4)   for (const m of findIpv4(out))   { hits.push(`ip:${m}`);    out = out.split(m).join('[REDACTED_IP]'); }


  out = out.replace(/^\s*([A-Z0-9_]{3,})\s*=\s*([^\n\r]+)$/gmi, (_m, k) => {
    hits.push(`env:${String(k)}`);
    return `${String(k)}=[REDACTED]`;
  });


  for (const rx of P.secrets.regexes) {
    out = out.replace(rx, () => { hits.push('secret-block'); return '[REDACTED_BLOCK]'; });
  }

  return { clean: out, hits };
}
