import React from "react";
import styles from "../styles/note.module.css";

interface Props {

  targetRootId: string;
}


export default function SlotEditorFormatBar({ targetRootId }: Props) {
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [isStrike, setIsStrike] = React.useState(false);
  const [isSup, setIsSup] = React.useState(false);
  const [isSub, setIsSub] = React.useState(false);
  const [selectionInScope, setSelectionInScope] = React.useState(false);
  const [canIndentOutdent, setCanIndentOutdent] = React.useState(false);

  const [isBulleted, setIsBulleted] = React.useState(false);
  const [isNumbered, setIsNumbered] = React.useState(false);

  const toolbarRef = React.useRef<HTMLDivElement | null>(null);

  const getRoot = React.useCallback(() => document.getElementById(targetRootId), [targetRootId]);

  const isSelectionInside = React.useCallback(() => {
    const root = getRoot();
    if (!root) return false;
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const anchor = sel.anchorNode;
    const focus = sel.focusNode;
    return !!(anchor && root.contains(anchor) && focus && root.contains(focus));
  }, [getRoot]);

  const updateActiveStates = React.useCallback(() => {
    const inScope = isSelectionInside();
    setSelectionInScope(inScope);
    if (inScope) {
      try {
        setIsBold(document.queryCommandState("bold"));
        setIsItalic(document.queryCommandState("italic"));
        setIsUnderline(document.queryCommandState("underline"));
        setIsStrike(document.queryCommandState("strikeThrough"));
        try { setIsSup(document.queryCommandState("superscript")); } catch { setIsSup(false); }
        try { setIsSub(document.queryCommandState("subscript")); } catch { setIsSub(false); }

        try { setIsBulleted(document.queryCommandState("insertUnorderedList")); } catch { setIsBulleted(false); }
        try { setIsNumbered(document.queryCommandState("insertOrderedList")); } catch { setIsNumbered(false); }

        const sel = document.getSelection();
        const li = sel?.anchorNode ? closest(sel.anchorNode, (n) => (n as HTMLElement)?.nodeName === 'LI') : null;
        setCanIndentOutdent(!!li);
      } catch {
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        setIsStrike(false);
        setIsSup(false);
        setIsSub(false);
        setIsBulleted(false);
        setIsNumbered(false);
        setCanIndentOutdent(false);
      }
    } else {
      setIsBold(false);
      setIsItalic(false);
      setIsUnderline(false);
      setIsStrike(false);
      setIsSup(false);
      setIsSub(false);
      setIsBulleted(false);
      setIsNumbered(false);
      setCanIndentOutdent(false);
    }
  }, [isSelectionInside]);

  React.useEffect(() => {
    const onSel = () => updateActiveStates();
    document.addEventListener("selectionchange", onSel);
    window.addEventListener("blur", onSel);
    return () => {
      document.removeEventListener("selectionchange", onSel);
      window.removeEventListener("blur", onSel);
    };
  }, [updateActiveStates]);


  const preventFocusSteal = (e: React.MouseEvent) => e.preventDefault();

  const execIfInScope = (cmd: string, value?: any) => {
    if (!isSelectionInside()) {

      console.info(`[P5] Command '${cmd}' ignored: selection not in contentEditable within #${targetRootId}`);
      return;
    }
    try {
      document.execCommand(cmd, false, value);
    } catch (err) {
      console.warn(`[P5] Command '${cmd}' failed`, err);
    }
  };

  const wrapSelectionWithSpanClass = (className: string) => {
    const sel = document.getSelection();
    if (!sel || sel.isCollapsed) return;
    if (!isSelectionInside()) {
      console.info(`[P5] wrapSelection '${className}' ignored: selection not in scope`);
      return;
    }

    const a = sel.anchorNode;
    const f = sel.focusNode;
    const spanA = a ? closest(a, (n) => hasClass(n, className)) : null;
    const spanF = f ? closest(f, (n) => hasClass(n, className)) : null;
    if (spanA && spanF && spanA === spanF) {
      unwrapElement(spanA as HTMLElement);
      return;
    }


    const range = sel.getRangeAt(0).cloneRange();
    try {
      const span = document.createElement('span');
      span.className = className;
      range.surroundContents(span);
      sel.removeAllRanges();
      sel.addRange(range);
    } catch {

      const text = sel.toString();
      if (!text) return;
      const safeHtml = `<span class=\"${className}\">${escapeHtml(text)}</span>`;
      execIfInScope("insertHTML", safeHtml);
    }
  };


  const onToolbarKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const container = toolbarRef.current;
    if (!container) return;
    const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
    if (buttons.length === 0) return;
    const current = document.activeElement as HTMLButtonElement | null;
    const idx = buttons.indexOf(current || buttons[0]);
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    let next = (idx + dir + buttons.length) % buttons.length;

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[next];
      const disabled = btn.getAttribute('aria-disabled') === 'true' || btn.disabled;
      if (!disabled) break;
      next = (next + dir + buttons.length) % buttons.length;
    }
    e.preventDefault();
    buttons[next]?.focus();
  };

  const btnClass = (active?: boolean) =>
    `${styles.formatBtn} ${active ? styles.formatBtnActive : ""} ${!selectionInScope ? styles.formatBtnDisabled : ""}`;



  void [isBulleted, isNumbered];

  return (
    <div ref={toolbarRef} className={styles.editorFormatBar} role="toolbar" aria-label="Text formatting" onKeyDown={onToolbarKeyDown}>
      {}
      <div className={styles.editorFormatGroup}>
        <button
          type="button"
          className={btnClass(isBold)}
          aria-label="Bold"
          title="Bold (Ctrl/Cmd+B)"
          aria-pressed={isBold}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("bold")}
        >
          B
        </button>
        <button
          type="button"
          className={btnClass(isItalic)}
          aria-label="Italic"
          title="Italic (Ctrl/Cmd+I)"
          aria-pressed={isItalic}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("italic")}
        >
          I
        </button>
        <button
          type="button"
          className={btnClass(isUnderline)}
          aria-label="Underline"
          title="Underline (Ctrl/Cmd+U)"
          aria-pressed={isUnderline}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("underline")}
        >
          U
        </button>
        <button
          type="button"
          className={btnClass(isStrike)}
          aria-label="Strikethrough"
          title="Strikethrough"
          aria-pressed={isStrike}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("strikeThrough")}
        >
          S̶
        </button>
        <button
          type="button"
          className={btnClass(isSup)}
          aria-label="Superscript"
          title="Superscript"
          aria-pressed={isSup}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("superscript")}
        >
          x²
        </button>
        <button
          type="button"
          className={btnClass(isSub)}
          aria-label="Subscript"
          title="Subscript"
          aria-pressed={isSub}
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("subscript")}
        >
          x₂
        </button>
      </div>
  {}
  <div aria-hidden="true" className={styles.editorFormatDivider} />
      {}
      <div className={styles.editorFormatGroup}>
        <button
          type="button"
          className={btnClass()}
          aria-label="Bulleted list"
          title="Bulleted list"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("insertUnorderedList")}
        >
          •
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Numbered list"
          title="Numbered list"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("insertOrderedList")}
        >
          1.
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Indent"
          title="Indent"
          aria-disabled={!selectionInScope || !canIndentOutdent}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("indent")}
        >
          ⇥
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Outdent"
          title="Outdent"
          aria-disabled={!selectionInScope || !canIndentOutdent}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("outdent")}
        >
          ⇤
        </button>
      </div>
  {}
  <div aria-hidden="true" className={styles.editorFormatDivider} />
      {}
      <div className={styles.editorFormatGroup}>
        <button
          type="button"
          className={btnClass()}
          aria-label="Undo"
          title="Undo (Ctrl/Cmd+Z)"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("undo")}
        >
          ↶
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Redo"
          title="Redo (Ctrl/Cmd+Y)"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("redo")}
        >
          ↷
        </button>
      </div>
  {}
  <div aria-hidden="true" className={styles.editorFormatDivider} />
      {}
      <div className={styles.editorFormatGroup}>
        <button
          type="button"
          className={btnClass()}
          aria-label="Highlight selection"
          title="Highlight selection"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => wrapSelectionWithSpanClass(styles.editorHighlight)}
        >
          Highlight
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Mark as clinical alert / red flag"
          title="Clinical alert / red flag"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => wrapSelectionWithSpanClass(styles.editorCriticalFlag)}
        >
          Alert
        </button>
        <button
          type="button"
          className={btnClass()}
          aria-label="Clear formatting"
          title="Clear inline formatting"
          aria-disabled={!selectionInScope}
          onMouseDown={preventFocusSteal}
          onClick={() => execIfInScope("removeFormat")}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}




function hasClass(n: Node, className: string) {
  return (n as HTMLElement)?.classList?.contains?.(className) ?? false;
}
function closest(start: Node, pred: (n: Node) => boolean): Node | null {
  let n: Node | null = start instanceof Text ? start.parentElement : (start as Node);
  while (n) {
    if (pred(n)) return n;
    n = (n as HTMLElement).parentElement;
  }
  return null;
}
function unwrapElement(el: HTMLElement) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}
