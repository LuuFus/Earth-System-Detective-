import { useMemo, useState, type FormEvent } from 'react';
import { countries, type Country } from '../data/countries';
import { useI18n } from '../i18n/I18n';

const normalise = (s: string) =>
  s
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`ʼ]/g, '')
    .trim();

/** Country search: suggestions in the site language, matches Ukrainian, English or the ISO code. */
export function CountrySearch({ onFound }: { onFound: (country: Country) => void }) {
  const { lang, t } = useI18n();
  const [value, setValue] = useState('');
  const [missing, setMissing] = useState(false);

  const index = useMemo(() => {
    const local = new Intl.DisplayNames([lang], { type: 'region' });
    const uk = new Intl.DisplayNames(['uk'], { type: 'region' });
    const en = new Intl.DisplayNames(['en'], { type: 'region' });
    return countries
      .map((c) => {
        const label = local.of(c.code) ?? c.name;
        const keys = [label, uk.of(c.code), en.of(c.code), c.name, c.code].filter(Boolean).map((k) => normalise(k as string));
        return { country: c, label, keys };
      })
      .sort((a, b) => a.label.localeCompare(b.label, lang));
  }, [lang]);

  const find = (query: string) => {
    const q = normalise(query);
    if (!q) return null;
    return (
      index.find((e) => e.keys.includes(q)) ??
      index.find((e) => e.keys.some((k) => k.startsWith(q))) ??
      index.find((e) => e.keys.some((k) => k.includes(q))) ??
      null
    );
  };

  const go = (query: string) => {
    const hit = find(query);
    setMissing(!hit);
    if (hit) {
      setValue(hit.label);
      onFound(hit.country);
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
          const exact = index.find((entry) => entry.label === next);
          if (exact) onFound(exact.country);
        }}
      />
      <datalist id="country-list">
        {index.map((e) => (
          <option key={e.country.code} value={e.label} />
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
