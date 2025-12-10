import type { SafetyPolicy } from './policy';

export function findEmails(s: string): string[] {
  return s.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi) || [];
}

export function findPhones(s: string): string[] {
  return s.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s-]?\d{3}[\s-]?\d{2,4}/g) || [];
}

export function findIpv4(s: string): string[] {
  return s.match(/\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d)(?:\.|$)){4}\b/g) || [];
}

export function looksLikeSecret(k: string, v: string, policy: SafetyPolicy): boolean {
  if (!k || !v) return false;
  if (policy.secrets.envKeys.includes(k.toUpperCase())) return true;
  if (v.length >= policy.secrets.maxTokenLikeLen && /^[A-Za-z0-9+/_=-]+$/.test(v)) return true;
  return policy.secrets.regexes.some(rx => rx.test(v));
}
