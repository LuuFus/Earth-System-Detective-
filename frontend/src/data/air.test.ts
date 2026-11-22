// The US EPA Air Quality Index from particle concentrations, the AQI bands that colour the
// bubbles, distances and the nearest-station search, and how networks are merged.

import { describe, expect, it } from 'vitest';
import { isOld, mergeAir, OLD_HOURS, type AirStation } from './air';
import { distanceKm, PointIndex } from './nearby';
import { aqiBand, aqiFromPm, type AqiStation } from './ukraine';

describe('US EPA AQI (2024 breakpoints)', () => {
  it('PM2.5 breakpoints', () => {
    expect(aqiFromPm(0, null)).toBe(0);
    expect(aqiFromPm(9.0, null)).toBe(50);
    expect(aqiFromPm(9.1, null)).toBe(51);
    expect(aqiFromPm(35.4, null)).toBe(100);
    expect(aqiFromPm(55.4, null)).toBe(150);
    expect(aqiFromPm(125.4, null)).toBe(200);
  });

  it('PM10 breakpoints', () => {
    expect(aqiFromPm(null, 54)).toBe(50);
    expect(aqiFromPm(null, 154)).toBe(100);
  });

  it('the worse of the two wins, and no data gives no index', () => {
    expect(aqiFromPm(9.0, 154)).toBe(100);
    expect(aqiFromPm(null, null)).toBeNull();
  });

  it('bands', () => {
    expect([0, 50, 51, 100, 101, 150, 151, 200, 201, 300, 301, 500].map(aqiBand)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5]);
  });
});

describe('distances and the station index', () => {
  it('Kyiv to Lviv is about 470 km', () => {
    expect(distanceKm(50.45, 30.52, 49.84, 24.03)).toBeGreaterThan(460);
    expect(distanceKm(50.45, 30.52, 49.84, 24.03)).toBeLessThan(480);
  });

  it('finds the points within a radius, across the date line too', () => {
    const idx = new PointIndex([50.45, 49.84, 0, 0], [30.52, 24.03, 179.9, -179.9]);
    expect(idx.within(50.4, 30.6, 20).map((x) => x.i)).toEqual([0]);
    expect(idx.within(0, 179.95, 20).map((x) => x.i).sort()).toEqual([2, 3]);
  });
});

describe('merging networks', () => {
  const seb: AqiStation = { id: '1', city: 'Черкаси', name: 'пров. Січовий', lat: 49.44, lon: 32.06, aqi: 40, pm25: 8, pm10: 12, temp: null, humidity: null, time: new Date().toISOString() };
  const waqi: AirStation = { lat: 49.4401, lon: 32.0601, aqi: 42, pm25: null, pm10: null, source: 'waqi', uid: 7, name: 'Cherkasy', time: new Date().toISOString() };

  it('a station already on the list from WAQI is not added again from SaveEcoBot', () => {
    const out = mergeAir([seb], null, [waqi]);
    expect(out).toHaveLength(1);
    expect(out[0].source).toBe('waqi');
  });

  it('citizen sensors fill the places with no station', () => {
    const out = mergeAir([seb], { built: new Date().toISOString(), p: [[49.44, 32.06, 5, 8, 20, 'UA'], [48.5, 35.0, 30, 40, 89, 'UA']] });
    expect(out.map((s) => s.source)).toEqual(['saveecobot', 'sensor']);
  });

  it('old readings are marked', () => {
    const at = (h: number) => ({ ...waqi, time: new Date(Date.now() - h * 3600_000).toISOString() });
    expect(isOld(at(OLD_HOURS - 0.5))).toBe(false);
    expect(isOld(at(OLD_HOURS + 0.5))).toBe(true);
  });
});
