// "Ask the Earth": a question in plain words ("Чи теплішає в Черкасах?") becomes a topic and a
// place, and the answer is worked out from the same data the site shows elsewhere — no AI yet.
// The parser knows a few dozen word stems in Ukrainian and English; a model such as Claude can
// later take its place behind the same `answerQuestion` (the page would not change).

import { loadSeries, type Region } from '../analysis/series';
import { trendStats, verdict } from '../analysis/stats';
import { loadCityAir, loadCityWeather, nearestStation, searchCities, type City } from './city';
import { countries } from './countries';
import { countryName } from './geo';
import { loadFires, type LiveManifest } from './live';
import { distanceKm, PointIndex } from './nearby';
import { loadRadiation, nearestRad } from './radiation';
import { variableById } from './variables';

export type Topic = 'warming' | 'rain' | 'snow' | 'air' | 'fires' | 'weather' | 'war' | 'ice' | 'radiation';
export type When = 'now' | 'today' | 'tomorrow' | null;
export type Parsed = { topic: Topic | null; when: When; places: string[]; mine: boolean };

/** Word stems per topic, checked in this order (the first match wins): radiation before war, so
 * "Яка радіація в Чорнобилі?" is about radiation, not the war. */
const TOPICS: [Topic, string[]][] = [
  ['radiation', ['радіац', 'радіоакт', 'дозиметр', 'гамма', 'зіверт', 'фон радіа', 'radiat', 'radioact', 'dosimeter', 'gamma', 'sievert']],
  ['war', ['війн', 'фронт', 'окупац', 'каховк', 'азовстал', 'чорнобил', 'заес', ' war ', ' wars ', 'front line', 'occupation', 'kakhovka', 'azovstal', 'chornobyl', 'chernobyl']],
  ['fires', ['пожеж', 'горить', 'горять', 'вогонь', 'вогні', 'палає', 'згорі', 'fire', 'burn', 'blaze']],
  ['air', ['повітр', 'забрудн', 'смог', 'дим', 'дихат', 'aqi', 'pm2', 'air', 'pollut', 'smog', 'smoke', 'breath']],
  ['ice', ['льод', 'лід ', 'арктик', 'антарктик', 'ice', 'arctic', 'antarctic', 'glacier']],
  ['snow', ['сніг', 'снігу', 'снігом', 'snow']],
  ['rain', ['дощ', 'опад', 'злив', 'посух', 'засух', 'rain', 'precip', 'drought', 'wetter', 'drier']],
  ['weather', ['погод', 'прогноз', 'вітер', 'вітр', 'парасол', 'weather', 'forecast', 'wind', 'umbrella']],
  ['warming', ['тепл', 'потепл', 'спек', 'жарк', 'жар', 'температур', 'холод', 'похолод', 'клімат', 'warm', 'hot', 'heat', 'temperat', 'cold', 'climate']],
];

const WHEN: [When, string[]][] = [
  ['tomorrow', ['завтра', 'tomorrow']],
  ['today', ['сьогодні', 'today', 'tonight', 'ввечері']],
  ['now', ['зараз', 'тепер', 'now', 'right now']],
];

/** Words before a place name. */
const BEFORE_PLACE = new Set(['в', 'у', 'на', 'біля', 'для', 'під', 'над', 'по', 'із', 'з', 'in', 'at', 'near', 'around', 'for', 'over', 'of']);
const MINE = ['моєму місті', 'моєму місці', 'у мене', 'тут', 'my city', 'where i live', 'here'];

/** Ukrainian case endings to try taking off a place name ("Черкасах" -> "Черкас"). */
const ENDINGS = ['ах', 'ях', 'ами', 'ями', 'ові', 'еві', 'ам', 'ям', 'ою', 'ею', 'ій', 'ом', 'ем', 'ів', 'і', 'у', 'ю', 'а', 'я', 'е', 'и'];

export function stems(word: string): string[] {
  const w = word.trim();
  const out = [w];
  for (const e of ENDINGS) if (w.length - e.length >= 3 && w.toLowerCase().endsWith(e)) out.push(w.slice(0, -e.length));
  // The vowel of the last syllable changes with the case: Харків - Харкова, Львів - Львові,
  // Київ - Києві. Put the name-form back, first, since it is the likeliest.
  const back: string[] = [];
  for (const x of out) {
    const m = /^(.*)([оеє])([бвгґджзклмнпрстфхцчшщ])$/i.exec(x);
    if (m) back.push(`${m[1]}${m[2].toLowerCase() === 'є' ? 'ї' : 'і'}${m[3]}`);
  }
  // Names ending in a soft sign lose it in the cases: Чорнобиль - Чорнобилі, Ірпінь - Ірпеня.
  const soft = out.slice(1).filter((x) => /[бвгґджзклмнпрстфхцчшщ]$/i.test(x)).map((x) => `${x}ь`);
  return [...new Set([...back, ...soft, ...out])];
}

export function parseQuestion(text: string): Parsed {
  const low = ` ${text.toLowerCase().replace(/[?!.,;:«»"“”()]/g, ' ').replace(/\s+/g, ' ')} `;
  const topic = TOPICS.find(([, words]) => words.some((w) => low.includes(w)))?.[0] ?? null;
  const when = WHEN.find(([, words]) => words.some((w) => low.includes(` ${w} `)))?.[0] ?? null;
  const mine = MINE.some((m) => low.includes(m));
  // Places: words after "in / at / near" and capitalised words that do not start the sentence.
  const words = text.replace(/[?!.,;:«»"“”()]/g, ' ').split(/\s+/).filter(Boolean);
  const places: string[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1]?.toLowerCase();
    const capital = /^[A-ZА-ЯІЇЄҐ]/.test(w);
    if ((prev && BEFORE_PLACE.has(prev)) || (capital && i > 0)) {
      // Two capitalised words together are one name ("Нова Каховка", "New York").
      const next = words[i + 1];
      if (next && /^[A-ZА-ЯІЇЄҐ]/.test(next)) places.push(`${w} ${next}`);
      if (!BEFORE_PLACE.has(w.toLowerCase())) places.push(w);
    }
  });
  return { topic, when, places: [...new Set(places)], mine };
}

export type Place = { name: string; lat: number; lon: number; country?: string; region: Region; city: City | null };

/** A place from the question: a country (by the start of its name) or a town (geocoding). */
export async function findPlace(candidates: string[], lang: 'uk' | 'en', signal?: AbortSignal): Promise<Place | null> {
  for (const cand of candidates) {
    for (const s of stems(cand)) {
      const key = s.toLowerCase();
      if (key.length < 4) continue;
      const c = countries.find((x) => countryName(x.code, lang).toLowerCase().startsWith(key) || x.name.toLowerCase().startsWith(key));
      if (c && countryName(c.code, lang).length - key.length <= 3) {
        const name = countryName(c.code, lang);
        return { name, lat: c.lat, lon: c.lon, region: { kind: 'country', code: c.code, lat: c.lat, lon: c.lon, box: { s: c.lat - 4, n: c.lat + 4, w: c.lon - 6, e: c.lon + 6 } }, city: null };
      }
    }
  }
  // Towns: the largest town whose name starts the same; a name exactly as asked gets a head start,
  // not a win, so a village named after a stem ("Черкас") does not beat the city ("Черкаси").
  const EXACT = 50_000;
  for (const cand of candidates) {
    const forms = stems(cand).filter((s) => s.length >= 3);
    let best: City | null = null;
    let bestScore = -1;
    for (const s of forms) {
      const found = await searchCities(s, lang, signal).catch(() => []);
      for (const c of found) {
        const name = c.name.toLowerCase();
        const exact = forms.some((f) => f.toLowerCase() === name);
        if (!exact && !name.startsWith(s.toLowerCase().slice(0, 3))) continue;
        const score = (exact ? EXACT : 0) + (c.population ?? 0);
        if (score > bestScore) {
          best = c;
          bestScore = score;
        }
      }
      if (bestScore >= EXACT * 4) break;
    }
    if (best) return { name: best.name, lat: best.lat, lon: best.lon, country: best.country, region: { kind: 'point', lat: best.lat, lon: best.lon, radiusKm: 25 }, city: best };
  }
  return null;
}

export const placeOfCity = (c: City): Place => ({ name: c.name, lat: c.lat, lon: c.lon, country: c.country, region: { kind: 'point', lat: c.lat, lon: c.lon, radiusKm: 25 }, city: c });

// ---------- answers ----------

export type Link = { label: 'globe' | 'map' | 'city' | 'war' | 'fires'; to: string };

/** What was found, for the dialog to put into words. */
export type Answer =
  | { kind: 'trend'; topic: 'warming' | 'rain'; place: Place; from: number; to: number; change: number; perDecade: number; significant: boolean; links: Link[] }
  | { kind: 'air'; place: Place; model: number | null; measured: { aqi: number; name: string; km: number } | null; links: Link[] }
  | { kind: 'fires'; place: Place; count: number; km: number; nearestKm: number | null; links: Link[] }
  | { kind: 'radiation'; place: Place; usv: number | null; km: number | null; time: string | null; links: Link[] }
  | { kind: 'weather'; place: Place; day: 'today' | 'tomorrow'; tMin: number; tMax: number; rain: number; rainChance: number | null; gust: number; snow: boolean; links: Link[] }
  | { kind: 'snow'; place: Place; days: number; links: Link[] }
  | { kind: 'war'; links: Link[] }
  | { kind: 'ice'; links: Link[] }
  | { kind: 'noPlace'; topic: Topic }
  | { kind: 'unknown' };

const cityLink = (p: Place): Link | null =>
  p.city ? { label: 'city', to: `/city?${new URLSearchParams({ name: p.city.name, lat: p.lat.toFixed(4), lon: p.lon.toFixed(4), ...(p.city.country ? { country: p.city.country } : {}) })}` } : null;
const cam = (p: Place, d: number) => `${p.lat.toFixed(2)},${p.lon.toFixed(2)},${d}`;
const regionParam = (p: Place) => (p.region.kind === 'country' ? `c:${p.region.code}` : `p:${p.lat.toFixed(3)},${p.lon.toFixed(3)},25`);

export async function answerQuestion(q: Parsed, place: Place | null, manifest: LiveManifest | null, signal?: AbortSignal): Promise<Answer> {
  if (!q.topic) return { kind: 'unknown' };
  if (q.topic === 'war') return { kind: 'war', links: [{ label: 'war', to: '/war' }] };
  if (q.topic === 'ice') return { kind: 'ice', links: [{ label: 'globe', to: '/explore?v=seaice&cam=80.00,0.00,2.60' }] };
  if (!place) return { kind: 'noPlace', topic: q.topic };
  const more = [cityLink(place)].filter((x): x is Link => !!x);

  if (q.topic === 'warming' || q.topic === 'rain' || (q.topic === 'weather' && !q.when && !place.city)) {
    const topic = q.topic === 'rain' ? 'rain' : 'warming';
    const variable = variableById[topic === 'rain' ? 'precip' : 't2m'];
    const s = await loadSeries(variable, place.region, 'year');
    const points = s.points.filter((p) => Number.isFinite(p.y));
    const stats = trendStats(points);
    if (!stats) return { kind: 'unknown' };
    const from = points[0].x;
    const to = points[points.length - 1].x;
    return {
      kind: 'trend',
      topic,
      place,
      from,
      to,
      change: stats.sen * (to - from),
      perDecade: stats.sen * 10,
      significant: verdict(stats) === 'significant',
      links: [{ label: 'globe', to: `/explore?v=${variable.id}&a=${regionParam(place)}&cam=${cam(place, place.city ? 1.6 : 2.4)}` }, ...more],
    };
  }
  if (q.topic === 'air') {
    const [air, station] = await Promise.all([loadCityAir(place.lat, place.lon, signal).catch(() => null), nearestStation(place.lat, place.lon, manifest).catch(() => null)]);
    const fresh = station && Date.now() - Date.parse(station.station.time) < 3 * 3600_000 ? station : null;
    return {
      kind: 'air',
      place,
      model: air?.now.aqi ?? null,
      measured: fresh ? { aqi: fresh.station.aqi, name: fresh.station.name ?? fresh.station.city ?? '', km: fresh.km } : null,
      links: [{ label: 'map', to: '/map?mode=ukraine' }, ...more],
    };
  }
  if (q.topic === 'radiation') {
    // The nearest station within 30 km measures the background right there.
    const list = await loadRadiation().catch(() => []);
    const index = list.length ? new PointIndex(list.map((s) => s.lat), list.map((s) => s.lon)) : null;
    const near = nearestRad(index, list, place.lat, place.lon, 30);
    return {
      kind: 'radiation',
      place,
      usv: near?.s.usv ?? null,
      km: near?.km ?? null,
      time: near?.s.time ?? null,
      links: [{ label: 'map', to: '/map?mode=ukraine' }, ...more],
    };
  }
  if (q.topic === 'fires') {
    if (!manifest?.fires) return { kind: 'unknown' };
    const f = await loadFires(manifest);
    const km = place.city ? 50 : 400;
    let count = 0;
    let nearestKm: number | null = null;
    for (let i = 0; i < f.count; i++) {
      if (Math.abs(f.lat[i] - place.lat) > km / 111) continue;
      const d = distanceKm(place.lat, place.lon, f.lat[i], f.lon[i]);
      if (d > km) continue;
      count++;
      if (nearestKm === null || d < nearestKm) nearestKm = d;
    }
    return { kind: 'fires', place, count, km, nearestKm, links: [{ label: 'fires', to: `/explore?panel=fires&on=fires&cam=${cam(place, place.city ? 1.25 : 1.8)}` }, ...more] };
  }
  // The weather (and snow): the forecast for the place.
  const w = await loadCityWeather(place.lat, place.lon, signal);
  if (q.topic === 'snow' && !q.when) {
    const days = w.daily.code.filter((c) => (c >= 71 && c <= 77) || c === 85 || c === 86).length;
    return { kind: 'snow', place, days, links: [{ label: 'globe', to: `/explore?v=snow&cam=${cam(place, 2.2)}` }, ...more] };
  }
  const i = q.when === 'tomorrow' ? 1 : 0;
  const code = w.daily.code[i];
  return {
    kind: 'weather',
    place,
    day: i ? 'tomorrow' : 'today',
    tMin: w.daily.tMin[i],
    tMax: w.daily.tMax[i],
    rain: w.daily.rain[i],
    rainChance: w.daily.rainChance[i],
    gust: w.daily.gust[i],
    snow: (code >= 71 && code <= 77) || code === 85 || code === 86,
    links: [{ label: 'map', to: '/map?mode=weather' }, ...more],
  };
}
