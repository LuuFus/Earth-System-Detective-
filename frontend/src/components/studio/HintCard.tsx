import { HINT_KINDS, whenText, type Hint } from '../../data/hints';
import { photoPage, photoUrl } from '../../data/photos';
import { variableById } from '../../data/variables';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { useStudio } from '../../i18n/useStudio';
import { Icon, type IconName } from './Icon';

export function KindBadge({ hint, size = 34 }: { hint: Hint; size?: number }) {
  const k = HINT_KINDS[hint.kind];
  return (
    <span className="kind-badge" style={{ ['--hint' as string]: k.color, width: size, height: size }} aria-hidden="true">
      <Icon name={k.icon as IconName} size={Math.round(size * 0.52)} />
    </span>
  );
}

/** A short look at an event while the pointer rests on its badge. */
export function HintPreview({ hint, x, y }: { hint: Hint; x: number; y: number }) {
  const { lang } = useI18n();
  const t = useLiveText().event;
  const w = 300;
  const left = Math.min(window.innerWidth - w - 12, Math.max(12, x - w / 2));
  const below = y < 320;
  return (
    <div className="hint-preview" style={{ left, width: w, ...(below ? { top: y + 44 } : { bottom: window.innerHeight - y + 8 }) }} role="status">
      {hint.photo && <img className="hint-preview__img" src={photoUrl(hint.photo, 480)} alt="" loading="eager" />}
      <div className="hint-preview__body">
        <p className="hint-preview__title">
          <KindBadge hint={hint} size={22} />
          {hint.title[lang]}
        </p>
        <p className="hint-preview__date">{whenText(hint.when, lang)}</p>
        <p className="hint-preview__text">{hint.causes[0]?.[lang] ?? hint.text[lang]}</p>
        <p className="hint-preview__more">{t.clickMore}</p>
      </div>
    </div>
  );
}

type CardProps = {
  hint: Hint;
  onClose: () => void;
  onOpenCase: (id: string) => void;
  /** The event's layer on its exact day. */
  onShow?: (hint: Hint) => void;
  /** Plays a fire story by id. */
  onStory?: (id: string) => void;
  /** Opens the night-lights comparison over Ukraine. */
  onBlackout?: () => void;
  /** Turns on the event's layer for its usual date (events with no exact day). */
  onLayer?: (id: string) => void;
};

/** What an event is about: when and where, what happened, the main causes, the consequences, what can be done. */
export function HintCard({ hint, onClose, onOpenCase, onShow, onStory, onBlackout, onLayer }: CardProps) {
  const { lang } = useI18n();
  const s = useStudio();
  const t = useLiveText().event;
  const layer = hint.layer ? variableById[hint.layer] : null;
  const shown = hint.show ? variableById[hint.show.layer] : null;
  const showDate = hint.show ? whenText({ from: hint.show.date.length === 10 && variableById[hint.show.layer].imagery?.time === 'monthly' ? hint.show.date.slice(0, 7) : hint.show.date }, lang) : '';
  const actions = !!(hint.blackout || hint.storyId || (shown && onShow) || (layer && !shown && !hint.blackout && onLayer) || hint.caseId);
  return (
    <section className="hint-card" role="dialog" aria-labelledby={`hint-${hint.id}`}>
      {hint.photo && (
        <figure className="hint-card__photo">
          <img src={photoUrl(hint.photo, 800)} alt={hint.photo.caption[lang]} />
          <figcaption>
            {hint.photo.caption[lang]} ·{' '}
            <a href={photoPage(hint.photo)} target="_blank" rel="noreferrer">
              {hint.photo.author}, {hint.photo.license}
            </a>
          </figcaption>
        </figure>
      )}
      <header className="hint-card__head">
        <KindBadge hint={hint} />
        <h2 className="hint-card__title" id={`hint-${hint.id}`}>
          {hint.title[lang]}
        </h2>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={s.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <div className="hint-card__body">
        <dl className="hint-card__meta">
          <div>
            <dt>{t.when}</dt>
            <dd>
              <time dateTime={hint.when.from}>{whenText(hint.when, lang)}</time>
            </dd>
          </div>
          <div>
            <dt>{t.where}</dt>
            <dd>{hint.place[lang]}</dd>
          </div>
        </dl>
        <section>
          <h3>{t.what}</h3>
          <p>{hint.text[lang]}</p>
        </section>
        {hint.causes.length > 0 && (
          <section>
            <h3>{t.causes}</h3>
            <ul className="hint-card__list hint-card__list--causes">
              {hint.causes.map((c) => (
                <li key={c.en}>{c[lang]}</li>
              ))}
            </ul>
          </section>
        )}
        {hint.effects.length > 0 && (
          <section>
            <h3>{t.effects}</h3>
            <ul className="hint-card__list hint-card__list--effects">
              {hint.effects.map((c) => (
                <li key={c.en}>{c[lang]}</li>
              ))}
            </ul>
          </section>
        )}
        {hint.action && (
          <section>
            <h3>{t.action}</h3>
            <p>{hint.action[lang]}</p>
          </section>
        )}
        <ul className="hint-card__links">
          {hint.sources.map((src) => (
            <li key={src.url}>
              {s.hints.source}:{' '}
              <a href={src.url} target="_blank" rel="noreferrer">
                {src.label}
              </a>
            </li>
          ))}
          {hint.worldview && (
            <li>
              <a href={hint.worldview} target="_blank" rel="noreferrer">
                {s.hints.worldview}
              </a>
            </li>
          )}
        </ul>
      </div>
      {actions && (
        <div className="hint-card__actions">
          {hint.blackout && onBlackout && (
            <button type="button" className="btn" onClick={onBlackout}>
              <Icon name="split" size={16} />
              {t.blackout}
            </button>
          )}
          {hint.storyId && onStory && (
            <button type="button" className="btn" onClick={() => onStory(hint.storyId!)}>
              <Icon name="play" size={16} />
              {t.story}
            </button>
          )}
          {shown && onShow && (
            <button type="button" className={hint.storyId || hint.blackout ? 'btn btn--quiet' : 'btn'} title={t.showDayTitle} onClick={() => onShow(hint)}>
              <Icon name="layers" size={16} />
              {t.showDay(shown.name[lang], showDate)}
            </button>
          )}
          {layer && !shown && !hint.blackout && onLayer && (
            <button type="button" className="btn btn--quiet" onClick={() => onLayer(layer.id)}>
              <Icon name="layers" size={16} />
              {t.showLayer(layer.name[lang])}
            </button>
          )}
          {hint.caseId && (
            <button type="button" className="btn btn--quiet" onClick={() => onOpenCase(hint.caseId!)}>
              <Icon name="analysis" size={16} />
              {s.hints.openCase}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
