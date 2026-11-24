import { describe, expect, it } from 'vitest';
import { fromQuery, initialState, reducer, toQuery } from './explore';

describe('share links', () => {
  it('a link with a layer and no chart charts that layer', () => {
    expect(fromQuery('?v=precip&a=c:UA').state.chartVariable).toBe('precip');
    expect(fromQuery('?v=t2m').state.chartVariable).toBe('t2m');
    // Imagery without numbers keeps the default chart.
    expect(fromQuery('?v=truecolor').state.chartVariable).toBe('gistemp');
  });

  it('a chart chosen apart from the layer survives the round trip', () => {
    const state = { ...initialState, variable: 't2m' as const, chartVariable: 'gistemp' as const };
    expect(fromQuery(`?${toQuery(state, null)}`).state.chartVariable).toBe('gistemp');
    const same = { ...initialState, variable: 'precip' as const, chartVariable: 'precip' as const };
    expect(toQuery(same, null)).not.toContain('cv=');
  });

  it('an event day comes back only with its year', () => {
    expect(fromQuery('?v=fires&y=2018&d=2018-04-09').state.day).toBe('2018-04-09');
    expect(fromQuery('?v=fires&y=2019&d=2018-04-09').state.day).toBeUndefined();
  });
});

describe('layers that would cover each other', () => {
  it('air bubbles and radiation tags take turns', () => {
    const rad = reducer({ ...initialState, aqi: true }, { type: 'set', state: { radiation: true } });
    expect(rad.radiation).toBe(true);
    expect(rad.aqi).toBe(false);
    const air = reducer(rad, { type: 'set', state: { aqi: true } });
    expect(air.aqi).toBe(true);
    expect(air.radiation).toBe(false);
    // Turning one off leaves the other as it is.
    expect(reducer(air, { type: 'set', state: { aqi: false } }).radiation).toBe(false);
  });

  it('the Cities layer survives the link', () => {
    const q = toQuery({ ...initialState, cities: true }, null);
    expect(q).toContain('on=cities');
    expect(fromQuery(`?${q}`).state.cities).toBe(true);
  });
});
