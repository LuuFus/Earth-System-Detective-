import type { Region } from '../analysis/series';
import type { Lang } from './strings';

export function numberFormat(lang: Lang, digits: number, signed = true) {
  const f = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  });
  return (v: number) => f.format(v);
}

/** Digits that keep about three significant figures for a typical value. */
export function digitsFor(magnitude: number): number {
  const m = Math.abs(magnitude);
  if (m === 0 || !Number.isFinite(m)) return 1;
  if (m >= 100) return 0;
  if (m >= 10) return 1;
  if (m >= 1) return 2;
  return Math.min(4, 2 - Math.floor(Math.log10(m)));
}

export function formatPoint(lat: number, lon: number, lang: Lang): string {
  const f = numberFormat(lang, 1, false);
  const la = f(Math.abs(lat));
  const lo = f(Math.abs(lon));
  if (lang === 'uk') return `${la}° ${lat >= 0 ? 'пн. ш.' : 'пд. ш.'}, ${lo}° ${lon >= 0 ? 'сх. д.' : 'зх. д.'}`;
  return `${la}° ${lat >= 0 ? 'N' : 'S'}, ${lo}° ${lon >= 0 ? 'E' : 'W'}`;
}

export function formatP(p: number, lang: Lang): string {
  if (!Number.isFinite(p)) return lang === 'uk' ? 'p = н/д' : 'p = n/a';
  if (p < 0.001) return lang === 'uk' ? 'p < 0,001' : 'p < 0.001';
  return `p = ${numberFormat(lang, 3, false)(p)}`;
}

export function regionName(region: Region, lang: Lang): string {
  if (region.name) return region.name[lang];
  if (region.kind === 'point') return formatPoint(region.lat, region.lon, lang);
  return lang === 'uk' ? 'Регіон' : 'Region';
}
