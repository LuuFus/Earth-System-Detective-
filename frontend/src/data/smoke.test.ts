import { describe, expect, it } from 'vitest';
import { decodePoints } from '../components/globe/mvt';
import { aqiColor, aqiFromPm25, SmokeSim } from '../components/globe/smoke';
import { gridWind, storySources, worstTown } from './smoke';

describe('fires from vector tiles', () => {
  // A tile with one layer "fires" (extent 4096) and two point features at (10, 20) and (30, 5).
  const varint = (n: number) => {
    const out: number[] = [];
    while (n > 127) {
      out.push((n & 127) | 128);
      n >>>= 7;
    }
    out.push(n);
    return out;
  };
  const zig = (n: number) => (n << 1) ^ (n >> 31);
  const msg = (field: number, bytes: number[]) => [...varint((field << 3) | 2), ...varint(bytes.length), ...bytes];
  const point = (x: number, y: number) => [...varint((3 << 3) | 0), 1, ...msg(4, [...varint((1 & 7) | (1 << 3)), ...varint(zig(x)), ...varint(zig(y))])];
  const layer = [...msg(1, [...new TextEncoder().encode('fires')]), ...msg(2, point(10, 20)), ...msg(2, point(30, 5)), ...varint((5 << 3) | 0), ...varint(4096)];
  const tile = new Uint8Array(msg(3, layer));

  it('reads the points of every feature', () => {
    const p = decodePoints(tile);
    expect(p.extent).toBe(4096);
    expect(p.x).toEqual([10, 30]);
    expect(p.y).toEqual([20, 5]);
  });

  it('reads nothing from an empty or broken tile', () => {
    expect(decodePoints(new Uint8Array(0)).x).toEqual([]);
    expect(decodePoints(new Uint8Array([60, 63, 120])).x).toEqual([]);
  });
});

describe('smoke', () => {
  const box = { s: 49, n: 51, w: 29, e: 31 };
  // Wind from the west everywhere, 10 m/s: the air moves east.
  const n = 3;
  const nt = 4;
  const u = new Float32Array(n * n * nt).fill(10);
  const v = new Float32Array(n * n * nt).fill(0);
  const wind = gridWind(box, n, nt, 0, u, v);

  it('reads the wind between grid points and hours', () => {
    expect(wind(50, 30, 1.5)).toEqual([10, 0]);
    // Outside the grid: the nearest edge.
    expect(wind(60, 40, 10)).toEqual([10, 0]);
  });

  it('carries puffs with the wind, the same way every time', () => {
    const a = new SmokeSim([{ lat: 50, lon: 30, t0: 0, t1: 1, power: 50 }], wind, { life: 6, diffusion: 0 });
    const b = new SmokeSim([{ lat: 50, lon: 30, t0: 0, t1: 1, power: 50 }], wind, { life: 6, diffusion: 0 });
    expect(a.tracks.length).toBe(3);
    const tr = a.tracks[0];
    const last = tr.lon.length - 1;
    // 10 m/s for 6 hours is 216 km east: about 3 degrees of longitude at 50° N.
    expect(tr.lon[last] - tr.lon[0]).toBeGreaterThan(2.8);
    expect(tr.lon[last] - tr.lon[0]).toBeLessThan(3.2);
    expect(Math.abs(tr.lat[last] - tr.lat[0])).toBeLessThan(0.02);
    expect(b.tracks[0].lon[last]).toBe(tr.lon[last]);
  });

  it('keeps a fire burning through cloudy days and splits fires days apart', () => {
    const pts = (rows: [number, number, number, number][]) => ({
      lat: Float32Array.from(rows.map((r) => r[0])),
      lon: Float32Array.from(rows.map((r) => r[1])),
      hours: Float32Array.from(rows.map((r) => r[2])),
      frp: Uint16Array.from(rows.map((r) => r[3])),
    });
    // One place seen at hour 100, again at 160 (clouds between), and again at 400.
    const s = storySources(
      pts([
        [50, 30, 100, 20],
        [50, 30, 160, 60],
        [50, 30, 400, 10],
      ]),
      90,
      500,
    );
    expect(s).toHaveLength(2);
    const first = s.find((x) => x.power === 60)!;
    expect(first.t0).toBe(100 - 6 - 90);
    expect(first.t1).toBe(160 + 10 - 90);
  });

  it('turns PM2.5 into the AQI and its colour', () => {
    expect(aqiFromPm25(0)).toBe(0);
    expect(aqiFromPm25(9)).toBe(50);
    expect(aqiFromPm25(35.4)).toBe(100);
    expect(aqiFromPm25(1000)).toBe(500);
    expect(aqiColor(20)).toBe('#34d17a');
    expect(aqiColor(180)).toBe('#ff5a5f');
    expect(aqiColor(450)).toBe('#8a1a3a');
  });

  it('finds the town with the worst air and when', () => {
    const towns = [
      { lat: 0, lon: 0, name: 'A', pm25: Float32Array.from([5, 12, NaN]) },
      { lat: 0, lon: 0, name: 'B', pm25: Float32Array.from([3, 80, 40]) },
    ];
    expect(worstTown(towns, '2020-04-16T00')).toEqual({ name: 'B', pm25: 80, time: '2020-04-16T01:00:00.000Z' });
  });
});
