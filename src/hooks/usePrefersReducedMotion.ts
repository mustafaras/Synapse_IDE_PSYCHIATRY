import * as React from "react";


export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);

    if (typeof (mql as MediaQueryList).addEventListener === "function") {
      (mql as MediaQueryList).addEventListener("change", onChange);
      return () => (mql as MediaQueryList).removeEventListener("change", onChange);
    }

    const legacy = mql as unknown as { addListener?: (fn: () => void) => void; removeListener?: (fn: () => void) => void };
    legacy.addListener?.(onChange);
    return () => legacy.removeListener?.(onChange);
  }, []);

  return reduced;
}
