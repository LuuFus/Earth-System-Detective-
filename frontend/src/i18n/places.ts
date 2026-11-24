// Words for cities: the city card, the Cities layer and the comparison of two places.

import type { MetricId } from '../data/placeStats';
import { popText } from '../components/globe/cities';
import { useI18n } from './I18n';

type Row = { label: string; unit: string; help: string };

const uk = {
  layer: 'Міста',
  layerNote: 'Великі міста світу (від 100 тис. людей) і міста України. Що ближче наблизите, то більше міст. Клацніть місто — відкриється картка, і його можна порівняти з іншим.',
  card: {
    kind: 'Місто',
    capital: 'Столиця',
    pop: 'Населення агломерації',
    area: 'Площа забудови',
    density: 'На 1 км² забудови',
    now: 'Тут зараз',
    air: (aqi: number, km: number) => `Повітря: AQI ${aqi} (станція за ${km} км)`,
    rad: (v: string, km: number) => `Радіація: ${v} мкЗв/год (станція за ${km} км)`,
    fires: (n: number) => (n ? `Пожеж за 48 год у 30 км: ${n}` : 'Пожеж за 48 год у 30 км немає'),
    compareA: 'Порівняти: місце A',
    compareB: 'Порівняти: місце B',
    compareHint: 'Оберіть два міста — і внизу з’явиться порівняння за всім: людьми, заводами, зеленню, пожежами, повітрям і кліматом.',
    weather: 'Погода тут',
    myCity: 'Зробити моїм містом',
    close: 'Закрити',
    source: 'Natural Earth: оцінка населення всієї міської агломерації',
  },
  compare: {
    tab: 'Усе про місця',
    title: 'Порівняння за всім',
    intro: 'Кожне число — з відкритого джерела, порахованого в колі навколо міста (радіус у дужках).',
    onlyPoints: 'Порівняння за всім працює для міст і точок на мапі. Оберіть місто в пошуку або клацніть місто в шарі «Міста».',
    pickB: 'Додайте друге місто (B), щоб порівняти.',
    loading: 'рахую…',
    none: 'немає даних',
    more: 'більше',
    better: 'краще',
    worse: 'гірше',
    groups: { people: 'Люди', industry: 'Промисловість', nature: 'Природа', now: 'Зараз', climate: 'Клімат' },
    rows: {
      pop: { label: 'Населення', unit: 'осіб', help: 'Уся міська агломерація, оцінка Natural Earth.' },
      area: { label: 'Площа забудови', unit: 'км²', help: 'Суцільна міська забудова, Natural Earth.' },
      density: { label: 'Густота населення', unit: 'осіб/км²', help: 'Для міста — населення на 1 км² забудови (Natural Earth); для точки — середнє в колі за NASA SEDAC GPWv4 (2020).' },
      industry: { label: 'Промзони', unit: 'ділянок', help: 'Ділянки промислової забудови (landuse=industrial), позначені волонтерами OpenStreetMap. Залежить і від того, наскільки детально місто нанесено на мапу.' },
      works: { label: 'Заводи й фабрики', unit: 'об’єктів', help: 'Підприємства, позначені в OpenStreetMap як завод (man_made=works).' },
      green: { label: 'Зелень', unit: '% площі', help: 'Частка кола, де рослинність густа (NDVI ≥ 0,5) у липні, NASA MODIS.' },
      ndvi: { label: 'Індекс рослинності', unit: 'NDVI', help: 'Середній NDVI у липні: 0 — бетон і вода, 0,8 — густий ліс. NASA MODIS.' },
      heat: { label: 'Нагрів поверхні влітку', unit: '°C', help: 'Температура самої поверхні (дахів, асфальту, полів) удень у липні, NASA MODIS. Чим більше бетону й менше зелені, тим вища.' },
      fires: { label: 'Пожежі поруч', unit: 'осередків', help: 'Пожежі за останні 48 годин у радіусі 30 км, NASA FIRMS.' },
      aqi: { label: 'Якість повітря', unit: 'AQI', help: 'Індекс найближчої станції в межах 25 км: до 50 — чисте, понад 150 — брудне.' },
      rad: { label: 'Радіаційний фон', unit: 'мкЗв/год', help: 'Найближча станція в межах 30 км.' },
      temp: { label: 'Середня температура року', unit: '°C', help: 'NASA POWER, кліматична норма.' },
      rain: { label: 'Опади за рік', unit: 'мм', help: 'NASA POWER, кліматична норма.' },
      elev: { label: 'Висота над морем', unit: 'м', help: 'Open-Meteo, модель рельєфу Copernicus.' },
    } satisfies Record<MetricId, Row>,
    sources: 'Джерела: Natural Earth, NASA SEDAC, MODIS і POWER, OpenStreetMap (Overpass), NASA FIRMS, станції повітря й радіації, Open-Meteo.',
    radius: (km: number) => `радіус ${km} км`,
  },
};

type PlacesText = typeof uk;

const en: PlacesText = {
  layer: 'Cities',
  layerNote: 'Big cities of the world (100 000 people and more) and the cities of Ukraine. The closer you zoom, the more cities. Click a city to open its card and compare it with another.',
  card: {
    kind: 'City',
    capital: 'Capital',
    pop: 'Urban area population',
    area: 'Built-up area',
    density: 'Per km² built up',
    now: 'Here now',
    air: (aqi: number, km: number) => `Air: AQI ${aqi} (station ${km} km away)`,
    rad: (v: string, km: number) => `Radiation: ${v} µSv/h (station ${km} km away)`,
    fires: (n: number) => (n ? `Fires in 48 h within 30 km: ${n}` : 'No fires in 48 h within 30 km'),
    compareA: 'Compare: place A',
    compareB: 'Compare: place B',
    compareHint: 'Pick two cities and a comparison by everything appears below: people, factories, green, fires, air and climate.',
    weather: 'Weather here',
    myCity: 'Make it my city',
    close: 'Close',
    source: "Natural Earth: estimate for the city's whole urban area",
  },
  compare: {
    tab: 'All about the places',
    title: 'Compared by everything',
    intro: 'Every number comes from an open source, counted in a circle around the city (radius in brackets).',
    onlyPoints: 'The comparison by everything works for cities and points on the map. Find a city in the search or click one on the Cities layer.',
    pickB: 'Add a second city (B) to compare.',
    loading: 'working…',
    none: 'no data',
    more: 'more',
    better: 'better',
    worse: 'worse',
    groups: { people: 'People', industry: 'Industry', nature: 'Nature', now: 'Now', climate: 'Climate' },
    rows: {
      pop: { label: 'Population', unit: 'people', help: "The whole urban area, Natural Earth's estimate." },
      area: { label: 'Built-up area', unit: 'km²', help: 'Continuous urban land, Natural Earth.' },
      density: { label: 'Population density', unit: 'people/km²', help: 'For a city, people per km² built up (Natural Earth); for a point, the mean over the circle from NASA SEDAC GPWv4 (2020).' },
      industry: { label: 'Industrial areas', unit: 'areas', help: 'Industrial land (landuse=industrial) mapped by OpenStreetMap volunteers. It also depends on how fully the city is mapped.' },
      works: { label: 'Factories and plants', unit: 'sites', help: 'Works mapped in OpenStreetMap (man_made=works).' },
      green: { label: 'Green', unit: '% of area', help: 'Share of the circle with dense plants (NDVI ≥ 0.5) in July, NASA MODIS.' },
      ndvi: { label: 'Vegetation index', unit: 'NDVI', help: 'Mean NDVI in July: 0 is concrete and water, 0.8 dense forest. NASA MODIS.' },
      heat: { label: 'Summer surface heat', unit: '°C', help: 'Temperature of the surface itself (roofs, asphalt, fields) by day in July, NASA MODIS. More concrete and less green make it higher.' },
      fires: { label: 'Fires nearby', unit: 'hotspots', help: 'Fires of the last 48 hours within 30 km, NASA FIRMS.' },
      aqi: { label: 'Air quality', unit: 'AQI', help: 'Index of the nearest station within 25 km: up to 50 clean, over 150 unhealthy.' },
      rad: { label: 'Background radiation', unit: 'µSv/h', help: 'The nearest station within 30 km.' },
      temp: { label: 'Mean yearly temperature', unit: '°C', help: 'NASA POWER climate normal.' },
      rain: { label: 'Rain and snow a year', unit: 'mm', help: 'NASA POWER climate normal.' },
      elev: { label: 'Height above sea level', unit: 'm', help: 'Open-Meteo, Copernicus elevation model.' },
    },
    sources: 'Sources: Natural Earth, NASA SEDAC, MODIS and POWER, OpenStreetMap (Overpass), NASA FIRMS, air and radiation stations, Open-Meteo.',
    radius: (km: number) => `radius ${km} km`,
  },
};

export function usePlacesText(): PlacesText {
  return useI18n().lang === 'uk' ? uk : en;
}

/** A population in short words: 1,4 млн / 1.4 m, 320 тис. / 320 k. */
export const popShort = (pop: number, lang: 'uk' | 'en') => popText(pop, lang) || String(pop);
