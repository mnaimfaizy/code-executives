---
name: modern-web-guidance
description: "Curated modern web platform guides (accessibility, forms, CSS, performance, view transitions, dialogs/popovers, canvas and 3D accessibility) from Google Chrome. Use when building or reviewing browser UI in Code Executives and you need current, Baseline-aware HTML/CSS/JS patterns. Not for backend, tooling or story step models."
---

A vendored, read-only subset of [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance) at commit `84ae725` (v0.0.191, Apache-2.0). Read the files directly: **never** run `npx modern-web-guidance` (unpinned remote code, default-on telemetry). Provenance and licence: `NOTICE`, `LICENSE`. Evaluation: `docs/RESEARCH/Modern Web Guidance Skill Report.md`.

## Steps

1. Pick the topic in the index below and read that file under `guides/`. The folder-level overviews (`accessibility`, `css`, `forms`, `performance`) come first; specific guides refine them.
2. Adapt the guide to this repo instead of pasting it:
   - **React 19 + Tailwind v4**: guides are plain HTML/CSS/JS. Express styles as literal Tailwind classes or `src/` CSS; never build class names at runtime.
   - **Light mode only**: ignore any dark-mode, `color-scheme` or `light-dark()` advice.
   - **Motion**: anything animated (view transitions, entry/exit, scroll effects) must respect `useReducedMotion` (`src/shared/hooks`) and `prefers-reduced-motion`.
   - **Browser support**: use Baseline widely available features directly. A newer feature needs the guide's fallback; check the guide's support notes.
3. A guide that names another guide (`upstream guide <id>`) refers to upstream content we did not vendor. Skip it, or ask the owner before adding it.

## Index

| Topic | Files |
|---|---|
| Accessibility | `accessibility/accessibility`, `accessibility/accessible-error-announcement` |
| CSS | `css/css`, `css/css-layout`, `css/size-aware-styling`, `css/style-parent-with-has`, `css/fluid-scaling` |
| Forms and quiz UI | `forms/forms`, `forms/required-field-feedback`, `forms/validate-input-after-interaction` |
| Performance | `performance/performance`, `optimize-image-priority`, `break-up-long-tasks`, `identify-inp-causes`, `defer-rendering-heavy-content`, `faster-spa-view-transitions`, `schedule-tasks-by-priority` |
| UI atoms | `ui-atoms/responsive-table`, `position-aware-tooltips`, `scroll-progress-indicator` |
| UI behaviours | `ui-behaviors/animate-element-entry-exit`, `same-document-transitions`, `declarative-dialog-popover-control`, `light-dismiss-a-dialog`, `scrollytelling` |
| Canvas, 3D, text | `visual-design/interactive-content-in-3d-scenes`, `expose-canvas-content-to-browser-features`, `improve-text-layout-and-legibility` |
| Security | `security/sanitize-untrusted-html` |

The 3D and canvas guides assume plain DOM and `<canvas>`; for react-three-fiber follow `docs/3D-Visualization-Standard.md` first.

## Updating

Re-vendoring is a deliberate change for the owner to review: diff against a new upstream commit, re-apply the `npx`-reference edit, update the SHA here and in `NOTICE`, run `npm run agents:sync`.
