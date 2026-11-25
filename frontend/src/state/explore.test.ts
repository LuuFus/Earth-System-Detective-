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

describe('several layers at once', () => {
  it('air quality and radiation stay on together', () => {
    const both = reducer({ ...initialState, aqi: true }, { type: 'set', state: { radiation: true } });
    expect(both.aqi).toBe(true);
    expect(both.radiation).toBe(true);
  });

  it('a second map layer goes on top and the first stays under it', () => {
    const fires = reducer(initialState, { type: 'variable', id: 'fires' });
    const both = reducer(fires, { type: 'variable', id: 'aerosol' });
    expect(both.variable).toBe('aerosol');
    expect(both.extra).toEqual(['fires']);
    // Taking the top one off brings the one under it back to the top.
    const back = reducer(both, { type: 'layerOff', id: 'aerosol' });
    expect(back.variable).toBe('fires');
    expect(back.extra).toEqual([]);
    // Taking a lower one off leaves the top one.
    expect(reducer(both, { type: 'layerOff', id: 'fires' })).toMatchObject({ variable: 'aerosol', extra: [] });
    // "Plain Earth" turns every layer off.
    expect(reducer(both, { type: 'variable', id: null })).toMatchObject({ variable: null, extra: [] });
  });

  it('keeps at most three layers', () => {
    let s = initialState;
    for (const id of ['fires', 'no2', 'aerosol', 'co'] as const) s = reducer(s, { type: 'variable', id });
    expect(s.variable).toBe('co');
    expect(s.extra).toEqual(['no2', 'aerosol']);
  });

  it('the layers survive the link', () => {
    const s = reducer(reducer(initialState, { type: 'variable', id: 'fires' }), { type: 'variable', id: 'no2' });
    const back = fromQuery(`?${toQuery(s, null)}`).state;
    expect(back.variable).toBe('no2');
    expect(back.extra).toEqual(['fires']);
  });
});

describe('the chart and the globe show the same thing', () => {
  it('a new chart variable puts its layer on the globe', () => {
    const s = reducer({ ...initialState, variable: 'gistemp', chartVariable: 'gistemp' }, { type: 'chartVariable', id: 'fires' });
    expect(s.variable).toBe('fires');
    // The old layer was only there for the chart: it goes.
    expect(s.extra).toEqual([]);
    expect(s.year).toBeLessThanOrEqual(Number(new Date().toISOString().slice(0, 4)));
  });

  it('a layer chosen apart from the chart stays under the new one', () => {
    const s = reducer({ ...initialState, variable: 'truecolor', chartVariable: 'gistemp' }, { type: 'chartVariable', id: 'precip' });
    expect(s.variable).toBe('precip');
    expect(s.extra).toEqual(['truecolor']);
  });
});

describe('years picked one by one', () => {
  it('adds and removes years, keeps them sorted and moves the globe to the new one', () => {
    let s = reducer({ ...initialState, yearMode: 'years', years: [2010] }, { type: 'toggleYear', year: 2024 });
    s = reducer(s, { type: 'toggleYear', year: 2015 });
    expect(s.years).toEqual([2010, 2015, 2024]);
    expect(s.year).toBe(2015);
    s = reducer(s, { type: 'toggleYear', year: 2010 });
    expect(s.years).toEqual([2015, 2024]);
  });

  it('two or more picked years are the shutter on the globe: the earliest left, the new one right', () => {
    let s = reducer({ ...initialState, variable: 't2m', chartVariable: 't2m' }, { type: 'yearMode', mode: 'years' });
    s = reducer(s, { type: 'toggleYear', year: 2000 });
    expect(s.compare).toBeNull();
    s = reducer(s, { type: 'toggleYear', year: 2020 });
    expect(s).toMatchObject({ compare: 2000, year: 2020 });
    s = reducer(s, { type: 'toggleYear', year: 2010 });
    expect(s).toMatchObject({ compare: 2000, year: 2010, years: [2000, 2010, 2020] });
    // Back to one year: no shutter.
    s = reducer(reducer(s, { type: 'toggleYear', year: 2000 }), { type: 'toggleYear', year: 2010 });
    expect(s).toMatchObject({ compare: null, year: 2020, years: [2020] });
    // A period has no shutter.
    s = reducer(reducer(s, { type: 'toggleYear', year: 1990 }), { type: 'yearMode', mode: 'period' });
    expect(s.compare).toBeNull();
  });

  it('the shutter on the timeline picks its two years in the analysis, and its sliders move them', () => {
    let s = reducer({ ...initialState, variable: 't2m', year: 2024 }, { type: 'compare', year: 1990 });
    expect(s).toMatchObject({ yearMode: 'years', years: [1990, 2024], compare: 1990 });
    s = reducer(s, { type: 'compare', year: 1995 });
    expect(s.years).toEqual([1995, 2024]);
    s = reducer(s, { type: 'compareRight', year: 2015 });
    expect(s).toMatchObject({ year: 2015, years: [1995, 2015] });
    // Closing the shutter leaves the right-hand year picked.
    s = reducer(s, { type: 'compare', year: null });
    expect(s).toMatchObject({ compare: null, years: [2015] });
    // One picked year follows the map year.
    expect(reducer(s, { type: 'year', year: 2003 }).years).toEqual([2003]);
  });

  it('picking years puts the chart layer on an empty globe, so the shutter has something to show', () => {
    const s = reducer(reducer({ ...initialState, chartVariable: 'precip' }, { type: 'toggleYear', year: 2000 }), { type: 'toggleYear', year: 2010 });
    expect(s.variable).toBe('precip');
    expect(s.compare).toBe(2000);
  });

  it('never leaves no year at all', () => {
    const s = reducer({ ...initialState, yearMode: 'years', years: [2020] }, { type: 'toggleYear', year: 2020 });
    expect(s.years).toEqual([2020]);
  });

  it('a single year and a two-year period survive the link', () => {
    const one = fromQuery(`?${toQuery({ ...initialState, yearMode: 'years', years: [2012, 2024] }, null)}`).state;
    expect(one.yearMode).toBe('years');
    expect(one.years).toEqual([2012, 2024]);
    expect(fromQuery('?p=2020-2021').state).toMatchObject({ from: 2020, to: 2021 });
  });

  it('the Cities layer survives the link', () => {
    const q = toQuery({ ...initialState, cities: true }, null);
    expect(q).toContain('on=cities');
    expect(fromQuery(`?${q}`).state.cities).toBe(true);
  });
});
