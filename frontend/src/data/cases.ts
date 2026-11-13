// Ready-made investigations. The stories state only established facts; every number the user
// sees for a case is computed on the spot from the NASA data (see analysis/series.ts).

import type { Region, Season } from '../analysis/series';
import type { Text, VariableId } from './variables';

export type GistempMode = 'year' | 'compare' | 'trend';

export type Case = {
  id: string;
  title: Text;
  story: Text;
  /** What to put on the globe. */
  variable: VariableId;
  gistempMode?: GistempMode;
  /** Year on the timeline (map), and the period for the trend and the chart. */
  year: number;
  from: number;
  to: number;
  /** The variable for the chart, when the map shows imagery without numbers. */
  analysisVariable?: VariableId;
  season?: Season;
  regionA?: Region;
  regionB?: Region;
  camera: { lat: number; lon: number; distance: number };
  borders?: boolean;
  /** Turn on the Ukraine war layer. */
  war?: boolean;
  /** Opens the before/after shutter with this year on the left (`year` is on the right). */
  compare?: number;
  /** How the chart opens (years by default). */
  chartView?: 'year' | 'month' | 'cycle';
  sources: { label: string; url: string }[];
};

const WAR_LIST = { label: 'Наказ Мінрозвитку № 376, zakon.rada.gov.ua', url: 'https://zakon.rada.gov.ua/laws/show/z0380-25' };
const OSM = { label: '© OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' };

const GISTEMP = { label: 'NASA GISS, GISTEMP v4', url: 'https://data.giss.nasa.gov/gistemp/' };
const POWER = { label: 'NASA POWER, MERRA-2', url: 'https://power.larc.nasa.gov/' };

const MODIS_LST = { label: 'MODIS Terra MOD11C3 (LP DAAC)', url: 'https://lpdaac.usgs.gov/products/mod11c3v061/' };

export const cases: Case[] = [
  {
    id: 'usa-canada',
    title: { uk: 'Сусіди: США і Канада', en: 'Neighbours: the USA and Canada' },
    story: {
      uk: 'Дві великі країни на одному материку. Порівняйте, наскільки нагріта поверхня землі в кожній з них, чи змінюється вона і де швидше. Числа для обох країн пораховано однаково з температури поверхні NASA POWER (MERRA-2); карта показує денну температуру поверхні з MODIS у липні.',
      en: 'Two big countries on one continent. Compare how warm the ground is in each, whether it is changing and where faster. Both countries are computed the same way from the NASA POWER (MERRA-2) skin temperature; the map shows the daytime MODIS surface temperature in July.',
    },
    variable: 'lst',
    year: 2025,
    from: 2001,
    to: 2025,
    borders: true,
    regionA: { kind: 'country', code: 'US', lat: 39.54, lon: -97.48, box: { s: 18.97, w: -178.19, n: 71.41, e: 179.78 } },
    regionB: { kind: 'country', code: 'CA', lat: 60.32, lon: -101.91, box: { s: 41.67, w: -141.0, n: 83.12, e: -52.65 } },
    camera: { lat: 50, lon: -100, distance: 2.7 },
    sources: [POWER, MODIS_LST],
  },
  {
    id: 'kyiv-odesa',
    title: { uk: 'Два міста: Київ і Одеса', en: 'Two cities: Kyiv and Odesa' },
    story: {
      uk: 'Одеса стоїть на березі Чорного моря, Київ — далеко від нього. Подивіться на сезонний цикл: у якому місті тепліше взимку, у якому влітку, і де температура змінюється за рік сильніше. Потім перемкніть графік на «Роки», щоб побачити, де швидше теплішає.',
      en: 'Odesa stands on the Black Sea coast, Kyiv far from it. Look at the seasonal cycle: which city is warmer in winter, which in summer, and where the temperature swings more over a year. Then switch the chart to "Years" to see where it warms faster.',
    },
    variable: 't2m',
    year: 2025,
    from: 1981,
    to: 2025,
    borders: true,
    chartView: 'cycle',
    regionA: { kind: 'point', lat: 50.45, lon: 30.52, radiusKm: 0, name: { uk: 'Київ', en: 'Kyiv' } },
    regionB: { kind: 'point', lat: 46.48, lon: 30.73, radiusKm: 0, name: { uk: 'Одеса', en: 'Odesa' } },
    camera: { lat: 48.4, lon: 31, distance: 1.6 },
    sources: [POWER],
  },
  {
    id: 'arctic',
    title: { uk: 'Арктика гріється найшвидше', en: 'The Arctic warms fastest' },
    story: {
      uk: 'Коли тануть сніг і лід, темна вода й земля поглинають більше сонячного тепла, і це прискорює потепління. Порівняйте тренд Арктики з трендом усієї Землі.',
      en: 'As snow and ice melt, dark water and land absorb more sunlight, which speeds up warming. Compare the Arctic trend with the trend of the whole planet.',
    },
    variable: 'gistemp',
    gistempMode: 'trend',
    year: 2025,
    from: 1960,
    to: 2025,
    regionA: { kind: 'box', s: 66.5, w: -180, n: 90, e: 180, name: { uk: 'Арктика (на північ від 66,5°)', en: 'Arctic (north of 66.5°)' } },
    regionB: { kind: 'box', s: -90, w: -180, n: 90, e: 180, name: { uk: 'Уся Земля', en: 'Whole Earth' } },
    camera: { lat: 78, lon: 20, distance: 2.6 },
    sources: [
      GISTEMP,
      { label: 'NASA: Arctic Amplification, Process Drivers (Taylor et al. 2022)', url: 'https://ntrs.nasa.gov/citations/20220012781' },
      { label: 'NASA Earth Observatory: World of Change, Arctic Sea Ice', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/arctic-sea-ice/' },
    ],
  },
  {
    id: 'warminghole',
    title: { uk: '«Дірка потепління» біля Гренландії', en: 'The warming hole off Greenland' },
    story: {
      uk: 'На південь від Гренландії океан майже не потеплішав за століття, хоча на тих самих широтах у Європі стало помітно тепліше. Дослідники пов’язують це з послабленням атлантичної течії AMOC, яка несе тепло на північ.',
      en: 'South of Greenland the ocean has barely warmed in a century, while Europe at the same latitudes has clearly warmed. Researchers link this to a weakening of the Atlantic overturning circulation (AMOC), which carries heat north.',
    },
    variable: 'gistemp',
    gistempMode: 'trend',
    year: 2025,
    from: 1900,
    to: 2025,
    regionA: { kind: 'box', s: 50, w: -45, n: 60, e: -25, name: { uk: 'Атлантика на південь від Гренландії', en: 'Atlantic south of Greenland' } },
    regionB: { kind: 'box', s: 45, w: 0, n: 55, e: 15, name: { uk: 'Західна Європа', en: 'Western Europe' } },
    camera: { lat: 54, lon: -20, distance: 2.3 },
    sources: [GISTEMP, { label: 'Rahmstorf et al. 2015, Nature Climate Change', url: 'https://doi.org/10.1038/nclimate2554' }],
  },
  {
    id: 'aral',
    title: { uk: 'Висихання Аральського моря', en: 'The shrinking Aral Sea' },
    story: {
      uk: 'Колись одне з найбільших озер світу. Починаючи з 1960-х, воду річок Амудар’я і Сирдар’я забирали на зрошування полів. Тягніть шторку на глобусі: ліворуч знімок MODIS за 20 серпня 2000 року, праворуч за 20 серпня 2025-го. Східна частина моря зникла зовсім.',
      en: 'Once one of the largest lakes on Earth. From the 1960s the water of the Amu Darya and Syr Darya rivers was diverted to irrigate fields. Drag the divider on the globe: on the left a MODIS image of 20 August 2000, on the right 20 August 2025. The eastern part of the sea is gone.',
    },
    variable: 'truecolor',
    year: 2025,
    compare: 2000,
    from: 1981,
    to: 2025,
    analysisVariable: 't2m',
    season: 'jja',
    regionA: { kind: 'point', lat: 45.2, lon: 59.6, radiusKm: 0, name: { uk: 'Аральське море', en: 'Aral Sea' } },
    camera: { lat: 45.2, lon: 59.6, distance: 1.22 },
    borders: true,
    sources: [
      { label: 'NASA Earth Observatory: World of Change, Shrinking Aral Sea', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea' },
      POWER,
    ],
  },
  {
    id: 'kakhovka',
    title: { uk: 'Каховське водосховище: до і після', en: 'The Kakhovka Reservoir: before and after' },
    story: {
      uk: 'Греблю Каховської ГЕС, яку з 2022 року контролювали російські окупанти, зруйновано 6 червня 2023 року. Водосховище площею понад 2 тис. км² спорожніло за кілька днів. Тягніть шторку: ліворуч знімок MODIS за 20 серпня 2022 року, праворуч за 20 серпня 2023-го.',
      en: 'The Kakhovka dam, held by Russian occupying forces since 2022, was destroyed on 6 June 2023. The reservoir, over 2,000 km², drained within days. Drag the divider: on the left a MODIS image of 20 August 2022, on the right 20 August 2023.',
    },
    variable: 'truecolor',
    year: 2023,
    compare: 2022,
    from: 2012,
    to: 2025,
    camera: { lat: 47.2, lon: 34.2, distance: 1.07 },
    borders: true,
    sources: [
      { label: 'NASA Earth Observatory: Canals in Ukraine are Drying Up', url: 'https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up' },
      { label: 'NASA Worldview, MODIS Terra, 20.08.2022', url: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_CorrectedReflectance_TrueColor&t=2022-08-20' },
      { label: 'NASA Worldview, MODIS Terra, 20.08.2023', url: 'https://worldview.earthdata.nasa.gov/?l=MODIS_Terra_CorrectedReflectance_TrueColor&t=2023-08-20' },
    ],
  },
  {
    id: 'ozone',
    title: { uk: 'Чи загоюється озонова діра', en: 'Is the ozone hole healing' },
    story: {
      uk: 'Фреони з холодильників і балончиків руйнували озон над Антарктидою щовесни. За Монреальським протоколом 1987 року країни поступово відмовилися від цих речовин. Подивіться, чи площа діри зменшується з 2000 року і чи значущий цей тренд.',
      en: 'CFCs from fridges and spray cans destroyed ozone over Antarctica every spring. The 1987 Montreal Protocol banned them. See whether the hole has shrunk since 2000 and whether that trend is significant.',
    },
    variable: 'ozone',
    year: 2025,
    from: 2000,
    to: 2025,
    regionA: { kind: 'point', lat: -90, lon: 0, radiusKm: 0, name: { uk: 'Антарктида', en: 'Antarctica' } },
    camera: { lat: -78, lon: 0, distance: 2.7 },
    sources: [
      { label: 'NASA Ozone Watch', url: 'https://ozonewatch.gsfc.nasa.gov/' },
      { label: 'NASA Earth Observatory: World of Change, Antarctic Ozone Hole', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/ozone-hole/' },
    ],
  },
  {
    id: 'sahel',
    title: { uk: 'Опади в Сахелі', en: 'Rain in the Sahel' },
    story: {
      uk: 'У 1970-80-х Сахель на південь від Сахари пережив тяжкі посухи. Порівняйте літні опади (червень-серпень) на заході й на сході регіону: та сама кліматична система, але тренди можуть різнитися.',
      en: 'In the 1970s and 1980s the Sahel, south of the Sahara, went through severe droughts. Compare summer rain (June to August) in the west and the east of the region: one climate system, but the trends can differ.',
    },
    variable: 'precip',
    year: 2024,
    from: 1981,
    to: 2025,
    season: 'jja',
    regionA: { kind: 'box', s: 12, w: -5, n: 18, e: 5, name: { uk: 'Західний Сахель (Малі, Буркіна-Фасо, Нігер)', en: 'Western Sahel (Mali, Burkina Faso, Niger)' } },
    regionB: { kind: 'box', s: 12, w: 15, n: 18, e: 25, name: { uk: 'Східний Сахель (Чад, Судан)', en: 'Eastern Sahel (Chad, Sudan)' } },
    camera: { lat: 15, lon: 8, distance: 1.9 },
    borders: true,
    sources: [
      POWER,
      { label: 'NASA Earth Observatory: Defining Desertification', url: 'https://science.nasa.gov/earth/earth-observatory/defining-desertification/' },
    ],
  },
  {
    id: 'ukraine',
    title: { uk: 'Україна: як змінився клімат', en: 'Ukraine: how the climate changed' },
    story: {
      uk: 'Температура повітря в Києві та Одесі з 1981 року за місячними даними NASA MERRA-2. Усі цифри нижче пораховано щойно, коли ви відкрили цю справу.',
      en: 'Air temperature in Kyiv and Odesa since 1981 from NASA MERRA-2 monthly data. Every number below was computed just now, when you opened this case.',
    },
    variable: 't2m',
    year: 2024,
    from: 1981,
    to: 2025,
    season: 'year',
    regionA: { kind: 'point', lat: 50.45, lon: 30.52, radiusKm: 0, name: { uk: 'Київ', en: 'Kyiv' } },
    regionB: { kind: 'point', lat: 46.48, lon: 30.73, radiusKm: 0, name: { uk: 'Одеса', en: 'Odesa' } },
    camera: { lat: 48.5, lon: 31, distance: 1.7 },
    borders: true,
    sources: [POWER],
  },
  {
    id: 'ukraine-war',
    title: { uk: 'Україна: війна з космосу', en: 'Ukraine: the war seen from space' },
    story: {
      uk: 'Росія окупувала Крим і частину Донбасу у 2014 році, а 24 лютого 2022 року почала повномасштабне вторгнення. Червоним позначено тимчасово окуповані громади, оранжевим громади з активними бойовими діями за офіційним переліком Мінрозвитку. Жовті точки показують пожежі й теплові аномалії, які прилад VIIRS зафіксував за добу. Гортайте роки внизу.',
      en: 'Russia occupied Crimea and part of Donbas in 2014 and launched its full-scale invasion on 24 February 2022. Red marks temporarily occupied hromadas, orange hromadas with active hostilities, from the official list of the Ministry for Development of Ukraine. The dots are fires and thermal anomalies VIIRS detected in one day. Scroll the years below.',
    },
    variable: 'fires',
    year: 2025,
    from: 2012,
    to: 2025,
    camera: { lat: 48.2, lon: 36.4, distance: 1.42 },
    borders: true,
    war: true,
    sources: [WAR_LIST, { label: 'NASA FIRMS, VIIRS', url: 'https://firms.modaps.eosdis.nasa.gov/' }, OSM],
  },
];
