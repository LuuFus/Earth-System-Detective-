// The card of a radiation station: where it is, the dose rate in plain words, what a year at this
// level adds up to and what to do, as the air-quality card does for the air.

import { useEffect, useState } from 'react';
import { placeName } from '../../data/air';
import { ago } from '../../data/live';
import { RAD_COLORS, RAD_MAP, radBand, radLabel, yearlyMsv, type RadStation } from '../../data/radiation';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { Icon } from './Icon';

type Props = {
  station: RadStation;
  x: number;
  y: number;
  pinned: boolean;
  onClose: () => void;
};

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

export function RadCard({ station, x, y, pinned, onClose }: Props) {
  const { lang } = useI18n();
  const t = useLiveText().radCard;
  const [place, setPlace] = useState<string | null>(null);
  const key = `${station.lat},${station.lon}`;
  useEffect(() => {
    setPlace(null);
    let cancelled = false;
    // Ask OpenStreetMap for the name only when the pointer rests on the station a moment.
    const id = window.setTimeout(() => void placeName(station.lat, station.lon, lang).then((n) => !cancelled && setPlace(n)), pinned ? 0 : 280);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [key, station.lat, station.lon, lang, pinned]);

  const band = radBand(station.usv);
  const nf1 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const nf0 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const w = pinned ? 340 : 320;
  const left = Math.min(window.innerWidth - w - 12, Math.max(12, x + 18));
  const top = Math.max(12, Math.min(window.innerHeight - (pinned ? 460 : 300), Math.max(70, y - 40)));

  return (
    <section className={`air-card${pinned ? ' air-card--pinned' : ''}`} style={{ left, top, width: w, maxHeight: window.innerHeight - top - 12 }} aria-label={place ?? t.station}>
      <header className="air-card__head">
        <div>
          <p className="air-card__kind">{t.kind}</p>
          <h2 className="air-card__title">{place ?? t.station}</h2>
        </div>
        {pinned && (
          <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        )}
      </header>
      <div className="air-card__aqi" style={{ ['--aqi' as string]: hex(RAD_COLORS[band]) }}>
        <strong>{radLabel(station.usv, lang)}</strong>
        <span>
          <b>{t.headline[band]}</b>
          {t.unit(nf0.format(station.usv * 1000))}
        </span>
      </div>
      <p className="air-card__meaning">{t.meaning[band]}</p>
      <div className="air-card__advice">
        <p className="air-card__why-title">{t.doTitle}</p>
        <ul className="air-card__list air-card__list--do">
          {(pinned ? t.do[band] : t.do[band].slice(0, 2)).map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
      {pinned && (
        <>
          <dl className="air-card__rows">
            <div>
              <dt>{t.year}</dt>
              <dd>{t.yearValue(nf1.format(yearlyMsv(station.usv)))}</dd>
            </div>
            <div>
              <dt>{t.measured}</dt>
              <dd>{ago(station.time, lang)}</dd>
            </div>
          </dl>
          <p className="air-card__fine">{t.compare}</p>
          <p className="air-card__fine">
            {t.disclaimer}{' '}
            <a href={RAD_MAP} target="_blank" rel="noreferrer">
              SaveEcoBot ↗
            </a>
          </p>
        </>
      )}
      {!pinned && <p className="air-card__hint">{t.clickToPin}</p>}
    </section>
  );
}
