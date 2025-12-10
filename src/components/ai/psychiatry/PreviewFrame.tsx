import React, { useEffect, useMemo, useRef } from 'react';

type Props = {
  content: string;
  title?: string;
  height?: number;
};

const PreviewFrame: React.FC<Props> = ({ content, title = 'Preview', height = 420 }) => {
  const ref = useRef<HTMLIFrameElement | null>(null);


  const srcDoc = useMemo(() => content, [content]);

  useEffect(() => {

  }, []);

  return (
    <iframe
      ref={ref}
      title={title}
      style={{
        width: '100%',
        height,
        border: '1px solid var(--ai-border,#1a1a1a)',
        borderRadius: 12,
        background: 'var(--glass1,#0b0b0b)',
      }}
      sandbox="allow-scripts"
      referrerPolicy="no-referrer"
      srcDoc={srcDoc}
    />
  );
};

export default PreviewFrame;
