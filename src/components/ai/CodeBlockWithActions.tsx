import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ClipboardCopy, FileDiff, FilePenLine, FilePlus, Replace, Sparkles } from 'lucide-react';
import { applyUnifiedDiff } from '@/lib/ai/diff';
import type { ParsedBlock } from '@/lib/ai/codeblocks';
import { useAiSettingsStore } from '@/stores/useAiSettingsStore';

export interface CodeBlockWithActionsProps {
  block: ParsedBlock;
  index?: number;
  enableActions?: boolean;
  onExplain?: (code: string) => void;
  onAutoInserted?: () => void;
}


function copyToClipboard(text: string) { try { navigator.clipboard.writeText(text); } catch {} }
declare global { interface Window { __AI_EDITOR_BRIDGE__?: EditorBridge } }

interface EditorBridge {
  insertAtCursor?: (c: string) => void;
  replaceSelection?: (c: string) => void;
  fileExists?: (p: string) => boolean;
  writeFile?: (p: string, c: string, opts?: { create?: boolean; overwrite?: boolean }) => void;
  readFile?: (p: string) => string | undefined;
  confirm?: (msg: string) => boolean;
  showToast?: (msg: string, level?: string) => void;
}

function getBridge(): EditorBridge { return window.__AI_EDITOR_BRIDGE__ || {}; }
function toast(msg: string) { try { getBridge().showToast?.(msg, 'info'); } catch {} }

export const CodeBlockWithActions: React.FC<CodeBlockWithActionsProps> = ({ block, enableActions = true, onExplain, onAutoInserted }) => {
  useAiSettingsStore(s => s.ui);
  const ref = useRef<HTMLDivElement | null>(null);
  const [applying, setApplying] = useState(false);

  const editor = useMemo<EditorBridge>(() => getBridge(), []);
  const lang = block.lang || '';
  const content = block.content;
  const path = block.path;
  const isDiff = block.isDiff;

  const doInsert = useCallback(() => {
    if (!enableActions) return;
    if (editor?.insertAtCursor) { try { editor.insertAtCursor(content); toast('Inserted at cursor'); onAutoInserted?.(); } catch { copyToClipboard(content); toast('Copied (insert failed)'); } }
    else { copyToClipboard(content); toast('Copied to clipboard (no editor)'); }
  }, [content, enableActions, editor, onAutoInserted]);

  const doReplace = useCallback(() => {
    if (!enableActions) return;
    if (editor?.replaceSelection) { try { editor.replaceSelection(content); toast('Replaced selection'); } catch { doInsert(); } }
    else doInsert();
  }, [content, enableActions, editor, doInsert]);

  const inferUntitled = useCallback(() => {
    const ext = (lang || 'txt').split(/[^a-zA-Z0-9]/)[0] || 'txt';
    let n = 1; let candidate = `untitled-${n}.${ext}`;
    while (editor?.fileExists?.(candidate)) { n++; candidate = `untitled-${n}.${ext}`; if (n > 99) break; }
    return candidate;
  }, [lang, editor]);

  const doNewFile = useCallback(() => {
    if (!enableActions) return;
    const target = path || inferUntitled();
    const exists = !!editor?.fileExists?.(target);
    try { editor?.writeFile?.(target, content, { create: !exists, overwrite: exists }); toast(`${exists ? 'Updated' : 'Created'}: ${target}`); }
    catch { copyToClipboard(content); toast('Copied (write failed)'); }
  }, [content, enableActions, editor, inferUntitled, path]);

  const doCopy = useCallback(() => { copyToClipboard(content); toast('Copied'); }, [content]);

  const doExplain = useCallback(() => { if (!enableActions) return; onExplain?.(content); }, [content, enableActions, onExplain]);

  const doApplyPatch = useCallback(() => {
    if (!enableActions || !isDiff) return;
    setApplying(true);
    try {
      applyUnifiedDiff(
        (p) => editor?.readFile?.(p),
        (p, c, o) => editor?.writeFile?.(p, c, o),
        content,
        { confirmOverwrite: false }
      );
      toast('Patch applied');
    } catch { toast('Patch failed'); }
    finally { setApplying(false); }
  }, [enableActions, isDiff, editor, content]);


  const btnStyle: React.CSSProperties = { display:'inline-flex', alignItems:'center', justifyContent:'center', width:24, height:24, padding:0, border:'1px solid rgba(255,255,255,0.18)', background:'rgba(255,255,255,0.05)', borderRadius:4, cursor:'pointer' };
  const disabledStyle: React.CSSProperties = { opacity:0.35, cursor:'not-allowed' };
  const wrapStyle: React.CSSProperties = { position:'absolute', top:6, right:6, display:'flex', gap:4, zIndex:1, flexWrap:'nowrap', alignItems:'center' };


  return (
    <div ref={ref} role="group" aria-label="Code block" style={{ position: 'relative', border: '1px solid var(--color-border)', borderRadius: 8, margin: '8px 0', background:'var(--code-bg,#111)' }}>
      <div style={wrapStyle}>
        {!isDiff && (
          <button type="button" onClick={doInsert} aria-label="Insert code at cursor" title="Insert" disabled={!enableActions} style={{ ...btnStyle, ...(enableActions?{}:disabledStyle) }}>
            <FilePenLine size={14} />
          </button>
        )}
        {!isDiff && (
          <button type="button" onClick={doReplace} aria-label="Replace current selection" title="Replace" disabled={!enableActions} style={{ ...btnStyle, ...(enableActions?{}:disabledStyle) }}>
            <Replace size={14} />
          </button>
        )}
        {!isDiff && (
          <button type="button" onClick={doNewFile} aria-label="Create new file from code" title="New File" disabled={!enableActions} style={{ ...btnStyle, ...(enableActions?{}:disabledStyle) }}>
            <FilePlus size={14} />
          </button>
        )}
        {isDiff ? (
          <button type="button" onClick={doApplyPatch} aria-label="Apply patch" title="Apply Patch" disabled={!enableActions || applying} style={{ ...btnStyle, ...((!enableActions || applying)?disabledStyle:{}) }}>
            <FileDiff size={14} />
          </button>
        ) : null}
        <button type="button" onClick={doCopy} aria-label="Copy code" title="Copy" style={btnStyle}>
          <ClipboardCopy size={14} />
        </button>
        <button type="button" onClick={doExplain} aria-label="Explain code" title="Explain" disabled={!enableActions} style={{ ...btnStyle, ...(enableActions?{}:disabledStyle) }}>
          <Sparkles size={14} />
        </button>
      </div>
      <pre style={{ margin: 0, padding: '38px 12px 12px', overflow: 'auto', fontSize:13, lineHeight:1.45 }}>
        <code data-language={lang}>{content}</code>
      </pre>
    </div>
  );
};

export default CodeBlockWithActions;


