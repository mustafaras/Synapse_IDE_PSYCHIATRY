import type { ListModelsFn } from './types';

export const listModels: ListModelsFn = async ({ apiKey }) => {
  if (!apiKey) return [];

  const url = 'https://generativelanguage.googleapis.com/v1beta/models';
  try {
    const res = await fetch(`${url  }?key=${encodeURIComponent(apiKey)}`);
    if (!res.ok) return [];
    const json = await res.json();
    const models = Array.isArray(json.models) ? json.models : [];
    return models.map((m: any) => m.name).filter(Boolean);
  } catch { return []; }
};
