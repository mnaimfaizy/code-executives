import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { Box, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Scan, Square } from 'lucide-react';
import { ErrorBoundary } from '../../../../shared/components/feedback';
import { useReducedMotion } from '../../../../shared/hooks';
import StackHeap2D from '../visualizations/2d/StackHeap2D';
import { STORY_CODE, STORY_STEPS } from '../../utils/stackHeapStory';
import { canUseWebGL } from '../../../../shared/utils/webgl';

// three.js + R3F only download when the learner switches to 3D.
const StackHeap3D = lazy(() => import('../visualizations/3d/StackHeap3D'));

type View = '2d' | '3d';
type Speed = 'slow' | 'normal' | 'fast';

const SPEED_MS: Record<Speed, number> = { slow: 6000, normal: 4000, fast: 2500 };
const VIEW_KEY = 'code-executives.stack-heap-story.view';
const CODE_LINES = STORY_CODE.split('\n');

const readStoredView = (): View | null => {
  try {
    const v = window.localStorage.getItem(VIEW_KEY);
    return v === '2d' || v === '3d' ? v : null;
  } catch {
    return null;
  }
};

const StackHeapStory: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(canUseWebGL);
  const [chosenView, setChosenView] = useState<View | null>(readStoredView);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const [resetViewToken, setResetViewToken] = useState(0);

  const view: View = webgl && chosenView === '3d' ? '3d' : '2d';
  const step = STORY_STEPS[index];
  const last = STORY_STEPS.length - 1;

  const chooseView = (v: View) => {
    setChosenView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Storage unavailable (private mode): the choice just isn't remembered.
    }
  };

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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(-1);
    }
  };

  const view2D = <StackHeap2D step={step} />;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-xl sm:p-6"
      onKeyDown={onKeyDown}
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
            A 10-step story. Frames come and go; objects live as long as a root can reach them.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Visualization mode"
          className="flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm"
        >
          {(['2d', '3d'] as const).map((v) => {
            const disabled = v === '3d' && !webgl;
            return (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                disabled={disabled}
                title={
                  disabled ? '3D needs WebGL, which is unavailable in this browser' : undefined
                }
                onClick={() => chooseView(v)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'
                }`}
              >
                {v === '2d' ? <Square className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
                {v.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
        {/* Code + narration */}
        <div className="flex min-w-0 flex-col gap-3 lg:w-[38%]">
          <div className="overflow-x-auto rounded-xl border border-slate-700 bg-slate-900 py-3 shadow">
            <pre className="text-[12.5px] leading-6" aria-label="Story code">
              {CODE_LINES.map((text, i) => {
                const active = i + 1 === step.line;
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
              Step {index + 1} / {STORY_STEPS.length}
            </div>
            <h4 className="mb-2 text-base font-bold text-slate-900">{step.title}</h4>
            <p className="text-sm leading-relaxed text-slate-700">{step.caption}</p>
          </div>
        </div>

        {/* Viewer */}
        <div className="flex min-w-0 flex-col gap-2 lg:w-[62%]">
          <div
            data-viz-viewer
            className="relative h-[420px] overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg sm:h-[500px]"
          >
            {view === '3d' ? (
              <ErrorBoundary
                fallback={
                  <div className="relative h-full">
                    {view2D}
                    <div className="absolute left-3 top-3 rounded bg-rose-50 px-2 py-1 text-xs text-rose-700">
                      3D failed to start — showing 2D.
                    </div>
                  </div>
                }
              >
                <Suspense
                  fallback={
                    <div className="relative h-full">
                      {view2D}
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm font-medium text-slate-600 backdrop-blur-[1px]">
                        Loading 3D…
                      </div>
                    </div>
                  }
                >
                  <StackHeap3D
                    step={step}
                    resetViewToken={resetViewToken}
                    instant={reducedMotion}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              view2D
            )}
            {view === '3d' && (
              <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-slate-400">
                Drag to orbit
              </div>
            )}
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
            <ControlButton label="Previous step" onClick={() => go(-1)} disabled={index === 0}>
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
            <ControlButton label="Next step" onClick={() => go(1)} disabled={index === last}>
              <ChevronRight className="h-4 w-4" />
            </ControlButton>

            <div className="mx-1 flex gap-1" aria-hidden>
              {STORY_STEPS.map((s, i) => (
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
            {view === '3d' && (
              <ControlButton label="Reset view" onClick={() => setResetViewToken((t) => t + 1)}>
                <Scan className="h-4 w-4" />
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
