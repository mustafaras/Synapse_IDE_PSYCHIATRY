import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import { buildProviderRequest, sanitizeBuiltRequest } from '@/ai/samplingMapper';
import { getCaps, getStaticModels, listModelsDynamic } from '@/ai/modelRegistry';
import type { ProviderId, Sampling } from '@/stores/useAiConfigStore.types';
import styles from './AiSettingsModal.module.css';

interface Props { open: boolean; onClose(): void; }

type Snapshot = { provider: ProviderId; model: string | null; sampling: Sampling; keys: Record<string, any> };

interface DraftState {
  provider: ProviderId;
  model: string | null;
  sampling: Sampling;
  apiKey?: string;
  baseUrl?: string;
  models: string[];
  caps: ReturnType<typeof getCaps>;
  dirty: boolean;
}

export const AiSettingsModal: React.FC<Props> = ({ open, onClose }) => {
  const storeProvider = useAiConfigStore(AiSelectors.provider);
  const storeModel = useAiConfigStore(AiSelectors.model);
  const storeSampling = useAiConfigStore(AiSelectors.sampling);
  const storeCaps = useAiConfigStore(AiSelectors.caps);
  const storeModels = useAiConfigStore(AiSelectors.modelsForActive);

  const setProvider = useAiConfigStore(s => s.setProvider);
  const setModel = useAiConfigStore(s => s.setModel);
  const setSampling = useAiConfigStore(s => s.setSampling);
  const setKey = useAiConfigStore(s => s.setKey);
  const refreshModels = useAiConfigStore(s => s.refreshModels);
  const snapshotRef = useRef<Snapshot | null>(null);
  const [draft, setDraft] = useState<DraftState | null>(null);
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string|null>(null);
  const [modelRefreshPending, setModelRefreshPending] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});


  useEffect(() => {
    if (open) {
      const snap: Snapshot = { provider: storeProvider, model: storeModel, sampling: { ...storeSampling }, keys: { ...useAiConfigStore.getState().keys } };
      snapshotRef.current = snap;
      setDraft({
        provider: snap.provider,
        model: snap.model,
        sampling: { ...snap.sampling },
        apiKey: (snap.keys[snap.provider] || {}).apiKey,
        baseUrl: (snap.keys[snap.provider] || {}).baseUrl,
        models: [...storeModels],
        caps: storeCaps,
        dirty: false,
      });
      setErrors({});
      setTestMsg(null);
    }
  }, [open, storeProvider, storeModel, storeSampling, storeModels, storeCaps]);

  if (!open) return null;

  const onCancel = () => { onClose(); };

  const computeValidation = useCallback((d: DraftState | null): Record<string,string> => {
    if (!d) return {};
    const errs: Record<string,string> = {};
    if (d.sampling.temperature < 0 || d.sampling.temperature > 2) errs.temperature = 'Temperature must be 0–2';
    if (d.caps.supportsTopP && (d.sampling.top_p != null) && (d.sampling.top_p < 0 || d.sampling.top_p > 1)) errs.top_p = 'Top P must be 0–1';
    if (d.sampling.max_tokens != null && d.sampling.max_tokens <= 0) errs.max_tokens = 'Max tokens must be positive';
    if (d.caps.tokenLimit && d.sampling.max_tokens && d.sampling.max_tokens > d.caps.tokenLimit) errs.max_tokens = `Max tokens exceeds cap (${d.caps.tokenLimit})`;
  if ((d.provider === 'openai' || d.provider === 'anthropic' || d.provider === 'gemini') && !d.apiKey) errs.apiKey = 'API key required';
    if ((d.provider === 'ollama') && !d.baseUrl) errs.baseUrl = 'Base URL required';
    return errs;
  }, []);

  useEffect(() => { setErrors(computeValidation(draft)); }, [draft, computeValidation]);

  const applyDraftToStore = useCallback(async (closeAfter: boolean) => {
    if (!draft) return;
    if (Object.keys(errors).length) return;
    if (draft.provider !== storeProvider) await setProvider(draft.provider);
    if (draft.model && draft.model !== storeModel) setModel(draft.model);
    setSampling({ ...draft.sampling });
  const keyPayload: any = {};
  if (draft.apiKey) keyPayload.apiKey = draft.apiKey;
  if (draft.baseUrl) keyPayload.baseUrl = draft.baseUrl;
  await setKey(draft.provider, keyPayload);
    await refreshModels(draft.provider);
    if (closeAfter) onClose();
    else setDraft(d => d ? { ...d, dirty: false } : d);
  }, [draft, errors, setProvider, setModel, setSampling, setKey, refreshModels, onClose, storeProvider, storeModel]);

  const onApply = () => { void applyDraftToStore(false); };
  const onSaveAndClose = () => { void applyDraftToStore(true); };
  const onReset = () => {
    const snap = snapshotRef.current; if (!snap) return;
    setDraft({
      provider: snap.provider,
      model: snap.model,
      sampling: { ...snap.sampling },
      apiKey: (snap.keys[snap.provider]||{}).apiKey,
      baseUrl: (snap.keys[snap.provider]||{}).baseUrl,
      models: getStaticModels(snap.provider),
      caps: getCaps(snap.provider),
      dirty: false,
    });
  };

  const update = <K extends keyof DraftState>(key: K, value: DraftState[K]) => setDraft(d => d ? ({ ...d, [key]: value, dirty: true }) : d);

  const doTest = async () => {
    if (!draft) return;
    setTesting(true); setTestMsg(null);
    try {
  const keyPayload: any = {};
  if (draft.apiKey) keyPayload.apiKey = draft.apiKey;
  if (draft.baseUrl) keyPayload.baseUrl = draft.baseUrl;
  const remote = await listModelsDynamic(draft.provider, keyPayload).catch(()=>[]);
      if (remote.length) update('models', Array.from(new Set([...getStaticModels(draft.provider), ...remote])));
      setTestMsg(remote.length ? `Dynamic models found (${remote.length})` : 'No dynamic models; static list only');
    } finally { setTesting(false); }
  };

  const refreshModelsLocal = async () => {
    if (!draft) return; setModelRefreshPending(true);
    try {
  const keyPayload: any = {};
  if (draft.apiKey) keyPayload.apiKey = draft.apiKey;
  if (draft.baseUrl) keyPayload.baseUrl = draft.baseUrl;
  const remote = await listModelsDynamic(draft.provider, keyPayload).catch(()=>[]);
      update('models', Array.from(new Set([...getStaticModels(draft.provider), ...remote])));
    } finally { setModelRefreshPending(false); }
  };

  const builtPreview = useMemo(() => {
    if (!draft || !draft.model) return null;
    try {
  const opt: any = { provider: draft.provider, model: draft.model, sampling: draft.sampling, prompt: '[sample prompt]' };
  if (draft.apiKey) opt.apiKey = draft.apiKey;
  if (draft.baseUrl) opt.baseUrl = draft.baseUrl;
  const built = buildProviderRequest(opt);
      return sanitizeBuiltRequest(built);
    } catch { return null; }
  }, [draft]);

  const caps = draft?.caps || storeCaps;
  const disabledTopP = !caps.supportsTopP;
  const disabledJson = !caps.jsonMode;
  const models = draft?.models || [];
  const model = draft?.model || '';
  const sampling = draft?.sampling || storeSampling;
  const provider = draft?.provider || storeProvider;
  const draftApiKey = draft?.apiKey || '';
  const draftBaseUrl = draft?.baseUrl || '';
  const dirty = !!draft?.dirty;

  return (
    <div
      role='dialog'
      aria-modal='true'
      className={styles.modal}
    >
      <div className={styles.panel}>
        <div className={styles.header}>
          <strong className={styles.title}>AI Settings</strong>
          <button onClick={onCancel} className={styles.closeBtn} title='Close without reverting committed store state.'>×</button>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>
            <span>Provider</span>
            <select className={styles.input} aria-label="Provider" value={provider} onChange={e => {
              const p = e.target.value as ProviderId;
              setDraft({
                provider: p,
                model: getStaticModels(p)[0] || null,
                sampling: { ...sampling, json_mode: getCaps(p).jsonMode ? sampling.json_mode : false, max_tokens: sampling.max_tokens },
                apiKey: (snapshotRef.current?.keys[p]||{}).apiKey,
                baseUrl: (snapshotRef.current?.keys[p]||{}).baseUrl,
                models: getStaticModels(p),
                caps: getCaps(p),
                dirty: true,
              });
            }}>
              {(['openai','anthropic','gemini','ollama','custom'] as const).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className={styles.label}>
            <span>Model</span>
            <select className={styles.input} aria-label="Model" value={model || ''} disabled={!models.length} onChange={e => update('model', e.target.value)}>
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            {!models.length && <span className={styles.hint}>No models</span>}
            <div className={styles.btnGroup}>
              <button className={styles.btn} disabled={modelRefreshPending} onClick={() => { void refreshModelsLocal(); }}>Refresh</button>
              <button className={styles.btn} onClick={() => { void doTest(); }} disabled={testing}>{testing ? 'Testing…' : 'Test Conn'}</button>
            </div>
            {!!testMsg && <span className={styles.hint}>{testMsg}</span>}
          </div>
          <div className={styles.labelFlex1}>
            <span>System Prompt</span>
            <textarea className={styles.textarea} aria-label="System Prompt" placeholder="Enter system prompt..." value={sampling.system_prompt || ''} onChange={e => update('sampling', { ...sampling, system_prompt: e.target.value })} />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>
            <span>Temperature</span>
            <input type='range' min={0} max={2} step={0.1} aria-label="Temperature" title="Adjust temperature (0-2)" value={sampling.temperature} onChange={e => update('sampling', { ...sampling, temperature: parseFloat(e.target.value) })} />
            <span className={styles.hint}>{sampling.temperature.toFixed(2)}</span>
            {!!errors.temperature && <span className={styles.hintError}>{errors.temperature}</span>}
          </div>
          <div className={styles.label}>
            <span>Top P</span>
            <input type='range' min={0} max={1} step={0.05} aria-label="Top P" title="Adjust top P (0-1)" value={sampling.top_p ?? 1} disabled={disabledTopP} onChange={e => update('sampling', { ...sampling, top_p: parseFloat(e.target.value) })} />
            {!!disabledTopP && <span className={styles.hint}>Not supported</span>}
            {!!errors.top_p && <span className={styles.hintError}>{errors.top_p}</span>}
          </div>
          <div className={styles.label}>
            <span>Max Tokens</span>
            <input className={styles.input} type='number' value={sampling.max_tokens ?? ''} onChange={e => update('sampling', { ...sampling, max_tokens: Number(e.target.value) || undefined })} placeholder={String(caps.tokenLimit || '')} />
            {!!caps.tokenLimit && <span className={styles.hint}>≤ {caps.tokenLimit}</span>}
            {!!errors.max_tokens && <span className={styles.hintError}>{errors.max_tokens}</span>}
          </div>
          <label className={styles.labelFlexBasis120} title={disabledJson ? 'This provider does not support JSON mode.' : ''}>
            <span>JSON Mode</span>
            <input type='checkbox' disabled={disabledJson} checked={!disabledJson && sampling.json_mode} onChange={e => update('sampling', { ...sampling, json_mode: e.target.checked })} />
          </label>
        </div>
        <hr className={styles.divider} />
        <strong className={styles.subtitle}>Provider Keys</strong>
        <div className={styles.row}>
          {(provider === 'openai' || provider === 'anthropic' || provider === 'gemini') && (
            <div className={styles.label}>
              <span>API Key</span>
              <input className={styles.input} type='password' value={draftApiKey} onChange={e => update('apiKey', e.target.value)} placeholder='sk-...' />
              {!!errors.apiKey && <span className={styles.hintError}>{errors.apiKey}</span>}
            </div>
          )}
          {(provider === 'openai' || provider === 'ollama' || provider === 'custom') && (
            <div className={styles.label}>
              <span>Base URL</span>
              <input className={styles.input} type='text' value={draftBaseUrl} onChange={e => update('baseUrl', e.target.value)} placeholder={provider==='ollama' ? 'http://localhost:11434' : 'https://api.proxy.com'} />
              {!!errors.baseUrl && <span className={styles.hintError}>{errors.baseUrl}</span>}
            </div>
          )}
        </div>
  {(provider==='openai' || provider==='anthropic' || provider==='gemini') && !draftApiKey && <div className={styles.hintWarning}>API key missing: some features disabled.</div>}
        {provider==='ollama' && !draftBaseUrl && <div className={styles.hintWarning}>Base URL required for Ollama.</div>}
        <details className={styles.previewDetails} open>
          <summary className={styles.previewSummary}>Request Preview (dry-run)</summary>
          <div className={styles.previewContent}>
            {builtPreview ? (
              <pre className={styles.previewPre}>{(() => { try { return JSON.stringify(builtPreview, null, 2); } catch { return '—'; } })()}</pre>
            ) : <span className={styles.hint}>Select provider + model to preview.</span>}
            {Object.keys(errors).length > 0 && <div className={styles.errorMessage}>Cannot apply – fix validation errors.</div>}
          </div>
        </details>
        <div className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerLeft}>
              <button className={styles.btn} disabled={!dirty || Object.keys(errors).length>0} onClick={onApply} title='Apply changes to store (keep modal open)'>Apply</button>
              <button className={styles.btn} disabled={!dirty} onClick={onReset} title='Reset draft to original snapshot'>Reset</button>
            </div>
            <div className={styles.footerRight}>
              <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>
              <button className={styles.btnSaveClose} disabled={Object.keys(errors).length>0} onClick={onSaveAndClose}>Save & Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiSettingsModal;
