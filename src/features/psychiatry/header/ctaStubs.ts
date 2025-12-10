

export const probeCtas = async () => ({ canSend: false, canInsert: false, canCopy: false } as const);
export function guardSendShortcut(_e: KeyboardEvent | unknown) { return false; }
export function guardInsertShortcut(_e: KeyboardEvent | unknown) { return false; }
export function guardCopyShortcut(_e: KeyboardEvent | unknown) { return false; }
export function actSend() {}
export function actInsert() {}
export function actCopy() {}
