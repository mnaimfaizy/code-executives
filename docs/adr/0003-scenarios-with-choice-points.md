# 0003: Scenarios are stories with choice points and paths that never rejoin

- Status: accepted (2026-09-26)
- Glossary: [CONTEXT.md](../../CONTEXT.md) (scenario, cast, choice point, path, transcript)

## Context

Stories teach one concept each. The owner also wants learners to follow a whole workplace workflow (a developer and their team shipping a feature) and to see the effects that stay invisible in real life, such as a stale `origin/main` on one laptop. Those workflows turn on decisions (merge or rebase, force-push or pull first), and the learner learns most by making the decision and seeing what it did.

## Decision

- A **scenario** is a kind of story: the same step model (full snapshot per beat, stable ids and cells, state as data), the same 2D and optional 3D views, and the same pipeline and approval gate. It adds a **cast**, a **timeline** and a **transcript** (who acted, when, what they ran, what it printed).
- A scenario has a main path that may end at a **choice point**. Each option runs its own **path** to its own ending, and a path may end at one more choice point. At most 2 choice points; main path 5–10 beats, other paths 3–6, at most 24 beats in total.
- **Paths never rejoin.** Each ending shows an outcome summary and offers the other path.
- Each member of the cast is drawn as their own copy of the system (their clone, the remote, the CI runner), never as a person. People appear only as name tags.
- Scenarios live in each module's Visualization page as a gallery, deep-linked with `?scenario=<id>`.

## Considered options

- **Linear scenarios**: simpler, but the learner never decides anything, and the payoff of a scenario is seeing what a decision did.
- **Paths that rejoin a shared later beat**: shorter to author, but two different histories would have to fit one snapshot, which breaks "full snapshot per beat" and makes stepping back ambiguous.
- **A free sandbox where the learner types commands**: a different product, with no approved beats to review or test.

## Consequences

- A scenario's model is a set of paths, and the section derives the learner's route from their picks. Tests check every route, not one list.
- Every path needs its own verification: the `verify-viz` script walks every route.
- Saving explored paths is out of scope until the site decides on persistence for all modules.
