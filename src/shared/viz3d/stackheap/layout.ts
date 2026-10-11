/**
 * World geometry and camera shots of the stack-and-heap scene, as pure functions of the heap
 * grid and the stack depth.
 *
 * THREE-FREE: only types cross from `frameShot`, so this file can be unit-tested without WebGL.
 * A grid up to 2×2 with up to 3 frames is the Stack ↔ Heap story's layout, unchanged; a larger
 * grid extends the heap floor (+x, +z) and a deeper stack grows upward.
 *
 * Labels are DOM cards of a fixed pixel size, while a larger scene is framed at a lower zoom.
 * So a third column or row also widens the pitch on that axis: the blocks keep their size and
 * each label keeps the room it needs.
 */
import {
  gridOf,
  slotKey,
  type Cell,
  type HeapGrid,
  type HeapKind,
  type Reference,
} from '../../snapshot';
import type { Box3, V3 } from '../../components/viz/viewerCamera';
import type { PlacedSnapshot, StackHeapShot } from '../../components/viz/stackheap/types';
import type { Shot, ShotPad } from '../frameShot';

// ---- Fixed measures (world units) -------------------------------------------------------

export const STACK_X = -4.6;
export const FRAME_SIZE: V3 = [3, 1.1, 2.4];
export const FRAME_GAP = 0.45;
/** Centre height of the frame at `index` (0 = bottom of the stack). */
export const frameY = (index: number) =>
  FRAME_SIZE[1] / 2 + index * (FRAME_SIZE[1] + FRAME_GAP) + 0.02;

export const CELL_X0 = 0.9;
export const CELL_Z0 = -1.8;
/** Distance between neighbouring cells while an axis has at most two of them (the story). */
export const CELL_PITCH = 3.6;
/** The pitch once an axis has a third cell: room for a label per column, and per row. */
const WIDE_PITCH = { x: 5.6, z: 6.9 };

/** Footprint and height of each heap kind. Every footprint fits a cell with room for arcs. */
export const ENTITY_SIZE: Record<HeapKind, V3> = {
  object: [2.4, 0.7, 1.6],
  array: [2.4, 0.4, 1.1],
  // A small block, clearly not a record.
  function: [1.4, 0.9, 1.4],
  // A frame-like slab lying on the floor: a frame that left the stack.
  scope: [2.6, 0.9, 1.8],
};

/** Back-row object labels float above this height; heap-to-heap arcs peak below it. */
export const OBJECT_LABEL_LIFT = 0.9;
export const HEAP_ARC_LIFT = 0.45;
/** How far an arc that touches a frame rises above its higher end. */
const STACK_ARC_LIFT = 2.2;

/** The stack is framed for at least this many frames, so short stacks do not zoom in. */
export const MIN_STACK_DEPTH = 3;

/** Direction from target to camera for the isometric preset; this scene's own angle. */
export const ISO: V3 = [6, 7, 11];
const GC_ISO: V3 = [5, 9, 11];

/** Floor position of a cell's centre. */
export const cellPos = (cell: Cell, { pitch }: Pick<StackHeapLayout, 'pitch'>): V3 => [
  CELL_X0 + cell.col * pitch.x,
  0,
  CELL_Z0 + cell.row * pitch.z,
];

// Frame labels sit on the slab fronts; object labels sit above the blocks and overhang them.
const WITH_STACK: ShotPad = { left: 40, right: 60, top: 70, bottom: 80 };
const HEAP_ONLY: ShotPad = { left: 60, right: 60, top: 70, bottom: 80 };
// A dense scene has a tall stack at the back, with nothing floating above it, and needs every
// pixel of height for its rows.
const DENSE_WITH_STACK: ShotPad = { left: 40, right: 60, top: 30, bottom: 70 };

// ---- Layout -----------------------------------------------------------------------------

export interface StackHeapLayout {
  grid: HeapGrid;
  /** Frames the stack box holds: the frame count, at least `MIN_STACK_DEPTH`. */
  depth: number;
  /** Distance between neighbouring cells on each floor axis. */
  pitch: { x: number; z: number };
  /** Larger than the story scene: labels are capped in width so neighbours stay apart. */
  dense: boolean;
  heapCenter: V3;
  heapSize: V3;
  /** Grid lines across the floor's width. */
  gridDivisions: number;
  /** The stack's extent, the objects' extent and the whole floor. */
  stack: Box3;
  objects: Box3;
  floor: Box3;
  shots: Record<StackHeapShot, Shot>;
  /** The scene plus a margin: panning keeps the camera target inside it. */
  bounds: Box3;
}

/** The union of `boxes`, grown by `margin` (same arithmetic as `boundsOf` in frameShot). */
function union(boxes: Box3[], margin: number): Box3 {
  const min: V3 = [Infinity, Infinity, Infinity];
  const max: V3 = [-Infinity, -Infinity, -Infinity];
  for (const [a, b] of boxes)
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], a[i], b[i]);
      max[i] = Math.max(max[i], a[i], b[i]);
    }
  return [min.map((v) => v - margin) as V3, max.map((v) => v + margin) as V3];
}

const cache = new Map<string, StackHeapLayout>();

/**
 * The layout for a heap grid and a number of frames. Equal inputs return the same object, so
 * a camera keyed on `shots[...]` only re-frames when the layout really changed.
 */
export function layoutOf(grid: HeapGrid, frameCount: number): StackHeapLayout {
  const cols = Math.max(1, grid.cols);
  const rows = Math.max(1, grid.rows);
  const depth = Math.max(MIN_STACK_DEPTH, frameCount);
  const key = `${cols}x${rows}x${depth}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const pitch = {
    x: cols > 2 ? WIDE_PITCH.x : CELL_PITCH,
    z: rows > 2 ? WIDE_PITCH.z : CELL_PITCH,
  };
  const dense = cols > 2 || rows > 2 || depth > MIN_STACK_DEPTH;
  const withStack = dense ? DENSE_WITH_STACK : WITH_STACK;
  const spanX = (cols - 1) * pitch.x;
  const spanZ = (rows - 1) * pitch.z;
  const heapCenter: V3 = [CELL_X0 + spanX / 2, 0, CELL_Z0 + spanZ / 2];
  const heapSize: V3 = [spanX + 4.4, 0.1, spanZ + 3.8];

  const stack: Box3 = [
    [STACK_X - FRAME_SIZE[0] / 2, 0, -FRAME_SIZE[2] / 2],
    [STACK_X + FRAME_SIZE[0] / 2, frameY(depth - 1) + FRAME_SIZE[1] / 2, FRAME_SIZE[2] / 2],
  ];
  const objects: Box3 = [
    [CELL_X0 - 1.3, 0, CELL_Z0 - 0.9],
    [CELL_X0 + spanX + 1.3, 1, CELL_Z0 + spanZ + 0.9],
  ];
  const floor: Box3 = [
    [heapCenter[0] - heapSize[0] / 2, 0, heapCenter[2] - heapSize[2] / 2],
    [heapCenter[0] + heapSize[0] / 2, 1, heapCenter[2] + heapSize[2] / 2],
  ];

  const layout: StackHeapLayout = {
    grid: { cols, rows },
    depth,
    pitch,
    dense,
    heapCenter,
    heapSize,
    gridDivisions: Math.round((12 * heapSize[0]) / 8),
    stack,
    objects,
    floor,
    shots: {
      overview: { boxes: [stack, floor], pad: withStack },
      stack: { boxes: [stack], pad: withStack },
      bridge: { boxes: [stack, objects], pad: withStack },
      heap: { boxes: [objects], pad: HEAP_ONLY },
      gc: { boxes: [stack, floor], pad: withStack, isoDir: GC_ISO },
    },
    bounds: union([stack, floor], 3),
  };
  cache.set(key, layout);
  return layout;
}

/** The layout that holds everything in `snapshot`. */
export const layoutFor = (snapshot: PlacedSnapshot, minGrid?: HeapGrid): StackHeapLayout =>
  layoutOf(gridOf(snapshot.objects, minGrid), snapshot.frames.length);

// ---- Entity boxes -----------------------------------------------------------------------

/** World box of the frame at `index`. */
export function frameBox(index: number): Box3 {
  const y = frameY(index);
  return [
    [STACK_X - FRAME_SIZE[0] / 2, y - FRAME_SIZE[1] / 2, -FRAME_SIZE[2] / 2],
    [STACK_X + FRAME_SIZE[0] / 2, y + FRAME_SIZE[1] / 2, FRAME_SIZE[2] / 2],
  ];
}

/** World box of a heap entity of `kind` standing in `cell`. */
export function entityBox(kind: HeapKind, cell: Cell, layout: StackHeapLayout): Box3 {
  const [x, , z] = cellPos(cell, layout);
  const [w, h, d] = ENTITY_SIZE[kind];
  return [
    [x - w / 2, 0, z - d / 2],
    [x + w / 2, h, z + d / 2],
  ];
}

// ---- References -------------------------------------------------------------------------

export interface Arc {
  start: V3;
  end: V3;
  mid: V3;
}

/** Point on a footprint's edge facing `toward`, just above height `y`. */
export function faceToward(centre: V3, size: V3, toward: V3, y: number): V3 {
  const [cx, , cz] = centre;
  const dx = toward[0] - cx;
  const dz = toward[2] - cz;
  const s = Math.min(
    dx === 0 ? Infinity : size[0] / 2 / Math.abs(dx),
    dz === 0 ? Infinity : size[2] / 2 / Math.abs(dz)
  );
  // A target straight above or below gives no direction: stay on the centre.
  const k = Number.isFinite(s) ? s : 0;
  return [cx + dx * k, y + 0.02, cz + dz * k];
}

/** Where slot `slotIndex` of `slotCount` leaves the heap-facing side of a frame. */
function frameSlotZ(slotIndex: number, slotCount: number): number {
  // Two lanes at least, so a one- or two-slot frame keeps the story's anchor points.
  const lanes = Math.max(2, slotCount);
  return -FRAME_SIZE[2] / 2 + ((slotIndex + 0.5) * FRAME_SIZE[2]) / lanes;
}

/**
 * The curve for one reference, or `null` when either end is not in the snapshot (a dangling
 * `refId`). The target is a heap entity or a frame; the arc lands on the face turned toward
 * its source, so it never reaches up into the target's label.
 */
export function refArc(
  ref: Reference,
  snapshot: PlacedSnapshot,
  layout: StackHeapLayout = layoutFor(snapshot)
): Arc | null {
  const frameIndex = (id: string) => snapshot.frames.findIndex((f) => f.id === id);
  const heapSide = STACK_X + FRAME_SIZE[0] / 2;

  const targetObject = snapshot.objects.find((o) => o.id === ref.to);
  const targetFrame = targetObject ? -1 : frameIndex(ref.to);
  if (!targetObject && targetFrame < 0) return null;

  if (ref.fromKind === 'frame') {
    const index = frameIndex(ref.fromOwner);
    const frame = snapshot.frames[index];
    if (!frame) return null;
    const slotIdx = frame.slots.findIndex((s) => slotKey(frame.id, s.name) === ref.from);
    const start: V3 = [heapSide, frameY(index), frameSlotZ(slotIdx, frame.slots.length)];

    if (!targetObject) {
      // Frame → frame: a short loop outside the heap-facing side of the stack.
      const end: V3 = [heapSide, frameY(targetFrame) - FRAME_SIZE[1] / 4, 0];
      return {
        start,
        end,
        mid: [heapSide + 1.4, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2],
      };
    }
    const size = ENTITY_SIZE[targetObject.kind];
    const end = faceToward(cellPos(targetObject.cell, layout), size, start, size[1]);
    return { start, end, mid: lifted(start, end, STACK_ARC_LIFT) };
  }

  const source = snapshot.objects.find((o) => o.id === ref.fromOwner);
  if (!source) return null;
  const sourceSize = ENTITY_SIZE[source.kind];
  const sourcePos = cellPos(source.cell, layout);

  if (!targetObject) {
    // Heap → frame: back to the stack, landing low on the frame's heap-facing side so it
    // stays apart from the arcs that leave the frame's slots.
    const end: V3 = [heapSide, frameY(targetFrame) - FRAME_SIZE[1] / 4, 0];
    const start = faceToward(sourcePos, sourceSize, end, sourceSize[1]);
    return { start, end, mid: lifted(start, end, STACK_ARC_LIFT) };
  }

  if (targetObject.id === source.id) {
    // An entity pointing at itself: a small loop over its own top.
    const [x, , z] = sourcePos;
    const top = sourceSize[1] + 0.02;
    return {
      start: [x - sourceSize[0] / 4, top, z],
      end: [x + sourceSize[0] / 4, top, z],
      mid: [x, top + HEAP_ARC_LIFT * 2, z],
    };
  }

  // Heap → heap: a low bridge between the facing top edges, below the object labels.
  const targetSize = ENTITY_SIZE[targetObject.kind];
  const targetPos = cellPos(targetObject.cell, layout);
  const start = faceToward(sourcePos, sourceSize, targetPos, sourceSize[1]);
  const end = faceToward(targetPos, targetSize, sourcePos, targetSize[1]);
  return {
    start,
    end,
    mid: [
      (start[0] + end[0]) / 2,
      Math.max(sourceSize[1], targetSize[1]) + HEAP_ARC_LIFT,
      (start[2] + end[2]) / 2,
    ],
  };
}

const lifted = (start: V3, end: V3, lift: number): V3 => [
  (start[0] + end[0]) / 2,
  Math.max(start[1], end[1]) + lift,
  (start[2] + end[2]) / 2,
];
