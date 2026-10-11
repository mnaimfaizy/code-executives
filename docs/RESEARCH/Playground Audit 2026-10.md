# Playground audit, October 2026

Findings from running `/playground` in a browser and reading `src/features/playground/` on 2026-10-11 (commit `51a0ecc`). This records what is true today. It is not a plan.

## State of the 3D work

- Three visualizations use the step model with a 2D view and a lazy 3D view: JavaScript "Stack ↔ Heap" (#168), Git "What is a branch, really?" (#170) and the Git "Ship a feature" scenario (#173). Shared viewer controls landed in #172.
- `docs/3D-Visualization-Standard.md` and ADR 0001 still say "Prototype" and gate rollout on the owner's sign-off, although Git has shipped two 3D views.
- The three 3D renderers (566, 834 and 1,047 lines) each redefine `PALETTE`, `damp`, `labelStyle`, `SHOTS`, `SCENE_BOUNDS` and `Scene`. The two Git renderers also duplicate `Label`, `CommitBlock`, `commitPos`, `parentArc` and the card constants.
- The canvas and 3D accessibility guides in the `modern-web-guidance` skill (#182) arrived after the 3D views and have not been applied to them.
- The standard's own follow-up is still open: replace the hand-authored Stack ↔ Heap story with traces from the playground's `JsInstrumenter`.

## What happened when I ran the playground

| Test | Result |
|---|---|
| Default JS snippet, Event Loop lens | 8 steps. Microtask and task queues are empty on every step. The `setTimeout` and `.then` callbacks are never stepped into. With an empty stack the header reads "Processing Task Queue". |
| Default JS snippet, console | The `setTimeout(…, 1000)` log never appears. |
| "Closures & Scope" example, Heap & Stack lens | 12 steps and no heap objects. At global scope the lens shows "No heap or stack data in current step". `increment()` is never entered and `count` never appears. |
| "Promise Chain" example (TypeScript) | Fails with `Unexpected token ':'`. No timeline. |
| Console output | Strings render as `&quot;Hello, World!&quot;`; the TypeScript error renders as `&amp;#x27;`. |
| 1024px-wide viewport | The toolbar clips and the Run button is off screen. |

Not tested: Python (needs the Pyodide download), the Data Structures lens, the Streams lens, touch input, reduced motion.

## Causes in the code

- **Empty heap and queues.** The tracker runtime in `services/instrumentCode.ts` writes `heapObjects: []`, `microtaskQueue: []` and `macrotaskQueue: []` on every step. `instrumentation/PythonInstrumenter.ts` does the same. `HeapStackLens` and `EventLoopLens` read those fields, so they have nothing to draw.
- **No object identity.** `safeClone` deep-copies each value (depth 3, 20 keys) on every step. Two variables that point at one object become two unrelated copies, so a reference cannot be drawn.
- **Functions inside expressions are not traced.** `instrumentNode` only descends through statements. Arrow callbacks, object methods and function expressions get no `enterFunction`/`step` calls.
- **One flat variable list.** `collectScopeVars` captures the variables visible at the current statement. Frames below the top of the stack carry no variables.
- **Results are reported too early.** `SandboxFrame.tsx` posts the result 50 ms after the synchronous code ends, so later timers never reach the console or the timeline.
- **TypeScript is not transpiled.** `handleRun` in `PlaygroundApp.tsx` passes TypeScript source straight to acorn and the sandbox. A comment in `hooks/useSandbox.ts` says the code "should be transpiled before passing to execute".
- **Different vocabularies.** The story step model (`StoryStep`: frames with slots, `refId`, heap objects with stable cells and states, a camera shot) is richer than the playground's `StateSnapshot`. The two also both export a type named `StackFrame` with different shapes.
- **Different themes.** The playground is dark (`data-theme="playground"`); the stories and the 3D palette are light, and AGENTS.md says "Light mode only".
- **Different renderers.** Playground lenses use React Flow or plain DOM; stories use SVG and react-three-fiber.

## Other playgrounds in the repository

Reported by an explorer agent from reading the code; nothing here was run in a browser.

- **`src/components/playground/` (old).** A LeetCode-style shell (problem, tests, submit, score, debug stepper) that never runs the user's code: Run, Test and Submit are `setTimeout` mocks (`Playground.tsx:65-97`) and Submit always returns "accepted" with score 100. Its only real execution path (`utils/instrument.ts`, `new Function` on the main thread, no sandbox or timeout) is unreachable.
  - Mounted by `features/bigo/BigOPage.tsx` and `features/datastructures/DataStructuresPage.tsx`, linked from `Sidebar.tsx`, `moduleNavigation.ts` and both modules' Introduction sections, and advertised in the README.
  - Worth carrying over: the problem/test/hint schema (`types/playground.ts`), `data/problems.ts` (1,266 lines, imported by nothing), the `ProblemDisplay` and `TestRunner` UI, and the achievement logic in `utils/scoring.ts`.
  - Dead: `PerformanceAnalyzer` and `hooks/usePlayground.ts` (never imported, fabricated numbers).
  - `utils/instrument.ts` is also used by the JavaScript `CallStack.tsx` and `MemoryHeap.tsx`, so it cannot be deleted with the rest.
- **`src/components/rxjs/playground/`.** Mounted only in the RxJS Visualization Tool section. `MarblePlayground` works but simulates operators by pattern matching (`map`, `filter`, `take` only) rather than running RxJS. `CodePlayground` prints canned output.

## A limit to keep in mind

JavaScript cannot observe real garbage collection. A tracer can compute which objects became unreachable from the roots, which is what the Stack ↔ Heap story's tests already do, but it cannot show an actual sweep.
