// The occupation timeline player: plays the occupied territory of Ukraine week by week since 2022,
// with the date, the occupied area, what was captured and liberated that week, and a chart of the
// area with key dates. The map itself is painted by the page (globe or 2D map) through `onPos`.

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { OCC_COLORS, OCC_EVENTS, TRAIL, frameAt, type OccHistory } from '../../data/frontHistory';
import { whenText } from '../../data/hints';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { JellySlider } from '../ui/JellySlider';
import { Icon } from './Icon';

type Props = {
  history: OccHistory;
  /** The fractional week index, on every animation frame while playing and on every seek. */
  onPos: (pos: number, playing: boolean) => void;
  onClose: () => void;
  className?: string;
};

/** Weeks per second at 1×: the whole timeline in about a minute and a half. */
const RATE = 3;

export function OccupationPlayer({ history, onPos, onClose, className = '' }: Props) {
  const { lang } = useI18n();
  const t = useLiveText().occupation;
  const live = useLiveText();
  const frames = history.frames;
  const last = frames.length - 1;
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2 | 4>(1);
  const clock = useRef(0);
  const cb = useRef(onPos);
  useEffect(() => {
    cb.current = onPos;
  }, [onPos]);

  const seek = (p: number, play = playing) => {
    clock.current = Math.min(last, Math.max(0, p));
    setPos(clock.current);
    cb.current(clock.current, play);
  };

  useEffect(() => {
    cb.current(clock.current, playing);
    if (!playing) return;
    let raf = 0;
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      clock.current = Math.min(last, clock.current + dt * RATE * speed);
      setPos(clock.current);
      cb.current(clock.current, true);
      if (clock.current >= last) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, last]);

  const k = Math.round(pos);
  const f = frames[k];
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const share = (100 * f.area) / history.ukraineKm2;
  const dateOf = (i: number) => (frames[i]?.pre ? t.before : whenText({ from: frames[i]?.date ?? frames[last].date }, lang));
  const years: number[] = [];
  frames.forEach((fr, i) => {
    if (i > 0 && fr.date.slice(0, 4) !== frames[i - 1].date.slice(0, 4)) years.push(i);
  });
  // Changes smaller than a few km² are mostly the line being redrawn more precisely.
  const captured = f.captured >= 5 && !f.pre && k > 0 && !frames[k - 1].pre ? f.captured : 0;
  const liberated = f.liberated >= 5 && !f.pre && k > 0 && !frames[k - 1].pre ? f.liberated : 0;

  const onPlay = (on: boolean) => {
    if (on && clock.current >= last) seek(0, true);
    setPlaying(on);
  };

  return (
    <section className={`occ-player ${className}`} aria-label={t.title}>
      <header className="occ-player__head">
        <div>
          <h2 className="occ-player__title">{t.title}</h2>
          <p className="occ-player__src">
            <a href={history.url} target="_blank" rel="noreferrer">
              {t.source}
            </a>{' '}
            · {t.note}
          </p>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={live.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>

      <div className="occ-player__now" aria-live="polite">
        <time className="occ-player__date" dateTime={f.date}>
          {dateOf(k)}
        </time>
        <p className="occ-player__area">
          <span className="occ-key occ-key--occupied" aria-hidden="true" />
          {t.occupied(nf.format(Math.round(f.area / 100) * 100), nf1.format(share))}
        </p>
        <p className="occ-player__week">
          {f.pre ? (
            t.preNote
          ) : k === 1 ? (
            t.gap
          ) : captured || liberated ? (
            <>
              <span className="occ-player__label">{t.week}:</span>
              {captured > 0 && <span className="occ-chip occ-chip--captured">{t.captured(nf.format(captured))}</span>}
              {liberated > 0 && <span className="occ-chip occ-chip--liberated">{t.liberated(nf.format(liberated))}</span>}
            </>
          ) : (
            <span className="occ-player__label">{t.noChange}</span>
          )}
        </p>
      </div>

      <AreaChart history={history} pos={pos} onSeek={(p) => seek(p)} label={t.chart} lang={lang} />

      <div className="occ-player__row">
        <button type="button" className="play-btn" aria-label={playing ? live.pause : live.play} onClick={() => onPlay(!playing)}>
          <Icon name={playing ? 'pause' : 'play'} />
        </button>
        <button type="button" className="speed-btn" aria-label={`${t.speed}: ${speed}×`} onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}>
          {speed}×
        </button>
        <JellySlider
          className="occ-player__slider"
          min={0}
          max={last}
          step={1}
          value={Math.round(pos)}
          onChange={(v) => {
            setPlaying(false);
            seek(v, false);
          }}
          label={t.title}
          format={(i) => dateOf(Math.round(i))}
          formatTick={(i) => frames[Math.round(i)]?.date.slice(0, 4) ?? ''}
          majors={years}
        />
        <button type="button" className="chip-btn" onClick={() => { setPlaying(false); seek(last, false); }}>
          {t.today}
        </button>
      </div>

      <div className="occ-player__legend" aria-hidden="true">
        <span>
          <i className="occ-key occ-key--occupied" />
          {t.keys.occupied}
        </span>
        <span>
          <i className="occ-key occ-key--captured" />
          {t.keys.captured(TRAIL)}
        </span>
        <span>
          <i className="occ-key occ-key--liberated" />
          {t.keys.liberated(TRAIL)}
        </span>
      </div>
    </section>
  );
}

/** The occupied area over time; click or drag to move through it. */
function AreaChart({ history, pos, onSeek, label, lang }: { history: OccHistory; pos: number; onSeek: (p: number) => void; label: string; lang: 'uk' | 'en' }) {
  const frames = history.frames;
  const W = 1000;
  const H = 64;
  const top = 14;
  const areas = frames.map((f) => f.area);
  // The scale follows the weeks since April 2022; the line before the invasion sits at the bottom.
  const war = frames.filter((f) => !f.pre).map((f) => f.area);
  const max = Math.max(...war);
  const min = Math.min(...war);
  const lo = Math.max(0, min - (max - min) * 0.25);
  const x = (i: number) => (i / Math.max(1, frames.length - 1)) * W;
  const y = (a: number) => Math.min(H, top + (1 - (a - lo) / Math.max(1, max - lo)) * (H - top - 2));
  const line = areas.map((a, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(a).toFixed(1)}`).join('');
  const fill = `${line}L${W},${H}L0,${H}Z`;
  const ref = useRef<SVGSVGElement>(null);
  const seekAt = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = ref.current!.getBoundingClientRect();
    onSeek(((e.clientX - r.left) / r.width) * (frames.length - 1));
  };
  return (
    <div className="occ-chart">
    <svg
      ref={ref}
      className="occ-chart__svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekAt(e);
      }}
      onPointerMove={(e) => e.buttons && seekAt(e)}
    >
      <path d={fill} fill={OCC_COLORS.occupied} opacity={0.22} />
      <path d={line} fill="none" stroke={OCC_COLORS.occupied} strokeWidth={2} vectorEffect="non-scaling-stroke" />
      {OCC_EVENTS.map((ev) => {
        const i = frameAt(history, ev.date);
        if (frames[i].date > ev.date && i === 0) return null;
        return (
          <g key={ev.date} className="occ-chart__event">
            <line x1={x(i)} x2={x(i)} y1={top - 4} y2={H} />
            <title>{`${whenText({ from: ev.date }, lang)}: ${ev.label[lang]}`}</title>
          </g>
        );
      })}
      <line className="occ-chart__now" x1={x(pos)} x2={x(pos)} y1={0} y2={H} vectorEffect="non-scaling-stroke" />
    </svg>
      {OCC_EVENTS.map((ev, n) => {
        const i = frameAt(history, ev.date);
        return (
          <span key={ev.date} className={`occ-chart__label occ-chart__label--${n % 2}`} style={{ left: `${(x(i) / W) * 100}%` }} title={`${whenText({ from: ev.date }, lang)}: ${ev.label[lang]}`}>
            {ev.short[lang]}
          </span>
        );
      })}
    </div>
  );
}
