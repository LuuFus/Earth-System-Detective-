// Two places side by side by everything the site can measure: people, industry, nature, what is
// happening now and the climate. Each number loads on its own and shows as soon as it arrives.

import { useEffect, useState } from 'react';
import type { Region } from '../../analysis/series';
import type { LiveManifest } from '../../data/live';
import { measure, METRICS, type Measure, type MetricDef, type MetricId, type PlaceInput } from '../../data/placeStats';
import { useI18n } from '../../i18n/I18n';
import { usePlacesText } from '../../i18n/places';

type Props = { regionA: Region | null; regionB: Region | null; manifest: LiveManifest | null };

const input = (r: Region | null): PlaceInput | null => (r?.kind === 'point' ? { lat: r.lat, lon: r.lon, radiusKm: r.radiusKm, city: r.city } : null);
const keyOf = (p: PlaceInput | null) => (p ? `${p.lat.toFixed(3)},${p.lon.toFixed(3)},${p.radiusKm}` : '');

/** Results of every metric for one place, filled in as they arrive. */
function useMeasures(place: PlaceInput | null, manifest: LiveManifest | null) {
  const [out, setOut] = useState<{ key: string; values: Partial<Record<MetricId, Measure>> }>({ key: '', values: {} });
  const key = keyOf(place);
  const hasManifest = !!manifest;
  useEffect(() => {
    if (!place) return;
    let cancelled = false;
    setOut({ key, values: {} });
    for (const m of METRICS) {
      void measure(m.id, place, manifest)
        .catch(() => null)
        .then((v) => !cancelled && setOut((o) => (o.key === key ? { key, values: { ...o.values, [m.id]: v } } : o)));
    }
    return () => {
      cancelled = true;
    };
    // The place is identified by its key; the manifest only matters once it arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, hasManifest]);
  return out.key === key ? out.values : {};
}

export function PlaceCompare({ regionA, regionB, manifest }: Props) {
  const { lang } = useI18n();
  const t = usePlacesText().compare;
  const a = input(regionA);
  const b = input(regionB);
  const va = useMeasures(a, manifest);
  const vb = useMeasures(b, manifest);
  if (!a) return <p className="note">{t.onlyPoints}</p>;
  const name = (r: Region | null, slot: string) => (r?.kind === 'point' && r.name ? r.name[lang] : slot);
  const nf = (digits: number) => new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: digits });

  const cell = (m: MetricDef, v: Measure | undefined) => {
    if (v === undefined) return <span className="place-cmp__wait">{t.loading}</span>;
    if (v === null) return <span className="place-cmp__none">{t.none}</span>;
    if (!Number.isFinite(v.value)) return <span className="place-cmp__none">{v.note?.[lang] ?? t.none}</span>;
    return (
      <>
        <strong>{nf(m.id === 'pop' ? 0 : m.digits).format(v.value)}</strong>
        {v.note && <small>{v.note[lang]}</small>}
      </>
    );
  };

  /** Which side is better (for people), or null when it does not matter or is not known. */
  const verdict = (m: MetricDef, x: Measure | undefined, y: Measure | undefined): 'a' | 'b' | null => {
    if (m.better === 'none' || !x || !y || !Number.isFinite(x.value) || !Number.isFinite(y.value) || x.value === y.value) return null;
    const aMore = x.value > y.value;
    return (m.better === 'more') === aMore ? 'a' : 'b';
  };

  const groups = [...new Set(METRICS.map((m) => m.group))];
  return (
    <section className="place-cmp" aria-label={t.title}>
      <h3 className="place-cmp__title">{t.title}</h3>
      <p className="note">{t.intro}</p>
      {!b && <p className="note">{t.pickB}</p>}
      <table className="place-cmp__table">
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">
              <span className="place-cmp__slot place-cmp__slot--a">A</span> {name(regionA, 'A')}
              <small>{t.radius(a.radiusKm)}</small>
            </th>
            {b && (
              <th scope="col">
                <span className="place-cmp__slot place-cmp__slot--b">B</span> {name(regionB, 'B')}
                <small>{t.radius(b.radiusKm)}</small>
              </th>
            )}
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g}>
            <tr className="place-cmp__group">
              <th scope="rowgroup" colSpan={b ? 3 : 2}>
                {t.groups[g]}
              </th>
            </tr>
            {METRICS.filter((m) => m.group === g).map((m) => {
              const row = t.rows[m.id];
              const x = va[m.id];
              const y = vb[m.id];
              const win = b ? verdict(m, x, y) : null;
              const max = Math.max(Number.isFinite(x?.value) ? x!.value : 0, Number.isFinite(y?.value) ? y!.value : 0);
              const bar = (v: Measure | undefined) => (v && max > 0 && Number.isFinite(v.value) && v.value >= 0 ? <span className="place-cmp__bar" style={{ width: `${Math.max(3, (100 * v.value) / max)}%` }} /> : null);
              return (
                <tr key={m.id}>
                  <th scope="row" className="place-cmp__row" title={row.help}>
                    {row.label}
                    <small>{row.unit}</small>
                  </th>
                  <td className={win === 'a' ? 'place-cmp__win' : win === 'b' ? 'place-cmp__lose' : undefined}>
                    {cell(m, x)}
                    {b && bar(x)}
                  </td>
                  {b && (
                    <td className={win === 'b' ? 'place-cmp__win' : win === 'a' ? 'place-cmp__lose' : undefined}>
                      {cell(m, y)}
                      {bar(y)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
      <details className="place-cmp__help">
        <summary>{lang === 'uk' ? 'Що означає кожен рядок' : 'What each row means'}</summary>
        <dl>
          {METRICS.map((m) => (
            <div key={m.id}>
              <dt>{t.rows[m.id].label}</dt>
              <dd>{t.rows[m.id].help}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className="legend__src">{t.sources}</p>
    </section>
  );
}
