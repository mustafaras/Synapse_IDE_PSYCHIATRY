import * as React from 'react';
import { Eraser, Maximize2, RefreshCw } from 'lucide-react';
import { IconWrapper as Icon } from '@/components/atoms/Icon';
import './previewToolbar.css';

type Ratio = 'auto' | 'fit' | '1:1' | '16:9' | '4:3';

export type EditorPreviewToolbarProps = {
  onRefresh: () => void;
  autoClear: boolean;
  onToggleAutoClear: () => void;
  ratio: Ratio;
  onChangeRatio: (r: Ratio) => void;

  widthPercent?: number;
  onChangeWidthPercent?: (v: number) => void;
  statusText?: string;
};


const ratiosUI: Array<Extract<Ratio, 'auto' | 'fit'>> = ['auto', 'fit'];

export const EditorPreviewToolbar: React.FC<EditorPreviewToolbarProps> = ({
  onRefresh,
  autoClear,
  onToggleAutoClear,
  ratio,
  onChangeRatio,
  widthPercent,
  onChangeWidthPercent,
  statusText,
}) => {
  const selected: Extract<Ratio, 'auto' | 'fit'> = (ratiosUI.includes(ratio as any) ? (ratio as any) : 'auto');
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(() => Math.max(0, ratiosUI.indexOf(selected)));
  const menuRef = React.useRef<HTMLUListElement | null>(null);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  React.useEffect(() => {
    const sel: Extract<Ratio, 'auto' | 'fit'> = (ratiosUI.includes(ratio as any) ? (ratio as any) : 'auto');
    const idx = Math.max(0, ratiosUI.indexOf(sel));
    setActiveIndex(idx);
  }, [ratio]);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="preview-toolbar" role="toolbar" aria-label="Preview controls">
  <div className="group left">
        <button className="btn" onClick={onRefresh} aria-label="Refresh preview" title="Refresh">
          <Icon icon={RefreshCw} size={18} />
          <span className="btn-label">Refresh</span>
        </button>

        <button
          className={`btn ${autoClear ? 'pressed' : ''}`}
          onClick={onToggleAutoClear}
          aria-pressed={autoClear}
          aria-label="Toggle auto clear"
          title="Auto clear on run"
        >
          <Icon icon={Eraser} size={18} />
          <span className="btn-label">Auto Clear</span>
        </button>

        <div className="dropdown" role="group" aria-label="Ratio">
          <button
            ref={btnRef}
            className="btn"
            aria-haspopup="listbox"
            aria-expanded={open}
            title="Ratio"
            onClick={() => {
              setOpen(v => !v);

              setTimeout(() => {
                const i = Math.max(0, ratiosUI.indexOf(selected));
                itemRefs.current[i]?.focus();
                setActiveIndex(i);
              }, 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => {
                  const i = Math.max(0, ratiosUI.indexOf(selected));
                  itemRefs.current[i]?.focus();
                  setActiveIndex(i);
                }, 0);
              }
            }}
          >
            <Icon icon={Maximize2} size={18} />
            <span className="btn-label">{selected.toUpperCase()}</span>
          </button>
          <ul
            ref={menuRef}
            className="menu"
            role="listbox"
            aria-activedescendant={`ratio-${ratiosUI[activeIndex]}`}
            style={{ display: open ? 'flex' : 'none' }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btnRef.current?.focus(); }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = Math.min(ratiosUI.length - 1, activeIndex + 1);
                setActiveIndex(next);
                itemRefs.current[next]?.focus();
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = Math.max(0, activeIndex - 1);
                setActiveIndex(prev);
                itemRefs.current[prev]?.focus();
              }
              if (e.key === 'Home') { e.preventDefault(); setActiveIndex(0); itemRefs.current[0]?.focus(); }
              if (e.key === 'End') { e.preventDefault(); const last = ratiosUI.length - 1; setActiveIndex(last); itemRefs.current[last]?.focus(); }
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const r = ratiosUI[activeIndex];
                onChangeRatio(r);
                setOpen(false);
                btnRef.current?.focus();
              }
            }}
          >
            {ratiosUI.map((r, i) => (
              <li key={r}>
                <button
                  ref={(el) => { itemRefs.current[i] = el; }}
                  id={`ratio-${r}`}
                  role="option"
                  aria-selected={selected === r}
                  className={`menu-item ${selected === r ? 'selected' : ''}`}
                  onClick={() => {
                    onChangeRatio(r);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                >
                  {r.toUpperCase()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {}
    {onChangeWidthPercent ? (
          <div className="segmented" role="group" aria-label="Split presets">
            {[
              { label: '70/30', v: 70 },
              { label: '60/40', v: 60 },
              { label: '50/50', v: 50 },
              { label: '40/60', v: 40 },
              { label: '30/70', v: 30 },
            ].map(p => (
              <button
                key={p.label}
                className={`seg-btn ${widthPercent === p.v ? 'active' : ''}`}
                onClick={() => onChangeWidthPercent(p.v)}
                title={`Set editor width ${p.label}`}
              >
                <span className="seg-label">{p.label}</span>
              </button>
            ))}
          </div>
        ) : null}

  {}
      </div>

      <div className="group right" aria-live="polite">
        {statusText ? <span className="status">{statusText}</span> : null}
      </div>
    </div>
  );
};

export default EditorPreviewToolbar;
