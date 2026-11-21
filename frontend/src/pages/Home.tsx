import { About } from '../components/About';
import { HeroFilm } from '../components/HeroFilm';

/** The home page: the film and the way into the globe, then what the site is and who made it. */
export default function Home() {
  return (
    <main className="home">
      <HeroFilm />
      <About />
    </main>
  );
}
