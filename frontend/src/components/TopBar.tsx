import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import type { Lang } from '../i18n/strings';

export function LangToggle() {
  const { lang, setLang, t } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: 'uk', label: 'UA' },
    { value: 'en', label: 'EN' },
  ];
  return (
    <div className="lang" role="group" aria-label={t.nav.language}>
      <svg className="lang__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="8" cy="8" rx="2.8" ry="6.5" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M1.5 8h13M2.6 4.6h10.8M2.6 11.4h10.8" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="lang__btn"
          aria-pressed={lang === o.value}
          lang={o.value}
          onClick={() => setLang(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span>Earth System</span>
      <span>Detective</span>
    </span>
  );
}

/** The bar over the film: wordmark home link (or a back chip) on the left, optional centre slot, language switch on the right. */
export function TopBar({ back = false, center }: { back?: boolean; center?: ReactNode }) {
  const { t } = useI18n();
  return (
    <header className="topbar">
      {back ? (
        <Link className="back-chip" to="/">
          <span className="back-chip__arrow" aria-hidden="true">
            <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
              <path d="M10.5 6H2M5.5 2.5 2 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
          <span className="back-chip__label">{t.nav.back}</span>
        </Link>
      ) : (
        <Link className="topbar__home" to="/" aria-label={t.nav.home}>
          <Wordmark />
        </Link>
      )}
      {center && <div className="topbar__center">{center}</div>}
      <LangToggle />
    </header>
  );
}
