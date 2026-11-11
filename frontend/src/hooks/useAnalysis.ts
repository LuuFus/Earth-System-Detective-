import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadSeries, OutsideCoverage, type Region, type Season, type Series } from '../analysis/series';
import { trendStats, type TrendStats } from '../analysis/stats';
import { variableById, type Text, type VariableId } from '../data/variables';

export type RegionResult = {
  slot: 'A' | 'B';
  region: Region;
  series: Series | null;
  stats: TrendStats | null;
};

export type AnalysisState = {
  status: 'idle' | 'loading' | 'ready' | 'error';
  results: RegionResult[];
  /** Where the numbers exist, when a region is outside them. */
  coverage: Text | null;
  retry: () => void;
};

/** Loads the yearly series for regions A and B and computes the trend over the period. */
export function useAnalysis(
  variableId: VariableId,
  regionA: Region | null,
  regionB: Region | null,
  season: Season,
  from: number,
  to: number,
): AnalysisState {
  const [loaded, setLoaded] = useState<{ key: string; a: Series | null; b: Series | null } | null>(null);
  const [status, setStatus] = useState<AnalysisState['status']>('idle');
  const [attempt, setAttempt] = useState(0);
  const [coverage, setCoverage] = useState<Text | null>(null);
  const variable = variableById[variableId];

  const key = JSON.stringify([variableId, regionA, regionB, season, attempt]);
  useEffect(() => {
    if (!regionA || !variable.series) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    setCoverage(null);
    Promise.all([loadSeries(variable, regionA, season), regionB ? loadSeries(variable, regionB, season) : Promise.resolve(null)])
      .then(([a, b]) => {
        if (cancelled) return;
        setLoaded({ key, a, b });
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
    const make = (slot: 'A' | 'B', region: Region, series: Series | null): RegionResult => ({
      slot,
      region,
      series,
      stats: series ? trendStats(series.points.filter((p) => p.x >= from && p.x <= to)) : null,
    });
    const out = [make('A', regionA, fresh ? loaded!.a : null)];
    if (regionB) out.push(make('B', regionB, fresh ? loaded!.b : null));
    return out;
  }, [loaded, key, regionA, regionB, from, to]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status, results, coverage, retry };
}
