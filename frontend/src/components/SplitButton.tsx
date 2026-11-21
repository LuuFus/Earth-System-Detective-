import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/** The main action: a light pill with an arrow that slides on hover. */
export function SplitButton({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="cta" to={to}>
      <span className="cta__label">{children}</span>
      <span className="cta__arrow" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="18" height="18" focusable="false">
          <path d="M2 8h11M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
