import React from "react";
import styles from "../styles/note.module.css";


export default function SlotEditorContentBridge({ slotId }: { slotId: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const ceRef = React.useRef<HTMLDivElement | null>(null);
  const [active, setActive] = React.useState(false);
  const taRef = React.useRef<HTMLTextAreaElement | null>(null);


  React.useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    const existingEditable = container.querySelector('[contenteditable="true"]');
    if (existingEditable) {
      taRef.current = null;
      setActive(false);
      return;
    }
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement | null;
    taRef.current = textarea;
    setActive(!!textarea);
  }, [slotId]);


  React.useEffect(() => {
    if (!active) return;
    const ce = ceRef.current;
    const textarea = taRef.current;
    if (!ce || !textarea) return;


    ce.innerText = textarea.value ?? "";


    const prevStyle = textarea.getAttribute('style');
    const prevAriaHidden = textarea.getAttribute('aria-hidden');
    textarea.style.position = 'absolute';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.height = '0px';
    textarea.style.overflow = 'hidden';
    textarea.setAttribute('aria-hidden', 'true');

    const syncBack = () => {
      textarea.value = ce.innerText;
      const ev = new Event('input', { bubbles: true });
      textarea.dispatchEvent(ev);
    };
    ce.addEventListener('input', syncBack);
    ce.addEventListener('blur', syncBack);

    return () => {
      ce.removeEventListener('input', syncBack);
      ce.removeEventListener('blur', syncBack);

      if (prevStyle === null) textarea.removeAttribute('style'); else textarea.setAttribute('style', prevStyle);
      if (prevAriaHidden === null) textarea.removeAttribute('aria-hidden'); else textarea.setAttribute('aria-hidden', prevAriaHidden);
    };
  }, [active]);

  return (
    <div ref={containerRef} data-slot-ce-container style={{ position: 'relative' }}>
      {active ? (
        <div
          ref={ceRef}
          id={`slot-ce-${slotId}`}
          className={styles.richEditorSurface}
          contentEditable
          role="textbox"
          aria-multiline="true"
          spellCheck={false}
          suppressContentEditableWarning
        />
      ) : null}
    </div>
  );
}
