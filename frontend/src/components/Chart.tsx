import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clampTo } from '../analysis/facts';
import { trendBand, type Band, type Point, type TrendStats } from '../analysis/stats';
import { svgToPng, toCsv, yScale, type ChartHandle } from './chartExport';

export type { ChartHandle } from './chartExport';
export type ChartSeries = { id: 'A' | 'B'; name: string; points: Point[]; stats: TrendStats | null };
/** An event mark: drawn as a hairline with a short label, explained on hover. */
export type ChartMark = { year: number; label: string; detail: string; source?: { label: string; url: string } };
export type Resolution = 'year' | 'month' | 'day';

type Labels = {
  hint: string;
  noData: string;
  expected: string;
  range: string;
  onMap: string;
  monthsShort: string[];
  zoomIn: string;
  zoomOut: string;
  reset: string;
  expand: string;
  collapse: string;
  navigator: string;
  zoomed: (a: string, b: string) => string;
  /** Legend entry for the dashed line. */
  trend: string;
};

type Props = {
  series: ChartSeries[];
  unit: string;
  from: number;
  to: number;
  resolution: Resolution;
  format: (v: number) => string;
  /** Years to carry each trend on after `to`, with its 95% range; 0 for none (years only). */
  forecast: number;
  /** Values the quantity can never pass (no negative fires): the carried-on band keeps inside. */
  bounds?: { min?: number; max?: number };
  marks: ChartMark[];
  /** The year the globe shows, marked on the chart; clicking a value moves the globe there. */
  mapYear: number | null;
  onPickYear?: (year: number, month?: number) => void;
  labels: Labels;
};

const HEIGHT = 260;
const NAV_H = 46;
const PAD = { top: 46, right: 40, bottom: 28, left: 52 };
/** Narrowest window per resolution, in years: 3 years, 6 months, 2 weeks. */
const MIN_SPAN: Record<Resolution, number> = { year: 3, month: 0.5, day: 14 / 365 };

/** Index of the point nearest to x in points sorted by x. */
function nearest(points: Point[], x: number): number {
  let lo = 0;
  let hi = points.length - 1;
  if (hi < 0) return -1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].x < x) lo = mid;
    else hi = mid;
  }
  return Math.abs(points[lo].x - x) <= Math.abs(points[hi].x - x) ? lo : hi;
}

/** Calendar date of a fractional year. */
function toDate(x: number): Date {
  const year = Math.floor(x);
  const start = Date.UTC(year, 0, 1);
  return new Date(start + (x - year) * (Date.UTC(year + 1, 0, 1) - start));
}

function fromDate(year: number, month: number, day = 1): number {
  const start = Date.UTC(year, 0, 1);
  return year + (Date.UTC(year, month, day) - start) / (Date.UTC(year + 1, 0, 1) - start);
}

/** Tick marks for a window: years, months or days, as many as fit. */
function ticksFor(v0: number, v1: number, plotW: number, months: string[]): { x: number; label: string }[] {
  const span = v1 - v0;
  const fit = Math.max(2, Math.floor(plotW / 64));
  const out: { x: number; label: string }[] = [];
  if (span / fit >= 0.75) {
    const step = [1, 2, 5, 10, 20, 25, 50].find((s) => span / s <= fit) ?? 50;
    for (let y = Math.ceil(v0 / step) * step; y <= v1; y += step) out.push({ x: y, label: String(y) });
    return out;
  }
  if (span / fit >= 12 / 365) {
    const step = [1, 2, 3, 6].find((s) => (span * 12) / s <= fit) ?? 6;
    const d0 = toDate(v0);
    let y = d0.getUTCFullYear();
    let m = Math.ceil((d0.getUTCMonth() + (d0.getUTCDate() > 1 ? 1 : 0)) / step) * step;
    for (let guard = 0; guard < 400; guard++) {
      while (m > 11) {
        m -= 12;
        y++;
      }
      const x = fromDate(y, m);
      if (x > v1) break;
      out.push({ x, label: m === 0 ? String(y) : `${months[m]} ${String(y).slice(2)}` });
      m += step;
    }
    return out;
  }
  const stepDays = [1, 2, 7, 14].find((s) => (span * 365) / s <= fit) ?? 14;
  const d0 = toDate(v0);
  let t = Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), d0.getUTCDate() + 1);
  // Weekly ticks fall on Mondays; fortnightly ones on every other Monday.
  let mondays = 0;
  for (let guard = 0; guard < 400; guard++) {
    const d = new Date(t);
    const x = fromDate(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
    if (x > v1) break;
    const monday = d.getUTCDay() === 1;
    if (stepDays < 7 || (monday && mondays++ % (stepDays / 7) === 0)) out.push({ x, label: `${d.getUTCDate()} ${months[d.getUTCMonth()]}` });
    t += 86_400_000 * (stepDays < 7 ? stepDays : 1);
  }
  return out;
}

/**
 * The time-series chart: one line per region with its trend dashed, the trend carried on after
 * the period (years only), event marks, a crosshair, and zoom: wheel or buttons to zoom, drag
 * to pan, the strip below to pick the window, double click to see it all, and a full-screen view.
 */
export const Chart = forwardRef<ChartHandle, Props>(function Chart(props, ref) {
  const { series, unit, from, to, resolution, format, marks, mapYear, onPickYear, labels, bounds } = props;
  const forecast = resolution === 'year' ? props.forecast : 0;
  const hostRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 360, h: HEIGHT });
  const [expanded, setExpanded] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const start = from;
  const end = resolution === 'year' ? to + forecast : to + 1;
  const [view, setView] = useState<[number, number]>([start, end]);
  // A new period or resolution shows everything again.
  useEffect(() => setView([start, end]), [start, end, resolution]);
  const [v0, v1] = view;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(() => {
      const w = Math.max(240, host.clientWidth);
      const h = expanded ? Math.max(300, host.clientHeight - NAV_H - 120) : HEIGHT;
      setSize({ w, h });
    });
    observer.observe(host);
    return () => observer.disconnect();
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setExpanded(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded]);

  const { w: width, h: height } = size;
  const plotW = width - PAD.left - PAD.right;
  const plotH = height - PAD.top - PAD.bottom;

  const sorted = useMemo(() => series.map((s) => ({ ...s, points: [...s.points].sort((a, b) => a.x - b.x) })), [series]);

  // The trend carried on: a band per region, year by year after `to`.
  const bands = useMemo(() => {
    const out = new Map<string, Band[]>();
    if (forecast <= 0) return out;
    for (const s of sorted) {
      if (!s.stats) continue;
      const list: Band[] = [];
      for (let yr = to; yr <= end; yr++) {
        const b = trendBand(s.stats, yr);
        list.push({ x: b.x, mid: clampTo(b.mid, bounds), low: clampTo(b.low, bounds), high: clampTo(b.high, bounds) });
      }
      out.set(s.id, list);
    }
    return out;
  }, [sorted, forecast, to, end, bounds]);

  const visible = sorted.map((s) => s.points.filter((p) => p.x >= v0 && p.x <= v1));
  const values = [
    ...visible.flatMap((pts) => pts.map((p) => p.y)),
    ...[...bands.values()].flatMap((b) => b.filter((x) => x.x >= v0 && x.x <= v1).slice(1).flatMap((x) => [x.low, x.high])),
  ];
  const scale = yScale(values);
  const x = useCallback((t: number) => PAD.left + ((t - v0) / Math.max(1e-9, v1 - v0)) * plotW, [v0, v1, plotW]);
  const y = (v: number) => PAD.top + (1 - (v - scale.min) / (scale.max - scale.min || 1)) * plotH;
  const xTicks = ticksFor(v0, v1, plotW, labels.monthsShort);

  const path = (pts: Point[]) => {
    let d = '';
    let pen = false;
    // Thin out to about two points a pixel: a 16 000-day line draws the same and stays fast.
    const stride = Math.max(1, Math.floor(pts.length / (plotW * 2)));
    for (let i = 0; i < pts.length; i += stride) {
      const p = pts[i];
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
  const shownMarks = marks.filter((m) => m.year >= v0 && m.year <= v1);
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

  // ---------- Zoom and pan ----------
  const full = end - start;
  const minSpan = Math.min(full, MIN_SPAN[resolution]);
  const clampView = useCallback(
    (a: number, b: number): [number, number] => {
      let span = Math.min(full, Math.max(minSpan, b - a));
      let lo = a;
      if (b - a !== span) lo = (a + b) / 2 - span / 2;
      lo = Math.min(Math.max(lo, start), end - span);
      span = Math.min(span, end - lo);
      return [lo, lo + span];
    },
    [full, minSpan, start, end],
  );
  const zoomAt = useCallback(
    (centre: number, factor: number) => {
      setView(([a, b]) => {
        const span = b - a;
        const next = Math.min(full, Math.max(minSpan, span * factor));
        const t = (centre - a) / span;
        return clampView(centre - t * next, centre - t * next + next);
      });
    },
    [full, minSpan, clampView],
  );
  const zoomed = v1 - v0 < full - 1e-6;

  const xAt = (clientX: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * width;
    return v0 + ((px - PAD.left) / plotW) * (v1 - v0);
  };

  // Wheel zoom needs a non-passive listener so the page does not scroll instead.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * width;
      const at = v0 + ((px - PAD.left) / plotW) * (v1 - v0);
      zoomAt(Math.min(v1, Math.max(v0, at)), Math.exp(e.deltaY * 0.0016));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [v0, v1, width, plotW, zoomAt, expanded]);

  const drag = useRef<{ x: number; v: [number, number]; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, v: [v0, v1], moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (d) {
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 4) d.moved = true;
      if (d.moved) {
        const rect = e.currentTarget.getBoundingClientRect();
        const shift = (-dx / ((rect.width / width) * plotW)) * (d.v[1] - d.v[0]);
        setView(clampView(d.v[0] + shift, d.v[1] + shift));
        return;
      }
    }
    const at = xAt(e.clientX);
    setHoverX(at >= v0 && at <= v1 ? at : null);
  };
  const onUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved || !onPickYear) return;
    const at = xAt(e.clientX);
    if (at < start || at > to + (resolution === 'year' ? 0 : 1)) return;
    if (resolution === 'year') onPickYear(Math.round(at));
    else onPickYear(Math.floor(at), toDate(at).getUTCMonth() + 1);
  };
  const onKey = (e: React.KeyboardEvent) => {
    const span = v1 - v0;
    if (e.key === '+' || e.key === '=') zoomAt((v0 + v1) / 2, 0.7);
    else if (e.key === '-' || e.key === '_') zoomAt((v0 + v1) / 2, 1 / 0.7);
    else if (e.key === 'ArrowLeft') setView(clampView(v0 - span * 0.15, v1 - span * 0.15));
    else if (e.key === 'ArrowRight') setView(clampView(v0 + span * 0.15, v1 + span * 0.15));
    else if (e.key === '0') setView([start, end]);
    else return;
    e.preventDefault();
  };

  // ---------- Hover ----------
  const snap = (s: { points: Point[] }) => {
    if (hoverX === null || !s.points.length) return null;
    const i = nearest(s.points, resolution === 'year' ? Math.round(hoverX) : hoverX);
    const p = s.points[i];
    const step = resolution === 'year' ? 0.5 : resolution === 'month' ? 1 / 24 + 0.01 : 1 / 365 + 0.002;
    return Math.abs(p.x - hoverX) <= Math.max(step, (v1 - v0) / plotW * 3) ? p : null;
  };
  const future = hoverX !== null && resolution === 'year' && Math.round(hoverX) > to;
  const hovered = sorted.map((s) => ({ s, p: future ? null : snap(s) }));
  const anchorX = hoverX === null ? null : future ? Math.round(hoverX) : (hovered.find((h) => h.p)?.p?.x ?? hoverX);
  const hoverYear = anchorX === null ? null : Math.floor(resolution === 'year' ? Math.round(anchorX) : anchorX);
  const hoverMark = hoverYear === null ? null : shownMarks.find((m) => m.year === hoverYear);

  const dateLabel = (t: number) => {
    if (resolution === 'year') return String(Math.round(t));
    const d = toDate(t);
    const m = labels.monthsShort[d.getUTCMonth()];
    return resolution === 'month' ? `${m} ${d.getUTCFullYear()}` : `${d.getUTCDate()} ${m} ${d.getUTCFullYear()}`;
  };

  // Dots on every value once they are far enough apart to read, as on a classic data plot.
  const dense = Math.max(...visible.map((pts) => pts.length), 0);
  const showDots = dense > 0 && plotW / dense >= 5;

  useImperativeHandle(ref, () => ({
    toCsv() {
      const num = (v: number) => (Number.isFinite(v) ? String(Number(v.toFixed(4))) : '');
      if (resolution !== 'year') {
        const head = [resolution === 'month' ? 'month' : 'date', ...sorted.map((s) => `${s.id}: ${s.name} (${unit})`)];
        const keys = new Map<string, string[]>();
        const iso = (t: number) => {
          const d = toDate(t);
          const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
          return resolution === 'month' ? ym : `${ym}-${String(d.getUTCDate()).padStart(2, '0')}`;
        };
        sorted.forEach((s, i) =>
          s.points.forEach((p) => {
            const k = iso(p.x);
            const row = keys.get(k) ?? sorted.map(() => '');
            row[i] = num(p.y);
            keys.set(k, row);
          }),
        );
        return toCsv([head, ...[...keys.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, row]) => [k, ...row])]);
      }
      const head = ['year', ...sorted.map((s) => `${s.id}: ${s.name} (${unit})`)];
      for (const s of sorted) if (bands.has(s.id)) head.push(`${s.id}: ${labels.expected}`, `${s.id}: ${labels.range} low`, `${s.id}: ${labels.range} high`);
      const rows: string[][] = [head];
      for (let yr = from; yr <= end; yr++) {
        const row = [String(yr)];
        for (const s of sorted) row.push(yr <= to ? num(s.points.find((q) => q.x === yr)?.y ?? NaN) : '');
        for (const s of sorted) {
          const b = bands.get(s.id);
          if (!b) continue;
          const at = yr > to ? b.find((p) => p.x === yr) : undefined;
          row.push(at ? num(at.mid) : '', at ? num(at.low) : '', at ? num(at.high) : '');
        }
        rows.push(row);
      }
      return toCsv(rows);
    },
    toPng: (title) => (svgRef.current ? svgToPng(svgRef.current, width, height, title) : Promise.resolve(null)),
  }));

  // ---------- Navigator strip ----------
  const navRef = useRef<SVGSVGElement>(null);
  const navX = (t: number) => PAD.left + ((t - start) / Math.max(1e-9, full)) * plotW;
  const navAll = sorted.flatMap((s) => s.points.map((p) => p.y)).filter(Number.isFinite);
  const navMin = navAll.length ? Math.min(...navAll) : 0;
  const navMax = navAll.length ? Math.max(...navAll) : 1;
  const navY = (v: number) => 4 + (1 - (v - navMin) / (navMax - navMin || 1)) * (NAV_H - 8);
  const navPath = (pts: Point[]) => {
    let d = '';
    let pen = false;
    const stride = Math.max(1, Math.floor(pts.length / plotW));
    for (let i = 0; i < pts.length; i += stride) {
      const p = pts[i];
      if (!Number.isFinite(p.y)) {
        pen = false;
        continue;
      }
      d += `${pen ? 'L' : 'M'}${navX(p.x).toFixed(1)},${navY(p.y).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  const navDrag = useRef<{ x: number; v: [number, number]; mode: 'move' | 'left' | 'right' } | null>(null);
  const navToT = (clientX: number) => {
    const rect = navRef.current!.getBoundingClientRect();
    return start + ((((clientX - rect.left) / rect.width) * width - PAD.left) / plotW) * full;
  };
  const onNavDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const t = navToT(e.clientX);
    const rect = navRef.current!.getBoundingClientRect();
    const edge = ((v1 - v0) / full) * plotW * (rect.width / width) < 24 ? 0 : (6 / ((rect.width / width) * plotW)) * full;
    let mode: 'move' | 'left' | 'right' = 'move';
    if (edge && Math.abs(t - v0) <= edge) mode = 'left';
    else if (edge && Math.abs(t - v1) <= edge) mode = 'right';
    else if (t < v0 || t > v1) {
      const span = v1 - v0;
      const next = clampView(t - span / 2, t + span / 2);
      setView(next);
      navDrag.current = { x: e.clientX, v: next, mode: 'move' };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }
    navDrag.current = { x: e.clientX, v: [v0, v1], mode };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onNavMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = navDrag.current;
    if (!d) return;
    const rect = navRef.current!.getBoundingClientRect();
    const dt = ((e.clientX - d.x) / ((rect.width / width) * plotW)) * full;
    if (d.mode === 'move') setView(clampView(d.v[0] + dt, d.v[1] + dt));
    else if (d.mode === 'left') setView(clampView(Math.min(d.v[0] + dt, d.v[1] - minSpan), d.v[1]));
    else setView(clampView(d.v[0], Math.max(d.v[1] + dt, d.v[0] + minSpan)));
  };

  const clipId = `plot-${resolution}-${from}-${to}`;
  const trendEnd = resolution === 'year' ? to : to + 1;

  const body = (
    <div className={`chart${expanded ? ' chart--expanded' : ''}`} ref={hostRef}>
      <ul className="chart__legend chart__legend--series">
        {sorted.map((s) => (
          <li key={s.id}>
            <span className={`chart__key chart__key--${s.id.toLowerCase()}`} aria-hidden="true" />
            <strong>{s.id}</strong> {s.name}
          </li>
        ))}
        <li>
          <span className="chart__swatch chart__swatch--trend" aria-hidden="true" />
          {labels.trend}
        </li>
      </ul>
      <div className="chart__tools">
        <span className="chart__window">{zoomed ? labels.zoomed(dateLabel(v0), dateLabel(v1)) : ''}</span>
        <button type="button" className="chart__tool" aria-label={labels.zoomIn} title={labels.zoomIn} onClick={() => zoomAt((v0 + v1) / 2, 0.6)}>
          +
        </button>
        <button type="button" className="chart__tool" aria-label={labels.zoomOut} title={labels.zoomOut} onClick={() => zoomAt((v0 + v1) / 2, 1 / 0.6)} disabled={!zoomed}>
          −
        </button>
        <button type="button" className="chart__tool chart__tool--text" onClick={() => setView([start, end])} disabled={!zoomed}>
          {labels.reset}
        </button>
        <button type="button" className="chart__tool chart__tool--text" aria-pressed={expanded} onClick={() => setExpanded(!expanded)}>
          {expanded ? labels.collapse : labels.expand}
        </button>
      </div>
      <svg
        ref={svgRef}
        className={`chart__svg chart__svg--zoom${onPickYear ? ' chart__svg--pick' : ''}`}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        tabIndex={0}
        aria-label={`${sorted.map((s) => s.name).join(', ')}. ${labels.hint}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={() => setHoverX(null)}
        onDoubleClick={() => setView([start, end])}
        onKeyDown={onKey}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={PAD.left} y={PAD.top - 2} width={plotW} height={plotH + 4} />
          </clipPath>
        </defs>
        {scale.ticks.map((v) => (
          <g key={v}>
            <line className="chart__grid" data-color="--color-star-rule" x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} />
            <text className="chart__tick" data-color="--color-haze" x={PAD.left - 8} y={y(v) + 4} textAnchor="end">
              {format(v)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={t.x}>
            <line className="chart__grid chart__grid--x" data-color="--color-star-rule" x1={x(t.x)} x2={x(t.x)} y1={height - PAD.bottom} y2={height - PAD.bottom + 4} />
            <text className="chart__tick" data-color="--color-haze" x={x(t.x)} y={height - 8} textAnchor="middle">
              {t.label}
            </text>
          </g>
        ))}
        <text className="chart__tick" data-color="--color-haze" x={4} y={12} textAnchor="start">
          {unit}
        </text>

        <g clipPath={`url(#${clipId})`}>
          {forecast > 0 && (
            <rect className="chart__future" data-color="--color-star-rule" data-fill="1" x={x(to)} y={PAD.top} width={Math.max(0, x(end) - x(to))} height={plotH} />
          )}

          {placedMarks.map((m) => (
            <line key={m.year} className="chart__mark-line" data-color="--color-star-muted" x1={m.mx} x2={m.mx} y1={PAD.top - 2} y2={height - PAD.bottom} />
          ))}

          {mapYear !== null && mapYear >= from && mapYear <= to && (
            <line
              className="chart__map-year"
              data-color="--color-star"
              x1={x(resolution === 'year' ? mapYear : mapYear + 0.5)}
              x2={x(resolution === 'year' ? mapYear : mapYear + 0.5)}
              y1={PAD.top}
              y2={height - PAD.bottom}
            />
          )}

          {sorted.map((s, i) => {
            const id = s.id.toLowerCase();
            const trend = s.stats;
            const band = bands.get(s.id);
            return (
              <g key={s.id}>
                {band && <path className={`chart__band chart__band--${id}`} data-color={`--color-series-${id}`} data-fill="1" d={area(band)} />}
                <path className={`chart__line chart__line--${id}${resolution === 'day' ? ' chart__line--thin' : ''}`} data-color={`--color-series-${id}`} d={path(visible[i])} />
                {showDots &&
                  visible[i].map((p) =>
                    Number.isFinite(p.y) ? <circle key={p.x} className={`chart__pt chart__pt--${id}`} data-color={`--color-series-${id}`} data-fill="1" cx={x(p.x)} cy={y(p.y)} r={2.2} /> : null,
                  )}
                {trend && (
                  <line
                    className={`chart__trend chart__trend--${id}`}
                    data-color={`--color-series-${id}`}
                    x1={x(from)}
                    x2={x(trendEnd)}
                    y1={y(trend.senIntercept + trend.sen * from)}
                    y2={y(trend.senIntercept + trend.sen * trendEnd)}
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
              </g>
            );
          })}

          {anchorX !== null && (
            <g>
              <line className="chart__cross" data-color="--color-star-muted" x1={x(anchorX)} x2={x(anchorX)} y1={PAD.top} y2={height - PAD.bottom} />
              {hovered.map(({ s, p }) =>
                p && Number.isFinite(p.y) ? <circle key={s.id} className={`chart__dot chart__dot--${s.id.toLowerCase()}`} cx={x(p.x)} cy={y(p.y)} r={4} /> : null,
              )}
            </g>
          )}
        </g>

        {placedMarks.map((m) =>
          m.row >= 0 ? (
            <text
              key={m.year}
              className="chart__mark-label"
              data-color="--color-star-deep"
              x={m.anchor === 'end' ? m.mx - 4 : m.mx + 4}
              y={27 + m.row * 13}
              textAnchor={m.anchor}
            >
              {m.label}
            </text>
          ) : null,
        )}

        {(() => {
          // The A and B tags at the right end, pushed apart when they would overlap.
          const tags = sorted
            .map((s, i) => {
              const last = [...visible[i]].reverse().find((p) => Number.isFinite(p.y));
              const band = bands.get(s.id);
              const atEnd = band && v1 >= end - 1e-6;
              if (!last && !atEnd) return null;
              return {
                id: s.id,
                tx: atEnd ? x(end) + 6 : Math.min(width - PAD.right + 6, x(last!.x) + 6),
                ty: atEnd ? y(band![band!.length - 1].mid) + 4 : y(last!.y) + 4,
              };
            })
            .filter((t) => t !== null);
          if (tags.length === 2 && Math.abs(tags[0].ty - tags[1].ty) < 13) {
            const [hiTag, loTag] = tags[0].ty <= tags[1].ty ? [tags[0], tags[1]] : [tags[1], tags[0]];
            const mid = (hiTag.ty + loTag.ty) / 2;
            hiTag.ty = mid - 6.5;
            loTag.ty = mid + 6.5;
          }
          return tags.map((t) => (
            <text key={t.id} className="chart__end" data-color="--color-star" x={t.tx} y={t.ty}>
              {t.id}
            </text>
          ));
        })()}
      </svg>

      <svg
        ref={navRef}
        className="chart__nav"
        width={width}
        height={NAV_H}
        viewBox={`0 0 ${width} ${NAV_H}`}
        role="slider"
        aria-label={labels.navigator}
        aria-valuemin={start}
        aria-valuemax={end}
        aria-valuenow={Number(v0.toFixed(2))}
        aria-valuetext={labels.zoomed(dateLabel(v0), dateLabel(v1))}
        onPointerDown={onNavDown}
        onPointerMove={onNavMove}
        onPointerUp={() => (navDrag.current = null)}
      >
        <rect className="chart__nav-bg" x={PAD.left} y={0} width={plotW} height={NAV_H} />
        {sorted.map((s) => (
          <path key={s.id} className={`chart__nav-line chart__line--${s.id.toLowerCase()}`} d={navPath(s.points)} />
        ))}
        <rect className="chart__nav-shade" x={PAD.left} y={0} width={Math.max(0, navX(v0) - PAD.left)} height={NAV_H} />
        <rect className="chart__nav-shade" x={navX(v1)} y={0} width={Math.max(0, PAD.left + plotW - navX(v1))} height={NAV_H} />
        <rect className="chart__nav-window" x={navX(v0)} y={0.5} width={Math.max(2, navX(v1) - navX(v0))} height={NAV_H - 1} />
        <rect className="chart__nav-grip" x={navX(v0) - 2} y={NAV_H / 2 - 9} width={4} height={18} />
        <rect className="chart__nav-grip" x={navX(v1) - 2} y={NAV_H / 2 - 9} width={4} height={18} />
      </svg>

      <p className="chart__readout" aria-live="off">
        {anchorX === null ? (
          <span className="chart__hint">{labels.hint}</span>
        ) : (
          <>
            <strong>{dateLabel(anchorX)}</strong>
            {future
              ? sorted.map((s) => {
                  const b = bands.get(s.id)?.find((q) => q.x === Math.round(anchorX));
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
            {hoverYear === mapYear && resolution === 'year' && <span className="chart__hint">{labels.onMap}</span>}
            {hoverMark && <span className="chart__event">{hoverMark.detail}</span>}
          </>
        )}
      </p>
    </div>
  );
  // Full screen: drawn over the whole page, outside the drawer's stacking context.
  return expanded
    ? createPortal(
        <div className="chart-overlay" role="dialog" aria-modal="true" aria-label={sorted.map((s) => s.name).join(', ')} onClick={(e) => e.target === e.currentTarget && setExpanded(false)}>
          {body}
        </div>,
        document.body,
      )
    : body;
});
