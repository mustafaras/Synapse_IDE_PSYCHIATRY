import { useMemo, useState } from 'react';
import { DebugCol, DebugRow, DebugTrayRoot, MiniButton } from './styles';
import { flags } from '@/config/flags';
import { selectTraces } from '@/utils/obs/store';

export default function DebugTray() {
  const [open, setOpen] = useState<boolean>(false);
  const traces = selectTraces();
  const tr = traces[0];
  const summary = useMemo(() => {
    if (!tr) return null;
    const latency = tr.finishedAt ? (tr.finishedAt - tr.startedAt) : undefined;
    const usage = tr.usage ? `P:${tr.usage.prompt} C:${tr.usage.completion}` : 'n/a';
    const cost = tr.cost ? `$${tr.cost.total.toFixed(4)}` : 'n/a';
    const err = tr.error ? `${tr.error.code}${tr.error.status ? `/${tr.error.status}` : ''}` : '';
    return { latency, usage, cost, err };
  }, [tr]);

  if (!flags.aiTrace) return null;

  return (
    <div>
      <MiniButton aria-expanded={open} aria-label="Toggle debug tray" onClick={() => setOpen((v) => !v)}>
        {open ? 'Debug ▲' : 'Debug ▼'}
      </MiniButton>
      {!!open && !!tr && (
        <DebugTrayRoot>
          <DebugRow>
            <DebugCol>
              <span>Status: {tr.status}</span>
              <span>Provider: {tr.provider}:{tr.model}</span>
              <span>Latency: {summary?.latency != null ? `${summary.latency}ms` : 'pending'}</span>
              <span>Usage: {summary?.usage}</span>
              <span>Cost: {summary?.cost}</span>
              {!!summary?.err && <span>Error: {summary.err}</span>}
            </DebugCol>
            <MiniButton aria-label="Copy trace JSON" onClick={async () => { try { await navigator.clipboard.writeText(JSON.stringify(tr, null, 2)); } catch {} }}>Copy trace JSON</MiniButton>
          </DebugRow>
        </DebugTrayRoot>
      )}
    </div>
  );
}
