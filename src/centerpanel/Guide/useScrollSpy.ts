

import { useEffect, useState } from "react";

export function useScrollSpy(ids: string[], root: HTMLElement | null) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    if (!root || !ids.length) return;
    const obs = new IntersectionObserver(
      entries => {
        const vis = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (vis[0]) setActive((vis[0].target as HTMLElement).id);
      },
      { root, rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.6, 1] }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [ids.join("|"), root]);

  return active;
}
