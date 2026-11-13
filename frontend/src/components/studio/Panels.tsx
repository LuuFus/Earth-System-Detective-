import { useState, type ReactNode } from 'react';
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
import { Icon } from './Icon';

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
  const [about, setAbout] = useState<VariableId | null>(null);
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

      <label className="switch">
        <input type="checkbox" checked={p.war} onChange={(e) => p.onWar(e.target.checked)} />
        <span className="switch__track" aria-hidden="true" />
        <span className="switch__text">{s.layers.war}</span>
      </label>
      {p.war && <WarLegend data={p.warData} status={p.warStatus} />}

      <fieldset className="vars">
        <legend className="visually-hidden">{s.layers.title}</legend>
        <label className="vars__item">
          <input type="radio" name="variable" checked={p.variable === null} onChange={() => p.onVariable(null)} />
          <span className="vars__name">{s.layers.none}</span>
          <span className="vars__badge">{s.layers.noneNote}</span>
        </label>
        {groups.map((g) => (
          <div key={g.id} className="vars__group">
            <p className="vars__group-name">{g.name[lang]}</p>
            {variables
              .filter((x) => x.group === g.id)
              .map((x) => (
                <div key={x.id} className="vars__row">
                  <label className="vars__item">
                    <input type="radio" name="variable" checked={p.variable === x.id} onChange={() => p.onVariable(x.id)} />
                    <span className="vars__name">{x.name[lang]}</span>
                    <span className={`vars__badge${x.series ? ' vars__badge--numbers' : ''}`}>{x.series ? s.layers.numbers : s.layers.mapOnly}</span>
                  </label>
                  <button
                    type="button"
                    className="icon-btn icon-btn--bare icon-btn--small"
                    aria-expanded={about === x.id}
                    aria-label={`${s.layers.about} ${x.name[lang]}`}
                    onClick={() => setAbout(about === x.id ? null : x.id)}
                  >
                    <Icon name="info" size={16} />
                  </button>
                  {about === x.id && (
                    <p className="vars__about">
                      {x.definition[lang]}{' '}
                      <a href={x.sourceUrl} target="_blank" rel="noreferrer">
                        {x.source[lang]}
                      </a>
                    </p>
                  )}
                </div>
              ))}
          </div>
        ))}
      </fieldset>

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
    </>
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
      ) : v.id !== 'truecolor' && broken !== url && (
        <img className="legend__img" src={url} alt={`${s.layers.legendOfficial}: ${v.name[lang]}`} loading="lazy" onError={() => setBroken(url)} />
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

export function CasesPanel({ activeId, onOpen }: { activeId: string | null; onOpen: (c: Case) => void }) {
  const { lang } = useI18n();
  const s = useStudio();
  return (
    <>
      <p className="note">{s.cases.intro}</p>
      <ol className="cases">
        {cases.map((c) => (
          <li key={c.id}>
            <button type="button" className="case-card" aria-current={activeId === c.id ? 'true' : undefined} onClick={() => onOpen(c)}>
              <span className="case-card__title">{c.title[lang]}</span>
              <span className="case-card__text">{c.story[lang]}</span>
            </button>
          </li>
        ))}
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
