


import { usePsychStore } from './store';

(function init() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('psychDebugStore')) return;
    const MAX_IN_WINDOW = 40;
    const WINDOW_MS = 1000;
    let count = 0;
    let start = performance.now();
    console.warn('[PsychStoreDebug] Instrumentation active');
    const unsub = usePsychStore.subscribe((state) => {
      count++;
      const now = performance.now();
      if (now - start > WINDOW_MS) {
        if (count > MAX_IN_WINDOW) {

          console.warn('[PsychStoreDebug] High update frequency', { count, windowMs: WINDOW_MS, sampleKeys: Object.keys(state).slice(0,8) });
        }
        start = now; count = 0;
      }
    });

    (window as any).__psychStoreUnsub = unsub;
  } catch (e) {
    console.warn('[PsychStoreDebug] init failed', e);
  }
})();
