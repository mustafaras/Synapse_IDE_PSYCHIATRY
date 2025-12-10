
import { STREAM_THROTTLE_MS } from '@/features/beginnerAssistant';
import { showToast } from '@/ui/toast/api';
import { useEditorStore } from '@/stores/editorStore';

const THROTTLE = STREAM_THROTTLE_MS || 250;
const lastRunByTab = new Map<string, number>();

export async function runPreview(tabId: string): Promise<void> {
  const now = Date.now();
  const last = lastRunByTab.get(tabId) || 0;
  if (now - last < THROTTLE) return;
  lastRunByTab.set(tabId, now);
  const store = useEditorStore.getState();
  const tab = store.tabs.find(t => t.id === tabId);
  if (!tab) return;
  const lang = (tab.language || '').toLowerCase();
  const supported = ['html', 'css', 'javascript'];
  if (!supported.includes(lang)) {
    showToast({ kind: 'info', message: 'Preview available for HTML / CSS / JavaScript only', contextKey: 'preview:unsupported' });
    return;
  }
  try {
    const evt = new CustomEvent('synapse.preview.run', { detail: { tabId, forceShow: true } });
    window.dispatchEvent(evt);
  } catch (e) {
    console.warn('previewBridge dispatch failed', e);
  }
}


export default { runPreview };
