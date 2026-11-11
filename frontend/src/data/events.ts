// Events that explain a bump or a turn in a chart: shown as marks on the yearly chart, only for
// the variables they explain and, for regional events, only when the region overlaps theirs.

import type { Text, VariableId } from './variables';

export type ChartEvent = {
  year: number;
  /** A few words, drawn on the chart. */
  label: Text;
  /** One sentence, shown when the mark is hovered. */
  detail: Text;
  variables: VariableId[];
  /** Where it applies; none means everywhere. */
  box?: { s: number; w: number; n: number; e: number };
  /** Where the fact comes from. */
  source?: { label: string; url: string };
};

const UKRAINE = { s: 44, w: 22, n: 53, e: 41 };
const SAHEL = { s: 10, w: -18, n: 20, e: 40 };

export const events: ChartEvent[] = [
  {
    year: 1987,
    label: { uk: 'Монреальський протокол', en: 'Montreal Protocol' },
    detail: {
      uk: 'Країни домовилися поступово відмовитися від фреонів та інших речовин, що руйнують озон.',
      en: 'Countries agreed to phase out CFCs and other ozone-depleting substances.',
    },
    variables: ['ozone'],
    source: { label: 'NASA Ozone Watch', url: 'https://ozonewatch.gsfc.nasa.gov/' },
  },
  {
    year: 2019,
    label: { uk: 'Тепла стратосфера', en: 'Warm stratosphere' },
    detail: {
      uk: 'Незвично тепла стратосфера над Антарктидою у вересні 2019 року дала найменшу озонову діру з 1982 року.',
      en: 'An unusually warm stratosphere over Antarctica in September 2019 gave the smallest ozone hole since 1982.',
    },
    variables: ['ozone'],
    source: { label: 'NASA: 2019 Ozone Hole is the Smallest on Record', url: 'https://science.nasa.gov/earth/climate-change/ozone-layer/2019-ozone-hole-is-the-smallest-on-record-145747/' },
  },
  {
    year: 1991,
    label: { uk: 'Пінатубо', en: 'Pinatubo' },
    detail: {
      uk: 'Виверження вулкана Пінатубо в червні 1991 року: сірчистий газ у стратосфері охолодив планету приблизно на 0,5-0,6 °C на 15 місяців.',
      en: 'The Pinatubo eruption in June 1991: sulphur dioxide in the stratosphere cooled the planet by about 0.5-0.6 °C for 15 months.',
    },
    variables: ['gistemp'],
    source: { label: 'NASA Earth Observatory: Global Effects of Mount Pinatubo', url: 'https://science.nasa.gov/earth/earth-observatory/global-effects-of-mount-pinatubo-1510/' },
  },
  {
    year: 1998,
    label: { uk: 'Ель-Ніньйо', en: 'El Niño' },
    detail: {
      uk: 'Сильне Ель-Ніньйо 1997-1998 років: тепла фаза в Тихому океані підняла глобальну температуру.',
      en: 'The strong 1997-1998 El Niño: a warm phase in the Pacific lifted the global temperature.',
    },
    variables: ['gistemp'],
    source: { label: 'NASA GISS, GISTEMP', url: 'https://data.giss.nasa.gov/gistemp/' },
  },
  {
    year: 2016,
    label: { uk: 'Ель-Ніньйо', en: 'El Niño' },
    detail: {
      uk: 'Сильне Ель-Ніньйо 2015-2016 років на тлі потепління зробило 2016 рік рекордним на той час.',
      en: 'The strong 2015-2016 El Niño on top of the warming made 2016 a record year at the time.',
    },
    variables: ['gistemp'],
    source: { label: 'NASA GISS, GISTEMP', url: 'https://data.giss.nasa.gov/gistemp/' },
  },
  {
    year: 2024,
    label: { uk: 'Ель-Ніньйо', en: 'El Niño' },
    detail: {
      uk: 'Ель-Ніньйо 2023-2024 років: 2024 рік став найтеплішим за всю історію вимірювань.',
      en: 'The 2023-2024 El Niño: 2024 became the warmest year on record.',
    },
    variables: ['gistemp'],
    source: { label: 'NASA: 2024 Was the Warmest Year on Record', url: 'https://www.naturalhazards.nasa.gov/images/153806/2024-was-the-warmest-year-on-record' },
  },
  {
    year: 1984,
    label: { uk: 'Посушливі роки', en: 'Dry years' },
    detail: {
      uk: 'З 1970 по 1990 рік у Сахелі тривали надзвичайно посушливі роки; з 1990-х дощі частково повернулися.',
      en: 'From 1970 to 1990 the Sahel had exceptionally dry years; from the 1990s the rains partly came back.',
    },
    variables: ['precip', 'soil'],
    source: { label: 'NASA Earth Observatory: Defining Desertification', url: 'https://science.nasa.gov/earth/earth-observatory/defining-desertification/' },
    box: SAHEL,
  },
  {
    year: 2020,
    label: { uk: 'Карантин', en: 'Lockdown' },
    detail: {
      uk: 'Карантин COVID-19 навесні 2020 року: у багатьох країнах різко впав рух транспорту.',
      en: 'COVID-19 lockdowns in spring 2020: road traffic dropped sharply in many countries.',
    },
    variables: ['no2'],
  },
  {
    year: 2014,
    label: { uk: 'Окупація Криму', en: 'Crimea occupied' },
    detail: {
      uk: 'Росія окупувала Крим і частину Донецької та Луганської областей.',
      en: 'Russia occupied Crimea and parts of the Donetsk and Luhansk regions.',
    },
    variables: ['no2', 'fires', 'nightlights'],
    box: UKRAINE,
  },
  {
    year: 2022,
    label: { uk: 'Вторгнення', en: 'Invasion' },
    detail: {
      uk: '24 лютого 2022 року Росія почала повномасштабне вторгнення в Україну.',
      en: 'On 24 February 2022 Russia launched its full-scale invasion of Ukraine.',
    },
    variables: ['no2', 'fires', 'nightlights'],
    box: UKRAINE,
  },
];

function overlaps(a: { s: number; w: number; n: number; e: number }, b: { s: number; w: number; n: number; e: number }): boolean {
  return a.s <= b.n && a.n >= b.s && a.w <= b.e && a.e >= b.w;
}

/** Events for a chart of `variable` over regions with these bounding boxes. */
export function eventsFor(variable: VariableId, boxes: { s: number; w: number; n: number; e: number }[]): ChartEvent[] {
  return events
    .filter((e) => e.variables.includes(variable) && (!e.box || boxes.some((b) => overlaps(b, e.box!))))
    .sort((a, b) => a.year - b.year);
}
