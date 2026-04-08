# Playground Developer Guide

> Internal reference for contributors working on the Code Executives interactive coding playground.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Directory Structure](#directory-structure)
3. [How to Add a New Visualization Lens](#how-to-add-a-new-visualization-lens)
4. [How to Add a New Language](#how-to-add-a-new-language)
5. [How to Modify the Theme](#how-to-modify-the-theme)
6. [How to Add Example Snippets](#how-to-add-example-snippets)
7. [Security Considerations](#security-considerations)
8. [Performance Budget & Monitoring](#performance-budget--monitoring)
9. [Testing](#testing)

---

## Architecture Overview

The Playground is a **standalone feature module** at `src/features/playground/` that runs in its own layout (no Header/Footer/Sidebar). It opens in a new browser tab at `/playground`.

### Key Design Decisions

| Decision                                        | Rationale                                                                |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| Standalone layout (`PlaygroundLayout`)          | Full viewport needed for editor + visualizations                         |
| Dark theme scoped via `data-theme="playground"` | CSS custom properties avoid polluting the light-mode main site           |
| Sandboxed `<iframe>` for JS/TS execution        | Defense-in-depth: CSP + `sandbox="allow-scripts"` + network API blocking |
| Pyodide for Python                              | WASM-based CPython in the browser, lazy-loaded from CDN (~11 MB)         |
| `acorn` + `astring` for JS instrumentation      | Parse → transform → regenerate; no eval-based instrumentation            |
| `sys.settrace()` for Python instrumentation     | CPython's native tracing mechanism, captured via Pyodide FFI             |
| React Flow (`@xyflow/react`) for visualizations | Interactive node graphs with built-in pan/zoom                           |

### Data Flow

```
User Code → [Instrumenter] → Instrumented Code → [Sandbox/Pyodide]
                                                        ↓
                                            StateSnapshot[] + ConsoleEntry[]
                                                        ↓
                                    [useTimeline] → TimelinePlayer (step-by-step)
                                    [Lens]        → VisualizationCanvas (React Flow)
                                    [Console]     → ConsoleOutput
```

---

## Directory Structure

```
src/features/playground/
├── PlaygroundApp.tsx              # Root orchestrator
├── PlaygroundApp.test.tsx         # Smoke tests
├── types/
│   ├── index.ts                   # Re-exports
│   └── playground-v2.ts           # All type definitions
├── hooks/
│   ├── useMonaco.ts               # Monaco lifecycle + theme
│   ├── usePlaygroundState.ts      # Language, code, execution state
│   ├── useSandbox.ts              # JS/TS sandbox execution
│   ├── usePyodide.ts              # Python/Pyodide execution
│   ├── useTimeline.ts             # Timeline step navigation + auto-play
│   └── usePaneLayout.ts           # Resizable 3-pane layout
├── instrumentation/
│   ├── JsInstrumenter.ts          # JS instrumentation wrapper
│   ├── PythonInstrumenter.ts      # Python sys.settrace wrapper
│   ├── StateSnapshot.ts           # Clone, diff, format utilities
│   └── index.ts                   # Re-exports
├── services/
│   └── instrumentCode.ts          # Low-level acorn AST transformation
├── utils/
│   ├── codeTemplates.ts           # Default starter code per language
│   ├── exampleSnippets.ts         # Pre-built example snippets
│   └── sanitize.ts                # XSS prevention + output limits
├── components/
│   ├── editor/
│   │   ├── MonacoEditor.tsx       # Monaco wrapper
│   │   └── EditorTabs.tsx         # File tab bar
│   ├── execution/
│   │   ├── SandboxFrame.tsx       # Sandboxed iframe for JS/TS
│   │   ├── ConsoleOutput.tsx      # Console output panel
│   │   ├── PythonRunner.tsx       # Pyodide loading indicator
│   │   └── ExecutionController.tsx
│   ├── instrumentation/
│   │   └── TimelinePlayer.tsx     # Timeline slider + variables + call stack
│   ├── visualizations/
│   │   ├── VisualizationCanvas.tsx
│   │   ├── LensSelector.tsx
│   │   ├── lenses/
│   │   │   ├── EventLoopLens.tsx
│   │   │   ├── HeapStackLens.tsx
│   │   │   ├── DataStructureLens.tsx
│   │   │   └── StreamLens.tsx
│   │   └── shared/
│   │       └── AnimatedNode.tsx
│   ├── layout/
│   │   ├── PlaygroundLayout.tsx
│   │   ├── PlaygroundToolbar.tsx
│   │   ├── PaneResizer.tsx
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

## How to Add a New Visualization Lens

1. **Create the lens component** in `components/visualizations/lenses/`:

```tsx
// MyLens.tsx
import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import type { StateSnapshot } from '../../../types';

interface MyLensProps {
  currentSnapshot: StateSnapshot | null;
  previousSnapshot: StateSnapshot | null;
}

const MyLens: React.FC<MyLensProps> = ({ currentSnapshot }) => {
  // Transform snapshot data into React Flow nodes + edges
  const nodes = useMemo(() => buildNodes(currentSnapshot), [currentSnapshot]);
  const edges = useMemo(() => buildEdges(currentSnapshot), [currentSnapshot]);

  return (
    <ReactFlow nodes={nodes} edges={edges} fitView>
      <Background />
    </ReactFlow>
  );
};

export default React.memo(MyLens);
```

2. **Register the lens** in `VisualizationCanvas.tsx`:

```tsx
import MyLens from './lenses/MyLens';

// In the switch/map:
case 'my-lens':
  return <MyLens currentSnapshot={currentSnapshot} previousSnapshot={previousSnapshot} />;
```

3. **Add the type** to `types/playground-v2.ts`:

```ts
export type VisualizationLens =
  | 'event-loop'
  | 'heap-stack'
  | 'data-structure'
  | 'stream'
  | 'my-lens'
  | 'none';
```

4. **Update LensSelector** to show the new lens in the toolbar dropdown.

5. **Wrap in `React.memo`** for performance (the snapshot props change on every step).

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
   - `execute(code)` → `Promise<{ error, snapshots }>`
   - `entries: ConsoleEntry[]`
   - `clearEntries()`

5. **Wire it into `PlaygroundApp.tsx`** — add the language to the `consoleEntries` selection logic and execution handlers.

6. **Add example snippets** in `utils/exampleSnippets.ts`.

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

## How to Add Example Snippets

Edit `utils/exampleSnippets.ts`:

```ts
{
  id: 'unique-id',           // Must be unique
  label: 'Display Name',
  description: 'Brief description shown in dropdown',
  language: 'javascript',    // Must be a valid PlaygroundLanguage
  suggestedLens: 'heap-stack', // Which lens to auto-select
  code: `// Your code here
const x = 1;
console.log(x);`,
},
```

Snippets appear in the toolbar's "Examples" dropdown, filtered by the currently selected language.

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

- All console output is HTML-escaped via `escapeHtml()` before rendering.
- `sanitizeOutput()` handles circular references, prototype pollution keys (`__proto__`, `constructor`), BigInt, Symbol, and deeply nested objects.
- Entry counts capped at `MAX_CONSOLE_ENTRIES` (500).
- Individual entries capped at `MAX_ENTRY_LENGTH` (10 KB).

### For Contributors

- **Never** use `dangerouslySetInnerHTML` with unsanitized user output.
- **Never** inject user code directly into iframe `srcdoc` — always use `postMessage`.
- **Never** add `allow-same-origin` to the sandbox iframe.
- When adding new network/system APIs, block them in `SandboxFrame.tsx`.

---

## Performance Budget & Monitoring

### Bundle Budgets

| Chunk                      | Budget                                        |
| -------------------------- | --------------------------------------------- |
| Playground app code        | < 60 KB gzipped                               |
| @xyflow/react              | < 45 KB gzipped                               |
| Monaco (loaded separately) | External, lazy-loaded                         |
| Pyodide (CDN)              | ~11 MB, lazy-loaded on first Python execution |

### Optimization Strategies

- **React.memo** on all visualization lenses and `AnimatedNode`.
- **Data caps**: `DataStructureLens` limits to 200 nodes max.
- **Adaptive canvas**: `SpaceBackground` adjusts star count based on `navigator.hardwareConcurrency`.
- **Monaco features disabled**: `codeLens`, `colorDecorators`, `inlayHints`, `lightbulb`, `links`, `renderWhitespace`, `occurrencesHighlight`, `selectionHighlight`.
- **Lazy loading**: Monaco and Pyodide are loaded on demand, not at page load.

### Monitoring

Use `PerformanceDashboard` (bottom-right in dev mode) to watch:

- Component re-render frequency during timeline stepping
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

| Category          | Files                                                                                                                                                       | Count     |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Unit tests        | `JsInstrumenter.test.ts`, `PythonInstrumenter.test.ts`, `sanitize.test.ts`, `codeTemplates.test.ts`                                                         | ~40 tests |
| Component tests   | `MonacoEditor.test.tsx`, `SandboxFrame.test.tsx`, `ConsoleOutput.test.tsx`, `TimelinePlayer.test.tsx`, `SpaceBackground.test.tsx`, `PlaygroundApp.test.tsx` | ~50 tests |
| Integration tests | `__tests__/integration.test.ts`                                                                                                                             | ~19 tests |

### Mock Strategy

- **Monaco Editor**: Mocked with a `<textarea>` wrapper (WASM/WebWorker can't run in jsdom).
- **SandboxFrame**: Real component but iframe content doesn't execute in jsdom.
- **SpaceBackground**: Canvas context mocked (`getContext` returns stub).
- **Pyodide**: Hook fully mocked (WASM can't load in jsdom).
- **Pure utilities** (`sanitize`, `codeTemplates`, instrumentation): Tested directly, no mocks.

### Adding Tests

Place test files adjacent to the code they test:

```
MyComponent.tsx
MyComponent.test.tsx
```

For cross-module integration tests, use `__tests__/integration.test.ts`.
