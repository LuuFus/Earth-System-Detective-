import { useEffect, useRef } from 'react';
import { useStudio } from '../../i18n/useStudio';
import { spring, springToken, step, settled, tune, useMotion, type Spring } from '../../motion/spring';
import type { Panel } from '../../state/explore';
import { Icon, type IconName } from './Icon';

type Props = {
  panel: Panel | null;
  analysisOpen: boolean;
  onPanel: (panel: Panel | null) => void;
  onAnalysis: (open: boolean) => void;
};

type Item = { id: Panel | 'analysis'; icon: IconName; label: string };

/**
 * The tool column on the left, after Google Earth: round icon buttons with their names in a
 * tooltip. The highlight under the open tool stretches as it moves (Design Bookmark's Side Nav
 * springs): the edge facing the move leads, the other trails behind.
 */
export function Rail({ panel, analysisOpen, onPanel, onAnalysis }: Props) {
  const s = useStudio();
  const groups: Item[][] = [
    [
      { id: 'layers', icon: 'layers', label: s.rail.layers },
      { id: 'fires', icon: 'fire', label: s.rail.fires },
      { id: 'ukraine', icon: 'ukraine', label: s.rail.ukraine },
      { id: 'weather', icon: 'weather', label: s.rail.weather },
    ],
    [
      { id: 'analysis', icon: 'analysis', label: s.rail.analysis },
      { id: 'cases', icon: 'pin', label: s.rail.cases },
      { id: 'glossary', icon: 'glossary', label: s.rail.glossary },
      { id: 'share', icon: 'share', label: s.rail.share },
    ],
  ];
  const nav = useRef<HTMLElement>(null);
  const hl = useRef<HTMLSpanElement>(null);
  const st = useRef<{ top: Spring; bottom: Spring; shown: Spring; lead: [number, number]; trail: [number, number] } | null>(null);
  if (!st.current) {
    st.current = {
      top: spring(0),
      bottom: spring(0),
      shown: spring(0, 420, 32),
      lead: springToken('--nav-lead', '560 34'),
      trail: springToken('--nav-trail', '220 21'),
    };
  }
  const m = st.current;
  const wake = useMotion(
    (dt) => {
      step(m.top, dt);
      step(m.bottom, dt);
      step(m.shown, dt);
    },
    () => {
      const el = hl.current;
      if (!el) return;
      el.style.transform = `translateY(${m.top.x.toFixed(2)}px)`;
      el.style.height = `${Math.max(0, m.bottom.x - m.top.x).toFixed(2)}px`;
      el.style.opacity = m.shown.x.toFixed(3);
    },
    () => settled(m.top, 0.05) && settled(m.bottom, 0.05) && settled(m.shown),
  );

  // The panel open on the left wins the highlight; the analysis drawer has its own (pressed) look.
  const active = panel ?? null;
  useEffect(() => {
    const btn = active ? nav.current?.querySelector<HTMLElement>(`[data-id="${active}"]`) : null;
    if (!btn) {
      m.shown.t = 0;
      wake();
      return;
    }
    const top = btn.offsetTop;
    const bottom = top + btn.offsetHeight;
    if (m.shown.x < 0.05) {
      // Appearing: no travel, just fade in where it is.
      m.top.x = m.top.t = top;
      m.bottom.x = m.bottom.t = bottom;
    } else if (top > m.top.t) {
      tune(m.bottom, ...m.lead);
      tune(m.top, ...m.trail);
    } else {
      tune(m.top, ...m.lead);
      tune(m.bottom, ...m.trail);
    }
    m.top.t = top;
    m.bottom.t = bottom;
    m.shown.t = 1;
    wake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <nav ref={nav} className="rail" aria-label={s.rail.label}>
      <span ref={hl} className="rail__hl" aria-hidden="true" />
      {groups.map((items, g) => (
        <div key={g} className="rail__group">
          {items.map((item) => {
            const on = item.id === 'analysis' ? analysisOpen : panel === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-id={item.id}
                className={`rail__btn${item.id === 'analysis' ? ' rail__btn--toggle' : ''}`}
                aria-pressed={on}
                aria-label={item.label}
                aria-controls={item.id === 'analysis' ? 'analysis-drawer' : 'studio-panel'}
                onClick={() => (item.id === 'analysis' ? onAnalysis(!analysisOpen) : onPanel(on ? null : item.id))}
              >
                <Icon name={item.icon} size={22} />
                <span className="rail__tip" role="presentation">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
