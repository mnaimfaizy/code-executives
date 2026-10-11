# **Playground Design Research: Tracing, Visualization and Practice**

Research for turning `/playground` into the "practice after theory" place. Compiled 2026-10-11 from primary sources where they could be reached (tool source code, official docs, the authors' papers). Anything not confirmed from a primary source is tagged **(unverified)**. Observations about this repository come from reading the code, not from running it.

## **Summary**

The tools that teach best (Python Tutor, Thonny, Loupe) all do the same three things: they run the program to completion under a hard step limit, record a **full snapshot of frames and heap at every step** with objects named by small stable ids, and let the learner scrub forwards and backwards in the browser. Python Tutor's published trace format is almost the same shape as this project's story step model (`frames` with slots that hold a value or a `refId`, `objects` keyed by id), so the cheapest high-value move is to make the playground tracer emit that shape and let the existing 2D and 3D story renderers act as lenses. No reviewed tool shows heap identity and the microtask/task queues together for arbitrary code: Python Tutor refuses async entirely, and the event-loop tools (Loupe, JS Visualizer 9000) show no heap. The gap is real and reachable with deeper AST instrumentation plus a traced event loop inside the sandbox; an interpreter is not required. The research on learning is consistent that what the learner *does* with a visualization (predicting, answering, changing) matters more than what it draws, and the evidence for 3D is mixed: it helps for structural overview and hurts through occlusion, navigation cost and clutter, which supports the house rule that 3D is optional and only where depth carries meaning.

## **A. Comparison of tools**

| Tool | What it shows | How it traces | Limits | What we could borrow |
|---|---|---|---|---|
| **Python Tutor** (Guo) | Frames, heap objects, pointers, closures' parent frames, stdout, per line | Python: runs under `bdb`, records a complete stack+heap snapshot per executed line, sends one JSON trace; stepping is client-side [S1]. JS: Node run with `--expose-debug-as=Debug`, stepping through V8 debug break events; object ids are a hidden `smallObjId_hidden_` property added with `Object.defineProperty` [S3] | 1,000 steps (originally 300) [S1][S3]; JS backend is server-side, ES6 only, Node v6, "very brittle" per its own header [S3][S5]; **no async, timers, promises, DOM** [S4]; closures are inlined as `parent:x` because V8 scopes are not tied to frames [S3]; not for mobile [S4] | Trace format (`REF` ids, `frame_id`, `parent_frame_id_list`, `is_zombie`, event types incl. `instruction_limit_reached`) [S2]; layout heuristics: append new objects at the bottom, never move a rendered object [S1]; "fits on a blackboard" scope [S4] |
| **Loupe** (Roberts) | Call stack, Web APIs, callback queue, render queue | `falafel` rewrites `CallExpression`/`BinaryExpression` with before/after hooks; a busy-wait `delay` slows execution so the animation keeps up [S6] | Live animation, not a recorded trace; no microtask queue component in the source tree [S6]; no heap. Web-worker execution is **(unverified)**: described in a secondary write-up only | Expression-level hook points (before/after a call) rather than statement-only |
| **JS Visualizer 9000** (Hopding) | Call stack, task queue, microtask queue | **Server-side**: Node `worker_threads`, `async_hooks` (`init/before/after/promiseResolve`) for promises, timeouts and microtasks, plus Babel/`falafel` function enter/exit wrapping, inside `vm2` [S7] | Needs a server; `async_hooks` does not exist in browsers; no heap or variables; `vm2`'s own README says sandbox escapes keep being found [S8] | The event vocabulary: `InitPromise`, `ResolvePromise`, `EnqueueMicrotask`, `DequeueMicrotask`, `InitTimeout`, `BeforeTimeout`, `EnterFunction`, `ExitFunction` [S7] |
| **ui.dev JavaScript Visualizer** | Execution contexts, hoisting, scopes, closures | **(unverified)**: no primary description found | **(unverified)** | The creation-phase vs execution-phase framing, if confirmed |
| **Lydia Hallie, "JavaScript Visualized"** | Hand-authored animations of event loop, promises, hoisting | Not traced: made in Keynote and screen-recorded, per the author's own comment [S9] | Fixed examples | Pacing and one-idea-per-frame; proof that authored scenarios teach well alongside free code |
| **Algorithm Visualizer** | Arrays, graphs, logs for algorithms | Author calls tracer APIs (`Array1DTracer.select/patch`, `Tracer.delay()`); `tracers.*` libraries "extract visualizing commands from code" [S10] | Learner must annotate code; only what is annotated is shown | An opt-in `viz.*` API for data-structure lenses where automatic detection is unreliable |
| **VisuAlgo** | Pre-built algorithm animations with pseudo-code | **(unverified)**: about page not reachable | Not arbitrary code **(unverified)** | E-lecture mode and auto-generated quiz questions **(unverified)** |
| **Recursion tree visualizers** (e.g. brpapa) | Call tree of a recursive function | **(unverified)**: tagged `aws-lambda`, so likely server-side | Third-party reports: function must be named `fn`, globals break it **(unverified)** | A call-tree lens derived from enter/exit events we already record |
| **Thonny** | Expression-by-expression evaluation; each call in its own window with locals; optional "name → id → value" heap mode [S11] | Desktop Python IDE; mechanism **(unverified)** | Not web | Two fidelity levels for the same run: simple values first, references on demand |
| **Replay.io** | Time-travel debugging of a recorded browser session | Records non-deterministic inputs at the system-library boundary and re-executes deterministically; determinism is targeted at the JS level [S12] | Needs a custom runtime | The principle only: record once, re-derive any view afterwards |
| **rr** | Record and reverse-execute native processes under gdb | Records kernel inputs and non-deterministic CPU effects; emulates a single core [S13] | Linux, specific CPUs | Reverse "who last wrote this?" queries are possible on a snapshot trace too |
| **Quokka / Wallaby** | Inline values next to code, value explorer | Transpiles, then "adjusts your code" (instrumentation), runs in Node [S14] | Editor plugin; "Time Machine" details **(unverified)** | Inline value annotations in the editor gutter for the current step |
| **StackBlitz WebContainers** | Full Node toolchain in a tab | Browser-based Node runtime [S15]; internals and header requirements **(unverified)** | Commercial terms for non-OSS use; no tracing API documented | Not a fit: heavy, and it does not expose state |
| **Sandpack** (CodeSandbox) | Bundled preview in an iframe | Client talks to a hosted bundler iframe by `dispatch`/`listen` messages [S16] | Depends on a hosted bundler by default; no state tracing | The iframe message protocol pattern we already use |
| **Observable runtime** | Reactive cells | Dataflow: variables recompute when inputs change; observers get `pending/fulfilled/rejected` [S17] | Different execution model from plain JS | "Change an input, everything downstream updates" for parameterised scenarios |
| **JS-Interpreter** (Fraser) | n/a (engine) | Interpreter in JS with `step()`, exposed state stack and scopes, serialisable state [S18] | **ES5 only**, about 200x slower than native, no `let`, no promises [S18] | Reference for how an interpreter exposes scopes |
| **Sval** | n/a (engine) | Acorn-based interpreter, "latest" ES [S19] | No step or hook API documented [S19] | Little without forking |
| **quickjs-emscripten** | n/a (engine) | QuickJS compiled to WASM; host drives the promise job queue with `executePendingJobs()`, interrupt handler, memory limit [S20] | No stepping, debugger or heap-inspection API; about 500 KB to 1.3 MB of WASM [S20] | Host-controlled job queue is the cleanest proof that "we own the event loop" is the right model |
| **Jalangi2** | n/a (analysis framework) | Source instrumentation with analysis callbacks; ships a shadow-memory analysis (`SMemory.js`) [S21] | Targets ES5.1; ES6 untested [S21] | The design: every operation calls a hook, analyses are plug-ins |

## **B. Techniques for the gaps**

**B1. Object identity and the heap graph.** Python Tutor's JS backend tags each object once with a hidden non-enumerable id and emits `["REF", id]` wherever it is referenced, so two variables pointing at one object visibly share it [S3]. In the browser a `WeakMap<object, number>` does the same without touching the object: keys are held weakly, compared by reference, and the feature is Baseline widely available [S22]. The current tracker (`services/instrumentCode.ts`) deep-clones values with `safeClone`, which destroys identity: `a` and `b` aliasing one array become two copies.
*Suggestion:* replace `safeClone` with an encoder that assigns ids from a `WeakMap`, walks from the frame variables (depth and node caps as today), and writes each object once into `heap[id]` with slots that are either a primitive or `{ refId }`. Reachability from frames is then computed, not guessed, which is exactly what `stackHeapStory.ts` asserts in its tests.

**B2. Closures and scope chains.** Python Tutor models this with `frame_id`, `parent_frame_id_list` and `is_zombie` (a returned frame kept alive by a closure) [S2]; its V8-based JS backend could not tie scopes to frames and fell back to inlining [S3]. Instrumentation can do better than the debugger here because we control function entry.
*Suggestion:* on `enterFunction`, allocate a scope record with an id and the id of the scope where the function was *created* (capture it when the function expression is evaluated, stored in a `WeakMap<function, scopeId>`). A scope that is still referenced by a live function after its frame pops stays in the snapshot as a "retained scope". This draws the scope chain literally.

**B3. Microtask and task queues.** The ordering rules are short: after each task, when the stack is empty, the whole microtask queue drains, including microtasks queued while draining, before the next task [S23]. Three ways to observe it:
- *Engine hooks:* `async_hooks` gives exact events but is Node-only [S7].
- *Patching globals in the sandbox:* wrap `setTimeout`, `queueMicrotask` and `Promise.prototype.then` so each records enqueue, start and end. Native `await` does not go through a patchable `then`; Angular's docs say `async/await` "cannot be patched effectively" by ZoneJS and must be downleveled [S24]. With an AST pass we can instead rewrite `await x` to report suspend and resume around it.
- *Owning the loop:* QuickJS shows the model: nothing asynchronous runs until the host calls `executePendingJobs()` [S20].
*Suggestion:* inside the sandbox, replace `setTimeout`/`setInterval`/`queueMicrotask` with traced versions backed by our own queues and a virtual clock, and drive them with a small loop (run script, drain microtasks, take next task). Promise reactions are recorded by wrapping `then`/`catch`/`finally` and by the `await` rewrite. Timers then fire instantly and deterministically, and the queue contents at every step are known rather than inferred. Validate the loop against the MDN/HTML ordering examples as unit tests. Whether a wrapped `then` plus `await` rewrite reproduces every native ordering edge case is **(unverified)** and needs a test corpus.

**B4. Step limits and infinite loops.** Python Tutor stops at a fixed number of executed lines and emits a dedicated `instruction_limit_reached` event with a readable message [S1][S2]. `loop-protect` inserts a time check into every loop and cannot catch runaway recursion [S25]. Pyodide can only be interrupted from another thread through a `SharedArrayBuffer`, which needs a worker and cross-origin isolation headers [S26]. Local observation: `__tracker__.step` currently *returns silently* once `MAX_STEPS` is reached, so an infinite loop keeps spinning without recording, and the in-iframe `setTimeout` watchdog cannot fire while the same thread is busy.
*Suggestion:* make the step budget *throw* a `StepLimitError` (counted on every step, loop iteration and function entry), surface it as a final trace event, and keep the partial trace. As a hard backstop run JS in a Web Worker inside the sandboxed iframe and `terminate()` it on timeout. For Python, count steps in the trace function and raise; treat the `SharedArrayBuffer` interrupt as optional.

**B5. TypeScript without a heavy compiler.** Type stripping replaces annotations with whitespace so line and column numbers are unchanged and no source map is needed; this is how Node runs `.ts` and how `ts-blank-space` works [S27][S28]. It rejects enums, runtime namespaces, parameter properties and `import =` [S27][S28]; `erasableSyntaxOnly` flags the same constructs [S29]. Sucrase strips types too, also handles enums, and does not type-check [S30]. Local observation: a grep found no transpile step in the playground; `useSandbox.ts` only says TS "should be transpiled before passing to execute", and `acorn` cannot parse annotations.
*Suggestion:* position-preserving stripping is the right fit because the tracer reports original line numbers. Options, cheapest first: (1) ask Monaco's bundled TypeScript worker for emit output, no new dependency, line preservation **(unverified)**; (2) a stripping library (new dependency, owner approval and the `add-dependency` skill apply). Either way, restrict playground TS to erasable syntax and say so in the UI.

**B6. Python heap under Pyodide.** Python Tutor's Python trace is the reference: full stack and heap per line, heap keyed by object id [S1][S2]. CPython 3.12 added `sys.monitoring` with `LINE`, `PY_START`, `PY_RETURN` and per-location disabling [S31]; the playground pins Pyodide v0.27.7, whose Python version is **(unverified)** (recent Pyodide releases ship 3.13 and 3.14 [S32]).
*Suggestion:* keep `sys.settrace`, and in the trace callback encode `frame.f_locals` with `id(obj)` as the heap key into the *same* snapshot schema as JS, so every lens works for both languages. Follow Python Tutor's choice to draw immutable primitives inline in the frame to avoid arrow clutter [S4]. Consider `sys.monitoring` only if tracing speed becomes a problem.

## **C. 3D and spatial visualization**

- **Guided camera, text-led.** Ciechanowski's articles pair one mechanism per figure with prose, sliders that scrub state, drag-to-rotate, colour-coded named parts and a global pause [S33]. Bycroft's LLM visualization is a 3D model of a network "running inference" [S34]; its walkthrough UI could not be read by the fetch tool, so the guided-camera description in the 3D standard is **(unverified)** here.
- **Evidence for 3D.** CodeCity's controlled experiment (41 participants) found a statistically significant gain in correctness and reduction in completion time for program-comprehension tasks [S35]; effect sizes and the baseline tool are **(unverified)**. Against that, Cockburn and McKenzie found spatial-memory performance fell as users gained more freedom to use the third dimension, and users rated those interfaces more cluttered (abstract only) [S36]. Shneiderman argues that disorienting navigation, complex actions and occlusion slow people down, and that good 3D interfaces need overviews, fewer actions and prompt feedback [S37]. A 2026 VR study of software-evolution visualization concluded immersive views do not universally beat traditional ones (search summary only, **unverified**) [S38].
- **Reading of the evidence (inference).** 3D earns its place for *structure with a meaningful third axis* and loses on precise reading, text and anything occluded. For program state the candidates are: stack above heap with references crossing the gap; scope chain as nested depth; the event loop as lanes (stack, microtasks, tasks) with callbacks moving between them. Flat lists, arrays and variable tables gain nothing.
*Suggestion:* in the playground, offer 3D only on lenses that pass that test (heap/stack and scope chain first), reuse `src/shared/viz3d/` and the shared toolbar, and derive each step's shot automatically from the trace: frame the frame or object that changed, which is the `focus` field of the story step model. Keep 2D the default and keep labels in the DOM.

## **D. Pedagogy for a practice playground**

- **Engagement beats graphics.** The meta-study of 24 algorithm-visualization experiments concluded that how learners use the technology matters more than what it shows (abstract and secondary summaries) [S39]. The ITiCSE engagement taxonomy orders activity as no viewing, viewing, responding, changing, constructing, presenting [S40]. Guo's own paper lists "question prompts, mini-quizzes, textual annotations" as the missing active-engagement features [S1].
- **Predict before run.** PRIMM (Predict, Run, Investigate, Modify, Make) was evaluated with 493 students aged 11 to 14 in 13 schools; the PRIMM group outperformed the control on the post-test [S41].
- **References are the core misconception.** In a study of 90 first-year students, about one third held non-viable models of value assignment and only 17% held a viable model of reference assignment; visualization combined with *cognitive conflict* (confronting a wrong prediction) worked better than visualization alone [S42].
- **Async misconceptions.** No peer-reviewed study of novice misconceptions about the JS event loop was found. The commonly cited ones (a zero-delay timer runs immediately; promises are threads; timer delay is exact; promise callbacks and timers run in call order) come from tutorials and are **(unverified)** as research findings. MDN's ordering example is a ready-made prediction exercise [S23].
- **Explorables and learnable programming.** Victor: show the state, make flow visible and controllable through time, start concrete, and note that live re-execution alone "misses the point" [S43]; explorable explanations let the reader change the author's assumptions [S44].
- **Parsons problems.** The 2022 ITiCSE review covers the literature; a 2023 follow-up reports evidence for learning common patterns and for distractors (search summaries only, **unverified**) [S45].
*Suggestion:* add a "Predict" mode to the timeline: before a marked step the view freezes and asks one question whose answer is in the next snapshot ("what does `b[0]` hold now?", "which callback runs next?"), then reveals it. Questions can be generated from the trace: aliasing questions wherever two slots share a `refId`, ordering questions wherever both queues are non-empty. Link lessons to the playground with a URL that carries snippet id, lens and step (the existing `?scenario=<id>` convention), and make each example a short PRIMM ladder: predict, run, investigate with the lens, then a "modify so that…" task checked against the console output or final heap.

## **E. Layout and accessibility**

- **Layout precedent.** Python Tutor puts code and the step slider on the left and frames/objects on the right, with every interaction after the trace arrives happening client-side [S1]. It states plainly that it is not for mobile [S4].
- **Small screens.** Monaco's FAQ answers "No" to mobile browser support [S46]; CodeMirror 6 advertises native selection and editing on phones and screen-reader support [S47]. WCAG 2.2 Reflow requires no two-dimensional scrolling at 320 CSS px, with an exception for content such as diagrams and editing interfaces that need two dimensions [S48].
- **Canvas and 3D.** The HTML spec requires canvas fallback content that "conveys essentially the same function or purpose" and a one-to-one mapping from interactive regions to focusable fallback elements [S49]. The vendored `modern-web-guidance` guides describe HTML-in-Canvas (`layoutsubtree`) for exposing canvas content, which needs a feature check and a fallback (local files, not Baseline widely available).
*Suggestion:* desktop: editor left, visualization right, timeline as a full-width strip under both, console as a collapsible drawer. Below about 768 px: one pane at a time behind tabs (Code, Visualize, Console) with the timeline pinned at the bottom, and a read-only highlighted code view plus a plain `<textarea>` editing fallback instead of Monaco. Accessibility: every step produces a one-sentence narration in an `aria-live="polite"` region ("line 9: `ada.friends` now references Bob"), and the snapshot is also rendered as DOM tables (frames, heap, queues) that serve as the canvas fallback; the 2D SVG and the 3D view are both projections of that same data. Keep the existing keyboard map (arrows to step) and `useReducedMotion`.

## **Ranked ideas (payoff for effort)**

1. **Adopt one snapshot schema shaped like Python Tutor's trace and the story step model** (frames with slots, heap keyed by id, `refId` references, explicit event types). It unlocks every item below and lets `StackHeap2D`/`StackHeap3D` become playground lenses, which is the rollout step the 3D standard already names.
2. **Stable object ids with a `WeakMap` and a reachability walk** in place of `safeClone`. Small change, fixes the largest teaching gap (aliasing).
3. **Step budget that throws, partial trace kept, Worker `terminate()` as backstop.** Fixes a present correctness risk.
4. **Predict mode on the timeline**, with questions generated from the trace. Highest learning payoff per line of code according to [S39][S41][S42].
5. **Traced event loop in the sandbox** (own queues, virtual clock, `await` rewrite). Gives the event-loop lens real data; moderate effort, needs an ordering test corpus.
6. **Scope records with creation-scope ids** for closures and retained scopes.
7. **Lesson deep links and PRIMM ladders** (`?scenario`/snippet, lens, step).
8. **Position-preserving TypeScript stripping**, erasable syntax only.
9. **Python parity** by emitting the same schema from the `settrace` wrapper with `id()` keys.
10. **Step narration and DOM table mirror** for accessibility, plus the tabbed small-screen layout.

## **Tracer architecture: instrumentation or interpreter**

Stay with **AST instrumentation running on the browser's own engine**, and deepen it (expression-level hooks, ids, scope records, a traced event loop). Reasons: it keeps current ES syntax for free, adds no large payload, runs at near-native speed, and Loupe, JS Visualizer 9000, Quokka and Jalangi2 all show the approach scales to the events we need [S6][S7][S14][S21]. The interpreter route gives total visibility and true pause/resume, but JS-Interpreter is ES5-only and about 200x slower [S18], Sval documents no step hooks [S19], and QuickJS-in-WASM has no stepping or heap API, so it would still need the same instrumentation while adding 0.5 to 1.3 MB [S20]. **Trade-off accepted:** instrumentation sees only what it rewrites. Built-in internals (native `await` scheduling, callbacks invoked by `Array.prototype.map`, getters, engine GC) are invisible unless each is given a hook, and the traced event loop is our model of the specification rather than the engine itself, so it must be tested against known orderings.

## **Could not verify**

- Python Tutor's original repository (`pgbovine/OnlinePythonTutor`) now returns 404; the trace-format doc and `jslogger.js` were read from a third-party backup fork [S2][S3]. The UIST 2021 design-guidelines paper was not retrieved.
- How ui.dev's JavaScript Visualizer, VisuAlgo, Thonny and the recursion visualizers obtain their traces.
- Loupe's use of a Web Worker; Bycroft's walkthrough and camera behaviour; WebContainers internals.
- CodeCity effect sizes; full results of Cockburn and McKenzie; the 2026 VR study; Parsons-problem findings; the original Hundhausen and Naps texts (abstracts and summaries only).
- Any peer-reviewed research on novice misconceptions about the JS event loop.
- That Monaco's TypeScript worker emit preserves line numbers; the Python version in Pyodide v0.27.7; `executePendingJobs` accepting a job count; that a wrapped `then` plus `await` rewrite matches native ordering in all cases.

## **Sources**

- [S1] Guo, "Online Python Tutor: Embeddable Web-Based Program Visualization for CS Education", SIGCSE 2013. https://pg.ucsd.edu/publications/Online-Python-Tutor-web-based-program-visualization_SIGCSE-2013.pdf
- [S2] Online Python Tutor, "Execution Trace Format" (backup fork of the original repo). https://github.com/zetaloop/OnlinePythonTutor-Backup/blob/HEAD/v3/docs/opt-trace-format.md
- [S3] Online Python Tutor JS backend `jslogger.js` (same backup fork). https://github.com/zetaloop/OnlinePythonTutor-Backup/blob/HEAD/v4-cokapi/backends/javascript/jslogger.js
- [S4] Python Tutor, "Unsupported features". https://github.com/pythontutor-dev/pythontutor/blob/master/unsupported-features.md
- [S5] Python Tutor, JavaScript visualizer guide for teachers. https://pythontutor.com/articles/javascript-visualizer.html
- [S6] Loupe source (`lib/instrument-code.js`, `lib/delay.js`, `components/`). https://github.com/latentflip/loupe
- [S7] JS Visualizer 9000 server (`src/worker/worker.js`, README). https://github.com/Hopding/js-visualizer-9000-server ; client: https://github.com/Hopding/js-visualizer-9000-client
- [S8] vm2 README, security disclaimer. https://github.com/patriksimek/vm2
- [S9] Lydia Hallie, "JavaScript Visualized: Event Loop" (post and comments). https://dev.to/lydiahallie/javascript-visualized-event-loop-3dif
- [S10] Algorithm Visualizer `tracers.js`. https://github.com/algorithm-visualizer/tracers.js
- [S11] Thonny. https://thonny.org/
- [S12] Replay, "How Replay works". https://blog.replay.io/how-replay-works
- [S13] rr project. https://rr-project.org/
- [S14] Quokka.js, "How does it work?". https://www.quokkajs.com/docs/how-does-it-work.html
- [S15] WebContainers introduction. https://webcontainers.io/guides/introduction
- [S16] Sandpack client docs. https://sandpack.codesandbox.io/docs/advanced-usage/client
- [S17] Observable runtime. https://github.com/observablehq/runtime
- [S18] JS-Interpreter documentation. https://neil.fraser.name/software/JS-Interpreter/docs.html
- [S19] Sval. https://github.com/Siubaak/sval
- [S20] quickjs-emscripten. https://github.com/justjake/quickjs-emscripten
- [S21] Jalangi2. https://github.com/Samsung/jalangi2
- [S22] MDN, `WeakMap`. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
- [S23] MDN, "Using microtasks in JavaScript with queueMicrotask()". https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide
- [S24] Angular, zoneless guide (v19). https://v19.angular.dev/guide/experimental/zoneless
- [S25] loop-protect. https://github.com/jsbin/loop-protect
- [S26] Pyodide, "Interrupting execution". https://pyodide.org/en/stable/usage/keyboard-interrupts.html
- [S27] Node.js, "Modules: TypeScript" (type stripping). https://nodejs.org/api/typescript.html
- [S28] Bloomberg, ts-blank-space. https://bloomberg.github.io/ts-blank-space/
- [S29] TypeScript, `erasableSyntaxOnly`. https://www.typescriptlang.org/tsconfig/erasableSyntaxOnly.html
- [S30] Sucrase. https://github.com/alangpierce/sucrase
- [S31] Python docs, `sys.monitoring`. https://docs.python.org/3/library/sys.monitoring.html
- [S32] Pyodide changelog. https://pyodide.org/en/stable/project/changelog.html
- [S33] Ciechanowski, "Mechanical Watch". https://ciechanow.ski/mechanical-watch/
- [S34] Bycroft, llm-viz. https://github.com/bbycroft/llm-viz ; https://bbycroft.net/llm
- [S35] Wettel, Lanza, Robbes, "Software Systems as Cities: A Controlled Experiment", ICSE 2011 (abstract). https://2011.icse-conferences.org/content/software-systems-cities-controlled-experiment.html
- [S36] Cockburn, McKenzie, "Evaluating the Effectiveness of Spatial Memory in 2D and 3D Physical and Virtual Environments", CHI 2002. https://dx.doi.org/10.1145/503376.503413
- [S37] Shneiderman, "Why Not Make Interfaces Better than 3D Reality?", IEEE CG&A 2003. https://drum.lib.umd.edu/handle/1903/6523
- [S38] "Immersion vs. familiarity: A controlled experiment of software evolution visualization in virtual reality", Empirical Software Engineering 2026. https://link.springer.com/article/10.1007/s10664-026-10836-0
- [S39] Hundhausen, Douglas, Stasko, "A Meta-Study of Algorithm Visualization Effectiveness", JVLC 2002, DOI 10.1006/JVLC.2002.0237. https://www.academia.edu/15636659/A_Meta_Study_of_Algorithm_Visualization_Effectiveness
- [S40] Naps et al., "Exploring the role of visualization and engagement in computer science education", ITiCSE-WGR 2002. https://rex.libraries.wsu.edu/esploro/outputs/journalArticle/Exploring-the-role-of-visualization-and/99900547176001842
- [S41] Sentance, Waite, Kallia, "Teaching computer programming with PRIMM: a sociocultural perspective", Computer Science Education 2019, DOI 10.1080/08993408.2019.1608781. https://qmro.qmul.ac.uk/xmlui/handle/123456789/57800
- [S42] Ma, Ferguson, Roper, Wood, "Investigating the viability of mental models held by novice programmers" (2007) and follow-ups. https://strathprints.strath.ac.uk/3145/ ; https://strathprints.strath.ac.uk/32524/
- [S43] Victor, "Learnable Programming". https://worrydream.com/LearnableProgramming/
- [S44] Victor, "Explorable Explanations". https://worrydream.com/ExplorableExplanations/
- [S45] Ericson et al., "Parsons Problems and Beyond", ITiCSE-WGR 2022. https://aaltodoc.aalto.fi/items/a77c8afa-0f57-4ef6-85d2-4f982776677c
- [S46] Monaco Editor README (FAQ). https://github.com/microsoft/monaco-editor
- [S47] CodeMirror. https://codemirror.net/
- [S48] W3C, Understanding SC 1.4.10 Reflow. https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- [S49] HTML Standard, the `canvas` element. https://html.spec.whatwg.org/multipage/canvas.html
- Local: `docs/3D-Visualization-Standard.md`, `docs/Playground-Developer-Guide.md`, `src/features/playground/services/instrumentCode.ts`, `src/features/javascript/utils/stackHeapStory.ts`, `.agents/skills/modern-web-guidance/guides/visual-design/`.
