import { describe, expect, it } from 'vitest';
import { STORY_BEATS, runningEntry } from '../../../features/javascript/utils/eventLoopStory';
import {
  MIN_ENTRY_ROWS,
  entryCell,
  extentOf,
  placeEntries,
  type EventLoopExtent,
  type QueueRegion,
} from '../../components/viz/eventloop/layout';
import type { Box3, V3 } from '../../components/viz/viewerCamera';
import type { QueueEntry, Snapshot, StackFrame } from '../../snapshot';
import { frameShot } from '../frameShot';
import { FRAME_SIZE, STACK_X, frameBox, frameY } from '../stackheap/layout';
import {
  ENTRY_CARD,
  ENTRY_SIZE,
  ISO,
  LANE_PITCH,
  MIN_VIEWER,
  ROW_PITCH,
  asEntry,
  asFrame,
  cellPos,
  entryBox,
  laneX,
  layoutFor,
  layoutOf,
  morePos,
  placesOf,
  waitingIdOf,
} from './layout';

const contains = ([omin, omax]: Box3, [imin, imax]: Box3) =>
  [0, 1, 2].every((i) => imin[i] >= omin[i] - 1e-9 && imax[i] <= omax[i] + 1e-9);
const footprintsOverlap = ([amin, amax]: Box3, [bmin, bmax]: Box3) =>
  amin[0] < bmax[0] && bmin[0] < amax[0] && amin[2] < bmax[2] && bmin[2] < amax[2];

const frame = (id: string): StackFrame => ({ id, name: `${id}()`, slots: [] });
const entries = (n: number, p: string): QueueEntry[] =>
  Array.from({ length: n }, (_, i) => ({ id: `${p}${i}`, label: `${p}${i}`, source: 'promise' }));

/** The most a trace step draws: 5 frames and 6 entries in every region. */
const FULL: Snapshot = {
  frames: ['global', 'a', 'b', 'c', 'd'].map(frame),
  objects: [],
  microtasks: entries(6, 'm'),
  tasks: entries(6, 't'),
  timers: entries(6, 'x'),
};
const QUIET: Snapshot = {
  frames: [frame('global')],
  objects: [],
  microtasks: [],
  tasks: [],
  timers: [],
};
const REGIONS: QueueRegion[] = ['microtasks', 'tasks', 'timers'];
/** What `StoryCamera` adds to a shot's right padding. */
const TOOLBAR_GUTTER = 44;

/** Screen position (px, y down) of a world point in the overview at the smallest viewer. */
function projector(extent: EventLoopExtent) {
  const shot = layoutOf(extent).shots.overview;
  const pad = { ...shot.pad, right: shot.pad.right + TOOLBAR_GUTTER };
  const { width, height } = MIN_VIEWER;
  const { target, position, zoom } = frameShot({ ...shot, pad }, ISO, width, height);
  const forward = target.clone().sub(position).normalize();
  const right = forward
    .clone()
    .cross(position.clone().set(0, 1, 0))
    .normalize();
  const up = right.clone().cross(forward).normalize();
  return (p: V3): [number, number] => {
    const d = position
      .clone()
      .set(...p)
      .sub(target);
    return [width / 2 + d.dot(right) * zoom, height / 2 - d.dot(up) * zoom];
  };
}

describe('event loop 3D layout', () => {
  it('puts the lanes right of the stack, in the order the loop takes work', () => {
    const xs = REGIONS.map(laneX);
    expect(xs[0]).toBeGreaterThan(STACK_X + FRAME_SIZE[0] / 2);
    expect(xs[1] - xs[0]).toBeCloseTo(LANE_PITCH);
    expect(xs[2] - xs[1]).toBeCloseTo(LANE_PITCH);
  });

  it("stands every entry in its region's cell, row 0 at the back", () => {
    const layout = layoutFor(FULL);
    for (const { entry, region, cell } of placeEntries(FULL)) {
      const [x, y, z] = cellPos(region, cell, layout);
      expect(x, entry.id).toBeCloseTo(laneX(region));
      expect(y).toBe(0);
      expect(z).toBeCloseTo(layout.z0 + cell.row * ROW_PITCH);
      expect(contains(layout.lanes[region], entryBox(region, cell, layout)), entry.id).toBe(true);
    }
    const head = cellPos('tasks', entryCell(0), layout);
    const second = cellPos('tasks', entryCell(1), layout);
    expect(head[2]).toBeLessThan(second[2]);
  });

  it('keeps entries apart from each other and from the stack', () => {
    const layout = layoutFor(FULL);
    const boxes = placeEntries(FULL).map((p) => entryBox(p.region, p.cell, layout));
    boxes.forEach((a, i) => {
      expect(footprintsOverlap(a, layout.stack)).toBe(false);
      for (const b of boxes.slice(i + 1)) expect(footprintsOverlap(a, b)).toBe(false);
    });
    for (const region of REGIONS)
      expect(footprintsOverlap(layout.lanes[region], layout.stack)).toBe(false);
  });

  it('leaves room for the "+N more" marker past a full lane', () => {
    const layout = layoutFor(FULL);
    const [min, max] = layout.lanes.microtasks;
    const [, , z] = morePos('microtasks', 6, layout);
    expect(z).toBeGreaterThan(entryBox('microtasks', entryCell(5), layout)[1][2]);
    expect(z).toBeGreaterThan(min[2]);
    expect(z).toBeLessThan(max[2]);
  });

  it('sizes every lane for the whole run, and for at least four rows', () => {
    const quiet = layoutFor(QUIET);
    expect(quiet.rows).toBe(MIN_ENTRY_ROWS);
    expect(quiet.dense).toBe(false);
    // A quiet step of a busy run is laid out like its busiest step.
    const pinned = layoutFor(QUIET, extentOf([FULL]));
    expect(pinned).toBe(layoutFor(FULL));
    expect(pinned.rows).toBe(6);
    expect(pinned.dense).toBe(true);
  });

  it('draws and frames the stack alone for a snapshot without queues', () => {
    const stackOnly: Snapshot = { frames: [frame('global')], objects: [] };
    const layout = layoutFor(stackOnly);
    expect(layout.queues).toBe(false);
    expect(layout.shots.overview.boxes).toEqual([layout.stack]);
    expect(placesOf(stackOnly, layout).size).toBe(1);
  });

  it('frames what each shot of the story must keep', () => {
    const layout = layoutFor(STORY_BEATS[0], extentOf(STORY_BEATS));
    const { shots, stack, lanes } = layout;
    expect(shots.overview.boxes).toEqual([stack, lanes.microtasks, lanes.tasks, lanes.timers]);
    expect(shots.stack.boxes).toEqual([stack]);
    expect(shots['timers-tasks'].boxes).toEqual([lanes.tasks, lanes.timers]);
    expect(shots['stack-microtasks'].boxes.slice(0, 2)).toEqual([stack, lanes.microtasks]);
    // The waiting task stays in frame while the microtasks run.
    expect(shots['stack-microtasks'].boxes[2]).toEqual(entryBox('tasks', entryCell(0), layout));
    expect(shots['stack-tasks'].boxes).toEqual([stack, lanes.microtasks, lanes.tasks]);
    for (const shot of Object.values(shots))
      for (const box of shot.boxes) expect(contains(layout.bounds, box)).toBe(true);
    // Every frame of every beat is inside the stack box.
    for (const beat of STORY_BEATS)
      beat.frames.forEach((_, i) => expect(contains(stack, frameBox(i))).toBe(true));
  });

  it('gives every entry card its own room in the smallest viewer', () => {
    const project = projector(extentOf([FULL]));
    const layout = layoutFor(FULL);
    const at = (region: QueueRegion, row: number) =>
      project(cellPos(region, entryCell(row), layout));
    // Neighbouring lanes are a card apart, neighbouring rows a card's height apart.
    expect(at('tasks', 0)[0] - at('microtasks', 0)[0]).toBeGreaterThanOrEqual(ENTRY_CARD.width);
    expect(at('tasks', 1)[1] - at('tasks', 0)[1]).toBeGreaterThanOrEqual(ENTRY_CARD.height);
    // And the whole scene is inside the viewer.
    const corners = [layout.stack, ...REGIONS.map((r) => layout.lanes[r])].flatMap(
      ([a, b]): V3[] => [a, b, [a[0], b[1], b[2]], [b[0], a[1], a[2]]]
    );
    for (const c of corners) {
      const [x, y] = project(c);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(MIN_VIEWER.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(MIN_VIEWER.height);
    }
  });
});

describe('event loop 3D identity', () => {
  const layout = layoutFor(STORY_BEATS[0], extentOf(STORY_BEATS));
  const beat = (id: string) => STORY_BEATS.find((b) => b.id === id)!;

  it('places every frame and entry of a beat once, by id', () => {
    for (const b of STORY_BEATS) {
      const places = placesOf(b, layout);
      expect(places.size, b.id).toBe(b.frames.length + placeEntries(b).length);
      b.frames.forEach((f, i) =>
        expect(places.get(f.id)).toEqual({ kind: 'frame', box: frameBox(i) })
      );
    }
  });

  it('finds the entry a frame was: its own id in the story, the running entry in a trace', () => {
    const b = beat('microtask-before-task');
    expect(waitingIdOf('onResolved', runningEntry(b))).toBe('onResolved');
    expect(placesOf(beat('stack-empties'), layout).get('onResolved')?.kind).toBe('entry');
    expect(placesOf(b, layout).get('onResolved')?.kind).toBe('frame');

    const running = {
      entry: { id: 'q7', label: 'then callback', source: 'promise' as const },
      from: 'microtasks' as const,
      frameId: 'f3',
    };
    expect(waitingIdOf('f3', running)).toBe('q7');
    expect(waitingIdOf('f2', running)).toBe('f2');
    expect(waitingIdOf('f3', undefined)).toBe('f3');
  });

  it('turns main back into an entry at the await, and into a frame when it resumes', () => {
    expect(placesOf(beat('reaction-queued'), layout).get('main')?.kind).toBe('frame');
    expect(placesOf(beat('await-splits-main'), layout).get('main')?.kind).toBe('entry');
    expect(placesOf(beat('main-resumes'), layout).get('main')?.kind).toBe('frame');
  });

  it('starts a morph exactly on the box of what the callback was', () => {
    const cell = entryBox('microtasks', entryCell(1), layout);
    const slab = asFrame(cell);
    [laneX('microtasks'), ENTRY_SIZE[1] / 2, layout.z0 + ROW_PITCH].forEach((v, i) =>
      expect(slab.position[i]).toBeCloseTo(v)
    );
    slab.scale.forEach((s, i) => expect(s * FRAME_SIZE[i]).toBeCloseTo(ENTRY_SIZE[i]));
    asEntry(cell).scale.forEach((s) => expect(s).toBeCloseTo(1));

    const block = asEntry(frameBox(1));
    expect(block.position).toEqual([STACK_X, frameY(1) - FRAME_SIZE[1] / 2, 0]);
    block.scale.forEach((s, i) => expect(s * ENTRY_SIZE[i]).toBeCloseTo(FRAME_SIZE[i]));
    asFrame(frameBox(1)).scale.forEach((s) => expect(s).toBeCloseTo(1));
  });
});
