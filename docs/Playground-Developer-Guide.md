# Playground Developer Guide

> Internal reference for contributors working on the Code Executives Playground.

> **Words.** This guide follows the glossary in [CONTEXT.md](../CONTEXT.md): the record of a run is a **trace** made of **steps**, each step holds a **snapshot**, a **lens** chooses which part of a snapshot is drawn, prebuilt code is an **example**, and the output pane is the **Console**. [ADR 0004](adr/0004-playground-traces-share-the-snapshot.md) is the decision behind the design.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Runs, Stop and Limits](#runs-stop-and-limits)
3. [Directory Structure](#directory-structure)
4. [The Lenses](#the-lenses)
5. [How to Add a New Lens](#how-to-add-a-new-lens)
6. [How to Add a New Language](#how-to-add-a-new-language)
7. [How to Modify the Theme](#how-to-modify-the-theme)
8. [Settings](#settings)
9. [How to Add Examples](#how-to-add-examples)
10. [How to Add an Exercise](#how-to-add-an-exercise)
11. [Links into the Playground](#links-into-the-playground)
12. [Security Considerations](#security-considerations)
13. [Performance Budget & Monitoring](#performance-budget--monitoring)
14. [Testing](#testing)

---

## Architecture Overview

The Playground is a **standalone feature module** at `src/features/playground/` that runs in its own layout (no Header/Footer/Sidebar). It opens in a new browser tab at `/playground`.

### Key Design Decisions

| Decision                                        | Rationale                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Standalone layout (`PlaygroundLayout`)          | Full viewport needed for editor + lenses                                       |
| Dark theme scoped via `data-theme="playground"` | CSS custom properties avoid polluting the light-mode main site                 |
| Sandboxed `<iframe>` for JS/TS execution        | Defense-in-depth: CSP + `sandbox="allow-scripts"` + network API blocking       |
| Pyodide for Python                              | WASM-based CPython in the browser, lazy-loaded from CDN (~11 MB)               |
| `acorn` + `astring` for JS instrumentation      | Parse → transform → regenerate; the code runs on the browser's own engine      |
| A loop guard for runs with Trace off            | Counting calls spliced into the learner's own text stop code that does not end |
| `sys.settrace()` for Python instrumentation     | CPython's native tracing mechanism, captured via Pyodide FFI                   |
| One snapshot shape, shared with the stories     | A lens draws a step with the same 2D/3D views a story uses (ADR 0004)          |

### Data Flow

A run produces a trace (`Trace`: its `Step[]`, an outcome and, for a run that failed, the error) and the Console entries (`ConsoleEntry[]`). Every step holds a snapshot in the shape of `src/shared/snapshot`, the line that ran, and a focus: the entities that step created and the slots it changed.

```
JS / TS code → [tracer/instrument] → instrumented code ─┐
                                                         ↓
              SandboxFrame (iframe) ← tracer runtime as source + limits
                                                         ↓
                                              Trace + ConsoleEntry[]
                                                         ↓
                         [useTrace] → StepControls (step by step, editor line)
                         [Lens]     → VisualizationCanvas → StackHeapLens | StackQueuesLens
                         [Console]  → ConsoleOutput
```

With Trace off the same sandbox runs the code with no tracer: `guardLoops()` (`tracer/loopGuard.ts`) adds counting calls, and the run sends back Console entries and no trace.

- **JavaScript.** With Trace on, `PlaygroundApp` calls `instrument()` and sends the result to the sandbox together with `runtimeSource` (the tracer runtime as a string) and the limits from `resolveTraceLimits()`. The sandbox script builds the tracer, runs the code with it, waits for pending timers, and posts the trace back with its report.
- **JavaScript, Trace off.** `PlaygroundApp` calls `guardLoops()` and sends the guarded code with its `guard` (`{ name, limit, message }`). See [Runs, Stop and Limits](#runs-stop-and-limits).
- **TypeScript.** `services/transpileTypeScript.ts` strips the types first, and the JavaScript it emits takes the same path as JavaScript, traced or guarded. Its `mapLine` is applied to every step's `line`, to `trace.error.line` (`mapTraceLines` in `useSandbox.ts`) and to the line of an uncaught error in the Console.
- **Python.** `PythonInstrumenter.ts` records a line, the call stack and the running function's locals with `sys.settrace`; `parsePythonSteps` turns that into `Step[]`. Python records values only: its snapshots have frames and no heap objects.

### How a traced run ends

| Outcome      | What happens                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `completed`  | The sandbox reports once no timer is pending; steps recorded by late callbacks are in the trace           |
| `step-limit` | The tracer stops the run (an infinite loop ends); the steps so far are kept and the Console gets one note |
| `error`      | The Console shows the uncaught error with its line; the steps up to it are kept                           |

Code that does not parse, or that the tracer cannot rewrite, never reaches the sandbox: the Console says why there are no steps. It is not run untraced behind the learner's back.

---

## Runs, Stop and Limits

### A run with Trace off: the loop guard

With Trace off the code is not rewritten by the tracer and runs on the sandbox iframe's own thread, so `while (true) {}` would block it for good. `tracer/loopGuard.ts` is a second, much lighter instrumentation that only counts.

- `guardLoops(code)` parses with the same parser as the tracer (`parseLearnerCode` in `instrument.ts`) and **splices text into the learner's own source**: `__g();` at the start of every loop body (`for`, `for…in`, `for…of`, `while`, `do…while`) and of every function body (declarations, expressions, arrows, methods, getters and setters, async and generator functions), and `__g.c();` at the start of every `catch` and `finally` block. A loop or arrow without braces gets them. Nothing is regenerated and no line break is added, so every statement stays on its line and an error still reports the learner's line.
- The counter's name is `__g`, with underscores added until the code does not contain it.
- The sandbox script supplies the counter (`makeGuard` in `sandboxRuntime.ts`). All counted points of a run share one count: synchronous code, code after an `await`, timer callbacks and promise callbacks alike. Past `LOOP_GUARD_LIMIT` (1,000,000; an exported constant, not a setting) the counter throws, and it throws again at every later counted point and at the start of every `catch` and `finally`, so the learner's own error handling cannot swallow the stop.
- The run then ends as an error with one Console entry, `loopGuardMessage()`: "Stopped after 1,000,000 loop turns and calls: a loop or recursion probably does not end. Turn Trace on to watch it step by step." The sandbox ends the run from a task of its own, so it ends even when promise machinery took the signal (`promise.then(null, console.log)`).
- Code that `guardLoops` cannot parse is sent as it is, without a guard: `new Function` then throws, and the Console shows the engine's own `SyntaxError`, as it did before the guard existed.

**What the guard cannot stop.** It counts only code it rewrote. One call of a built-in that runs long without calling back into the learner's code is not counted (`'x'.repeat(2 ** 29)`, a regular expression that backtracks without end, sorting a huge array with the default comparison), and neither is code made from a string at run time (`eval`, `new Function`, `setTimeout('…')`). A recursion that does not end usually overflows the stack first and is reported as the engine's `RangeError`. A chain of timers is counted, but each turn takes real time, so the 10-second cap below ends it first.

### How long a run may take

`DEFAULT_EXECUTION_TIMEOUT_MS` (`types/playground-v2.ts`) is 10 seconds. It is fixed: there is no setting. At that time the sandbox script ends a run that still has timers pending, with a note in the Console ("Stopped after 10s with 1 timer still pending…"). A check of an exercise gets `CHECK_TIMEOUT_MS`, 5 seconds.

`SandboxFrame` waits 1.5 seconds longer as a backstop. If the sandbox has not answered by then, the run resolves with "Execution timed out", and **the iframe is discarded and replaced**, because a sandbox that did not answer cannot be trusted with the next run.

### Stop

Stop (`terminate()` in `SandboxFrame.tsx`) rejects the pending run and **discards the iframe**: the component keeps a `{ id, srcDoc }` in state and renders `<iframe key={id}>`, so a new id makes React remove the element, which destroys its document with its timers and promise work, and mount a fresh one with a new CSP nonce. A run started while another is pending does the same. A fresh iframe posts `ready` once its script listens; a run asked for before that is held and sent then. Messages are accepted only from the current iframe's window, so nothing a discarded one still sends is heard.

**What Stop cannot interrupt.** Discarding the iframe only happens when the page's own thread gets to run. Chromium runs a sandboxed iframe without `allow-same-origin` in a process of its own, so there the page stays responsive during a synchronous loop and Stop ends it. A browser that runs the iframe on the page's thread freezes with it: the click on Stop is not handled until the loop ends, and neither is the backstop's timer. In those browsers the loop guard (Trace off) and the step limit (Trace on) are what end a loop; code neither of them counts, listed above, can still freeze the page.

Python runs in Pyodide on the page's thread and has no Stop that interrupts it; the Stop button only marks the run as ended.

### Limits

| Limit                                 | Value       | Where                                                 |
| ------------------------------------- | ----------- | ----------------------------------------------------- |
| Steps of a trace                      | 2,000       | `DEFAULT_MAX_STEPS`, `tracer/types.ts`                |
| Loop turns and calls, Trace off       | 1,000,000   | `LOOP_GUARD_LIMIT`, `tracer/loopGuard.ts`             |
| Run time                              | 10 s        | `DEFAULT_EXECUTION_TIMEOUT_MS`                        |
| Slots recorded per frame or object    | 20          | `MAX_SLOTS`, `tracer/types.ts`                        |
| Heap objects recorded per snapshot    | 60          | `MAX_HEAP_OBJECTS`, `tracer/types.ts`                 |
| Frame boxes drawn                     | 5           | `MAX_DRAWN_FRAMES`, `lenses/stackHeapLensModel.ts`    |
| Heap objects drawn in 2D              | 20 (5×4)    | `HEAP_LIMITS['2d']`, same file                        |
| Heap objects drawn in 3D              | 9 (3×3)     | `HEAP_LIMITS['3d']`, same file                        |
| Queue entries drawn per region        | 6           | `MAX_DRAWN_ENTRIES`, `lenses/stackQueuesLensModel.ts` |
| Code length                           | 50 KB       | `MAX_CODE_LENGTH`, `hooks/useSandbox.ts`              |
| Console entries / length of one entry | 500 / 10 KB | `utils/sanitize.ts`, `sandboxRuntime.ts`              |

---

## Directory Structure

```
src/features/playground/
├── PlaygroundEntry.tsx            # Lazy-loaded entry for the /playground route
├── PlaygroundApp.tsx              # Root orchestrator
├── PlaygroundApp.test.tsx
├── PlaygroundApp.exercises.test.tsx # Links, exercises and the Task tab, on the real sandbox script
├── types/
│   ├── index.ts                   # Re-exports
│   └── playground-v2.ts           # Language, lens, execution state, Console entry
├── tracer/                        # The JavaScript tracer (ADR 0004)
│   ├── instrument.ts              # Rewrites the learner's code (acorn + astring)
│   ├── loopGuard.ts               # Trace off: counting calls spliced into the learner's text
│   ├── runtime.ts                 # What instrumented code calls; also exported as source
│   ├── trace.ts                   # Runs a trace without the sandbox (tests)
│   ├── types.ts                   # Trace, Step, limits
│   └── index.ts                   # Public API
├── hooks/
│   ├── useMonaco.ts               # Monaco lifecycle + theme
│   ├── usePlaygroundState.ts      # Language, code, execution state
│   ├── useSandbox.ts              # JS/TS sandbox execution; maps a trace's lines
│   ├── usePyodide.ts              # Python/Pyodide execution
│   ├── useTrace.ts                # The trace held, the current step, auto-play
│   └── usePaneLayout.ts           # Resizable 3-pane layout; widens the lens pane for 3D
├── instrumentation/
│   └── PythonInstrumenter.ts      # Python sys.settrace wrapper → Step[]
├── services/
│   ├── transpileTypeScript.ts     # Strips types with Monaco's TypeScript worker
│   ├── sourceMapLines.ts          # Emitted line → source line
│   └── pyodide-loader.ts          # Loads Pyodide
├── utils/
│   ├── codeTemplates.ts           # Default starter code per language
│   ├── examples.ts                # The examples
│   ├── playgroundLink.ts          # The link contract: ?example=, ?exercise=, ?lens=
│   ├── playgroundStart.ts         # What a link opens; keeps the address bar in step
│   └── sanitize.ts                # Output limits
├── exercises/
│   ├── types.ts                   # Exercise, check, check result
│   ├── exercises.ts               # The exercises
│   ├── catalog.ts                 # The exercises as cards for a module page
│   ├── runChecks.ts               # Runs the checks; builds the code of a watched check
│   ├── exerciseProgress.ts        # Passed, solution seen and last code per viewer (localStorage)
│   ├── useMilestonesReached.ts    # The milestones a pass has just earned (ADR 0005)
│   └── sandboxForTests.ts         # Test support: the real sandbox script in the test window
├── components/
│   ├── editor/
│   │   ├── MonacoEditor.tsx       # Monaco wrapper; highlights the step's line
│   │   ├── EditorTabs.tsx         # File tab bar
│   │   └── LanguagePicker.tsx     # Language dropdown
│   ├── execution/
│   │   ├── SandboxFrame.tsx       # Sandboxed iframe for JS/TS; Stop replaces it
│   │   ├── sandboxRuntime.ts      # The script that runs inside the iframe
│   │   ├── ConsoleOutput.tsx      # The Console
│   │   ├── PythonRunner.tsx       # Pyodide loading indicator
│   │   └── ExecutionController.tsx
│   ├── instrumentation/
│   │   └── StepControls.tsx       # Step slider, playback, top frame + call stack
│   ├── exercises/
│   │   ├── ExerciseMenu.tsx       # The toolbar's Exercises menu, grouped by level
│   │   ├── TaskPanel.tsx          # The task, the checks with their results, the hints
│   │   ├── SolutionSection.tsx    # The solution: the question, the explanation, the code, Load and Watch
│   │   ├── PassedMark.tsx         # "Passed", and "solution seen" beside it
│   │   ├── Prose.tsx              # Task, hint and explanation text: paragraphs and `code`
│   │   ├── solutionSeenContext.ts # Seen-solution ids for the Exercises menu
│   │   └── ConfirmBar.tsx         # The question asked before the learner's code is replaced
│   ├── visualizations/
│   │   ├── VisualizationCanvas.tsx
│   │   ├── LensSelector.tsx
│   │   ├── lensViewer.ts          # The least width of a lens's 3D viewer
│   │   └── lenses/
│   │       ├── StackHeapLens.tsx        # The stack and heap regions of the current step
│   │       ├── stackHeapLensModel.ts    # What that lens draws: limits, placement, words
│   │       ├── StackQueuesLens.tsx      # The stack, the microtask and task queues, the timers
│   │       └── stackQueuesLensModel.ts  # What that lens draws
│   ├── layout/
│   │   ├── PlaygroundLayout.tsx
│   │   ├── PlaygroundToolbar.tsx
│   │   ├── PaneResizer.tsx
│   │   ├── RightPaneTabs.tsx      # The right pane's two tabs: Task and Console
│   │   ├── SettingsPanel.tsx      # Font size and word wrap
│   │   ├── playgroundSettings.ts  # The settings, their defaults, load and save
│   │   └── BackToSiteLink.tsx
│   └── theme/
│       ├── tokens.ts              # Design tokens
│       ├── playground-theme.css   # CSS custom properties
│       └── SpaceBackground.tsx    # Animated canvas starfield
└── __tests__/
    └── integration.test.ts        # Cross-module integration tests
```

---

## The Lenses

A lens chooses which regions of a snapshot are drawn. It never brings its own renderer: it draws with the shared 2D and 3D views, so every lens works in both (ADR 0004, `docs/3D-Visualization-Standard.md`). There are two lenses, and "None":

| Lens id        | Toolbar label  | Draws                                                     | Shared views                                                |
| -------------- | -------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| `stack-heap`   | Stack & Heap   | The call stack and the heap, with references              | `StackHeapView2D`, `viz3d/stackheap/StackHeapView3D` (lazy) |
| `stack-queues` | Stack & Queues | The call stack, the microtask and task queues, the timers | `EventLoopView2D`, `viz3d/eventloop/EventLoopView3D` (lazy) |

The Data Structures and Streams lenses were removed.

### What the Stack & Heap lens draws

A trace has no author, so `lenses/stackHeapLensModel.ts` decides what stays legible.

- **Frames.** At most five frame boxes. A deeper stack is drawn as the global frame, one placeholder ("… N more frames") and the top three frames.
- **Heap objects.** Each view has its own largest floor (`HEAP_LIMITS`): **20 objects in 2D** (5 columns × 4 rows) and **9 in 3D** (3 × 3, the floor `viz3d/stackheap/layout.ts` is tuned for). `heapFloorFor` gives a run the fewest columns that hold its fullest step: 2, then 3, and in 2D 4 and 5. A step with more objects than the view's limit first hides the unreachable ones, with a note; if it still does not fit, or the tracer cut the heap short, the step is not drawn and the lens shows "Too large to draw" with the number the lens draws up to.
- **Placement.** `prepareTrace(steps, { view })` prepares the whole trace once per view. An object keeps its cell for as long as it is drawn, and the floor is one size for the whole run. A run in which every step fits 3D is placed the same in both views.
- **A step too large for 3D.** When the learner has chosen 3D and a step fits the 2D floor but not the 3D one, `viewForStep` draws that step in the 2D view, with one quiet line in the notes: "This step is too large for 3D, so it is shown in 2D". The choice itself is not changed, so the next step that fits is back in 3D.
- **Arrows in 2D.** On a floor larger than the story's 2×2, a reference between entities that are not neighbours runs along the gutters between columns and the bands above rows (`refPath` in `shared/components/viz/stackheap/heapGeometry.ts`), so it never passes behind an object. On a 2×2 floor every arrow is one curve, as in the Stack ↔ Heap story.
- **The 2D drawing is never scaled below 0.8** (`MIN_2D_SCALE`); a pane too small for it scrolls.
- **Middle frames in 3D.** A frame that is neither the bottom nor the top of the stack has one row for its slots. With more than two slots it shows two and "+N more"; the slots the step changed are chosen first, and with more than two of those the first two are shown (`frameLabelPlan` in `viz3d/stackheap/layout.ts`, drawn by `FrameRow.tsx`). The bottom and top frames list their slots one per line.

The Stack & Queues lens has its own limit, six entries per region (`MAX_DRAWN_ENTRIES`), and no heap limit.

### The pane and the 3D view

A lens's 3D viewer is at least 760 × 520 px (`VIEWER_3D_MIN_WIDTH` in `lensViewer.ts`, and the `min-w-[760px]` class in each lens), because its labels are DOM cards of a fixed size. The lens pane is narrower than that by default at common window sizes. When the learner picks 3D with the toggle, the lens calls `onViewChange`, and `PlaygroundApp` measures the pane and calls `widenMiddle` (`hooks/usePaneLayout.ts`): the pane grows to fit the viewer, taking room from the editor and from the Task and Console pane in proportion to what each can spare above its minimum (320 px and 240 px, and the 15% a drag is held to). When the two together cannot spare enough, nothing moves and the pane scrolls as before. This happens only at the moment of switching; afterwards the dividers are the learner's, and a double-click on a divider restores the defaults.

---

## How to Add a New Lens

A new lens follows the two above: it picks regions of the snapshot and hands them to shared views. If it draws heap objects it uses the limits above rather than limits of its own.

1. **Create the lens component** in `components/visualizations/lenses/`. It takes the whole trace and the index of the step to draw, so that entities keep their cells for the whole run:

```tsx
// MyLens.tsx
import React from 'react';
import type { Step } from '../../../tracer';

interface MyLensProps {
  steps: readonly Step[];
  index: number;
}

const MyLens: React.FC<MyLensProps> = ({ steps, index }) => {
  const { snapshot, focus } = steps[index];
  // Pick the regions of `snapshot` this lens shows and hand them to the shared views
  return null;
};

export default MyLens;
```

2. **Add the type** to `types/playground-v2.ts`:

```ts
export type VisualizationLens = 'stack-heap' | 'stack-queues' | 'my-lens' | 'none';
```

3. **Register the lens** in `VisualizationCanvas.tsx` with `React.lazy`, next to `StackHeapLens` and `StackQueuesLens`, and pass it `onViewChange` so the pane can widen for its 3D view. Anything that is not a known lens id draws the "select a lens" placeholder.

4. **Update `LensSelector.tsx`** (`LENS_OPTIONS`) to show the new lens in the toolbar, and `LENSES` in `utils/playgroundLink.ts` so a link can name it.

A trace is never presented as a story: a lens adds no authored captions and never shows a garbage-collection sweep, because a run cannot observe one.

---

## How to Add a New Language

1. **Add the type** in `types/playground-v2.ts`:

```ts
export type PlaygroundLanguage = 'javascript' | 'typescript' | 'python' | 'rust';
```

2. **Add a code template** in `utils/codeTemplates.ts`.

3. **Add the Monaco language mapping** in `hooks/useMonaco.ts`:

```ts
const LANGUAGE_MAP: Record<PlaygroundLanguage, string> = {
  // ...existing
  rust: 'rust',
};
```

4. **Create an execution hook** (e.g., `useRust.ts`) or extend an existing one. `usePyodide.ts` is the model. The hook must return:
   - a run function (`runPython(code)`, and `runPythonInstrumented(code)` for a traced run) → `Promise<{ error, trace }>`, where `trace` is a `Trace` from `tracer/` (or `null` for an untraced run). A new language emits the same snapshot shape; see `parsePythonSteps` for the smallest example.
   - `entries: ConsoleEntry[]`
   - `clearEntries()`

5. **Wire it into `PlaygroundApp.tsx`** — add the language to the `consoleEntries` selection logic and execution handlers.

6. **Add examples** in `utils/examples.ts`.

7. **Update `LanguagePicker.tsx`** to show the new language in the dropdown.

---

## How to Modify the Theme

All playground styling is scoped under `[data-theme="playground"]` via CSS custom properties.

### Files

| File                                        | Purpose                                                 |
| ------------------------------------------- | ------------------------------------------------------- |
| `components/theme/tokens.ts`                | JS design tokens (exported for Monaco theme)            |
| `components/theme/playground-theme.css`     | CSS custom properties under `[data-theme="playground"]` |
| `hooks/useMonaco.ts` → `createSpaceTheme()` | Monaco editor dark theme                                |
| `components/theme/SpaceBackground.tsx`      | Animated canvas starfield                               |

### Modifying Colors

1. Edit `tokens.ts` for any color referenced by Monaco or JS components.
2. Edit `playground-theme.css` for CSS custom properties (`--pg-*`).
3. Both must stay in sync. The token values are the source of truth.

### Custom Properties Reference

```css
--pg-bg-primary          /* Main background */
--pg-bg-secondary        /* Panel backgrounds */
--pg-bg-surface          /* Surface elements */
--pg-bg-surface-hover    /* Hover state */
--pg-bg-toolbar-translucent /* Toolbar with backdrop blur */
--pg-text-primary        /* Primary text */
--pg-text-secondary      /* Secondary text */
--pg-text-muted          /* Muted/disabled text */
--pg-accent-blue         /* Electric blue accent */
--pg-accent-green        /* Neon green accent */
--pg-accent-amber        /* Amber/warning */
--pg-accent-red          /* Red/error */
--pg-border              /* Standard border */
--pg-font-mono           /* Monospace font stack */
```

---

## Settings

The settings panel (`components/layout/SettingsPanel.tsx`) has two settings, both for the editor: **Font Size** (10 to 22 px, default 14) and **Word Wrap** (default off). `components/layout/playgroundSettings.ts` holds the type, the defaults, and `loadSettings` / `saveSettings`, which keep them in `localStorage` under `pg-settings`.

`loadSettings` reads the stored object key by key and takes only a value of the right type, so settings stored by an earlier version still load. That version also stored `executionTimeoutMs` and `animationsEnabled`; nothing ever read them, they were removed, and a stored object that has them loads without them. Add a setting only together with the code that reads it.

The pane layout is not a setting: `usePaneLayout.ts` keeps the two divider positions under `pg-pane-layout-v2`. The 2D / 3D choice of each lens is kept under its own key by `useViewChoice`.

---

## How to Add Examples

An example is prebuilt code the learner can load and run, with a suggested lens. Edit `utils/examples.ts` (the type is `Example`):

```ts
{
  id: 'unique-id',           // Must be unique; the value of ?example= in a link
  label: 'Display Name',
  description: 'Brief description shown in dropdown',
  language: 'javascript',    // Must be a valid PlaygroundLanguage
  suggestedLens: 'stack-heap', // 'stack-heap', 'stack-queues' or 'none'
  code: `// Your code here
const x = 1;
console.log(x);`,
  // Only for code the site already shows: where it comes from, and so where its link back leads
  source: { kind: 'story', label: 'Stack ↔ Heap', href: '/javascript?section=…' },
},
```

An example that is a story's program or a section's sample imports that same string from the module's pure data, so the two cannot drift apart; a section's sample becomes an example through `fromSection`.

Examples appear in the toolbar's "Examples" menu: the selected language's examples in groups (the stories' programs, then standalone programs, then each section's samples), and the other languages' examples dimmed below them. An example can be opened by a link: see [Links into the Playground](#links-into-the-playground).

---

## How to Add an Exercise

An exercise is a task with a goal, checks that pass or fail on the learner's code, hints, and a solution the learner can ask to see (see [CONTEXT.md](../CONTEXT.md)). Exercises are JavaScript only for now. They carry no score, points or streaks, and nothing is called an achievement: a passed exercise counts towards milestones ([ADR 0005](adr/0005-progress-and-milestones-not-gamification.md)).

### The shape

Add an entry to `exercises/exercises.ts` (the type is `Exercise` in `exercises/types.ts`):

```ts
{
  id: 'two-sum',                 // Stable; the value of ?exercise= in a link
  title: 'Two Sum',
  level: 'easy',                 // 'easy' | 'medium' | 'hard': the group in the Exercises menu
  summary: 'Find the two numbers in an array that add up to a target, and return their indices.',
                                 // One plain sentence, at most 110 characters: the task
  teaches: [                     // The sections that teach it, the main one first. Leave it
                                 // out when no section does
    { label: 'Data Structures: Hash Tables', href: '/datastructures?section=Hash%20Tables' },
  ],
  task: `Write \`twoSum(nums, target)\`. ...`, // Prose: what to write and the goal.
                                 // Empty line = new paragraph, backticks = code
  starterCode: `function twoSum(nums, target) {\n}\n`, // Must fail at least one check
  entry: 'twoSum',               // The function the checks call, defined at top level
  compare: 'any-order',          // Only when the task says "in any order" (see below)
  checks: [
    { args: [[2, 7, 11, 15], 9], expected: [0, 1], explanation: 'Shown when it fails' },
    { args: [[0, 4, 3, 0], 0], expected: [0, 3], hidden: true }, // Reports pass or fail only
  ],
  hints: ['First hint', 'Second hint'], // Revealed one at a time, in this order
  solution: {
    code: `function twoSum(nums, target) { ... }\n`, // Complete code; passes every check
    explanation: 'Walk the array once and keep ...',  // Two to four plain sentences
  },
  suggestedLens: 'stack-heap',
},
```

Rules the data must keep:

- **Checks are plain data.** `args` and `expected` are JSON values, because they cross `postMessage` into the sandbox. A list or a tree is passed as nested plain objects (`{ val: 1, next: null }`), and the task must say so. If the thing under test is a class, write a small driver function below it in the starter code, name it as the `entry`, and say in the task what it does (see `implement-queue-using-stacks`).
- **Comparison is structural and strict**: primitives by value, arrays by position, plain objects by their own keys, no coercion (`undefined` is not `null`, `"1"` is not `1`). Set `compare: 'any-order'` only when the task says the order of the returned list is open; the list is then compared as a collection. A test fails if the task and the flag disagree.
- **Checks are synchronous.** A check run ends with the script's synchronous part, so an `async` entry function cannot pass.
- **Keep the inputs small.** A check gets the same 2,000-step budget as a watched run (`CHECK_MAX_STEPS`), so a call that passes can always be watched to its end.
- **The solution leaves room.** A test traces the solution on every check and fails above 600 steps, so a learner's slower but correct way (a full sort where a heap would do) still ends inside the budget.
- **The summary says the task, not the technique**: one plain sentence of at most 110 characters, with no code in it. Module pages show it in their lists of exercises.
- **`teaches` names real sections.** A lesson's `label` is the module's title, a colon, and the section's sidebar label (`Data Structures: Hash Tables`), because the Playground shows it outside the module's own page. Its `href` is the section's address exactly as `src/shared/constants/moduleNavigation.ts` has it (Big-O uses slugs: `/bigo?section=real-world-applications`). The first lesson is the Task panel's "Learn this first" link, the others follow as "Also taught in", and every listed section shows the exercise at its end. Leave `teaches` out when no section teaches the idea (`maximum-subarray`); nothing is shown then. A test resolves every `href` against the navigation data.
- **Every exercise needs a solution and an explanation**, in its `solution`. `solution.code` is the whole code as it would stand in the editor (for a class exercise it includes the driver function), because the learner can load it there and watch it run. `solution.explanation` is two to four plain sentences for a learner on the idea: why it works and what it costs. Explain any term of art where it appears ("a Set, a collection that holds each value at most once"); backticks mark code, as in the task. `exercises/exercises.test.ts` runs the solution, and the starter code, through the real sandbox script: the solution must pass every check, the starter code must fail at least one, and the explanation must be two to four sentences.

### How a check runs

`exercises/runChecks.ts` is the runner. For each check, in order:

1. The learner's code gets one line appended that hands the entry function to a hook (`__pgCheck__(typeof entry === "function" ? entry : undefined)`), and the whole is instrumented like a traced run.
2. The sandbox (`sandboxRuntime.ts`, a run with `msg.check`) passes its own hook in. The hook calls the function with a copy of the check's arguments and compares the result with the expected value **inside the sandbox script's own scope**, then reports `{ status, actual }`. The verdict never passes through the Console, the learner's code cannot read the expected value, and the comparison uses built-ins captured before any learner code ran.
3. A check run sends no steps back and does not wait for timers.

One run per check gives each check a clean start and a full step budget. The statuses are `pass`, `fail`, `threw`, `missing` (no function with that name), `step-limit`, `not-reached` (a top-level `return`, or the hook was shadowed), `skipped` and `unavailable`. A syntax error is found by the instrumenter before anything runs and is reported once, with its line. A hidden check's result is reduced to pass, fail or skipped before it reaches the panel.

**Endless loops.** Checks always run instrumented, so the tracer's step limit ends a loop that does not end (`step-limit`); the loop guard of a run with Trace off plays no part in a check. After the first `step-limit` the remaining checks are skipped, because a recursion that never ends takes a second or two to reach the limit (every step snapshots the whole stack). If the sandbox does not answer a check at all, the host's backstop reports `unavailable` and replaces the iframe (see [Runs, Stop and Limits](#runs-stop-and-limits)).

**Not covered.** Code that sets out to cheat can still pass visible checks by returning their expected values, can take the hook from the function's `arguments`, and could forge a report if it found a way to the host window. Exercises are practice, not an exam: the aim is that honest mistakes (printing instead of returning, a helper with the hook's name) never count as a pass.

### Watching a check

Each visible check has a **Watch** action: it runs the learner's code plus that one call (`buildWatchCode`) as an ordinary traced run and loads the steps into the lens and the step controls. If no lens is on, the exercise's `suggestedLens` is selected. The call sits on a line after the learner's last line, so that step highlights nothing in the editor.

### The solution

After the hints the Task panel offers **Show solution** (`components/exercises/SolutionSection.tsx`). It is available at any time, and it asks once, in the page, before anything is shown ("See the solution? You can still solve it yourself first."); while hints are unrevealed the question says how many are left. A viewer who has seen an exercise's solution before is not asked again for it.

Shown, the section holds the explanation, the code read-only with a copy button, and two actions:

- **Load into the editor** replaces the editor's code with `solution.code`. If the editor holds anything but the starter code, the page asks first with the same `ConfirmBar` that guards Start over. The learner's code is never replaced without that answer.
- **Watch it run** traces `solution.code` plus the call of the first visible check (`buildWatchCode`, the path a check's Watch uses) into the lens. The editor keeps the learner's code. The steps' lines are lines of the solution, so the editor highlights nothing and the Task panel marks the current line in the solution's code instead.

Both are disabled while the language is not JavaScript.

### The UI and what is remembered

- The toolbar's **Exercises** menu (`components/exercises/ExerciseMenu.tsx`) lists the exercises by level.
- The right pane has two tabs, **Task** and **Console** (`components/layout/RightPaneTabs.tsx`). The Task tab (`components/exercises/TaskPanel.tsx`) shows the task, the checks with their results, the hints, and the solution when asked. With no exercise open it lists the exercises. An error a check threw is also written to the Console.
- Opening an exercise replaces the editor's code. If that code is the learner's own (not the default template, not an example, not another exercise's remembered code), the page asks first (`ConfirmBar.tsx`; never `window.confirm`).
- Under the title, the Task panel links to the exercise's first lesson ("Learn this first") and lists the others ("Also taught in"). The links open in a new tab, so the learner's code stays where it is.
- A module page lists exercises through `exercises/catalog.ts` and imports nothing else of the Playground's: `exerciseCards()` is every exercise as a card (title, level, summary, the link that opens it, its lessons), and `exerciseCardsFor(lessonHref)` is the cards of one section, in the Playground's order.
- `exercises/exerciseProgress.ts` remembers, per viewer in `localStorage` (`pg-exercise-progress`), which exercises were passed, which solutions were seen (`solutionSeen`), and the last code for each. Every read and write is wrapped in try/catch; without storage the same is kept in memory for the visit.
- An exercise that was passed and whose solution was seen is marked "Passed, solution seen" in the menu and in the Task panel (`components/exercises/PassedMark.tsx`). It is a plain fact for the learner: nothing is scored, withheld or taken away. The menu reads the seen ids from `SolutionSeenContext`, because the toolbar sits between it and the Playground's state.
- Ctrl+Shift+Enter runs the checks.

---

## Links into the Playground

`utils/playgroundLink.ts` is the contract: `parsePlaygroundLink(search)` and `playgroundHref(link)`. It has no imports that run, so a story section can build a link without loading the Playground. A link names things by id and never carries code.

| Parameter  | Effect                                                                                                  |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `exercise` | Opens that exercise (the viewer's last code for it, or its starter code) with the Task tab in front     |
| `example`  | Loads that example from `utils/examples.ts` and its `suggestedLens`. Ignored when `exercise` is present |
| `lens`     | `stack-heap`, `stack-queues` or `none`: overrides the suggested lens                                    |

`utils/playgroundStart.ts` resolves the link once, when `PlaygroundApp` mounts. An id nothing answers to falls back to the default template, silently. When the learner opens an exercise or an example from a menu, or leaves an exercise, `replacePlaygroundUrl` keeps the address bar in step with `history.replaceState` (no reload, no history entry), so the page can be shared at any time.

An example with a `source` (`{ kind, label, href }`) shows a link in the editor's tab bar while it is loaded: **Read the story** for a story's program, **Read the section: …** for a section's sample. The `href` must be a path inside the site.

---

## Security Considerations

### Sandbox Isolation

- JS/TS code runs in an `<iframe sandbox="allow-scripts">` with a strict CSP.
- Network APIs (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `importScripts`, `window.open`, `navigator.sendBeacon`) are blocked via `Object.defineProperty` on the iframe's `window`.
- `window.parent`, `window.top`, `window.opener` are overridden to prevent sandbox escape.

### Python Security

- A **security preamble** runs before user code, blocking `urllib`, `requests`, `httpx`, `aiohttp`, `socket`, `http`, `subprocess`, `os.system`, `os.popen`.
- Pyodide's `loadPackagesFromImports` is not called — only stdlib is available.

### Input Validation

- **Code size limit**: 50 KB max (`MAX_CODE_LENGTH` in `useSandbox.ts`).
- **Binary content detection**: `isTextContent()` rejects non-text input.
- **Rate limiting**: max 1 execution per second per hook instance for a run the learner starts. A run a control in the page starts on its own (watching a check, the checks of an exercise) is not limited.

### Output Sanitization

- Everything written to the console is rendered as a React text node, which React escapes. It is never HTML-escaped by hand first (that showed `&quot;` to the learner) and never set through `dangerouslySetInnerHTML`.
- `sanitizeOutput()` handles circular references, prototype pollution keys (`__proto__`, `constructor`), BigInt, Symbol, and deeply nested objects.
- Entry counts capped at `MAX_CONSOLE_ENTRIES` (500).
- Individual entries capped at `MAX_ENTRY_LENGTH` (10 KB).

### For Contributors

- **Never** use `dangerouslySetInnerHTML` with unsanitized console entries.
- **Never** inject user code directly into iframe `srcdoc` — always use `postMessage`.
- **Never** add `allow-same-origin` to the sandbox iframe.
- When adding new network/system APIs, block them in `sandboxRuntime.ts` (the script the iframe runs).
- The counter of the loop guard is a function the sandbox script makes per run. Never give guarded code anything else of the script's.

---

## Performance Budget & Monitoring

### Bundle Budgets

| Chunk                      | Budget                                        |
| -------------------------- | --------------------------------------------- |
| Playground app code        | < 60 KB gzipped                               |
| Monaco (loaded separately) | External, lazy-loaded                         |
| Pyodide (CDN)              | ~11 MB, lazy-loaded on first Python execution |

### Optimization Strategies

- **Trace limits** (`tracer/types.ts`): 2,000 steps per run, 20 slots per frame or object, 60 heap objects per snapshot. A step past the heap limit is marked `truncated`. The limits on what a lens draws are in [Runs, Stop and Limits](#limits).
- **The loop guard is cheap**: one call that increments a number at each loop turn and function entry. It records nothing.
- **Lazy lens**: `VisualizationCanvas` loads each lens with `React.lazy`; three.js is only ever imported by a lazy 3D view. `node .agents/skills/verify-viz/scripts/check-lazy-chunk.mjs` checks that after a build.
- **3D only when it is shown**: the trace is prepared for 3D only while 3D is chosen. A step drawn in 2D because it is too large for 3D unmounts the 3D view, and the next step that fits mounts it again.
- **Adaptive canvas**: `SpaceBackground` adjusts star count based on `navigator.hardwareConcurrency`.
- **Monaco features disabled**: `codeLens`, `colorDecorators`, `inlayHints`, `lightbulb`, `links`, `renderWhitespace`, `occurrencesHighlight`, `selectionHighlight`.
- **Lazy loading**: Monaco and Pyodide are loaded on demand, not at page load.

### Monitoring

Use `PerformanceDashboard` (bottom-right in dev mode) to watch:

- Component re-render frequency while stepping through a trace
- Bundle chunk sizes after `npm run build`
- Lighthouse performance score (target: > 80 for `/playground`)

---

## Testing

### Running Tests

```bash
npm test                              # Watch mode
npm run test:run                      # CI mode (single run)
npx vitest run src/features/playground/ # Playground tests only
npm run test:coverage                 # Coverage report
```

### Test Architecture

| Category          | Files                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tracer            | `tracer/*.test.ts` (instrumenting, the runtime as source, traces of the shipped examples)                                                                                                                                                                                                                                    |
| Loop guard        | `tracer/loopGuard.test.ts` (what is counted, lines kept, what `try`/`catch`/`finally` cannot swallow), and the guarded runs in `sandboxRuntime.test.ts`                                                                                                                                                                      |
| Sandbox script    | `sandboxRuntime.test.ts` runs the real iframe script, traced and with Trace off: aliasing, timers, the step limit, the loop guard, errors                                                                                                                                                                                    |
| Stop              | `SandboxFrame.test.tsx`: Stop and the timeout backstop replace the iframe, the next run waits for `ready` and goes to the new one                                                                                                                                                                                            |
| Lenses            | `lenses/*.test.ts(x)`: limits per view, placement, the 2D fallback of a 3D step, arrows of lists and trees (`stackHeapLensArrows.test.ts`); the shared geometry in `src/shared/components/viz/stackheap/heapGeometry.test.ts` and `src/shared/viz3d/stackheap/`                                                              |
| Layout, settings  | `hooks/usePaneLayout.test.ts` (widening for 3D), `components/layout/playgroundSettings.test.ts` (old stored settings load)                                                                                                                                                                                                   |
| Exercises         | `exercises/exercises.test.ts` (every solution passes and has an explanation, every starter fails), `components/exercises/TaskPanel.test.tsx` (the panel and the solution's reveal flow), `runChecks.test.ts` (verdicts, endless loops, what cannot fool a check), `exerciseProgress.test.ts`, all on the real sandbox script |
| Links             | `utils/playgroundLink.test.ts`, `utils/playgroundStart.test.ts`, `PlaygroundApp.exercises.test.tsx`                                                                                                                                                                                                                          |
| Unit tests        | `PythonInstrumenter.test.ts`, `useSandbox.test.ts`, `sanitize.test.ts`, `codeTemplates.test.ts`, `sourceMapLines.test.ts`                                                                                                                                                                                                    |
| Component tests   | `MonacoEditor.test.tsx`, `SandboxFrame.test.tsx`, `ConsoleOutput.test.tsx`, `StepControls.test.tsx`, `SpaceBackground.test.tsx`, `PlaygroundApp.test.tsx`                                                                                                                                                                    |
| Integration tests | `__tests__/integration.test.ts`                                                                                                                                                                                                                                                                                              |

### Mock Strategy

- **Monaco Editor**: Mocked with a `<textarea>` wrapper (WASM/WebWorker can't run in jsdom).
- **SandboxFrame**: Real component but iframe content doesn't execute in jsdom.
- **SpaceBackground**: Canvas context mocked (`getContext` returns stub).
- **Pyodide**: Hook fully mocked (WASM can't load in jsdom).
- **Pure utilities** (`sanitize`, `codeTemplates`, the tracer, `parsePythonSteps`): Tested directly, no mocks.

### Adding Tests

Place test files adjacent to the code they test:

```
MyComponent.tsx
MyComponent.test.tsx
```

For cross-module integration tests, use `__tests__/integration.test.ts`.
