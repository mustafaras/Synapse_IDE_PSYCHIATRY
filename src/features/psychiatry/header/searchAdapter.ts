



let lastWrappers: HTMLElement[] = [];

export async function performSearch(query: string): Promise<number | null> {
  const q = (query || "").trim();
  clearPreviousHighlights();
  if (!q) {
    window.dispatchEvent(new CustomEvent("synapse:ui:search", { detail: { query, total: 0 } }));
    return 0;
  }
  const needle = q.toLowerCase();

  let total = 0;


  const leftSelectors = [
    '.left-rail', '.leftPanel', '[data-psy-left]', '[data-left-panel]',
    'aside[data-role="left"]', '[data-sidebar="left"]'
  ];
  const leftRoot = firstExisting(leftSelectors);
  if (leftRoot) total += highlightInElement(leftRoot, needle, 6000);


  const rightRoot = document.querySelector('.rp-panel');
  if (rightRoot) total += highlightInElement(rightRoot, needle, 8000);


  document.querySelectorAll('.rp-prompts-grid .rp-prompt-text').forEach(el => {
    total += highlightInElement(el, needle, 1200);
  });

  window.dispatchEvent(new CustomEvent('synapse:ui:search', { detail: { query, total } }));
  return total;
}

function firstExisting(sels: string[]): Element | null {
  for (const s of sels) { const el = document.querySelector(s); if (el) return el; }
  return null;
}

function clearPreviousHighlights() {
  if (lastWrappers.length) {
    for (const wrap of lastWrappers) {
      const original = wrap.getAttribute('data-orig');
      if (original != null) {
        const text = document.createTextNode(original);
        wrap.replaceWith(text);
      }
    }
  }
  lastWrappers = [];
}

function highlightInElement(root: Element, qLower: string, charBudget = 4000): number {
  if (!qLower) return 0;
  let count = 0;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let consumed = 0; const targets: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text; const val = node.nodeValue || '';
      consumed += val.length; targets.push(node); if (consumed > charBudget) break;
    }
    const re = new RegExp(qLower.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig');
    for (const textNode of targets) {
      const original = textNode.nodeValue || '';
      if (!original.toLowerCase().includes(qLower)) continue;
      re.lastIndex = 0;
      const wrapper = document.createElement('span');
      wrapper.dataset.psySearchWrapper = '1';
      wrapper.setAttribute('data-orig', original);
      let last = 0; let m: RegExpExecArray | null;
      while ((m = re.exec(original))) {
        if (m.index > last) wrapper.append(original.slice(last, m.index));
        const mark = document.createElement('mark');
        mark.textContent = m[0];
        mark.dataset.psySearchHit = '1';
        mark.style.background = 'linear-gradient(90deg,#1BCBFF,#0EA5FF)';
        mark.style.color = '#001018';
        mark.style.padding = '0 2px';
        mark.style.borderRadius = '4px';
        wrapper.append(mark);
        last = m.index + m[0].length;
        count++;
      }
      if (last < original.length) wrapper.append(original.slice(last));
      textNode.replaceWith(wrapper);
      lastWrappers.push(wrapper);
    }
  } catch {  }
  return count;
}
