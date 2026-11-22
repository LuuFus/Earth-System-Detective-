import { useId, useState } from 'react';

type Props = { before: string; after: string; beforeLabel: string; afterLabel: string; alt: string; hint: string };

/** Two pictures of one place, one over the other: drag (or use the arrow keys) to compare them. */
export function BeforeAfter({ before, after, beforeLabel, afterLabel, alt, hint }: Props) {
  const [at, setAt] = useState(50);
  const id = useId();
  return (
    <div className="before-after" style={{ ['--at' as string]: `${at}%` }}>
      <img src={before} alt={`${alt}: ${beforeLabel}`} loading="lazy" decoding="async" />
      <img className="before-after__after" src={after} alt={`${alt}: ${afterLabel}`} loading="lazy" decoding="async" />
      <span className="before-after__line" aria-hidden="true" />
      <span className="before-after__tag before-after__tag--before">{beforeLabel}</span>
      <span className="before-after__tag before-after__tag--after">{afterLabel}</span>
      <label className="visually-hidden" htmlFor={id}>
        {hint}
      </label>
      <input id={id} className="before-after__range" type="range" min={0} max={100} step={0.5} value={at} onChange={(e) => setAt(Number(e.target.value))} />
    </div>
  );
}
