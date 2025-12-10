import { ZodSchema } from 'zod';
import { getAdapter } from '@/services/ai/adapters';

export function extractFirstJsonBlock(text: string): string | null {
  const cleaned = text.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
  const start = cleaned.search(/[\{\[]/);
  if (start < 0) return null;
  let depth = 0, end = -1;
  for (let i = start; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === '{' || ch === '[') depth++;
    if (ch === '}' || ch === ']') depth--;
    if (depth === 0) { end = i+1; break; }
  }
  return end > start ? cleaned.slice(start, end) : null;
}

export function tryParseJsonLoose(text: string): any {
  const block = extractFirstJsonBlock(text);
  if (!block) throw new Error('No JSON block found');
  let repaired = block
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/[\u0000-\u001F]/g, '');
  try {
    return JSON.parse(repaired);
  } catch {

    repaired = repaired
      .replace(/'([^'\\\n\r]*)'\s*:/g, '"$1":') // property names
      .replace(/:\s*'([^'\\\n\r]*)'/g, ': "$1"'); // string values
    return JSON.parse(repaired);
  }
}

export async function parseWithSchema<T>(text: string, schema: ZodSchema<T>, reask?: { provider: 'openai'|'anthropic'|'gemini'|'ollama'; model: string; }) {
  try {
    const obj = tryParseJsonLoose(text);
    return schema.parse(obj);
  } catch (e) {
    if (!reask) throw e;
    const adapter = getAdapter(reask.provider);
    const instruction =
`Only return a VALID JSON that strictly matches the target schema.
- Do not include code fences or explanations.
- No comments, no trailing commas, double quotes only.`;
    const prompt = `${instruction}\n\nRaw model output:\n${text}\n\nReturn fixed JSON now.`;
    const { text: fixed } = await adapter.complete({ options: { model: reask.model } as any, messages: [{ role: 'user', content: prompt } as any], timeoutMs: 8000 });
    const obj2 = tryParseJsonLoose(fixed);
    return schema.parse(obj2);
  }
}
