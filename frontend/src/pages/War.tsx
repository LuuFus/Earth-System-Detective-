import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BeforeAfter } from '../components/BeforeAfter';
import { Icon } from '../components/studio/Icon';
import { TopBar } from '../components/TopBar';
import { VideoFacade } from '../components/VideoFacade';
import { photoPage, photoUrl } from '../data/photos';
import { TALLY, WAR_CHORNOBYL_VIDEO, WAR_INTRO_VIDEO, WAR_TOPICS, type Fact, type Source, type Video } from '../data/warImpact';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';

const BASE = import.meta.env.BASE_URL;

/** The war's toll on Ukraine's environment: four stories, each with sources. */
export default function War() {
  const { lang } = useI18n();
  const t = useLiveText().war;
  useEffect(() => {
    document.title = `${t.title} · Earth System Detective`;
  }, [t.title]);
  // The poster is a photo or satellite image of the same story, already credited on the page.
  const video = (v: Video, poster?: string) => <VideoFacade id={v.id} title={v.title} channel={v.channel} playLabel={t.play} note={t.videoNote(v.channel)} poster={poster} />;

  return (
    <main className="war">
      <TopBar back sources />
      <div className="war__inner">
        <header className="war__head">
          <p className="about__kicker">{t.kicker}</p>
          <h1 className="city__title">{t.title}</h1>
          <p className="city__lead">{t.lead}</p>
          <nav className="war__nav" aria-label={t.contents}>
            {WAR_TOPICS.map((topic) => (
              <a key={topic.id} className="chip-btn" href={`#${topic.id}`}>
                {topic.title[lang]}
              </a>
            ))}
          </nav>
        </header>

        <section className="war__tally" aria-labelledby="war-tally">
          <h2 id="war-tally" className="war__h2">
            {t.tallyTitle}
          </h2>
          <ul className="war-tally">
            {TALLY.map((x) => (
              <li key={x.label.en}>
                <strong>{x.value[lang]}</strong>
                <span>{x.label[lang]}</span>
                <a href={x.source.url} target="_blank" rel="noreferrer">
                  {sourceName(x.source, lang)}, {x.date[lang]} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="note">{t.tallyNote}</p>
        </section>

        <section className="war__intro">{video(WAR_INTRO_VIDEO, `${BASE}img/war/kakhovka-reservoir-2023-06-18.jpg`)}</section>

        {WAR_TOPICS.map((topic) => (
          <article key={topic.id} id={topic.id} className="war-topic">
            <header className="war-topic__head">
              <p className="war-topic__when">{topic.when[lang]}</p>
              <h2 className="war__h2">{topic.title[lang]}</h2>
              <p className="city__lead">{topic.lead[lang]}</p>
            </header>

            {topic.compare && (
              <div className="war-topic__compare">
                {topic.compare.map((c) => (
                  <figure key={c.before.src} className="war-compare">
                    <figcaption className="war-compare__title">{c.title[lang]}</figcaption>
                    <BeforeAfter
                      before={`${BASE}${c.before.src}`}
                      after={`${BASE}${c.after.src}`}
                      beforeLabel={`${t.before} · ${c.before.date[lang]}`}
                      afterLabel={`${t.after} · ${c.after.date[lang]}`}
                      alt={c.title[lang]}
                      hint={t.drag}
                    />
                    <p className="note">{c.credit[lang]}</p>
                  </figure>
                ))}
              </div>
            )}

            <div className="war-topic__body">
              <section className="war-topic__facts">
                <h3>{t.facts}</h3>
                <Facts list={topic.facts} lang={lang} />
              </section>
              <section className="war-topic__effects">
                <div>
                  <h3>{t.ukraine}</h3>
                  <Facts list={topic.ukraine} lang={lang} />
                </div>
                <div>
                  <h3>{t.world}</h3>
                  <Facts list={topic.world} lang={lang} />
                </div>
              </section>
            </div>

            <ul className="war-photos">
              {topic.photos.map((p) => (
                <li key={p.file}>
                  <figure>
                    <a href={photoPage(p)} target="_blank" rel="noreferrer">
                      <img src={photoUrl(p, 640)} alt={p.caption[lang]} loading="lazy" decoding="async" />
                    </a>
                    <figcaption>
                      {p.caption[lang]}
                      <small>
                        {t.photo}: {p.author}, {p.license}, Wikimedia Commons
                      </small>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>

            {(topic.video || topic.id === 'nuclear') && (
              <div className="war-topic__videos">
                {topic.video && video(topic.video, photoUrl(topic.photos[topic.id === 'nuclear' ? 1 : 0], 640))}
                {topic.id === 'nuclear' && video(WAR_CHORNOBYL_VIDEO, photoUrl(topic.photos[0], 640))}
              </div>
            )}

            <p className="war-topic__links">
              {topic.links.map((l) => (
                <Link key={l.to + l.label.en} className="chip-btn" to={l.to}>
                  <Icon name="globe" size={16} />
                  {l.label[lang]}
                </Link>
              ))}
            </p>
          </article>
        ))}

        <footer className="war__foot">
          <p>{t.ethics}</p>
          <p className="note">{t.method}</p>
        </footer>
      </div>
    </main>
  );
}

/** A source's name in the page's language (some have only one). */
const sourceName = (src: Source, lang: 'uk' | 'en') => (typeof src.name === 'string' ? src.name : src.name[lang]);

function Facts({ list, lang }: { list: Fact[]; lang: 'uk' | 'en' }) {
  return (
    <ul className="war-facts">
      {list.map((f) => (
        <li key={f.text.en}>
          {f.text[lang]}{' '}
          <a href={f.source.url} target="_blank" rel="noreferrer">
            {sourceName(f.source, lang)} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}
