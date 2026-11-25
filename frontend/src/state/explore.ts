// State of the 3D Earth page and its share-link encoding.

import type { Region, Season } from '../analysis/series';
import { cases, type Case, type GistempMode } from '../data/cases';
import { countries } from '../data/countries';
import { variableById, type VariableId } from '../data/variables';

export type Panel = 'layers' | 'fires' | 'ukraine' | 'weather' | 'cases' | 'glossary' | 'share';
/** How the globe is lit: evenly, by the real Sun (night side with city lights), or all night. */
export type Light = 'flat' | 'sun' | 'night';
/** A GFS field draped over the globe. */
export type WeatherField = 'none' | 'wind' | 'temp' | 'precip' | 'cloud';
export type Slot = 'A' | 'B';
/** How the chart shows time: yearly values, monthly, daily, or the seasonal cycle. */
export type ChartView = 'year' | 'month' | 'day' | 'cycle';
/** What a click on the globe picks for a region: the point (with a radius) or the whole country. */
export type PickMode = 'point' | 'country';
/** Which years the analysis looks at: a period from-to, or years picked one by one. */
export type YearMode = 'period' | 'years';
export type LabelLayers = { capitals: boolean; seas: boolean; rivers: boolean };
export type WeatherPlace = { lat: number; lon: number; name?: { uk: string; en: string } };

export type ExploreState = {
  /** The main layer on the globe (its legend, years and readout); null shows the plain Earth. */
  variable: VariableId | null;
  /** Layers shown together with the main one, oldest first. */
  extra: VariableId[];
  gistempMode: GistempMode;
  /** Map year, and month for monthly imagery. */
  year: number;
  month: number;
  /** An exact day for daily imagery (YYYY-MM-DD), set by an event; null uses the layer's own day. */
  day: string | null;
  /** Period for trends, comparisons and the chart. */
  from: number;
  to: number;
  /** A period, or years picked one by one (`years`, sorted). */
  yearMode: YearMode;
  years: number[];
  season: Season;
  borders: boolean;
  /** Capitals, seas and rivers, shown with the borders. */
  labels: LabelLayers;
  /** Ukraine war layer (official list of occupied territories and hostilities). */
  war: boolean;
  regionA: Region | null;
  regionB: Region | null;
  /** The next click on the globe sets this region. */
  picking: Slot | null;
  radiusKm: number;
  pickMode: PickMode;
  chartView: ChartView;
  /** Place for the weather panel: the last place clicked or searched. */
  weatherAt: WeatherPlace;
  /** Variable for the chart when it differs from the map. */
  chartVariable: VariableId;
  caseId: string | null;
  panel: Panel | null;
  analysisOpen: boolean;
  playing: boolean;
  speed: 1 | 2 | 4;
  /** Before/after shutter: the year on the left of the globe, or null when off. */
  compare: number | null;
  /** Map style: shaded relief under the imagery, and the lighting. */
  relief: boolean;
  light: Light;
  /** Fires of the last 48 hours (NASA FIRMS). */
  liveFires: boolean;
  /** Big cities of the world as dots with names (Natural Earth). */
  cities: boolean;
  /** Ukraine card layers: air quality (SaveEcoBot), radiation (SaveEcoBot stations), the front (DeepState). */
  aqi: boolean;
  radiation: boolean;
  front: boolean;
  /** Blackout: night lights over Ukraine before and during the November 2022 blackouts. */
  blackout: boolean;
  /** Wind on the globe as moving lines, and a weather field under it (NOAA GFS). */
  wind: boolean;
  field: WeatherField;
};

export const initialState: ExploreState = {
  variable: null,
  extra: [],
  gistempMode: 'trend',
  year: 2025,
  month: 7,
  day: null,
  from: 1960,
  to: 2025,
  yearMode: 'period',
  years: [],
  season: 'year',
  borders: false,
  labels: { capitals: true, seas: true, rivers: true },
  war: false,
  regionA: null,
  regionB: null,
  picking: null,
  radiusKm: 250,
  pickMode: 'point',
  chartView: 'year',
  weatherAt: { lat: 50.45, lon: 30.52, name: { uk: 'Київ', en: 'Kyiv' } },
  chartVariable: 'gistemp',
  caseId: null,
  panel: null,
  analysisOpen: false,
  playing: false,
  speed: 1,
  compare: null,
  relief: true,
  light: 'flat',
  liveFires: false,
  cities: false,
  aqi: false,
  radiation: false,
  front: false,
  blackout: false,
  wind: false,
  field: 'none',
};

export type Action =
  /** Turns a layer on as the main one (the others stay on under it); null turns every layer off. */
  | { type: 'variable'; id: VariableId | null }
  /** Turns one layer off, leaving the rest. */
  | { type: 'layerOff'; id: VariableId }
  /** Every data layer and switch off (borders and cities stay). */
  | { type: 'allOff' }
  | { type: 'yearMode'; mode: YearMode }
  /** The right-hand year of the shutter moved (the left one moves with `compare`). */
  | { type: 'compareRight'; year: number }
  /** Adds a year to the picked ones, or takes it away if it is there. */
  | { type: 'toggleYear'; year: number }
  | { type: 'mode'; mode: GistempMode }
  | { type: 'year'; year: number }
  | { type: 'month'; month: number }
  | { type: 'period'; from: number; to: number }
  | { type: 'season'; season: Season }
  | { type: 'borders'; on: boolean }
  | { type: 'labels'; labels: Partial<LabelLayers> }
  | { type: 'pickMode'; mode: PickMode }
  | { type: 'chartView'; view: ChartView }
  | { type: 'weatherAt'; place: WeatherPlace }
  | { type: 'war'; on: boolean }
  | { type: 'region'; slot: Slot; region: Region | null }
  | { type: 'picking'; slot: Slot | null }
  | { type: 'radius'; km: number }
  | { type: 'chartVariable'; id: VariableId }
  | { type: 'panel'; panel: Panel | null }
  | { type: 'analysis'; open: boolean }
  | { type: 'play'; on: boolean }
  | { type: 'speed'; speed: 1 | 2 | 4 }
  | { type: 'compare'; year: number | null }
  | { type: 'case'; c: Case }
  | { type: 'set'; state: Partial<Pick<ExploreState, 'relief' | 'light' | 'liveFires' | 'cities' | 'aqi' | 'radiation' | 'front' | 'wind' | 'field'>> }
  | { type: 'blackout'; on: boolean }
  /** An event's layer on its exact day. */
  | { type: 'show'; variable: VariableId; date: string; /** Keep the main layer on under it. */ keep?: boolean }
  | { type: 'hydrate'; state: Partial<ExploreState> };

/** Numeric variable that best matches the map layer. */
function chartFor(id: VariableId | null, current: VariableId): VariableId {
  if (id && variableById[id].series) return id;
  return current;
}

/** At most this many layers on the globe at once: more would only hide one another. */
export const MAX_LAYERS = 3;
/** At most this many years picked one by one. */
export const MAX_YEARS = 6;

/** The map year moved into a layer's own years. */
function yearFor(id: VariableId | null, year: number): number {
  const img = id ? variableById[id].imagery : undefined;
  if (!img || img.static) return year;
  return Math.min(Number(img.last.slice(0, 4)), Math.max(Number(img.first.slice(0, 4)), year));
}

const uniqueSorted = (years: number[]) => [...new Set(years)].sort((a, b) => a - b);

/**
 * Picked years on the globe: one year as it is; two or more side by side on the shutter, the
 * earliest on the left and `right` (by default the latest) on the right. One way of comparing
 * years: the picks in the analysis and the shutter are the same years.
 */
function showPicks(state: ExploreState, years: number[], right?: number): ExploreState {
  // The shutter needs a layer with years: the chart's own, if the globe has none.
  const layers = state.variable ? {} : withLayer(state, state.chartVariable, true);
  const next: ExploreState = { ...state, ...layers, years, yearMode: 'years', playing: false, day: null };
  if (years.length < 2) return { ...next, compare: null, year: yearFor(next.variable, years[0] ?? state.year) };
  const r = right !== undefined && years.includes(right) && right !== years[0] ? right : years[years.length - 1];
  return { ...next, compare: years[0], year: yearFor(next.variable, r), blackout: false, gistempMode: next.variable === 'gistemp' ? 'year' : next.gistempMode };
}

/** `id` as the main layer; the one it replaces stays on under it unless `replace`. */
function withLayer(state: ExploreState, id: VariableId, replace: boolean): Pick<ExploreState, 'variable' | 'extra'> {
  const keep = [...state.extra, ...(state.variable && !replace ? [state.variable] : [])].filter((x) => x !== id);
  return { variable: id, extra: keep.slice(-(MAX_LAYERS - 1)) };
}

export function reducer(state: ExploreState, action: Action): ExploreState {
  switch (action.type) {
    case 'variable': {
      const id = action.id;
      const layers = id ? withLayer(state, id, false) : { variable: null, extra: [] };
      return {
        ...state,
        ...layers,
        year: yearFor(id, state.year),
        chartVariable: chartFor(id, state.chartVariable),
        caseId: null,
        playing: false,
        day: null,
        blackout: state.blackout && id === 'nightlights',
      };
    }
    case 'layerOff': {
      if (action.id !== state.variable) return { ...state, extra: state.extra.filter((x) => x !== action.id) };
      // The main layer goes: the newest of the others takes its place.
      const next = state.extra[state.extra.length - 1] ?? null;
      return {
        ...state,
        variable: next,
        extra: state.extra.slice(0, -1),
        year: yearFor(next, state.year),
        chartVariable: chartFor(next, state.chartVariable),
        playing: false,
        day: null,
        blackout: state.blackout && next === 'nightlights',
        compare: next ? state.compare : null,
      };
    }
    case 'allOff':
      return {
        ...state,
        variable: null,
        extra: [],
        compare: null,
        blackout: false,
        liveFires: false,
        aqi: false,
        radiation: false,
        front: false,
        war: false,
        wind: false,
        field: 'none',
        playing: false,
        day: null,
        years: state.yearMode === 'years' ? state.years.slice(-1) : state.years,
      };
    case 'yearMode':
      // A period has no shutter; picked years bring theirs back.
      if (action.mode === 'period') return { ...state, yearMode: 'period', compare: state.blackout ? state.compare : null };
      return state.years.length ? showPicks(state, state.years) : { ...state, yearMode: 'years' };
    case 'toggleYear': {
      const on = state.years.includes(action.year);
      if (on && state.years.length === 1) return state;
      if (!on && state.years.length >= MAX_YEARS) return state;
      const years = on ? state.years.filter((y) => y !== action.year) : uniqueSorted([...state.years, action.year]);
      // The year just picked goes on the globe (on the right of the shutter); after a removal the
      // right-hand year stays if it is still picked.
      return showPicks(state, years, on ? state.year : action.year);
    }
    case 'compareRight': {
      if (state.blackout || state.compare === null) return { ...state, year: action.year };
      // The year that was on the right gives way to the new one among the picks.
      const keep = state.yearMode === 'years' ? state.years.filter((y) => y !== state.year) : [];
      const years = uniqueSorted([...keep, state.compare, action.year]).slice(0, MAX_YEARS);
      return { ...state, year: action.year, years, yearMode: 'years', day: state.day?.startsWith(String(action.year)) ? state.day : null };
    }
    case 'mode':
      return { ...state, gistempMode: action.mode, playing: false };
    case 'year': {
      // One picked year follows the map year (not while playing through the years).
      const follow = state.yearMode === 'years' && state.years.length === 1 && state.compare === null && !state.playing;
      return { ...state, year: action.year, years: follow ? [action.year] : state.years, day: state.day?.startsWith(String(action.year)) ? state.day : null };
    }
    case 'compare': {
      // The shutter compares two years of the map, so GISTEMP shows single years.
      const base: ExploreState = {
        ...state,
        compare: action.year,
        blackout: action.year === null ? false : state.blackout,
        playing: false,
        gistempMode: action.year !== null && state.variable === 'gistemp' ? 'year' : state.gistempMode,
      };
      if (state.blackout) return base;
      // The shutter's years are the picked years of the analysis: closing it leaves the right one.
      if (action.year === null) return state.yearMode === 'years' ? { ...base, years: [state.year] } : base;
      const keep = state.yearMode === 'years' ? state.years.filter((y) => y !== state.compare) : [];
      return { ...base, yearMode: 'years', years: uniqueSorted([...keep, action.year, state.year]).slice(0, MAX_YEARS) };
    }
    case 'month':
      return { ...state, month: action.month, day: null };
    case 'period':
      return { ...state, from: Math.min(action.from, action.to), to: Math.max(action.from, action.to) };
    case 'season':
      return { ...state, season: action.season };
    case 'borders':
      return { ...state, borders: action.on };
    case 'labels':
      return { ...state, labels: { ...state.labels, ...action.labels } };
    case 'pickMode':
      return { ...state, pickMode: action.mode };
    case 'chartView':
      return { ...state, chartView: action.view };
    case 'weatherAt':
      return { ...state, weatherAt: action.place };
    case 'war':
      return { ...state, war: action.on };
    case 'region':
      return {
        ...state,
        [action.slot === 'A' ? 'regionA' : 'regionB']: action.region,
        picking: null,
        analysisOpen: action.region ? true : state.analysisOpen,
        caseId: null,
      };
    case 'picking':
      return { ...state, picking: action.slot };
    case 'radius': {
      const resize = (r: Region | null): Region | null => (r?.kind === 'point' && !r.name ? { ...r, radiusKm: action.km } : r);
      return { ...state, radiusKm: action.km, regionA: resize(state.regionA), regionB: resize(state.regionB) };
    }
    case 'chartVariable': {
      // Days exist only for NASA POWER variables, months only for monthly sources.
      const kind = variableById[action.id].series?.kind;
      const view = state.chartView === 'day' && kind !== 'power' ? 'year' : (state.chartView === 'month' || state.chartView === 'cycle') && kind !== 'power' && kind !== 'grid' ? 'year' : state.chartView;
      const next = { ...state, chartVariable: action.id, chartView: view };
      // The globe shows what the chart shows. A layer that was there for the old chart variable
      // makes way; a layer the user chose apart from the chart stays on under the new one.
      if (action.id === state.variable) return next;
      const replace = !state.variable || state.variable === state.chartVariable;
      return {
        ...next,
        ...withLayer(state, action.id, replace),
        year: yearFor(action.id, state.year),
        day: null,
        playing: false,
        blackout: false,
        compare: replace ? null : state.compare,
      };
    }
    case 'panel':
      return { ...state, panel: action.panel };
    case 'analysis':
      return { ...state, analysisOpen: action.open };
    case 'play':
      return { ...state, playing: action.on };
    case 'speed':
      return { ...state, speed: action.speed };
    case 'case': {
      const c = action.c;
      return {
        ...state,
        variable: c.variable,
        gistempMode: c.gistempMode ?? state.gistempMode,
        year: c.year,
        from: c.from,
        to: c.to,
        season: c.season ?? 'year',
        borders: c.borders ?? state.borders,
        extra: [],
        yearMode: 'period',
        war: c.war ?? false,
        regionA: c.regionA ?? null,
        regionB: c.regionB ?? null,
        chartVariable: c.analysisVariable ?? chartFor(c.variable, state.chartVariable),
        chartView: c.chartView ?? 'year',
        caseId: c.id,
        day: null,
        picking: null,
        analysisOpen: true,
        playing: false,
        compare: c.compare ?? null,
      };
    }
    case 'set':
      // Every switch is on its own: turning one on never turns another off.
      return { ...state, ...action.state };
    case 'blackout':
      // Night lights with the shutter: left before (2021), right during the blackouts (2022).
      return action.on
        ? { ...state, blackout: true, variable: 'nightlights', extra: [], year: 2022, compare: 2021, playing: false, caseId: null, day: null }
        : { ...state, blackout: false, compare: null, variable: state.variable === 'nightlights' ? null : state.variable };
    case 'show': {
      const year = Number(action.date.slice(0, 4));
      const month = Number(action.date.slice(5, 7)) || state.month;
      return {
        ...state,
        ...withLayer(state, action.variable, !action.keep),
        year,
        month,
        day: action.date.length === 10 ? action.date : null,
        chartVariable: chartFor(action.variable, state.chartVariable),
        compare: null,
        blackout: false,
        playing: false,
        caseId: null,
        gistempMode: action.variable === 'gistemp' ? 'year' : state.gistempMode,
      };
    }
    case 'hydrate':
      return { ...state, ...action.state };
  }
}

// ---------- Share link ----------

function encodeRegion(r: Region | null): string | null {
  if (!r) return null;
  if (r.kind === 'country') return `c:${r.code}`;
  if (r.kind === 'point') return `p:${r.lat.toFixed(3)},${r.lon.toFixed(3)},${r.radiusKm}`;
  return `b:${r.s},${r.w},${r.n},${r.e}`;
}

function decodeRegion(s: string | null): Region | null {
  if (!s) return null;
  const [kind, rest] = s.split(':');
  if (kind === 'c') {
    // The box is filled in from the Natural Earth outlines once they load.
    const c = countries.find((x) => x.code === rest);
    return c ? { kind: 'country', code: c.code, lat: c.lat, lon: c.lon, box: { s: c.lat - 4, n: c.lat + 4, w: c.lon - 6, e: c.lon + 6 } } : null;
  }
  const n = (rest ?? '').split(',').map(Number);
  if (n.some((x) => !Number.isFinite(x))) return null;
  if (kind === 'p' && n.length === 3) return { kind: 'point', lat: n[0], lon: n[1], radiusKm: n[2] };
  if (kind === 'b' && n.length === 4) return { kind: 'box', s: n[0], w: n[1], n: n[2], e: n[3], name: { uk: 'Регіон', en: 'Region' } };
  return null;
}

export type CameraView = { lat: number; lon: number; distance: number };

export function toQuery(state: ExploreState, view: CameraView | null): string {
  const q = new URLSearchParams();
  if (state.caseId) q.set('case', state.caseId);
  if (state.variable) q.set('v', state.variable);
  if (state.extra.length) q.set('x', state.extra.join(','));
  if (state.variable === 'gistemp') q.set('m', state.gistempMode);
  q.set('y', String(state.year));
  if (state.variable && variableById[state.variable].imagery?.time === 'monthly') q.set('mo', String(state.month));
  if (state.day) q.set('d', state.day);
  q.set('p', `${state.from}-${state.to}`);
  if (state.yearMode === 'years' && state.years.length) q.set('ys', state.years.join(','));
  if (state.season !== 'year') q.set('s', state.season);
  if (state.borders) q.set('b', '1');
  if (state.war) q.set('w', '1');
  const a = encodeRegion(state.regionA);
  const b = encodeRegion(state.regionB);
  if (a) q.set('a', a);
  if (b) q.set('bb', b);
  // The chart follows the map layer unless it was set to something else.
  if (state.chartVariable !== chartFor(state.variable, 'gistemp')) q.set('cv', state.chartVariable);
  if (state.chartView !== 'year') q.set('cr', state.chartView);
  if (state.compare !== null) q.set('cmp', String(state.compare));
  const on = [
    !state.relief && 'sat',
    state.liveFires && 'fires',
    state.cities && 'cities',
    state.aqi && 'aqi',
    state.radiation && 'rad',
    state.front && 'front',
    state.blackout && 'blackout',
    state.wind && 'wind',
  ].filter(Boolean);
  if (on.length) q.set('on', on.join(','));
  if (state.light !== 'flat') q.set('light', state.light);
  if (state.field !== 'none') q.set('f', state.field);
  if (view) q.set('cam', `${view.lat.toFixed(2)},${view.lon.toFixed(2)},${view.distance.toFixed(2)}`);
  return q.toString();
}

export function fromQuery(search: string): { state: Partial<ExploreState>; view: CameraView | null; caseToApply: Case | null } {
  const q = new URLSearchParams(search);
  const state: Partial<ExploreState> = {};
  const v = q.get('v');
  if (v && v in variableById) state.variable = v as VariableId;
  const x = (q.get('x') ?? '').split(',').filter((id): id is VariableId => id in variableById && id !== state.variable);
  if (x.length) state.extra = [...new Set(x)].slice(-(MAX_LAYERS - 1));
  const m = q.get('m');
  if (m === 'year' || m === 'compare' || m === 'trend') state.gistempMode = m;
  const y = Number(q.get('y'));
  if (y > 1800 && y < 2100) state.year = y;
  const mo = Number(q.get('mo'));
  if (mo >= 1 && mo <= 12) state.month = mo;
  const d = q.get('d');
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && state.year === Number(d.slice(0, 4))) state.day = d;
  const [f, t] = (q.get('p') ?? '').split('-').map(Number);
  if (f > 1800 && t >= f) {
    state.from = f;
    state.to = t;
  }
  const ys = (q.get('ys') ?? '')
    .split(',')
    .map(Number)
    .filter((n) => n > 1800 && n < 2100);
  if (ys.length) {
    state.yearMode = 'years';
    state.years = [...new Set(ys)].sort((a, b) => a - b).slice(-MAX_YEARS);
  }
  const s = q.get('s');
  if (s === 'djf' || s === 'mam' || s === 'jja' || s === 'son') state.season = s;
  if (q.get('b') === '1') state.borders = true;
  if (q.get('w') === '1') state.war = true;
  const a = decodeRegion(q.get('a'));
  const b = decodeRegion(q.get('bb'));
  if (a) {
    state.regionA = a;
    state.analysisOpen = true;
  }
  if (b) state.regionB = b;
  const cv = q.get('cv');
  if (cv && cv in variableById && variableById[cv as VariableId].series) state.chartVariable = cv as VariableId;
  // A link with a layer and no chart (from "Ask the Earth", say) charts that layer.
  else if (state.variable) state.chartVariable = chartFor(state.variable, 'gistemp');
  const cr = q.get('cr');
  if (cr === 'month' || cr === 'day' || cr === 'cycle') state.chartView = cr;
  const cmp = Number(q.get('cmp'));
  if (cmp > 1800 && cmp < 2100) state.compare = cmp;
  const on = new Set((q.get('on') ?? '').split(','));
  if (on.has('sat')) state.relief = false;
  if (on.has('fires')) state.liveFires = true;
  if (on.has('cities')) state.cities = true;
  if (on.has('aqi')) state.aqi = true;
  if (on.has('rad')) state.radiation = true;
  if (on.has('front')) state.front = true;
  if (on.has('blackout') && state.variable === 'nightlights') state.blackout = true;
  if (on.has('wind')) state.wind = true;
  const panel = q.get('panel');
  if (panel === 'fires' || panel === 'ukraine' || panel === 'weather' || panel === 'layers' || panel === 'cases' || panel === 'glossary' || panel === 'share') state.panel = panel;
  const light = q.get('light');
  if (light === 'sun' || light === 'night') state.light = light;
  const fld = q.get('f');
  if (fld === 'wind' || fld === 'temp' || fld === 'precip' || fld === 'cloud') state.field = fld;
  const cam = (q.get('cam') ?? '').split(',').map(Number);
  const view = cam.length === 3 && cam.every(Number.isFinite) ? { lat: cam[0], lon: cam[1], distance: cam[2] } : null;
  const caseToApply = cases.find((c) => c.id === q.get('case')) ?? null;
  return { state, view, caseToApply };
}
