# Generational Collection: Why Is Collecting New Objects Cheap?

- Module / section: javascript › Garbage Collection (placed after the Garbage Collection story)
- Question: Most objects die young. What does a collection of the young generation actually do with them, and why is that cheap?
- Sources: `docs/RESEARCH/JavaScript Execution Flow Report.md` › 6.2 (the Generational Hypothesis: most objects "die young"; a young generation "for newly created objects" and an old generation "for objects that have survived multiple collections"; "frequent, fast" young collections, "less frequent, more thorough" old ones) and 6.3 (the young generation's "Scavenger", a "semi-space collector that copies all live objects from a 'from-space' to a new, empty 'to-space', leaving the old space as implicitly garbage"; Mark-and-Sweep for the old generation). `docs/RESEARCH/Node.js Ecosystem Research Report.md` › "Memory Management, Garbage Collection, and Profiling" (New Space, where "all new, short-lived objects are initially allocated", collected by "very frequent, lightweight" Minor GC; objects that "survive multiple GC sweeps in the New Space are promoted to the Old Space"; Major GC in Old Space is Mark-and-Sweep and "runs much less frequently"). Quiz ids it supports: javascript-q05 (promotion; young-generation collection handles short-lived objects), q19 (generational collectors are optimised for objects that die young), q15 (its distractor "old-space objects are never collected after promotion" is answered by the last beat).
- Status: approved by the owner on 2026-10-14, with all recommendations (see "Approved decisions" at the end)

Three claims the story needs are not in either report: the two semi-spaces swap roles after a collection, references to a copied object are changed to point at the copy, and a collection's work follows the survivors. "Claims to verify" lists each with the outside source proposed for it. Decision 5 proposes adding them to the report's 6.3, as the previous story did with its cycle paragraphs.

## How this differs from the Garbage Collection story

`garbageCollectionStory.ts` answers "what is freed?". It holds four objects in one heap, marks along references from the roots and sweeps what has no mark. Every object keeps its cell, and the collected ones stay on screen as faint outlines.

This story answers a second question, "why is collecting new objects cheap?", with a second algorithm. The young generation is not marked and swept: its live objects are **copied** to an empty space, and the space they leave is free as a whole. So this story needs three things the first did not:

- **Three heap regions instead of one**: two young semi-spaces and the old generation.
- **Objects that move.** A copy appears in a new region; the original is left behind. Promotion is one more move, into the old generation.
- **Freeing without visiting.** The dead objects are never tagged, marked or swept one by one. Their whole region becomes free in one beat.

The collector's marking, the subject of the first story, appears only in prose and in the last caption, as the old generation's major collection.

## Code

```js
const cache = { calls: 0 };

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
batch(); // and another one after this line
```

16 lines, runnable. After it runs, `cache.calls` is `4`.

Why this program:

- **Most objects die young, literally.** Each call to `handle` makes one `temp`, uses it once and returns. Four temps are made; none outlives its call. One object, `cache`, is made once and is held by the global frame for the whole run.
- **One survivor per collection.** Each minor collection finds exactly one live object in the young generation, while two temps (and, the second time, an old copy) lie dead beside it. The count of what is copied against what is left behind is the point of the story.
- **`cache.calls` changes between the two collections** (2, then 4). After the first copy the program keeps counting, and the number goes up **in the copy**. That shows that the program uses the copy without knowing it moved.
- **Two temps per batch, not more.** It keeps each semi-space to one row of three cells, so the whole heap is a 3×3 floor of at most seven objects (Decision 1 has the trade-off).
- **`cache` holds no reference**, only a number. A survivor holding references would make the collector copy along them, which is true but a second idea (see "Deliberately left out").

## Regions and shots

### Regions

- **stack** (`frames`), bottom first: `global` (slots `cache`, `handle: ƒ`, `batch: ƒ`), and only on beat 1 `batch()` (slot `n: 2`) and `handle(2)` (slots `n: 2`, `temp`).
- **heap**, split into three **spaces**, one heap row each:

| Space id | Row | Label | Role on beats 1–6 | Role on beats 7–10 |
|---|---|---|---|---|
| `young-a` | 0 | YOUNG · SEMI-SPACE A | from-space | to-space |
| `young-b` | 1 | YOUNG · SEMI-SPACE B | to-space | from-space |
| `old` | 2 | OLD GENERATION | (none) | (none) |

Roles are set on beats 3–9 only; views draw a tag whenever a role is set. (Beats 1, 2 and 10 have no role on any space; the table's columns read "beats 3–6" and "beats 7–9".)

Row 0 is the back of the 3D floor and the top of the 2D heap, so every move in the story goes the same way: forward in 3D, down in 2D, towards "older".

### Objects

Each object keeps its id and its cell on every beat it is in; a move is a new object (see "Moving objects honestly").

| id | Shown as | Space | Cell | Slots | Copy of | Present |
|---|---|---|---|---|---|---|
| `cache` | Object `#cache` | young-a | col 0, row 0 | `calls: 2` | | beats 1–10 |
| `t1` | Object `#t1` | young-a | col 1, row 0 | `n: 1`, `doubled: 2` | | beats 1–10 |
| `t2` | Object `#t2` | young-a | col 2, row 0 | `n: 2`, `doubled: 4` | | beats 1–10 |
| `cache-b` | Object `#cache` | young-b | col 0, row 1 | `calls: 2`, then `4` from beat 7 | `cache` | beats 4–10 |
| `t3` | Object `#t3` | young-b | col 1, row 1 | `n: 1`, `doubled: 2` | | beats 7–10 |
| `t4` | Object `#t4` | young-b | col 2, row 1 | `n: 2`, `doubled: 4` | | beats 7–10 |
| `cache-old` | Object `#cache` | old | col 0, row 2 | `calls: 4` | `cache-b` | beats 8–10 |

At most seven objects, on a 3×3 floor: inside the skill's 4×3 limit and under the previous story's 3D limit of nine. Ids stay short for the 2D label line, as in the previous story.

"Shown as": all three copies of `cache` are labelled `#cache`, because to the program they are one object (Decision 3). The data keeps three ids, so that both views and tests can tell them apart.

### Shots

The shared views' own shots (`StackHeapShot`). No new shot is needed. Four are used.

| Shot | Must keep in frame |
|---|---|
| overview | the stack (every frame) and the whole heap floor: all three spaces with their labels and role tags, every object and every reference |
| bridge | the stack, every object, and the references from the global frame into the heap |
| heap | the three spaces with their labels and role tags, every object; the stack may be out of frame |
| gc | the stack and the whole floor from the higher angle, with room for a state tag on every object label and a role tag on every space |

In 2D everything always fits; a shot only decides what is emphasised.

## Beats

Each beat is a full snapshot. The global frame is on every beat; on beat 1 `batch()` and `handle(2)` are above it. "→" is a reference. States not named are unchanged from the beat before. `gcPhase` `scavenge` is new (see "What the views need").

| # | id | Line | Shot | Focus | gcPhase | Snapshot (what changed, in words) | Title | Caption (≤ 60 words) |
|---|---|---|---|---|---|---|---|---|
| 1 | temps-made | 6 | overview | `handle.temp`, `t2`, `t1` | none | Frames `global`, `batch()`, `handle(2)`. `global.cache → cache`, `handle.temp → t2`. In young-a: `cache` (`calls: 2`), `t1`, `t2`, all `live`. young-b and old are empty. | New objects start young | Every new object starts in the young generation. `handle` makes one `temp` per call and uses it once. `handle(2)` is running, and its frame holds the second temp. The first one is held by nothing: `handle(1)` has returned. `cache` was made at the start, and the global frame holds it. |
| 2 | died-young | 15 | bridge | `global.cache`, `cache`, `t1`, `t2` | none | Only `global` is left. `handle.temp` is gone with its frame. Nothing else changes: `t1` and `t2` are still `live` in young-a, with no reference arriving. | Most objects die young | `batch()` has returned. Of the three objects in the young generation, two are held by nothing: each lived for one call. Only `cache` is still reachable, from the global frame. Nothing has been freed: the two temps still take their memory. |
| 3 | minor-starts | 15 | gc | `global` | scavenge | Data unchanged except `gcPhase`. The global frame is drawn as a root. young-a is tagged `FROM-SPACE`, young-b `TO-SPACE`. | A minor collection starts | Suppose the young generation is full and a minor collection starts. It collects the young generation only. Semi-space A, where the objects are, is the from-space; semi-space B, empty, is the to-space. Like every collection, it starts from the roots: here, the global frame. |
| 4 | copy-survivor | 15 | gc | `global.cache`, `cache`, `cache-b` | scavenge | `cache-b` appears in young-b, a copy of `cache`: same slots, `calls: 2`. `cache`: `live` → `copied`. `global.cache` still → `cache`. A copy trail runs from `cache` to `cache-b`. | Reached means copied | The collector follows the root's reference and copies the object it reaches into to-space: same slots, same values, a new place. The original stays where it was, tagged copied. There is no separate marking pass: finding a live object and copying it happen together. |
| 5 | reference-moved | 15 | bridge | `global.cache`, `cache-b` | scavenge | `global.cache` now → `cache-b`. No reference arrives at `cache`. | The reference follows the copy | The global frame's `cache` now refers to the copy. To the program nothing has happened: `cache` is the same object, with the same `calls`. Only where it lives in memory has changed. Nothing refers to the original any more, and the collector has nothing left to follow. |
| 6 | from-space-freed | 15 | heap | `cache`, `t1`, `t2` | scavenge | `cache`, `t1`, `t2`: → `collected`, together. young-a is drawn as one freed space (tag `FREE`), with no per-object tag. | The dead were never visited | The collection is over, and all of semi-space A is free at once. The collector copied one object. It never visited the two temps and never freed them one by one: they were left behind. A minor collection costs what survives, not what died. |
| 7 | second-batch | 16 | overview | `global.cache`, `cache-b.calls`, `t3`, `t4` | none | Roles swap: young-b is now `FROM-SPACE`, young-a `TO-SPACE` (its three outlines stay faint). `t3`, `t4` appear in young-b, `live`, with no reference arriving. `cache-b.calls`: 2 → 4. Frames: `global` only. | The spaces swap, the program carries on | The semi-spaces swap roles: B, which holds `cache`, is now where new objects go, and A is the empty one. The second `batch()` makes two more temps beside `cache`, and both die young again. `cache.calls` is now 4: the program wrote to the copy. |
| 8 | promoted | 16 | gc | `global.cache`, `cache-b`, `cache-old` | scavenge | `cache-old` appears in old, a copy of `cache-b` (`calls: 4`). `cache-b`: `live` → `copied`. `global.cache` now → `cache-old`. Copy trail from `cache-b` to `cache-old`. | A survivor is promoted | A second minor collection starts. `cache` has already survived one, so this time it is not copied to the other semi-space but to the old generation. That is promotion. The global frame's reference moves with it, as before. The two new temps are not visited. |
| 9 | young-freed-again | 16 | heap | `cache-b`, `t3`, `t4` | scavenge | `cache-b`, `t3`, `t4`: → `collected`, together. young-b is drawn as one freed space (`FREE`). Both young semi-spaces now hold only faint outlines. | The same cost again | Semi-space B is free in one step, as A was. Again the collector copied one object and never looked at the two temps that died. More temps in a batch would have meant more memory freed, not more copying: the work follows the survivors. |
| 10 | in-old-generation | 16 | overview | `global.cache`, `cache-old` | none | Data unchanged except `gcPhase`. Frames no longer drawn as roots. Role tags gone. | Long-lived objects grow old | `cache` now lives in the old generation. Minor collections copy only what is in the young generation, so they no longer move it. The old generation is collected too, less often, by a major collection: mark-and-sweep, the story above. Most objects never get here: they die young. |

10 beats.

**Aha beat: #6 `from-space-freed`.** It breaks "collecting garbage means finding each dead object and freeing it, so more garbage means more work". On beats 3–5 the temps are never in focus and never change; on beat 6 they are freed with their space, and the caption counts what was done: one copy. Beat 9 repeats the result with the second collection, so the learner sees that it was no accident of the first.

**Beat 5 `reference-moved` is an ordinary beat, not a second aha** (approved decision 2). It still shows that the object moved, the frame's reference moved with it, and on beat 7 the program's next write lands in the copy.

Beat 8 (promotion) is a mechanism beat: tested, but not presented as a surprise.

## Moving objects honestly

**Decision: a move is drawn as a copy, never as an object changing cell.** The beat-model rule "an entity keeps its cell" stays true as written. What the report describes is literally a copy ("copies all live objects … leaving the old space as implicitly garbage"), and a copy with the original left behind is exactly what the beats draw.

- The copy is a **new object** with its own id and cell, and an optional field `copyOf` naming the object it was copied from. It enters on the copying beat, as any new object does.
- The original **stays in its cell** with the new state `copied`, until its space is freed, when it becomes `collected` with everything else in that space.
- A **copy trail** (derived: from each `copied` object to the object whose `copyOf` names it) is drawn while the original is `copied`, i.e. on the copying beat and up to the freeing beat. It is not a reference: 2D draws it dotted, in the muted text colour, without an arrowhead in the reference style; 3D draws the same dotted line on the floor and, on the copying beat only, lets the copy rise out of the original's cell and glide to its own (with reduced motion: no glide, the copy appears in place).
- **Program identity** is the chain of `copyOf`. A helper `originOf(beat, id)` follows it to the first object (`cache`). The label `#id` shows the origin (Decision 3).

Proposed amendment to the `beat-model` skill's "Stable placement" rule, to be made by the architect (I may not edit the skill):

> An entity never changes cell. When a collector moves an object, the beat model draws the move as a copy: a new entity in the new cell, with `copyOf` naming the original, while the original stays in its cell with state `copied` until its space is freed. Tests check that a `copied` object has exactly one copy, and that the copy's slots equal the original's on the copying beat.

Tests on top of the usual ones then prove the move: on beat 4 `cache-b`'s slots equal `cache`'s; on beat 8 `cache-old`'s slots equal `cache-b`'s on beat 7.

## The snapshot extension

All optional, all absent in a Playground trace, so no trace and no existing story changes. (`src/shared/snapshot/types.ts`, `src/shared/components/viz/stackheap/types.ts`.)

1. `Snapshot.spaces?: HeapSpace[]`, where `HeapSpace = { id: string; label: string; row: number; role?: 'from' | 'to' }`. When absent, the heap is one region, drawn exactly as today. When present, each space is one heap row, drawn as its own sub-region with its label and, if set, a `FROM-SPACE` or `TO-SPACE` tag. An object's space is derived from its cell's row (`spaceOf(beat, id)`), so `HeapObject` gets no `space` field.
2. `HeapObject.copyOf?: string`: the id of the object this one is a copy of.
3. `HeapState` gains `copied`: "the collector has copied this object elsewhere; what is left here is garbage". `getReferences` skips a `copied` object's slots, as it skips a `collected` one's (its contents live on in the copy).
4. `GcPhase` gains `scavenge` (view props, story only). Frames are drawn as roots while `gcPhase` is `mark` or `scavenge`.

The tests the views already have for a snapshot with no `spaces` stay as they are, and one new test per view checks that the layout of such a snapshot is unchanged by the extension.

**Freed space, drawn once.** When every object in a space is `collected`, the view draws that space with one tag, `FREE`, and the objects in it as faint outlines **without** a per-object `RECLAIMED` tag. A tag on each object would read as a sweep, and the aha is that there was none. This is derived in the view, not stored.

## Minor and major collection

**Decision: only minor collections are shown. The major collection is named, not shown.**

- The previous story already shows mark-and-sweep, step by step, directly above this one. The report calls it the old generation's algorithm, so beat 10 names it and points there.
- Showing a major collection here would add two to four beats and a fourth algorithmic idea (marking in old space while young space holds references) for nothing the learner has not just seen.
- Beat 10 also answers quiz q15's distractor: promoted objects are still collected, by the major collection.

## What the views need that they do not draw today

Read: `StackHeapView2D.tsx`, `heapGeometry.ts`, `StackHeapView3D.tsx`, `viz3d/stackheap/layout.ts`, `gcCues.ts`, `snapshot/placement.ts`, `snapshot/references.ts`.

Already there, nothing to add: a 3×3 dense floor in both views (wider pitch in 3D, gutter routing in 2D); a focused reference drawn thick; `collected` as a faint outline (3D: flattened, faded); objects entering by id; frames drawn as roots during a collection.

Additions, smallest first:

1. **Roots during `scavenge`** (2D `StackFrames2D` `marking` prop, 3D frame slabs). One condition each. `RootPulse` (3D) plays on beat 3 only, under the same rule as now (`rootPulsePlays`: a frame in focus), extended to `scavenge`.
2. **`COPIED` tag** (2D and 3D, in `markTag`'s place). The object keeps its own colour but is drawn faded halfway (it is garbage, but not yet freed), tag in the `unreachable` text colour.
3. **Spaces as sub-regions** (2D and 3D). 2D: one rounded band per space inside the HEAP panel, with its label and role tag; `layout2D` adds a header of about 24 px above each row when `spaces` is present, so the label does not sit in the arrow band above the row. 3D: one floor slab per space instead of the single heap floor, each with a `RegionLabel`; the role tag is part of the label. The `heap`/`gc`/`overview` boxes are unchanged (the slabs together cover the same floor).
4. **`FREE` on a freed space** (derived, as above) and no per-object `RECLAIMED` there.
5. **Copy trail** (2D dotted path between the two cells; 3D dotted floor line and the one-beat glide). The only addition with motion; it respects `useReducedMotion`.
6. **Label `#origin`** for an object with `copyOf` (Decision 3). In 2D the label line has room: `Object  #cache  COPIED` is shorter than the previous story's `Object  #draft0  RECLAIMED`.

Checks for the builders: the 3-slot global frame uses the stacked bottom-frame label in 3D (`frameLabelPlan`, already supported); the `global.cache` reference reaches col 0 on all three rows, so on beats 8–10 its arc to row 2 must clear the faint objects of rows 0 and 1 (2D: the stack gutter; 3D: the arc's lift).

Not needed: a new shot, a new palette role, any change to placement (`placement.ts`) or to traces.

## Cost, compared with the Garbage Collection story

The previous story changed no snapshot type and added one visible cue (`MARKED`) plus fixes to arcs between mutual pairs. This one is larger, roughly two to three times the view work:

| Area | Files | Size |
|---|---|---|
| Snapshot types and helpers | `shared/snapshot/types.ts`, `references.ts` (+ tests) | small: three optional additions, one skipped state |
| View props | `viz/stackheap/types.ts` | one union member |
| 2D view | `StackHeapView2D.tsx`, `StackFrames2D.tsx`, `heapGeometry.ts` (+ tests) | medium: sub-regions, space header in the layout, `COPIED`, `FREE`, trail |
| 3D view | `StackHeapView3D.tsx`, `layout.ts`, `gcCues.ts` (+ tests) | medium: floor slabs, labels, `COPIED`, trail and glide |
| Story | `generationalCollectionStory.ts` (+ test), a section shell `GenerationalCollectionStory.tsx` | as the previous story |
| Section | `GarbageCollection.tsx` | prose edits (below) |
| Research report | `JavaScript Execution Flow Report.md` › 6.3 | one paragraph (Decision 5) |
| Skill | `.agents/skills/beat-model/SKILL.md` (+ `agents:sync`) | the placement amendment |

Cheaper options, if wanted: drop the trail and the glide (saves item 5, and the copy is then explained by caption and by the shared `#cache` label alone); or ship 2D first and 3D in a second PR.

## What changes in the section

`src/features/javascript/components/sections/GarbageCollection.tsx`. This spec changes no code.

- **The story** goes after the Garbage Collection story and its note.
- **The note under the first story** ("New objects are first collected by a different collector, which copies the live ones…") ends with a pointer to the new story below it.
- **"Generational Garbage Collection" prose block:** keep the hypothesis paragraph, but drop "weak" from "weak generational hypothesis" (the report says "Generational Hypothesis"; "weak" is in neither report). The "Mark-and-Sweep Phases (old generation)" card stays. Add a short "Young generation" line or card next to it: "Scavenge: copy the live objects from from-space to to-space; the rest of from-space is free. An object that survives is promoted to the old generation." The "GC Roots" card stays.
- **Hero subtitle** ("mark & sweep · generational GC · automatic memory reclaim") stays.

**Playground:** no example and no `TryInPlaygroundLink` for this story. A run cannot observe a collection, a copy or a promotion ([ADR 0004](../../adr/0004-playground-traces-share-the-snapshot.md)), and a trace has one heap region (`spaces` absent). The only part a trace reproduces is beats 1–2 (frames, the temps becoming unreachable, which the Playground tints), and the first story's link already covers that. One sentence under the story can say so.

**Quiz, after the story ships** (new ids from javascript-q34, references `Garbage Collection`):

1. A minor collection runs while the young generation holds one reachable object and many unreachable ones: what does its work depend on? (the survivors)
2. After a scavenge copies an object, what does a variable that held it refer to? (the copy; the program sees the same object)
3. Misconception check: "the young generation is swept object by object" against "the from-space is left as a whole".
4. Optional: what happens to an object that keeps surviving minor collections, and is it ever collected again? (promoted; collected by major collections). Overlaps q05; only if the bank wants more depth.

## Deliberately left out

- Real numbers: semi-space sizes, how many collections before promotion, how often a minor collection runs. The story's rule "promoted the second time it survives" is a simplification of the reports' "survived multiple collections", and the spec says so in "Claims to verify".
- What starts a collection. The story says "suppose the young generation is full".
- References from the old generation into the young one, and how a minor collection finds them (they are roots for a minor collection). Nothing in this program creates one.
- Copying along references: a survivor that holds references makes the collector copy what they reach too. `cache` holds only a number.
- The forwarding address an engine leaves in the original, and how the collector finds every reference to update.
- V8's further split of the young generation (nursery and intermediate), parallel scavenging with helper threads (report 6.3), pauses, concurrent and incremental work.
- Compaction in the old generation (report 6.3, phase 3).
- The major collection itself (above).
- Function objects: `handle` and `batch` are `ƒ` values in the global frame, as in the earlier stories.

## Claims to verify

"Report" is `docs/RESEARCH/JavaScript Execution Flow Report.md`; "Node report" is `docs/RESEARCH/Node.js Ecosystem Research Report.md`; "Trash talk" is the report's source 26, https://v8.dev/blog/trash-talk.

Backed by the reports:

| Beat | Claim | Source |
|---|---|---|
| 1 | New objects are allocated in the young generation | Report › 6.2; Node report, New Space |
| 2 | Most objects die young; becoming unreachable frees nothing by itself | Report › 6.2; 6.1 ("periodically reclaims") |
| 3, 10 | A minor collection collects the young generation; it is frequent and fast, the old generation's collection less frequent | Report › 6.2; Node report |
| 3 | A collection starts from the roots, and the global frame is one | Report › 6.3, the paragraph on roots (via "copies all live objects": live is decided by reachability, as the first story's note states) |
| 4, 6 | Live objects are copied from from-space to an empty to-space; what is left in from-space is garbage as a whole | Report › 6.3, Scavenger |
| 8 | An object that has survived young collections is promoted to the old generation | Report › 6.2 ("survived multiple collections"); Node report ("promoted to the Old Space") |
| 10 | The old generation is collected by mark-and-sweep, less often | Report › 6.3; Node report (Major GC) |

**Checked by the architect against Trash talk on 2026-10-14.** Results:

- Beat 5, references updated to the copy: **confirmed.** "The final step of scavenging is to update the pointers that reference the original objects, which have been moved", via a forwarding address the copy leaves behind.
- Beat 7, semi-spaces swap roles: **confirmed.** "We then switch around the two spaces i.e. To-Space becomes From-Space and vice-versa"; new allocations then go to the From-Space.
- Beats 6, 9, cost follows the survivors: **confirmed.** "We only pay a cost (for copying) proportional to the number of surviving objects", and every other allocation becomes "implicit" garbage.
- Beat 4, "a scavenge marks nothing": **wrong as first written.** Trash talk says marking, evacuating and pointer-updating are "all interleaved, rather than in distinct phases". The caption now says there is no separate marking pass.
- Beat 8, promotion on the second survival: **confirmed, not only a simplification.** "Objects that survive a second GC are evacuated into the old generation, rather than To-Space" (nursery, then intermediate, then old).
- Also in Trash talk, still left out of the story: old-to-new references, kept by write barriers, are extra roots for a scavenge.

The original list follows, kept for the record:

- **Beat 5: references to a copied object are changed to point at the copy.** Proposed source: Trash talk (its section on the Scavenger describes updating pointers to the moved objects). It also follows from the report's description: if from-space is garbage, the program must be using the copy.
- **Beat 7: after a collection the two semi-spaces swap roles, and new objects are allocated in the space the survivors were copied to.** Proposed source: Trash talk (semi-space description). Neither report says what happens to the spaces afterwards.
- **Beats 6, 9: a minor collection's work grows with the survivors, and the dead objects are never visited.** Not stated in either report in these words; it follows from "copies all live objects … leaving the old space as implicitly garbage". Trash talk may state it; if not, the report paragraph should say it follows from the algorithm, as the first story's paragraph does for its two derived points.
- **Beat 4: a scavenge marks nothing; reaching an object and copying it are one step.** Follows from the report's description of a copying collector, which mentions no mark. Verify against Trash talk, or drop the sentence from the caption.
- **Beat 8: promotion on the second survival.** A simplification. Neither report gives a number, and the spec does not claim V8's. The caption says "has already survived one", not "after N collections". Trash talk gives V8's actual rule; if it differs in a way a learner would trip on, the caption can say "has survived before".

## UNSOURCED

- Beat 3: "suppose the young generation is full" as the trigger. The reports give no trigger; the story says "suppose".
- The four claims above, until the owner verifies them against Trash talk.

## Decisions (recommended) and open questions for the owner

Recommendations, each to be confirmed or changed:

1. **Program size: two temps per batch, a 3×3 floor, at most seven objects.** Three temps per batch would make "most die young" stronger (3 of 4 instead of 2 of 3) but needs a 4×3 floor and nine objects, at the limit of the 3D label budget.
2. **Two aha beats: #6 (cost follows survivors) and #5 (an object moves, the program does not notice).** Alternative: #6 only, with #5 as an ordinary beat, as the first story did with its beat 6.
3. **All copies of `cache` are labelled `#cache`** (the origin of the `copyOf` chain), not `#cache-b` / `#cache-old`. The data keeps distinct ids. Alternative: show the real ids and let the caption say they are the same object.
4. **A move is a copy (`copyOf`, state `copied`), with a dotted copy trail and a one-beat glide in 3D**, and the `beat-model` placement rule is amended as quoted above. Alternative, cheaper: no trail and no glide.
5. **Extend the report's 6.3** with one paragraph: references updated to the copy, semi-spaces swapping roles, work following the survivors (marked as following from the algorithm where Trash talk does not say it), source Trash talk. Needed for four captions as written.
6. **The major collection is named, not shown** (beat 10 and the prose point at the story above).
7. **No Playground example** for this story.
8. **Freed space drawn once (`FREE`), no per-object `RECLAIMED`** in a freed space.
9. **Snapshot extension as listed** (`spaces`, `copyOf`, `copied`, `scavenge`), optional and absent in traces.

Open questions:

- A. Are the four "not in the reports" claims confirmed by Trash talk, and may the report be extended (Decision 5)? If the semi-space swap is not confirmed, beat 7 must change.
- B. Is the larger view cost acceptable (Decisions 4 and 8, sub-regions in both views), or ship 2D first?
- C. Two ahas or one (Decision 2)?
- D. `#cache` on all copies, or the real ids (Decision 3)?
- E. Drop "weak" from "weak generational hypothesis" in the section prose?
- F. Quiz: add questions 1–3 (and 4?) after the story ships?

## Approved decisions

Approved by the owner on 2026-10-14:

1. Two semi-spaces and the old generation: a 3×3 floor, at most seven objects.
2. One aha, beat 6. Beat 5 is an ordinary beat.
3. Every copy of `cache` is labelled `#cache`. The data keeps distinct ids.
4. A move is drawn as a copy (`copyOf`, state `copied`), with a dotted copy trail and a one-beat glide in 3D (no glide with reduced motion). The `beat-model` skill's placement rule is amended as quoted in "Moving objects honestly".
5. The report's 6.3 gains one paragraph on the three points confirmed against Trash talk: references are updated to the copy, the semi-spaces swap roles, and the cost is proportional to the survivors. It also says marking and copying are interleaved, and that an object is promoted when it survives a second collection.
6. Only minor collections are shown; the major collection is named in beat 10 and the prose.
7. No Playground example for this story.
8. A freed space is drawn once with `FREE`, with no per-object `RECLAIMED`.
9. 2D and 3D ship together, in one PR.
10. "weak" is dropped from "weak generational hypothesis" in the section prose.
11. Quiz questions q34–q36 (questions 1–3 under "Quiz") are added with the story.
