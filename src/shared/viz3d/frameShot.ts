/**
 * Shot framing for story 3D renderers.
 *
 * THREE.JS SIDE: imports three. Import it ONLY from `src/shared/viz3d/` or a renderer that a
 * story section loads with `React.lazy`; sections use `src/shared/components/viz/viewerCamera`.
 */
import * as THREE from 'three';
import type { Box3, V3, ViewPreset } from '../components/viz/viewerCamera';

export type { Box3, V3 } from '../components/viz/viewerCamera';

export interface ShotPad {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface Shot {
  /** World-space boxes the shot must frame (their corners, not their union's). */
  boxes: Box3[];
  /** Screen-space room (px) reserved around the boxes for DOM labels. */
  pad: ShotPad;
  /** Replaces the isometric preset's direction for this shot only. */
  isoDir?: V3;
}

/** Direction from target to camera for each view preset. */
export const VIEW_DIRECTIONS: Record<ViewPreset, V3> = {
  iso: [2.5, 10, 11],
  // Low and straight on, but high enough that floors are not seen edge-on.
  front: [0, 3.5, 14],
  // Nearly vertical: a pure top-down view would flip the camera's up vector.
  top: [0, 14, 0.5],
};

/**
 * Orthographic framing: project every box corner onto the camera plane, pick the zoom that
 * fits them plus the label padding, and aim at the centre of the padded extent. The target
 * keeps the boxes' depth, so it stays inside the scene (and its pan boundary).
 */
export function frameShot(shot: Shot, direction: V3, width: number, height: number) {
  const dir = new THREE.Vector3(...direction);
  const forward = dir.clone().normalize().negate();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();

  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity];
  const centre = new THREE.Vector3();
  let corners = 0;
  for (const [min, max] of shot.boxes)
    for (const x of [min[0], max[0]])
      for (const y of [min[1], max[1]])
        for (const z of [min[2], max[2]]) {
          const p = new THREE.Vector3(x, y, z);
          centre.add(p);
          corners++;
          const sx = p.dot(right);
          const sy = p.dot(up);
          [x0, x1, y0, y1] = [
            Math.min(x0, sx),
            Math.max(x1, sx),
            Math.min(y0, sy),
            Math.max(y1, sy),
          ];
        }
  centre.divideScalar(Math.max(1, corners));

  const { left, right: padR, top, bottom } = shot.pad;
  const zoom = Math.max(
    8,
    Math.min(
      (width - left - padR) / Math.max(1e-6, x1 - x0),
      (height - top - bottom) / Math.max(1e-6, y1 - y0)
    )
  );
  const cx = (x0 + x1) / 2 + (padR - left) / (2 * zoom);
  const cy = (y0 + y1) / 2 + (top - bottom) / (2 * zoom);
  const target = centre
    .clone()
    .add(right.clone().multiplyScalar(cx - centre.dot(right)))
    .add(up.clone().multiplyScalar(cy - centre.dot(up)));
  const position = target.clone().add(dir);
  return { target, position, zoom };
}

/** The union of `boxes`, grown by `margin` on every side: a pan boundary for the target. */
export function boundsOf(boxes: Box3[], margin: number): Box3 {
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const [a, b] of boxes)
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], a[i], b[i]);
      max[i] = Math.max(max[i], a[i], b[i]);
    }
  return [min.map((v) => v - margin) as V3, max.map((v) => v + margin) as V3];
}
