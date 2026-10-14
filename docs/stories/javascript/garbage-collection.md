# Garbage Collection: What Does the Collector Free?

- Module / section: javascript › Garbage Collection
- Question: How does the collector decide which objects to free, and why can two objects that reference each other not keep each other alive?
- Sources: `docs/RESEARCH/JavaScript Execution Flow Report.md` › 6.1 (the collector periodically reclaims memory of objects "no longer in use or accessible by the program"), 6.3 (Marking: "traversing the object graph starting from the program's roots (global variables, etc.)", reachable objects are marked; Sweeping: the collector "scans the entire heap and removes all unmarked objects"). 6.2 and the rest of 6.3 (generations, the Scavenger, compacting) are read and deliberately not shown; see "Generations: a later story". Quiz ids it supports: javascript-q15 (an object that is still strongly reachable is live), q22 (what a value can still be reached from decides its lifetime), q24 (objects that stay reachable are what a leak is). No quiz question targets a cycle; see Decisions 7.
- Status: approved (2026-10-13)

When this spec was written the report gave the two phases and the word "roots", and nothing on cycles or on reference counting. With approval, two paragraphs were added at the end of its 6.3 (frames as roots, one visit per object, unreachable cycles, reference counting, marks lasting one collection; source: MDN, "Memory management"). "Claim sources" points at them; what is still unbacked is listed under UNSOURCED.

## How this differs from the Stack ↔ Heap story

`stackHeapStory.ts` follows a program for eight beats (frames pushed and popped, allocation, a heap-to-heap reference) and ends with one mark beat in which the collector **reaches nothing** and one sweep beat. It answers "who keeps an object alive?".

This story starts where that one stops looking. The heap is already built on beat 1, the program takes two beats, and seven beats belong to the collector. Marking has something to mark here, so it can be shown as what it is: a search that spreads along references, one reference per beat. Nothing is allocated on screen and no frame is pushed or popped.

## Code

```js
function makePair(name) {
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

run();
```

15 lines, runnable. `run()` returns `'page.0'`.

Why this program:

- **Two pairs of the same shape.** Both are built by one function, so both are the same two-object cycle. The only difference between them at line 12 is one slot in `run`'s frame. Whatever the collector does differently to them cannot be explained by the objects themselves.
- **The survivors are a cycle too.** Marking has to go round it (root → parent → child → back to the parent), which shows why a mark is needed at all, before the unreachable cycle shows what the mark decides.
- **Four objects, a 2×2 heap.** That is exactly the floor the shared views were built for (`MIN_HEAP_GRID`), far under the 3D limit of 9, and no frame has more than two slots, so every label keeps the layout the Stack ↔ Heap story already proved.
- **`draft` is set to `null`, not left to go out of scope.** The slot stays on screen saying `null`, next to `page` and its arrow.
- **Line 12 uses `page` after the collection**, so the last beat can show the program carrying on with what was kept.

## Regions and shots

Two regions, the snapshot contract's (`src/shared/snapshot/types.ts`). No queue region is recorded. `roots` is absent on every beat: the only roots in this story are its frames.

- **stack** (`frames`), bottom first: `global` (slots `makePair: ƒ`, `run: ƒ`) and `run` (name `run()`, slots `page`, `draft`). Both are on every beat.
- **heap** (`objects`): four objects, on every beat, each in one fixed cell.

| id | label | kind | slots | cell |
|---|---|---|---|---|
| `page` | Object | object | `name: 'page'`, `child → page0` | col 0, row 0 |
| `page0` | Object | object | `name: 'page.0'`, `parent → page` | col 1, row 0 |
| `draft` | Object | object | `name: 'draft'`, `child → draft0` | col 0, row 1 |
| `draft0` | Object | object | `name: 'draft.0'`, `parent → draft` | col 1, row 1 |

Ids are short on purpose: in the 2D view the label, `#id` and the state tag share one 180 px line, and `Object #draft0` leaves room for `RECLAIMED`.

Shots are the shared views' own (`StackHeapShot`); no new shot is needed. Four of the five are used.

| Shot | Must keep in frame |
|---|---|
| overview | the stack (both frames) and the whole heap floor, all four objects and every reference |
| stack | the stack: both frames with their ROOT tags and slots |
| bridge | the stack, the objects, and the references between `run`'s slots and the heap |
| gc | the stack and the whole heap floor from the higher angle, with room for a state tag on every object label; used on every beat where an object carries a tag |

In 2D both regions always fit, so a shot only decides what is emphasised.

How the collector's work is drawn, all literal:

- **Root**: a frame, tagged `ROOT`, while `gcPhase` is `mark` (the views do this today).
- **Mark**: the object's `state` is `marked`, drawn as a `MARKED` tag on the object (new, see "What the views need").
- **The reference being followed**: the beat's `focus` holds its slot key and its target. The views already draw a focused reference as a thick focus-coloured arrow (3D: with moving dashes). No frontier entity is added.
- **No mark after marking**: `state: 'unmarked'`, the existing `UNMARKED` tag in the `unreachable` role.
- **Freed**: `state: 'collected'`, the existing faint dashed outline tagged `RECLAIMED`. The object stays in the snapshot in its cell, so the freed cell is visible and stepping back restores it.

During marking, an object the search has not reached yet stays `live` (plain, no tag). `unmarked` is set only on the beat where marking ends, because that state is a conclusion ("the mark phase found no path from a root", `types.ts`) and the views draw it in the `unreachable` role. Setting it earlier would colour `page` as unreachable one beat before it is marked.

## Beats

Each beat is a full snapshot. Frames on every beat: `global` and `run()`. "→" is a reference. States not named are unchanged from the beat before.

| # | id | Line | Shot | Focus | gcPhase | Snapshot (what changed, in words) | Title | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|---|
| 1 | two-pairs | 10 | overview | `page.child`, `page0.parent`, `draft.child`, `draft0.parent` | none | `run.page → page`, `run.draft → draft`. All four objects `live`. Six references: two from the frame, four on the heap. | Two pairs, two cycles | `run` has built two pairs with the same function. In each pair the parent points at its child and the child points back at its parent: a cycle. Each pair is held from the stack by one variable in `run`'s frame, `page` or `draft`. |
| 2 | draft-dropped | 11 | bridge | `run.draft`, `draft`, `draft0` | none | `run.draft` becomes the value `null`; its reference is gone. All four objects still `live`; `draft ⇄ draft0` unchanged. | `draft = null` | `draft = null` removes the only reference from the stack to the draft pair. The two objects have not changed: each still holds a reference to the other, so each still has one reference arriving. Nothing on the heap is freed by this line. |
| 3 | roots | 12 | stack | `global`, `run` | mark | Nothing changes in the data except `gcPhase`. Both frames are drawn as roots. No object is marked. | The collector starts at the roots | Suppose a collection starts here. The collector does not ask which objects are referenced. It asks which objects the program can still reach, and it starts from the roots: every frame on the stack, the global frame included. No object has a mark yet. |
| 4 | mark-from-root | 12 | gc | `run.page`, `page` | mark | `page`: `live` → `marked`. | Follow a root's reference, mark | The collector reads the slots of the roots. `draft` holds `null`, so it leads nowhere. `page` holds a reference: the collector follows it and marks the object it arrives at. A mark means one thing: a path from a root ends here. |
| 5 | mark-through-heap | 12 | gc | `page.child`, `page0` | mark | `page0`: `live` → `marked`. | The mark spreads through the heap | A marked object's own slots are read next. `child` holds a reference, so the collector follows it and marks `page.0` too. Marks spread from object to object, along references, and only along references. |
| 6 | already-marked | 12 | gc | `page0.parent`, `page` | mark | No state changes. Only the focus moves, to the reference that leads back. | Back at a marked object | `page.0` points back at its parent. The collector follows the reference and finds a mark already there, so it stops: an object is marked once and its slots are read once. That is why a cycle cannot keep the collector going round. No reference is left to follow. |
| 7 | marking-done | 12 | gc | `draft`, `draft0`, `draft.child`, `draft0.parent` | mark | `draft` and `draft0`: `live` → `unmarked`. Their two references are still there. | Two objects have no mark | Marking is over. The search never arrived at the draft pair, so they have no mark, and their slots were never read. They still point at each other: each has exactly one reference arriving. Will the collector keep them? |
| 8 | cycle-swept | 12 | gc | `draft`, `draft0` | sweep | `draft` and `draft0`: `unmarked` → `collected`. Their slots no longer count as references (`getReferences` skips a collected object). `page`, `page0` stay `marked`. | The sweep reads marks, not references | No. The sweep goes through every object on the heap and reads one thing: its mark. It follows no reference. The page pair is marked and stays. The draft pair is unmarked, so both are reclaimed together. A rule that frees an object only when nothing references it would have kept them forever. |
| 9 | collection-ends | 12 | overview | `run.page`, `page`, `page0` | none | `page`, `page0`: `marked` → `live`. `draft`, `draft0` stay `collected`. Frames are no longer drawn as roots. | The program carries on | The collection is over and `run` continues: `page.child.name` still works, because everything the program can reach is still there. The marks are gone until the next collection, and the memory of the draft pair is free. The collector never needed to know the pair was a cycle. |

9 beats.

Aha beat: **#8 `cycle-swept`**. It breaks "an object is freed when nothing references it any more", and its other face, "objects that reference each other keep each other alive". On beat 7 each draft object has a reference arriving and the learner is asked to predict; on beat 8 both are reclaimed.

Beat 6 is a mechanism beat, not an aha: it gets a test, but it is not presented as a surprise.

## Key claim the beat model's test must prove

**The sweep reclaims exactly the objects that no path from a root reaches, and when it reclaims the draft pair, each of the two still has a reference pointing at it.**

Proved from the data through helpers, not by restating captions. From `src/shared/snapshot`: `getReferences`, `getReachable`. Story helpers: `stateOf(beat, id)`, `withState(beat, state)` (the ids in that state) and `incoming(beat, id)` (the references in `getReferences(beat)` whose `to` is `id`).

1. **Referenced, unreachable, reclaimed (the aha).** On beat 7, for `draft` and for `draft0`: `incoming` has exactly one reference, and it comes from the other of the two; the id is not in `getReachable(beat7)`. On beat 8 both are `collected`. A rule that waits for `incoming` to be empty would never fire for either.
2. **Same shape, different fate.** On beat 7 the references inside the page pair and inside the draft pair are the same (`child` one way, `parent` back), so `incoming` from heap objects is 1 for all four. The only reference that differs is `run.page`. With that one reference left out of the snapshot, `getReachable` is empty.
3. **Marking equals reachability.** On beat 7, `withState(marked)` equals `getReachable(beat7)` and `withState(unmarked)` is every other object; both sets are non-empty. On every beat, every `marked` object is in `getReachable` (a mark is never wrong).
4. **A mark is earned along a reference.** On each beat where an object turns `marked` (4 and 5), the focus holds a slot key whose reference targets that object, and that slot's owner is a frame or an object already `marked` on the beat before.
5. **A cycle does not trap the marking.** Beat 6 has the same object states as beat 5, and its focused reference targets an object that is already `marked`.
6. **The sweep follows the marks.** `withState(beat8, collected)` equals `withState(beat7, unmarked)`; no object that was `marked` on beat 7 is `collected` on beat 8.
7. **Nothing the program uses is lost.** On beat 9, `page` and `page0` are `live` and reachable, and no reference from a frame or from an object that is not `collected` targets a `collected` object.
8. **States only move forward.** Per object, across the beats: `live → marked → live`, or `live → unmarked → collected`. A `collected` object never returns.

Besides this, the usual model checks: 9 beats, unique ids, `line` within the code, every reference target exists, every focus key exists, no two objects share a cell, every object keeps its id and cell on every beat.

## Generations: a later story

**Decision: generations (young and old space, a minor collection, promotion) are not in this story.** They should be the next one.

1. **It is a second question.** This story answers "what is freed?". Generations answer "why is collecting cheap, and how often does it happen?". The report keeps them apart too: 6.2 is the hypothesis and the two generations, 6.3 the algorithms. One story, one question.
2. **It is a second algorithm.** The report's young generation is not marked and swept: a Scavenger "copies all live objects from a 'from-space' to a new, empty 'to-space'". Showing a minor collection means showing objects that move, and showing promotion means objects that move between spaces. The beat model's rule is the opposite: an entity keeps its cell.
3. **The views cannot draw it.** The shared views have one heap region. Young and old space, or from-space and to-space, are two or three regions that neither view has, with their own layout and shots. That is a cost of a different size from the list below.
4. **It would bury the aha.** A minor collection also frees the draft pair, so the learner would see the cycle disappear for two different reasons in one story.
5. **It would want its own aha**, for example "a collection costs what survives, not what dies", which the report supports ("most objects die young", "implicitly garbage").

One consequence has to be said plainly. In the report, mark-and-sweep is the **old generation's** algorithm, and these four objects are new. So the story says "a collection" and "the collector", never "V8 does this to these objects now". What it shows, reachability from the roots deciding what is live, holds for both collectors (the Scavenger copies "live objects"). Decision 3: one line of prose under the story says so.

## Deliberately left out

- Generations: young and old space, the Scavenger, from-space and to-space, minor and major collections, promotion (report 6.2, 6.3).
- Compacting (report 6.3, phase 3). Objects would move, and cells are fixed.
- When a collection starts and what triggers it. The story says "suppose a collection starts here".
- Pauses, and incremental, concurrent or parallel collection. The story holds the program still while it marks; it does not say the engine does.
- How marks are stored, the order in which a real collector visits objects, and its work list.
- Function objects. `makePair` and `run` are drawn as the value `ƒ` in the global frame, as in the Stack ↔ Heap story. In an engine they are heap objects, reachable from the global scope and marked like any other.
- Roots other than frames: callbacks waiting in a queue, the global scope after the script ends (`Snapshot.roots`), closures and retained scopes.
- Weak references (`WeakMap`, `WeakRef`), memory leaks and how to find them (other sections; quiz q05, q13, q14, q28).
- What the freed memory is used for next.
- Any history of reference counting in engines.
- Allocation, frames being pushed and popped, references being stored: the Stack ↔ Heap story.

## What the views need that they do not draw today

Read: `StackHeapView2D.tsx`, `StackFrames2D.tsx`, `heapGeometry.ts`, `StackHeapView3D.tsx`, `viz3d/stackheap/layout.ts`, `viz/palette.ts`.

Already there, nothing to add: `ROOT` on every frame while `gcPhase` is `mark`; a focused reference drawn thick in the focus colour; `unmarked` in the `unreachable` role with an `UNMARKED` tag; `collected` as a faint dashed outline tagged `RECLAIMED` (3D: a flattened, faded block); a 2×2 floor; all four shots. The snapshot type needs **no** change: `HeapState` already has `marked`, and no field is added.

Additions, smallest first:

1. **Draw `marked` (2D and 3D).** Today a `marked` object is drawn exactly like a `live` one: both views test only for `unmarked` and `collected`. Needed: a `MARKED` tag where `UNMARKED` goes, plus one cue that is not colour (2D: a heavier outline; 3D: the badge in the label and the label's border). Recommended without a new hue: the object keeps its own role colour, because a marked object is a live object, and the tag uses an existing text colour. This is the only addition the story cannot be told without.
2. **3D: two opposite references between the same two objects are drawn on one curve.** `refArc` gives `page.child` and `page0.parent` the same end points and the same midpoint, so the two arcs coincide and the focused one cannot be told from the other (beats 5 and 6 depend on that). Needed: move each arc of such a pair to its own side. The Stack ↔ Heap story never had a mutual pair, so this was never hit.
3. **2D: the same pair crosses as an X** (`refPath`: each arrow runs from a slot line to the other object's heading). Probably readable, since each arrow has one head; the 2D builder checks beats 5 and 6 and separates the two if it is not.
4. **3D: `RootPulse` runs on every `mark` beat.** Its rings ripple from the stack across the whole floor, over the draft pair too. With one mark beat that was harmless; with five it says the search reaches everything. Needed: play it on beat 3 only (for example, only while a frame is in focus), or drop it.
5. **3D: the `gc` shot's label lean assumes there are no stack references** (comment in `HeapBlock`: "With no stack arcs to cover on those beats"). Here `run.page → page` is on screen on every `gc` beat and `page` is in column 0. Needed: check that `page`'s label does not cover that arc on beats 4 to 8, with the `MARKED` badge making labels as wide as `UNMARKED` does. If it does, swapping the two rows in the spec is the cheap way out.

Not needed: a new shot, a new region, a mark-frontier entity, a reference-count badge, a new `HeapState`, a new palette role.

## What this replaces in the section

`src/features/javascript/components/sections/GarbageCollection.tsx`. This spec changes no code; it records the intent for the builders.

**Replaced by the story:** the "2D Visualization: Garbage Collection" block: the `GarbageCollection2D` canvas, the editor with its JS and DSL modes, the output panel and the runner state. That simulation does not hold up:

- In JS mode it ignores the code in the editor. `ensureCompiled` pushes one fixed list of instructions whatever the source says, and the sample calls `gc()`, which a page cannot call.
- Objects are circles at random positions with invented byte sizes. `global` is drawn as an old-generation object, so there are no roots: `mark` instructions name objects by hand and no path is followed.
- It draws a "Young Generation (Nursery)" marked and swept in place, where the report describes a copying Scavenger, and a "compact" step that moves objects to new random positions.

**Stays as prose:** the hero, "Role in JavaScript Engine", "Generational Garbage Collection" (the place where generations are still explained, in words), the Key Insight box (the story is its proof) and the bridge to the Stack ↔ Heap story, reworded so the two stories point at each other.

**Found while grounding, for the architect (not part of this story):** the "GC Roots" list names "Native objects" and "Persistent handles", and "Collection Phases" lists "Concurrent" as a phase; the report backs neither.

## Claim sources

"Report" is `docs/RESEARCH/JavaScript Execution Flow Report.md`.

| Beat | Claim | Source |
|---|---|---|
| 2 | Removing a reference frees nothing by itself; reclaiming happens later | Report › 6.1 (the collector "periodically reclaims memory") |
| 3 | Marking starts from the program's roots | Report › 6.3, Marking |
| 3 | The roots are the frames on the stack, the global frame included | Report › 6.3, the paragraph after the three phases ("The roots are not only the global variables…") |
| 3 | A collection can start at this point in `run` | Report › 6.1 says "periodically" and no more. The story says "suppose" |
| 4, 5 | The collector traverses the object graph from the roots and marks what it reaches | Report › 6.3, Marking ("All reachable objects are marked as 'in-use'") |
| 5, 6 | A marked object's slots are read next; an object is marked and read once | Report › 6.3, the same paragraph (the traversal moves along a marked object's references and visits each object only once) |
| 7 | An object with no path from a root gets no mark | Report › 6.3, Marking, read the other way round |
| 8 | The sweep scans the entire heap and removes every unmarked object, reclaiming its memory | Report › 6.3, Sweeping |
| 8 | Two objects that reference each other are reclaimed when no root reaches them | Report › 6.3, last paragraph (a group of objects that reference each other but that no root reaches is collected). Also proved from the model (key claim 1) |
| 8 | A rule that frees an object only when nothing references it would keep the pair forever | Report › 6.3, last paragraph (reference counting cannot free such a cycle). Also proved from the model (`incoming` is never empty). The caption states the rule without naming it (Decision 1) |
| 9 | Marks last for one collection | Report › 6.3, the paragraph after the three phases (given there as following from the algorithm, not from a source) |

## UNSOURCED

Not backed by the research report:

- Beat 3: a collection may start between two statements of a running function. The report says only that the collector runs "periodically"; the story says "suppose".

The other five claims first listed here are now covered by the two paragraphs added at the end of the report's 6.3, and both sources were re-read on 2026-10-13:

- Frames as roots: the report's source 26 (V8, "Trash talk") names the execution stack and the global object as the root set.
- An unreachable cycle being collected, and the comparison with a rule that counts references: MDN, "Memory management" (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management).
- One visit per object, and marks lasting one collection: neither page states them. The report gives them as properties that follow from the algorithm, and says so.

Nothing in the story depends on V8's generations, the Scavenger, compaction, concurrency or pause times; none is claimed.

## Relation to the Playground

The story's code should become an **example** a learner can open in the Playground with the **Stack & Heap** lens (the section's `TryInPlaygroundLink` then points at it instead of `stack-heap-story`).

What a trace of the same program can reproduce:

- **Beat 1 and beat 2**: the steps after line 10 and line 11 hold the same two frames, the same four objects and the same six, then five, references. A trace also shows what the story skips: the two `makePair` frames. Like the story, it holds `makePair` and `run` as the value `ƒ` in the global frame, not as objects on the heap, so its heap is the same four objects.
- **The outcome, not the collection.** From line 11 on, the Playground draws `draft` and `draft0` in the `unreachable` role (`markUnreachable`), because that is computed from the snapshot by `getReachable`. It is the same set the story's sweep reclaims, and a test can hold the two equal: the objects of beat 2 that are not in `getReachable(beat2)` are exactly the objects `collected` on beat 8.
- **Beat 9's stack**: `run` still on the stack with `page` set, and `'page.0'` returned.

What a trace cannot reproduce: **beats 3 to 8, and the `collected` state on beat 9.** A run cannot observe roots being read, the order of marking, a mark, or a sweep, and it cannot make a collection happen at line 12 ([ADR 0004](../../adr/0004-playground-traces-share-the-snapshot.md), decision 4). In a trace the draft pair stays on the heap until the run ends, tinted unreachable and never reclaimed. So there is no step-by-step trace comparison for those beats; the test (`garbageCollectionStory.test.ts`, "tracing the story code with the Playground tracer") marks them as authored, as the Stack ↔ Heap story's `gc-sweep` is.

The story explains what the tint in the Playground means; the Playground is where the learner changes the program and sees the tint move: delete line 11, keep `draft.child` in a second variable, link the draft pair into the page pair.

## Decisions

Decided by the owner with the approval of 2026-10-13.

1. **Reference counting.** Beat 8 keeps its last sentence, which states the rule and is proved by the model. "Reference counting" is named only in the section's prose next to the story, and the research report is extended with a passage on it (done: report › 6.3).
2. **`MARKED`.** No new hue: the object keeps its own colour and gets a `MARKED` tag and a heavier outline.
3. **Not the whole of V8's collector.** One line of prose under the story says so.
4. **Generations** are a later story, with its own spec.
5. **One aha**, beat 8. Beat 7 asks the learner to predict; beat 6 stays an ordinary beat.
6. **The survivors are held by a local variable of `run`**, as written.
7. **Quiz.** One or two new questions about a cycle, after the story ships.
8. **The old simulation is removed entirely**, DSL editor included, and the two unsupported prose claims are fixed in the same PR.
