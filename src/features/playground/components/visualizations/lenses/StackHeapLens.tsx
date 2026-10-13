import React, { lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useReducedMotion, useStoryViewer } from '../../../../../shared/hooks';
import { useViewChoice, type VizView } from '../../../../../shared/hooks/useViewChoice';
import StackHeapView2D from '../../../../../shared/components/viz/stackheap/StackHeapView2D';
import ViewToggle from '../../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../../shared/components/viz/ViewerHints';
import { vizPalette } from '../../../../../shared/viz/palette';
import type { Step } from '../../../tracer';
import {
  MIN_2D_SCALE,
  SHOWN_IN_2D_NOTE,
  describeStep,
  notesFor,
  prepareTrace,
  tooLargeMessage,
  viewForStep,
  type LensStep,
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
  /** Called when the learner picks a view with the 2D / 3D toggle. */
  onViewChange?: (view: VizView) => void;
}

const VIEW_KEY = 'code-executives.playground.stack-heap.view';
const P = vizPalette.dark;

/**
 * The smallest 3D viewer in which a full floor beside five frames keeps its labels apart and in
 * frame: labels are DOM cards of a fixed size, so a small viewer cannot simply zoom out. A pane
 * smaller than this scrolls. The width is `VIEWER_3D_MIN_WIDTH` (lensViewer.ts), written out
 * because Tailwind cannot see a class name built at runtime.
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

const StackHeapLens: React.FC<StackHeapLensProps> = ({
  steps,
  index,
  heapRecorded,
  onViewChange,
}) => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const rootRef = useRef<HTMLDivElement>(null);

  // The whole trace is prepared once: every drawn object gets one cell, and the floor one size.
  // Each view has its own largest floor, so the 3D view gets a preparation of its own.
  const trace2D = useMemo(
    () => prepareTrace(steps, { heapRecorded, view: '2d' }),
    [steps, heapRecorded]
  );
  const trace3D = useMemo(
    () => (view === '3d' ? prepareTrace(steps, { heapRecorded, view: '3d' }) : null),
    [steps, heapRecorded, view]
  );

  const at = Math.min(steps.length - 1, Math.max(0, Math.floor(index) || 0));
  // A step that fits the 2D floor but not the 3D one is drawn in 2D. The choice stays 3D, so
  // the next step that fits is back in 3D.
  const shown =
    steps.length > 0
      ? viewForStep(view, trace2D.steps[at], trace3D?.steps[at])
      : { view: '2d' as const, fellBack: false };
  const lens3D: LensStep | undefined = shown.view === '3d' ? trace3D?.steps[at] : undefined;
  const scene3D = lens3D?.status === 'drawn' && trace3D ? { lens: lens3D, trace: trace3D } : null;
  const is3D = scene3D !== null;

  const viewer = useStoryViewer({ rootRef, is3D, step: noStep });
  const fullscreen = viewer.fullscreen;

  if (steps.length === 0) {
    return (
      <div className="h-full w-full" data-testid="stack-heap-lens">
        <Message title="Nothing to draw yet">
          Run your code with Trace on to see its call stack and heap here, one step at a time.
        </Message>
      </div>
    );
  }

  const step = steps[at];
  const lens2D = trace2D.steps[at];
  const lens = scene3D?.lens ?? lens2D;
  const notes = notesFor(lens, { heapRecorded });
  if (shown.fellBack) notes.push(SHOWN_IN_2D_NOTE);
  const describe = (of: LensStep): string =>
    `Stack and heap. ${describeStep(step, of, { index: at, total: steps.length }, { heapRecorded })}`;
  const label = describe(lens);
  const drawn = lens.status === 'drawn';

  // Also what the 3D view falls back to when it cannot start
  const view2D =
    lens2D.status === 'drawn' ? (
      <Legible2D drawing={lens2D.snapshot} run={steps}>
        <StackHeapView2D
          snapshot={lens2D.snapshot}
          focus={step.focus}
          theme="dark"
          markUnreachable
          grid={trace2D.grid}
          label={describe(lens2D)}
        />
      </Legible2D>
    ) : null;

  const onChooseView = (next: VizView): void => {
    chooseView(next);
    onViewChange?.(next);
  };

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
          <ViewToggle view={view} onChange={onChooseView} webgl={webgl} theme="dark" />
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
        ) : scene3D ? (
          <View3DBoundary view2D={view2D} theme="dark">
            <StackHeapView3D
              snapshot={scene3D.lens.snapshot}
              focus={step.focus}
              theme="dark"
              markUnreachable
              grid={scene3D.trace.grid}
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
