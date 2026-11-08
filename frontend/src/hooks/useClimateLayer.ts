import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GlobeOverlay } from '../components/Globe';
import {
  areaMean,
  differenceField,
  fieldToRGBA,
  loadGistemp,
  senMannKendall,
  yearField,
  type Field,
  type Gistemp,
} from '../data/gistemp';
import type { TrendResult } from '../workers/trend.worker';

export type ClimateMode = 'year' | 'compare' | 'trend';

/** Colour range: the ramp saturates at plus or minus this value. */
export const RANGE: Record<ClimateMode, number> = { year: 4, compare: 4, trend: 0.8 };
export const SIGNIFICANCE = 0.05;

export type ClimateState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  computing: boolean;
  data: Gistemp | null;
  field: Field | null;
  overlay: GlobeOverlay | null;
  /** Global summary for the legend: anomaly, difference or trend with its p-value. */
  global: { value: number; p?: number } | null;
  retry: () => void;
};

export function useClimateLayer(enabled: boolean, mode: ClimateMode, year: number, from: number, to: number): ClimateState {
  const [status, setStatus] = useState<ClimateState['status']>('idle');
  const [data, setData] = useState<Gistemp | null>(null);
  const [field, setField] = useState<Field | null>(null);
  const [computing, setComputing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!enabled || data) return;
    let cancelled = false;
    setStatus('loading');
    loadGistemp()
      .then((g) => {
        if (cancelled) return;
        setData(g);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [enabled, data, attempt]);

  useEffect(() => () => workerRef.current?.terminate(), []);

  // Year and difference are instant; the trend runs in a worker after the sliders settle.
  useEffect(() => {
    if (!enabled || !data) return;
    if (mode === 'year') {
      setField(yearField(data, year));
      setComputing(false);
      return;
    }
    if (mode === 'compare') {
      setField(differenceField(data, from, to));
      setComputing(false);
      return;
    }
    const id = ++requestRef.current;
    setComputing(true);
    const timer = window.setTimeout(() => {
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL('../workers/trend.worker.ts', import.meta.url), { type: 'module' });
      }
      const worker = workerRef.current;
      worker.onmessage = (event: MessageEvent<TrendResult>) => {
        const result = event.data;
        if (result.id !== requestRef.current) return;
        const significant = new Uint8Array(result.pValue.length);
        for (let i = 0; i < significant.length; i++) significant[i] = result.pValue[i] < SIGNIFICANCE ? 1 : 0;
        setField({ values: result.slope, pValues: result.pValue, significant });
        setComputing(false);
      };
      const { meta } = data;
      worker.postMessage({
        id,
        data: data.data,
        cells: meta.nlat * meta.nlon,
        startYear: meta.startYear,
        from,
        to,
        scale: meta.scale,
        missing: meta.missing,
      });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [enabled, data, mode, year, from, to]);

  const overlay = useMemo<GlobeOverlay | null>(() => {
    if (!enabled || !data || !field) return null;
    const { meta } = data;
    return { rgba: fieldToRGBA(meta, field, RANGE[mode]), width: meta.nlon, height: meta.nlat, key: `${mode}:${year}:${from}:${to}` };
    // The field already reflects mode and years; recolour only when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, data, field]);

  const global = useMemo(() => {
    if (!data || !field) return null;
    const { meta } = data;
    const g = meta.globalMean;
    const at = (y: number) => g[y - meta.startYear];
    if (mode === 'year') {
      const v = at(year);
      return v == null ? null : { value: v };
    }
    if (mode === 'compare') {
      const a = at(from);
      const b = at(to);
      return a == null || b == null ? null : { value: b - a };
    }
    const xs: number[] = [];
    const ys: number[] = [];
    for (let y = from; y <= to; y++) {
      const v = at(y);
      if (v != null) {
        xs.push(y);
        ys.push(v);
      }
    }
    if (xs.length < 10) return { value: areaMean(meta, field.values) };
    const { slope, p } = senMannKendall(xs, ys);
    return { value: slope, p };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, field]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  return { status, computing, data, field: enabled ? field : null, overlay, global, retry };
}
