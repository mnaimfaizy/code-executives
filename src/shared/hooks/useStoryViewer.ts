import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type WheelEvent,
} from 'react';
import type {
  CameraCommandInput,
  CameraState,
  OrbitDir,
  ViewPreset,
} from '../components/viz/viewerCamera';
import { useFullscreen, type Fullscreen } from './useFullscreen';

export interface StoryViewerOptions {
  /** The section root: full screen covers it, so the caption and controls stay visible. */
  rootRef: RefObject<HTMLElement | null>;
  /** True while the 3D view is showing: camera keys and the wheel hint apply only then. */
  is3D: boolean;
  /** Steps the story by `delta` (the arrow keys). */
  step: (delta: number) => void;
}

export interface StoryViewer {
  camera: CameraState;
  setPreset: (preset: ViewPreset) => void;
  toggleHold: () => void;
  togglePan: () => void;
  command: (c: CameraCommandInput) => void;
  /** Isometric preset, Hold view off, and the step's shot re-framed. */
  reset: () => void;
  fullscreen: Fullscreen;
  onKeyDown: (e: KeyboardEvent) => void;
  /** Attach to the viewer: a plain wheel over the 3D canvas shows the zoom hint. */
  onViewerWheel: (e: WheelEvent) => void;
  /** True for ~1.5 s after a plain wheel over the 3D viewer outside full screen. */
  wheelHint: boolean;
}

const WHEEL_HINT_MS = 1500;

const ORBIT_KEYS: Record<string, OrbitDir> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down',
};

const isFormControl = (el: EventTarget | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName));

/**
 * The viewer state every story section shares: camera preset, Hold view, pan mode, one-shot
 * camera commands, full screen, and the story's keyboard shortcuts.
 */
export function useStoryViewer({ rootRef, is3D, step }: StoryViewerOptions): StoryViewer {
  const [preset, setPreset] = useState<ViewPreset>('iso');
  const [hold, setHold] = useState(false);
  const [pan, setPan] = useState(false);
  const [cmd, setCmd] = useState<CameraState['command']>(null);
  const [wheelHint, setWheelHint] = useState(false);
  const token = useRef(0);
  const hintTimer = useRef<number | undefined>(undefined);
  const fullscreen = useFullscreen(rootRef);

  const command = useCallback((c: CameraCommandInput) => {
    token.current += 1;
    setCmd({ ...c, token: token.current });
  }, []);
  const toggleHold = useCallback(() => setHold((h) => !h), []);
  const togglePan = useCallback(() => setPan((p) => !p), []);
  const reset = useCallback(() => {
    setPreset('iso');
    setHold(false);
    command({ kind: 'reset' });
  }, [command]);

  useEffect(() => () => window.clearTimeout(hintTimer.current), []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey || isFormControl(e.target)) return;
    const orbit = ORBIT_KEYS[e.key];
    if (is3D && e.shiftKey && orbit) {
      e.preventDefault();
      command({ kind: 'orbit', dir: orbit });
      return;
    }
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        step(1);
        return;
      case 'ArrowLeft':
        e.preventDefault();
        step(-1);
        return;
      case 'f':
      case 'F':
        if (!fullscreen.supported) return;
        e.preventDefault();
        fullscreen.toggle();
        return;
    }
    if (!is3D) return;
    switch (e.key) {
      case '+':
      case '=':
        e.preventDefault();
        command({ kind: 'zoomIn' });
        break;
      case '-':
      case '_':
        e.preventDefault();
        command({ kind: 'zoomOut' });
        break;
      case '0':
        e.preventDefault();
        reset();
        break;
      case 'h':
      case 'H':
        e.preventDefault();
        toggleHold();
        break;
    }
  };

  const onViewerWheel = (e: WheelEvent) => {
    if (!is3D || e.ctrlKey || e.metaKey || fullscreen.isFullscreen) return;
    setWheelHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setWheelHint(false), WHEEL_HINT_MS);
  };

  return {
    camera: { preset, hold, pan, command: cmd },
    setPreset,
    toggleHold,
    togglePan,
    command,
    reset,
    fullscreen,
    onKeyDown,
    onViewerWheel,
    wheelHint,
  };
}

export default useStoryViewer;
