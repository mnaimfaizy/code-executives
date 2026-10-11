/**
 * Small helpers every story 3D renderer needs: easing, world up and the label base style.
 * The DOM label components built on them are in `primitives.labels.tsx`.
 *
 * THREE.JS SIDE: this module imports three. Import it ONLY from `src/shared/viz3d/` or a
 * renderer that a story section loads with `React.lazy`.
 */
import type React from 'react';
import * as THREE from 'three';

/** One frame of exponential easing from `from` to `to`; with `instant` it is a cut. */
export const damp = (from: number, to: number, instant: boolean, dt: number, lambda = 8) =>
  instant ? to : THREE.MathUtils.damp(from, to, lambda, dt);

/** World up. Shared and read-only: never mutate it. */
export const UP: Readonly<THREE.Vector3> = new THREE.Vector3(0, 1, 0);

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

/** Every DOM label: never intercepts the pointer, never wraps. */
export const labelStyle: React.CSSProperties = {
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

/** A 6-digit hex as `rgba()`, for translucent label backgrounds taken from the palette. */
export function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
