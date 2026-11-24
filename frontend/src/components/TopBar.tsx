import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';
import type { Lang } from '../i18n/strings';
import { AskEarth } from './AskEarth';
import { SourcesButton } from './Sources';
import { Icon } from './studio/Icon';

export function LangToggle() {
  const { lang, setLang, t } = useI18n();
  const options: { value: Lang; label: string }[] = [
    { value: 'uk', label: 'UA' },
    { value: 'en', label: 'EN' },
  ];
  return (
    <div className="lang" role="group" aria-label={t.nav.language}>
      {options.map((o) => (
        <button key={o.value} type="button" className="lang__btn" aria-pressed={lang === o.value} lang={o.value} onClick={() => setLang(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" focusable="false">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 9.5c3 1.6 5.8 1.2 8.4-.6 2.7-1.9 5.5-2.2 8.6-.6M4.6 16.4c2.8-1.2 5.4-.9 7.9.6 2.4 1.5 4.8 1.6 7-.1" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </span>
      <span className="wordmark__text">Earth-System-Detective</span>
    </span>
  );
}

/**
 * 3D globe or 2D map. The 2D button opens a choice on hover (or tap): the Ukraine map or the
 * weather forecast; either can show the other's layers once open.
 */
export function ViewSwitch({ current }: { current: '3d' | '2d' }) {
  const t = useLiveText().view;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { search } = useLocation();
  const mode = new URLSearchParams(search).get('mode');
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);
  return (
    <div ref={ref} className="view-switch" role="group" aria-label={t.label} onMouseLeave={() => setOpen(false)}>
      <Link className="view-switch__btn" to="/explore" aria-current={current === '3d' ? 'page' : undefined}>
        <Icon name="globe" size={18} />
        3D
      </Link>
      <div className="view-switch__wrap" onMouseEnter={() => setOpen(true)}>
        <button type="button" className="view-switch__btn" aria-current={current === '2d' ? 'page' : undefined} aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>
          <Icon name="map" size={18} />
          2D
        </button>
        {open && (
          <div className="view-switch__menu" role="menu">
            <Link role="menuitem" className="view-switch__item" to="/map?mode=ukraine" aria-current={current === '2d' && mode === 'ukraine' ? 'page' : undefined} onClick={() => setOpen(false)}>
              <span className="view-switch__icon view-switch__icon--ua">
                <Icon name="ukraine" size={20} />
              </span>
              <span>
                <strong>{t.ukraine}</strong>
                <small>{t.ukraineNote}</small>
              </span>
            </Link>
            <Link role="menuitem" className="view-switch__item" to="/map?mode=weather" aria-current={current === '2d' && mode !== 'ukraine' ? 'page' : undefined} onClick={() => setOpen(false)}>
              <span className="view-switch__icon view-switch__icon--wx">
                <Icon name="wind" size={20} />
              </span>
              <span>
                <strong>{t.weather}</strong>
                <small>{t.weatherNote}</small>
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The bar over the film, the globe and the map: home link or round back button on the left; in the
 * middle the search and the 3D / 2D switch; sources and language on the right.
 */
export function TopBar({ back = false, center, view, sources = false, left }: { back?: boolean; center?: ReactNode; view?: '3d' | '2d'; sources?: boolean; left?: ReactNode }) {
  const { t, lang } = useI18n();
  return (
    <header className={`topbar${center || view ? ' topbar--three' : ''}`}>
      <div className="topbar__left">
        {back ? (
          <Link className="round-btn" to="/" aria-label={t.nav.back} title={t.nav.back}>
            <Icon name="home" size={20} />
          </Link>
        ) : (
          <Link className="topbar__home" to="/" aria-label={t.nav.home}>
            <Wordmark />
          </Link>
        )}
        {left}
      </div>
      {(center || view) && (
        <div className="topbar__center">
          {center}
          {view && <ViewSwitch current={view} />}
        </div>
      )}
      <div className="topbar__right">
        <AskEarth />
        {sources && <SourcesButton lang={lang} />}
        <LangToggle />
      </div>
    </header>
  );
}
