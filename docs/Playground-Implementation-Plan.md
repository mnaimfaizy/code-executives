# Coding Playground — Phased Implementation Plan

> **Project**: Code Executives — Interactive Coding Playground
> **Status**: Phase 5 Complete
> **Created**: 2026-04-08
> **Reference**: [Coding Playground Architecture and Implementation](./Coding%20Playground%20Architecture%20and%20Implementation.md)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Architecture Overview](#architecture-overview)
- [Key Design Decisions & Deviations from Report](#key-design-decisions--deviations-from-report)
- [Dependency Manifest](#dependency-manifest)
- [Phase 0 — Foundation & Project Scaffolding](#phase-0--foundation--project-scaffolding)
- [Phase 1 — Core Editor & Code Execution](#phase-1--core-editor--code-execution)
- [Phase 2 — Code Instrumentation & State Capture](#phase-2--code-instrumentation--state-capture)
- [Phase 3 — Visualization Engine](#phase-3--visualization-engine)
- [Phase 4 — UI/UX, Space Theme & Polish](#phase-4--uiux-space-theme--polish)
- [Phase 5 — Security Hardening & Performance](#phase-5--security-hardening--performance)
- [Phase 6 — Testing & Documentation](#phase-6--testing--documentation)
- [Parallel Work Matrix](#parallel-work-matrix)
- [Glossary](#glossary)

---

## Executive Summary

The Playground is a **standalone, full-screen, dark-themed** coding environment that opens in a **new browser tab** and is completely separate from the main Code Executives application layout. It features a space-inspired dark UI with animated backgrounds, a professional code editor (Monaco), client-side code execution for JavaScript/TypeScript/Python, step-by-step instrumentation with time-travel debugging, and multiple visualization lenses (Event Loop, Heap & Stack, Data Structures, Streams).

### Core Principles

1. **Isolation** — The Playground has its own layout, theme, and CSS scope. It does NOT use the main app's Header, Sidebar, or Footer.
2. **Security First** — All user code runs in sandboxed iframes with strict CSP. No server-side execution required.
3. **Performance** — Heavy dependencies (Monaco, Pyodide, React Flow) are lazy-loaded only when the Playground is active.
4. **Clean Architecture** — Feature-based structure under `src/features/playground/` following existing project conventions.
5. **Dark Space Theme** — Unique visual identity with animated starfield background, distinct from the main light-mode app.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYGROUND (New Tab)                          │
│  ┌──────────┐  ┌─────────────────────┐  ┌────────────────────┐ │
│  │  Monaco   │  │   Visualization     │  │   Output &         │ │
│  │  Editor   │  │   Canvas            │  │   Step Controls    │ │
│  │           │  │                     │  │                    │ │
│  │  JS/TS/PY │  │  React Flow / SVG   │  │   Console Output   │ │
│  │           │  │  D3 Animations      │  │   Timeline Slider  │ │
│  │           │  │                     │  │   AI Tutor (later) │ │
│  └──────────┘  └─────────────────────┘  └────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Toolbar: Language Picker · Lens Selector · Run/Reset   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                    Animated Space Background                     │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack (Playground-Specific)

| Layer             | Technology                     | Purpose                              |
| ----------------- | ------------------------------ | ------------------------------------ |
| Code Editor       | `@monaco-editor/react`         | IDE-grade editing with IntelliSense  |
| JS/TS Execution   | Sandboxed `<iframe>`           | Isolated code execution              |
| Python Execution  | Pyodide (CDN WebAssembly)      | Browser-based CPython 3.11           |
| AST Parsing       | `acorn` + `astring` (existing) | JS instrumentation for tracing       |
| Node Diagrams     | `@xyflow/react`                | Data structure & graph visualization |
| Custom Animations | SVG + CSS animations           | Event loop, memory, stream visuals   |
| Layout            | CSS Grid + Tailwind            | Three-pane resizable layout          |

### Directory Structure

```
src/features/playground/
├── PlaygroundApp.tsx                # Root component (standalone layout)
├── PlaygroundEntry.tsx              # Entry point, lazy-loaded from App.tsx
├── components/
│   ├── layout/
│   │   ├── PlaygroundLayout.tsx     # Full-screen dark layout shell
│   │   ├── PlaygroundToolbar.tsx    # Top toolbar (lang picker, lens, run)
│   │   ├── PaneResizer.tsx          # Draggable pane dividers
│   │   └── BackToSiteLink.tsx       # "← Back to Code Executives" link
│   ├── editor/
│   │   ├── MonacoEditor.tsx         # Monaco Editor wrapper
│   │   ├── EditorTabs.tsx           # Multi-file tab bar
│   │   └── LanguagePicker.tsx       # JS / TS / Python selector
│   ├── execution/
│   │   ├── SandboxFrame.tsx         # Iframe sandbox for JS/TS execution
│   │   ├── PythonRunner.tsx         # Pyodide WebAssembly runner
│   │   ├── ExecutionController.tsx  # Run / Pause / Step / Reset controls
│   │   └── ConsoleOutput.tsx        # Output display panel
│   ├── instrumentation/
│   │   ├── JsInstrumenter.ts        # Babel/Acorn AST transform for tracing
│   │   ├── PythonInstrumenter.ts    # Python sys.settrace wrapper
│   │   ├── StateSnapshot.ts         # Snapshot data model
│   │   └── TimelinePlayer.tsx       # Timeline slider + playback UI
│   ├── visualizations/
│   │   ├── LensSelector.tsx         # Visualization mode picker
│   │   ├── lenses/
│   │   │   ├── EventLoopLens.tsx    # Call Stack / Microtask / Task Queue
│   │   │   ├── HeapStackLens.tsx    # Memory heap & call stack view
│   │   │   ├── DataStructureLens.tsx# React Flow trees, lists, graphs
│   │   │   └── StreamLens.tsx       # Node.js stream/backpressure visual
│   │   └── shared/
│   │       ├── AnimatedNode.tsx     # Reusable animated React Flow node
│   │       └── QueueVisual.tsx      # Animated queue display component
│   └── theme/
│       ├── SpaceBackground.tsx      # Animated starfield canvas
│       ├── playground-theme.css     # Scoped dark theme styles
│       └── tokens.ts               # Design tokens (colors, spacing)
├── hooks/
│   ├── useCodeExecution.ts          # Orchestrates run → instrument → execute
│   ├── usePlaygroundState.ts        # Central state (code, lang, lens, timeline)
│   ├── usePyodide.ts               # Lazy Pyodide loader + executor
│   ├── useMonaco.ts                 # Monaco lifecycle & config
│   ├── useSandbox.ts               # Iframe postMessage bridge
│   └── useTimeline.ts              # Timeline navigation (step, play, rewind)
├── services/
│   ├── instrumentCode.ts           # Babel plugin / Acorn transform pipeline
│   ├── sandbox-worker.ts           # Web Worker for CPU-bound tasks
│   └── pyodide-loader.ts           # Pyodide CDN loader with caching
├── types/
│   └── playground-v2.ts            # TypeScript types for new playground
├── utils/
│   ├── codeTemplates.ts            # Default code snippets per language
│   └── sanitize.ts                 # Input sanitization utilities
└── __tests__/
    ├── JsInstrumenter.test.ts
    ├── SandboxFrame.test.tsx
    ├── MonacoEditor.test.tsx
    └── PlaygroundApp.test.tsx
```

---

## Key Design Decisions & Deviations from Report

The architectural report provides the theoretical blueprint. Below are decisions made to reconcile it with the **actual codebase** and practical constraints.

### 1. Existing Playground Compatibility

The current `src/components/playground/` contains a LeetCode-style problem-solving playground used within the Big-O and Data Structures modules. **The new Playground is a separate feature module** at `src/features/playground/`. The existing components remain untouched and continue to serve their purpose inside feature sections.

### 2. React Flow Package Name

The report references "React Flow" generically. The npm package is now **`@xyflow/react`** (v12+). All imports must use `@xyflow/react`, and the CSS must be imported **after** Tailwind in `index.css` per their Tailwind 4.x compatibility requirements.

### 3. D3.js — Avoid as a Dependency

The report recommends D3.js for custom animations (event loop, streams). To avoid adding a heavy dependency, we will implement these with **pure SVG + CSS animations + React state**, which aligns with how existing visualizations in the project work (e.g., `src/features/javascript/components/visualizations/2d/`). If SVG proves insufficient for a specific lens, D3.js can be reconsidered in a later phase.

### 4. Dark Theme Isolation (Tailwind 4.x)

The main app is **light-mode only** — no `dark:` classes exist anywhere. The Playground's dark theme must be **scoped** to avoid leaking into the main app. Strategy:

- The `PlaygroundLayout.tsx` wrapper sets a CSS class (e.g., `data-theme="playground"`) on its root element.
- A dedicated `playground-theme.css` file uses CSS custom properties scoped under `[data-theme="playground"]`.
- Tailwind utility classes are used with explicit dark color values (e.g., `bg-gray-950`, `text-gray-100`) rather than `dark:` prefixes.

### 5. Monaco Editor vs Current CodeEditor

The existing `CodeEditor.tsx` uses a `<textarea>`. The new Playground uses `@monaco-editor/react` for a professional IDE experience. Monaco is ~2 MB gzipped so it **must** be lazy-loaded and chunk-split.

### 6. Routing: New Tab Strategy

Since the main app uses `BrowserRouter` in `src/main.tsx`, the Playground route is a normal React Router route at `/playground`. The Header navigation link uses `target="_blank"` to open it in a new tab. The `PlaygroundLayout.tsx` component hides Header/Sidebar/Footer and renders a full-screen dark shell.

### 7. Pyodide Loading Strategy

Pyodide (~11 MB WebAssembly bundle) is loaded **on-demand from CDN** only when the user selects Python. It is NOT bundled with the app. The `usePyodide` hook manages the async loading lifecycle with a progress indicator.

### 8. Existing AST Tooling

The project already depends on `acorn` (8.15.0) and `astring` (1.9.0) for AST parsing and code generation. The JS instrumenter will reuse these rather than adding Babel as a dependency.

### 9. Vite Chunk Splitting

The Playground must be its own chunk. Update `vite.config.ts` `manualChunks` to handle:

- `playground` — Core playground code
- `vendor-monaco` — Monaco editor
- `vendor-xyflow` — React Flow

### 10. AI Agent / A2UI — Deferred

The report's AI Agent and A2UI protocol are **out of scope for this plan**. They require API integrations and are better suited as a separate project phase after the core Playground is functional.

---

## Dependency Manifest

New dependencies required (all with **exact versions** per `.npmrc` policy):

| Package                | Type | Purpose                     | Version | Approx Size |
| ---------------------- | ---- | --------------------------- | ------- | ----------- |
| `@monaco-editor/react` | prod | Monaco Editor React wrapper | 4.7.0   | ~50 KB      |
| `monaco-editor`        | prod | Monaco Editor core (peer)   | 0.53.0  | ~2 MB gz    |
| `@xyflow/react`        | prod | React Flow for node graphs  | ~150 KB |

**NOT added** (loaded via CDN at runtime):

- `pyodide` — Loaded from `https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.js`

**NOT added** (using existing deps):

- `acorn` + `astring` — Already in `package.json` for AST work
- `three` — Already available if 3D visuals are needed later

> **Security note**: Before installing any new dependency, review it per the [Dependency Supply Chain Security Plan](./SECURITY/Dependency-Supply-Chain-Security-Plan.md). Pin exact versions, audit with `npm audit`, and review lockfile diffs.

---

## Phase 0 — Foundation & Project Scaffolding

> **Goal**: Set up the project structure, routing, standalone layout, and dark space theme shell.
> **Parallelizable**: Steps 0.1–0.3 can be done by different developers concurrently.
> **Estimated Scope**: ~15 files created/modified.

### Step 0.1 — Feature Directory & Types

Create the directory structure and core TypeScript types.

- [x] Create `src/features/playground/` directory tree matching the [Directory Structure](#directory-structure) above
- [x] Create `src/features/playground/types/playground-v2.ts` with core interfaces:
  - `PlaygroundLanguage` (`'javascript' | 'typescript' | 'python'`)
  - `VisualizationLens` (`'event-loop' | 'heap-stack' | 'data-structure' | 'stream' | 'none'`)
  - `ExecutionState` (`'idle' | 'running' | 'paused' | 'stepping' | 'completed' | 'error'`)
  - `StateSnapshot` (line number, call stack, variables, heap objects, queues)
  - `TimelineEntry` (array of `StateSnapshot` with timestamps)
  - `PlaygroundConfig` (language, lens, code, execution settings)
  - `SandboxMessage` (discriminated union for iframe ↔ host communication)
  - `ConsoleEntry` (type: log/warn/error/info, args, timestamp)
- [x] Create `src/features/playground/utils/codeTemplates.ts` with starter templates for each language
- [x] Export types from `src/features/playground/types/` via barrel `index.ts`

### Step 0.2 — Routing & Navigation Integration

Wire the Playground into the app's routing system.

- [x] Add lazy import in `src/App.tsx`:
  ```tsx
  const PlaygroundEntry = lazy(() => import('./features/playground/PlaygroundEntry'));
  ```
- [x] Add route in `src/App.tsx` **outside** the main layout wrapper:
  ```tsx
  <Route
    path="/playground"
    element={
      <SuspenseRoute variant="spinner">
        <PlaygroundEntry />
      </SuspenseRoute>
    }
  />
  ```
- [x] Ensure the `/playground` route does NOT render Header, Sidebar, Footer, or Breadcrumbs. This requires restructuring `App.tsx` routes so that:
  - The main layout (Header + Sidebar + Footer) wraps only the existing feature routes.
  - The `/playground` route is a sibling that renders its own full-screen layout.
- [x] Add "Playground" link to `src/components/Header.tsx` navigation:
  - Position: Standalone link (not inside any dropdown group), placed at the end of the nav bar
  - Opens in new tab: `<a href="/playground" target="_blank" rel="noopener noreferrer">`
  - Styled distinctly (e.g., with a rocket/terminal icon from Lucide, accent color)
- [x] Verify that direct navigation to `http://localhost:5173/playground` renders the standalone layout (no main app chrome)

### Step 0.3 — Standalone Layout Shell & Space Theme

Build the visual shell for the Playground.

- [x] Create `src/features/playground/components/theme/tokens.ts`:
  - Define design tokens as plain objects (colors, spacing, border radius, shadows)
  - Base palette: deep space blacks (`#0a0a1a`, `#0f0f2e`), nebula purples (`#1a1a3e`), electric blues (`#00d4ff`), star whites (`#e0e0ff`), success greens (`#00ff88`), error reds (`#ff4466`)
  - Editor gutter, line highlight, selection colors
  - Font: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace`
- [x] Create `src/features/playground/components/theme/playground-theme.css`:
  - Scoped under `[data-theme="playground"]`
  - CSS custom properties for all tokens
  - Scrollbar styling (thin, dark)
  - Selection color overrides
  - Focus ring styles (electric blue)
  - Transition defaults
- [x] Import `playground-theme.css` in `PlaygroundApp.tsx` (not in `index.css` to keep it scoped)
- [x] Create `src/features/playground/components/theme/SpaceBackground.tsx`:
  - Animated starfield using `<canvas>` element
  - Multiple layers of stars at different speeds (parallax)
  - Subtle nebula color gradients (CSS radial gradients overlaid)
  - Respect `prefers-reduced-motion` — static stars, no animation
  - Fixed position behind all content (`z-index: 0`)
  - Performant: `requestAnimationFrame` loop, canvas-based rendering
- [x] Create `src/features/playground/components/layout/PlaygroundLayout.tsx`:
  - Full viewport: `100vw × 100vh`, `overflow: hidden`
  - Sets `data-theme="playground"` on root `<div>`
  - Renders `<SpaceBackground />` as background layer
  - Accepts `children` for the three-pane content
  - No Header, Sidebar, or Footer from main app
- [x] Create `src/features/playground/components/layout/BackToSiteLink.tsx`:
  - Small link in top-left corner: "← Code Executives"
  - Links back to `"/"` (main site)
  - Opens in same window (not new tab) since user is already in a new tab
  - Uses `window.opener ? window.close() : window.location.href = '/'` pattern
- [x] Create `src/features/playground/PlaygroundApp.tsx`:
  - Wraps everything in `<PlaygroundLayout>`
  - Placeholder panes with "Editor", "Visualization", "Output" text
  - Import and apply scoped theme CSS
- [x] Create `src/features/playground/PlaygroundEntry.tsx`:
  - Default export for lazy loading
  - Wraps `<PlaygroundApp />` in `<ErrorBoundary level="feature">`
  - Adds `<SEO>` with playground-specific meta tags
- [x] Verify the dark shell renders correctly at `/playground` in a new tab
- [x] Verify the main app routes remain unaffected (no dark styles leaking)

### Step 0.4 — Vite Build Configuration

Optimize the build for the Playground chunk.

- [x] Update `vite.config.ts` `manualChunks` to include:
  ```ts
  if (id.includes('monaco-editor')) return 'vendor-monaco';
  if (id.includes('@xyflow')) return 'vendor-xyflow';
  if (id.includes('/src/features/playground/')) return 'playground';
  ```
- [x] Verify build succeeds with `npm run build`
- [x] Verify the playground chunk is appropriately sized in `dist/stats.html`

---

## Phase 1 — Core Editor & Code Execution

> **Goal**: Integrate Monaco Editor and implement sandboxed code execution for JS/TS/Python.
> **Parallelizable**: Steps 1.1 (Monaco) and 1.2 (JS Sandbox) and 1.3 (Python) can proceed in parallel.
> **Estimated Scope**: ~10 new files, 2 new dependencies.

### Step 1.1 — Monaco Editor Integration

- [x] Install dependencies (exact versions per policy):
  ```bash
  npm install @monaco-editor/react@4.7.0 monaco-editor@0.53.0
  ```
  (Used 0.53.0 to avoid dompurify vulnerability in 0.54+. Audit clean.)
- [x] Review lockfile diff for unexpected transitive packages
- [x] Create `src/features/playground/hooks/useMonaco.ts`:
  - Configure Monaco loader to use local bundled files (not CDN)
  - Define editor options: dark theme, ligatures, minimap off, word wrap, font family from tokens
  - Register custom dark theme matching space palette
  - Provide language configuration helpers per `PlaygroundLanguage`
- [x] Create `src/features/playground/components/editor/MonacoEditor.tsx`:
  - Wrap `@monaco-editor/react` `<Editor>` component
  - Props: `code`, `language`, `onChange`, `onExecute` (Ctrl+Enter)
  - Apply custom dark theme on mount
  - Keyboard shortcut: `Ctrl+Enter` → run code
  - Keyboard shortcut: `Ctrl+S` → prevent browser save dialog
  - Loading state: show skeleton while Monaco initializes
  - Accessible: proper `aria-label`, announce language changes
- [x] Create `src/features/playground/components/editor/LanguagePicker.tsx`:
  - Three buttons: JavaScript, TypeScript, Python
  - Active state styling with electric blue accent
  - Icons from Lucide or simple SVG language logos
  - Emits `onLanguageChange(language: PlaygroundLanguage)`
- [x] Create `src/features/playground/components/editor/EditorTabs.tsx`:
  - Tab bar above Monaco editor
  - Single tab for now (extensible to multi-file later)
  - Shows filename: `main.js`, `main.ts`, or `main.py` based on language
  - Close tab resets to default template
- [x] Wire components into `PlaygroundApp.tsx` left pane
- [x] Verify Monaco loads, renders, and accepts input in the dark playground shell
- [x] Verify language switching works and preserves/resets code appropriately

### Step 1.2 — JavaScript/TypeScript Sandboxed Execution

- [x] Create `src/features/playground/components/execution/SandboxFrame.tsx`:
  - Renders a hidden `<iframe>` with `sandbox="allow-scripts"` attribute
  - Uses `srcdoc` to inject a minimal HTML page with a message listener
  - Implements `postMessage` bridge protocol (`SandboxMessage` type)
  - Captures: `console.log/warn/error/info`, uncaught exceptions, return values
  - Implements execution timeout (default: 10 seconds) to prevent infinite loops
  - The iframe document overrides `console.*` methods to relay messages to parent
  - **Security**: No `allow-same-origin`, no `allow-popups`, no `allow-forms`
  - **Security**: CSP with nonce-based script execution inside iframe
  - **Security**: Network APIs (fetch, XHR, WebSocket) blocked in sandbox
- [x] Create `src/features/playground/hooks/useSandbox.ts`:
  - Returns `{ execute, isRunning, terminate }` API
  - `execute(code: string): Promise<void>` with 50 KB input validation
  - Handles iframe lifecycle: create → execute → collect output → destroy
  - Error handling: syntax errors, runtime errors, timeout errors
  - Cleanup on unmount (remove event listeners, destroy iframe)
- [x] Create `src/features/playground/components/execution/ConsoleOutput.tsx`:
  - Scrollable terminal-style output panel
  - Color-coded entries: white (log), yellow (warn), red (error), cyan (info)
  - Monospace font matching editor
  - Clear button
  - Auto-scroll to latest entry
  - Accessible: `role="log"`, `aria-live="polite"`
- [x] Create `src/features/playground/components/execution/ExecutionController.tsx`:
  - Buttons: ▶ Run, ⏹ Stop, 🔄 Reset
  - Keyboard shortcuts displayed as tooltips
  - Execution state indicator (idle / running spinner / error flash)
  - Run button triggers: execute → display output
- [x] Wire execution into `PlaygroundApp.tsx`:
  - Run button executes code from Monaco editor
  - Output displays in right pane console
- [x] Test: Write `console.log("Hello")` → click Run → see output in console
- [x] Test: Infinite loop (`while(true){}`) → execution times out → error displayed
- [x] Test: TypeScript code with types → compiles and runs correctly

### Step 1.3 — Python Execution via Pyodide

- [x] Create `src/features/playground/services/pyodide-loader.ts`:
  - Async function `loadPyodideRuntime()` that loads Pyodide from CDN
  - CDN URL: `https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js`
  - Caches the Pyodide instance in a module-level variable (singleton)
  - Retry-safe: resets loadPromise on failure so user can retry
  - **Security**: CDN URL is on the approved list (jsdelivr.net)
- [x] Create `src/features/playground/hooks/usePyodide.ts`:
  - Returns `{ runPython, isReady, isRunning, loadingState, error, preload }`
  - Lazy loads Pyodide only on first Python execution request
  - Captures stdout/stderr by redirecting `sys.stdout` and `sys.stderr`
  - Handles Python exceptions and maps them to `ConsoleEntry` objects
  - Execution timeout (10 seconds) via `Promise.race`
  - Preload support via `onMouseEnter` on Python language button
- [x] Create `src/features/playground/components/execution/PythonRunner.tsx`:
  - Loading state: "Initializing Python runtime..." with spinner
  - First-time load notification explaining the ~11 MB download
  - Error state display
- [x] Wire Python execution into `PlaygroundApp.tsx`:
  - When language is Python, use `usePyodide` instead of `useSandbox`
  - Same output format in `ConsoleOutput`
- [x] Test: `print("Hello from Python")` → output displays
- [x] Test: `import sys; print(sys.version)` → shows CPython version
- [x] Test: Syntax error → friendly error in console
- [x] Test: Long-running Python code → timeout after limit

---

## Phase 2 — Code Instrumentation & State Capture

> **Goal**: Instrument user code to capture execution state at each step, enabling time-travel debugging.
> **Parallelizable**: Steps 2.1 (JS) and 2.2 (Python) can proceed in parallel. Step 2.3 depends on both.
> **Estimated Scope**: ~8 new files.

### Step 2.1 — JavaScript/TypeScript Instrumentation

- [x] Create `src/features/playground/services/instrumentCode.ts`:
  - Uses `acorn` (already installed) to parse JS/TS code into AST
  - Traverses the AST and injects tracker calls at:
    - Every statement (captures line number + local variables)
    - Function entry/exit (captures call stack changes)
    - Variable declarations and assignments (captures value changes)
    - `setTimeout`/`setInterval`/`Promise.then` calls (marks async boundaries)
  - Uses `astring` (already installed) to regenerate instrumented code
  - Returns `{ instrumentedCode: string, sourceMap: Map<number, number> }`
  - **Security**: The tracker code is a simple data collector, not an eval-based tool
  - **Security**: Input code is parsed (not eval'd) — syntax errors caught at parse time
- [x] Create `src/features/playground/instrumentation/JsInstrumenter.ts`:
  - Higher-level wrapper around `instrumentCode.ts`
  - Defines the `__tracker__` runtime object that gets injected into the sandbox
  - The tracker collects `StateSnapshot` objects into an array
  - Sends snapshots back to parent via `postMessage` after execution completes
  - Handles async code: tracker waits for microtask queue to drain before reporting
- [x] Create `src/features/playground/instrumentation/StateSnapshot.ts`:
  - Defines the snapshot data model:
    ```ts
    interface StateSnapshot {
      step: number;
      line: number;
      callStack: string[];
      localVariables: Record<string, unknown>;
      globalVariables: Record<string, unknown>;
      heapObjects: HeapObject[];
      consoleOutput: ConsoleEntry[];
      asyncQueues: {
        microtasks: QueueItem[];
        macrotasks: QueueItem[];
      };
    }
    ```
  - Serialization utilities (deep clone, circular reference handling)
  - Diff utility: compute what changed between two snapshots
- [x] Update `SandboxFrame.tsx` to support instrumented execution mode:
  - Inject `__tracker__` object into iframe global scope
  - Collect snapshots via `postMessage` channel
  - Return both console output AND timeline data
- [ ] Test: Simple `let x = 1; x = 2;` → two snapshots with x=1 and x=2
- [ ] Test: Function call → call stack grows and shrinks in snapshots
- [ ] Test: `setTimeout` → async queue entries appear in snapshots

### Step 2.2 — Python Instrumentation

- [x] Create `src/features/playground/instrumentation/PythonInstrumenter.ts`:
  - Generates a Python wrapper that uses `sys.settrace()` to capture execution frames
  - The trace function captures: line number, local variables, call stack depth
  - Filters out internal Pyodide frames (only user code is traced)
  - Serializes frame data to JSON and passes it across the Pyodide FFI to JavaScript
  - Returns an array of `StateSnapshot` objects matching the JS format
- [x] Update `usePyodide.ts` to support instrumented execution mode:
  - Wraps user code with the trace function
  - Collects snapshots alongside console output
  - Handles large snapshot arrays efficiently (limit to ~1000 steps with sampling)
- [ ] Test: `x = [1, 2, 3]; x.append(4)` → snapshots show list mutation
- [ ] Test: Recursive function → call stack depth visible in snapshots
- [ ] Test: Large program → snapshots are sampled, not truncated

### Step 2.3 — Timeline Player & Playback Controls

- [x] Create `src/features/playground/hooks/useTimeline.ts`:
  - Manages the array of `StateSnapshot` objects
  - API: `{ currentStep, totalSteps, goToStep, nextStep, prevStep, play, pause, isPlaying, speed, setSpeed }`
  - Auto-play mode: advances steps at configurable speed (0.5x, 1x, 2x, 4x)
  - Respects `prefers-reduced-motion` (disables auto-advance animations)
- [x] Create `src/features/playground/components/instrumentation/TimelinePlayer.tsx`:
  - Timeline slider (range input) showing current step / total steps
  - Playback buttons: ⏮ First, ◀ Prev, ▶ Play/Pause, ▶ Next, ⏭ Last
  - Speed control dropdown
  - Current line indicator (highlight in Monaco editor)
  - Variables panel: shows current snapshot's local/global variables
  - Call stack panel: shows current function chain
  - Keyboard shortcuts: Left/Right arrows for step, Space for play/pause
- [x] Wire timeline into `PlaygroundApp.tsx`:
  - After instrumented execution, populate timeline
  - Timeline controls appear in the right pane
  - Current step highlights the corresponding line in Monaco
  - Current step updates the visualization canvas
- [ ] Test: Execute instrumented code → timeline slider appears with correct step count
- [ ] Test: Stepping forward/backward updates highlighted line and variable values
- [ ] Test: Auto-play advances through steps smoothly

---

## Phase 3 — Visualization Engine

> **Goal**: Build the visualization lenses that bring code execution to life.
> **Parallelizable**: Each lens (3.2–3.5) can be developed independently. Step 3.1 must come first.
> **Estimated Scope**: ~12 new files, 1 new dependency.

### Step 3.1 — React Flow Setup & Lens Infrastructure

- [x] Install `@xyflow/react` (exact version per policy):
  ```bash
  npm install @xyflow/react@12.10.2
  ```
- [x] Review lockfile diff for unexpected transitive packages
- [x] Import `@xyflow/react/dist/style.css` in `src/index.css` **after** the Tailwind import line (required for Tailwind 4.x compatibility)
- [x] Create `src/features/playground/components/visualizations/LensSelector.tsx`:
  - Dropdown or tab bar to switch between visualization lenses
  - Options: "None", "Event Loop", "Heap & Stack", "Data Structures", "Streams"
  - Auto-suggest lens based on code analysis (e.g., detect `setTimeout` → suggest Event Loop)
  - Emits `onLensChange(lens: VisualizationLens)`
- [x] Create `src/features/playground/components/visualizations/VisualizationCanvas.tsx`:
  - Container component that renders the active lens
  - Uses `React.lazy()` for each lens to avoid loading unused visualization code
  - Shows "Select a visualization lens" placeholder when no lens is active
  - Passes current `StateSnapshot` to the active lens
  - Handles resize events for responsive canvas sizing

### Step 3.2 — Event Loop Lens

- [x] Create `src/features/playground/components/visualizations/lenses/EventLoopLens.tsx`:
  - Three visual areas: **Call Stack** (LIFO), **Microtask Queue**, **Task Queue**
  - Animated "event loop" indicator that cycles between areas
  - When a function is called → item animates into Call Stack
  - When `Promise.then` is encountered → item goes to Microtask Queue
  - When `setTimeout` fires → item goes to Task Queue
  - When Call Stack empties → Microtask Queue drains first, then Task Queue
  - Each item shows: function name, line number, abbreviated code
  - Color coding: Call Stack (electric blue), Microtasks (purple), Tasks (teal)
  - SVG-based with CSS transitions for smooth movement
  - Respects `prefers-reduced-motion`
- [x] Test: Async code example (`console.log`, `setTimeout`, `Promise`) → correct visual order

### Step 3.3 — Heap & Stack Lens

- [x] Create `src/features/playground/components/visualizations/lenses/HeapStackLens.tsx`:
  - Two-column layout: **Call Stack** (left) and **Heap** (right)
  - Call Stack: shows stack frames as stacked cards (current frame highlighted)
  - Each frame shows: function name, local variables with current values
  - Heap: shows objects as boxes with labeled properties
  - Arrows (React Flow edges) connect variables to their heap objects
  - Reference sharing visible: two variables pointing to same object
  - Primitive values shown inline in the stack frame (not on heap)
  - Uses React Flow for the heap graph layout
  - Animations: objects appear/disappear, arrows update on step change
- [x] Test: Python list example (`x = [1,2]; y = x`) → both x and y point to same heap box

### Step 3.4 — Data Structure Lens

- [x] Create `src/features/playground/components/visualizations/lenses/DataStructureLens.tsx`:
  - Auto-detects data structure type from code/variables
  - Renders using React Flow with custom nodes:
    - **Array**: horizontal boxes with indices
    - **Linked List**: nodes with next-pointer arrows
    - **Binary Tree**: hierarchical layout with left/right edges
    - **Stack/Queue**: vertical/horizontal LIFO/FIFO visualization
    - **Hash Table**: bucket array with chain links
  - Animations: insertion, deletion, traversal highlighting
  - Step-synced: updates based on current timeline step
- [x] Create `src/features/playground/components/visualizations/shared/AnimatedNode.tsx`:
  - Reusable React Flow custom node with animation support
  - Supports: highlight (current operation), pulse (new), fade-out (deleted)
  - Dark theme styling matching space palette
- [x] Test: Array sort algorithm → elements animate swapping positions

### Step 3.5 — Stream Lens (Node.js Simulation)

- [x] Create `src/features/playground/components/visualizations/lenses/StreamLens.tsx`:
  - Simulates Node.js Readable → Transform → Writable stream pipeline
  - Animated "data packets" flowing through pipe segments
  - Buffer gauge showing fill level relative to `highWaterMark`
  - Backpressure indicator: pipe turns red when buffer is full, producer pauses
  - "Drain" event visual: buffer empties, pipe turns green, producer resumes
  - This is a **simulation** lens — it doesn't actually run Node.js streams
  - Driven by predefined scenarios or by detecting stream-like patterns in code
  - SVG-based with CSS animations
- [x] Test: Backpressure scenario → visual shows buffer filling, pausing, draining

---

## Phase 4 — UI/UX, Space Theme & Polish

> **Goal**: Refine the three-pane layout, space animations, and overall user experience.
> **Parallelizable**: Steps 4.1–4.4 can proceed concurrently.
> **Estimated Scope**: ~8 files created/modified.

### Step 4.1 — Three-Pane Resizable Layout

- [x] Create `src/features/playground/components/layout/PaneResizer.tsx`:
  - Draggable divider between panes (vertical dividers)
  - CSS cursor: `col-resize`
  - Min/max pane widths to prevent collapse
  - Double-click to reset to default proportions (33/34/33)
  - Keyboard accessible: arrow keys to resize
  - Stores pane proportions in `localStorage` for persistence
- [x] Update `PlaygroundApp.tsx` layout:
  - Flex layout with explicit width percentages from `usePaneLayout` hook
  - Left pane: Editor (Monaco + tabs)
  - Center pane: Visualization canvas + Timeline controls
  - Right pane: Console output
  - Toolbar spans full width above panes
- [ ] Responsive considerations (optional, lower priority):
  - Below 1024px: Stack panes vertically (editor top, viz middle, output bottom)
  - Below 768px: Tab-based switching between panes
  - Minimum supported: 1024px wide (show warning below this)

### Step 4.2 — Toolbar & Settings

- [x] Create `src/features/playground/components/layout/PlaygroundToolbar.tsx`:
  - Left section: Back link
  - Center section: Language picker, Trace toggle, Lens selector, Example snippets dropdown
  - Right section: Settings gear icon, Run/Stop/Reset buttons
  - Clean, minimal design with space theme colors
- [x] Create example snippets dropdown:
  - "Event Loop Demo" → pre-loaded async JS code
  - "Binary Search Tree" → JS BST implementation
  - "Promise Chain" → TypeScript promise example
  - "Bubble Sort" → JavaScript sorting algorithm
  - "Closures & Scope" → JS closure demonstration
  - "Python Collections" → Python data structure example
  - "Linked List" → JS linked list implementation
- [x] Settings panel (collapsible):
  - Font size slider (10–22px)
  - Editor word wrap toggle
  - Execution timeout setting (1s–30s)
  - Animation toggle (for `prefers-reduced-motion` override)
- [x] Persist settings to `localStorage`

### Step 4.3 — Space Background Refinement

- [x] Enhance `SpaceBackground.tsx`:
  - Layer 1: Distant stars (tiny, slow parallax, white/blue)
  - Layer 2: Medium stars (slightly larger, medium speed)
  - Layer 3: Nearby stars (occasional twinkle animation)
  - Layer 4: Subtle animated nebula (CSS radial-gradient with slow hue rotation)
  - Occasional shooting star animation (every ~15 seconds)
  - Canvas renders at 30fps max to save CPU (not 60fps)
  - Canvas resolution matches `devicePixelRatio` for sharp rendering on HiDPI
  - DPI fix: `ctx.setTransform()` instead of cumulative `ctx.scale()`
- [x] Performance optimization:
  - Pause animation when tab is not visible (`document.hidden`)
  - Use `will-change: transform` for GPU acceleration
  - 30fps frame cap via `FRAME_INTERVAL_MS`

### Step 4.4 — Keyboard Shortcuts & Accessibility

- [x] Implement global keyboard shortcuts for the Playground:
  - `Ctrl+Enter` / `Cmd+Enter` → Run code
  - `Escape` → Close settings panel or stop execution
  - `Ctrl+L` → Clear console
  - `Left/Right Arrow` → Step backward/forward (when not in editor and timeline active)
  - `Space` → Play/pause timeline (when not in editor and timeline active)
- [ ] Keyboard shortcut reference panel (toggle with `?` key)
- [x] ARIA roles and labels:
  - Editor: `role="textbox"` (handled by Monaco)
  - PaneResizer: `role="separator"` with `aria-orientation="vertical"` and `aria-label`
- [ ] Focus management:
  - On load, focus the editor
  - After execution, focus moves to console output
  - Tab order: Toolbar → Editor → Visualization → Console → Timeline

---

## Phase 5 — Security Hardening & Performance

> **Goal**: Harden the sandbox, optimize loading, and ensure production readiness.
> **Parallelizable**: Steps 5.1 and 5.2 can proceed concurrently.
> **Estimated Scope**: ~5 files modified.

### Step 5.1 — Sandbox Security Hardening

- [x] Review and finalize `SandboxFrame.tsx` security:
  - `sandbox="allow-scripts"` only — NO `allow-same-origin`, `allow-popups`, `allow-forms`, `allow-top-navigation`
  - Iframe `srcdoc` does not include any external script references
  - User code is string-passed via `postMessage`, never injected into `srcdoc` HTML
  - Implement nonce-based script execution inside the iframe
- [x] Add Content Security Policy meta tag inside the iframe's `srcdoc`:
  ```html
  <meta
    http-equiv="Content-Security-Policy"
    content="default-src 'none'; script-src 'nonce-{RANDOM}'; connect-src 'none'; img-src 'none'; style-src 'none';"
  />
  ```
- [x] Create `src/features/playground/utils/sanitize.ts`:
  - `sanitizeOutput(value: unknown): string` — safely stringify any value for display
  - Prevents prototype pollution in displayed objects
  - HTML-encodes output to prevent XSS in console display
  - Limits output string length (max 10 KB per entry, max 500 entries)
- [x] Network restriction: Ensure iframe cannot make fetch/XHR requests:
  - CSP `connect-src 'none'` blocks all network access
  - Override `fetch` and `XMLHttpRequest` in iframe to throw clear errors
- [x] Pyodide security:
  - Disable network access: override `urllib`, `requests` imports
  - Limit execution time with `pyodide.interruptBuffer`
  - Limit memory: monitor Pyodide heap size
  - Prevent filesystem access: Pyodide's virtual filesystem is acceptable (isolated)
- [x] Input validation:
  - Maximum code length: 50 KB
  - Reject binary content
  - Rate-limit execution (max 1 run per second)
- [ ] Test: Attempt XSS via console.log output → HTML is escaped
- [ ] Test: Attempt to access parent window from sandbox → blocked
- [ ] Test: Attempt `fetch()` from sandbox → blocked with friendly error
- [ ] Test: Infinite loop → times out cleanly without freezing UI

### Step 5.2 — Performance Optimization

- [x] Monaco Editor optimization:
  - Lazy load Monaco only when Playground route is active (already handled by lazy routing)
  - Configure Monaco to load only required language workers (JS/TS/Python)
  - Disable unused Monaco features (code actions, quick suggestions in basic mode)
- [x] Pyodide optimization:
  - Show loading progress with remaining bytes/percentage
  - Cache Pyodide in the browser using Service Worker (optional, advanced)
  - Pre-load Pyodide when user hovers over the Python language button (`onMouseEnter`)
- [x] React Flow optimization:
  - Virtualization is built-in — ensure it's not disabled
  - Limit max rendered nodes (cap at 200 for performance)
  - Use `React.memo` on custom node components
- [x] Space background optimization:
  - Canvas rendering capped at 30fps
  - Pause when Playground tab is not focused
  - Reduce star count on lower-powered devices (check `navigator.hardwareConcurrency`)
- [x] Bundle optimization:
  - Verify playground chunk is separate from main app chunks
  - Monaco chunk should be ~2 MB (acceptable for an IDE feature)
  - React Flow chunk should be ~150 KB
  - Total Playground-specific load: < 3 MB gzipped
- [ ] Verify Lighthouse performance score > 80 for the Playground route

---

## Phase 6 — Testing & Documentation

> **Goal**: Comprehensive test coverage and developer documentation.
> **Parallelizable**: All steps can proceed concurrently.
> **Estimated Scope**: ~15 test files, 2 doc files.

### Step 6.1 — Unit Tests

- [ ] `JsInstrumenter.test.ts`:
  - Test basic instrumentation (variable declaration, assignment)
  - Test function call instrumentation (call stack tracking)
  - Test async instrumentation (setTimeout, Promise detection)
  - Test error handling (malformed code input)
  - Test snapshot format matches `StateSnapshot` interface
- [ ] `PythonInstrumenter.test.ts`:
  - Test trace wrapper generation
  - Test frame filtering (only user code)
  - Test snapshot serialization across FFI
- [ ] `sanitize.test.ts`:
  - Test HTML encoding of dangerous strings
  - Test circular reference handling
  - Test output length limits
  - Test prototype pollution prevention
- [ ] `codeTemplates.test.ts`:
  - Test all templates are valid syntax for their language
  - Test template completeness (all languages have templates)

### Step 6.2 — Component Tests

- [ ] `MonacoEditor.test.tsx`:
  - Test rendering with different languages
  - Test `onChange` callback fires on edit
  - Test keyboard shortcuts (Ctrl+Enter)
  - Test loading state display
- [ ] `SandboxFrame.test.tsx`:
  - Test JS execution and output capture
  - Test timeout handling
  - Test error capture
  - Test cleanup on unmount
- [ ] `ConsoleOutput.test.tsx`:
  - Test rendering different entry types (log, warn, error, info)
  - Test clear functionality
  - Test auto-scroll behavior
  - Test max entries limit
- [ ] `TimelinePlayer.test.tsx`:
  - Test step navigation
  - Test play/pause
  - Test speed control
  - Test keyboard navigation
- [ ] `SpaceBackground.test.tsx`:
  - Test canvas rendering
  - Test reduced motion preference
  - Test cleanup on unmount
- [ ] `PlaygroundApp.test.tsx`:
  - Test full render without errors
  - Test pane layout
  - Test language switching
  - Test execution flow (write code → run → see output)

### Step 6.3 — Integration Tests

- [ ] End-to-end flow: Write JS code → Run → See console output
- [ ] End-to-end flow: Write JS code → Instrument → Step through timeline
- [ ] End-to-end flow: Switch to Python → Load Pyodide → Run Python code
- [ ] End-to-end flow: Select Event Loop lens → Run async code → See visualization update
- [ ] End-to-end flow: Select Data Structure lens → Run BST code → See tree render
- [ ] Navigation: Click Playground in Header → Opens new tab → Playground loads
- [ ] Navigation: Click "Back to Code Executives" → Returns to main site

### Step 6.4 — Documentation

- [ ] Create `docs/Playground-Developer-Guide.md`:
  - How to add a new visualization lens
  - How to add a new language
  - How to modify the theme
  - How to add example snippets
  - Security considerations for contributors
  - Performance budget and monitoring
- [ ] Update `README.md`:
  - Add Playground to the features list
  - Add Playground architecture overview
  - Add new dependencies to the stack list
- [ ] Update `.github/copilot-instructions.md`:
  - Add Playground section to module list
  - Document the standalone layout pattern
  - Document the dark theme scoping strategy
  - Add Playground-specific guidelines

---

## Parallel Work Matrix

This table shows which steps can be done simultaneously by different developers.

| Phase | Step                       | Depends On       | Can Parallel With    |
| ----- | -------------------------- | ---------------- | -------------------- |
| 0     | 0.1 Types & Structure      | —                | 0.2, 0.3             |
| 0     | 0.2 Routing & Nav          | —                | 0.1, 0.3             |
| 0     | 0.3 Layout & Theme         | —                | 0.1, 0.2             |
| 0     | 0.4 Vite Config            | 0.1              | —                    |
| 1     | 1.1 Monaco Editor          | 0.1, 0.3         | 1.2, 1.3             |
| 1     | 1.2 JS/TS Sandbox          | 0.1, 0.3         | 1.1, 1.3             |
| 1     | 1.3 Python/Pyodide         | 0.1, 0.3         | 1.1, 1.2             |
| 2     | 2.1 JS Instrumentation     | 1.2              | 2.2                  |
| 2     | 2.2 Python Instrumentation | 1.3              | 2.1                  |
| 2     | 2.3 Timeline Player        | 2.1 or 2.2       | —                    |
| 3     | 3.1 React Flow Setup       | 0.3              | 3.2–3.5 (after done) |
| 3     | 3.2 Event Loop Lens        | 3.1, 2.1         | 3.3, 3.4, 3.5        |
| 3     | 3.3 Heap & Stack Lens      | 3.1, 2.1         | 3.2, 3.4, 3.5        |
| 3     | 3.4 Data Structure Lens    | 3.1, 2.1         | 3.2, 3.3, 3.5        |
| 3     | 3.5 Stream Lens            | 3.1              | 3.2, 3.3, 3.4        |
| 4     | 4.1 Resizable Layout       | 0.3              | 4.2, 4.3, 4.4        |
| 4     | 4.2 Toolbar & Settings     | 0.3              | 4.1, 4.3, 4.4        |
| 4     | 4.3 Space Background       | 0.3              | 4.1, 4.2, 4.4        |
| 4     | 4.4 Keyboard & A11y        | 1.1              | 4.1, 4.2, 4.3        |
| 5     | 5.1 Security Hardening     | 1.2, 1.3         | 5.2                  |
| 5     | 5.2 Performance            | All Phase 1–3    | 5.1                  |
| 6     | 6.1–6.4 Testing & Docs     | All prior phases | All within Phase 6   |

### Suggested Developer Assignment

| Developer | Focus Area               | Phases             |
| --------- | ------------------------ | ------------------ |
| **Dev A** | Editor & Execution       | 0.1, 1.1, 1.2, 2.1 |
| **Dev B** | Theme & Visualizations   | 0.3, 3.1–3.5, 4.3  |
| **Dev C** | Layout, Routing & Polish | 0.2, 4.1, 4.2, 4.4 |
| **Dev D** | Python & Security        | 1.3, 2.2, 5.1, 5.2 |
| **All**   | Testing & Documentation  | 6.1–6.4            |

---

## Glossary

| Term                | Definition                                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Lens**            | A visualization mode that renders code execution state in a specific way (e.g., Event Loop view, Heap view) |
| **Instrumentation** | The process of injecting tracking code into user code to capture execution state at each step               |
| **StateSnapshot**   | A frozen capture of all execution state (variables, call stack, heap, queues) at a single point in time     |
| **Timeline**        | The ordered array of StateSnapshots that enables time-travel debugging                                      |
| **Sandbox**         | An isolated iframe execution environment that prevents user code from accessing the parent page             |
| **Pyodide**         | A CPython 3.11 port compiled to WebAssembly that runs Python in the browser                                 |
| **srcdoc**          | An HTML attribute that injects HTML content directly into an iframe without a URL                           |
| **postMessage**     | The secure browser API for cross-origin communication between windows/iframes                               |
| **AST**             | Abstract Syntax Tree — the parsed tree representation of source code used for instrumentation               |
| **FFI**             | Foreign Function Interface — the bridge between Pyodide's Python and JavaScript                             |
| **HWM**             | High Water Mark — the buffer threshold in Node.js streams that triggers backpressure                        |
| **SRI**             | Subresource Integrity — cryptographic hash verification for external scripts                                |

---

## Revision History

| Date       | Author | Change               |
| ---------- | ------ | -------------------- |
| 2026-04-08 | —      | Initial plan created |
