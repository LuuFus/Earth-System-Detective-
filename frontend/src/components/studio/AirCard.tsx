// The card of an air-quality station: where it is, what it measures, and what the data around it
// shows (fires, calm or wind, rain, the CAMS model's pollutants). It lists measured conditions
// next to the station, never a cause it cannot see.

import { useEffect, useState } from 'react';
import { modelMix, placeName, type AirStation, type Mix } from '../../data/air';
import { waqiFeed, type WaqiFeed } from '../../data/waqi';
import type { LiveFires, WeatherFrame } from '../../data/live';
import { fireIndex, weatherAt } from '../../data/nearby';
import { AQI_COLORS, aqiBand } from '../../data/ukraine';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { ago } from '../../data/live';
import { countryName } from '../../data/geo';
import { Icon } from './Icon';

type Props = {
  station: AirStation;
  x: number;
  y: number;
  pinned: boolean;
  frame: WeatherFrame | null;
  fires: LiveFires | null;
  onClose: () => void;
};

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
/** WHO 2021 air quality guidelines (24 h; ozone 8 h), µg/m³. */
const WHO = { no2: 25, so2: 40, co: 4000, o3: 100, dust: 25 };

export function AirCard({ station, x, y, pinned, frame, fires, onClose }: Props) {
  const { lang } = useI18n();
  const t = useLiveText().airCard;
  const stationText = useLiveText().ukraine.station;
  const [place, setPlace] = useState<string | null>(null);
  const [mix, setMix] = useState<Mix | null | 'loading'>('loading');
  const [feed, setFeed] = useState<WaqiFeed | null>(null);
  const key = `${station.lat},${station.lon}`;

  // Ask for the name and the model only when the pointer rests on the station a moment.
  useEffect(() => {
    setPlace(null);
    setMix('loading');
    setFeed(null);
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (station.source === 'sensor') void placeName(station.lat, station.lon, lang).then((n) => !cancelled && setPlace(n));
      if (station.source === 'waqi' && station.uid !== undefined) void waqiFeed(station.uid).then((f) => !cancelled && setFeed(f));
      void modelMix(station.lat, station.lon).then((m) => !cancelled && setMix(m));
    }, pinned ? 0 : 280);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [key, station.lat, station.lon, station.source, lang, pinned]);

  const band = aqiBand(station.aqi);
  const nf0 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1 });

  const factors: { icon: string; text: string }[] = [];
  if (fires) {
    const near = fireIndex(fires).within(station.lat, station.lon, 100);
    if (near.length) factors.push({ icon: 'fire', text: t.fires(near.length, nf0.format(near[0].km)) });
  }
  if (frame) {
    const wx = weatherAt(frame, station.lat, station.lon);
    if (wx.wind < 2) factors.push({ icon: 'wind', text: t.calm(nf1.format(wx.wind)) });
    else if (wx.wind >= 9) factors.push({ icon: 'wind', text: t.windy(nf0.format(wx.wind)) });
    if (wx.precip >= 0.3) factors.push({ icon: 'drop', text: t.rain(nf1.format(wx.precip)) });
  }
  const humidity = station.humidity ?? feed?.iaqi.h ?? null;
  if (station.source !== 'waqi' && humidity !== null && humidity >= 90) factors.push({ icon: 'drop', text: t.humid(nf0.format(humidity)) });
  if (mix && mix !== 'loading') {
    if (mix.dust !== null && mix.dust >= WHO.dust) factors.push({ icon: 'air', text: t.dust(nf0.format(mix.dust)) });
    if (mix.no2 !== null && mix.no2 >= WHO.no2) factors.push({ icon: 'air', text: t.no2(nf0.format(mix.no2)) });
    if (mix.so2 !== null && mix.so2 >= WHO.so2) factors.push({ icon: 'air', text: t.so2(nf0.format(mix.so2)) });
    if (mix.co !== null && mix.co >= WHO.co) factors.push({ icon: 'air', text: t.co(nf0.format(mix.co)) });
    if (mix.o3 !== null && mix.o3 >= WHO.o3) factors.push({ icon: 'sun', text: t.o3(nf0.format(mix.o3)) });
  }

  const title =
    station.source === 'saveecobot'
      ? `${station.city}, ${station.name}`
      : station.source === 'waqi'
        ? (feed?.city || station.name || t.waqi)
        : (place ?? (station.country ? countryName(station.country, lang) : t.sensor));
  const POLLUTANTS: [string, string][] = [
    ['pm25', 'PM2.5'],
    ['pm10', 'PM10'],
    ['no2', 'NO₂'],
    ['o3', 'O₃'],
    ['so2', 'SO₂'],
    ['co', 'CO'],
  ];
  const w = 330;
  const left = Math.min(window.innerWidth - w - 12, Math.max(12, x + 18));
  const top = Math.min(window.innerHeight - 380, Math.max(70, y - 40));

  return (
    <section className={`air-card${pinned ? ' air-card--pinned' : ''}`} style={{ left, top, width: w }} aria-label={title}>
      <header className="air-card__head">
        <div>
          <p className="air-card__kind">{station.source === 'saveecobot' ? 'SaveEcoBot' : station.source === 'waqi' ? t.waqi : t.citizen}</p>
          <h2 className="air-card__title">{title}</h2>
          {station.source === 'sensor' && place && station.country && <p className="air-card__sub">{countryName(station.country, lang)}</p>}
        </div>
        {pinned && (
          <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        )}
      </header>
      <div className="air-card__aqi" style={{ ['--aqi' as string]: hex(AQI_COLORS[band]) }}>
        <strong>{station.aqi}</strong>
        <span>
          <b>{t.bands[band]}</b>
          {t.aqiNote}
        </span>
      </div>
      <dl className="air-card__rows">
        {station.pm25 !== null && (
          <div>
            <dt>PM2.5</dt>
            <dd>{nf1.format(station.pm25)} µg/m³</dd>
          </div>
        )}
        {station.pm10 !== null && (
          <div>
            <dt>PM10</dt>
            <dd>{nf1.format(station.pm10)} µg/m³</dd>
          </div>
        )}
        {feed?.dominant && (
          <div>
            <dt>{t.dominant}</dt>
            <dd>{POLLUTANTS.find(([k]) => k === feed.dominant)?.[1] ?? feed.dominant}</dd>
          </div>
        )}
        {feed && POLLUTANTS.some(([k]) => feed.iaqi[k] !== undefined) && (
          <div className="air-card__subs">
            <dt>{t.subIndex}</dt>
            <dd>
              {POLLUTANTS.filter(([k]) => feed.iaqi[k] !== undefined).map(([k, name]) => (
                <span key={k} style={{ ['--aqi' as string]: hex(AQI_COLORS[aqiBand(feed.iaqi[k])]) }}>
                  {name} <b>{nf0.format(feed.iaqi[k])}</b>
                </span>
              ))}
            </dd>
          </div>
        )}
        {feed?.iaqi.t !== undefined && (
          <div>
            <dt>{stationText.temp}</dt>
            <dd>{nf1.format(feed.iaqi.t)} °C</dd>
          </div>
        )}
        <div>
          <dt>{t.measured}</dt>
          <dd>{station.source === 'sensor' ? t.hourMean(ago(station.time, lang)) : feed?.time ? ago(feed.time, lang) : station.source === 'waqi' ? station.time : ago(station.time, lang)}</dd>
        </div>
      </dl>
      <div className="air-card__why">
        <p className="air-card__why-title">{t.whyTitle}</p>
        {mix === 'loading' && factors.length === 0 ? (
          <p className="note">{t.loading}</p>
        ) : factors.length ? (
          <ul>
            {factors.map((f) => (
              <li key={f.text}>
                <Icon name={f.icon as never} size={16} />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="note">{band === 0 ? t.clean : t.nothing}</p>
        )}
        <p className="air-card__fine">{t.disclaimer}</p>
        {feed && feed.attributions.length > 0 && (
          <p className="air-card__fine">
            {t.network}:{' '}
            {feed.attributions.slice(0, 3).map((a, i) => (
              <span key={a.url}>
                {i > 0 && ', '}
                {pinned ? (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    {a.name}
                  </a>
                ) : (
                  a.name
                )}
              </span>
            ))}
          </p>
        )}
      </div>
      {!pinned && <p className="air-card__hint">{t.clickToPin}</p>}
    </section>
  );
}
