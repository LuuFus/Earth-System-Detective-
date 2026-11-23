// The 2D map, in two modes that can be combined:
// - Ukraine: the country lit, its neighbours dimmed (the dimming fades as you zoom out to the
//   world); air quality with the AQI in each bubble, fires, the DeepState front line, the
//   official list of occupied communities and the background radiation at fixed stations.
// - Weather: a colour field from the NOAA GFS forecast (wind, gusts, temperature, rain and snow,
//   cloud) with moving wind lines as Windy draws them, or the RainViewer radar; a timeline over
//   the forecast hours; a point forecast from Open-Meteo where you click.
// The weather can be switched on over the Ukraine map. Everything refreshes by itself.

import maplibregl, { type CanvasSource, type GeoJSONSource, type Map as MlMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CountrySearch } from '../components/CountrySearch';
import { FlowLayer, type Projection } from '../components/globe/flow';
import { StationLayer, type Stations } from '../components/globe/stations';
import { bordersGeo, firesGeo, frontGeo, maskGeo, outlineGeo, warGeo } from '../components/map/geo';
import { AirCard } from '../components/studio/AirCard';
import { RadCard } from '../components/studio/RadCard';
import { OccupationPlayer } from '../components/studio/OccupationPlayer';
import { loadOccHistory, OccPainter, type OccHistory } from '../data/frontHistory';
import { Icon, type IconName } from '../components/studio/Icon';
import { FieldLegend, RadiationLegend, Switch } from '../components/studio/LivePanels';
import { TopBar } from '../components/TopBar';
import { JellySlider } from '../components/ui/JellySlider';
import { isOld, mergeAir, type AirStation } from '../data/air';
import { useWaqi, WAQI_TOKEN } from '../data/waqi';
import { countries } from '../data/countries';
import { countryName, loadBorders, loadCountries } from '../data/geo';
import { worldView, type FieldView, type GridFrame } from '../data/field';
import { paintFieldAsync } from '../data/fieldPainter';
import { ago, airqBounds, fieldValue, isAirKind, loadAir, loadAirq, loadFires, loadFrame, nearestFrame, useLiveManifest, type AirPoint, type FieldKind, type LiveFires, type LiveManifest, type WeatherFrame } from '../data/live';
import { isOldRad, loadRadiation, nearestRad, RAD_COLORS, radBand, radLabel, type RadStation } from '../data/radiation';
import { PointIndex } from '../data/nearby';
import { AQI_COLORS, aqiBand, dailyVersions, loadAqi, loadFront, loadFrontHistory, type AqiStation } from '../data/ukraine';
import { loadWar } from '../data/war';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';

// One shared worker pool for the page's life: without it, React's double mount in development
// closes the workers between the two maps and the second one never loads its style.
maplibregl.prewarm();

type Layer = FieldKind | 'radar';
type Style = 'relief' | 'satellite' | 'osm';
type Mode = 'ukraine' | 'weather';
const LAYERS: { id: Layer; icon: IconName }[] = [
  { id: 'wind', icon: 'wind' },
  { id: 'gust', icon: 'gust' },
  { id: 'temp', icon: 'temp' },
  { id: 'precip', icon: 'drop' },
  { id: 'cloud', icon: 'cloud' },
  { id: 'radar', icon: 'radar' },
];
/** The CAMS air quality forecast: a model over Ukraine and its neighbours. */
const AIR_LAYERS: { id: Layer; icon: IconName }[] = [
  { id: 'aqi', icon: 'air' },
  { id: 'pm25', icon: 'fog' },
  { id: 'dust', icon: 'sun' },
];
type Coords = [[number, number], [number, number], [number, number], [number, number]];

/** The air forecast's box as a Web Mercator picture about 700 pixels wide. */
function airView(manifest: LiveManifest): { view: FieldView; coords: Coords } {
  const b = airqBounds(manifest);
  const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
  const width = 704;
  const height = Math.round((width * (merc(b.north) - merc(b.south))) / (((b.east - b.west) * Math.PI) / 180));
  return {
    view: { width, height, ...b, projection: 'mercator' },
    coords: [
      [b.west, b.north],
      [b.east, b.north],
      [b.east, b.south],
      [b.west, b.south],
    ],
  };
}
const MERC = 85.051129;
const WORLD: [[number, number], [number, number], [number, number], [number, number]] = [
  [-180, MERC],
  [180, MERC],
  [180, -MERC],
  [-180, -MERC],
];
const UKRAINE_BOUNDS: [[number, number], [number, number]] = [
  [22.1, 44.3],
  [40.3, 52.4],
];
const GIBS3857 = (layer: string) => `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg`;
const LAYER_IDS = (id: string) => [`${id}-fill`, `${id}-line`, `${id}-dot`];

type Radar = { host: string; frames: { time: number; path: string }[] };
async function loadRadar(): Promise<Radar> {
  const r = await fetch('https://api.rainviewer.com/public/weather-maps.json', { cache: 'no-store' });
  if (!r.ok) throw new Error(`rainviewer ${r.status}`);
  const d = (await r.json()) as { host: string; radar: { past: { time: number; path: string }[]; nowcast?: { time: number; path: string }[] } };
  return { host: d.host, frames: [...d.radar.past, ...(d.radar.nowcast ?? [])] };
}

type Point = { lat: number; lon: number };
type Hourly = { time: string[]; temperature_2m: number[]; precipitation: number[]; wind_speed_10m: number[]; wind_direction_10m: number[] };

function useStored<T extends string>(key: string, initial: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => (localStorage.getItem(key) as T | null) ?? initial);
  return [
    v,
    (next: T) => {
      localStorage.setItem(key, next);
      setV(next);
    },
  ];
}

const countryNames = (lang: 'uk' | 'en'): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: countries.map((c) => ({ type: 'Feature', properties: { name: countryName(c.code, lang), big: c.big ? 1 : 0 }, geometry: { type: 'Point', coordinates: [c.lon, c.lat] } })),
});

export default function MapPage() {
  const { lang } = useI18n();
  const t = useLiveText();
  const w = t.weatherMap;
  const m = t.map2d;
  const [sheet, setSheet] = useState(false);
  const [params, setParams] = useSearchParams();
  const mode: Mode = params.get('mode') === 'ukraine' ? 'ukraine' : 'weather';
  const uaMode = mode === 'ukraine';
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [ready, setReady] = useState(false);
  const [base, setBase] = useState(false);
  const [style, setStyle] = useStored<Style>('map-style', 'relief');
  const [storedLayer, setLayer] = useStored<Layer>('wm-layer', 'wind');
  const [particles, setParticles] = useStored<'on' | 'off'>('wm-particles', 'on');
  const [weatherOver, setWeatherOver] = useStored<'on' | 'off'>('map-ua-weather', 'off');
  const weather = !uaMode || weatherOver === 'on';
  const [ua, setUa] = useState({ aqi: true, fires: true, front: true, war: false, radiation: false });
  // The occupation timeline: DeepState week by week since 2022, played in place of the front.
  const [occOpen, setOccOpen] = useState(false);
  const [occ, setOcc] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; history: OccHistory | null }>({ status: 'idle', history: null });
  const { manifest } = useLiveManifest();
  // An air layer needs the air forecast; a site built without it shows the wind instead.
  const layer: Layer = isAirKind(storedLayer) && manifest && !manifest.airq ? 'wind' : storedLayer;
  const isAir = isAirKind(layer);
  const frames = useMemo(() => manifest?.weather?.frames ?? [], [manifest]);
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [frame, setFrame] = useState<WeatherFrame | null>(null);
  const [radar, setRadar] = useState<Radar | null>(null);
  const [radarIndex, setRadarIndex] = useState<number | null>(null);
  const [point, setPoint] = useState<Point | null>(null);
  const [hover, setHover] = useState<{ x: number; y: number; lat: number; lon: number } | null>(null);
  const flow = useMemo(() => {
    const f = new FlowLayer('weather-map__flow');
    f.wrap = false;
    return f;
  }, []);
  const stationsLayer = useMemo(() => new StationLayer('weather-map__stations'), []);
  const radLayer = useMemo(() => new StationLayer('weather-map__rad', 'tag'), []);

  // ---------- the map ----------
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const map = new maplibregl.Map({
      container: el,
      style: {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        sources: {
          relief: { type: 'raster', tiles: [GIBS3857('BlueMarble_ShadedRelief_Bathymetry')], tileSize: 256, maxzoom: 8, attribution: 'NASA GIBS' },
          satellite: { type: 'raster', tiles: [GIBS3857('BlueMarble_NextGeneration')], tileSize: 256, maxzoom: 8, attribution: 'NASA GIBS' },
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            maxzoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
          },
        },
        layers: [
          { id: 'bg', type: 'background', paint: { 'background-color': '#0c0f15' } },
          { id: 'relief', type: 'raster', source: 'relief', paint: { 'raster-fade-duration': 150 } },
          { id: 'satellite', type: 'raster', source: 'satellite', layout: { visibility: 'none' }, paint: { 'raster-fade-duration': 150 } },
          { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-fade-duration': 150 } },
        ],
      },
      center: [31, 48.6],
      zoom: 4.2,
      minZoom: 1.4,
      maxZoom: 15,
      attributionControl: { compact: true },
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.touchZoomRotate.disableRotation();
    map.on('load', () => setReady(true));
    mapRef.current = map;
    el.appendChild(flow.canvas);
    el.appendChild(radLayer.canvas);
    el.appendChild(stationsLayer.canvas);
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio);
      flow.resize(el.clientWidth, el.clientHeight, dpr);
      stationsLayer.resize(el.clientWidth, el.clientHeight, dpr);
      radLayer.resize(el.clientWidth, el.clientHeight, dpr);
    };
    resize();
    map.on('resize', resize);
    map.on('move', () => flow.clear());
    map.on('mouseout', () => setHover(null));
    return () => {
      flow.canvas.remove();
      stationsLayer.canvas.remove();
      radLayer.canvas.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [flow, stationsLayer, radLayer]);

  // One projection for the wind lines and the station bubbles.
  const view = useMemo<Projection | null>(() => {
    const map = mapRef.current;
    const el = host.current;
    if (!map || !el || !ready) return null;
    return {
      project(lat, lon) {
        const p = map.project([lon, lat]);
        if (p.x < -30 || p.y < -30 || p.x > el.clientWidth + 30 || p.y > el.clientHeight + 30) return null;
        return [p.x, p.y];
      },
      randomPlace() {
        const ll = map.unproject([Math.random() * el.clientWidth, Math.random() * el.clientHeight]);
        return Math.abs(ll.lat) > 84 ? null : [ll.lat, ll.lng];
      },
      pixelsPerDegree() {
        const c = map.getCenter();
        const a = map.project(c);
        const b = map.project([c.lng, Math.min(84, c.lat + 0.5)]);
        return Math.abs(a.y - b.y) * 2;
      },
    };
  }, [ready]);

  useEffect(() => {
    if (!view) return;
    let raf = 0;
    const tick = () => {
      flow.frame(view, 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [flow, view]);

  // ---------- base style ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.setLayoutProperty('relief', 'visibility', style === 'relief' ? 'visible' : 'none');
    map.setLayoutProperty('satellite', 'visibility', style === 'satellite' ? 'visible' : 'none');
    // OpenStreetMap: the whole map in the OSM style; over relief or satellite it fades in close up
    // for streets and names.
    map.setPaintProperty('osm', 'raster-opacity', style === 'osm' ? 1 : ['interpolate', ['linear'], ['zoom'], 6.5, 0, 8.5, 0.92]);
    // Under the weather the map steps back to dark grey so the colours carry the picture.
    const dim = weather && layer !== 'radar';
    map.setPaintProperty('osm', 'raster-saturation', dim || style === 'osm' ? -0.85 : 0);
    map.setPaintProperty('osm', 'raster-brightness-max', dim ? 0.42 : style === 'osm' ? 0.55 : 1);
    map.setPaintProperty('osm', 'raster-contrast', dim || style === 'osm' ? 0.15 : 0);
    for (const id of ['relief', 'satellite']) {
      map.setPaintProperty(id, 'raster-saturation', dim ? -0.6 : 0);
      map.setPaintProperty(id, 'raster-brightness-max', dim ? 0.55 : 1);
    }
  }, [style, weather, layer, ready]);

  // ---------- borders, country names, Ukraine's outline and mask ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    let cancelled = false;
    void Promise.all([loadBorders(), loadCountries()]).then(([borders, all]) => {
      if (cancelled || map.getSource('borders')) return;
      map.addSource('borders', { type: 'geojson', data: bordersGeo(borders) });
      const ukraine = all.get('UA');
      if (ukraine) {
        map.addSource('ua-mask', { type: 'geojson', data: maskGeo(ukraine) });
        map.addSource('ua-outline', { type: 'geojson', data: outlineGeo(ukraine) });
        // Dims the world around Ukraine; zoomed out to the world the dimming fades away.
        map.addLayer({
          id: 'ua-mask',
          type: 'fill',
          source: 'ua-mask',
          layout: { visibility: 'none' },
          paint: { 'fill-color': '#04060b', 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 2.6, 0, 4.2, 0.58] },
        });
      }
      map.addLayer({ id: 'borders-halo', type: 'line', source: 'borders', filter: ['==', ['get', 'kind'], 'land'], paint: { 'line-color': '#04060b', 'line-width': 4, 'line-opacity': 0.55 } });
      map.addLayer({
        id: 'borders',
        type: 'line',
        source: 'borders',
        filter: ['==', ['get', 'kind'], 'land'],
        paint: { 'line-color': '#f4f6f9', 'line-width': ['interpolate', ['linear'], ['zoom'], 2, 0.8, 6, 1.6], 'line-opacity': 0.9 },
      });
      map.addLayer({
        id: 'borders-disputed',
        type: 'line',
        source: 'borders',
        filter: ['==', ['get', 'kind'], 'disputed'],
        paint: { 'line-color': '#f4f6f9', 'line-width': 1.1, 'line-opacity': 0.7, 'line-dasharray': [2, 2] },
      });
      if (ukraine) {
        map.addLayer({ id: 'ua-halo', type: 'line', source: 'ua-outline', paint: { 'line-color': '#04060b', 'line-width': 6, 'line-opacity': 0.6 } });
        map.addLayer({ id: 'ua-line', type: 'line', source: 'ua-outline', paint: { 'line-color': '#ffd23f', 'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1.6, 7, 3] } });
      }
      map.addSource('country-names', { type: 'geojson', data: countryNames(lang) });
      map.addLayer({
        id: 'country-names',
        type: 'symbol',
        source: 'country-names',
        maxzoom: 7,
        filter: ['any', ['==', ['get', 'big'], 1], ['>=', ['zoom'], 3.6]],
        layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': ['case', ['==', ['get', 'big'], 1], 13, 11], 'text-letter-spacing': 0.02 },
        paint: { 'text-color': '#f4f6f9', 'text-halo-color': 'rgba(4,6,11,0.85)', 'text-halo-width': 1.6 },
      });
      setBase(true);
    });
    return () => {
      cancelled = true;
    };
    // The names follow the language in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);
  useEffect(() => {
    if (!base) return;
    (mapRef.current?.getSource('country-names') as GeoJSONSource | undefined)?.setData(countryNames(lang));
  }, [lang, base]);

  // Ukraine mode: dim the neighbours, and fly there the first time.
  const flewTo = useRef(false);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !base) return;
    if (map.getLayer('ua-mask')) map.setLayoutProperty('ua-mask', 'visibility', uaMode ? 'visible' : 'none');
    if (uaMode && !flewTo.current) {
      flewTo.current = true;
      // Room for the panel on the right; on a phone the panel sits on top, the timeline below.
      const narrow = map.getContainer().clientWidth < 720;
      const padding = narrow ? { top: 190, bottom: 130, left: 16, right: 16 } : { top: 90, bottom: 40, left: 40, right: 320 };
      map.fitBounds(UKRAINE_BOUNDS, { padding, duration: 900 });
    }
  }, [uaMode, base]);

  // ---------- Ukraine layers ----------
  const setGeo = useCallback((id: string, data: GeoJSON.FeatureCollection | null, add: (map: MlMap) => void) => {
    const map = mapRef.current;
    if (!map) return;
    if (!data) {
      for (const l of LAYER_IDS(id)) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', 'none');
      return;
    }
    const src = map.getSource(id) as GeoJSONSource | undefined;
    if (src) src.setData(data);
    else {
      map.addSource(id, { type: 'geojson', data });
      add(map);
    }
    for (const l of LAYER_IDS(id)) if (map.getLayer(l)) map.setLayoutProperty(l, 'visibility', 'visible');
  }, []);

  // Front line (DeepState), newest version.
  useEffect(() => {
    if (!base) return;
    if (!uaMode || !ua.front || occOpen) return setGeo('front', null, () => undefined);
    let cancelled = false;
    void loadFrontHistory()
      .then((list) => dailyVersions(list).at(-1))
      .then((v) => (v ? loadFront(v.id) : null))
      .then((areas) => {
        if (cancelled || !areas) return;
        setGeo('front', frontGeo(areas), (map) => {
          map.addLayer(
            {
              id: 'front-fill',
              type: 'fill',
              source: 'front',
              paint: { 'fill-color': ['match', ['get', 'kind'], 'occupied', '#d9483b', 'liberated', '#3d8bfd', '#9b8f86'], 'fill-opacity': ['match', ['get', 'kind'], 'occupied', 0.4, 0.16] },
            },
            'borders-halo',
          );
          map.addLayer(
            { id: 'front-line', type: 'line', source: 'front', paint: { 'line-color': ['match', ['get', 'kind'], 'occupied', '#d9483b', 'liberated', '#3d8bfd', '#9b8f86'], 'line-width': 1.2, 'line-opacity': 0.8 } },
            'borders-halo',
          );
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [base, uaMode, ua.front, occOpen, setGeo]);

  // ---------- occupation timeline ----------
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
  // Web Mercator: the map stretches a canvas source linearly between its corners in Mercator.
  const occPainter = useMemo(() => (occ.history ? new OccPainter(occ.history, occ.history.box, 1400, 'mercator') : null), [occ.history]);
  const occShown = occOpen && uaMode && !!occPainter;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !base) return;
    if (!occShown || !occPainter) {
      if (map.getLayer('occ')) map.setLayoutProperty('occ', 'visibility', 'none');
      return;
    }
    const { w, s, e, n } = occPainter.box;
    if (!map.getSource('occ')) {
      map.addSource('occ', { type: 'canvas', canvas: occPainter.canvas, coordinates: [[w, n], [e, n], [e, s], [w, s]], animate: false });
      map.addLayer({ id: 'occ', type: 'raster', source: 'occ', paint: { 'raster-opacity': 1, 'raster-fade-duration': 0, 'raster-resampling': 'linear' } }, 'borders-halo');
    }
    map.setLayoutProperty('occ', 'visibility', 'visible');
  }, [occShown, occPainter, base]);
  const onOccPos = useCallback(
    (pos: number) => {
      const map = mapRef.current;
      if (!map || !occPainter) return;
      occPainter.paint(pos);
      // A paused canvas source uploads its pixels only while "playing": play for one frame.
      const src = map.getSource('occ') as CanvasSource | undefined;
      if (src) {
        src.play();
        map.once('render', () => src.pause());
        map.triggerRepaint();
      }
      const k = Math.floor(pos);
      window.setTimeout(() => {
        occPainter.warm(k + 1);
        occPainter.warm(k + 2);
      }, 0);
    },
    [occPainter],
  );

  // Official list of occupied communities.
  useEffect(() => {
    if (!base) return;
    if (!uaMode || !ua.war) return setGeo('war', null, () => undefined);
    let cancelled = false;
    void loadWar()
      .then((d) => {
        if (cancelled) return;
        setGeo('war', warGeo(d), (map) => {
          map.addLayer(
            { id: 'war-fill', type: 'fill', source: 'war', paint: { 'fill-color': ['match', ['get', 'kind'], 'occupied', '#e0533f', 'partly', '#f39a3e', '#f3c63e'], 'fill-opacity': 0.42 } },
            'borders-halo',
          );
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [base, uaMode, ua.war, setGeo]);

  // Fires of the last 48 hours (also used by the station cards).
  const [fires, setFires] = useState<LiveFires | null>(null);
  useEffect(() => {
    if (!manifest?.fires || !uaMode) return;
    let cancelled = false;
    void loadFires(manifest)
      .then((f) => !cancelled && setFires(f))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [manifest, uaMode]);
  useEffect(() => {
    if (!base) return;
    if (!uaMode || !ua.fires || !fires) return setGeo('fires', null, () => undefined);
    setGeo('fires', firesGeo(fires, manifest?.built ?? new Date().toISOString()), (map) => {
      map.addLayer({
        id: 'fires-dot',
        type: 'circle',
        source: 'fires',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 3, 1.6, 8, 4.5, 12, 8],
          'circle-color': ['interpolate', ['linear'], ['get', 'age'], 0, '#fff3b0', 6, '#ff9f1a', 24, '#ff5a1a', 48, '#b3261e'],
          'circle-stroke-color': 'rgba(4,6,11,0.6)',
          'circle-stroke-width': 0.6,
        },
      });
    });
  }, [base, uaMode, ua.fires, fires, setGeo, manifest?.built]);

  // Background radiation at fixed stations (SaveEcoBot): a tag with the dose rate at each one.
  const [radiation, setRadiation] = useState<RadStation[]>([]);
  useEffect(() => {
    if (!uaMode || !ua.radiation) return;
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
  }, [uaMode, ua.radiation]);
  const radIndex = useMemo(() => (radiation.length ? new PointIndex(radiation.map((x) => x.lat), radiation.map((x) => x.lon)) : null), [radiation]);
  const radData = useMemo<Stations | null>(
    () =>
      uaMode && ua.radiation && radiation.length
        ? {
            key: `rad|${radiation.length}`,
            lat: radiation.map((x) => x.lat),
            lon: radiation.map((x) => x.lon),
            value: radiation.map((x) => x.usv),
            label: radiation.map((x) => radLabel(x.usv, lang)),
            color: radiation.map((x) => RAD_COLORS[radBand(x.usv)]),
            old: radiation.map((x) => (isOldRad(x) ? 1 : 0)),
          }
        : null,
    [uaMode, ua.radiation, radiation, lang],
  );
  useEffect(() => {
    radLayer.set(radData);
    radLayer.canvas.hidden = !radData;
    const map = mapRef.current;
    if (!map || !view || !radData) return;
    radLayer.draw(view);
    const raf = requestAnimationFrame(() => radLayer.draw(view));
    const redraw = () => radLayer.draw(view);
    map.on('move', redraw);
    return () => {
      cancelAnimationFrame(raf);
      map.off('move', redraw);
    };
  }, [radData, radLayer, view]);
  const [radCard, setRadCard] = useState<{ i: number; x: number; y: number; pinned: boolean } | null>(null);

  // Air quality: SaveEcoBot (Ukraine) and Sensor.Community (everywhere), the AQI in each bubble.
  const [seb, setSeb] = useState<AqiStation[]>([]);
  const [world, setWorld] = useState<{ built: string; p: AirPoint[] } | null>(null);
  useEffect(() => {
    if (!uaMode || !ua.aqi) return;
    let cancelled = false;
    void loadAqi()
      .then((s) => !cancelled && setSeb(s))
      .catch(() => undefined);
    if (manifest?.air && !WAQI_TOKEN)
      void loadAir(manifest)
        .then((d) => !cancelled && setWorld(d))
        .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [uaMode, ua.aqi, manifest]);
  const waqi = useWaqi(uaMode && ua.aqi);
  const air = useMemo<AirStation[]>(() => mergeAir(seb, world, waqi.stations), [waqi.stations, seb, world]);
  const stationData = useMemo<Stations | null>(
    () =>
      uaMode && ua.aqi && air.length
        ? { key: `air|${air.length}`, lat: air.map((x) => x.lat), lon: air.map((x) => x.lon), value: air.map((x) => x.aqi), color: air.map((x) => AQI_COLORS[aqiBand(x.aqi)]), old: air.map((x) => (isOld(x) ? 1 : 0)) }
        : null,
    [uaMode, ua.aqi, air],
  );
  useEffect(() => {
    stationsLayer.set(stationData);
    stationsLayer.canvas.hidden = !stationData;
    const map = mapRef.current;
    if (!map || !view || !stationData) return;
    stationsLayer.draw(view);
    // Once more on the next frame, when the map has settled after a change of size or data.
    const raf = requestAnimationFrame(() => stationsLayer.draw(view));
    const redraw = () => stationsLayer.draw(view);
    map.on('move', redraw);
    return () => {
      cancelAnimationFrame(raf);
      map.off('move', redraw);
    };
  }, [stationData, stationsLayer, view]);
  const [airCard, setAirCard] = useState<{ i: number; x: number; y: number; pinned: boolean } | null>(null);

  // ---------- pointer ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !view) return;
    // An air bubble wins over a radiation tag under it.
    const move = (e: maplibregl.MapMouseEvent) => {
      const i = stationsLayer.active ? stationsLayer.hit(e.point.x, e.point.y) : -1;
      const r = i < 0 && radLayer.active ? radLayer.hit(e.point.x, e.point.y) : -1;
      if (i !== stationsLayer.hovered) {
        stationsLayer.hovered = i;
        stationsLayer.draw(view);
      }
      if (r !== radLayer.hovered) {
        radLayer.hovered = r;
        radLayer.draw(view);
      }
      map.getCanvas().style.cursor = i >= 0 || r >= 0 ? 'pointer' : '';
      setAirCard((c) => (c?.pinned ? c : i >= 0 ? { i, x: e.point.x, y: e.point.y, pinned: false } : null));
      setRadCard((c) => (c?.pinned ? c : r >= 0 ? { i: r, x: e.point.x, y: e.point.y, pinned: false } : null));
      setHover({ x: e.point.x, y: e.point.y, lat: e.lngLat.lat, lon: e.lngLat.wrap().lng });
    };
    const click = (e: maplibregl.MapMouseEvent) => {
      const i = stationsLayer.active ? stationsLayer.hit(e.point.x, e.point.y) : -1;
      if (i >= 0) {
        setRadCard(null);
        setAirCard({ i, x: e.point.x, y: e.point.y, pinned: true });
        return;
      }
      const r = radLayer.active ? radLayer.hit(e.point.x, e.point.y) : -1;
      if (r >= 0) {
        setAirCard(null);
        setRadCard({ i: r, x: e.point.x, y: e.point.y, pinned: true });
        return;
      }
      setPoint({ lat: e.lngLat.lat, lon: e.lngLat.wrap().lng });
    };
    map.on('mousemove', move);
    map.on('click', click);
    return () => {
      map.off('mousemove', move);
      map.off('click', click);
    };
  }, [view, stationsLayer, radLayer]);

  // ---------- forecast frames ----------
  const run = manifest?.weather?.run;
  useEffect(() => {
    if (manifest?.weather) setIndex(nearestFrame(manifest));
  }, [run, manifest]);
  // The frame is needed for the weather, and for the wind and rain on the station cards.
  const wantFrame = weather || (uaMode && ua.aqi);
  useEffect(() => {
    if (!manifest?.weather || index === null || !wantFrame) return;
    let cancelled = false;
    loadFrame(manifest, index)
      .then((f) => !cancelled && setFrame(f))
      .catch(() => undefined);
    if (index + 1 < frames.length) void loadFrame(manifest, index + 1).catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [manifest, index, frames.length, wantFrame]);
  // The air quality forecast: its own 3-hour steps. The weather frame follows its time, so the
  // wind lines and the station cards stay those of the same moment.
  const [airq, setAirq] = useState<GridFrame[] | null>(null);
  const [airIndex, setAirIndex] = useState<number | null>(null);
  const airBuilt = manifest?.airq?.built;
  useEffect(() => {
    if (!manifest?.airq || !isAir || !weather) return;
    let cancelled = false;
    void loadAirq(manifest)
      .then((list) => {
        if (cancelled) return;
        setAirq(list);
        const at = Date.now();
        let best = 0;
        list.forEach((f, i) => Math.abs(f.time.getTime() - at) < Math.abs(list[best].time.getTime() - at) && (best = i));
        setAirIndex((i) => (i !== null && i < list.length ? i : best));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // The frames change only with a new forecast.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [airBuilt, isAir, weather]);
  const airFrame = isAir && airq && airIndex !== null ? (airq[airIndex] ?? null) : null;
  useEffect(() => {
    if (airFrame && manifest?.weather) setIndex(nearestFrame(manifest, airFrame.time.getTime()));
  }, [airFrame, manifest]);
  useEffect(() => {
    if (!playing || !isAir || !airq?.length) return;
    const id = window.setInterval(() => setAirIndex((i) => (i === null || i + 1 >= airq.length ? 0 : i + 1)), STEP_MS);
    return () => window.clearInterval(id);
  }, [playing, isAir, airq]);

  // Playback: a clock runs through the forecast smoothly, one 3-hour step every STEP_MS. The wind
  // lines blend between the two frames around the clock, so they never jump; the colour field
  // cross-fades at each step from a picture painted while the previous step was showing.
  const STEP_MS = 2000;
  const FIELD_PX = 640;
  const blend = useRef<{ a: WeatherFrame | null; b: WeatherFrame | null; f: number }>({ a: null, b: null, f: 0 });
  useEffect(() => {
    blend.current = { a: frame, b: null, f: 0 };
  }, [frame]);
  useEffect(() => {
    if (!playing || !manifest?.weather || index === null || layer === 'radar' || isAir || !frames.length) return;
    let raf = 0;
    let cancelled = false;
    let clock = index;
    let last = performance.now();
    let shown = index;
    let next: WeatherFrame | null = null;
    const want = (i: number) => (i + 1 >= frames.length ? 0 : i + 1);
    void loadFrame(manifest, want(index)).then((f) => (next = f));
    const tick = (now: number) => {
      if (cancelled) return;
      // Wait for the next frame before moving past the current one.
      const dt = Math.min(100, now - last);
      last = now;
      if (next) clock += dt / STEP_MS;
      const i = Math.floor(clock);
      if (i !== shown) {
        const reached: WeatherFrame | null = next;
        shown = i >= frames.length ? 0 : i;
        if (i >= frames.length) clock = 0;
        next = null;
        // The frame just reached becomes the base at once, so the wind does not step back.
        if (reached) blend.current = { a: reached, b: null, f: 0 };
        setIndex(shown);
        void loadFrame(manifest, want(shown)).then((f) => (next = f));
      }
      blend.current = { a: blend.current.a, b: next, f: clock - Math.floor(clock) };
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      blend.current = { ...blend.current, b: null, f: 0 };
    };
    // The clock starts from the frame shown when playback begins; index changes come from the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, manifest, frames.length, layer, isAir]);

  // Painted fields, kept for replays. They are painted in a worker (fieldPainter.ts), so the map
  // keeps moving while a frame is drawn. The weather is a 1° grid, so 640 pixels across the world
  // already hold every detail; the map smooths it on the GPU.
  const painted = useRef(new Map<string, Promise<ImageBitmap | HTMLCanvasElement>>());
  const paint = useCallback((f: GridFrame, kind: FieldKind, view: FieldView): Promise<ImageBitmap | HTMLCanvasElement> => {
    const key = `${kind}|${f.time.toISOString()}|${view.width}x${view.height}|${view.west},${view.north}`;
    const cache = painted.current;
    let p = cache.get(key);
    if (p) {
      // Most recently used last, so the oldest goes first.
      cache.delete(key);
      cache.set(key, p);
      return p;
    }
    p = paintFieldAsync(f, kind, view);
    cache.set(key, p);
    if (cache.size > 28) {
      const oldest = cache.keys().next().value as string;
      void cache.get(oldest)?.then((pic) => 'close' in pic && pic.close());
      cache.delete(oldest);
    }
    return p;
  }, []);

  // The colour field, under Ukraine's mask so the dimming still reads: two layers cross-fade.
  // They are canvas sources, which keep one texture each and only refresh its pixels; an image
  // source builds a new texture for every picture and stalls the map for about a second. The
  // weather covers the world, the air forecast its own box: the sources move to the box shown.
  const front = useRef(0);
  const fieldCanvases = useRef<HTMLCanvasElement[] | null>(null);
  const placed = useRef('');
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const ids = ['field-0', 'field-1'];
    const shown = isAir ? airFrame : frame;
    if (!weather || layer === 'radar' || !shown || (isAir && !manifest?.airq)) {
      for (const id of ids) if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
      return;
    }
    const { view, coords } = isAir ? airView(manifest!) : { view: worldView('mercator', FIELD_PX), coords: WORLD };
    let cancelled = false;
    void paint(shown, layer, view).then((pic) => {
      if (cancelled || !mapRef.current) return;
      const canvases = (fieldCanvases.current ??= ids.map(() => document.createElement('canvas')));
      const where = coords.flat().join(',');
      const moved = placed.current !== where;
      for (const [i, id] of ids.entries()) {
        const c = canvases[i];
        if (c.width !== view.width || c.height !== view.height) {
          c.width = view.width;
          c.height = view.height;
        }
        const src = map.getSource(id) as CanvasSource | undefined;
        if (!src) {
          map.addSource(id, { type: 'canvas', canvas: c, coordinates: coords, animate: false });
          map.addLayer({ id, type: 'raster', source: id, paint: { 'raster-opacity': 0, 'raster-fade-duration': 0, 'raster-resampling': 'linear' } }, map.getLayer('ua-mask') ? 'ua-mask' : undefined);
        } else if (moved) {
          // A picture of the other box must not flash in the new place: clear and hide both first.
          c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
          map.setPaintProperty(id, 'raster-opacity-transition', { duration: 0, delay: 0 });
          map.setPaintProperty(id, 'raster-opacity', 0);
          src.setCoordinates(coords);
        }
      }
      placed.current = where;
      const next = 1 - front.current;
      const ctx = canvases[next].getContext('2d')!;
      ctx.clearRect(0, 0, view.width, view.height);
      ctx.drawImage(pic, 0, 0);
      // A paused canvas source uploads its pixels only while "playing": play for one frame.
      for (const id of moved ? ids : [ids[next]]) {
        const src = map.getSource(id) as CanvasSource | undefined;
        if (src) {
          src.play();
          map.once('render', () => src.pause());
        }
      }
      const fade = playing ? Math.round(STEP_MS * 0.6) : 250;
      for (const id of ids) {
        map.setLayoutProperty(id, 'visibility', 'visible');
        map.setPaintProperty(id, 'raster-opacity-transition', { duration: fade, delay: 0 });
      }
      map.setPaintProperty(ids[next], 'raster-opacity', isAir ? 0.78 : 0.82);
      map.setPaintProperty(ids[front.current], 'raster-opacity', 0);
      front.current = next;
    });
    // Paint the next step while this one shows, so the next cross-fade is ready in time.
    if (playing && isAir && airq && airIndex !== null) void paint(airq[(airIndex + 1) % airq.length], layer, view);
    else if (playing && !isAir && manifest?.weather && index !== null) {
      const ni = index + 1 >= frames.length ? 0 : index + 1;
      void loadFrame(manifest, ni).then((f) => {
        if (!cancelled) void paint(f, layer, view);
      });
    }
    return () => {
      cancelled = true;
    };
    // index and frames are read only to paint ahead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, airFrame, isAir, layer, ready, weather, base, paint]);

  // The wind lines read the blend on every particle step, so they are never reset by a new frame.
  const windAt = useCallback((lat: number, lon: number): [number, number] | null => {
    const { a, b, f } = blend.current;
    if (!a) return null;
    const [u1, v1] = a.wind(lat, lon);
    if (!b || f <= 0) return [u1, v1];
    const [u2, v2] = b.wind(lat, lon);
    return [u1 + (u2 - u1) * f, v1 + (v2 - v1) * f];
  }, []);
  const hasFrame = !!frame;
  useEffect(() => {
    flow.setWind(weather && particles === 'on' && hasFrame && layer !== 'radar' ? windAt : null);
  }, [flow, hasFrame, particles, layer, weather, windAt]);

  // Radar.
  useEffect(() => {
    if (!weather || layer !== 'radar') return;
    let cancelled = false;
    const load = () =>
      loadRadar()
        .then((r) => !cancelled && setRadar((old) => (old && old.frames.at(-1)?.time === r.frames.at(-1)?.time ? old : r)))
        .catch(() => undefined);
    void load();
    const id = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [layer, weather]);
  useEffect(() => {
    if (radar) setRadarIndex(radar.frames.length - 1);
  }, [radar]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    if (!weather || layer !== 'radar' || !radar || radarIndex === null) {
      if (map.getLayer('radar')) map.setLayoutProperty('radar', 'visibility', 'none');
      return;
    }
    const f = radar.frames[radarIndex];
    if (map.getLayer('radar')) map.removeLayer('radar');
    if (map.getSource('radar')) map.removeSource('radar');
    map.addSource('radar', { type: 'raster', tiles: [`${radar.host}${f.path}/256/{z}/{x}/{y}/2/1_1.png`], tileSize: 256, maxzoom: 7, attribution: 'Radar © <a href="https://www.rainviewer.com/" target="_blank" rel="noreferrer">RainViewer</a>' });
    map.addLayer({ id: 'radar', type: 'raster', source: 'radar', paint: { 'raster-opacity': 0.85, 'raster-fade-duration': 0 } }, map.getLayer('ua-mask') ? 'ua-mask' : undefined);
  }, [radar, radarIndex, layer, ready, weather]);
  useEffect(() => {
    if (!playing || layer !== 'radar' || !radar || radarIndex === null) return;
    const id = window.setTimeout(() => setRadarIndex((radarIndex + 1) % radar.frames.length), 700);
    return () => window.clearTimeout(id);
  }, [playing, layer, radar, radarIndex]);

  // ---------- point forecast ----------
  const [hourly, setHourly] = useState<{ data: Hourly | null; error: boolean } | null>(null);
  useEffect(() => {
    if (!point) return;
    const ctrl = new AbortController();
    setHourly({ data: null, error: false });
    const q = new URLSearchParams({
      latitude: point.lat.toFixed(3),
      longitude: point.lon.toFixed(3),
      hourly: 'temperature_2m,precipitation,wind_speed_10m,wind_direction_10m',
      forecast_hours: '48',
      wind_speed_unit: 'ms',
      timezone: 'auto',
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${q}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { hourly: Hourly }) => setHourly({ data: d.hourly, error: false }))
      .catch(() => !ctrl.signal.aborted && setHourly({ data: null, error: true }));
    return () => ctrl.abort();
  }, [point]);
  const marker = useRef<maplibregl.Marker | null>(null);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    marker.current?.remove();
    marker.current = null;
    if (point) {
      const el = document.createElement('div');
      el.className = 'wm-marker';
      marker.current = new maplibregl.Marker({ element: el }).setLngLat([point.lon, point.lat]).addTo(map);
    }
  }, [point]);

  // ---------- words ----------
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const fmtFrame = useCallback(
    (i: number) => {
      const f = frames[Math.round(i)];
      return f ? new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(f.time)) : '';
    },
    [frames, locale],
  );
  const dayStarts = useMemo(() => {
    const out: number[] = [];
    let last = -1;
    frames.forEach((f, i) => {
      const d = new Date(f.time).getDate();
      if (d !== last) {
        out.push(i);
        last = d;
      }
    });
    return out;
  }, [frames]);
  const fmtAir = (i: number) => {
    const f = airq?.[Math.round(i)];
    return f ? new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(f.time) : '';
  };
  const airDays = useMemo(() => {
    const out: number[] = [];
    let last = -1;
    (airq ?? []).forEach((f, i) => {
      const d = f.time.getDate();
      if (d !== last) {
        out.push(i);
        last = d;
      }
    });
    return out;
  }, [airq]);
  const fmtRadar = (i: number) => {
    const f = radar?.frames[Math.round(i)];
    return f ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(f.time * 1000)) : '';
  };
  const unitOf: Record<FieldKind, string> = { wind: w.units.wind, gust: w.units.wind, temp: w.units.temp, precip: w.units.precip, cloud: w.units.cloud, aqi: 'AQI', pm25: w.units.ugm3, dust: w.units.ugm3 };
  const readout = (() => {
    if (!hover || airCard || radCard) return null;
    const parts: string[] = [];
    const shown = isAir ? airFrame : frame;
    const value = weather && shown && layer !== 'radar' ? fieldValue(shown, layer, hover.lat, hover.lon) : Number.NaN;
    if (Number.isFinite(value)) parts.push(`${new Intl.NumberFormat(locale, { maximumFractionDigits: layer === 'precip' ? 1 : 0 }).format(value)} ${unitOf[layer as FieldKind]}${isAir ? ` · ${w.model2}` : ''}`);
    const near = uaMode && ua.radiation ? nearestRad(radIndex, radiation, hover.lat, hover.lon) : null;
    if (near) parts.push(t.ukraine.radiationAt(radLabel(near.s.usv, lang), t.ukraine.radiationLevel[radBand(near.s.usv)], new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(near.km)));
    return parts.length ? parts.join(' · ') : null;
  })();
  const now = manifest ? nearestFrame(manifest) : null;
  const setMode = (next: Mode) => setParams({ mode: next }, { replace: true });
  const toggle = (k: keyof typeof ua) => setUa((s) => ({ ...s, [k]: !s[k] }));

  return (
    <main className={`weather-map weather-map--${mode}`}>
      <h1 className="visually-hidden">{uaMode ? m.titleUkraine : w.title}</h1>
      <div ref={host} className="weather-map__map" />

      <TopBar back view="2d" center={<CountrySearch onFound={(c) => mapRef.current?.flyTo({ center: [c.lon, c.lat], zoom: c.big ? 3.6 : 5.4, duration: 1200 })} />} />

      <aside className={`wm-layers${sheet ? ' wm-layers--open' : ''}`} aria-label={uaMode ? m.titleUkraine : w.title}>
        <div className="wm-modes" role="group">
          <button type="button" aria-pressed={uaMode} onClick={() => setMode('ukraine')}>
            <Icon name="ukraine" size={16} />
            {t.view.ukraine}
          </button>
          <button type="button" aria-pressed={!uaMode} onClick={() => setMode('weather')}>
            <Icon name="wind" size={16} />
            {t.view.weather}
          </button>
        </div>
        {/* On a phone the panel folds down to the two modes and this button. */}
        <button type="button" className="wm-layers__more" aria-expanded={sheet} onClick={() => setSheet((s) => !s)}>
          <Icon name="layers" size={16} />
          {sheet ? m.panelClose : m.panelOpen}
        </button>

        {uaMode && (
          <div className="wm-ua">
            <Switch checked={ua.aqi} onChange={() => toggle('aqi')} label={WAQI_TOKEN ? t.ukraine.aqiWaqi : t.ukraine.aqi} />
            <Switch checked={ua.fires} onChange={() => toggle('fires')} label={t.ukraine.fires} />
            <Switch checked={ua.front} onChange={() => toggle('front')} label={t.ukraine.front} />
            <button
              type="button"
              className="occ-open"
              aria-pressed={occOpen}
              onClick={() => {
                setOccOpen(true);
                setPlaying(false);
                const narrow = mapRef.current ? mapRef.current.getContainer().clientWidth < 720 : false;
                mapRef.current?.fitBounds([[29.5, 44.2], [40.3, 52.5]], { padding: narrow ? { top: 120, bottom: 300, left: 16, right: 16 } : { top: 80, bottom: 330, left: 40, right: 300 }, duration: 900 });
              }}
            >
              <strong>
                <Icon name="play" size={16} />
                {t.occupation.open}
              </strong>
              <span>{t.occupation.openNote}</span>
            </button>
            {ua.front && (
              <ul className="front-keys wm-keys">
                {(['occupied', 'liberated', 'unknown'] as const).map((k) => (
                  <li key={k}>
                    <span className={`front-key front-key--${k}`} />
                    {t.ukraine.frontKeys[k]}
                  </li>
                ))}
              </ul>
            )}
            <Switch checked={ua.war} onChange={() => toggle('war')} label={t.ukraine.war} />
            <Switch checked={ua.radiation} onChange={() => toggle('radiation')} label={t.ukraine.radiation} />
            <div className="wm-sep" />
            {manifest?.airq && (
              <Switch
                checked={weatherOver === 'on' && isAir}
                onChange={(on) => {
                  setWeatherOver(on ? 'on' : 'off');
                  setLayer(on ? 'aqi' : 'wind');
                }}
                label={m.airForecast}
              />
            )}
            <Switch checked={weatherOver === 'on' && !isAir} onChange={(on) => {
              setWeatherOver(on ? 'on' : 'off');
              if (on && isAir) setLayer('wind');
            }} label={m.weatherOver} />
          </div>
        )}

        {weather && (
          <div className="wm-weather">
            {LAYERS.map((l) => (
              <button key={l.id} type="button" className="wm-layers__btn" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
                <Icon name={l.icon} size={20} />
                <span>{w.layers[l.id]}</span>
              </button>
            ))}
            {manifest?.airq && (
              <>
                <p className="wm-group">{w.airGroup}</p>
                {AIR_LAYERS.map((l) => (
                  <button key={l.id} type="button" className="wm-layers__btn" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
                    <Icon name={l.icon} size={20} />
                    <span>{w.layers[l.id]}</span>
                  </button>
                ))}
              </>
            )}
            <label className="wm-layers__toggle">
              <input type="checkbox" checked={particles === 'on'} onChange={(e) => setParticles(e.target.checked ? 'on' : 'off')} />
              <span className="switch__track" aria-hidden="true" />
              <span>{w.particles}</span>
            </label>
          </div>
        )}
        <p className="wm-updated">
          {weather ? (isAir ? w.airSource : w.model) : WAQI_TOKEN ? m.sourcesUkraine.replace('SaveEcoBot', 'WAQI · SaveEcoBot') : m.sourcesUkraine}
          {manifest && ` · ${t.updated(ago(manifest.built, lang))}`}
        </p>
      </aside>

      {readout && hover && (
        <p className="wm-readout" style={{ transform: `translate(${hover.x + 14}px, ${hover.y + 14}px)` }}>
          {readout}
        </p>
      )}

      {radCard && !airCard && radiation[radCard.i] && <RadCard station={radiation[radCard.i]} x={radCard.x} y={radCard.y} pinned={radCard.pinned} onClose={() => setRadCard(null)} />}
      {airCard && air[airCard.i] && <AirCard station={air[airCard.i]} x={airCard.x} y={airCard.y} pinned={airCard.pinned} frame={frame} fires={fires} onClose={() => setAirCard(null)} />}

      <div className="wm-legend">
        {weather && (layer === 'radar' ? <RadarLegend note={w.radarNote} /> : <FieldLegend kind={layer} />)}
        {weather && isAir && <p className="wm-legend__note">{w.airNote}</p>}
        {uaMode && ua.radiation && <RadiationLegend />}
        {uaMode && ua.aqi && !weather && (
          <ul className="aqi-keys aqi-keys--row">
            {t.ukraine.aqiBands.map((b, i) => (
              <li key={b}>
                <span className="aqi-dot" style={{ background: `#${AQI_COLORS[i].toString(16).padStart(6, '0')}` }} />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapStyleButton style={style} onStyle={setStyle} />

      {uaMode && occOpen && occ.history && <OccupationPlayer className="occ-player--map" history={occ.history} onPos={onOccPos} onClose={() => setOccOpen(false)} />}
      {uaMode && occOpen && !occ.history && (
        <p className="wm-status" role="status">
          {occ.status === 'error' ? t.occupation.error : t.occupation.loading}
        </p>
      )}

      {weather && !(uaMode && occOpen) && (
        <section className="wm-timeline" aria-label={w.title}>
          <button type="button" className="play-btn" aria-label={playing ? w.pause : w.play} onClick={() => setPlaying(!playing)}>
            <Icon name={playing ? 'pause' : 'play'} />
          </button>
          {layer === 'radar' ? (
            radar && radarIndex !== null ? (
              <JellySlider className="wm-timeline__slider" min={0} max={radar.frames.length - 1} value={radarIndex} onChange={setRadarIndex} label={w.layers.radar} format={fmtRadar} majors={radar.frames.map((_, i) => i).filter((i) => i % 3 === 0)} />
            ) : (
              <span className="note">{t.loading}</span>
            )
          ) : isAir ? (
            airq && airIndex !== null ? (
              <JellySlider
                className="wm-timeline__slider"
                min={0}
                max={airq.length - 1}
                value={airIndex}
                onChange={(i) => {
                  setPlaying(false);
                  setAirIndex(i);
                }}
                label={w.layers[layer]}
                format={fmtAir}
                formatTick={(i) => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(airq[Math.round(i)].time)}
                majors={airDays}
                minorStep={1}
              />
            ) : (
              <span className="note">{t.loading}</span>
            )
          ) : frames.length && index !== null ? (
            <JellySlider
              className="wm-timeline__slider"
              min={0}
              max={frames.length - 1}
              value={index}
              onChange={(i) => {
                setPlaying(false);
                setIndex(i);
              }}
              label={w.title}
              format={fmtFrame}
              formatTick={(i) => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric' }).format(new Date(frames[Math.round(i)].time))}
              majors={dayStarts}
              minorStep={1}
            />
          ) : (
            <span className="note">{manifest ? t.loading : t.noLive}</span>
          )}
          <div className="wm-timeline__when">
            <strong>{layer === 'radar' ? (radarIndex !== null ? fmtRadar(radarIndex) : '') : isAir ? (airIndex !== null ? fmtAir(airIndex) : '') : index !== null ? fmtFrame(index) : ''}</strong>
            {layer !== 'radar' && !isAir && now !== null && index !== now && (
              <button type="button" className="chip-btn" onClick={() => setIndex(now)}>
                {w.now}
              </button>
            )}
          </div>
        </section>
      )}

      {point && <PointForecast point={point} data={hourly?.data ?? null} error={!!hourly?.error} onClose={() => setPoint(null)} />}
      {!point && !airCard && !radCard && <p className="wm-hint">{uaMode && ua.aqi ? m.hintUkraine : w.clickHint}</p>}
    </main>
  );
}

function MapStyleButton({ style, onStyle }: { style: Style; onStyle: (s: Style) => void }) {
  const t = useLiveText().map2d;
  const [open, setOpen] = useState(false);
  const thumb = (s: Style) =>
    s === 'osm'
      ? 'https://tile.openstreetmap.org/4/9/5.png'
      : `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${s === 'relief' ? 'BlueMarble_ShadedRelief_Bathymetry' : 'BlueMarble_NextGeneration'}/default/default/GoogleMapsCompatible_Level8/3/2/4.jpeg`;
  return (
    <div className="map-style wm-style">
      {open && (
        <section className="map-style__pop" aria-label={t.style}>
          <h2 className="map-style__title">{t.style}</h2>
          <div className="map-style__cards map-style__cards--three">
            {(['relief', 'satellite', 'osm'] as const).map((s) => (
              <button
                key={s}
                type="button"
                className="style-card"
                aria-pressed={style === s}
                onClick={() => {
                  onStyle(s);
                  setOpen(false);
                }}
              >
                <img src={thumb(s)} alt="" loading="lazy" />
                <span>{t.styles[s]}</span>
              </button>
            ))}
          </div>
        </section>
      )}
      <button type="button" className="map-style__btn" aria-expanded={open} aria-label={t.style} onClick={() => setOpen(!open)}>
        <img src={thumb(style)} alt="" />
        <span>{t.style}</span>
      </button>
    </div>
  );
}

function RadarLegend({ note }: { note: string }) {
  return (
    <div className="live-legend">
      <span className="live-legend__ramp live-legend__ramp--radar" aria-hidden="true" />
      <span className="live-legend__ticks">
        <span>0.1</span>
        <span>1</span>
        <span>5</span>
        <span>20+</span>
        <span className="live-legend__unit">mm/h</span>
      </span>
      <p className="note">{note}</p>
    </div>
  );
}

/** A small meteogram for the clicked place: temperature, precipitation and wind for 48 hours. */
function PointForecast({ point, data, error, onClose }: { point: Point; data: Hourly | null; error: boolean; onClose: () => void }) {
  const { lang } = useI18n();
  const t = useLiveText();
  const w = t.weatherMap;
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const W = 320;
  const H = 120;
  const body = (() => {
    if (error) return <p className="note">{t.error}</p>;
    if (!data) return <p className="note">{w.loadingForecast}</p>;
    const n = data.time.length;
    const temps = data.temperature_2m;
    const lo = Math.min(...temps);
    const hi = Math.max(...temps);
    const k = hi - lo || 1;
    const x = (i: number) => 6 + (i / Math.max(1, n - 1)) * (W - 12);
    const y = (v: number) => 14 + (1 - (v - lo) / k) * 54;
    const line = temps.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const pmax = Math.max(1, ...data.precipitation);
    const days: number[] = [];
    data.time.forEach((tm, i) => tm.endsWith('T00:00') && i > 0 && days.push(i));
    const f0 = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    const f1 = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const total = data.precipitation.reduce((a, b) => a + b, 0);
    const windMax = Math.max(...data.wind_speed_10m);
    return (
      <>
        <div className="pf__now">
          <strong>{f0.format(temps[0])}°</strong>
          <span>
            {f0.format(lo)}° … {f0.format(hi)}° · {f1.format(total)} {w.units.precip.split('/')[0]} · ≤ {f0.format(windMax)} {w.units.wind}
          </span>
        </div>
        <svg className="pf__chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={w.hourly}>
          {days.map((i) => (
            <line key={i} x1={x(i)} x2={x(i)} y1={4} y2={H - 4} className="pf__day" />
          ))}
          {data.precipitation.map((p, i) => (p > 0.05 ? <rect key={i} x={x(i) - 2.5} width={5} y={H - 6 - (p / pmax) * 34} height={(p / pmax) * 34} rx={1.5} className="pf__rain" /> : null))}
          <path d={line} className="pf__temp" />
          {data.wind_speed_10m.map((s, i) =>
            i % 6 === 0 ? (
              <g key={i} transform={`translate(${x(i)} ${H - 52}) rotate(${data.wind_direction_10m[i] + 180})`}>
                <path d="M0 -5 L3 3 L0 1.5 L-3 3 Z" className="pf__arrow" style={{ opacity: 0.45 + Math.min(0.55, s / 15) }} />
              </g>
            ) : null,
          )}
          {data.time.map((tm, i) =>
            i % 12 === 0 ? (
              <text key={i} x={x(i)} y={H - 1} className="pf__tick">
                {new Intl.DateTimeFormat(locale, { weekday: 'short', hour: '2-digit' }).format(new Date(tm))}
              </text>
            ) : null,
          )}
        </svg>
      </>
    );
  })();
  return (
    <section className="pf" aria-label={w.forecastAt}>
      <header className="pf__head">
        <div>
          <h2>{w.forecastAt}</h2>
          <p>
            {point.lat.toFixed(2)}°, {point.lon.toFixed(2)}° · {w.hourly}
          </p>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      {body}
      <p className="pf__src">Open-Meteo</p>
    </section>
  );
}
