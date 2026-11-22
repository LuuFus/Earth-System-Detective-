// Ukraine's icon is its outline with Crimea: two closed shapes in one path, the second one south
// of the mainland's coast.

import { describe, expect, it } from 'vitest';
import { PATHS } from './Icon';

describe('the Ukraine icon', () => {
  const shapes = PATHS.ukraine.split('M').filter(Boolean);

  it('has the mainland and Crimea', () => {
    expect(shapes).toHaveLength(2);
    for (const s of shapes) expect(s.trim().endsWith('Z')).toBe(true);
  });

  it('Crimea lies south of the mainland', () => {
    const ys = (s: string) => s.replace('Z', '').trim().split(/\s+/).map(Number).filter((_, i) => i % 2 === 1);
    const mainland = ys(shapes[0]);
    const crimea = ys(shapes[1]);
    expect(Math.max(...crimea)).toBeGreaterThan(Math.max(...mainland));
  });
});
