import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  loadDaily,
  loadSeries,
  monthlyFromDaily,
  monthlyPoints,
  OutsideCoverage,
  type DailySeries,
  type Region,
  type Season,
  type Series,
  type TimePoint,
} from '../analysis/series';
import { seasonalTrendStats, trendStats, type Point, type TrendStats } from '../analysis/stats';
import { variableById, type Text, type VariableId } from '../data/variables';
import type { ChartView } from '../state/explore';

export type RegionResult = {
  slot: 'A' | 'B';
  region: Region;
  series: Series | null;
  daily: DailySeries | null;
  /** What the chart draws for the chosen view, inside the period. */
  points: Point[];
  /** The trend test for the chosen view: yearly values, or the seasonal test on months. */
  stats: TrendStats | null;
  /** Monthly values the seasonal test used (month and day views), for the explanation. */
  tested: TimePoint[] | null;
};

export type AnalysisState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  results: RegionResult[];
  /** Where the numbers exist, when a region is outside them. */
  coverage: Text | null;
  retry: () => void;
};

type Loaded = { key: string; a: Series | null; b: Series | null; da: DailySeries | null; db: DailySeries | null };

/** Loads the series for regions A and B and computes the trend over the period for the chosen view. */
export function useAnalysis(
  variableId: VariableId,
  regionA: Region | null,
  regionB: Region | null,
  season: Season,
  from: number,
  to: number,
  view: ChartView,
): AnalysisState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [status, setStatus] = useState<AnalysisState['status']>('idle');
  const [attempt, setAttempt] = useState(0);
  const [coverage, setCoverage] = useState<Text | null>(null);
  const variable = variableById[variableId];
  const daily = view === 'day' && variable.series?.kind === 'power';

  // Daily values depend on the period (they are fetched for it); the rest is cut to it later.
  const key = JSON.stringify([variableId, regionA, regionB, season, attempt, daily ? [from, to] : null]);
  useEffect(() => {
    if (!regionA || !variable.series) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setCoverage(null);
    const day = (r: Region | null) => (daily && r ? loadDaily(variable, r, from, to) : Promise.resolve(null));
    Promise.all([loadSeries(variable, regionA, season), regionB ? loadSeries(variable, regionB, season) : Promise.resolve(null), day(regionA), day(regionB)])
      .then(([a, b, da, db]) => {
        if (cancelled) return;
        setLoaded({ key, a, b, da, db });
        setStatus('ready');
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        if (e instanceof OutsideCoverage) setCoverage(e.coverage);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // `key` covers every input that changes the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const results = useMemo<RegionResult[]>(() => {
    if (!regionA) return [];
    const fresh = loaded?.key === key;
    const inPeriod = <T extends Point>(pts: T[]) => pts.filter((p) => p.x >= from && p.x < to + 1);
    const make = (slot: 'A' | 'B', region: Region, series: Series | null, day: DailySeries | null): RegionResult => {
      if (!series) return { slot, region, series, daily: day, points: [], stats: null, tested: null };
      if (view === 'day' && day) {
        const points = inPeriod(day.points);
        const tested = monthlyFromDaily(points);
        return { slot, region, series, daily: day, points, stats: seasonalTrendStats(tested), tested };
      }
      if (view === 'month' && series.monthly) {
        const tested = inPeriod(monthlyPoints(series.monthly)).filter((p) => Number.isFinite(p.y));
        return { slot, region, series, daily: day, points: tested, stats: seasonalTrendStats(tested), tested };
      }
      const points = series.points.filter((p) => p.x >= from && p.x <= to);
      return { slot, region, series, daily: day, points, stats: trendStats(points), tested: null };
    };
    const out = [make('A', regionA, fresh ? loaded!.a : null, fresh ? loaded!.da : null)];
    if (regionB) out.push(make('B', regionB, fresh ? loaded!.b : null, fresh ? loaded!.db : null));
    return out;
  }, [loaded, key, regionA, regionB, from, to, view]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status, results, coverage, retry };
}
