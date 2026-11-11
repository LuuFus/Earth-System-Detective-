import { useRef, useState } from 'react';
import type { Region, Season } from '../../analysis/series';
import { hasSeasons } from '../../analysis/series';
import { verdict, yearsStillNeeded, type TrendStats } from '../../analysis/stats';
import type { Case } from '../../data/cases';
import { variableById, variables, type VariableId } from '../../data/variables';
import type { AnalysisState } from '../../hooks/useAnalysis';
import { useI18n } from '../../i18n/I18n';
import { digitsFor, formatP, numberFormat, regionName } from '../../i18n/format';
import { useStudio } from '../../i18n/useStudio';
import type { Slot } from '../../state/explore';
import { Chart, type ChartHandle, type ChartMark } from '../Chart';
import { SeasonChart } from '../SeasonChart';
import { Icon } from './Icon';

type Props = {
  chartVariable: VariableId;
  regionA: Region | null;
  regionB: Region | null;
  picking: Slot | null;
  radiusKm: number;
  season: Season;
  from: number;
  to: number;
  activeCase: Case | null;
  analysis: AnalysisState;
  /** Event marks for this variable and these regions. */
  marks: ChartMark[];
  /** Year the globe shows; clicking a year on the chart moves the globe there. */
  mapYear: number | null;
  onPickYear: (year: number) => void;
  onClose: () => void;
  onChartVariable: (id: VariableId) => void;
  onPick: (slot: Slot | null) => void;
  onRemoveB: () => void;
  onRadius: (km: number) => void;
  onSeason: (season: Season) => void;
};

const RADII = [0, 250, 500, 1000];
/** Years the trend is carried on after the period. */
const AHEAD = 10;
const SEASONS: Season[] = ['year', 'djf', 'mam', 'jja', 'son'];

function download(name: string, blob: Blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** The right-hand drawer: chart, significance light and plain-language reading of the trend. */
export function AnalysisDrawer(p: Props) {
  const { lang } = useI18n();
  const s = useStudio();
  const a = s.analysis;
  const chartRef = useRef<ChartHandle>(null);
  const [view, setView] = useState<'years' | 'months'>('years');
  const [seasonSlot, setSeasonSlot] = useState<'A' | 'B'>('A');
  const variable = variableById[p.chartVariable];
  const unit = variable.unit[lang];
  const perDecade = variable.trendUnit[lang];
  const numeric = variables.filter((v) => v.series);

  const results = p.analysis.results;
  const values = results.flatMap((r) => r.series?.points.filter((q) => q.x >= p.from && q.x <= p.to).map((q) => q.y) ?? []).filter(Number.isFinite);
  const spread = values.length ? Math.max(...values) - Math.min(...values) : 1;
  const valueDigits = spread >= 40 ? 0 : spread >= 4 ? 1 : 2;
  const fmtValue = numberFormat(lang, valueDigits, false);
  // One precision for every rate on screen, set by the largest one.
  const largestRate = Math.max(0, ...results.map((r) => (r.stats ? Math.abs(r.stats.sen * 10) : 0)));
  const fmtRate = numberFormat(lang, Math.min(3, Math.max(1, digitsFor(largestRate || 0.1))));

  const withMonths = results.filter((r) => r.series?.monthly?.length);
  const months = view === 'months' && withMonths.length > 0;
  const seasonResult = withMonths.find((r) => r.slot === seasonSlot) ?? withMonths[0];
  const monthUnit = seasonResult?.series?.monthUnit?.[lang] ?? unit;
  const anyWeak = results.some((r) => r.stats && verdict(r.stats) !== 'significant');

  const title =
    months && seasonResult
      ? `${variable.name[lang]}, ${regionName(seasonResult.region, lang)}, ${a.views.months.toLowerCase()} ${p.from}-${p.to}`
      : `${variable.name[lang]}, ${p.from}-${p.to}`;
  const isPicked = (r: Region | null) => !!r && r.kind === 'point' && !r.name;
  const showRadius = !p.regionA || isPicked(p.regionA) || isPicked(p.regionB);
  const fileBase = `${p.chartVariable}-${p.from}-${p.to}${months ? '-monthly' : ''}`;

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

  return (
    <aside className="drawer" id="analysis-drawer" aria-label={a.title}>
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
            );
          })}
          {p.picking && (
            <p className="note" role="status">
              {a.picking}
            </p>
          )}
        </div>

        {p.regionA && (
          <>
            <p className="note">{a.period(p.from, p.to)}</p>
            {p.analysis.status === 'loading' && (
              <p className="note" role="status">
                {a.loading}
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
                <Summary results={results} from={p.from} to={p.to} unit={unit} variable={p.chartVariable} />
                <Tiles results={results} from={p.from} to={p.to} unit={unit} />

                {withMonths.length > 0 && (
                  <div className="drawer__row drawer__row--views">
                    <div className="seg" role="group" aria-label={a.view}>
                      {(['years', 'months'] as const).map((v) => (
                        <button key={v} type="button" className="seg__btn" aria-pressed={view === v} onClick={() => setView(v)}>
                          {a.views[v]}
                        </button>
                      ))}
                    </div>
                    {months && withMonths.length > 1 && (
                      <div className="seg" role="group" aria-label={a.seasonOf}>
                        {withMonths.map((r) => (
                          <button
                            key={r.slot}
                            type="button"
                            className="seg__btn"
                            aria-pressed={seasonResult?.slot === r.slot}
                            onClick={() => setSeasonSlot(r.slot)}
                          >
                            {r.slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {months && seasonResult ? (
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
                      series={results
                        .filter((r) => r.series)
                        .map((r) => ({ id: r.slot, name: regionName(r.region, lang), points: r.series!.points, stats: r.stats }))}
                      unit={unit}
                      from={p.from}
                      to={p.to}
                      format={fmtValue}
                      forecast={AHEAD}
                      marks={p.marks}
                      mapYear={p.mapYear}
                      onPickYear={p.onPickYear}
                      labels={{ hint: a.trendHint, noData: a.noData, expected: a.expected, range: a.range, onMap: a.onMap }}
                    />
                    <p className="note">
                      {a.forecastNote(AHEAD)} {anyWeak && a.forecastWeak}
                    </p>
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
                  <Verdict key={r.slot} slot={r.slot} name={regionName(r.region, lang)} stats={r.stats} perDecade={perDecade} fmtRate={fmtRate} />
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
                  {results.map((r) => r.series && <p key={r.slot}>{`${r.slot}: ${r.series.method[lang]}`}</p>)}
                  <p>
                    <a href={variable.sourceUrl} target="_blank" rel="noreferrer">
                      {variable.source[lang]}
                    </a>
                  </p>
                </details>
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
          {hasSeasons(variable) && (
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

function Verdict({ slot, name, stats, perDecade, fmtRate }: { slot: 'A' | 'B'; name: string; stats: TrendStats | null; perDecade: string; fmtRate: (v: number) => string }) {
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
          <p className="verdict__detail">{a.tests(formatP(stats.mkP, lang), formatP(stats.olsP, lang), stats.n)}</p>
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
      const pts = r.series!.points.filter((q) => q.x >= from && q.x <= to && Number.isFinite(q.y));
      const stats = r.stats!;
      const up = stats.sen >= 0;
      const extreme = pts.reduce((best, q) => ((up ? q.y > best.y : q.y < best.y) ? q : best), pts[0]);
      const last = pts[pts.length - 1];
      const mean = pts.reduce((acc, q) => acc + q.y, 0) / pts.length;
      return { slot: r.slot, change: stats.sen * (to - from), extreme, up, last, lastDiff: last.y - mean };
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
