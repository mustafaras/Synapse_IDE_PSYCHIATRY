

export function initRemoveToolkitCtas() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return () => {};
  const selectors = ['cta-send','cta-insert','cta-copy'].map(id => `[data-testid="${id}"]`).join(',');
  const removeNow = () => {
    document.querySelectorAll(selectors).forEach(el => el.parentElement ? el.remove() : el.remove());
  };
  removeNow();
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        removeNow();
        break;
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
  return () => mo.disconnect();
}
