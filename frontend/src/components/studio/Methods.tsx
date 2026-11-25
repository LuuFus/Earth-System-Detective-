import type { ReactNode } from 'react';
import { MIN_YEARS, verdict, type TrendStats } from '../../analysis/stats';
import type { RegionResult } from '../../hooks/useAnalysis';
import { useI18n } from '../../i18n/I18n';
import { digitsFor, formatP, numberFormat, regionName } from '../../i18n/format';
import type { Lang } from '../../i18n/strings';
import type { ChartView } from '../../state/explore';

type Props = {
  results: RegionResult[];
  unit: string;
  perDecade: string;
  view: ChartView;
};

/** One method: where it shows on screen, the idea in plain words, the formula, and the user's numbers. */
function Method({ id, title, where, idea, example, formula, children }: { id: string; title: string; where: string; idea: ReactNode; example?: string; formula: ReactNode; children?: ReactNode }) {
  const { lang } = useI18n();
  return (
    <section className="method-card" id={id} aria-labelledby={`${id}-title`}>
      <h3 className="method-card__title" id={`${id}-title`}>
        {title}
      </h3>
      <p className="method-card__where">
        <span className="method-card__tag">{lang === 'uk' ? 'Де на екрані' : 'Where it shows'}</span> {where}
      </p>
      <div className="method-card__idea">{idea}</div>
      {example && (
        <p className="method-card__example">
          <span className="method-card__tag">{T[lang].example}</span> {example}
        </p>
      )}
      <div className="formula" role="math">
        {formula}
      </div>
      {children}
    </section>
  );
}

function Yours({ title, rows }: { title: string; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="yours">
      <p className="yours__title">{title}</p>
      <dl className="yours__list">
        {rows.map(([k, v], i) => (
          <div key={i} className="yours__row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const T = {
  uk: {
    intro: 'Тут пояснено простими словами, як сайт вирішує, чи щось справді змінюється. Під кожною формулою — приклад із життя і ті самі обчислення на ваших даних.',
    noData: 'Оберіть місце чи країну на глобусі, і тут з’являться обчислення на їхніх даних.',
    yours: (slot: string, name: string) => `Ваші числа, ${slot}: ${name}`,
    example: 'Приклад',
    region: {
      title: '1. Одне число для цілої країни чи регіону',
      where: 'кожна точка на графіку',
      idea: 'Супутники й моделі NASA дають значення в багатьох точках-клітинках. Щоб отримати одне число для країни, беремо всі клітинки всередині її кордонів і рахуємо середнє. Клітинки біля полюсів займають на Землі менше місця, тому вони важать трохи менше (це й означає «вага» w = cos φ).',
      example: 'Як середній чек мережі магазинів: великий супермаркет важить у ньому більше, ніж маленький кіоск, бо продає більше.',
    },
    mk: {
      title: '2. Тест Манна-Кендалла: чи справді є зміна',
      where: 'зелений чи жовтий світлофор «Стійка зміна / Стійкої зміни не видно»',
      idea: 'Тест відповідає на питання: значення справді ростуть (чи падають), чи просто випадково стрибають угору-вниз?',
      steps: 'Як він рахує',
      step1: 'Беремо кожну пару років, наприклад 2001 і 2015.',
      step2: 'Якщо пізніший рік більший — ставимо +1, якщо менший — −1, якщо однаковий — 0.',
      step3: 'Усе додаємо — виходить число S. Якщо зміни немає, плюсів і мінусів буде приблизно порівну, і S буде близько нуля.',
      step4: 'Що далі S від нуля, то менше шансів, що це випадковість. Цей шанс називають p.',
      step5: `Якщо p менше за 0,05 (5 шансів зі 100), кажемо: зміна стійка. А ще треба щонайменше ${MIN_YEARS} років вимірювань.`,
      example: 'Фермер 15 років записує врожай пшениці з гектара. Якщо майже в кожній парі років пізніший урожай більший, S буде великим, а p — крихітним: урожайність справді росте, а не просто стрибає від погоди.',
      pairs: 'пар порівняно',
      up: 'зросло (+1)',
      down: 'спало (−1)',
      tie: 'однаково (0)',
      result: (v: string) => (v === 'significant' ? 'p менше 0,05 — зміна стійка.' : v === 'weak' ? 'p не менше 0,05 — це ще можуть бути випадкові стрибки.' : 'Замало років, щоб щось сказати.'),
    },
    seasonal: {
      title: '3. Як не сплутати пори року зі зміною',
      where: 'графік «Місяці» і «Дні»',
      idea: 'Влітку завжди тепліше, ніж узимку — це пори року, а не зміна клімату. Тому січень порівнюємо лише з іншими січнями, липень — лише з липнями, і так для всіх 12 місяців. Потім результати 12 місяців додаємо. Для днів спершу рахуємо середнє кожного місяця: сусідні дні надто схожі один на одного.',
      example: 'Кав’ярня влітку продає втричі більше морозива, ніж узимку, — це сезон, а не успіх бізнесу. Щоб побачити, чи справа йде вгору, липень порівнюють з минулими липнями.',
      active: 'Зараз увімкнено: графік показує місяці або дні.',
      inactive: 'Зараз не потрібне: графік показує роки.',
    },
    sen: {
      title: '4. Наскільки швидко змінюється',
      where: '«Швидкість зміни», пунктирна лінія на графіку',
      idea: 'Для кожної пари років рахуємо, на скільки значення змінювалося за один рік. Ставимо всі ці числа в ряд від найменшого до найбільшого і беремо те, що посередині (медіану). Один дуже дивний рік, наприклад рекордна спека, майже не зсуває середину ряду.',
      example: 'Якщо поїздка на таксі за 5 років подорожчала зі 100 до 150 грн, швидкість — 10 грн на рік, тобто 100 грн за 10 років. Один рік різкого стрибка цін майже не зсуває середину ряду.',
      slopes: 'швидкостей порівняно',
      perYear: 'за рік',
      ci: 'найімовірніше між',
      change: (a: number, b: number) => `зміна за ${a}-${b}`,
    },
    ols: {
      title: '5. Друга перевірка: пряма лінія',
      where: '«Подробиці для тих, хто знає статистику»',
      idea: 'Ще один спосіб: провести пряму лінію якомога ближче до всіх точок і перевірити, чи вона нахилена. R² показує, яку частину стрибків пояснює ця лінія (від 0 до 1). Якщо обидва способи кажуть одне й те саме, висновку можна вірити більше.',
      example: 'Як думка двох лікарів: якщо обидва незалежно ставлять той самий діагноз, йому віриш більше.',
      slope: 'нахил',
    },
    years: {
      title: '6. Скільки років треба спостерігати',
      where: 'фраза «певності вистачить приблизно через N років»',
      idea: 'Що слабша зміна ω і що сильніше значення стрибають від року до року (це «шум» σ), то довше треба спостерігати, щоб побачити зміну. φ показує, наскільки сусідні роки схожі між собою: тоді кожен новий рік дає менше нової інформації.',
      example: 'Як помітити, що авто почало їсти більше пального: якщо витрата щотижня скаче від 7 до 10 л на 100 км, а росте лише на 0,1 л на рік, записувати доведеться кілька років.',
      sigma: 'шум σ (наскільки стрибає)',
      phi: 'схожість сусідніх років φ',
      omega: 'зміна ω за рік',
      need: 'потрібно років',
      have: 'вже є років',
    },
    band: {
      title: '7. Що буде далі, якщо все триватиме так само',
      where: 'світла смуга праворуч на графіку «Роки», коли ввімкнено «Показати, куди веде зміна»',
      idea: 'Це не прогноз погоди, а просто продовження лінії. Смуга показує, куди найімовірніше потрапить окремий рік. Що далі в майбутнє, то вона ширша, бо ми менш певні.',
      example: 'Як планування бюджету: якщо рахунки за опалення щороку росли приблизно на 5%, наступного року вони, найімовірніше, будуть на 2–8% вищими, але не вдвічі.',
    },
    cycle: {
      title: '8. «Норма» і сезонний цикл',
      where: 'графік «Сезонний цикл» і режим «Окремі роки»',
      idea: 'Норма місяця — його звичайне значення, середнє за всі роки. Відхилення (аномалія) — на скільки цей рік вищий чи нижчий за норму.',
      example: 'Якщо липень зазвичай 21 °C, а цього року був 23 °C, то він на 2 °C тепліший за норму.',
    },
    weather: {
      title: '9. Як часто щось буває (панель «Погода»)',
      where: 'таблиця «Як часто тут буває»',
      idea: 'Імовірність — це частка днів, коли явище було, з усіх днів. Порівнюємо 1981–2000 і 2006–2025 роки, а тест Манна-Кендалла перевіряє, чи таких днів справді стає більше чи менше.',
      example: 'Якщо за 20 листопадів було 600 днів і 180 з них дощові, то шанс дощу в листопаді — 180 ÷ 600 = 30%.',
    },
  },
  en: {
    intro: 'Here, in plain words, is how the site decides whether something is really changing. Under each formula there is an everyday example and the same arithmetic on your data.',
    noData: 'Pick a place or a country on the globe and the arithmetic on its data appears here.',
    yours: (slot: string, name: string) => `Your numbers, ${slot}: ${name}`,
    example: 'Example',
    region: {
      title: '1. One number for a whole country or region',
      where: 'every point of the chart',
      idea: 'NASA satellites and models give values in many grid cells. To get one number for a country we take every cell inside its borders and average them. Cells near the poles cover less of the Earth, so they count a little less (that is what the weight w = cos φ means).',
      example: 'Like the average bill across a chain of shops: a big supermarket counts for more than a small kiosk, because it sells more.',
    },
    mk: {
      title: '2. The Mann-Kendall test: is there really a change',
      where: 'the green or yellow light "A steady change / No steady change shows"',
      idea: 'The test answers one question: are the values really going up (or down), or just jumping up and down by chance?',
      steps: 'How it counts',
      step1: 'Take every pair of years, for example 2001 and 2015.',
      step2: 'If the later year is bigger, write +1; if smaller, −1; if equal, 0.',
      step3: 'Add them all up: that is S. With no change there are about as many pluses as minuses, and S stays near zero.',
      step4: 'The further S is from zero, the smaller the chance that it is luck. That chance is called p.',
      step5: `If p is below 0.05 (5 chances in 100), we say the change is steady. It also needs at least ${MIN_YEARS} years of measurements.`,
      example: 'A farmer writes down the wheat harvest per hectare for 15 years. If in almost every pair of years the later harvest is bigger, S is big and p is tiny: yields really are rising, not just jumping with the weather.',
      pairs: 'pairs compared',
      up: 'went up (+1)',
      down: 'went down (−1)',
      tie: 'equal (0)',
      result: (v: string) => (v === 'significant' ? 'p is below 0.05: the change is steady.' : v === 'weak' ? 'p is not below 0.05: it may still be random jumps.' : 'Too few years to tell.'),
    },
    seasonal: {
      title: '3. Not mixing up the seasons with a change',
      where: 'the "Months" and "Days" charts',
      idea: 'Summer is always warmer than winter: that is the seasons, not climate change. So January is compared only with other Januaries, July only with Julys, for all 12 months, and the 12 results are added up. Days are first turned into monthly averages, because neighbouring days are too alike.',
      example: 'A café sells three times more ice cream in summer than in winter: that is the season, not a better business. To see whether things are going up, July is compared with past Julys.',
      active: 'In use now: the chart shows months or days.',
      inactive: 'Not needed now: the chart shows years.',
    },
    sen: {
      title: '4. How fast it changes',
      where: '"Rate of change", the dashed line on the chart',
      idea: 'For every pair of years we work out how much the value changed per year. We line all those numbers up from smallest to biggest and take the one in the middle (the median). One very odd year, such as a record heatwave, hardly moves the middle.',
      example: 'If a taxi ride went from 100 to 150 hryvnias in 5 years, the rate is 10 a year, or 100 in 10 years. One year of a sudden price jump hardly moves the middle of the list.',
      slopes: 'rates compared',
      perYear: 'per year',
      ci: 'most likely between',
      change: (a: number, b: number) => `change over ${a}-${b}`,
    },
    ols: {
      title: '5. A second check: a straight line',
      where: '"Details for those who know statistics"',
      idea: 'Another way: draw the straight line that runs as close to all the points as possible and check whether it slopes. R² shows how much of the ups and downs the line explains (from 0 to 1). When both ways say the same thing, the conclusion is easier to trust.',
      example: 'Like two doctors: if both reach the same diagnosis on their own, you trust it more.',
      slope: 'slope',
    },
    years: {
      title: '6. How many years you need to watch',
      where: 'the phrase "it will be certain in about N years"',
      idea: 'The weaker the change ω and the more the values jump from year to year (the "noise" σ), the longer you have to watch to see it. φ shows how alike neighbouring years are: then each new year brings less new information.',
      example: 'Like noticing a car has started to burn more fuel: if it jumps between 7 and 10 l per 100 km every week but rises only 0.1 l a year, you have to keep notes for several years.',
      sigma: 'noise σ (how much it jumps)',
      phi: 'likeness of neighbouring years φ',
      omega: 'change ω per year',
      need: 'years needed',
      have: 'years so far',
    },
    band: {
      title: '7. What comes next if things go on the same way',
      where: 'the light band on the right of the "Years" chart, when "Show where the change leads" is on',
      idea: 'This is not a weather forecast, just the line carried on. The band shows where a single year will most likely land. The further into the future, the wider it gets, because we are less sure.',
      example: 'Like planning a budget: if heating bills rose by about 5% every year, next year they will most likely be 2-8% higher, not double.',
    },
    cycle: {
      title: '8. The "normal" and the seasonal cycle',
      where: 'the "Seasonal cycle" chart and the "Single years" mode',
      idea: 'A month\'s normal is its usual value, the average over all years. The departure (anomaly) is how far this year is above or below the normal.',
      example: 'If July is usually 21 °C and this year it was 23 °C, it was 2 °C warmer than normal.',
    },
    weather: {
      title: '9. How often something happens (the Weather panel)',
      where: 'the "How often it happens here" table',
      idea: 'The probability is the share of days with the event out of all days. We compare 1981-2000 with 2006-2025, and the Mann-Kendall test checks whether such days are really becoming more or less frequent.',
      example: 'If 20 Novembers had 600 days and 180 of them were rainy, the chance of rain in November is 180 ÷ 600 = 30%.',
    },
  },
};

function f(lang: Lang, v: number, digits?: number) {
  return numberFormat(lang, digits ?? Math.min(4, digitsFor(v)), false)(v);
}

/** The "How it is computed" tab: every formula behind the chart, with the numbers filled in. */
export function Methods({ results, unit, perDecade, view }: Props) {
  const { lang } = useI18n();
  const t = T[lang];
  const withStats = results.filter((r): r is RegionResult & { stats: TrendStats } => !!r.stats);
  const seasonalOn = view === 'month' || view === 'day';

  return (
    <div className="methods">
      <p className="note">{t.intro}</p>
      {!withStats.length && <p className="note">{t.noData}</p>}

      <Method
        id="m-region"
        title={t.region.title}
        where={t.region.where}
        example={t.region.example}
        idea={<p>{t.region.idea}</p>}
        formula={
          <>
            <span>
              x̄ = <Frac top={<>Σ w<sub>i</sub>·x<sub>i</sub></>} bottom={<>Σ w<sub>i</sub></>} />
            </span>
            <span>
              w<sub>i</sub> = cos φ<sub>i</sub>
            </span>
          </>
        }
      >
        {results.map((r) => r.series && <p key={r.slot} className="yours__plain">{`${r.slot}: ${(view === 'day' && r.daily ? r.daily.method : r.series.method)[lang]}`}</p>)}
      </Method>

      <Method
        id="m-mk"
        title={t.mk.title}
        where={t.mk.where}
        example={t.mk.example}
        idea={
          <>
            <p>{t.mk.idea}</p>
            <ol className="method-card__steps">
              <li>{t.mk.step1}</li>
              <li>{t.mk.step2}</li>
              <li>{t.mk.step3}</li>
              <li>{t.mk.step4}</li>
              <li>{t.mk.step5}</li>
            </ol>
          </>
        }
        formula={
          <>
            <span>
              S = <BigSum sub="i<j" /> sgn(x<sub>j</sub> − x<sub>i</sub>)
            </span>
            <span>
              Var(S) = <Frac top={<>n(n−1)(2n+5) − Σ t(t−1)(2t+5)</>} bottom="18" />
            </span>
            <span>
              Z = <Frac top="S − 1" bottom="√Var(S)" /> {lang === 'uk' ? 'якщо' : 'if'} S &gt; 0;&nbsp; Z = <Frac top="S + 1" bottom="√Var(S)" /> {lang === 'uk' ? 'якщо' : 'if'} S &lt; 0
            </span>
            <span>p = 2 · [1 − Φ(|Z|)]</span>
          </>
        }
      >
        {withStats.map((r) => {
          const s = r.stats;
          const total = s.pairsUp + s.pairsDown + s.pairsTie;
          const v = verdict(s);
          return (
            <div key={r.slot}>
              <Yours
                title={t.yours(r.slot, regionName(r.region, lang))}
                rows={[
                  ['n', `${s.n}`],
                  [t.mk.pairs, f(lang, total, 0)],
                  [t.mk.up, f(lang, s.pairsUp, 0)],
                  [t.mk.down, f(lang, s.pairsDown, 0)],
                  ['S', `${f(lang, s.pairsUp, 0)} − ${f(lang, s.pairsDown, 0)} = ${numberFormat(lang, 0)(s.mkS)}`],
                  ['Var(S)', f(lang, s.varS, 1)],
                  ['Z', numberFormat(lang, 2)(s.mkZ)],
                  ['p', formatP(s.mkP, lang)],
                ]}
              />
              <PairsBar up={s.pairsUp} down={s.pairsDown} tie={s.pairsTie} labels={t.mk} />
              <p className={`yours__verdict yours__verdict--${v}`}>{t.mk.result(v)}</p>
            </div>
          );
        })}
      </Method>

      <Method
        id="m-seasonal"
        title={t.seasonal.title}
        where={t.seasonal.where}
        example={t.seasonal.example}
        idea={
          <>
            <p>{t.seasonal.idea}</p>
            <p className="yours__plain">{seasonalOn ? t.seasonal.active : t.seasonal.inactive}</p>
          </>
        }
        formula={
          <>
            <span>
              S = <BigSum sub="m=1" sup="12" /> S<sub>m</sub>
            </span>
            <span>
              Var(S) = <BigSum sub="m=1" sup="12" /> Var(S<sub>m</sub>)
            </span>
          </>
        }
      />

      <Method
        id="m-sen"
        title={t.sen.title}
        where={t.sen.where}
        example={t.sen.example}
        idea={<p>{t.sen.idea}</p>}
        formula={
          <>
            <span>
              β = median <Frac top={<>x<sub>j</sub> − x<sub>i</sub></>} bottom={<>t<sub>j</sub> − t<sub>i</sub></>} />, i &lt; j
            </span>
            <span>{lang === 'uk' ? 'за 10 років' : 'per decade'} = 10 · β</span>
          </>
        }
      >
        {withStats.map((r) => {
          const s = r.stats;
          const pts = r.points.filter((p) => Number.isFinite(p.y));
          const span = pts.length ? pts[pts.length - 1].x - pts[0].x : 0;
          return (
            <Yours
              key={r.slot}
              title={t.yours(r.slot, regionName(r.region, lang))}
              rows={[
                [t.sen.slopes, f(lang, s.pairsUp + s.pairsDown + s.pairsTie, 0)],
                ['β', `${numberFormat(lang, Math.min(4, digitsFor(s.sen) + 1))(s.sen)} ${unit} ${t.sen.perYear}`],
                ['10 · β', `${numberFormat(lang, Math.min(3, digitsFor(s.sen * 10)))(s.sen * 10)} ${perDecade}`],
                [t.sen.ci, `${numberFormat(lang, Math.min(3, digitsFor(s.senLow * 10)))(s.senLow * 10)} … ${numberFormat(lang, Math.min(3, digitsFor(s.senHigh * 10)))(s.senHigh * 10)}`],
                [t.sen.change(Math.floor(pts[0]?.x ?? 0), Math.floor(pts[pts.length - 1]?.x ?? 0)), `${numberFormat(lang, Math.min(3, digitsFor(s.sen * span)))(s.sen * span)} ${unit}`],
              ]}
            />
          );
        })}
      </Method>

      <Method
        id="m-ols"
        title={t.ols.title}
        where={t.ols.where}
        example={t.ols.example}
        idea={<p>{t.ols.idea}</p>}
        formula={
          <>
            <span>
              b = <Frac top={<>Σ (t<sub>i</sub> − t̄)(x<sub>i</sub> − x̄)</>} bottom={<>Σ (t<sub>i</sub> − t̄)²</>} />
            </span>
            <span>
              t = <Frac top="b" bottom="SE(b)" />, SE(b) = √<span className="formula__over">Σ e<sub>i</sub>² / (n − 2) / Σ (t<sub>i</sub> − t̄)²</span>
            </span>
            <span>
              R² = 1 − <Frac top={<>Σ e<sub>i</sub>²</>} bottom={<>Σ (x<sub>i</sub> − x̄)²</>} />
            </span>
          </>
        }
      >
        {withStats.map((r) => (
          <Yours
            key={r.slot}
            title={t.yours(r.slot, regionName(r.region, lang))}
            rows={[
              [`${t.ols.slope} · 10`, `${numberFormat(lang, Math.min(3, digitsFor(r.stats.olsSlope * 10)))(r.stats.olsSlope * 10)} ${perDecade}`],
              ['t', numberFormat(lang, 2)(r.stats.olsT)],
              ['p', formatP(r.stats.olsP, lang)],
              ['R²', numberFormat(lang, 2, false)(r.stats.r2)],
            ]}
          />
        ))}
      </Method>

      <Method
        id="m-years"
        title={t.years.title}
        where={t.years.where}
        example={t.years.example}
        idea={<p>{t.years.idea}</p>}
        formula={
          <span>
            n* = [ <Frac top={`${lang === 'uk' ? '3,3' : '3.3'} · σ`} bottom="|ω|" /> · √<span className="formula__over">(1 + φ) / (1 − φ)</span> ]<sup>2/3</sup>
          </span>
        }
      >
        {withStats.map((r) => (
          <Yours
            key={r.slot}
            title={t.yours(r.slot, regionName(r.region, lang))}
            rows={[
              [t.years.sigma, `${f(lang, r.stats.residualSd)} ${unit}`],
              [t.years.phi, numberFormat(lang, 2)(r.stats.phi)],
              [t.years.omega, `${numberFormat(lang, Math.min(4, digitsFor(r.stats.sen) + 1))(r.stats.sen)} ${unit}`],
              [t.years.need, r.stats.yearsNeeded ? f(lang, Math.ceil(r.stats.yearsNeeded), 0) : '—'],
              [t.years.have, f(lang, r.stats.years, 0)],
            ]}
          />
        ))}
      </Method>

      <Method
        id="m-band"
        title={t.band.title}
        where={t.band.where}
        example={t.band.example}
        idea={<p>{t.band.idea}</p>}
        formula={
          <span>
            x̂(t) = a + β·t ± t<sub>{lang === 'uk' ? '0,975' : '0.975'}</sub> · s · √<span className="formula__over">1 + 1/n + (t − t̄)² / S<sub>tt</sub></span>
          </span>
        }
      />

      <Method
        id="m-cycle"
        title={t.cycle.title}
        where={t.cycle.where}
        example={t.cycle.example}
        idea={<p>{t.cycle.idea}</p>}
        formula={
          <>
            <span>
              {lang === 'uk' ? 'норма' : 'normal'}<sub>m</sub> = <Frac top={<>Σ<sub>y</sub> x<sub>y,m</sub></>} bottom={lang === 'uk' ? 'кількість років' : 'number of years'} />
            </span>
            <span>
              {lang === 'uk' ? 'аномалія' : 'anomaly'} = x − {lang === 'uk' ? 'норма' : 'normal'}
            </span>
          </>
        }
      />

      <Method
        id="m-weather"
        title={t.weather.title}
        where={t.weather.where}
        example={t.weather.example}
        idea={<p>{t.weather.idea}</p>}
        formula={
          <span>
            P = <Frac top={lang === 'uk' ? 'k (днів з явищем)' : 'k (days with the event)'} bottom={lang === 'uk' ? 'N (усіх днів)' : 'N (all days)'} />
          </span>
        }
      />
    </div>
  );
}

function Frac({ top, bottom }: { top: ReactNode; bottom: ReactNode }) {
  return (
    <span className="frac">
      <span className="frac__top">{top}</span>
      <span className="frac__bottom">{bottom}</span>
    </span>
  );
}

function BigSum({ sub, sup }: { sub: string; sup?: string }) {
  return (
    <span className="bigsum">
      {sup && <span className="bigsum__sup">{sup}</span>}
      <span className="bigsum__sign">Σ</span>
      <span className="bigsum__sub">{sub}</span>
    </span>
  );
}

function PairsBar({ up, down, tie, labels }: { up: number; down: number; tie: number; labels: { up: string; down: string; tie: string } }) {
  const total = up + down + tie || 1;
  return (
    <div className="pairs" aria-hidden="true">
      <div className="pairs__bar">
        <span className="pairs__up" style={{ width: `${(up / total) * 100}%` }} />
        <span className="pairs__tie" style={{ width: `${(tie / total) * 100}%` }} />
        <span className="pairs__down" style={{ width: `${(down / total) * 100}%` }} />
      </div>
      <div className="pairs__legend">
        <span>
          <i className="pairs__key pairs__key--up" /> {labels.up} {Math.round((up / total) * 100)}%
        </span>
        <span>
          <i className="pairs__key pairs__key--down" /> {labels.down} {Math.round((down / total) * 100)}%
        </span>
        {tie > 0 && (
          <span>
            <i className="pairs__key pairs__key--tie" /> {labels.tie} {Math.round((tie / total) * 100)}%
          </span>
        )}
      </div>
    </div>
  );
}
