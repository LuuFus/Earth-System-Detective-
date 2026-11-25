// Panels and floating controls for the live layers: fires, Ukraine, the map style, the zoom
// buttons, the fire-story player and the air-quality station card.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ago, SCALES, type FieldKind, type LiveManifest } from '../../data/live';
import { RAD_COLORS, RAD_MAP } from '../../data/radiation';
import { WAQI_TOKEN } from '../../data/waqi';
import { AQI_COLORS, aqiBand, DEEPSTATE, type AqiStation, type FireStory, type FrontVersion } from '../../data/ukraine';
import { dayChange, type Hotspot } from '../../data/hotspots';
import { variableById } from '../../data/variables';
import type { WarData } from '../../data/war';
import { useI18n } from '../../i18n/I18n';
import { useClock } from '../../hooks/useClock';
import { useLiveText } from '../../i18n/live';
import { useSmokeText } from '../../i18n/smoke';
import type { Light, WeatherField } from '../../state/explore';
import { ClockRow } from './ClockRow';
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
  /** The archive day on the globe (the Fires layer), or null when that layer is off. */
  archiveDay: string | null;
  onArchiveDay: (date: string) => void;
  /** The comparison shutter is open: the live fires are hidden. */
  comparing: boolean;
  liveFires: boolean;
  onLiveFires: (on: boolean) => void;
  manifest: LiveManifest | null;
  manifestError: boolean;
  liveCount: number | null;
  stories: FireStory[] | null;
  storyId: string | null;
  onStory: (story: FireStory) => void;
  onUkraine: () => void;
  /** Where most fire burns now, with the forecast for each. */
  hotspots: { h: Hotspot; name: string }[] | null;
  onHotspot: (h: Hotspot, name: string) => void;
};

export function FiresPanel(p: FiresProps) {
  const { lang } = useI18n();
  const t = useLiveText();
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB');
  const fires = p.manifest?.fires;
  const ua = fires?.ukraine ?? [];
  const two = t.fires.two;
  const hot = useSmokeText().hotspots;
  const img = variableById.fires.imagery!;
  const step = (days: number) => {
    const d = new Date(Date.parse(`${p.archiveDay}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
    if (d >= img.first && d <= img.last) p.onArchiveDay(d);
  };
  const sats = p.archiveDay ? (img.satellites ?? []).filter((x) => p.archiveDay! >= x.first) : [];
  return (
    <>
      <section className="panel-sec fire-two">
        <h3 className="panel-sec__title">{two.title}</h3>
        <dl className="fire-two__list">
          <div className="fire-two__item">
            <dt>
              <span className="fire-key fire-key--archive" aria-hidden="true" />
              {two.archive}
            </dt>
            <dd>{two.archiveText}</dd>
          </div>
          <div className="fire-two__item">
            <dt>
              <span className="fire-key fire-key--live" aria-hidden="true" />
              {two.live}
            </dt>
            <dd>{two.liveText}</dd>
          </div>
        </dl>
        {p.archiveDay ? (
          <div className="fire-day" role="group" aria-label={two.day}>
            <button type="button" className="icon-btn" aria-label={two.prev} disabled={p.archiveDay <= img.first} onClick={() => step(-1)}>
              ‹
            </button>
            <span className="fire-day__date">
              <span>{two.day}</span>
              <strong>{dateText(p.archiveDay, lang)}</strong>
            </span>
            <button type="button" className="icon-btn" aria-label={two.next} disabled={p.archiveDay >= img.last} onClick={() => step(1)}>
              ›
            </button>
          </div>
        ) : (
          <button type="button" className="chip-btn" onClick={() => p.onArchiveDay(img.last)}>
            <Icon name="fire" size={16} />
            {two.show}
          </button>
        )}
        {p.archiveDay && (
          <p className="note">
            {two.sats(sats.map((x) => x.name).join(', '))} {p.archiveDay >= '2025-01-01' && two.snpp}
          </p>
        )}
        {p.comparing && <p className="note note--warn">{two.compare}</p>}
      </section>

      <section className="panel-sec">
        <h3 className="panel-sec__title">{t.fires.now}</h3>
        <Switch
          checked={p.liveFires}
          onChange={p.onLiveFires}
          label={t.fires.live}
          note={p.comparing && p.liveFires ? t.fires.liveHidden : fires ? t.updated(ago(p.manifest!.built, lang)) : undefined}
        />
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

      {p.hotspots && p.hotspots.length > 0 && (
        <section className="panel-sec">
          <h3 className="panel-sec__title">{hot.kicker}</h3>
          <p className="note">{hot.listNote}</p>
          <div className="hotspot-list">
            {p.hotspots.map(({ h, name }) => {
              const change = dayChange(h);
              return (
                <button key={h.id} type="button" className="hotspot" onClick={() => p.onHotspot(h, name)}>
                  <span className="hotspot__name">{name}</span>
                  <span className="hotspot__meta">
                    {hot.count(nf.format(h.lastDay))}
                    {change !== null && <b className={change > 0 ? 'hotspot__up' : 'hotspot__down'}> {change > 0 ? '▲' : '▼'} {Math.abs(change)}%</b>}
                    {' · '}
                    {nf.format(h.power)} {lang === 'uk' ? 'МВт' : 'MW'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel-sec">
        <h3 className="panel-sec__title">{t.fires.stories}</h3>
        <p className="note">{t.fires.storiesNote}</p>
        {!p.stories && <p className="note">{t.loading}</p>}
        <div className="story-list">
          {[...(p.stories ?? [])].sort((a, b) => b.start.localeCompare(a.start)).map((s) => (
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
  /** Opens the story's smoke scene, when it has one. */
  onSmoke?: () => void;
  /** Called every frame with the story clock, in hours since its start. */
  onTime: (hours: number) => void;
  onClose: () => void;
};

/** Plays a fire story: about 25 seconds for the whole story at 1x, whatever its length. */
export function StoryPlayer({ story, onTime, onClose, onSmoke }: PlayerProps) {
  const smokeText = useSmokeText();
  const { lang } = useI18n();
  const t = useLiveText();
  const end = (story.days - 1) * 24 + 23;
  // About 25 seconds for the whole story at 1x, whatever its length (the page keys it by story).
  const clock = useClock(end, 24 * Math.max(1, story.days / 24), onTime, { autoplay: true });
  const day = Math.min(story.days - 1, Math.floor(clock.hours / 24));
  const start = Date.parse(`${story.start}T00:00:00Z`);
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const fmt = (h: number) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(start + h * 3600_000));
  const tick = (h: number) => new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(new Date(start + h * 3600_000));
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
      {onSmoke && (
        <button type="button" className="smoke-open" onClick={onSmoke}>
          <strong>
            <Icon name="wind" size={16} />
            {smokeText.open}
          </strong>
          <span>{smokeText.openNote}</span>
        </button>
      )}
      <div className="story-player__bars">
        <Bars values={story.perDay} active={day} label={t.fires.perDay(story.perDay[day] ?? 0)} />
      </div>
      <ClockRow
        className="story-player"
        clock={clock}
        length={end}
        format={fmt}
        formatTick={tick}
        majors={majors}
        sub={t.fires.day(day + 1, story.days)}
        labels={{ play: t.play, pause: t.pause, speed: t.fires.speed }}
      />
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
  /** Opens the occupation timeline player. */
  onOccupation: () => void;
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
      <div className="panel-row">
        <button type="button" className="chip-btn" onClick={p.onUkraine}>
          <Icon name="ukraine" size={16} />
          {t.showUkraine}
        </button>
        <Link className="chip-btn" to="/war">
          <Icon name="front" size={16} />
          {t.war.panel}
        </Link>
      </div>

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
            <a className="text-link" href={RAD_MAP} target="_blank" rel="noreferrer">
              SaveEcoBot ↗
            </a>
          </div>
        )}
      </section>

      <section className="panel-sec">
        <Switch checked={p.front} onChange={p.onFront} label={u.front} note={latest ? `${u.frontLatest}: ${dateText(latest.date, lang, true)}` : undefined} />
        <button type="button" className="occ-open" onClick={p.onOccupation}>
          <strong>
            <Icon name="play" size={16} />
            {t.occupation.open}
          </strong>
          <span>{t.occupation.openNote}</span>
        </button>
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
            {version && <p className="note front-note">{version.text[lang] || version.text.uk}</p>}
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

// ---------- Radiation legend (the stations' levels) ----------

export function RadiationLegend() {
  const u = useLiveText().ukraine;
  return (
    <div className="rad-legend">
      <p className="rad-legend__unit">{u.radiationUnit}</p>
      <ul className="rad-legend__bands">
        {u.radiationBands.map((b, i) => (
          <li key={b}>
            <i style={{ background: hex(RAD_COLORS[i]) }} />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Air-quality station card ----------

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
