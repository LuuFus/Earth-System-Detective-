import { HeroFilm } from '../components/HeroFilm';

/** The home page is a single screen: the film, the promise and the way into the globe. */
export default function Home() {
  return (
    <main className="home">
      <HeroFilm />
    </main>
  );
}
