// The card of one fire of the last 48 hours on the 2D map: when a satellite saw it, how strong it
// is, what town is near, whether it is in a war zone, and "where will the smoke go".

import { useI18n } from '../../i18n/I18n';
import { useSmokeText } from '../../i18n/smoke';
import { Icon } from './Icon';

export type FireInfo = {
  lat: number;
  lon: number;
  /** Hours since the satellite saw it, and when (ms). */
  ageH: number;
  seen: number;
  /** Fire radiative power, MW. */
  frp: number;
  night: boolean;
  high: boolean;
};

type Props = {
  fire: FireInfo;
  x: number;
  y: number;
  town: { name: string; km: number } | null;
  /** The hromada's status in the official list of war territories, if any. */
  war: 'occupied' | 'partly' | 'combat' | null;
  smokeOn: boolean;
  onSmoke: () => void;
  onClose: () => void;
};

/** Plain words for the fire power: under 10 MW small, under 50 moderate, under 200 strong. */
const powerBand = (frp: number) => (frp < 10 ? 0 : frp < 50 ? 1 : frp < 200 ? 2 : 3);

export function FireCard({ fire, x, y, town, war, smokeOn, onSmoke, onClose }: Props) {
  const { lang } = useI18n();
  const t = useSmokeText();
  const c = t.fireCard;
  const nf = new Intl.NumberFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { maximumFractionDigits: 0 });
  const seenAt = new Date(fire.seen);
  const seen = new Intl.DateTimeFormat(lang === 'uk' ? 'uk-UA' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(seenAt);
  const ago = fire.ageH < 1 ? (lang === 'uk' ? 'менше години тому' : 'under an hour ago') : lang === 'uk' ? `${Math.round(fire.ageH)} год тому` : `${Math.round(fire.ageH)} h ago`;
  const w = 320;
  const left = Math.min(window.innerWidth - w - 12, Math.max(12, x + 18));
  const top = Math.max(70, Math.min(window.innerHeight - 380, y - 40));
  return (
    <section className="air-card air-card--pinned fire-card" style={{ left, top, width: w }} aria-label={c.kind}>
      <header className="air-card__head">
        <div>
          <p className="air-card__kind">{c.kind}</p>
          <h2 className="air-card__title">{town ? c.near(town.name, Math.round(town.km)) : `${fire.lat.toFixed(3)}, ${fire.lon.toFixed(3)}`}</h2>
        </div>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={c.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <dl className="air-card__rows">
        <div>
          <dt>{c.seen}</dt>
          <dd>
            {seen}, {fire.night ? c.night : c.day} · {ago}
          </dd>
        </div>
        <div>
          <dt>{c.power}</dt>
          <dd>
            {nf.format(fire.frp)} {lang === 'uk' ? 'МВт' : 'MW'} — {c.powerWords[powerBand(fire.frp)]}
          </dd>
        </div>
        <div>
          <dt>{c.confidence}</dt>
          <dd>{fire.high ? c.high : c.nominal}</dd>
        </div>
      </dl>
      {war && <p className="air-card__meaning">{c.war[war]}</p>}
      <p className="air-card__fine">
        <b>{c.what}. </b>
        {c.whatText}
      </p>
      <button type="button" className="chip-btn fire-card__smoke" aria-pressed={smokeOn} onClick={onSmoke}>
        <Icon name="wind" size={16} />
        {smokeOn ? t.live.stop : t.live.button}
      </button>
    </section>
  );
}
