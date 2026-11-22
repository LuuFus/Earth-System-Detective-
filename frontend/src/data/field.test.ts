// Gridded fields: the bytes written by data-pipeline/build_live.py decode back to their values,
// sampling is bilinear and stops at a regional grid's edge, and painting leaves it transparent.

import { describe, expect, it } from 'vitest';
import { colorAt, decode, fieldPixels, fieldValue, GridFrame, worldView, type Grid } from './field';

// The pipeline's air encoding (aq_byte in build_live.py), written out again here.
const airByte = (name: 'aqi' | 'pm25' | 'dust', v: number) => Math.min(254, Math.round(name === 'aqi' ? v / 2 : name === 'pm25' ? Math.sqrt(v) * 11 : Math.sqrt(v) * 5.6));

describe('bytes back to values', () => {
  it('weather', () => {
    expect(decode('u', 128)).toBe(0);
    expect(decode('v', 148)).toBe(10);
    expect(decode('t', 140)).toBe(0);
    expect(decode('precip', 32)).toBe(1);
    expect(decode('gust', 40)).toBe(10);
  });

  it('air quality: within the rounding of one byte', () => {
    for (const v of [0, 12, 50, 99, 151, 300]) expect(Math.abs(decode('aqi', airByte('aqi', v)) - v)).toBeLessThanOrEqual(1);
    for (const v of [1, 9, 35, 120]) expect(Math.abs(decode('pm25', airByte('pm25', v)) - v) / v).toBeLessThan(0.1);
    for (const v of [5, 60, 400, 1500]) expect(Math.abs(decode('dust', airByte('dust', v)) - v) / v).toBeLessThan(0.12);
    expect(decode('aqi', 255)).toBeNaN();
  });
});

describe('sampling', () => {
  // A 3 x 2 regional grid of AQI: 50.0-49.5 N, 30.0-31.0 E.
  const grid: Grid = { north: 50, west: 30, step: 0.5, ni: 3, nj: 2, wrap: false };
  const aqi = [10, 20, 30, 40, 50, 60].map((v) => v / 2);
  const frame = new GridFrame(new Uint8Array(aqi), '2026-11-22T12:00:00Z', grid, ['aqi']);

  it('is exact on the grid and bilinear between', () => {
    expect(frame.sample('aqi', 50, 30)).toBe(10);
    expect(frame.sample('aqi', 49.5, 31)).toBeCloseTo(60, 2);
    expect(frame.sample('aqi', 49.75, 30.25)).toBeCloseTo((10 + 20 + 40 + 50) / 4, 9);
  });

  it('gives no value outside a regional grid, or for a variable it lacks', () => {
    expect(frame.sample('aqi', 51, 30.5)).toBeNaN();
    expect(frame.sample('aqi', 49.7, 29)).toBeNaN();
    expect(frame.sample('dust', 49.7, 30.5)).toBeNaN();
  });

  it('wraps around the world for a global grid', () => {
    const g: Grid = { north: 90, west: 0, step: 90, ni: 4, nj: 3, wrap: true };
    const t = new GridFrame(new Uint8Array([140, 150, 160, 170, 140, 150, 160, 170, 140, 150, 160, 170]), new Date(), g, ['t']);
    expect(t.sample('t', 0, 0)).toBe(0);
    expect(t.sample('t', 0, -90)).toBe(t.sample('t', 0, 270));
    expect(fieldValue(t, 'temp', 0, 90)).toBe(5);
  });

  it('painting leaves the outside of a regional grid transparent', () => {
    const px = fieldPixels(frame, 'aqi', { ...worldView('equirect', 72), north: 52, south: 48, west: 28, east: 33 });
    const alphas = new Set<number>();
    for (let i = 3; i < px.length; i += 4) alphas.add(px[i]);
    expect(alphas.has(0)).toBe(true);
    expect([...alphas].some((a) => a > 100)).toBe(true);
  });

  it('colours of no value are transparent', () => {
    expect(colorAt('aqi', Number.NaN)[3]).toBe(0);
  });
});
