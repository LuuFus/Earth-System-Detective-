// Ukraine war layer: hromadas by their status in the official Ukrainian list (Order No. 376
// of the Ministry for Development of Communities and Territories), built by
// data-pipeline/build_occupation.py. Boundaries © OpenStreetMap contributors (ODbL).

export type WarData = {
  source: string;
  sourceEn: string;
  url: string;
  edition: string;
  built: string;
  boundaries: string;
  counts: {
    settlementsListed: number;
    settlementsOccupied: number;
    settlementsActive: number;
    hromadasOccupied: number;
    hromadasPartly: number;
    hromadasCombat: number;
  };
  /** Each feature is a list of rings; a ring is a flat [lon, lat, lon, lat, ...] array. */
  occupied: number[][][];
  partly: number[][][];
  combat: number[][][];
};

type Box = { w: number; s: number; e: number; n: number };

/** Box the canvas covers: all of Ukraine with a margin. */
export const WAR_BOX: Box = { w: 21.5, s: 44, e: 41, n: 53 };

let cache: Promise<WarData> | null = null;

export function loadWar(): Promise<WarData> {
  if (!cache) {
    cache = fetch(`${import.meta.env.BASE_URL}data/ukraine/war.json`).then((r) => {
      if (!r.ok) throw new Error(`war.json ${r.status}`);
      return r.json() as Promise<WarData>;
    });
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

function token(name: string, fallback: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Paints the layer into an equirectangular canvas over `box` (all of Ukraine by default). The
 * globe calls it again for the visible area when you zoom in, so lines stay one pixel thin.
 * Pixels are about square on the ground (longitude is scaled by the cosine of the latitude).
 */
export function drawWar(data: WarData, box: Box = WAR_BOX, maxWidth = 4096): HTMLCanvasElement {
  const { w, s, e, n } = box;
  const lonScale = Math.cos((((s + n) / 2) * Math.PI) / 180);
  let width = maxWidth;
  let height = Math.round((width * (n - s)) / ((e - w) * lonScale));
  if (height > 4096) {
    width = Math.round((width * 4096) / height);
    height = 4096;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const occupied = token('--color-occupied', '#e0533f');
  const combat = token('--color-combat', '#f39a3e');

  const trace = (c: CanvasRenderingContext2D, rings: number[][]) => {
    c.beginPath();
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i += 2) {
        const x = ((ring[i] - w) / (e - w)) * width;
        const y = ((n - ring[i + 1]) / (n - s)) * height;
        if (i === 0) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.closePath();
    }
  };

  // Hatching for partly occupied hromadas, in the same red.
  const tile = document.createElement('canvas');
  tile.width = tile.height = 16;
  const t = tile.getContext('2d')!;
  t.strokeStyle = occupied;
  t.lineWidth = 3;
  t.beginPath();
  t.moveTo(-4, 20);
  t.lineTo(20, -4);
  t.moveTo(-4, 4);
  t.lineTo(4, -4);
  t.moveTo(12, 20);
  t.lineTo(20, 12);
  t.stroke();
  const hatch = ctx.createPattern(tile, 'repeat')!;

  // Each class is filled opaque on a scratch canvas and then laid on with its opacity, so
  // boundaries that overlap (Crimea's old and new raions, shared hromada edges) do not darken.
  const scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;
  const sc = scratch.getContext('2d')!;
  const lay = (features: number[][][], fill: string | CanvasPattern, alpha: number) => {
    sc.clearRect(0, 0, width, height);
    sc.fillStyle = fill;
    for (const f of features) {
      trace(sc, f);
      sc.fill('evenodd');
    }
    ctx.globalAlpha = alpha;
    ctx.drawImage(scratch, 0, 0);
  };
  lay(data.combat, combat, 0.42);
  lay(data.partly, hatch, 0.75);
  lay(data.occupied, occupied, 0.55);

  // A thin outline keeps neighbouring hromadas readable when zoomed in.
  ctx.globalAlpha = 0.9;
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = occupied;
  for (const f of [...data.occupied, ...data.partly]) {
    trace(ctx, f);
    ctx.stroke();
  }
  ctx.strokeStyle = combat;
  for (const f of data.combat) {
    trace(ctx, f);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  return canvas;
}
