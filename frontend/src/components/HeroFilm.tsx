import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { filmClips, filmPoster, type Rendition } from '../data/media';
import { usePageVisible, useReducedMotion } from '../hooks/useMedia';
import { useI18n } from '../i18n/I18n';
import { useLiveText } from '../i18n/live';
import { SplitButton } from './SplitButton';
import { Icon } from './studio/Icon';
import { TopBar } from './TopBar';

/** Seconds a clip may sit without playing before the film moves to a buffered one. */
const STALL_SECONDS = 6;

/** 1080p on large screens with a fast link, 640px on phones and slow or data-saving links, 720p otherwise.
 * Chrome reports `downlink` in Mbit/s and caps it at 10. */
function pickRendition(): Rendition {
  const connection = (navigator as Navigator & { connection?: { downlink?: number; saveData?: boolean } }).connection;
  const width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
  if (window.innerWidth < 800 || connection?.saveData) return 'small';
  if (connection?.downlink !== undefined && connection.downlink < 4) return 'small';
  if (width >= 1600 && (connection?.downlink === undefined || connection.downlink >= 10)) return 'large';
  return 'medium';
}

/** One-screen home: NASA footage crossfading behind the headline and the way into the globe.
 * A still shows at once; each clip fades in only once it plays, and the film only cuts to a clip
 * that has buffered, looping the current one meanwhile, so a slow network never shows a black frame. */
export function HeroFilm() {
  const { t } = useI18n();
  const about = useLiveText().about;
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(reduced);
  const [failed, setFailed] = useState<ReadonlySet<number>>(() => new Set());
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const playing = !paused && pageVisible;
  const rendition = useMemo(pickRendition, []);
  const count = filmClips.length;

  const isReady = useCallback((i: number) => {
    const video = videoRefs.current[i];
    const clip = filmClips[i];
    return !!video && video.readyState >= 3 && Math.abs(video.currentTime - clip.start) < 1.5;
  }, []);

  /** Cut to the next buffered clip; returns false when none is ready yet. */
  const advance = useCallback(() => {
    for (let step = 1; step < count; step++) {
      const candidate = (active + step) % count;
      if (!failed.has(candidate) && isReady(candidate)) {
        setActive(candidate);
        return true;
      }
    }
    return false;
  }, [active, count, failed, isReady]);

  const markFailed = useCallback((index: number) => {
    setFailed((prev) => (prev.has(index) ? prev : new Set(prev).add(index)));
  }, []);

  // A clip that errored while on screen hands over to the next one that has not failed.
  useEffect(() => {
    if (!failed.has(active) || failed.size >= count) return;
    for (let step = 1; step < count; step++) {
      const candidate = (active + step) % count;
      if (!failed.has(candidate)) {
        setActive(candidate);
        return;
      }
    }
  }, [failed, active, count]);

  // Play the active clip, buffer the next two, rewind the one that just left once it has faded out.
  useEffect(() => {
    const timers: number[] = [];
    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      const clip = filmClips[i];
      const ahead = (i - active + count) % count;
      if (ahead <= 2) video.preload = 'auto';
      if (i === active) {
        video.playbackRate = clip.rate ?? 1;
        if (video.currentTime < clip.start - 0.5 || video.currentTime >= clip.end) video.currentTime = clip.start;
        if (playing) {
          video.play().catch((err: DOMException) => {
            if (err.name === 'NotSupportedError') markFailed(i);
            if (err.name === 'NotAllowedError') setPaused(true);
          });
        } else {
          video.pause();
        }
      } else if (!video.paused) {
        timers.push(
          window.setTimeout(() => {
            video.pause();
            video.currentTime = clip.start;
          }, 1600),
        );
      }
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [active, playing, count, markFailed]);

  // At the out point cut to the next ready clip, or loop this one until another is ready.
  // A clip that has not started after a few seconds gives way to any clip that has buffered.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let stalled = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      const clip = filmClips[active];
      const video = videoRefs.current[active];
      if (video) {
        stalled = !video.paused && video.readyState >= 3 ? 0 : stalled + dt;
        if (stalled > STALL_SECONDS && advance()) return;
        if (video.currentTime >= clip.end) {
          if (advance()) return;
          video.currentTime = clip.start;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, active, advance]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__film" aria-hidden="true" style={{ backgroundImage: `url("${filmPoster}")` }}>
        {filmClips.map((clip, i) => (
          <div key={clip.key} className={`hero__layer${active === i ? ' is-active' : ''}`}>
            <video
              ref={(el) => {
                videoRefs.current[i] = el;
              }}
              className="hero__video"
              src={`${clip.src(rendition)}#t=${clip.start}`}
              poster={filmPoster}
              muted
              playsInline
              preload={i === 0 ? 'auto' : 'metadata'}
              tabIndex={-1}
              onLoadedMetadata={(e) => {
                e.currentTarget.playbackRate = clip.rate ?? 1;
              }}
              onPlaying={(e) => {
                e.currentTarget.parentElement?.setAttribute('data-ready', 'true');
              }}
              onError={() => markFailed(i)}
            />
          </div>
        ))}
      </div>
      <div className="hero__grade" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />

      <TopBar sources />

      <div className="hero__content">
        <p className="hero__eyebrow">{t.hero.eyebrow}</p>
        <h1 id="hero-title" className="display hero__title">
          {t.hero.title}
        </h1>
        <p className="lede hero__lede">{t.hero.lede}</p>
        <div className="hero__actions">
          <SplitButton to="/explore">{t.hero.cta}</SplitButton>
          <Link className="pill-btn pill-btn--glass" to="/map?mode=weather">
            <Icon name="weather" size={18} />
            {t.hero.links.weather}
          </Link>
          <Link className="pill-btn pill-btn--glass" to="/explore?panel=fires">
            <Icon name="fire" size={18} />
            {t.hero.links.fires}
          </Link>
          <Link className="pill-btn pill-btn--glass" to="/explore?panel=ukraine">
            <Icon name="ukraine" size={18} />
            {t.hero.links.ukraine}
          </Link>
        </div>
      </div>

      <div className="hero__foot">
        <p className="hero__credit">
          {t.hero.credit} · <span className="hero__authors">IT Detectives</span>
        </p>
        <a className="hero__scroll" href="#about">
          {about.scroll} ↓
        </a>
        <button type="button" className="round-btn" aria-label={paused ? t.hero.play : t.hero.pause} onClick={() => setPaused((p) => !p)}>
          {paused ? (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
              <path d="M4 2.5h3v11H4zM9 2.5h3v11H9z" fill="currentColor" />
            </svg>
          )}
        </button>
      </div>
    </section>
  );
}
