// Smoke on the globe, in two kinds of scenes that share one smoke layer:
// - a fire story's smoke scene: the past, with the real wind of those days (ERA5) and the CAMS
//   air of the towns around;
// - the forecast for fires burning now: the next hours with the forecast wind (NOAA GFS), the
//   fire weather of three days and the CAMS air forecast of the towns around.
// Opening one closes the other; an answer that arrives after another scene opened is dropped.
// The same scenes play on the 3D globe and on the 2D map: the page gives a target that shows the
// smoke layer and moves the view.

import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { SmokeLayer, SmokeSim, type SmokeBox, type SmokeSource, type SmokeTown, type WindAt } from '../components/globe/smoke';
import type { WorldCity } from '../data/cities';
import { airOutlook, fireWeather, hotspotSources, townsAround, type AirOutlook, type FireWeatherDay, type Hotspot } from '../data/hotspots';
import type { LiveFires, LiveManifest } from '../data/live';
import { forecastWind, hoursBetween, isoHour, makeTowns, pastWind, storySources, townsAir } from '../data/smoke';
import { smokeSceneFor, type SmokeScene } from '../data/smokeScenes';
import { loadStory, type FireStory } from '../data/ukraine';

export type SmokeStatus = 'loading' | 'ready' | 'error';

/** Where the smoke is shown: the globe or the map. */
export type SmokeTarget = {
  /** Shows the smoke layer (null hides it), centred near a place. */
  show: (layer: SmokeLayer | null, centre?: { lat: number; lon: number }) => void;
  /** Looks at a scene: its middle, the globe's camera distance, and the box it covers. */
  look: (view: { lat: number; lon: number; distance: number; box: SmokeBox }) => void;
  /** The clock of a fire story's points (the globe draws them). */
  storyTime?: (hours: number) => void;
};

export type StoryScene = { kind: 'story'; scene: SmokeScene; story: FireStory; offset: number; status: SmokeStatus; towns: SmokeTown[] };
export type ForecastScene = {
  kind: 'forecast';
  hotspot: Hotspot;
  title: string;
  /** The hour the scene starts (ms), and its length. */
  start: number;
  hours: number;
  status: SmokeStatus;
  towns: SmokeTown[];
  weather: FireWeatherDay[] | null;
  air: AirOutlook[] | null;
};

/** Hours of the forecast scene: a day of smoke, if the fires keep burning as now. */
export const FORECAST_HOURS = 24;

/** The box around the burning places with some room: the wind arrows stay near the fires. */
export function nearBox(sources: SmokeSource[], fallback: SmokeBox): SmokeBox {
  if (!sources.length) return fallback;
  let s = 90;
  let n = -90;
  let w = 180;
  let e = -180;
  for (const x of sources) {
    s = Math.min(s, x.lat);
    n = Math.max(n, x.lat);
    w = Math.min(w, x.lon);
    e = Math.max(e, x.lon);
  }
  const pad = Math.max(0.25, (n - s) * 0.4);
  return { s: s - pad, n: n + pad, w: w - pad * 1.4, e: e + pad * 1.4 };
}

/** The start of the current hour (ms). */
const thisHour = () => Math.floor(Date.now() / 3600_000) * 3600_000;

export function useSmoke(target: RefObject<SmokeTarget | null>, onOpen: () => void, className = 'globe__smoke') {
  const layer = useMemo(() => new SmokeLayer(className), [className]);
  const [state, setState] = useState<StoryScene | ForecastScene | null>(null);
  const token = useRef(0);

  const close = useCallback(() => {
    token.current++;
    layer.set(null);
    target.current?.show(null);
    setState(null);
  }, [layer, target]);

  /** Puts a built model on the view, if no other scene opened meanwhile. */
  const show = useCallback(
    (id: number, sim: SmokeSim, wind: WindAt, near: SmokeBox, towns: SmokeTown[], centre: { lat: number; lon: number }) => {
      if (id !== token.current) return false;
      layer.set(sim, wind, near);
      layer.setTowns(towns);
      layer.setTime(0);
      target.current?.show(layer, centre);
      return true;
    },
    [layer, target],
  );

  /** A fire story's smoke scene. */
  const openStory = useCallback(
    (story: FireStory, cities: WorldCity[], lang: 'uk' | 'en') => {
      const scene = smokeSceneFor(story.id);
      if (!scene) return;
      const id = ++token.current;
      const offset = hoursBetween(`${story.start}T00:00:00Z`, isoHour(scene.start));
      setState({ kind: 'story', scene, story, offset, status: 'loading', towns: [] });
      onOpen();
      target.current?.look({ ...scene.camera, box: scene.box });
      target.current?.storyTime?.(offset);
      const inBox = cities.filter((c) => c.lat >= scene.box.s && c.lat <= scene.box.n && c.lon >= scene.box.w && c.lon <= scene.box.e);
      const named = scene.towns ? scene.towns.map((n) => inBox.find((c) => c.en === n)).filter((c): c is WorldCity => !!c) : [];
      const picked = (named.length ? named : inBox.slice(0, 8)).map((c) => ({ lat: c.lat, lon: c.lon, name: c[lang] }));
      const wide = scene.box.e - scene.box.w > 6;
      void Promise.all([loadStory(story), pastWind(scene.box, scene.start, scene.hours), townsAir(picked, scene.start, scene.hours).catch(() => [])])
        .then(([points, wind, pm]) => {
          const sources = storySources(points, offset, offset + scene.hours, wide ? 0.25 : 0.05);
          const sim = new SmokeSim(sources, wind, { life: wide ? 30 : 18, diffusion: wide ? 6000 : 1500 });
          const towns = makeTowns(picked, pm);
          if (show(id, sim, wind, nearBox(sources, scene.box), towns, scene.camera)) setState((s) => (s?.kind === 'story' && s.scene === scene ? { ...s, status: 'ready', towns } : s));
        })
        .catch(() => id === token.current && setState((s) => (s ? { ...s, status: 'error' } : s)));
    },
    [onOpen, target, show],
  );

  /** The next day over a hotspot of fires burning now. */
  const openForecast = useCallback(
    (hotspot: Hotspot, title: string, fires: LiveFires, manifest: LiveManifest, cities: WorldCity[], lang: 'uk' | 'en') => {
      const id = ++token.current;
      const start = thisHour();
      setState({ kind: 'forecast', hotspot, title, start, hours: FORECAST_HOURS, status: 'loading', towns: [], weather: null, air: null });
      onOpen();
      const b = hotspot.box;
      const span = Math.max(b.n - b.s, (b.e - b.w) * Math.cos((hotspot.lat * Math.PI) / 180)) + 2;
      target.current?.look({ lat: hotspot.lat, lon: hotspot.lon, distance: Math.min(1.6, 1.04 + span * 0.022), box: { s: b.s - 1, n: b.n + 1, w: b.w - 1, e: b.e + 1 } });
      const around = townsAround(cities, hotspot.lat, hotspot.lon, 400, 7).map((c) => ({ lat: c.lat, lon: c.lon, name: c[lang], km: c.km }));
      const sources = hotspotSources(fires, hotspot, FORECAST_HOURS);
      // Each part shows as soon as it arrives; the smoke needs the wind and the towns' hours.
      void fireWeather(hotspot.lat, hotspot.lon)
        .then((weather) => id === token.current && setState((s) => (s?.kind === 'forecast' ? { ...s, weather } : s)))
        .catch(() => undefined);
      void airOutlook(around)
        .then((air) => id === token.current && setState((s) => (s?.kind === 'forecast' ? { ...s, air } : s)))
        .catch(() => undefined);
      void Promise.all([forecastWind(manifest, FORECAST_HOURS + 6), townsAir(around, new Date(start).toISOString().slice(0, 13), FORECAST_HOURS).catch(() => [])])
        .then(([wind, pm]) => {
          const sim = new SmokeSim(sources, wind, { life: 20, diffusion: 2500 });
          const towns = makeTowns(around, pm);
          if (show(id, sim, wind, nearBox(sources, hotspot.box), towns, hotspot)) setState((s) => (s?.kind === 'forecast' ? { ...s, status: 'ready', towns } : s));
        })
        .catch(() => id === token.current && setState((s) => (s ? { ...s, status: 'error' } : s)));
    },
    [onOpen, target, show],
  );

  return { layer, state, close, openStory, openForecast };
}
