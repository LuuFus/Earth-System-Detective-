import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';

// Three.js only loads when someone opens the globe.
const Explore = lazy(() => import('./pages/Explore'));
// MapLibre only loads with the weather map.
const WeatherMap = lazy(() => import('./pages/WeatherMap'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/explore"
          element={
            <Suspense fallback={<main className="explore" />}>
              <Explore />
            </Suspense>
          }
        />
        <Route path="/weather" element={<Navigate to="/map?mode=weather" replace />} />
        <Route
          path="/map"
          element={
            <Suspense fallback={<main className="weather-map" />}>
              <WeatherMap />
            </Suspense>
          }
        />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  );
}
