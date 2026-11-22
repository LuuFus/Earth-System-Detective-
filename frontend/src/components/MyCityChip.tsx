import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyCity } from '../data/city';
import { AQI_COLORS, aqiBand } from '../data/ukraine';
import { useLiveText } from '../i18n/live';
import { weatherIcon } from '../pages/weatherIcon';
import { Icon } from './studio/Icon';

type Now = { temp: number; code: number; day: boolean; aqi: number | null };

/** The pinned city on the home page, with its temperature and air now; or the way to choose one. */
export function MyCityChip() {
  const t = useLiveText().city;
  const [city] = useMyCity();
  const [now, setNow] = useState<Now | null>(null);
  useEffect(() => {
    setNow(null);
    if (!city) return;
    const ctrl = new AbortController();
    const at = `latitude=${city.lat.toFixed(3)}&longitude=${city.lon.toFixed(3)}`;
    Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${at}&current=temperature_2m,weather_code,is_day&timezone=auto`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${at}&current=us_aqi`, { signal: ctrl.signal })
        .then((r) => r.json())
        .catch(() => null),
    ])
      .then(([w, a]: [{ current: { temperature_2m: number; weather_code: number; is_day: number } }, { current?: { us_aqi?: number | null } } | null]) =>
        setNow({ temp: w.current.temperature_2m, code: w.current.weather_code, day: w.current.is_day === 1, aqi: a?.current?.us_aqi ?? null }),
      )
      .catch(() => undefined);
    return () => ctrl.abort();
  }, [city]);

  if (!city)
    return (
      <Link className="pill-btn pill-btn--glass" to="/city">
        <Icon name="pin" size={18} />
        {t.home}
      </Link>
    );
  const q = new URLSearchParams({ name: city.name, lat: city.lat.toFixed(4), lon: city.lon.toFixed(4), ...(city.admin ? { admin: city.admin } : {}), ...(city.country ? { country: city.country } : {}) });
  return (
    <Link className="hero__city" to={`/city?${q}`} aria-label={`${t.home}: ${city.name}`}>
      <Icon name="pin" size={18} />
      <strong>{city.name}</strong>
      {now && (
        <>
          <Icon name={weatherIcon(now.code, now.day)} size={18} />
          <span>{Math.round(now.temp)}°</span>
          {now.aqi !== null && (
            <span className="city-aqi" style={{ background: `#${AQI_COLORS[aqiBand(now.aqi)].toString(16).padStart(6, '0')}` }} title="AQI">
              {Math.round(now.aqi)}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
