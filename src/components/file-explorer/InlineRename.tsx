import React from 'react';

import './inlineRename.css';

type Props = {
  base: string;
  ext?: string;
  autoFocus?: boolean;

  siblingNames?: string[];
  onCommit: (newBase: string) => void;
  onCancel: () => void;
};


const InlineRename: React.FC<Props> = ({
  base,
  ext = '',
  autoFocus = true,
  siblingNames = [],
  onCommit,
  onCancel,
}) => {
  const [value, setValue] = React.useState(base);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const errId = React.useId();

  const validate = React.useCallback(
    (v: string): string | null => {
      const trimmed = v.trim();
      if (!trimmed) return 'Name can\'t be empty';
      if (trimmed.includes('/') || trimmed.includes('\\')) return 'Name can\'t contain slashes';
      if (siblingNames?.map(s => s.toLowerCase()).includes(`${trimmed}${ext}`.toLowerCase())) {
        return 'A file with this name already exists';
      }
      return null;
    },
    [siblingNames, ext]
  );

  React.useEffect(() => {
    if (autoFocus && inputRef.current) {
      try {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(0, base.length);
      } catch {}
    }
  }, [autoFocus, base]);

  const commitIfValid = React.useCallback(() => {
    const err = validate(value);
    setError(err);
    if (!err) {
      onCommit(value.trim());
    } else {

      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [validate, value, onCommit]);

  return (
    <span className="inline-rename-wrap">
      <input
        ref={inputRef}
        className={`inline-rename-input${error ? ' has-error' : ''}`}
        value={value}
        aria-label="Rename file"
        aria-invalid={!!error}
        aria-errormessage={error ? errId : undefined}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitIfValid();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            onCancel();
          }
        }}
        onBlur={() => {

          const err = validate(value);
          setError(err);
          if (!err) onCommit(value.trim());
        }}
      />
      {ext ? (
        <span className="inline-rename-ext" aria-hidden="true">{ext}</span>
      ) : null}
      <span id={errId} role="alert" className="inline-rename-error">
        {error || ''}
      </span>
    </span>
  );
};

export default InlineRename;
