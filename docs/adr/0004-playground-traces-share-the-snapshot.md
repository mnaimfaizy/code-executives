# 0004: Playground traces share the story snapshot and are recorded by instrumentation

- Status: accepted (2026-10-11)
- Glossary: [CONTEXT.md](../../CONTEXT.md) (playground, trace, step, snapshot, lens, focus, example, exercise)
- Evidence: [Playground Audit 2026-10](../RESEARCH/Playground%20Audit%202026-10.md), [Playground Design Research](../RESEARCH/Playground%20Design%20Research.md)

## Context

Stories teach a concept through authored beats, drawn in 2D and optionally 3D ([ADR 0001](0001-optional-3d-with-one-step-model.md)). The owner wants the Playground to be the practice half of the site: after the theory, a learner runs their own code and watches what happens underneath, in the same 2D and 3D views.

The October 2026 audit found that the Playground cannot do this today:

- Its tracer records a line, a call stack and one flat list of variables. The heap and both queues are always empty.
- Values are deep-copied on every step, so two variables that point at one object look like two objects. A reference cannot be drawn.
- Callbacks, object methods and function expressions are not traced. TypeScript does not run.
- Stories and the Playground describe the same things with two incompatible shapes, and draw them with different technology (SVG and react-three-fiber against React Flow).
- Two other "playgrounds" exist. `src/components/playground/` is a problem-and-tests shell that never runs the learner's code. The RxJS module has a marble tool that simulates three operators.

## Decision

1. **One snapshot, two sources.** A story's beat and a trace's step both hold a snapshot: entities with stable identities, slots, and references between them. A beat adds what an author wrote (title, caption, shot, focus). A step adds what the run produced (the line that ran) and a focus derived from what that step changed. A step has no shot.
2. **One set of views.** The 2D and 3D views draw a snapshot and do not know whether it came from a beat or a step. The Playground's lenses are rebuilt on these views; a lens chooses which regions are drawn, and every lens can be shown in 2D or 3D. The rules of ADR 0001 and the 3D standard apply unchanged: 2D is the default, 3D is lazy-loaded, and without WebGL or on error the view falls back to 2D.
3. **Traces are recorded by instrumenting the learner's code and running it on the browser's own engine**, inside the existing sandbox. The tracer gives each object a stable identity, records variables per frame, follows functions wherever they are written, and records the microtask and task queues.
4. **A trace is never presented as a story.** It has no approved spec, no captions and no aha beat. Unreachable objects may be marked as unreachable, because that is computed from the snapshot. A garbage-collection sweep is never shown in a trace, because a run cannot observe one.
5. **There is exactly one Playground.** `src/components/playground/` is retired and its code removed. What is worth keeping moves into the Playground as exercises: the task, checks and hints structure and the existing problem set. The RxJS tool stays in its module as the marble diagram tool, and its stub code editor is removed.
6. **The Playground is dark.** It is the one exception to the site's light-mode rule. Views therefore take their colours from a palette with a light and a dark variant, where each colour keeps its one role.
7. **JavaScript first.** The snapshot and the views are language-neutral. The JavaScript tracer is built first, TypeScript runs through it once its types are stripped, and Python follows later by emitting the same snapshot.

## Considered options

- **Run the code in a JavaScript interpreter** (JS-Interpreter, Sval, QuickJS in WebAssembly). An interpreter would see everything, including the real queues, and could pause mid-statement. Rejected: JS-Interpreter supports only ES5 and is about 200 times slower; Sval documents no step hooks; QuickJS exposes no stepping or heap API, so it would need the same instrumentation and add 0.5 to 1.3 MB.
- **Keep the Playground's own snapshot shape and lenses, and add 3D lenses beside them.** Rejected: every concept would be drawn twice, in two styles, and a learner moving from a story to the Playground would see a different picture of the same thing.
- **Generate a story from a run**, with captions written by rules. Rejected: a story is approved by the owner and proves its key claim with a test. Generated captions on arbitrary code can be wrong, and the learner cannot tell.
- **Keep the old playground beside the new one.** Rejected: it does not run code, and two playgrounds split both the learner's attention and the maintenance.

## Consequences

- **The tracer sees only what it rewrites.** Work the engine does on its own stays invisible unless it is given a hook: callbacks called by built-ins such as `Array.prototype.map`, getters, and how a native `await` is scheduled.
- **The queues are the tracer's model of the specification, not the engine's own queues.** The model needs a test corpus of known orderings, and the Playground must say so where it matters.
- **Arbitrary code has no author.** Stories place entities in hand-picked cells and check every label by hand. Traces need automatic placement, limits on how much is drawn, and a clear message when a snapshot is too large to draw.
- **The step limit must stop the run.** Today the tracker stops recording at its limit while the code keeps running, so an infinite loop never ends. The limit has to end the run and keep the partial trace.
- **The existing stories change.** Their types move to the shared snapshot, and the Stack ↔ Heap views become the first shared views. The three 3D renderers currently duplicate their palette, labels and scene helpers; this decision requires extracting them.
- **Names change.** "Step model" becomes "beat model" in `AGENTS.md`, the `step-model` skill, ADR 0001, the 3D standard and the code, in one dedicated pass. Playground code stops using "snapshot", "timeline" and "example snippet" in their old senses.
- **`AGENTS.md` changes on acceptance.** "Light mode only" gains the Playground exception, and this ADR is linked from it.
- **Pages lose a section.** Removing the old playground takes a section out of the Big-O and Data Structures pages, their sidebar and navigation entries, and the README. `src/utils/instrument.ts` stays, because the JavaScript module's Call Stack and Memory Heap sections use it.
- **Open, decided later:** whether the Data Structures and Streams lenses survive as lenses; how TypeScript types are stripped (Monaco's own TypeScript worker needs no new dependency, a stripping library does); and whether exercises carry achievements.
