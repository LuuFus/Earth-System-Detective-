import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { entryText, loadColorMap, type ColorMap } from '../../data/colormaps';
import { useLiveText } from '../../i18n/live';
import { cases, type Case, type GistempMode } from '../../data/cases';
import { RAMP_CSS } from '../../data/gistemp';
import { GLOSSARY_GROUPS, glossary, type GlossaryGroup, type Term } from '../../data/glossary';
import type { WarData } from '../../data/war';
import { groups, imageryDate, variableById, variables, type VariableId } from '../../data/variables';
import { RANGE } from '../../hooks/useClimateLayer';
import { usePlacesText } from '../../i18n/places';
import { useI18n } from '../../i18n/I18n';
import { numberFormat } from '../../i18n/format';
import { useStudio } from '../../i18n/useStudio';
import type { LabelLayers } from '../../state/explore';
import { HINT_KINDS, hintsByDate, inTopic, whenText, type Hint, type HintKind, type NewsTopic } from '../../data/hints';
import { photos, photoUrl, type Photo } from '../../data/photos';
import { Icon, type IconName } from './Icon';

const FLYOUT_MIN = 300;
const FLYOUT_DEFAULT = 360;
const FLYOUT_WIDE = 600;
const FLYOUT_KEY = 'esd-flyout-width';

/** The widest the panel may be: the globe keeps at least a third of the window. */
function flyoutMax(): number {
  return Math.max(FLYOUT_MIN, Math.min(900, Math.round(window.innerWidth * 0.62) - 80));
}

function storedWidth(): number {
  try {
    const v = Number(localStorage.getItem(FLYOUT_KEY));
    return Number.isFinite(v) && v >= FLYOUT_MIN ? v : FLYOUT_DEFAULT;
  } catch {
    return FLYOUT_DEFAULT;
  }
}

/**
 * The panel that slides out of the tool rail. Its right edge can be dragged (or moved with the
 * arrow keys) to make it wider or narrower, and a button in the header switches between the
 * usual and a wide panel. The width is kept for the next visit.
 */
export function Flyout({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const s = useStudio();
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(storedWidth);
  const [dragging, setDragging] = useState(false);
  const clamp = (w: number) => Math.round(Math.min(flyoutMax(), Math.max(FLYOUT_MIN, w)));
  const shown = clamp(width);

  // The width lives on the studio, so the parts placed next to the panel (the fire-story player) follow it.
  useLayoutEffect(() => {
    const host = ref.current?.closest<HTMLElement>('.studio') ?? ref.current;
    host?.style.setProperty('--flyout-w', `${shown}px`);
  }, [shown]);
  useEffect(() => {
    if (dragging) return;
    try {
      localStorage.setItem(FLYOUT_KEY, String(width));
    } catch {
      // Private mode: the width just is not remembered.
    }
  }, [width, dragging]);
  // A smaller window may no longer fit a wide panel.
  const [, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((n) => n + 1);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const handle = e.currentTarget;
    const x0 = e.clientX;
    const w0 = ref.current?.getBoundingClientRect().width ?? shown;
    handle.setPointerCapture(e.pointerId);
    setDragging(true);
    const move = (ev: PointerEvent) => setWidth(clamp(w0 + ev.clientX - x0));
    const up = () => {
      setDragging(false);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
      handle.removeEventListener('pointercancel', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
    handle.addEventListener('pointercancel', up);
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 80 : 32;
    const next = e.key === 'ArrowRight' ? shown + step : e.key === 'ArrowLeft' ? shown - step : e.key === 'Home' ? FLYOUT_MIN : e.key === 'End' ? flyoutMax() : null;
    if (next === null) return;
    e.preventDefault();
    setWidth(clamp(next));
  };
  const wide = shown >= (FLYOUT_DEFAULT + FLYOUT_WIDE) / 2;

  return (
    <section ref={ref} className={`flyout${dragging ? ' flyout--dragging' : ''}`} id="studio-panel" aria-label={title}>
      <header className="flyout__head">
        <h2 className="flyout__title">{title}</h2>
        <div className="flyout__tools">
          <button
            type="button"
            className="icon-btn icon-btn--bare flyout__wide"
            aria-label={wide ? s.flyout.narrower : s.flyout.wider}
            title={wide ? s.flyout.narrower : s.flyout.wider}
            onClick={() => setWidth(clamp(wide ? FLYOUT_DEFAULT : FLYOUT_WIDE))}
          >
            <Icon name={wide ? 'narrow' : 'widen'} size={18} />
          </button>
          <button type="button" className="icon-btn icon-btn--bare" aria-label={s.close} onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>
      </header>
      <div className="flyout__body">{children}</div>
      <div
        className="flyout__resize"
        role="separator"
        aria-orientation="vertical"
        aria-label={s.flyout.resize}
        title={s.flyout.resize}
        aria-valuemin={FLYOUT_MIN}
        aria-valuemax={flyoutMax()}
        aria-valuenow={shown}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={onKey}
        onDoubleClick={() => setWidth(FLYOUT_DEFAULT)}
      />
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
  /** An event's exact day for daily imagery, or null. */
  day?: string | null;
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
  /** The Cities layer. */
  cities: boolean;
  onCities: (on: boolean) => void;
};

export function LayersPanel(p: LayersProps) {
  const { lang } = useI18n();
  const s = useStudio();
  const places = usePlacesText();
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
          <label className="check" title={places.layerNote}>
            <input type="checkbox" checked={p.cities} onChange={(e) => p.onCities(e.target.checked)} />
            <span className="check__swatch check__swatch--cities" aria-hidden="true" />
            <span>{places.layer}</span>
          </label>
          {p.cities && <p className="note">{places.layerNote}</p>}
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

export function Legend(p: Pick<LayersProps, 'variable' | 'mode' | 'year' | 'month' | 'day' | 'from' | 'to' | 'globalValue'>) {
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
  const exact = p.day && v.imagery.time === 'daily' && p.day.startsWith(String(p.year)) ? p.day : null;
  const date = exact ?? (v.imagery.time === 'daily' ? imageryDate(v.imagery, p.year) : imageryDate(v.imagery, p.year, p.month));
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

type EventsProps = {
  activeId: string | null;
  onOpen: (c: Case) => void;
  /** The news item open on the right, if any. */
  newsId: string | null;
  onNews: (h: Hint) => void;
};

/** The Events panel: news with dates, places, causes and consequences, and the investigations. */
export function EventsPanel(p: EventsProps) {
  const t = useLiveText().event;
  const [tab, setTab] = useState<'news' | 'cases'>('news');
  return (
    <>
      <div className="seg" role="tablist" aria-label={t.tabs.news}>
        {(['news', 'cases'] as const).map((k) => (
          <button key={k} type="button" role="tab" className="seg__btn" aria-selected={tab === k} aria-pressed={tab === k} onClick={() => setTab(k)}>
            {t.tabs[k]}
          </button>
        ))}
      </div>
      {tab === 'news' ? <NewsList activeId={p.newsId} onOpen={p.onNews} /> : <CasesPanel activeId={p.activeId} onOpen={p.onOpen} />}
    </>
  );
}

function NewsList({ activeId, onOpen }: { activeId: string | null; onOpen: (h: Hint) => void }) {
  const { lang } = useI18n();
  const t = useLiveText().event;
  const [topic, setTopic] = useState<NewsTopic>('all');
  const list = hintsByDate.filter((h) => inTopic(h, topic));
  return (
    <>
      <p className="note">{t.newsIntro}</p>
      <div className="chips" role="group" aria-label={t.tabs.news}>
        {(Object.keys(t.topics) as NewsTopic[]).map((k) => (
          <button key={k} type="button" className="chip-btn" aria-pressed={topic === k} onClick={() => setTopic(k)}>
            {t.topics[k]}
          </button>
        ))}
      </div>
      <p className="news-count">{t.count(list.length)}</p>
      <ol className="news">
        {list.map((h) => {
          const k = HINT_KINDS[h.kind];
          return (
            <li key={h.id}>
              <button type="button" className="news-card" aria-current={activeId === h.id ? 'true' : undefined} onClick={() => onOpen(h)}>
                <span className="news-card__img" style={{ ['--hint' as string]: k.color }}>
                  {h.photo ? <img src={photoUrl(h.photo, 240)} alt="" loading="lazy" /> : <Icon name={k.icon as IconName} size={26} />}
                  <span className="case-card__kind">
                    <Icon name={k.icon as IconName} size={12} />
                  </span>
                </span>
                <span className="news-card__words">
                  <time className="news-card__date" dateTime={h.when.from}>
                    {whenText(h.when, lang)}
                  </time>
                  <span className="news-card__title">{h.title[lang]}</span>
                  <span className="news-card__place">{h.place[lang]}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </>
  );
}

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

/** A formula line with x_i, Σ_{i<j} and ^(2/3) written as real subscripts and superscripts. */
function FormulaLine({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /_\{([^}]*)\}|_([A-Za-z0-9.]+)|\^\(([^)]*)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(m[3] !== undefined ? <sup key={m.index}>{m[3]}</sup> : <sub key={m.index}>{m[1] ?? m[2]}</sub>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return <span className="gloss-formula__line">{out}</span>;
}

/** Every term with its formula, how to read the numbers, an example and where it is on the site. */
export function GlossaryPanel() {
  const { lang } = useI18n();
  const t = useLiveText().glossary;
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<GlossaryGroup | 'all'>('all');
  const q = query.trim().toLowerCase();
  const match = (g: Term) =>
    (group === 'all' || g.group === group) &&
    (!q || [g.term[lang], g.text[lang], g.values?.[lang] ?? '', g.example?.[lang] ?? ''].some((x) => x.toLowerCase().includes(q)));
  const shown = GLOSSARY_GROUPS.map((gr) => ({ ...gr, terms: glossary.filter((g) => g.group === gr.id && match(g)) })).filter((gr) => gr.terms.length);
  return (
    <div className="gloss">
      <p className="note">{t.intro}</p>
      <label className="field gloss__search">
        <span className="visually-hidden">{t.search}</span>
        <Icon name="search" size={16} />
        <input className="field__input" type="search" value={query} placeholder={t.search} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <div className="chips" role="group" aria-label={t.groups}>
        <button type="button" className="chip-btn" aria-pressed={group === 'all'} onClick={() => setGroup('all')}>
          {t.all}
        </button>
        {GLOSSARY_GROUPS.map((gr) => (
          <button key={gr.id} type="button" className="chip-btn" aria-pressed={group === gr.id} onClick={() => setGroup(gr.id)}>
            {gr.name[lang]}
          </button>
        ))}
      </div>
      {!shown.length && <p className="note">{t.nothing}</p>}
      {shown.map((gr) => (
        <section key={gr.id} className="gloss__group" aria-label={gr.name[lang]}>
          <h3 className="gloss__group-title">{gr.name[lang]}</h3>
          {gr.terms.map((g) => (
            <article key={g.id} className="gloss-term" id={`term-${g.id}`}>
              <h4 className="gloss-term__name">{g.term[lang]}</h4>
              <p className="gloss-term__text">{g.text[lang]}</p>
              {g.formula && (
                <div className="gloss-formula" role="math" aria-label={t.formula}>
                  <span className="gloss-term__label">{t.formula}</span>
                  {g.formula.map((f, i) => (
                    <FormulaLine key={i} text={typeof f === 'string' ? (lang === 'en' ? f.replace(/(\d),(\d)/g, '$1.$2') : f) : f[lang]} />
                  ))}
                  {g.symbols && <p className="gloss-formula__symbols">{g.symbols[lang]}</p>}
                </div>
              )}
              <dl className="gloss-term__rows">
                {g.values && (
                  <div>
                    <dt>{t.values}</dt>
                    <dd>{g.values[lang]}</dd>
                  </div>
                )}
                {g.example && (
                  <div>
                    <dt>{t.example}</dt>
                    <dd>{g.example[lang]}</dd>
                  </div>
                )}
                {g.where && (
                  <div>
                    <dt>{t.where}</dt>
                    <dd>{g.where[lang]}</dd>
                  </div>
                )}
              </dl>
            </article>
          ))}
        </section>
      ))}
    </div>
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
