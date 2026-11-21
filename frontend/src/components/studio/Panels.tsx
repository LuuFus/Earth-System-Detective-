import { useEffect, useState, type ReactNode } from 'react';
import { entryText, loadColorMap, type ColorMap } from '../../data/colormaps';
import { useLiveText } from '../../i18n/live';
import { cases, type Case, type GistempMode } from '../../data/cases';
import { RAMP_CSS } from '../../data/gistemp';
import { glossary } from '../../data/glossary';
import type { WarData } from '../../data/war';
import { groups, imageryDate, variableById, variables, type VariableId } from '../../data/variables';
import { RANGE } from '../../hooks/useClimateLayer';
import { useI18n } from '../../i18n/I18n';
import { numberFormat } from '../../i18n/format';
import { useStudio } from '../../i18n/useStudio';
import type { LabelLayers } from '../../state/explore';
import { HINT_KINDS, type HintKind } from '../../data/hints';
import { photos, photoUrl, type Photo } from '../../data/photos';
import { Icon, type IconName } from './Icon';

export function Flyout({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const s = useStudio();
  return (
    <section className="flyout" id="studio-panel" aria-label={title}>
      <header className="flyout__head">
        <h2 className="flyout__title">{title}</h2>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={s.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="flyout__body">{children}</div>
    </section>
  );
}

// ---------- Layers ----------

type LayersProps = {
  variable: VariableId | null;
  mode: GistempMode;
  borders: boolean;
  labels: LabelLayers;
  year: number;
  month: number;
  from: number;
  to: number;
  globalValue: number | null;
  war: boolean;
  warData: WarData | null;
  warStatus: 'idle' | 'loading' | 'ready' | 'error';
  onVariable: (id: VariableId | null) => void;
  onMode: (mode: GistempMode) => void;
  onBorders: (on: boolean) => void;
  onLabels: (labels: Partial<LabelLayers>) => void;
  onWar: (on: boolean) => void;
};

export function LayersPanel(p: LayersProps) {
  const { lang } = useI18n();
  const s = useStudio();
  const v = p.variable ? variableById[p.variable] : null;

  return (
    <>
      <label className="switch">
        <input type="checkbox" checked={p.borders} onChange={(e) => p.onBorders(e.target.checked)} />
        <span className="switch__track" aria-hidden="true" />
        <span className="switch__text">{s.layers.borders}</span>
      </label>
      {p.borders && (
        <div className="sublayers">
          {(['capitals', 'seas', 'rivers'] as const).map((k) => (
            <label key={k} className="check">
              <input type="checkbox" checked={p.labels[k]} onChange={(e) => p.onLabels({ [k]: e.target.checked })} />
              <span className={`check__swatch check__swatch--${k}`} aria-hidden="true" />
              <span>{s.layers[k]}</span>
            </label>
          ))}
          <p className="legend__src">
            <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">
              {s.layers.geoSource}
            </a>
          </p>
        </div>
      )}

      {v && (
        <section className="layer-now">
          <div className="layer-now__head">
            <span className="layer-now__thumb">
              <LayerThumb id={v.id} />
            </span>
            <div>
              <p className="layer-now__kicker">{s.activeLayer}</p>
              <h3 className="layer-now__name">{v.name[lang]}</h3>
            </div>
            <button type="button" className="chip-btn" onClick={() => p.onVariable(null)}>
              <Icon name="close" size={14} />
              {s.exitLayer}
            </button>
          </div>
          <p className="note">
            {v.definition[lang]}{' '}
            <a href={v.sourceUrl} target="_blank" rel="noreferrer">
              {v.source[lang]}
            </a>
          </p>
        </section>
      )}

      {p.variable === 'gistemp' && (
        <fieldset className="seg">
          <legend className="visually-hidden">{s.layers.mode}</legend>
          {(['year', 'compare', 'trend'] as GistempMode[]).map((m) => (
            <label key={m} className="seg__item">
              <input type="radio" name="gistemp-mode" checked={p.mode === m} onChange={() => p.onMode(m)} />
              <span>{s.layers.modes[m]}</span>
            </label>
          ))}
        </fieldset>
      )}

      {v && <Legend {...p} />}
      {v?.pendingNumbers && <p className="note">{s.layers.pending}</p>}

      {groups.map((g) => (
        <section key={g.id} className="shelf" aria-label={g.name[lang]}>
          <h3 className="shelf__title">{g.name[lang]}</h3>
          <div className="shelf__row">
            {variables
              .filter((x) => x.group === g.id)
              .map((x) => (
                <button
                  key={x.id}
                  type="button"
                  className="layer-card"
                  aria-pressed={p.variable === x.id}
                  title={x.definition[lang]}
                  onClick={() => p.onVariable(p.variable === x.id ? null : x.id)}
                >
                  <span className="layer-card__img">
                    <LayerThumb id={x.id} />
                    {x.series && <span className="layer-card__badge">{s.layers.numbers}</span>}
                  </span>
                  <span className="layer-card__name">{x.name[lang]}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}

const WMS = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0&STYLES=&CRS=EPSG:4326&BBOX=-60,-180,85,180&WIDTH=256&HEIGHT=104';

/** A small world picture of a layer, drawn by NASA GIBS over the relief map. */
export function LayerThumb({ id }: { id: VariableId }) {
  const v = variableById[id];
  const base = `${WMS}&LAYERS=BlueMarble_ShadedRelief_Bathymetry&FORMAT=image/jpeg`;
  if (!v.imagery) {
    // GISTEMP: its own colour ramp.
    return <span className="layer-thumb layer-thumb--ramp" style={{ background: `linear-gradient(120deg, ${RAMP_CSS.join(', ')})` }} />;
  }
  const img = v.imagery;
  const year = Number(img.last.slice(0, 4)) - (img.static ? 0 : 1);
  const date = img.time === 'daily' ? imageryDate(img, year) : imageryDate(img, year, img.month);
  const layer = `${WMS}&LAYERS=${img.layer}&FORMAT=image/png&TRANSPARENT=TRUE${img.static ? '' : `&TIME=${date}`}`;
  return (
    <span className="layer-thumb">
      {v.id !== 'truecolor' && <img src={base} alt="" loading="lazy" />}
      <img src={layer} alt="" loading="lazy" />
    </span>
  );
}

export function WarLegend({ data, status }: { data: WarData | null; status: 'idle' | 'loading' | 'ready' | 'error' }) {
  const { lang } = useI18n();
  const s = useStudio();
  if (status === 'loading') return <p className="note" role="status">{s.layers.warLoading}</p>;
  if (status === 'error' || !data) return status === 'error' ? <p className="note" role="alert">{s.layers.warError}</p> : null;
  return (
    <figure className="legend legend--war">
      <ul className="war-keys">
        <li>
          <span className="war-key war-key--occupied" aria-hidden="true" />
          {s.layers.warOccupied}
        </li>
        <li>
          <span className="war-key war-key--partly" aria-hidden="true" />
          {s.layers.warPartly}
        </li>
        <li>
          <span className="war-key war-key--combat" aria-hidden="true" />
          {s.layers.warCombat}
        </li>
      </ul>
      <p className="legend__src">
        <a href={data.url} target="_blank" rel="noreferrer">
          {s.layers.warSource(data.edition)}
        </a>{' '}
        {s.layers.warCounts(data.counts.settlementsOccupied, data.counts.settlementsListed)}{' '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          {data.boundaries.replace('ODbL', lang === 'uk' ? 'ліцензія ODbL' : 'ODbL')}
        </a>
      </p>
    </figure>
  );
}

export function Legend(p: Pick<LayersProps, 'variable' | 'mode' | 'year' | 'month' | 'from' | 'to' | 'globalValue'>) {
  const { lang } = useI18n();
  const s = useStudio();
  const v = p.variable ? variableById[p.variable] : null;
  const [broken, setBroken] = useState<string | null>(null);
  if (!v) return null;

  if (v.id === 'gistemp') {
    const range = RANGE[p.mode];
    const fmt = numberFormat(lang, p.mode === 'trend' ? 1 : 0);
    const ticks = [-range, -range / 2, 0, range / 2, range];
    const title = p.mode === 'year' ? s.layers.legendYear(p.year) : p.mode === 'compare' ? s.layers.legendCompare(p.from, p.to) : s.layers.legendTrend(p.from, p.to);
    return (
      <figure className="legend">
        <figcaption className="legend__title">{title}</figcaption>
        <div className="legend__bar" style={{ background: `linear-gradient(to right, ${RAMP_CSS.join(', ')})` }} aria-hidden="true" />
        <div className="legend__ticks" aria-hidden="true">
          {ticks.map((t, i) => (
            <span key={t}>
              {i === 0 ? '≤' : i === ticks.length - 1 ? '≥' : ''}
              {fmt(t)}
            </span>
          ))}
        </div>
        {p.mode === 'trend' && (
          <p className="legend__weak">
            <span className="legend__hatch" aria-hidden="true" />
            {s.layers.legendWeak}
          </p>
        )}
      </figure>
    );
  }

  if (!v.imagery) return null;
  const url = `https://gibs.earthdata.nasa.gov/legends/${v.imagery.layer}_H.svg`;
  const date = v.imagery.time === 'daily' ? imageryDate(v.imagery, p.year) : imageryDate(v.imagery, p.year, p.month);
  return (
    <figure className="legend">
      <figcaption className="legend__title">
        {v.name[lang]}: {s.layers.imageryDate} {date}
      </figcaption>
      {v.imagery.gapFill && (() => {
        const fill = v.imagery.gapFill.find((f) => date >= f.first);
        return fill ? <p className="legend__src">{s.hints.gapFill(fill.name[lang])}</p> : null;
      })()}
      {v.imagery.fillDays && <p className="legend__src">{s.layers.fillDays(v.imagery.fillDays)}</p>}
      {v.imagery.points ? (
        <p className="legend__points">
          <span className="legend__dot" aria-hidden="true" />
          {s.layers.legendFires}
        </p>
      ) : (
        v.id !== 'truecolor' && <ColormapLegend id={v.id} fallback={broken !== url ? <img className="legend__img" src={url} alt={`${s.layers.legendOfficial}: ${v.name[lang]}`} loading="lazy" onError={() => setBroken(url)} /> : null} />
      )}
      <p className="legend__src">
        <a href={v.sourceUrl} target="_blank" rel="noreferrer">
          {v.source[lang]}
        </a>
      </p>
    </figure>
  );
}

// ---------- Cases ----------

/** Each event's picture and kind, for finding it at a glance. */
const CASE_LOOK: Record<string, { photo?: Photo; kind: HintKind }> = {
  'usa-canada': { photo: photos.niagara, kind: 'heat' },
  'kyiv-odesa': { photo: photos.odesa, kind: 'heat' },
  arctic: { photo: photos.meltPond, kind: 'ice' },
  warminghole: { kind: 'water' },
  aral: { photo: photos.aral, kind: 'drought' },
  kakhovka: { photo: photos.kherson, kind: 'war' },
  ozone: { photo: photos.halley, kind: 'ozone' },
  sahel: { photo: photos.sahel, kind: 'drought' },
  ukraine: { photo: photos.fields, kind: 'heat' },
  'ukraine-war': { photo: photos.kyivDark, kind: 'war' },
};

export function CasesPanel({ activeId, onOpen }: { activeId: string | null; onOpen: (c: Case) => void }) {
  const { lang } = useI18n();
  const s = useStudio();
  return (
    <>
      <p className="note">{s.cases.intro}</p>
      <ol className="cases">
        {cases.map((c) => {
          const look = CASE_LOOK[c.id] ?? { kind: 'heat' as HintKind };
          const k = HINT_KINDS[look.kind];
          return (
            <li key={c.id}>
              <button type="button" className="case-card" aria-current={activeId === c.id ? 'true' : undefined} onClick={() => onOpen(c)}>
                <span className="case-card__img" style={{ ['--hint' as string]: k.color }}>
                  {look.photo ? <img src={photoUrl(look.photo, 320)} alt="" loading="lazy" /> : <Icon name={k.icon as IconName} size={34} />}
                  <span className="case-card__kind">
                    <Icon name={k.icon as IconName} size={14} />
                  </span>
                </span>
                <span className="case-card__words">
                  <span className="case-card__title">{c.title[lang]}</span>
                  <span className="case-card__text">{c.story[lang]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

// ---------- Glossary ----------

export function GlossaryPanel() {
  const { lang } = useI18n();
  return (
    <dl className="glossary">
      {glossary.map((g) => (
        <div key={g.id} className="glossary__item" id={`term-${g.id}`}>
          <dt>{g.term[lang]}</dt>
          <dd>{g.text[lang]}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Share ----------

export function SharePanel({ url }: { url: string }) {
  const s = useStudio();
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  };
  return (
    <>
      <p className="note">{s.share.intro}</p>
      <label className="field">
        <span className="field__label">{s.share.link}</span>
        <input className="field__input" readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
      </label>
      <button type="button" className="btn" onClick={copy}>
        <Icon name="copy" size={18} />
        {s.share.copy}
      </button>
      {status !== 'idle' && (
        <p className="note" role="status">
          {status === 'copied' ? s.share.copied : s.share.copyFailed}
        </p>
      )}
    </>
  );
}

/** The layer's own colour scale from NASA GIBS, with values in plain units, or its classes. */
function ColormapLegend({ id, fallback }: { id: VariableId; fallback: ReactNode }) {
  const { lang } = useI18n();
  const t = useLiveText().layerScale;
  const [map, setMap] = useState<ColorMap | null | 'loading'>('loading');
  useEffect(() => {
    let cancelled = false;
    setMap('loading');
    void loadColorMap(id).then((m) => !cancelled && setMap(m));
    return () => {
      cancelled = true;
    };
  }, [id]);
  if (map === 'loading') return null;
  if (!map) return <>{fallback}</>;
  if (!map.numeric) {
    const seen = new Set<string>();
    const classes = map.entries.filter((e) => e.label && !seen.has(e.label) && seen.add(e.label));
    return (
      <div className="cm-legend">
        <ul className="cm-legend__classes">
          {classes.map((e) => (
            <li key={e.label}>
              <i style={{ background: `rgb(${e.r},${e.g},${e.b})` }} />
              {entryText(id, e, lang)}
            </li>
          ))}
        </ul>
        <p className="note">{t.hover}</p>
      </div>
    );
  }
  const n = map.entries.length;
  const stops = Array.from({ length: 24 }, (_, i) => map.entries[Math.round((i / 23) * (n - 1))]);
  const ticks = [0, 0.5, 1].map((f) => map.entries[Math.round(f * (n - 1))]);
  return (
    <div className="cm-legend">
      <span className="cm-legend__bar" style={{ background: `linear-gradient(90deg, ${stops.map((e) => `rgb(${e.r},${e.g},${e.b})`).join(', ')})` }} aria-hidden="true" />
      <span className="cm-legend__ticks">
        {ticks.map((e, i) => (
          <span key={i}>{entryText(id, e, lang).replace(/^≈ /, '')}</span>
        ))}
      </span>
      <p className="note">
        {t.lowHigh} {t.hover}
      </p>
    </div>
  );
}
