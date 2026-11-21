import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';
import { SourcesButton } from './Sources';
import { Icon, type IconName } from './studio/Icon';

type SectionId = 'globe' | 'night' | 'fires' | 'ukraine' | 'weather' | 'trends' | 'events';

/** Each part of the site with a screenshot of it (public/img/shots, taken from the site itself). */
const SECTIONS: { id: SectionId; icon: IconName; to: string }[] = [
  { id: 'globe', icon: 'globe', to: '/explore?panel=layers' },
  { id: 'night', icon: 'moon', to: '/explore?light=sun' },
  { id: 'fires', icon: 'fire', to: '/explore?panel=fires&on=fires' },
  { id: 'ukraine', icon: 'ukraine', to: '/map?mode=ukraine' },
  { id: 'weather', icon: 'wind', to: '/map?mode=weather' },
  { id: 'trends', icon: 'analysis', to: '/explore?v=t2m&a=c:UA' },
  { id: 'events', icon: 'pin', to: '/explore?panel=cases' },
];

const shot = (id: SectionId) => `${import.meta.env.BASE_URL}img/shots/${id}.jpg`;

/** The home page below the film: what the site is, what it is for, each part with a screenshot, who made it. */
export function About() {
  const { lang } = useI18n();
  const t = useLiveText().about;
  return (
    <section className="about" id="about" aria-labelledby="about-title">
      <div className="about__inner">
        <header className="about__intro">
          <p className="about__kicker">{t.kicker}</p>
          <h2 className="about__title" id="about-title">
            {t.title}
          </h2>
          <p className="about__lead">{t.lead}</p>
        </header>

        <div className="about__cols">
          <div className="about__box">
            <h3>{t.whyTitle}</h3>
            <ul className="about__list">
              {t.why.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="about__box">
            <h3>{t.howTitle}</h3>
            <ol className="about__steps">
              {t.how.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="about__sections">
          {SECTIONS.map((s, i) => {
            const c = t.sections[s.id];
            return (
              <article key={s.id} className={`about__section${i % 2 ? ' about__section--flip' : ''}`}>
                <Link className="about__shot" to={s.to} tabIndex={-1} aria-hidden="true">
                  <img src={shot(s.id)} alt="" width={1280} height={800} loading="lazy" decoding="async" />
                </Link>
                <div className="about__text">
                  <span className="about__icon">
                    <Icon name={s.icon} size={22} />
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <ul className="about__list">
                    {c.points.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <Link className="pill-btn about__open" to={s.to} aria-label={`${t.open}: ${c.title}`}>
                    {t.open}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="about__cols">
          <div className="about__box">
            <h3>{t.dataTitle}</h3>
            <p>{t.data}</p>
          </div>
          <div className="about__box">
            <h3>{t.forWhomTitle}</h3>
            <p>{t.forWhom}</p>
          </div>
        </div>

        <footer className="about__foot">
          <div>
            <p className="about__authors">
              <span>{t.authorsLabel}</span> <strong>IT Detectives</strong> ({t.authors})
            </p>
            <p className="note">
              {t.claude} {t.notNasa}
            </p>
          </div>
          <SourcesButton lang={lang} />
        </footer>
      </div>
    </section>
  );
}
