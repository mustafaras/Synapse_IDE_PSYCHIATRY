import { memo, useCallback, useEffect, useRef, useState } from 'react';


function useRenders(label: string){
  const ref = useRef(0); ref.current++;
  if (import.meta.env.MODE !== 'production') {

    const g: any = (window as any);
    g.__railMetrics ||= {};
    g.__railMetrics[label] = (g.__railMetrics[label] || 0) + 1;
  }
}

type SearchBarProps = {
  value: string;
  onChange: (next: string) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
};

function SearchBarInner({ value, onChange, onClear, placeholder = 'Search…', className }: SearchBarProps) {
  useRenders('SearchBar');
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | null>(null);


  useEffect(() => { setDraft(value); }, [value]);


  useEffect(() => {
    const t = setTimeout(() => { if (draft !== value) onChange(draft); }, 220);
    return () => clearTimeout(t);
  }, [draft, value, onChange]);


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const metaK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (metaK) { e.preventDefault(); inputRef.current?.focus(); }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        e.preventDefault(); setDraft(''); onClear();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClear]);

  const clear = useCallback(() => { setDraft(''); onClear(); inputRef.current?.focus(); }, [onClear]);

  return (
    <div className={`rail-search${className ? ` ${  className}` : ''}`}>
      <input
        ref={inputRef}
        type="search"
        role="searchbox"
        aria-label="Search library"
        className="rail-search-input"
        placeholder={placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {draft?.length > 0 && (
        <button
          type="button"
          className="rail-search-clear"
          aria-label="Clear search"
          onClick={clear}
        >
          ✕
        </button>
      )}
      <div className="rail-search-hint" aria-hidden="true">Ctrl/Cmd+K</div>
    </div>
  );
}

export const SearchBar = memo(SearchBarInner);
SearchBar.displayName = 'SearchBar';

export default SearchBar;
