import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { trendBand, type Band, type Point, type TrendStats } from '../analysis/stats';
import { svgToPng, toCsv, yScale, type ChartHandle } from './chartExport';

export type { ChartHandle } from './chartExport';
export type ChartSeries = { id: 'A' | 'B'; name: string; points: Point[]; stats: TrendStats | null };
/** An event mark: drawn as a hairline with a short label, explained on hover. */
export type ChartMark = { year: number; label: string; detail: string; source?: { label: string; url: string } };

type Props = {
  series: ChartSeries[];
  unit: string;
  from: number;
  to: number;
  format: (v: number) => string;
  /** Years to carry each trend on after `to`, with its 95% range; 0 for none. */
  forecast: number;
  marks: ChartMark[];
  /** The year the globe shows, marked on the chart; clicking a year moves the globe there. */
  mapYear: number | null;
  onPickYear?: (year: number) => void;
  labels: { hint: string; noData: string; expected: string; range: string; onMap: string };
};

const HEIGHT = 260;
const PAD = { top: 46, right: 40, bottom: 28, left: 52 };

/**
 * The yearly chart: one line per region with its Theil-Sen trend dashed, the trend carried on
 * after the period with the 95% range for a single year, event marks, and a crosshair.
 */
export const Chart = forwardRef<ChartHandle, Props>(function Chart(props, ref) {
  const { series, unit, from, to, format, forecast, marks, mapYear, onPickYear, labels } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(360);
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => setWidth(Math.max(240, host.clientWidth)));
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const end = to + forecast;
  const inPeriod = useMemo(
    () => series.map((s) => ({ ...s, points: s.points.filter((p) => p.x >= from && p.x <= to) })),
    [series, from, to],
  );
  // The trend carried on: a band per region, year by year after `to`.
  const bands = useMemo(() => {
    const out = new Map<string, Band[]>();
    if (forecast <= 0) return out;
    for (const s of inPeriod) {
      if (!s.stats) continue;
      const list: Band[] = [];
      for (let yr = to; yr <= end; yr++) list.push(trendBand(s.stats, yr));
      out.set(s.id, list);
    }
    return out;
  }, [inPeriod, forecast, to, end]);

  const values = [
    ...inPeriod.flatMap((s) => s.points.map((p) => p.y)),
    ...[...bands.values()].flatMap((b) => b.slice(1).flatMap((x) => [x.low, x.high])),
  ];
  const scale = yScale(values);
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (yr: number) => PAD.left + ((yr - from) / Math.max(1, end - from)) * plotW;
  const y = (v: number) => PAD.top + (1 - (v - scale.min) / (scale.max - scale.min || 1)) * plotH;

  const span = end - from;
  const xStep = span > 80 ? 20 : span > 30 ? 10 : span > 12 ? 5 : 2;
  const xTicks: number[] = [];
  for (let yr = Math.ceil(from / xStep) * xStep; yr <= end; yr += xStep) xTicks.push(yr);

  const path = (pts: Point[]) => {
    let d = '';
    let pen = false;
    for (const p of pts) {
      if (!Number.isFinite(p.y)) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'}${x(p.x).toFixed(1)},${y(p.y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const area = (b: Band[]) =>
    `M${b.map((p) => `${x(p.x).toFixed(1)},${y(p.high).toFixed(1)}`).join('L')}L${[...b]
      .reverse()
      .map((p) => `${x(p.x).toFixed(1)},${y(p.low).toFixed(1)}`)
      .join('L')}Z`;

  // Event labels: each goes in the first of two rows where it does not overlap a neighbour; with
  // no room left only its line is drawn (hovering still explains it).
  const shownMarks = marks.filter((m) => m.year >= from && m.year <= end);
  const taken: [number, number][][] = [[], []];
  const placedMarks = shownMarks.map((m) => {
    const mx = x(m.year);
    const textW = m.label.length * 6.3 + 6;
    const anchor = mx + textW > width - 4 ? ('end' as const) : ('start' as const);
    const span: [number, number] = anchor === 'end' ? [mx - textW, mx] : [mx, mx + textW];
    const row = taken.findIndex((spans) => spans.every(([a, b]) => span[1] < a || span[0] > b));
    if (row >= 0) taken[row].push(span);
    return { ...m, mx, row, anchor };
  });

  useImperativeHandle(ref, () => ({
    toCsv() {
      const head = ['year', ...inPeriod.map((s) => `${s.id}: ${s.name} (${unit})`)];
      for (const s of inPeriod) if (bands.has(s.id)) head.push(`${s.id}: ${labels.expected}`, `${s.id}: ${labels.range} low`, `${s.id}: ${labels.range} high`);
      const rows: string[][] = [head];
      const num = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(4))) : '');
      for (let yr = from; yr <= end; yr++) {
        const row = [String(yr)];
        for (const s of inPeriod) row.push(yr <= to ? num(s.points.find((q) => q.x === yr)?.y ?? NaN) : '');
        for (const s of inPeriod) {
          const b = bands.get(s.id);
          if (!b) continue;
          const at = yr > to ? b.find((p) => p.x === yr) : undefined;
          row.push(at ? num(at.mid) : '', at ? num(at.low) : '', at ? num(at.high) : '');
        }
        rows.push(row);
      }
      return toCsv(rows);
    },
    toPng: (title) => (svgRef.current ? svgToPng(svgRef.current, width, HEIGHT, title) : Promise.resolve(null)),
  }));

  const yearAt = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * width;
    const yr = Math.round(from + ((px - PAD.left) / plotW) * (end - from));
    return yr >= from && yr <= end ? yr : null;
  };

  const hovered = hoverYear === null ? [] : inPeriod.map((s) => ({ s, p: s.points.find((p) => p.x === hoverYear) }));
  const hoverMark = hoverYear === null ? null : shownMarks.find((m) => m.year === hoverYear);
  const future = hoverYear !== null && hoverYear > to;

  return (
    <div className="chart" ref={hostRef}>
      <svg
        ref={svgRef}
        className={`chart__svg${onPickYear ? ' chart__svg--pick' : ''}`}
        width={width}
        height={HEIGHT}
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label={inPeriod.map((s) => s.name).join(', ')}
        onPointerMove={(e) => setHoverYear(yearAt(e))}
        onPointerLeave={() => setHoverYear(null)}
        onClick={(e) => {
          const yr = yearAt(e);
          if (yr !== null && yr <= to) onPickYear?.(yr);
        }}
      >
        {scale.ticks.map((v) => (
          <g key={v}>
            <line className="chart__grid" data-color="--color-star-rule" x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} />
            <text className="chart__tick" data-color="--color-haze" x={PAD.left - 8} y={y(v) + 4} textAnchor="end">
              {format(v)}
            </text>
          </g>
        ))}
        {xTicks.map((yr) => (
          <text key={yr} className="chart__tick" data-color="--color-haze" x={x(yr)} y={HEIGHT - 8} textAnchor="middle">
            {yr}
          </text>
        ))}
        <text className="chart__tick" data-color="--color-haze" x={4} y={12} textAnchor="start">
          {unit}
        </text>

        {forecast > 0 && (
          <rect className="chart__future" data-color="--color-star-rule" data-fill="1" x={x(to)} y={PAD.top} width={x(end) - x(to)} height={plotH} />
        )}

        {placedMarks.map((m) => (
          <g key={m.year} className="chart__mark">
            <line className="chart__mark-line" data-color="--color-star-muted" x1={m.mx} x2={m.mx} y1={PAD.top - 2} y2={HEIGHT - PAD.bottom} />
            {m.row >= 0 && (
              <text
                className="chart__mark-label"
                data-color="--color-star-deep"
                x={m.anchor === 'end' ? m.mx - 4 : m.mx + 4}
                y={27 + m.row * 13}
                textAnchor={m.anchor}
              >
                {m.label}
              </text>
            )}
          </g>
        ))}

        {mapYear !== null && mapYear >= from && mapYear <= to && (
          <line className="chart__map-year" data-color="--color-star" x1={x(mapYear)} x2={x(mapYear)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
        )}

        {inPeriod.map((s) => {
          const id = s.id.toLowerCase();
          const trend = s.stats;
          const band = bands.get(s.id);
          const last = [...s.points].reverse().find((p) => Number.isFinite(p.y));
          return (
            <g key={s.id}>
              {band && <path className={`chart__band chart__band--${id}`} data-color={`--color-series-${id}`} data-fill="1" d={area(band)} />}
              <path className={`chart__line chart__line--${id}`} data-color={`--color-series-${id}`} d={path(s.points)} />
              {trend && (
                <line
                  className={`chart__trend chart__trend--${id}`}
                  data-color={`--color-series-${id}`}
                  x1={x(from)}
                  x2={x(to)}
                  y1={y(trend.senIntercept + trend.sen * from)}
                  y2={y(trend.senIntercept + trend.sen * to)}
                />
              )}
              {band && (
                <line
                  className={`chart__trend chart__trend--ahead chart__trend--${id}`}
                  data-color={`--color-series-${id}`}
                  x1={x(to)}
                  x2={x(end)}
                  y1={y(band[0].mid)}
                  y2={y(band[band.length - 1].mid)}
                />
              )}
              {last && (
                <text className="chart__end" data-color="--color-star" x={x(band ? end : last.x) + 6} y={y(band ? band[band.length - 1].mid : last.y) + 4}>
                  {s.id}
                </text>
              )}
            </g>
          );
        })}

        {hoverYear !== null && (
          <g>
            <line className="chart__cross" data-color="--color-star-muted" x1={x(hoverYear)} x2={x(hoverYear)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
            {!future &&
              hovered.map(({ s, p }) =>
                p && Number.isFinite(p.y) ? (
                  <circle key={s.id} className={`chart__dot chart__dot--${s.id.toLowerCase()}`} cx={x(p.x)} cy={y(p.y)} r={4} />
                ) : null,
              )}
          </g>
        )}
      </svg>
      <p className="chart__readout" aria-live="off">
        {hoverYear === null ? (
          <span className="chart__hint">{labels.hint}</span>
        ) : (
          <>
            <strong>{hoverYear}</strong>
            {future
              ? inPeriod.map((s) => {
                  const b = bands.get(s.id)?.find((q) => q.x === hoverYear);
                  return (
                    <span key={s.id}>
                      {s.id}: {b ? `${labels.expected} ${format(b.mid)} ${unit} (${format(b.low)}…${format(b.high)})` : labels.noData}
                    </span>
                  );
                })
              : hovered.map(({ s, p }) => (
                  <span key={s.id}>
                    {s.id}: {p && Number.isFinite(p.y) ? `${format(p.y)} ${unit}` : labels.noData}
                  </span>
                ))}
            {hoverYear === mapYear && <span className="chart__hint">{labels.onMap}</span>}
            {hoverMark && <span className="chart__event">{hoverMark.detail}</span>}
          </>
        )}
      </p>
    </div>
  );
});
