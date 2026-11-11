import type { Text } from './variables';

export type Term = { id: string; term: Text; text: Text };

export const glossary: Term[] = [
  {
    id: 'trend',
    term: { uk: 'Тренд', en: 'Trend' },
    text: {
      uk: 'Стійка зміна в одному напрямку протягом багатьох років: величина в середньому зростає або спадає, хоча окремі роки стрибають угору й униз.',
      en: 'A steady change in one direction over many years: the value rises or falls on average even though single years jump up and down.',
    },
  },
  {
    id: 'anomaly',
    term: { uk: 'Аномалія', en: 'Anomaly' },
    text: {
      uk: 'Різниця між значенням і «нормою» за базовий період. Аномалія +1 °C означає, що рік був на градус теплішим за середнє 1951-1980 років.',
      en: 'The difference between a value and the "normal" of a base period. An anomaly of +1 °C means the year was a degree warmer than the 1951-1980 average.',
    },
  },
  {
    id: 'baseline',
    term: { uk: 'Базовий період', en: 'Base period' },
    text: {
      uk: 'Роки, середнє яких вважають нормою для порівняння. У GISTEMP це 1951-1980.',
      en: 'The years whose average is taken as normal for comparison. GISTEMP uses 1951-1980.',
    },
  },
  {
    id: 'significance',
    term: { uk: 'Статистична значущість', en: 'Statistical significance' },
    text: {
      uk: 'Тренд значущий, якщо його дуже важко пояснити випадковими коливаннями. Тут поріг стандартний: p < 0,05.',
      en: 'A trend is significant when random ups and downs can hardly explain it. The usual threshold is used here: p < 0.05.',
    },
  },
  {
    id: 'pvalue',
    term: { uk: 'p-value', en: 'p-value' },
    text: {
      uk: 'Імовірність побачити такий самий або сильніший тренд, якби насправді жодного тренду не було. Чим менше p, тим переконливіший тренд. p = 0,01 означає 1 шанс зі 100.',
      en: 'The chance of seeing a trend this strong or stronger if there were really no trend at all. The smaller p is, the more convincing the trend. p = 0.01 means 1 chance in 100.',
    },
  },
  {
    id: 'mannkendall',
    term: { uk: 'Тест Манна-Кендалла', en: 'Mann-Kendall test' },
    text: {
      uk: 'Перевіряє, чи значення частіше зростають, ніж спадають: порівнює кожен рік з кожним наступним. Не потребує, щоб дані лягали на пряму, тому його люблять кліматологи.',
      en: 'Checks whether values go up more often than down by comparing every year with every later year. It does not need the data to follow a straight line, which is why climate scientists like it.',
    },
  },
  {
    id: 'sen',
    term: { uk: 'Нахил Тейла-Сена', en: 'Theil-Sen slope' },
    text: {
      uk: 'Швидкість тренду: медіана нахилів між усіма парами років. Один дуже спекотний чи холодний рік майже не впливає на результат.',
      en: 'How fast the trend goes: the median of the slopes between every pair of years. A single very hot or cold year barely changes it.',
    },
  },
  {
    id: 'ci',
    term: { uk: 'Довірчий інтервал 95%', en: '95% confidence interval' },
    text: {
      uk: 'Межі, між якими зі звичною для науки впевненістю лежить справжня швидкість тренду. Якщо інтервал не містить нуля, тренд значущий.',
      en: 'The range in which, with the usual scientific confidence, the true speed of the trend lies. If it does not include zero, the trend is significant.',
    },
  },
  {
    id: 'ttest',
    term: { uk: 't-тест нахилу', en: 't-test of the slope' },
    text: {
      uk: 'Класична перевірка прямої лінії тренду (метод найменших квадратів): чи відрізняється її нахил від нуля. Показуємо поруч із Манном-Кендаллом для порівняння.',
      en: 'The classic check of a straight trend line (least squares): is its slope different from zero? Shown next to Mann-Kendall for comparison.',
    },
  },
  {
    id: 'yearsneeded',
    term: { uk: 'Скільки ще років треба', en: 'Years still needed' },
    text: {
      uk: 'Оцінка Вейтерхеда та ін. (1998): скільки років даних потрібно, щоб тренд такої сили на такому шумі став помітним. Враховує розкид років і те, як сусідні роки схожі між собою.',
      en: 'The Weatherhead et al. (1998) estimate of how many years of data a trend this strong needs to stand out from this much noise. It accounts for the spread of years and how alike neighbouring years are.',
    },
  },
  {
    id: 'seasonal',
    term: { uk: 'Сезонний цикл', en: 'Seasonal cycle' },
    text: {
      uk: 'Щорічне коливання: літо тепліше за зиму. Щоб воно не заважало бачити тренд, порівнюємо однакові сезони або середнє за рік.',
      en: 'The yearly swing: summer is warmer than winter. To keep it from hiding a trend, the same season or the yearly average is compared.',
    },
  },
  {
    id: 'reanalysis',
    term: { uk: 'Реаналіз (MERRA-2)', en: 'Reanalysis (MERRA-2)' },
    text: {
      uk: 'Модель погоди NASA, яка «перепрогравала» минуле з 1980 року, щоразу підлаштовуючись під мільйони реальних вимірювань. Дає однорідні дані для всієї Землі.',
      en: "NASA's weather model replaying the past since 1980 while matching millions of real measurements. Gives consistent data for the whole Earth.",
    },
  },
  {
    id: 'opposite',
    term: { uk: 'Протилежні тренди', en: 'Opposite trends' },
    text: {
      uk: 'Одна величина може зростати в одному регіоні й спадати в іншому через той самий процес. Тому варто порівнювати кілька регіонів, а не лише середнє по Землі.',
      en: 'One variable can rise in one region and fall in another because of the same process. That is why several regions are worth comparing, not just the global average.',
    },
  },
  {
    id: 'satellite',
    term: { uk: 'Супутникові прилади', en: 'Satellite instruments' },
    text: {
      uk: 'MODIS (Terra, Aqua) знімає сушу й хмари, OMI (Aura) міряє озон і забруднення, AIRS (Aqua) температуру й вологість атмосфери, VIIRS (Suomi NPP) нічні вогні й пожежі.',
      en: 'MODIS (Terra, Aqua) images land and clouds, OMI (Aura) measures ozone and pollution, AIRS (Aqua) the temperature and humidity of the atmosphere, VIIRS (Suomi NPP) night lights and fires.',
    },
  },
];
