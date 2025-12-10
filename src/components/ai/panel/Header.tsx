import React, { useEffect, useMemo, useState } from 'react';
import { Brand, BrandIcon, BrandText, HeaderRow, Subtitle, Title, TitleWrap } from './styles';
import SettingsModal from '@/components/settings/SettingsModal';
import { AiSelectors, useAiConfigStore } from '@/stores/useAiConfigStore';
import { deriveModelMeta } from '@/ai/modelMeta';


type KeyState = 'unknown' | 'verified' | 'missing' | 'invalid' | 'rate-limited';

export const PanelHeader: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const provider = useAiConfigStore(AiSelectors.provider);
  const model = useAiConfigStore(AiSelectors.model);

  const keyStatus = useAiConfigStore((s:any) => s.keyStatus?.[s.provider]);
  const refreshKeyStatus = useAiConfigStore((s:any) => s.refreshKeyStatus);
  const keys = useAiConfigStore(AiSelectors.keysForActive as any) as any;
  const effectiveState: KeyState = !keys?.apiKey && provider !== 'ollama' ? 'missing' : (keyStatus?.state || 'unknown');

  const poweredBy = useMemo(() => {
    const labelMap: Record<string, string> = { openai: 'OpenAI', anthropic: 'Anthropic', google: 'Gemini', gemini: 'Gemini', ollama: 'Ollama', custom: 'Custom' };
    const providerLabel = labelMap[provider] || provider;
    if (!model) return providerLabel;

    const meta = deriveModelMeta(provider as any, model) || { family: model } as any;
    const fam = meta.family && meta.family !== model ? meta.family : model;
    return `${providerLabel} • ${fam}`;
  }, [provider, model]);

  const statusColor = effectiveState === 'verified' ? '#2ECC71'
    : effectiveState === 'missing' ? '#E74C3C'
    : effectiveState === 'invalid' ? '#E67E22'
    : effectiveState === 'rate-limited' ? '#E1C542'
    : '#A0A0A0';
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const tick = setInterval(()=> setNow(Date.now()), 1000);
    const auto = setInterval(()=> { void refreshKeyStatus(); }, 10 * 60 * 1000);
    return () => { clearInterval(tick); clearInterval(auto); };
  }, [refreshKeyStatus]);

  const retryInMs = effectiveState === 'rate-limited' && keyStatus?.retryAt ? Math.max(0, keyStatus.retryAt - now) : 0;
  const retrySecs = Math.ceil(retryInMs/1000);
  const lastChecked = keyStatus?.checkedAt ? new Date(keyStatus.checkedAt).toLocaleTimeString() : '—';
  const statusTitle = (() => {
    switch(effectiveState){
      case 'verified': return `API key verified • Last: ${lastChecked}`;
      case 'missing': return 'API key not set';
      case 'invalid': return `${keyStatus?.message || 'API key invalid'  } • Last: ${lastChecked}`;
      case 'rate-limited': return `Rate limited (${retrySecs}s) • Last: ${lastChecked}`;
      default: return `Status unknown • Last: ${lastChecked}`;
    }
  })();

  useEffect(() => {
    const onOpen = () => setSettingsOpen(true);
    window.addEventListener('ai:openKeys' as any, onOpen as any);
    return () => { window.removeEventListener('ai:openKeys' as any, onOpen as any); };
  }, []);

  return (
    <HeaderRow aria-label="Panel Header">
      <TitleWrap>
        <Brand>
          <BrandIcon aria-hidden />
          <BrandText>
            <Title role="heading" aria-level={2}>SynapseCore AI</Title>
            <Subtitle style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span>Powered by {poweredBy}</span>
              {effectiveState === 'rate-limited' && retrySecs > 0 && (
                <span style={{ fontSize:9, padding:'2px 6px', borderRadius:6, background:'rgba(225,197,66,0.18)', border:'1px solid rgba(225,197,66,0.4)', letterSpacing:0.5 }} title={`Rate limited • retry in ${retrySecs}s`}>{retrySecs}s</span>
              )}
              <button
                onClick={() => { void refreshKeyStatus(); }}
                aria-label={statusTitle}
                title={`${statusTitle  } (Click to refresh)`}
                style={{ position:'relative', minWidth:18, height:18, borderRadius:9, border:'1px solid rgba(255,255,255,0.18)', background:`linear-gradient(135deg,${statusColor} 0%, ${statusColor}CC 100%)`, cursor:'pointer', padding:0, display:'inline-flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 4px ${statusColor}66` }}
              >
                {effectiveState === 'rate-limited' && retrySecs > 0 ? (
                  <span style={{ fontSize:9, fontWeight:600, color:'#111' }}>{retrySecs}</span>
                ) : (
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff', opacity:0.9 }} />
                )}
              </button>
            </Subtitle>
          </BrandText>
        </Brand>
      </TitleWrap>
      {}
      <span
        style={{
          marginLeft: 'auto',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.5px',
          background: 'linear-gradient(90deg, var(--ai-gold-soft, #5FD6F5) 0%, var(--ai-gold, #00A6D7) 100%)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          display: 'inline-block',
          whiteSpace: 'nowrap'
        }}
        aria-label="for Psychiatry"
      >
        for Psychiatry
      </span>
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </HeaderRow>
  );
};

export default PanelHeader;
