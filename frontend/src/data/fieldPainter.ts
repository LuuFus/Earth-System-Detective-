// Forecast fields painted in a Web Worker (src/workers/field.worker.ts): a frame takes up to
// 150 ms to paint, which would stall the map's animation on the main thread. Browsers without
// OffscreenCanvas in workers paint here instead.

import * as Comlink from 'comlink';
import type { FieldWorker } from '../workers/field.worker';
import type { FieldKind, FieldView, GridFrame } from './field';
import { paintView } from './live';

let remote: Comlink.Remote<FieldWorker> | null | undefined;

function worker(): Comlink.Remote<FieldWorker> | null {
  if (remote === undefined) {
    remote =
      typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined'
        ? Comlink.wrap<FieldWorker>(new Worker(new URL('../workers/field.worker.ts', import.meta.url), { type: 'module' }))
        : null;
  }
  return remote;
}

/** The field as a picture: an ImageBitmap from the worker, or a canvas painted here. */
export async function paintFieldAsync(frame: GridFrame, kind: FieldKind, view: FieldView): Promise<ImageBitmap | HTMLCanvasElement> {
  const w = worker();
  if (w) {
    try {
      // A copy of the bytes travels to the worker; the frame keeps its own for the wind lines.
      return await w.paint({ bytes: frame.bytes.slice(), time: frame.time.toISOString(), grid: frame.grid, vars: frame.vars }, kind, view);
    } catch {
      remote = null;
    }
  }
  return paintView(frame, kind, view);
}
