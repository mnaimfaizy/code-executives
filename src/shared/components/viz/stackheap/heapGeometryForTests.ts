/**
 * Test support: follows the reference arrows of a 2D stack-and-heap drawing and reports every
 * arrow that passes through a frame or heap object. jsdom cannot measure an SVG path, so the
 * few commands `refPath` writes (M, L, Q, C) are sampled here.
 */

import { getReferences } from '../../../snapshot';
import { layout2D, refPath, type StackHeapLayout2D } from './heapGeometry';
import type { Box } from './stackGeometry';
import type { PlacedSnapshot } from './types';
import type { HeapGrid } from '../../../snapshot';

type Point = [number, number];

const SAMPLES = 24;

/** Points along a path made of M, L, Q and C commands with absolute coordinates. */
export function samplePath(d: string): Point[] {
  const tokens = d.match(/[MLQC]|-?\d+(?:\.\d+)?(?:e-?\d+)?/g) ?? [];
  const points: Point[] = [];
  let at: Point = [0, 0];
  let i = 0;
  const read = (): Point => {
    const point: Point = [Number(tokens[i]), Number(tokens[i + 1])];
    i += 2;
    return point;
  };
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === 'M') {
      at = read();
      points.push(at);
    } else if (command === 'L') {
      const to = read();
      for (let s = 1; s <= SAMPLES; s++) {
        const t = s / SAMPLES;
        points.push([at[0] + (to[0] - at[0]) * t, at[1] + (to[1] - at[1]) * t]);
      }
      at = to;
    } else if (command === 'Q') {
      const c = read();
      const to = read();
      for (let s = 1; s <= SAMPLES; s++) {
        const t = s / SAMPLES;
        const u = 1 - t;
        points.push([
          u * u * at[0] + 2 * u * t * c[0] + t * t * to[0],
          u * u * at[1] + 2 * u * t * c[1] + t * t * to[1],
        ]);
      }
      at = to;
    } else if (command === 'C') {
      const c1 = read();
      const c2 = read();
      const to = read();
      for (let s = 1; s <= SAMPLES * 4; s++) {
        const t = s / (SAMPLES * 4);
        const u = 1 - t;
        points.push([
          u * u * u * at[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * to[0],
          u * u * u * at[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * to[1],
        ]);
      }
      at = to;
    } else {
      throw new Error(`samplePath: unexpected token ${command} in ${d}`);
    }
  }
  return points;
}

/** True when `point` is inside `box`, more than `inset` units from its edges. */
const inside = ([x, y]: Point, box: Box, inset: number) =>
  x > box.x + inset && x < box.x + box.w - inset && y > box.y + inset && y < box.y + box.h - inset;

export interface Crossing {
  /** The reference whose arrow goes through an entity. */
  ref: string;
  /** The entity it goes through. */
  through: string;
}

export interface ArrowCheck {
  layout: StackHeapLayout2D;
  /** How many references got an arrow. */
  arrows: number;
  /** Arrows that pass through a frame or object, their own ends included. */
  crossings: Crossing[];
}

/**
 * Checks every arrow of a drawing. An arrow starts and ends on the edge of an entity, so it
 * may touch its own two ends; a self reference loops off its owner's edge. Anything more than
 * 2 units inside any entity is a crossing.
 */
export function checkArrows(snapshot: PlacedSnapshot, grid?: HeapGrid): ArrowCheck {
  const layout = layout2D(snapshot, grid);
  const boxes = [...layout.frames, ...layout.objects];
  const crossings: Crossing[] = [];
  let arrows = 0;
  for (const ref of getReferences(snapshot)) {
    const d = refPath(ref, snapshot, layout);
    if (!d) continue;
    arrows += 1;
    const points = samplePath(d);
    for (const [id, box] of boxes) {
      if (points.some((point) => inside(point, box, 2)))
        crossings.push({ ref: ref.id, through: id });
    }
  }
  return { layout, arrows, crossings };
}
