



export function announce(message: string, politeness: 'polite'|'assertive' = 'polite') {
  try {
    let el = document.getElementById('aria-announcer') as HTMLDivElement | null;
    if (!el) {
      el = document.createElement('div');
      el.id = 'aria-announcer';
      el.setAttribute('aria-live', politeness);
      el.setAttribute('aria-atomic', 'true');
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      el.style.top = 'auto';
      el.style.width = '1px';
      el.style.height = '1px';
      document.body.appendChild(el);
    }

    el.textContent = '';
    setTimeout(() => { if (el) el.textContent = message; }, 10);
  } catch {  }
}
