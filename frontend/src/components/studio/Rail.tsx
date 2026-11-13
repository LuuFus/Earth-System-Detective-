import { useStudio } from '../../i18n/useStudio';
import type { Panel } from '../../state/explore';
import { Icon, type IconName } from './Icon';

type Props = {
  panel: Panel | null;
  analysisOpen: boolean;
  onPanel: (panel: Panel | null) => void;
  onAnalysis: (open: boolean) => void;
};

/** The studio's left rail: one button per tool, labelled under its icon. */
export function Rail({ panel, analysisOpen, onPanel, onAnalysis }: Props) {
  const s = useStudio();
  const items: { id: Panel | 'analysis'; icon: IconName; label: string }[] = [
    { id: 'layers', icon: 'layers', label: s.rail.layers },
    { id: 'cases', icon: 'cases', label: s.rail.cases },
    { id: 'analysis', icon: 'analysis', label: s.rail.analysis },
    { id: 'weather', icon: 'weather', label: s.rail.weather },
    { id: 'glossary', icon: 'glossary', label: s.rail.glossary },
    { id: 'share', icon: 'share', label: s.rail.share },
  ];
  return (
    <nav className="rail" aria-label={s.rail.label}>
      {items.map((item) => {
        const active = item.id === 'analysis' ? analysisOpen : panel === item.id;
        return (
          <button
            key={item.id}
            type="button"
            className="rail__btn"
            aria-pressed={active}
            aria-controls={item.id === 'analysis' ? 'analysis-drawer' : 'studio-panel'}
            onClick={() => (item.id === 'analysis' ? onAnalysis(!analysisOpen) : onPanel(active ? null : item.id))}
          >
            <Icon name={item.icon} />
            <span className="rail__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
