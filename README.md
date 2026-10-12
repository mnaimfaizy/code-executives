# Code Executives

Code Executives is a website that teaches programming by showing, step by step, what code and tools do to state you can't see: stack frames, heap objects, queues, commits and refs. It is a static React 19 + Vite + TypeScript single-page application with no server and no accounts.

Live site: [https://codexecutives.com](https://codexecutives.com)

## Run it

Requirements: Node.js `^22.22.2 || ^24.15.0 || >=26.0.0` and npm (the repository pins `npm@10.9.3`; npm is the only supported package manager).

```bash
git clone https://github.com/mnaimfaizy/code-executives.git
cd code-executives
npm ci
npm run dev
```

Vite prints the local address, `http://localhost:5173` by default.

| Script                                         | What it does                                           |
| ---------------------------------------------- | ------------------------------------------------------ |
| `npm run dev`                                  | Development server                                     |
| `npm run build`                                | Type-check (`tsc -b`) and build to `dist/`             |
| `npm run preview`                              | Serve the built `dist/` locally                        |
| `npm run lint` / `npm run lint:fix`            | ESLint                                                 |
| `npm run format`                               | Prettier                                               |
| `npm run test` / `npm run test:run`            | Vitest, watching or once                               |
| `npm run test:coverage`                        | Vitest with coverage                                   |
| `npm run agents:sync` / `npm run agents:check` | Generate, or verify, the per-tool copies of `.agents/` |
| `npm run check:3d-chunk`                       | Check that three.js stays out of the entry bundle      |

Before reporting a code change done, run all four checks:

```bash
npx tsc -b && npm run lint && npm run test:run && npm run build
```

## What is on the site

The words below are the site's own; [CONTEXT.md](CONTEXT.md) defines them.

### Modules

Sixteen modules, each at its own route, with its sections chosen by `?section=<Label>`:

| Module                         | Route             |
| ------------------------------ | ----------------- |
| JavaScript                     | `/javascript`     |
| RxJS                           | `/rxjs`           |
| Git                            | `/git`            |
| Data Structures                | `/datastructures` |
| React                          | `/react`          |
| Next.js                        | `/nextjs`         |
| Big-O Notation                 | `/bigo`           |
| Python                         | `/python`         |
| System Design                  | `/systemdesign`   |
| TypeScript                     | `/typescript`     |
| AI Fundamentals                | `/ai`             |
| Node.js                        | `/nodejs`         |
| DevOps                         | `/devops`         |
| Authentication & Authorization | `/auth`           |
| Backend Architecture           | `/backend`        |
| Database & DBMS                | `/database`       |

The RxJS module has a marble diagram tool: the learner writes a stream as marbles, picks an operator and sees the stream it produces. It does not run the learner's code.

### Stories and scenarios

New visualizations are **stories**: one concept told as a sequence of **beats**, drawn literally (frames, objects, commits, refs) and never as an everyday metaphor. The beat model is pure data with tests. A 2D SVG view draws it by default, and an optional 3D view draws the same beat, so switching views keeps the beat. The 3D renderer (three.js with react-three-fiber) is loaded only when a learner chooses 3D, and the story falls back to 2D without WebGL. See [ADR 0001](docs/adr/0001-optional-3d-with-one-step-model.md) and the [3D Visualization Standard](docs/3D-Visualization-Standard.md).

A **scenario** is a story that follows a whole workplace workflow, with a cast, a timeline, a transcript and up to two choice points whose paths never rejoin ([ADR 0003](docs/adr/0003-scenarios-with-choice-points.md)). Scenarios live in a module's Visualization page and are linked with `?scenario=<id>`.

Stories exist today in the JavaScript and Git modules, and Git has the first scenario; their approved specs are in [docs/stories/](docs/stories/README.md). Most other visualizations predate the beat model: they are 2D SVG components and stay as they are until migrated one by one.

### Playground

There is exactly one Playground, at `/playground`. It is where a learner runs their own code and watches what it does to state ([ADR 0004](docs/adr/0004-playground-traces-share-the-snapshot.md)). It has its own layout and is the site's only dark page.

- **Trace.** The learner's JavaScript is instrumented and run on the browser's own engine inside a sandboxed iframe. The run is recorded as a trace: one **step** per statement, each holding the line that ran and a snapshot in the same shape a story's beat holds. TypeScript runs through the same tracer with its types stripped. A step limit ends an endless loop and keeps the steps recorded so far.
- **Lenses.** A lens chooses which part of a snapshot is drawn: Stack & Heap or Stack & Queues. Both are drawn with the views the stories use, in 2D or 3D. The queues are the tracer's model of the specification, not the engine's own queues.
- **Console.** What the code printed, in order.
- **Examples.** Prebuilt code to load and watch, each with a suggested lens and no goal.
- **Exercises.** Tasks with a goal, checks that pass or fail on the learner's code, hints and a solution. A check can be watched step by step in a lens.
- **Python.** Python can be selected and runs in Pyodide, loaded from a CDN on first use. It records values only: its snapshots have frames and no heap objects.
- **Links.** `?example=<id>`, `?exercise=<id>` and `&lens=<lens>` open the Playground on an example or an exercise.

A trace is recorded, not authored, so it is never presented as a story: it has no captions and never shows a garbage-collection sweep. [docs/Playground-Developer-Guide.md](docs/Playground-Developer-Guide.md) covers the tracer, the sandbox, examples and exercises.

### Quizzes

A module's quiz draws its questions from a bank in `quiz-banks/<moduleId>.quiz.json`. The existing banks set 5 questions and a 10-minute limit per attempt. Question formats are single choice, multi-select, true/false, ordering and matching, and a wrong answer links back to the module sections that cover it. Results are stored in the browser. See [docs/Quiz-System-Guide.md](docs/Quiz-System-Guide.md) for the schema and the authoring workflow.

### Progress

The Progress page at `/progress` shows what a learner has done that a check proved: exercises passed and quiz results ([ADR 0005](docs/adr/0005-progress-and-milestones-not-gamification.md)). A **milestone** is a named point in that record, earned once and kept:

- one per module that has at least three exercises, for passing all of them, and one for passing every exercise;
- one per module quiz, for a completed attempt that scores 80% or more.

There are no points, levels, streaks or leaderboards. Progress is kept in the learner's browser only (`localStorage`), and the page has one control to clear it.

## Repository layout

```
src/
  App.tsx              Routes; every page is lazy-loaded
  pages/               Home, About, Progress
  features/<module>/   One folder per module, plus playground/
  shared/              Code used across modules: components, hooks, snapshot,
                       2D and 3D view helpers (viz, viz3d), progress, quiz UI
  components/          Header, Footer, Sidebar
  utils/, types/       Theme, quiz loading and scoring, shared types
quiz-banks/            <moduleId>.quiz.json, one bank per module quiz
docs/
  adr/                 Architecture decisions
  stories/             Approved story and scenario specs
  RESEARCH/            Source material the modules' content must agree with
.agents/               Agent definitions and skills (edited only here; ADR 0002)
.github/workflows/     CI
public/                Static files, including .htaccess
```

A module folder holds its page (`<Module>Page.tsx`), `components/sections/`, usually `components/visualizations/` and, for stories, beat models in `utils/<storyId>Story.ts`. Tests sit next to the code as `*.test.ts(x)`.

## Build and deployment

`npm run build` writes a fully static bundle to `dist/`; no Node.js server is needed to serve it.

The app uses client-side routing, so the web server must answer every path that is not a real file with `index.html`. For Apache hosts (including cPanel) the repository ships [public/.htaccess](public/.htaccess), which Vite copies into `dist/`; it needs `mod_rewrite`. Upload the contents of `dist/`, including the hidden `.htaccess`, to the web root. On any other static host, configure the same fallback.

The repository contains no deployment workflow. CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on pushes and pull requests to `main` and `develop`.

## Contributing

[AGENTS.md](AGENTS.md) holds the repository's rules for people and coding agents alike: dependencies, visualizations, the Playground, navigation and quiz banks. [CONTEXT.md](CONTEXT.md) is the glossary, and [docs/adr/](docs/adr/) records the decisions and their reasons. Read those first, then:

1. Create a branch.
2. Make the change, with tests next to the code.
3. Run the four checks above.
4. Open a pull request.

Dependency changes need the owner's approval. Report security issues as described in [SECURITY.md](SECURITY.md), not in a public issue.

## Acknowledgments

Built with [React](https://react.dev), [Vite](https://vite.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [React Router](https://reactrouter.com), [Monaco Editor](https://microsoft.github.io/monaco-editor/), [three.js](https://threejs.org) with [react-three-fiber](https://r3f.docs.pmnd.rs), [Acorn](https://github.com/acornjs/acorn), [Astring](https://github.com/davidbonnet/astring), [Lucide](https://lucide.dev) and [Vitest](https://vitest.dev). Python in the Playground runs on [Pyodide](https://pyodide.org).

## License

[MIT](LICENSE). Copyright (c) 2025 Mohammad Naim Faizy.
