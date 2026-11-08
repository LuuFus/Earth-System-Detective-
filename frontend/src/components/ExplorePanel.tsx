import { useId, useState } from 'react';
import { cellIndex, RAMP_CSS } from '../data/gistemp';
import { RANGE, SIGNIFICANCE, type ClimateMode, type ClimateState } from '../hooks/useClimateLayer';
import { useI18n } from '../i18n/I18n';
import type { Lang } from '../i18n/strings';
import type { GlobePoint } from './Globe';

type Props = {
  showBorders: boolean;
  onBorders: (on: boolean) => void;
  climateOn: boolean;
  onClimate: (on: boolean) => void;
  mode: ClimateMode;
  onMode: (mode: ClimateMode) => void;
  year: number;
  onYear: (year: number) => void;
  from: number;
  to: number;
  onRange: (from: number, to: number) => void;
  climate: ClimateState;
  point: GlobePoint | null;
};

function numberFormat(lang: Lang, digits: number, signed = true) {
  return new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  });
}

function formatPoint(p: GlobePoint, lang: Lang): string {
  const f = numberFormat(lang, 1, false);
  const lat = f.format(Math.abs(p.lat));
  const lon = f.format(Math.abs(p.lon));
  if (lang === 'uk') return `${lat}° ${p.lat >= 0 ? 'пн. ш.' : 'пд. ш.'}, ${lon}° ${p.lon >= 0 ? 'сх. д.' : 'зх. д.'}`;
  return `${lat}° ${p.lat >= 0 ? 'N' : 'S'}, ${lon}° ${p.lon >= 0 ? 'E' : 'W'}`;
}

function formatP(p: number, lang: Lang): string {
  // Non-breaking spaces keep "p < 0,001" on one line.
  if (p < 0.001) return lang === 'uk' ? 'p\u00a0<\u00a00,001' : 'p\u00a0<\u00a00.001';
  return `p\u00a0=\u00a0${numberFormat(lang, 3, false).format(p)}`;
}

function YearSlider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const id = useId();
  return (
    <div className="slider-row">
      <label className="slider-row__label" htmlFor={id}>
        {label}
      </label>
      <input id={id} className="slider-row__input" type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <output className="slider-row__value" htmlFor={id}>
        {value}
      </output>
    </div>
  );
}

/** Floating panel over the globe: layer switches, the GISTEMP controls, the legend and the value under the pointer. */
export function ExplorePanel(props: Props) {
  const { lang, t } = useI18n();
  const e = t.explore;
  // Open on wide screens; on phones the globe comes first and the panel waits behind its header.
  const [open, setOpen] = useState(() => window.innerWidth > 720);
  const { climate, mode, year, from, to } = props;
  const meta = climate.data?.meta;
  const minYear = meta?.startYear ?? 1880;
  const maxYear = meta?.endYear ?? 2025;
  const range = RANGE[mode];
  const unitDigits = mode === 'trend' ? 2 : 1;
  const fmt = numberFormat(lang, unitDigits);
  const ticks = [-range, -range / 2, 0, range / 2, range];

  const legendTitle = mode === 'year' ? e.legend.year(year) : mode === 'compare' ? e.legend.compare(from, to) : e.legend.trend(from, to);

  let readout: string | null = null;
  if (props.point && meta && climate.field) {
    const i = cellIndex(meta, props.point.lat, props.point.lon);
    const v = climate.field.values[i];
    const where = formatPoint(props.point, lang);
    if (!Number.isFinite(v)) readout = `${where}: ${e.readout.noData}`;
    else if (mode === 'trend') {
      const p = climate.field.pValues?.[i] ?? NaN;
      const verdict = p < SIGNIFICANCE ? e.readout.significant : e.readout.weak;
      readout = `${where}: ${fmt.format(v)} ${e.readout.perDecade}, ${formatP(p, lang)}, ${verdict}`;
    } else readout = `${where}: ${fmt.format(v)} °C`;
  } else if (props.point) {
    readout = formatPoint(props.point, lang);
  }

  const modes: ClimateMode[] = ['year', 'compare', 'trend'];

  return (
    <aside className={`panel${open ? '' : ' panel--closed'}`} aria-label={e.layers.title}>
      <div className="panel__head">
        <h2 className="panel__title">{e.layers.title}</h2>
        <button type="button" className="panel__toggle" aria-expanded={open} aria-controls="panel-body" onClick={() => setOpen((o) => !o)}>
          <span className="visually-hidden">{open ? e.layers.close : e.layers.open}</span>
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false" className="panel__chevron">
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </button>
      </div>

      <div className="panel__body" id="panel-body" hidden={!open}>
        <label className="switch">
          <input type="checkbox" checked={props.showBorders} onChange={(ev) => props.onBorders(ev.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__text">{e.layers.borders}</span>
        </label>

        <label className="switch">
          <input type="checkbox" checked={props.climateOn} onChange={(ev) => props.onClimate(ev.target.checked)} />
          <span className="switch__track" aria-hidden="true" />
          <span className="switch__text">
            {e.layers.climate}
            <span className="switch__note">{e.layers.climateNote}</span>
          </span>
        </label>

        {props.climateOn && (
          <div className="climate">
            {climate.status === 'loading' && <p className="panel__status" role="status">{e.loading}</p>}
            {climate.status === 'error' && (
              <p className="panel__status" role="alert">
                {e.loadError}{' '}
                <button type="button" className="text-btn" onClick={climate.retry}>
                  {e.retry}
                </button>
              </p>
            )}

            <fieldset className="seg">
              <legend className="visually-hidden">{e.modes.label}</legend>
              {modes.map((m) => (
                <label key={m} className="seg__item">
                  <input type="radio" name="climate-mode" value={m} checked={mode === m} onChange={() => props.onMode(m)} />
                  <span>{e.modes[m]}</span>
                </label>
              ))}
            </fieldset>

            {mode === 'year' ? (
              <YearSlider label={e.year} value={year} min={minYear} max={maxYear} onChange={props.onYear} />
            ) : (
              <>
                <YearSlider label={e.from} value={from} min={minYear} max={maxYear - 10} onChange={(v) => props.onRange(v, Math.max(to, v + 10))} />
                <YearSlider label={e.to} value={to} min={minYear + 10} max={maxYear} onChange={(v) => props.onRange(Math.min(from, v - 10), v)} />
              </>
            )}

            <figure className="legend">
              <figcaption className="legend__title">{legendTitle}</figcaption>
              <div className="legend__bar" style={{ background: `linear-gradient(to right, ${RAMP_CSS.join(', ')})` }} aria-hidden="true" />
              <div className="legend__ticks" aria-hidden="true">
                {ticks.map((v, i) => (
                  <span key={v}>
                    {i === 0 ? '≤' : i === ticks.length - 1 ? '≥' : ''}
                    {numberFormat(lang, mode === 'trend' ? 1 : 0).format(v)}
                  </span>
                ))}
              </div>
              {mode === 'trend' && (
                <p className="legend__weak">
                  <span className="legend__hatch" aria-hidden="true" />
                  {e.legend.weak}
                </p>
              )}
              {climate.global && (
                <p className="legend__global">
                  {e.legend.global}: {fmt.format(climate.global.value)} {mode === 'trend' ? e.readout.perDecade : '°C'}
                  {climate.global.p !== undefined && `, ${formatP(climate.global.p, lang)}`}
                </p>
              )}
              {climate.computing && (
                <p className="panel__status" role="status">
                  {e.computing}
                </p>
              )}
            </figure>

            <p className="readout">{readout ?? e.readout.hint}</p>
            <p className="panel__source">
              <a href="https://data.giss.nasa.gov/gistemp/" target="_blank" rel="noreferrer">
                {e.legend.source}
              </a>
              {meta && `, GISTEMP v4, ${meta.startYear}-${meta.endYear}`}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
