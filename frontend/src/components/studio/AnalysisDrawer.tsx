import { useEffect, useMemo, useRef, useState } from 'react';
import type { Region, Season } from '../../analysis/series';
import { hasSeasons, regionBox, regionCentre, resolutionsFor } from '../../analysis/series';
import { trendStats, verdict, yearsStillNeeded, type TrendStats } from '../../analysis/stats';
import type { Case } from '../../data/cases';
import { aliasOptions, countryIndex, findCountry } from '../../data/countryNames';
import { countryAt, countryName, loadCountries, type GeoCountry } from '../../data/geo';
import { variableById, variables, type VariableId } from '../../data/variables';
import type { AnalysisState, RegionResult } from '../../hooks/useAnalysis';
import { useI18n } from '../../i18n/I18n';
import { digitsFor, formatP, numberFormat, regionName } from '../../i18n/format';
import { useStudio } from '../../i18n/useStudio';
import type { ChartView, PickMode, Slot } from '../../state/explore';
import { Chart, type ChartHandle, type ChartMark } from '../Chart';
import { SeasonChart } from '../SeasonChart';
import { Icon } from './Icon';
import { Methods } from './Methods';

type Props = {
  chartVariable: VariableId;
  regionA: Region | null;
  regionB: Region | null;
  picking: Slot | null;
  pickMode: PickMode;
  radiusKm: number;
  season: Season;
  from: number;
  to: number;
  chartView: ChartView;
  activeCase: Case | null;
  analysis: AnalysisState;
  /** Event marks for this variable and these regions. */
  marks: ChartMark[];
  /** Year the globe shows; clicking a value on the chart moves the globe there. */
  mapYear: number | null;
  /** The globe click hit the sea while picking a country. */
  missedCountry: boolean;
  onPickYear: (year: number, month?: number) => void;
  onClose: () => void;
  onChartVariable: (id: VariableId) => void;
  onPick: (slot: Slot | null) => void;
  onPickMode: (mode: PickMode) => void;
  onCountry: (slot: Slot, country: GeoCountry) => void;
  onRemoveB: () => void;
  onRadius: (km: number) => void;
  onSeason: (season: Season) => void;
  onChartView: (view: ChartView) => void;
};

const RADII = [0, 250, 500, 1000];
/** Years the trend is carried on after the period. */
const AHEAD = 10;
const SEASONS: Season[] = ['year', 'djf', 'mam', 'jja', 'son'];
const MIN_W = 340;

function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** The right-hand drawer: chart, significance light, plain-language reading, and how it is computed. */
export function AnalysisDrawer(p: Props) {
  const { lang } = useI18n();
  const s = useStudio();
  const a = s.analysis;
  const chartRef = useRef<ChartHandle>(null);
  const [tab, setTab] = useState<'result' | 'methods'>('result');
  const [seasonSlot, setSeasonSlot] = useState<'A' | 'B'>('A');
  const [width, setWidth] = useState<number | null>(null);
  const [geo, setGeo] = useState<GeoCountry[]>([]);
  const variable = variableById[p.chartVariable];
  const numeric = variables.filter((v) => v.series);
  const view = p.chartView;
  const decade = lang === 'uk' ? 'за 10 років' : 'per decade';

  useEffect(() => {
    loadCountries()
      .then((m) => setGeo([...m.values()]))
      .catch(() => setGeo([]));
  }, []);
  // Countries by any name people type: "США", "Америка", "UK", the official name, the code.
  const countryList = useMemo(() => countryIndex(geo, (c) => c.code, lang, (c) => [c.uk, c.en]), [geo, lang]);
  const aliasList = useMemo(() => aliasOptions(countryList, lang), [countryList, lang]);

  const results = p.analysis.results;
  const first = results.find((r) => r.series);
  // Units follow the view: monthly totals per month, daily values per day.
  const unit =
    view === 'day' ? (first?.daily?.unit?.[lang] ?? variable.unit[lang]) : view === 'month' ? (first?.series?.monthUnit?.[lang] ?? variable.unit[lang]) : variable.unit[lang];
  const perDecade = unit === variable.unit[lang] ? variable.trendUnit[lang] : `${unit} ${decade}`;

  const values = results.flatMap((r) => r.points.map((q) => q.y)).filter(Number.isFinite);
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  const spread = values.length ? hi - lo : 1;
  const valueDigits = spread >= 40 ? 0 : spread >= 4 ? 1 : 2;
  const fmtValue = numberFormat(lang, valueDigits, false);
  // One precision for every rate on screen, set by the largest one.
  const largestRate = Math.max(0, ...results.map((r) => (r.stats ? Math.abs(r.stats.sen * 10) : 0)));
  const fmtRate = numberFormat(lang, Math.min(3, Math.max(1, digitsFor(largestRate || 0.1))));

  // The yearly tiles always use the yearly values.
  const annual = useMemo<RegionResult[]>(
    () =>
      results.map((r) => {
        const pts = r.series?.points.filter((q) => q.x >= p.from && q.x <= p.to) ?? [];
        return { ...r, points: pts, stats: r.series ? trendStats(pts) : null };
      }),
    [results, p.from, p.to],
  );

  const withMonths = results.filter((r) => r.series?.monthly?.length);
  const cycle = view === 'cycle' && withMonths.length > 0;
  const seasonResult = withMonths.find((r) => r.slot === seasonSlot) ?? withMonths[0];
  const monthUnit = seasonResult?.series?.monthUnit?.[lang] ?? variable.unit[lang];
  const anyWeak = results.some((r) => r.stats && verdict(r.stats) !== 'significant');
  const views: ChartView[] = [...resolutionsFor(variable), ...(withMonths.length || resolutionsFor(variable).includes('month') ? (['cycle'] as const) : [])];

  const title = cycle && seasonResult ? `${variable.name[lang]}, ${regionName(seasonResult.region, lang)}, ${a.views.cycle.toLowerCase()} ${p.from}-${p.to}` : `${variable.name[lang]}, ${p.from}-${p.to}`;
  const isPicked = (r: Region | null) => !!r && r.kind === 'point' && !r.name;
  const showRadius = p.pickMode === 'point' && (!p.regionA || isPicked(p.regionA) || isPicked(p.regionB));
  const fileBase = `${p.chartVariable}-${p.from}-${p.to}${view !== 'year' ? `-${view}` : ''}`;

  const comparison = (() => {
    const [ra, rb] = results;
    if (!ra?.stats || !rb?.stats) return null;
    const na = regionName(ra.region, lang);
    const nb = regionName(rb.region, lang);
    if (Math.sign(ra.stats.sen) !== Math.sign(rb.stats.sen) && ra.stats.sen !== 0 && rb.stats.sen !== 0) return a.opposite(na, nb);
    const [fast, slow, nf, ns] = Math.abs(ra.stats.sen) >= Math.abs(rb.stats.sen) ? [ra.stats, rb.stats, na, nb] : [rb.stats, ra.stats, nb, na];
    if (Math.abs(slow.sen) < 1e-9) return null;
    const k = Math.abs(fast.sen / slow.sen);
    return k >= 1.2 ? a.faster(nf, ns, numberFormat(lang, 1, false)(k)) : null;
  })();

  const openMethod = (id: string) => {
    setTab('methods');
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  // Drag the left edge to make the drawer wider or narrower.
  const onResize = (e: React.PointerEvent<HTMLDivElement>) => {
    const startX = e.clientX;
    const startW = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect().width;
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => setWidth(Math.min(window.innerWidth * 0.8, Math.max(MIN_W, startW + startX - ev.clientX)));
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
  };

  return (
    <aside className="drawer" id="analysis-drawer" aria-label={a.title} style={width ? { width } : undefined}>
      <div
        className="drawer__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label={a.resize}
        tabIndex={0}
        onPointerDown={onResize}
        onKeyDown={(e) => {
          const w = width ?? (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect().width;
          if (e.key === 'ArrowLeft') setWidth(Math.min(window.innerWidth * 0.8, w + 40));
          else if (e.key === 'ArrowRight') setWidth(Math.max(MIN_W, w - 40));
          else return;
          e.preventDefault();
        }}
      />
      <header className="flyout__head">
        <h2 className="flyout__title">{a.title}</h2>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={s.close} onClick={p.onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>

      <div className="drawer__body">
        {p.activeCase && (
          <section className="case-story">
            <h3 className="case-story__title">{p.activeCase.title[lang]}</h3>
            <p>{p.activeCase.story[lang]}</p>
            <p className="case-story__sources">
              {s.cases.sources}:{' '}
              {p.activeCase.sources.map((src, i) => (
                <span key={src.url}>
                  {i > 0 && ', '}
                  <a href={src.url} target="_blank" rel="noreferrer">
                    {src.label}
                  </a>
                </span>
              ))}
            </p>
          </section>
        )}

        <div className="regions">
          {(['A', 'B'] as Slot[]).map((slot) => {
            const region = slot === 'A' ? p.regionA : p.regionB;
            const listId = `countries-${slot}`;
            return (
              <div key={slot} className={`region region--${slot.toLowerCase()}`}>
                <div className="region__row">
                  <span className="region__pin" aria-hidden="true">
                    {slot}
                  </span>
                  {region ? (
                    <span className="region__name">{regionName(region, lang)}</span>
                  ) : (
                    <span className="region__name region__name--empty">{slot === 'A' ? a.empty : a.pickB}</span>
                  )}
                  {p.picking === slot ? (
                    <button type="button" className="text-btn" onClick={() => p.onPick(null)}>
                      {a.cancel}
                    </button>
                  ) : (
                    <button type="button" className="chip-btn" onClick={() => p.onPick(slot)}>
                      {region ? <Icon name="pin" size={16} /> : <Icon name="plus" size={16} />}
                      <span>{slot === 'A' ? a.pickA : a.pickB}</span>
                    </button>
                  )}
                  {slot === 'B' && region && (
                    <button type="button" className="icon-btn icon-btn--bare icon-btn--small" aria-label={`${a.remove} B`} onClick={p.onRemoveB}>
                      <Icon name="close" size={16} />
                    </button>
                  )}
                </div>
                <label className="visually-hidden" htmlFor={`country-input-${slot}`}>
                  {a.countryFor(slot)}
                </label>
                <input
                  id={`country-input-${slot}`}
                  className="field__input region__country"
                  list={listId}
                  placeholder={a.countryPlaceholder}
                  autoComplete="off"
                  key={region?.kind === 'country' ? `${region.code}-${lang}` : 'none'}
                  defaultValue={region?.kind === 'country' ? countryName(region.code, lang, region.name) : ''}
                  onChange={(e) => {
                    // A whole name or an everyday one ("США") picks the country at once.
                    const hit = findCountry(countryList, e.target.value, true);
                    if (hit) p.onCountry(slot, hit.item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter') return;
                    // Enter takes the best match for the start of a name ("Амер" finds the USA).
                    const hit = findCountry(countryList, e.currentTarget.value);
                    if (hit) {
                      e.currentTarget.value = hit.label;
                      p.onCountry(slot, hit.item);
                    }
                  }}
                />
                <datalist id={listId}>
                  {countryList.map((o) => (
                    <option key={o.code} value={o.label} />
                  ))}
                  {aliasList.map((o) => (
                    <option key={`${o.value}-${o.label}`} value={o.value} label={o.label} />
                  ))}
                </datalist>
              </div>
            );
          })}
          <div className="drawer__row drawer__row--pick">
            <span className="field__label">{a.pickMode}</span>
            <div className="seg" role="group" aria-label={a.pickMode}>
              {(['point', 'country'] as PickMode[]).map((m) => (
                <button key={m} type="button" className="seg__btn" aria-pressed={p.pickMode === m} onClick={() => p.onPickMode(m)}>
                  {a.pickModes[m]}
                </button>
              ))}
            </div>
          </div>
          {p.picking && (
            <p className="note" role="status">
              {p.pickMode === 'country' ? a.pickingCountry : a.picking}
            </p>
          )}
          {p.missedCountry && (
            <p className="note" role="status">
              {a.notCountry}
            </p>
          )}
        </div>

        {p.regionA && (
          <div className="seg drawer__tabs" role="tablist" aria-label={a.title}>
            {(['result', 'methods'] as const).map((id) => (
              <button key={id} type="button" role="tab" className="seg__btn" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
                {a.tabs[id]}
              </button>
            ))}
          </div>
        )}

        {p.regionA && tab === 'methods' && <Methods results={results} unit={unit} perDecade={perDecade} view={view} />}

        {p.regionA && tab === 'result' && (
          <>
            <p className="note">{a.period(p.from, p.to)}</p>
            {p.analysis.status === 'loading' && (
              <p className="note" role="status">
                {view === 'day' ? a.dayLoading : a.loading}
              </p>
            )}
            {p.analysis.status === 'error' && p.analysis.coverage && (
              <p className="note" role="status">
                {p.analysis.coverage[lang]}
              </p>
            )}
            {p.analysis.status === 'error' && !p.analysis.coverage && (
              <p className="note" role="alert">
                {a.error}{' '}
                <button type="button" className="text-btn" onClick={p.analysis.retry}>
                  {a.retry}
                </button>
              </p>
            )}
            {p.analysis.status === 'ready' && (
              <>
                {p.analysis.fallback && <p className="note note--source">{p.analysis.fallback[lang]}</p>}
                <Summary results={results} from={p.from} to={p.to} unit={unit} variable={p.chartVariable} />
                <Levels results={results} from={p.from} to={p.to} unit={unit} />
                <Tiles results={annual} from={p.from} to={p.to} unit={variable.unit[lang]} />

                {views.length > 1 && (
                  <div className="drawer__row drawer__row--views">
                    <div className="seg" role="group" aria-label={a.view}>
                      {views.map((v) => (
                        <button key={v} type="button" className="seg__btn" aria-pressed={view === v} onClick={() => p.onChartView(v)}>
                          {a.views[v]}
                        </button>
                      ))}
                    </div>
                    {cycle && withMonths.length > 1 && (
                      <div className="seg" role="group" aria-label={a.seasonOf}>
                        {withMonths.map((r) => (
                          <button key={r.slot} type="button" className="seg__btn" aria-pressed={seasonResult?.slot === r.slot} onClick={() => setSeasonSlot(r.slot)}>
                            {r.slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {cycle && seasonResult ? (
                  <>
                    <SeasonChart
                      ref={chartRef}
                      rows={seasonResult.series!.monthly!}
                      slot={seasonResult.slot}
                      from={p.from}
                      to={p.to}
                      unit={monthUnit}
                      format={fmtValue}
                      forecast
                      labels={{ months: a.monthsShort, mean: a.seasonMean, expected: a.seasonExpected, noData: a.noData, hint: a.seasonHint }}
                    />
                    <p className="note">{a.seasonNote(p.to + 1)}</p>
                  </>
                ) : (
                  <>
                    <Chart
                      ref={chartRef}
                      series={results.filter((r) => r.series).map((r) => ({ id: r.slot, name: regionName(r.region, lang), points: r.points, stats: r.stats }))}
                      unit={unit}
                      from={p.from}
                      to={p.to}
                      resolution={view === 'cycle' ? 'year' : view}
                      format={fmtValue}
                      forecast={AHEAD}
                      marks={p.marks}
                      mapYear={p.mapYear}
                      onPickYear={p.onPickYear}
                      labels={{
                        hint: a.trendHint,
                        noData: a.noData,
                        expected: a.expected,
                        range: a.range,
                        onMap: a.onMap,
                        monthsShort: a.monthsShort,
                        trend: a.trendLine,
                        ...a.chart,
                      }}
                    />
                    {view === 'year' ? (
                      <p className="note">
                        {a.forecastNote(AHEAD)} {anyWeak && a.forecastWeak}
                      </p>
                    ) : (
                      <p className="note">
                        {a.viewNotes[view === 'day' ? 'day' : 'month']}{' '}
                        <button type="button" className="text-btn" onClick={() => openMethod('m-seasonal')}>
                          {a.why}
                        </button>
                      </p>
                    )}
                    {p.marks.some((m) => m.year >= p.from && m.year <= p.to + AHEAD) && (
                      <section className="marks">
                        <h4 className="marks__title">{a.marksTitle}</h4>
                        <ul className="marks__list">
                          {p.marks
                            .filter((m) => m.year >= p.from && m.year <= p.to + AHEAD)
                            .map((m) => (
                              <li key={`${m.year}-${m.label}`}>
                                <strong>{m.year}</strong> {m.detail}{' '}
                                {m.source && (
                                  <a href={m.source.url} target="_blank" rel="noreferrer">
                                    {m.source.label}
                                  </a>
                                )}
                              </li>
                            ))}
                        </ul>
                      </section>
                    )}
                  </>
                )}
                {results.map((r) => (
                  <Verdict
                    key={r.slot}
                    slot={r.slot}
                    name={regionName(r.region, lang)}
                    stats={r.stats}
                    perDecade={perDecade}
                    fmtRate={fmtRate}
                    onWhy={() => openMethod('m-mk')}
                  />
                ))}
                {comparison && <p className="compare-note">{comparison}</p>}
                <div className="drawer__actions">
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={() => {
                      const csv = chartRef.current?.toCsv();
                      if (csv) download(`${fileBase}.csv`, new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
                    }}
                  >
                    <Icon name="download" size={18} />
                    {a.csv}
                  </button>
                  <button
                    type="button"
                    className="btn btn--quiet"
                    onClick={async () => {
                      const png = await chartRef.current?.toPng(title);
                      if (png) download(`${fileBase}.png`, png);
                    }}
                  >
                    <Icon name="download" size={18} />
                    {a.png}
                  </button>
                </div>
                <details className="method">
                  <summary>{a.method}</summary>
                  {results.map((r) => r.series && <p key={r.slot}>{`${r.slot}: ${(view === 'day' && r.daily ? r.daily.method : r.series.method)[lang]}`}</p>)}
                  <p>
                    <a href={variable.sourceUrl} target="_blank" rel="noreferrer">
                      {variable.source[lang]}
                    </a>
                  </p>
                </details>
                <ExternalTools regions={results.map((r) => ({ slot: r.slot, region: r.region }))} from={p.from} to={p.to} variable={p.chartVariable} />
              </>
            )}
          </>
        )}
        <section className="drawer__settings">
          <label className="field">
            <span className="field__label">{a.variable}</span>
            <select className="field__input" value={p.chartVariable} onChange={(e) => p.onChartVariable(e.target.value as VariableId)}>
              {numeric.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name[lang]} ({v.source[lang]})
                </option>
              ))}
            </select>
          </label>

          <div className="drawer__row">
            {showRadius && (
              <label className="field field--inline">
                <span className="field__label">{a.radius}</span>
                <select className="field__input" value={p.radiusKm} onChange={(e) => p.onRadius(Number(e.target.value))}>
                  {RADII.map((r) => (
                    <option key={r} value={r}>
                      {r === 0 ? a.point : a.km(r)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {hasSeasons(variable) && view === 'year' && (
              <label className="field field--inline">
                <span className="field__label">{a.season}</span>
                <select className="field__input" value={p.season} onChange={(e) => p.onSeason(e.target.value as Season)}>
                  {SEASONS.map((x) => (
                    <option key={x} value={x}>
                      {a.seasons[x]}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </section>
      </div>
    </aside>
  );
}

function Verdict({
  slot,
  name,
  stats,
  perDecade,
  fmtRate,
  onWhy,
}: {
  slot: 'A' | 'B';
  name: string;
  stats: TrendStats | null;
  perDecade: string;
  fmtRate: (v: number) => string;
  onWhy: () => void;
}) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const v = verdict(stats);
  const still = yearsStillNeeded(stats);
  return (
    <section className={`verdict verdict--${v}`} aria-label={`${slot}: ${name}`}>
      <p className="verdict__head">
        <span className={`region__pin region__pin--${slot.toLowerCase()}`} aria-hidden="true">
          {slot}
        </span>
        <span className="verdict__light" aria-hidden="true" />
        <strong>{a.verdict[v]}</strong>
        <button type="button" className="icon-btn icon-btn--bare icon-btn--small verdict__why" aria-label={a.why} title={a.why} onClick={onWhy}>
          <Icon name="info" size={16} />
        </button>
      </p>
      <p className="verdict__plain">{a.verdictPlain[v]}</p>
      {stats && (
        <p className="verdict__rate">
          <span className="verdict__rate-label">{a.rateLabel}: </span>
          {a.rate(fmtRate(stats.sen * 10), perDecade)}
        </p>
      )}
      {v === 'insufficient' && still !== null && <p className="verdict__detail">{a.needMin(still)}</p>}
      {v === 'weak' && still !== null && still > 0 && <p className="verdict__detail">{a.needMore(still)}</p>}
      {stats && (
        <details className="verdict__more">
          <summary>{a.expert}</summary>
          <p className="verdict__detail">{a.ci(fmtRate(stats.senLow * 10), fmtRate(stats.senHigh * 10))}</p>
          <p className="verdict__detail">
            {stats.seasonal ? a.testsSeasonal(formatP(stats.mkP, lang), formatP(stats.olsP, lang), stats.n, stats.years) : a.tests(formatP(stats.mkP, lang), formatP(stats.olsP, lang), stats.n)}
          </p>
          <p className="verdict__detail">{a.pExplained}</p>
          {v === 'significant' && stats.yearsNeeded && <p className="verdict__detail">{a.detectable(Math.ceil(stats.yearsNeeded))}</p>}
        </details>
      )}
    </section>
  );
}

/** What changed and how much, at a glance: change along the trend, the extreme year, the latest year. */
function Tiles({ results, from, to, unit }: { results: AnalysisState['results']; from: number; to: number; unit: string }) {
  const { lang } = useI18n();
  const t = useStudio().analysis.tiles;
  const rows = results
    .filter((r) => r.series && r.stats)
    .map((r) => {
      const pts = r.points.filter((q) => Number.isFinite(q.y));
      const stats = r.stats!;
      const up = stats.sen >= 0;
      const extreme = pts.reduce((best, q) => ((up ? q.y > best.y : q.y < best.y) ? q : best), pts[0]);
      const last = pts[pts.length - 1];
      const mean = pts.reduce((acc, q) => acc + q.y, 0) / pts.length;
      return { slot: r.slot, change: stats.sen * (to - from), extreme, up, last, lastDiff: last ? last.y - mean : NaN };
    })
    .filter((r) => r.last);
  if (!rows.length) return null;
  const big = Math.max(...rows.map((r) => Math.abs(r.change)), ...rows.map((r) => Math.abs(r.lastDiff)));
  const signed = numberFormat(lang, Math.min(3, digitsFor(big || 0.1)));
  const plain = numberFormat(lang, Math.min(3, digitsFor(Math.max(...rows.map((r) => Math.abs(r.extreme.y))) || 0.1)), false);
  const allUp = rows.every((r) => r.up);
  const allDown = rows.every((r) => !r.up);
  const slot = (id: 'A' | 'B') => rows.length > 1 && <span className={`tile__slot tile__slot--${id.toLowerCase()}`}>{id}</span>;
  return (
    <div className="tiles">
      <section className="tile">
        <h4 className="tile__label">{t.change}</h4>
        {rows.map((r) => (
          <p key={r.slot} className="tile__value">
            {slot(r.slot)}
            {signed(r.change)} <span className="tile__unit">{unit}</span>
          </p>
        ))}
        <p className="tile__note">{t.changeNote(from, to)}</p>
      </section>
      <section className="tile">
        <h4 className="tile__label">{allUp ? t.high : allDown ? t.low : `${t.high} / ${t.low}`}</h4>
        {rows.map((r) => (
          <p key={r.slot} className="tile__value">
            {slot(r.slot)}
            {r.extreme.x} <span className="tile__unit">{plain(r.extreme.y)} {unit}</span>
          </p>
        ))}
      </section>
      <section className="tile">
        <h4 className="tile__label">{t.last}</h4>
        {rows.map((r) => (
          <p key={r.slot} className="tile__value">
            {slot(r.slot)}
            {signed(r.lastDiff)} <span className="tile__unit">{unit}</span>
          </p>
        ))}
        <p className="tile__note">{t.lastNote(rows[0].last.x)}</p>
      </section>
    </div>
  );
}

/** How the two regions differ on average over the period, in one plain sentence. */
function Levels({ results, from, to, unit }: { results: AnalysisState['results']; from: number; to: number; unit: string }) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const means = results.map((r) => {
    const v = r.points.map((q) => q.y).filter(Number.isFinite);
    return { r, mean: v.length ? v.reduce((x, y) => x + y, 0) / v.length : NaN };
  });
  if (means.length < 2 || means.some((m) => !Number.isFinite(m.mean))) return null;
  const [ma, mb] = means;
  const big = Math.max(Math.abs(ma.mean), Math.abs(mb.mean), Math.abs(ma.mean - mb.mean));
  const f = numberFormat(lang, Math.min(2, digitsFor(big || 0.1)), false);
  const [hi, lo] = ma.mean >= mb.mean ? [ma, mb] : [mb, ma];
  return (
    <p className="compare-note compare-note--levels">
      {a.levels(from, to, regionName(ma.r.region, lang), `${f(ma.mean)} ${unit}`, regionName(mb.r.region, lang), `${f(mb.mean)} ${unit}`)}{' '}
      {Math.abs(hi.mean - lo.mean) > 1e-9 && a.levelsDiff(regionName(hi.r.region, lang), `${f(hi.mean - lo.mean)} ${unit}`)}
    </p>
  );
}

/** One plain sentence per region: what changed, by how much, and whether it is reliable. */
function Summary({ results, from, to, unit, variable }: { results: AnalysisState['results']; from: number; to: number; unit: string; variable: VariableId }) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const words = variableById[variable].change;
  const lines = results
    .filter((r) => r.series)
    .map((r) => {
      const name = regionName(r.region, lang);
      const v = verdict(r.stats);
      if (v === 'insufficient' || !r.stats || !words) return { slot: r.slot, text: a.summary.insufficient(name) };
      const change = r.stats.sen * (to - from);
      const amount = `${numberFormat(lang, Math.min(3, digitsFor(Math.abs(change) || 0.1)), false)(Math.abs(change))} ${unit}`;
      const phrase = (change >= 0 ? words.up : words.down)[lang];
      return { slot: r.slot, text: a.summary[v](name, from, to, phrase, amount) };
    });
  if (!lines.length) return null;
  return (
    <section className="summary">
      {lines.map((l) => (
        <p key={l.slot} className="summary__line">
          <span className={`tile__slot tile__slot--${l.slot.toLowerCase()}`} aria-hidden="true">
            {l.slot}
          </span>
          {l.text}
        </p>
      ))}
    </section>
  );
}

/** Deep links: the same region in NASA tools and in CUAHSI's hydrology services. */
function ExternalTools({ regions, from, to, variable }: { regions: { slot: 'A' | 'B'; region: Region }[]; from: number; to: number; variable: VariableId }) {
  const { lang } = useI18n();
  const t = useStudio().analysis.tools;
  const [places, setPlaces] = useState<Record<string, string | null>>({});
  const key = JSON.stringify(regions);
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      regions.map(async ({ slot, region }) => {
        if (region.kind === 'country') return [slot, countryName(region.code, 'en', region.name)] as const;
        const c = regionCentre(region);
        const hit = await countryAt(c.lat, c.lon).catch(() => null);
        return [slot, hit ? hit.en : null] as const;
      }),
    ).then((list) => !cancelled && setPlaces(Object.fromEntries(list)));
    return () => {
      cancelled = true;
    };
    // `key` is the regions, compared by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const source = variableById[variable].series;
  const parameter = source?.kind === 'power' ? source.parameter : 'T2M,PRECTOTCORR';
  return (
    <details className="method tools">
      <summary>{t.title}</summary>
      <p className="note">{t.intro}</p>
      {regions.map(({ slot, region }) => {
        const b = regionBox(region);
        const pad = 0.5;
        const [w, s, e, n] = [Math.max(-180, b.w - pad), Math.max(-90, b.s - pad), Math.min(180, b.e + pad), Math.min(90, b.n + pad)].map((v) => Number(v.toFixed(2)));
        const c = regionCentre(region);
        const place = places[slot];
        const links: [string, string][] = [
          [t.worldview, `https://worldview.earthdata.nasa.gov/?v=${w},${s},${e},${n}&t=${Math.min(to, new Date().getFullYear())}-07-15`],
          [t.giovanni, `https://giovanni.gsfc.nasa.gov/giovanni/#service=ArAvTs&starttime=${from}-01-01T00:00:00Z&endtime=${to}-12-31T23:59:59Z&bbox=${w},${s},${e},${n}`],
          [t.earthdata, `https://search.earthdata.nasa.gov/search?q=GLDAS&sb=${w}%2C${s}%2C${e}%2C${n}`],
          ...(place ? [[t.hydroshare(place), `https://www.hydroshare.org/search/?q=${encodeURIComponent(place)}`] as [string, string]] : []),
          [t.hydroclient, 'https://data.cuahsi.org/'],
          [
            t.powerCsv,
            `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${parameter}&community=AG&latitude=${c.lat.toFixed(3)}&longitude=${c.lon.toFixed(3)}&start=1981&end=2025&format=CSV`,
          ],
        ];
        return (
          <div key={slot} className="tools__group">
            <p className="tools__title">
              <span className={`tile__slot tile__slot--${slot.toLowerCase()}`}>{slot}</span> {regionName(region, lang)}
            </p>
            <ul className="tools__list">
              {links.map(([label, href]) => (
                <li key={href}>
                  <a href={href} target="_blank" rel="noreferrer">
                    <Icon name="link" size={14} /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </details>
  );
}
