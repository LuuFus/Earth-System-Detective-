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
export type LabelLayers = { capitals: boolean; seas: boolean; rivers: boolean };
export type WeatherPlace = { lat: number; lon: number; name?: { uk: string; en: string } };

export type ExploreState = {
  /** Layer on the globe; null shows the plain Earth. */
  variable: VariableId | null;
  gistempMode: GistempMode;
  /** Map year, and month for monthly imagery. */
  year: number;
  month: number;
  /** An exact day for daily imagery (YYYY-MM-DD), set by an event; null uses the layer's own day. */
  day: string | null;
  /** Period for trends, comparisons and the chart. */
  from: number;
  to: number;
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
  /** Ukraine card layers: air quality (SaveEcoBot), radiation (Safecast), the front (DeepState). */
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
  gistempMode: 'trend',
  year: 2025,
  month: 7,
  day: null,
  from: 1960,
  to: 2025,
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
  aqi: false,
  radiation: false,
  front: false,
  blackout: false,
  wind: false,
  field: 'none',
};

export type Action =
  | { type: 'variable'; id: VariableId | null }
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
  | { type: 'set'; state: Partial<Pick<ExploreState, 'relief' | 'light' | 'liveFires' | 'aqi' | 'radiation' | 'front' | 'wind' | 'field'>> }
  | { type: 'blackout'; on: boolean }
  /** An event's layer on its exact day. */
  | { type: 'show'; variable: VariableId; date: string }
  | { type: 'hydrate'; state: Partial<ExploreState> };

/** Numeric variable that best matches the map layer. */
function chartFor(id: VariableId | null, current: VariableId): VariableId {
  if (id && variableById[id].series) return id;
  return current;
}

export function reducer(state: ExploreState, action: Action): ExploreState {
  switch (action.type) {
    case 'variable': {
      const v = action.id ? variableById[action.id] : null;
      let { year } = state;
      if (v?.imagery) {
        const last = Number(v.imagery.last.slice(0, 4));
        const first = Number(v.imagery.first.slice(0, 4));
        year = Math.min(last, Math.max(first, year));
      }
      return { ...state, variable: action.id, year, chartVariable: chartFor(action.id, state.chartVariable), caseId: null, playing: false, day: null, blackout: state.blackout && action.id === 'nightlights' };
    }
    case 'mode':
      return { ...state, gistempMode: action.mode, playing: false };
    case 'year':
      return { ...state, year: action.year, day: state.day?.startsWith(String(action.year)) ? state.day : null };
    case 'compare':
      // The shutter compares two years of the map, so GISTEMP shows single years.
      return {
        ...state,
        compare: action.year,
        blackout: action.year === null ? false : state.blackout,
        playing: false,
        gistempMode: action.year !== null && state.variable === 'gistemp' ? 'year' : state.gistempMode,
      };
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
      return { ...state, chartVariable: action.id, chartView: view };
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
      return { ...state, ...action.state };
    case 'blackout':
      // Night lights with the shutter: left before (2021), right during the blackouts (2022).
      return action.on
        ? { ...state, blackout: true, variable: 'nightlights', year: 2022, compare: 2021, playing: false, caseId: null, day: null }
        : { ...state, blackout: false, compare: null, variable: state.variable === 'nightlights' ? null : state.variable };
    case 'show': {
      const year = Number(action.date.slice(0, 4));
      const month = Number(action.date.slice(5, 7)) || state.month;
      return {
        ...state,
        variable: action.variable,
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
  if (state.variable === 'gistemp') q.set('m', state.gistempMode);
  q.set('y', String(state.year));
  if (state.variable && variableById[state.variable].imagery?.time === 'monthly') q.set('mo', String(state.month));
  if (state.day) q.set('d', state.day);
  q.set('p', `${state.from}-${state.to}`);
  if (state.season !== 'year') q.set('s', state.season);
  if (state.borders) q.set('b', '1');
  if (state.war) q.set('w', '1');
  const a = encodeRegion(state.regionA);
  const b = encodeRegion(state.regionB);
  if (a) q.set('a', a);
  if (b) q.set('bb', b);
  if (state.chartVariable !== 'gistemp') q.set('cv', state.chartVariable);
  if (state.chartView !== 'year') q.set('cr', state.chartView);
  if (state.compare !== null) q.set('cmp', String(state.compare));
  const on = [
    !state.relief && 'sat',
    state.liveFires && 'fires',
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
  const m = q.get('m');
  if (m === 'year' || m === 'compare' || m === 'trend') state.gistempMode = m;
  const y = Number(q.get('y'));
  if (y > 1800 && y < 2100) state.year = y;
  const mo = Number(q.get('mo'));
  if (mo >= 1 && mo <= 12) state.month = mo;
  const d = q.get('d');
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && state.year === Number(d.slice(0, 4))) state.day = d;
  const [f, t] = (q.get('p') ?? '').split('-').map(Number);
  if (f > 1800 && t > f) {
    state.from = f;
    state.to = t;
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
  const cr = q.get('cr');
  if (cr === 'month' || cr === 'day' || cr === 'cycle') state.chartView = cr;
  const cmp = Number(q.get('cmp'));
  if (cmp > 1800 && cmp < 2100) state.compare = cmp;
  const on = new Set((q.get('on') ?? '').split(','));
  if (on.has('sat')) state.relief = false;
  if (on.has('fires')) state.liveFires = true;
  if (on.has('aqi')) state.aqi = true;
  if (on.has('rad')) state.radiation = true;
  if (on.has('front')) state.front = true;
  if (on.has('blackout') && state.variable === 'nightlights') state.blackout = true;
  if (on.has('wind')) state.wind = true;
  const panel = q.get('panel');
  if (panel === 'fires' || panel === 'ukraine' || panel === 'weather' || panel === 'layers' || panel === 'cases') state.panel = panel;
  const light = q.get('light');
  if (light === 'sun' || light === 'night') state.light = light;
  const fld = q.get('f');
  if (fld === 'wind' || fld === 'temp' || fld === 'precip' || fld === 'cloud') state.field = fld;
  const cam = (q.get('cam') ?? '').split(',').map(Number);
  const view = cam.length === 3 && cam.every(Number.isFinite) ? { lat: cam[0], lon: cam[1], distance: cam[2] } : null;
  const caseToApply = cases.find((c) => c.id === q.get('case')) ?? null;
  return { state, view, caseToApply };
}
