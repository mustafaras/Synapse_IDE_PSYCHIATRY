import type { ListModelsFn } from './types';

export const listModels: ListModelsFn = async ({ apiKey }) => {
  if (!apiKey) return [];

  const url = 'https://api.anthropic.com/v1/models';
  try {
    const res = await fetch(url, { headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = (json.models || json.data || []) as any[];
    return Array.isArray(data) ? data.map(m => m.id || m.name).filter(Boolean) : [];
  } catch { return []; }
};
