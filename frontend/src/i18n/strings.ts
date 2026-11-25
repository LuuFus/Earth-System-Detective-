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
    eyebrow: 'Відкриті дані NASA, NOAA та українських джерел',
    title: 'Earth System Detective',
    lede: '3D-глобус, на якому видно пожежі, вітер і погоду, вогні міст уночі й тренди клімату за 145 років. І окрема картка про Україну: повітря, радіація, фронт, блекаути.',
    cta: 'Відкрити 3D-Землю',
    links: { weather: 'Карта погоди', fires: 'Пожежі', ukraine: 'Україна' },
    pause: 'Зупинити фонове відео',
    play: 'Увімкнути фонове відео',
    credit: 'Відео: NASA. Це не офіційний сайт NASA.',
  },
  explore: {
    globe: 'Інтерактивна 3D-модель Землі. Перетягуйте, щоб обертати, прокручуйте, щоб наблизити.',
    unavailable: 'Ваш браузер не підтримує WebGL, тому 3D-Земля не може відобразитися.',
    imagery: 'Підвантажую чіткий знімок NASA',
    search: {
      label: 'Пошук країни або міста',
      placeholder: 'Країна або місто, наприклад Харків',
      go: 'Показати',
      notFound: 'Не знайдено ні країни, ні міста з такою назвою',
      countryLabel: 'Пошук країни',
      countryPlaceholder: 'Країна, наприклад Польща',
      notCountry: 'Такої країни не знайдено. Місто можна знайти в панелі «Аналіз».',
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
    eyebrow: 'Open data from NASA, NOAA and Ukrainian sources',
    title: 'Earth System Detective',
    lede: 'A 3D globe showing fires, wind and weather, city lights at night and 145 years of climate trends. Plus a card on Ukraine: air, radiation, the front, blackouts.',
    cta: 'Open the 3D Earth',
    links: { weather: 'Weather map', fires: 'Fires', ukraine: 'Ukraine' },
    pause: 'Pause background video',
    play: 'Play background video',
    credit: 'Video: NASA. This is not an official NASA website.',
  },
  explore: {
    globe: 'Interactive 3D model of Earth. Drag to rotate, scroll to zoom.',
    unavailable: 'Your browser does not support WebGL, so the 3D Earth cannot be shown.',
    imagery: 'Loading sharper NASA imagery',
    search: {
      label: 'Find a country or a city',
      placeholder: 'Country or city, for example Kharkiv',
      go: 'Show',
      notFound: 'No country or city by that name',
      countryLabel: 'Find a country',
      countryPlaceholder: 'Country, for example Poland',
      notCountry: 'No country by that name. Cities can be found in the Analysis panel.',
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
