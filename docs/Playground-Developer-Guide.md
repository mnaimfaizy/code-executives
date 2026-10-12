# Playground Developer Guide

> Internal reference for contributors working on the Code Executives Playground.

> **Words.** This guide follows the glossary in [CONTEXT.md](../CONTEXT.md): the record of a run is a **trace** made of **steps**, each step holds a **snapshot**, a **lens** chooses which part of a snapshot is drawn, prebuilt code is an **example**, and the output pane is the **Console**. [ADR 0004](adr/0004-playground-traces-share-the-snapshot.md) is the decision behind the design.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [How to Add a New Lens](#how-to-add-a-new-lens)
4. [How to Add a New Language](#how-to-add-a-new-language)
5. [How to Modify the Theme](#how-to-modify-the-theme)
6. [How to Add Examples](#how-to-add-examples)
7. [How to Add an Exercise](#how-to-add-an-exercise)
8. [Links into the Playground](#links-into-the-playground)
9. [Security Considerations](#security-considerations)
10. [Performance Budget & Monitoring](#performance-budget--monitoring)
11. [Testing](#testing)

---

## Architecture Overview

The Playground is a **standalone feature module** at `src/features/playground/` that runs in its own layout (no Header/Footer/Sidebar). It opens in a new browser tab at `/playground`.

### Key Design Decisions

| Decision                                        | Rationale                                                                 |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Standalone layout (`PlaygroundLayout`)          | Full viewport needed for editor + lenses                                  |
| Dark theme scoped via `data-theme="playground"` | CSS custom properties avoid polluting the light-mode main site            |
| Sandboxed `<iframe>` for JS/TS execution        | Defense-in-depth: CSP + `sandbox="allow-scripts"` + network API blocking  |
| Pyodide for Python                              | WASM-based CPython in the browser, lazy-loaded from CDN (~11 MB)          |
| `acorn` + `astring` for JS instrumentation      | Parse → transform → regenerate; the code runs on the browser's own engine |
| `sys.settrace()` for Python instrumentation     | CPython's native tracing mechanism, captured via Pyodide FFI              |
| One snapshot shape, shared with the stories     | A lens draws a step with the same 2D/3D views a story uses (ADR 0004)     |

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
                         [Lens]     → VisualizationCanvas → StackHeapLens
                         [Console]  → ConsoleOutput
```

- **JavaScript.** With Trace on, `PlaygroundApp` calls `instrument()` and sends the result to the sandbox together with `runtimeSource` (the tracer runtime as a string) and the limits from `resolveTraceLimits()`. The sandbox script builds the tracer, runs the code with it, waits for pending timers, and posts the trace back with its report.
- **TypeScript.** `services/transpileTypeScript.ts` strips the types first. Its `mapLine` is applied to every step's `line` and to `trace.error.line` (`mapTraceLines` in `useSandbox.ts`).
- **Python.** `PythonInstrumenter.ts` records a line, the call stack and the running function's locals with `sys.settrace`; `parsePythonSteps` turns that into `Step[]`. Python records values only: its snapshots have frames and no heap objects.

### How a traced run ends

| Outcome      | What happens                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------- |
| `completed`  | The sandbox reports once no timer is pending; steps recorded by late callbacks are in the trace           |
| `step-limit` | The tracer stops the run (an infinite loop ends); the steps so far are kept and the Console gets one note |
| `error`      | The Console shows the uncaught error with its line; the steps up to it are kept                           |

Code that does not parse, or that the tracer cannot rewrite, never reaches the sandbox: the Console says why there are no steps. It is not run untraced behind the learner's back.

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
│   └── usePaneLayout.ts           # Resizable 3-pane layout
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
│   ├── runChecks.ts               # Runs the checks; builds the code of a watched check
│   ├── exerciseProgress.ts        # Passed, solution seen and last code per viewer (localStorage)
│   └── sandboxForTests.ts         # Test support: the real sandbox script in the test window
├── components/
│   ├── editor/
│   │   ├── MonacoEditor.tsx       # Monaco wrapper; highlights the step's line
│   │   ├── EditorTabs.tsx         # File tab bar
│   │   └── LanguagePicker.tsx     # Language dropdown
│   ├── execution/
│   │   ├── SandboxFrame.tsx       # Sandboxed iframe for JS/TS
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
│   │   └── lenses/
│   │       └── StackHeapLens.tsx  # The stack and heap regions of the current step
│   ├── layout/
│   │   ├── PlaygroundLayout.tsx
│   │   ├── PlaygroundToolbar.tsx
│   │   ├── PaneResizer.tsx
│   │   ├── RightPaneTabs.tsx      # The right pane's two tabs: Task and Console
│   │   ├── SettingsPanel.tsx
│   │   └── BackToSiteLink.tsx
│   └── theme/
│       ├── tokens.ts              # Design tokens
│       ├── playground-theme.css   # CSS custom properties
│       └── SpaceBackground.tsx    # Animated canvas starfield
└── __tests__/
    └── integration.test.ts        # Cross-module integration tests
```

---

## How to Add a New Lens

A lens chooses which regions of a snapshot are drawn. It never brings its own renderer: it draws with the shared 2D and 3D views, so every lens works in both (ADR 0004, `docs/3D-Visualization-Standard.md`). There is one lens today, Stack & Heap. The Event Loop lens returns once the tracer's queues are drawn; the Data Structures and Streams lenses were removed.

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
export type VisualizationLens = 'stack-heap' | 'my-lens' | 'none';
```

3. **Register the lens** in `VisualizationCanvas.tsx` with `React.lazy`, next to `StackHeapLens`. Anything that is not a known lens id draws the "select a lens" placeholder.

4. **Update `LensSelector.tsx`** (`LENS_OPTIONS`) to show the new lens in the toolbar.

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

4. **Create an execution hook** (e.g., `useRust.ts`) or extend an existing one. The hook must return:
   - `execute(code)` → `Promise<{ error, trace }>`, where `trace` is a `Trace` from `tracer/` (or `null` for an untraced run). A new language emits the same snapshot shape; see `parsePythonSteps` for the smallest example.
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

## How to Add Examples

An example is prebuilt code the learner can load and run, with a suggested lens. Edit `utils/examples.ts`:

```ts
{
  id: 'unique-id',           // Must be unique
  label: 'Display Name',
  description: 'Brief description shown in dropdown',
  language: 'javascript',    // Must be a valid PlaygroundLanguage
  suggestedLens: 'stack-heap', // Which lens to select: 'stack-heap' or 'none'
  code: `// Your code here
const x = 1;
console.log(x);`,
},
```

Examples appear in the toolbar's "Examples" dropdown, filtered by the currently selected language. An example can be opened by a link: see [Links into the Playground](#links-into-the-playground).

---

## How to Add an Exercise

An exercise is a task with a goal, checks that pass or fail on the learner's code, hints, and a solution the learner can ask to see (see [CONTEXT.md](../CONTEXT.md)). Exercises are JavaScript only for now. They carry no score, points, streaks or achievements: [ADR 0004](adr/0004-playground-traces-share-the-snapshot.md) leaves achievements open.

### The shape

Add an entry to `exercises/exercises.ts` (the type is `Exercise` in `exercises/types.ts`):

```ts
{
  id: 'two-sum',                 // Stable; the value of ?exercise= in a link
  title: 'Two Sum',
  level: 'easy',                 // 'easy' | 'medium' | 'hard': the group in the Exercises menu
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
- **Every exercise needs a solution and an explanation**, in its `solution`. `solution.code` is the whole code as it would stand in the editor (for a class exercise it includes the driver function), because the learner can load it there and watch it run. `solution.explanation` is two to four plain sentences for a learner on the idea: why it works and what it costs. Explain any term of art where it appears ("a Set, a collection that holds each value at most once"); backticks mark code, as in the task. `exercises/exercises.test.ts` runs the solution, and the starter code, through the real sandbox script: the solution must pass every check, the starter code must fail at least one, and the explanation must be two to four sentences.

### How a check runs

`exercises/runChecks.ts` is the runner. For each check, in order:

1. The learner's code gets one line appended that hands the entry function to a hook (`__pgCheck__(typeof entry === "function" ? entry : undefined)`), and the whole is instrumented like a traced run.
2. The sandbox (`sandboxRuntime.ts`, a run with `msg.check`) passes its own hook in. The hook calls the function with a copy of the check's arguments and compares the result with the expected value **inside the sandbox script's own scope**, then reports `{ status, actual }`. The verdict never passes through the Console, the learner's code cannot read the expected value, and the comparison uses built-ins captured before any learner code ran.
3. A check run sends no steps back and does not wait for timers.

One run per check gives each check a clean start and a full step budget. The statuses are `pass`, `fail`, `threw`, `missing` (no function with that name), `step-limit`, `not-reached` (a top-level `return`, or the hook was shadowed), `skipped` and `unavailable`. A syntax error is found by the instrumenter before anything runs and is reported once, with its line. A hidden check's result is reduced to pass, fail or skipped before it reaches the panel.

**Endless loops.** An untraced `while (true) {}` never yields, and nothing in the page can stop it: the sandbox iframe cannot be interrupted from outside and is never recreated, so every later run times out until the page is reloaded. Chromium runs the sandboxed iframe in a process of its own, so the page itself stays responsive there (measured: a 3-second busy loop in the sandbox delayed the page's timers by about 30 ms); a browser that runs the iframe on the page's thread freezes with it. Checks therefore always run instrumented, and the tracer's step limit ends the run (`step-limit`). After the first `step-limit` the remaining checks are skipped, because a recursion that never ends takes a second or two to reach the limit (every step snapshots the whole stack).

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

An example with a `story` field (`{ label, href }`) shows a **Read the story** link in the editor's tab bar while it is loaded. The `href` must be a path inside the site.

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

- **Code size limit**: 100 KB max (`MAX_CODE_LENGTH` in `useSandbox.ts`).
- **Binary content detection**: `isTextContent()` rejects non-text input.
- **Rate limiting**: max 1 execution per second per hook instance.

### Output Sanitization

- Everything written to the console is rendered as a React text node, which React escapes. It is never HTML-escaped by hand first (that showed `&quot;` to the learner) and never set through `dangerouslySetInnerHTML`.
- `sanitizeOutput()` handles circular references, prototype pollution keys (`__proto__`, `constructor`), BigInt, Symbol, and deeply nested objects.
- Entry counts capped at `MAX_CONSOLE_ENTRIES` (500).
- Individual entries capped at `MAX_ENTRY_LENGTH` (10 KB).

### For Contributors

- **Never** use `dangerouslySetInnerHTML` with unsanitized console entries.
- **Never** inject user code directly into iframe `srcdoc` — always use `postMessage`.
- **Never** add `allow-same-origin` to the sandbox iframe.
- When adding new network/system APIs, block them in `SandboxFrame.tsx`.

---

## Performance Budget & Monitoring

### Bundle Budgets

| Chunk                      | Budget                                        |
| -------------------------- | --------------------------------------------- |
| Playground app code        | < 60 KB gzipped                               |
| Monaco (loaded separately) | External, lazy-loaded                         |
| Pyodide (CDN)              | ~11 MB, lazy-loaded on first Python execution |

### Optimization Strategies

- **Trace limits** (`tracer/types.ts`): 2,000 steps per run, 20 slots per frame or object, 60 heap objects per snapshot. A step past the heap limit is marked `truncated`.
- **Lazy lens**: `VisualizationCanvas` loads the lens with `React.lazy`; three.js is only ever imported by a lazy 3D view.
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

| Category          | Files                                                                                                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tracer            | `tracer/*.test.ts` (instrumenting, the runtime as source, traces of the shipped examples)                                                                                                                       |
| Sandbox script    | `sandboxRuntime.test.ts` runs the real iframe script, traced and untraced: aliasing, timers, the step limit, errors                                                                                             |
| Exercises         | `exercises/exercises.test.ts` (every solution passes and has an explanation, every starter fails), `components/exercises/TaskPanel.test.tsx` (the panel and the solution's reveal flow), `runChecks.test.ts` (verdicts, endless loops, what cannot fool a check), `exerciseProgress.test.ts`, all on the real sandbox script |
| Links             | `utils/playgroundLink.test.ts`, `utils/playgroundStart.test.ts`, `PlaygroundApp.exercises.test.tsx`                                                                                                             |
| Unit tests        | `PythonInstrumenter.test.ts`, `useSandbox.test.ts`, `sanitize.test.ts`, `codeTemplates.test.ts`, `sourceMapLines.test.ts`                                                                                       |
| Component tests   | `MonacoEditor.test.tsx`, `SandboxFrame.test.tsx`, `ConsoleOutput.test.tsx`, `StepControls.test.tsx`, `SpaceBackground.test.tsx`, `PlaygroundApp.test.tsx`                                                       |
| Integration tests | `__tests__/integration.test.ts`                                                                                                                                                                                 |

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
