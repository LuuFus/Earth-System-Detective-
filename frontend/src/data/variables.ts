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
  /**
   * Coarse data (MERRA-2 0.5°, AIRS and OMI 1°): GIBS level with about one data cell a pixel. The
   * globe stretches that level smoothly instead of drawing the cells as big squares up close.
   */
  native?: number;
  /** Data only over land: the layer is cut along the coastline (Natural Earth). */
  landOnly?: boolean;
  /** Daily swaths with gaps between orbits and under clouds: filled from up to this many days before and after. */
  fillDays?: number;
  /** One picture with no dates (population, a reference map): no timeline. */
  static?: boolean;
};

/** Where the numbers for the chart come from. */
export type SeriesSource =
  | { kind: 'gistemp' }
  | { kind: 'power'; parameter: 'T2M' | 'PRECTOTCORR' | 'GWETROOT' | 'RH2M' | 'TS'; aggregate: 'mean' | 'total' | 'percent' }
  | { kind: 'ozonehole' }
  /**
   * A monthly grid built by data-pipeline (public/data/<file>.json + .bin), shown divided by `unit`.
   * `sum`: counts, added up over the cells and the months; `mean`: averaged over the area.
   */
  | {
      kind: 'grid';
      file: string;
      unit: number;
      combine: 'mean' | 'sum';
      coverage: Text;
      /**
       * Numbers for anywhere else: when a region lies outside the grid, both regions use this
       * NASA POWER parameter instead, so the comparison stays like for like.
       */
      fallback?: { source: { kind: 'power'; parameter: 'TS'; aggregate: 'mean' }; note: Text };
    };

export type Variable = {
  id: VariableId;
  group: 'temp' | 'water' | 'air' | 'land' | 'people';
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
  | 'truecolor'
  | 'sst'
  | 'snow'
  | 'seaice'
  | 'imerg'
  | 'vapor'
  | 'aerosol'
  | 'dust'
  | 'co'
  | 'wind10'
  | 'landcover'
  | 'population';

const POWER_URL = 'https://power.larc.nasa.gov/';
const POWER_YEARS: [number, number] = [1981, 2025];

export const variables: Variable[] = [
  {
    id: 'gistemp',
    change: { up: { uk: 'стало тепліше', en: 'it got warmer' }, down: { uk: 'стало холодніше', en: 'it got colder' } },
    group: 'temp',
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
    group: 'temp',
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
      native: 0,
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
      native: 0,
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
      native: 0,
      landOnly: true,
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
      native: 0,
    },
    series: { kind: 'power', parameter: 'RH2M', aggregate: 'mean' },
    years: POWER_YEARS,
  },
  {
    id: 'lst',
    change: { up: { uk: 'поверхня стала гарячішою', en: 'the surface got hotter' }, down: { uk: 'поверхня стала холоднішою', en: 'the surface got cooler' } },
    group: 'temp',
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
    series: {
      kind: 'grid',
      file: 'lst/ukraine',
      unit: 1,
      combine: 'mean',
      coverage: { uk: 'Числа поки є лише над Україною та сусідніми районами (44-53° пн. ш., 22-41° сх. д.).', en: 'Numbers cover Ukraine and its neighbourhood only for now (44-53° N, 22-41° E).' },
      fallback: {
        source: { kind: 'power', parameter: 'TS', aggregate: 'mean' },
        note: {
          uk: 'Точні числа MODIS у нас є лише над Україною, тому тут обидва регіони пораховано однаково за температурою поверхні Землі з моделі MERRA-2 (NASA POWER). Це середнє за добу (день і ніч разом), тож вона нижча за денну температуру MODIS на карті.',
          en: 'We have exact MODIS numbers over Ukraine only, so here both regions are computed the same way from the Earth skin temperature of the MERRA-2 model (NASA POWER). It is a day-and-night mean, so it is lower than the daytime MODIS temperature on the map.',
        },
      },
    },
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
      native: 1,
      fillDays: 3,
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
      native: 0,
      fillDays: 3,
    },
    series: { kind: 'ozonehole' },
    years: [1979, 2025],
  },
  {
    id: 'nightlights',
    group: 'people',
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
    group: 'land',
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


const MERRA2_URL = 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/';
const MONTHLY_MERRA = (layer: string): Imagery => ({ layer, matrixSet: '2km', format: 'image/png', time: 'monthly', first: '1980-01-01', last: '2026-08-01', month: 7, native: 0 });
const PER_DECADE = { uk: 'за 10 років', en: 'per decade' };

/** Map-only layers from NASA GIBS: each shows a picture of the Earth for the chosen date. */
const mapLayers: Variable[] = [
  {
    id: 'sst',
    group: 'temp',
    name: { uk: 'Температура моря', en: 'Sea surface temperature' },
    definition: {
      uk: 'Температура верхнього шару океану за щоденним аналізом MUR, що зводить вимірювання кількох супутників і буїв. Тепла вода живить урагани й шкодить коралам.',
      en: 'Temperature of the top of the ocean from the daily MUR analysis, which blends several satellites and buoys. Warm water feeds hurricanes and harms corals.',
    },
    unit: { uk: '°C', en: '°C' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA JPL, GHRSST MUR', en: 'NASA JPL, GHRSST MUR' },
    sourceUrl: 'https://podaac.jpl.nasa.gov/MEaSUREs-MUR',
    imagery: { layer: 'GHRSST_L4_MUR_Sea_Surface_Temperature', matrixSet: '1km', format: 'image/png', time: 'daily', first: '2002-06-01', last: '2026-11-18', month: 8, day: 15 },
  },
  {
    id: 'snow',
    group: 'water',
    name: { uk: 'Сніговий покрив', en: 'Snow cover' },
    definition: {
      uk: 'Яку частку місяця земля була під снігом, за приладом MODIS на супутнику Terra. Показує, як змінюються зими.',
      en: 'The share of the month the ground was under snow, from MODIS on the Terra satellite. Shows how winters are changing.',
    },
    unit: { uk: '%', en: '%' },
    trendUnit: PER_DECADE,
    source: { uk: 'MODIS Terra, NSIDC', en: 'MODIS Terra, NSIDC' },
    sourceUrl: 'https://nsidc.org/data/mod10cm',
    imagery: { layer: 'MODIS_Terra_L3_Snow_Cover_Monthly_Average_Pct', matrixSet: '2km', format: 'image/png', time: 'monthly', first: '2000-03-01', last: '2026-10-01', month: 1 },
  },
  {
    id: 'seaice',
    group: 'water',
    name: { uk: 'Морський лід', en: 'Sea ice' },
    definition: {
      uk: 'Яку частку моря вкриває лід, за мікрохвильовим приладом AMSR2. Узимку лід наростає, улітку тане; у вересні Арктика має найменше льоду.',
      en: 'The share of the sea covered by ice, from the AMSR2 microwave instrument. Ice grows in winter and melts in summer; the Arctic has least ice in September.',
    },
    unit: { uk: '%', en: '%' },
    trendUnit: PER_DECADE,
    source: { uk: 'AMSR2 на GCOM-W1, NSIDC', en: 'AMSR2 on GCOM-W1, NSIDC' },
    sourceUrl: 'https://nsidc.org/data/au_si12',
    imagery: { layer: 'AMSRU2_Sea_Ice_Concentration_12km', matrixSet: '2km', format: 'image/png', time: 'daily', first: '2012-07-02', last: '2025-09-01', month: 9, day: 1 },
  },
  {
    id: 'imerg',
    group: 'water',
    name: { uk: 'Опади за добу (GPM)', en: 'Daily precipitation (GPM)' },
    definition: {
      uk: 'Скільки дощу й снігу випало за добу за місією GPM: супутники з радарами й мікрохвильовими приладами бачать опади навіть над океаном.',
      en: 'How much rain and snow fell in a day, from the GPM mission: satellites with radar and microwave instruments see rain even over the ocean.',
    },
    unit: { uk: 'мм/год', en: 'mm/h' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA GPM IMERG', en: 'NASA GPM IMERG' },
    sourceUrl: 'https://gpm.nasa.gov/data/imerg',
    imagery: { layer: 'IMERG_Precipitation_Rate', matrixSet: '2km', format: 'image/png', time: 'daily', first: '2000-06-01', last: '2026-11-18', month: 7, day: 15 },
  },
  {
    id: 'vapor',
    group: 'water',
    name: { uk: 'Водяна пара', en: 'Water vapour' },
    definition: {
      uk: 'Скільки води у вигляді пари в стовпі повітря над місцем, якби її всю сконденсувати. Тепле повітря тримає більше пари, звідси сильніші зливи.',
      en: 'How much water vapour the column of air holds, as millimetres of water if it all condensed. Warmer air holds more vapour, hence heavier downpours.',
    },
    unit: { uk: 'мм', en: 'mm' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA GMAO MERRA-2', en: 'NASA GMAO MERRA-2' },
    sourceUrl: MERRA2_URL,
    imagery: MONTHLY_MERRA('MERRA2_Total_Precipitable_Water_Vapor_Monthly'),
  },
  {
    id: 'aerosol',
    group: 'air',
    name: { uk: 'Аерозолі: дим і пил', en: 'Aerosols: smoke and dust' },
    definition: {
      uk: 'Наскільки повітря каламутне від дрібних частинок: диму пожеж, пилу пустель, морської солі, вихлопів. Що більше число, то менше сонця доходить до землі.',
      en: 'How hazy the air is with fine particles: wildfire smoke, desert dust, sea salt, exhaust. The higher the number, the less sunlight reaches the ground.',
    },
    unit: { uk: 'оптична товщина', en: 'optical depth' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA GMAO MERRA-2', en: 'NASA GMAO MERRA-2' },
    sourceUrl: MERRA2_URL,
    imagery: MONTHLY_MERRA('MERRA2_Total_Aerosol_Optical_Thickness_550nm_Scattering_Monthly'),
  },
  {
    id: 'dust',
    group: 'air',
    name: { uk: 'Пил біля землі (PM2.5)', en: 'Dust near the ground (PM2.5)' },
    definition: {
      uk: 'Скільки дрібного мінерального пилу в повітрі, яким ми дихаємо. Найбільше його над Сахарою, Аравією й пустелями Азії; вітер несе його на тисячі кілометрів.',
      en: 'How much fine mineral dust is in the air we breathe. Most is over the Sahara, Arabia and the deserts of Asia; wind carries it thousands of kilometres.',
    },
    unit: { uk: 'мкг/м³', en: 'µg/m³' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA GMAO MERRA-2', en: 'NASA GMAO MERRA-2' },
    sourceUrl: MERRA2_URL,
    imagery: MONTHLY_MERRA('MERRA2_Dust_Surface_Mass_Concentration_PM25_Monthly'),
  },
  {
    id: 'co',
    group: 'air',
    name: { uk: 'Чадний газ (CO)', en: 'Carbon monoxide (CO)' },
    definition: {
      uk: 'Чадний газ у середній атмосфері за приладом AIRS. Його дають пожежі й спалювання палива; шлейфи видно за тисячі кілометрів від джерела.',
      en: 'Carbon monoxide in the middle atmosphere from the AIRS instrument. Fires and burning fuel produce it; plumes show thousands of kilometres from the source.',
    },
    unit: { uk: 'ppbv', en: 'ppbv' },
    trendUnit: PER_DECADE,
    source: { uk: 'AIRS на супутнику Aqua', en: 'AIRS on Aqua' },
    sourceUrl: 'https://airs.jpl.nasa.gov/',
    imagery: { layer: 'AIRS_L3_Carbon_Monoxide_500hPa_Volume_Mixing_Ratio_Monthly_Day', matrixSet: '2km', format: 'image/png', time: 'monthly', first: '2002-09-01', last: '2026-09-01', month: 8, native: 0 },
  },
  {
    id: 'wind10',
    group: 'air',
    name: { uk: 'Вітер біля землі (за місяць)', en: 'Surface wind (monthly)' },
    definition: {
      uk: 'Середня за місяць швидкість вітру на висоті 10 метрів. Вітер зараз і прогноз — у розділі «Погода».',
      en: 'Monthly mean wind speed 10 metres above the ground. Wind now and the forecast are in the Weather tool.',
    },
    unit: { uk: 'м/с', en: 'm/s' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA GMAO MERRA-2', en: 'NASA GMAO MERRA-2' },
    sourceUrl: MERRA2_URL,
    imagery: MONTHLY_MERRA('MERRA2_Surface_Wind_Speed_Monthly'),
  },
  {
    id: 'landcover',
    group: 'land',
    name: { uk: 'Типи земель', en: 'Land cover' },
    definition: {
      uk: 'Що вкриває землю: ліси, луки, поля, міста, пустелі, лід, за річною класифікацією MODIS. Порівняйте роки, щоб побачити вирубки чи зростання міст.',
      en: 'What covers the land: forest, grassland, cropland, cities, desert, ice, from the yearly MODIS classification. Compare years to see clearing or growing cities.',
    },
    unit: { uk: 'клас', en: 'class' },
    trendUnit: PER_DECADE,
    source: { uk: 'MODIS (MCD12Q1), LP DAAC', en: 'MODIS (MCD12Q1), LP DAAC' },
    sourceUrl: 'https://lpdaac.usgs.gov/products/mcd12q1v061/',
    imagery: { layer: 'MODIS_Combined_L3_IGBP_Land_Cover_Type_Annual', matrixSet: '500m', format: 'image/png', time: 'monthly', first: '2001-01-01', last: '2024-01-01', month: 1 },
  },
  {
    id: 'population',
    group: 'people',
    name: { uk: 'Густота населення', en: 'Population density' },
    definition: {
      uk: 'Скільки людей живе на квадратному кілометрі, оцінка на 2020 рік за переписами всіх країн (SEDAC, NASA).',
      en: 'How many people live on a square kilometre, estimated for 2020 from the censuses of every country (SEDAC, NASA).',
    },
    unit: { uk: 'осіб/км²', en: 'people/km²' },
    trendUnit: PER_DECADE,
    source: { uk: 'NASA SEDAC, GPWv4', en: 'NASA SEDAC, GPWv4' },
    sourceUrl: 'https://sedac.ciesin.columbia.edu/data/collection/gpw-v4',
    imagery: { layer: 'GPW_Population_Density_2020', matrixSet: '1km', format: 'image/png', time: 'monthly', first: '2020-01-01', last: '2020-01-01', month: 1, static: true },
  },
];
variables.push(...mapLayers);

export const variableById = Object.fromEntries(variables.map((v) => [v.id, v])) as Record<VariableId, Variable>;

export const groups: { id: Variable['group']; name: Text }[] = [
  { id: 'temp', name: { uk: 'Температура', en: 'Temperature' } },
  { id: 'water', name: { uk: 'Вода й волога', en: 'Water and moisture' } },
  { id: 'air', name: { uk: 'Повітря', en: 'Air' } },
  { id: 'land', name: { uk: 'Земля', en: 'Land' } },
  { id: 'people', name: { uk: 'Люди', en: 'People' } },
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

/** The dates within `days` of `date` (nearest first, before then after), inside the layer's range. */
export function nearbyDates(img: Imagery, date: string, days: number): string[] {
  const t = Date.parse(`${date}T00:00:00Z`);
  const out: string[] = [];
  for (let k = 1; k <= days; k++) {
    for (const sign of [-1, 1]) {
      const d = new Date(t + sign * k * 86_400_000).toISOString().slice(0, 10);
      if (d >= img.first && d <= img.last) out.push(d);
    }
  }
  return out;
}

export function imageryYears(img: Imagery): [number, number] {
  return [Number(img.first.slice(0, 4)), Number(img.last.slice(0, 4))];
}
