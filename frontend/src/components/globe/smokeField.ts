// Smoke drawn on the graphics card (Three.js): every puff is one instance of a quad with a soft
// cloud texture, every fire a glowing quad. The puffs' paths are worked out once (SmokeSim); each
// frame only the puffs alive at that hour are written into the instance buffers. The same field
// serves the 3D globe (puffs face the camera, placed on the sphere) and the 2D map (flat puffs in
// Web Mercator coordinates, inside a MapLibre custom layer).

import * as THREE from 'three';
import { STEP, type SmokeSim } from './smoke';

/** Where a place is in the field's world, and how many world units one km is there. */
export type FieldPlacement = {
  place: (lat: number, lon: number, out: THREE.Vector3) => THREE.Vector3;
  kmToWorld: (lat: number) => number;
  /** Puffs face the camera (globe) or lie flat in the x-y plane (map). */
  billboard: boolean;
};

const ATLAS = 4; // cloud shapes, in a 2 x 2 texture
const CELL = 128;

/** Seeded value noise with a few octaves: soft, lumpy cloud shapes. */
function cloudAtlas(): THREE.CanvasTexture {
  const size = CELL * 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(size, size);
  const hash = (x: number, y: number, s: number) => {
    let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const noise = (x: number, y: number, s: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = smooth(x - xi);
    const fy = smooth(y - yi);
    const a = hash(xi, yi, s) + (hash(xi + 1, yi, s) - hash(xi, yi, s)) * fx;
    const b = hash(xi, yi + 1, s) + (hash(xi + 1, yi + 1, s) - hash(xi, yi + 1, s)) * fx;
    return a + (b - a) * fy;
  };
  for (let v = 0; v < ATLAS; v++) {
    const ox = (v % 2) * CELL;
    const oy = Math.floor(v / 2) * CELL;
    for (let y = 0; y < CELL; y++) {
      for (let x = 0; x < CELL; x++) {
        const u = (x + 0.5) / CELL - 0.5;
        const w = (y + 0.5) / CELL - 0.5;
        let n = 0;
        let amp = 0.55;
        let f = 3;
        for (let o = 0; o < 4; o++) {
          n += amp * noise(u * f + 10, w * f + 10, v * 17 + o);
          amp *= 0.5;
          f *= 2.1;
        }
        // A round puff whose edge is eaten by the noise.
        const r = Math.hypot(u, w) * 2;
        const edge = Math.max(0, 1 - r * r) ** 1.4;
        const alpha = Math.max(0, Math.min(1, edge * (0.35 + 1.25 * n) - 0.08));
        // Light from the upper left gives the puff some body (red channel = shade).
        const shade = Math.max(0, Math.min(1, 0.55 + n * 0.5 - (u + w) * 0.6));
        const k = ((oy + y) * size + ox + x) * 4;
        img.data[k] = Math.round(shade * 255);
        img.data[k + 1] = Math.round(shade * 255);
        img.data[k + 2] = Math.round(shade * 255);
        img.data[k + 3] = Math.round(alpha * 255);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

const VERTEX = /* glsl */ `
attribute vec2 corner;
attribute vec3 iCenter;
attribute float iSize;
attribute float iAlpha;
attribute float iTone;
attribute float iSpin;
attribute float iVariant;
varying vec2 vUv;
varying float vAlpha;
varying float vTone;
varying vec2 vCell;
void main() {
  float c = cos(iSpin);
  float s = sin(iSpin);
  vec2 off = vec2(c * corner.x - s * corner.y, s * corner.x + c * corner.y) * iSize;
  vUv = corner * 0.5 + 0.5;
  vCell = vec2(mod(iVariant, 2.0), floor(iVariant / 2.0)) * 0.5;
  vTone = iTone;
  vAlpha = iAlpha;
#ifdef BILLBOARD
  // Hidden behind the planet: past the horizon seen from the camera.
  vec3 n = normalize(iCenter);
  float horizon = 1.0 / length(cameraPosition);
  vAlpha *= smoothstep(horizon, horizon + 0.02, dot(n, normalize(cameraPosition)));
  vec4 mv = modelViewMatrix * vec4(iCenter, 1.0);
  mv.xy += off;
  gl_Position = projectionMatrix * mv;
#else
  gl_Position = projectionMatrix * modelViewMatrix * vec4(iCenter + vec3(off, 0.0), 1.0);
#endif
}
`;

const PUFF_FRAGMENT = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv;
varying float vAlpha;
varying float vTone;
varying vec2 vCell;
void main() {
  vec4 t = texture2D(uMap, vCell + vUv * 0.5);
  // Sooty grey over the fire, pale grey-white downwind; the shade gives the lumps their body.
  vec3 dark = vec3(0.30, 0.28, 0.26);
#ifdef BILLBOARD
  // Over the dark globe: pale smoke, as satellites see it.
  vec3 light = vec3(0.86, 0.85, 0.83);
  float boost = 1.0;
#else
  // Over the grey flat map: darker and denser, or it melts into the map.
  vec3 light = vec3(0.58, 0.56, 0.54);
  float boost = 1.45;
#endif
  vec3 col = mix(dark, light, vTone) * (0.72 + 0.42 * t.r);
  float a = min(1.0, t.a * vAlpha * boost);
  if (a < 0.004) discard;
  gl_FragColor = vec4(col, a);
}
`;

const FLAME_FRAGMENT = /* glsl */ `
varying vec2 vUv;
varying float vAlpha;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float core = smoothstep(0.35, 0.0, d);
  float glow = smoothstep(1.0, 0.0, d);
  vec3 col = mix(vec3(1.0, 0.33, 0.08), vec3(1.0, 0.95, 0.72), core);
  gl_FragColor = vec4(col * glow * vAlpha, glow * vAlpha);
}
`;

type Buffers = {
  center: THREE.InstancedBufferAttribute;
  size: THREE.InstancedBufferAttribute;
  alpha: THREE.InstancedBufferAttribute;
  tone: THREE.InstancedBufferAttribute;
  spin: THREE.InstancedBufferAttribute;
  variant: THREE.InstancedBufferAttribute;
};

function quadMesh(max: number, material: THREE.ShaderMaterial): { mesh: THREE.Mesh; geo: THREE.InstancedBufferGeometry; buf: Buffers } {
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('corner', new THREE.BufferAttribute(new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), 2));
  // three.js wants a position attribute; the quad's corners do the work.
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12), 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  const attr = (n: number) => new THREE.InstancedBufferAttribute(new Float32Array(max * n), n).setUsage(THREE.DynamicDrawUsage);
  const buf: Buffers = { center: attr(3), size: attr(1), alpha: attr(1), tone: attr(1), spin: attr(1), variant: attr(1) };
  geo.setAttribute('iCenter', buf.center);
  geo.setAttribute('iSize', buf.size);
  geo.setAttribute('iAlpha', buf.alpha);
  geo.setAttribute('iTone', buf.tone);
  geo.setAttribute('iSpin', buf.spin);
  geo.setAttribute('iVariant', buf.variant);
  geo.instanceCount = 0;
  const mesh = new THREE.Mesh(geo, material);
  mesh.frustumCulled = false;
  return { mesh, geo, buf };
}

function markDirty(buf: Buffers, count: number): void {
  for (const a of Object.values(buf)) {
    a.clearUpdateRanges();
    a.addUpdateRange(0, count * a.itemSize);
    a.needsUpdate = true;
  }
}

export class SmokeField {
  readonly object = new THREE.Group();
  private readonly puffs: ReturnType<typeof quadMesh>;
  private readonly flames: ReturnType<typeof quadMesh>;
  private readonly texture: THREE.CanvasTexture;
  private readonly max: number;
  private readonly placement: FieldPlacement;
  private order = new Uint32Array(0);
  private keys = new Float32Array(0);
  private readonly tmp = new THREE.Vector3();

  constructor(placement: FieldPlacement, max = 6000) {
    this.placement = placement;
    this.max = max;
    this.texture = cloudAtlas();
    const defines = placement.billboard ? { BILLBOARD: '' } : {};
    // Both sides: on the map the Mercator y axis points south, which turns the quads around.
    const common = { vertexShader: VERTEX, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide, defines };
    this.puffs = quadMesh(max, new THREE.ShaderMaterial({ ...common, fragmentShader: PUFF_FRAGMENT, uniforms: { uMap: { value: this.texture } } }));
    this.flames = quadMesh(400, new THREE.ShaderMaterial({ ...common, fragmentShader: FLAME_FRAGMENT, blending: THREE.AdditiveBlending }));
    this.puffs.mesh.renderOrder = 5;
    this.flames.mesh.renderOrder = 6;
    this.object.add(this.puffs.mesh, this.flames.mesh);
    this.object.visible = false;
  }

  /**
   * Writes the puffs and flames of hour `t`. `now` (ms) only makes the flames flicker;
   * `worldPerPixel` keeps puffs and flames a few pixels wide when the view is far out.
   */
  update(sim: SmokeSim | null, t: number, now: number, worldPerPixel: number): void {
    this.object.visible = !!sim;
    if (!sim) return;
    const { place, kmToWorld } = this.placement;
    const life = sim.life;
    const tracks = sim.tracks;
    if (this.order.length < tracks.length) {
      this.order = new Uint32Array(tracks.length);
      this.keys = new Float32Array(tracks.length);
    }
    // The puffs alive now, oldest first so the fresh dark column stays on top.
    let n = 0;
    for (let i = 0; i < tracks.length; i++) {
      const age = t - tracks[i].te;
      if (age < 0 || age > life) continue;
      this.order[n] = i;
      this.keys[i] = -age;
      n++;
    }
    const alive = Array.from(this.order.subarray(0, n)).sort((a, b) => this.keys[a] - this.keys[b]);
    const p = this.puffs.buf;
    let k = 0;
    for (const i of alive) {
      if (k >= this.max) break;
      const tr = tracks[i];
      const age = t - tr.te;
      const f = age / STEP;
      const j = Math.floor(f);
      const la = tr.lat[j];
      const lb = tr.lat[Math.min(tr.lat.length - 1, j + 1)];
      if (!Number.isFinite(la) || !Number.isFinite(lb)) continue;
      const lat = la + (lb - la) * (f - j);
      const lon = tr.lon[j] + (tr.lon[Math.min(tr.lon.length - 1, j + 1)] - tr.lon[j]) * (f - j);
      const s = sim.strength(tr.power);
      // A kilometre or two over the fire, tens of km a day later.
      const km = (1.2 + 3.6 * Math.sqrt(age)) * (0.6 + 0.6 * s);
      const a = Math.min(1, age / 0.3) * Math.exp(-age / (life * 0.5)) * (0.45 + 0.55 * s) * 0.75;
      if (a < 0.01) continue;
      place(lat, lon, this.tmp);
      p.center.setXYZ(k, this.tmp.x, this.tmp.y, this.tmp.z);
      p.size.setX(k, Math.max(km * kmToWorld(lat), (3 + 4 * s) * worldPerPixel));
      p.alpha.setX(k, a);
      p.tone.setX(k, Math.min(1, (age / life) * 1.6));
      // Each puff turns slowly as it drifts, so the shapes do not look stamped.
      p.spin.setX(k, (tr.seed % 628) / 100 + age * 0.15);
      p.variant.setX(k, tr.seed % ATLAS);
      k++;
    }
    this.puffs.geo.instanceCount = k;
    markDirty(p, k);

    const fl = this.flames.buf;
    let m = 0;
    for (const src of sim.sources) {
      if (t < src.t0 || t > src.t1 + 0.5 || m >= 400) continue;
      const s = sim.strength(src.power);
      const flicker = 0.8 + 0.2 * Math.sin(now / 90 + src.lat * 50) * Math.sin(now / 53 + src.lon * 40);
      place(src.lat, src.lon, this.tmp);
      fl.center.setXYZ(m, this.tmp.x, this.tmp.y, this.tmp.z);
      fl.size.setX(m, Math.max((1.2 + 2.8 * s) * kmToWorld(src.lat), (3 + 5 * s) * worldPerPixel) * flicker);
      fl.alpha.setX(m, 0.9);
      fl.tone.setX(m, 0);
      fl.spin.setX(m, 0);
      fl.variant.setX(m, 0);
      m++;
    }
    this.flames.geo.instanceCount = m;
    markDirty(fl, m);
  }

  dispose(): void {
    for (const part of [this.puffs, this.flames]) {
      part.geo.dispose();
      (part.mesh.material as THREE.Material).dispose();
    }
    this.texture.dispose();
  }
}
