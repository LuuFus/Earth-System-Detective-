import { describe, expect, it } from 'vitest';
import { fromQuery, initialState, toQuery } from './explore';

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
