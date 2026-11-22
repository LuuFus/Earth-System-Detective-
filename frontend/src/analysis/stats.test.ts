// The trend statistics against values computed independently (SciPy and the textbook formulas in
// tests/reference/make_stats_reference.py), plus a few cases worked out by hand.

import { describe, expect, it } from 'vitest';
import reference from '../../tests/reference/stats-reference.json';
import { normalCdf, seasonalTrendStats, studentTwoSided, trendBand, trendStats, verdict, yearsStillNeeded } from './stats';

type Case = {
  name: string;
  kind: 'yearly' | 'seasonal';
  x: number[];
  y: number[];
  season?: number[];
  mkS: number;
  varS: number;
  mkZ: number;
  mkP: number;
  sen: number;
  olsSlope?: number;
  olsIntercept?: number;
  olsP?: number;
  r2?: number;
};

const cases = (reference as { cases: Case[] }).cases;

describe('trendStats against SciPy', () => {
  for (const c of cases.filter((k) => k.kind === 'yearly')) {
    it(c.name, () => {
      const s = trendStats(c.x.map((x, i) => ({ x, y: c.y[i] })))!;
      expect(s).not.toBeNull();
      expect(s.mkS).toBe(c.mkS);
      expect(s.varS).toBeCloseTo(c.varS, 6);
      expect(s.mkZ).toBeCloseTo(c.mkZ, 6);
      // The normal CDF is an approximation good to about 1e-7.
      expect(Math.abs(s.mkP - c.mkP)).toBeLessThan(1e-6);
      expect(s.sen).toBeCloseTo(c.sen, 9);
      expect(s.olsSlope).toBeCloseTo(c.olsSlope!, 9);
      expect(s.olsIntercept).toBeCloseTo(c.olsIntercept!, 6);
      expect(Math.abs(s.olsP - c.olsP!)).toBeLessThan(1e-6);
      expect(s.r2).toBeCloseTo(c.r2!, 9);
      expect(s.pairsUp + s.pairsDown + s.pairsTie).toBe((c.x.length * (c.x.length - 1)) / 2);
    });
  }
});

describe('seasonalTrendStats against the reference', () => {
  for (const c of cases.filter((k) => k.kind === 'seasonal')) {
    it(c.name, () => {
      const s = seasonalTrendStats(c.x.map((x, i) => ({ x, y: c.y[i], season: c.season![i] })))!;
      expect(s.seasonal).toBe(true);
      expect(s.mkS).toBe(c.mkS);
      expect(s.varS).toBeCloseTo(c.varS, 6);
      expect(s.mkZ).toBeCloseTo(c.mkZ, 6);
      expect(Math.abs(s.mkP - c.mkP)).toBeLessThan(1e-6);
      expect(s.sen).toBeCloseTo(c.sen, 9);
      expect(s.years).toBe(30);
    });
  }
});

describe('worked by hand', () => {
  it('ten rising values: every pair goes up', () => {
    const s = trendStats(Array.from({ length: 10 }, (_, i) => ({ x: 2010 + i, y: 3 + 1.5 * i })))!;
    expect(s.mkS).toBe(45);
    expect(s.varS).toBe(125);
    expect(s.mkZ).toBeCloseTo(44 / Math.sqrt(125), 12);
    expect(s.sen).toBe(1.5);
    expect(s.senLow).toBe(1.5);
    expect(s.senHigh).toBe(1.5);
    expect(verdict(s)).toBe('significant');
  });

  it('a flat series has no trend and no test', () => {
    const s = trendStats(Array.from({ length: 12 }, (_, i) => ({ x: 2000 + i, y: 5 })))!;
    expect(s.mkS).toBe(0);
    expect(s.mkZ).toBe(0);
    expect(s.sen).toBe(0);
    expect(s.yearsNeeded).toBeNull();
    expect(s.olsP).toBe(1);
  });

  it('missing values are left out, too few values give no answer', () => {
    expect(trendStats([{ x: 1, y: 1 }, { x: 2, y: Number.NaN }, { x: 3, y: 2 }])).toBeNull();
    const s = trendStats([1, 2, Number.NaN, 4, 5].map((y, i) => ({ x: i, y })))!;
    expect(s.n).toBe(4);
  });

  it('fewer than ten years: not enough for a verdict', () => {
    const s = trendStats(Array.from({ length: 8 }, (_, i) => ({ x: 2000 + i, y: i })));
    expect(verdict(s)).toBe('insufficient');
    expect(yearsStillNeeded(s)).toBeGreaterThanOrEqual(2);
  });

  it('the trend band widens away from the data', () => {
    const c = cases.find((k) => k.name === 'warming')!;
    const s = trendStats(c.x.map((x, i) => ({ x, y: c.y[i] })))!;
    const near = trendBand(s, s.xMean);
    const far = trendBand(s, 2060);
    expect(far.high - far.low).toBeGreaterThan(near.high - near.low);
    expect(near.low).toBeLessThan(near.mid);
    expect(near.high).toBeGreaterThan(near.mid);
  });
});

describe('distributions', () => {
  it('normal CDF', () => {
    // The error function is approximated to about 1e-7 (Abramowitz and Stegun 7.1.26).
    expect(normalCdf(0)).toBeCloseTo(0.5, 7);
    expect(normalCdf(1.959963984540054)).toBeCloseTo(0.975, 6);
    expect(normalCdf(-3)).toBeCloseTo(0.0013499, 6);
  });

  it("Student's t, two-sided", () => {
    // Textbook values: t(0.975, 10) = 2.228, t(0.975, 30) = 2.042.
    expect(studentTwoSided(2.228138852, 10)).toBeCloseTo(0.05, 6);
    expect(studentTwoSided(2.042272456, 30)).toBeCloseTo(0.05, 6);
    expect(studentTwoSided(0, 5)).toBeCloseTo(1, 9);
  });
});
