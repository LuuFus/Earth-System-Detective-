import { describe, expect, it } from 'vitest';
import cities from '../../public/data/geo/cities.json';
import { cityRadiusKm, findCities, fold, nearestCity, parseCities } from './cities';

type Row = [string, string, number, number, string, number, number, number, number];
const list = parseCities(cities.cities as Row[]);

describe('city list', () => {
  it('has big cities of the world and the cities of Ukraine with Ukrainian names', () => {
    expect(list.length).toBeGreaterThan(3000);
    const kyiv = list.find((c) => c.en === 'Kyiv')!;
    expect(kyiv.uk).toBe('Київ');
    expect(kyiv.code).toBe('UA');
    expect(kyiv.capital).toBe(true);
    // Renamed cities carry today's names; Crimea belongs to Ukraine.
    expect(list.find((c) => c.en === 'Kropyvnytskyi')?.uk).toBe('Кропивницький');
    expect(list.find((c) => c.en === 'Sevastopol')?.code).toBe('UA');
  });

  it('finds a city by the start of its name in either language, the biggest first', () => {
    expect(findCities(list, 'Харк')[0].en).toBe('Kharkiv');
    expect(findCities(list, 'kharkiv')[0].uk).toBe('Харків');
    expect(findCities(list, 'Париж')[0].en).toBe('Paris');
    // Apostrophes and their look-alikes do not matter.
    expect(findCities(list, "Кам'янець")[0].en).toBe('Kamianets-Podilskyi');
    expect(findCities(list, 'Камʼянець')[0].en).toBe('Kamianets-Podilskyi');
    expect(findCities(list, 'х')).toEqual([]);
  });

  it('folds names for matching', () => {
    expect(fold("  Кам’янець-Подільський ")).toBe('камянецьподільський');
    expect(fold('Ґалаґан')).toBe('галаган');
    expect(fold('Київ')).toBe('київ');
    expect(fold('Миколаїв')).not.toBe(fold('Миколаів'));
    expect(fold('São Paulo')).toBe('sao paulo');
  });

  it('gives a city a circle that holds its built-up area', () => {
    expect(cityRadiusKm({ areaKm2: 305, pop: 1_461_000 })).toBe(11);
    expect(cityRadiusKm({ areaKm2: 0, pop: 0 })).toBe(8);
    expect(cityRadiusKm({ areaKm2: 9000, pop: 2e7 })).toBe(40);
    expect(cityRadiusKm({ areaKm2: 5, pop: 50_000 })).toBe(6);
  });

  it('finds the nearest city within a distance', () => {
    expect(nearestCity(list, 50.45, 30.52, 5)?.city.en).toBe('Kyiv');
    expect(nearestCity(list, 0, -150, 50)).toBeNull();
  });
});
