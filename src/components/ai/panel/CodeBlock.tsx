import React, { useCallback } from 'react';
import editorBridge from '@/services/editorBridge';
import { mapFenceToLangAndExt } from './code-lang';
import { CodeBlockRoot, CodeButton, CodeToolbar } from './styles';

type Props = { code: string; info?: string };

const CodeBlock: React.FC<Props> = ({ code, info }) => {
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (e) {

    }
  }, [code]);

  const onInsert = useCallback(async () => {
    const { monaco } = mapFenceToLangAndExt(info);
    await editorBridge.insertIntoActive({ code, language: monaco as any });
  }, [code, info]);

  const onNewFile = useCallback(async () => {
    const { ext } = mapFenceToLangAndExt(info);
    const name = `synapse.snippet.${Date.now()}.${ext}`;
    await editorBridge.openNewTab({ filename: name, code });
  }, [code, info]);

  const onReplace = useCallback(async () => {
    const { monaco } = mapFenceToLangAndExt(info);
    await editorBridge.replaceSelection({ code, language: monaco as any });
  }, [code, info]);

  return (
    <CodeBlockRoot>
      <CodeToolbar role="toolbar" aria-label="Code block actions" className="ai-code-toolbar">
        <CodeButton onClick={onCopy} aria-label="Copy code block">Copy</CodeButton>
        <CodeButton onClick={onInsert} aria-label="Insert into editor">Insert</CodeButton>
        <CodeButton onClick={onNewFile} aria-label="Open as new file">New</CodeButton>
        <CodeButton onClick={onReplace} aria-label="Replace selection in editor">Replace</CodeButton>
      </CodeToolbar>
      <pre>
        <code>{code}</code>
      </pre>
    </CodeBlockRoot>
  );
};

export default React.memo(CodeBlock);
