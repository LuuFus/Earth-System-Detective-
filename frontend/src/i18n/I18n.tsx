import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { strings, type Dict, type Lang } from './strings';

type I18nValue = { lang: Lang; t: Dict; setLang: (lang: Lang) => void };

const I18nContext = createContext<I18nValue | null>(null);
const STORAGE_KEY = 'esd-lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'uk' || saved === 'en') return saved;
  } catch {
    /* storage unavailable: fall through to the default */
  }
  return 'uk';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const t = strings[lang];
    document.documentElement.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.meta.description);
  }, [lang]);

  const value = useMemo(() => ({ lang, t: strings[lang], setLang }), [lang, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
