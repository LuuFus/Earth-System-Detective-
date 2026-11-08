import { useCallback, useRef, useState } from 'react';
import { CountrySearch } from '../components/CountrySearch';
import { ExplorePanel } from '../components/ExplorePanel';
import { Globe, type GlobeApi, type GlobePoint } from '../components/Globe';
import { TopBar } from '../components/TopBar';
import type { Country } from '../data/countries';
import { useClimateLayer, type ClimateMode } from '../hooks/useClimateLayer';
import { useI18n } from '../i18n/I18n';

/** The 3D Earth with switchable layers: borders and names, and NASA GISTEMP temperature. */
export default function Explore() {
  const { lang, t } = useI18n();
  const globe = useRef<GlobeApi | null>(null);
  const [showBorders, setShowBorders] = useState(false);
  const [climateOn, setClimateOn] = useState(false);
  const [mode, setMode] = useState<ClimateMode>('compare');
  const [year, setYear] = useState(2025);
  const [range, setRange] = useState({ from: 1960, to: 2025 });
  const [point, setPoint] = useState<GlobePoint | null>(null);
  const [imageryLoading, setImageryLoading] = useState(false);

  const climate = useClimateLayer(climateOn, mode, year, range.from, range.to);

  const onFound = useCallback((country: Country) => {
    setShowBorders(true);
    globe.current?.flyTo(country.lat, country.lon, country.big ? 2.2 : 1.45);
  }, []);

  return (
    <main className="explore">
      <h1 className="visually-hidden">Earth System Detective: 3D</h1>
      <Globe
        label={t.explore.globe}
        fallback={t.explore.unavailable}
        lang={lang}
        overlay={climate.overlay}
        showBorders={showBorders}
        onPoint={setPoint}
        onLoadingChange={setImageryLoading}
        apiRef={globe}
      />
      <TopBar back center={<CountrySearch onFound={onFound} />} />
      <ExplorePanel
        showBorders={showBorders}
        onBorders={setShowBorders}
        climateOn={climateOn}
        onClimate={setClimateOn}
        mode={mode}
        onMode={setMode}
        year={year}
        onYear={setYear}
        from={range.from}
        to={range.to}
        onRange={(from, to) => setRange({ from, to })}
        climate={climate}
        point={point}
      />
      {imageryLoading && (
        <p className="explore__status" role="status">
          {t.explore.imagery}
        </p>
      )}
    </main>
  );
}
