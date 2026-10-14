import React, { lazy, useRef } from 'react';
import { useReducedMotion, useStoryViewer } from '../../../../shared/hooks';
import { useViewChoice } from '../../../../shared/hooks/useViewChoice';
import ViewToggle from '../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../shared/components/viz/ViewerHints';
import StoryCodePanel from '../../../../shared/components/viz/StoryCodePanel';
import StoryControls from '../../../../shared/components/viz/StoryControls';
import { useStoryPlayback } from '../../../../shared/components/viz/useStoryPlayback';
import StackHeapView2D from '../../../../shared/components/viz/stackheap/StackHeapView2D';
import { STORY_CODE, STORY_BEATS } from '../../utils/generationalCollectionStory';

// The shared stack-and-heap 3D view draws this beat model. three.js + R3F only download when
// the learner switches to 3D.
const StackHeapView3D = lazy(() => import('../../../../shared/viz3d/stackheap/StackHeapView3D'));

const VIEW_KEY = 'code-executives.generational-collection-story.view';
const CODE_LINES = STORY_CODE.split('\n');

/**
 * Where this story puts its code: always above the picture. Its heap is three spaces of three
 * columns, a drawing 1014 units wide, so beside the code its labels would fall under 10px; the
 * picture keeps the section's full width instead. Written out whole for Tailwind.
 */
const GENERATIONAL_LAYOUT = {
  row: 'flex min-w-0 flex-col gap-3',
  aside: 'grid min-w-0 gap-3 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
  viewer: 'flex min-w-0 flex-col gap-2',
} as const;

/** The Generational Collection story: one beat model, drawn by the shared stack-and-heap views. */
const GenerationalCollectionStory: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const playback = useStoryPlayback(STORY_BEATS.length);
  const { index, go } = playback;
  const rootRef = useRef<HTMLDivElement>(null);

  const beat = STORY_BEATS[index];
  const is3D = view === '3d';

  const viewer = useStoryViewer({ rootRef, is3D, step: go });
  const fullscreen = viewer.fullscreen.isFullscreen;

  const view2D = (
    <StackHeapView2D
      snapshot={beat}
      focus={beat.focus}
      gcPhase={beat.gcPhase}
      label={`Stack and heap: ${beat.title}`}
    />
  );

  return (
    <div
      ref={rootRef}
      className={`relative w-full border bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-xl sm:p-6 ${
        fullscreen ? 'h-full overflow-y-auto bg-white' : 'overflow-hidden rounded-2xl'
      }`}
      onKeyDown={viewer.onKeyDown}
      tabIndex={0}
      aria-label="Generational collection story. Use the left and right arrow keys to step."
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="bg-gradient-to-tr from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Generational Collection: why is collecting new objects cheap?
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            A {STORY_BEATS.length}-beat story. Most objects die young; a minor collection copies the
            few that survive and frees the rest of their space at once.
          </p>
        </div>

        <ViewToggle view={view} onChange={chooseView} webgl={webgl} />
      </div>

      {/* The code is above the picture at every width: see GENERATIONAL_LAYOUT. */}
      <div className={GENERATIONAL_LAYOUT.row}>
        {/* Code + narration */}
        <div className={GENERATIONAL_LAYOUT.aside}>
          <StoryCodePanel lines={CODE_LINES} activeLine={beat.line} />

          <div
            className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            aria-live="polite"
          >
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
              Beat {index + 1} / {STORY_BEATS.length}
            </div>
            <h4 className="mb-2 text-base font-bold text-slate-900">{beat.title}</h4>
            <p className="text-sm leading-relaxed text-slate-700">{beat.caption}</p>
          </div>
        </div>

        {/* Viewer */}
        <div className={GENERATIONAL_LAYOUT.viewer}>
          <div
            data-viz-viewer
            data-view={view}
            onWheel={viewer.onViewerWheel}
            // 2D: no fixed height, so the drawing is as large as the width allows.
            className={`relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg ${
              fullscreen ? 'h-[75vh]' : is3D ? 'h-[420px] sm:h-[500px]' : ''
            }`}
          >
            {is3D ? (
              <View3DBoundary view2D={view2D}>
                <StackHeapView3D
                  snapshot={beat}
                  focus={beat.focus}
                  gcPhase={beat.gcPhase}
                  shot={beat.shot}
                  label={`3D view of the stack and heap: ${beat.title}`}
                  camera={viewer.camera}
                  instant={reducedMotion}
                />
              </View3DBoundary>
            ) : (
              view2D
            )}
            {is3D && <Viewer3DHint />}
            {is3D && <WheelZoomHint visible={viewer.wheelHint} />}
            <Viewer3DToolbar
              is3D={is3D}
              preset={viewer.camera.preset}
              hold={viewer.camera.hold}
              pan={viewer.camera.pan}
              command={viewer.command}
              setPreset={viewer.setPreset}
              toggleHold={viewer.toggleHold}
              togglePan={viewer.togglePan}
              reset={viewer.reset}
              fullscreen={viewer.fullscreen}
            />
          </div>

          <StoryControls
            beats={STORY_BEATS}
            playback={playback}
            fullscreen={is3D ? undefined : viewer.fullscreen}
          />
        </div>
      </div>
    </div>
  );
};

export default GenerationalCollectionStory;
