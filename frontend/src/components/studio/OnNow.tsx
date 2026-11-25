// What is on the globe right now, in one place: every layer, switch and comparison that is on,
// each with its own off button, and one button for all of them. With many things on at once it
// is easy to lose track of what is drawn and where it was turned on.

import { useEffect, useRef, useState } from 'react';
import { useStudio } from '../../i18n/useStudio';
import { Icon } from './Icon';

export type OnItem = { id: string; label: string; off: () => void };

export function OnNow({ items, onAllOff }: { items: OnItem[]; onAllOff: () => void }) {
  const t = useStudio().onNow;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // A click anywhere else or Escape folds the list.
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', down);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('keydown', key);
    };
  }, [open]);

  if (!items.length) return null;
  const shown = open ? items : [];
  return (
    <div ref={ref} className="on-now" role="group" aria-label={t.title}>
      <button type="button" className="on-now__toggle" aria-expanded={open} aria-controls="on-now-list" onClick={() => setOpen(!open)}>
        <Icon name="layers" size={16} />
        <span className="on-now__summary">{items.length === 1 ? items[0].label : t.count(items.length)}</span>
        <Icon name={open ? 'collapse' : 'expand'} size={14} />
      </button>
      {items.length === 1 ? (
        <button type="button" className="on-now__off" aria-label={t.offOne(items[0].label)} title={t.offOne(items[0].label)} onClick={items[0].off}>
          <Icon name="close" size={14} />
        </button>
      ) : (
        <button type="button" className="on-now__all" onClick={onAllOff}>
          {t.allOff}
        </button>
      )}
      {open && (
        <ul id="on-now-list" className="on-now__list">
          {shown.map((item) => (
            <li key={item.id}>
              <span>{item.label}</span>
              <button type="button" className="icon-btn icon-btn--bare icon-btn--small" aria-label={t.offOne(item.label)} title={t.offOne(item.label)} onClick={item.off}>
                <Icon name="close" size={14} />
              </button>
            </li>
          ))}
          <li className="on-now__hint">{t.hint}</li>
        </ul>
      )}
    </div>
  );
}
