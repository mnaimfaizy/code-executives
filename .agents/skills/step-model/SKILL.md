---
name: step-model
description: "The step-model contract behind every Code Executives story visualization: story spec format, step snapshot schema, shot vocabulary, and tests. Use when writing a story spec, encoding a step model, or rendering one in 2D or 3D."
---

A **step model** is the single source of a story visualization: pure data, one **snapshot** per beat. The 2D view and the 3D view are two renderers of the same step; switching views mid-story keeps the step. Reference implementation: `src/features/javascript/utils/stackHeapStory.ts` and its test.

## The contract

A story module `src/features/<module>/utils/<storyId>Story.ts` exports:

- `STORY_CODE: string`: the snippet the beats walk through.
- `STORY_STEPS: StoryStep[]`: 8–12 steps, in order.
- Pure helpers the views and tests share (e.g. `getReferences(step)`, `getReachable(step)`, `isFocused(step, key)`). Derived facts come from helpers, never from hand-written duplicate fields.

Every `StoryStep` carries these base fields, plus the story's own entity arrays (frames, objects, requests, commits…):

| Field | Meaning |
|---|---|
| `id` | kebab-case, unique, stable (tests and views key on it) |
| `title` | ≤ 8 words, the beat's headline |
| `caption` | ≤ 60 words, present tense: what changed and why it matters |
| `line` | 1-based line in `STORY_CODE` |
| `shot` | a `ShotId` from the story's shot vocabulary |
| `focus` | keys to spotlight: entity ids and `owner.slot` keys |
| `phase?` | optional story-specific stage (e.g. GC `mark` / `sweep`) |

Rules that make the model render cleanly:

- **Full snapshot per step.** Every step lists every entity present at that beat; stepping backwards is just rendering an earlier step.
- **Stable identity.** An entity keeps its `id` across steps; views animate enter/exit by id.
- **Stable placement.** Each entity carries a layout cell (e.g. `cell: { col, row }`) that both views use, so an entity never jumps between steps. Keep it on a small grid (≤ 3×2 per region).
- **State as data.** Lifecycle changes are an explicit `state` field (`live`, `marked`, `collected`…), never implied by absence, so both views can animate them.

## Shot vocabulary

`ShotId` is a small string union defined per story: `overview` (everything), one shot per region (e.g. `stack`, `heap`), and `bridge` shots framing two regions plus the links between them. The spec states what each shot must keep in frame; the 3D builder turns that into a camera box. 3–5 shots per story.

## Tests (`<storyId>Story.test.ts`)

- Exactly the spec's beat count; unique ids.
- Per step: `line` within the code; every reference target exists; every `focus` key exists; no two entities share a cell.
- One test per aha beat that proves its claim from the data through the helpers (e.g. "Bob is reachable after `bob = null`" via `getReachable`).

## Templates

- Writing a story spec: [spec-template.md](spec-template.md)
- Encoding a step model: [model-template.md](model-template.md)
