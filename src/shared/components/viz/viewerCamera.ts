/**
 * Three-free types shared by story sections and their lazy 3D renderers. Sections import these
 * freely; anything that needs three.js lives in `src/shared/viz3d/` instead.
 */

export type V3 = [number, number, number];
/** An axis-aligned box as `[min, max]` corners. */
export type Box3 = [V3, V3];

/** The direction the learner looks from; each story's shots are framed along it. */
export type ViewPreset = 'iso' | 'front' | 'top';

export type OrbitDir = 'left' | 'right' | 'up' | 'down';

/** A one-shot camera instruction. `token` changes on every press, so repeats still fire. */
export type CameraCommand =
  | { kind: 'zoomIn' | 'zoomOut' | 'fit' | 'reset'; token: number }
  | { kind: 'orbit'; dir: OrbitDir; token: number };

/** A command before the section stamps its token. */
export type CameraCommandInput =
  | { kind: 'zoomIn' | 'zoomOut' | 'fit' | 'reset' }
  | { kind: 'orbit'; dir: OrbitDir };

/** Everything a 3D renderer needs to drive its camera, owned by the story section. */
export interface CameraState {
  preset: ViewPreset;
  /** On: a new step keeps the learner's camera instead of gliding to its shot. */
  hold: boolean;
  /** On: left-drag (and one finger) pans instead of orbiting. */
  pan: boolean;
  command: CameraCommand | null;
}
