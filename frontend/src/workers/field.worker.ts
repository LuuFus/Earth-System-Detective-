// Paints forecast fields off the main thread, so the map and the globe keep moving while a new
// frame is drawn. Called through Comlink from src/data/fieldPainter.ts.

import * as Comlink from 'comlink';
import { fieldPixels, GridFrame, type FieldKind, type FieldView, type Grid, type GridVar } from '../data/field';

export type FramePayload = { bytes: Uint8Array; time: string; grid: Grid; vars: GridVar[] };

const api = {
  paint(frame: FramePayload, kind: FieldKind, view: FieldView): ImageBitmap {
    const f = new GridFrame(frame.bytes, frame.time, frame.grid, frame.vars);
    const canvas = new OffscreenCanvas(view.width, view.height);
    canvas.getContext('2d')!.putImageData(new ImageData(fieldPixels(f, kind, view), view.width, view.height), 0, 0);
    const bitmap = canvas.transferToImageBitmap();
    return Comlink.transfer(bitmap, [bitmap]);
  },
};

export type FieldWorker = typeof api;

Comlink.expose(api);
