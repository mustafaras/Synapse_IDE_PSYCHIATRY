import React, { useEffect, useState } from 'react';
import { selectEffectiveRoute, useAiSettingsStore } from '@/stores/useAiSettingsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';

export const KeyDebug: React.FC = () => {
  const ai = useAiSettingsStore();
  const eff = useAiSettingsStore(selectEffectiveRoute);
  const legacy = useSettingsStore();
  const [now, setNow] = useState(Date.now());

  const uProv = useAiConfigStore(AiSelectors.provider);
  const uModel = useAiConfigStore(AiSelectors.model);

  const setUnifiedKey = useAiConfigStore(s => s.setKey);
  useEffect(() => {
    try {
      const st = useAiSettingsStore.getState();

      const map: Array<[string, string | undefined]> = [
        ['openai', st.keys.openai],
        ['anthropic', st.keys.anthropic],
  ['gemini', st.keys.gemini],
      ];
      const unified = useAiConfigStore.getState();
      for (const [pidRaw, key] of map) {
        if (!key) continue;
  const pid = pidRaw as any;
        const bucket = (unified.keys as any)[pid];
        const current = bucket?.apiKey;
        if (current !== key) {
          void setUnifiedKey(pid, { apiKey: key });
        }
      }
    } catch {}
  }, [ai.keys.openai, ai.keys.anthropic, ai.keys.gemini, setUnifiedKey]);
  useEffect(() => { const t = setInterval(()=>setNow(Date.now()), 3000); return () => clearInterval(t); }, []);

  useEffect(() => {
    try {
      const st = useAiSettingsStore.getState();
  const mappedProv = st.defaults.provider;
      if (mappedProv !== uProv || st.defaults.model !== uModel) {
        const before = { provider: st.defaults.provider, model: st.defaults.model } as any;
  const nextProv = uProv as any;
  const patch: any = { provider: nextProv };
  if (uModel) patch.model = uModel;
  st.setDefaults(patch);


        try { const { emitAiRouteChanged } = require('@/stores/useAiSettingsStore'); emitAiRouteChanged(before, { provider: nextProv, model: uModel }); } catch {}
      }
    } catch {}
  }, [uProv, uModel]);
  const legacyActive = legacy.profiles.find(p => p.id === legacy.activeProfileId);
  const legacyKeys = (legacyActive?.data as any)?.keys || {};
  const has = {
    openai: !!(legacyKeys.openai?.apiKey || ai.keys.openai),
    anthropic: !!(legacyKeys.anthropic?.apiKey || ai.keys.anthropic),
    gemini: !!(legacyKeys.google?.apiKey || ai.keys.gemini),
  };
  const [authTest, setAuthTest] = useState<string>('');
  async function testAuth() {
    const key = ai.keys.openai || legacyKeys.openai?.apiKey;
    if (!key) { setAuthTest('no key'); return; }
    try {
      const res = await fetch('/api/openai/verify', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ key }) });
      const txt = await res.text();
      setAuthTest(`status=${res.status} ok=${res.ok} body=${txt.slice(0,120).replace(/\n/g,' ')}`);
    } catch (e:any) { setAuthTest(`err ${e?.message||String(e)}`); }
  }
  return (
    <div style={{ fontFamily: 'var(--font-code, monospace)', fontSize: 11, opacity: 0.55, padding: '4px 8px', borderTop: '1px solid #ffffff10' }}>
      <div>KeyDebug t={now % 60000}</div>
      <div>openai: {has.openai ? 'YES' : 'NO'} len={ai.keys.openai?.length || 0}</div>
      <div>anthropic: {has.anthropic ? 'YES' : 'NO'} len={ai.keys.anthropic?.length || 0}</div>
      <div>gemini: {has.gemini ? 'YES' : 'NO'} len={ai.keys.gemini?.length || 0}</div>
      <div>enc={String(ai.keys.enc)} lastUpdated={ai.keys.lastUpdated}</div>
      <div>unified.provider={uProv} unified.model={uModel}</div>
      <div>defaults.provider={ai.defaults.provider} model={ai.defaults.model}</div>
      <div>effective.provider={eff.provider} model={eff.model}</div>
  {(uProv !== ai.defaults.provider || uModel !== ai.defaults.model) && (
        <div style={{ color:'#E1C542' }}>WARN legacy defaults out of sync with unified</div>
      )}
      <button style={{ marginTop:4, fontSize:10 }} onClick={testAuth}>Auth Test</button>
      {!!authTest && <div>authTest: {authTest}</div>}
    </div>
  );
};

export default KeyDebug;