


export function isGuideV2Enabled(): boolean {
  try {

    const cfg = (window as any).__CFG;
    if (cfg && typeof cfg.guideV2 === 'boolean') return !!cfg.guideV2;
  } catch {}
  try {
    const ls = localStorage.getItem('guide.v2');
    if (ls) return ls === 'on' || ls === 'true' || ls === '1';
  } catch {}
  try {
    const ds = document.documentElement.dataset['guideV2'];
    if (ds) return ds === 'on' || ds === 'true' || ds === '1';
  } catch {}
  return true;
}

export function setGuideV2Enabled(on: boolean) {
  try { localStorage.setItem('guide.v2', on ? 'on' : 'off'); } catch {}
  try { document.documentElement.dataset['guideV2'] = on ? 'on' : 'off'; } catch {}
}
