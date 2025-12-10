


export type AppFlags = {

  consultonAI: boolean;

  centerHeaderV2: boolean;
};


function toBool(v: unknown): boolean {
  if (v === true) return true;
  if (v === false) return false;
  const s = String(v ?? "").trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "y";
}


function queryParamBool(name: string): boolean | null {
  if (typeof window === "undefined" || !window.location) return null;
  const url = new URL(window.location.href);
  const v = url.searchParams.get(name);
  return v == null ? null : toBool(v);
}


function localFlag(name: string): boolean | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const v = window.localStorage.getItem(name);
  return v == null ? null : toBool(v);
}


function windowFlag(name: string): boolean | null {
  if (typeof window === "undefined") return null;

  const v = (window as any)[name];
  return v == null ? null : toBool(v);
}


function envFlag(name: string): boolean | null {
  try {

    const meta: any = (import.meta as any);
    const env = meta?.env ?? {};
    const v = env[name];
    return v == null ? null : toBool(v);
  } catch {
    return null;
  }
}


function resolveFlag(sources: Array<() => boolean | null>, fallback = false): boolean {
  for (const get of sources) {
    const v = get();
    if (v !== null) return v;
  }
  return fallback;
}


export const flags: AppFlags = {
  consultonAI: resolveFlag(
    [
      () => queryParamBool("consulton"),
      () => envFlag("VITE_CONSULTON_AI"),
      () => localFlag("FLAG_CONSULTON_AI"),
      () => windowFlag("__CONSULTON_AI__"),
    ],
    true
  ),
  centerHeaderV2: resolveFlag(
    [
      () => queryParamBool("headerV2"),
      () => envFlag("VITE_CENTER_HEADER_V2"),
      () => localFlag("FLAG_CENTER_HEADER_V2"),
      () => windowFlag("__CENTER_HEADER_V2__"),
    ],
    true
  ),
};
