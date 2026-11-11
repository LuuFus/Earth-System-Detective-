import type { Hint } from '../../data/hints';
import { useI18n } from '../../i18n/I18n';
import { useStudio } from '../../i18n/useStudio';
import { Icon } from './Icon';

/** What a hint on the globe is about, in plain words, with the NASA article it comes from. */
export function HintCard({ hint, onClose, onOpenCase }: { hint: Hint; onClose: () => void; onOpenCase: (id: string) => void }) {
  const { lang } = useI18n();
  const s = useStudio();
  const t = s.hints;
  return (
    <section className="hint-card" role="dialog" aria-labelledby={`hint-${hint.id}`}>
      <header className="hint-card__head">
        <h2 className="hint-card__title" id={`hint-${hint.id}`}>
          {hint.title[lang]}
        </h2>
        <button type="button" className="icon-btn icon-btn--bare" aria-label={s.close} onClick={onClose}>
          <Icon name="close" size={18} />
        </button>
      </header>
      <p className="hint-card__text">{hint.text[lang]}</p>
      <ul className="hint-card__links">
        {hint.sources.map((src) => (
          <li key={src.url}>
            {t.source}:{' '}
            <a href={src.url} target="_blank" rel="noreferrer">
              {src.label}
            </a>
          </li>
        ))}
        {hint.worldview && (
          <li>
            <a href={hint.worldview} target="_blank" rel="noreferrer">
              {t.worldview}
            </a>
          </li>
        )}
      </ul>
      {hint.caseId && (
        <div className="hint-card__actions">
          <button type="button" className="btn" onClick={() => onOpenCase(hint.caseId!)}>
            {t.openCase}
          </button>
        </div>
      )}
    </section>
  );
}
