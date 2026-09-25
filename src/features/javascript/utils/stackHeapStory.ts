/**
 * Stack & Heap story: one step model, rendered by both the 2D (SVG) and 3D (R3F) views.
 *
 * Every step is a full snapshot, so stepping backwards is free and switching views
 * mid-story keeps the learner on the same beat.
 */

export type ShotId = 'overview' | 'stack' | 'bridge' | 'heap' | 'gc';

/** A slot holds either a primitive `value` or a reference (`refId`) to a heap object. */
export interface Slot {
  name: string;
  value?: string;
  refId?: string;
}

export interface StackFrame {
  id: string;
  name: string;
  slots: Slot[];
}

export type HeapObjectKind = 'object' | 'array';

/** `unmarked` = GC mark phase found no path from a root; `collected` = swept. */
export type HeapObjectState = 'live' | 'marked' | 'unmarked' | 'collected';

export interface HeapObject {
  id: string;
  label: string;
  kind: HeapObjectKind;
  slots: Slot[];
  state: HeapObjectState;
  /** Stable grid position on the heap floor, shared by both views. */
  cell: { col: number; row: number };
}

export type GcPhase = 'mark' | 'sweep';

export interface StoryStep {
  id: string;
  title: string;
  caption: string;
  /** 1-based line in STORY_CODE. */
  line: number;
  shot: ShotId;
  /** Bottom of the stack first. */
  frames: StackFrame[];
  objects: HeapObject[];
  /** Slot keys (`owner.slot`) and object ids to spotlight on this beat. */
  focus: string[];
  gcPhase?: GcPhase;
}

export interface Reference {
  id: string;
  /** Slot key: `${frameId|objectId}.${slotName}` */
  from: string;
  fromOwner: string;
  fromKind: 'frame' | 'object';
  to: string;
}

export const STORY_CODE = `function makeUser(name) {
  const user = { name, friends: [] };
  return user;
}

function main() {
  let ada = makeUser('Ada');
  let bob = makeUser('Bob');
  ada.friends.push(bob);
  bob = null;
  ada = null;
}

main();`;

export const slotKey = (owner: string, slot: string) => `${owner}.${slot}`;

const globalFrame: StackFrame = {
  id: 'global',
  name: 'global',
  slots: [
    { name: 'makeUser', value: 'ƒ' },
    { name: 'main', value: 'ƒ' },
  ],
};

const mainFrame = (ada: Slot, bob: Slot): StackFrame => ({
  id: 'main',
  name: 'main()',
  slots: [ada, bob],
});

const UNINIT = 'uninit';

const obj = (
  id: string,
  label: string,
  kind: HeapObjectKind,
  slots: Slot[],
  cell: HeapObject['cell'],
  state: HeapObjectState = 'live'
): HeapObject => ({ id, label, kind, slots, cell, state });

const ada = (state?: HeapObjectState) =>
  obj(
    'ada',
    'User',
    'object',
    [
      { name: 'name', value: "'Ada'" },
      { name: 'friends', refId: 'adaFriends' },
    ],
    { col: 0, row: 0 },
    state
  );
const adaFriends = (withBob: boolean, state?: HeapObjectState) =>
  obj(
    'adaFriends',
    'Array',
    'array',
    withBob ? [{ name: '0', refId: 'bob' }] : [],
    { col: 1, row: 0 },
    state
  );
const bob = (state?: HeapObjectState) =>
  obj(
    'bob',
    'User',
    'object',
    [
      { name: 'name', value: "'Bob'" },
      { name: 'friends', refId: 'bobFriends' },
    ],
    { col: 0, row: 1 },
    state
  );
const bobFriends = (state?: HeapObjectState) =>
  obj('bobFriends', 'Array', 'array', [], { col: 1, row: 1 }, state);

const allObjects = (state: HeapObjectState) => [
  ada(state),
  adaFriends(true, state),
  bob(state),
  bobFriends(state),
];

export const STORY_STEPS: StoryStep[] = [
  {
    id: 'start',
    title: 'The program starts',
    caption:
      'The engine creates the global frame at the bottom of the call stack. The heap is empty — nothing has been allocated yet.',
    line: 14,
    shot: 'overview',
    frames: [globalFrame],
    objects: [],
    focus: ['global'],
  },
  {
    id: 'call-main',
    title: 'main() is called',
    caption:
      'Calling a function pushes a new frame on top of the stack. It reserves slots for its local variables, ada and bob, which are not initialized yet.',
    line: 14,
    shot: 'stack',
    frames: [
      globalFrame,
      mainFrame({ name: 'ada', value: UNINIT }, { name: 'bob', value: UNINIT }),
    ],
    objects: [],
    focus: ['main'],
  },
  {
    id: 'alloc-ada',
    title: "makeUser('Ada') allocates on the heap",
    caption:
      "A makeUser frame is pushed. The primitive 'Ada' sits right in its slot, but the object literal — and the friends array inside it — are allocated on the heap. The local variable user only holds a reference.",
    line: 2,
    shot: 'bridge',
    frames: [
      globalFrame,
      mainFrame({ name: 'ada', value: UNINIT }, { name: 'bob', value: UNINIT }),
      {
        id: 'makeUser',
        name: "makeUser('Ada')",
        slots: [
          { name: 'name', value: "'Ada'" },
          { name: 'user', refId: 'ada' },
        ],
      },
    ],
    objects: [ada(), adaFriends(false)],
    focus: ['makeUser.user', 'ada', 'adaFriends'],
  },
  {
    id: 'return-ada',
    title: 'The frame dies, the object lives',
    caption:
      "makeUser returns and its frame is popped — its locals are gone. The User object survives, because the reference was handed back and stored in main's ada.",
    line: 7,
    shot: 'bridge',
    frames: [globalFrame, mainFrame({ name: 'ada', refId: 'ada' }, { name: 'bob', value: UNINIT })],
    objects: [ada(), adaFriends(false)],
    focus: ['main.ada', 'ada'],
  },
  {
    id: 'alloc-bob',
    title: "makeUser('Bob') does it again",
    caption:
      'The same push → allocate → pop happens for Bob. Now main holds two references into the heap, one per variable.',
    line: 8,
    shot: 'overview',
    frames: [globalFrame, mainFrame({ name: 'ada', refId: 'ada' }, { name: 'bob', refId: 'bob' })],
    objects: [ada(), adaFriends(false), bob(), bobFriends()],
    focus: ['main.bob', 'bob', 'bobFriends'],
  },
  {
    id: 'push',
    title: 'A reference inside the heap',
    caption:
      "ada.friends.push(bob) stores a reference to Bob inside Ada's friends array. References don't only come from the stack — heap objects can point at each other.",
    line: 9,
    shot: 'heap',
    frames: [globalFrame, mainFrame({ name: 'ada', refId: 'ada' }, { name: 'bob', refId: 'bob' })],
    objects: [ada(), adaFriends(true), bob(), bobFriends()],
    focus: ['adaFriends.0', 'adaFriends', 'bob'],
  },
  {
    id: 'bob-null',
    title: 'bob = null — but Bob survives',
    caption:
      'The stack no longer points at Bob directly. He is still reachable, though: main.ada → Ada → friends → Bob. As long as any path from a root exists, the object stays alive.',
    line: 10,
    shot: 'bridge',
    frames: [globalFrame, mainFrame({ name: 'ada', refId: 'ada' }, { name: 'bob', value: 'null' })],
    objects: [ada(), adaFriends(true), bob(), bobFriends()],
    focus: ['main.ada', 'ada', 'ada.friends', 'adaFriends', 'adaFriends.0', 'bob'],
  },
  {
    id: 'ada-null',
    title: 'ada = null — the last path is cut',
    caption:
      'Now nothing on the stack leads into the heap. The four objects still point at each other, but no path starts from a root any more.',
    line: 11,
    shot: 'overview',
    frames: [
      globalFrame,
      mainFrame({ name: 'ada', value: 'null' }, { name: 'bob', value: 'null' }),
    ],
    objects: allObjects('live'),
    focus: ['main.ada', 'main.bob'],
  },
  {
    id: 'gc-mark',
    title: 'GC mark: trace from the roots',
    caption:
      'The garbage collector starts from the roots — the global frame and every frame on the stack — and follows references, marking what it reaches. Here it reaches nothing: every object stays unmarked.',
    line: 11,
    shot: 'gc',
    frames: [
      globalFrame,
      mainFrame({ name: 'ada', value: 'null' }, { name: 'bob', value: 'null' }),
    ],
    objects: allObjects('unmarked'),
    focus: ['global', 'main'],
    gcPhase: 'mark',
  },
  {
    id: 'gc-sweep',
    title: 'GC sweep: unreachable memory is reclaimed',
    caption:
      'Everything left unmarked is swept and its memory reclaimed — even though Ada still points at Bob. Reachability from the roots is what matters, not whether an object is referenced at all.',
    line: 11,
    shot: 'gc',
    frames: [
      globalFrame,
      mainFrame({ name: 'ada', value: 'null' }, { name: 'bob', value: 'null' }),
    ],
    objects: allObjects('collected'),
    focus: [],
    gcPhase: 'sweep',
  },
];

/** Every reference edge in a step, from stack slots and from heap object slots. */
export function getReferences(step: StoryStep): Reference[] {
  const refs: Reference[] = [];
  for (const frame of step.frames) {
    for (const slot of frame.slots) {
      if (slot.refId) {
        const from = slotKey(frame.id, slot.name);
        refs.push({ id: from, from, fromOwner: frame.id, fromKind: 'frame', to: slot.refId });
      }
    }
  }
  for (const object of step.objects) {
    if (object.state === 'collected') continue;
    for (const slot of object.slots) {
      if (slot.refId) {
        const from = slotKey(object.id, slot.name);
        refs.push({ id: from, from, fromOwner: object.id, fromKind: 'object', to: slot.refId });
      }
    }
  }
  return refs;
}

/** Object ids reachable from the roots (every stack frame), following references. */
export function getReachable(step: StoryStep): Set<string> {
  const refs = getReferences(step);
  const reached = new Set<string>();
  const queue = refs.filter((r) => r.fromKind === 'frame').map((r) => r.to);
  while (queue.length) {
    const id = queue.shift()!;
    if (reached.has(id)) continue;
    reached.add(id);
    for (const r of refs) if (r.fromOwner === id) queue.push(r.to);
  }
  return reached;
}

export const isFocused = (step: StoryStep, key: string) => step.focus.includes(key);

/** An edge is spotlighted when its source slot is in focus. */
export const isRefFocused = (step: StoryStep, ref: Reference) => step.focus.includes(ref.from);
