import type { ReactNode } from 'react';
import { ALPHA, MIN_YEARS, verdict, type TrendStats } from '../../analysis/stats';
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
function Method({ id, title, where, idea, formula, children }: { id: string; title: string; where: string; idea: ReactNode; formula: ReactNode; children?: ReactNode }) {
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
    intro: 'Тут показано, як сайт перетворює дані NASA на висновок «тренд є / тренду немає». Кожна формула — з поясненням простими словами і з підставленими числами з вашого графіка.',
    noData: 'Оберіть регіон на глобусі, і тут з’являться обчислення на його даних.',
    yours: (slot: string, name: string) => `На ваших даних, ${slot}: ${name}`,
    region: {
      title: '1. Одне число для цілого регіону',
      where: 'кожна точка на графіку; рядок «Як пораховано» під графіком',
      idea: 'Дані NASA лежать на сітці клітинок. Для точки беремо її клітинку, для кола чи країни — середнє з усіх клітинок усередині. Клітинки біля полюсів менші за площею, тому кожна має вагу, рівну косинусу її широти: так середнє чесно враховує площу.',
    },
    mk: {
      title: '2. Тест Манна-Кендалла: чи є тренд',
      where: 'світлофор «Зміна надійна / ще не надійна» і p у «Подробицях»',
      idea: 'Порівнюємо кожен рік з кожним наступним роком: чи значення зросло (+1), спало (−1) чи не змінилося (0). Якщо тренду немає, зростань і спадів буде приблизно порівну і S буде близько нуля. Чим більше S відхиляється від нуля, тим менш імовірно, що це випадковість. Тест не вимагає, щоб дані лягали на пряму лінію, і майже не реагує на окремі дуже незвичні роки.',
      steps: 'Як рахується крок за кроком',
      step1: 'Беремо всі пари (i, j), де рік j пізніший за рік i.',
      step2: 'Для кожної пари: +1, якщо пізніше значення більше; −1, якщо менше; 0, якщо рівне. S — сума.',
      step3: 'Var(S) — наскільки розкидалося б S, якби тренду не було (з поправкою на однакові значення t).',
      step4: 'Z — скільки «стандартних відхилень» S від нуля; p — імовірність отримати таке або ще більше |Z| випадково.',
      step5: `Висновок: якщо p < ${ALPHA}, зміну вважаємо надійною. Ще потрібно щонайменше ${MIN_YEARS} років даних.`,
      pairs: 'пар порівняно',
      up: 'зросло',
      down: 'спало',
      tie: 'однаково',
      result: (v: string) => (v === 'significant' ? 'p менше 0,05 — тренд надійний.' : v === 'weak' ? 'p не менше 0,05 — випадковістю це пояснити ще можна.' : 'Замало років для висновку.'),
    },
    seasonal: {
      title: '3. Сезонний тест Манна-Кендалла (для місяців і днів)',
      where: 'вигляд графіка «Місяці» і «Дні»',
      idea: 'У місячних даних є сезонний цикл: липень завжди тепліший за січень. Звичайний тест сприйняв би це як «зміну», тому сезонна версія (Hirsch, Slack, Smith, 1982) порівнює кожен місяць лише з тим самим місяцем інших років: січень із січнями, липень із липнями. S і Var(S) — суми по 12 місяцях. Добові дані спершу зводимо до місячних середніх: сусідні дні надто схожі між собою, і тест на сирих днях давав би хибну певність.',
      active: 'Зараз увімкнено: так, графік показує місяці або дні.',
      inactive: 'Зараз не використовується: графік показує роки.',
    },
    sen: {
      title: '4. Нахил Тейла-Сена: наскільки швидко',
      where: '«Швидкість зміни», пунктирна лінія тренду, плитка «Зміна за період»',
      idea: 'Для кожної пари років рахуємо нахил: на скільки змінилося значення за рік. Медіана (середнє за порядком) усіх цих нахилів і є швидкість тренду. Один дуже спекотний чи дощовий рік майже не зсуває медіану, тому оцінка стійка. Довірчий інтервал 95% беремо з тих самих нахилів (метод Gilbert, 1987).',
      slopes: 'нахилів',
      perYear: 'за рік',
      ci: 'довірчий інтервал 95%',
      change: (a: number, b: number) => `зміна за ${a}-${b}`,
    },
    ols: {
      title: '5. Лінійна регресія і t-тест: друга думка',
      where: '«Подробиці для тих, хто знає статистику»',
      idea: 'Класичний спосіб: пряма, що мінімізує суму квадратів відхилень. t-тест перевіряє, чи її нахил відрізняється від нуля. Ми показуємо його поруч із Манном-Кендаллом: якщо обидва кажуть одне, висновок ще надійніший. R² — яку частку коливань пояснює пряма.',
      slope: 'нахил',
    },
    years: {
      title: '6. Скільки років потрібно, щоб помітити тренд',
      where: 'фрази «певності вистачить приблизно через N років» і «можна надійно помітити за N років»',
      idea: 'Формула Weatherhead та ін. (1998): що слабший тренд ω і що сильніший «шум» σ (коливання навколо лінії), то довше треба спостерігати. φ — наскільки сусідні роки схожі між собою: якщо тепле літо часто йде за теплим, корисної інформації менше, і років треба більше.',
      sigma: 'шум σ (розкид навколо лінії)',
      phi: 'схожість сусідніх значень φ',
      omega: 'тренд ω за рік',
      need: 'потрібно років',
      have: 'є років',
    },
    band: {
      title: '7. Продовження лінії тренду (смуга праворуч)',
      where: 'світла смуга і пунктир праворуч від періоду на графіку «Роки»',
      idea: 'Це не прогноз погоди: лише куди веде лінія, якщо все триватиме так само. Смуга — 95% діапазон для окремого року: що далі від даних, то вона ширша, бо невизначеність нахилу множиться на відстань.',
    },
    cycle: {
      title: '8. Сезонний цикл і норма',
      where: 'вигляд «Сезонний цикл», плитка «Останній рік»',
      idea: 'Норма місяця — його середнє за всі роки періоду. «Останній рік» показує, на скільки він вище чи нижче середнього. Аномалія GISTEMP рахується від норми 1951-1980 років.',
    },
    weather: {
      title: '9. Імовірність явищ погоди (панель «Погода»)',
      where: 'таблиця «Як часто тут буває»',
      idea: 'Імовірність — частка днів місяця, у які явище було: k днів із дощем із N днів листопада за 20 років. Порівнюємо 1981-2000 і 2006-2025, а тренд кількості таких днів щороку перевіряє той самий тест Манна-Кендалла.',
    },
  },
  en: {
    intro: 'This is how the site turns NASA data into a "trend / no trend" conclusion. Each formula comes with plain words and with the numbers from your chart filled in.',
    noData: 'Pick a region on the globe and the computations on its data appear here.',
    yours: (slot: string, name: string) => `With your data, ${slot}: ${name}`,
    region: {
      title: '1. One number for a whole region',
      where: 'every point of the chart; the "How it is computed" line under the chart',
      idea: 'NASA data sit on a grid of cells. A point uses its own cell; a circle or a country uses the mean of all cells inside. Cells near the poles cover less area, so each is weighted by the cosine of its latitude: that way the mean is fair to area.',
    },
    mk: {
      title: '2. The Mann-Kendall test: is there a trend',
      where: 'the "reliable / not reliable yet" light and p in the details',
      idea: 'Every year is compared with every later year: did the value go up (+1), down (−1) or stay the same (0)? With no trend, ups and downs come out about even and S stays near zero. The further S is from zero, the less likely it is chance. The test does not need the data to follow a straight line and barely reacts to single unusual years.',
      steps: 'Step by step',
      step1: 'Take every pair (i, j) where year j comes after year i.',
      step2: 'For each pair: +1 if the later value is larger, −1 if smaller, 0 if equal. S is the sum.',
      step3: 'Var(S) is how much S would scatter if there were no trend (corrected for equal values t).',
      step4: 'Z is how many standard deviations S is from zero; p is the chance of an |Z| this large or larger by luck.',
      step5: `Conclusion: if p < ${ALPHA}, the change is called reliable. It also needs at least ${MIN_YEARS} years of data.`,
      pairs: 'pairs compared',
      up: 'went up',
      down: 'went down',
      tie: 'equal',
      result: (v: string) => (v === 'significant' ? 'p is below 0.05: the trend is reliable.' : v === 'weak' ? 'p is not below 0.05: chance can still explain it.' : 'Too few years for a conclusion.'),
    },
    seasonal: {
      title: '3. The seasonal Mann-Kendall test (months and days)',
      where: 'the "Months" and "Days" chart views',
      idea: 'Monthly data have a seasonal cycle: July is always warmer than January. The ordinary test would take that for a "change", so the seasonal version (Hirsch, Slack and Smith 1982) compares each month only with the same month of other years: January with Januaries, July with Julys. S and Var(S) are sums over the 12 months. Daily data are first turned into monthly means: neighbouring days are too alike, and a test on raw days would claim false certainty.',
      active: 'In use now: the chart shows months or days.',
      inactive: 'Not in use now: the chart shows years.',
    },
    sen: {
      title: '4. The Theil-Sen slope: how fast',
      where: '"Rate of change", the dashed trend line, the "Change over the period" tile',
      idea: 'For every pair of years take the slope: how much the value changed per year. The median of all these slopes is the trend rate. A single very hot or wet year hardly moves a median, so the estimate is robust. The 95% confidence interval comes from the same slopes (Gilbert 1987).',
      slopes: 'slopes',
      perYear: 'per year',
      ci: '95% confidence interval',
      change: (a: number, b: number) => `change over ${a}-${b}`,
    },
    ols: {
      title: '5. Linear regression and the t-test: a second opinion',
      where: '"Details for those who know statistics"',
      idea: 'The classic way: the straight line with the smallest sum of squared departures. The t-test checks whether its slope differs from zero. We show it next to Mann-Kendall: when both agree, the conclusion is firmer. R² is the share of the ups and downs the line explains.',
      slope: 'slope',
    },
    years: {
      title: '6. How many years a trend needs to be seen',
      where: '"it will be certain in about N years" and "can be told apart with about N years"',
      idea: 'The Weatherhead et al. (1998) formula: the weaker the trend ω and the stronger the noise σ (scatter around the line), the longer one must watch. φ is how alike neighbouring years are: when a warm summer tends to follow a warm one, there is less new information and more years are needed.',
      sigma: 'noise σ (scatter around the line)',
      phi: 'likeness of neighbours φ',
      omega: 'trend ω per year',
      need: 'years needed',
      have: 'years available',
    },
    band: {
      title: '7. The trend line carried on (the band on the right)',
      where: 'the light band and dotted line right of the period on the "Years" chart',
      idea: 'Not a weather forecast: only where the line leads if things go on the same way. The band is the 95% range for a single year; it widens with distance from the data because the slope uncertainty is multiplied by the distance.',
    },
    cycle: {
      title: '8. The seasonal cycle and the normal',
      where: 'the "Seasonal cycle" view, the "Latest year" tile',
      idea: 'A month\'s normal is its mean over all years of the period. "Latest year" shows how far above or below the mean it was. The GISTEMP anomaly is measured against the 1951-1980 normal.',
    },
    weather: {
      title: '9. Probability of weather events (the Weather panel)',
      where: 'the "How often it happens here" table',
      idea: 'The probability is the share of the days of a month with the event: k rainy days out of N November days over 20 years. 1981-2000 is compared with 2006-2025, and the trend of the yearly number of such days is checked with the same Mann-Kendall test.',
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
