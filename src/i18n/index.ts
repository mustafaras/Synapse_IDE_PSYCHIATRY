import { useMemo } from "react";
import en from "./locales/en";
import tr from "./locales/tr";

type Messages = {
  help: {
    open: string;
    title: string;
    clinicianPoint1: string;
    clinicianPoint2: string;
    clinicianPoint3: string;
    openDeveloper: string;
    openPlan: string;
    close: string;
  };
};

const DICTS: Record<string, Messages> = {
  en: en as unknown as Messages,
  tr: tr as unknown as Messages,
};

function getLang(): keyof typeof DICTS {
  const win = globalThis as any;
  const hinted = (win && win.__APP_LANG__) ? String(win.__APP_LANG__).toLowerCase() : undefined;

  if (hinted && DICTS[hinted]) return hinted as keyof typeof DICTS;
  return 'en';
}

export function useI18n() {
  const lang = getLang();
  const dict = DICTS[lang] ?? en;
  const t = useMemo(() => {
    return (key: keyof Messages | string): string => {

      const parts = String(key).split('.');
      let cursor: any = dict;
      for (const p of parts) {
        if (cursor && typeof cursor === 'object' && p in cursor) cursor = cursor[p];
        else return String(key);
      }
      return typeof cursor === 'string' ? cursor : String(key);
    };
  }, [dict]);
  return { lang, t };
}
