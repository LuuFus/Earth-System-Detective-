import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Answer } from '../data/ask';
import { useMyCity } from '../data/city';
import { useLiveManifest } from '../data/live';
import { aqiBand } from '../data/ukraine';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';
import { Icon } from './studio/Icon';

type State = { status: 'idle' | 'busy' | 'done' | 'error'; answer: Answer | null };

/** "Ask the Earth": a button in the top bar and a dialog that answers from the site's data. */
export function AskEarth() {
  const { lang } = useI18n();
  const t = useLiveText().ask;
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [state, setState] = useState<State>({ status: 'idle', answer: null });
  const [city] = useMyCity();
  const { manifest } = useLiveManifest();
  const ctrl = useRef<AbortController | null>(null);

  const open = () => {
    dialog.current?.showModal();
    window.setTimeout(() => input.current?.focus(), 50);
  };
  useEffect(() => () => ctrl.current?.abort(), []);

  const ask = async (text: string) => {
    setQ(text);
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setState({ status: 'busy', answer: null });
    try {
      // The parser and the statistics load only when someone asks, not with every page.
      const { answerQuestion, findPlace, parseQuestion, placeOfCity } = await import('../data/ask');
      const parsed = parseQuestion(text);
      let place = parsed.mine && city ? placeOfCity(city) : await findPlace(parsed.places, lang, c.signal);
      if (!place && city && parsed.topic && parsed.topic !== 'war' && parsed.topic !== 'ice') place = placeOfCity(city);
      const answer = await answerQuestion(parsed, place, manifest, c.signal);
      if (!c.signal.aborted) setState({ status: 'done', answer });
    } catch {
      if (!c.signal.aborted) setState({ status: 'error', answer: null });
    }
  };

  return (
    <>
      <button type="button" className="pill-btn pill-btn--glass ask-btn" onClick={open} title={t.title}>
        <Icon name="globe" size={18} />
        <span>{t.button}</span>
      </button>
      <dialog ref={dialog} className="ask" aria-labelledby="ask-title" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <div className="ask__inner">
          <header className="ask__head">
            <h2 id="ask-title">{t.title}</h2>
            <button type="button" className="round-btn" aria-label={t.close} onClick={() => dialog.current?.close()}>
              <Icon name="close" size={18} />
            </button>
          </header>
          <form
            className="search ask__form"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) void ask(q.trim());
            }}
          >
            <input ref={input} className="search__input ask__input" type="search" enterKeyHint="go" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} />
            <button type="submit" className="search__go">
              {t.go}
            </button>
          </form>
          <ul className="ask__suggest" aria-label={t.tryLabel}>
            {t.suggestions.map((s) => (
              <li key={s}>
                <button type="button" className="chip-btn" onClick={() => void ask(s)}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
          <div className="ask__answer" aria-live="polite">
            {state.status === 'busy' && <p className="note">{t.busy}</p>}
            {state.status === 'error' && <p>{t.error}</p>}
            {state.status === 'done' && state.answer && <AnswerView a={state.answer} onGo={() => dialog.current?.close()} />}
          </div>
          <p className="note ask__note">{t.note}</p>
        </div>
      </dialog>
    </>
  );
}

function AnswerView({ a, onGo }: { a: Answer; onGo: () => void }) {
  const { lang } = useI18n();
  const t = useLiveText().ask;
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const n1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1, signDisplay: 'always' });
  const n2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2, signDisplay: 'always' });
  const n0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
  let text: string;
  let source: string | null = null;
  switch (a.kind) {
    case 'trend':
      text =
        a.topic === 'warming'
          ? t.trendWarm(a.place.name, a.from, a.to, n1.format(a.change), n2.format(a.perDecade))
          : t.trendRain(a.place.name, a.from, a.to, n0.format(a.change), n0.format(a.perDecade));
      text += ` ${a.significant ? t.significant : t.notSignificant}`;
      source = t.sourceTrend;
      break;
    case 'air':
      text = a.model !== null ? t.airModel(a.place.name, Math.round(a.model), t.bands[aqiBand(a.model)]) : t.airNoModel(a.place.name);
      if (a.measured) text += ` ${t.airMeasured(a.measured.name, n0.format(a.measured.km), Math.round(a.measured.aqi))}`;
      source = t.sourceAir;
      break;
    case 'fires':
      text = a.count ? t.fires(a.place.name, a.count, a.km, a.nearestKm !== null ? n0.format(a.nearestKm) : '') : t.noFires(a.place.name, a.km);
      source = t.sourceFires;
      break;
    case 'weather':
      text = t.weather(a.place.name, a.day === 'tomorrow', Math.round(a.tMin), Math.round(a.tMax), a.rain.toFixed(1), a.rainChance, Math.round(a.gust), a.snow);
      source = t.sourceWeather;
      break;
    case 'snow':
      text = a.days ? t.snow(a.place.name, a.days) : t.noSnow(a.place.name);
      source = t.sourceWeather;
      break;
    case 'war':
      text = t.war;
      break;
    case 'ice':
      text = t.ice;
      break;
    case 'noPlace':
      text = t.noPlace;
      break;
    default:
      text = t.unknown;
  }
  const links = 'links' in a ? a.links : [];
  return (
    <div className="ask-card">
      <p>{text}</p>
      {source && <p className="note">{source}</p>}
      {links.length > 0 && (
        <p className="ask-card__links">
          {links.map((l) => (
            <Link key={l.to} className="chip-btn" to={l.to} onClick={onGo}>
              {t.links[l.label]} →
            </Link>
          ))}
        </p>
      )}
    </div>
  );
}
