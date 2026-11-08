export type Lang = 'uk' | 'en';

const uk = {
  meta: {
    title: 'Earth System Detective: тренди Землі з даних NASA',
    description:
      'Інструмент для NASA Space Apps Challenge 2026: обирайте змінні з місій NASA і дізнавайтеся, що змінюється, де, наскільки і чи це значуще.',
  },
  nav: {
    language: 'Мова сайту',
    home: 'Earth System Detective, на головну',
    back: 'На головну',
  },
  hero: {
    title: 'На благо всіх',
    lede: 'Оберіть змінну з місій NASA і побачте, що, де й наскільки змінюється.',
    cta: 'Відкрити 3D-Землю',
    pause: 'Зупинити фонове відео',
    play: 'Увімкнути фонове відео',
    credit: 'Відео: NASA. Це не офіційний сайт NASA.',
  },
  explore: {
    globe: 'Інтерактивна 3D-модель Землі. Перетягуйте, щоб обертати, прокручуйте, щоб наблизити.',
    unavailable: 'Ваш браузер не підтримує WebGL, тому 3D-Земля не може відобразитися.',
    imagery: 'Підвантажую чіткий знімок NASA',
    search: {
      label: 'Пошук країни',
      placeholder: 'Країна, наприклад Японія',
      go: 'Показати',
      notFound: 'Такої країни не знайдено',
    },
    layers: {
      title: 'Шари',
      open: 'Відкрити шари',
      close: 'Згорнути шари',
      borders: 'Кордони й назви країн',
      climate: 'Температура поверхні',
      climateNote: 'NASA GISTEMP v4, 1880-2025',
    },
    modes: { label: 'Режим', year: 'Рік', compare: 'Порівняння', trend: 'Тренд' },
    year: 'Рік',
    from: 'Від',
    to: 'До',
    loading: 'Завантажую дані GISTEMP',
    loadError: 'Не вдалося завантажити дані. Спробуйте ще раз.',
    retry: 'Повторити',
    computing: 'Рахую тренд для кожної клітинки',
    legend: {
      year: (y: number) => `Аномалія ${y} року відносно 1951-1980, °C`,
      compare: (a: number, b: number) => `Різниця: ${b} мінус ${a}, °C`,
      trend: (a: number, b: number) => `Тренд ${a}-${b}, °C за 10 років (нахил Сена)`,
      weak: 'Незначущий тренд (тест Манна-Кендалла, p ≥ 0,05)',
      global: 'Середнє по Землі',
      source: 'Дані: NASA GISS',
    },
    readout: {
      hint: 'Наведіть курсор або торкніться глобуса, щоб побачити значення.',
      noData: 'немає даних для цієї клітинки',
      perDecade: '°C за 10 років',
      significant: 'значущий',
      weak: 'незначущий',
    },
  },
};

export type Dict = typeof uk;

const en: Dict = {
  meta: {
    title: 'Earth System Detective: Earth trends from NASA data',
    description:
      'A NASA Space Apps Challenge 2026 tool: pick variables from NASA missions and find out what is changing, where, by how much, and whether it is significant.',
  },
  nav: {
    language: 'Site language',
    home: 'Earth System Detective, home',
    back: 'Home',
  },
  hero: {
    title: 'For the Benefit of All',
    lede: 'Pick a variable from NASA missions. See what changes, where, and how much.',
    cta: 'Open the 3D Earth',
    pause: 'Pause background video',
    play: 'Play background video',
    credit: 'Video: NASA. This is not an official NASA website.',
  },
  explore: {
    globe: 'Interactive 3D model of Earth. Drag to rotate, scroll to zoom.',
    unavailable: 'Your browser does not support WebGL, so the 3D Earth cannot be shown.',
    imagery: 'Loading sharper NASA imagery',
    search: {
      label: 'Find a country',
      placeholder: 'Country, for example Japan',
      go: 'Show',
      notFound: 'No country by that name',
    },
    layers: {
      title: 'Layers',
      open: 'Open layers',
      close: 'Collapse layers',
      borders: 'Borders and country names',
      climate: 'Surface temperature',
      climateNote: 'NASA GISTEMP v4, 1880-2025',
    },
    modes: { label: 'Mode', year: 'Year', compare: 'Compare', trend: 'Trend' },
    year: 'Year',
    from: 'From',
    to: 'To',
    loading: 'Loading GISTEMP data',
    loadError: 'Could not load the data. Try again.',
    retry: 'Retry',
    computing: 'Computing the trend for every cell',
    legend: {
      year: (y: number) => `Anomaly in ${y} against 1951-1980, °C`,
      compare: (a: number, b: number) => `Difference: ${b} minus ${a}, °C`,
      trend: (a: number, b: number) => `Trend ${a}-${b}, °C per decade (Sen's slope)`,
      weak: 'Not significant (Mann-Kendall test, p ≥ 0.05)',
      global: 'Global mean',
      source: 'Data: NASA GISS',
    },
    readout: {
      hint: 'Hover over or tap the globe to read a value.',
      noData: 'no data for this cell',
      perDecade: '°C per decade',
      significant: 'significant',
      weak: 'not significant',
    },
  },
};

export const strings: Record<Lang, Dict> = { uk, en };
