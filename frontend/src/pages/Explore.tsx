import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { countryRegion, regionBox, regionCentre, type Region } from '../analysis/series';
import { CountrySearch, type Found } from '../components/CountrySearch';
import { CityCard } from '../components/studio/CityCard';
import { ForecastPlayer, SmokePlayer } from '../components/studio/SmokePlayer';
import { findHotspots, townsAround, type Hotspot } from '../data/hotspots';
import { smokeSceneFor } from '../data/smokeScenes';
import { useLoaded } from '../hooks/useLoaded';
import { useSmoke, type SmokeTarget } from '../hooks/useSmoke';
import { cityPlace, cityRegion, loadCities, nearestCity, type CityPlace, type WorldCity } from '../data/cities';
import {
  Globe,
  type GlobeApi,
  type GlobeCompare,
  type GlobeField,
  type GlobeHint,
  type GlobeMarker,
  type GlobeOutline,
  type GlobePoint,
  type GlobePoints,
  type GlobeStations,
  type GlobeVector,
  type GlobeView,
  type GlobeWind,
} from '../components/Globe';
import { firesSource } from '../components/globe/mvt';
import { daysSource, gapFilledSource, nativeSource, wmsSource, wmtsSource } from '../components/globe/tiles';
import { AnalysisDrawer } from '../components/studio/AnalysisDrawer';
import { HintCard, HintPreview } from '../components/studio/HintCard';
import { Icon } from '../components/studio/Icon';
import { AirCard } from '../components/studio/AirCard';
import { RadCard } from '../components/studio/RadCard';
import { isOldRad, loadRadiation, nearestRad, RAD_COLORS, radBand, radLabel, type RadStation } from '../data/radiation';
import { CursorInfo } from '../components/studio/CursorInfo';
import { OccupationPlayer } from '../components/studio/OccupationPlayer';
import { loadOccHistory, OccPainter, type OccHistory } from '../data/frontHistory';
import { FiresPanel, MapControls, MapStyle, StoryPlayer, UkrainePanel, WeatherGlobeControls } from '../components/studio/LivePanels';
import { EventsPanel, Flyout, GlossaryPanel, LayersPanel, SharePanel } from '../components/studio/Panels';
import { Rail } from '../components/studio/Rail';
import { Timeline } from '../components/studio/Timeline';
import { WeatherPanel } from '../components/studio/WeatherPanel';
import { TopBar } from '../components/TopBar';
import { cases, type Case } from '../data/cases';
import { eventsFor } from '../data/events';
import { countryAt, countryName, loadBorders, loadCountries, loadLabels, type GeoBorders, type GeoCountry, type GeoLabels } from '../data/geo';
import { HINT_KINDS, hintById, hints, type Hint } from '../data/hints';
import { cellIndex } from '../data/gistemp';
import { imageryDate, imageryYears, nearbyDates, variableById, type VariableId } from '../data/variables';
import { isOld, mergeAir, type AirStation } from '../data/air';
import { useWaqi, WAQI_TOKEN } from '../data/waqi';
import { entryText, levelWord, loadColorMap, lookup, type ColorMap } from '../data/colormaps';
import { worldView } from '../data/field';
import { paintFieldAsync } from '../data/fieldPainter';
import { loadAir, loadFires, loadFrame, nearestFrame, useLiveManifest, type AirPoint, type LiveFires, type WeatherFrame } from '../data/live';
import { PointIndex } from '../data/nearby';
import {
  AQI_COLORS,
  aqiBand,
  dailyVersions,
  drawFront,
  FRONT_BOX,
  loadAqi,
  loadFront,
  loadFrontHistory,
  loadStories,
  loadStory,
  type AqiStation,
  type FireStory,
  type FrontArea,
  type FrontVersion,
} from '../data/ukraine';
import { drawWar, loadWar, WAR_BOX, type WarData } from '../data/war';
import { useAnalysis } from '../hooks/useAnalysis';
import { useClimateLayer } from '../hooks/useClimateLayer';
import { useI18n } from '../i18n/I18n';
import { numberFormat, regionName } from '../i18n/format';
import { useLiveText } from '../i18n/live';
import { useStudio } from '../i18n/useStudio';
import { fromQuery, initialState, reducer, toQuery, type ExploreState, type Light, type Slot } from '../state/explore';

const GISTEMP_YEARS: [number, number] = [1880, 2025];
/** Blackout comparison: clear nights over all of Ukraine before the invasion (2021) and during the power cuts (2022). */
const BLACKOUT_DATES: Record<number, string> = { 2021: '2021-10-03', 2022: '2022-11-25' };
const UKRAINE_VIEW = { lat: 48.6, lon: 31.4, distance: 1.55 };
const WMS_LEVEL: Record<string, number> = { '2km': 5, '1km': 6, '500m': 7, '250m': 8 };

/** The 3D Earth studio: globe, tool rail, panels, analysis drawer and timeline. */
/** A hotspot's name: its country, and the biggest town near it (or how far the nearest one is). */
function hotspotName(h: Hotspot, code: string, cities: WorldCity[] | null, lang: 'uk' | 'en'): string {
  const country = code ? countryName(code, lang) : `${h.lat.toFixed(1)}°, ${h.lon.toFixed(1)}°`;
  const close = cities ? townsAround(cities, h.lat, h.lon, 300, 1)[0] : undefined;
  if (close) return lang === 'uk' ? `${country}, біля міста ${close.uk}` : `${country}, near ${close.en}`;
  const far = cities ? nearestCity(cities, h.lat, h.lon, 1500) : null;
  if (!far) return country;
  const km = Math.round(far.km / 10) * 10;
  return lang === 'uk' ? `${country}, ${km} км від міста ${far.city.uk}` : `${country}, ${km} km from ${far.city.en}`;
}


export default function Explore() {
  const { lang, t } = useI18n();
  const s = useStudio();
  const liveText = useLiveText();
  const globe = useRef<GlobeApi | null>(null);
  const initial = useMemo(() => fromQuery(window.location.search), []);
  const [state, dispatch] = useReducer(reducer, initialState, (base): ExploreState => {
    const hydrated = { ...base, ...initial.state };
    return initial.caseToApply ? reducer(hydrated, { type: 'case', c: initial.caseToApply }) : hydrated;
  });
  const [view, setView] = useState<GlobeView | null>(initial.view);
  const [hover, setHover] = useState<GlobePoint | null>(null);
  const onHover = useCallback((p: GlobePoint | null) => {
    setHover(p);
    if (p) setPointerSeen(true);
  }, []);
  const [loading, setLoading] = useState(false);
  const [missedCountry, setMissedCountry] = useState(false);

  // Borders, coastlines, capitals, seas and rivers: loaded the first time the borders go on.
  const [geoLabels, setGeoLabels] = useState<GeoLabels | null>(null);
  const [borderLines, setBorderLines] = useState<GeoBorders | null>(null);
  useEffect(() => {
    if (!state.borders || (geoLabels && borderLines)) return;
    let cancelled = false;
    loadBorders()
      .then((b) => !cancelled && setBorderLines(b))
      .catch(() => undefined);
    loadLabels()
      .then((l) => !cancelled && setGeoLabels(l))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [state.borders, geoLabels, borderLines]);

  // Countries picked as A or B: their outlines on the globe, and their real bounding boxes when
  // they came from a shared link.
  const [countryShapes, setCountryShapes] = useState<Map<string, GeoCountry> | null>(null);
  // Ukraine is outlined whenever borders or any Ukraine layer is on.
  const showUkraine = state.borders || state.aqi || state.front || state.war || state.blackout || state.radiation || state.panel === 'ukraine';
  const needsCountries = state.regionA?.kind === 'country' || state.regionB?.kind === 'country' || state.pickMode === 'country' || showUkraine;
  useEffect(() => {
    if (!needsCountries || countryShapes) return;
    loadCountries()
      .then(setCountryShapes)
      .catch(() => undefined);
  }, [needsCountries, countryShapes]);
  useEffect(() => {
    if (!countryShapes) return;
    const fix = (r: Region | null) => {
      if (r?.kind !== 'country') return null;
      const c = countryShapes.get(r.code);
      return c && (r.box.s !== c.box[0] || r.box.n !== c.box[2]) ? countryRegion(c) : null;
    };
    const a = fix(state.regionA);
    const b = fix(state.regionB);
    if (a || b) dispatch({ type: 'hydrate', state: { ...(a ? { regionA: a } : {}), ...(b ? { regionB: b } : {}) } });
  }, [countryShapes, state.regionA, state.regionB]);
  const outlines = useMemo<GlobeOutline[]>(() => {
    if (!countryShapes) return [];
    const out: GlobeOutline[] = [];
    for (const [id, r] of [['A', state.regionA], ['B', state.regionB]] as const) {
      const c = r?.kind === 'country' ? countryShapes.get(r.code) : null;
      if (c) out.push({ id, rings: c.rings });
    }
    const ua = showUkraine ? countryShapes.get('UA') : null;
    if (ua && !out.some((o) => o.rings === ua.rings)) out.push({ id: 'UA', rings: ua.rings });
    return out;
  }, [countryShapes, state.regionA, state.regionB, showUkraine]);

  const variable = state.variable ? variableById[state.variable] : null;
  const chartVariable = variableById[state.chartVariable];
  const activeCase = cases.find((c) => c.id === state.caseId) ?? null;

  // Camera from the link or the case, once the globe exists.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (initial.view) globe.current?.jumpTo(initial.view.lat, initial.view.lon, initial.view.distance);
      else if (initial.caseToApply) {
        const c = initial.caseToApply.camera;
        globe.current?.flyTo(c.lat, c.lon, c.distance);
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [initial]);

  // Map layers
  const climate = useClimateLayer(state.variable === 'gistemp', state.gistempMode, state.year, state.from, state.to);
  // One map layer for a year: imagery from GIBS for that date.
  const imageryFor = useCallback(
    (year: number) => {
      const img = variable?.imagery;
      if (!img) return null;
      // Daily layers use their own day of the year (ozone hole: 1 October); monthly ones follow the month picker.
      // An event can ask for its exact day; otherwise daily layers use their own day of the year.
      const exact = state.day && img.time === 'daily' && state.day.startsWith(String(year)) && state.day >= img.first && state.day <= img.last ? state.day : null;
      const date = state.blackout && BLACKOUT_DATES[year] ? BLACKOUT_DATES[year] : exact ?? (img.time === 'daily' ? imageryDate(img, year) : imageryDate(img, year, state.month));
      // Points are drawn by the server at a fixed size, so finer levels just make them sharper.
      const wmsLevel = img.points ? 10 : (WMS_LEVEL[img.matrixSet] ?? 6);
      let source =
        img.via === 'mvt' && img.satellites
          ? firesSource(img.satellites, date)
          : img.via === 'wms'
            ? wmsSource(img.layer, wmsLevel, date)
            : wmtsSource(img.layer, img.matrixSet, img.format, img.static ? 'default' : date);
      if (img.gapFill) {
        // Swath gaps: filled from the other satellite of the same day, or left open before it flew.
        const fill = img.gapFill.find((f) => date >= f.first);
        source = gapFilledSource(source, fill ? wmtsSource(fill.layer, img.matrixSet, img.format, date) : null);
      }
      // Daily swaths: gaps between orbits and under clouds are filled from the nearest days.
      if (img.fillDays) source = daysSource(source, nearbyDates(img, date, img.fillDays).map((d) => wmtsSource(img.layer, img.matrixSet, img.format, d)));
      // Coarse grids: one level stretched smoothly; land-only data grown a little so the coast cut is clean.
      if (img.native !== undefined) source = nativeSource(source, img.native, img.landOnly ? 3 : 0);
      return { source, opacity: img.points || variable!.id === 'truecolor' ? 1 : 0.85, points: img.points, landOnly: img.landOnly };
    },
    [variable, state.month, state.blackout, state.day],
  );
  const imagery = useMemo(() => imageryFor(state.year), [imageryFor, state.year]);

  // ---------- live layers ----------
  // The city list: the Cities layer, names for points, towns for the smoke scenes.
  const cityList = useLoaded(loadCities);
  const live = useLiveManifest();
  const manifest = live.manifest;

  // Fires of the last 48 hours: for the layer, and for "what is near" under the pointer.
  const [pointerSeen, setPointerSeen] = useState(false);
  const [fireData, setFireData] = useState<LiveFires | null>(null);
  useEffect(() => {
    if ((!state.liveFires && !pointerSeen && state.panel !== 'fires') || !manifest?.fires) return;
    let cancelled = false;
    loadFires(manifest)
      .then((f) => !cancelled && setFireData(f))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [state.liveFires, pointerSeen, state.panel, manifest]);
  const liveFires = useMemo<GlobePoints | null>(() => {
    if (!fireData || !manifest) return null;
    // Ages were counted at the build; add the hours since then.
    const since = Math.max(0, (Date.now() - Date.parse(manifest.built)) / 3600_000);
    const time = new Float32Array(fireData.count);
    for (let i = 0; i < fireData.count; i++) time[i] = -(fireData.ageMin[i] / 60 + since);
    return { key: `live|${manifest.built}`, mode: 'live', lat: fireData.lat, lon: fireData.lon, time, size: fireData.frp };
  }, [fireData, manifest]);

  // Fire stories: the list, and the points of the one playing.
  const [stories, setStories] = useState<FireStory[] | null>(null);
  const [story, setStory] = useState<FireStory | null>(null);
  const [storyPoints, setStoryPoints] = useState<GlobePoints | null>(null);
  useEffect(() => {
    if (stories || (state.panel !== 'fires' && !story)) return;
    loadStories()
      .then((d) => setStories(d.stories))
      .catch(() => undefined);
  }, [state.panel, stories, story]);
  useEffect(() => {
    if (!story) {
      setStoryPoints(null);
      return;
    }
    let cancelled = false;
    loadStory(story)
      .then((pts) => !cancelled && setStoryPoints({ key: `story|${story.id}`, mode: 'story', lat: pts.lat, lon: pts.lon, time: pts.hours, size: pts.frp }))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [story]);
  // Smoke scenes (a story's past days, or the next day over fires burning now): the side panel
  // goes, so the scene has the whole view.
  const closePanel = useCallback(() => dispatch({ type: 'panel', panel: null }), []);
  const smokeTarget = useMemo<{ current: SmokeTarget }>(
    () => ({
      current: {
        show: (layer) => globe.current?.setSmoke(layer),
        // On a wide screen the scene's panel covers the right: look a little east.
        look: ({ lat, lon, distance, box }) => globe.current?.flyTo(lat, lon + (window.innerWidth > 900 ? (box.e - box.w) * 0.18 : 0), distance),
        storyTime: (h) => globe.current?.setStoryTime(h),
      },
    }),
    [],
  );
  const smoke = useSmoke(smokeTarget, closePanel);
  const closeSmoke = smoke.close;
  // Where most fire burns now: connected areas of the last 48 hours, named after a town nearby.
  const hotList = useMemo(() => {
    if (!fireData || !manifest) return null;
    const since = Math.max(0, (Date.now() - Date.parse(manifest.built)) / 3600_000);
    return findHotspots(fireData, since, 10);
  }, [fireData, manifest]);
  // The country each hotspot is in, by its borders (Natural Earth).
  const [hotCountry, setHotCountry] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!hotList) return;
    let cancelled = false;
    void Promise.all(hotList.map((h) => countryAt(h.lat, h.lon).then((c) => [h.id, c?.code ?? ''] as const)))
      .then((pairs) => !cancelled && setHotCountry(Object.fromEntries(pairs)))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [hotList]);
  const hotspots = useMemo(() => hotList?.map((h) => ({ h, name: hotspotName(h, hotCountry[h.id] ?? '', cityList, lang) })) ?? null, [hotList, hotCountry, cityList, lang]);
  const openHotspot = useCallback(
    (h: Hotspot, name: string) => {
      if (!fireData || !manifest) return;
      setStory(null);
      dispatch({ type: 'set', state: { liveFires: true } });
      smoke.openForecast(h, name, fireData, manifest, cityList ?? [], lang);
    },
    [fireData, manifest, cityList, lang, smoke],
  );

  // Another story (or none): its smoke scene, if one was open, goes with the old one.
  const pickStory = useCallback(
    (st: FireStory | null) => {
      closeSmoke();
      setStory(st);
    },
    [closeSmoke],
  );
  const openStory = useCallback(
    (st: FireStory) => {
      pickStory(st);
      dispatch({ type: 'play', on: false });
      globe.current?.flyTo(st.camera.lat, st.camera.lon, st.camera.distance);
    },
    [pickStory],
  );
  // The live fires are about now: while two years are compared on the shutter they would mislead.
  const fires = story ? storyPoints : state.liveFires && state.compare === null ? liveFires : null;

  // Air quality (SaveEcoBot), checked again every five minutes while shown.
  const [aqi, setAqi] = useState<{ stations: AqiStation[] | null; error: boolean }>({ stations: null, error: false });
  const wantAqi = state.aqi || state.panel === 'ukraine';
  useEffect(() => {
    if (!wantAqi) return;
    let cancelled = false;
    const load = () =>
      loadAqi()
        .then((stations) => !cancelled && setAqi({ stations, error: false }))
        .catch(() => !cancelled && setAqi((a) => ({ stations: a.stations, error: true })));
    void load();
    const id = window.setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [wantAqi]);
  const [world, setWorld] = useState<{ built: string; p: AirPoint[] } | null>(null);
  useEffect(() => {
    if ((!state.aqi && !pointerSeen) || !manifest?.air || WAQI_TOKEN) return;
    let cancelled = false;
    loadAir(manifest)
      .then((d) => !cancelled && setWorld(d))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [state.aqi, pointerSeen, manifest]);
  // WAQI when a token is set; otherwise SaveEcoBot and Sensor.Community.
  const waqi = useWaqi(state.aqi || pointerSeen);
  const airStations = useMemo<AirStation[]>(() => mergeAir(aqi.stations ?? [], world, waqi.stations), [waqi.stations, aqi.stations, world]);
  const airIndex = useMemo(() => (airStations.length ? { index: new PointIndex(airStations.map((x) => x.lat), airStations.map((x) => x.lon)), aqi: airStations.map((x) => x.aqi) } : null), [airStations]);
  const stationLayer = useMemo<GlobeStations | null>(() => {
    if (!state.aqi || !airStations.length) return null;
    return {
      key: `air|${airStations.length}|${world?.built ?? ''}`,
      lat: airStations.map((x) => x.lat),
      lon: airStations.map((x) => x.lon),
      value: airStations.map((x) => x.aqi),
      color: airStations.map((x) => AQI_COLORS[aqiBand(x.aqi)]),
      old: airStations.map((x) => (isOld(x) ? 1 : 0)),
    };
  }, [state.aqi, airStations, world?.built]);
  const [airHover, setAirHover] = useState<{ i: number; x: number; y: number; pinned: boolean } | null>(null);
  const onStationHover = useCallback((i: number, x: number, y: number) => {
    setAirHover((h) => (h?.pinned ? h : i < 0 ? null : { i, x, y, pinned: false }));
  }, []);
  const onStationPick = useCallback((i: number) => {
    setAirHover((h) => ({ i, x: h?.x ?? window.innerWidth / 2, y: h?.y ?? window.innerHeight / 2, pinned: true }));
  }, []);

  // Background radiation at fixed stations (SaveEcoBot), checked again every five minutes while shown.
  const [radiation, setRadiation] = useState<RadStation[]>([]);
  useEffect(() => {
    if (!state.radiation) return;
    let cancelled = false;
    const load = () =>
      loadRadiation()
        .then((list) => !cancelled && setRadiation(list))
        .catch(() => undefined);
    void load();
    const id = window.setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [state.radiation]);
  const radIndex = useMemo(() => (radiation.length ? new PointIndex(radiation.map((x) => x.lat), radiation.map((x) => x.lon)) : null), [radiation]);
  const radLayer = useMemo<GlobeStations | null>(() => {
    if (!state.radiation || !radiation.length) return null;
    return {
      key: `rad|${radiation.length}|${radiation[0]?.time ?? ''}`,
      lat: radiation.map((x) => x.lat),
      lon: radiation.map((x) => x.lon),
      value: radiation.map((x) => x.usv),
      label: radiation.map((x) => radLabel(x.usv, lang)),
      color: radiation.map((x) => RAD_COLORS[radBand(x.usv)]),
      old: radiation.map((x) => (isOldRad(x) ? 1 : 0)),
    };
  }, [state.radiation, radiation, lang]);
  const [radHover, setRadHover] = useState<{ i: number; x: number; y: number; pinned: boolean } | null>(null);
  const onRadHover = useCallback((i: number, x: number, y: number) => {
    setRadHover((h) => (h?.pinned ? h : i < 0 ? null : { i, x, y, pinned: false }));
  }, []);
  const onRadPick = useCallback((i: number) => {
    setAirHover((h) => (h?.pinned ? null : h));
    setRadHover((h) => ({ i, x: h?.x ?? window.innerWidth / 2, y: h?.y ?? window.innerHeight / 2, pinned: true }));
  }, []);

  // The front (DeepState): every version, one per day; the newest unless the slider moved.
  const [versions, setVersions] = useState<FrontVersion[] | null>(null);
  const [versionIndex, setVersionIndex] = useState(-1);
  const wantFront = state.front || state.panel === 'ukraine';
  useEffect(() => {
    if (!wantFront || versions) return;
    loadFrontHistory()
      .then((list) => {
        const daily = dailyVersions(list);
        setVersions(daily);
        setVersionIndex(daily.length - 1);
      })
      .catch(() => undefined);
  }, [wantFront, versions]);
  const [front, setFront] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; areas: FrontArea[] | null; id: number }>({ status: 'idle', areas: null, id: 0 });
  const version = versions?.[versionIndex] ?? null;
  useEffect(() => {
    if (!state.front || !version) return;
    let cancelled = false;
    // Dragging the slider passes many versions: load the one it rests on.
    const timer = window.setTimeout(() => {
      setFront((f) => ({ ...f, status: 'loading' }));
      loadFront(version.id)
        .then((areas) => !cancelled && setFront({ status: 'ready', areas, id: version.id }))
        .catch(() => !cancelled && setFront((f) => ({ ...f, status: 'error' })));
    }, 220);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [state.front, version]);
  const frontVector = useMemo<GlobeVector | null>(() => {
    if (!state.front || !front.areas) return null;
    const areas = front.areas;
    return { canvas: drawFront(areas), box: FRONT_BOX, key: `front|${front.id}`, draw: (box, width) => drawFront(areas, box, width) };
  }, [state.front, front.areas, front.id]);

  // The occupation timeline (DeepState, week by week since 2022): played on the front layer's
  // place on the globe. The painter repaints one canvas in place; the globe re-uploads it.
  const [occOpen, setOccOpen] = useState(false);
  const [occ, setOcc] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; history: OccHistory | null }>({ status: 'idle', history: null });
  useEffect(() => {
    if (!occOpen || occ.history) return;
    let cancelled = false;
    loadOccHistory()
      .then((history) => !cancelled && setOcc({ status: 'ready', history }))
      .catch(() => !cancelled && setOcc({ status: 'error', history: null }));
    return () => {
      cancelled = true;
    };
  }, [occOpen, occ.history]);
  const occPainter = useMemo(() => (occ.history ? new OccPainter(occ.history, occ.history.box, 1600, 'plate') : null), [occ.history]);
  const occPos = useRef(0);
  const [occPlaying, setOccPlaying] = useState(true);
  // One canvas for the whole playback, repainted in place; `draw` (the sharp close-up) is offered
  // only while paused, so playing never repaints the close-up.
  const occVector = useMemo<GlobeVector | null>(() => {
    if (!occPainter || !occ.history) return null;
    const history = occ.history;
    return {
      canvas: occPainter.canvas,
      box: occPainter.box,
      key: 'occupation',
      draw: occPlaying ? undefined : (box, width) => new OccPainter(history, box, width, 'plate').paint(occPos.current),
    };
  }, [occPainter, occ.history, occPlaying]);
  const onOccPos = useCallback(
    (pos: number, playing: boolean) => {
      if (!occPainter) return;
      occPos.current = pos;
      occPainter.paint(pos);
      setOccPlaying(playing);
      globe.current?.touchFront();
      // The next weeks are drawn ahead, between animation frames.
      const k = Math.floor(pos);
      window.setTimeout(() => {
        occPainter.warm(k + 1);
        occPainter.warm(k + 2);
      }, 0);
    },
    [occPainter],
  );
  const openOccupation = useCallback(() => {
    pickStory(null);
    setOccOpen(true);
    dispatch({ type: 'play', on: false });
    globe.current?.flyTo(46.0, 34.0, 1.5);
  }, [pickStory]);

  // Weather on the globe (GFS): the forecast hour closest to now, checked again every minute.
  const [frame, setFrame] = useState<WeatherFrame | null>(null);
  const wantWeather = (state.wind || state.field !== 'none' || pointerSeen) && !!manifest?.weather;
  useEffect(() => {
    if (!wantWeather || !manifest) return;
    let cancelled = false;
    loadFrame(manifest, nearestFrame(manifest))
      .then((f) => !cancelled && setFrame(f))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [wantWeather, manifest]);
  const globeWind = useMemo<GlobeWind | null>(() => (state.wind && frame ? { key: frame.time.toISOString(), sample: frame.wind } : null), [state.wind, frame]);
  // The field is painted in a worker (about 150 ms of work), then copied onto a canvas for the globe.
  const [globeField, setGlobeField] = useState<GlobeField | null>(null);
  useEffect(() => {
    if (state.field === 'none' || !frame) {
      setGlobeField(null);
      return;
    }
    const field = state.field;
    let cancelled = false;
    void paintFieldAsync(frame, field, worldView('equirect', 1440)).then((pic) => {
      if (cancelled) return;
      let canvas: HTMLCanvasElement;
      if (pic instanceof HTMLCanvasElement) canvas = pic;
      else {
        canvas = document.createElement('canvas');
        canvas.width = pic.width;
        canvas.height = pic.height;
        canvas.getContext('2d')!.drawImage(pic, 0, 0);
        pic.close();
      }
      setGlobeField({ canvas, key: `${field}|${frame.time.toISOString()}`, opacity: field === 'cloud' ? 0.9 : 1 });
    });
    return () => {
      cancelled = true;
    };
  }, [state.field, frame]);
  // A data layer needs an evenly lit globe: the night side would hide it. Night lights are the
  // opposite: they read best over the dark planet. The chosen style comes back with no layer.
  const globeLight: Light = state.variable === 'nightlights' ? 'night' : state.variable || state.field !== 'none' ? 'flat' : state.light;
  const flyUkraine = useCallback(() => globe.current?.flyTo(UKRAINE_VIEW.lat, UKRAINE_VIEW.lon, UKRAINE_VIEW.distance), []);

  // Ukraine war layer: the official list, painted once and draped over the globe.
  const [war, setWar] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data: WarData | null }>({ status: 'idle', data: null });
  useEffect(() => {
    if (!state.war || war.data) return;
    let cancelled = false;
    setWar({ status: 'loading', data: null });
    loadWar()
      .then((data) => !cancelled && setWar({ status: 'ready', data }))
      .catch(() => !cancelled && setWar({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
  }, [state.war, war.data]);
  const warCanvas = useMemo(() => (war.data ? drawWar(war.data) : null), [war.data]);
  const vector = useMemo<GlobeVector | null>(
    () =>
      state.war && warCanvas && war.data
        ? { canvas: warCanvas, box: WAR_BOX, key: war.data.edition, draw: (box, width) => drawWar(war.data!, box, width) }
        : null,
    [state.war, warCanvas, war.data],
  );

  // Ranges
  const yearRange: [number, number] = variable?.imagery ? imageryYears(variable.imagery) : GISTEMP_YEARS;
  const chartYears = chartVariable.years ?? GISTEMP_YEARS;
  const periodRange: [number, number] = state.variable === 'gistemp' ? GISTEMP_YEARS : chartYears;
  const from = Math.max(state.from, chartYears[0]);
  const to = Math.min(state.to, chartYears[1]);
  const dated = !!variable?.imagery && !variable.imagery.static;
  const showYear = dated || (state.variable === 'gistemp' && state.gistempMode === 'year');
  const canPlay = dated || state.variable === 'gistemp';

  // Before/after shutter: the left side shows `compare`, the right side the timeline year.
  const comparing = state.compare !== null && showYear;
  const leftYear = Math.min(yearRange[1], Math.max(yearRange[0], state.compare ?? yearRange[0]));
  const leftClimate = useClimateLayer(comparing && state.variable === 'gistemp', 'year', leftYear, state.from, state.to);
  const leftImagery = useMemo(() => (comparing ? imageryFor(leftYear) : null), [comparing, imageryFor, leftYear]);
  const leftData = comparing && state.variable === 'gistemp' ? leftClimate.overlay : null;
  const globeCompare = useMemo<GlobeCompare | null>(
    () =>
      comparing
        ? { imagery: leftImagery, data: leftData, leftLabel: String(leftYear), rightLabel: String(state.year), handleLabel: s.timeline.handle }
        : null,
    [comparing, leftImagery, leftData, leftYear, state.year, s.timeline.handle],
  );
  const compareStart = state.variable === 'gistemp' ? 1950 : yearRange[0];

  // Analysis
  const analysis = useAnalysis(state.chartVariable, state.regionA, state.regionB, state.season, from, Math.max(from + 1, to), state.chartView);

  // Event marks for the chart: only for this variable, and regional ones only where A or B is.
  const marks = useMemo(() => {
    const boxes = [state.regionA, state.regionB].filter((r) => r !== null).map((r) => regionBox(r));
    return eventsFor(state.chartVariable, boxes).map((e) => ({ year: e.year, label: e.label[lang], detail: e.detail[lang], source: e.source }));
  }, [state.chartVariable, state.regionA, state.regionB, lang]);

  // Clicking a year on the chart shows it on the globe: the map layer if it has years, otherwise
  // the chart variable's own layer.
  const onPickYear = (year: number, month?: number) => {
    if (month) dispatch({ type: 'month', month });
    const target = variable && (variable.imagery || variable.id === 'gistemp') ? variable : chartVariable.imagery || chartVariable.id === 'gistemp' ? chartVariable : null;
    if (!target) return;
    if (target.id !== state.variable) dispatch({ type: 'variable', id: target.id });
    if (target.id === 'gistemp') dispatch({ type: 'mode', mode: 'year' });
    const [lo, hi] = target.imagery ? imageryYears(target.imagery) : GISTEMP_YEARS;
    dispatch({ type: 'year', year: Math.min(hi, Math.max(lo, year)) });
  };

  // Hints about anomalies: marks on the globe when zoomed in, a card when clicked.
  const [hintId, setHintId] = useState<string | null>(null);
  // Events of the layer on the globe show at any zoom; the rest when zoomed in.
  const globeHints = useMemo<GlobeHint[]>(
    () => hints.map((h) => ({ id: h.id, lat: h.lat, lon: h.lon, label: h.title[lang], color: HINT_KINDS[h.kind].color, icon: HINT_KINDS[h.kind].icon, always: !!h.layer && h.layer === state.variable })),
    [lang, state.variable],
  );
  const [hintHover, setHintHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const onHintHover = useCallback((id: string | null, x: number, y: number) => setHintHover(id ? { id, x, y } : null), []);
  const onHint = useCallback((id: string) => {
    setHintId(id);
    dispatch({ type: 'panel', panel: null });
  }, []);
  // From the news list: the card opens and the camera flies there; the list stays open.
  const onNews = useCallback((h: Hint) => {
    setHintId(h.id);
    globe.current?.flyTo(h.lat, h.lon, h.show?.distance ?? 1.6);
  }, []);
  // The event's layer on its exact day, the camera over the place.
  const onShowEvent = useCallback(
    (h: Hint) => {
      if (!h.show) return;
      pickStory(null);
      dispatch({ type: 'show', variable: h.show.layer, date: h.show.date });
      globe.current?.flyTo(h.lat, h.lon, h.show.distance ?? 1.6);
    },
    [pickStory],
  );
  const onEventStory = useCallback(
    (id: string) => {
      void loadStories()
        .then((d) => {
          setStories(d.stories);
          const st = d.stories.find((x) => x.id === id);
          if (st) openStory(st);
        })
        .catch(() => undefined);
    },
    [openStory],
  );
  // From a news card straight to the smoke of its fire story.
  const onEventSmoke = useCallback(
    (id: string) => {
      void loadStories()
        .then((d) => {
          setStories(d.stories);
          const st = d.stories.find((x) => x.id === id);
          if (!st) return;
          setHintId(null);
          openStory(st);
          smoke.openStory(st, cityList ?? [], lang);
        })
        .catch(() => undefined);
    },
    [openStory, smoke, cityList, lang],
  );

  const markers = useMemo<GlobeMarker[]>(() => {
    const out: GlobeMarker[] = [];
    if (state.regionA) out.push({ id: 'A', ...regionCentre(state.regionA), label: regionName(state.regionA, lang) });
    if (state.regionB) out.push({ id: 'B', ...regionCentre(state.regionB), label: regionName(state.regionB, lang) });
    return out;
  }, [state.regionA, state.regionB, lang]);

  // Playback: one year per step. Imagery for the next year is loaded first and the step waits
  // for it, so every frame shows a complete layer instead of a bare map.
  useEffect(() => {
    if (!state.playing) return;
    if (state.year >= yearRange[1]) {
      dispatch({ type: 'play', on: false });
      return;
    }
    let cancelled = false;
    const next = state.year + 1;
    // Point layers (fires) need a moment more for every day's detections to arrive.
    const dwell = (variable?.imagery?.points ? 1500 : variable?.imagery ? 900 : 450) / state.speed;
    const started = performance.now();
    const source = variable?.imagery ? imageryFor(next)?.source : null;
    const loaded = source && globe.current ? globe.current.preload(source) : Promise.resolve();
    void loaded.then(() => {
      const left = Math.max(0, dwell - (performance.now() - started));
      window.setTimeout(() => {
        if (!cancelled) dispatch({ type: 'year', year: next });
      }, left);
    });
    return () => {
      cancelled = true;
    };
  }, [state.playing, state.speed, state.year, yearRange, variable, imageryFor]);

  // Playback runs from a chosen year to the layer's last year.
  const [playFromRaw, setPlayFrom] = useState<number | null>(null);
  const playFrom = Math.min(yearRange[1] - 1, Math.max(yearRange[0], playFromRaw ?? (state.variable === 'gistemp' ? Math.max(yearRange[0], state.from) : yearRange[0])));
  const onPlay = (on: boolean) => {
    if (on) {
      if (state.variable === 'gistemp' && state.gistempMode !== 'year') dispatch({ type: 'mode', mode: 'year' });
      if (state.year >= yearRange[1] || state.year < playFrom) dispatch({ type: 'year', year: playFrom });
    }
    dispatch({ type: 'play', on });
  };

  // Share link follows the state.
  const query = toQuery(state, view);
  const shareUrl = `${window.location.origin}${window.location.pathname}?${query}`;
  useEffect(() => {
    const id = window.setTimeout(() => window.history.replaceState(window.history.state, '', `${window.location.pathname}?${query}`), 400);
    return () => window.clearTimeout(id);
  }, [query]);

  const openCase = useCallback((c: Case) => {
    dispatch({ type: 'case', c });
    dispatch({ type: 'panel', panel: null });
    globe.current?.flyTo(c.camera.lat, c.camera.lon, c.camera.distance);
  }, []);

  // Cities: the layer, the card of the one picked, and names for points that fall on a city.
  // The Cities layer belongs to "Borders and names", like the capitals, seas and rivers.
  const globeCities = useMemo(() => (state.borders && state.cities && cityList ? cityList : null), [state.borders, state.cities, cityList]);
  const [cityCard, setCityCard] = useState<CityPlace | null>(null);
  const onCity = useCallback(
    (id: number) => {
      const c = cityList?.[id];
      if (c) setCityCard(cityPlace(c));
    },
    [cityList],
  );
  // A shared link keeps a city only as a point: give it back its name and numbers.
  useEffect(() => {
    if (!cityList) return;
    for (const slot of ['A', 'B'] as const) {
      const r = slot === 'A' ? state.regionA : state.regionB;
      if (r?.kind !== 'point' || r.city || r.name) continue;
      const near = nearestCity(cityList, r.lat, r.lon, 1);
      if (near) dispatch({ type: 'region', slot, region: { ...cityRegion(cityPlace(near.city)), radiusKm: r.radiusKm } });
    }
  }, [cityList, state.regionA, state.regionB]);

  const onFound = useCallback((place: Found) => {
    dispatch({ type: 'weatherAt', place: { lat: place.lat, lon: place.lon, name: place.name } });
    if (place.kind === 'country') {
      dispatch({ type: 'borders', on: true });
      globe.current?.flyTo(place.lat, place.lon, place.big ? 2.2 : 1.45);
      return;
    }
    const c = place.city;
    setCityCard(c ? cityPlace(c) : { name: place.name, lat: place.lat, lon: place.lon, code: place.code });
    globe.current?.flyTo(place.lat, place.lon, 1.12);
  }, []);
  const onCityCompare = useCallback(
    (slot: Slot) => {
      if (!cityCard) return;
      dispatch({ type: 'region', slot, region: cityRegion(cityCard) });
      setCityCard(null);
    },
    [cityCard],
  );

  const onCountry = useCallback((slot: Slot, c: GeoCountry) => {
    setMissedCountry(false);
    dispatch({ type: 'region', slot, region: countryRegion(c) });
    globe.current?.flyTo(c.label[0], c.label[1], c.area > 3e6 ? 2.6 : c.area > 3e5 ? 1.9 : 1.5);
  }, []);

  const onPick = useCallback(
    (p: GlobePoint) => {
      setMissedCountry(false);
      dispatch({ type: 'weatherAt', place: { lat: p.lat, lon: p.lon } });
      // With the weather panel open, a click only moves the weather place.
      if (state.panel === 'weather' && !state.picking) return;
      const slot = state.picking ?? 'A';
      if (state.pickMode === 'country') {
        void countryAt(p.lat, p.lon).then((c) => {
          if (c) dispatch({ type: 'region', slot, region: countryRegion(c) });
          else setMissedCountry(true);
        });
        return;
      }
      dispatch({ type: 'region', slot, region: { kind: 'point', lat: p.lat, lon: p.lon, radiusKm: state.radiusKm } });
    },
    [state.picking, state.radiusKm, state.pickMode, state.panel],
  );

  // The colour map of the layer on the globe, to read values under the pointer.
  const [colorMap, setColorMap] = useState<ColorMap | null>(null);
  useEffect(() => {
    setColorMap(null);
    if (!state.variable) return;
    let cancelled = false;
    void loadColorMap(state.variable).then((m) => !cancelled && setColorMap(m));
    return () => {
      cancelled = true;
    };
  }, [state.variable]);

  // The value of the climate layer under the pointer.
  let layerLine: string | null = null;
  if (hover && state.variable === 'gistemp' && climate.data && climate.field) {
    const v = climate.field.values[cellIndex(climate.data.meta, hover.lat, hover.lon)];
    const unit = state.gistempMode === 'trend' ? t.explore.readout.perDecade : '°C';
    layerLine = `${variableById.gistemp.name[lang]}: ${Number.isFinite(v) ? `${numberFormat(lang, state.gistempMode === 'trend' ? 2 : 1)(v)} ${unit}` : s.readout.noData}`;
  } else if (hover && variable) {
    // Any NASA GIBS layer: the colour under the pointer read back through the layer's colour map.
    const c = colorMap ? globe.current?.sampleImagery(hover.lat, hover.lon) : null;
    const hit = c && c[3] > 40 && colorMap ? lookup(colorMap, c[0], c[1], c[2]) : null;
    const value = hit ? entryText(variable.id, hit.entry, lang) : null;
    layerLine = `${variable.name[lang]}: ${value ? (colorMap!.numeric ? liveText.layerScale.level(value, levelWord(hit!.at, lang)) : value) : colorMap ? liveText.layerScale.noValue : ''}`.replace(/: $/, '');
  }
  if (hover && state.radiation) {
    // The nearest station within 25 km: a reading at a place, not a guess between stations.
    const near = nearestRad(radIndex, radiation, hover.lat, hover.lon);
    if (near) {
      const lt = liveText.ukraine;
      layerLine = lt.radiationAt(radLabel(near.s.usv, lang), lt.radiationLevel[radBand(near.s.usv)], numberFormat(lang, 0)(near.km));
    }
  }

  const panelTitle = state.panel ? s.rail[state.panel] : '';

  return (
    <main className="explore studio">
      <h1 className="visually-hidden">Earth-System-Detective: 3D</h1>
      <Globe
        label={t.explore.globe}
        fallback={t.explore.unavailable}
        lang={lang}
        data={climate.overlay}
        imagery={imagery}
        showBorders={state.borders}
        vector={vector}
        markers={markers}
        compare={globeCompare}
        hints={globeHints}
        geo={geoLabels}
        borderLines={borderLines}
        labelLayers={state.labels}
        outlines={outlines}
        light={globeLight}
        relief={state.relief}
        fires={fires}
        stations={stationLayer}
        onStationHover={onStationHover}
        onStationPick={onStationPick}
        front={occOpen ? occVector : frontVector}
        radStations={radLayer}
        onRadHover={onRadHover}
        onRadPick={onRadPick}
        cities={globeCities}
        onCity={onCity}
        field={globeField}
        wind={globeWind}
        onHint={onHint}
        onHintHover={onHintHover}
        onHover={onHover}
        onPick={onPick}
        onView={setView}
        onLoadingChange={setLoading}
        apiRef={globe}
      />
      <TopBar back center={<CountrySearch onFound={onFound} />} view="3d" />
      <Rail
        panel={state.panel}
        analysisOpen={state.analysisOpen}
        onPanel={(panel) => dispatch({ type: 'panel', panel })}
        onAnalysis={(open) => dispatch({ type: 'analysis', open })}
      />

      {state.panel && (
        <Flyout title={panelTitle} onClose={() => dispatch({ type: 'panel', panel: null })}>
          {state.panel === 'layers' && (
            <LayersPanel
              variable={state.variable}
              mode={state.gistempMode}
              borders={state.borders}
              labels={state.labels}
              onLabels={(labels) => dispatch({ type: 'labels', labels })}
              year={state.year}
              month={state.month}
              day={state.day}
              from={state.from}
              to={state.to}
              globalValue={climate.global?.value ?? null}
              war={state.war}
              warData={war.data}
              warStatus={war.status}
              onWar={(on) => dispatch({ type: 'war', on })}
              onVariable={(id) => dispatch({ type: 'variable', id })}
              onMode={(mode) => dispatch({ type: 'mode', mode })}
              onBorders={(on) => dispatch({ type: 'borders', on })}
              cities={state.cities}
              onCities={(on) => dispatch({ type: 'set', state: { cities: on } })}
            />
          )}
          {state.panel === 'fires' && (
            <FiresPanel
              archiveDay={state.variable === 'fires' ? (state.day ?? (variable?.imagery ? imageryDate(variable.imagery, state.year) : null)) : null}
              onArchiveDay={(date) => dispatch({ type: 'show', variable: 'fires', date })}
              comparing={state.compare !== null}
              liveFires={state.liveFires}
              onLiveFires={(on) => dispatch({ type: 'set', state: { liveFires: on } })}
              manifest={manifest}
              manifestError={live.error}
              liveCount={liveFires && state.liveFires ? liveFires.lat.length : null}
              stories={stories}
              storyId={story?.id ?? null}
              onStory={openStory}
              onUkraine={flyUkraine}
              hotspots={hotspots}
              onHotspot={openHotspot}
            />
          )}
          {state.panel === 'ukraine' && (
            <UkrainePanel
              aqi={state.aqi}
              radiation={state.radiation}
              front={state.front}
              war={state.war}
              liveFires={state.liveFires}
              blackout={state.blackout}
              onAqi={(on) => dispatch({ type: 'set', state: { aqi: on } })}
              onRadiation={(on) => dispatch({ type: 'set', state: { radiation: on } })}
              onFront={(on) => dispatch({ type: 'set', state: { front: on } })}
              onWar={(on) => dispatch({ type: 'war', on })}
              onLiveFires={(on) => dispatch({ type: 'set', state: { liveFires: on } })}
              onBlackout={(on) => {
                dispatch({ type: 'blackout', on });
                if (on) flyUkraine();
              }}
              onUkraine={flyUkraine}
              onOccupation={openOccupation}
              stations={aqi.stations}
              stationsError={aqi.error}
              manifest={manifest}
              versions={versions}
              versionIndex={Math.max(0, versionIndex)}
              onVersion={setVersionIndex}
              frontStatus={front.status}
              warData={war.data}
              warStatus={war.status}
            />
          )}
          {state.panel === 'cases' && <EventsPanel activeId={state.caseId} onOpen={openCase} newsId={hintId} onNews={onNews} />}
          {state.panel === 'weather' && (
            <WeatherGlobeControls
              wind={state.wind}
              field={state.field}
              manifest={manifest}
              frameTime={frame ? frame.time.toISOString() : null}
              onWind={(on) => dispatch({ type: 'set', state: { wind: on } })}
              onField={(f) => dispatch({ type: 'set', state: { field: f } })}
            />
          )}
          {state.panel === 'weather' && (
            <WeatherPanel
              place={state.weatherAt}
              regionA={state.regionA}
              regionB={state.regionB}
              onPlace={(place) => {
                dispatch({ type: 'weatherAt', place });
                globe.current?.flyTo(place.lat, place.lon, 1.8);
              }}
            />
          )}
          {state.panel === 'glossary' && <GlossaryPanel />}
          {state.panel === 'share' && <SharePanel url={shareUrl} />}
        </Flyout>
      )}

      {state.analysisOpen && (
        <AnalysisDrawer
          chartVariable={state.chartVariable}
          regionA={state.regionA}
          regionB={state.regionB}
          picking={state.picking}
          pickMode={state.pickMode}
          chartView={state.chartView}
          missedCountry={missedCountry}
          onPickMode={(mode) => dispatch({ type: 'pickMode', mode })}
          onCountry={onCountry}
          onChartView={(v) => dispatch({ type: 'chartView', view: v })}
          radiusKm={state.radiusKm}
          season={state.season}
          from={from}
          to={to}
          activeCase={activeCase}
          analysis={analysis}
          marks={marks}
          mapYear={showYear ? state.year : null}
          onPickYear={onPickYear}
          onClose={() => dispatch({ type: 'analysis', open: false })}
          onChartVariable={(id) => dispatch({ type: 'chartVariable', id })}
          onPick={(slot) => dispatch({ type: 'picking', slot })}
          onRemoveB={() => dispatch({ type: 'region', slot: 'B', region: null })}
          onRadius={(km) => dispatch({ type: 'radius', km })}
          onSeason={(season) => dispatch({ type: 'season', season })}
          manifest={manifest}
        />
      )}

      {cityCard && (
        <CityCard
          place={cityCard}
          manifest={manifest}
          onCompare={onCityCompare}
          onWeather={() => {
            dispatch({ type: 'weatherAt', place: { lat: cityCard.lat, lon: cityCard.lon, name: cityCard.name } });
            dispatch({ type: 'panel', panel: 'weather' });
            setCityCard(null);
          }}
          onClose={() => setCityCard(null)}
        />
      )}

      {story && !smoke.state && (
        <StoryPlayer
          key={story.id}
          story={story}
          onTime={(h) => globe.current?.setStoryTime(h)}
          onClose={() => pickStory(null)}
          onSmoke={smokeSceneFor(story.id) ? () => smoke.openStory(story, cityList ?? [], lang) : undefined}
        />
      )}
      {story && smoke.state?.kind === 'story' && (
        <SmokePlayer
          key={`${smoke.state.scene.storyId}|${smoke.state.status}`}
          scene={smoke.state.scene}
          story={story}
          status={smoke.state.status}
          towns={smoke.state.towns}
          onTime={(h) => {
            smoke.layer.setTime(h);
            if (smoke.state?.kind === 'story') globe.current?.setStoryTime(smoke.state.offset + h);
          }}
          onClose={closeSmoke}
        />
      )}
      {smoke.state?.kind === 'forecast' && (
        <ForecastPlayer
          key={`${smoke.state.hotspot.id}|${smoke.state.status}`}
          hotspot={smoke.state.hotspot}
          title={smoke.state.title}
          start={smoke.state.start}
          hours={smoke.state.hours}
          status={smoke.state.status}
          weather={smoke.state.weather}
          air={smoke.state.air}
          onTime={(h) => smoke.layer.setTime(h)}
          onClose={closeSmoke}
        />
      )}

      {occOpen && !story && occ.history && <OccupationPlayer history={occ.history} onPos={onOccPos} onClose={() => setOccOpen(false)} />}
      {occOpen && !story && !occ.history && (
        <p className="explore__status" role="status">
          {occ.status === 'error' ? liveText.occupation.error : liveText.occupation.loading}
        </p>
      )}

      {radHover && !airHover && radiation[radHover.i] && (
        <RadCard station={radiation[radHover.i]} x={radHover.x} y={radHover.y} pinned={radHover.pinned} onClose={() => setRadHover(null)} />
      )}

      {airHover && airStations[airHover.i] && (
        <AirCard
          station={airStations[airHover.i]}
          x={airHover.x}
          y={airHover.y}
          pinned={airHover.pinned}
          frame={frame}
          fires={fireData}
          onClose={() => setAirHover(null)}
        />
      )}

      <MapStyle
        relief={state.relief}
        light={state.light}
        lightOverridden={globeLight !== state.light}
        borders={state.borders}
        onRelief={(on) => dispatch({ type: 'set', state: { relief: on } })}
        onLight={(l) => dispatch({ type: 'set', state: { light: l } })}
        onBorders={(on) => dispatch({ type: 'borders', on })}
      />
      <MapControls onZoom={(f) => globe.current?.zoomBy(f)} onHome={() => globe.current?.home()} />

      {!story && !occOpen && (dated || state.variable === 'gistemp' || state.analysisOpen) && (
        <Timeline
          year={showYear ? state.year : null}
          yearRange={yearRange}
          month={variable?.imagery?.time === 'monthly' ? state.month : null}
          from={state.variable === 'gistemp' ? state.from : from}
          to={state.variable === 'gistemp' ? state.to : to}
          periodRange={periodRange}
          playing={state.playing}
          speed={state.speed}
          canPlay={canPlay}
          compare={comparing ? leftYear : null}
          compareStart={compareStart}
          onCompare={(year) => dispatch({ type: 'compare', year })}
          onYear={(year) => dispatch({ type: 'year', year })}
          onMonth={(month) => dispatch({ type: 'month', month })}
          onPeriod={(f, tt) => dispatch({ type: 'period', from: f, to: tt })}
          onPlay={onPlay}
          onSpeed={(speed) => dispatch({ type: 'speed', speed })}
          playFrom={playFrom}
          onPlayFrom={(y) => {
            setPlayFrom(y);
            dispatch({ type: 'year', year: y });
          }}
          showPeriod={state.analysisOpen || (state.variable === 'gistemp' && state.gistempMode !== 'year')}
        />
      )}

      {hintId && hintById[hintId] && (
        <HintCard
          hint={hintById[hintId]}
          onClose={() => setHintId(null)}
          onOpenCase={(id) => {
            const c = cases.find((x) => x.id === id);
            setHintId(null);
            if (c) openCase(c);
          }}
          onLayer={(id) => dispatch({ type: 'variable', id: id as VariableId })}
          onShow={onShowEvent}
          onStory={onEventStory}
          onSmoke={onEventSmoke}
          onBlackout={() => {
            pickStory(null);
            dispatch({ type: 'blackout', on: true });
            flyUkraine();
          }}
        />
      )}
      {hintHover && !hintId && hintById[hintHover.id] && <HintPreview hint={hintById[hintHover.id]} x={hintHover.x} y={hintHover.y} />}

      {variable && (
        <div className="layer-chip" role="group" aria-label={s.activeLayer}>
          <span className="layer-chip__name">
            <Icon name="layers" size={16} />
            {variable.name[lang]}
          </span>
          <button
            type="button"
            className="layer-chip__exit"
            aria-label={s.exitLayerLabel(variable.name[lang])}
            title={s.exitLayerLabel(variable.name[lang])}
            onClick={() => {
              dispatch({ type: 'variable', id: null });
              dispatch({ type: 'compare', year: null });
            }}
          >
            <Icon name="close" size={16} />
            <span>{s.exitLayer}</span>
          </button>
        </div>
      )}

      {!airHover && !radHover && (
        <CursorInfo point={hover} frame={frame} fires={fireData} air={airIndex} hints={hints} layerLine={layerLine} />
      )}
      {loading && (
        <p className="explore__status" role="status">
          {s.imagery}
        </p>
      )}
    </main>
  );
}
