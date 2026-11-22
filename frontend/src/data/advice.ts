// The advice of the day for a city: whether to air the rooms, go for a walk or a run, mind the
// sun or the dust. Worked out only from the forecast and the air model (and a station's
// measurement when there is one), with the reasons, so the page can say why.

export type Level = 'good' | 'ok' | 'bad';

export type Reason =
  | { kind: 'aqi'; value: number; measured: boolean }
  | { kind: 'heat'; value: number }
  | { kind: 'cold'; value: number }
  | { kind: 'gust'; value: number }
  | { kind: 'rain'; value: number }
  | { kind: 'storm' }
  | { kind: 'dust'; value: number };

export type Advice =
  | { id: 'airing'; level: Level; hour: number | null; aqi: number | null; reasons: Reason[] }
  | { id: 'walk' | 'run'; level: Level; reasons: Reason[] }
  | { id: 'uv'; level: Level; value: number; hour: number }
  | { id: 'dust'; level: Level; value: number; hour: number };

export type AdviceInput = {
  /** Moments (ms) of the hourly values below. */
  t: number[];
  feels: number[];
  rainChance: (number | null)[];
  rain: number[];
  code: number[];
  gust: number[];
  uv: (number | null)[];
  /** The air model, on its own hours. */
  air: { t: number[]; aqi: (number | null)[]; dust: (number | null)[] } | null;
  /** A station's AQI measured in the last hours, if one is near. */
  measuredAqi: number | null;
  now: number;
};

const rank: Record<Level, number> = { good: 0, ok: 1, bad: 2 };
const worst = (levels: Level[]): Level => levels.reduce<Level>((a, b) => (rank[b] > rank[a] ? b : a), 'good');

/** Indices of the hours from now on, `hours` of them. */
function ahead(t: number[], now: number, hours: number): number[] {
  const from = now - 30 * 60_000;
  const out: number[] = [];
  for (let i = 0; i < t.length && out.length < hours; i++) if (t[i] >= from) out.push(i);
  return out;
}

function airAt(input: AdviceInput, at: number, key: 'aqi' | 'dust'): number | null {
  const a = input.air;
  if (!a) return null;
  let best = -1;
  for (let i = 0; i < a.t.length; i++) if (best < 0 || Math.abs(a.t[i] - at) < Math.abs(a.t[best] - at)) best = i;
  return best >= 0 && Math.abs(a.t[best] - at) <= 90 * 60_000 ? a[key][best] : null;
}

/** Outdoors: the air, heat or cold, wind, rain and storms over the next hours. */
function outdoors(input: AdviceInput, strict: boolean): { level: Level; reasons: Reason[] } {
  const hours = ahead(input.t, input.now, 3);
  const reasons: { level: Level; reason: Reason }[] = [];
  const model = airAt(input, input.now, 'aqi');
  const aqi = input.measuredAqi ?? model;
  if (aqi !== null) {
    const r: Reason = { kind: 'aqi', value: aqi, measured: input.measuredAqi !== null };
    if (aqi > 150 || (strict && aqi > 100)) reasons.push({ level: 'bad', reason: r });
    else if (aqi > 100 || (strict && aqi > 50)) reasons.push({ level: 'ok', reason: r });
  }
  const feels = hours.map((i) => input.feels[i]).filter(Number.isFinite);
  if (feels.length) {
    const hi = Math.max(...feels);
    const lo = Math.min(...feels);
    const [hot, tooHot, cold, tooCold] = strict ? [25, 30, -10, -18] : [30, 35, -15, -22];
    if (hi > tooHot) reasons.push({ level: 'bad', reason: { kind: 'heat', value: hi } });
    else if (hi > hot) reasons.push({ level: 'ok', reason: { kind: 'heat', value: hi } });
    if (lo < tooCold) reasons.push({ level: 'bad', reason: { kind: 'cold', value: lo } });
    else if (lo < cold) reasons.push({ level: 'ok', reason: { kind: 'cold', value: lo } });
  }
  const gust = Math.max(0, ...hours.map((i) => input.gust[i]).filter(Number.isFinite));
  if (gust >= 20) reasons.push({ level: 'bad', reason: { kind: 'gust', value: gust } });
  else if (gust >= (strict ? 12 : 15)) reasons.push({ level: 'ok', reason: { kind: 'gust', value: gust } });
  if (hours.some((i) => input.code[i] >= 95)) reasons.push({ level: 'bad', reason: { kind: 'storm' } });
  const chance = Math.max(0, ...hours.map((i) => input.rainChance[i] ?? 0));
  const rain = Math.max(0, ...hours.map((i) => input.rain[i]).filter(Number.isFinite));
  if (rain >= 1 || chance >= 70) reasons.push({ level: 'ok', reason: { kind: 'rain', value: chance } });
  return { level: worst(reasons.map((r) => r.level)), reasons: reasons.map((r) => r.reason) };
}

export function dayAdvice(input: AdviceInput): Advice[] {
  const out: Advice[] = [];

  // Airing: the cleanest hour of the next twelve, kept away from rain.
  const a = input.air;
  if (a) {
    const hours = ahead(a.t, input.now, 12).filter((i) => a.aqi[i] !== null);
    if (hours.length) {
      const best = hours.reduce((x, y) => (a.aqi[y]! < a.aqi[x]! ? y : x));
      const value = a.aqi[best]!;
      const measuredBad = input.measuredAqi !== null && input.measuredAqi > 100;
      const level: Level = value > 100 ? 'bad' : value > 50 || measuredBad ? 'ok' : 'good';
      const reasons: Reason[] = measuredBad ? [{ kind: 'aqi', value: input.measuredAqi!, measured: true }] : [];
      out.push({ id: 'airing', level, hour: a.t[best], aqi: value, reasons });
    }
  }

  out.push({ id: 'walk', ...outdoors(input, false) });
  out.push({ id: 'run', ...outdoors(input, true) });

  // The sun: the strongest UV of the next twelve hours, when it calls for care (index 3 and up).
  const day = ahead(input.t, input.now, 12).filter((i) => input.uv[i] !== null);
  if (day.length) {
    const top = day.reduce((x, y) => (input.uv[y]! > input.uv[x]! ? y : x));
    const uv = input.uv[top]!;
    if (uv >= 3) out.push({ id: 'uv', level: uv >= 6 ? 'bad' : 'ok', value: uv, hour: input.t[top] });
  }

  // Desert dust over the next day.
  if (a) {
    const next = ahead(a.t, input.now, 24).filter((i) => a.dust[i] !== null);
    if (next.length) {
      const top = next.reduce((x, y) => (a.dust[y]! > a.dust[x]! ? y : x));
      const dust = a.dust[top]!;
      if (dust >= 50) out.push({ id: 'dust', level: dust >= 100 ? 'bad' : 'ok', value: dust, hour: a.t[top] });
    }
  }
  return out;
}
