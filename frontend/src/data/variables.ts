// The variables a user can put on the globe. Every map is a NASA product (GISTEMP numbers or
// GIBS imagery); every number in the analysis comes from GISTEMP, NASA POWER or NASA Ozone Watch.

export type Text = { uk: string; en: string };

export type MatrixSet = '250m' | '500m' | '1km' | '2km';

/** A NASA GIBS map: drawn as tiles (WMTS) or, for vector-tile layers, as WMS images per tile. */
export type Imagery = {
  layer: string;
  matrixSet: MatrixSet;
  format: 'image/png' | 'image/jpeg';
  time: 'monthly' | 'daily';
  /** First and last dates the layer has, YYYY-MM-DD. */
  first: string;
  last: string;
  /** Month (1-12) and day used when the timeline moves year by year. */
  month: number;
  day?: number;
  via?: 'wmts' | 'wms';
  /** Point detections (fires): drawn in one colour with a legend of our own. */
  points?: boolean;
  /**
   * Daily swath imagery with black gaps between orbits: the gaps are filled from another
   * satellite's image of the same day, the first entry whose `first` date has been reached.
   */
  gapFill?: { layer: string; first: string; name: Text }[];
};

/** Where the numbers for the chart come from. */
export type SeriesSource =
  | { kind: 'gistemp' }
  | { kind: 'power'; parameter: 'T2M' | 'PRECTOTCORR' | 'GWETROOT' | 'RH2M'; aggregate: 'mean' | 'total' | 'percent' }
  | { kind: 'ozonehole' }
  /**
   * A monthly grid built by data-pipeline (public/data/<file>.json + .bin), shown divided by `unit`.
   * `sum`: counts, added up over the cells and the months; `mean`: averaged over the area.
   */
  | { kind: 'grid'; file: string; unit: number; combine: 'mean' | 'sum'; coverage: Text };

export type Variable = {
  id: VariableId;
  group: 'climate' | 'water' | 'land' | 'air' | 'impact';
  name: Text;
  definition: Text;
  unit: Text;
  /** Unit of the trend, per decade. */
  trendUnit: Text;
  source: Text;
  sourceUrl: string;
  imagery?: Imagery;
  series?: SeriesSource;
  /** First and last full years of the numeric series. */
  years?: [number, number];
  /** Numbers for this variable arrive with the Earthdata pipelines. */
  pendingNumbers?: boolean;
  /** Plain words for a rise and a fall, for the one-sentence answer above the chart. */
  change?: { up: Text; down: Text };
};

export type VariableId =
  | 'gistemp'
  | 't2m'
  | 'precip'
  | 'soil'
  | 'humidity'
  | 'lst'
  | 'ndvi'
  | 'no2'
  | 'ozone'
  | 'nightlights'
  | 'fires'
  | 'truecolor';

const POWER_URL = 'https://power.larc.nasa.gov/';
const POWER_YEARS: [number, number] = [1981, 2025];

export const variables: Variable[] = [
  {
    id: 'gistemp',
    change: { up: { uk: 'стало тепліше', en: 'it got warmer' }, down: { uk: 'стало холодніше', en: 'it got colder' } },
    group: 'climate',
    name: { uk: 'Аномалія температури', en: 'Temperature anomaly' },
    definition: {
      uk: 'Наскільки рік був теплішим чи холоднішим за середнє 1951-1980 років. Поєднує метеостанції на суші й вимірювання температури моря. Плюс означає тепліше за норму.',
      en: 'How much warmer or colder a year was than the 1951-1980 average. Combines weather stations on land with sea surface measurements. Positive means warmer than normal.',
    },
    unit: { uk: '°C', en: '°C' },
    trendUnit: { uk: '°C за 10 років', en: '°C per decade' },
    source: { uk: 'NASA GISS, GISTEMP v4', en: 'NASA GISS, GISTEMP v4' },
    sourceUrl: 'https://data.giss.nasa.gov/gistemp/',
    series: { kind: 'gistemp' },
    years: [1880, 2025],
  },
  {
    id: 't2m',
    change: { up: { uk: 'стало тепліше', en: 'it got warmer' }, down: { uk: 'стало холодніше', en: 'it got colder' } },
    group: 'climate',
    name: { uk: 'Температура повітря', en: 'Air temperature' },
    definition: {
      uk: 'Температура повітря на висоті 2 метри над землею, як на звичайному термометрі. Модель MERRA-2 відтворює її для всієї Землі із супутникових і наземних вимірювань.',
      en: 'Air temperature 2 metres above the ground, as an ordinary thermometer reads it. The MERRA-2 model rebuilds it for the whole Earth from satellite and ground measurements.',
    },
    unit: { uk: '°C', en: '°C' },
    trendUnit: { uk: '°C за 10 років', en: '°C per decade' },
    source: { uk: 'NASA POWER і GMAO MERRA-2', en: 'NASA POWER and GMAO MERRA-2' },
    sourceUrl: POWER_URL,
    imagery: {
      layer: 'MERRA2_2m_Air_Temperature_Monthly',
      matrixSet: '2km',
      format: 'image/png',
      time: 'monthly',
      first: '1980-01-01',
      last: '2026-08-01',
      month: 7,
    },
    series: { kind: 'power', parameter: 'T2M', aggregate: 'mean' },
    years: POWER_YEARS,
  },
  {
    id: 'precip',
    change: { up: { uk: 'опадів стало більше', en: 'precipitation rose' }, down: { uk: 'опадів стало менше', en: 'precipitation fell' } },
    group: 'water',
    name: { uk: 'Опади', en: 'Precipitation' },
    definition: {
      uk: 'Скільки води випало дощем і снігом. MERRA-2 уточнює модель за вимірюваннями опадів, тому ряд можна порівнювати рік до року.',
      en: 'How much water fell as rain and snow. MERRA-2 corrects the model against measured rainfall, so years can be compared with each other.',
    },
    unit: { uk: 'мм', en: 'mm' },
    trendUnit: { uk: 'мм за 10 років', en: 'mm per decade' },
    source: { uk: 'NASA POWER і GMAO MERRA-2', en: 'NASA POWER and GMAO MERRA-2' },
    sourceUrl: POWER_URL,
    imagery: {
      layer: 'MERRA2_Precipitation_Bias_Corrected_Monthly',
      matrixSet: '2km',
      format: 'image/png',
      time: 'monthly',
      first: '1980-01-01',
      last: '2026-08-01',
      month: 7,
    },
    series: { kind: 'power', parameter: 'PRECTOTCORR', aggregate: 'total' },
    years: POWER_YEARS,
  },
  {
    id: 'soil',
    change: { up: { uk: 'ґрунт став вологішим', en: 'the soil got wetter' }, down: { uk: 'ґрунт став сухішим', en: 'the soil got drier' } },
    group: 'water',
    name: { uk: 'Волога ґрунту', en: 'Soil moisture' },
    definition: {
      uk: 'Наскільки вологий ґрунт у шарі, де ростуть корені рослин: 0% зовсім сухий, 100% насичений водою. Показує посухи краще, ніж самі опади.',
      en: 'How wet the soil is in the layer where plant roots grow: 0% is bone dry, 100% saturated. Shows droughts better than rainfall alone.',
    },
    unit: { uk: '%', en: '%' },
    trendUnit: { uk: 'відсоткових пунктів за 10 років', en: 'percentage points per decade' },
    source: { uk: 'NASA POWER і GMAO MERRA-2', en: 'NASA POWER and GMAO MERRA-2' },
    sourceUrl: POWER_URL,
    imagery: {
      layer: 'MERRA2_Soil_Water_Root_Zone_Monthly',
      matrixSet: '2km',
      format: 'image/png',
      time: 'monthly',
      first: '1980-01-01',
      last: '2026-08-01',
      month: 7,
    },
    series: { kind: 'power', parameter: 'GWETROOT', aggregate: 'percent' },
    years: POWER_YEARS,
  },
  {
    id: 'humidity',
    change: { up: { uk: 'повітря стало вологішим', en: 'the air got more humid' }, down: { uk: 'повітря стало сухішим', en: 'the air got drier' } },
    group: 'water',
    name: { uk: 'Вологість повітря', en: 'Humidity' },
    definition: {
      uk: 'Відносна вологість біля землі: скільки водяної пари в повітрі порівняно з максимумом, який воно може втримати за цієї температури.',
      en: 'Relative humidity near the ground: how much water vapour the air holds compared with the most it could hold at that temperature.',
    },
    unit: { uk: '%', en: '%' },
    trendUnit: { uk: 'відсоткових пунктів за 10 років', en: 'percentage points per decade' },
    source: { uk: 'NASA POWER (числа), AIRS на Aqua (карта)', en: 'NASA POWER (numbers), AIRS on Aqua (map)' },
    sourceUrl: POWER_URL,
    imagery: {
      layer: 'AIRS_L3_Surface_Relative_Humidity_Monthly_Day',
      matrixSet: '2km',
      format: 'image/png',
      time: 'monthly',
      first: '2002-09-01',
      last: '2026-09-01',
      month: 7,
    },
    series: { kind: 'power', parameter: 'RH2M', aggregate: 'mean' },
    years: POWER_YEARS,
  },
  {
    id: 'lst',
    change: { up: { uk: 'поверхня стала гарячішою', en: 'the surface got hotter' }, down: { uk: 'поверхня стала холоднішою', en: 'the surface got cooler' } },
    group: 'land',
    name: { uk: 'Температура поверхні суші', en: 'Land surface temperature' },
    definition: {
      uk: 'Наскільки нагріта сама поверхня (ґрунт, асфальт, листя) вдень, за вимірюваннями приладу MODIS із супутника Terra. Влітку вона буває значно гарячішою за повітря.',
      en: 'How hot the surface itself (soil, asphalt, leaves) is by day, measured by MODIS on the Terra satellite. In summer it is often much hotter than the air.',
    },
    unit: { uk: '°C', en: '°C' },
    trendUnit: { uk: '°C за 10 років', en: '°C per decade' },
    source: { uk: 'MODIS, супутник Terra', en: 'MODIS on Terra' },
    sourceUrl: 'https://lpdaac.usgs.gov/products/mod11c3v061/',
    imagery: {
      layer: 'MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day',
      matrixSet: '2km',
      format: 'image/png',
      time: 'monthly',
      first: '2000-03-01',
      last: '2026-10-01',
      month: 7,
    },
    series: { kind: 'grid', file: 'lst/ukraine', unit: 1, combine: 'mean', coverage: { uk: 'Числа поки є лише над Україною та сусідніми районами (44-53° пн. ш., 22-41° сх. д.).', en: 'Numbers cover Ukraine and its neighbourhood only for now (44-53° N, 22-41° E).' } },
    years: [2001, 2025],
  },
  {
    id: 'ndvi',
    change: { up: { uk: 'рослинність стала густішою', en: 'vegetation got denser' }, down: { uk: 'рослинність стала рідшою', en: 'vegetation got sparser' } },
    group: 'land',
    name: { uk: 'Рослинність (NDVI)', en: 'Vegetation (NDVI)' },
    definition: {
      uk: 'Індекс зелені: здорові рослини відбивають багато ближнього інфрачервоного світла й поглинають червоне. Від 0 (пісок, сніг) до 1 (густий ліс).',
      en: 'A greenness index: healthy plants reflect a lot of near-infrared light and absorb red. From 0 (sand, snow) to 1 (dense forest).',
    },
    unit: { uk: 'NDVI', en: 'NDVI' },
    trendUnit: { uk: 'NDVI за 10 років', en: 'NDVI per decade' },
    source: { uk: 'MODIS, супутник Terra', en: 'MODIS on Terra' },
    sourceUrl: 'https://lpdaac.usgs.gov/products/mod13c2v061/',
    imagery: {
      layer: 'MODIS_Terra_L3_NDVI_Monthly',
      matrixSet: '1km',
      format: 'image/png',
      time: 'monthly',
      first: '2000-03-01',
      last: '2026-10-01',
      month: 7,
    },
    series: { kind: 'grid', file: 'ndvi/ukraine', unit: 1, combine: 'mean', coverage: { uk: 'Числа поки є лише над Україною та сусідніми районами (44-53° пн. ш., 22-41° сх. д.).', en: 'Numbers cover Ukraine and its neighbourhood only for now (44-53° N, 22-41° E).' } },
    years: [2001, 2025],
  },
  {
    id: 'no2',
    change: { up: { uk: 'NO₂ у повітрі стало більше', en: 'NO₂ in the air rose' }, down: { uk: 'NO₂ у повітрі стало менше', en: 'NO₂ in the air fell' } },
    group: 'air',
    name: { uk: 'Діоксид азоту (NO₂)', en: 'Nitrogen dioxide (NO₂)' },
    definition: {
      uk: 'Газ, що утворюється, коли спалюють паливо: у двигунах авто, на електростанціях і заводах. Прилад OMI на супутнику Aura бачить його в нижній частині атмосфери.',
      en: 'A gas made when fuel burns in car engines, power plants and factories. OMI on the Aura satellite sees it in the lower atmosphere.',
    },
    unit: { uk: '10¹⁵ молекул/см²', en: '10¹⁵ molecules/cm²' },
    trendUnit: { uk: '10¹⁵ молекул/см² за 10 років', en: '10¹⁵ molecules/cm² per decade' },
    source: { uk: 'OMI, супутник Aura (OMNO2d)', en: 'OMI on Aura (OMNO2d)' },
    sourceUrl: 'https://disc.gsfc.nasa.gov/datasets/OMNO2d_003/summary',
    series: {
      kind: 'grid',
      file: 'no2/ukraine',
      unit: 1e15,
      combine: 'mean',
      coverage: { uk: 'Числа NO₂ поки є лише над Україною та сусідніми районами (44-53° пн. ш., 22-41° сх. д.).', en: 'NO₂ numbers cover Ukraine and its neighbourhood only for now (44-53° N, 22-41° E).' },
    },
    years: [2005, 2025],
    imagery: {
      layer: 'OMI_Nitrogen_Dioxide_Tropo_Column',
      matrixSet: '2km',
      format: 'image/png',
      time: 'daily',
      first: '2004-10-01',
      last: '2026-11-05',
      month: 7,
      day: 15,
    },
  },
  {
    id: 'ozone',
    change: { up: { uk: 'озонова діра стала більшою', en: 'the ozone hole grew' }, down: { uk: 'озонова діра стала меншою', en: 'the ozone hole shrank' } },
    group: 'air',
    name: { uk: 'Озоновий шар', en: 'Ozone layer' },
    definition: {
      uk: 'Скільки озону над головою, у одиницях Добсона. Озон у стратосфері затримує ультрафіолет. Озонова діра над Антарктидою — область, де його менше 220 одиниць.',
      en: 'How much ozone is overhead, in Dobson units. Stratospheric ozone blocks ultraviolet light. The Antarctic ozone hole is where it falls below 220 units.',
    },
    unit: { uk: 'млн км²', en: 'million km²' },
    trendUnit: { uk: 'млн км² за 10 років', en: 'million km² per decade' },
    source: { uk: 'NASA Ozone Watch (TOMS, OMI, OMPS)', en: 'NASA Ozone Watch (TOMS, OMI, OMPS)' },
    sourceUrl: 'https://ozonewatch.gsfc.nasa.gov/',
    imagery: {
      layer: 'OMI_Ozone_TOMS_Total_Column',
      matrixSet: '2km',
      format: 'image/png',
      time: 'daily',
      first: '2004-10-01',
      last: '2026-11-05',
      month: 10,
      day: 1,
    },
    series: { kind: 'ozonehole' },
    years: [1979, 2025],
  },
  {
    id: 'nightlights',
    group: 'impact',
    name: { uk: 'Нічні вогні', en: 'Night lights' },
    definition: {
      uk: 'Світло міст, доріг і заводів уночі, яке бачить прилад VIIRS. Коли світла зникає, це часто означає знеструмлення або спустіння міст.',
      en: 'Light from cities, roads and factories at night, seen by VIIRS. When the light disappears it often means power cuts or emptied towns.',
    },
    unit: { uk: 'яскравість', en: 'radiance' },
    trendUnit: { uk: 'за 10 років', en: 'per decade' },
    source: { uk: 'VIIRS, супутник Suomi NPP', en: 'VIIRS on Suomi NPP' },
    sourceUrl: 'https://blackmarble.gsfc.nasa.gov/',
    imagery: {
      layer: 'VIIRS_SNPP_DayNightBand',
      matrixSet: '1km',
      format: 'image/png',
      time: 'daily',
      first: '2012-03-01',
      last: '2026-11-02',
      month: 11,
      day: 25,
    },
    pendingNumbers: true,
  },
  {
    id: 'fires',
    change: { up: { uk: 'пожеж стало більше', en: 'fires became more frequent' }, down: { uk: 'пожеж стало менше', en: 'fires became less frequent' } },
    group: 'impact',
    name: { uk: 'Пожежі', en: 'Fires' },
    definition: {
      uk: 'Точки, де прилад VIIRS за добу зафіксував незвично гарячу поверхню: лісові, степові й польові пожежі, зокрема спричинені обстрілами, а також газові факели. У числах факели й заводи не враховано.',
      en: 'Places where VIIRS detected an unusually hot surface in a day: forest, grass and field fires, including those started by shelling, and gas flares. Flares and plants are left out of the numbers.',
    },
    unit: { uk: 'виявлень', en: 'detections' },
    trendUnit: { uk: 'виявлень за 10 років', en: 'detections per decade' },
    source: { uk: 'NASA FIRMS, VIIRS', en: 'NASA FIRMS, VIIRS' },
    sourceUrl: 'https://firms.modaps.eosdis.nasa.gov/',
    imagery: {
      layer: 'VIIRS_SNPP_Thermal_Anomalies_375m_All',
      matrixSet: '500m',
      format: 'image/png',
      time: 'daily',
      first: '2012-01-20',
      last: '2026-11-02',
      month: 8,
      day: 1,
      via: 'wms',
      points: true,
    },
    series: { kind: 'grid', file: 'fires/ukraine', unit: 1, combine: 'sum', coverage: { uk: 'Пожежі пораховано лише в межах України (архів NASA FIRMS по країнах).', en: 'Fires are counted inside Ukraine only (NASA FIRMS country archive).' } },
    years: [2012, 2025],
  },
  {
    id: 'truecolor',
    group: 'land',
    name: { uk: 'Знімок у справжніх кольорах', en: 'True-colour image' },
    definition: {
      uk: 'Фото Землі з космосу таким, яким його побачила б людина: прилад MODIS знімає всю планету щодня.',
      en: 'A photo of Earth from space as a person would see it: MODIS images the whole planet every day.',
    },
    unit: { uk: '', en: '' },
    trendUnit: { uk: '', en: '' },
    source: { uk: 'MODIS, супутник Terra', en: 'MODIS on Terra' },
    sourceUrl: 'https://worldview.earthdata.nasa.gov/',
    imagery: {
      layer: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      matrixSet: '250m',
      format: 'image/jpeg',
      time: 'daily',
      first: '2000-02-24',
      last: '2026-11-09',
      month: 8,
      day: 20,
      // Terra flies in the morning with fewer cumulus clouds; its orbit gaps near the equator are
      // filled from VIIRS (wide swath, no gaps) or, before 2016, from MODIS on Aqua.
      gapFill: [
        { layer: 'VIIRS_SNPP_CorrectedReflectance_TrueColor', first: '2016-01-01', name: { uk: 'VIIRS (Suomi NPP)', en: 'VIIRS (Suomi NPP)' } },
        { layer: 'MODIS_Aqua_CorrectedReflectance_TrueColor', first: '2002-07-04', name: { uk: 'MODIS (Aqua)', en: 'MODIS (Aqua)' } },
      ],
    },
  },
];

export const variableById = Object.fromEntries(variables.map((v) => [v.id, v])) as Record<VariableId, Variable>;

export const groups: { id: Variable['group']; name: Text }[] = [
  { id: 'climate', name: { uk: 'Клімат', en: 'Climate' } },
  { id: 'water', name: { uk: 'Вода', en: 'Water' } },
  { id: 'land', name: { uk: 'Суша', en: 'Land' } },
  { id: 'air', name: { uk: 'Повітря', en: 'Air' } },
  { id: 'impact', name: { uk: 'Людина й війна', en: 'People and war' } },
];

/** The date shown for a variable in a given year (and month for monthly layers). */
export function imageryDate(img: Imagery, year: number, month = img.month): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(img.time === 'daily' ? img.day ?? 15 : 1).padStart(2, '0');
  const date = `${year}-${mm}-${dd}`;
  if (date < img.first) return img.first;
  if (date > img.last) return img.last;
  return date;
}

export function imageryYears(img: Imagery): [number, number] {
  return [Number(img.first.slice(0, 4)), Number(img.last.slice(0, 4))];
}
