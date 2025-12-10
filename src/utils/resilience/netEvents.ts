import { useResilience } from './store';
import { startOutboxWorker } from './worker';

let wired = false;

export function wireNetworkEvents() {
  if (wired) return;
  wired = true;
  const setOnline = (v: boolean) => useResilience.getState().setOnline(v);
  const onOnline = () => { setOnline(true); startOutboxWorker(); };
  const onOffline = () => { setOnline(false); };
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  setOnline(navigator.onLine);
  if (navigator.onLine) startOutboxWorker();
}
