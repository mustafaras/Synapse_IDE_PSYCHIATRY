import { selectEffectiveRoute, useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMemo } from 'react';



export function useEffectiveAiRoute() {
  const eff = useAiSettingsStore(selectEffectiveRoute);
  const legacy = useSettingsStore(s => s.profiles.find(p => p.id === s.activeProfileId));
  const lp = (legacy?.data as any)?.settings?.provider || (legacy?.data as any)?.provider || 'openai';
  const lm = (legacy?.data as any)?.settings?.model || (legacy?.data as any)?.model || 'gpt-4o-mini';
  return useMemo(() => {
    const provider = (eff?.provider || lp) as string;
    const model = eff?.model || lm;
    return { provider, model } as const;
  }, [eff?.provider, eff?.model, lp, lm]);
}

