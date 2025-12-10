import { makePersist } from './persist';

export interface CalendarLink { event_hash: string; start_iso: string; end_iso: string; code?: string }

const persist = makePersist<CalendarLink | null>('calendar', 1);


export async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && 'subtle' in crypto) {
    const enc = new TextEncoder();
    const buf = await crypto.subtle.digest('SHA-256', enc.encode(input));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  try {
    const { createHash } = await import('crypto');
    return createHash('sha256').update(input).digest('hex');
  } catch {

    let h = 0; for (let i=0;i<input.length;i++){ h = (h*31 + input.charCodeAt(i))|0; }
    return Math.abs(h).toString(16).padStart(8,'0');
  }
}

export function parseICS(text: string): { uid?: string | undefined; dtstart?: string | undefined; dtend?: string | undefined } {

  const unfolded = text.replace(/\r?\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);
  const out: any = {};
  for (const ln of lines) {
    const idx = ln.indexOf(':');
    if (idx === -1) continue;
    const k = ln.slice(0, idx);
    const v = ln.slice(idx + 1).trim();
    const key = k.toUpperCase();
    if (key.startsWith('UID')) out.uid = v;
    if (key.startsWith('DTSTART')) out.dtstart = v;
    if (key.startsWith('DTEND')) out.dtend = v;
  }

  const toIso = (s?: string) => {
    if (!s) return undefined;

    let m = s.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m) {
      try { return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 0, 0, 0).toISOString(); } catch {  }
    }

    m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?$/);
    if (m) {
      const ss = m[6] ? Number(m[6]) : 0;
      try { return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), ss).toISOString(); } catch {  }
    }

    m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
    if (m) {
      const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`;
      try { return new Date(iso).toISOString(); } catch {  }
    }

    const m2 = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?!Z)/);
    if (m2) {
      try { return new Date(Number(m2[1]), Number(m2[2]) - 1, Number(m2[3]), Number(m2[4]), Number(m2[5]), Number(m2[6])).toISOString(); } catch {}
    }
    return undefined;
  };
  const start_iso = toIso(out.dtstart);
  const end_iso = toIso(out.dtend);
  return { uid: out.uid as string | undefined, dtstart: start_iso, dtend: end_iso };
}

export async function attachFromICS(text: string, code?: string): Promise<CalendarLink | null> {
  const { uid, dtstart, dtend } = parseICS(text);
  if (!dtstart || !dtend) return null;

  const baseUid = uid || (await sha256Hex(text)).slice(0, 16);
  const event_hash = await sha256Hex(`${baseUid}|${dtstart}|${dtend}`);
  const link: CalendarLink = { event_hash, start_iso: dtstart, end_iso: dtend, ...(code ? { code } : {}) } as CalendarLink;
  persist.save(link);
  return link;
}

export function detachCalendar(): void { persist.clear(); }

export function loadCalendar(): CalendarLink | null { return persist.load(null); }
