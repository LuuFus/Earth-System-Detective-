// The smoke players: a clock over a few hours or days, close up over the fires, with the smoke,
// the wind near it and the air in the towns, and the story in parts.
// - SmokePlayer: a past fire (a fire story): what happened, why, what it led to, what to do.
// - ForecastPlayer: fires burning now: what the satellites see, the fire weather of the next
//   days, the air the CAMS model expects in the towns around, what to do.

import type { ReactNode } from 'react';
import { aqiFromPm25, type SmokeTown } from '../globe/smoke';
import { dayChange, ffwiLevel, type AirOutlook, type FireWeatherDay, type Hotspot } from '../../data/hotspots';
import { hints } from '../../data/hints';
import { isoHour, worstTown } from '../../data/smoke';
import type { SmokeKind, SmokeScene } from '../../data/smokeScenes';
import type { FireStory } from '../../data/ukraine';
import { useClock } from '../../hooks/useClock';
import { useI18n } from '../../i18n/I18n';
import { useSmokeText } from '../../i18n/smoke';
import { ClockRow } from './ClockRow';
import { Icon } from './Icon';

type Status = 'loading' | 'ready' | 'error';

/** About 4 scene hours a second at 1×: three days take 18 seconds. */
const RATE = 4;

function useFormat(t0: number) {
  const { lang } = useI18n();
  const locale = lang === 'uk' ? 'uk-UA' : 'en-GB';
  const at = (h: number, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, { ...o, timeZone: 'UTC' }).format(new Date(t0 + h * 3600_000));
  return {
    time: (h: number) => at(h, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    day: (h: number) => at(h, { day: 'numeric', month: 'short' }),
    long: (iso: string) => new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(new Date(iso)),
  };
}

/** The frame both players share: header, status, clock, legend, the sections, the notes. */
function PlayerFrame(p: {
  kicker: string;
  title: string;
  status: Status;
  hours: number;
  t0: number;
  onTime: (h: number) => void;
  onClose: () => void;
  autoplay: boolean;
  loop?: boolean;
  smokeNote: string;
  children: ReactNode;
  notes: string[];
}) {
  const t = useSmokeText();
  const clock = useClock(p.hours, RATE, p.onTime, { autoplay: p.autoplay, loop: p.loop });
  const fmt = useFormat(p.t0);
  const majors = Array.from({ length: Math.floor(p.hours / 24) + 1 }, (_, d) => d * 24);
  return (
    <section className="smoke-player" aria-label={`${p.kicker}: ${p.title}`}>
      <header className="smoke-player__head">
        <div>
          <p className="smoke-player__kicker">{p.kicker}</p>
          <h2 className="smoke-player__title">{p.title}</h2>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={t.close} onClick={p.onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      {p.status === 'loading' && (
        <p className="note" role="status">
          {t.loading}
        </p>
      )}
      {p.status === 'error' && (
        <p className="note" role="alert">
          {t.error}
        </p>
      )}
      <ClockRow clock={clock} length={p.hours} format={fmt.time} formatTick={fmt.day} majors={majors} sub={t.utc} disabled={p.status !== 'ready'} labels={t} />
      <ul className="smoke-legend">
        <li>
          <span className="smoke-key smoke-key--smoke" aria-hidden="true" />
          {p.smokeNote}
        </li>
        <li>
          <span className="smoke-key smoke-key--fire" aria-hidden="true" />
          {t.legend.fire}
        </li>
        <li>
          <span className="smoke-key smoke-key--wind" aria-hidden="true" />
          {t.legend.wind}
        </li>
        <li>
          <span className="smoke-key smoke-key--air" aria-hidden="true" />
          {t.legend.air}
        </li>
      </ul>
      <div className="smoke-story">{p.children}</div>
      {p.notes.map((n) => (
        <p key={n} className="legend__src">
          {n}
        </p>
      ))}
    </section>
  );
}

function Section({ title, open, items }: { title: string; open?: boolean; items: ReactNode[] }) {
  if (!items.length) return null;
  return (
    <details open={open}>
      <summary>{title}</summary>
      <ul>
        {items.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </details>
  );
}

const Todo = ({ kind }: { kind: SmokeKind }) => {
  const t = useSmokeText();
  return <Section title={t.sections.todo} items={t.todo[kind]} />;
};

// ---------- a past fire ----------

type SceneProps = {
  scene: SmokeScene;
  story: FireStory;
  status: Status;
  towns: SmokeTown[];
  onTime: (hours: number) => void;
  onClose: () => void;
};

export function SmokePlayer({ scene, story, status, towns, onTime, onClose }: SceneProps) {
  const { lang } = useI18n();
  const t = useSmokeText();
  const t0 = Date.parse(isoHour(scene.start));
  const fmt = useFormat(t0);
  const hint = hints.find((h) => h.storyId === story.id);
  const why = hint ? hint.causes.map((c) => c[lang]) : scene.why ? [scene.why[lang]] : [];
  const effects = hint ? hint.effects.map((c) => c[lang]) : scene.effects ? [scene.effects[lang]] : [];
  const worst = status === 'ready' ? worstTown(towns, scene.start) : null;
  return (
    <PlayerFrame
      kicker={t.open}
      title={story.title[lang]}
      status={status}
      hours={scene.hours}
      t0={t0}
      onTime={onTime}
      onClose={onClose}
      autoplay={status === 'ready'}
      smokeNote={t.legend.smoke}
      notes={[t.method, t.sources]}
    >
      <Section title={t.sections.what} open items={[story.text[lang], scene.smoke[lang]]} />
      <Section title={t.sections.why} items={why} />
      <Section title={t.sections.effects} items={[...effects, ...(worst ? [t.worst(worst.name, aqiFromPm25(worst.pm25), `${fmt.long(worst.time)} UTC`)] : [])]} />
      <Todo kind={scene.kind} />
    </PlayerFrame>
  );
}

// ---------- fires burning now ----------

type ForecastProps = {
  hotspot: Hotspot;
  title: string;
  /** The hour the forecast starts (ms). */
  start: number;
  hours: number;
  status: Status;
  weather: FireWeatherDay[] | null;
  air: AirOutlook[] | null;
  onTime: (hours: number) => void;
  onClose: () => void;
};

export function ForecastPlayer({ hotspot, title, start, hours, status, weather, air, onTime, onClose }: ForecastProps) {
  const { lang } = useI18n();
  const t = useSmokeText();
  const h = t.hotspots;
  const t0 = start;
  const fmt = useFormat(t0);
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const change = dayChange(hotspot);
  const weekday = (date: string) => new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00Z`));
  const rain = (weather ?? []).reduce((a, d) => a + d.rainMm, 0);
  return (
    <PlayerFrame
      kicker={h.kicker}
      title={title}
      status={status}
      hours={hours}
      t0={t0}
      onTime={onTime}
      onClose={onClose}
      autoplay={status === 'ready'}
      loop
      smokeNote={h.smokeNote}
      notes={[h.method, h.sources]}
    >
      <Section title={h.now} open items={[h.seen(nf.format(hotspot.lastDay), nf.format(hotspot.dayBefore), change), h.power(nf.format(hotspot.power))]} />
      <Section
        title={h.weather}
        open
        items={
          weather
            ? [
                ...weather.map((d) => (
                  <>
                    <b>{weekday(d.date)}:</b> {h.level[ffwiLevel(d.maxIndex)]} (FFWI {nf.format(d.maxIndex)}) — {h.levelText[ffwiLevel(d.maxIndex)]}
                  </>
                )),
                ...(rain >= 5 ? [h.rain(nf.format(rain))] : []),
              ]
            : [status === 'loading' ? t.loading : h.noData]
        }
      />
      <Section
        title={h.air}
        open
        items={
          air && air.length
            ? air.slice(0, 5).map((a) => h.town(a.name, nf.format(a.km), a.nowAqi, a.worstAqi, `${fmt.long(a.worstTime)} UTC`))
            : [status === 'loading' ? t.loading : h.noTowns]
        }
      />
      <Section title={h.what} items={[t.fireCard.whatText]} />
      <Todo kind="wild" />
    </PlayerFrame>
  );
}
