import { describe, expect, it } from 'vitest';
import { PointIndex } from './nearby';
import { nearestRad, parseRadiation, radBand, radLabel, yearlyMsv } from './radiation';

const NOW = Date.UTC(2026, 10, 23, 12);
const t = (hoursAgo: number) => Math.round((NOW - hoursAgo * 3600_000) / 1000);

describe('radiation stations', () => {
  it('keeps recent, plausible gamma readings in µSv/h', () => {
    const list = parseRadiation(
      [
        { a: '50.45', n: '30.52', gamma: 114, gamma_t: t(0.5) },
        { a: '51.39', n: '30.10', gamma: 4392, gamma_t: t(2) },
        { a: '48.5', n: '35.0', gamma: 90, gamma_t: t(30) }, // a day and more old
        { a: '48.5', n: '35.0', gamma: 2, gamma_t: t(1) }, // a broken sensor
        { a: '48.5', n: '35.0' }, // air only
      ],
      NOW,
    );
    expect(list.map((s) => s.usv)).toEqual([0.114, 4.392]);
  });

  it('levels, labels and a year at that level', () => {
    expect([0.1, 0.2, 0.5, 4.4].map(radBand)).toEqual([0, 1, 2, 3]);
    expect(radLabel(0.114, 'en')).toBe('0.11');
    expect(radLabel(4.392, 'uk')).toBe('4,4');
    expect(yearlyMsv(0.114)).toBeCloseTo(1.0, 1);
  });

  it('the nearest station within the radius, or none', () => {
    const list = parseRadiation([{ a: '50.45', n: '30.52', gamma: 114, gamma_t: t(1) }], NOW);
    const index = new PointIndex(list.map((s) => s.lat), list.map((s) => s.lon));
    expect(nearestRad(index, list, 50.5, 30.5)?.s.usv).toBe(0.114);
    expect(nearestRad(index, list, 49.0, 32.0)).toBeNull();
  });
});
