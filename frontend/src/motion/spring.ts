// Springs for the interface, ported from Design Bookmark's shared motion engine (motion.js):
// the same integrator, four substeps a frame, one requestAnimationFrame loop for everything,
// and stiffness / damping pairs read from tokens.css (--spring-*), so a component moves exactly
// as its reference does.

import { useEffect, useRef } from 'react';

export type Spring = { x: number; v: number; t: number; k: number; c: number };

const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function spring(x: number, k = 400, c = 30): Spring {
  return { x, v: 0, t: x, k, c: reduce ? 2 * Math.sqrt(k) : c };
}

/** Changes a spring's feel; with reduced motion it is critically damped (no overshoot). */
export function tune(s: Spring, k: number, c: number): void {
  s.k = k;
  s.c = reduce ? 2 * Math.sqrt(k) : c;
}

export function step(s: Spring, dt: number): void {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

export function settled(s: Spring, eps = 0.001): boolean {
  return Math.abs(s.x - s.t) < eps && Math.abs(s.v) < eps * 10;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function token(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** A "stiffness damping" pair from tokens.css. */
export function springToken(name: string, fallback: string): [number, number] {
  const [k, c] = token(name, fallback).split(/\s+/).map(Number);
  return [k, c];
}

export function numberToken(name: string, fallback: number): number {
  const v = parseFloat(token(name, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

// ---------- one loop for every animated component ----------

type Component = { frame: (dt: number) => void; render: () => void; idle?: () => boolean };
const components = new Set<Component>();
let last = 0;
let running = false;

function loop(now: number) {
  const dt = Math.min((now - last) / 1000, 1 / 30);
  last = now;
  const sub = 4;
  for (let k = 0; k < sub; k++) for (const c of components) c.frame(dt / sub);
  for (const c of components) c.render();
  // Stop the loop when every component has come to rest; register() or wake() restarts it.
  if ([...components].every((c) => c.idle?.() ?? false)) {
    running = false;
    return;
  }
  requestAnimationFrame(loop);
}

export function wake(): void {
  if (running) return;
  running = true;
  last = performance.now();
  requestAnimationFrame(loop);
}

export function register(c: Component): () => void {
  components.add(c);
  wake();
  return () => {
    components.delete(c);
  };
}

/**
 * Runs `frame` (physics, called with substeps) and `render` (DOM writes) every animation frame
 * while the component is mounted and not idle. Callbacks may change between renders.
 */
export function useMotion(frame: (dt: number) => void, render: () => void, idle?: () => boolean): () => void {
  const ref = useRef({ frame, render, idle });
  ref.current = { frame, render, idle };
  useEffect(
    () =>
      register({
        frame: (dt) => ref.current.frame(dt),
        render: () => ref.current.render(),
        idle: () => ref.current.idle?.() ?? false,
      }),
    [],
  );
  return wake;
}
