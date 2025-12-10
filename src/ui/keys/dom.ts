


export const isComposingIME = (e: KeyboardEvent): boolean => {


  const anyE = e as any;
  if (typeof anyE.isComposing === 'boolean') return anyE.isComposing;



  return e.key === 'Process' || (e as any).keyCode === 229;
};

export const isTextInputLike = (el: Element | null): el is HTMLElement => {
  if (!el || !(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  const editable = (el as HTMLElement).isContentEditable;
  if (editable) return true;
  if (tag === 'textarea' || tag === 'input') return true;

  if (el.hasAttribute('data-chat-input')) return true;
  return false;
};

export const getActiveElement = (): HTMLElement | null => {
  const ae = document.activeElement as HTMLElement | null;
  return ae ?? null;
};
