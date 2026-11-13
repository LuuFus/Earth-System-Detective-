import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { countryRegion, regionBox, regionCentre, type Region } from '../analysis/series';
import { CountrySearch } from '../components/CountrySearch';
import { Globe, type GlobeApi, type GlobeCompare, type GlobeHint, type GlobeMarker, type GlobeOutline, type GlobePoint, type GlobeVector, type GlobeView } from '../components/Globe';
import { gapFilledSource, wmsSource, wmtsSource } from '../components/globe/tiles';
import { AnalysisDrawer } from '../components/studio/AnalysisDrawer';
import { HintCard } from '../components/studio/HintCard';
import { CasesPanel, Flyout, GlossaryPanel, LayersPanel, SharePanel } from '../components/studio/Panels';
import { Rail } from '../components/studio/Rail';
import { Timeline } from '../components/studio/Timeline';
import { WeatherPanel } from '../components/studio/WeatherPanel';
import { TopBar } from '../components/TopBar';
import { cases, type Case } from '../data/cases';
import type { Country } from '../data/countries';
import { eventsFor } from '../data/events';
import { countryAt, countryName, loadBorders, loadCountries, loadLabels, type GeoBorders, type GeoCountry, type GeoLabels } from '../data/geo';
import { hintById, hints } from '../data/hints';
import { cellIndex } from '../data/gistemp';
import { imageryDate, imageryYears, variableById } from '../data/variables';
import { drawWar, loadWar, WAR_BOX, type WarData } from '../data/war';
import { useAnalysis } from '../hooks/useAnalysis';
import { useClimateLayer } from '../hooks/useClimateLayer';
import { usePointClimate } from '../hooks/usePointClimate';
import { useI18n } from '../i18n/I18n';
import { formatPoint, numberFormat, regionName } from '../i18n/format';
import { useStudio } from '../i18n/useStudio';
import { fromQuery, initialState, reducer, toQuery, type ExploreState, type Slot } from '../state/explore';

const GISTEMP_YEARS: [number, number] = [1880, 2025];
const WMS_LEVEL: Record<string, number> = { '2km': 5, '1km': 6, '500m': 7, '250m': 8 };

/** The 3D Earth studio: globe, tool rail, panels, analysis drawer and timeline. */
export default function Explore() {
  const { lang, t } = useI18n();
  const s = useStudio();
  const globe = useRef<GlobeApi | null>(null);
  const initial = useMemo(() => fromQuery(window.location.search), []);
  const [state, dispatch] = useReducer(reducer, initialState, (base): ExploreState => {
    const hydrated = { ...base, ...initial.state };
    return initial.caseToApply ? reducer(hydrated, { type: 'case', c: initial.caseToApply }) : hydrated;
  });
  const [view, setView] = useState<GlobeView | null>(initial.view);
  const [hover, setHover] = useState<GlobePoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [missedCountry, setMissedCountry] = useState(false);

  // Borders, coastlines, capitals, seas and rivers: loaded the first time the borders go on.
  const [geoLabels, setGeoLabels] = useState<GeoLabels | null>(null);
  const [borderLines, setBorderLines] = useState<GeoBorders | null>(null);
  useEffect(() => {
    if (!state.borders || (geoLabels && borderLines)) return;
    let cancelled = false;
    loadBorders()
      .then((b) => !cancelled && setBorderLines(b))
      .catch(() => undefined);
    loadLabels()
      .then((l) => !cancelled && setGeoLabels(l))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [state.borders, geoLabels, borderLines]);

  // Countries picked as A or B: their outlines on the globe, and their real bounding boxes when
  // they came from a shared link.
  const [countryShapes, setCountryShapes] = useState<Map<string, GeoCountry> | null>(null);
  const needsCountries = state.regionA?.kind === 'country' || state.regionB?.kind === 'country' || state.pickMode === 'country';
  useEffect(() => {
    if (!needsCountries || countryShapes) return;
    loadCountries()
      .then(setCountryShapes)
      .catch(() => undefined);
  }, [needsCountries, countryShapes]);
  useEffect(() => {
    if (!countryShapes) return;
    const fix = (r: Region | null) => {
      if (r?.kind !== 'country') return null;
      const c = countryShapes.get(r.code);
      return c && (r.box.s !== c.box[0] || r.box.n !== c.box[2]) ? countryRegion(c) : null;
    };
    const a = fix(state.regionA);
    const b = fix(state.regionB);
    if (a || b) dispatch({ type: 'hydrate', state: { ...(a ? { regionA: a } : {}), ...(b ? { regionB: b } : {}) } });
  }, [countryShapes, state.regionA, state.regionB]);
  const outlines = useMemo<GlobeOutline[]>(() => {
    if (!countryShapes) return [];
    const out: GlobeOutline[] = [];
    for (const [id, r] of [['A', state.regionA], ['B', state.regionB]] as const) {
      const c = r?.kind === 'country' ? countryShapes.get(r.code) : null;
      if (c) out.push({ id, rings: c.rings });
    }
    return out;
  }, [countryShapes, state.regionA, state.regionB]);

  const variable = state.variable ? variableById[state.variable] : null;
  const chartVariable = variableById[state.chartVariable];
  const activeCase = cases.find((c) => c.id === state.caseId) ?? null;

  // Camera from the link or the case, once the globe exists.
  useEffect(() => {
    const id = window.setTimeout(() => {
      if (initial.view) globe.current?.jumpTo(initial.view.lat, initial.view.lon, initial.view.distance);
      else if (initial.caseToApply) {
        const c = initial.caseToApply.camera;
        globe.current?.flyTo(c.lat, c.lon, c.distance);
      }
    }, 50);
    return () => window.clearTimeout(id);
  }, [initial]);

  // Map layers
  const climate = useClimateLayer(state.variable === 'gistemp', state.gistempMode, state.year, state.from, state.to);
  // One map layer for a year: imagery from GIBS for that date.
  const imageryFor = useCallback(
    (year: number) => {
      const img = variable?.imagery;
      if (!img) return null;
      // Daily layers use their own day of the year (ozone hole: 1 October); monthly ones follow the month picker.
      const date = img.time === 'daily' ? imageryDate(img, year) : imageryDate(img, year, state.month);
      // Points are drawn by the server at a fixed size, so finer levels just make them sharper.
      const wmsLevel = img.points ? 10 : (WMS_LEVEL[img.matrixSet] ?? 6);
      let source = img.via === 'wms' ? wmsSource(img.layer, wmsLevel, date) : wmtsSource(img.layer, img.matrixSet, img.format, date);
      if (img.gapFill) {
        // Swath gaps: filled from the other satellite of the same day, or left open before it flew.
        const fill = img.gapFill.find((f) => date >= f.first);
        source = gapFilledSource(source, fill ? wmtsSource(fill.layer, img.matrixSet, img.format, date) : null);
      }
      return { source, opacity: img.points || variable!.id === 'truecolor' ? 1 : 0.85, points: img.points };
    },
    [variable, state.month],
  );
  const imagery = useMemo(() => imageryFor(state.year), [imageryFor, state.year]);

  // Ukraine war layer: the official list, painted once and draped over the globe.
  const [war, setWar] = useState<{ status: 'idle' | 'loading' | 'ready' | 'error'; data: WarData | null }>({ status: 'idle', data: null });
  useEffect(() => {
    if (!state.war || war.data) return;
    let cancelled = false;
    setWar({ status: 'loading', data: null });
    loadWar()
      .then((data) => !cancelled && setWar({ status: 'ready', data }))
      .catch(() => !cancelled && setWar({ status: 'error', data: null }));
    return () => {
      cancelled = true;
    };
  }, [state.war, war.data]);
  const warCanvas = useMemo(() => (war.data ? drawWar(war.data) : null), [war.data]);
  const vector = useMemo<GlobeVector | null>(
    () =>
      state.war && warCanvas && war.data
        ? { canvas: warCanvas, box: WAR_BOX, key: war.data.edition, draw: (box, width) => drawWar(war.data!, box, width) }
        : null,
    [state.war, warCanvas, war.data],
  );

  // Ranges
  const yearRange: [number, number] = variable?.imagery ? imageryYears(variable.imagery) : GISTEMP_YEARS;
  const chartYears = chartVariable.years ?? GISTEMP_YEARS;
  const periodRange: [number, number] = state.variable === 'gistemp' ? GISTEMP_YEARS : chartYears;
  const from = Math.max(state.from, chartYears[0]);
  const to = Math.min(state.to, chartYears[1]);
  const showYear = !!variable?.imagery || (state.variable === 'gistemp' && state.gistempMode === 'year');
  const canPlay = !!variable?.imagery || state.variable === 'gistemp';

  // Before/after shutter: the left side shows `compare`, the right side the timeline year.
  const comparing = state.compare !== null && showYear;
  const leftYear = Math.min(yearRange[1], Math.max(yearRange[0], state.compare ?? yearRange[0]));
  const leftClimate = useClimateLayer(comparing && state.variable === 'gistemp', 'year', leftYear, state.from, state.to);
  const leftImagery = useMemo(() => (comparing ? imageryFor(leftYear) : null), [comparing, imageryFor, leftYear]);
  const leftData = comparing && state.variable === 'gistemp' ? leftClimate.overlay : null;
  const globeCompare = useMemo<GlobeCompare | null>(
    () =>
      comparing
        ? { imagery: leftImagery, data: leftData, leftLabel: String(leftYear), rightLabel: String(state.year), handleLabel: s.timeline.handle }
        : null,
    [comparing, leftImagery, leftData, leftYear, state.year, s.timeline.handle],
  );
  const compareStart = state.variable === 'gistemp' ? 1950 : yearRange[0];

  // Analysis
  const analysis = useAnalysis(state.chartVariable, state.regionA, state.regionB, state.season, from, Math.max(from + 1, to), state.chartView);

  // Event marks for the chart: only for this variable, and regional ones only where A or B is.
  const marks = useMemo(() => {
    const boxes = [state.regionA, state.regionB].filter((r) => r !== null).map((r) => regionBox(r));
    return eventsFor(state.chartVariable, boxes).map((e) => ({ year: e.year, label: e.label[lang], detail: e.detail[lang], source: e.source }));
  }, [state.chartVariable, state.regionA, state.regionB, lang]);

  // Clicking a year on the chart shows it on the globe: the map layer if it has years, otherwise
  // the chart variable's own layer.
  const onPickYear = (year: number, month?: number) => {
    if (month) dispatch({ type: 'month', month });
    const target = variable && (variable.imagery || variable.id === 'gistemp') ? variable : chartVariable.imagery || chartVariable.id === 'gistemp' ? chartVariable : null;
    if (!target) return;
    if (target.id !== state.variable) dispatch({ type: 'variable', id: target.id });
    if (target.id === 'gistemp') dispatch({ type: 'mode', mode: 'year' });
    const [lo, hi] = target.imagery ? imageryYears(target.imagery) : GISTEMP_YEARS;
    dispatch({ type: 'year', year: Math.min(hi, Math.max(lo, year)) });
  };

  // Hints about anomalies: marks on the globe when zoomed in, a card when clicked.
  const [hintId, setHintId] = useState<string | null>(null);
  const globeHints = useMemo<GlobeHint[]>(() => hints.map((h) => ({ id: h.id, lat: h.lat, lon: h.lon, label: h.title[lang] })), [lang]);
  const onHint = useCallback((id: string) => {
    setHintId(id);
    dispatch({ type: 'panel', panel: null });
  }, []);

  const markers = useMemo<GlobeMarker[]>(() => {
    const out: GlobeMarker[] = [];
    if (state.regionA) out.push({ id: 'A', ...regionCentre(state.regionA), label: regionName(state.regionA, lang) });
    if (state.regionB) out.push({ id: 'B', ...regionCentre(state.regionB), label: regionName(state.regionB, lang) });
    return out;
  }, [state.regionA, state.regionB, lang]);

  // Playback: one year per step. Imagery for the next year is loaded first and the step waits
  // for it, so every frame shows a complete layer instead of a bare map.
  useEffect(() => {
    if (!state.playing) return;
    if (state.year >= yearRange[1]) {
      dispatch({ type: 'play', on: false });
      return;
    }
    let cancelled = false;
    const next = state.year + 1;
    const dwell = (variable?.imagery ? 900 : 450) / state.speed;
    const started = performance.now();
    const source = variable?.imagery ? imageryFor(next)?.source : null;
    const loaded = source && globe.current ? globe.current.preload(source) : Promise.resolve();
    void loaded.then(() => {
      const left = Math.max(0, dwell - (performance.now() - started));
      window.setTimeout(() => {
        if (!cancelled) dispatch({ type: 'year', year: next });
      }, left);
    });
    return () => {
      cancelled = true;
    };
  }, [state.playing, state.speed, state.year, yearRange, variable, imageryFor]);

  const onPlay = (on: boolean) => {
    if (on) {
      if (state.variable === 'gistemp' && state.gistempMode !== 'year') dispatch({ type: 'mode', mode: 'year' });
      if (state.year >= yearRange[1]) dispatch({ type: 'year', year: state.variable === 'gistemp' ? Math.max(yearRange[0], state.from) : yearRange[0] });
    }
    dispatch({ type: 'play', on });
  };

  // Share link follows the state.
  const query = toQuery(state, view);
  const shareUrl = `${window.location.origin}${window.location.pathname}?${query}`;
  useEffect(() => {
    const id = window.setTimeout(() => window.history.replaceState(window.history.state, '', `${window.location.pathname}?${query}`), 400);
    return () => window.clearTimeout(id);
  }, [query]);

  const openCase = useCallback((c: Case) => {
    dispatch({ type: 'case', c });
    dispatch({ type: 'panel', panel: null });
    globe.current?.flyTo(c.camera.lat, c.camera.lon, c.camera.distance);
  }, []);

  const onFound = useCallback(
    (country: Country) => {
      dispatch({ type: 'borders', on: true });
      dispatch({ type: 'weatherAt', place: { lat: country.lat, lon: country.lon, name: { uk: countryName(country.code, 'uk'), en: countryName(country.code, 'en') } } });
      globe.current?.flyTo(country.lat, country.lon, country.big ? 2.2 : 1.45);
    },
    [],
  );

  const onCountry = useCallback((slot: Slot, c: GeoCountry) => {
    setMissedCountry(false);
    dispatch({ type: 'region', slot, region: countryRegion(c) });
    globe.current?.flyTo(c.label[0], c.label[1], c.area > 3e6 ? 2.6 : c.area > 3e5 ? 1.9 : 1.5);
  }, []);

  const onPick = useCallback(
    (p: GlobePoint) => {
      setMissedCountry(false);
      dispatch({ type: 'weatherAt', place: { lat: p.lat, lon: p.lon } });
      // With the weather panel open, a click only moves the weather place.
      if (state.panel === 'weather' && !state.picking) return;
      const slot = state.picking ?? 'A';
      if (state.pickMode === 'country') {
        void countryAt(p.lat, p.lon).then((c) => {
          if (c) dispatch({ type: 'region', slot, region: countryRegion(c) });
          else setMissedCountry(true);
        });
        return;
      }
      dispatch({ type: 'region', slot, region: { kind: 'point', lat: p.lat, lon: p.lon, radiusKm: state.radiusKm } });
    },
    [state.picking, state.radiusKm, state.pickMode, state.panel],
  );

  // Temperature, humidity, rain and wind under the pointer for the timeline month (NASA POWER).
  const pointClimate = usePointClimate(hover, state.year, state.month);
  let climateLine: string | null = null;
  if (hover) {
    const v = pointClimate.values;
    if (pointClimate.status === 'error') climateLine = s.readout.error;
    else if (!v) climateLine = s.readout.loading;
    else {
      const f1 = numberFormat(lang, 1, false);
      const f0 = numberFormat(lang, 0, false);
      const parts = [
        v.temp !== null && `${s.readout.temp} ${f1(v.temp)} °C`,
        v.humidity !== null && `${s.readout.humidity} ${f0(v.humidity)}%`,
        v.precip !== null && `${s.readout.precip} ${f0(v.precip)} ${lang === 'uk' ? 'мм' : 'mm'}`,
        v.wind !== null && `${s.readout.wind} ${f1(v.wind)} ${lang === 'uk' ? 'м/с' : 'm/s'}`,
      ].filter(Boolean);
      climateLine = `${s.readout.month(s.timeline.months[v.month - 1].toLowerCase(), v.year)}${v.clamped ? ` ${s.readout.clamped(v.year)}` : ''}: ${parts.join(' · ')}`;
    }
  }

  // Value under the pointer for the climate layer.
  let readout: string | null = null;
  if (hover) {
    const where = formatPoint(hover.lat, hover.lon, lang);
    if (state.variable === 'gistemp' && climate.data && climate.field) {
      const v = climate.field.values[cellIndex(climate.data.meta, hover.lat, hover.lon)];
      const unit = state.gistempMode === 'trend' ? t.explore.readout.perDecade : '°C';
      readout = Number.isFinite(v) ? `${where}: ${numberFormat(lang, state.gistempMode === 'trend' ? 2 : 1)(v)} ${unit}` : `${where}: ${s.readout.noData}`;
    } else {
      readout = where;
    }
  }

  const panelTitle = state.panel ? s.rail[state.panel] : '';

  return (
    <main className="explore studio">
      <h1 className="visually-hidden">Earth System Detective: 3D</h1>
      <Globe
        label={t.explore.globe}
        fallback={t.explore.unavailable}
        lang={lang}
        data={climate.overlay}
        imagery={imagery}
        showBorders={state.borders}
        vector={vector}
        markers={markers}
        compare={globeCompare}
        hints={globeHints}
        geo={geoLabels}
        borderLines={borderLines}
        labelLayers={state.labels}
        outlines={outlines}
        onHint={onHint}
        onHover={setHover}
        onPick={onPick}
        onView={setView}
        onLoadingChange={setLoading}
        apiRef={globe}
      />
      <TopBar back center={<CountrySearch onFound={onFound} />} />
      <Rail
        panel={state.panel}
        analysisOpen={state.analysisOpen}
        onPanel={(panel) => dispatch({ type: 'panel', panel })}
        onAnalysis={(open) => dispatch({ type: 'analysis', open })}
      />

      {state.panel && (
        <Flyout title={panelTitle} onClose={() => dispatch({ type: 'panel', panel: null })}>
          {state.panel === 'layers' && (
            <LayersPanel
              variable={state.variable}
              mode={state.gistempMode}
              borders={state.borders}
              labels={state.labels}
              onLabels={(labels) => dispatch({ type: 'labels', labels })}
              year={state.year}
              month={state.month}
              from={state.from}
              to={state.to}
              globalValue={climate.global?.value ?? null}
              war={state.war}
              warData={war.data}
              warStatus={war.status}
              onWar={(on) => dispatch({ type: 'war', on })}
              onVariable={(id) => dispatch({ type: 'variable', id })}
              onMode={(mode) => dispatch({ type: 'mode', mode })}
              onBorders={(on) => dispatch({ type: 'borders', on })}
            />
          )}
          {state.panel === 'cases' && <CasesPanel activeId={state.caseId} onOpen={openCase} />}
          {state.panel === 'weather' && (
            <WeatherPanel
              place={state.weatherAt}
              regionA={state.regionA}
              regionB={state.regionB}
              onPlace={(place) => {
                dispatch({ type: 'weatherAt', place });
                globe.current?.flyTo(place.lat, place.lon, 1.8);
              }}
            />
          )}
          {state.panel === 'glossary' && <GlossaryPanel />}
          {state.panel === 'share' && <SharePanel url={shareUrl} />}
        </Flyout>
      )}

      {state.analysisOpen && (
        <AnalysisDrawer
          chartVariable={state.chartVariable}
          regionA={state.regionA}
          regionB={state.regionB}
          picking={state.picking}
          pickMode={state.pickMode}
          chartView={state.chartView}
          missedCountry={missedCountry}
          onPickMode={(mode) => dispatch({ type: 'pickMode', mode })}
          onCountry={onCountry}
          onChartView={(v) => dispatch({ type: 'chartView', view: v })}
          radiusKm={state.radiusKm}
          season={state.season}
          from={from}
          to={to}
          activeCase={activeCase}
          analysis={analysis}
          marks={marks}
          mapYear={showYear ? state.year : null}
          onPickYear={onPickYear}
          onClose={() => dispatch({ type: 'analysis', open: false })}
          onChartVariable={(id) => dispatch({ type: 'chartVariable', id })}
          onPick={(slot) => dispatch({ type: 'picking', slot })}
          onRemoveB={() => dispatch({ type: 'region', slot: 'B', region: null })}
          onRadius={(km) => dispatch({ type: 'radius', km })}
          onSeason={(season) => dispatch({ type: 'season', season })}
        />
      )}

      {(variable || state.analysisOpen) && (
        <Timeline
          year={showYear ? state.year : null}
          yearRange={yearRange}
          month={variable?.imagery?.time === 'monthly' ? state.month : null}
          from={state.variable === 'gistemp' ? state.from : from}
          to={state.variable === 'gistemp' ? state.to : to}
          periodRange={periodRange}
          playing={state.playing}
          speed={state.speed}
          canPlay={canPlay}
          compare={comparing ? leftYear : null}
          compareStart={compareStart}
          onCompare={(year) => dispatch({ type: 'compare', year })}
          onYear={(year) => dispatch({ type: 'year', year })}
          onMonth={(month) => dispatch({ type: 'month', month })}
          onPeriod={(f, tt) => dispatch({ type: 'period', from: f, to: tt })}
          onPlay={onPlay}
          onSpeed={(speed) => dispatch({ type: 'speed', speed })}
        />
      )}

      {hintId && hintById[hintId] && (
        <HintCard
          hint={hintById[hintId]}
          onClose={() => setHintId(null)}
          onOpenCase={(id) => {
            const c = cases.find((x) => x.id === id);
            setHintId(null);
            if (c) openCase(c);
          }}
        />
      )}

      {readout && (
        <p className="readout-chip">
          <span>{readout}</span>
          {climateLine && <span className="readout-chip__climate">{climateLine}</span>}
        </p>
      )}
      {loading && (
        <p className="explore__status" role="status">
          {s.imagery}
        </p>
      )}
    </main>
  );
}
