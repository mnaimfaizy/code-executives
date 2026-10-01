# 0001: Optional 3D views rendered from one step model

- Status: accepted (2026-09-25); prototype in PR #168
- Details: [docs/3D-Visualization-Standard.md](../3D-Visualization-Standard.md)

## Context

A first round of 3D (raw Three.js, a custom engine, metaphor scenes such as an assembly-line robot and a restaurant kitchen) shipped in September 2025 and was removed in April 2026 (PR #33). It taught nothing the 2D views didn't, looked unpolished, lagged, lost users in free camera movement, and kept a second rendering path in sync by hand.

## Decision

- Visualizations are **stories**: a step model of pure-data snapshots, one per beat, with tests. Views render a step; they hold no story state.
- The 2D SVG view is the default. A 3D view is optional and renders the same step model, so switching views keeps the step.
- 3D uses `three` + `@react-three/fiber` + `@react-three/drei`. It is literal (no metaphors), uses an orthographic isometric camera with a preset shot per beat, flat-shaded limited colours, and DOM labels.
- The 3D renderer is `React.lazy`-loaded; three.js never reaches the entry bundle. Without WebGL, or on error, the story falls back to 2D; reduced motion turns motion into cuts.

## Consequences

- One story definition serves both views; tests prove each story's key claims against the data.
- The 3D chunk (~260 KB gzip for the prototype) costs only learners who choose 3D.
- Existing 2D visualizations predate the step model and stay as they are until migrated one by one.
- Rolling 3D out beyond the prototype waits for the owner's sign-off on the standard's review checklist.
