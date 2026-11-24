// What a loader gives, once it has given it: null until then (and if it fails). It starts when
// `enabled` becomes true and again when `key` changes; a late answer for an old key is dropped.

import { useEffect, useState } from 'react';

export function useLoaded<T>(load: () => Promise<T>, enabled = true, key: unknown = null): T | null {
  const [value, setValue] = useState<{ key: unknown; v: T } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    load()
      .then((v) => !cancelled && setValue({ key, v }))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // The loader is a new function every render; `enabled` and `key` say when to load again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);
  return value && value.key === key ? value.v : null;
}
