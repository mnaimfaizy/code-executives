import React, { lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useReducedMotion, useStoryViewer } from '../../../../../shared/hooks';
import { useViewChoice } from '../../../../../shared/hooks/useViewChoice';
import StackHeapView2D from '../../../../../shared/components/viz/stackheap/StackHeapView2D';
import ViewToggle from '../../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../../shared/components/viz/ViewerHints';
import { vizPalette } from '../../../../../shared/viz/palette';
import type { Step } from '../../../tracer';
import {
  MIN_2D_SCALE,
  describeStep,
  notesFor,
  prepareTrace,
  tooLargeMessage,
} from './stackHeapLensModel';

// three.js + R3F only download when the learner switches to 3D.
const StackHeapView3D = lazy(() => import('../../../../../shared/viz3d/stackheap/StackHeapView3D'));

/**
 * The stack-and-heap lens: draws the stack and heap regions of a trace's current step
 * with the shared 2D and 3D views (ADR 0004).
 */
export interface StackHeapLensProps {
  /** Every step of the trace, so that entities keep their cells for the whole run. */
  steps: readonly Step[];
  /** Index into `steps` of the step to draw. */
  index: number;
  /** False when the run could not record heap objects (Python, for now). */
  heapRecorded?: boolean;
}

const VIEW_KEY = 'code-executives.playground.stack-heap.view';
const P = vizPalette.dark;

/**
 * The smallest 3D viewer in which a full floor beside five frames keeps its labels apart and in
 * frame: labels are DOM cards of a fixed size, so a small viewer cannot simply zoom out. A pane
 * smaller than this scrolls.
 */
const VIEWER_3D = 'min-h-[520px] min-w-[760px]';

const noStep = () => undefined;

/** Holds the 2D drawing at a legible scale: it fills the pane, and scrolls when the pane is small. */
const Legible2D: React.FC<{
  /** What the drawing is made from: its size is read again when this changes. */
  drawing: unknown;
  /** The run being drawn: a new one starts scrolled to the foot of the stack. */
  run: unknown;
  children: React.ReactNode;
}> = ({ drawing, run, children }) => {
  const outer = useRef<HTMLDivElement>(null);
  const shownRun = useRef<unknown>(null);
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

  // The stack stands on the bottom edge of the drawing. In a pane too small for the whole
  // drawing a run opens there, once, and the learner's own scrolling is left alone after that.
  useLayoutEffect(() => {
    const el = outer.current;
    if (!el || min.height === 0 || shownRun.current === run) return;
    shownRun.current = run;
    el.scrollTop = el.scrollHeight;
  }, [run, min.height]);

  return (
    <div
      ref={outer}
      className="h-full w-full overflow-auto"
      tabIndex={0}
      role="group"
      aria-label="Stack and heap drawing. Scroll to see all of it."
    >
      <div
        ref={inner}
        className="h-full w-full"
        style={{ minWidth: min.width, minHeight: min.height }}
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

const StackHeapLens: React.FC<StackHeapLensProps> = ({ steps, index, heapRecorded }) => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewer = useStoryViewer({ rootRef, is3D: view === '3d', step: noStep });
  const fullscreen = viewer.fullscreen;

  // The whole trace is prepared once: every drawn object gets one cell, and the floor one size.
  const trace = useMemo(() => prepareTrace(steps, { heapRecorded }), [steps, heapRecorded]);

  if (steps.length === 0) {
    return (
      <div className="h-full w-full" data-testid="stack-heap-lens">
        <Message title="Nothing to draw yet">
          Run your code with Trace on to see its call stack and heap here, one step at a time.
        </Message>
      </div>
    );
  }

  const at = Math.min(steps.length - 1, Math.max(0, Math.floor(index) || 0));
  const step = steps[at];
  const lens = trace.steps[at];
  const notes = notesFor(lens, { heapRecorded });
  const label = `Stack and heap. ${describeStep(step, lens, { index: at, total: steps.length }, { heapRecorded })}`;
  const drawn = lens.status === 'drawn';
  const is3D = view === '3d' && drawn;

  const view2D = drawn ? (
    <Legible2D drawing={lens.snapshot} run={steps}>
      <StackHeapView2D
        snapshot={lens.snapshot}
        focus={step.focus}
        theme="dark"
        markUnreachable
        grid={trace.grid}
        label={label}
      />
    </Legible2D>
  ) : null;

  // Stepping belongs to the Playground's own controls: the arrow keys pass through untouched.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) return;
    viewer.onKeyDown(e);
  };

  return (
    <div
      ref={rootRef}
      data-testid="stack-heap-lens"
      onKeyDown={onKeyDown}
      className={`flex h-full min-h-0 w-full flex-col gap-2 overflow-auto ${fullscreen.isFullscreen ? 'p-3' : ''}`}
      style={fullscreen.isFullscreen ? { background: P.surface } : undefined}
    >
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <p className="min-h-4 text-xs text-[#b8b8e0]" data-testid="stack-heap-lens-notes">
          {notes.join(' · ')}
        </p>
        <div className="flex items-center gap-2">
          {view === '2d' && fullscreen.supported && (
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
          <ViewToggle view={view} onChange={chooseView} webgl={webgl} theme="dark" />
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
        {!drawn ? (
          <Message title="Too large to draw">
            {tooLargeMessage(lens)} Step back to a smaller moment, or run a smaller input; the
            Console and the highlighted line still follow every step.
          </Message>
        ) : is3D ? (
          <View3DBoundary view2D={view2D} theme="dark">
            <StackHeapView3D
              snapshot={lens.snapshot}
              focus={step.focus}
              theme="dark"
              markUnreachable
              grid={trace.grid}
              shot="overview"
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
    </div>
  );
};

export default StackHeapLens;
