// Plain facts about a yearly series, straight from the measured values (no trend line): the first
// and the last year, the highest and the lowest, the usual year, and where a year stands among
// the others. The analysis tells these first, so every number on screen can be found in the data.

import type { MonthlyRow } from './series';
import type { Point, TrendStats } from './stats';

export type Facts = {
  first: Point;
  last: Point;
  max: Point;
  min: Point;
  /** The usual year: the mean of every year with data. */
  mean: number;
  /** Years with data. */
  n: number;
  /** The last year minus the first. */
  diff: number;
  /** That difference in percent of the first year, where a percent means something. */
  pct: number | null;
};

const finite = (points: Point[]) => points.filter((p) => Number.isFinite(p.y)).sort((a, b) => a.x - b.x);

/**
 * Facts about the years with data. `ratio`: the values have a true zero (counts, millimetres),
 * so a change in percent makes sense; for temperatures in °C it would not.
 */
export function yearFacts(points: Point[], ratio = false): Facts | null {
  const pts = finite(points);
  if (!pts.length) return null;
  const first = pts[0];
  const last = pts[pts.length - 1];
  let max = first;
  let min = first;
  let sum = 0;
  for (const p of pts) {
    if (p.y > max.y) max = p;
    if (p.y < min.y) min = p;
    sum += p.y;
  }
  const diff = last.y - first.y;
  const pct = ratio && first.y > 0 && pts.length > 1 ? (diff / first.y) * 100 : null;
  return { first, last, max, min, mean: sum / pts.length, n: pts.length, diff, pct };
}

/** Where a year stands among the years with data: 1st highest, 1st lowest, out of how many. */
export function rankOf(points: Point[], year: number): { high: number; low: number; of: number } | null {
  const pts = finite(points);
  const me = pts.find((p) => p.x === year);
  if (!me) return null;
  const above = pts.filter((p) => p.y > me.y).length;
  const below = pts.filter((p) => p.y < me.y).length;
  return { high: above + 1, low: below + 1, of: pts.length };
}

/** The value of one year, or NaN. */
export function valueOf(points: Point[], year: number): number {
  return points.find((p) => p.x === year)?.y ?? NaN;
}

/**
 * Of every pair of years, the share (0-1) in which the later year was higher. With no change it
 * is about a half; this is what the Mann-Kendall test counts.
 */
export function laterHigherShare(stats: TrendStats): number | null {
  const total = stats.pairsUp + stats.pairsDown + stats.pairsTie;
  return total ? stats.pairsUp / total : null;
}

export type MonthDeparture = { month: number; value: number; normal: number; diff: number };

/**
 * Each month of a year against that month's usual value (its mean over every year that has it).
 * Sorted from the month furthest from its usual value.
 */
export function monthDepartures(rows: MonthlyRow[], year: number): MonthDeparture[] {
  const row = rows.find((r) => r.year === year);
  if (!row) return [];
  const out: MonthDeparture[] = [];
  for (let m = 0; m < 12; m++) {
    const value = row.values[m];
    const all = rows.map((r) => r.values[m]).filter(Number.isFinite);
    if (!Number.isFinite(value) || all.length < 3) continue;
    const normal = all.reduce((a, b) => a + b, 0) / all.length;
    out.push({ month: m, value, normal, diff: value - normal });
  }
  return out.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
}

/** Keeps a value inside physical limits (no negative fires, no humidity above 100%). */
export function clampTo(v: number, bounds?: { min?: number; max?: number }): number {
  if (!bounds) return v;
  return Math.min(bounds.max ?? Infinity, Math.max(bounds.min ?? -Infinity, v));
}
