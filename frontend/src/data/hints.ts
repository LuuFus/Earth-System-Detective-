// Hints on the globe: notable anomalies and events that appear when you zoom in on their area.
// Every statement here follows the linked NASA article (or the official source next to it);
// nothing is inferred beyond it.

import type { Text } from './variables';

export type Hint = {
  id: string;
  lat: number;
  lon: number;
  title: Text;
  text: Text;
  sources: { label: string; url: string }[];
  /** Exact NASA imagery of the event day in NASA Worldview. */
  worldview?: string;
  /** A detective case that explores it further. */
  caseId?: string;
};

const wv = (layers: string, date: string, extent: string) =>
  `https://worldview.earthdata.nasa.gov/?v=${extent}&l=${layers}&t=${date}`;
const FIRE_LAYERS = 'MODIS_Terra_CorrectedReflectance_TrueColor,VIIRS_SNPP_Thermal_Anomalies_375m_All';

export const hints: Hint[] = [
  {
    id: 'chornobyl-fires',
    lat: 51.35,
    lon: 30.1,
    title: { uk: 'Пожежі в Чорнобильській зоні, 2020', en: 'Fires in the Chornobyl zone, 2020' },
    text: {
      uk: 'У квітні 2020 року понад тиждень горіли ліси біля Чорнобильської зони відчуження; їх гасили сотні рятувальників і авіація. Дим із забруднених ділянок може піднімати радіоактивні частинки й переносити їх далеко.',
      en: 'In April 2020 forests near the Chornobyl Exclusion Zone burned for more than a week; hundreds of firefighters and aircraft fought them. Smoke from contaminated areas can lift radioactive particles and carry them far.',
    },
    sources: [{ label: 'NASA Earth Observatory: Fires Burn in Northern Ukraine', url: 'https://science.nasa.gov/earth/earth-observatory/fires-burn-in-northern-ukraine-146561/' }],
    worldview: wv(FIRE_LAYERS, '2020-04-08', '28.5,50.3,31.7,52.3'),
  },
  {
    id: 'field-burning',
    lat: 48.6,
    lon: 32.3,
    title: { uk: 'Весняне паління полів', en: 'Spring field burning' },
    text: {
      uk: 'Навесні супутники щороку бачать в Україні сотні вогнищ на полях: так спалюють стерню й суху траву перед сівбою. 9 квітня 2018 року прилад VIIRS нарахував в Україні 552 такі точки; у сусідніх країнах їх було значно менше. Дим погіршує повітря, а в Україні за незаконне випалювання сухої рослинності штрафують.',
      en: 'Every spring satellites see hundreds of field fires in Ukraine: stubble and dry grass are burned before sowing. On 9 April 2018 VIIRS counted 552 such hotspots in Ukraine, far more than in neighbouring countries. The smoke worsens the air, and illegal burning of dry vegetation is fined in Ukraine.',
    },
    sources: [
      { label: 'NASA: Fires in Ukraine Most Likely Agricultural in Nature', url: 'https://www.nasa.gov/image-feature/goddard/2018/fires-in-ukraine-most-likely-agricultural-in-nature' },
      { label: 'КУпАП, ст. 77-1', url: 'https://zakon.rada.gov.ua/laws/show/80731-10' },
    ],
    worldview: wv(FIRE_LAYERS, '2018-04-09', '22,44,41,53'),
  },
  {
    id: 'kakhovka',
    lat: 47.2,
    lon: 34.2,
    title: { uk: 'Каховське водосховище після 6 червня 2023', en: 'The Kakhovka Reservoir after 6 June 2023' },
    text: {
      uk: 'Після руйнування греблі водосховище здебільшого спорожніло, і канали, що брали з нього воду, зокрема Північнокримський, пересохли. Вода з затоплених сіл і полів нижче за течією зійшла за кілька тижнів.',
      en: 'After the dam was destroyed the reservoir mostly emptied, and the canals that drew water from it, including the North Crimean Canal, ran dry. Floodwater downstream receded within weeks.',
    },
    sources: [{ label: 'NASA Earth Observatory: Canals in Ukraine are Drying Up', url: 'https://earthobservatory.nasa.gov/images/151622/canals-in-ukraine-are-drying-up' }],
    caseId: 'kakhovka',
  },
  {
    id: 'aral',
    lat: 45.2,
    lon: 59.6,
    title: { uk: 'Аральське море', en: 'The Aral Sea' },
    text: {
      uk: 'Колись четверте за площею озеро світу. У 1960-х воду його річок почали розбирати на зрошування, і море розпалося на кілька частин; у 2014 році східна частина Південного Аралу зникла повністю.',
      en: 'Once the fourth largest lake in the world. In the 1960s its rivers were diverted for irrigation and the sea broke into parts; in 2014 the eastern lobe of the South Aral Sea disappeared completely.',
    },
    sources: [{ label: 'NASA Earth Observatory: World of Change, Aral Sea', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/aral-sea' }],
    caseId: 'aral',
  },
  {
    id: 'lake-chad',
    lat: 13.2,
    lon: 14.3,
    title: { uk: 'Озеро Чад', en: 'Lake Chad' },
    text: {
      uk: 'У 1960-х озеро Чад займало щонайменше 22 000 км². До 1980-х, після років посухи, його площа скоротилася приблизно до 300 км².',
      en: 'In the 1960s Lake Chad covered at least 22,000 km². By the 1980s, after years of drought, its area fell to about 300 km².',
    },
    sources: [{ label: 'NASA Earth Observatory: The Rise and Fall of Africa’s Great Lake', url: 'https://science.nasa.gov/earth/earth-observatory/lake-chad/' }],
  },
  {
    id: 'sahel',
    lat: 14.5,
    lon: 0,
    title: { uk: 'Сахель: посухи і повернення дощів', en: 'The Sahel: droughts and the return of rain' },
    text: {
      uk: 'З 1970 по 1990 рік у Сахелі тривали надзвичайно посушливі роки. З 1990-х дощі частково повернулися і рослинності стало більше, але рік від року опади дуже різні.',
      en: 'From 1970 to 1990 the Sahel had exceptionally dry years. From the 1990s the rains partly came back and vegetation returned, but rainfall varies a lot from year to year.',
    },
    sources: [{ label: 'NASA Earth Observatory: Defining Desertification', url: 'https://science.nasa.gov/earth/earth-observatory/defining-desertification/' }],
    caseId: 'sahel',
  },
  {
    id: 'pinatubo',
    lat: 15.14,
    lon: 120.35,
    title: { uk: 'Вулкан Пінатубо, 1991', en: 'Mount Pinatubo, 1991' },
    text: {
      uk: 'У червні 1991 року Пінатубо викинув у стратосферу близько 15 млн тонн сірчистого газу. Пелена крапельок сірчаної кислоти розійшлася довкола планети й охолодила її приблизно на 0,6 °C протягом наступних 15 місяців. Цей провал видно на графіку глобальної температури.',
      en: 'In June 1991 Pinatubo put about 15 million tonnes of sulphur dioxide into the stratosphere. A haze of sulphuric acid droplets spread around the planet and cooled it by about 0.6 °C over the next 15 months. The dip shows on the global temperature chart.',
    },
    sources: [{ label: 'NASA Earth Observatory: Global Effects of Mount Pinatubo', url: 'https://science.nasa.gov/earth/earth-observatory/global-effects-of-mount-pinatubo-1510/' }],
  },
  {
    id: 'amazon-2019',
    lat: -9,
    lon: -56,
    title: { uk: 'Пожежі в Амазонії, 2019', en: 'Amazon fires, 2019' },
    text: {
      uk: 'У серпні 2019 року супутники бачили в бразильській Амазонії більше пожеж, ніж на цей час року в будь-який рік з 2010-го. За часом і місцем вони більше схожі на розчищення землі, ніж на природні пожежі від посухи.',
      en: 'By August 2019 satellites had seen more fires in the Brazilian Amazon than by that point of any year since 2010. Their timing and location look more like land clearing than drought-driven wildfires.',
    },
    sources: [{ label: 'NASA Earth Observatory: Uptick in Amazon Fire Activity in 2019', url: 'https://earthobservatory.nasa.gov/images/145498/uptick-in-amazon-fire-activity-in-2019' }],
    worldview: wv(FIRE_LAYERS, '2019-08-15', '-66,-15,-46,-3'),
  },
  {
    id: 'canada-2023',
    lat: 52.5,
    lon: -75,
    title: { uk: 'Рекордні пожежі в Канаді, 2023', en: 'Canada’s record fires, 2023' },
    text: {
      uk: 'За сезон 2023 року в Канаді згоріло близько 18,4 млн гектарів, більш ніж у 7 разів більше, ніж у середньому за рік (2,5 млн га). Багато пожеж запалили блискавки, і вони горіли місяцями у віддалених районах.',
      en: 'In the 2023 season about 18.4 million hectares burned in Canada, more than 7 times the yearly average of 2.5 million. Many fires were started by lightning and burned for months in remote areas.',
    },
    sources: [{ label: 'NASA Earth Observatory: Tracking Canada’s Extreme 2023 Fire Season', url: 'https://science.nasa.gov/earth/earth-observatory/tracking-canadas-extreme-2023-fire-season-151985/' }],
    worldview: wv(FIRE_LAYERS, '2023-06-06', '-82,45,-66,56'),
  },
  {
    id: 'arctic-ice',
    lat: 82,
    lon: 10,
    title: { uk: 'Морський лід Арктики', en: 'Arctic sea ice' },
    text: {
      uk: '12 вересня 2026 року площа морського льоду в Арктиці була близько 4,6 млн км², на рівні десятого найменшого значення за всі роки супутникових спостережень. Товстого багаторічного льоду стає дедалі менше.',
      en: 'On 12 September 2026 Arctic sea ice covered about 4.6 million km², tied for the tenth lowest in the satellite record. Thick multiyear ice keeps declining.',
    },
    sources: [{ label: 'NASA Earth Observatory: Arctic Sea Ice Shrinks to Its 2026 Minimum', url: 'https://science.nasa.gov/earth/earth-observatory/arctic-sea-ice-shrinks-to-its-2026-minimum/' }],
    caseId: 'arctic',
  },
  {
    id: 'columbia-glacier',
    lat: 61.15,
    lon: -147.08,
    title: { uk: 'Льодовик Колумбія, Аляска', en: 'Columbia Glacier, Alaska' },
    text: {
      uk: 'Близько 1980 року льодовик втратив опору на мореному валу й почав швидко відступати; до 2011 року він розпався на два окремі льодовики.',
      en: 'Around 1980 the glacier lost its footing on a moraine and began a fast retreat; by 2011 it had split into two separate glaciers.',
    },
    sources: [{ label: 'NASA Earth Observatory: World of Change, Columbia Glacier', url: 'https://science.nasa.gov/earth/earth-observatory/world-of-change/columbia-glacier/' }],
  },
];

export const hintById = Object.fromEntries(hints.map((h) => [h.id, h])) as Record<string, Hint>;
