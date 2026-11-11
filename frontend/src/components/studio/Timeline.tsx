import { useEffect, useId, useRef } from 'react';
import { useStudio } from '../../i18n/useStudio';
import { Icon } from './Icon';

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
};

/** Bottom bar: play the years, pick the map year and the analysis period. */
export function Timeline(p: Props) {
  const t = useStudio().timeline;
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
  }, []);
  const [min, max] = p.periodRange;
  const span = Math.max(1, max - min);
  const nextSpeed = (p.speed === 1 ? 2 : p.speed === 2 ? 4 : 1) as 1 | 2 | 4;

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
          <label className="timeline__label" htmlFor={leftId}>
            {t.left}
          </label>
          <input
            id={leftId}
            className="timeline__range"
            type="range"
            min={p.yearRange[0]}
            max={p.yearRange[1]}
            step={1}
            value={p.compare!}
            onChange={(e) => p.onCompare(Number(e.target.value))}
          />
          <output className="timeline__value" htmlFor={leftId}>
            {p.compare}
          </output>
        </div>
      )}

      {p.year !== null && (
        <div className="timeline__group">
          <label className="timeline__label" htmlFor={yearId}>
            {comparing ? t.right : t.year}
          </label>
          <input
            id={yearId}
            className="timeline__range"
            type="range"
            min={p.yearRange[0]}
            max={p.yearRange[1]}
            step={1}
            value={p.year}
            onChange={(e) => p.onYear(Number(e.target.value))}
          />
          <output className="timeline__value" htmlFor={yearId}>
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

      <div className="timeline__group timeline__group--period">
        <span className="timeline__label">{t.period}</span>
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
            onChange={(e) => p.onPeriod(Math.min(Number(e.target.value), p.to - 5), p.to)}
          />
          <input
            className="range2__input"
            type="range"
            min={min}
            max={max}
            step={1}
            value={p.to}
            aria-label={t.to}
            onChange={(e) => p.onPeriod(p.from, Math.max(Number(e.target.value), p.from + 5))}
          />
        </div>
        <output className="timeline__value timeline__value--wide">
          {p.from}-{p.to}
        </output>
      </div>
    </section>
  );
}
