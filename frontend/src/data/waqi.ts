// Air quality from the World Air Quality Index project (waqi.info / aqicn.org): official
// monitoring stations worldwide, updated hourly, through their API. It needs a free token
// (https://aqicn.org/data-platform/token/), given as VITE_WAQI_TOKEN in frontend/.env.local and,
// for the published site, as the WAQI_TOKEN secret of the GitHub repository. Without it the site
// uses SaveEcoBot and Sensor.Community alone; with it, all three are shown together.

import { useEffect, useState } from 'react';
import type { AirStation } from './air';

export const WAQI_TOKEN = (import.meta.env.VITE_WAQI_TOKEN as string | undefined)?.trim() || null;
const API = 'https://api.waqi.info';

type BoundsItem = { lat: number; lon: number; uid: number; aqi: string; station: { name: string; time: string } };

async function bounds(s: number, w: number, n: number, e: number): Promise<BoundsItem[]> {
  const r = await fetch(`${API}/v2/map/bounds?latlng=${s},${w},${n},${e}&networks=all&token=${WAQI_TOKEN}`);
  const d = (await r.json()) as { status: string; data: BoundsItem[] | string };
  if (d.status !== 'ok' || !Array.isArray(d.data)) throw new Error(`waqi ${typeof d.data === 'string' ? d.data : d.status}`);
  return d.data;
}

const toStation = (x: BoundsItem): AirStation | null => {
  const aqi = Number(x.aqi);
  if (!Number.isFinite(aqi)) return null;
  const at = Date.parse(x.station.time);
  if (Number.isFinite(at) && Date.now() - at > 24 * 3600_000) return null;
  return { lat: x.lat, lon: x.lon, aqi, pm25: null, pm10: null, source: 'waqi', uid: x.uid, name: x.station.name, time: x.station.time };
};

/**
 * Stations of the whole world, checked again every ten minutes while `enabled`; null when there is
 * no token. The world is asked for in four parts so dense regions are not cut short.
 */
export function useWaqi(enabled: boolean): { stations: AirStation[] | null; error: boolean } {
  const [state, setState] = useState<{ stations: AirStation[] | null; error: boolean }>({ stations: null, error: false });
  useEffect(() => {
    if (!enabled || !WAQI_TOKEN) return;
    let cancelled = false;
    const load = () =>
      Promise.all([bounds(-60, -180, 15, 0), bounds(15, -180, 85, 0), bounds(-60, 0, 15, 180), bounds(15, 0, 85, 180)])
        .then((parts) => {
          if (cancelled) return;
          const byUid = new Map<number, AirStation>();
          for (const x of parts.flat()) {
            const st = toStation(x);
            if (st) byUid.set(x.uid, st);
          }
          setState({ stations: [...byUid.values()], error: false });
        })
        .catch(() => !cancelled && setState((s) => ({ stations: s.stations, error: true })));
    void load();
    const id = window.setInterval(load, 10 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [enabled]);
  return state;
}

export type WaqiFeed = {
  aqi: number;
  dominant: string | null;
  /** Sub-indices (AQI) per pollutant, and weather (t °C, h %, w m/s). */
  iaqi: Record<string, number>;
  time: string;
  city: string;
  url: string | null;
  attributions: { name: string; url: string }[];
};

const feeds = new Map<number, Promise<WaqiFeed | null>>();

/** A station's details: what each pollutant contributes, the measuring network, the hour. */
export function waqiFeed(uid: number): Promise<WaqiFeed | null> {
  let p = feeds.get(uid);
  if (!p) {
    p = fetch(`${API}/feed/@${uid}/?token=${WAQI_TOKEN}`)
      .then((r) => r.json())
      .then((d: { status: string; data: { aqi: number | string; dominentpol?: string; iaqi?: Record<string, { v: number }>; time?: { iso?: string; s?: string }; city?: { name?: string; url?: string }; attributions?: { name: string; url: string }[] } }) => {
        if (d.status !== 'ok') return null;
        const x = d.data;
        const iaqi: Record<string, number> = {};
        for (const [k, v] of Object.entries(x.iaqi ?? {})) if (Number.isFinite(v?.v)) iaqi[k] = v.v;
        return {
          aqi: Number(x.aqi),
          dominant: x.dominentpol || null,
          iaqi,
          time: x.time?.iso ?? x.time?.s ?? '',
          city: x.city?.name ?? '',
          url: x.city?.url ?? null,
          attributions: x.attributions ?? [],
        };
      })
      .catch(() => null);
    feeds.set(uid, p);
  }
  return p;
}
