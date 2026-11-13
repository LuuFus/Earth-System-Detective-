import { useMemo, useState, type FormEvent } from 'react';
import { countries, type Country } from '../data/countries';
import { aliasOptions, countryIndex, findCountry } from '../data/countryNames';
import { useI18n } from '../i18n/I18n';

/** Country search: suggestions in the site language, matches Ukrainian, English or the ISO code. */
export function CountrySearch({ onFound }: { onFound: (country: Country) => void }) {
  const { lang, t } = useI18n();
  const [value, setValue] = useState('');
  const [missing, setMissing] = useState(false);

  // Official names in both languages, the code, and everyday names ("США", "Америка", "UK").
  const index = useMemo(() => countryIndex(countries, (c) => c.code, lang, (c) => [c.name]), [lang]);
  const aliases = useMemo(() => aliasOptions(index, lang), [index, lang]);

  const go = (query: string) => {
    const hit = findCountry(index, query);
    setMissing(!hit);
    if (hit) {
      setValue(hit.label);
      onFound(hit.item);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    go(value);
  };

  return (
    <form className="search" role="search" onSubmit={onSubmit}>
      <label className="visually-hidden" htmlFor="country-search">
        {t.explore.search.label}
      </label>
      <svg className="search__icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
        <circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="m10.6 10.6 3.6 3.6" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <input
        id="country-search"
        className="search__input"
        type="search"
        list="country-list"
        autoComplete="off"
        placeholder={t.explore.search.placeholder}
        value={value}
        aria-invalid={missing || undefined}
        onFocus={(e) => e.currentTarget.select()}
        aria-describedby={missing ? 'country-search-error' : undefined}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          setMissing(false);
          // Picking a suggestion from the list fills the exact name: fly straight away.
          const exact = findCountry(index, next, true);
          if (exact && (exact.label === next || aliases.some((a) => a.value === next))) onFound(exact.item);
        }}
      />
      <datalist id="country-list">
        {index.map((e) => (
          <option key={e.code} value={e.label} />
        ))}
        {aliases.map((a) => (
          <option key={`${a.value}-${a.label}`} value={a.value} label={a.label} />
        ))}
      </datalist>
      <button type="submit" className="search__go">
        {t.explore.search.go}
      </button>
      {missing && (
        <p className="search__error" id="country-search-error" role="status">
          {t.explore.search.notFound}
        </p>
      )}
    </form>
  );
}
