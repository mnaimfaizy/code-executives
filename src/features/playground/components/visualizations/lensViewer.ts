/**
 * The least width, in CSS pixels, of a lens's 3D viewer: labels are DOM cards of a fixed size,
 * so a narrower viewer cannot keep them apart. Both lenses set it as `min-w-[760px]`; the
 * Playground reads it here to widen the lens pane when the learner chooses 3D.
 */
export const VIEWER_3D_MIN_WIDTH = 760;
