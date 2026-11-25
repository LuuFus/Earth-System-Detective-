// A small card that follows the pointer over the globe: the temperature there now (NOAA GFS),
// the local time in that country, and what is going on nearby according to the loaded data
// (fires, air quality, strong wind or heavy rain, notable events).

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { countryExact, countryName } from '../../data/geo';
import { whenText, type Hint } from '../../data/hints';
import type { LiveFires, WeatherFrame } from '../../data/live';
import { distanceKm, fireIndex, weatherAt, type PointIndex } from '../../data/nearby';
import { localTime } from '../../data/timezones';
import { AQI_COLORS, aqiBand } from '../../data/ukraine';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { formatPoint } from '../../i18n/format';

type Props = {
  point: { lat: number; lon: number } | null;
  frame: WeatherFrame | null;
  fires: LiveFires | null;
  air: { index: PointIndex; aqi: ArrayLike<number> } | null;
  hints: Hint[];
  /** The value of the map layer under the pointer, when there is one. */
  layerLine: string | null;
};

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
/** How far an event may be and still be named under the pointer. */
const EVENT_KM = 80;

/** Where the pointer last was, kept while the card is not mounted. */
const lastPointer = { x: -1000, y: -1000 };
if (typeof window !== 'undefined') {
  window.addEventListener('pointermove', (e) => {
    lastPointer.x = e.clientX;
    lastPointer.y = e.clientY;
  }, { passive: true });
}

export function CursorInfo({ point, frame, fires, air, hints, layerLine }: Props) {
  const { lang } = useI18n();
  const t = useLiveText().cursor;
  const ref = useRef<HTMLDivElement>(null);
  const [country, setCountry] = useState<{ key: string; code: string | null } | null>(null);
  const [, tick] = useState(0);

  // Follow the pointer without re-rendering. The card can appear while the pointer rests, and it
  // changes height as its lines arrive, so it is also placed after every render.
  const place = () => {
    const el = ref.current;
    if (!el) return;
    const { x: px, y: py } = lastPointer;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = px + 18 + w > window.innerWidth - 8 ? px - 18 - w : px + 18;
    const y = py + 18 + h > window.innerHeight - 8 ? py - 18 - h : py + 18;
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  };
  useLayoutEffect(place);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      lastPointer.x = e.clientX;
      lastPointer.y = e.clientY;
      place();
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, []);

  // The clock moves on.
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const key = point ? `${point.lat.toFixed(1)},${point.lon.toFixed(1)}` : '';
  useEffect(() => {
    if (!point || country?.key === key) return;
    let cancelled = false;
    void countryExact(point.lat, point.lon).then((c) => !cancelled && setCountry({ key, code: c?.code ?? null }));
    return () => {
      cancelled = true;
    };
  }, [key, point, country?.key]);

  if (!point) return null;
  const code = country?.key === key ? country.code : null;
  const time = localTime(code, point.lat, point.lon, lang);
  const nf0 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1 });
  const wx = frame ? weatherAt(frame, point.lat, point.lon) : null;

  const events: { kind: string; text: string; color?: string }[] = [];
  if (fires) {
    const near = fireIndex(fires).within(point.lat, point.lon, 50);
    if (near.length) events.push({ kind: 'fire', text: t.fires(near.length, nf0.format(near[0].km)) });
  }
  if (air) {
    const near = air.index.within(point.lat, point.lon, 30);
    if (near.length) {
      const v = air.aqi[near[0].i];
      events.push({ kind: 'air', text: t.air(Math.round(v), t.bands[aqiBand(v)], nf0.format(near[0].km)), color: hex(AQI_COLORS[aqiBand(v)]) });
    }
  }
  if (wx) {
    if (wx.gust >= 17) events.push({ kind: 'wind', text: t.gust(nf0.format(wx.gust)) });
    if (wx.precip >= 2) events.push({ kind: 'rain', text: t.rain(nf1.format(wx.precip), wx.temp < 0) });
    if (wx.temp >= 35) events.push({ kind: 'heat', text: t.heat });
    if (wx.temp <= -25) events.push({ kind: 'cold', text: t.cold });
  }
  // An event only close by, with its date and distance: one from years ago 200 km away is not "here".
  const hint = hints.map((h) => ({ h, km: distanceKm(point.lat, point.lon, h.lat, h.lon) })).filter((x) => x.km < EVENT_KM).sort((a, b) => a.km - b.km)[0];
  if (hint) events.push({ kind: 'event', text: t.event(whenText(hint.h.when, lang), nf0.format(Math.max(1, hint.km)), hint.h.title[lang]) });

  return (
    <div ref={ref} className="cursor-info" role="status">
      <p className="cursor-info__place">
        {code ? <strong>{countryName(code, lang)}</strong> : <strong>{t.sea}</strong>}
        <span>{formatPoint(point.lat, point.lon, lang)}</span>
      </p>
      <p className="cursor-info__main">
        {/* Rounded first, so -0.3 shows as 0 and not as "-0". */}
        {wx && <span className="cursor-info__temp">{nf0.format(Math.round(wx.temp) || 0)}°</span>}
        <span className="cursor-info__time">
          {time.time}
          <small>{time.offset}</small>
        </span>
        {wx && (
          <span className="cursor-info__wx">
            {t.wind(nf0.format(wx.wind))}
            {wx.precip >= 0.1 && ` · ${nf1.format(wx.precip)} ${t.mmh}`}
          </span>
        )}
      </p>
      {layerLine && <p className="cursor-info__layer">{layerLine}</p>}
      {events.length > 0 && (
        <ul className="cursor-info__events">
          {events.map((e) => (
            <li key={e.kind} className={`cursor-info__ev cursor-info__ev--${e.kind}`} style={e.color ? { ['--ev' as string]: e.color } : undefined}>
              {e.text}
            </li>
          ))}
        </ul>
      )}
      {!frame && <p className="cursor-info__note">{t.noWeather}</p>}
    </div>
  );
}
