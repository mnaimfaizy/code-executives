import React, { lazy, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useReducedMotion, useStoryViewer } from '../../../../shared/hooks';
import { useViewChoice } from '../../../../shared/hooks/useViewChoice';
import ViewToggle from '../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../shared/components/viz/ViewerHints';
import StackHeap2D from '../visualizations/2d/StackHeap2D';
import { STORY_CODE, STORY_BEATS } from '../../utils/stackHeapStory';

// three.js + R3F only download when the learner switches to 3D.
const StackHeap3D = lazy(() => import('../visualizations/3d/StackHeap3D'));

type Speed = 'slow' | 'normal' | 'fast';

const SPEED_MS: Record<Speed, number> = { slow: 6000, normal: 4000, fast: 2500 };
const VIEW_KEY = 'code-executives.stack-heap-story.view';
const CODE_LINES = STORY_CODE.split('\n');

const StackHeapStory: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const rootRef = useRef<HTMLDivElement>(null);

  const beat = STORY_BEATS[index];
  const last = STORY_BEATS.length - 1;

  const go = useCallback(
    (delta: number) => setIndex((i) => Math.min(last, Math.max(0, i + delta))),
    [last]
  );

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(1), SPEED_MS[speed]);
    return () => window.clearTimeout(t);
  }, [playing, index, last, speed, go]);

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
          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 py-3 shadow">
            <pre className="text-[12.5px] leading-6" aria-label="Story code">
              {CODE_LINES.map((text, i) => {
                const active = i + 1 === beat.line;
                return (
                  <div
                    key={i}
                    className={`flex pr-4 ${active ? 'bg-amber-400/20' : ''}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span
                      className={`w-9 shrink-0 select-none border-l-2 pr-3 text-right ${
                        active
                          ? 'border-amber-400 text-amber-300'
                          : 'border-transparent text-slate-500'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <code className={active ? 'text-amber-100' : 'text-slate-300'}>
                      {text || ' '}
                    </code>
                  </div>
                );
              })}
            </pre>
          </div>

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

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <ControlButton
              label="Restart"
              onClick={() => {
                setPlaying(false);
                setIndex(0);
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </ControlButton>
            <ControlButton label="Previous beat" onClick={() => go(-1)} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" />
            </ControlButton>
            <ControlButton
              label={playing ? 'Pause' : 'Play'}
              onClick={() => {
                if (!playing && index === last) setIndex(0);
                setPlaying((p) => !p);
              }}
              primary
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </ControlButton>
            <ControlButton label="Next beat" onClick={() => go(1)} disabled={index === last}>
              <ChevronRight className="h-4 w-4" />
            </ControlButton>

            <div className="mx-1 flex gap-1" aria-hidden>
              {STORY_BEATS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  tabIndex={-1}
                  title={s.title}
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors sm:w-4 ${
                    i === index ? 'bg-indigo-600' : i < index ? 'bg-indigo-300' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            <label className="ml-auto flex items-center gap-1.5 text-xs text-slate-600">
              Speed
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as Speed)}
                className="rounded border border-slate-300 bg-white px-1.5 py-1 text-xs"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </label>
            {view === '2d' && viewer.fullscreen.supported && (
              <ControlButton
                label={viewer.fullscreen.isFullscreen ? 'Exit full screen' : 'Full screen'}
                onClick={viewer.fullscreen.toggle}
              >
                {viewer.fullscreen.isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </ControlButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ControlButton: React.FC<{
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ label, onClick, disabled, primary, children }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      primary ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'text-slate-700 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

export default StackHeapStory;
