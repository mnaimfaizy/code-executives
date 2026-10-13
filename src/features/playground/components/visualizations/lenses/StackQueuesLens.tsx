import React, { lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useReducedMotion, useStoryViewer } from '../../../../../shared/hooks';
import { useViewChoice, type VizView } from '../../../../../shared/hooks/useViewChoice';
import EventLoopView2D from '../../../../../shared/components/viz/eventloop/EventLoopView2D';
import type { EventLoopView3DProps } from '../../../../../shared/components/viz/eventloop/types';
import ViewToggle from '../../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../../shared/components/viz/ViewerHints';
import { vizPalette } from '../../../../../shared/viz/palette';
import type { Step } from '../../../tracer';
import {
  APPROXIMATE_NOTE,
  MIN_2D_SCALE,
  MODEL_NOTE,
  describeQueueStep,
  prepareQueues,
  queueNotesFor,
} from './stackQueuesLensModel';

type View3D = React.ComponentType<EventLoopView3DProps>;

// three.js + R3F only download when the learner switches to 3D.
const EventLoopView3D: View3D = lazy(
  () => import('../../../../../shared/viz3d/eventloop/EventLoopView3D')
);

/**
 * The stack-and-queues lens: draws the call stack, the microtask queue, the task queue and the
 * timers of a trace's current step with the shared event loop views (ADR 0004).
 */
export interface StackQueuesLensProps {
  /** Every step of the trace, so that every region keeps its size for the whole run. */
  steps: readonly Step[];
  /** Index into `steps` of the step to draw. */
  index: number;
  /** False when the run could not record heap objects (Python, for now): it has no queues either. */
  heapRecorded?: boolean;
  /** True when the tracer's queue model could not follow the engine for this run. */
  approximate?: boolean;
  /** The 3D renderer. Default: the lens's own, loaded on demand. */
  view3D?: View3D;
  /** Called when the learner picks a view with the 2D / 3D toggle. */
  onViewChange?: (view: VizView) => void;
}

const VIEW_KEY = 'code-executives.playground.stack-queues.view';
const P = vizPalette.dark;

/**
 * The smallest 3D viewer in which five frames beside three full lanes keep their labels apart
 * and in frame (`MIN_VIEWER` in the view's layout): labels are DOM cards of a fixed size, so a
 * small viewer cannot simply zoom out. A pane smaller than this scrolls. The width is
 * `VIEWER_3D_MIN_WIDTH` (lensViewer.ts), written out because Tailwind cannot see a class name
 * built at runtime.
 */
const VIEWER_3D = 'min-h-[520px] min-w-[760px]';

/** A trace without queues draws the stack alone, at about the size it has beside the queues. */
const STACK_ONLY_WIDTH = 300;

const noStep = () => undefined;

/** Holds the 2D drawing at a legible scale: it fills the pane, and scrolls when the pane is small. */
const Legible2D: React.FC<{
  /** What the drawing is made from: its size is read again when this changes. */
  drawing: unknown;
  /** The stack alone is a narrow drawing: it is held to this width instead of filling the pane. */
  maxWidth?: number;
  children: React.ReactNode;
}> = ({ drawing, maxWidth, children }) => {
  const inner = useRef<HTMLDivElement>(null);
  const [min, setMin] = useState({ width: 0, height: 0 });

  // The drawing's own size is its viewBox, which the view decides from the snapshot.
  useLayoutEffect(() => {
    const box = inner.current?.querySelector('svg')?.getAttribute('viewBox')?.split(/\s+/);
    if (!box || box.length !== 4) return;
    const width = Math.round(Number(box[2]) * MIN_2D_SCALE);
    const height = Math.round(Number(box[3]) * MIN_2D_SCALE);
    if (!Number.isFinite(width) || !Number.isFinite(height)) return;
    setMin((m) => (m.width === width && m.height === height ? m : { width, height }));
  }, [drawing]);

  return (
    <div
      className="h-full w-full overflow-auto"
      tabIndex={0}
      role="group"
      aria-label="Stack and queues drawing. Scroll to see all of it."
    >
      <div
        ref={inner}
        className="mx-auto h-full w-full"
        style={{ minWidth: min.width, minHeight: min.height, maxWidth }}
      >
        {children}
      </div>
    </div>
  );
};

const Message: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="flex h-full w-full items-center justify-center p-6">
    <div className="max-w-md text-center">
      <p className="text-sm font-semibold text-[#e0e0ff]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#b8b8e0]">{children}</p>
    </div>
  </div>
);

const StackQueuesLens: React.FC<StackQueuesLensProps> = ({
  steps,
  index,
  heapRecorded,
  approximate = false,
  view3D: View3DComponent = EventLoopView3D,
  onViewChange,
}) => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const rootRef = useRef<HTMLDivElement>(null);
  const is3D = view === '3d' && steps.length > 0;
  const viewer = useStoryViewer({ rootRef, is3D, step: noStep });
  const fullscreen = viewer.fullscreen;

  // The whole trace is prepared once: every region gets one size for the run.
  const trace = useMemo(() => prepareQueues(steps), [steps]);

  if (steps.length === 0) {
    return (
      <div className="h-full w-full" data-testid="stack-queues-lens">
        <Message title="Nothing to draw yet">
          Run your code with Trace on to see its call stack and the event loop&apos;s queues here,
          one step at a time.
        </Message>
      </div>
    );
  }

  const at = Math.min(steps.length - 1, Math.max(0, Math.floor(index) || 0));
  const step = steps[at];
  const lens = trace.steps[at];
  const options = { heapRecorded };
  const notes = queueNotesFor(lens, trace, options);
  const label = `Stack and queues. ${describeQueueStep(step, lens, { index: at, total: steps.length }, trace, options)}`;

  const drawing = {
    snapshot: lens.snapshot,
    focus: step.focus,
    theme: 'dark' as const,
    extent: trace.extent,
    more: lens.counts.more,
    running: lens.running,
  };

  const view2D = (
    <Legible2D drawing={lens.snapshot} maxWidth={trace.recorded ? undefined : STACK_ONLY_WIDTH}>
      <EventLoopView2D {...drawing} label={label} />
    </Legible2D>
  );

  // Stepping belongs to the Playground's own controls: the arrow keys pass through untouched.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
    viewer.onKeyDown(e);
  };

  return (
    <div
      ref={rootRef}
      data-testid="stack-queues-lens"
      onKeyDown={onKeyDown}
      className={`flex h-full min-h-0 w-full flex-col gap-2 overflow-auto ${fullscreen.isFullscreen ? 'p-3' : ''}`}
      style={fullscreen.isFullscreen ? { background: P.surface } : undefined}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="min-h-4 text-xs text-[#b8b8e0]" data-testid="stack-queues-lens-notes">
          {notes.join(' · ')}
        </p>
        <div className="flex items-center gap-2">
          {!is3D && fullscreen.supported && (
            <button
              type="button"
              aria-label={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
              title={fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
              onClick={fullscreen.toggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b8b8e0] transition-colors hover:bg-[#1e1e42]"
            >
              {fullscreen.isFullscreen ? (
                <Minimize2 className="h-4 w-4" aria-hidden />
              ) : (
                <Maximize2 className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}
          <ViewToggle
            view={view}
            onChange={(next: VizView) => {
              chooseView(next);
              onViewChange?.(next);
            }}
            webgl={webgl}
            theme="dark"
          />
        </div>
      </div>

      <div
        data-viz-viewer
        data-view={is3D ? '3d' : '2d'}
        onWheel={viewer.onViewerWheel}
        className={`relative flex-1 overflow-hidden rounded-lg border border-[#2a2a4e] ${
          is3D ? VIEWER_3D : 'min-h-[320px]'
        }`}
        style={{ background: P.surface }}
      >
        {is3D ? (
          <View3DBoundary view2D={view2D} theme="dark">
            <View3DComponent
              {...drawing}
              label={`3D view. ${label}`}
              camera={viewer.camera}
              instant={reducedMotion}
            />
          </View3DBoundary>
        ) : (
          view2D
        )}
        {is3D && <Viewer3DHint theme="dark" />}
        {is3D && <WheelZoomHint visible={viewer.wheelHint} />}
        <Viewer3DToolbar
          is3D={is3D}
          theme="dark"
          preset={viewer.camera.preset}
          hold={viewer.camera.hold}
          pan={viewer.camera.pan}
          command={viewer.command}
          setPreset={viewer.setPreset}
          toggleHold={viewer.toggleHold}
          togglePan={viewer.togglePan}
          reset={viewer.reset}
          fullscreen={fullscreen}
        />
      </div>

      {trace.recorded && (
        <p
          className={`shrink-0 text-[11px] leading-snug ${approximate ? 'text-[#e0e0ff]' : 'text-[#a3a3cf]'}`}
          data-testid="stack-queues-lens-model"
        >
          {approximate ? APPROXIMATE_NOTE : MODEL_NOTE}
        </p>
      )}
    </div>
  );
};

export default StackQueuesLens;
