// Stat Card, rebuilt from Design Bookmark's Motion Studies (stat-card): a big number, a change
// chip and a smooth area chart. Switching the range slides the pill, rolls the number and springs
// each chart point to its new height, one after another (springs as in stat.js).

import { useEffect, useRef } from 'react';
import { clamp, spring, step, settled, useMotion, type Spring } from '../../motion/spring';

export type StatRange = {
  id: string;
  label: string;
  /** The big number. */
  value: number;
  /** The change chip; null hides it. */
  delta: number | null;
  /** Chart values, oldest first (any length; resampled to the card's points). */
  points: number[];
};

type Props = {
  label: string;
  ranges: StatRange[];
  active: string;
  onRange: (id: string) => void;
  format: (v: number) => string;
  formatDelta: (v: number) => string;
  /** Colour of the line and chip: rising values read as warm, falling as cool, or neutral. */
  tone: (delta: number | null) => 'up' | 'down' | 'flat';
  /** Words under the number, e.g. the place and the last year. */
  caption?: string;
};

const N = 24;
const H = 96;

/** Resamples to N points and scales into 0..1 (same scale for every range is not needed: each range fills the card). */
function shape(values: number[]): number[] {
  const v = values.filter(Number.isFinite);
  if (!v.length) return new Array(N).fill(0.5);
  const lo = Math.min(...v);
  const hi = Math.max(...v);
  const k = hi - lo || 1;
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = (i / (N - 1)) * (v.length - 1);
    const a = Math.floor(t);
    const b = Math.min(v.length - 1, a + 1);
    const y = v[a] + (v[b] - v[a]) * (t - a);
    out.push(0.08 + ((y - lo) / k) * 0.84);
  }
  return out;
}

export function StatCard({ label, ranges, active, onRange, format, formatDelta, tone, caption }: Props) {
  const chart = useRef<SVGSVGElement>(null);
  const line = useRef<SVGPathElement>(null);
  const area = useRef<SVGPathElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const big = useRef<HTMLParagraphElement>(null);
  const chip = useRef<HTMLSpanElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const seg = useRef<HTMLDivElement>(null);
  const gradientId = useRef(`stat${Math.random().toString(36).slice(2, 8)}`).current;

  const st = useRef<{ pts: Spring[]; val: Spring; dv: Spring; px: Spring; pw: Spring; timers: number[]; first: boolean } | null>(null);
  if (!st.current) {
    st.current = {
      pts: Array.from({ length: N }, () => spring(0, 200, 17)),
      val: spring(0, 160, 22),
      dv: spring(0, 160, 22),
      px: spring(0, 380, 30),
      pw: spring(0, 380, 30),
      timers: [],
      first: true,
    };
  }
  const s = st.current;
  const current = ranges.find((r) => r.id === active) ?? ranges[0];
  const latest = useRef({ format, formatDelta, current });
  latest.current = { format, formatDelta, current };

  const wake = useMotion(
    (dt) => {
      s.pts.forEach((p) => step(p, dt));
      [s.val, s.dv, s.px, s.pw].forEach((x) => step(x, dt));
    },
    () => {
      const svg = chart.current;
      if (!svg) return;
      const W = svg.clientWidth || 300;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      const xy = s.pts.map((p, i) => [4 + (i / (N - 1)) * (W - 8), 8 + (1 - clamp(p.x, -0.05, 1.05)) * (H - 16)]);
      let d = `M${xy[0][0].toFixed(2)} ${xy[0][1].toFixed(2)}`;
      for (let i = 0; i < N - 1; i++) {
        const p0 = xy[i - 1] || xy[i];
        const p1 = xy[i];
        const p2 = xy[i + 1];
        const p3 = xy[i + 2] || p2;
        d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
      }
      line.current?.setAttribute('d', d);
      area.current?.setAttribute('d', `${d} L${xy[N - 1][0].toFixed(2)} ${H} L${xy[0][0].toFixed(2)} ${H} Z`);
      const [lx, ly] = xy[N - 1];
      if (dot.current) dot.current.style.transform = `translate(${(lx - 4.5).toFixed(2)}px,${(ly - 4.5).toFixed(2)}px)`;
      if (big.current) big.current.textContent = latest.current.format(s.val.x);
      if (chip.current && latest.current.current.delta !== null) chip.current.textContent = latest.current.formatDelta(s.dv.x);
      if (pill.current) {
        pill.current.style.transform = `translateX(${s.px.x.toFixed(2)}px)`;
        pill.current.style.width = `${s.pw.x.toFixed(2)}px`;
      }
    },
    () => s.pts.every((p) => settled(p)) && settled(s.val, 1e-4) && settled(s.dv, 1e-4) && settled(s.px, 0.05) && settled(s.pw, 0.05),
  );

  // A new range (or new data): retarget left to right, 30 ms apart, as stat.js does.
  const key = `${current.id}|${current.value}|${current.delta}|${current.points.join(',')}`;
  useEffect(() => {
    const target = shape(current.points);
    s.timers.forEach((t) => window.clearTimeout(t));
    s.timers = [];
    if (s.first) {
      // First paint: start from a flat line in the middle and the values at zero, then grow.
      s.first = false;
      s.pts.forEach((p) => {
        p.x = p.t = 0.5;
      });
    }
    target.forEach((y, k) => {
      s.timers.push(
        window.setTimeout(() => {
          s.pts[k].t = y;
          wake();
        }, k * 30),
      );
    });
    s.val.t = current.value;
    s.dv.t = current.delta ?? 0;
    wake();
    return () => s.timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // The pill slides under the active tab.
  useEffect(() => {
    const btn = seg.current?.querySelector<HTMLButtonElement>(`[data-id="${CSS.escape(current.id)}"]`);
    if (!btn) return;
    s.px.t = btn.offsetLeft;
    s.pw.t = btn.offsetWidth;
    if (!s.pw.x) {
      s.px.x = s.px.t;
      s.pw.x = s.pw.t;
    }
    wake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.id, ranges.length]);

  const t = tone(current.delta);
  return (
    <section className={`stat stat--${t}`} aria-label={label}>
      <div className="stat__top">
        <div>
          <p className="stat__label">{label}</p>
          <p ref={big} className="stat__big" aria-live="polite">
            {format(current.value)}
          </p>
          {caption && <p className="stat__caption">{caption}</p>}
        </div>
        {current.delta !== null && (
          <span ref={chip} className="stat__delta">
            {formatDelta(current.delta)}
          </span>
        )}
      </div>
      <div className="stat__chart">
        <svg ref={chart} className="stat__svg" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity=".32" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path ref={area} fill={`url(#${gradientId})`} />
          <path ref={line} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span ref={dot} className="stat__dot" />
      </div>
      {ranges.length > 1 && (
        <div ref={seg} className="stat__seg" role="group">
          <span ref={pill} className="stat__pill" aria-hidden="true" />
          {ranges.map((r) => (
            <button key={r.id} type="button" data-id={r.id} className={r.id === current.id ? 'on' : ''} aria-pressed={r.id === current.id} onClick={() => onRange(r.id)}>
              {r.label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
