import * as React from "react";


export function useScrollSpy(anchorIds: string[], scrollRootId: string, rootMargin = "-40% 0px -50% 0px") {
  const [activeId, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const root = document.getElementById(scrollRootId);
    if (!root) return;


    const IO: typeof IntersectionObserver | undefined = (globalThis as any).IntersectionObserver;
    if (!IO) {
      setActive(anchorIds[0] ?? null);
      return;
    }
    const options: IntersectionObserverInit = { root, rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] };
    const io = new IO((entries) => {
      const vis = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio - a.intersectionRatio));
      if (vis[0]?.target?.id) setActive(vis[0].target.id);
    }, options);

    anchorIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [anchorIds.join("|"), scrollRootId]);

  return activeId;
}


export function smoothScrollTo(id: string, scrollRootId: string) {
  const root = document.getElementById(scrollRootId);
  const el = document.getElementById(id);
  if (!root || !el) return;
  const top = el.offsetTop - 12;
  root.scrollTo({ top, behavior: "smooth" });
}
