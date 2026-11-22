import { describe, expect, it } from 'vitest';
import { dayAdvice, type AdviceInput } from './advice';

const H = 3600_000;
const NOW = Date.UTC(2026, 10, 22, 9);

/** Twelve calm, mild hours with clean air; each test spoils one thing. */
function calm(over: Partial<AdviceInput> = {}, aqi: (h: number) => number = () => 20, dust: (h: number) => number = () => 2): AdviceInput {
  const t = Array.from({ length: 24 }, (_, h) => NOW + (h - 2) * H);
  return {
    t,
    feels: t.map(() => 15),
    rainChance: t.map(() => 10),
    rain: t.map(() => 0),
    code: t.map(() => 1),
    gust: t.map(() => 5),
    uv: t.map(() => 1),
    air: { t, aqi: t.map((_, h) => aqi(h)), dust: t.map((_, h) => dust(h)) },
    measuredAqi: null,
    now: NOW,
    ...over,
  };
}

const find = (list: ReturnType<typeof dayAdvice>, id: string) => list.find((a) => a.id === id);

describe('advice of the day', () => {
  it('a calm day with clean air: everything is good, no sun or dust warnings', () => {
    const a = dayAdvice(calm());
    expect(a.map((x) => x.id)).toEqual(['airing', 'walk', 'run']);
    expect(a.every((x) => x.level === 'good')).toBe(true);
  });

  it('airing: the cleanest of the next twelve hours, never one in the past', () => {
    // Hour index 0 and 1 are in the past and clean; index 7 is the cleanest ahead.
    const a = find(dayAdvice(calm({}, (h) => (h < 2 ? 5 : h === 7 ? 30 : 80))), 'airing');
    expect(a).toMatchObject({ level: 'good', aqi: 30, hour: NOW + 5 * H });
  });

  it('smog: no airing, a walk only with care, no run', () => {
    const a = dayAdvice(calm({}, () => 130));
    expect(find(a, 'airing')!.level).toBe('bad');
    expect(find(a, 'walk')!.level).toBe('ok');
    expect(find(a, 'run')!.level).toBe('bad');
  });

  it('a station measurement counts before the model', () => {
    const a = dayAdvice(calm({ measuredAqi: 160 }));
    expect(find(a, 'walk')).toMatchObject({ level: 'bad', reasons: [{ kind: 'aqi', value: 160, measured: true }] });
    expect(find(a, 'airing')!.level).toBe('ok');
  });

  it('heat, gusts and storms', () => {
    const hot = calm();
    hot.feels = hot.feels.map(() => 33);
    expect(find(dayAdvice(hot), 'walk')!.level).toBe('ok');
    expect(find(dayAdvice(hot), 'run')!.level).toBe('bad');

    const storm = calm();
    storm.code = storm.code.map((c, i) => (i === 3 ? 95 : c));
    expect(find(dayAdvice(storm), 'walk')).toMatchObject({ level: 'bad', reasons: [{ kind: 'storm' }] });

    const windy = calm();
    windy.gust = windy.gust.map(() => 16);
    expect(find(dayAdvice(windy), 'walk')!.level).toBe('ok');
  });

  it('rain only asks for an umbrella', () => {
    const wet = calm();
    wet.rainChance = wet.rainChance.map(() => 90);
    expect(find(dayAdvice(wet), 'walk')).toMatchObject({ level: 'ok', reasons: [{ kind: 'rain', value: 90 }] });
  });

  it('strong sun and desert dust are mentioned with their hour', () => {
    const sunny = calm({}, () => 20, (h) => (h === 10 ? 140 : 10));
    sunny.uv = sunny.uv.map((_, h) => (h === 6 ? 7 : 2));
    const a = dayAdvice(sunny);
    expect(find(a, 'uv')).toMatchObject({ level: 'bad', value: 7, hour: NOW + 4 * H });
    expect(find(a, 'dust')).toMatchObject({ level: 'bad', value: 140, hour: NOW + 8 * H });
  });

  it('without the air model there is no airing advice, the rest still works', () => {
    const a = dayAdvice(calm({ air: null }));
    expect(a.map((x) => x.id)).toEqual(['walk', 'run']);
  });
});
