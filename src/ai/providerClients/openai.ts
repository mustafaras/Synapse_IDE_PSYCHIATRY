import type { ListModelsFn } from './types';

export const listModels: ListModelsFn = async ({ apiKey, baseUrl }) => {
  if (!apiKey) return [];
  const url = `${(baseUrl ?? 'https://api.openai.com').replace(/\/+$/, '')  }/v1/models`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!res.ok) return [];
    const json = await res.json();
    const ids = Array.isArray(json.data) ? json.data.map((m: any) => m.id).filter(Boolean) : [];
    return ids;
  } catch { return []; }
};
