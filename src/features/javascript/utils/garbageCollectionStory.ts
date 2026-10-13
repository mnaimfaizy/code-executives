/**
 * Garbage Collection story: one beat model, rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/javascript/garbage-collection.md
 *
 * The heap is built on the first beat; the collector then marks along references, one per beat,
 * and sweeps what it never reached. Every beat is a full snapshot.
 */

import type {
  HeapObject as SharedHeapObject,
  HeapState,
  Placed,
  Reference,
  Slot,
  Snapshot,
  StackFrame,
} from '../../../shared/snapshot';
import { getReferences } from '../../../shared/snapshot';

// The snapshot shape and its reference helpers are shared with Playground traces (ADR 0004).
export type { Reference, Slot, StackFrame } from '../../../shared/snapshot';
export { getReachable, getReferences, slotKey } from '../../../shared/snapshot';

/** The shared stack-and-heap views' shots. This story uses four of them; `heap` is unused. */
export type ShotId = 'overview' | 'stack' | 'bridge' | 'heap' | 'gc';

/** This story holds only plain objects. */
export type HeapObjectKind = 'object';

export type HeapObjectState = HeapState;

/** A story authors every object's cell, so here it is required. */
export type HeapObject = Placed<SharedHeapObject<HeapObjectKind>>;

export type GcPhase = 'mark' | 'sweep';

/** The four objects of the story: two pairs, each a parent and its child. */
export type ObjectId = 'page' | 'page0' | 'draft' | 'draft0';

/** A snapshot plus what the author wrote. */
export interface StoryBeat extends Snapshot<HeapObject> {
  id: string;
  title: string;
  caption: string;
  /** 1-based line in STORY_CODE. */
  line: number;
  shot: ShotId;
  /** Slot keys (`owner.slot`), object ids and frame ids to spotlight on this beat. */
  focus: string[];
  gcPhase?: GcPhase;
}

export const STORY_CODE = `function makePair(name) {
  const parent = { name, child: null };
  const child = { name: name + '.0', parent };
  parent.child = child; // parent and child now reference each other
  return parent;
}

function run() {
  const page = makePair('page');
  let draft = makePair('draft');
  draft = null;
  return page.child.name; // suppose a collection starts here
}

run();`;

const globalFrame: StackFrame = {
  id: 'global',
  name: 'global',
  slots: [
    { name: 'makePair', value: 'ƒ' },
    { name: 'run', value: 'ƒ' },
  ],
};

const runFrame = (draft: Slot): StackFrame => ({
  id: 'run',
  name: 'run()',
  slots: [{ name: 'page', refId: 'page' }, draft],
});

const framesHoldingDraft = [globalFrame, runFrame({ name: 'draft', refId: 'draft' })];
const frames = [globalFrame, runFrame({ name: 'draft', value: 'null' })];

/** A pair: the parent points at its child through `child`, the child points back through `parent`. */
const pair = (
  parent: ObjectId,
  child: ObjectId,
  name: string,
  row: number,
  parentState: HeapObjectState,
  childState: HeapObjectState
): HeapObject[] => [
  {
    id: parent,
    label: 'Object',
    kind: 'object',
    slots: [
      { name: 'name', value: `'${name}'` },
      { name: 'child', refId: child },
    ],
    cell: { col: 0, row },
    state: parentState,
  },
  {
    id: child,
    label: 'Object',
    kind: 'object',
    slots: [
      { name: 'name', value: `'${name}.0'` },
      { name: 'parent', refId: parent },
    ],
    cell: { col: 1, row },
    state: childState,
  },
];

/** The whole heap: all four objects are on every beat, each in its own fixed cell. */
const heap = (
  page: HeapObjectState,
  page0: HeapObjectState,
  draftPair: HeapObjectState
): HeapObject[] => [
  ...pair('page', 'page0', 'page', 0, page, page0),
  ...pair('draft', 'draft0', 'draft', 1, draftPair, draftPair),
];

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'two-pairs',
    title: 'Two pairs, two cycles',
    caption:
      "run has built two pairs with the same function. In each pair the parent points at its child and the child points back at its parent: a cycle. Each pair is held from the stack by one variable in run's frame, page or draft.",
    line: 10,
    shot: 'overview',
    frames: framesHoldingDraft,
    objects: heap('live', 'live', 'live'),
    focus: ['page.child', 'page0.parent', 'draft.child', 'draft0.parent'],
  },
  {
    id: 'draft-dropped',
    title: 'draft = null',
    caption:
      'draft = null removes the only reference from the stack to the draft pair. The two objects have not changed: each still holds a reference to the other, so each still has one reference arriving. Nothing on the heap is freed by this line.',
    line: 11,
    shot: 'bridge',
    frames,
    objects: heap('live', 'live', 'live'),
    focus: ['run.draft', 'draft', 'draft0'],
  },
  {
    id: 'roots',
    title: 'The collector starts at the roots',
    caption:
      'Suppose a collection starts here. The collector does not ask which objects are referenced. It asks which objects the program can still reach, and it starts from the roots: every frame on the stack, the global frame included. No object has a mark yet.',
    line: 12,
    shot: 'stack',
    frames,
    objects: heap('live', 'live', 'live'),
    focus: ['global', 'run'],
    gcPhase: 'mark',
  },
  {
    id: 'mark-from-root',
    title: "Follow a root's reference, mark",
    caption:
      'The collector reads the slots of the roots. draft holds null, so it leads nowhere. page holds a reference: the collector follows it and marks the object it arrives at. A mark means one thing: a path from a root ends here.',
    line: 12,
    shot: 'gc',
    frames,
    objects: heap('marked', 'live', 'live'),
    focus: ['run.page', 'page'],
    gcPhase: 'mark',
  },
  {
    id: 'mark-through-heap',
    title: 'The mark spreads through the heap',
    caption:
      "A marked object's own slots are read next. child holds a reference, so the collector follows it and marks page.0 too. Marks spread from object to object, along references, and only along references.",
    line: 12,
    shot: 'gc',
    frames,
    objects: heap('marked', 'marked', 'live'),
    focus: ['page.child', 'page0'],
    gcPhase: 'mark',
  },
  {
    id: 'already-marked',
    title: 'Back at a marked object',
    caption:
      'page.0 points back at its parent. The collector follows the reference and finds a mark already there, so it stops: an object is marked once and its slots are read once. That is why a cycle cannot keep the collector going round. No reference is left to follow.',
    line: 12,
    shot: 'gc',
    frames,
    objects: heap('marked', 'marked', 'live'),
    focus: ['page0.parent', 'page'],
    gcPhase: 'mark',
  },
  {
    id: 'marking-done',
    title: 'Two objects have no mark',
    caption:
      'Marking is over. The search never arrived at the draft pair, so they have no mark, and their slots were never read. They still point at each other: each has exactly one reference arriving. Will the collector keep them?',
    line: 12,
    shot: 'gc',
    frames,
    objects: heap('marked', 'marked', 'unmarked'),
    focus: ['draft', 'draft0', 'draft.child', 'draft0.parent'],
    gcPhase: 'mark',
  },
  {
    id: 'cycle-swept',
    title: 'The sweep reads marks, not references',
    caption:
      'No. The sweep goes through every object on the heap and reads one thing: its mark. It follows no reference. The page pair is marked and stays. The draft pair is unmarked, so both are reclaimed together. A rule that frees an object only when nothing references it would have kept them forever.',
    line: 12,
    shot: 'gc',
    frames,
    objects: heap('marked', 'marked', 'collected'),
    focus: ['draft', 'draft0'],
    gcPhase: 'sweep',
  },
  {
    id: 'collection-ends',
    title: 'The program carries on',
    caption:
      'The collection is over and run continues: page.child.name still works, because everything the program can reach is still there. The marks are gone until the next collection, and the memory of the draft pair is free. The collector never needed to know the pair was a cycle.',
    line: 12,
    shot: 'overview',
    frames,
    objects: heap('live', 'live', 'collected'),
    focus: ['run.page', 'page', 'page0'],
  },
];

export const isFocused = (beat: StoryBeat, key: string) => beat.focus.includes(key);

/** An edge is spotlighted when its source slot is in focus. */
export const isRefFocused = (beat: StoryBeat, ref: Reference) => beat.focus.includes(ref.from);

/** The state of one object on a beat. `undefined` for an id the beat does not hold. */
export const stateOf = (beat: StoryBeat, id: string): HeapObjectState | undefined =>
  beat.objects.find((object) => object.id === id)?.state;

/** The ids of the objects in one state on a beat, in heap order. */
export const withState = (beat: StoryBeat, state: HeapObjectState): string[] =>
  beat.objects.filter((object) => object.state === state).map((object) => object.id);

/**
 * The references arriving at an entity on a beat. A reference-counting rule would free an object
 * when this is empty; the collector never looks at it.
 */
export const incoming = (beat: StoryBeat, id: string): Reference[] =>
  getReferences(beat).filter((ref) => ref.to === id);
