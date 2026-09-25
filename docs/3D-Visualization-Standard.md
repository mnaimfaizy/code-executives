# 3D Visualization Standard

Status: **Prototype** (branch `prototype/3d-js-memory`). This document records the decisions from the September 2026 design session. Read it before building any 3D view.

## Why this exists

A first round of 3D (raw Three.js, Sep 2025) was removed in April 2026 (PR #33). It failed on every axis:

- **Decorative:** metaphor scenes (a robot assembly line, a library, a kitchen) taught nothing the 2D version didn't.
- **Cheap-looking:** the rendering, lighting and camera work looked unpolished.
- **Slow or broken:** it lagged and broke on some devices.
- **Hard to use:** the camera got lost and the labels were unreadable.
- **Unfinished:** half-built scenes behind a feature flag.

This standard exists so that doesn't happen again.

## Principles

1. **3D must teach, not decorate.** Use 3D only where depth carries meaning: layers, regions, references crossing space. If the 2D view explains it just as well, don't build 3D.
2. **Literal, not metaphor.** Draw the concept itself: frames, objects, references. No kitchens, libraries or robots.
3. **3D is an option, and 2D is the default.** Both views render **one step model**. Switching views keeps the learner on the same step.
4. **A guided camera.** Every step has a preset shot and the camera glides to it. Orbiting is optional, and a **Reset view** button returns to the preset. The scroll wheel never zooms the scene, so page scrolling keeps working.
5. **The learner sets the pace.** Provide step back/forward, play/pause and speed, and keep the defaults slow. Each step is a full snapshot, so stepping backwards costs nothing.
6. **Labels are always readable.** Labels are DOM elements (drei `<Html>`) that always face the camera, sit on or beside their object, and are never smaller than 11px. Use `zIndexRange={[10, 0]}` so they never cover site chrome.

## Quality bar (references)

| Aspect | Reference |
|---|---|
| Teaching pace, one idea per step | [Bartosz Ciechanowski](https://ciechanow.ski/) |
| Guided camera per step in a CS scene | [LLM Visualization (Bycroft)](https://bbycroft.net/llm) |
| Visual language: isometric, clean, readable | [Cloudcraft](https://www.cloudcraft.co/), [Isoflow](https://isoflow.io/) |
| Performance and graceful fallback | [How we built the GitHub globe](https://github.blog/engineering/engineering-principles/how-we-built-the-github-globe/) |
| Polish ceiling (look only, not the navigation) | [Bruno Simon](https://bruno-simon.com/), [R3F examples](https://r3f.docs.pmnd.rs/getting-started/examples) |
| 2D baseline the 3D view must beat | [Loupe](http://latentflip.com/loupe/), [CNN Explainer](https://poloclub.github.io/cnn-explainer/) |

**Style:** an orthographic, isometric-style camera. Flat-shaded Lambert materials in a limited palette where each color means one role (frame, object, array, reference, focus/root, unmarked). No PBR or realism, no bloom or neon, no textures.

## Architecture

```
utils/<story>.ts               step model + scenario (pure data, unit-tested)
visualizations/2d/<Name>2D.tsx SVG renderer of one step
visualizations/3d/<Name>3D.tsx R3F renderer of one step (lazy chunk)
sections/<Story>.tsx           shell: code panel, narration, controls, 2D/3D toggle
```

- **Tech:** `three`, `@react-three/fiber` and `@react-three/drei` (`CameraControls`, `Html`, `QuadraticBezierLine`, `RoundedBox`).
- **Loading:** the 3D renderer is `React.lazy`-loaded. three.js must **never** be in the entry graph. Do not add a `manualChunks` rule for three, because that made `index.html` preload it. Check after a build that the `WebGLRenderer` code only appears in the lazy chunk.
- **Fallbacks:**
  - No WebGL: the 3D toggle is disabled.
  - `prefers-reduced-motion`: instant camera cuts and no tweens or pulses.
  - A render error: an `ErrorBoundary` falls back to the 2D view.
  - While the chunk loads: the 2D view shows with a "Loading 3D…" overlay.
- **Camera framing:** each shot defines a world-space box, a view direction and pixel padding for labels. The zoom is computed from the projected box (`frameShot`), so shots fit any viewer size.
- **Type gotcha:** R3F adds its elements to the global JSX namespace, so `React.ElementType` without props resolves to `never` for `className`. Type icon components as `LucideIcon` or give `ElementType` explicit props.

## Review checklist (pass/fail)

1. From the 3D view alone, a learner can explain the story's key insight (for the prototype: *why Bob survives `bob = null`*).
2. Every label is readable at every preset shot.
3. It runs smoothly on a normal laptop. 3D loads only on toggle, and 2D pages are the same size as before.
4. Switching views mid-story keeps the step.
5. With no WebGL or with reduced motion on, it falls back correctly.
6. It meets the look and feel of the references above.

## Prototype: JavaScript › Memory Heap › "Stack ↔ Heap"

- **Story:** 10 steps following `makeUser('Ada')` / `makeUser('Bob')`: frames pushed and popped, a heap-to-heap reference, `bob = null` (Bob survives through Ada), `ada = null`, the GC mark phase, and the GC sweep.
- **Model:** `src/features/javascript/utils/stackHeapStory.ts`, with tests covering reachability and consistency.
- **Views:** `StackHeap2D.tsx` and `StackHeap3D.tsx`. The shell is `sections/StackHeapStory.tsx`, mounted in `MemoryHeap.tsx`.
- **Rollout gate:** don't roll out to other modules until the owner signs off on the checklist. After that, replace the hand-authored scenario with traces from the playground's `JsInstrumenter`, then pick the next module.
