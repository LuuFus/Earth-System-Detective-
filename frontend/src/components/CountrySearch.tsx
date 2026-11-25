import { useMemo, useState, type FormEvent } from 'react';
import { useLoaded } from '../hooks/useLoaded';
import { searchCities } from '../data/city';
import { findCities, fold, loadCities, type WorldCity } from '../data/cities';
import { countries } from '../data/countries';
import { aliasOptions, countryIndex, findCountry } from '../data/countryNames';
import { countryName } from '../data/geo';
import type { Text } from '../data/variables';
import { useI18n } from '../i18n/I18n';

/** What the search found: a country, a city of the list, or a place the geocoder knows. */
export type Found =
  | { kind: 'country'; lat: number; lon: number; big: boolean; code: string; name: Text }
  | { kind: 'city'; lat: number; lon: number; name: Text; city: WorldCity | null; code?: string };

const cityLabel = (c: WorldCity, lang: 'uk' | 'en') => {
  const country = c.code ? countryName(c.code, lang) : '';
  return country ? `${c[lang]}, ${country}` : c[lang];
};

function cityFound(c: WorldCity): Found {
  return { kind: 'city', lat: c.lat, lon: c.lon, name: { uk: c.uk, en: c.en }, city: c, code: c.code };
}

/**
 * Search for a country or a city: suggestions in the site language; Ukrainian or English names,
 * ISO codes and everyday names for countries; for a place not in the city list, the geocoder.
 * `countriesOnly`: the 3D Earth's search, where cities are found in the analysis instead.
 */
export function CountrySearch({ onFound, countriesOnly = false }: { onFound: (place: Found) => void; countriesOnly?: boolean }) {
  const { lang, t } = useI18n();
  const [value, setValue] = useState('');
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);
  const loaded = useLoaded(loadCities);
  const cities = useMemo(() => (countriesOnly ? [] : (loaded ?? [])), [loaded, countriesOnly]);

  // Official names in both languages, the code, and everyday names ("США", "Америка", "UK").
  const index = useMemo(() => countryIndex(countries, (c) => c.code, lang, (c) => [c.name]), [lang]);
  const aliases = useMemo(() => aliasOptions(index, lang), [index, lang]);
  // Suggestions: cities of 300 000 people and more, and every Ukrainian one.
  const cityOptions = useMemo(() => cities.filter((c) => c.pop >= 300_000 || c.code === 'UA').map((c) => ({ c, label: cityLabel(c, lang) })), [cities, lang]);

  const country = (hit: NonNullable<ReturnType<typeof findCountry<(typeof countries)[number]>>>): Found => ({
    kind: 'country',
    lat: hit.item.lat,
    lon: hit.item.lon,
    big: hit.item.big,
    code: hit.item.code,
    name: { uk: countryName(hit.item.code, 'uk'), en: countryName(hit.item.code, 'en') },
  });

  /** A city typed as "Kharkiv, Ukraine" or just "Kharkiv". */
  const cityFor = (query: string): WorldCity | null => {
    const option = cityOptions.find((o) => o.label === query);
    if (option) return option.c;
    const [name, where] = query.split(',').map((x) => x.trim());
    const list = findCities(cities, name, 40);
    const inCountry = where ? list.filter((c) => c.code && fold(countryName(c.code, lang)).startsWith(fold(where))) : list;
    return inCountry[0] ?? list[0] ?? null;
  };

  const go = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    const exactCountry = findCountry(index, q, true);
    if (exactCountry) {
      setMissing(false);
      setValue(exactCountry.label);
      return onFound(country(exactCountry));
    }
    const city = countriesOnly ? null : cityFor(q);
    const looseCountry = findCountry(index, q);
    // A city whose name starts with what was typed wins over a country that only contains it.
    const cityFirst = city && (!looseCountry || fold(city[lang]).startsWith(fold(q.split(',')[0])));
    if (city && cityFirst) {
      setMissing(false);
      setValue(cityLabel(city, lang));
      return onFound(cityFound(city));
    }
    if (looseCountry) {
      setMissing(false);
      setValue(looseCountry.label);
      return onFound(country(looseCountry));
    }
    if (countriesOnly) {
      setMissing(true);
      return;
    }
    // Smaller places: the geocoder (GeoNames through Open-Meteo).
    setBusy(true);
    try {
      const [hit] = await searchCities(q, lang);
      setMissing(!hit);
      if (hit) {
        setValue([hit.name, hit.country].filter(Boolean).join(', '));
        onFound({ kind: 'city', lat: hit.lat, lon: hit.lon, name: { uk: hit.name, en: hit.name }, city: null, code: hit.cc?.toUpperCase() });
      }
    } catch {
      setMissing(true);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void go(value);
  };

  return (
    <form className="search" role="search" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor="country-search">
        {countriesOnly ? t.explore.search.countryLabel : t.explore.search.label}
      </label>
      <svg className="search__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.6 10.6 3.6 3.6" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <input
        id="country-search"
        className="search__input"
        type="search"
        enterKeyHint="search"
        list="country-list"
        autoComplete="off"
        placeholder={countriesOnly ? t.explore.search.countryPlaceholder : t.explore.search.placeholder}
        value={value}
        aria-invalid={missing || undefined}
        aria-busy={busy || undefined}
        onFocus={(e) => e.currentTarget.select()}
        aria-describedby={missing ? 'country-search-error' : undefined}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          setMissing(false);
          // Picking a suggestion from the list fills the exact name: fly straight away.
          const exact = findCountry(index, next, true);
          if (exact && (exact.label === next || aliases.some((a) => a.value === next))) return onFound(country(exact));
          const option = cityOptions.find((o) => o.label === next);
          if (option) onFound(cityFound(option.c));
        }}
      />
      <datalist id="country-list">
        {index.map((e) => (
          <option key={e.code} value={e.label} />
        ))}
        {aliases.map((a) => (
          <option key={`${a.value}-${a.label}`} value={a.value} label={a.label} />
        ))}
        {cityOptions.map((o) => (
          <option key={`c${o.c.id}`} value={o.label} />
        ))}
      </datalist>
      <button type="submit" className="search__go" disabled={busy}>
        {t.explore.search.go}
      </button>
      {missing && (
        <p className="search__error" id="country-search-error" role="status">
          {countriesOnly ? t.explore.search.notCountry : t.explore.search.notFound}
        </p>
      )}
    </form>
  );
}
