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
import { stackSource, TiledLayer, tiledGlsl, tiledUniforms, wmtsSource, type Box, type TileSource } from './globe/tiles';

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
const BASE = stackSource(
  'base',
  wmtsSource('BlueMarble_NextGeneration', '500m', 'image/jpeg'),
  wmtsSource('Landsat_WELD_CorrectedReflectance_TrueColor_Global_Annual', '31.25m', 'image/jpeg', '2000-12-01'),
);

/** Climate cells: R = value (0..1) times validity, G = validity, B = significance times validity. */
export type GlobeData = { rgba: Uint8Array; width: number; height: number; key: string };
/** `points`: a layer of point detections (fires), drawn in one colour above the vector layer. */
export type GlobeImagery = { source: TileSource; opacity: number; points?: boolean; landOnly?: boolean };
export type GlobePoint = { lat: number; lon: number };
export type GlobeMarker = { id: string; lat: number; lon: number; label: string };
/** A hint about an anomaly, shown when zoomed in on its area. */
export type GlobeHint = { id: string; lat: number; lon: number; label: string };
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

export type GlobeApi = {
  /** Loads a map layer for the current view without showing it (playback looks one step ahead). */
  preload: (source: TileSource) => Promise<void>;
  flyTo: (lat: number, lon: number, distance?: number) => void;
  jumpTo: (lat: number, lon: number, distance: number) => void;
  getView: () => GlobeView;
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
  onHint?: (id: string) => void;
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

// The light rides with the camera (up and to the left of the viewer), so the visible side is always lit.
const earthFragment = /* glsl */ `
  uniform float uReady;
  uniform float uGlint;
  uniform vec3 uAtmosphere;
  varying vec2 vUv;
  varying vec3 vNormalV;
  ${tiledGlsl('uBase')}
  void main() {
    vec3 n = normalize(vNormalV);
    vec3 light = normalize(vec3(-0.45, 0.55, 0.9));
    float ndl = dot(n, light);
    vec4 map = uBaseSample(vUv);
    vec3 base = mix(vec3(0.04, 0.07, 0.14), map.rgb, map.a * uReady);
    vec3 col = base * (0.42 + 0.78 * max(ndl, 0.0));
    float ocean = smoothstep(0.015, 0.09, base.b - base.r) * map.a;
    vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
    col += vec3(0.85, 0.88, 0.95) * pow(max(dot(n, h), 0.0), 70.0) * 0.22 * ocean * uGlint;
    float rim = pow(1.0 - max(n.z, 0.0), 3.0);
    col += uAtmosphere * rim * 0.6;
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
  varying vec3 vNormalV;
  void main() {
    float facing = clamp(-normalize(vNormalV).z * 2.6, 0.0, 1.0);
    gl_FragColor = vec4(uColor * pow(facing, 2.2) * 0.85, 1.0);
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
  dispose: () => void;
};

type Callbacks = {
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

  const atmosphereColor = readToken('--color-atmosphere', '#7fb0ff');
  const earthUniforms = { uReady: { value: 1 }, uGlint: { value: 1 }, uAtmosphere: { value: atmosphereColor }, ...tiledUniforms('uBase', base) };
  // Every layer is drawn on the same sphere as the earth, without a depth test: lifted even a few
  // kilometres, a layer would slide against the map at close zoom. Back faces are culled, so the
  // far side of the globe never shows through.
  const sphere = new THREE.SphereGeometry(1, 160, 120);
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

  const vectorUniforms = {
    uVec: { value: new THREE.Texture() },
    uVecBounds: { value: new THREE.Vector4() },
    uVecPatch: { value: new THREE.Texture() },
    uVecPatchBounds: { value: new THREE.Vector4() },
  };
  let vector: GlobeVector | null = null;
  let vectorPatchKey = '';
  const uvBounds = (b: Box) => [(b.w + 180) / 360, (b.s + 90) / 180, (b.e + 180) / 360, (b.n + 90) / 180] as const;
  const clearVectorPatch = () => {
    vectorPatchKey = '';
    vectorUniforms.uVecPatchBounds.value.set(0, 0, 0, 0);
  };
  /** Repaints the visible part of the vector layer at screen resolution once that beats the whole-layer canvas. */
  const updateVectorPatch = (box: Box | null, px: number) => {
    if (!vector?.draw || !box || !vectorMesh.visible) return clearVectorPatch();
    const vb = vector.box;
    const part = { w: Math.max(box.w, vb.w), s: Math.max(box.s, vb.s), e: Math.min(box.e, vb.e), n: Math.min(box.n, vb.n) };
    const degPerPixel = (box.e - box.w) / px;
    const wholePerPixel = (vb.e - vb.w) / vector.canvas.width;
    if (part.e <= part.w || part.n <= part.s || degPerPixel > wholePerPixel * 0.7) return clearVectorPatch();
    const width = Math.min(4096, Math.ceil((part.e - part.w) / degPerPixel));
    const key = `${vector.key}|${part.w.toFixed(3)},${part.s.toFixed(3)},${part.e.toFixed(3)},${part.n.toFixed(3)}|${width}`;
    if (key === vectorPatchKey) return;
    vectorPatchKey = key;
    const tex = new THREE.CanvasTexture(vector.draw(part, width));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = anisotropy;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    const previous = vectorUniforms.uVecPatch.value;
    vectorUniforms.uVecPatch.value = tex;
    previous.dispose();
    vectorUniforms.uVecPatchBounds.value.set(...uvBounds(part));
    requestRender();
  };
  const vectorMesh = new THREE.Mesh(
    sphere,
    new THREE.ShaderMaterial({ uniforms: vectorUniforms, vertexShader: vertex, fragmentShader: vectorFragment, transparent: true, depthTest: false, depthWrite: false }),
  );
  vectorMesh.renderOrder = 2.5;
  vectorMesh.visible = false;
  scene.add(vectorMesh);

  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(1.07, 96, 72),
      new THREE.ShaderMaterial({
        uniforms: { uColor: { value: atmosphereColor } },
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
  let hintObjects: { obj: CSS2DObject; normal: THREE.Vector3 }[] = [];

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
    updateVectorPatch(box, px);
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
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    toNdc(e);
    pointerInside = true;
    pointerDirty = true;
  };
  const onLeave = () => {
    pointerInside = false;
    cb.onHover(null);
  };
  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6) {
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
      hint.obj.visible = distance <= HINTS_FROM && hint.normal.dot(camDir) > horizon + 0.05;
      if (hint.obj.visible) {
        const [x, y] = screen(hint.normal);
        taken.push([x - 2, y - 30, x + 24, y + 2]);
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

  // Resize
  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
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
    if (!needsRender) return;
    needsRender = false;
    // The sun glint on the ocean only reads well from far away; close up it would be a bright smear.
    earthUniforms.uGlint.value = THREE.MathUtils.smoothstep(camera.position.length(), 1.6, 2.6);
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

  return {
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
      vector = next;
      clearVectorPatch();
      if (!next) {
        vectorMesh.visible = false;
        requestRender();
        return;
      }
      const tex = new THREE.CanvasTexture(next.canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = anisotropy;
      const previous = vectorUniforms.uVec.value;
      vectorUniforms.uVec.value = tex;
      previous.dispose();
      vectorUniforms.uVecBounds.value.set(...uvBounds(next.box));
      vectorMesh.visible = true;
      requestRender();
      scheduleView();
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
        el.className = 'globe__hint';
        el.setAttribute('aria-label', h.label);
        // A map pin whose tip marks the place.
        const icon = document.createElement('span');
        icon.className = 'globe__hint-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.innerHTML =
          '<svg viewBox="0 0 24 32" width="22" height="29" focusable="false"><ellipse cx="12" cy="29.6" rx="5.5" ry="1.9" class="globe__pin-shadow"/><path class="globe__pin-body" d="M12 1.5C6.2 1.5 1.6 6.1 1.6 11.8c0 7.3 8.5 15.2 9.5 16.1a1.3 1.3 0 0 0 1.8 0c1-.9 9.5-8.8 9.5-16.1C22.4 6.1 17.8 1.5 12 1.5Z"/><circle class="globe__pin-eye" cx="12" cy="11.6" r="4.6"/></svg>';
        const text = document.createElement('span');
        text.className = 'globe__hint-text';
        text.textContent = h.label;
        el.append(icon, text);
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          cb.onHint(h.id);
        });
        const obj = new CSS2DObject(el);
        // The pin's tip (bottom middle of the icon) sits on the place.
        obj.center.set(0, 1);
        obj.position.copy(fromLatLon(h.lat, h.lon, 1.004));
        scene.add(obj);
        return { obj, normal: fromLatLon(h.lat, h.lon, 1) };
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
        add(lines.coast, star, 0.9, 0.45, 3.5, true, LINE_RADIUS);
        add(lines.land, halo, 4, 0.55, 4.05, false, LINE_RADIUS + 0.0001);
        add(lines.disputed, star, 1.2, 0.55, 4.1, false, LINE_RADIUS + 0.0002);
        add(lines.land, star, 1.6, 0.95, 4.15, false, LINE_RADIUS + 0.0002);
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
      outlineObjects = outlines.map((o) => {
        const geometry = new LineSegmentsGeometry();
        geometry.setPositions(segmentsFrom(o.rings, true, LINE_RADIUS + 0.0002));
        const color = readToken(`--color-series-${o.id.toLowerCase()}`, '#f3bd6e');
        const line = new LineSegments2(geometry, makeLineMaterial(color, 2.4, 0.95));
        line.renderOrder = 5;
        line.frustumCulled = false;
        scene.add(line);
        return line;
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
      vectorUniforms.uVec.value.dispose();
      vectorUniforms.uVecPatch.value.dispose();
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
