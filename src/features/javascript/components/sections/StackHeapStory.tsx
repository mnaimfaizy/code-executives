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
import StackHeap2D from '../visualizations/2d/StackHeap2D';
import { STORY_CODE, STORY_BEATS } from '../../utils/stackHeapStory';

// three.js + R3F only download when the learner switches to 3D.
const StackHeap3D = lazy(() => import('../visualizations/3d/StackHeap3D'));

const VIEW_KEY = 'code-executives.stack-heap-story.view';
const CODE_LINES = STORY_CODE.split('\n');

const StackHeapStory: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const playback = useStoryPlayback(STORY_BEATS.length);
  const { index, go } = playback;
  const rootRef = useRef<HTMLDivElement>(null);

  const beat = STORY_BEATS[index];

  const viewer = useStoryViewer({ rootRef, is3D: view === '3d', step: go });
  const fullscreen = viewer.fullscreen.isFullscreen;

  const view2D = <StackHeap2D beat={beat} />;

  return (
    <div
      ref={rootRef}
      className={`relative w-full border bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-xl sm:p-6 ${
        fullscreen ? 'h-full overflow-y-auto bg-white' : 'overflow-hidden rounded-2xl'
      }`}
      onKeyDown={viewer.onKeyDown}
      tabIndex={0}
      aria-label="Stack and heap story. Use the left and right arrow keys to step."
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="bg-gradient-to-tr from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Stack ↔ Heap: who keeps an object alive?
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            A 10-beat story. Frames come and go; objects live as long as a root can reach them.
          </p>
        </div>

        <ViewToggle view={view} onChange={chooseView} webgl={webgl} />
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
        {/* Code + narration */}
        <div className="flex min-w-0 flex-col gap-3 lg:w-[38%]">
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
        <div className="flex min-w-0 flex-col gap-2 lg:w-[62%]">
          <div
            data-viz-viewer
            onWheel={viewer.onViewerWheel}
            className={`relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg ${
              fullscreen ? 'h-[75vh]' : 'h-[420px] sm:h-[500px]'
            }`}
          >
            {view === '3d' ? (
              <View3DBoundary view2D={view2D}>
                <StackHeap3D beat={beat} camera={viewer.camera} instant={reducedMotion} />
              </View3DBoundary>
            ) : (
              view2D
            )}
            {view === '3d' && <Viewer3DHint />}
            {view === '3d' && <WheelZoomHint visible={viewer.wheelHint} />}
            <Viewer3DToolbar
              is3D={view === '3d'}
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
            fullscreen={view === '2d' ? viewer.fullscreen : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default StackHeapStory;
