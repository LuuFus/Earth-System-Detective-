// Point layers on the globe: fires (now, and the day-by-day stories) and measuring stations.
//
// Fires are coloured by age in the shader, so a story plays by moving one number (uNow): a
// detection flashes white-hot on its day, cools through orange and red embers over a few days,
// and stays as a dark burn scar, so the burnt area builds up while the front moves on.

import * as THREE from 'three';

export type PointMode = 'live' | 'story' | 'dots';

/** Points for the globe. `time`: hours (story: since its start; live: minus the age). */
export type GlobePoints = {
  key: string;
  mode: PointMode;
  lat: ArrayLike<number>;
  lon: ArrayLike<number>;
  time?: ArrayLike<number>;
  /** Fire power in MW (fires) or a size in pixels (dots). */
  size?: ArrayLike<number>;
  /** Dots: one colour per point, 0xRRGGBB. */
  color?: ArrayLike<number>;
};

const vertex = /* glsl */ `
  attribute float aTime;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uNow;
  uniform float uMode; // 0 dots, 1 live fires, 2 story fires
  uniform float uHorizon;
  uniform float uPixel; // device pixel ratio
  uniform float uZoom; // grows the points when the camera is close
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // Only the near side of the globe: the layer draws without a depth test.
    float facing = dot(normalize(position), normalize(cameraPosition));
    vRing = 0.0;
    vAlpha = 1.0;
    if (facing < uHorizon + 0.01) {
      gl_PointSize = 0.0;
      return;
    }
    if (uMode < 0.5) {
      vColor = aColor;
      vRing = 1.0;
      gl_PointSize = aSize * uPixel * uZoom;
      return;
    }
    float power = 2.4 + 1.6 * log2(1.0 + aSize / 8.0);
    vec3 hot = vec3(1.0, 0.96, 0.72);
    vec3 orange = vec3(1.0, 0.6, 0.12);
    vec3 red = vec3(0.9, 0.18, 0.1);
    vec3 scar = vec3(0.36, 0.1, 0.06);
    float age = uNow - aTime;
    if (age < 0.0) {
      gl_PointSize = 0.0;
      return;
    }
    float size = power;
    if (uMode < 1.5) {
      // Fires now: the last 48 hours, the newest brightest.
      float t = clamp(age / 48.0, 0.0, 1.0);
      vColor = t < 0.12 ? mix(hot, orange, t / 0.12) : mix(orange, red, (t - 0.12) / 0.88);
      size *= 1.0 - 0.35 * t;
    } else {
      // Stories: a flash on the day, embers for a few days, then a scar that stays.
      if (age < 12.0) {
        vColor = mix(hot, orange, age / 12.0);
        size *= 1.7 - 0.5 * age / 12.0;
      } else if (age < 48.0) {
        vColor = mix(orange, red, (age - 12.0) / 36.0);
        size *= 1.2 - 0.3 * (age - 12.0) / 36.0;
      } else {
        float k = clamp((age - 48.0) / 96.0, 0.0, 1.0);
        vColor = mix(red, scar, k);
        size *= 0.9 - 0.2 * k;
        vAlpha = 1.0 - 0.35 * k;
      }
    }
    gl_PointSize = size * uPixel * uZoom;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vRing;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;
    vec3 col = vColor;
    float a = vAlpha;
    if (vRing > 0.5) {
      // Station dots: a coloured disc with a dark ring, legible on any imagery.
      float edge = smoothstep(0.62, 0.72, r);
      col = mix(vColor, vec3(0.03, 0.04, 0.06), edge);
      a *= 1.0 - smoothstep(0.9, 1.0, r);
    } else {
      // Fires: a bright core with a soft rim.
      col = mix(vColor * 1.15, vColor * 0.7, smoothstep(0.0, 1.0, r));
      a *= 1.0 - smoothstep(0.55, 1.0, r);
    }
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

function toXYZ(lat: number, lon: number, radius: number, out: Float32Array, i: number) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  out[i] = Math.cos(la) * Math.cos(lo) * radius;
  out[i + 1] = Math.sin(la) * radius;
  out[i + 2] = -Math.cos(la) * Math.sin(lo) * radius;
}

export class PointsLayer {
  readonly object: THREE.Points;
  readonly uniforms = {
    uNow: { value: 0 },
    uMode: { value: 0 },
    uHorizon: { value: 0.3 },
    uPixel: { value: 1 },
    uZoom: { value: 1 },
  };
  key = '';

  constructor(renderOrder: number) {
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.object = new THREE.Points(new THREE.BufferGeometry(), material);
    this.object.renderOrder = renderOrder;
    this.object.frustumCulled = false;
    this.object.visible = false;
  }

  set(points: GlobePoints | null): void {
    if (!points) {
      this.object.visible = false;
      this.key = '';
      return;
    }
    this.object.visible = true;
    if (points.key === this.key) return;
    this.key = points.key;
    const n = points.lat.length;
    const pos = new Float32Array(n * 3);
    const time = new Float32Array(n);
    const size = new Float32Array(n);
    const color = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      toXYZ(points.lat[i], points.lon[i], 1.0006, pos, i * 3);
      time[i] = points.time?.[i] ?? 0;
      size[i] = points.size?.[i] ?? (points.mode === 'dots' ? 10 : 10);
      const c = points.color?.[i] ?? 0xffffff;
      color[i * 3] = ((c >> 16) & 255) / 255;
      color[i * 3 + 1] = ((c >> 8) & 255) / 255;
      color[i * 3 + 2] = (c & 255) / 255;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('aTime', new THREE.BufferAttribute(time, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    this.object.geometry.dispose();
    this.object.geometry = geometry;
    this.uniforms.uMode.value = points.mode === 'dots' ? 0 : points.mode === 'live' ? 1 : 2;
  }

  /** Per frame: horizon for the camera distance, and a little growth up close. */
  update(distance: number, pixelRatio: number): void {
    this.uniforms.uHorizon.value = 1 / distance;
    this.uniforms.uPixel.value = pixelRatio;
    this.uniforms.uZoom.value = THREE.MathUtils.clamp(1 + (2.2 - distance) * 0.45, 0.8, 1.5);
  }

  dispose(): void {
    this.object.geometry.dispose();
    (this.object.material as THREE.Material).dispose();
  }
}
