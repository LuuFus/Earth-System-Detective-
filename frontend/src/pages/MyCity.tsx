import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadSeries } from '../analysis/series';
import { trendStats, verdict, type TrendStats } from '../analysis/stats';
import { Icon } from '../components/studio/Icon';
import { TopBar } from '../components/TopBar';
import { dayAdvice, type Advice, type Level, type Reason } from '../data/advice';
import { isOld } from '../data/air';
import { loadCityAir, loadCityWeather, loadFiresNear, nearestStation, placeAt, sameCity, searchCities, useMyCity, type City, type CityAir, type CityWeather, type FiresNear, type Measured } from '../data/city';
import { ago, useLiveManifest } from '../data/live';
import { AQI_COLORS, aqiBand } from '../data/ukraine';
import { variableById } from '../data/variables';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';
import { weatherIcon } from './weatherIcon';

type Load<T> = { status: 'loading' | 'ready' | 'error'; data: T | null };

function useLoad<T>(key: string | null, run: (signal: AbortSignal) => Promise<T>): Load<T> {
  const [state, setState] = useState<Load<T> & { key: string | null }>({ key: null, status: 'loading', data: null });
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    setState({ key, status: 'loading', data: null });
    run(ctrl.signal)
      .then((data) => !ctrl.signal.aborted && setState({ key, status: 'ready', data }))
      .catch(() => !ctrl.signal.aborted && setState({ key, status: 'error', data: null }));
    return () => ctrl.abort();
    // `key` stands for every input of `run`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state.key === key ? state : { status: 'loading', data: null };
}

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;
const aqiColor = (v: number) => hex(AQI_COLORS[aqiBand(v)]);

/** The city from the address (to share a page) or the pinned one. */
function cityFromParams(p: URLSearchParams): City | null {
  const lat = Number(p.get('lat'));
  const lon = Number(p.get('lon'));
  const name = p.get('name');
  return name && Number.isFinite(lat) && Number.isFinite(lon) && p.has('lat') ? { name, lat, lon, admin: p.get('admin') ?? undefined, country: p.get('country') ?? undefined } : null;
}

export default function MyCity() {
  const { lang } = useI18n();
  const t = useLiveText().city;
  const [params, setParams] = useSearchParams();
  const [pinned, pin] = useMyCity();
  const city = cityFromParams(params) ?? pinned;
  const [picking, setPicking] = useState(!city);
  const choose = (c: City) => {
    const q: Record<string, string> = { name: c.name, lat: c.lat.toFixed(4), lon: c.lon.toFixed(4) };
    if (c.admin) q.admin = c.admin;
    if (c.country) q.country = c.country;
    setParams(q, { replace: true });
    if (!pinned) pin(c);
    setPicking(false);
  };
  useEffect(() => {
    document.title = city ? `${city.name} · Earth System Detective` : `${t.title} · Earth System Detective`;
  }, [city, t.title]);

  return (
    <main className="city">
      <TopBar back sources />
      <div className="city__inner">
        {city && !picking ? (
          <CityView city={city} pinned={sameCity(city, pinned)} onPin={() => pin(sameCity(city, pinned) ? null : city)} onChange={() => setPicking(true)} lang={lang} />
        ) : (
          <section className="city-pick" aria-labelledby="city-pick-title">
            <p className="about__kicker">{t.kicker}</p>
            <h1 id="city-pick-title" className="city__title">
              {t.choose}
            </h1>
            <p className="city__lead">{t.chooseText}</p>
            <CityPicker onPick={choose} lang={lang} />
            {city && (
              <button type="button" className="chip-btn" onClick={() => setPicking(false)}>
                {t.back(city.name)}
              </button>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function CityPicker({ onPick, lang }: { onPick: (c: City) => void; lang: 'uk' | 'en' }) {
  const t = useLiveText().city;
  const [q, setQ] = useState('');
  const [list, setList] = useState<City[] | null>(null);
  const [geo, setGeo] = useState<'idle' | 'busy' | 'error'>('idle');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  useEffect(() => {
    if (q.trim().length < 2) {
      setList(null);
      return;
    }
    const ctrl = new AbortController();
    const id = window.setTimeout(() => {
      searchCities(q, lang, ctrl.signal)
        .then(setList)
        .catch(() => !ctrl.signal.aborted && setList([]));
    }, 280);
    return () => {
      ctrl.abort();
      window.clearTimeout(id);
    };
  }, [q, lang]);
  const locate = () => {
    if (!navigator.geolocation) return setGeo('error');
    setGeo('busy');
    navigator.geolocation.getCurrentPosition(
      (p) =>
        void placeAt(p.coords.latitude, p.coords.longitude, lang)
          .then((c) => {
            setGeo('idle');
            onPick(c);
          })
          .catch(() => setGeo('error')),
      () => setGeo('error'),
      { timeout: 10_000, maximumAge: 600_000 },
    );
  };
  return (
    <div className="city-picker">
      <form className="search city-picker__search" role="search" onSubmit={(e) => (e.preventDefault(), list?.[0] && onPick(list[0]))}>
        <svg className="search__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input ref={input} className="search__input" type="search" enterKeyHint="search" placeholder={t.placeholder} value={q} onChange={(e) => setQ(e.target.value)} aria-label={t.placeholder} />
      </form>
      <button type="button" className="pill-btn pill-btn--glass" onClick={locate} disabled={geo === 'busy'}>
        <Icon name="compass" size={18} />
        {geo === 'busy' ? t.locating : t.locate}
      </button>
      {geo === 'error' && <p className="note">{t.locateError}</p>}
      {list && (
        <ul className="city-picker__list" role="listbox" aria-label={t.choose}>
          {list.length === 0 && <li className="note">{t.noResults}</li>}
          {list.map((c) => (
            <li key={`${c.lat},${c.lon}`}>
              <button type="button" role="option" aria-selected="false" onClick={() => onPick(c)}>
                <strong>{c.name}</strong>
                <span>{[c.admin, c.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CityView({ city, pinned, onPin, onChange, lang }: { city: City; pinned: boolean; onPin: () => void; onChange: () => void; lang: 'uk' | 'en' }) {
  const t = useLiveText().city;
  const { manifest } = useLiveManifest();
  const key = `${city.lat.toFixed(3)},${city.lon.toFixed(3)}`;
  const weather = useLoad<CityWeather>(key, (s) => loadCityWeather(city.lat, city.lon, s));
  const air = useLoad<CityAir>(key, (s) => loadCityAir(city.lat, city.lon, s));
  const station = useLoad<Measured | null>(manifest ? `${key}|${manifest.built}` : null, () => nearestStation(city.lat, city.lon, manifest));
  const fires = useLoad<FiresNear>(manifest?.fires ? `${key}|${manifest.built}` : null, () => loadFiresNear(manifest!, city.lat, city.lon));
  const climate = useLoad<{ stats: TrendStats | null; points: { x: number; y: number }[] }>(key, async () => {
    const s = await loadSeries(variableById.t2m, { kind: 'point', lat: city.lat, lon: city.lon, radiusKm: 25 }, 'year');
    const points = s.points.filter((p) => Number.isFinite(p.y));
    return { stats: trendStats(points), points };
  });
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);
  const tz = weather.data?.timezone;
  const hm = (ms: number) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(ms);
  const advice = useMemo<Advice[] | null>(() => {
    const w = weather.data;
    if (!w) return null;
    return dayAdvice({
      ...w.hourly,
      air: air.data ? { t: air.data.hourly.t, aqi: air.data.hourly.aqi, dust: air.data.hourly.dust } : null,
      // Only a fresh measurement says what the air is like now.
      measuredAqi: station.data && !isOld(station.data.station) ? station.data.station.aqi : null,
      now: Date.now(),
    });
  }, [weather.data, air.data, station.data]);
  const here = `${city.lat.toFixed(2)},${city.lon.toFixed(2)}`;

  return (
    <>
      <header className="city__head">
        <div>
          <p className="about__kicker">{t.kicker}</p>
          <h1 className="city__title">{city.name}</h1>
          <p className="city__where">
            {[city.admin, city.country].filter(Boolean).join(', ')}
            {tz && ` · ${t.localTime(hm(Date.now()))}`}
          </p>
        </div>
        <div className="city__actions">
          <button type="button" className={`pill-btn${pinned ? '' : ' pill-btn--glass'}`} aria-pressed={pinned} onClick={onPin} title={t.pinNote}>
            <Icon name="pin" size={18} />
            {pinned ? t.pinned : t.pin}
          </button>
          <button type="button" className="pill-btn pill-btn--glass" onClick={onChange}>
            <Icon name="search" size={18} />
            {t.change}
          </button>
        </div>
      </header>

      <div className="city__grid">
        <Card title={t.now} className="city-now">
          {weather.data ? (
            <div className="city-now__body">
              <Icon name={weatherIcon(weather.data.now.code, weather.data.now.isDay)} size={44} />
              <strong className="city-now__temp">{Math.round(weather.data.now.temp)}°</strong>
              <ul className="city-now__facts">
                <li>{t.feels(Math.round(weather.data.now.feels))}</li>
                <li>{t.wind(Math.round(weather.data.now.wind), Math.round(weather.data.now.gust))}</li>
                <li>{t.humidity(Math.round(weather.data.now.humidity))}</li>
              </ul>
            </div>
          ) : (
            <Status status={weather.status} />
          )}
        </Card>

        <Card title={t.advice} className="city-advice">
          {advice ? (
            <>
              <ul className="city-advice__list">
                {advice.map((a) => (
                  <AdviceRow key={a.id} a={a} hm={hm} />
                ))}
              </ul>
              <p className="note">{t.adviceNote}</p>
            </>
          ) : (
            <Status status={weather.status} />
          )}
        </Card>

        <Card title={t.air} className="city-air">
          <div className="city-air__now">
            <div>
              <p className="city__label">{t.measured}</p>
              {station.data ? (
                <p className="city-air__value">
                  <span className="city-aqi" style={{ background: aqiColor(station.data.station.aqi) }}>
                    {Math.round(station.data.station.aqi)}
                  </span>
                  <span>{t.measuredAt(station.data.station.name ?? station.data.station.city ?? t.sensor, station.data.km.toFixed(0), ago(station.data.station.time, lang))}</span>
                </p>
              ) : station.status === 'loading' ? (
                <Status status="loading" />
              ) : (
                <p className="note">{t.noStation}</p>
              )}
            </div>
            <div>
              <p className="city__label">{t.model}</p>
              {air.data?.now.aqi != null ? (
                <p className="city-air__value">
                  <span className="city-aqi" style={{ background: aqiColor(air.data.now.aqi) }}>
                    {Math.round(air.data.now.aqi)}
                  </span>
                  <span>
                    {(['pm25', 'pm10', 'no2', 'o3', 'dust'] as const)
                      .filter((k) => air.data!.now[k] != null)
                      .map((k) => `${t.pollutants[k]} ${Math.round(air.data!.now[k]!)}`)
                      .join(' · ')}{' '}
                    {t.ugm3}
                  </span>
                </p>
              ) : (
                <Status status={air.status} />
              )}
            </div>
          </div>
          {air.data && <AqiChart air={air.data} hm={hm} label={t.airChart} now={t.nowShort} locale={locale} tz={tz} />}
          <Link className="chip-btn" to="/map?mode=ukraine">
            {t.openAir}
          </Link>
        </Card>

        <Card title={t.forecast} className="city-forecast">
          {weather.data ? <Forecast w={weather.data} hm={hm} locale={locale} /> : <Status status={weather.status} />}
          <Link className="chip-btn" to={`/map?mode=weather`}>
            {t.openMap}
          </Link>
        </Card>

        <Card title={t.fires} className="city-fires">
          {fires.data ? (
            <p>{fires.data.count ? t.firesSome(fires.data.count, Math.round(fires.data.nearestKm!), ageText(fires.data.newestMin!, lang)) : t.firesNone}</p>
          ) : (
            <Status status={manifest?.fires ? fires.status : 'error'} />
          )}
          <Link className="chip-btn" to={`/explore?panel=fires&on=fires&cam=${here},1.25`}>
            {t.firesMap}
          </Link>
        </Card>

        <Card title={t.climate} className="city-climate">
          {climate.data?.stats ? <Climate stats={climate.data.stats} points={climate.data.points} locale={locale} /> : <Status status={climate.status} />}
          <Link className="chip-btn" to={`/explore?v=t2m&a=p:${city.lat.toFixed(3)},${city.lon.toFixed(3)},25&cam=${here},1.6`}>
            {t.openGlobe}
          </Link>
        </Card>
      </div>
      <p className="note city__sources">{t.sources}</p>
    </>
  );
}

function ageText(min: number, lang: 'uk' | 'en'): string {
  return ago(new Date(Date.now() - min * 60_000).toISOString(), lang);
}

function Card({ title, className, children }: { title: string; className: string; children: ReactNode }) {
  return (
    <section className={`city-card ${className}`}>
      <h2 className="city-card__title">{title}</h2>
      {children}
    </section>
  );
}

function Status({ status }: { status: 'loading' | 'ready' | 'error' }) {
  const t = useLiveText();
  return <p className="note">{status === 'error' ? t.city.error : t.loading}</p>;
}

const LEVEL_ICON: Record<Level, string> = { good: '✓', ok: '!', bad: '✕' };

function AdviceRow({ a, hm }: { a: Advice; hm: (ms: number) => string }) {
  const t = useLiveText().city;
  let text: string;
  let reasons: Reason[] = [];
  if (a.id === 'airing') {
    text = t.adviceItems.airing[a.level](a.hour !== null ? hm(a.hour) : '', Math.round(a.aqi ?? 0));
    reasons = a.reasons;
  } else if (a.id === 'walk' || a.id === 'run') {
    text = t.adviceItems[a.id][a.level];
    reasons = a.reasons;
  } else if (a.id === 'uv') text = t.adviceItems.uv[a.level === 'bad' ? 'bad' : 'ok'](Math.round(a.value), hm(a.hour));
  else if (a.id === 'dust') text = t.adviceItems.dust[a.level === 'bad' ? 'bad' : 'ok'](Math.round(a.value), hm(a.hour));
  else text = '';
  const why = reasons.map((r) => {
    switch (r.kind) {
      case 'aqi':
        return t.reasons.aqi(Math.round(r.value), r.measured);
      case 'heat':
        return t.reasons.heat(Math.round(r.value));
      case 'cold':
        return t.reasons.cold(Math.round(r.value));
      case 'gust':
        return t.reasons.gust(Math.round(r.value));
      case 'rain':
        return t.reasons.rain(Math.round(r.value));
      case 'storm':
        return t.reasons.storm;
      default:
        return '';
    }
  });
  return (
    <li className={`city-advice__item city-advice__item--${a.level}`}>
      <span className="city-advice__mark" aria-hidden="true">
        {LEVEL_ICON[a.level]}
      </span>
      <span>
        {text}
        {why.length > 0 && <small>{why.join('; ')}</small>}
      </span>
    </li>
  );
}

/** The model's AQI hour by hour: bars in the AQI colours, the present hour marked. */
function AqiChart({ air, label, now, locale, tz }: { air: CityAir; hm: (ms: number) => string; label: string; now: string; locale: string; tz?: string }) {
  const W = 560;
  const H = 96;
  const { t, aqi } = air.hourly;
  const max = Math.max(100, ...aqi.map((v) => v ?? 0));
  const bw = W / t.length;
  const nowX = (() => {
    const i = t.findIndex((x) => x > Date.now());
    return i < 0 ? null : i * bw;
  })();
  const days: { x: number; text: string }[] = [];
  let last = '';
  t.forEach((ms, i) => {
    const d = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', timeZone: tz }).format(ms);
    if (d !== last) {
      days.push({ x: i * bw, text: d });
      last = d;
    }
  });
  return (
    <figure className="city-chart">
      <figcaption className="city__label">{label}</figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={label}>
        {aqi.map((v, i) => (v == null ? null : <rect key={i} x={i * bw + 0.5} width={Math.max(1, bw - 1)} y={H - (v / max) * H} height={(v / max) * H} fill={aqiColor(v)} opacity={nowX !== null && i * bw < nowX ? 0.55 : 0.95} />))}
        {nowX !== null && (
          <>
            <line x1={nowX} x2={nowX} y1={0} y2={H} className="city-chart__now" />
            <text x={nowX + 4} y={10} className="city-chart__text">
              {now}
            </text>
          </>
        )}
        {days.map((d) => (
          <text key={d.x} x={d.x + 2} y={H + 14} className="city-chart__text">
            {d.text}
          </text>
        ))}
      </svg>
    </figure>
  );
}

function Forecast({ w, hm, locale }: { w: CityWeather; hm: (ms: number) => string; locale: string }) {
  const t = useLiveText().city;
  const from = w.hourly.t.findIndex((x) => x > Date.now() - 3600_000);
  const hours = Array.from({ length: 24 }, (_, k) => from + k).filter((i) => i >= 0 && i < w.hourly.t.length);
  const temps = hours.map((i) => w.hourly.temp[i]);
  const lo = Math.min(...temps);
  const hi = Math.max(...temps);
  const W = 560;
  const H = 80;
  const x = (k: number) => (k / Math.max(1, hours.length - 1)) * (W - 20) + 10;
  const y = (v: number) => 12 + (1 - (v - lo) / Math.max(1, hi - lo)) * (H - 24);
  const line = hours.map((_, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)},${y(temps[k]).toFixed(1)}`).join(' ');
  const day = (d: string) => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', timeZone: 'UTC' }).format(Date.parse(`${d}T12:00:00Z`));
  return (
    <>
      <figure className="city-chart">
        <figcaption className="city__label">{t.next24}</figcaption>
        <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={t.next24}>
          {hours.map((i, k) => (w.hourly.rain[i] > 0.05 ? <rect key={`r${i}`} x={x(k) - 3} width={6} y={H - Math.min(30, w.hourly.rain[i] * 10)} height={Math.min(30, w.hourly.rain[i] * 10)} className="city-chart__rain" /> : null))}
          <path d={line} className="city-chart__temp" />
          {hours.map((i, k) =>
            k % 3 === 0 ? (
              <g key={i}>
                <text x={x(k)} y={y(temps[k]) - 5} className="city-chart__text" textAnchor="middle">
                  {Math.round(temps[k])}°
                </text>
                <text x={x(k)} y={H + 14} className="city-chart__text" textAnchor="middle">
                  {hm(w.hourly.t[i])}
                </text>
              </g>
            ) : null,
          )}
        </svg>
      </figure>
      <ul className="city-week" aria-label={t.week}>
        {w.daily.date.map((d, i) => (
          <li key={d}>
            <span>{day(d)}</span>
            <Icon name={weatherIcon(w.daily.code[i])} size={22} />
            <span className="city-week__t">
              <strong>{Math.round(w.daily.tMax[i])}°</strong> {Math.round(w.daily.tMin[i])}°
            </span>
            <span className="city-week__rain">{w.daily.rain[i] >= 0.1 ? `${w.daily.rain[i].toFixed(1)} ${t.mm}` : ''}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Climate({ stats, points, locale }: { stats: TrendStats; points: { x: number; y: number }[]; locale: string }) {
  const t = useLiveText().city;
  const nf = new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1, signDisplay: 'always' });
  const nf2 = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2, signDisplay: 'always' });
  const from = points[0].x;
  const to = points[points.length - 1].x;
  const delta = stats.sen * (to - from);
  const W = 560;
  const H = 90;
  const ys = points.map((p) => p.y);
  const lo = Math.min(...ys);
  const hi = Math.max(...ys);
  const x = (v: number) => 10 + ((v - from) / Math.max(1, to - from)) * (W - 20);
  const y = (v: number) => 8 + (1 - (v - lo) / Math.max(0.1, hi - lo)) * (H - 16);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join(' ');
  const trend = `M${x(from)},${y(stats.senIntercept + stats.sen * from)} L${x(to)},${y(stats.senIntercept + stats.sen * to)}`;
  return (
    <>
      <p className="city-climate__big">
        <strong>{nf.format(delta)} °C</strong> {t.sinceYear(from)}
      </p>
      <p>{t.climateText(nf.format(delta), nf2.format(stats.sen * 10), from, to)}</p>
      <svg className="city-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.climate}>
        <path d={line} className="city-chart__series" />
        <path d={trend} className="city-chart__trend" />
      </svg>
      <p className="note">
        {verdict(stats) === 'significant' ? t.climateSig : t.climateWeak} {t.climateNote}
      </p>
    </>
  );
}
