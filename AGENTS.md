# AGENTS.md

Code Executives is a React 19 + Vite + TypeScript site that teaches programming through step-by-step visualizations. This file holds the repository's rules: what an agent must follow and can't infer from the code. Decisions and their reasons live in [docs/adr/](docs/adr/).

## Commands

Scripts are in `package.json`. Before reporting any code change done, run all four:

```bash
npx tsc -b && npm run lint && npm run test:run && npm run build
```

After editing anything in `.agents/`, run `npm run agents:sync` and commit the generated files; CI runs `npm run agents:check`.

<!-- review-rules:start -->
## Rules

### Dependencies
- npm only, exact versions (`save-exact`), lockfile committed. CI runs `npm ci` with a frozen lockfile and fails `npm audit --audit-level=high`.
- Every dependency change follows the `add-dependency` skill and `.github/instructions/dependency-security.instructions.md`, and needs the owner's approval.
- Keep the Axios guardrails in `package.json` `overrides`. Workflow actions are pinned to full commit SHAs with minimal `permissions`.

### Visualizations
- New visualizations are **stories**: one step model (`src/features/<module>/utils/<storyId>Story.ts`, pure data, tested) rendered by a 2D view and, optionally, a 3D view. Both views render the same step; 2D is the default.
- Literal, not metaphor: draw the concept itself (frames, objects, requests), never everyday stand-ins.
- 3D follows [docs/3D-Visualization-Standard.md](docs/3D-Visualization-Standard.md). three.js is imported only from a `React.lazy` renderer and never reaches the entry bundle; `manualChunks` has no rule for it.
- Motion respects `useReducedMotion` (`src/shared/hooks`).

### Code
- Icon props are typed `LucideIcon`: R3F's global JSX types make a bare `React.ElementType` reject `className`.
- Light mode only. Tailwind v4 can't see class names built at runtime (`bg-${color}-50`): write classes out literally or map them through a fixed object.
- Tests sit next to the code as `*.test.ts(x)`.

### Modules, sections and navigation
- A section is selected by `?section=<Label>`. The keys of a page's `sectionComponents` must equal the sidebar labels exactly; an unknown label silently falls back to Introduction.
- Section labels live in **two** places that must change together: `src/components/Sidebar.tsx` (`sidebarSections`, drives the UI) and `src/shared/constants/moduleNavigation.ts` (`baseModuleNavigationSections`, resolves quiz references). The "Quiz" item is appended automatically.
- Every module id needs a `theme.colors` entry in `src/utils/theme.ts`, and a new primary colour needs a `colorMap` entry in `Sidebar.tsx`.

### Quiz banks
- Banks live at the repository root in `quiz-banks/<moduleId>.quiz.json`; the file's `moduleId` must equal its filename or the bank is silently rejected.
- `references` are exact section labels from `moduleNavigation.ts`. 30+ questions per bank; existing ids stay stable, new ids continue the sequence.
<!-- review-rules:end -->

## Agents: the architect and the specialists

The session you talk to is the **architect**: it analyzes, plans, decides, and delegates focused work to specialists so its own context stays free for analysis. Specialists never delegate further; every handoff returns to the architect.

| Specialist | Owns |
|---|---|
| `viz-story-writer` | Story spec (`docs/stories/<module>/<id>.md`), then the step model and its tests |
| `viz-2d-builder` | SVG renderer and the story section shell with the 2D/3D toggle |
| `viz-3d-builder` | The lazy R3F renderer, wired into the toggle |
| `module-quiz-generator` | `quiz-banks/<module>.quiz.json` |

Story pipeline: story writer (spec) → **owner approves the spec** → story writer (step model) → 2D builder → 3D builder. The architect stops at the approval gate every time.

When dispatching a specialist, give it the module, section, story id, and the files it may touch. Each specialist returns a report of ≤ 200 words: files touched, checks run with pass/fail, open issues. Read the diff only when the report raises a doubt. Specialists work within installed dependencies; adding one is the architect's call, with the owner's approval.

## Where things live

- `.agents/agents/` and `.agents/skills/`: the only place agent definitions and skills are edited. `.claude/` and `.github/agents/` hold generated copies (see [ADR 0002](docs/adr/0002-agents-directory.md)).
- `docs/adr/`: architecture decisions. Record new repository-wide rules as an ADR and link it here.
- `docs/RESEARCH/`: the source material each module's content and stories must agree with.
- `docs/stories/`: approved story specs.
