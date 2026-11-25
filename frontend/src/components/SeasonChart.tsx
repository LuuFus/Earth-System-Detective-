import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { MonthlyRow } from '../analysis/series';
import { clampTo } from '../analysis/facts';
import { forecastAt, type Band } from '../analysis/stats';
import { svgToPng, toCsv, yScale, type ChartHandle } from './chartExport';

type Props = {
  rows: MonthlyRow[];
  slot: 'A' | 'B';
  from: number;
  to: number;
  unit: string;
  format: (v: number) => string;
  /** Show the expected next year (each month's trend carried on one year, with its 95% range). */
  forecast: boolean;
  /** Draw these years (the latest ones with data when left out). */
  years?: number[];
  /** Values the quantity can never pass: the expected range keeps inside. */
  bounds?: { min?: number; max?: number };
  labels: {
    months: string[];
    mean: (from: number, to: number) => string;
    expected: (year: number) => string;
    noData: string;
    hint: string;
  };
};

const HEIGHT = 260;
const PAD = { top: 20, right: 44, bottom: 28, left: 52 };
const YEARS_SHOWN = 4;

/**
 * Months along the bottom, one line per recent year (one hue, brighter for newer years), the mean
 * of the whole period, and the expected next year: each month's trend over the period carried on
 * one year, with the 95% range for that month.
 */
export const SeasonChart = forwardRef<ChartHandle, Props>(function SeasonChart(props, ref) {
  const { rows, slot, from, to, unit, format, forecast, labels, bounds } = props;
  const picked = props.years?.join(',') ?? '';
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(360);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => setWidth(Math.max(240, host.clientWidth)));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const model = useMemo(() => {
    const period = rows.filter((r) => r.year >= from && r.year <= to);
    const complete = period.filter((r) => r.values.filter(Number.isFinite).length >= 9);
    const wanted = picked ? picked.split(',').map(Number) : null;
    const years = wanted ? rows.filter((r) => wanted.includes(r.year)) : complete.slice(-YEARS_SHOWN);
    const mean = Array.from({ length: 12 }, (_, m) => {
      const v = period.map((r) => r.values[m]).filter(Number.isFinite);
      return v.length >= 5 ? v.reduce((a, b) => a + b, 0) / v.length : NaN;
    });
    const next: (Band | null)[] = forecast
      ? Array.from({ length: 12 }, (_, m) => {
          const b = forecastAt(period.map((r) => ({ x: r.year, y: r.values[m] })), to + 1);
          return b && { x: b.x, mid: clampTo(b.mid, bounds), low: clampTo(b.low, bounds), high: clampTo(b.high, bounds) };
        })
      : [];
    return { years, mean, next };
  }, [rows, from, to, forecast, picked, bounds]);

  const values = [
    ...model.years.flatMap((r) => r.values),
    ...model.mean,
    ...model.next.flatMap((b) => (b ? [b.low, b.high] : [])),
  ];
  const scale = yScale(values);
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (m: number) => PAD.left + (m / 11) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - scale.min) / (scale.max - scale.min || 1)) * plotH;
  const id = slot.toLowerCase();
  // Ramp steps 1..4, the newest year always the brightest.
  const step = (i: number) => Math.max(1, YEARS_SHOWN - (model.years.length - 1 - i));
  // Years picked one by one get a hue each, so any two can be told apart.
  const colour = (i: number) => (picked ? `--color-pick-${(i % 6) + 1}` : `--color-year-${id}-${step(i)}`);

  const line = (vals: number[]) => {
    let d = '';
    let pen = false;
    vals.forEach((v, m) => {
      if (!Number.isFinite(v)) {
        pen = false;
        return;
      }
      d += `${pen ? 'L' : 'M'}${x(m).toFixed(1)},${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  };
  const bands = model.next;
  const bandPath = bands.length === 12 && bands.every((b) => b)
    ? `M${bands.map((b, m) => `${x(m).toFixed(1)},${y(b!.high).toFixed(1)}`).join('L')}L${bands
        .map((b, m) => ({ b, m }))
        .reverse()
        .map(({ b, m }) => `${x(m).toFixed(1)},${y(b!.low).toFixed(1)}`)
        .join('L')}Z`
    : null;
  const nextYear = to + 1;

  useImperativeHandle(ref, () => ({
    toCsv() {
      const num = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(4))) : '');
      const head = ['month', ...model.years.map((r) => `${slot}: ${r.year} (${unit})`), `${slot}: ${labels.mean(from, to)}`];
      if (bandPath) head.push(`${slot}: ${labels.expected(nextYear)}`, `${slot}: 95% low`, `${slot}: 95% high`);
      const out: string[][] = [head];
      for (let m = 0; m < 12; m++) {
        const row = [labels.months[m], ...model.years.map((r) => num(r.values[m])), num(model.mean[m])];
        if (bandPath) row.push(num(bands[m]!.mid), num(bands[m]!.low), num(bands[m]!.high));
        out.push(row);
      }
      return toCsv(out);
    },
    toPng: (title) => (svgRef.current ? svgToPng(svgRef.current, width, HEIGHT, title) : Promise.resolve(null)),
  }));

  const monthAt = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const m = Math.round(((px - PAD.left) / plotW) * 11);
    return m >= 0 && m <= 11 ? m : null;
  };

  const latest = model.years[model.years.length - 1];
  return (
    <div className="chart" ref={hostRef}>
      <svg
        ref={svgRef}
        className="chart__svg"
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={`${labels.mean(from, to)}; ${model.years.map((r) => r.year).join(', ')}`}
        onPointerMove={(e) => setHover(monthAt(e))}
        onPointerLeave={() => setHover(null)}
      >
        {scale.ticks.map((v) => (
          <g key={v}>
            <line className="chart__grid" data-color="--color-star-rule" x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} />
            <text className="chart__tick" data-color="--color-haze" x={PAD.left - 8} y={y(v) + 4} textAnchor="end">
              {format(v)}
            </text>
          </g>
        ))}
        {labels.months.map((name, m) => (
          <text key={name} className="chart__tick" data-color="--color-haze" x={x(m)} y={HEIGHT - 8} textAnchor="middle">
            {name}
          </text>
        ))}
        <text className="chart__tick" data-color="--color-haze" x={4} y={12} textAnchor="start">
          {unit}
        </text>

        {bandPath && <path className={`chart__band chart__band--${id}`} data-color={`--color-series-${id}`} data-fill="1" d={bandPath} />}
        <path className="chart__mean" data-color="--color-haze" d={line(model.mean)} />
        {model.years.map((r, i) => (
          <path key={r.year} className="chart__year" data-color={colour(i)} style={{ stroke: `var(${colour(i)})` }} d={line(r.values)} />
        ))}
        {bandPath && <path className={`chart__trend chart__trend--ahead chart__trend--${id}`} data-color={`--color-series-${id}`} d={line(bands.map((b) => b!.mid))} />}
        {latest && Number.isFinite(latest.values[11]) && (
          <text className="chart__end" data-color="--color-star" x={x(11) + 6} y={y(latest.values[11]) + 4}>
            {latest.year}
          </text>
        )}

        {hover !== null && (
          <g>
            <line className="chart__cross" data-color="--color-star-muted" x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
            {model.years.map((r, i) =>
              Number.isFinite(r.values[hover]) ? (
                <circle key={r.year} className="chart__dot" style={{ fill: `var(${colour(i)})` }} cx={x(hover)} cy={y(r.values[hover])} r={4} />
              ) : null,
            )}
          </g>
        )}
      </svg>

      <ul className="chart__legend">
        {model.years.map((r, i) => (
          <li key={r.year}>
            <span className="chart__swatch" style={{ background: `var(${colour(i)})` }} aria-hidden="true" />
            {r.year}
          </li>
        ))}
        <li>
          <span className="chart__swatch chart__swatch--mean" aria-hidden="true" />
          {labels.mean(from, to)}
        </li>
        {bandPath && (
          <li>
            <span className={`chart__swatch chart__swatch--ahead chart__swatch--${id}`} aria-hidden="true" />
            {labels.expected(nextYear)}
          </li>
        )}
      </ul>

      <p className="chart__readout" aria-live="off">
        {hover === null ? (
          <span className="chart__hint">{labels.hint}</span>
        ) : (
          <>
            <strong>{labels.months[hover]}</strong>
            {model.years.map((r) => (
              <span key={r.year}>
                {r.year}: {Number.isFinite(r.values[hover]) ? `${format(r.values[hover])} ${unit}` : labels.noData}
              </span>
            ))}
            <span>
              {labels.mean(from, to)}: {Number.isFinite(model.mean[hover]) ? `${format(model.mean[hover])} ${unit}` : labels.noData}
            </span>
            {bandPath && (
              <span>
                {labels.expected(nextYear)}: {format(bands[hover]!.mid)} ({format(bands[hover]!.low)}…{format(bands[hover]!.high)})
              </span>
            )}
          </>
        )}
      </p>
    </div>
  );
});
