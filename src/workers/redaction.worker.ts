


type RedactCategories = { name: boolean; ids: boolean; contact: boolean; address: boolean; dates: boolean; freeText: boolean };
type RedactOptions = { master: boolean; categories: RedactCategories };


const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE = /(?:(?:\+?\d{1,3}[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g;
const IDLIKE = /\b(?:MRN|NHS|SSN|ID|Patient|Pt)\s*[:#-]?\s*([A-Z0-9]{3,}[- ]?[A-Z0-9]{2,})\b/gi;
const ADDRESS = /\b\d{1,5}\s+([A-Z][a-z]+\s)+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi;
const ISO_DATE = /\b\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2}(?:\.\d{3})?)?Z?)?\b/g;
const DOB = /\b(?:DOB|Date\s*of\s*Birth)\s*[:#-]?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/gi;
const NAME_HINT = /\b(?:Name|Patient\s*Name|Full\s*Name)\s*[:#-]?\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;

function scrubString(input: string, opts: RedactOptions): string {
  let out = input;
  if (opts.categories.contact) out = out.replace(EMAIL, '[REDACTED_EMAIL]');
  if (opts.categories.contact) out = out.replace(PHONE, (m) => (m.replace(/\d/g, 'x').length > 6 ? '[REDACTED_PHONE]' : m));
  if (opts.categories.ids) out = out.replace(IDLIKE, '[REDACTED_ID]');
  if (opts.categories.address) out = out.replace(ADDRESS, '[REDACTED_ADDRESS]');
  if (opts.categories.dates) { out = out.replace(ISO_DATE, '[REDACTED_DATE]').replace(DOB, '[REDACTED_DOB]'); }
  if (opts.categories.name) out = out.replace(NAME_HINT, '[REDACTED_NAME]');
  return out;
}

function scrubDeep(value: unknown, opts: RedactOptions): unknown {
  if (value == null) return value;
  const t = typeof value;
  if (t === 'string') {
    return opts.categories.freeText ? scrubString(value as string, opts) : value;
  }
  if (Array.isArray(value)) return (value as unknown[]).map(v => scrubDeep(v, opts));
  if (t === 'object') {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(src)) {
      const norm = key.replace(/[_\s-]/g, '').toLowerCase();

      if (opts.categories.name && /^(name|patientname|fullname|firstname|lastname)$/.test(norm)) { out[key] = '[REDACTED_NAME]'; continue; }
      if (opts.categories.ids && /^(id|mrn|nhs|ssn|patientid|recordid)$/i.test(norm)) { out[key] = '[REDACTED_ID]'; continue; }
      if (opts.categories.contact && /^(email|phone|tel|contact|mobile)$/i.test(norm)) { out[key] = '[REDACTED_CONTACT]'; continue; }
      if (opts.categories.address && /^(address|street|city|zipcode|postcode|state|county)$/i.test(norm)) { out[key] = '[REDACTED_ADDRESS]'; continue; }
      if (opts.categories.dates && /^(dob|dateofbirth|birthdate)$/i.test(norm)) { out[key] = '[REDACTED_DOB]'; continue; }
      out[key] = scrubDeep(src[key], opts);
    }
    return out;
  }
  return value;
}

type ScrubJSONMsg = { kind: 'scrubJSON'; payload: unknown; opts: RedactOptions };
type ScrubTextMsg = { kind: 'scrubText'; text: string; opts: RedactOptions };
type Msg = ScrubJSONMsg | ScrubTextMsg;

interface WorkerCtx {
  postMessage: (msg: unknown) => void;

  addEventListener: (type: 'message', listener: (e: any) => void) => void;
}

const ctx = self as unknown as WorkerCtx;
ctx.addEventListener('message', (e: MessageEvent<Msg>) => {
  try {
    const data = e.data;
    if (data.kind === 'scrubJSON') {
      const effective = scrubDeep(data.payload, data.opts);
      ctx.postMessage({ ok: true, payload: effective });
      return;
    }
    if (data.kind === 'scrubText') {
      const out = scrubString(String(data.text ?? ''), data.opts);
      ctx.postMessage({ ok: true, text: out });
      return;
    }
    ctx.postMessage({ ok: false, error: 'unknown-kind' });
  } catch (err) {
    ctx.postMessage({ ok: false, error: (err as Error)?.message || 'redaction-error' });
  }
});
