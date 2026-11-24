import { describe, expect, it } from 'vitest';
import { SmokeSim } from '../components/globe/smoke';
import { dayChange, ffwi, ffwiLevel, findHotspots, hotspotSources } from './hotspots';
import type { LiveFires } from './live';
import { gridWind, townsInPlume } from './smoke';

/** Fires from [lat, lon, hours old, MW]. */
function fires(rows: [number, number, number, number][]): LiveFires {
  return {
    count: rows.length,
    lat: Float32Array.from(rows.map((r) => r[0])),
    lon: Float32Array.from(rows.map((r) => r[1])),
    ageMin: Uint16Array.from(rows.map((r) => r[2] * 60)),
    frp: Uint16Array.from(rows.map((r) => r[3])),
    flags: new Uint8Array(rows.length),
  };
}

const cluster = (lat: number, lon: number, n: number, mw: number, hours: number): [number, number, number, number][] =>
  Array.from({ length: n }, (_, i) => [lat + (i % 5) * 0.05, lon + Math.floor(i / 5) * 0.05, hours, mw]);

describe('hotspots', () => {
  it('ranks places by fire power and counts the last day against the day before', () => {
    const f = fires([...cluster(10.2, 20.2, 30, 50, 5), ...cluster(10.2, 20.2, 20, 50, 30), ...cluster(-5.5, 120.5, 25, 10, 2)]);
    const h = findHotspots(f, 0, 5);
    expect(h).toHaveLength(2);
    expect(h[0].lastDay).toBe(30);
    expect(h[0].dayBefore).toBe(20);
    expect(h[0].power).toBe(2500);
    expect(h[1].lat).toBeLessThan(0);
    expect(dayChange(h[0])).toBe(50);
  });

  it('leaves out the glow of active volcanoes and too small clusters', () => {
    // Kilauea's lava lake: 40 hot pixels within a few km of the crater.
    const lava = Array.from({ length: 40 }, (_, i): [number, number, number, number] => [19.38 + (i % 5) * 0.01, -155.3 + Math.floor(i / 5) * 0.01, 3, 300]);
    const f = fires([...lava, ...cluster(40.5, 30.5, 5, 20, 3)]);
    expect(findHotspots(f, 0)).toEqual([]);
  });

  it('says nothing about a trend when the day before saw too little', () => {
    expect(dayChange({ lastDay: 563, dayBefore: 8 })).toBeNull();
    expect(dayChange({ lastDay: 80, dayBefore: 100 })).toBe(-20);
  });

  it('turns the hotspot into burning places for the smoke, strongest first', () => {
    const f = fires(cluster(10.2, 20.2, 30, 50, 5));
    const [h] = findHotspots(f, 0);
    const s = hotspotSources(f, h, 24, 3);
    expect(s).toHaveLength(3);
    expect(s.every((x) => x.t0 === 0 && x.t1 === 24)).toBe(true);
    expect(s[0].power).toBeGreaterThanOrEqual(s[2].power);
  });
});

describe('fire weather (Fosberg index)', () => {
  it('is low when cool and damp, high when hot, dry and windy', () => {
    expect(ffwi(10, 80, 10)).toBeLessThan(10);
    expect(ffwi(30, 20, 30)).toBeGreaterThan(40);
    expect(ffwi(30, 20, 30)).toBeLessThan(55);
    expect(ffwi(45, 5, 120)).toBe(100);
    expect(ffwiLevel(ffwi(10, 80, 10))).toBe(0);
    expect(ffwiLevel(70)).toBe(3);
  });
});

describe('towns under a plume', () => {
  it('finds the towns downwind and when the smoke gets there', () => {
    const box = { s: 49, n: 51, w: 29, e: 33 };
    const u = new Float32Array(3 * 3 * 4).fill(10);
    const v = new Float32Array(3 * 3 * 4).fill(0);
    const sim = new SmokeSim([{ lat: 50, lon: 30, t0: 0, t1: 1, power: 50 }], gridWind(box, 3, 4, 0, u, v), { life: 10, diffusion: 0 });
    const towns = [
      { id: 1, lat: 50, lon: 30.5, name: 'east, near' },
      { id: 2, lat: 50, lon: 31.5, name: 'east, far' },
      { id: 3, lat: 50, lon: 29.0, name: 'west' },
    ];
    const hit = townsInPlume(sim, towns, 24);
    expect(hit.map((x) => x.town.id)).toEqual([1, 2]);
    expect(hit[0].hours).toBeLessThan(hit[1].hours);
  });
});
