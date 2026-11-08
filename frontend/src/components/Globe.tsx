import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { countries } from '../data/countries';
import { earthDayMaps, gibsBox, gibsGlobal } from '../data/media';
import { useReducedMotion } from '../hooks/useMedia';
import type { Lang } from '../i18n/strings';

/** Where the camera starts: over Ukraine, pulled back to show the whole disc. */
const START = { lat: 42, lon: 28, distance: 3.4 };
/** About 380 km above the surface; a NASA GIBS close-up covers the view below DETAIL_FROM. */
const MIN_DISTANCE = 1.06;
const MAX_DISTANCE = 9;
const DETAIL_FROM = 2.3;
/** Big countries are named from this far out, the rest from LABELS_ALL. */
const LABELS_BIG = 4.2;
const LABELS_ALL = 1.9;
/** NASA GIBS line layers: US Department of State international boundaries and 15 m coastlines. */
const BORDER_LAYERS = 'Coastlines_15m,DoS_International_Boundaries';

export type GlobeOverlay = { rgba: Uint8Array; width: number; height: number; key: string };
export type GlobePoint = { lat: number; lon: number };
export type GlobeApi = { flyTo: (lat: number, lon: number, distance?: number) => void };

type Props = {
  label: string;
  fallback: string;
  lang: Lang;
  overlay: GlobeOverlay | null;
  showBorders: boolean;
  onPoint?: (point: GlobePoint | null) => void;
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

/** Where a ray meets the unit sphere, or null. */
function hitSphere(ray: THREE.Ray, out: THREE.Vector3): THREE.Vector3 | null {
  return ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(), 1), out);
}

// A close-up texture replaces the global one inside its bounds (u0, v0, u1, v1).
const detailGlsl = /* glsl */ `
  uniform sampler2D uDetail;
  uniform vec4 uBounds;
  uniform float uDetailMix;
  vec4 withDetail(vec4 base, vec2 uv) {
    vec2 d = (uv - uBounds.xy) / (uBounds.zw - uBounds.xy);
    if (uDetailMix <= 0.0 || d.x < 0.0 || d.y < 0.0 || d.x > 1.0 || d.y > 1.0) return base;
    return mix(base, texture2D(uDetail, d), uDetailMix);
  }
`;

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
  uniform sampler2D uDay;
  uniform float uReady;
  uniform vec3 uAtmosphere;
  varying vec2 vUv;
  varying vec3 vNormalV;
  ${detailGlsl}
  void main() {
    vec3 n = normalize(vNormalV);
    vec3 light = normalize(vec3(-0.45, 0.55, 0.9));
    float ndl = dot(n, light);
    vec3 map = withDetail(texture2D(uDay, vUv), vUv).rgb;
    vec3 base = mix(vec3(0.04, 0.07, 0.14), map, uReady);
    vec3 col = base * (0.42 + 0.78 * max(ndl, 0.0));
    float ocean = smoothstep(0.015, 0.09, base.b - base.r) * uReady;
    vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
    col += vec3(0.85, 0.88, 0.95) * pow(max(dot(n, h), 0.0), 70.0) * 0.22 * ocean;
    float rim = pow(1.0 - max(n.z, 0.0), 3.0);
    col += uAtmosphere * rim * 0.6;
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

const bordersFragment = /* glsl */ `
  uniform sampler2D uGlobal;
  uniform float uOpacity;
  varying vec2 vUv;
  ${detailGlsl}
  void main() {
    vec4 c = withDetail(texture2D(uGlobal, vUv), vUv);
    if (c.a < 0.02) discard;
    gl_FragColor = vec4(c.rgb, c.a * uOpacity);
    #include <colorspace_fragment>
  }
`;

// Data cells: alpha 1 = value, ~0.43 = trend not significant (hatched in its own hue), 0 = no data.
const dataFragment = /* glsl */ `
  uniform sampler2D uData;
  uniform vec2 uGrid;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uData, vUv);
    if (c.a < 0.05) discard;
    float weak = 1.0 - step(0.7, c.a);
    float hatch = step(0.5, fract((vUv.x * uGrid.x + vUv.y * uGrid.y) * 1.5));
    vec3 col = mix(c.rgb, c.rgb * 0.5, weak * hatch);
    gl_FragColor = vec4(col, uOpacity);
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
  setAutoRotate: (on: boolean) => void;
  setOverlay: (overlay: GlobeOverlay | null) => void;
  setBorders: (on: boolean) => void;
  setLang: (lang: Lang) => void;
  setReducedMotion: (on: boolean) => void;
  dispose: () => void;
};

type Callbacks = {
  onPoint: (point: GlobePoint | null) => void;
  onLoading: (loading: boolean) => void;
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
  /** Until the user moves the camera, keep the whole planet framed for the screen shape. */
  let framed = true;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.005, 300);
  camera.position.copy(fromLatLon(START.lat, START.lon, START.distance));

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin('anonymous');
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const prepare = (tex: THREE.Texture) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    return tex;
  };

  // Earth
  const atmosphereColor = readToken('--color-atmosphere', '#7fb0ff');
  const earthUniforms = {
    uDay: { value: new THREE.Texture() },
    uReady: { value: 0 },
    uAtmosphere: { value: atmosphereColor },
    uDetail: { value: new THREE.Texture() },
    uBounds: { value: new THREE.Vector4(0, 0, 0, 0) },
    uDetailMix: { value: 0 },
  };
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 192, 144),
    new THREE.ShaderMaterial({ uniforms: earthUniforms, vertexShader: vertex, fragmentShader: earthFragment }),
  );
  scene.add(earth);

  // Climate data cells
  const dataUniforms = {
    uData: { value: new THREE.Texture() },
    uGrid: { value: new THREE.Vector2(180, 90) },
    uOpacity: { value: 0.82 },
  };
  const dataLayer = new THREE.Mesh(
    new THREE.SphereGeometry(1.0015, 192, 144),
    new THREE.ShaderMaterial({
      uniforms: dataUniforms,
      vertexShader: vertex,
      fragmentShader: dataFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  dataLayer.renderOrder = 1;
  dataLayer.visible = false;
  scene.add(dataLayer);

  // Borders and coastlines (NASA GIBS)
  const bordersUniforms = {
    uGlobal: { value: new THREE.Texture() },
    uOpacity: { value: 0.9 },
    uDetail: { value: new THREE.Texture() },
    uBounds: { value: new THREE.Vector4(0, 0, 0, 0) },
    uDetailMix: { value: 0 },
  };
  const borders = new THREE.Mesh(
    new THREE.SphereGeometry(1.003, 192, 144),
    new THREE.ShaderMaterial({
      uniforms: bordersUniforms,
      vertexShader: vertex,
      fragmentShader: bordersFragment,
      transparent: true,
      depthWrite: false,
    }),
  );
  borders.renderOrder = 2;
  borders.visible = false;
  scene.add(borders);
  let bordersLoaded = false;

  // Atmosphere
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

  // Country names
  let names = new Intl.DisplayNames([opts.lang], { type: 'region' });
  const labels = countries.map((c) => {
    const el = document.createElement('div');
    el.className = c.big ? 'globe__label globe__label--big' : 'globe__label';
    el.textContent = names.of(c.code) ?? c.name;
    const obj = new CSS2DObject(el);
    obj.position.copy(fromLatLon(c.lat, c.lon, 1.01));
    obj.visible = false;
    scene.add(obj);
    return { country: c, obj, normal: fromLatLon(c.lat, c.lon, 1) };
  });

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

  const tuneSpeed = () => {
    const altitude = camera.position.length() - 1;
    controls.rotateSpeed = THREE.MathUtils.clamp(altitude * 0.4, 0.02, 0.6);
    controls.zoomSpeed = THREE.MathUtils.clamp(altitude * 0.5, 0.25, 1);
  };

  // Global maps: small first, sharp second.
  let best = -1;
  earthDayMaps.forEach((url, level) => {
    loader.load(url, (tex) => {
      if (disposed || level < best) {
        tex.dispose();
        return;
      }
      const previous = earthUniforms.uDay.value;
      earthUniforms.uDay.value = prepare(tex);
      previous.dispose();
      if (best < 0) animateUniform(earthUniforms.uReady, 1, 900);
      best = level;
    });
  });

  function animateUniform(uniform: { value: number }, to: number, ms: number) {
    const from = uniform.value;
    const t0 = performance.now();
    const step = (now: number) => {
      if (disposed) return;
      const t = reduced ? 1 : Math.min(1, (now - t0) / ms);
      uniform.value = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // Close-up imagery for the current view, fetched from NASA GIBS once the camera settles.
  const raycaster = new THREE.Raycaster();
  const hit = new THREE.Vector3();
  let detailTimer = 0;
  let detailRequest = 0;
  let detailKey = '';
  let pending = 0;
  const setPending = (delta: number) => {
    pending += delta;
    cb.onLoading(pending > 0);
  };

  function visibleBox(): { s: number; w: number; n: number; e: number } | null {
    const lats: number[] = [];
    const lons: number[] = [];
    for (let i = 0; i <= 8; i++) {
      for (let j = 0; j <= 8; j++) {
        raycaster.setFromCamera(new THREE.Vector2(-1 + i / 4, -1 + j / 4), camera);
        if (hitSphere(raycaster.ray, hit)) {
          const p = toLatLon(hit);
          lats.push(p.lat);
          lons.push(p.lon);
        }
      }
    }
    if (lats.length < 4) return null;
    let w = Math.min(...lons);
    let e = Math.max(...lons);
    if (e - w > 180) {
      const shifted = lons.map((l) => (l < 0 ? l + 360 : l));
      w = Math.min(...shifted);
      e = Math.max(...shifted);
      if (e - w > 180 || e > 180) return null; // the view straddles the antimeridian
    }
    let s = Math.min(...lats);
    let n = Math.max(...lats);
    const padLon = (e - w) * 0.15 + 0.5;
    const padLat = (n - s) * 0.15 + 0.5;
    s = Math.max(-90, s - padLat);
    n = Math.min(90, n + padLat);
    w = Math.max(-180, w - padLon);
    e = Math.min(180, e + padLon);
    return { s, w, n, e };
  }

  function clearDetail() {
    detailKey = '';
    earthUniforms.uDetailMix.value = 0;
    bordersUniforms.uDetailMix.value = 0;
  }

  function requestDetail() {
    if (disposed) return;
    if (camera.position.length() > DETAIL_FROM) {
      clearDetail();
      return;
    }
    const box = visibleBox();
    if (!box) {
      clearDetail();
      return;
    }
    const lonSpan = box.e - box.w;
    const latSpan = box.n - box.s;
    const px = Math.min(4096, Math.max(1024, Math.round(renderer.domElement.width * 1.25)));
    let width = px;
    let height = Math.round((px * latSpan) / lonSpan);
    if (height > 4096) {
      width = Math.round((width * 4096) / height);
      height = 4096;
    }
    const key = [box.s, box.w, box.n, box.e].map((v) => v.toFixed(2)).join(',') + `:${width}:${borders.visible}`;
    if (key === detailKey) return;
    detailKey = key;
    const id = ++detailRequest;
    const bounds = new THREE.Vector4((box.w + 180) / 360, (box.s + 90) / 180, (box.e + 180) / 360, (box.n + 90) / 180);

    setPending(1);
    loader.load(
      gibsBox('BlueMarble_NextGeneration', box, width, height, 'image/jpeg'),
      (tex) => {
        setPending(-1);
        if (disposed || id !== detailRequest) {
          tex.dispose();
          return;
        }
        const previous = earthUniforms.uDetail.value;
        earthUniforms.uDetail.value = prepare(tex);
        earthUniforms.uBounds.value.copy(bounds);
        previous.dispose();
        earthUniforms.uDetailMix.value = 0;
        animateUniform(earthUniforms.uDetailMix, 1, 500);
      },
      undefined,
      () => setPending(-1),
    );

    if (borders.visible) {
      setPending(1);
      loader.load(
        gibsBox(BORDER_LAYERS, box, width, height, 'image/png'),
        (tex) => {
          setPending(-1);
          if (disposed || id !== detailRequest) {
            tex.dispose();
            return;
          }
          const previous = bordersUniforms.uDetail.value;
          bordersUniforms.uDetail.value = prepare(tex);
          bordersUniforms.uBounds.value.copy(bounds);
          previous.dispose();
          bordersUniforms.uDetailMix.value = 1;
        },
        undefined,
        () => setPending(-1),
      );
    } else {
      bordersUniforms.uDetailMix.value = 0;
    }
  }

  const scheduleDetail = () => {
    window.clearTimeout(detailTimer);
    detailTimer = window.setTimeout(requestDetail, 450);
  };
  controls.addEventListener('end', scheduleDetail);

  // Hover and tap: report the point under the pointer.
  const pointer = new THREE.Vector2();
  let pointerDirty = false;
  let pointerInside = false;
  let downAt: { x: number; y: number } | null = null;
  const toNdc = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.buttons) return;
    toNdc(e);
    pointerInside = true;
    pointerDirty = true;
  };
  const onLeave = () => {
    pointerInside = false;
    cb.onPoint(null);
  };
  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: PointerEvent) => {
    if (downAt && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6) {
      toNdc(e);
      pointerInside = true;
      pointerDirty = true;
    }
    downAt = null;
  };
  const canvas = renderer.domElement;
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerleave', onLeave);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', onUp);

  let lastPick = 0;
  const pick = (now: number) => {
    if (!pointerDirty || !pointerInside || now - lastPick < 60) return;
    lastPick = now;
    pointerDirty = false;
    raycaster.setFromCamera(pointer, camera);
    cb.onPoint(hitSphere(raycaster.ray, hit) ? toLatLon(hit) : null);
  };

  // Labels: only countries on the near side, big ones first as the camera comes closer.
  const camDir = new THREE.Vector3();
  const updateLabels = () => {
    const distance = camera.position.length();
    camDir.copy(camera.position).normalize();
    const horizon = 1 / distance;
    for (const l of labels) {
      const show =
        borders.visible &&
        l.normal.dot(camDir) > horizon + 0.12 &&
        (l.country.big ? distance <= LABELS_BIG : distance <= LABELS_ALL);
      l.obj.visible = show;
    }
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
    const d = flight.d0 + (flight.d1 - flight.d0) * e + arc;
    camera.position.copy(dir.multiplyScalar(d));
    camera.lookAt(0, 0, 0);
    if (t >= 1) {
      flight = null;
      controls.enabled = true;
      scheduleDetail();
    }
  };

  // Resize and loop
  const resize = () => {
    const w = Math.max(1, host.clientWidth);
    const h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    labelRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (framed) {
      const vHalf = THREE.MathUtils.degToRad(camera.fov / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * camera.aspect);
      const fit = THREE.MathUtils.clamp(1.12 / Math.sin(Math.min(vHalf, hHalf)), 2.6, MAX_DISTANCE);
      camera.position.setLength(fit);
    }
    scheduleDetail();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();

  renderer.setAnimationLoop((now) => {
    if (flight) runFlight(now);
    else {
      tuneSpeed();
      controls.update();
    }
    pick(now);
    updateLabels();
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  });

  return {
    flyTo(lat, lon, distance = 1.7) {
      controls.autoRotate = false;
      framed = false;
      const target = fromLatLon(lat, lon, 1);
      const d1 = THREE.MathUtils.clamp(distance, MIN_DISTANCE, MAX_DISTANCE);
      if (reduced) {
        camera.position.copy(target.multiplyScalar(d1));
        camera.lookAt(0, 0, 0);
        scheduleDetail();
        return;
      }
      controls.enabled = false;
      flight = {
        from: camera.position.clone().normalize(),
        to: target,
        d0: camera.position.length(),
        d1,
        t0: performance.now(),
        ms: 1600,
      };
    },
    setAutoRotate(on) {
      controls.autoRotate = on;
    },
    setReducedMotion(on) {
      reduced = on;
      if (on) controls.autoRotate = false;
    },
    setOverlay(overlay) {
      if (!overlay) {
        dataLayer.visible = false;
        return;
      }
      const tex = new THREE.DataTexture(overlay.rgba, overlay.width, overlay.height, THREE.RGBAFormat);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      const previous = dataUniforms.uData.value;
      dataUniforms.uData.value = tex;
      dataUniforms.uGrid.value.set(overlay.width, overlay.height);
      previous.dispose();
      dataLayer.visible = true;
    },
    setBorders(on) {
      borders.visible = on;
      if (on && !bordersLoaded) {
        bordersLoaded = true;
        setPending(1);
        loader.load(
          gibsGlobal(BORDER_LAYERS, 4096, 'image/png'),
          (tex) => {
            setPending(-1);
            if (disposed) return tex.dispose();
            bordersUniforms.uGlobal.value = prepare(tex);
          },
          undefined,
          () => {
            setPending(-1);
            bordersLoaded = false;
          },
        );
      }
      detailKey = '';
      scheduleDetail();
    },
    setLang(lang) {
      names = new Intl.DisplayNames([lang], { type: 'region' });
      for (const l of labels) l.obj.element.textContent = names.of(l.country.code) ?? l.country.name;
    },
    dispose() {
      disposed = true;
      window.clearTimeout(detailTimer);
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      for (const u of [earthUniforms.uDay, earthUniforms.uDetail, bordersUniforms.uGlobal, bordersUniforms.uDetail, dataUniforms.uData]) {
        u.value.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
      labelRenderer.domElement.remove();
    },
  };
}

/** Full-screen interactive Earth: drag to rotate, wheel or pinch to zoom. */
export function Globe({ label, fallback, lang, overlay, showBorders, onPoint, onLoadingChange, apiRef }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const api = useRef<Api | null>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const latest = useRef({ onPoint, onLoadingChange, reduced, lang });
  latest.current = { onPoint, onLoadingChange, reduced, lang };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const created = createGlobe(
      host,
      { reduced: latest.current.reduced, lang: latest.current.lang },
      {
        onPoint: (p) => latest.current.onPoint?.(p),
        onLoading: (l) => latest.current.onLoadingChange?.(l),
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
  useEffect(() => api.current?.setOverlay(overlay), [overlay]);

  return (
    <div ref={hostRef} className="globe" role="img" aria-label={label}>
      {failed && <p className="globe__fallback">{fallback}</p>}
    </div>
  );
}
