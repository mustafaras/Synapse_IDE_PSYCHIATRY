import React, { useEffect, useRef } from 'react';


interface SearchBoxProps {
  value: string;
  onChange(v:string): void;
  onClear(): void;
  placeholder?: string;
  results?: number;

  inputRefCallback?: (api: { focus: () => void }) => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ value, onChange, onClear, placeholder='Search the library…', results, inputRefCallback }) => {
  const idRef = useRef(`psy-search-${Math.random().toString(36).slice(2)}`);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [announced, setAnnounced] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();


  useEffect(()=> {
    const handler = (e: KeyboardEvent) => {
      const mac = navigator.platform?.toUpperCase().includes('MAC');
      const isCombo = (mac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      if(isCombo){
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select?.();
      }
    };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  }, []);


  const handleClear = React.useCallback(() => {
    startTransition(()=> { onChange(''); onClear(); });
    inputRef.current?.focus();
  }, [onChange, onClear]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (value?.length) {
        e.preventDefault();
        e.stopPropagation();
        handleClear();
      }

    }
  };

  const handleInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    startTransition(() => onChange(next));
  }, [onChange]);


  useEffect(()=>{
    if(typeof results !== 'number') return undefined;
    const t = setTimeout(()=> setAnnounced(results), 120);
    return () => { clearTimeout(t); };
  }, [results]);


  useEffect(()=> { if(inputRefCallback){ inputRefCallback({ focus: () => inputRef.current?.focus() }); } }, [inputRefCallback]);

  return (
    <div className="psy-search__wrap" role="search" aria-label="Library search">
      <span className="psy-search__icon" aria-hidden="true">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          role="presentation"
          focusable="false"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
      <label htmlFor={idRef.current} className="visually-hidden">{placeholder}</label>
      <input
        ref={inputRef}
        id={idRef.current}
        type="text"
        className="psy-search__input"
        value={value}
        placeholder={placeholder}
        aria-label="Search"
        aria-keyshortcuts="Control+K Meta+K"
        aria-busy={isPending || undefined}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
      {value?.length > 0 && (
        <button
          type="button"
          className="psy-search__clear"
            aria-label="Clear search"
            onClick={handleClear}
        >
          ×
        </button>
      )}
      {}
  <div className="psy-search__meta">{(results ?? 0)} results</div>
      {}
      <div className="sr-only psy-search__live" role="status" aria-live="polite" aria-atomic="true">{announced != null ? `${announced} results` : ''}</div>
    </div>
  );
};
