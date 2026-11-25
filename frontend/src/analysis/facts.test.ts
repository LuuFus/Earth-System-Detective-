import { describe, expect, it } from 'vitest';
import { clampTo, laterHigherShare, monthDepartures, rankOf, valueOf, yearFacts } from './facts';
import { trendStats } from './stats';

const series = [
  { x: 2012, y: 60 },
  { x: 2013, y: 90 },
  { x: 2014, y: NaN },
  { x: 2015, y: 140 },
  { x: 2016, y: 30 },
  { x: 2017, y: 45 },
];

describe('facts from the measured values', () => {
  it('first, last, highest, lowest and the usual year skip years without data', () => {
    const f = yearFacts(series, true)!;
    expect(f.first).toEqual({ x: 2012, y: 60 });
    expect(f.last).toEqual({ x: 2017, y: 45 });
    expect(f.max).toEqual({ x: 2015, y: 140 });
    expect(f.min).toEqual({ x: 2016, y: 30 });
    expect(f.n).toBe(5);
    expect(f.mean).toBeCloseTo(73);
    expect(f.diff).toBe(-15);
    expect(f.pct).toBeCloseTo(-25);
  });

  it('gives no percent for values without a true zero', () => {
    expect(yearFacts([{ x: 2000, y: 0.2 }, { x: 2001, y: 0.4 }], false)!.pct).toBeNull();
    // Nor from a first year of zero or below.
    expect(yearFacts([{ x: 2000, y: 0 }, { x: 2001, y: 4 }], true)!.pct).toBeNull();
  });

  it('has nothing to say about an empty series', () => {
    expect(yearFacts([{ x: 2000, y: NaN }])).toBeNull();
  });

  it('ranks a year among the others', () => {
    expect(rankOf(series, 2015)).toEqual({ high: 1, low: 5, of: 5 });
    expect(rankOf(series, 2016)).toEqual({ high: 5, low: 1, of: 5 });
    expect(rankOf(series, 2014)).toBeNull();
    expect(valueOf(series, 2013)).toBe(90);
    expect(valueOf(series, 1999)).toBeNaN();
  });

  it('counts the pairs where the later year is higher', () => {
    const rising = Array.from({ length: 12 }, (_, i) => ({ x: 2000 + i, y: i }));
    expect(laterHigherShare(trendStats(rising)!)).toBe(1);
  });

  it('finds the month furthest from its usual value', () => {
    const rows = [
      { year: 2020, values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] },
      { year: 2021, values: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110] },
      { year: 2022, values: [0, 10, 20, 30, 40, 50, 75, 70, 80, 90, 100, NaN] },
    ];
    const d = monthDepartures(rows, 2022);
    expect(d[0].month).toBe(6);
    expect(d[0].diff).toBeCloseTo(10);
    // A month the year does not have is left out.
    expect(d.some((x) => x.month === 11)).toBe(false);
  });

  it('keeps values inside physical limits', () => {
    expect(clampTo(-120, { min: 0 })).toBe(0);
    expect(clampTo(130, { min: 0, max: 100 })).toBe(100);
    expect(clampTo(-3)).toBe(-3);
  });
});
