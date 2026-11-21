// What a colour on a NASA GIBS layer means: each layer's official colour map (GIBS colormaps
// v1.3) turns a pixel back into its value, shown under the pointer and on the legend, in units
// people know (°C instead of kelvin, µg/m³ instead of kg/m³).

import type { Text, VariableId } from './variables';

export type MapEntry = { r: number; g: number; b: number; lo: number; hi: number; label: string | null; units: string };
export type ColorMap = { entries: MapEntry[]; numeric: boolean };

const BASE = 'https://gibs.earthdata.nasa.gov/colormaps/v1.3/';

/** The colour map of each layer (file names from the GIBS capabilities document). */
export const COLORMAP: Partial<Record<VariableId, string>> = {
  t2m: 'MERRA2_2m_Air_Temperature_Monthly',
  precip: 'MERRA2_Precipitation_Bias_Corrected_Monthly',
  soil: 'MERRA2_Soil_Water_Root_Zone_Monthly',
  humidity: 'AIRS_Surface_Relative_Humidity_Monthly_Day',
  lst: 'MODIS_Land_Surface_Temp',
  ndvi: 'MODIS_L3_NDVI',
  no2: 'OMI_Nitrogen_Dioxide_Tropo_Column',
  ozone: 'OMI_Ozone_TOMS_Total_Column',
  sst: 'GHRSST_Sea_Surface_Temperature',
  snow: 'MODIS_NDSI_Snow_Cover',
  seaice: 'AMSR_Sea_Ice_Concentration',
  imerg: 'GPM_Precipitation_Rate',
  vapor: 'MERRA2_Total_Precipitable_Water_Vapor_Monthly',
  aerosol: 'MERRA2_Total_Aerosol_Optical_Thickness_550nm_Scattering_Monthly',
  dust: 'MERRA2_Dust_Surface_Mass_Concentration_PM25_Monthly',
  co: 'AIRS_Carbon_Monoxide_Volume_Mixing_Ratio',
  wind10: 'MERRA2_Surface_Wind_Speed_Monthly',
  landcover: 'MODIS_IGBP_Land_Cover_Type',
  population: 'GPW_Population_Density_2020',
};

/** How to show a layer's values: unit, a factor and an offset from the map's own unit, digits. */
export const DISPLAY: Partial<Record<VariableId, { unit: Text; k?: number; add?: number; digits: number }>> = {
  t2m: { unit: { uk: '°C', en: '°C' }, add: -273.15, digits: 1 },
  lst: { unit: { uk: '°C', en: '°C' }, add: -273.15, digits: 1 },
  sst: { unit: { uk: '°C', en: '°C' }, digits: 1 },
  precip: { unit: { uk: 'мм за добу', en: 'mm a day' }, k: 86400, digits: 1 },
  soil: { unit: { uk: '% води в ґрунті', en: '% water in the soil' }, k: 100, digits: 0 },
  humidity: { unit: { uk: '%', en: '%' }, digits: 0 },
  ndvi: { unit: { uk: '(0 — голо, 1 — густа зелень)', en: '(0 bare, 1 dense green)' }, digits: 2 },
  no2: { unit: { uk: '×10¹⁵ молекул/см²', en: '×10¹⁵ molecules/cm²' }, k: 1e-15, digits: 1 },
  ozone: { unit: { uk: 'од. Добсона', en: 'Dobson units' }, digits: 0 },
  snow: { unit: { uk: '(сніговий індекс)', en: '(snow index)' }, digits: 0 },
  seaice: { unit: { uk: '% моря під льодом', en: '% of sea under ice' }, digits: 0 },
  imerg: { unit: { uk: 'мм/год', en: 'mm/h' }, digits: 1 },
  vapor: { unit: { uk: 'мм води', en: 'mm of water' }, digits: 0 },
  aerosol: { unit: { uk: '(оптична товщина)', en: '(optical depth)' }, digits: 2 },
  dust: { unit: { uk: 'мкг/м³', en: 'µg/m³' }, k: 1e9, digits: 1 },
  co: { unit: { uk: 'ppbv', en: 'ppbv' }, digits: 0 },
  wind10: { unit: { uk: 'м/с', en: 'm/s' }, digits: 1 },
  population: { unit: { uk: 'осіб/км²', en: 'people/km²' }, digits: 0 },
};

/** IGBP land cover classes in Ukrainian (GIBS names them in English). */
const LAND_UK: Record<string, string> = {
  'Evergreen Needleleaf Forests': 'Вічнозелені хвойні ліси',
  'Evergreen Broadleaf Forests': 'Вічнозелені широколисті ліси',
  'Deciduous Needleleaf Forests': 'Листопадні хвойні ліси',
  'Deciduous Broadleaf Forests': 'Листопадні широколисті ліси',
  'Mixed Forests': 'Мішані ліси',
  'Closed Shrublands': 'Густі чагарники',
  'Open Shrublands': 'Рідкі чагарники',
  'Woody Savannas': 'Лісисті савани',
  Savannas: 'Савани',
  Grasslands: 'Луки й степи',
  'Permanent Wetlands': 'Болота',
  Croplands: 'Поля',
  'Urban and Built-up Lands': 'Міста й забудова',
  'Cropland/Natural Vegetation Mosaics': 'Поля впереміш із природою',
  'Permanent Snow and Ice': 'Вічні сніги й лід',
  Barren: 'Пустища й пустелі',
  'Water Bodies': 'Водойми',
};

const cache = new Map<string, Promise<ColorMap | null>>();

/** Parses "[a,b)", "[a]", "a" and the open ends ±INF. */
function range(v: string | null): [number, number] | null {
  if (!v) return null;
  const parts = v.replace(/[[\]()]/g, '').split(',').map((x) => x.trim());
  const num = (x: string) => (x === '-INF' ? -Infinity : x === 'INF' || x === '+INF' ? Infinity : Number(x));
  const a = num(parts[0]);
  const b = parts.length > 1 ? num(parts[1]) : a;
  return Number.isNaN(a) || Number.isNaN(b) ? null : [a, b];
}

export function loadColorMap(id: VariableId): Promise<ColorMap | null> {
  const file = COLORMAP[id];
  if (!file) return Promise.resolve(null);
  let p = cache.get(file);
  if (!p) {
    p = fetch(`${BASE}${file}.xml`)
      .then((r) => (r.ok ? r.text() : null))
      .then((xml) => {
        if (!xml) return null;
        const doc = new DOMParser().parseFromString(xml, 'application/xml');
        const tips = new Map<string, string>();
        for (const le of doc.querySelectorAll('LegendEntry')) tips.set(le.getAttribute('rgb') ?? '', le.getAttribute('tooltip') ?? '');
        const entries: MapEntry[] = [];
        for (const map of doc.querySelectorAll('ColorMap')) {
          if (map.getAttribute('title') === 'No Data') continue;
          const units = map.getAttribute('units') ?? '';
          for (const e of map.querySelectorAll('ColorMapEntry')) {
            if (e.getAttribute('transparent') === 'true' || e.getAttribute('nodata') === 'true') continue;
            const rgb = e.getAttribute('rgb') ?? '';
            const [r, g, b] = rgb.split(',').map(Number);
            const span = range(e.getAttribute('value') ?? e.getAttribute('sourceValue'));
            const tip = tips.get(rgb) ?? null;
            entries.push({ r, g, b, lo: span ? span[0] : NaN, hi: span ? span[1] : NaN, label: e.getAttribute('label') ?? tip, units });
          }
        }
        if (!entries.length) return null;
        const numeric = entries.filter((e) => Number.isFinite(e.lo) || Number.isFinite(e.hi)).length > entries.length / 2 && id !== 'landcover';
        return { entries, numeric };
      })
      .catch(() => null);
    cache.set(file, p);
  }
  return p;
}

/** The entry whose colour is nearest to a pixel, with its position on the scale (0..1). */
export function lookup(map: ColorMap, r: number, g: number, b: number): { entry: MapEntry; at: number } | null {
  let best = -1;
  let bestD = Infinity;
  map.entries.forEach((e, i) => {
    const d = (e.r - r) ** 2 + (e.g - g) ** 2 + (e.b - b) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  });
  // Colours far from every entry belong to something else (coastline smoothing, the base map).
  if (best < 0 || bestD > 3 * 34 ** 2) return null;
  return { entry: map.entries[best], at: map.entries.length > 1 ? best / (map.entries.length - 1) : 0 };
}

/** A value in the layer's display unit, from an entry's range (its middle, or the open end). */
export function entryValue(id: VariableId, e: MapEntry): number | null {
  const v = Number.isFinite(e.lo) && Number.isFinite(e.hi) ? (e.lo + e.hi) / 2 : Number.isFinite(e.lo) ? e.lo : Number.isFinite(e.hi) ? e.hi : NaN;
  if (!Number.isFinite(v)) return null;
  const d = DISPLAY[id];
  return v * (d?.k ?? 1) + (d?.add ?? 0);
}

/** The words for an entry: its value with the unit, or its class name. */
export function entryText(id: VariableId, e: MapEntry, lang: 'uk' | 'en'): string {
  const d = DISPLAY[id];
  if (id === 'landcover' && e.label) return lang === 'uk' ? (LAND_UK[e.label] ?? e.label) : e.label;
  const v = entryValue(id, e);
  if (v === null) return e.label ?? '';
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: d?.digits ?? 1, minimumFractionDigits: 0 });
  const open = !Number.isFinite(e.lo) ? '≤ ' : !Number.isFinite(e.hi) ? '≥ ' : '≈ ';
  return `${open}${nf.format(v)} ${d?.unit[lang] ?? e.units}`.trim();
}

/** Low, middle or high for this scale, in words. */
export function levelWord(at: number, lang: 'uk' | 'en'): string {
  const uk = ['дуже низько', 'низько', 'помірно', 'високо', 'дуже високо'];
  const en = ['very low', 'low', 'moderate', 'high', 'very high'];
  return (lang === 'uk' ? uk : en)[Math.min(4, Math.floor(at * 5))];
}
