import { useEffect, useId, useRef, useState } from 'react';
import { useLiveText } from '../../i18n/live';
import { useStudio } from '../../i18n/useStudio';
import { JellySlider } from '../ui/JellySlider';
import { Icon } from './Icon';

/** Round years for the marks under a year slider: every 10, 20, 25 or 50 years. */
function yearMarks([a, b]: [number, number]): { majors: number[]; minor: number } {
  const span = b - a;
  const step = span <= 30 ? 5 : span <= 60 ? 10 : span <= 120 ? 20 : 25;
  const majors: number[] = [];
  for (let y = Math.ceil(a / step) * step; y <= b; y += step) majors.push(y);
  return { majors, minor: step / 5 >= 1 ? step / 5 : 0 };
}

type Props = {
  /** Map year slider: shown when the layer changes with the year. */
  year: number | null;
  yearRange: [number, number];
  month: number | null;
  /** Period for trends, comparisons and the chart. */
  from: number;
  to: number;
  periodRange: [number, number];
  playing: boolean;
  speed: 1 | 2 | 4;
  canPlay: boolean;
  /** Before/after shutter: the left year, or null when off. */
  compare: number | null;
  onCompare: (year: number | null) => void;
  /** Left year to start the shutter with. */
  compareStart: number;
  onYear: (year: number) => void;
  onMonth: (month: number) => void;
  onPeriod: (from: number, to: number) => void;
  onPlay: (on: boolean) => void;
  onSpeed: (speed: 1 | 2 | 4) => void;
  /** Playback runs from this year to the last one. */
  playFrom: number;
  onPlayFrom: (year: number) => void;
  /** Show the analysis period (it only matters for the analysis and the temperature trend). */
  showPeriod: boolean;
};

/** Bottom bar: play the years, pick the map year and the analysis period. */
export function Timeline(p: Props) {
  const t = useStudio().timeline;
  const lt = useLiveText().timeline;
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('timeline-collapsed') === '1');
  const collapse = (on: boolean) => {
    localStorage.setItem('timeline-collapsed', on ? '1' : '0');
    setCollapsed(on);
  };
  const fromId = useId();
  const yearId = useId();
  const leftId = useId();
  const monthId = useId();
  const comparing = p.compare !== null && p.year !== null;
  // The bar wraps to two rows when space is short; panels above it size themselves to its real height.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = el.closest<HTMLElement>('.studio');
    const observer = new ResizeObserver(() => root?.style.setProperty('--timeline-real', `${el.offsetHeight}px`));
    observer.observe(el);
    return () => {
      observer.disconnect();
      root?.style.removeProperty('--timeline-real');
    };
  }, [collapsed]);
  const [min, max] = p.periodRange;
  const span = Math.max(1, max - min);
  const nextSpeed = (p.speed === 1 ? 2 : p.speed === 2 ? 4 : 1) as 1 | 2 | 4;
  const marks = yearMarks(p.yearRange);

  const years: number[] = [];
  for (let y = p.yearRange[0]; y < p.yearRange[1]; y++) years.push(y);

  if (collapsed) {
    return (
      <section ref={ref} className="timeline timeline--collapsed" aria-label={t.label}>
        {p.canPlay && !comparing && (
          <button type="button" className="play-btn play-btn--small" aria-label={p.playing ? t.pause : t.play} onClick={() => p.onPlay(!p.playing)}>
            <Icon name={p.playing ? 'pause' : 'play'} size={18} />
          </button>
        )}
        <output className="timeline__value">{p.year ?? `${p.from}-${p.to}`}</output>
        <button type="button" className="icon-btn icon-btn--bare icon-btn--small" aria-label={lt.expand} title={lt.expand} onClick={() => collapse(false)}>
          <Icon name="expand" size={16} />
        </button>
      </section>
    );
  }

  return (
    <section ref={ref} className="timeline" aria-label={t.label}>
      {p.canPlay && !comparing && (
        <div className="timeline__play">
          <button type="button" className="play-btn" aria-label={p.playing ? t.pause : t.play} onClick={() => p.onPlay(!p.playing)}>
            <Icon name={p.playing ? 'pause' : 'play'} />
          </button>
          <button type="button" className="speed-btn" aria-label={`${t.speed}: ${p.speed}×`} onClick={() => p.onSpeed(nextSpeed)}>
            {p.speed}×
          </button>
          <label className="timeline__label" htmlFor={fromId}>
            {lt.from}
          </label>
          <select id={fromId} className="timeline__select" value={p.playFrom} onChange={(e) => p.onPlayFrom(Number(e.target.value))} title={lt.fromTitle(p.yearRange[1])}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {p.year !== null && (
        <button
          type="button"
          className="chip-btn timeline__compare"
          aria-pressed={comparing}
          onClick={() => p.onCompare(comparing ? null : p.compareStart)}
        >
          <Icon name="split" size={16} />
          <span>{t.compare}</span>
        </button>
      )}

      {comparing && (
        <div className="timeline__group">
          <span className="timeline__label" id={leftId}>
            {t.left}
          </span>
          <JellySlider
            className="timeline__jelly"
            min={p.yearRange[0]}
            max={p.yearRange[1]}
            value={p.compare!}
            onChange={(y) => p.onCompare(y)}
            label={t.left}
            majors={marks.majors}
            minorStep={marks.minor}
          />
          <output className="timeline__value">
            {p.compare}
          </output>
        </div>
      )}

      {p.year !== null && (
        <div className="timeline__group">
          <span className="timeline__label" id={yearId}>
            {comparing ? t.right : t.year}
          </span>
          <JellySlider
            className="timeline__jelly"
            min={p.yearRange[0]}
            max={p.yearRange[1]}
            value={p.year}
            onChange={(y) => p.onYear(y)}
            label={comparing ? t.right : t.year}
            majors={marks.majors}
            minorStep={marks.minor}
          />
          <output className="timeline__value">
            {p.year}
          </output>
          {p.month !== null && (
            <>
              <label className="visually-hidden" htmlFor={monthId}>
                {t.month}
              </label>
              <select id={monthId} className="timeline__select" value={p.month} onChange={(e) => p.onMonth(Number(e.target.value))}>
                {t.months.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      )}

      {p.showPeriod && (
      <div className="timeline__group timeline__group--period" title={lt.periodTitle}>
        <span className="timeline__label">{lt.period}</span>
        <div className="range2" style={{ ['--a' as string]: (p.from - min) / span, ['--b' as string]: (p.to - min) / span }}>
          <span className="range2__fill" aria-hidden="true" />
          <input
            className="range2__input"
            type="range"
            min={min}
            max={max}
            step={1}
            value={p.from}
            aria-label={t.from}
            onChange={(e) => p.onPeriod(Math.min(Number(e.target.value), p.to - 1), p.to)}
          />
          <input
            className="range2__input"
            type="range"
            min={min}
            max={max}
            step={1}
            value={p.to}
            aria-label={t.to}
            onChange={(e) => p.onPeriod(p.from, Math.max(Number(e.target.value), p.from + 1))}
          />
        </div>
        <output className="timeline__value timeline__value--wide">
          {p.from}-{p.to}
        </output>
      </div>
      )}
      <button type="button" className="icon-btn icon-btn--bare icon-btn--small timeline__collapse" aria-label={lt.collapse} title={lt.collapse} onClick={() => collapse(true)}>
        <Icon name="minus" size={16} />
      </button>
    </section>
  );
}
