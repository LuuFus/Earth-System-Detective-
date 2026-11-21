// Panels and floating controls for the live layers: fires, Ukraine, the map style, the zoom
// buttons, the fire-story player and the air-quality station card.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ago, SCALES, type FieldKind, type LiveManifest } from '../../data/live';
import { SAFECAST_GRADIENT } from '../../data/safecast';
import { WAQI_TOKEN } from '../../data/waqi';
import { AQI_COLORS, aqiBand, DEEPSTATE, SAFECAST_URL, type AqiStation, type FireStory, type FrontVersion } from '../../data/ukraine';
import type { WarData } from '../../data/war';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import type { Light, WeatherField } from '../../state/explore';
import { JellySlider } from '../ui/JellySlider';
import { Icon } from './Icon';
import { WarLegend } from './Panels';

const hex = (c: number) => `#${c.toString(16).padStart(6, '0')}`;

export function Switch({ checked, onChange, label, note, disabled }: { checked: boolean; onChange: (on: boolean) => void; label: ReactNode; note?: ReactNode; disabled?: boolean }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch__track" aria-hidden="true" />
      <span className="switch__text">
        {label}
        {note && <span className="switch__note">{note}</span>}
      </span>
    </label>
  );
}

function dateText(iso: string, lang: 'uk' | 'en', withTime = false) {
  return new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(iso));
}

function Bars({ values, active, label }: { values: number[]; active?: number; label: string }) {
  const max = Math.max(1, ...values);
  return (
    <svg className="bars" viewBox={`0 0 ${values.length * 10} 40`} preserveAspectRatio="none" role="img" aria-label={label}>
      {values.map((v, i) => {
        const h = Math.max(1, (v / max) * 38);
        return <rect key={i} x={i * 10 + 1.5} y={40 - h} width={7} height={h} rx={2} className={active !== undefined && i <= active ? 'bars__on' : undefined} />;
      })}
    </svg>
  );
}

// ---------- Fires ----------

type FiresProps = {
  liveFires: boolean;
  onLiveFires: (on: boolean) => void;
  manifest: LiveManifest | null;
  manifestError: boolean;
  liveCount: number | null;
  stories: FireStory[] | null;
  storyId: string | null;
  onStory: (story: FireStory) => void;
  onUkraine: () => void;
};

export function FiresPanel(p: FiresProps) {
  const { lang } = useI18n();
  const t = useLiveText();
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB');
  const fires = p.manifest?.fires;
  const ua = fires?.ukraine ?? [];
  return (
    <>
      <section className="panel-sec">
        <h3 className="panel-sec__title">{t.fires.now}</h3>
        <Switch checked={p.liveFires} onChange={p.onLiveFires} label={t.fires.live} note={fires ? t.updated(ago(p.manifest!.built, lang)) : undefined} />
        {!fires && p.manifestError && <p className="note">{t.noLive}</p>}
        {p.liveFires && fires && (
          <div className="live-legend">
            <span className="live-legend__ramp live-legend__ramp--fires" aria-hidden="true" />
            <span className="live-legend__ticks">
              {t.fires.legend.map((x) => (
                <span key={x}>{x}</span>
              ))}
            </span>
            <p className="note">
              {p.liveCount !== null && <strong>{t.fires.count(nf.format(p.liveCount))}. </strong>}
              {t.fires.liveNote}
            </p>
          </div>
        )}
        {ua.length > 0 && (
          <div className="mini-card">
            <div className="mini-card__head">
              <span>{t.fires.ukraine7}</span>
              <strong>{nf.format(ua.reduce((a, d) => a + d.count, 0))}</strong>
            </div>
            <Bars values={ua.map((d) => d.count)} label={ua.map((d) => `${d.date}: ${d.count}`).join(', ')} />
            <button type="button" className="chip-btn" onClick={p.onUkraine}>
              <Icon name="ukraine" size={16} />
              {t.showUkraine}
            </button>
          </div>
        )}
      </section>

      <section className="panel-sec">
        <h3 className="panel-sec__title">{t.fires.stories}</h3>
        <p className="note">{t.fires.storiesNote}</p>
        {!p.stories && <p className="note">{t.loading}</p>}
        <div className="story-list">
          {p.stories?.map((s) => (
            <button key={s.id} type="button" className="story-card" aria-pressed={p.storyId === s.id} onClick={() => p.onStory(s)}>
              <span className="story-card__title">{s.title[lang]}</span>
              <Bars values={s.perDay} label={s.title[lang]} />
              <span className="story-card__meta">
                {t.fires.days(s.days)} · {t.fires.points(nf.format(s.count))}
              </span>
            </button>
          ))}
        </div>
        <a className="text-link" href="https://firms.modaps.eosdis.nasa.gov/map/" target="_blank" rel="noreferrer">
          {t.fires.firmsMap} ↗
        </a>
      </section>
    </>
  );
}

// ---------- Fire story player ----------

type PlayerProps = {
  story: FireStory;
  /** Called every frame with the story clock, in hours since its start. */
  onTime: (hours: number) => void;
  onClose: () => void;
};

/** Plays a fire story: about 25 seconds for the whole story at 1x, whatever its length. */
export function StoryPlayer({ story, onTime, onClose }: PlayerProps) {
  const { lang } = useI18n();
  const t = useLiveText();
  const [hours, setHours] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const end = story.days * 24;
  const clock = useRef(0);
  const timeCb = useRef(onTime);
  timeCb.current = onTime;
  useEffect(() => {
    clock.current = 0;
    setHours(0);
    setPlaying(true);
    timeCb.current(0);
  }, [story.id]);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const rate = 24 * Math.max(1, story.days / 24) * speed; // story hours per second
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock.current = Math.min(end, clock.current + dt * rate);
      timeCb.current(clock.current);
      setHours(clock.current);
      if (clock.current >= end) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, story.days, end]);
  const onHours = (h: number) => {
    clock.current = h;
    setHours(h);
    timeCb.current(h);
  };
  const onPlay = (on: boolean) => {
    if (on && clock.current >= end) onHours(0);
    setPlaying(on);
  };
  const day = Math.min(story.days - 1, Math.floor(hours / 24));
  const start = Date.parse(`${story.start}T00:00:00Z`);
  const fmt = (h: number) => new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(start + h * 3600_000));
  const months = new Set<number>();
  const majors: number[] = [];
  for (let d = 0; d < story.days; d++) {
    const date = new Date(start + d * 86400_000);
    const m = date.getUTCFullYear() * 12 + date.getUTCMonth();
    if (date.getUTCDate() === 1 && !months.has(m)) {
      months.add(m);
      majors.push(d * 24);
    }
  }
  if (majors.length < 2) majors.splice(0, majors.length, 0, (story.days - 1) * 24);
  return (
    <section className="story-player" aria-label={story.title[lang]}>
      <header className="story-player__head">
        <div>
          <h2 className="story-player__title">{story.title[lang]}</h2>
          <p className="story-player__text">{story.text[lang]}</p>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="story-player__bars">
        <Bars values={story.perDay} active={day} label={t.fires.perDay(story.perDay[day] ?? 0)} />
      </div>
      <div className="story-player__row">
        <button type="button" className="play-btn" aria-label={playing ? t.pause : t.play} onClick={() => onPlay(!playing)}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <button type="button" className="speed-btn" aria-label={`${t.fires.speed}: ${speed}×`} onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}>
          {speed}×
        </button>
        <JellySlider
          className="story-player__slider"
          min={0}
          max={(story.days - 1) * 24 + 23}
          step={1}
          value={Math.round(hours)}
          onChange={onHours}
          label={t.fires.day(day + 1, story.days)}
          format={fmt}
          formatTick={(h) => new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short' }).format(new Date(start + h * 3600_000))}
          majors={majors}
        />
        <div className="story-player__date">
          <strong>{fmt(hours)}</strong>
          <span>{t.fires.day(day + 1, story.days)}</span>
        </div>
      </div>
      <div className="story-player__legend" aria-hidden="true">
        {t.fires.legendStory.map((x, i) => (
          <span key={x} className={`story-key story-key--${i}`}>
            {x}
          </span>
        ))}
        <span className="story-player__src">NASA FIRMS · VIIRS 375 m</span>
      </div>
    </section>
  );
}

// ---------- Ukraine ----------

type UkraineProps = {
  aqi: boolean;
  radiation: boolean;
  front: boolean;
  war: boolean;
  liveFires: boolean;
  blackout: boolean;
  onAqi: (on: boolean) => void;
  onRadiation: (on: boolean) => void;
  onFront: (on: boolean) => void;
  onWar: (on: boolean) => void;
  onLiveFires: (on: boolean) => void;
  onBlackout: (on: boolean) => void;
  onUkraine: () => void;
  stations: AqiStation[] | null;
  stationsError: boolean;
  manifest: LiveManifest | null;
  versions: FrontVersion[] | null;
  versionIndex: number;
  onVersion: (i: number) => void;
  frontStatus: 'idle' | 'loading' | 'ready' | 'error';
  warData: WarData | null;
  warStatus: 'idle' | 'loading' | 'ready' | 'error';
};

export function UkrainePanel(p: UkraineProps) {
  const { lang } = useI18n();
  const t = useLiveText();
  const u = t.ukraine;
  // The median of readings from the last hours only.
  const stations = (p.stations ?? []).filter((s) => Date.now() - Date.parse(s.time) < 3 * 3600_000);
  const median = stations.length ? [...stations].map((s) => s.aqi).sort((a, b) => a - b)[Math.floor(stations.length / 2)] : null;
  const fires7 = p.manifest?.fires?.ukraine.reduce((a, d) => a + d.count, 0) ?? null;
  const latest = p.versions?.[p.versions.length - 1];
  const version = p.versions?.[p.versionIndex];
  const years: number[] = [];
  if (p.versions) {
    let last = '';
    p.versions.forEach((v, i) => {
      const y = v.date.slice(0, 4);
      if (y !== last) {
        if (last) years.push(i);
        last = y;
      }
    });
  }
  return (
    <>
      <p className="note">{u.intro}</p>
      <div className="tiles tiles--live">
        <section className="tile">
          <h4 className="tile__label">{u.aqiTile}</h4>
          <p className="tile__value">
            {median !== null ? (
              <>
                <span className="aqi-dot" style={{ background: hex(AQI_COLORS[aqiBand(median)]) }} />
                {median}
              </>
            ) : (
              '—'
            )}
          </p>
          <p className="tile__note">{stations.length ? u.aqiStations(stations.length) : p.stationsError ? t.error : t.loading}</p>
        </section>
        <section className="tile">
          <h4 className="tile__label">{u.firesTile}</h4>
          <p className="tile__value">{fires7 ?? '—'}</p>
          <p className="tile__note">NASA FIRMS</p>
        </section>
        <section className="tile">
          <h4 className="tile__label">{u.frontTile}</h4>
          <p className="tile__value tile__value--small">{latest ? dateText(latest.date, lang) : '—'}</p>
          <p className="tile__note">DeepState</p>
        </section>
      </div>
      <button type="button" className="chip-btn" onClick={p.onUkraine}>
        <Icon name="ukraine" size={16} />
        {t.showUkraine}
      </button>

      <section className="panel-sec">
        <Switch checked={p.aqi} onChange={p.onAqi} label={WAQI_TOKEN ? u.aqiWaqi : u.aqi} />
        {p.aqi && (
          <div className="sub">
            <ul className="aqi-keys">
              {u.aqiBands.map((b, i) => (
                <li key={b}>
                  <span className="aqi-dot" style={{ background: hex(AQI_COLORS[i]) }} />
                  {b}
                </li>
              ))}
            </ul>
            <p className="note">{u.aqiNote}</p>
            <a className="text-link" href="https://www.saveecobot.com/maps" target="_blank" rel="noreferrer">
              SaveEcoBot ↗
            </a>
          </div>
        )}
      </section>

      <section className="panel-sec">
        <Switch checked={p.radiation} onChange={p.onRadiation} label={u.radiation} />
        {p.radiation && (
          <div className="sub">
            <RadiationLegend />
            <p className="note">{u.radiationNote}</p>
            <a className="text-link" href={SAFECAST_URL} target="_blank" rel="noreferrer">
              Safecast ↗
            </a>
          </div>
        )}
      </section>

      <section className="panel-sec">
        <Switch checked={p.front} onChange={p.onFront} label={u.front} note={latest ? `${u.frontLatest}: ${dateText(latest.date, lang, true)}` : undefined} />
        {p.front && (
          <div className="sub">
            <ul className="front-keys">
              {(['occupied', 'liberated', 'unknown'] as const).map((k) => (
                <li key={k}>
                  <span className={`front-key front-key--${k}`} />
                  {u.frontKeys[k]}
                </li>
              ))}
            </ul>
            {p.versions && p.versions.length > 1 && (
              <>
                <p className="field__label">{u.frontVersion}</p>
                <JellySlider
                  min={0}
                  max={p.versions.length - 1}
                  value={p.versionIndex}
                  onChange={p.onVersion}
                  label={u.frontVersion}
                  format={(i) => dateText(p.versions![Math.round(i)]?.date ?? latest!.date, lang)}
                  formatTick={(i) => p.versions![Math.round(i)]?.date.slice(0, 4) ?? ''}
                  majors={years}
                />
                {version && <p className="note front-note">{version.text[lang] || version.text.uk}</p>}
              </>
            )}
            {p.frontStatus === 'loading' && <p className="note">{t.loading}</p>}
            {p.frontStatus === 'error' && <p className="note">{t.error}</p>}
            <p className="note">{u.frontNote}</p>
            <a className="text-link" href={DEEPSTATE} target="_blank" rel="noreferrer">
              DeepState ↗
            </a>
          </div>
        )}
      </section>

      <section className="panel-sec">
        <Switch checked={p.war} onChange={p.onWar} label={u.war} />
        {p.war && <WarLegend data={p.warData} status={p.warStatus} />}
      </section>

      <section className="panel-sec">
        <Switch checked={p.liveFires} onChange={p.onLiveFires} label={u.fires} />
      </section>

      <section className="panel-sec panel-sec--feature">
        <h3 className="panel-sec__title">
          <Icon name="bulb" size={18} />
          {u.blackout}
        </h3>
        <div className="blackout-preview" aria-hidden="true">
          <img src="https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=VIIRS_SNPP_DayNightBand&STYLES=&CRS=EPSG:4326&BBOX=44,22,53,41&WIDTH=380&HEIGHT=180&FORMAT=image/png&TIME=2021-10-03" alt="" loading="lazy" />
          <img src="https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&LAYERS=VIIRS_SNPP_DayNightBand&STYLES=&CRS=EPSG:4326&BBOX=44,22,53,41&WIDTH=380&HEIGHT=180&FORMAT=image/png&TIME=2022-11-25" alt="" loading="lazy" />
        </div>
        <p className="note">{u.blackoutNote}</p>
        <button type="button" className={p.blackout ? 'btn btn--quiet' : 'btn'} onClick={() => p.onBlackout(!p.blackout)}>
          {p.blackout ? u.blackoutOff : u.blackoutOn}
        </button>
      </section>
    </>
  );
}

// ---------- Radiation legend (Safecast's own scale) ----------

const RAD_TICKS: [number, number][] = [
  [0.05, 0.068],
  [0.12, 0.213],
  [0.23, 0.356],
  [0.43, 0.496],
  [0.87, 0.64],
  [2.13, 0.785],
  [10.1, 0.928],
];

export function RadiationLegend() {
  const { lang } = useI18n();
  const u = useLiveText().ukraine;
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 2 });
  return (
    <div className="rad-legend">
      <span className="rad-legend__bar" style={{ background: SAFECAST_GRADIENT }} aria-hidden="true" />
      <span className="rad-legend__ticks" aria-hidden="true">
        {RAD_TICKS.map(([v, x]) => (
          <span key={v} style={{ left: `${x * 100}%` }}>
            {nf.format(v)}
          </span>
        ))}
      </span>
      <p className="rad-legend__unit">{u.radiationUnit}</p>
      <ul className="rad-legend__bands">
        <li>
          <i style={{ background: 'rgb(58,163,255)' }} />
          {u.radiationBands[0]}
        </li>
        <li>
          <i style={{ background: 'rgb(222,104,255)' }} />
          {u.radiationBands[1]}
        </li>
        <li>
          <i style={{ background: 'rgb(255,92,3)' }} />
          {u.radiationBands[2]}
        </li>
      </ul>
    </div>
  );
}

// ---------- Air-quality station card ----------

export function StationCard({ station, onClose }: { station: AqiStation; onClose: () => void }) {
  const { lang } = useI18n();
  const t = useLiveText();
  const band = aqiBand(station.aqi);
  const f1 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1 });
  return (
    <section className="station-card" aria-label={`${station.city}, ${station.name}`}>
      <header className="station-card__head">
        <div>
          <p className="station-card__city">{station.city}</p>
          <h2 className="station-card__name">{station.name}</h2>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="station-card__aqi" style={{ ['--aqi' as string]: hex(AQI_COLORS[band]) }}>
        <strong>{station.aqi}</strong>
        <span>
          {t.ukraine.station.aqi} · {t.ukraine.aqiBands[band]}
        </span>
      </div>
      <dl className="station-card__rows">
        {station.pm25 !== null && (
          <div>
            <dt>{t.ukraine.station.pm25}</dt>
            <dd>{f1.format(station.pm25)} µg/m³</dd>
          </div>
        )}
        {station.pm10 !== null && (
          <div>
            <dt>{t.ukraine.station.pm10}</dt>
            <dd>{f1.format(station.pm10)} µg/m³</dd>
          </div>
        )}
        {station.temp !== null && (
          <div>
            <dt>{t.ukraine.station.temp}</dt>
            <dd>{f1.format(station.temp)} °C</dd>
          </div>
        )}
        {station.humidity !== null && (
          <div>
            <dt>{t.ukraine.station.humidity}</dt>
            <dd>{f1.format(station.humidity)}%</dd>
          </div>
        )}
        <div>
          <dt>{t.ukraine.station.measured}</dt>
          <dd>{ago(station.time, lang)}</dd>
        </div>
      </dl>
      <a className="text-link" href="https://www.saveecobot.com/maps" target="_blank" rel="noreferrer">
        SaveEcoBot ↗
      </a>
    </section>
  );
}

// ---------- Weather on the globe ----------

export function WeatherGlobeControls({
  wind,
  field,
  manifest,
  frameTime,
  onWind,
  onField,
}: {
  wind: boolean;
  field: WeatherField;
  manifest: LiveManifest | null;
  frameTime: string | null;
  onWind: (on: boolean) => void;
  onField: (f: WeatherField) => void;
}) {
  const { lang } = useI18n();
  const t = useLiveText().weatherGlobe;
  const live = useLiveText();
  const w = manifest?.weather;
  const kind: FieldKind | null = field === 'none' ? null : field;
  return (
    <section className="panel-sec">
      <h3 className="panel-sec__title">{t.title}</h3>
      <Switch checked={wind} onChange={onWind} label={t.wind} note={w ? t.run(dateText(w.run.replace(/T(\d\d)Z$/, 'T$1:00:00Z'), lang, true)) : undefined} disabled={!w} />
      <div className="seg seg--wrap" role="group" aria-label={t.field}>
        {(['none', 'wind', 'temp', 'precip', 'cloud'] as const).map((f) => (
          <button key={f} type="button" className="seg__btn" aria-pressed={field === f} disabled={!w && f !== 'none'} onClick={() => onField(f)}>
            {t.fields[f]}
          </button>
        ))}
      </div>
      {kind && <FieldLegend kind={kind} />}
      {frameTime && (wind || kind) && <p className="note">{t.at(dateText(frameTime, lang, true))}</p>}
      {!w && <p className="note">{live.noLive}</p>}
      <Link className="btn btn--quiet" to="/map?mode=weather">
        <Icon name="map" size={18} />
        {t.open2d}
      </Link>
    </section>
  );
}

export function FieldLegend({ kind }: { kind: FieldKind }) {
  const scale = SCALES[kind];
  const stops = scale.stops;
  const lo = stops[0][0];
  const hi = stops[stops.length - 1][0];
  const grad = stops.map(([v, c]) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0.35, c[3] / 255)}) ${(((v - lo) / (hi - lo)) * 100).toFixed(1)}%`).join(', ');
  const ticks = [stops[0], stops[Math.floor(stops.length / 3)], stops[Math.floor((2 * stops.length) / 3)], stops[stops.length - 1]];
  return (
    <div className="live-legend">
      <span className="live-legend__ramp" style={{ background: `linear-gradient(90deg, ${grad})` }} aria-hidden="true" />
      <span className="live-legend__ticks">
        {ticks.map(([v]) => (
          <span key={v}>{v}</span>
        ))}
        <span className="live-legend__unit">{scale.unit}</span>
      </span>
    </div>
  );
}

// ---------- Map style and map controls ----------

const THUMB = (layer: string, ext: 'jpeg' | 'png') => `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/${layer}/default/default/500m/2/0/2.${ext}`;

export function MapStyle({
  relief,
  light,
  lightOverridden = false,
  borders,
  onRelief,
  onLight,
  onBorders,
}: {
  relief: boolean;
  light: Light;
  lightOverridden?: boolean;
  borders: boolean;
  onRelief: (on: boolean) => void;
  onLight: (l: Light) => void;
  onBorders: (on: boolean) => void;
}) {
  const t = useLiveText().style;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
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
    <div ref={ref} className="map-style">
      {open && (
        <section className="map-style__pop" aria-label={t.title}>
          <h2 className="map-style__title">{t.title}</h2>
          <div className="map-style__cards">
            {[
              { on: !relief, label: t.satellite, img: THUMB('BlueMarble_NextGeneration', 'jpeg'), set: () => onRelief(false) },
              { on: relief, label: t.relief, img: THUMB('BlueMarble_ShadedRelief_Bathymetry', 'jpeg'), set: () => onRelief(true) },
            ].map((c) => (
              <button key={c.label} type="button" className="style-card" aria-pressed={c.on} onClick={c.set}>
                <img src={c.img} alt="" loading="lazy" />
                <span>{c.label}</span>
              </button>
            ))}
          </div>
          {relief && <p className="note">{t.reliefNote}</p>}
          <p className="field__label">{t.lighting}</p>
          <div className="seg" role="group" aria-label={t.lighting}>
            {(['flat', 'sun', 'night'] as const).map((l) => (
              <button key={l} type="button" className="seg__btn" aria-pressed={light === l} onClick={() => onLight(l)}>
                {t.lights[l]}
              </button>
            ))}
          </div>
          <p className="note">{lightOverridden ? t.lightsOverridden : t.lightsNote[light]}</p>
          <Switch checked={borders} onChange={onBorders} label={t.borders} />
        </section>
      )}
      <button type="button" className="map-style__btn" aria-expanded={open} aria-label={t.open} onClick={() => setOpen(!open)}>
        <img src={relief ? THUMB('BlueMarble_ShadedRelief_Bathymetry', 'jpeg') : light === 'flat' ? THUMB('BlueMarble_NextGeneration', 'jpeg') : THUMB('VIIRS_Black_Marble', 'png')} alt="" />
        <span>{t.open}</span>
      </button>
    </div>
  );
}

export function MapControls({ onZoom, onHome }: { onZoom: (factor: number) => void; onHome: () => void }) {
  const t = useLiveText().controls;
  return (
    <div className="map-controls" role="group">
      <button type="button" className="map-controls__btn" aria-label={t.home} title={t.home} onClick={onHome}>
        <Icon name="globe" size={20} />
      </button>
      <div className="map-controls__zoom">
        <button type="button" className="map-controls__btn" aria-label={t.zoomIn} title={t.zoomIn} onClick={() => onZoom(0.55)}>
          <Icon name="plus" size={20} />
        </button>
        <button type="button" className="map-controls__btn" aria-label={t.zoomOut} title={t.zoomOut} onClick={() => onZoom(1.8)}>
          <Icon name="minus" size={20} />
        </button>
      </div>
    </div>
  );
}
