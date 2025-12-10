import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { listModelsByProvider, type ProviderKey } from '@/utils/ai/models/registry';
import { validateSelection } from '@/utils/ai/models/validator';

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

const Hint = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary, rgba(255,255,255,0.65));
  font-family: inherit;
`;

export const ModelSelect: React.FC = () => {
  const id = useId();
  const { profiles, activeProfileId, setModel: setLegacyModel } = useSettingsStore();
  const active = profiles.find(p => p.id === activeProfileId);
  const provider = (active?.data?.settings?.provider || active?.data?.provider || 'openai') as ProviderKey;
  const modelId = (active?.data?.settings?.model || active?.data?.model || '') as string;

  const aiDefaults = useAiSettingsStore(s => s.defaults);
  const setAiDefaults = useAiSettingsStore(s => s.setDefaults);
  const [hover, setHover] = useState(false);
  const models = useMemo(() => listModelsByProvider(provider), [provider]);
  const validation = useMemo(() => validateSelection(provider, modelId, 'chat_stream'), [provider, modelId]);


  useEffect(() => {
    const effectiveModel = modelId || aiDefaults.model;
    if (!effectiveModel || !models.find(m => m.id === effectiveModel)) {
      const first = models[0]?.id;
      if (first) {
        setAiDefaults({ model: first });
        setLegacyModel(first);
      }
      return;
    }
    if (aiDefaults.model !== effectiveModel) {
      setAiDefaults({ model: effectiveModel });
    }
  }, [modelId, aiDefaults.model, models, setAiDefaults, setLegacyModel]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    setLegacyModel(next);
    setAiDefaults({ model: next });
  }, [setLegacyModel, setAiDefaults]);

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Label htmlFor={`${id}-model`}>
        <span>Model</span>
  <Select id={`${id}-model`} aria-label="Model" value={modelId} onChange={onChange}>
          {models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </Select>
      </Label>
      {!validation.ok && !!hover && (
        <Hint role="note" aria-live="polite">
          {validation.reason} {validation.alternatives?.length ? `Try: ${validation.alternatives.slice(0,3).map(a => a.model).join(', ')}` : ''}
        </Hint>
      )}
    </div>
  );
};

export default ModelSelect;
