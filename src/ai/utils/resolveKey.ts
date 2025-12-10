export type ProviderId = 'openai' | 'anthropic' | 'google';

export function resolveProviderKey(
  provider: ProviderId,
  legacyKeys?: Record<string, any>,
  vault?: Record<string, any>
): string | undefined {
  const mapProv = (p: string) => (p === 'google' ? 'gemini' : p);
  const field = mapProv(provider);
  const legacy = legacyKeys?.[provider]?.apiKey;
  const raw = vault?.[field];
  let resolved = legacy ?? raw;

  if (!resolved) {
    try {
      const seeded = localStorage.getItem('synapse.ai.settings.v2');
      if (seeded) {
        const parsed = JSON.parse(seeded);
        const v = (parsed?.keys && (parsed.keys[field] || parsed.keys[provider])) || (parsed?.data?.keys && (parsed.data.keys[field] || parsed.data.keys[provider]));
        if (typeof v === 'string' && v.length > 0) resolved = v;
      }
    } catch {}
  }
  return resolved;
}
