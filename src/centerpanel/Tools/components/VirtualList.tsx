import * as React from "react";


export interface VirtualListProps<T> extends React.HTMLAttributes<HTMLDivElement> {
  items: T[];
  itemHeight: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  ariaLabel?: string;
  getKey?: (item: T, index: number) => React.Key;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderRow,
  overscan = 6,
  ariaLabel,
  getKey,
  ...rest
}: VirtualListProps<T>) {
  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);


  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setHeight(e.contentRect.height);
    });
    ro.observe(el);
    return () => { ro.disconnect(); };
  }, []);


  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollTop(el.scrollTop));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const total = items.length;
  const viewportCount = Math.max(1, Math.ceil(height / itemHeight));
  const baseOverscan = Math.max(overscan, Math.ceil(viewportCount * 0.5));

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - baseOverscan);
  const endIndex = Math.min(total - 1, Math.ceil((scrollTop + height) / itemHeight) + baseOverscan);
  const slice = items.slice(startIndex, endIndex + 1);

  const topPad = startIndex * itemHeight;
  const bottomPad = Math.max(0, (total - endIndex - 1) * itemHeight);

  return (
    <div ref={wrapRef} {...rest} style={{ position: "relative", overflow: "auto", contain: "content", ...rest.style }} aria-label={ariaLabel}>
      <div role="list" aria-label={ariaLabel} style={{ position: "relative" }}>
        {topPad > 0 && <div style={{ height: topPad }} aria-hidden />}
        {slice.map((item, i) => (
          <div role="listitem" style={{ height: itemHeight }} key={getKey ? getKey(item, startIndex + i) : startIndex + i}>
            {renderRow(item, startIndex + i)}
          </div>
        ))}
        {bottomPad > 0 && <div style={{ height: bottomPad }} aria-hidden />}
      </div>
    </div>
  );
}

export default VirtualList;
