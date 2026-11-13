// Finding a country by what people actually type: the official name in either language, the ISO
// code, and the everyday names and abbreviations ("США", "Америка", "UK", "ОАЕ").

/** Everyday names by ISO code, in Ukrainian and English. */
export const ALIASES: Record<string, string[]> = {
  US: ['США', 'Америка', 'Сполучені Штати Америки', 'Штати', 'USA', 'US', 'America', 'United States of America'],
  GB: ['Британія', 'Велика Британія', 'Англія', 'Сполучене Королівство', 'UK', 'Britain', 'Great Britain', 'England'],
  RU: ['РФ', 'Russian Federation'],
  KR: ['Південна Корея', 'Корея', 'South Korea', 'Korea'],
  KP: ['Північна Корея', 'КНДР', 'North Korea', 'DPRK'],
  AE: ['ОАЕ', 'Емірати', 'UAE', 'Emirates'],
  ZA: ['ПАР', 'Південна Африка', 'South Africa', 'RSA'],
  CD: ['ДР Конго', 'ДРК', 'Конго-Кіншаса', 'DR Congo', 'DRC'],
  CG: ['Республіка Конго', 'Конго-Браззавіль', 'Congo-Brazzaville'],
  CZ: ['Чехія', 'Чеська Республіка', 'Czechia', 'Czech Republic'],
  NL: ['Голландія', 'Holland'],
  CF: ['ЦАР', 'CAR'],
  DO: ['Домінікана'],
  TR: ['Туреччина', 'Turkey', 'Türkiye'],
  CI: ["Кот-д'Івуар", 'Берег Слонової Кістки', 'Ivory Coast'],
  MM: ['Бірма', "М'янма", 'Burma'],
  SZ: ['Свазіленд', 'Есватіні', 'Swaziland'],
  MK: ['Македонія', 'Macedonia'],
  BA: ['Боснія', 'Bosnia'],
  VA: ['Ватикан', 'Vatican'],
  CN: ['КНР', 'PRC'],
  BY: ['Білорусія', 'Беларусь'],
  MD: ['Молдавія'],
  KG: ['Киргизія', 'Kirghizia'],
  NZ: ['NZ'],
  VN: ["В'єтнам"],
  LA: ['Laos'],
  PS: ['Палестина', 'Palestine'],
  BO: ['Bolivia'],
  VE: ['Venezuela'],
  IR: ['Iran'],
  SY: ['Syria'],
  TZ: ['Tanzania'],
  TL: ['Східний Тимор', 'East Timor'],
  CV: ['Кабо-Верде', 'Cape Verde'],
};

export const normalise = (s: string) =>
  s
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`ʼ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export type CountryEntry<T> = { item: T; code: string; label: string; keys: string[] };

/** Search entries for countries: their label in the site language, and every name to match. */
export function countryIndex<T>(items: T[], code: (t: T) => string, lang: 'uk' | 'en', extra: (t: T) => string[] = () => []): CountryEntry<T>[] {
  // Intl throws on codes it does not know (Natural Earth has a few), so every lookup is guarded.
  const namer = (l: string) => {
    const names = new Intl.DisplayNames([l], { type: 'region' });
    return (c: string) => {
      try {
        const n = names.of(c);
        return n && n !== c ? n : undefined;
      } catch {
        return undefined;
      }
    };
  };
  const local = namer(lang);
  const uk = namer('uk');
  const en = namer('en');
  return items
    .map((item) => {
      const c = code(item);
      const own = extra(item);
      const label = local(c) ?? own[lang === 'uk' ? 0 : 1] ?? own[0] ?? c;
      const names = [label, uk(c), en(c), c, ...own, ...(ALIASES[c] ?? [])].filter((n): n is string => !!n);
      return { item, code: c, label, keys: [...new Set(names.map(normalise))] };
    })
    .sort((a, b) => a.label.localeCompare(b.label, lang));
}

/** Best match for what was typed: an exact name first, then the start of a name, then a part of one. */
export function findCountry<T>(index: CountryEntry<T>[], query: string, exactOnly = false): CountryEntry<T> | null {
  const q = normalise(query);
  if (!q) return null;
  const exact = index.find((e) => e.keys.includes(q));
  if (exact || exactOnly) return exact ?? null;
  return index.find((e) => e.keys.some((k) => k.startsWith(q))) ?? (q.length >= 3 ? index.find((e) => e.keys.some((k) => k.includes(q))) ?? null : null);
}

/** Extra suggestions for a datalist: the everyday names, each pointing at its country's label. */
export function aliasOptions<T>(index: CountryEntry<T>[], lang: 'uk' | 'en'): { value: string; label: string }[] {
  const cyrillic = /[а-яіїєґ]/i;
  const out: { value: string; label: string }[] = [];
  for (const e of index) {
    for (const a of ALIASES[e.code] ?? []) {
      // Suggest the aliases written in the site's language (and short codes like USA in both).
      if ((lang === 'uk') === cyrillic.test(a) || /^[A-Z]{2,4}$/.test(a)) out.push({ value: a, label: e.label });
    }
  }
  return out;
}
