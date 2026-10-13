import {
  gridOf,
  slotKey,
  type HeapGrid,
  type HeapObject,
  type Placed,
  type Reference,
} from '../../../snapshot';
import {
  FRAME_HEADER,
  STACK_PAD_BOTTOM,
  STACK_PAD_TOP,
  boxHeight,
  slotY,
  stackBoxes,
  stackHeight as heightOfStack,
  type Box,
} from './stackGeometry';
import type { PlacedSnapshot } from './types';

/*
 * Geometry of the 2D stack-and-heap drawing: where every frame and heap object stands, and the
 * path of every reference arrow. Pure data, so it is tested without a DOM.
 *
 * A 2×2 heap with a short stack is the 800×480 drawing of the Stack ↔ Heap story; more columns
 * widen the viewBox, more rows, taller objects or more frames make it taller.
 */
export const HEAP_X = 310;
export const CELL_X0 = 340;
export const CELL_DX = 230;
export const CELL_Y0 = 78;
/** The least a heap row takes; a row holding a taller object grows to fit it. */
export const CELL_DY = 190;
/** Clear space kept under the tallest object of a row. */
export const ROW_CLEARANCE = 40;
export const OBJ_W = 180;

/** What the heap needs around its rows: 78 above the first, 22 under the last. */
const HEAP_PAD_Y = 100;

/*
 * Lanes. Between two columns of cells there is a gutter with no object in it, and above every
 * row a band of at least `ROW_CLEARANCE`. On a floor larger than the story's, an arrow whose
 * ends are not neighbours runs along these, so it never passes behind an object.
 */
/** How far from an object's side edge an arrow runs in the gutter beside it. */
const GUTTER = 20;
/** How far above a row's top edge an arrow runs in the band above it. */
const BAND = 20;
/** Arrows that share a gutter or a band are spread over lanes this far apart. */
const LANE_STEP = 4;
const CORNER = 8;
/**
 * The way back in a mutual pair of row neighbours arcs over the gutter between them: it leaves
 * and lands this far in from the facing edges, and its control points stand this far above the
 * row (the curve peaks at three quarters of it, inside the clear band above every row).
 */
const RETURN_INSET = 40;
const RETURN_RISE = 36;

type PlacedObject = Placed<HeapObject>;

export interface StackHeapLayout2D {
  width: number;
  height: number;
  frames: Map<string, Box>;
  objects: Map<string, Box>;
  /** Top edge of each heap row. */
  rowY: number[];
  /**
   * A floor larger than the Stack ↔ Heap story's 2×2: arrows between entities that are not
   * neighbours are routed along the gutters instead of drawn as one curve.
   */
  dense: boolean;
}

/** The one place positions are decided, so an entity keeps its place from snapshot to snapshot. */
export function layout2D(snapshot: PlacedSnapshot, minGrid?: HeapGrid): StackHeapLayout2D {
  const grid = gridOf(snapshot.objects, minGrid);

  const rowPitch = Array.from({ length: grid.rows }, () => CELL_DY);
  for (const o of snapshot.objects) {
    rowPitch[o.cell.row] = Math.max(rowPitch[o.cell.row], boxHeight(o.slots) + ROW_CLEARANCE);
  }
  const rowY: number[] = [];
  let nextRowY = CELL_Y0;
  for (const pitch of rowPitch) {
    rowY.push(nextRowY);
    nextRowY += pitch;
  }

  const stackHeight = heightOfStack(snapshot.frames);
  const width = CELL_X0 + grid.cols * CELL_DX;
  const height = Math.max(
    HEAP_PAD_Y + rowPitch.reduce((sum, pitch) => sum + pitch, 0),
    STACK_PAD_TOP + stackHeight + STACK_PAD_BOTTOM
  );

  const frames = stackBoxes(snapshot.frames, height);

  const objects = new Map<string, Box>();
  for (const o of snapshot.objects) {
    objects.set(o.id, {
      x: CELL_X0 + o.cell.col * CELL_DX,
      y: rowY[o.cell.row],
      w: OBJ_W,
      h: boxHeight(o.slots),
    });
  }

  return { width, height, frames, objects, rowY, dense: grid.cols > 2 || grid.rows > 2 };
}

type Point = readonly [number, number];

/** A path through `points` with straight runs and rounded corners. */
function lanes(points: Point[]): string {
  // Drop a point that repeats the one before it, so no corner is made of a zero-length run
  const path = points.filter(
    (p, i) => i === 0 || p[0] !== points[i - 1][0] || p[1] !== points[i - 1][1]
  );
  let d = `M ${path[0][0]} ${path[0][1]}`;
  for (let i = 1; i < path.length - 1; i++) {
    const [px, py] = path[i - 1];
    const [x, y] = path[i];
    const [nx, ny] = path[i + 1];
    const before = Math.hypot(x - px, y - py);
    const after = Math.hypot(nx - x, ny - y);
    const r = Math.min(CORNER, before / 2, after / 2);
    const ax = x - ((x - px) / before) * r;
    const ay = y - ((y - py) / before) * r;
    const bx = x + ((nx - x) / after) * r;
    const by = y + ((ny - y) / after) * r;
    d += ` L ${ax} ${ay} Q ${x} ${y}, ${bx} ${by}`;
  }
  const [ex, ey] = path[path.length - 1];
  return `${d} L ${ex} ${ey}`;
}

/** The lane an arrow takes among those sharing a gutter or band: 0, ±1 or ±2 steps off centre. */
const laneOf = (n: number) => ((((n % 5) + 5) % 5) - 2) * LANE_STEP;

/** The arrow for a reference, or null when its source or its target is not in the drawing. */
export function refPath(
  ref: Reference,
  snapshot: PlacedSnapshot,
  at: StackHeapLayout2D
): string | null {
  const fromFrame = ref.fromKind === 'frame';
  const frameIndex = fromFrame ? snapshot.frames.findIndex((f) => f.id === ref.fromOwner) : -1;
  const owner = fromFrame
    ? snapshot.frames[frameIndex]
    : snapshot.objects.find((o) => o.id === ref.fromOwner);
  const ownerBox = fromFrame ? at.frames.get(ref.fromOwner) : at.objects.get(ref.fromOwner);
  if (!owner || !ownerBox) return null;

  const idx = owner.slots.findIndex((s) => slotKey(owner.id, s.name) === ref.from);
  if (idx < 0) return null;
  const sy = slotY(ownerBox, idx);
  const right = ownerBox.x + ownerBox.w;

  const targetObj = snapshot.objects.find((o) => o.id === ref.to);
  const target = targetObj ? at.objects.get(ref.to) : undefined;
  /** The band above heap row `row`, on this arrow's lane. */
  const bandAbove = (row: number, lane: number) => at.rowY[row] - BAND + lane;
  /** The gutter left of the first column: where arrows cross between the stack and the heap. */
  const stackGutter = (lane: number) => CELL_X0 - GUTTER + lane;

  if (!targetObj || !target) {
    // Not a heap object: a frame whose scope is still on the stack, or nothing at all.
    const frame = at.frames.get(ref.to);
    if (!frame) return null;
    const fx = frame.x + frame.w;
    const fy = frame.y + FRAME_HEADER / 2;
    if (fromFrame) {
      // Frame to frame: a bracket in the gutter between the stack and the heap.
      return `M ${right} ${sy} C ${right + 50} ${sy}, ${fx + 50} ${fy}, ${fx} ${fy}`;
    }
    const src = owner as PlacedObject;
    if (at.dense && src.cell.col > 0) {
      // Back to the stack around the objects in between: out of the left edge, along the
      // band above its own row, down the stack's gutter.
      const lane = laneOf(src.cell.col + 2 * src.cell.row + idx);
      const gx = ownerBox.x - GUTTER + lane;
      const by = bandAbove(src.cell.row, lane);
      const sx = stackGutter(lane);
      return lanes([
        [ownerBox.x, sy],
        [gx, sy],
        [gx, by],
        [sx, by],
        [sx, fy],
        [fx, fy],
      ]);
    }
    // Heap back to the stack: leave from the left edge.
    const dx = Math.max(40, (ownerBox.x - fx) / 2);
    return `M ${ownerBox.x} ${sy} C ${ownerBox.x - dx} ${sy}, ${fx + dx} ${fy}, ${fx} ${fy}`;
  }

  const ty = target.y + FRAME_HEADER / 2;

  if (fromFrame) {
    if (at.dense && targetObj.cell.col > 0) {
      // Past the first column: along the stack's gutter to the band above the target's row,
      // then down the gutter left of the target and in at its heading.
      const lane = laneOf(frameIndex * 3 + idx);
      const sx = stackGutter(lane);
      const by = bandAbove(targetObj.cell.row, lane);
      const gx = target.x - GUTTER + lane;
      return lanes([
        [right, sy],
        [sx, sy],
        [sx, by],
        [gx, by],
        [gx, ty],
        [target.x, ty],
      ]);
    }
  } else {
    const src = owner as PlacedObject;
    const dCol = targetObj.cell.col - src.cell.col;
    const dRow = targetObj.cell.row - src.cell.row;
    const sx = ownerBox.x + ownerBox.w / 2;
    const tx = target.x + target.w / 2;
    if (src.id === targetObj.id) {
      // An object that points at itself: a loop off its right edge.
      return `M ${right} ${sy} C ${right + 46} ${sy}, ${right + 46} ${ty}, ${right} ${ty}`;
    }
    const neighbours =
      dCol === 1 || (dCol === 0 && Math.abs(dRow) === 1) || (dCol === -1 && dRow === 0);
    if (at.dense && !neighbours) {
      // Out of the slot into the gutter on the object's right, and along gutters and bands
      // to the target's heading: its left edge when the target is further right, its right
      // edge otherwise.
      const lane = laneOf(src.cell.col + 2 * src.cell.row + idx);
      const gs = right + GUTTER + lane;
      const fromLeft = dCol > 0;
      const edge = fromLeft ? target.x : target.x + target.w;
      const gt = fromLeft ? target.x - GUTTER + lane : edge + GUTTER + lane;
      if (dCol === 0) {
        // The same column: the gutter beside it leads straight there
        return lanes([
          [right, sy],
          [gs, sy],
          [gs, ty],
          [edge, ty],
        ]);
      }
      // The band between the two rows nearest the source; for one row, the band above it
      const by = bandAbove(dRow > 0 ? src.cell.row + 1 : src.cell.row, lane);
      return lanes([
        [right, sy],
        [gs, sy],
        [gs, by],
        [gt, by],
        [gt, ty],
        [edge, ty],
      ]);
    }
    if (dCol <= 0 && dRow > 0) {
      // Down-left: leave from the bottom, enter from the top.
      const sby = ownerBox.y + ownerBox.h;
      return `M ${sx} ${sby} C ${sx} ${sby + 50}, ${tx} ${target.y - 50}, ${tx} ${target.y}`;
    }
    if (dCol <= 0 && dRow < 0) {
      // Up-left: leave from the top, enter from the bottom.
      const tby = target.y + target.h;
      return `M ${sx} ${ownerBox.y} C ${sx} ${ownerBox.y - 50}, ${tx} ${tby + 50}, ${tx} ${tby}`;
    }
    if (dCol === -1 && dRow === 0 && targetObj.slots.some((s) => s.refId === src.id)) {
      // The way back in a mutual pair. Drawn like any other arrow to the left it would cross
      // the way out as an X in the gutter, each hiding the other's head; so it goes over the
      // top: out of this object's top edge, into the target's. Decided by the slots and not
      // by the objects' state, so the arrow keeps its path from beat to beat.
      const x0 = ownerBox.x + RETURN_INSET;
      const x1 = target.x + target.w - RETURN_INSET;
      return `M ${x0} ${ownerBox.y} C ${x0} ${ownerBox.y - RETURN_RISE}, ${x1} ${target.y - RETURN_RISE}, ${x1} ${target.y}`;
    }
    if (dCol < 0) {
      // Straight left along a row: leave from the left edge, enter the right edge.
      const tRight = target.x + target.w;
      const dx = Math.max(40, (ownerBox.x - tRight) / 2);
      return `M ${ownerBox.x} ${sy} C ${ownerBox.x - dx} ${sy}, ${tRight + dx} ${ty}, ${tRight} ${ty}`;
    }
  }
  const tx = target.x;
  const dx = Math.max(40, (tx - right) / 2);
  return `M ${right} ${sy} C ${right + dx} ${sy}, ${tx - dx} ${ty}, ${tx} ${ty}`;
}
