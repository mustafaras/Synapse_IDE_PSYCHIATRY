import type { ListModelsFn } from './types';

export const listModels: ListModelsFn = async ({ baseUrl }) => {

  const host = (baseUrl || 'http://localhost:11434').replace(/\/+$/, '');
  try {
    const res = await fetch(`${host  }/api/tags`);
    if (!res.ok) return [];
    const json = await res.json();
    const arr = Array.isArray(json.models) ? json.models : [];
    return arr.map((m: any) => m.name).filter(Boolean);
  } catch { return []; }
};
