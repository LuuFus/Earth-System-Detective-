// The smoke puffs on the 2D map: a MapLibre custom layer that draws the same SmokeField as the
// globe, with Three.js on the map's own WebGL context. Places are Web Mercator coordinates
// (0..1), kept relative to the scene's middle so the numbers stay precise close up.

import type { CustomLayerInterface, CustomRenderMethodInput, Map as MlMap } from 'maplibre-gl';
import * as THREE from 'three';
import type { SmokeLayer } from '../globe/smoke';
import { SmokeField } from '../globe/smokeField';

const EARTH_CIRCUMFERENCE = 40_075_016.686; // metres at the equator
const mercX = (lon: number) => (lon + 180) / 360;
const mercY = (lat: number) => {
  const s = Math.sin((Math.max(-85.05, Math.min(85.05, lat)) * Math.PI) / 180);
  return 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI);
};

export class SmokeMapLayer implements CustomLayerInterface {
  readonly id = 'smoke-gl';
  readonly type = 'custom' as const;
  readonly renderingMode = '2d' as const;
  private map: MlMap | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.Camera();
  private readonly field: SmokeField;
  private readonly matrix = new THREE.Matrix4();
  private readonly shift = new THREE.Matrix4();
  private origin = { x: 0.5, y: 0.5 };
  private source: SmokeLayer | null = null;

  constructor() {
    this.field = new SmokeField({
      billboard: false,
      place: (lat, lon, out) => out.set(mercX(lon) - this.origin.x, mercY(lat) - this.origin.y, 0),
      kmToWorld: (lat) => 1000 / (EARTH_CIRCUMFERENCE * Math.max(0.05, Math.cos((lat * Math.PI) / 180))),
    });
    this.scene.add(this.field.object);
  }

  /** The scene to draw (its puffs' paths and clock), centred near `lat`, `lon`; null hides it. */
  show(source: SmokeLayer | null, lat = 0, lon = 0): void {
    this.source = source;
    this.origin = { x: mercX(lon), y: mercY(lat) };
    if (!source) this.field.update(null, 0, 0, 1);
    this.map?.triggerRepaint();
  }

  onAdd(map: MlMap, gl: WebGLRenderingContext | WebGL2RenderingContext): void {
    this.map = map;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl, antialias: true });
    this.renderer.autoClear = false;
  }

  onRemove(): void {
    this.field.dispose();
    this.renderer?.dispose();
    this.renderer = null;
    this.map = null;
  }

  render(_gl: WebGLRenderingContext | WebGL2RenderingContext, args: CustomRenderMethodInput): void {
    const map = this.map;
    const renderer = this.renderer;
    if (!map || !renderer || !this.source?.active) return;
    // Mercator units per screen pixel: the world is 512 px wide at zoom 0.
    const perPixel = 1 / (512 * 2 ** map.getZoom());
    this.field.update(this.source.sim, this.source.time, performance.now(), perPixel);
    this.matrix.fromArray(args.defaultProjectionData.mainMatrix as unknown as number[]);
    this.shift.makeTranslation(this.origin.x, this.origin.y, 0);
    this.camera.projectionMatrix.copy(this.matrix).multiply(this.shift);
    renderer.resetState();
    renderer.render(this.scene, this.camera);
    // The flames flicker and the clock runs: keep drawing while a scene is shown.
    map.triggerRepaint();
  }
}
