import React, { useCallback, useId, useMemo } from 'react';
import styled from 'styled-components';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { listModelsByProvider, type ProviderKey } from '@/utils/ai/models/registry';
import { showToast } from '@/ui/toast/api';

const Select = styled.select`
  appearance: none;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 12px;
  border: 1px solid var(--color-border, rgba(255,255,255,0.12));
  background: var(--color-surface, rgba(255,255,255,0.04));
  color: var(--color-text, #fff);
  font-family: inherit;
`;

const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-family: inherit;
`;

function providerLabel(p: ProviderKey): string {
  if (p === 'gemini') return 'Gemini';
  if (p === 'ollama') return 'Ollama';
  if (p === 'openai') return 'OpenAI';
  if (p === 'anthropic') return 'Anthropic';
  return p;
}

export const ProviderSelect: React.FC = () => {
  const id = useId();

  const { profiles, activeProfileId, setProvider: setLegacyProvider, setModel: setLegacyModel } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const legacyProvider = (active?.data?.settings?.provider || active?.data?.provider || 'openai') as ProviderKey;

  const aiProvider = useAiSettingsStore(s => s.defaults.provider);
  const setAiDefaults = useAiSettingsStore(s => s.setDefaults);


  const uiProvider: ProviderKey = useMemo(() => {
    return (aiProvider as ProviderKey) || legacyProvider;
  }, [aiProvider, legacyProvider]);

  const updateBoth = useCallback(async (next: ProviderKey) => {
    const aiNext = next;

  setAiDefaults({ provider: aiNext as any });

    setLegacyProvider(next);

    const first = listModelsByProvider(next)[0]?.id;
    if (first) {
      setAiDefaults({ model: first });
      setLegacyModel(first);
    }
    if (next === 'ollama') {

      try {
        const base = (window as any)?.useAiConfigStore?.getState?.().keys?.ollama?.baseUrl || 'http://localhost:11434';
        const root = (base || 'http://localhost:11434').replace(/\/+$/,'');
        const ctl = new AbortController();
        const t = setTimeout(() => ctl.abort(), 2500);
        const res = await fetch(`${root  }/api/version`, { signal: ctl.signal }).catch(() => undefined);
        clearTimeout(t);
        if (!res || !res.ok) {
          showToast({ kind: 'warning', message: 'Ollama not reachable at base URL', contextKey: 'ollama:health' });
        }
      } catch { showToast({ kind: 'warning', message: 'Unable to contact Ollama server', contextKey: 'ollama:health' }); }
    }
  }, [setAiDefaults, setLegacyProvider, setLegacyModel]);

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as ProviderKey;
    if (newProvider !== uiProvider) void updateBoth(newProvider);
  };

  return (
    <Label htmlFor={`${id}-provider`}>
      <span>Provider</span>
  <Select id={`${id}-provider`} aria-label="Provider" value={uiProvider} onChange={onChange}>
        {(['openai','anthropic','gemini','ollama'] as const).map(p => (
          <option key={p} value={p}>{providerLabel(p)}</option>
        ))}
      </Select>
    </Label>
  );
};

export default ProviderSelect;
