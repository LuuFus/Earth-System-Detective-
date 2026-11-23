import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { countries } from '../data/countries';
import { loadCountries, type GeoBorders, type GeoLabels } from '../data/geo';
import { RAMP } from '../data/gistemp';
import { useReducedMotion } from '../hooks/useMedia';
import type { Lang } from '../i18n/strings';
import { FlowLayer, type Projection, type WindSampler } from './globe/flow';
import { PointsLayer, type GlobePoints } from './globe/points';
import { StationLayer, type Stations } from './globe/stations';
import { doseFromColor } from '../data/safecast';
import { PATHS } from './studio/Icon';

const iconPath = (name: string) => PATHS[name] ?? PATHS.info;
import { mercatorSource, stackSource, TiledLayer, tiledGlsl, tiledUniforms, wmtsSource, type Box, type TileSource } from './globe/tiles';

/** Where the camera starts: over Ukraine, pulled back to show the whole disc. */
const START = { lat: 42, lon: 28 };
/** About 95 km above the surface: the Landsat base map has detail down to there. */
const MIN_DISTANCE = 1.015;
const MAX_DISTANCE = 9;
/** Below this distance the close-up tiles start. */
const DETAIL_FROM = 2.6;
/** Big countries are named from this far out, the rest from LABELS_ALL. */
const LABELS_BIG = 4.2;
const LABELS_ALL = 1.9;
/** Hints about anomalies appear once the camera is this close. */
const HINTS_FROM = 2.0;
/** Capitals by Natural Earth rank: the biggest from this far out, the rest closer. */
const CAPITALS_FROM = [3.4, 3.4, 2.9, 2.5, 2.2, 1.9, 1.7];
/** Coastlines fade out this close: the imagery shows the coast better than a 2 km line. */
const COAST_UNTIL = 1.12;
/** Seas by rank: oceans always, small gulfs and straits only up close. */
const SEAS_FROM = [9, 3.4, 2.6, 2.0, 1.6, 1.4];
/** Rivers by rank. */
const RIVERS_FROM = [3.0, 3.0, 2.6, 2.2, 1.9, 1.7, 1.5, 1.4, 1.3, 1.3];
/** Lines on the globe sit this far above the sphere so the flat map facets never cover them. */
const LINE_RADIUS = 1.0006;
/**
 * Base map: NASA Blue Marble (500 m) down to its finest level, then the Landsat WELD global mosaic
 * (30 m, 1998-2000 composite) for close views. Blue Marble itself is a 2004 composite.
 */
const LANDSAT = wmtsSource('Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual', '31.25m', 'image/jpeg', '2000-12-01');
const BASE = stackSource('base', wmtsSource('BlueMarble_NextGeneration', '500m', 'image/jpeg'), LANDSAT);
/** Relief style: Blue Marble with shaded relief and sea-floor depths, as globe makers draw it. */
const RELIEF_BASE = stackSource('relief-base', wmtsSource('BlueMarble_ShadedRelief_Bathymetry', '500m', 'image/jpeg'), LANDSAT);
/** Hill shading from the ASTER elevation model (30 m), laid over the imagery up close. */
const RELIEF_SHADE = wmtsSource('ASTER_GDEM_Greyscale_Shaded_Relief', '31.25m', 'image/jpeg');
/** City lights for the night side: NASA Black Marble (VIIRS). */
const NIGHT_LIGHTS = wmtsSource('VIIRS_Black_Marble', '500m', 'image/png');

/** Where the Sun is overhead now: latitude and longitude of the subsolar point. */
export function subsolar(date = new Date()): { lat: number; lon: number } {
  const rad = Math.PI / 180;
  const day = (date.getTime() - Date.UTC(date.getUTCFullYear(), 0, 1)) / 86400000;
  const g = (2 * Math.PI * (day - 1)) / 365;
  // NOAA approximations: declination and the equation of time (minutes).
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const minutes = date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60;
  let lon = -(minutes + eot - 720) / 4;
  lon = ((lon + 540) % 360) - 180;
  return { lat: decl / rad, lon };
}

/** Climate cells: R = value (0..1) times validity, G = validity, B = significance times validity. */
export type GlobeData = { rgba: Uint8Array; width: number; height: number; key: string };
/** `points`: a layer of point detections (fires), drawn in one colour above the vector layer. */
export type GlobeImagery = { source: TileSource; opacity: number; points?: boolean; landOnly?: boolean };
export type GlobePoint = { lat: number; lon: number };
export type GlobeMarker = { id: string; lat: number; lon: number; label: string };
/** An event on the globe: a round badge with its kind's icon; `always` shows it at any zoom. */
export type GlobeHint = { id: string; lat: number; lon: number; label: string; color: string; icon: string; always?: boolean };
export type GlobeView = { lat: number; lon: number; distance: number };
/** A region drawn as a coloured outline (a country picked as A or B). Rings: flat lon, lat pairs. */
export type GlobeOutline = { id: string; rings: number[][] };
export type GlobeLabelLayers = { capitals: boolean; seas: boolean; rivers: boolean };
/** A painted canvas draped over a lat/lon box (the Ukraine war layer). */
/** A vector layer painted on a canvas over `box`; `draw` repaints any part of it sharper for close views. */
export type GlobeVector = {
  canvas: HTMLCanvasElement;
  box: Box;
  key: string;
  draw?: (box: Box, width: number) => HTMLCanvasElement;
};
/** Before/after: the layers for the left of the shutter (the normal props draw the right). */
export type GlobeCompare = { imagery: GlobeImagery | null; data: GlobeData | null; leftLabel: string; rightLabel: string; handleLabel: string };

/** How the globe is lit: evenly, by the real Sun with a night side, or all night (city lights). */
export type GlobeLight = 'flat' | 'sun' | 'night';
/** A weather field painted on an equirectangular canvas (lon -180..180, lat 90..-90). */
export type GlobeField = { canvas: HTMLCanvasElement; key: string; opacity: number };
export type GlobeWind = { key: string; sample: WindSampler };
export type { GlobePoints, Stations as GlobeStations };

export type GlobeApi = {
  /** Loads a map layer for the current view without showing it (playback looks one step ahead). */
  preload: (source: TileSource) => Promise<void>;
  flyTo: (lat: number, lon: number, distance?: number) => void;
  jumpTo: (lat: number, lon: number, distance: number) => void;
  getView: () => GlobeView;
  /** Closer (factor < 1) or farther (factor > 1), keeping the place in the middle. */
  zoomBy: (factor: number) => void;
  /** Back to the whole planet. */
  home: () => void;
  /** Fire story clock, hours since the story start (cheap: one uniform). */
  setStoryTime: (hours: number) => void;
  /** Dose rate on the radiation map at a place (µSv/h), when it is shown there. */
  sampleRadiation: (lat: number, lon: number) => number | null;
  /** The colour of the map layer at a place (RGBA), to read its value from the layer's colour map. */
  sampleImagery: (lat: number, lon: number) => [number, number, number, number] | null;
  /** The front layer's canvas was repainted in place (an animation): upload it again. */
  touchFront: () => void;
};

type Props = {
  label: string;
  fallback: string;
  lang: Lang;
  data: GlobeData | null;
  imagery: GlobeImagery | null;
  showBorders: boolean;
  vector: GlobeVector | null;
  markers: GlobeMarker[];
  compare?: GlobeCompare | null;
  hints?: GlobeHint[];
  /** Capitals, seas and rivers (Natural Earth), shown with the borders. */
  geo?: GeoLabels | null;
  /** Border and coast lines (Natural Earth, Ukraine's point of view), shown with the borders. */
  borderLines?: GeoBorders | null;
  labelLayers?: GlobeLabelLayers;
  outlines?: GlobeOutline[];
  light?: GlobeLight;
  relief?: boolean;
  /** Fires: now (FIRMS, 48 h) or a story played day by day. */
  fires?: GlobePoints | null;
  /** Story clock, hours since the story start. */
  storyTime?: number;
  /** Measuring stations (air quality): bubbles with the value inside. */
  stations?: Stations | null;
  /** The station under the pointer (-1: none), with its screen position. */
  onStationHover?: (index: number, x: number, y: number) => void;
  onStationPick?: (index: number) => void;
  /** Second vector layer: the front line (DeepState). */
  front?: GlobeVector | null;
  /** Radiation background: Safecast's measurement map. */
  radiation?: boolean;
  field?: GlobeField | null;
  wind?: GlobeWind | null;
  onHint?: (id: string) => void;
  /** The event badge under the pointer (null: none), with its screen position. */
  onHintHover?: (id: string | null, x: number, y: number) => void;
  onHover?: (point: GlobePoint | null) => void;
  onPick?: (point: GlobePoint) => void;
  onView?: (view: GlobeView) => void;
  onLoadingChange?: (loading: boolean) => void;
  apiRef?: MutableRefObject<GlobeApi | null>;
};

function readToken(name: string, fallback: string): THREE.Color {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(value || fallback);
}

/** Position on the sphere in the frame of three.js SphereGeometry UVs (lon 0 on +X, 90E on -Z). */
function fromLatLon(lat: number, lon: number, radius: number): THREE.Vector3 {
  const la = THREE.MathUtils.degToRad(lat);
  const lo = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)).multiplyScalar(radius);
}

function toLatLon(p: THREE.Vector3): GlobePoint {
  const v = p.clone().normalize();
  return { lat: THREE.MathUtils.radToDeg(Math.asin(v.y)), lon: THREE.MathUtils.radToDeg(Math.atan2(-v.z, v.x)) };
}

const UNIT_SPHERE = new THREE.Sphere(new THREE.Vector3(), 1);

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalV;
  void main() {
    vUv = uv;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Flat light rides with the camera (up and to the left of the viewer), so the visible side is
// always lit. Sun light comes from the real subsolar point: the night side shows NASA Black
// Marble city lights, with a warm twilight band along the terminator.
const earthFragment = /* glsl */ `
  uniform float uReady;
  uniform float uGlint;
  uniform vec3 uAtmosphere;
  uniform float uLight; // 0 flat, 1 sun, 2 night
  uniform vec3 uSunView;
  uniform float uRelief;
  uniform float uLights;
  uniform vec3 uLightTint;
  uniform sampler2D uFallback;
  uniform float uFallbackReady;
  varying vec2 vUv;
  varying vec3 vNormalV;
  ${tiledGlsl('uBase')}
  ${tiledGlsl('uNight')}
  ${tiledGlsl('uShade')}
  void main() {
    vec3 n = normalize(vNormalV);
    vec4 map = uBaseSample(vUv);
    // A small picture of the Earth shipped with the site shows at once; the tiles replace it.
    vec3 under = mix(vec3(0.04, 0.07, 0.14), texture2D(uFallback, vUv).rgb, uFallbackReady);
    vec3 base = mix(under, map.rgb, map.a * uReady);
    float ocean = smoothstep(0.015, 0.09, base.b - base.r) * map.a;
    if (uRelief > 0.5) {
      // ASTER hill shading: flat land is about 0.74 grey, the sea a darker flat grey (left alone).
      vec4 sh = uShadeSample(vUv);
      float land = smoothstep(0.42, 0.55, sh.r) * sh.a * (1.0 - ocean);
      base *= mix(1.0, clamp(sh.r / 0.74, 0.5, 1.4), 0.85 * land);
    }
    vec3 light = uLight < 0.5 ? normalize(vec3(-0.45, 0.55, 0.9)) : uSunView;
    float ndl = dot(n, light);
    vec3 col;
    if (uLight < 0.5) {
      col = base * (0.42 + 0.78 * max(ndl, 0.0));
    } else {
      float day = uLight > 1.5 ? 0.0 : smoothstep(-0.06, 0.16, ndl);
      vec3 lit = base * (0.06 + 1.12 * max(ndl, 0.0));
      vec3 lights = uNightSample(vUv).rgb;
      // Black Marble keeps the land faintly visible; the lights are lifted and warmed.
      vec3 dark = base * 0.035 + pow(lights, vec3(1.35)) * uLightTint * uLights;
      col = mix(dark, lit, day);
      // A faint warm band along the terminator, only on the planet (not the limb haze).
      float dusk = exp(-pow((ndl + 0.02) / 0.06, 2.0)) * (1.0 - step(1.5, uLight));
      col += vec3(0.9, 0.45, 0.2) * dusk * 0.045 * base * 6.0;
    }
    vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
    float glint = uLight > 1.5 ? 0.0 : 1.0;
    col += vec3(0.85, 0.88, 0.95) * pow(max(dot(n, h), 0.0), 70.0) * 0.22 * ocean * uGlint * glint;
    float rim = pow(1.0 - max(n.z, 0.0), 3.0);
    float rimLit = uLight < 0.5 ? 1.0 : uLight > 1.5 ? 0.12 : 0.15 + 0.85 * smoothstep(-0.25, 0.35, ndl);
    col += uAtmosphere * rim * 0.6 * rimLit;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

// Before/after shutter: uSplit is the split line in drawing-buffer pixels; uSide 0 draws
// everywhere, +1 only right of the line, -1 only left of it.
const clipGlsl = /* glsl */ `
  uniform float uSplit;
  uniform float uSide;
  void clipSide() {
    if (uSide != 0.0 && (gl_FragCoord.x - uSplit) * uSide < 0.0) discard;
  }
`;

const overlayFragment = (prefix: string) => /* glsl */ `
  uniform float uOpacity;
  uniform vec4 uTint;
  uniform sampler2D uLand;
  uniform float uLandOnly;
  varying vec2 vUv;
  ${tiledGlsl(prefix)}
  ${clipGlsl}
  void main() {
    clipSide();
    vec4 c = ${prefix}Sample(vUv);
    // Land-only data (soil moisture) stops at the coastline.
    // The coverage is filtered and cut at one half: a crisp coast without the mask's pixel steps.
    if (uLandOnly > 0.5) c.a *= smoothstep(0.38, 0.62, texture2D(uLand, vUv).r);
    if (c.a < 0.02) discard;
    // Point layers are recoloured so they stay visible over the red of the war layer.
    vec3 rgb = mix(c.rgb, uTint.rgb, uTint.a);
    gl_FragColor = vec4(rgb, c.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

// Values are stored premultiplied by validity, so linear filtering averages only cells with data
// and the field comes out smooth instead of square.
const dataFragment = /* glsl */ `
  uniform sampler2D uData;
  uniform vec3 uRamp[7];
  uniform vec2 uGrid;
  uniform float uOpacity;
  varying vec2 vUv;
  vec3 ramp(float t) {
    float x = clamp(t, 0.0, 1.0) * 6.0;
    int i = int(min(floor(x), 5.0));
    return mix(uRamp[i], uRamp[i + 1], x - float(i));
  }
  ${clipGlsl}
  void main() {
    clipSide();
    vec4 c = texture2D(uData, vUv);
    float valid = c.g;
    if (valid < 0.3) discard;
    float t = c.r / valid;
    float significant = c.b / valid;
    vec3 col = ramp(t);
    float hatch = step(0.5, fract((vUv.x * uGrid.x + vUv.y * uGrid.y) * 1.5));
    col = mix(col, col * 0.5, (1.0 - step(0.5, significant)) * hatch);
    gl_FragColor = vec4(col, uOpacity * smoothstep(0.3, 0.7, valid));
    #include <colorspace_fragment>
  }
`;

const vectorFragment = /* glsl */ `
  uniform sampler2D uVec;
  uniform vec4 uVecBounds;
  uniform sampler2D uVecPatch;
  uniform vec4 uVecPatchBounds;
  varying vec2 vUv;
  void main() {
    vec4 c;
    vec2 p = (vUv - uVecPatchBounds.xy) / max(uVecPatchBounds.zw - uVecPatchBounds.xy, vec2(1e-9));
    if (uVecPatchBounds.z > uVecPatchBounds.x && p.x >= 0.0 && p.y >= 0.0 && p.x <= 1.0 && p.y <= 1.0) {
      c = texture2D(uVecPatch, p);
    } else {
      vec2 d = (vUv - uVecBounds.xy) / (uVecBounds.zw - uVecBounds.xy);
      if (d.x < 0.0 || d.y < 0.0 || d.x > 1.0 || d.y > 1.0) discard;
      c = texture2D(uVec, d);
    }
    if (c.a < 0.02) discard;
    gl_FragColor = c;
    #include <colorspace_fragment>
  }
`;

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormalV;
  void main() {
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uLight;
  uniform vec3 uSunView;
  varying vec3 vNormalV;
  void main() {
    vec3 n = normalize(vNormalV);
    float facing = clamp(-n.z * 2.6, 0.0, 1.0);
    // The halo is the air over the limb: lit where the limb under it faces the Sun.
    vec3 limb = normalize(vec3(n.xy, 0.0) + vec3(0.0, 0.0, 1e-4));
    float lit = uLight < 0.5 ? 1.0 : uLight > 1.5 ? 0.15 : 0.12 + 0.88 * smoothstep(-0.45, 0.1, dot(limb, uSunView));
    gl_FragColor = vec4(uColor * pow(facing, 2.2) * 0.85 * lit, 1.0);
    #include <colorspace_fragment>
  }
`;

// A weather field (GFS), painted on a canvas that covers the whole globe.
const fieldFragment = /* glsl */ `
  uniform sampler2D uField;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uField, vUv);
    if (c.a < 0.02) discard;
    gl_FragColor = vec4(c.rgb, c.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

type Api = GlobeApi & {
  setData: (data: GlobeData | null) => void;
  setImagery: (imagery: GlobeImagery | null) => void;
  setCompare: (left: { imagery: GlobeImagery | null; data: GlobeData | null } | null) => void;
  setSplit: (fraction: number) => void;
  setBorders: (on: boolean) => void;
  setVector: (vector: GlobeVector | null) => void;
  setMarkers: (markers: GlobeMarker[]) => void;
  setHints: (hints: GlobeHint[]) => void;
  setGeo: (geo: GeoLabels | null, layers: GlobeLabelLayers) => void;
  setBorderLines: (lines: GeoBorders | null) => void;
  setOutlines: (outlines: GlobeOutline[]) => void;
  setLang: (lang: Lang) => void;
  setReducedMotion: (on: boolean) => void;
  setLight: (light: GlobeLight) => void;
  setRelief: (on: boolean) => void;
  setFires: (points: GlobePoints | null) => void;
  setStoryTime: (hours: number) => void;
  setStations: (stations: Stations | null) => void;
  setFront: (vector: GlobeVector | null) => void;
  setRadiation: (on: boolean) => void;
  setField: (field: GlobeField | null) => void;
  setWind: (wind: GlobeWind | null) => void;
  dispose: () => void;
};

type Callbacks = {
  onHintHover: (id: string | null, x: number, y: number) => void;
  onStationHover: (index: number, x: number, y: number) => void;
  onStationPick: (index: number) => void;
  onHover: (point: GlobePoint | null) => void;
  onPick: (point: GlobePoint) => void;
  onView: (view: GlobeView) => void;
  onLoading: (loading: boolean) => void;
  onHint: (id: string) => void;
};

function createGlobe(host: HTMLElement, opts: { reduced: boolean; lang: Lang }, cb: Callbacks): Api | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(readToken('--color-void', '#03060f'));
  renderer.domElement.className = 'globe__canvas';
  host.appendChild(renderer.domElement);

  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'globe__labels';
  labelRenderer.domElement.setAttribute('aria-hidden', 'true');
  host.appendChild(labelRenderer.domElement);

  let reduced = opts.reduced;
  let disposed = false;
  let needsRender = true;
  const requestRender = () => {
    needsRender = true;
  };
  /** Until the user moves the camera, keep the whole planet framed for the screen shape. */
  let framed = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 300);
  camera.position.copy(fromLatLon(START.lat, START.lon, 3.4));

  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  let pending = 0;
  const onLoading = (delta: number) => {
    const before = pending > 0;
    pending += delta;
    if (before !== pending > 0) cb.onLoading(pending > 0);
  };

  // Layers
  // The global map stays coarse (level 2, about 15 km a pixel): that is sharp enough for the whole
  // globe, and closer views get the close-up patch. A finer global level cost ~5 MB at start.
  const base = new TiledLayer(2, anisotropy, requestRender, onLoading);
  base.noData.value = 0.0012; // 4/255 in sRGB: open sea in the Landsat mosaic is pure black, water is brighter
  const imagery = new TiledLayer(2, anisotropy, requestRender, onLoading, 30);
  base.setSource(BASE);
  // City lights for the night side and hill shading for the relief style: loaded when used.
  const night = new TiledLayer(2, anisotropy, requestRender, onLoading);
  const shade = new TiledLayer(2, anisotropy, requestRender, onLoading);
  let light: GlobeLight = 'flat';
  let relief = false;
  const sunWorld = new THREE.Vector3(1, 0, 0);
  const sunView = new THREE.Vector3(0, 0, 1);
  // When the Sun was last placed (rAF clock); -Infinity places it on the very first frame.
  let sunAt = -Infinity;

  const atmosphereColor = readToken('--color-atmosphere', '#7fb0ff');
  const earthUniforms = {
    uReady: { value: 1 },
    uGlint: { value: 1 },
    uAtmosphere: { value: atmosphereColor },
    uLight: { value: 0 },
    uSunView: { value: sunView },
    uRelief: { value: 0 },
    uLights: { value: 1.55 },
    uLightTint: { value: readToken('--color-night-lights', '#ffd9a8') },
    uFallback: { value: new THREE.Texture() },
    uFallbackReady: { value: 0 },
    ...tiledUniforms('uBase', base),
    ...tiledUniforms('uNight', night),
    ...tiledUniforms('uShade', shade),
  };
  // Every layer is drawn on the same sphere as the earth, without a depth test: lifted even a few
  // kilometres, a layer would slide against the map at close zoom. Back faces are culled, so the
  // far side of the globe never shows through.
  const sphere = new THREE.SphereGeometry(1, 160, 120);
  new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}img/earth-relief-2k.jpg`, (tex) => {
    if (disposed) return tex.dispose();
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.wrapS = THREE.RepeatWrapping;
    earthUniforms.uFallback.value = tex;
    earthUniforms.uFallbackReady.value = 1;
    requestRender();
  });
  const earth = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: earthUniforms, vertexShader: vertex, fragmentShader: earthFragment }),
  );
  scene.add(earth);

  const fireColor = readToken('--color-fire', '#ffd23f');
  const split = { value: 0 };
  let splitFraction = 0.5;
  // Land mask for land-only layers: drawn once from the Natural Earth country outlines.
  const land = { value: new THREE.Texture() };
  let landState: 'none' | 'loading' | 'ready' = 'none';
  const ensureLand = () => {
    if (landState !== 'none') return;
    landState = 'loading';
    void loadCountries()
      .then((all) => {
        if (disposed) return;
        const canvas = document.createElement('canvas');
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext('2d')!;
        // Black sea, white land: the red channel keeps the antialiased coverage of each pixel.
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        const kx = canvas.width / 360;
        const ky = canvas.height / 180;
        for (const c of all.values()) {
          ctx.beginPath();
          for (const ring of c.rings) {
            for (let i = 0; i < ring.length; i += 2) {
              const x = (ring[i] + 180) * kx;
              const y = (90 - ring[i + 1]) * ky;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
          }
          ctx.fill('evenodd');
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.NoColorSpace;
        tex.generateMipmaps = false;
        tex.minFilter = THREE.LinearFilter;
        tex.wrapS = THREE.RepeatWrapping;
        land.value.dispose();
        land.value = tex;
        landState = 'ready';
        imageryUniforms.uLandOnly.value = landWanted.right ? 1 : 0;
        imageryUniformsL.uLandOnly.value = landWanted.left ? 1 : 0;
        requestRender();
      })
      .catch(() => (landState = 'none'));
  };
  const landWanted = { right: false, left: false };

  const imageryUniforms = {
    uOpacity: { value: 0.9 },
    uTint: { value: new THREE.Vector4(0, 0, 0, 0) },
    uLand: land,
    uLandOnly: { value: 0 },
    uSplit: split,
    uSide: { value: 0 },
    ...tiledUniforms('uImg', imagery),
  };
  const imageryMesh = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({
      uniforms: imageryUniforms,
      vertexShader: vertex,
      fragmentShader: overlayFragment('uImg'),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  imageryMesh.renderOrder = 1;
  imageryMesh.visible = false;
  scene.add(imageryMesh);

  // The left side of the before/after shutter: a second imagery layer.
  const imageryL = new TiledLayer(2, anisotropy, requestRender, onLoading, 30);
  const imageryUniformsL = {
    uOpacity: { value: 0.9 },
    uTint: { value: new THREE.Vector4(0, 0, 0, 0) },
    uLand: land,
    uLandOnly: { value: 0 },
    uSplit: split,
    uSide: { value: -1 },
    ...tiledUniforms('uImg', imageryL),
  };
  const imageryMeshL = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({
      uniforms: imageryUniformsL,
      vertexShader: vertex,
      fragmentShader: overlayFragment('uImg'),
      transparent: true,
      depthTest: false,
      depthWrite: false,
    }),
  );
  imageryMeshL.renderOrder = 1;
  imageryMeshL.visible = false;
  scene.add(imageryMeshL);

  const dataUniforms = {
    uData: { value: new THREE.Texture() },
    uRamp: { value: RAMP.map(([r, g, b]) => new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)) },
    uGrid: { value: new THREE.Vector2(180, 90) },
    uOpacity: { value: 0.85 },
    uSplit: split,
    uSide: { value: 0 },
  };
  const dataMesh = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: dataUniforms, vertexShader: vertex, fragmentShader: dataFragment, transparent: true, depthTest: false, depthWrite: false }),
  );
  dataMesh.renderOrder = 2;
  dataMesh.visible = false;
  scene.add(dataMesh);

  const dataUniformsL = { ...dataUniforms, uData: { value: new THREE.Texture() }, uGrid: { value: new THREE.Vector2(180, 90) }, uSide: { value: -1 } };
  const dataMeshL = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: dataUniformsL, vertexShader: vertex, fragmentShader: dataFragment, transparent: true, depthTest: false, depthWrite: false }),
  );
  dataMeshL.renderOrder = 2;
  dataMeshL.visible = false;
  scene.add(dataMeshL);

  /** Borders, coastlines and map labels are on together (the "Borders and names" switch). */
  let bordersOn = false;

  const uvBounds = (b: Box) => [(b.w + 180) / 360, (b.s + 90) / 180, (b.e + 180) / 360, (b.n + 90) / 180] as const;
  /** A vector layer painted on a canvas over a box, repainted sharper for the view when zoomed in. */
  const makeVectorLayer = (order: number) => {
    const uniforms = {
      uVec: { value: new THREE.Texture() },
      uVecBounds: { value: new THREE.Vector4() },
      uVecPatch: { value: new THREE.Texture() },
      uVecPatchBounds: { value: new THREE.Vector4() },
    };
    let vector: GlobeVector | null = null;
    let patchKey = '';
    const mesh = new THREE.Mesh(
      sphere,
      new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: vectorFragment, transparent: true, depthTest: false, depthWrite: false }),
    );
    mesh.renderOrder = order;
    mesh.visible = false;
    scene.add(mesh);
    const clearPatch = () => {
      patchKey = '';
      uniforms.uVecPatchBounds.value.set(0, 0, 0, 0);
    };
    return {
      mesh,
      /** Repaints the visible part at screen resolution once that beats the whole-layer canvas. */
      updatePatch(box: Box | null, px: number) {
        if (!vector?.draw || !box || !mesh.visible) return clearPatch();
        const vb = vector.box;
        const part = { w: Math.max(box.w, vb.w), s: Math.max(box.s, vb.s), e: Math.min(box.e, vb.e), n: Math.min(box.n, vb.n) };
        const degPerPixel = (box.e - box.w) / px;
        const wholePerPixel = (vb.e - vb.w) / vector.canvas.width;
        if (part.e <= part.w || part.n <= part.s || degPerPixel > wholePerPixel * 0.7) return clearPatch();
        const width = Math.min(4096, Math.ceil((part.e - part.w) / degPerPixel));
        const key = `${vector.key}|${part.w.toFixed(3)},${part.s.toFixed(3)},${part.e.toFixed(3)},${part.n.toFixed(3)}|${width}`;
        if (key === patchKey) return;
        patchKey = key;
        const tex = new THREE.CanvasTexture(vector.draw(part, width));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = anisotropy;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        const previous = uniforms.uVecPatch.value;
        uniforms.uVecPatch.value = tex;
        previous.dispose();
        uniforms.uVecPatchBounds.value.set(...uvBounds(part));
        requestRender();
      },
      set(next: GlobeVector | null) {
        const sameCanvas = vector?.canvas === next?.canvas;
        vector = next;
        if (!sameCanvas) clearPatch();
        if (!next) {
          mesh.visible = false;
          requestRender();
          return;
        }
        if (!sameCanvas) {
          const tex = new THREE.CanvasTexture(next.canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = anisotropy;
          const previous = uniforms.uVec.value;
          uniforms.uVec.value = tex;
          previous.dispose();
          uniforms.uVecBounds.value.set(...uvBounds(next.box));
        }
        mesh.visible = true;
        requestRender();
        scheduleView();
      },
      /** The same canvas was repainted: upload it again; the sharp close-up patch is redrawn when asked. */
      touch() {
        if (!vector || !mesh.visible) return;
        uniforms.uVec.value.needsUpdate = true;
        clearPatch();
        requestRender();
        if (vector.draw) scheduleView();
      },
      dispose() {
        uniforms.uVec.value.dispose();
        uniforms.uVecPatch.value.dispose();
      },
    };
  };
  const warLayer = makeVectorLayer(2.5);
  const frontLayer = makeVectorLayer(2.55);

  // Weather field (GFS) under the wind lines.
  const fieldUniforms = { uField: { value: new THREE.Texture() }, uOpacity: { value: 0.8 } };
  const fieldMesh = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: fieldUniforms, vertexShader: vertex, fragmentShader: fieldFragment, transparent: true, depthTest: false, depthWrite: false }),
  );
  fieldMesh.renderOrder = 1.6;
  fieldMesh.visible = false;
  scene.add(fieldMesh);
  let fieldKey = '';

  // Radiation background: Safecast's measurement map, reprojected from Web Mercator tiles.
  const rad = new TiledLayer(2, anisotropy, requestRender, onLoading, 30);
  const radUniforms = {
    uOpacity: { value: 0.9 },
    uTint: { value: new THREE.Vector4(0, 0, 0, 0) },
    uLand: land,
    uLandOnly: { value: 0 },
    uSplit: split,
    uSide: { value: 0 },
    ...tiledUniforms('uRad', rad),
  };
  const radMesh = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: radUniforms, vertexShader: vertex, fragmentShader: overlayFragment('uRad'), transparent: true, depthTest: false, depthWrite: false }),
  );
  radMesh.renderOrder = 2.2;
  radMesh.visible = false;
  scene.add(radMesh);
  const RADIATION = mercatorSource('safecast', 'https://s3.amazonaws.com/te512.safecast.org/{z}/{x}/{y}.png', 15, 512);
  /** Safecast's far-out tiles merge whole regions into big squares: the layer shows from here in. */
  const RADIATION_FROM = 1.9;
  let radOn = false;

  // Fires (now or a story) and measuring stations.
  const firePoints = new PointsLayer(2.8);
  scene.add(firePoints.object);

  const atmosphereUniforms = { uColor: { value: atmosphereColor }, uLight: { value: 0 }, uSunView: { value: sunView } };
  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 96, 72),
      new THREE.ShaderMaterial({
        uniforms: atmosphereUniforms,
        vertexShader: atmosphereVertex,
        fragmentShader: atmosphereFragment,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    ),
  );

  // Stars
  const count = 2200;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const tone = readToken('--color-stars', '#dfe7fb');
  for (let i = 0; i < count; i++) {
    const u = Math.random() * 2 - 1;
    const phi = Math.random() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    positions.set([150 * s * Math.cos(phi), 150 * u, 150 * s * Math.sin(phi)], i * 3);
    const b = 0.12 + Math.pow(Math.random(), 3) * 0.8;
    colors.set([tone.r * b, tone.g * b, tone.b * b], i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, vertexColors: true, depthWrite: false })));

  // Map labels: country names, and (with the Natural Earth layer) capitals, seas and rivers.
  // Each has a priority; nearer the camera more of them qualify, and a label that would overlap
  // one of higher priority on screen is left out.
  type MapLabel = {
    obj: CSS2DObject;
    normal: THREE.Vector3;
    layer: 'country' | 'capital' | 'sea' | 'river';
    priority: number;
    /** Shown from this camera distance in. */
    from: number;
    /** Estimated size on screen, and where the anchor sits across it (0 left, 0.5 centre). */
    w: number;
    h: number;
    ax: number;
    text: { uk: string; en: string } | null;
    code?: string;
  };
  let lang = opts.lang;
  let names = new Intl.DisplayNames([lang], { type: 'region' });
  const textWidth = (text: string, px: number) => text.length * px * 0.58 + 6;
  const countryLabels: MapLabel[] = countries.map((c) => {
    const el = document.createElement('div');
    el.className = c.big ? 'globe__label globe__label--big' : 'globe__label';
    el.textContent = names.of(c.code) ?? c.name;
    const obj = new CSS2DObject(el);
    obj.position.copy(fromLatLon(c.lat, c.lon, 1.01));
    obj.visible = false;
    scene.add(obj);
    return {
      obj,
      normal: fromLatLon(c.lat, c.lon, 1),
      layer: 'country',
      priority: c.big ? 3 : 6,
      from: c.big ? LABELS_BIG : LABELS_ALL,
      w: textWidth(el.textContent, c.big ? 13 : 11),
      h: c.big ? 16 : 14,
      ax: 0.5,
      text: null,
      code: c.code,
    };
  });
  let geoLabels: MapLabel[] = [];
  let mapLabels: MapLabel[] = [...countryLabels];
  let layers: GlobeLabelLayers = { capitals: true, seas: true, rivers: true };

  // Rivers and outlines are fat lines (LineSegments2): WebGL lines are one pixel at most.
  const riverColor = readToken('--color-river', '#6fb8ff');
  const lineMaterials: LineMaterial[] = [];
  const makeLineMaterial = (color: THREE.Color, width: number, opacity: number) => {
    const m = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthWrite: false });
    lineMaterials.push(m);
    return m;
  };
  /** Segment pairs on the sphere from flat lon/lat lines, cut into pieces of at most `maxDeg`. */
  const segmentsFrom = (lines: number[][], closed: boolean, radius: number, maxDeg = 0.5) => {
    const out: number[] = [];
    for (const line of lines) {
      const count = line.length / 2;
      const last = closed ? count : count - 1;
      for (let i = 0; i < last; i++) {
        const j = (i + 1) % count;
        const lon1 = line[i * 2];
        const lat1 = line[i * 2 + 1];
        const lon2 = line[j * 2];
        const lat2 = line[j * 2 + 1];
        if (Math.abs(lon2 - lon1) > 180) continue; // a ring cut at the antimeridian
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(lon2 - lon1), Math.abs(lat2 - lat1)) / maxDeg));
        for (let k = 0; k < steps; k++) {
          const t0 = k / steps;
          const t1 = (k + 1) / steps;
          const a = fromLatLon(lat1 + (lat2 - lat1) * t0, lon1 + (lon2 - lon1) * t0, radius);
          const b = fromLatLon(lat1 + (lat2 - lat1) * t1, lon1 + (lon2 - lon1) * t1, radius);
          out.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      }
    }
    return out;
  };
  let rivers: LineSegments2 | null = null;
  let outlineObjects: LineSegments2[] = [];
  let borderObjects: { line: LineSegments2; coast: boolean }[] = [];

  // Region markers
  let markerObjects: { obj: CSS2DObject; normal: THREE.Vector3 }[] = [];
  let hintObjects: { obj: CSS2DObject; normal: THREE.Vector3; always: boolean }[] = [];

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = MIN_DISTANCE;
  controls.maxDistance = MAX_DISTANCE;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.35;
  controls.addEventListener('start', () => {
    controls.autoRotate = false;
    framed = false;
    flight = null;
  });
  controls.addEventListener('change', requestRender);

  // Speeds follow the altitude: close up a drag moves the ground about as far as the cursor, and
  // a wheel step changes the height by a share of itself instead of jumping into the surface.
  const tuneSpeed = () => {
    const distance = camera.position.length();
    const altitude = distance - 1;
    controls.rotateSpeed = THREE.MathUtils.clamp(altitude * 0.16, 0.0008, 0.6);
    controls.zoomSpeed = THREE.MathUtils.clamp(Math.log(1 - (0.18 * altitude) / distance) / Math.log(0.95), 0.02, 1);
  };

  // What is visible: cast a grid of rays at the sphere.
  const raycaster = new THREE.Raycaster();
  const hit = new THREE.Vector3();
  function visibleBox(): Box | null {
    const lats: number[] = [];
    const lons: number[] = [];
    for (let i = 0; i <= 8; i++) {
      for (let j = 0; j <= 8; j++) {
        raycaster.setFromCamera(new THREE.Vector2(-1 + i / 4, -1 + j / 4), camera);
        if (raycaster.ray.intersectSphere(UNIT_SPHERE, hit)) {
          const p = toLatLon(hit);
          lats.push(p.lat);
          lons.push(p.lon);
        }
      }
    }
    if (lats.length < 4) return null;
    let w = Math.min(...lons);
    let e = Math.max(...lons);
    if (e - w > 180) return null; // across the antimeridian: the global maps cover it
    const s = Math.max(-90, Math.min(...lats) - 1);
    const n = Math.min(90, Math.max(...lats) + 1);
    w = Math.max(-180, w - 1);
    e = Math.min(180, e + 1);
    return { s, w, n, e };
  }

  let viewTimer = 0;
  let lastRefresh = 0;
  const refreshView = () => {
    if (disposed) return;
    const distance = camera.position.length();
    const box = distance < DETAIL_FROM ? visibleBox() : null;
    lastRefresh = performance.now();
    // Screen pixels, counting display scaling: a 150% screen needs sharper tiles.
    const px = host.clientWidth * Math.max(1.25, renderer.getPixelRatio());
    base.updateView(box, px);
    if (imageryMesh.visible) imagery.updateView(box, px);
    if (imageryMeshL.visible) imageryL.updateView(box, px);
    warLayer.updatePatch(box, px);
    frontLayer.updatePatch(box, px);
    if (light !== 'flat') night.updateView(box, px);
    if (relief) shade.updateView(box, px);
    if (radMesh.visible) rad.updateView(box, px);
    const p = toLatLon(camera.position);
    cb.onView({ lat: p.lat, lon: p.lon, distance });
  };
  // Tiles start loading while the camera still moves: 150 ms after it settles, and at least every
  // 600 ms during a long zoom or drag.
  const scheduleView = () => {
    window.clearTimeout(viewTimer);
    if (performance.now() - lastRefresh > 600) {
      viewTimer = window.setTimeout(refreshView, 0);
      return;
    }
    viewTimer = window.setTimeout(refreshView, 150);
  };
  controls.addEventListener('change', scheduleView);

  // Hover and pick
  const pointer = new THREE.Vector2();
  let pointerDirty = false;
  let pointerInside = false;
  let downAt: { x: number; y: number } | null = null;
  const canvas = renderer.domElement;
  const toNdc = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  };
  const pointAt = (): GlobePoint | null => {
    raycaster.setFromCamera(pointer, camera);
    return raycaster.ray.intersectSphere(UNIT_SPHERE, hit) ? toLatLon(hit) : null;
  };
  const stationAt = (e: PointerEvent) => {
    if (!stationLayer.active) return -1;
    const rect = canvas.getBoundingClientRect();
    return stationLayer.hit(e.clientX - rect.left, e.clientY - rect.top);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    toNdc(e);
    pointerInside = true;
    pointerDirty = true;
    const i = stationAt(e);
    if (i !== stationLayer.hovered) {
      stationLayer.hovered = i;
      stationsDirty = true;
      canvas.style.cursor = i >= 0 ? 'pointer' : '';
    }
    if (i >= 0) {
      const rect = canvas.getBoundingClientRect();
      cb.onStationHover(i, e.clientX - rect.left, e.clientY - rect.top);
    } else cb.onStationHover(-1, 0, 0);
  };
  const onLeave = () => {
    pointerInside = false;
    cb.onHover(null);
    if (stationLayer.hovered >= 0) {
      stationLayer.hovered = -1;
      stationsDirty = true;
      cb.onStationHover(-1, 0, 0);
    }
  };
  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6) {
      const station = stationAt(e);
      if (station >= 0) {
        downAt = null;
        cb.onStationPick(station);
        return;
      }
      toNdc(e);
      const p = pointAt();
      if (p) {
        cb.onPick(p);
        cb.onHover(p);
      }
    }
    downAt = null;
  };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);
  let lastHover = 0;
  const hover = (now: number) => {
    if (!pointerDirty || !pointerInside || now - lastHover < 60) return;
    lastHover = now;
    pointerDirty = false;
    cb.onHover(pointAt());
  };

  // Labels and markers: only on the near side, and map labels only where they do not collide.
  const camDir = new THREE.Vector3();
  const projected = new THREE.Vector3();
  const updateLabels = () => {
    const distance = camera.position.length();
    camDir.copy(camera.position).normalize();
    const horizon = 1 / distance;
    const w = host.clientWidth;
    const h = host.clientHeight;
    const taken: [number, number, number, number][] = [];
    const screen = (normal: THREE.Vector3) => {
      projected.copy(normal).project(camera);
      return [((projected.x + 1) / 2) * w, ((1 - projected.y) / 2) * h] as const;
    };
    const free = (x0: number, y0: number, x1: number, y1: number) => taken.every(([a, b, c, d]) => x1 < a || x0 > c || y1 < b || y0 > d);
    // Markers and hints always show; map labels keep clear of them.
    for (const m of markerObjects) {
      m.obj.visible = m.normal.dot(camDir) > horizon + 0.02;
      if (m.obj.visible) {
        const [x, y] = screen(m.normal);
        taken.push([x - 12, y - 12, x + 150, y + 12]);
      }
    }
    for (const hint of hintObjects) {
      hint.obj.visible = (hint.always || distance <= HINTS_FROM) && hint.normal.dot(camDir) > horizon + 0.05;
      if (hint.obj.visible) {
        const [x, y] = screen(hint.normal);
        taken.push([x - 16, y - 34, x + 16, y + 2]);
      }
    }
    const shown = bordersOn;
    for (const l of mapLabels) {
      const on =
        shown &&
        distance <= l.from &&
        (l.layer === 'country' || layers[l.layer === 'capital' ? 'capitals' : l.layer === 'sea' ? 'seas' : 'rivers']) &&
        l.normal.dot(camDir) > horizon + (l.layer === 'sea' ? 0.08 : 0.12);
      if (!on) {
        l.obj.visible = false;
        continue;
      }
      const [x, y] = screen(l.normal);
      const x0 = x - l.w * l.ax - 2;
      // A name that collides tries just below, then just above its place; a capital's dot cannot
      // move, so a capital without room for its name still shows its dot.
      const shifts = l.layer === 'capital' ? [0] : [0, l.h + 4, -(l.h + 4)];
      let placed: number | null = null;
      for (const dy of shifts) {
        const box: [number, number, number, number] = [x0, y + dy - l.h / 2 - 1, x0 + l.w + 4, y + dy + l.h / 2 + 1];
        if (free(...box)) {
          taken.push(box);
          placed = dy;
          break;
        }
      }
      let dotOnly = false;
      if (placed === null && l.layer === 'capital' && free(x - 4, y - 4, x + 4, y + 4)) {
        taken.push([x - 4, y - 4, x + 4, y + 4]);
        placed = 0;
        dotOnly = true;
      }
      l.obj.visible = placed !== null;
      if (placed !== null) {
        l.obj.element.style.marginTop = placed ? `${placed}px` : '';
        if (l.layer === 'capital') l.obj.element.classList.toggle('globe__place--dot-only', dotOnly);
      }
    }
    if (rivers) rivers.visible = shown && layers.rivers;
    for (const b of borderObjects) b.line.visible = shown && (!b.coast || distance > COAST_UNTIL);
  };

  // Fly-to
  type Flight = { from: THREE.Vector3; to: THREE.Vector3; d0: number; d1: number; t0: number; ms: number };
  let flight: Flight | null = null;
  const runFlight = (now: number) => {
    if (!flight) return;
    const t = Math.min(1, (now - flight.t0) / flight.ms);
    const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const dir = flight.from.clone().lerp(flight.to, e).normalize();
    const arc = Math.sin(Math.PI * e) * Math.min(0.8, flight.from.angleTo(flight.to) * 0.35);
    camera.position.copy(dir.multiplyScalar(flight.d0 + (flight.d1 - flight.d0) * e + arc));
    camera.lookAt(0, 0, 0);
    if (t >= 1) {
      flight = null;
      controls.enabled = true;
      refreshView();
    }
  };

  // Wind lines: a 2D canvas between the globe and the labels.
  const flow = new FlowLayer('globe__flow');
  flow.canvas.hidden = true;
  host.insertBefore(flow.canvas, labelRenderer.domElement);
  const flowDir = new THREE.Vector3();
  const flowP = new THREE.Vector3();
  const flowHit = new THREE.Vector3();
  const flowNdc = new THREE.Vector2();
  let flowPpd = 1;
  const flowView: Projection = {
    project(lat, lon) {
      const p = fromLatLon(lat, lon, 1);
      if (p.dot(flowDir) < 1 / camera.position.length() + 0.015) return null;
      flowP.copy(p).project(camera);
      return [((flowP.x + 1) / 2) * host.clientWidth, ((1 - flowP.y) / 2) * host.clientHeight];
    },
    randomPlace() {
      for (let k = 0; k < 10; k++) {
        flowNdc.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
        raycaster.setFromCamera(flowNdc, camera);
        if (raycaster.ray.intersectSphere(UNIT_SPHERE, flowHit)) {
          const p = toLatLon(flowHit);
          return [p.lat, p.lon];
        }
      }
      return null;
    },
    pixelsPerDegree: () => flowPpd,
  };
  // Air-quality bubbles: a canvas above the wind lines.
  const stationLayer = new StationLayer('globe__stations');
  stationLayer.canvas.hidden = true;
  host.insertBefore(stationLayer.canvas, labelRenderer.domElement);
  let stationsDirty = false;

  const lastCamera = new THREE.Matrix4();
  /** True once per frame in which the camera moved. */
  const cameraMoved = () => {
    camera.updateMatrixWorld();
    if (lastCamera.equals(camera.matrixWorld)) return false;
    lastCamera.copy(camera.matrixWorld);
    return true;
  };
  const flowFrame = () => {
    flowDir.copy(camera.position).normalize();
    // Pixels per degree at the middle of the view.
    const centre = toLatLon(camera.position);
    const a = flowView.project(centre.lat, centre.lon);
    const b = flowView.project(Math.min(89, centre.lat + 0.5), centre.lon);
    flowPpd = a && b ? Math.hypot(a[0] - b[0], a[1] - b[1]) * 2 : 1;
    const d = camera.position.length();
    const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
    const discPx = (Math.tan(Math.asin(1 / d)) / Math.tan(vHalf)) * (host.clientHeight / 2);
    const coverage = Math.min(1, (Math.PI * discPx * discPx) / (host.clientWidth * host.clientHeight));
    flow.frame(flowView, coverage);
  };

  // Resize
  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    flow.resize(w, h, renderer.getPixelRatio());
    stationLayer.resize(w, h, renderer.getPixelRatio());
    stationsDirty = true;
    for (const m of lineMaterials) m.resolution.set(w, h);
    split.value = splitFraction * renderer.domElement.width;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (framed) {
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      camera.position.setLength(THREE.MathUtils.clamp(1.12 / Math.sin(Math.min(vHalf, hHalf)), 2.6, MAX_DISTANCE));
    }
    requestRender();
    scheduleView();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  // Render only when something changed: camera, tiles, layers, labels.
  renderer.setAnimationLoop((now) => {
    if (flight) {
      runFlight(now);
      needsRender = true;
    } else {
      tuneSpeed();
      if (controls.update()) needsRender = true;
    }
    hover(now);
    if (light !== 'flat' && now - sunAt > 30000) {
      // The Sun moves a quarter of a degree a minute: place it again every 30 s.
      sunAt = now;
      const sp = subsolar();
      sunWorld.copy(fromLatLon(sp.lat, sp.lon, 1));
      needsRender = true;
    }
    const moved = cameraMoved();
    if (radOn) {
      const show = camera.position.length() < RADIATION_FROM;
      if (show !== radMesh.visible) {
        radMesh.visible = show;
        needsRender = true;
        if (show) scheduleView();
      }
    }
    if (moved) flow.clear();
    if (flow.active) flowFrame();
    if (stationLayer.active && (moved || stationsDirty)) {
      stationsDirty = false;
      flowDir.copy(camera.position).normalize();
      stationLayer.draw(flowView);
    }
    if (!needsRender) return;
    needsRender = false;
    // The sun glint on the ocean only reads well from far away; close up it would be a bright smear.
    earthUniforms.uGlint.value = THREE.MathUtils.smoothstep(camera.position.length(), 1.6, 2.6);
    camera.updateMatrixWorld();
    sunView.copy(sunWorld).transformDirection(camera.matrixWorldInverse);
    const distance = camera.position.length();
    firePoints.update(distance, renderer.getPixelRatio());
    updateLabels();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

  const placeCamera = (lat: number, lon: number, distance: number) => {
    camera.position.copy(fromLatLon(lat, lon, THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE)));
    camera.lookAt(0, 0, 0);
    controls.update();
    requestRender();
    refreshView();
  };

  function applyData(mesh: THREE.Mesh, uniforms: typeof dataUniforms, data: GlobeData | null) {
    if (!data) {
      mesh.visible = false;
      requestRender();
      return;
    }
    const tex = new THREE.DataTexture(data.rgba, data.width, data.height, THREE.RGBAFormat);
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    const previous = uniforms.uData.value;
    uniforms.uData.value = tex;
    uniforms.uGrid.value.set(data.width, data.height);
    previous.dispose();
    mesh.visible = true;
    requestRender();
  }

  function applyImagery(mesh: THREE.Mesh, uniforms: typeof imageryUniforms, layer: TiledLayer, next: GlobeImagery | null) {
    mesh.visible = !!next;
    const landOnly = !!next?.landOnly;
    landWanted[uniforms === imageryUniforms ? 'right' : 'left'] = landOnly;
    if (landOnly) ensureLand();
    uniforms.uLandOnly.value = landOnly && landState === 'ready' ? 1 : 0;
    layer.setSource(next?.source ?? null);
    if (next) uniforms.uOpacity.value = next.opacity;
    const tint = uniforms.uTint.value;
    if (next?.points) tint.set(fireColor.r, fireColor.g, fireColor.b, 1);
    else tint.set(0, 0, 0, 0);
    // Points go above the war layer (2.5); continuous fields stay under it.
    mesh.renderOrder = next?.points ? 2.7 : 1;
    requestRender();
    scheduleView();
  }

  const api: Api = {
    preload(source) {
      return imagery.preload(source);
    },
    flyTo(lat, lon, distance = 1.7) {
      controls.autoRotate = false;
      framed = false;
      const d1 = THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE);
      if (reduced) {
        placeCamera(lat, lon, d1);
        return;
      }
      controls.enabled = false;
      flight = { from: camera.position.clone().normalize(), to: fromLatLon(lat, lon, 1), d0: camera.position.length(), d1, t0: performance.now(), ms: 1600 };
    },
    jumpTo(lat, lon, distance) {
      controls.autoRotate = false;
      framed = false;
      flight = null;
      controls.enabled = true;
      placeCamera(lat, lon, distance);
    },
    getView() {
      const p = toLatLon(camera.position);
      return { lat: p.lat, lon: p.lon, distance: camera.position.length() };
    },
    setReducedMotion(on) {
      reduced = on;
      if (on) controls.autoRotate = false;
    },
    setData(data) {
      applyData(dataMesh, dataUniforms, data);
    },
    setImagery(next) {
      applyImagery(imageryMesh, imageryUniforms, imagery, next);
    },
    setCompare(left) {
      const on = !!left;
      imageryUniforms.uSide.value = on ? 1 : 0;
      dataUniforms.uSide.value = on ? 1 : 0;
      applyImagery(imageryMeshL, imageryUniformsL, imageryL, left?.imagery ?? null);
      applyData(dataMeshL, dataUniformsL, left?.data ?? null);
    },
    setSplit(fraction) {
      splitFraction = fraction;
      split.value = fraction * renderer.domElement.width;
      requestRender();
    },
    setBorders(on) {
      bordersOn = on;
      requestRender();
      scheduleView();
    },
    setVector(next) {
      warLayer.set(next);
    },
    setFront(next) {
      frontLayer.set(next);
    },
    touchFront() {
      frontLayer.touch();
    },
    setLight(next) {
      light = next;
      earthUniforms.uLight.value = next === 'flat' ? 0 : next === 'sun' ? 1 : 2;
      atmosphereUniforms.uLight.value = earthUniforms.uLight.value;
      night.setSource(next === 'flat' ? null : NIGHT_LIGHTS);
      sunAt = -Infinity;
      requestRender();
      scheduleView();
    },
    setRelief(on) {
      relief = on;
      earthUniforms.uRelief.value = on ? 1 : 0;
      base.setSource(on ? RELIEF_BASE : BASE);
      shade.setSource(on ? RELIEF_SHADE : null);
      requestRender();
      scheduleView();
    },
    setFires(points) {
      firePoints.set(points);
      if (points?.mode === 'live') firePoints.uniforms.uNow.value = 0;
      requestRender();
    },
    setStoryTime(hours) {
      firePoints.uniforms.uNow.value = hours;
      requestRender();
    },
    setStations(next) {
      stationLayer.set(next);
      stationLayer.canvas.hidden = !next;
      stationsDirty = true;
    },
    setRadiation(on) {
      radOn = on;
      radMesh.visible = on && camera.position.length() < RADIATION_FROM;
      rad.setSource(on ? RADIATION : null);
      requestRender();
      scheduleView();
    },
    setField(field) {
      if (!field) {
        fieldMesh.visible = false;
        fieldKey = '';
        requestRender();
        return;
      }
      fieldUniforms.uOpacity.value = field.opacity;
      if (field.key !== fieldKey) {
        fieldKey = field.key;
        const tex = new THREE.CanvasTexture(field.canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = anisotropy;
        tex.wrapS = THREE.RepeatWrapping;
        const previous = fieldUniforms.uField.value;
        fieldUniforms.uField.value = tex;
        previous.dispose();
      }
      fieldMesh.visible = true;
      requestRender();
    },
    setWind(wind) {
      flow.setWind(wind?.sample ?? null);
      flow.canvas.hidden = !wind;
    },
    sampleImagery(lat, lon) {
      if (!imageryMesh.visible) return null;
      return imagery.sample((lon + 180) / 360, (lat + 90) / 180);
    },
    sampleRadiation(lat, lon) {
      if (!radMesh.visible) return null;
      const c = rad.sample((lon + 180) / 360, (lat + 90) / 180);
      if (!c || c[3] < 200) return null;
      return doseFromColor(c[0], c[1], c[2]);
    },
    zoomBy(factor) {
      const p = toLatLon(camera.position);
      const d = camera.position.length();
      api.flyTo(p.lat, p.lon, 1 + (d - 1) * factor);
    },
    home() {
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const d = THREE.MathUtils.clamp(1.12 / Math.sin(Math.min(vHalf, hHalf)), 2.6, MAX_DISTANCE);
      api.flyTo(START.lat, START.lon, d);
    },
    setMarkers(markers) {
      for (const m of markerObjects) scene.remove(m.obj);
      markerObjects = markers.map((m) => {
        const el = document.createElement('div');
        el.className = `globe__marker globe__marker--${m.id.toLowerCase()}`;
        const pin = document.createElement('span');
        pin.className = 'globe__marker-pin';
        pin.textContent = m.id;
        const text = document.createElement('span');
        text.className = 'globe__marker-text';
        text.textContent = m.label;
        el.append(pin, text);
        const obj = new CSS2DObject(el);
        obj.position.copy(fromLatLon(m.lat, m.lon, 1.004));
        scene.add(obj);
        return { obj, normal: fromLatLon(m.lat, m.lon, 1) };
      });
      requestRender();
    },
    setHints(hints) {
      for (const h of hintObjects) scene.remove(h.obj);
      hintObjects = hints.map((h) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = `globe__hint${h.always ? ' globe__hint--layer' : ''}`;
        el.setAttribute('aria-label', h.label);
        el.style.setProperty('--hint', h.color);
        // A round badge with the event's icon on a short stem; the stem's foot marks the place.
        const badge = document.createElement('span');
        badge.className = 'globe__hint-badge';
        badge.setAttribute('aria-hidden', 'true');
        badge.innerHTML = `<svg viewBox="0 0 20 20" width="16" height="16" focusable="false"><path d="${iconPath(h.icon)}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        el.append(badge);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          cb.onHint(h.id);
        });
        el.addEventListener('pointerenter', (e) => {
          if (e.pointerType !== 'mouse') return;
          const r = el.getBoundingClientRect();
          cb.onHintHover(h.id, r.left + r.width / 2, r.top);
        });
        el.addEventListener('pointerleave', () => cb.onHintHover(null, 0, 0));
        const obj = new CSS2DObject(el);
        obj.center.set(0.5, 1);
        obj.position.copy(fromLatLon(h.lat, h.lon, 1.004));
        scene.add(obj);
        return { obj, normal: fromLatLon(h.lat, h.lon, 1), always: !!h.always };
      });
      requestRender();
    },
    setLang(next) {
      lang = next;
      names = new Intl.DisplayNames([lang], { type: 'region' });
      for (const l of countryLabels) {
        const c = countries.find((x) => x.code === l.code)!;
        l.obj.element.textContent = names.of(c.code) ?? c.name;
        l.w = textWidth(l.obj.element.textContent ?? '', c.big ? 13 : 11);
      }
      for (const l of geoLabels) {
        const label = l.obj.element.querySelector('.globe__place-name') ?? l.obj.element;
        label.textContent = l.text![lang];
        l.w = textWidth(l.text![lang], l.h > 15 ? 13 : 11) + (l.layer === 'capital' ? 10 : 0);
      }
      requestRender();
    },
    setGeo(geo, nextLayers) {
      layers = nextLayers;
      if (geo && !geoLabels.length) {
        const make = (layer: MapLabel['layer'], place: { uk: string; en: string; lat: number; lon: number; rank: number }, priority: number, from: number, extra = ''): MapLabel => {
          const el = document.createElement('div');
          el.className = `globe__place globe__place--${layer}${extra}`;
          const name = document.createElement('span');
          name.className = 'globe__place-name';
          name.textContent = place[lang];
          if (layer === 'capital') {
            const dot = document.createElement('span');
            dot.className = 'globe__place-dot';
            el.append(dot);
          }
          el.append(name);
          const obj = new CSS2DObject(el);
          // Capitals hang their name to the right of a dot on the city.
          if (layer === 'capital') obj.center.set(0, 0.5);
          obj.position.copy(fromLatLon(place.lat, place.lon, 1.004));
          obj.visible = false;
          scene.add(obj);
          const big = layer === 'sea' && place.rank <= 1;
          return {
            obj,
            normal: fromLatLon(place.lat, place.lon, 1),
            layer,
            priority,
            from,
            w: textWidth(place[lang], big ? 13 : 11) + (layer === 'capital' ? 10 : 0),
            h: big ? 17 : 14,
            ax: layer === 'capital' ? 0 : 0.5,
            text: { uk: place.uk, en: place.en },
          };
        };
        geoLabels = [
          ...geo.seas.map((x) => make('sea', x, x.rank === 0 ? 1 : x.rank <= 2 ? 4 : 8, SEAS_FROM[Math.min(5, x.rank)], x.rank === 0 ? ' globe__place--ocean' : x.rank <= 1 ? ' globe__place--bigsea' : '')),
          ...geo.capitals.map((c) => make('capital', c, c.rank <= 1 ? 4.5 : c.rank <= 3 ? 7 : 9, CAPITALS_FROM[Math.min(6, c.rank)])),
          ...geo.rivers.labels.map((r) => make('river', r, r.rank <= 3 ? 8.5 : 10, RIVERS_FROM[Math.min(9, r.rank)])),
        ];
        mapLabels = [...countryLabels, ...geoLabels].sort((a, b) => a.priority - b.priority);
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(segmentsFrom(geo.rivers.lines, false, LINE_RADIUS));
        rivers = new LineSegments2(geometry, makeLineMaterial(riverColor, 1.3, 0.8));
        rivers.renderOrder = 4;
        rivers.visible = false;
        rivers.frustumCulled = false;
        scene.add(rivers);
        resize();
      }
      requestRender();
    },
    setBorderLines(lines) {
      for (const b of borderObjects) {
        scene.remove(b.line);
        b.line.geometry.dispose();
        const m = b.line.material as LineMaterial;
        m.dispose();
        lineMaterials.splice(lineMaterials.indexOf(m), 1);
      }
      borderObjects = [];
      if (lines) {
        const star = readToken('--color-border', '#eef2fb');
        const halo = readToken('--color-void', '#03060f');
        const add = (data: number[][], color: THREE.Color, width: number, opacity: number, order: number, coast: boolean, radius: number) => {
          const geometry = new LineSegmentsGeometry();
          geometry.setPositions(segmentsFrom(data, false, radius));
          const line = new LineSegments2(geometry, makeLineMaterial(color, width, opacity));
          line.renderOrder = order;
          line.frustumCulled = false;
          line.visible = false;
          scene.add(line);
          borderObjects.push({ line, coast });
        };
        // A wide dark halo under a bright line: borders stay readable over clouds, snow and data layers.
        add(lines.coast, star, 0.9, 0.45, 3.5, true, LINE_RADIUS);
        add(lines.land, halo, 6, 0.72, 4.05, false, LINE_RADIUS + 0.0001);
        add(lines.disputed, star, 1.3, 0.6, 4.1, false, LINE_RADIUS + 0.0002);
        add(lines.land, star, 1.9, 1, 4.15, false, LINE_RADIUS + 0.0002);
        resize();
      }
      requestRender();
    },
    setOutlines(outlines) {
      for (const o of outlineObjects) {
        scene.remove(o);
        o.geometry.dispose();
        const m = o.material as LineMaterial;
        m.dispose();
        lineMaterials.splice(lineMaterials.indexOf(m), 1);
      }
      outlineObjects = outlines.flatMap((o) => {
        const positions = segmentsFrom(o.rings, true, LINE_RADIUS + 0.0002);
        const ukraine = o.id === 'UA';
        const color = ukraine ? readToken('--color-ukraine', '#ffd23f') : readToken(`--color-series-${o.id.toLowerCase()}`, '#f3bd6e');
        const out: LineSegments2[] = [];
        if (ukraine) {
          const haloGeometry = new LineSegmentsGeometry();
          haloGeometry.setPositions(positions);
          const halo = new LineSegments2(haloGeometry, makeLineMaterial(readToken('--color-void', '#03060f'), 6, 0.7));
          halo.renderOrder = 4.9;
          halo.frustumCulled = false;
          scene.add(halo);
          out.push(halo);
        }
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(positions);
        const line = new LineSegments2(geometry, makeLineMaterial(color, ukraine ? 2.6 : 2.4, 0.95));
        line.renderOrder = 5;
        line.frustumCulled = false;
        scene.add(line);
        out.push(line);
        return out;
      });
      resize();
      requestRender();
    },
    dispose() {
      disposed = true;
      window.clearTimeout(viewTimer);
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      for (const m of lineMaterials) m.dispose();
      land.value.dispose();
      base.dispose();
      imagery.dispose();
      imageryL.dispose();
      dataUniforms.uData.value.dispose();
      dataUniformsL.uData.value.dispose();
      warLayer.dispose();
      frontLayer.dispose();
      night.dispose();
      shade.dispose();
      rad.dispose();
      firePoints.dispose();
      stationLayer.canvas.remove();
      fieldUniforms.uField.value.dispose();
      earthUniforms.uFallback.value.dispose();
      flow.canvas.remove();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    },
  };
  return api;
}

/** Full-screen interactive Earth: drag to rotate, wheel or pinch to zoom, click to pick a place. */
export function Globe(props: Props) {
  const { label, fallback, lang, data, imagery, showBorders, vector, markers, compare, apiRef } = props;
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const latest = useRef(props);
  latest.current = props;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const created = createGlobe(
      host,
      { reduced: reducedRef.current, lang: latest.current.lang },
      {
        onHover: (p) => latest.current.onHover?.(p),
        onPick: (p) => latest.current.onPick?.(p),
        onView: (v) => latest.current.onView?.(v),
        onLoading: (l) => latest.current.onLoadingChange?.(l),
        onHint: (id) => latest.current.onHint?.(id),
        onStationHover: (i, x, y) => latest.current.onStationHover?.(i, x, y),
        onHintHover: (id, x, y) => latest.current.onHintHover?.(id, x, y),
        onStationPick: (i) => latest.current.onStationPick?.(i),
      },
    );
    if (!created) setFailed(true);
    api.current = created;
    if (apiRef) apiRef.current = created;
    return () => {
      created?.dispose();
      api.current = null;
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  useEffect(() => api.current?.setReducedMotion(reduced), [reduced]);
  useEffect(() => api.current?.setLang(lang), [lang]);
  useEffect(() => api.current?.setBorders(showBorders), [showBorders]);
  useEffect(() => api.current?.setData(data), [data]);
  useEffect(() => api.current?.setImagery(imagery), [imagery]);
  useEffect(() => api.current?.setMarkers(markers), [markers]);
  useEffect(() => api.current?.setHints(props.hints ?? []), [props.hints]);
  const geo = props.geo ?? null;
  const labelLayers = props.labelLayers;
  useEffect(() => api.current?.setGeo(geo, labelLayers ?? { capitals: true, seas: true, rivers: true }), [geo, labelLayers]);
  useEffect(() => api.current?.setOutlines(props.outlines ?? []), [props.outlines]);
  const borderLines = props.borderLines ?? null;
  useEffect(() => api.current?.setBorderLines(borderLines), [borderLines]);
  useEffect(() => api.current?.setVector(vector), [vector]);
  const front = props.front ?? null;
  useEffect(() => api.current?.setFront(front), [front]);
  const light = props.light ?? 'flat';
  useEffect(() => api.current?.setLight(light), [light]);
  const relief = props.relief ?? false;
  useEffect(() => api.current?.setRelief(relief), [relief]);
  const fires = props.fires ?? null;
  useEffect(() => api.current?.setFires(fires), [fires]);
  const storyTime = props.storyTime ?? 0;
  useEffect(() => {
    if (fires?.mode === 'story') api.current?.setStoryTime(storyTime);
  }, [storyTime, fires]);
  const stations = props.stations ?? null;
  useEffect(() => api.current?.setStations(stations), [stations]);
  const radiation = props.radiation ?? false;
  useEffect(() => api.current?.setRadiation(radiation), [radiation]);
  const field = props.field ?? null;
  useEffect(() => api.current?.setField(field), [field]);
  const wind = props.wind ?? null;
  useEffect(() => api.current?.setWind(wind), [wind]);
  const compareImagery = compare?.imagery ?? null;
  const compareData = compare?.data ?? null;
  const comparing = !!compare;
  useEffect(
    () => api.current?.setCompare(comparing ? { imagery: compareImagery, data: compareData } : null),
    [comparing, compareImagery, compareData],
  );
  const [split, setSplit] = useState(0.5);
  useEffect(() => api.current?.setSplit(split), [split]);

  return (
    <>
      <div ref={hostRef} className="globe" role="img" aria-label={label}>
        {failed && <p className="globe__fallback">{fallback}</p>}
      </div>
      {compare && <SplitHandle split={split} onSplit={setSplit} compare={compare} />}
    </>
  );
}

/** The shutter's line and knob: drag it, or use the arrow keys. */
function SplitHandle({ split, onSplit, compare }: { split: number; onSplit: (f: number) => void; compare: GlobeCompare }) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (f: number) => Math.min(0.95, Math.max(0.05, f));
  const move = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) onSplit(clamp((clientX - rect.left) / rect.width));
  };
  return (
    <div ref={ref} className="globe-split" style={{ ['--split' as string]: split }}>
      <span className="globe-split__line" aria-hidden="true" />
      <span className="globe-split__label globe-split__label--left">{compare.leftLabel}</span>
      <span className="globe-split__label globe-split__label--right">{compare.rightLabel}</span>
      <div
        className="globe-split__knob"
        role="slider"
        tabIndex={0}
        aria-label={compare.handleLabel}
        aria-valuemin={5}
        aria-valuemax={95}
        aria-valuenow={Math.round(split * 100)}
        aria-valuetext={`${compare.leftLabel} | ${compare.rightLabel}`}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e.clientX);
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') onSplit(clamp(split - 0.02));
          else if (e.key === 'ArrowRight') onSplit(clamp(split + 0.02));
          else return;
          e.preventDefault();
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M7 5 2 10l5 5M13 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
