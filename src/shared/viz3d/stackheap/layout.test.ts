import { describe, expect, it } from 'vitest';
import { STORY_BEATS } from '../../../features/javascript/utils/stackHeapStory';
import { getReferences, type HeapKind, type StackFrame } from '../../snapshot';
import type { Box3 } from '../../components/viz/viewerCamera';
import type { PlacedSnapshot } from '../../components/viz/stackheap/types';
import { boundsOf } from '../frameShot';
import { entityBox, frameBox, layoutFor, layoutOf, refArc } from './layout';

const contains = ([omin, omax]: Box3, [imin, imax]: Box3) =>
  [0, 1, 2].every((i) => imin[i] >= omin[i] - 1e-9 && imax[i] <= omax[i] + 1e-9);

const footprintsOverlap = ([amin, amax]: Box3, [bmin, bmax]: Box3) =>
  amin[0] < bmax[0] && bmin[0] < amax[0] && amin[2] < bmax[2] && bmin[2] < amax[2];

const frame = (id: string, refId?: string): StackFrame => ({
  id,
  name: `${id}()`,
  slots: refId ? [{ name: 'x', refId }] : [{ name: 'x', value: '1' }],
});

const KINDS: HeapKind[] = ['object', 'array', 'function', 'scope'];

/** A 3×3 heap of every kind under a 5-frame stack. */
const big: PlacedSnapshot = {
  frames: ['global', 'a', 'b', 'c', 'd'].map((id) => frame(id)),
  objects: Array.from({ length: 9 }, (_, i) => ({
    id: `o${i}`,
    label: 'Thing',
    kind: KINDS[i % KINDS.length],
    slots: [],
    state: 'live' as const,
    cell: { col: i % 3, row: Math.floor(i / 3) },
  })),
};

describe('stack-and-heap layout', () => {
  it("returns the Stack ↔ Heap story's constants for every beat", () => {
    // The values StackHeap3D.tsx shipped with, written out as it computed them.
    const STACK: Box3 = [
      [-4.6 - 3 / 2, 0, -2.4 / 2],
      [-4.6 + 3 / 2, 1.1 / 2 + 2 * (1.1 + 0.45) + 0.02 + 1.1 / 2, 2.4 / 2],
    ];
    const OBJECTS: Box3 = [
      [0.9 - 1.3, 0, -1.8 - 0.9],
      [0.9 + 3.6 + 1.3, 1, -1.8 + 3.6 + 0.9],
    ];
    const centre = [0.9 + 3.6 / 2, 0, -1.8 + 3.6 / 2];
    const size = [3.6 + 4.4, 0.1, 3.6 + 3.8];
    const FLOOR: Box3 = [
      [centre[0] - size[0] / 2, 0, centre[2] - size[2] / 2],
      [centre[0] + size[0] / 2, 1, centre[2] + size[2] / 2],
    ];
    const withStack = { left: 40, right: 60, top: 70, bottom: 80 };

    expect(STORY_BEATS).toHaveLength(10);
    for (const beat of STORY_BEATS) {
      const layout = layoutFor(beat);
      expect(layout.heapCenter, beat.id).toEqual(centre);
      expect(layout.heapSize, beat.id).toEqual(size);
      expect(layout.gridDivisions, beat.id).toBe(12);
      expect(layout.pitch, beat.id).toEqual({ x: 3.6, z: 3.6 });
      expect(layout.dense, beat.id).toBe(false);
      expect(layout.shots, beat.id).toEqual({
        overview: { boxes: [STACK, FLOOR], pad: withStack },
        stack: { boxes: [STACK], pad: withStack },
        bridge: { boxes: [STACK, OBJECTS], pad: withStack },
        heap: { boxes: [OBJECTS], pad: { left: 60, right: 60, top: 70, bottom: 80 } },
        gc: { boxes: [STACK, FLOOR], pad: withStack, isoDir: [5, 9, 11] },
      });
      expect(layout.bounds, beat.id).toEqual(boundsOf([STACK, FLOOR], 3));
    }
  });

  it('gives every story beat the same layout object, so the camera never re-frames for it', () => {
    const first = layoutFor(STORY_BEATS[0]);
    for (const beat of STORY_BEATS) expect(layoutFor(beat)).toBe(first);
  });

  it('extends the floor for a larger grid and the stack box for a deeper stack', () => {
    const story = layoutOf({ cols: 2, rows: 2 }, 3);
    const layout = layoutFor(big);
    expect(layout.grid).toEqual({ cols: 3, rows: 3 });
    expect(layout.depth).toBe(5);
    layout.floor[0].forEach((v, i) => expect(v).toBeCloseTo(story.floor[0][i]));
    // A third cell on an axis also widens the pitch on that axis, so labels keep their room.
    expect(layout.pitch.x).toBeGreaterThan(story.pitch.x);
    expect(layout.pitch.z).toBeGreaterThan(story.pitch.z);
    expect(layout.floor[1][0]).toBeCloseTo(story.floor[1][0] + 2 * layout.pitch.x - 3.6);
    expect(layout.floor[1][2]).toBeCloseTo(story.floor[1][2] + 2 * layout.pitch.z - 3.6);
    expect(layout.dense).toBe(true);
    expect(layout.stack[1][1]).toBeGreaterThan(story.stack[1][1]);
    expect(layout.shots.heap.boxes).toEqual([layout.objects]);
  });

  it('keeps a 3×3 heap with 5 frames apart and inside the overview shot', () => {
    const layout = layoutFor(big);
    const frames = big.frames.map((_, i) => frameBox(i));
    const entities = big.objects.map((o) => entityBox(o.kind, o.cell, layout));

    entities.forEach((a, i) =>
      entities.slice(i + 1).forEach((b, j) => {
        expect(footprintsOverlap(a, b), `o${i} × o${i + 1 + j}`).toBe(false);
      })
    );
    frames.slice(1).forEach((f, i) => expect(f[0][1]).toBeGreaterThan(frames[i][1][1]));

    const { boxes } = layout.shots.overview;
    for (const box of [...frames, ...entities]) {
      expect(boxes.some((shotBox) => contains(shotBox, box))).toBe(true);
      expect(contains(layout.bounds, box)).toBe(true);
    }
    for (const box of frames) expect(contains(layout.shots.stack.boxes[0], box)).toBe(true);
    for (const box of entities) expect(contains(layout.shots.heap.boxes[0], box)).toBe(true);
  });

  describe('refArc', () => {
    const snapshot: PlacedSnapshot = {
      frames: [frame('global', 'fn'), frame('outer', 'ghost')],
      objects: [
        {
          id: 'fn',
          label: 'ƒ inner',
          kind: 'function',
          slots: [
            { name: '[[Scope]]', refId: 'outer' },
            { name: 'self', refId: 'fn' },
            { name: 'lost', refId: 'nowhere' },
          ],
          state: 'live',
          cell: { col: 0, row: 0 },
        },
      ],
    };
    const arcs = new Map(getReferences(snapshot).map((r) => [r.id, refArc(r, snapshot)]));
    const stackSide = -4.6 + 3 / 2;

    it('draws a frame slot to its heap object', () => {
      const arc = arcs.get('global.x');
      expect(arc?.start[0]).toBeCloseTo(stackSide);
      expect(arc?.end[0]).toBeLessThan(0.9); // the face turned toward the stack
    });

    it('draws a heap entity back to a frame that is still on the stack', () => {
      const arc = arcs.get('fn.[[Scope]]');
      expect(arc?.start[0]).toBeLessThan(0.9);
      expect(arc?.end[0]).toBeCloseTo(stackSide);
      const [, lo] = [frameBox(1)[0][1], frameBox(1)[1][1]];
      expect(arc?.end[1]).toBeLessThan(lo);
      expect(arc?.end[1]).toBeGreaterThan(frameBox(1)[0][1]);
    });

    it('draws nothing for a refId that matches nothing', () => {
      expect(arcs.get('outer.x')).toBeNull();
      expect(arcs.get('fn.lost')).toBeNull();
    });

    it('gives a self-reference finite points', () => {
      const arc = arcs.get('fn.self');
      expect(arc).not.toBeNull();
      for (const p of [arc!.start, arc!.mid, arc!.end])
        for (const v of p) expect(Number.isFinite(v)).toBe(true);
    });
  });
});
