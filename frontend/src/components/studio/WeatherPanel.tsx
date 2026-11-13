import { useEffect, useMemo, useState } from 'react';
import { powerPointDaily, type Region, regionCentre } from '../../analysis/series';
import { trendStats, verdict } from '../../analysis/stats';
import { countryAt, loadLabels, type GeoCapital } from '../../data/geo';
import { useI18n } from '../../i18n/I18n';
import { formatPoint, numberFormat, regionName } from '../../i18n/format';
import { useStudio } from '../../i18n/useStudio';
import type { WeatherPlace } from '../../state/explore';
import { Icon, type IconName } from './Icon';

type Props = {
  place: WeatherPlace;
  regionA: Region | null;
  regionB: Region | null;
  onPlace: (place: WeatherPlace) => void;
};

type Load<T> = { status: 'loading' | 'ready' | 'error'; data: T | null };

/** Fetch once per key; the panel shows the last answer while the next one loads. */
function useFetched<T>(key: string, run: (signal: AbortSignal) => Promise<T>): Load<T> {
  const [state, setState] = useState<Load<T> & { key: string }>({ key: '', status: 'loading', data: null });
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, key, status: 'loading' }));
    run(controller.signal)
      .then((data) => !controller.signal.aborted && setState({ key, status: 'ready', data }))
      .catch(() => !controller.signal.aborted && setState({ key, status: 'error', data: null }));
    return () => controller.abort();
    // `key` stands for every input of `run`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state;
}

// ---------- Forecast (Open-Meteo) ----------

type Forecast = { days: { date: string; code: number; tMax: number; tMin: number; rain: number; rainChance: number | null; gusts: number }[] };

async function loadForecast(lat: number, lon: number, signal: AbortSignal): Promise<Forecast> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_gusts_10m_max&wind_speed_unit=ms&timezone=auto&forecast_days=7`;
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`forecast ${r.status}`);
  const d = (await r.json()) as {
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_sum: number[]; precipitation_probability_max: (number | null)[]; wind_gusts_10m_max: number[] };
  };
  return {
    days: d.daily.time.map((date, i) => ({
      date,
      code: d.daily.weather_code[i],
      tMax: d.daily.temperature_2m_max[i],
      tMin: d.daily.temperature_2m_min[i],
      rain: d.daily.precipitation_sum[i],
      rainChance: d.daily.precipitation_probability_max?.[i] ?? null,
      gusts: d.daily.wind_gusts_10m_max[i],
    })),
  };
}

/** WMO weather code to an icon. */
function weatherIcon(code: number): IconName {
  if (code >= 95) return 'storm';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
  if (code >= 51) return 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 3) return 'cloud';
  if (code === 1 || code === 2) return 'partly';
  return 'sun';
}

// ---------- NOAA SPC tornado outlooks ----------

type SpcFeature = { geometry: { type: string; coordinates: number[][][] | number[][][][] }; properties: { DN: number | string; LABEL: string; EXPIRE_ISO?: string } };
type Outlook = { day: number; kind: 'tornado' | 'severe'; percent: number; significant: boolean; expires: string | null };

function inRings(rings: number[][][], lat: number, lon: number): boolean {
  let inside = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

async function loadSpc(lat: number, lon: number, signal: AbortSignal): Promise<Outlook[]> {
  const files: [number, 'tornado' | 'severe', string][] = [
    [1, 'tornado', 'day1otlk_torn'],
    [2, 'tornado', 'day2otlk_torn'],
    [3, 'severe', 'day3otlk_prob'],
  ];
  return Promise.all(
    files.map(async ([day, kind, file]) => {
      const r = await fetch(`https://www.spc.noaa.gov/products/outlook/${file}.nolyr.geojson`, { signal });
      if (!r.ok) throw new Error(`SPC ${r.status}`);
      const d = (await r.json()) as { features: SpcFeature[] };
      let percent = 0;
      let significant = false;
      let expires: string | null = null;
      for (const f of d.features) {
        expires = f.properties.EXPIRE_ISO ?? expires;
        const g = f.geometry;
        if (!g || (g.type !== 'Polygon' && g.type !== 'MultiPolygon')) continue;
        const polys = (g.type === 'Polygon' ? [g.coordinates] : g.coordinates) as number[][][][];
        if (!polys.some((rings) => inRings(rings, lat, lon))) continue;
        const dn = Number(f.properties.DN);
        if (Number.isFinite(dn)) percent = Math.max(percent, dn);
        else significant = true;
      }
      return { day, kind, percent, significant, expires };
    }),
  );
}

// ---------- Climatology from NASA POWER daily values ----------

type EventId = 'rain' | 'heavy' | 'hot' | 'frost' | 'wind';
const EVENTS: { id: EventId; test: (v: Record<string, number>) => boolean | null }[] = [
  { id: 'rain', test: (v) => (v.PRECTOTCORR === undefined ? null : v.PRECTOTCORR >= 1) },
  { id: 'heavy', test: (v) => (v.PRECTOTCORR === undefined ? null : v.PRECTOTCORR >= 10) },
  { id: 'hot', test: (v) => (v.T2M_MAX === undefined ? null : v.T2M_MAX >= 30) },
  { id: 'frost', test: (v) => (v.T2M_MIN === undefined ? null : v.T2M_MIN < 0) },
  { id: 'wind', test: (v) => (v.WS10M_MAX === undefined ? null : v.WS10M_MAX >= 10) },
];
const CLIMATE_FROM = 1981;
const CLIMATE_TO = 2025;
const EARLY: [number, number] = [1981, 2000];
const LATE: [number, number] = [2006, 2025];

type Climate = Map<string, Record<string, number>>; // YYYYMMDD -> values

async function loadClimate(lat: number, lon: number, signal: AbortSignal): Promise<Climate> {
  const params = ['PRECTOTCORR', 'T2M_MAX', 'T2M_MIN', 'WS10M_MAX'];
  const r = await powerPointDaily(params, lat, lon, CLIMATE_FROM, CLIMATE_TO, signal);
  const out: Climate = new Map();
  for (const p of params) {
    r[p].forEach((v, k) => {
      const row = out.get(k) ?? {};
      row[p] = v;
      out.set(k, row);
    });
  }
  return out;
}

function eventStats(climate: Climate, month: number, test: (v: Record<string, number>) => boolean | null) {
  const mm = String(month).padStart(2, '0');
  const perYear = new Map<number, { hit: number; all: number }>();
  climate.forEach((v, k) => {
    if (k.slice(4, 6) !== mm) return;
    const t = test(v);
    if (t === null) return;
    const year = Number(k.slice(0, 4));
    const acc = perYear.get(year) ?? { hit: 0, all: 0 };
    acc.all++;
    if (t) acc.hit++;
    perYear.set(year, acc);
  });
  const share = ([a, b]: [number, number]) => {
    let hit = 0;
    let all = 0;
    perYear.forEach((v, y) => {
      if (y >= a && y <= b) {
        hit += v.hit;
        all += v.all;
      }
    });
    return all ? hit / all : NaN;
  };
  // Trend of the number of such days per year (only years with most of the month present).
  const days = new Date(Date.UTC(2001, month, 0)).getUTCDate();
  const points = [...perYear.entries()].filter(([, v]) => v.all >= days * 0.8).map(([x, v]) => ({ x, y: (v.hit / v.all) * days }));
  const stats = trendStats(points);
  return { early: share(EARLY), late: share(LATE), all: share([CLIMATE_FROM, CLIMATE_TO]), stats, days };
}

// ---------- Panel ----------

/** Weather and hazards for one place: forecast, tornado odds (USA), and NASA climatology. */
export function WeatherPanel({ place, regionA, regionB, onPlace }: Props) {
  const { lang } = useI18n();
  const s = useStudio();
  const w = s.weather;
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [capitals, setCapitals] = useState<GeoCapital[]>([]);
  const [query, setQuery] = useState('');
  useEffect(() => {
    loadLabels()
      .then((l) => setCapitals([...l.capitals].sort((a, b) => a[lang].localeCompare(b[lang], lang))))
      .catch(() => setCapitals([]));
  }, [lang]);

  const lat = Math.round(place.lat * 100) / 100;
  const lon = Math.round(place.lon * 100) / 100;
  const forecast = useFetched(`f:${lat},${lon}`, (signal) => loadForecast(lat, lon, signal));
  const [usa, setUsa] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    setUsa(null);
    countryAt(lat, lon)
      .then((c) => !cancelled && setUsa(c?.code === 'US'))
      .catch(() => !cancelled && setUsa(lat > 18 && lat < 50 && lon > -125 && lon < -66));
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);
  const spc = useFetched(`s:${lat},${lon}:${usa}`, (signal) => (usa ? loadSpc(lat, lon, signal) : Promise.resolve([])));
  // The climatology is the same within half a degree (the MERRA-2 grid is 0.5° × 0.625°).
  const cLat = Math.round(lat * 2) / 2;
  const cLon = Math.round(lon * 2) / 2;
  const climate = useFetched(`c:${cLat},${cLon}`, (signal) => loadClimate(cLat, cLon, signal));
  const rows = useMemo(() => (climate.data ? EVENTS.map((e) => ({ id: e.id, ...eventStats(climate.data!, month, e.test) })) : []), [climate.data, month]);

  const name = place.name?.[lang] ?? formatPoint(place.lat, place.lon, lang);
  const dayFmt = new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeFmt = new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
  const f0 = numberFormat(lang, 0, false);
  const pct = (v: number) => (Number.isFinite(v) ? `${f0(v * 100)}%` : '—');
  const months = s.timeline.months;

  const pickCapital = (text: string) => {
    const c = capitals.find((x) => x[lang] === text || x.uk === text || x.en === text);
    if (c) {
      onPlace({ lat: c.lat, lon: c.lon, name: { uk: c.uk, en: c.en } });
      setQuery('');
    }
  };
  const fromRegion = (r: Region) => {
    const c = regionCentre(r);
    onPlace({ lat: c.lat, lon: c.lon, name: { uk: regionName(r, 'uk'), en: regionName(r, 'en') } });
  };

  return (
    <div className="weather">
      <p className="note">{w.intro}</p>
      <div className="weather__place">
        <p className="weather__name">
          <Icon name="pin" size={18} />
          <strong>{name}</strong>
        </p>
        <div className="weather__pick">
          <label className="visually-hidden" htmlFor="weather-capital">
            {w.searchLabel}
          </label>
          <input
            id="weather-capital"
            className="field__input"
            list="weather-capitals"
            placeholder={w.search}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              pickCapital(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && pickCapital(query)}
          />
          <datalist id="weather-capitals">
            {capitals.map((c) => (
              <option key={`${c.code}-${c.en}`} value={c[lang]} />
            ))}
          </datalist>
          {regionA && (
            <button type="button" className="chip-btn" onClick={() => fromRegion(regionA)}>
              {w.useA}
            </button>
          )}
          {regionB && (
            <button type="button" className="chip-btn" onClick={() => fromRegion(regionB)}>
              {w.useB}
            </button>
          )}
        </div>
        <p className="note">{w.clickHint}</p>
      </div>

      <section className="weather__block" aria-labelledby="wx-forecast">
        <h3 className="weather__title" id="wx-forecast">
          {w.forecast}
        </h3>
        {forecast.status === 'error' && <p className="note">{w.noForecast}</p>}
        {forecast.data && (
          <ul className="forecast">
            {forecast.data.days.map((d) => {
              const storm = d.code >= 95;
              return (
                <li key={d.date} className={`forecast__day${storm ? ' forecast__day--storm' : ''}`}>
                  <span className="forecast__date">{dayFmt.format(new Date(`${d.date}T12:00:00`))}</span>
                  <span className="forecast__icon" title={String(d.code)}>
                    <Icon name={weatherIcon(d.code)} size={20} />
                  </span>
                  <span className="forecast__temp">
                    {f0(d.tMax)}° <span className="forecast__min">{f0(d.tMin)}°</span>
                  </span>
                  <span className="forecast__rain">
                    {w.rainChance} {d.rainChance === null ? '—' : `${f0(d.rainChance)}%`}
                  </span>
                  <span className="forecast__extra">
                    {storm && <strong className="forecast__storm">{w.thunder} · </strong>}
                    {d.rain > 0 && <span className="forecast__mm">{numberFormat(lang, 1, false)(d.rain)} {lang === 'uk' ? 'мм' : 'mm'} · </span>}
                    {w.gusts} {f0(d.gusts)} {lang === 'uk' ? 'м/с' : 'm/s'}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
        {forecast.status === 'loading' && !forecast.data && <p className="note">{w.loading}</p>}
        <p className="legend__src">
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            {w.forecastSource}
          </a>
        </p>
      </section>

      <section className="weather__block" aria-labelledby="wx-tornado">
        <h3 className="weather__title" id="wx-tornado">
          {w.tornado}
        </h3>
        {usa === false && <p className="note">{w.tornadoOutside}</p>}
        {usa && spc.status === 'loading' && <p className="note">{w.loading}</p>}
        {usa && spc.status === 'error' && <p className="note">{w.error}</p>}
        {usa && spc.data && (
          <ul className="outlooks">
            {spc.data.map((o) => (
              <li key={o.day} className={`outlook${o.percent >= (o.kind === 'tornado' ? 2 : 5) ? ' outlook--risk' : ''}`}>
                <span className="outlook__day">{w.tornadoDay(o.day)}</span>
                <span>
                  {o.kind === 'tornado'
                    ? o.percent >= 2
                      ? w.tornadoChance(o.percent)
                      : w.tornadoLow
                    : o.percent >= 5
                      ? w.severeChance(o.percent)
                      : w.severeLow}
                  {o.significant && ` · ${w.tornadoSig}`}
                  {o.expires && <span className="outlook__until"> ({w.tornadoUntil(timeFmt.format(new Date(o.expires)))})</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {usa && (
          <p className="legend__src">
            <a href="https://www.spc.noaa.gov/products/outlook/" target="_blank" rel="noreferrer">
              {w.tornadoSource}
            </a>
          </p>
        )}
      </section>

      <section className="weather__block" aria-labelledby="wx-climate">
        <h3 className="weather__title" id="wx-climate">
          {w.climate}
        </h3>
        <label className="field field--inline">
          <span className="field__label">{w.climateMonth}</span>
          <select className="field__input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {months.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <p className="note">{w.climateIntro(`${EARLY[0]}-${EARLY[1]}`, `${LATE[0]}-${LATE[1]}`)}</p>
        {climate.status === 'loading' && !climate.data && <p className="note">{w.loading}</p>}
        {climate.status === 'error' && <p className="note">{w.error}</p>}
        {rows.length > 0 && (
          <table className="climate">
            <thead>
              <tr>
                <th scope="col" />
                <th scope="col">
                  {EARLY[0]}-{String(EARLY[1]).slice(2)}
                </th>
                <th scope="col">
                  {LATE[0]}-{String(LATE[1]).slice(2)}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const v = verdict(r.stats);
                const perDecade = r.stats ? Math.abs(r.stats.sen * 10) : 0;
                const never = r.all === 0;
                const trend = never
                  ? w.trendNone
                  : v === 'significant' && r.stats
                    ? r.stats.sen > 0
                      ? w.trendUp(numberFormat(lang, 1, false)(perDecade))
                      : w.trendDown(numberFormat(lang, 1, false)(perDecade))
                    : w.trendWeak;
                return (
                  <tr key={r.id}>
                    <th scope="row">
                      {w.events[r.id]}
                      <span className={`climate__trend climate__trend--${never ? 'none' : v}`}>{trend}</span>
                    </th>
                    <td>
                      {pct(r.early)}
                      <span className="climate__days">{Number.isFinite(r.early) ? w.days(f0(r.early * r.days)) : ''}</span>
                    </td>
                    <td>
                      {pct(r.late)}
                      <span className="climate__days">{Number.isFinite(r.late) ? w.days(f0(r.late * r.days)) : ''}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <p className="note">{w.formula}</p>
        <p className="legend__src">
          <a href="https://power.larc.nasa.gov/" target="_blank" rel="noreferrer">
            NASA POWER, MERRA-2 ({cLat}, {cLon})
          </a>
        </p>
      </section>
    </div>
  );
}
