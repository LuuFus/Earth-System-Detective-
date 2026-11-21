import { HINT_KINDS, type Hint } from '../../data/hints';
import { photoPage, photoUrl } from '../../data/photos';
import { variableById } from '../../data/variables';
import { useI18n } from '../../i18n/I18n';
import { useLiveText } from '../../i18n/live';
import { useStudio } from '../../i18n/useStudio';
import { Icon, type IconName } from './Icon';

function KindBadge({ hint, size = 34 }: { hint: Hint; size?: number }) {
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
        <p className="hint-preview__text">{hint.why?.[lang] ?? hint.text[lang]}</p>
        <p className="hint-preview__more">{t.clickMore}</p>
      </div>
    </div>
  );
}

/** What an event is about: a photo, what happened, why, who or what caused it, what can be done. */
export function HintCard({ hint, onClose, onOpenCase, onLayer }: { hint: Hint; onClose: () => void; onOpenCase: (id: string) => void; onLayer?: (id: string) => void }) {
  const { lang } = useI18n();
  const s = useStudio();
  const t = useLiveText().event;
  const layer = hint.layer ? variableById[hint.layer] : null;
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
        <section>
          <h3>{t.what}</h3>
          <p>{hint.text[lang]}</p>
        </section>
        {hint.why && (
          <section>
            <h3>{t.why}</h3>
            <p>{hint.why[lang]}</p>
          </section>
        )}
        {hint.cause && (
          <section>
            <h3>{t.cause}</h3>
            <p>{hint.cause[lang]}</p>
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
      {(layer || hint.caseId) && (
        <div className="hint-card__actions">
          {layer && onLayer && (
            <button type="button" className="btn btn--quiet" onClick={() => onLayer(layer.id)}>
              <Icon name="layers" size={16} />
              {t.showLayer(layer.name[lang])}
            </button>
          )}
          {hint.caseId && (
            <button type="button" className="btn" onClick={() => onOpenCase(hint.caseId!)}>
              {s.hints.openCase}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
