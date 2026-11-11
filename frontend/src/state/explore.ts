// State of the 3D Earth page and its share-link encoding.

import type { Region, Season } from '../analysis/series';
import { cases, type Case, type GistempMode } from '../data/cases';
import { variableById, type VariableId } from '../data/variables';

export type Panel = 'layers' | 'cases' | 'glossary' | 'share';
export type Slot = 'A' | 'B';

export type ExploreState = {
  /** Layer on the globe; null shows the plain Earth. */
  variable: VariableId | null;
  gistempMode: GistempMode;
  /** Map year, and month for monthly imagery. */
  year: number;
  month: number;
  /** Period for trends, comparisons and the chart. */
  from: number;
  to: number;
  season: Season;
  borders: boolean;
  /** Ukraine war layer (official list of occupied territories and hostilities). */
  war: boolean;
  regionA: Region | null;
  regionB: Region | null;
  /** The next click on the globe sets this region. */
  picking: Slot | null;
  radiusKm: number;
  /** Variable for the chart when it differs from the map. */
  chartVariable: VariableId;
  caseId: string | null;
  panel: Panel | null;
  analysisOpen: boolean;
  playing: boolean;
  speed: 1 | 2 | 4;
  /** Before/after shutter: the year on the left of the globe, or null when off. */
  compare: number | null;
};

export const initialState: ExploreState = {
  variable: null,
  gistempMode: 'trend',
  year: 2025,
  month: 7,
  from: 1960,
  to: 2025,
  season: 'year',
  borders: false,
  war: false,
  regionA: null,
  regionB: null,
  picking: null,
  radiusKm: 250,
  chartVariable: 'gistemp',
  caseId: null,
  panel: null,
  analysisOpen: false,
  playing: false,
  speed: 1,
  compare: null,
};

export type Action =
  | { type: 'variable'; id: VariableId | null }
  | { type: 'mode'; mode: GistempMode }
  | { type: 'year'; year: number }
  | { type: 'month'; month: number }
  | { type: 'period'; from: number; to: number }
  | { type: 'season'; season: Season }
  | { type: 'borders'; on: boolean }
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
      return { ...state, variable: action.id, year, chartVariable: chartFor(action.id, state.chartVariable), caseId: null, playing: false };
    }
    case 'mode':
      return { ...state, gistempMode: action.mode, playing: false };
    case 'year':
      return { ...state, year: action.year };
    case 'compare':
      // The shutter compares two years of the map, so GISTEMP shows single years.
      return {
        ...state,
        compare: action.year,
        playing: false,
        gistempMode: action.year !== null && state.variable === 'gistemp' ? 'year' : state.gistempMode,
      };
    case 'month':
      return { ...state, month: action.month };
    case 'period':
      return { ...state, from: Math.min(action.from, action.to), to: Math.max(action.from, action.to) };
    case 'season':
      return { ...state, season: action.season };
    case 'borders':
      return { ...state, borders: action.on };
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
    case 'chartVariable':
      return { ...state, chartVariable: action.id };
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
        caseId: c.id,
        picking: null,
        analysisOpen: true,
        playing: false,
        compare: c.compare ?? null,
      };
    }
    case 'hydrate':
      return { ...state, ...action.state };
  }
}

// ---------- Share link ----------

function encodeRegion(r: Region | null): string | null {
  if (!r) return null;
  if (r.kind === 'point') return `p:${r.lat.toFixed(3)},${r.lon.toFixed(3)},${r.radiusKm}`;
  return `b:${r.s},${r.w},${r.n},${r.e}`;
}

function decodeRegion(s: string | null): Region | null {
  if (!s) return null;
  const [kind, rest] = s.split(':');
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
  q.set('p', `${state.from}-${state.to}`);
  if (state.season !== 'year') q.set('s', state.season);
  if (state.borders) q.set('b', '1');
  if (state.war) q.set('w', '1');
  const a = encodeRegion(state.regionA);
  const b = encodeRegion(state.regionB);
  if (a) q.set('a', a);
  if (b) q.set('bb', b);
  if (state.chartVariable !== 'gistemp') q.set('cv', state.chartVariable);
  if (state.compare !== null) q.set('cmp', String(state.compare));
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
  const cmp = Number(q.get('cmp'));
  if (cmp > 1800 && cmp < 2100) state.compare = cmp;
  const cam = (q.get('cam') ?? '').split(',').map(Number);
  const view = cam.length === 3 && cam.every(Number.isFinite) ? { lat: cam[0], lon: cam[1], distance: cam[2] } : null;
  const caseToApply = cases.find((c) => c.id === q.get('case')) ?? null;
  return { state, view, caseToApply };
}
