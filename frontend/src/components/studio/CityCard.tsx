// The card of a city picked on the Cities layer or in the search: population, what is happening
// there now, and buttons to compare it with another place or make it "my city".

import { useEffect, useState } from 'react';
import { useMyCity } from '../../data/city';
import type { CityPlace } from '../../data/cities';
import { countryName } from '../../data/geo';
import type { LiveManifest } from '../../data/live';
import { measure, type Measure } from '../../data/placeStats';
import { radLabel } from '../../data/radiation';
import { useI18n } from '../../i18n/I18n';
import { popShort, usePlacesText } from '../../i18n/places';
import { Icon } from './Icon';


type Props = {
  place: CityPlace;
  manifest: LiveManifest | null;
  onCompare: (slot: 'A' | 'B') => void;
  onWeather: () => void;
  onClose: () => void;
};

export function CityCard({ place, manifest, onCompare, onWeather, onClose }: Props) {
  const { lang } = useI18n();
  const t = usePlacesText().card;
  const [, pin] = useMyCity();
  const [now, setNow] = useState<{ key: string; aqi?: Measure; rad?: Measure; fires?: Measure }>({ key: '' });
  const key = `${place.lat},${place.lon}`;
  const hasManifest = !!manifest;
  useEffect(() => {
    let cancelled = false;
    const input = { lat: place.lat, lon: place.lon, radiusKm: 15 };
    for (const id of ['aqi', 'rad', 'fires'] as const) {
      void measure(id, input, manifest)
        .catch(() => null)
        .then((v) => !cancelled && setNow((o) => ({ ...(o.key === key ? o : { key }), [id]: v })));
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasManifest]);
  const here = now.key === key ? now : { key };
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB');
  const country = place.code ? countryName(place.code, lang) : '';
  const km = (m: Measure | undefined) => Math.round(m?.km ?? 0);

  return (
    <section className="city-card" aria-label={place.name[lang]}>
      <header className="city-card__head">
        <div>
          <p className="city-card__kind">
            {place.capital ? t.capital : t.kind}
            {country && ` · ${country}`}
          </p>
          <h2 className="city-card__title">{place.name[lang]}</h2>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      {place.pop ? (
        <dl className="city-card__facts">
          <div>
            <dt>{t.pop}</dt>
            <dd>{popShort(place.pop, lang)}</dd>
          </div>
          {place.areaKm2 ? (
            <div>
              <dt>{t.area}</dt>
              <dd>
                {nf.format(place.areaKm2)} {lang === 'uk' ? 'км²' : 'km²'}
              </dd>
            </div>
          ) : null}
          {place.areaKm2 ? (
            <div>
              <dt>{t.density}</dt>
              <dd>{nf.format(Math.round(place.pop / place.areaKm2))}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <div className="city-card__now">
        <p className="city-card__sub">{t.now}</p>
        <ul>
          {here.aqi && <li>{t.air(Math.round(here.aqi.value), km(here.aqi))}</li>}
          {here.rad && <li>{t.rad(radLabel(here.rad.value, lang), km(here.rad))}</li>}
          {here.fires && <li>{t.fires(here.fires.value)}</li>}
        </ul>
      </div>
      <div className="city-card__actions">
        <button type="button" className="chip-btn" onClick={() => onCompare('A')}>
          <span className="place-cmp__slot place-cmp__slot--a">A</span>
          {t.compareA}
        </button>
        <button type="button" className="chip-btn" onClick={() => onCompare('B')}>
          <span className="place-cmp__slot place-cmp__slot--b">B</span>
          {t.compareB}
        </button>
        <button type="button" className="chip-btn" onClick={onWeather}>
          <Icon name="weather" size={16} />
          {t.weather}
        </button>
        <button
          type="button"
          className="chip-btn"
          onClick={() => pin({ name: place.name[lang], lat: place.lat, lon: place.lon, cc: place.code, country: country || undefined, population: place.pop })}
        >
          <Icon name="pin" size={16} />
          {t.myCity}
        </button>
      </div>
      <p className="note">{t.compareHint}</p>
      {place.pop ? <p className="legend__src">{t.source}</p> : null}
    </section>
  );
}
