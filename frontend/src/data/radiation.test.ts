import { describe, expect, it } from 'vitest';
import { PointIndex } from './nearby';
import { mergeRadiation, nearestRad, parseRadiation, parseWorld, radBand, radLabel, yearlyMsv } from './radiation';

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

describe('radiation around the world', () => {
  it('reads the hourly file: networks, and the time of each reading', () => {
    const list = parseWorld(
      {
        built: '2026-11-23T12:00:00Z',
        p: [
          [52.85, 13.94, 0.088, 30, 0],
          [60.22, 25.18, 0.113, 10, 1],
          [37.7, 140.74, 0.16, 120, 2],
          [48.78, 9.16, 0.105, 0, 3],
          [10, 10, 0, 0, 2],
        ],
      },
      NOW,
    );
    expect(list.map((s) => s.src)).toEqual(['bfs', 'stuk', 'safecast', 'sensor']);
    expect(list[0].time).toBe('2026-11-23T11:30:00.000Z');
  });

  it('drops a world station that repeats a Ukrainian one', () => {
    const ua = [{ lat: 50.45, lon: 30.52, usv: 0.11, time: '2026-11-23T12:00:00Z' }];
    const world = [
      { lat: 50.4512, lon: 30.5209, usv: 0.12, time: '2026-11-23T12:00:00Z', src: 'safecast' as const },
      { lat: 52.85, lon: 13.94, usv: 0.09, time: '2026-11-23T12:00:00Z', src: 'bfs' as const },
    ];
    expect(mergeRadiation(ua, world).map((s) => s.src ?? 'saveecobot')).toEqual(['saveecobot', 'bfs']);
  });
});
