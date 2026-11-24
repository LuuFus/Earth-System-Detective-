// A clock for the players (fire stories, smoke scenes, the smoke forecast): hours from 0 to
// `length`, played at `rate` hours a second times the chosen speed. The page hears every frame
// through `onTime`; the component re-renders only when the shown time moves on a little.

import { useCallback, useEffect, useRef, useState } from 'react';

export type Speed = 1 | 2 | 4;

export function useClock(length: number, rate: number, onTime: (hours: number) => void, opts: { autoplay?: boolean; loop?: boolean } = {}) {
  const { autoplay = false, loop = false } = opts;
  const [hours, setHours] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [speed, setSpeed] = useState<Speed>(1);
  const clock = useRef(0);
  const cb = useRef(onTime);
  useEffect(() => {
    cb.current = onTime;
  }, [onTime]);
  // The page starts in step with the clock.
  useEffect(() => {
    cb.current(0);
  }, []);
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let next = clock.current + dt * rate * speed;
      const ended = next >= length;
      if (ended) next = loop ? 0 : length;
      clock.current = next;
      cb.current(next);
      // A quarter of an hour is as fine as the labels show.
      const q = Math.round(next * 4);
      if (q !== shown || ended) {
        shown = q;
        setHours(next);
      }
      if (ended && !loop) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed, rate, length, loop]);
  const seek = useCallback((h: number) => {
    clock.current = h;
    setHours(h);
    cb.current(h);
  }, []);
  const toggle = useCallback(() => {
    if (!playing && clock.current >= length) seek(0);
    setPlaying(!playing);
  }, [playing, length, seek]);
  const nextSpeed = useCallback(() => setSpeed((s) => (s === 1 ? 2 : s === 2 ? 4 : 1)), []);
  return { hours, playing, speed, seek, toggle, nextSpeed };
}
