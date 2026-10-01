/**
 * Shared camera for story 3D renderers.
 *
 * THREE.JS SIDE: this module imports three, R3F and drei. Import it ONLY from a renderer that a
 * story section loads with `React.lazy`, or three.js lands in the entry bundle. Sections use
 * the three-free types in `src/shared/components/viz/viewerCamera.ts` instead.
 */
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CameraControls, CameraControlsImpl } from '@react-three/drei';
import * as THREE from 'three';
import type { Box3, CameraState, OrbitDir, V3, ViewPreset } from '../components/viz/viewerCamera';
import { VIEW_DIRECTIONS, frameShot, type Shot } from './frameShot';


const ZOOM_STEP = 1.25;
const ORBIT_STEP = THREE.MathUtils.degToRad(15);
const MIN_ZOOM_FACTOR = 0.5;
const MAX_ZOOM_FACTOR = 3;
/** Room (px) kept clear on the right for the viewer toolbar. */
const TOOLBAR_GUTTER = 44;

const ORBIT: Record<OrbitDir, [number, number]> = {
  left: [-ORBIT_STEP, 0],
  right: [ORBIT_STEP, 0],
  up: [0, -ORBIT_STEP],
  down: [0, ORBIT_STEP],
};

/** Wheel delta in pixels, whatever the browser's delta mode. */
const wheelPixels = (e: WheelEvent) =>
  e.deltaMode === 1 ? e.deltaY * 33 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;

export interface StoryCameraProps {
  /** The step's preset shot. */
  shot: Shot;
  /** The scene's extent plus a margin: panning keeps the target inside it. */
  bounds: Box3;
  camera: CameraState;
  /** Reduced motion: every camera move is a cut. */
  instant: boolean;
  /** Per-story direction overrides (e.g. a story tuned to a different isometric angle). */
  directions?: Partial<Record<ViewPreset, V3>>;
}

/**
 * Frames each step's shot from the learner's view preset and lets them take over: orbit
 * (left-drag, one finger), pan (right-drag, pan mode, two fingers), zoom (toolbar, Ctrl/⌘ +
 * wheel, pinch; plain wheel only in full screen). Hold view keeps the camera across steps.
 */
export const StoryCamera: React.FC<StoryCameraProps> = ({
  shot,
  bounds,
  camera,
  instant,
  directions,
}) => {
  const controls = useRef<CameraControlsImpl>(null);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const dom = useThree((s) => (s.events.connected as HTMLElement | undefined) ?? s.gl.domElement);
  const { preset, hold, pan, command } = camera;
  const direction =
    (preset === 'iso' ? shot.isoDir : undefined) ?? directions?.[preset] ?? VIEW_DIRECTIONS[preset];

  // Latest values for the imperative callbacks below.
  const latest = useRef({ shot, direction, width, height, instant });
  latest.current = { shot, direction, width, height, instant };

  const frame = useRef(() => {
    const c = controls.current;
    if (!c) return;
    const { shot: s, direction: d, width: w, height: h, instant: cut } = latest.current;
    const pad = { ...s.pad, right: s.pad.right + TOOLBAR_GUTTER };
    const { target, position, zoom } = frameShot({ ...s, pad }, d, w, h);
    c.minZoom = zoom * MIN_ZOOM_FACTOR;
    c.maxZoom = zoom * MAX_ZOOM_FACTOR;
    void c.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, !cut);
    void c.zoomTo(zoom, !cut);
  });

  const zoomBy = useRef((factor: number) => {
    const c = controls.current;
    if (!c) return;
    // zoom() adds to the zoom the camera is heading for; scale the step by the current zoom.
    void c.zoom(c.camera.zoom * (factor - 1), !latest.current.instant);
  });

  useLayoutEffect(() => {
    const [min, max] = bounds;
    controls.current?.setBoundary(
      new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max))
    );
  }, [bounds]);

  // Re-frame on a new shot (unless held), a new preset, a new viewer size, or Hold turning off.
  const prev = useRef<{ shot: Shot; direction: V3; width: number; height: number; hold: boolean }>(
    null
  );
  useLayoutEffect(() => {
    const p = prev.current;
    prev.current = { shot, direction, width, height, hold };
    const reframe =
      !p ||
      p.direction.some((v, i) => v !== direction[i]) ||
      p.width !== width ||
      p.height !== height ||
      (p.hold && !hold) ||
      (p.shot !== shot && !hold);
    if (reframe) frame.current();
  }, [shot, direction, width, height, hold]);

  // One-shot commands. A command already present at mount (e.g. after a 2D → 3D switch) is
  // history, not a new press.
  const handled = useRef(command?.token);
  useEffect(() => {
    if (!command || command.token === handled.current) return;
    handled.current = command.token;
    const c = controls.current;
    if (!c) return;
    switch (command.kind) {
      case 'zoomIn':
        zoomBy.current(ZOOM_STEP);
        break;
      case 'zoomOut':
        zoomBy.current(1 / ZOOM_STEP);
        break;
      case 'fit':
      case 'reset':
        frame.current();
        break;
      case 'orbit': {
        const [az, polar] = ORBIT[command.dir];
        void c.rotate(az, polar, !latest.current.instant);
        break;
      }
    }
  }, [command]);

  // Wheel: Ctrl/⌘ + wheel (and trackpad pinch, which sends ctrl) always zooms; a plain wheel
  // zooms only in full screen and otherwise scrolls the page. Non-passive so zooming can
  // cancel the browser's own page zoom.
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const modifier = e.ctrlKey || e.metaKey;
      if (!modifier && !document.fullscreenElement) return;
      e.preventDefault();
      const px = THREE.MathUtils.clamp(wheelPixels(e), -100, 100);
      zoomBy.current(Math.pow(ZOOM_STEP, -px / 60));
    };
    dom.addEventListener('wheel', onWheel, { passive: false });
    return () => dom.removeEventListener('wheel', onWheel);
  }, [dom]);

  return (
    <CameraControls
      ref={controls}
      makeDefault
      smoothTime={0.6}
      // Loose enough to reach every preset: top is nearly vertical, front is low.
      minPolarAngle={0.02}
      maxPolarAngle={Math.PI / 2 - 0.08}
      minAzimuthAngle={-Math.PI / 2}
      maxAzimuthAngle={Math.PI / 2}
      mouseButtons={{
        left: pan ? CameraControlsImpl.ACTION.TRUCK : CameraControlsImpl.ACTION.ROTATE,
        middle: CameraControlsImpl.ACTION.NONE,
        right: CameraControlsImpl.ACTION.TRUCK,
        // Wheel zoom is handled above, so a plain wheel keeps scrolling the page.
        wheel: CameraControlsImpl.ACTION.NONE,
      }}
      touches={{
        one: pan ? CameraControlsImpl.ACTION.TOUCH_TRUCK : CameraControlsImpl.ACTION.TOUCH_ROTATE,
        two: CameraControlsImpl.ACTION.TOUCH_ZOOM_TRUCK,
        three: CameraControlsImpl.ACTION.NONE,
      }}
    />
  );
};

/**
 * Hides any label the viewer's edge would cut (after zooming, panning, orbiting, or a close-up
 * that drops an entity), so every label on screen is whole. It fades `[data-viz-label]` and
 * `[data-viz-framed]` elements via inline opacity, so keep those elements' own opacity on a
 * wrapper, and tags hidden labels `data-viz-offframe` so verify-viz reports them.
 */
export const LabelFramer: React.FC = () => {
  const gl = useThree((s) => s.gl);
  const tick = useRef(0);
  useFrame(() => {
    if (tick.current++ % 3) return;
    // Html labels portal into the Canvas wrapper, a level above the <canvas>'s own parent.
    const host = gl.domElement.parentElement?.parentElement;
    if (!host) return;
    const f = gl.domElement.getBoundingClientRect();
    host.querySelectorAll<HTMLElement>('[data-viz-label], [data-viz-framed]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const inside =
        r.left >= f.left + 2 &&
        r.right <= f.right - 2 &&
        r.top >= f.top + 2 &&
        r.bottom <= f.bottom - 2;
      const want = inside ? '' : '0';
      el.toggleAttribute('data-viz-offframe', !inside);
      if (el.style.opacity !== want) el.style.opacity = want;
    });
  });
  return null;
};
