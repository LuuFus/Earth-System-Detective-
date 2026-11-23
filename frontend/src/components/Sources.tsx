import { useEffect, useRef, useState } from 'react';
import { useLiveText } from '../i18n/live';
import { Icon } from './studio/Icon';

type Item = { name: string; what: { uk: string; en: string }; url: string };

const GROUPS: { id: 'nasa' | 'weather' | 'ukraine' | 'maps'; items: Item[] }[] = [
  {
    id: 'nasa',
    items: [
      { name: 'NASA GIBS / Worldview', what: { uk: 'Знімки Землі: Blue Marble, Landsat, VIIRS, MODIS, MERRA-2, рельєф ASTER', en: 'Earth imagery: Blue Marble, Landsat, VIIRS, MODIS, MERRA-2, ASTER relief' }, url: 'https://www.earthdata.nasa.gov/engage/open-data-services-software/earthdata-developer-portal/gibs-api' },
      { name: 'NASA Black Marble', what: { uk: 'Нічні вогні Землі (VIIRS)', en: 'Earth at night (VIIRS)' }, url: 'https://blackmarble.gsfc.nasa.gov/' },
      { name: 'NASA FIRMS', what: { uk: 'Пожежі й теплові аномалії, зараз і в архівах', en: 'Fires and thermal anomalies, now and archived' }, url: 'https://www.earthdata.nasa.gov/data/tools/firms' },
      { name: 'NASA GISS GISTEMP v4', what: { uk: 'Аномалії температури з 1880 року', en: 'Temperature anomalies since 1880' }, url: 'https://data.giss.nasa.gov/gistemp/' },
      { name: 'NASA POWER', what: { uk: 'Температура, опади, вологість, вітер у точці', en: 'Temperature, rain, humidity and wind at a point' }, url: 'https://power.larc.nasa.gov/' },
      { name: 'NASA Ozone Watch', what: { uk: 'Озонова діра', en: 'The ozone hole' }, url: 'https://ozonewatch.gsfc.nasa.gov/' },
      { name: 'NASA Image and Video Library', what: { uk: 'Відео на головній', en: 'Video on the home page' }, url: 'https://images.nasa.gov/' },
    ],
  },
  {
    id: 'weather',
    items: [
      { name: 'NOAA NCEP GFS', what: { uk: 'Прогноз вітру, температури, опадів і хмар (через NOMADS)', en: 'Forecast of wind, temperature, precipitation and cloud (via NOMADS)' }, url: 'https://www.nco.ncep.noaa.gov/pmb/products/gfs/' },
      { name: 'RainViewer', what: { uk: 'Радар опадів', en: 'Precipitation radar' }, url: 'https://www.rainviewer.com/api.html' },
      { name: 'Open-Meteo', what: { uk: 'Прогноз у точці й для «Мого міста»; пошук міст (GeoNames)', en: 'Forecast at a point and for My city; town search (GeoNames)' }, url: 'https://open-meteo.com/' },
      { name: 'NOAA Storm Prediction Center', what: { uk: 'Ймовірність торнадо (США)', en: 'Tornado probability (US)' }, url: 'https://www.spc.noaa.gov/' },
    ],
  },
  {
    id: 'ukraine',
    items: [
      { name: 'DeepState', what: { uk: 'Карта фронту та її історія', en: 'Front-line map and its history' }, url: 'https://deepstatemap.live/' },
      { name: 'SaveEcoBot', what: { uk: 'Якість повітря й радіаційний фон зі станцій в Україні', en: 'Air quality and background radiation from stations in Ukraine' }, url: 'https://www.saveecobot.com/' },
      { name: 'Sensor.Community', what: { uk: 'Відкриті громадські датчики пилу по всьому світу', en: 'Open citizen dust sensors worldwide' }, url: 'https://sensor.community/' },
      { name: 'World Air Quality Index (WAQI)', what: { uk: 'Якість повітря з офіційних станцій світу, щогодини', en: 'Air quality from official stations worldwide, hourly' }, url: 'https://waqi.info/' },
      { name: 'Copernicus CAMS (Open-Meteo)', what: { uk: 'Модель якості повітря: прогноз на 3 дні, шари AQI, PM2.5 і пилу (CC BY 4.0)', en: 'Air quality model: 3-day forecast, AQI, PM2.5 and dust layers (CC BY 4.0)' }, url: 'https://open-meteo.com/en/docs/air-quality-api' },
      { name: 'Мінрозвитку України', what: { uk: 'Перелік окупованих громад (наказ № 376)', en: 'List of occupied communities (Order No. 376)' }, url: 'https://zakon.rada.gov.ua/laws/show/z0380-25' },
      { name: 'NASA Earth Observatory', what: { uk: 'Знімки Landsat Каховського водосховища до і після', en: 'Landsat images of the Kakhovka reservoir before and after' }, url: 'https://science.nasa.gov/earth/earth-observatory/canals-in-ukraine-are-drying-up-151622/' },
      { name: 'CEOBS', what: { uk: 'Аналіз шкоди довкіллю: Каховка, Азовсталь', en: 'Environmental damage analysis: Kakhovka, Azovstal' }, url: 'https://ceobs.org/' },
      { name: 'UNEP', what: { uk: 'Оцінка наслідків руйнування Каховської греблі', en: 'Assessment of the Kakhovka dam breach' }, url: 'https://www.unep.org/resources/report/rapid-environmental-assessment-kakhovka-dam-breach-ukraine-2023' },
      { name: 'МАГАТЕ (через World Nuclear Association)', what: { uk: 'Чорнобиль і Запорізька АЕС', en: 'Chornobyl and the Zaporizhzhia plant' }, url: 'https://world-nuclear.org/information-library/country-profiles/countries-t-z/ukraine-russia-war-and-nuclear-energy' },
      { name: 'Держекоінспекція, Держлісагентство, ДСНС', what: { uk: 'Збитки довкіллю, ліси, заміновані території', en: 'Environmental damage, forests, mined land' }, url: 'https://me.gov.ua/' },
      { name: 'Initiative on GHG Accounting of War', what: { uk: 'Викиди парникових газів через війну', en: 'Greenhouse gas emissions caused by the war' }, url: 'https://en.ecoaction.org.ua/' },
    ],
  },
  {
    id: 'maps',
    items: [
      { name: 'OpenStreetMap', what: { uk: 'Основа 2D-карти, © учасники OpenStreetMap (ODbL)', en: 'Base of the 2D map, © OpenStreetMap contributors (ODbL)' }, url: 'https://www.openstreetmap.org/copyright' },
      { name: 'Natural Earth', what: { uk: 'Кордони, столиці, моря й річки', en: 'Borders, capitals, seas and rivers' }, url: 'https://www.naturalearthdata.com/' },
      { name: 'Wikimedia Commons', what: { uk: 'Фото подій і розділу про війну (автори й ліцензії — біля кожного фото)', en: 'Photos of events and of the war section (authors and licences by each photo)' }, url: 'https://commons.wikimedia.org/' },
      { name: 'YouTube', what: { uk: 'Відео МАГАТЕ, ЄБРР, EPRS, AP, UATV (вантажаться лише після натискання, без cookie)', en: 'Videos by the IAEA, EBRD, EPRS, AP, UATV (load only when played, without cookies)' }, url: 'https://www.youtube.com/' },
      { name: 'OpenStreetMap Nominatim', what: { uk: 'Назви районів і міст за координатами', en: 'District and town names from coordinates' }, url: 'https://nominatim.org/' },
      { name: 'IANA tz database', what: { uk: 'Часові пояси для місцевого часу під курсором', en: 'Time zones for the local time under the pointer' }, url: 'https://www.iana.org/time-zones' },
    ],
  },
];

/** A "Sources" button and the dialog it opens: every data source, and who made the site. */
export function SourcesButton({ lang }: { lang: 'uk' | 'en' }) {
  const t = useLiveText().sources;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <>
      <button type="button" className="pill-btn" onClick={() => setOpen(true)}>
        <Icon name="sources" size={18} />
        <span>{t.open}</span>
      </button>
      <dialog
        ref={ref}
        className="sources"
        aria-labelledby="sources-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="sources__inner">
          <header className="sources__head">
            <h2 id="sources-title">{t.title}</h2>
            <button type="button" className="icon-btn icon-btn--bare" aria-label="×" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </button>
          </header>
          <p className="note">{t.intro}</p>
          <p className="sources__made">
            <span className="sources__mark" aria-hidden="true">
              ✳
            </span>
            {t.made}
          </p>
          {GROUPS.map((g) => (
            <section key={g.id} className="sources__group">
              <h3>{t.groups[g.id]}</h3>
              <ul>
                {g.items.map((i) => (
                  <li key={i.name}>
                    <a href={i.url} target="_blank" rel="noreferrer">
                      {i.name} ↗
                    </a>
                    <span>{i.what[lang]}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="note">{t.disclaimer}</p>
        </div>
      </dialog>
    </>
  );
}
