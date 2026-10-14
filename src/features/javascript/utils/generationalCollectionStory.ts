/**
 * Generational Collection story: one beat model, rendered by both the 2D (SVG) and 3D (R3F) views.
 * Spec: docs/stories/javascript/generational-collection.md
 *
 * The heap has three spaces, one row each: two young semi-spaces and the old generation. A minor
 * collection (scavenge) copies the one live object to the other space and leaves the rest of the
 * from-space to be freed as a whole. A move is always a copy: a new object in a new cell with
 * `copyOf`, while the original stays in its cell as `copied` until its space is freed.
 * Every beat is a full snapshot.
 */

import type {
  HeapObject as SharedHeapObject,
  HeapSpace,
  HeapState,
  Placed,
  Reference,
  Slot,
  Snapshot,
  StackFrame,
} from '../../../shared/snapshot';
import { getReferences } from '../../../shared/snapshot';

// The snapshot shape and its helpers are shared with Playground traces (ADR 0004).
export type { CopyTrail, HeapSpace, Reference, Slot, StackFrame } from '../../../shared/snapshot';
export {
  copiesOf,
  getCopyTrails,
  getReachable,
  getReferences,
  isSpaceFreed,
  objectsInSpace,
  originOf,
  slotKey,
  spaceOf,
} from '../../../shared/snapshot';

/** The shared stack-and-heap views' shots. This story uses four of them; `stack` is unused. */
export type ShotId = 'overview' | 'stack' | 'bridge' | 'heap' | 'gc';

/** This story holds only plain objects. */
export type HeapObjectKind = 'object';

export type HeapObjectState = HeapState;

/** A story authors every object's cell, so here it is required. */
export type HeapObject = Placed<SharedHeapObject<HeapObjectKind>>;

/** The collector at work: every collection in this story is a minor one, a scavenge. */
export type GcPhase = 'scavenge';

export type SpaceId = 'young-a' | 'young-b' | 'old';

/** The seven objects. `cache-b` and `cache-old` are copies; to the program all three are `cache`. */
export type ObjectId = 'cache' | 't1' | 't2' | 'cache-b' | 't3' | 't4' | 'cache-old';

/** A snapshot plus what the author wrote. Every beat carries `spaces`. */
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
  spaces: HeapSpace[];
}

export const STORY_CODE = `const cache = { calls: 0 };

function handle(n) {
  const temp = { n, doubled: n * 2 };
  cache.calls += 1;
  return temp.doubled;
}

function batch() {
  for (let n = 1; n <= 2; n++) {
    handle(n);
  }
}

batch(); // suppose a minor collection runs after this line
batch(); // and another one after this line`;

// ---- Spaces: one heap row each. The two semi-spaces swap roles after the first collection.

const SPACE_LABELS: Record<SpaceId, string> = {
  'young-a': 'YOUNG · SEMI-SPACE A',
  'young-b': 'YOUNG · SEMI-SPACE B',
  old: 'OLD GENERATION',
};

const spaces = (from: 'young-a' | 'young-b'): HeapSpace[] => [
  {
    id: 'young-a',
    label: SPACE_LABELS['young-a'],
    row: 0,
    role: from === 'young-a' ? 'from' : 'to',
  },
  {
    id: 'young-b',
    label: SPACE_LABELS['young-b'],
    row: 1,
    role: from === 'young-b' ? 'from' : 'to',
  },
  { id: 'old', label: SPACE_LABELS.old, row: 2 },
];

const firstSpaces = spaces('young-a');
const swappedSpaces = spaces('young-b');

// ---- Frames

const globalFrame = (cache: ObjectId): StackFrame => ({
  id: 'global',
  name: 'global',
  slots: [
    { name: 'cache', refId: cache },
    { name: 'handle', value: 'ƒ' },
    { name: 'batch', value: 'ƒ' },
  ],
});

const batchFrame: StackFrame = { id: 'batch', name: 'batch()', slots: [{ name: 'n', value: '2' }] };

const handleFrame: StackFrame = {
  id: 'handle',
  name: 'handle(2)',
  slots: [
    { name: 'n', value: '2' },
    { name: 'temp', refId: 't2' },
  ],
};

// ---- Objects: each keeps its id and cell on every beat it is in.

const obj = (
  id: ObjectId,
  col: number,
  row: number,
  slots: Slot[],
  state: HeapObjectState,
  copyOf?: ObjectId
): HeapObject => ({
  id,
  label: 'Object',
  kind: 'object',
  slots,
  state,
  cell: { col, row },
  ...(copyOf ? { copyOf } : {}),
});

const calls = (n: number): Slot[] => [{ name: 'calls', value: String(n) }];
const temp = (n: number): Slot[] => [
  { name: 'n', value: String(n) },
  { name: 'doubled', value: String(n * 2) },
];

/** Semi-space A: `cache` and the first batch's two temps. */
const youngA = (cache: HeapObjectState, temps: HeapObjectState = cache): HeapObject[] => [
  obj('cache', 0, 0, calls(2), cache),
  obj('t1', 1, 0, temp(1), temps),
  obj('t2', 2, 0, temp(2), temps),
];

const cacheB = (n: number, state: HeapObjectState) =>
  obj('cache-b', 0, 1, calls(n), state, 'cache');

/** Semi-space B on beats 7–10: the copy of `cache` and the second batch's two temps. */
const youngB = (cache: HeapObjectState, temps: HeapObjectState = cache): HeapObject[] => [
  cacheB(4, cache),
  obj('t3', 1, 1, temp(1), temps),
  obj('t4', 2, 1, temp(2), temps),
];

const cacheOld = obj('cache-old', 0, 2, calls(4), 'live', 'cache-b');

export const STORY_BEATS: StoryBeat[] = [
  {
    id: 'temps-made',
    title: 'New objects start young',
    caption:
      'Every new object starts in the young generation. handle makes one temp per call and uses it once. handle(2) is running, and its frame holds the second temp. The first one is held by nothing: handle(1) has returned. cache was made at the start, and the global frame holds it.',
    line: 6,
    shot: 'overview',
    frames: [globalFrame('cache'), batchFrame, handleFrame],
    objects: youngA('live'),
    spaces: firstSpaces,
    focus: ['handle.temp', 't2', 't1'],
  },
  {
    id: 'died-young',
    title: 'Most objects die young',
    caption:
      'batch() has returned. Of the three objects in the young generation, two are held by nothing: each lived for one call. Only cache is still reachable, from the global frame. Nothing has been freed: the two temps still take their memory.',
    line: 15,
    shot: 'bridge',
    frames: [globalFrame('cache')],
    objects: youngA('live'),
    spaces: firstSpaces,
    focus: ['global.cache', 'cache', 't1', 't2'],
  },
  {
    id: 'minor-starts',
    title: 'A minor collection starts',
    caption:
      'Suppose the young generation is full and a minor collection starts. It collects the young generation only. Semi-space A, where the objects are, is the from-space; semi-space B, empty, is the to-space. Like every collection, it starts from the roots: here, the global frame.',
    line: 15,
    shot: 'gc',
    frames: [globalFrame('cache')],
    objects: youngA('live'),
    spaces: firstSpaces,
    focus: ['global'],
    gcPhase: 'scavenge',
  },
  {
    id: 'copy-survivor',
    title: 'Reached means copied',
    caption:
      "The collector follows the root's reference and copies the object it reaches into to-space: same slots, same values, a new place. The original stays where it was, tagged copied. There is no separate marking pass: finding a live object and copying it happen together.",
    line: 15,
    shot: 'gc',
    frames: [globalFrame('cache')],
    objects: [...youngA('copied', 'live'), cacheB(2, 'live')],
    spaces: firstSpaces,
    focus: ['global.cache', 'cache', 'cache-b'],
    gcPhase: 'scavenge',
  },
  {
    id: 'reference-moved',
    title: 'The reference follows the copy',
    caption:
      "The global frame's cache now refers to the copy. To the program nothing has happened: cache is the same object, with the same calls. Only where it lives in memory has changed. Nothing refers to the original any more, and the collector has nothing left to follow.",
    line: 15,
    shot: 'bridge',
    frames: [globalFrame('cache-b')],
    objects: [...youngA('copied', 'live'), cacheB(2, 'live')],
    spaces: firstSpaces,
    focus: ['global.cache', 'cache-b'],
    gcPhase: 'scavenge',
  },
  {
    id: 'from-space-freed',
    title: 'The dead were never visited',
    caption:
      'The collection is over, and all of semi-space A is free at once. The collector copied one object. It never visited the two temps and never freed them one by one: they were left behind. A minor collection costs what survives, not what died.',
    line: 15,
    shot: 'heap',
    frames: [globalFrame('cache-b')],
    objects: [...youngA('collected'), cacheB(2, 'live')],
    spaces: firstSpaces,
    focus: ['cache', 't1', 't2'],
    gcPhase: 'scavenge',
  },
  {
    id: 'second-batch',
    title: 'The spaces swap, the program carries on',
    caption:
      'The semi-spaces swap roles: B, which holds cache, is now where new objects go, and A is the empty one. The second batch() makes two more temps beside cache, and both die young again. cache.calls is now 4: the program wrote to the copy.',
    line: 16,
    shot: 'overview',
    frames: [globalFrame('cache-b')],
    objects: [...youngA('collected'), ...youngB('live')],
    spaces: swappedSpaces,
    focus: ['global.cache', 'cache-b.calls', 't3', 't4'],
  },
  {
    id: 'promoted',
    title: 'A survivor is promoted',
    caption:
      "A second minor collection starts. cache has already survived one, so this time it is not copied to the other semi-space but to the old generation. That is promotion. The global frame's reference moves with it, as before. The two new temps are not visited.",
    line: 16,
    shot: 'gc',
    frames: [globalFrame('cache-old')],
    objects: [...youngA('collected'), ...youngB('copied', 'live'), cacheOld],
    spaces: swappedSpaces,
    focus: ['global.cache', 'cache-b', 'cache-old'],
    gcPhase: 'scavenge',
  },
  {
    id: 'young-freed-again',
    title: 'The same cost again',
    caption:
      'Semi-space B is free in one step, as A was. Again the collector copied one object and never looked at the two temps that died. More temps in a batch would have meant more memory freed, not more copying: the work follows the survivors.',
    line: 16,
    shot: 'heap',
    frames: [globalFrame('cache-old')],
    objects: [...youngA('collected'), ...youngB('collected'), cacheOld],
    spaces: swappedSpaces,
    focus: ['cache-b', 't3', 't4'],
    gcPhase: 'scavenge',
  },
  {
    id: 'in-old-generation',
    title: 'Long-lived objects grow old',
    caption:
      'cache now lives in the old generation. Minor collections copy only what is in the young generation, so they no longer move it. The old generation is collected too, less often, by a major collection: mark-and-sweep, the story above. Most objects never get here: they die young.',
    line: 16,
    shot: 'overview',
    frames: [globalFrame('cache-old')],
    objects: [...youngA('collected'), ...youngB('collected'), cacheOld],
    spaces: swappedSpaces,
    focus: ['global.cache', 'cache-old'],
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

/** The references arriving at an entity on a beat. */
export const incoming = (beat: StoryBeat, id: string): Reference[] =>
  getReferences(beat).filter((ref) => ref.to === id);
