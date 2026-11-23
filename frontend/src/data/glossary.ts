// The glossary: every term the site uses, in plain words, with its formula, how to read its
// numbers, a worked example and where on the site it shows up. The formulas are the ones the site
// computes (see analysis/stats.ts and the "How it is computed" tab).

import type { Text } from './variables';

export type GlossaryGroup = 'stats' | 'data' | 'air' | 'fire';

export type Term = {
  id: string;
  group: GlossaryGroup;
  term: Text;
  /** What it is, in plain words. */
  text: Text;
  /** The formula, one line each; the same in both languages unless given as Text. */
  formula?: (string | Text)[];
  /** What the symbols in the formula mean. */
  symbols?: Text;
  /** How to read the numbers: ranges, thresholds, units. */
  values?: Text;
  /** A worked example. */
  example?: Text;
  /** Where on the site it appears. */
  where?: Text;
};

export const GLOSSARY_GROUPS: { id: GlossaryGroup; name: Text }[] = [
  { id: 'stats', name: { uk: 'Тренди й статистика', en: 'Trends and statistics' } },
  { id: 'data', name: { uk: 'Клімат і дані з космосу', en: 'Climate and data from space' } },
  { id: 'air', name: { uk: 'Повітря', en: 'Air' } },
  { id: 'fire', name: { uk: 'Пожежі, радіація, війна', en: 'Fires, radiation, war' } },
];

export const glossary: Term[] = [
  // ---------- trends and statistics ----------
  {
    id: 'trend',
    group: 'stats',
    term: { uk: 'Тренд', en: 'Trend' },
    text: {
      uk: 'Стійка зміна в одному напрямку протягом багатьох років: величина в середньому зростає або спадає, хоча окремі роки стрибають угору й униз.',
      en: 'A steady change in one direction over many years: the value rises or falls on average even though single years jump up and down.',
    },
    formula: ['x(t) ≈ a + β · t'],
    symbols: { uk: 'x — величина (наприклад, температура), t — рік, β — швидкість зміни за рік, a — рівень на початку.', en: 'x is the value (for example temperature), t the year, β the change per year, a the starting level.' },
    values: { uk: 'β > 0 — величина зростає, β < 0 — спадає. На сайті швидкість показано «за 10 років» (10 · β).', en: 'β > 0: the value rises; β < 0: it falls. The site shows the speed "per decade" (10 · β).' },
    example: { uk: '+0,3 °C за 10 років означає, що за 50 років стало тепліше приблизно на 1,5 °C.', en: '+0.3 °C per decade means about 1.5 °C warmer over 50 years.' },
    where: { uk: 'Аналіз: речення над графіком і пунктирна лінія тренду.', en: 'Analysis: the sentence above the chart and the dashed trend line.' },
  },
  {
    id: 'mannkendall',
    group: 'stats',
    term: { uk: 'Тест Манна-Кендалла', en: 'Mann-Kendall test' },
    text: {
      uk: 'Перевіряє, чи значення частіше зростають, ніж спадають: порівнює кожен рік з кожним наступним. Не потребує, щоб дані лягали на пряму чи мали «правильний» розподіл, тому його люблять кліматологи.',
      en: 'Checks whether values go up more often than down by comparing every year with every later year. It does not need the data to follow a straight line or a "normal" distribution, which is why climate scientists like it.',
    },
    formula: [
      'S = Σ_{i<j} sgn(x_j − x_i)',
      'Var(S) = [n(n−1)(2n+5) − Σ t(t−1)(2t+5)] / 18',
      { uk: 'Z = (S − 1) / √Var(S), якщо S > 0;   Z = (S + 1) / √Var(S), якщо S < 0', en: 'Z = (S − 1) / √Var(S) if S > 0;   Z = (S + 1) / √Var(S) if S < 0' },
      'p = 2 · [1 − Φ(|Z|)]',
    ],
    symbols: {
      uk: 'sgn — знак різниці: +1 (зросло), −1 (впало), 0 (так само); n — кількість років; t — розміри груп однакових значень; Φ — функція нормального розподілу.',
      en: 'sgn is the sign of the difference: +1 (up), −1 (down), 0 (same); n is the number of years; t the sizes of groups of equal values; Φ the normal distribution function.',
    },
    values: {
      uk: 'S > 0 — частіше зростає, S < 0 — частіше спадає. |Z| > 1,96 відповідає p < 0,05 — тренд значущий.',
      en: 'S > 0: rises more often; S < 0: falls more often. |Z| > 1.96 corresponds to p < 0.05 — a significant trend.',
    },
    example: {
      uk: '10 років дають 45 пар. Якщо в 35 парах пізніший рік тепліший, а в 10 холодніший, то S = 35 − 10 = 25; Var(S) = 10·9·25/18 = 125; Z = 24/√125 ≈ 2,15; p ≈ 0,03 — значущо.',
      en: '10 years give 45 pairs. If the later year is warmer in 35 pairs and colder in 10, then S = 35 − 10 = 25; Var(S) = 10·9·25/18 = 125; Z = 24/√125 ≈ 2.15; p ≈ 0.03 — significant.',
    },
    where: { uk: 'Аналіз: «світлофор» надійності та вкладка «Як це рахується» з вашими числами.', en: 'Analysis: the reliability "traffic light" and the "How it is computed" tab with your numbers.' },
  },
  {
    id: 'seasonal',
    group: 'stats',
    term: { uk: 'Сезонний тест і сезонний цикл', en: 'Seasonal test and seasonal cycle' },
    text: {
      uk: 'Літо тепліше за зиму щороку — це сезонний цикл, а не тренд. Щоб він не заважав, сезонний тест Манна-Кендалла порівнює січень лише з іншими січнями, лютий — з лютими і так далі, а потім додає результати.',
      en: 'Summer is warmer than winter every year — that is the seasonal cycle, not a trend. To keep it out of the way, the seasonal Mann-Kendall test compares January only with other Januaries, February with Februaries and so on, then adds the results.',
    },
    formula: ['S = Σ_{m=1..12} S_m', 'Var(S) = Σ_{m=1..12} Var(S_m)', { uk: 'норма_m = середнє місяця m за всі роки;  аномалія = x − норма_m', en: 'normal_m = mean of month m over all years;  anomaly = x − normal_m' }],
    values: { uk: 'Читається так само, як звичайний тест: Z і p.', en: 'Read it like the ordinary test: Z and p.' },
    where: { uk: 'Аналіз: вигляд «Місяці» й «Дні» (сезонний тест), вигляд «Сезонний цикл».', en: 'Analysis: the "Months" and "Days" views (seasonal test), the "Seasonal cycle" view.' },
  },
  {
    id: 'sen',
    group: 'stats',
    term: { uk: 'Нахил Тейла-Сена', en: 'Theil-Sen slope' },
    text: {
      uk: 'Швидкість тренду: медіана нахилів між усіма парами років. Один дуже спекотний чи холодний рік майже не впливає на результат, на відміну від звичайної прямої.',
      en: 'How fast the trend goes: the median of the slopes between every pair of years. A single very hot or cold year barely changes it, unlike an ordinary straight line.',
    },
    formula: [{ uk: 'β = медіана (x_j − x_i) / (t_j − t_i),  i < j', en: 'β = median (x_j − x_i) / (t_j − t_i),  i < j' }, { uk: 'за 10 років = 10 · β', en: 'per decade = 10 · β' }],
    values: { uk: 'Одиниці — одиниці величини за рік (°C/рік, мм/рік). Зміна за весь період ≈ β × кількість років.', en: 'Units are the value’s units per year (°C/yr, mm/yr). The change over the whole period ≈ β × number of years.' },
    example: {
      uk: 'Три роки: 10, 12, 11. Нахили пар: (12−10)/1 = 2; (11−10)/2 = 0,5; (11−12)/1 = −1. Медіана — 0,5 за рік, тобто 5 за 10 років.',
      en: 'Three years: 10, 12, 11. Pair slopes: (12−10)/1 = 2; (11−10)/2 = 0.5; (11−12)/1 = −1. The median is 0.5 a year, so 5 per decade.',
    },
    where: { uk: 'Аналіз: «+X за 10 років» і лінія тренду на графіку.', en: 'Analysis: "+X per decade" and the trend line on the chart.' },
  },
  {
    id: 'ci',
    group: 'stats',
    term: { uk: 'Довірчий інтервал 95%', en: '95% confidence interval' },
    text: {
      uk: 'Межі, між якими зі звичною для науки впевненістю лежить справжня швидкість тренду. Для нахилу Сена межі беруть із впорядкованого списку всіх нахилів пар.',
      en: 'The range in which, with the usual scientific confidence, the true speed of the trend lies. For the Sen slope the limits are taken from the sorted list of all pair slopes.',
    },
    formula: [
      'C = 1,96 · √Var(S)',
      { uk: 'нижня межа — нахил № (N − C) / 2, верхня — № (N + C) / 2 + 1', en: 'lower limit: slope no. (N − C) / 2, upper: no. (N + C) / 2 + 1' },
    ],
    symbols: { uk: 'N — кількість нахилів (пар років), Var(S) — з тесту Манна-Кендалла.', en: 'N is the number of slopes (pairs of years), Var(S) comes from the Mann-Kendall test.' },
    values: { uk: 'Якщо інтервал не містить нуля (обидві межі одного знака), тренд значущий. Що вужчий інтервал, то точніше відома швидкість.', en: 'If the interval excludes zero (both limits have the same sign), the trend is significant. The narrower it is, the better the speed is known.' },
    example: { uk: '+0,2 … +0,4 °C за 10 років: майже напевно теплішає, найімовірніше на 0,3.', en: '+0.2 … +0.4 °C per decade: almost certainly warming, most likely by 0.3.' },
    where: { uk: 'Аналіз: інтервал біля швидкості тренду; «Як це рахується».', en: 'Analysis: the interval next to the trend speed; "How it is computed".' },
  },
  {
    id: 'pvalue',
    group: 'stats',
    term: { uk: 'p-value і значущість', en: 'p-value and significance' },
    text: {
      uk: 'p — імовірність побачити такий самий або сильніший тренд, якби насправді жодного тренду не було. Тренд називають значущим, якщо його дуже важко пояснити випадковими коливаннями.',
      en: 'p is the chance of seeing a trend this strong or stronger if there were really no trend at all. A trend is called significant when random ups and downs can hardly explain it.',
    },
    formula: ['p = P(|Z| ≥ |z|  |  β = 0)'],
    values: {
      uk: 'p < 0,01 — дуже переконливо (зелений); p < 0,05 — значущо, стандартний поріг; 0,05–0,1 — слабкий натяк (жовтий); p > 0,1 — може бути випадковістю (сірий).',
      en: 'p < 0.01: very convincing (green); p < 0.05: significant, the standard threshold; 0.05-0.1: a weak hint (yellow); p > 0.1: could be chance (grey).',
    },
    example: { uk: 'p = 0,01 означає 1 шанс зі 100 побачити такий тренд у даних без тренду.', en: 'p = 0.01 means 1 chance in 100 of seeing such a trend in data with no trend.' },
    where: { uk: 'Аналіз: «світлофор» надійності біля кожного регіону.', en: 'Analysis: the reliability "traffic light" next to each region.' },
  },
  {
    id: 'ttest',
    group: 'stats',
    term: { uk: 'Пряма найменших квадратів і t-тест', en: 'Least-squares line and t-test' },
    text: {
      uk: 'Класична пряма тренду: така, для якої сума квадратів відхилень точок найменша. t-тест перевіряє, чи її нахил відрізняється від нуля. Показуємо поруч із Манном-Кендаллом для порівняння.',
      en: 'The classic trend line: the one with the smallest sum of squared deviations. The t-test checks whether its slope differs from zero. Shown next to Mann-Kendall for comparison.',
    },
    formula: ['b = Σ (t_i − t̄)(x_i − x̄) / Σ (t_i − t̄)²', 't = b / SE(b),  SE(b) = √[ Σ e_i² / (n − 2) / Σ (t_i − t̄)² ]', 'R² = 1 − Σ e_i² / Σ (x_i − x̄)²'],
    symbols: { uk: 'e_i — відхилення року від прямої, x̄ і t̄ — середні.', en: 'e_i is a year’s deviation from the line, x̄ and t̄ are means.' },
    values: { uk: 'R² від 0 до 1: частка розкиду, яку пояснює пряма. R² = 0,6 — тренд помітний; R² = 0,05 — роки стрибають сильніше, ніж росте тренд.', en: 'R² from 0 to 1: the share of the spread the line explains. R² = 0.6: a clear trend; R² = 0.05: the years jump more than the trend grows.' },
    where: { uk: 'Аналіз → «Як це рахується».', en: 'Analysis → "How it is computed".' },
  },
  {
    id: 'autocorr',
    group: 'stats',
    term: { uk: 'Автокореляція φ', en: 'Autocorrelation φ' },
    text: {
      uk: 'Наскільки кожен рік схожий на попередній. Якщо після теплого року зазвичай іде теплий, дані «пам’ятають» минуле, і незалежної інформації в них менше, ніж здається.',
      en: 'How much each year resembles the one before. If a warm year is usually followed by a warm one, the data "remember" the past and hold less independent information than it seems.',
    },
    formula: ['φ = Σ e_t · e_{t−1} / Σ e_t²'],
    values: { uk: 'φ ≈ 0 — роки незалежні; φ = 0,3–0,5 — помітна «пам’ять»; φ близько 1 — роки майже повторюють один одного.', en: 'φ ≈ 0: independent years; φ = 0.3-0.5: noticeable "memory"; φ close to 1: years nearly repeat each other.' },
    where: { uk: 'Аналіз → «Скільки ще років треба».', en: 'Analysis → "Years still needed".' },
  },
  {
    id: 'yearsneeded',
    group: 'stats',
    term: { uk: 'Скільки ще років треба', en: 'Years still needed' },
    text: {
      uk: 'Оцінка Вейтерхеда та ін. (1998): скільки років даних потрібно, щоб тренд такої сили на такому шумі став помітним. Що слабший тренд і що більше скачуть роки, то довше чекати.',
      en: 'The Weatherhead et al. (1998) estimate of how many years of data a trend this strong needs to stand out from this much noise. The weaker the trend and the jumpier the years, the longer the wait.',
    },
    formula: ['n* = [ 3,3 · σ / |ω| · √((1 + φ) / (1 − φ)) ]^(2/3)'],
    symbols: { uk: 'σ — розкид років навколо тренду, ω — нахил за рік, φ — автокореляція.', en: 'σ is the spread of years around the trend, ω the slope per year, φ the autocorrelation.' },
    example: { uk: 'σ = 0,5 °C, ω = 0,03 °C/рік, φ = 0,2: n* = (55 · 1,22)^(2/3) ≈ 17 років.', en: 'σ = 0.5 °C, ω = 0.03 °C/yr, φ = 0.2: n* = (55 · 1.22)^(2/3) ≈ 17 years.' },
    where: { uk: 'Аналіз → «Як це рахується».', en: 'Analysis → "How it is computed".' },
  },
  {
    id: 'band',
    group: 'stats',
    term: { uk: 'Смуга прогнозу', en: 'Prediction band' },
    text: {
      uk: 'Сіра смуга навколо лінії тренду: де за цим трендом мав би опинитися окремий рік. Рік поза смугою — справді незвичайний.',
      en: 'The grey band around the trend line: where a single year should fall under this trend. A year outside it is truly unusual.',
    },
    formula: ['x̂(t) = a + β·t ± t_{0,975} · s · √(1 + 1/n + (t − t̄)² / S_tt)'],
    values: { uk: 'У смузі лежать ≈ 95 % окремих років. Смуга ширшає до країв періоду: там тренд відомий гірше.', en: 'About 95% of single years fall inside. The band widens towards the ends of the period, where the trend is known less well.' },
    where: { uk: 'Аналіз: графік за роками.', en: 'Analysis: the yearly chart.' },
  },
  {
    id: 'regionmean',
    group: 'stats',
    term: { uk: 'Середнє по регіону', en: 'Regional mean' },
    text: {
      uk: 'Щоб отримати одне число для країни чи області, усереднюємо клітинки сітки. Клітинки біля полюсів менші за площею, тому їх рахують з меншою вагою.',
      en: 'To get one number for a country or region, the grid cells are averaged. Cells near the poles are smaller in area, so they get less weight.',
    },
    formula: ['x̄ = Σ w_i · x_i / Σ w_i,   w_i = cos φ_i'],
    symbols: { uk: 'φ_i — широта клітинки.', en: 'φ_i is the cell’s latitude.' },
    example: { uk: 'Клітинка на 60° широти важить удвічі менше, ніж на екваторі: cos 60° = 0,5.', en: 'A cell at 60° latitude weighs half as much as one at the equator: cos 60° = 0.5.' },
    where: { uk: 'Аналіз: країна, область чи коло навколо точки.', en: 'Analysis: a country, a region or a circle around a point.' },
  },
  {
    id: 'frequency',
    group: 'stats',
    term: { uk: '«Як часто тут буває»', en: '"How often it happens here"' },
    text: {
      uk: 'Частка днів із дощем, спекою, морозом чи сильним вітром у двох двадцятиріччях. Порівняння показує, чи такі дні почастішали.',
      en: 'The share of days with rain, heat, frost or strong wind in two twenty-year periods. The comparison shows whether such days have become more common.',
    },
    formula: [{ uk: 'P = k / N', en: 'P = k / N' }],
    symbols: { uk: 'k — кількість днів з явищем, N — усі дні періоду.', en: 'k is the number of days with the event, N all days of the period.' },
    example: { uk: '73 спекотні дні з 7 305 (20 років) — це 1 %, тобто ≈ 3,7 дня на рік.', en: '73 hot days out of 7,305 (20 years) is 1%, about 3.7 days a year.' },
    where: { uk: 'Погода → «Як часто тут буває» (1981–2000 проти 2006–2025).', en: 'Weather → "How often it happens here" (1981-2000 vs 2006-2025).' },
  },
  {
    id: 'opposite',
    group: 'stats',
    term: { uk: 'Протилежні тренди', en: 'Opposite trends' },
    text: {
      uk: 'Одна величина може зростати в одному регіоні й спадати в іншому через той самий процес. Тому варто порівнювати кілька регіонів, а не лише середнє по Землі.',
      en: 'One variable can rise in one region and fall in another because of the same process. That is why several regions are worth comparing, not just the global average.',
    },
    example: { uk: 'Опади в західному й східному Сахелі змінюються по-різному, хоча це одна кліматична система.', en: 'Rain in the western and eastern Sahel changes differently, though it is one climate system.' },
    where: { uk: 'Аналіз: регіон B для порівняння.', en: 'Analysis: region B for comparison.' },
  },

  // ---------- climate and data from space ----------
  {
    id: 'anomaly',
    group: 'data',
    term: { uk: 'Аномалія і базовий період', en: 'Anomaly and base period' },
    text: {
      uk: 'Аномалія — різниця між значенням і «нормою», тобто середнім за базовий період. У GISTEMP базовий період — 1951–1980 роки, до сильного потепління й з добрим покриттям станцій.',
      en: 'An anomaly is the difference between a value and the "normal", the average over a base period. GISTEMP uses 1951-1980, before strong warming and with good station coverage.',
    },
    formula: [{ uk: 'аномалія = x − середнє(1951–1980)', en: 'anomaly = x − mean(1951-1980)' }],
    values: { uk: '0 — як у середньому за 1951–1980; +1 °C — на градус тепліше; −0,5 °C — холодніше. Інший базовий період зсуває всі аномалії на одне число, але тренд не змінює.', en: '0: as on average in 1951-1980; +1 °C: a degree warmer; −0.5 °C: colder. Another base period shifts all anomalies by one number but leaves the trend unchanged.' },
    example: { uk: '2024 рік: ≈ +1,3 °C над нормою 1951–1980 для всієї Землі — найтепліший рік вимірювань.', en: '2024: about +1.3 °C above the 1951-1980 normal for the whole Earth — the warmest year on record.' },
    where: { uk: 'Шар «Аномалія температури» (GISTEMP), графіки аналізу.', en: 'The "Temperature anomaly" layer (GISTEMP), analysis charts.' },
  },
  {
    id: 'gistemp',
    group: 'data',
    term: { uk: 'GISTEMP', en: 'GISTEMP' },
    text: {
      uk: 'Температурний архів NASA GISS з 1880 року: тисячі метеостанцій на суші плюс температура поверхні моря, зведені в сітку клітинок 2° × 2°.',
      en: 'NASA GISS’s temperature record since 1880: thousands of land weather stations plus sea surface temperature, combined into a grid of 2° × 2° cells.',
    },
    values: { uk: 'Режими шару: «Рік» — аномалія за рік; «Різниця» — два роки порівняно; «Тренд» — °C за 10 років у кожній клітинці (незначущі заштриховано).', en: 'Layer modes: "Year" — the anomaly of a year; "Difference" — two years compared; "Trend" — °C per decade in each cell (non-significant ones hatched).' },
    where: { uk: 'Шари → Температура → «Аномалія температури».', en: 'Layers → Temperature → "Temperature anomaly".' },
  },
  {
    id: 'reanalysis',
    group: 'data',
    term: { uk: 'Реаналіз (MERRA-2)', en: 'Reanalysis (MERRA-2)' },
    text: {
      uk: 'Модель погоди NASA, яка «перепрогравала» минуле з 1980 року, щоразу підлаштовуючись під мільйони реальних вимірювань. Дає однорідні дані для всієї Землі навіть там, де немає станцій.',
      en: "NASA's weather model replaying the past since 1980 while matching millions of real measurements. Gives consistent data for the whole Earth, even where there are no stations.",
    },
    values: { uk: 'Клітинка ≈ 0,5° × 0,625° (≈ 50 км). Для міста це середнє по клітинці, а не вимір на вулиці.', en: 'A cell is about 0.5° × 0.625° (≈ 50 km). For a city it is the cell average, not a street measurement.' },
    where: { uk: 'Температура повітря, опади, волога ґрунту, вологість; «Моє місто» (NASA POWER).', en: 'Air temperature, precipitation, soil moisture, humidity; "My city" (NASA POWER).' },
  },
  {
    id: 'satellite',
    group: 'data',
    term: { uk: 'Супутникові прилади', en: 'Satellite instruments' },
    text: {
      uk: 'MODIS (Terra, Aqua) знімає сушу, хмари й температуру поверхні; VIIRS (Suomi NPP, NOAA-20, NOAA-21) — пожежі й нічні вогні; OMI (Aura) міряє озон і NO₂; AIRS (Aqua) — температуру, вологість і чадний газ в атмосфері; GPM — опади.',
      en: 'MODIS (Terra, Aqua) images land, clouds and surface temperature; VIIRS (Suomi NPP, NOAA-20, NOAA-21) fires and night lights; OMI (Aura) measures ozone and NO₂; AIRS (Aqua) temperature, humidity and carbon monoxide in the atmosphere; GPM precipitation.',
    },
    values: { uk: 'Роздільна здатність — розмір пікселя: VIIRS-пожежі 375 м, MODIS 250 м–1 км, OMI ≈ 13 × 24 км, AIRS ≈ 1°.', en: 'Resolution is the pixel size: VIIRS fires 375 m, MODIS 250 m-1 km, OMI ≈ 13 × 24 km, AIRS ≈ 1°.' },
    where: { uk: 'Шари: джерело кожного шару вказано під ним.', en: 'Layers: each layer’s source is shown under it.' },
  },
  {
    id: 'ndvi',
    group: 'data',
    term: { uk: 'NDVI (індекс рослинності)', en: 'NDVI (vegetation index)' },
    text: {
      uk: 'Наскільки зелена й густа рослинність. Живе листя сильно відбиває ближнє інфрачервоне світло й поглинає червоне — супутник порівнює ці два кольори.',
      en: 'How green and dense the vegetation is. Living leaves strongly reflect near-infrared light and absorb red — the satellite compares these two colours.',
    },
    formula: ['NDVI = (NIR − Red) / (NIR + Red)'],
    symbols: { uk: 'NIR — відбиття в ближньому інфрачервоному, Red — у червоному.', en: 'NIR is the near-infrared reflectance, Red the red reflectance.' },
    values: { uk: 'від −1 до 0 — вода, сніг, хмари; 0–0,2 — голий ґрунт, пісок, місто; 0,2–0,5 — трава, поля; 0,6–0,9 — густий ліс.', en: '−1 to 0: water, snow, clouds; 0-0.2: bare soil, sand, city; 0.2-0.5: grass, fields; 0.6-0.9: dense forest.' },
    example: { uk: 'NIR = 0,5, Red = 0,08 → NDVI = 0,42 / 0,58 ≈ 0,72 — густа рослинність.', en: 'NIR = 0.5, Red = 0.08 → NDVI = 0.42 / 0.58 ≈ 0.72 — dense vegetation.' },
    where: { uk: 'Шари → Земля → «Рослинність».', en: 'Layers → Land → "Vegetation".' },
  },
  {
    id: 'lst',
    group: 'data',
    term: { uk: 'Температура поверхні (LST) і моря (SST)', en: 'Land (LST) and sea (SST) surface temperature' },
    text: {
      uk: 'Наскільки нагріта сама поверхня — ґрунт, дах, асфальт чи вода, — а не повітря над нею. Супутник бачить її в тепловому інфрачервоному світлі. Улітку вдень суша буває набагато гарячішою за повітря.',
      en: 'How hot the surface itself is — soil, roofs, asphalt or water — not the air above it. The satellite sees it in thermal infrared light. On a summer day land can be much hotter than the air.',
    },
    values: { uk: 'Порожні місця на шарі — здебільшого хмари: крізь них температуру поверхні не видно.', en: 'Blank patches on the layer are mostly clouds: the surface temperature cannot be seen through them.' },
    where: { uk: 'Шари → Температура: «Температура поверхні суші», «Температура моря».', en: 'Layers → Temperature: "Land surface temperature", "Sea temperature".' },
  },
  {
    id: 'precip',
    group: 'data',
    term: { uk: 'Опади, мм', en: 'Precipitation, mm' },
    text: {
      uk: 'Скільки води впало б на рівну поверхню, якби вона не стікала й не випаровувалась. Сніг перераховують у воду.',
      en: 'How much water would collect on a flat surface if it did not run off or evaporate. Snow is converted to water.',
    },
    formula: [{ uk: '1 мм опадів = 1 літр води на 1 м²', en: '1 mm of precipitation = 1 litre of water per m²' }],
    values: { uk: 'мм/год — інтенсивність: 0,5–2 — слабкий дощ, 2–8 — помірний, понад 8 — сильний. За добу 50 мм і більше — дуже сильний дощ.', en: 'mm/h is intensity: 0.5-2 light rain, 2-8 moderate, over 8 heavy. 50 mm or more in a day is very heavy rain.' },
    example: { uk: '500 мм за 8 годин у Чіві (Іспанія, 2024) — це пів тонни води на кожен квадратний метр.', en: '500 mm in 8 hours in Chiva (Spain, 2024) is half a tonne of water on every square metre.' },
    where: { uk: 'Шари «Опади», погода, радар.', en: 'The "Precipitation" layers, the weather, the radar.' },
  },
  {
    id: 'soilmoisture',
    group: 'data',
    term: { uk: 'Волога ґрунту', en: 'Soil moisture' },
    text: {
      uk: 'Яка частка пор у шарі ґрунту, де ростуть корені, заповнена водою. Показує посуху краще, ніж самі опади: враховує й випаровування.',
      en: 'What share of the pores in the root-zone soil is filled with water. It shows drought better than rain alone, because it includes evaporation.',
    },
    values: { uk: '0 % — зовсім сухо, 100 % — ґрунт повністю насичений водою. Різке падіння влітку — ознака посухи.', en: '0%: completely dry; 100%: soil fully saturated. A sharp summer drop signals drought.' },
    where: { uk: 'Шари → Вода → «Волога ґрунту».', en: 'Layers → Water → "Soil moisture".' },
  },
  {
    id: 'seaice',
    group: 'data',
    term: { uk: 'Концентрація морського льоду', en: 'Sea ice concentration' },
    text: { uk: 'Яку частку моря в клітинці вкриває лід.', en: 'What share of the sea in a cell is covered by ice.' },
    values: { uk: 'Від 0 до 100 %. Клітинку з понад 15 % льоду вважають вкритою льодом — так рахують площу льоду Арктики.', en: '0 to 100%. A cell with over 15% ice counts as ice-covered — that is how the Arctic ice area is computed.' },
    where: { uk: 'Шари → Вода → «Морський лід».', en: 'Layers → Water → "Sea ice".' },
  },
  {
    id: 'dobson',
    group: 'data',
    term: { uk: 'Озон і одиниця Добсона', en: 'Ozone and the Dobson unit' },
    text: {
      uk: 'Озоновий шар у стратосфері поглинає шкідливий ультрафіолет. Його кількість міряють в одиницях Добсона (DU): якби весь озон над точкою стиснути до звичайного тиску, вийшов би дуже тонкий шар.',
      en: 'The ozone layer in the stratosphere absorbs harmful ultraviolet. It is measured in Dobson units (DU): if all the ozone above a point were squeezed to ordinary pressure, it would make a very thin layer.',
    },
    formula: [{ uk: '1 DU = шар чистого озону завтовшки 0,01 мм', en: '1 DU = a layer of pure ozone 0.01 mm thick' }],
    values: { uk: '≈ 300 DU — норма (3 мм); менше 220 DU — «озонова діра».', en: '≈ 300 DU is normal (3 mm); below 220 DU is the "ozone hole".' },
    where: { uk: 'Шар «Озон», подія «Озонова діра над Антарктидою».', en: 'The "Ozone" layer, the "Antarctic ozone hole" event.' },
  },
  {
    id: 'nightlights',
    group: 'data',
    term: { uk: 'Нічні вогні', en: 'Night lights' },
    text: {
      uk: 'Яскравість світла вночі, яку бачить VIIRS: міста, дороги, заводи, газові факели. Зникнення світла часто означає знеструмлення або спустіння.',
      en: 'The brightness of light at night seen by VIIRS: cities, roads, factories, gas flares. Light disappearing often means power cuts or abandonment.',
    },
    values: { uk: 'Одиниця — нВт/(см²·ср) (нановат на квадратний сантиметр на стерадіан). Місяць і хмари теж підсвічують знімок, тому порівнюють ясні ночі.', en: 'The unit is nW/(cm²·sr) (nanowatts per square centimetre per steradian). Moonlight and clouds also light the image, so clear nights are compared.' },
    where: { uk: 'Шар «Нічні вогні», порівняння «Блекаут» на панелі «Україна».', en: 'The "Night lights" layer, the "Blackout" comparison in the Ukraine panel.' },
  },

  // ---------- air ----------
  {
    id: 'aqi',
    group: 'air',
    term: { uk: 'AQI — індекс якості повітря', en: 'AQI — Air Quality Index' },
    text: {
      uk: 'Одне число від 0 до 500, яке перекладає концентрацію забруднення на зрозумілу шкалу. Кожна речовина має свої межі; AQI станції — найгірший з індексів PM2.5 і PM10. На сайті — шкала US EPA (2024).',
      en: 'One number from 0 to 500 that turns a pollution concentration into an easy scale. Each pollutant has its own breakpoints; a station’s AQI is the worst of its PM2.5 and PM10 indices. The site uses the US EPA scale (2024).',
    },
    formula: ['I = (I_hi − I_lo) / (C_hi − C_lo) · (C − C_lo) + I_lo', 'AQI = max(I_PM2.5, I_PM10)'],
    symbols: { uk: 'C — концентрація, C_lo і C_hi — межі діапазону, куди вона потрапила, I_lo і I_hi — значення індексу на цих межах.', en: 'C is the concentration, C_lo and C_hi the limits of the range it falls in, I_lo and I_hi the index values at those limits.' },
    values: {
      uk: '0–50 чисте; 51–100 прийнятне; 101–150 брудне для чутливих людей; 151–200 брудне для всіх; 201–300 дуже брудне; 301–500 небезпечне. Межі PM2.5 (мкг/м³): 9 / 35,4 / 55,4 / 125,4 / 225,4.',
      en: '0-50 clean; 51-100 acceptable; 101-150 unhealthy for sensitive people; 151-200 unhealthy for everyone; 201-300 very unhealthy; 301-500 hazardous. PM2.5 breakpoints (µg/m³): 9 / 35.4 / 55.4 / 125.4 / 225.4.',
    },
    example: { uk: 'PM2.5 = 20 мкг/м³ лежить між 9,1 і 35,4 → AQI = (100 − 51) / (35,4 − 9,1) · (20 − 9,1) + 51 ≈ 71 — «прийнятне».', en: 'PM2.5 = 20 µg/m³ lies between 9.1 and 35.4 → AQI = (100 − 51) / (35.4 − 9.1) · (20 − 9.1) + 51 ≈ 71 — "acceptable".' },
    where: { uk: 'Кружечки якості повітря на глобусі й мапі України, «Моє місто».', en: 'The air-quality circles on the globe and the Ukraine map, "My city".' },
  },
  {
    id: 'pm25',
    group: 'air',
    term: { uk: 'PM2.5 і PM10 (пил)', en: 'PM2.5 and PM10 (particles)' },
    text: {
      uk: 'Частинки, менші за 2,5 і 10 мікрометрів. PM2.5 приблизно в 30 разів тонші за волосину й проникають глибоко в легені та кров. Головні джерела PM2.5 — дим (паління трави, листя, сміття, пічне опалення, пожежі) і вихлопи; PM10 — ще й пил з доріг, будов і полів.',
      en: 'Particles smaller than 2.5 and 10 micrometres. PM2.5 is about 30 times thinner than a hair and gets deep into the lungs and blood. The main PM2.5 sources are smoke (burning grass, leaves, rubbish, stoves, wildfires) and exhaust; PM10 adds dust from roads, building sites and fields.',
    },
    values: { uk: 'Рекомендації ВООЗ (2021): PM2.5 — не більше 15 мкг/м³ за добу й 5 за рік; PM10 — 45 за добу й 15 за рік.', en: 'WHO guidelines (2021): PM2.5 no more than 15 µg/m³ per day and 5 per year; PM10 45 per day and 15 per year.' },
    where: { uk: 'Картка станції, прогноз якості повітря на мапі погоди.', en: 'The station card, the air-quality forecast on the weather map.' },
  },
  {
    id: 'gases',
    group: 'air',
    term: { uk: 'NO₂, O₃, SO₂, CO — гази-забруднювачі', en: 'NO₂, O₃, SO₂, CO — polluting gases' },
    text: {
      uk: 'NO₂ (діоксид азоту) — від двигунів, ТЕС і котелень; O₃ (приземний озон) — утворюється на сонці з вихлопних газів, найбільше в спекотний день; SO₂ (діоксид сірки) — від спалювання вугілля й мазуту, металургії; CO (чадний газ) — від неповного згоряння: пожежі, печі, вихлопи.',
      en: 'NO₂ (nitrogen dioxide) comes from engines, power plants and boilers; O₃ (ground-level ozone) forms in sunlight from exhaust gases, most on hot days; SO₂ (sulphur dioxide) from burning coal and fuel oil and from steelworks; CO (carbon monoxide) from incomplete burning: wildfires, stoves, exhaust.',
    },
    values: { uk: 'Рекомендації ВООЗ (2021), мкг/м³: NO₂ — 25 за добу; O₃ — 100 за 8 годин; SO₂ — 40 за добу; CO — 4 000 за добу.', en: 'WHO guidelines (2021), µg/m³: NO₂ 25 per day; O₃ 100 per 8 hours; SO₂ 40 per day; CO 4,000 per day.' },
    where: { uk: 'Картка станції: «Що є поруч за даними» (модель CAMS), шар NO₂ на глобусі.', en: 'The station card: "What the data show nearby" (CAMS model), the NO₂ layer on the globe.' },
  },
  {
    id: 'ugm3',
    group: 'air',
    term: { uk: 'мкг/м³', en: 'µg/m³' },
    text: { uk: 'Мікрограм на кубічний метр: скільки мільйонних часток грама речовини є в кубометрі повітря.', en: 'Micrograms per cubic metre: how many millionths of a gram of a substance are in a cubic metre of air.' },
    formula: [{ uk: '1 мкг = 0,000001 г', en: '1 µg = 0.000001 g' }],
    example: { uk: 'За добу людина вдихає ≈ 15 м³ повітря; при PM2.5 = 50 мкг/м³ це ≈ 750 мкг дрібного пилу.', en: 'A person breathes about 15 m³ of air a day; at PM2.5 = 50 µg/m³ that is about 750 µg of fine dust.' },
  },
  {
    id: 'cams',
    group: 'air',
    term: { uk: 'Модель CAMS і вимірювання', en: 'The CAMS model and measurements' },
    text: {
      uk: 'Copernicus CAMS — модель, яка розраховує, як рухаються дим, пил і гази, і прогнозує їх на кілька днів. Це розрахунок, а не прилад на вулиці: модель бачить великі хмари диму й пилу, але може пропустити місцеве джерело, наприклад котельню. Кружечки станцій — справжні вимірювання.',
      en: 'Copernicus CAMS is a model that computes how smoke, dust and gases move and forecasts them a few days ahead. It is a calculation, not an instrument in the street: it sees large clouds of smoke and dust but can miss a local source such as a boiler house. Station circles are real measurements.',
    },
    values: { uk: 'Сітка ≈ 0,5° (близько 40–50 км) над Україною й сусідами, крок 3 години.', en: 'A grid of about 0.5° (40-50 km) over Ukraine and its neighbours, every 3 hours.' },
    where: { uk: 'Мапа погоди → «Повітря · прогноз моделі», картка станції.', en: 'Weather map → "Air · model forecast", the station card.' },
  },
  {
    id: 'aod',
    group: 'air',
    term: { uk: 'Аерозолі (оптична товща)', en: 'Aerosols (optical depth)' },
    text: { uk: 'Наскільки частинки в повітрі — дим, пил, морська сіль — затуляють сонце по всій висоті атмосфери.', en: 'How much the particles in the air — smoke, dust, sea salt — dim the Sun through the whole height of the atmosphere.' },
    formula: ['I = I₀ · e^(−τ)'],
    symbols: { uk: 'τ — оптична товща, I₀ — світло над атмосферою, I — біля землі.', en: 'τ is the optical depth, I₀ the light above the atmosphere, I near the ground.' },
    values: { uk: 'τ ≈ 0,1 — прозоре повітря; 0,5 — помітний серпанок; понад 1 — густий дим чи пилова буря (до землі доходить менше 37 % прямого світла).', en: 'τ ≈ 0.1: clear air; 0.5: visible haze; over 1: thick smoke or a dust storm (less than 37% of direct light reaches the ground).' },
    where: { uk: 'Шари → Повітря → «Аерозолі», «Пил».', en: 'Layers → Air → "Aerosols", "Dust".' },
  },

  // ---------- fires, radiation, war ----------
  {
    id: 'firepixel',
    group: 'fire',
    term: { uk: 'Точка пожежі (теплова аномалія)', en: 'Fire point (thermal anomaly)' },
    text: {
      uk: 'Піксель, у якому супутник побачив вогонь або дуже гарячу поверхню. Одна велика пожежа — це багато точок поруч. Крім пожеж, так видно газові факели й гарячі цехи заводів, тому їх у підрахунках відкидаємо.',
      en: 'A pixel where the satellite saw fire or a very hot surface. One big fire is many points side by side. Besides fires, gas flares and hot factory buildings show up this way, so they are left out of the counts.',
    },
    values: { uk: 'VIIRS — піксель 375 м, MODIS — 1 км. Хмари й густий дим ховають вогонь. Дані з’являються приблизно через 3 години після прольоту супутника.', en: 'VIIRS has a 375 m pixel, MODIS 1 km. Clouds and thick smoke hide fire. Data appear about 3 hours after the satellite passes.' },
    example: { uk: '9 квітня 2018 року NASA нарахувала в Україні 552 окремі осередки вогню, а пікселів вогню за той день — понад 2 000.', en: 'On 9 April 2018 NASA counted 552 separate hotspots in Ukraine, and over 2,000 fire pixels that day.' },
    where: { uk: 'Пожежі за 48 годин, історії пожеж, шар «Пожежі».', en: 'Fires of the last 48 hours, fire stories, the "Fires" layer.' },
  },
  {
    id: 'frp',
    group: 'fire',
    term: { uk: 'Потужність вогню (FRP)', en: 'Fire radiative power (FRP)' },
    text: {
      uk: 'Скільки тепла вогонь випромінює щосекунди, у мегаватах. Що більша потужність, то більше палива згоряє і то більше диму.',
      en: 'How much heat the fire radiates each second, in megawatts. The higher it is, the more fuel burns and the more smoke there is.',
    },
    formula: [{ uk: 'енергія вогню (МДж) = Σ FRP (МВт) × час (с)', en: 'fire energy (MJ) = Σ FRP (MW) × time (s)' }],
    values: { uk: 'Орієнтовно: до 10 МВт — горить стерня чи невелике вогнище; 10–100 МВт — сильна пожежа; понад 100 МВт — дуже велика лісова пожежа.', en: 'Roughly: up to 10 MW — stubble or a small fire; 10-100 MW — a strong fire; over 100 MW — a very large wildfire.' },
    where: { uk: 'Розмір точок на глобусі в історіях пожеж.', en: 'The size of the points on the globe in fire stories.' },
  },
  {
    id: 'area',
    group: 'fire',
    term: { uk: 'Гектар, км², акр', en: 'Hectare, km², acre' },
    text: { uk: 'Одиниці площі, у яких рахують згарища, затоплені землі й окуповані території.', en: 'The area units used for burned land, flooded land and occupied territory.' },
    formula: [{ uk: '1 га = 100 м × 100 м = 10 000 м²', en: '1 ha = 100 m × 100 m = 10,000 m²' }, { uk: '1 км² = 100 га', en: '1 km² = 100 ha' }, { uk: '1 акр ≈ 0,405 га', en: '1 acre ≈ 0.405 ha' }],
    example: { uk: 'Пожежа Палісейдс — 23 448 акрів ≈ 9 500 га ≈ 95 км². Футбольне поле — близько 0,7 га.', en: 'The Palisades fire: 23,448 acres ≈ 9,500 ha ≈ 95 km². A football pitch is about 0.7 ha.' },
  },
  {
    id: 'radiation',
    group: 'fire',
    term: { uk: 'Радіаційний фон, мкЗв/год', en: 'Background radiation, µSv/h' },
    text: {
      uk: 'Потужність дози — скільки опромінення людина отримує за годину. Природний фон є всюди: від ґрунту, каміння й космосу. На сайті його показують станції, кожна з яких постійно міряє фон саме у своєму місці (дані SaveEcoBot).',
      en: 'The dose rate — how much radiation a person receives per hour. Natural background is everywhere: from soil, rock and space. On the site it comes from stations, each of which keeps measuring the background at its own place (SaveEcoBot data).',
    },
    formula: [{ uk: 'доза (мкЗв) = потужність (мкЗв/год) × час (год)', en: 'dose (µSv) = dose rate (µSv/h) × time (h)' }],
    values: { uk: 'до 0,15 — низький фон; 0,15–0,3 — звичайний; 0,3–1 — підвищений (граніт, гори); понад 1 — забруднені ділянки, як у Чорнобильській зоні. 1 мкЗв/год = 1 000 нЗв/год.', en: 'up to 0.15: low background; 0.15-0.3: ordinary; 0.3-1: raised (granite, mountains); over 1: contaminated spots, as in the Chornobyl zone. 1 µSv/h = 1,000 nSv/h.' },
    example: { uk: 'У літаку на висоті польоту — приблизно 3–5 мкЗв/год, тобто політ на 3 години дає ≈ 10–15 мкЗв.', en: 'In a plane at cruising altitude it is about 3-5 µSv/h, so a 3-hour flight gives about 10-15 µSv.' },
    where: { uk: 'Україна → «Радіаційний фон (станції SaveEcoBot)».', en: 'Ukraine → "Background radiation (SaveEcoBot stations)".' },
  },
  {
    id: 'occupied',
    group: 'fire',
    term: { uk: 'Окупована територія (DeepState)', en: 'Occupied territory (DeepState)' },
    text: {
      uk: 'Межі окупованої Росією території України за щоденними мапами проєкту DeepState, разом із Кримом і окупованими з 2014 року частинами Донеччини й Луганщини. Площу сайт рахує сам із цих меж.',
      en: 'The limits of the part of Ukraine occupied by Russia from the daily maps of the DeepState project, including Crimea and the parts of Donetsk and Luhansk regions occupied since 2014. The site computes the area from these limits itself.',
    },
    formula: [{ uk: 'частка = площа окупованого / 603 628 км² (площа України)', en: 'share = occupied area / 603,628 km² (area of Ukraine)' }],
    values: { uk: 'Захоплене за тиждень — те, що стало окупованим порівняно з попереднім тижнем; звільнене — те, що перестало бути окупованим. Межі приблизні (≈ сотні метрів).', en: 'Captured in a week: what became occupied compared with the week before; liberated: what stopped being occupied. The limits are approximate (≈ hundreds of metres).' },
    where: { uk: 'Україна → «Окуповані території: хронологія з 2022 року».', en: 'Ukraine → "Occupied territory: timeline since 2022".' },
  },
  {
    id: 'co2eq',
    group: 'fire',
    term: { uk: 'CO₂-еквівалент', en: 'CO₂-equivalent' },
    text: {
      uk: 'Спосіб додати різні парникові гази: кожен перераховують у таку кількість CO₂, яка нагріла б планету так само за 100 років.',
      en: 'A way to add up different greenhouse gases: each is converted to the amount of CO₂ that would warm the planet as much over 100 years.',
    },
    formula: [{ uk: 'CO₂-екв = маса газу × GWP₁₀₀', en: 'CO₂-eq = mass of gas × GWP₁₀₀' }],
    values: { uk: 'GWP₁₀₀: CO₂ = 1, метан ≈ 28, закис азоту ≈ 265 (МГЕЗК, AR5).', en: 'GWP₁₀₀: CO₂ = 1, methane ≈ 28, nitrous oxide ≈ 265 (IPCC AR5).' },
    where: { uk: 'Розділ «Наслідки війни для довкілля», події про пожежі.', en: 'The "War and the environment" section, the fire events.' },
  },
];
