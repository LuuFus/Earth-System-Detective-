import { useEffect, useState } from 'react';
import { POWER_START, powerPointMonthly } from '../analysis/series';

/** Values under the pointer for one month, from NASA POWER (MERRA-2). */
export type PointClimate = {
  /** °C */
  temp: number | null;
  /** % */
  humidity: number | null;
  /** mm in the month */
  precip: number | null;
  /** m/s at 10 m */
  wind: number | null;
  year: number;
  month: number;
  /** The year asked for was outside 1981-2025, so the nearest one is shown. */
  clamped: boolean;
};

const PARAMS = ['T2M', 'RH2M', 'PRECTOTCORR', 'WS10M'];
const LAST_YEAR = 2025;
/** The MERRA-2 grid is 0.5° × 0.625°: points closer than half a degree share their numbers. */
const STEP = 0.5;
/** Wait for the pointer to rest before asking NASA POWER. */
const REST_MS = 450;

type Record = { [p: string]: Map<string, number> };
const cache = new Map<string, Promise<Record>>();

function cellKey(lat: number, lon: number) {
  return `${(Math.round(lat / STEP) * STEP).toFixed(1)},${(Math.round(lon / STEP) * STEP).toFixed(1)}`;
}

function load(key: string): Promise<Record> {
  let p = cache.get(key);
  if (!p) {
    const [lat, lon] = key.split(',').map(Number);
    p = powerPointMonthly(PARAMS, lat, lon);
    cache.set(key, p);
    p.catch(() => cache.delete(key));
  }
  return p;
}

/**
 * Temperature, humidity, precipitation and wind at the pointer for the year and month on the
 * timeline. One request per half-degree cell covers every month since 1981, so moving the
 * timeline afterwards needs no new request.
 */
export function usePointClimate(point: { lat: number; lon: number } | null, year: number, month: number) {
  const key = point ? cellKey(point.lat, point.lon) : null;
  const [state, setState] = useState<{ key: string | null; status: 'idle' | 'loading' | 'ready' | 'error'; data: Record | null }>({
    key: null,
    status: 'idle',
    data: null,
  });

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    setState((s) => (s.key === key ? s : { key, status: 'loading', data: null }));
    const timer = window.setTimeout(() => {
      load(key)
        .then((data) => !cancelled && setState({ key, status: 'ready', data }))
        .catch(() => !cancelled && setState({ key, status: 'error', data: null }));
    }, cache.has(key) ? 0 : REST_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [key]);

  if (!key || state.key !== key) return { status: key ? ('loading' as const) : ('idle' as const), values: null };
  if (state.status !== 'ready' || !state.data) return { status: state.status, values: null };
  const y = Math.min(LAST_YEAR, Math.max(POWER_START, year));
  const k = `${y}${String(month).padStart(2, '0')}`;
  const get = (p: string) => state.data![p]?.get(k) ?? null;
  const daily = get('PRECTOTCORR');
  const days = new Date(Date.UTC(y, month, 0)).getUTCDate();
  const values: PointClimate = {
    temp: get('T2M'),
    humidity: get('RH2M'),
    precip: daily === null ? null : daily * days,
    wind: get('WS10M'),
    year: y,
    month,
    clamped: y !== year,
  };
  return { status: 'ready' as const, values };
}
