import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { laterHigherShare, monthDepartures, rankOf, valueOf, yearFacts } from '../../analysis/facts';
import type { Region, Season } from '../../analysis/series';
import { countryRegion, hasSeasons, regionBox, regionCentre, resolutionsFor } from '../../analysis/series';
import { trendStats, verdict, yearsStillNeeded, type Point, type TrendStats } from '../../analysis/stats';
import type { Case } from '../../data/cases';
import { cityPlace, cityRegion, findCities, fold, type WorldCity } from '../../data/cities';
import { searchCities } from '../../data/city';
import { aliasOptions, countryIndex, findCountry } from '../../data/countryNames';
import { countryAt, countryName, loadCountries, type GeoCountry } from '../../data/geo';
import type { LiveManifest } from '../../data/live';
import { variableById, variables, type Variable, type VariableId } from '../../data/variables';
import type { AnalysisState, RegionResult } from '../../hooks/useAnalysis';
import { useI18n } from '../../i18n/I18n';
import { digitsFor, formatP, numberFormat, regionName } from '../../i18n/format';
import { useLiveText } from '../../i18n/live';
import { usePlacesText } from '../../i18n/places';
import { useStudio } from '../../i18n/useStudio';
import { MAX_YEARS, type ChartView, type PickMode, type Slot, type YearMode } from '../../state/explore';
import { Chart, type ChartHandle, type ChartMark } from '../Chart';
import { SeasonChart } from '../SeasonChart';
import { StatCard, type StatRange } from '../ui/StatCard';
import { Icon } from './Icon';
import { Methods } from './Methods';
import { PlaceCompare } from './PlaceCompare';

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
  /** The years the chart variable has: the choices for the period and the years. */
  yearRange: [number, number];
  yearMode: YearMode;
  /** Years picked one by one (year mode). */
  years: number[];
  chartView: ChartView;
  activeCase: Case | null;
  analysis: AnalysisState;
  /** Event marks for this variable and these regions. */
  marks: ChartMark[];
  /** Year the globe shows; clicking a value on the chart moves the globe there. */
  mapYear: number | null;
  /** The globe click hit the sea while picking a country. */
  missedCountry: boolean;
  /** Cities for the place box (Natural Earth), once loaded. */
  cities: WorldCity[] | null;
  onPickYear: (year: number, month?: number) => void;
  onClose: () => void;
  onChartVariable: (id: VariableId) => void;
  onPick: (slot: Slot | null) => void;
  onPickMode: (mode: PickMode) => void;
  /** A country or a city typed into the place box. */
  onPlace: (slot: Slot, region: Region) => void;
  onRemoveB: () => void;
  onRadius: (km: number) => void;
  onSeason: (season: Season) => void;
  onChartView: (view: ChartView) => void;
  onYearMode: (mode: YearMode) => void;
  onToggleYear: (year: number) => void;
  onPeriod: (from: number, to: number) => void;
  /** The years on the globe's shutter (left, right), when it is on. */
  shutter: [number, number] | null;
  /** For the comparison of two places by everything. */
  manifest: LiveManifest | null;
};

const RADII = [0, 250, 500, 1000];
/** Years the trend is carried on after the period, when asked for. */
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

/** Number formats that suit the values on screen: one decimal from 1 up, whole numbers from 100. */
function formats(lang: 'uk' | 'en', values: number[]) {
  const big = Math.max(0, ...values.filter(Number.isFinite).map(Math.abs));
  const digits = big >= 100 ? 0 : big >= 1 ? 1 : Math.min(2, digitsFor(big || 0.1));
  return { plain: numberFormat(lang, digits, false), signed: numberFormat(lang, digits) };
}

/** The right-hand drawer: places, years, the plain answer from the measured values, the chart and how it is computed. */
export function AnalysisDrawer(p: Props) {
  const { lang } = useI18n();
  const s = useStudio();
  const a = s.analysis;
  const chartRef = useRef<ChartHandle>(null);
  const [tab, setTab] = useState<'result' | 'places' | 'methods'>('result');
  const placesText = usePlacesText().compare;
  const [seasonSlot, setSeasonSlot] = useState<'A' | 'B'>('A');
  const [width, setWidth] = useState<number | null>(null);
  const [ahead, setAhead] = useState(false);
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

  // The plain answer always uses the yearly values inside the period.
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
  const anySignificant = results.some((r) => r.stats && verdict(r.stats) === 'significant');
  const views: ChartView[] = [...resolutionsFor(variable), ...(withMonths.length || resolutionsFor(variable).includes('month') ? (['cycle'] as const) : [])];
  const showAhead = ahead && anySignificant;

  const title = cycle && seasonResult ? `${variable.name[lang]}, ${regionName(seasonResult.region, lang)}, ${a.views.cycle.toLowerCase()} ${p.from}-${p.to}` : `${variable.name[lang]}, ${p.from}-${p.to}`;
  const isPicked = (r: Region | null) => !!r && r.kind === 'point' && !r.name;
  const showRadius = p.pickMode === 'point' && (!p.regionA || isPicked(p.regionA) || isPicked(p.regionB));
  const fileBase = `${p.chartVariable}-${p.from}-${p.to}${view !== 'year' ? `-${view}` : ''}`;
  const pointCell = p.chartVariable === 'gistemp' && [p.regionA, p.regionB].some((r) => r?.kind === 'point');

  // "Changes N times as fast" only means something when both changes are real.
  const comparison = (() => {
    const [ra, rb] = annual;
    if (!ra?.stats || !rb?.stats || verdict(ra.stats) !== 'significant' || verdict(rb.stats) !== 'significant') return null;
    const na = regionName(ra.region, lang);
    const nb = regionName(rb.region, lang);
    if (Math.sign(ra.stats.sen) !== Math.sign(rb.stats.sen)) return a.opposite(na, nb);
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

  const ready = p.analysis.status === 'ready';
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
                <PlaceBox key={`${slot}-${region ? regionName(region, lang) : ''}-${lang}`} slot={slot} region={region} geo={geo} cities={p.cities} onPlace={p.onPlace} />
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

        <section className="drawer__what">
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
          {variable.plain && <p className="note">{a.means(variable.plain[lang])}</p>}
          <YearsPicker
            mode={p.yearMode}
            years={p.years}
            from={p.from}
            to={p.to}
            range={p.yearRange}
            onMode={p.onYearMode}
            onToggle={p.onToggleYear}
            onPeriod={p.onPeriod}
          />
        </section>

        {p.regionA && (
          <div className="seg drawer__tabs" role="tablist" aria-label={a.title}>
            {(['result', 'places', 'methods'] as const).map((id) => (
              <button key={id} type="button" role="tab" className="seg__btn" aria-selected={tab === id} aria-pressed={tab === id} onClick={() => setTab(id)}>
                {id === 'places' ? placesText.tab : a.tabs[id]}
              </button>
            ))}
          </div>
        )}

        {p.regionA && tab === 'methods' && <Methods results={results} unit={unit} perDecade={perDecade} view={view} />}
        {p.regionA && tab === 'places' && <PlaceCompare regionA={p.regionA} regionB={p.regionB} manifest={p.manifest} />}

        {p.regionA && tab === 'result' && (
          <>
            {p.analysis.status === 'loading' && (
              <p className="note" role="status">
                {view === 'day' && p.yearMode === 'period' ? a.dayLoading : a.loading}
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
            {ready && variable.seriesNote && <p className="note note--source">{variable.seriesNote[lang]}</p>}
            {ready && p.analysis.fallback && <p className="note note--source">{p.analysis.fallback[lang]}</p>}
            {ready && pointCell && <p className="note note--source">{a.cellNote}</p>}

            {ready && hasSeasons(variable) && p.season !== 'year' && <p className="note note--source">{a.seasonOnly(a.seasons[p.season].toLowerCase())}</p>}
            {ready && p.yearMode === 'years' && (
              <YearsResult results={results} years={p.years} variable={variable} onPickYear={p.onPickYear} shutter={p.shutter} />
            )}

            {ready && p.yearMode === 'period' && (
              <>
                <Summary results={annual} from={p.from} to={p.to} variable={variable} season={hasSeasons(variable) && p.season !== 'year' ? a.seasons[p.season].toLowerCase() : null} />
                <AnalysisStat results={annual} unit={variable.unit[lang]} name={variable.name[lang]} />
                <Levels results={annual} from={p.from} to={p.to} unit={variable.unit[lang]} />

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
                      forecast={showAhead}
                      bounds={variable.bounds}
                      labels={{ months: a.monthsShort, mean: a.seasonMean, expected: a.seasonExpected, noData: a.noData, hint: a.seasonHint }}
                    />
                    <p className="note">{showAhead ? a.seasonNote(p.to + 1) : a.seasonNotePlain}</p>
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
                      forecast={showAhead ? AHEAD : 0}
                      bounds={variable.bounds}
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
                      showAhead && <p className="note">{a.forecastNote(AHEAD)}</p>
                    ) : (
                      <p className="note">
                        {a.viewNotes[view === 'day' ? 'day' : 'month']}{' '}
                        <button type="button" className="text-btn" onClick={() => openMethod('m-seasonal')}>
                          {a.why}
                        </button>
                      </p>
                    )}
                    {p.marks.some((m) => m.year >= p.from && m.year <= p.to + (showAhead ? AHEAD : 0)) && (
                      <section className="marks">
                        <h4 className="marks__title">{a.marksTitle}</h4>
                        <ul className="marks__list">
                          {p.marks
                            .filter((m) => m.year >= p.from && m.year <= p.to + (showAhead ? AHEAD : 0))
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
                {(view === 'year' || cycle) && anySignificant && (
                  <label className="check drawer__ahead">
                    <input type="checkbox" checked={ahead} onChange={(e) => setAhead(e.target.checked)} />
                    <span>{a.aheadToggle(cycle ? 1 : AHEAD)}</span>
                  </label>
                )}
                {results.map((r) => (
                  <Verdict
                    key={r.slot}
                    slot={r.slot}
                    name={regionName(r.region, lang)}
                    stats={r.stats}
                    unit={unit}
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
              </>
            )}
            {ready && (
              <>
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

/**
 * The place box under A and B: a country or a city by name. A country by any name people type
 * ("США", "Америка", the code); a city from the list (Natural Earth), or any smaller place the
 * geocoder knows (GeoNames through Open-Meteo).
 */
function PlaceBox({ slot, region, geo, cities, onPlace }: { slot: Slot; region: Region | null; geo: GeoCountry[]; cities: WorldCity[] | null; onPlace: (slot: Slot, region: Region) => void }) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const [value, setValue] = useState(region ? regionName(region, lang) : '');
  const [state, setState] = useState<'idle' | 'busy' | 'missing'>('idle');
  const countryList = useMemo(() => countryIndex(geo, (c) => c.code, lang, (c) => [c.uk, c.en]), [geo, lang]);
  const aliasList = useMemo(() => aliasOptions(countryList, lang), [countryList, lang]);
  const all = useMemo(() => cities ?? [], [cities]);
  // Suggestions: cities of 300 000 people and more, and every Ukrainian one.
  const cityOptions = useMemo(
    () =>
      all
        .filter((c) => c.pop >= 300_000 || c.code === 'UA')
        .map((c) => ({ c, label: c.code ? `${c[lang]}, ${countryName(c.code, lang)}` : c[lang] })),
    [all, lang],
  );
  const listId = `places-${slot}`;

  const takeCity = (c: WorldCity) => {
    setState('idle');
    onPlace(slot, cityRegion(cityPlace(c)));
  };
  const takeCountry = (c: GeoCountry) => {
    setState('idle');
    onPlace(slot, countryRegion(c));
  };

  /** A whole name picked from the list: taken at once. */
  const exact = (q: string): boolean => {
    const country = findCountry(countryList, q, true);
    if (country && (country.label === q || aliasList.some((x) => x.value === q))) {
      takeCountry(country.item);
      return true;
    }
    const option = cityOptions.find((o) => o.label === q);
    if (option) {
      takeCity(option.c);
      return true;
    }
    return false;
  };

  const go = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    const country = findCountry(countryList, q, true);
    if (country) return takeCountry(country.item);
    if (exact(q)) return;
    // "Kharkiv" or "Kharkiv, Ukraine".
    const [name, where] = q.split(',').map((x) => x.trim());
    const list = findCities(all, name, 40);
    const inCountry = where ? list.filter((c) => c.code && fold(countryName(c.code, lang)).startsWith(fold(where))) : list;
    const city = inCountry[0] ?? list[0] ?? null;
    const loose = findCountry(countryList, q);
    // A city whose name starts with what was typed wins over a country that only contains it.
    if (city && (!loose || fold(city[lang]).startsWith(fold(name)))) return takeCity(city);
    if (loose) return takeCountry(loose.item);
    // Smaller places: the geocoder.
    setState('busy');
    try {
      const [hit] = await searchCities(q, lang);
      if (!hit) return setState('missing');
      setState('idle');
      onPlace(slot, cityRegion({ name: { uk: hit.name, en: hit.name }, lat: hit.lat, lon: hit.lon, code: hit.cc?.toUpperCase(), pop: hit.population }));
    } catch {
      setState('missing');
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void go(value);
  };

  return (
    <form className="place-box" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor={`place-input-${slot}`}>
        {a.placeFor(slot)}
      </label>
      <input
        id={`place-input-${slot}`}
        className="field__input region__country"
        list={listId}
        placeholder={a.placePlaceholder}
        autoComplete="off"
        value={value}
        aria-invalid={state === 'missing' || undefined}
        aria-busy={state === 'busy' || undefined}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          setValue(e.target.value);
          setState('idle');
          exact(e.target.value);
        }}
      />
      <button type="submit" className="chip-btn place-box__go" disabled={state === 'busy'} aria-label={a.placeGo}>
        <Icon name="search" size={16} />
      </button>
      <datalist id={listId}>
        {countryList.map((o) => (
          <option key={o.code} value={o.label} />
        ))}
        {aliasList.map((o) => (
          <option key={`${o.value}-${o.label}`} value={o.value} label={o.label} />
        ))}
        {cityOptions.map((o) => (
          <option key={`c${o.c.id}`} value={o.label} />
        ))}
      </datalist>
      {state === 'missing' && (
        <p className="note place-box__error" role="status">
          {a.placeMissing}
        </p>
      )}
    </form>
  );
}

/** A period from-to, or years picked one by one. */
function YearsPicker({
  mode,
  years,
  from,
  to,
  range,
  onMode,
  onToggle,
  onPeriod,
}: {
  mode: YearMode;
  years: number[];
  from: number;
  to: number;
  range: [number, number];
  onMode: (mode: YearMode) => void;
  onToggle: (year: number) => void;
  onPeriod: (from: number, to: number) => void;
}) {
  const t = useStudio().analysis.yearsPick;
  const [min, max] = range;
  const all: number[] = [];
  for (let y = min; y <= max; y++) all.push(y);
  // Shortcuts that fit the years this variable has.
  const quick: [string, number][] = [
    ...([10, 30] as const).filter((n) => max - n + 1 > min).map((n): [string, number] => [t.last(n), max - n + 1]),
    [t.all, min],
  ];
  return (
    <div className="years-pick">
      <div className="seg" role="group" aria-label={t.label}>
        {(['period', 'years'] as YearMode[]).map((m) => (
          <button key={m} type="button" className="seg__btn" aria-pressed={mode === m} onClick={() => onMode(m)}>
            {t.modes[m]}
          </button>
        ))}
      </div>
      {mode === 'period' ? (
        <>
          <div className="years-pick__row">
            <label className="field field--inline">
              <span className="field__label">{t.from}</span>
              <select className="field__input" value={from} onChange={(e) => onPeriod(Number(e.target.value), Math.max(to, Number(e.target.value) + 1))}>
                {all
                  .filter((y) => y < max)
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field field--inline">
              <span className="field__label">{t.to}</span>
              <select className="field__input" value={to} onChange={(e) => onPeriod(Math.min(from, Number(e.target.value) - 1), Number(e.target.value))}>
                {all
                  .filter((y) => y > min)
                  .map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="years-pick__row">
            {quick.map(([label, start]) => (
              <button key={label} type="button" className="chip-btn" aria-pressed={from === start && to === max} onClick={() => onPeriod(start, max)}>
                {label}
              </button>
            ))}
          </div>
          <p className="note">{t.periodNote}</p>
        </>
      ) : (
        <>
          <div className="years-pick__row years-pick__chips">
            {years.map((y, i) => (
              <button
                key={y}
                type="button"
                className="chip-btn years-pick__chip"
                style={{ ['--pick' as string]: `var(--color-pick-${(i % 6) + 1})` }}
                aria-label={t.remove(y)}
                disabled={years.length === 1}
                onClick={() => onToggle(y)}
              >
                <span className="years-pick__dot" aria-hidden="true" />
                {y}
                {years.length > 1 && <Icon name="close" size={14} />}
              </button>
            ))}
            {years.length < MAX_YEARS && (
              <label className="field field--inline">
                <span className="visually-hidden">{t.add}</span>
                <select className="field__input" value="" onChange={(e) => e.target.value && onToggle(Number(e.target.value))}>
                  <option value="">{t.add}</option>
                  {[...all]
                    .reverse()
                    .filter((y) => !years.includes(y))
                    .map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                </select>
              </label>
            )}
          </div>
          <p className="note">{t.yearsNote(MAX_YEARS)}</p>
        </>
      )}
    </div>
  );
}

/** Words for a difference: "на 1,2 °C тепліше", "на 12% менше", or "майже так само". */
function useDiffWords(variable: Variable) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  return (diff: number, scale: number, fmt: (v: number) => string, pct: number | null = null) => {
    if (!Number.isFinite(diff)) return a.noData;
    // Within 1% of the usual spread of the values: no real difference.
    if (Math.abs(diff) <= Math.max(1e-9, Math.abs(scale) * 0.01)) return a.same;
    const words = variable.more ?? { up: { uk: 'більше', en: 'more' }, down: { uk: 'менше', en: 'less' } };
    const word = (diff > 0 ? words.up : words.down)[lang];
    const share = pct !== null && Number.isFinite(pct) && Math.abs(pct) >= 1 ? ` (${numberFormat(lang, 0)(pct)}%)` : '';
    return a.by(`${fmt(Math.abs(diff))} ${variable.unit[lang]}`, word) + share;
  };
}

/**
 * The plain answer for a period, from the measured values only: the first and the last year,
 * the highest and the lowest, the usual year, and then whether the change is steady.
 */
function Summary({ results, from, to, variable, season }: { results: RegionResult[]; from: number; to: number; variable: Variable; season: string | null }) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const diffWords = useDiffWords(variable);
  const unit = variable.unit[lang];
  const blocks = results
    .filter((r) => r.series)
    .map((r) => {
      const name = regionName(r.region, lang);
      const f = yearFacts(r.points, variable.ratio);
      if (!f) return { slot: r.slot, name, lines: [a.summary.none(from, to)] };
      const { plain, signed } = formats(lang, [f.max.y, f.min.y, f.mean]);
      const v = (q: number) => `${(variable.id === 'gistemp' ? signed : plain)(q)} ${unit}`;
      const lines = [
        a.summary.firstLast(f.first.x, (variable.id === 'gistemp' ? signed : plain)(f.first.y), f.last.x, v(f.last.y), diffWords(f.diff, f.max.y - f.min.y, plain, f.pct)),
        a.summary.extremes(f.max.x, v(f.max.y), f.min.x, v(f.min.y), v(f.mean)),
      ];
      const k = verdict(r.stats);
      if (k === 'significant' && r.stats) {
        const share = laterHigherShare(r.stats);
        const rate = r.stats.sen * 10;
        lines.push(a.summary.steady(rate > 0, `${formats(lang, [rate]).plain(Math.abs(rate))} ${unit}`, share === null ? null : Math.round(share * 100)));
      } else if (k === 'weak') lines.push(a.summary.unsteady(f.first.x, f.last.x));
      else lines.push(a.summary.few(f.n));
      return { slot: r.slot, name, lines };
    });
  if (!blocks.length) return null;
  return (
    <section className="summary" aria-label={a.summary.title}>
      <h3 className="summary__title">{a.summary.title}</h3>
      {blocks.map((b) => (
        <div key={b.slot} className="summary__block">
          <p className="summary__line">
            <span className={`tile__slot tile__slot--${b.slot.toLowerCase()}`} aria-hidden="true">
              {b.slot}
            </span>
            <strong>
              {b.name}, {from}–{to}
              {season && `, ${season}`}
            </strong>
          </p>
          <ul className="summary__list">
            {b.lines.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

/** Years picked one by one: each against the usual year, against each other, and month by month. */
function YearsResult({
  results,
  years,
  variable,
  onPickYear,
  shutter,
}: {
  results: RegionResult[];
  years: number[];
  variable: Variable;
  onPickYear: (year: number) => void;
  shutter: [number, number] | null;
}) {
  const { lang } = useI18n();
  const a = useStudio().analysis;
  const t = a.yearsPick;
  const diffWords = useDiffWords(variable);
  const unit = variable.unit[lang];
  const rows = results.filter((r) => r.series);
  if (!rows.length || !years.length) return null;
  const anomaly = variable.id === 'gistemp';

  const sides = rows.map((r) => {
    const pts = r.series!.points.filter((q) => Number.isFinite(q.y));
    const f = yearFacts(pts, variable.ratio);
    // GISTEMP values are already departures from 1951-1980: that is the usual value.
    const usual = anomaly ? 0 : (f?.mean ?? NaN);
    return { r, pts, f, usual };
  });
  const all = sides.flatMap((x) => [...years.map((y) => valueOf(x.pts, y)), x.usual]).filter(Number.isFinite);
  const { plain, signed } = formats(lang, all);
  const v = (q: number) => (Number.isFinite(q) ? `${(anomaly ? signed : plain)(q)} ${unit}` : a.noData);
  const usualLabel = (x: (typeof sides)[number]) => (anomaly ? t.norm : x.f ? t.usual(x.f.first.x, x.f.last.x) : t.usualShort);
  const maxAbs = Math.max(1e-9, ...all.map(Math.abs));

  const lines: string[] = [];
  for (const x of sides) {
    const name = regionName(x.r.region, lang);
    const spread = x.f ? x.f.max.y - x.f.min.y : 0;
    for (const y of years) {
      const val = valueOf(x.pts, y);
      if (!Number.isFinite(val)) {
        lines.push(t.noYear(name, y));
        continue;
      }
      const rank = rankOf(x.pts, y);
      const place = rank ? (rank.high <= rank.low ? t.rankHigh(rank.high, rank.of) : t.rankLow(rank.low, rank.of)) : '';
      lines.push(t.yearLine(rows.length > 1 ? name : '', y, v(val), diffWords(val - x.usual, spread, plain), usualLabel(x), place));
    }
    if (years.length > 1) {
      const y0 = years[0];
      const y1 = years[years.length - 1];
      const v0 = valueOf(x.pts, y0);
      const v1 = valueOf(x.pts, y1);
      if (Number.isFinite(v0) && Number.isFinite(v1)) {
        const pct = variable.ratio && v0 > 0 ? ((v1 - v0) / v0) * 100 : null;
        lines.push(t.between(rows.length > 1 ? name : '', y0, y1, diffWords(v1 - v0, spread, plain, pct)));
      }
    }
  }
  if (sides.length === 2) {
    const up = (variable.more ?? { up: { uk: 'більше', en: 'more' } }).up[lang];
    for (const y of years) {
      const va = valueOf(sides[0].pts, y);
      const vb = valueOf(sides[1].pts, y);
      if (!Number.isFinite(va) || !Number.isFinite(vb) || va === vb) continue;
      const [hiS, loS] = va > vb ? [sides[0], sides[1]] : [sides[1], sides[0]];
      lines.push(t.twoPlaces(y, regionName(hiS.r.region, lang), regionName(loS.r.region, lang), `${plain(Math.abs(va - vb))} ${unit}`, up));
    }
  }

  // Months of each picked year against the usual month (region A).
  const monthly = sides[0].r.series!.monthly;
  const months = monthly
    ? years.flatMap((y) => {
        const d = monthDepartures(monthly, y)[0];
        if (!d) return [];
        const fm = formats(lang, [d.value, d.normal]).plain;
        const word = diffWords(d.diff, Math.abs(d.normal) || 1, fm);
        return [t.month(y, a.monthsLong[d.month], `${fm(d.value)} ${monthUnitOf(sides[0].r, lang, unit)}`, `${fm(d.normal)}`, word)];
      })
    : [];
  const span = monthly ? [monthly[0].year, monthly[monthly.length - 1].year] : null;

  return (
    <section className="years-result" aria-label={t.title}>
      <h3 className="summary__title">{t.title}</h3>
      <table className="years-table">
        <thead>
          <tr>
            <th scope="col">{t.year}</th>
            {sides.map((x) => (
              <th key={x.r.slot} scope="col">
                <span className={`tile__slot tile__slot--${x.r.slot.toLowerCase()}`}>{x.r.slot}</span> {regionName(x.r.region, lang)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map((y, i) => (
            <tr key={y}>
              <th scope="row">
                <button type="button" className="text-btn years-table__year" title={t.onGlobe} onClick={() => onPickYear(y)}>
                  <span className="years-pick__dot" style={{ ['--pick' as string]: `var(--color-pick-${(i % 6) + 1})` }} aria-hidden="true" />
                  {y}
                </button>
              </th>
              {sides.map((x) => {
                const val = valueOf(x.pts, y);
                return (
                  <td key={x.r.slot}>
                    <strong>{v(val)}</strong>
                    {Number.isFinite(val) && <Bar value={val} max={maxAbs} usual={x.usual} slot={x.r.slot} />}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr className="years-table__usual">
            <th scope="row">{anomaly ? t.normShort : t.usualShort}</th>
            {sides.map((x) => (
              <td key={x.r.slot}>
                {v(x.usual)}
                <small>{usualLabel(x)}</small>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <ul className="summary__list">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      {shutter && (
        <p className="note years-result__shutter">
          <Icon name="split" size={16} /> {t.shutter(shutter[0], shutter[1])}
        </p>
      )}
      {monthly && span && (
        <>
          <h4 className="marks__title">{t.monthsTitle(regionName(sides[0].r.region, lang))}</h4>
          <SeasonChart
            rows={monthly}
            slot={sides[0].r.slot}
            from={span[0]}
            to={span[1]}
            years={years}
            unit={monthUnitOf(sides[0].r, lang, unit)}
            format={formats(lang, monthly.flatMap((r) => r.values)).plain}
            forecast={false}
            labels={{ months: a.monthsShort, mean: a.seasonMean, expected: a.seasonExpected, noData: a.noData, hint: a.seasonHint }}
          />
          {months.length > 0 && (
            <ul className="summary__list">
              {months.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function monthUnitOf(r: RegionResult, lang: 'uk' | 'en', fallback: string): string {
  return r.series?.monthUnit?.[lang] ?? fallback;
}

/** A bar from zero for a year's value, with a tick where the usual year is. */
function Bar({ value, max, usual, slot }: { value: number; max: number; usual: number; slot: 'A' | 'B' }) {
  const w = (Math.abs(value) / max) * 100;
  const u = Number.isFinite(usual) ? (Math.abs(usual) / max) * 100 : null;
  return (
    <span className={`years-bar years-bar--${slot.toLowerCase()}`} aria-hidden="true">
      <span className="years-bar__fill" style={{ width: `${Math.max(2, w)}%` }} />
      {u !== null && <span className="years-bar__usual" style={{ left: `${u}%` }} />}
    </span>
  );
}

function Verdict({
  slot,
  name,
  stats,
  unit,
  perDecade,
  fmtRate,
  onWhy,
}: {
  slot: 'A' | 'B';
  name: string;
  stats: TrendStats | null;
  unit: string;
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
      {stats && v === 'significant' && (
        <p className="verdict__rate">
          <span className="verdict__rate-label">{a.rateLabel}: </span>
          {a.rate(fmtRate(stats.sen * 10), perDecade, fmtRate(stats.sen), unit)}
        </p>
      )}
      {v === 'insufficient' && still !== null && <p className="verdict__detail">{a.needMin(still)}</p>}
      {v === 'weak' && still !== null && still > 0 && <p className="verdict__detail">{a.needMore(still)}</p>}
      {stats && (
        <details className="verdict__more">
          <summary>{a.expert}</summary>
          <p className="verdict__detail">
            {a.rateLabel}: {a.rate(fmtRate(stats.sen * 10), perDecade, fmtRate(stats.sen), unit)}
          </p>
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

/**
 * Region A at a glance (Design Bookmark's Stat Card): the latest yearly value, the measured
 * difference from the first year of the range, and the curve, for the last 10 or 30 years or the
 * whole period.
 */
function AnalysisStat({ results, unit, name }: { results: RegionResult[]; unit: string; name: string }) {
  const { lang } = useI18n();
  const t = useLiveText().stat;
  const [range, setRange] = useState('all');
  const a = results.find((r) => r.slot === 'A');
  const all = (a?.points ?? []).filter((q) => Number.isFinite(q.y));
  if (!a || all.length < 4) return null;
  const last = all[all.length - 1];
  const starts: Record<string, Point> = {};
  const make = (id: string, label: string, years: number | null): StatRange | null => {
    const pts = years === null ? all : all.filter((q) => q.x > last.x - years);
    if (pts.length < 4 || (years !== null && pts.length >= all.length)) return null;
    starts[id] = pts[0];
    return { id, label, value: last.y, delta: last.y - pts[0].y, points: pts.map((q) => q.y) };
  };
  const ranges = [make('r10', t.ranges.r10, 10), make('r30', t.ranges.r30, 30), make('all', t.ranges.all, null)].filter((r): r is StatRange => r !== null);
  const active = ranges.some((r) => r.id === range) ? range : ranges[ranges.length - 1].id;
  const values = all.map((q) => Math.abs(q.y));
  const digits = Math.min(2, digitsFor(Math.max(...values) || 0.1));
  const plain = numberFormat(lang, digits, false);
  const signed = numberFormat(lang, Math.max(digits, 0));
  return (
    <StatCard
      label={`${name} · ${regionName(a.region, lang)}`}
      ranges={ranges}
      active={active}
      onRange={setRange}
      format={(v) => `${plain(v)} ${unit}`}
      formatDelta={(v) => `${signed(v)} ${unit}`}
      tone={(d) => (d === null || Math.abs(d) < 1e-9 ? 'flat' : d > 0 ? 'up' : 'down')}
      caption={t.caption(last.x, starts[active]?.x ?? last.x)}
    />
  );
}

/** How the two regions differ on average over the period, in one plain sentence. */
function Levels({ results, from, to, unit }: { results: RegionResult[]; from: number; to: number; unit: string }) {
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
