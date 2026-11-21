// Jelly Slider, rebuilt from Design Bookmark's Motion Studies (jelly-slider): the thumb follows
// the pointer through a spring and stretches with its speed; while dragging, a value drop rises
// out of the thumb, and both sit in one goo layer, so the drop peels off like liquid and melts
// back in on release. Past either end the thumb meets rubber resistance and snaps back.
// Springs: --slider-follow, --slider-bubble, --slider-release, --slider-glide (tokens.css).

import { useEffect, useId, useRef, useState } from 'react';
import { clamp, spring, springToken, numberToken, step, tune, useMotion, settled, type Spring } from '../../motion/spring';

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  /** Accessible name. */
  label: string;
  /** Text in the drop and for screen readers. */
  format?: (value: number) => string;
  /** Text under the major marks (defaults to `format`). */
  formatTick?: (value: number) => string;
  /** Values that get a tall mark and a number under the track. */
  majors?: number[];
  /** A short mark every this many units (0: none). */
  minorStep?: number;
  className?: string;
};

// R thumb radius, TR drawn thumb half size (the goo filter trims ~2px), D drop radius,
// OX / OY goo layer offset, CY track centre in the rail, RISE how far the drop rises.
const R = 12;
const TR = 14;
const D = 18;
const OX = 40;
const OY = 80;
const CY = 16;
const RISE = -38;
const REST_DROP = 0.5;

export function JellySlider({ min, max, step: unit = 1, value, onChange, label, format = String, formatTick, majors = [], minorStep = 0, className = '' }: Props) {
  const filterId = `goo${useId().replace(/:/g, '')}`;
  const rail = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const drop = useRef<HTMLDivElement>(null);
  const dropLabel = useRef<HTMLDivElement>(null);
  const dropText = useRef<HTMLSpanElement>(null);
  const hit = useRef<HTMLDivElement>(null);
  const marks = useRef<HTMLDivElement>(null);

  const st = useRef<{
    W: number;
    X: Spring;
    DX: Spring;
    DY: Spring;
    DS: Spring;
    PS: Spring;
    dragging: boolean;
    hover: boolean;
    lifted: boolean;
    lastSent: number;
    shown: number;
    T: { follow: [number, number]; bubble: [number, number]; release: [number, number]; glide: [number, number] };
  } | null>(null);
  if (!st.current) {
    const T = {
      follow: springToken('--slider-follow', '900 50'),
      bubble: springToken('--slider-bubble', '420 22'),
      release: springToken('--slider-release', '300 14'),
      glide: springToken('--slider-glide', '420 34'),
    };
    st.current = {
      W: 0,
      X: spring(0, ...T.follow),
      DX: spring(0, 260, 18),
      DY: spring(CY, ...T.bubble),
      DS: spring(REST_DROP, ...T.bubble),
      PS: spring(1, 520, 16),
      dragging: false,
      hover: false,
      lifted: false,
      lastSent: value,
      shown: value,
      T,
    };
  }
  const s = st.current;
  const span = () => Math.max(s.W - 2 * R, 1);
  const toX = (v: number) => R + ((v - min) / Math.max(max - min, 1e-9)) * span();
  const toV = (x: number) => min + clamp((x - R) / span(), 0, 1) * (max - min);
  const snap = (v: number) => clamp(Math.round((v - min) / unit) * unit + min, min, max);

  const latest = useRef({ onChange, format, value });
  latest.current = { onChange, format, value };

  const sync = () => {
    const up = s.dragging || s.lifted;
    s.DY.t = up ? CY + RISE : CY;
    s.DS.t = up ? 1 : REST_DROP;
    s.PS.t = s.dragging ? 1.16 : s.hover ? 1.08 : 1;
    wake();
  };

  const wake = useMotion(
    (dt) => {
      s.DX.t = s.X.x;
      step(s.X, dt);
      step(s.DX, dt);
      step(s.DY, dt);
      step(s.DS, dt);
      step(s.PS, dt);
    },
    () => {
      if (!s.W) return;
      const x = s.X.x;
      const v = snap(toV(x));
      // Thumb: stretched along the track with speed, area preserving.
      const stretch = 1 + Math.min(Math.abs(s.X.v) / 2400, 0.4);
      if (thumb.current) thumb.current.style.transform = `translate(${x - TR + OX}px,${CY - TR + OY}px) scale(${stretch * s.PS.x},${s.PS.x / stretch})`;
      // Drop: rises, leans the way it is dragged from.
      const tilt = clamp((s.DX.x - x) * 0.9, -28, 28);
      const dTr = `translate(${s.DX.x - D}px,${s.DY.x - D}px) rotate(${tilt}deg) scale(${s.DS.x})`;
      if (drop.current) drop.current.style.transform = `translate(${OX}px,${OY}px) ${dTr}`;
      if (dropLabel.current) {
        dropLabel.current.style.transform = dTr;
        dropLabel.current.style.opacity = String(clamp((s.DS.x - 0.7) / 0.25, 0, 1));
        if (dropText.current && (s.shown !== v || !dropText.current.textContent)) {
          const text = latest.current.format(v);
          dropText.current.textContent = text;
          // Longer than the drop: the words sit in a pill over it.
          dropLabel.current.classList.toggle('jelly__label--long', text.length > 4);
        }
      }
      s.shown = v;
      // The fill ends under the thumb centre.
      if (fill.current) fill.current.style.width = `${clamp(x, 0, s.W)}px`;
      if (hit.current) hit.current.style.left = `${x - R}px`;
      if (marks.current) {
        for (const m of marks.current.children) (m as HTMLElement).classList.toggle('on', Number((m as HTMLElement).dataset.v) <= v);
      }
    },
    () => !s.dragging && settled(s.X, 0.05) && settled(s.DX, 0.05) && settled(s.DY, 0.05) && settled(s.DS) && settled(s.PS),
  );

  // Follow the value from outside (playback, keyboard on another control).
  useEffect(() => {
    if (s.dragging || !s.W) return;
    if (value === snap(toV(s.X.t))) return;
    tune(s.X, ...s.T.glide);
    s.X.t = toX(value);
    wake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min, max]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (!w || w === s.W) return;
      s.W = w;
      s.X.x = s.X.t = s.DX.x = s.DX.t = toX(latest.current.value);
      s.X.v = s.DX.v = 0;
      wake();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  useEffect(() => {
    const blur = document.getElementById(`${filterId}-blur`);
    blur?.setAttribute('stdDeviation', String(numberToken('--slider-blur', 8)));
  }, [filterId]);

  const rubber = (x: number, lo: number, hi: number, d = 18) =>
    x < lo ? lo - (1 - 1 / (((lo - x) * 0.55) / d + 1)) * d : x > hi ? hi + (1 - 1 / (((x - hi) * 0.55) / d + 1)) * d : x;
  const localX = (e: React.PointerEvent) => e.clientX - rail.current!.getBoundingClientRect().left;
  const send = (x: number) => {
    const v = snap(toV(x));
    if (v !== s.lastSent) {
      s.lastSent = v;
      latest.current.onChange(v);
    }
  };

  const majorsIn = majors.filter((m) => m >= min && m <= max);
  // Tick numbers that would run into each other on a narrow slider: show every n-th one.
  const nums = useRef<HTMLDivElement>(null);
  const [numsWidth, setNumsWidth] = useState(0);
  const hasNums = majorsIn.length > 0;
  useEffect(() => {
    const el = nums.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setNumsWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasNums]);
  const tickText = majorsIn.map((v) => (formatTick ?? format)(v));
  const longest = tickText.reduce((a, t) => Math.max(a, t.length), 1);
  const every = numsWidth > 0 ? Math.max(1, Math.ceil((majorsIn.length * (longest * 7 + 14)) / numsWidth)) : 1;
  const minors: number[] = [];
  if (minorStep > 0) for (let v = Math.ceil(min / minorStep) * minorStep; v <= max; v += minorStep) minors.push(v);
  const pos = (v: number) => (v - min) / Math.max(max - min, 1e-9);

  return (
    <div className={`jelly ${className}`}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur id={`${filterId}-blur`} in="SourceGraphic" stdDeviation="8" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </svg>
      <div
        ref={rail}
        className="jelly__rail"
        onPointerDown={(e) => {
          s.dragging = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          tune(s.X, ...s.T.follow);
          s.X.t = rubber(localX(e), R, s.W - R);
          send(clamp(s.X.t, R, s.W - R));
          sync();
          hit.current?.focus({ preventScroll: true });
        }}
        onPointerMove={(e) => {
          if (!s.dragging) return;
          s.X.t = rubber(localX(e), R, s.W - R);
          send(clamp(s.X.t, R, s.W - R));
          wake();
        }}
        onPointerUp={() => {
          if (!s.dragging) return;
          s.dragging = false;
          tune(s.X, ...s.T.release);
          s.X.t = toX(snap(toV(clamp(s.X.t, R, s.W - R))));
          sync();
        }}
        onPointerCancel={() => {
          s.dragging = false;
          sync();
        }}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') {
            s.hover = true;
            sync();
          }
        }}
        onPointerLeave={() => {
          s.hover = false;
          sync();
        }}
      >
        <div className="jelly__track">
          <div ref={fill} className="jelly__fill" />
        </div>
        <div className="jelly__goo" style={{ filter: `url(#${filterId})` }}>
          <div ref={drop} className="jelly__blob jelly__drop" />
          <div ref={thumb} className="jelly__blob jelly__thumb" />
        </div>
        <div ref={dropLabel} className="jelly__label" aria-hidden="true">
          <span ref={dropText} />
        </div>
        <div
          ref={hit}
          className="jelly__hit"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
          onKeyDown={(e) => {
            const big = Math.max(unit, Math.round((max - min) / 10 / unit) * unit);
            const d = ({ ArrowRight: unit, ArrowUp: unit, ArrowLeft: -unit, ArrowDown: -unit, PageUp: big, PageDown: -big } as Record<string, number>)[e.key];
            const abs = ({ Home: min, End: max } as Record<string, number>)[e.key];
            if (d === undefined && abs === undefined) return;
            e.preventDefault();
            const next = abs !== undefined ? abs : snap(value + d);
            tune(s.X, ...s.T.glide);
            s.X.t = toX(next);
            s.lastSent = next;
            onChange(next);
            s.lifted = true;
            sync();
          }}
          onFocus={(e) => {
            if (e.currentTarget.matches(':focus-visible')) {
              s.lifted = true;
              sync();
            }
          }}
          onBlur={() => {
            s.lifted = false;
            sync();
          }}
        />
      </div>
      {(majorsIn.length > 0 || minors.length > 0) && (
        <div className="jelly__ticks" aria-hidden="true">
          <div ref={marks} className="jelly__marks">
            {minors.map((v) => (
              <i key={`m${v}`} data-v={v} style={{ ['--p' as string]: pos(v) }} />
            ))}
            {majorsIn.map((v) => (
              <i key={`M${v}`} data-v={v} className="major" style={{ ['--p' as string]: pos(v) }} />
            ))}
          </div>
          <div ref={nums} className="jelly__nums">
            {majorsIn.map((v, i) =>
              i % every === 0 ? (
                <span key={v} style={{ ['--p' as string]: pos(v) }}>
                  {tickText[i]}
                </span>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
