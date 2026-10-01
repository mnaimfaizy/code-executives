import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Square,
  Undo2,
} from 'lucide-react';
import { ErrorBoundary } from '../../../../shared/components/feedback';
import { useReducedMotion, useStoryViewer } from '../../../../shared/hooks';
import Viewer3DToolbar from '../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../shared/components/viz/ViewerHints';
import ShipAFeature2D from '../visualizations/2d/ShipAFeature2D';
import {
  SCENARIO,
  getTranscript,
  routeFor,
  type CastId,
  type ScenarioBeat,
} from '../../utils/shipAFeatureScenario';
import { canUseWebGL } from '../../../../shared/utils/webgl';

// three.js + R3F only download when the learner switches to 3D.
const ShipAFeature3D = lazy(() => import('../visualizations/3d/ShipAFeature3D'));

type View = '2d' | '3d';
type Speed = 'slow' | 'normal' | 'fast';

const SPEED_MS: Record<Speed, number> = { slow: 7000, normal: 5000, fast: 3000 };
const VIEW_KEY = 'code-executives.ship-a-feature-scenario.view';

const readStoredView = (): View | null => {
  try {
    const v = window.localStorage.getItem(VIEW_KEY);
    return v === '2d' || v === '3d' ? v : null;
  } catch {
    return null;
  }
};

const CAST_STYLE: Record<CastId, { on: string; off: string }> = {
  you: {
    on: 'border-orange-500 bg-orange-500 text-white',
    off: 'border-orange-200 bg-orange-50 text-orange-700',
  },
  sam: {
    on: 'border-pink-500 bg-pink-500 text-white',
    off: 'border-pink-200 bg-pink-50 text-pink-700',
  },
  origin: {
    on: 'border-slate-600 bg-slate-600 text-white',
    off: 'border-slate-300 bg-slate-50 text-slate-700',
  },
  ci: {
    on: 'border-emerald-600 bg-emerald-600 text-white',
    off: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
};

const castName = (id: CastId) => SCENARIO.cast.find((m) => m.id === id)?.name ?? id;

/** Number of choice points the learner has passed before reaching `route[index]`. */
const choicesBefore = (route: ScenarioBeat[], index: number) =>
  route.slice(0, index).filter((b) => b.choice).length;

const ShipAFeatureScenario: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const [webgl] = useState(canUseWebGL);
  const [chosenView, setChosenView] = useState<View | null>(readStoredView);
  const [picks, setPicks] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('normal');
  const rootRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLOListElement>(null);

  const view: View = webgl && chosenView === '3d' ? '3d' : '2d';
  const route = useMemo(() => routeFor(picks), [picks]);
  const beat = route[index];
  const last = route.length - 1;
  const atChoice = index === last && !!beat.choice;
  const atEnding = index === last && !beat.choice;

  const chooseView = (v: View) => {
    setChosenView(v);
    try {
      window.localStorage.setItem(VIEW_KEY, v);
    } catch {
      // Storage unavailable (private mode): the choice just isn't remembered.
    }
  };

  /** Jump along the route; landing on or before a choice beat clears the picks from there on. */
  const goTo = useCallback(
    (target: number) => {
      const next = Math.min(last, Math.max(0, target));
      setIndex(next);
      setPicks((p) => {
        const keep = choicesBefore(route, next);
        return p.length > keep ? p.slice(0, keep) : p;
      });
    },
    [last, route]
  );

  const go = useCallback((delta: number) => goTo(index + delta), [goTo, index]);

  const choose = (optionId: string) => {
    setPlaying(false);
    setPicks((p) => [...p.slice(0, choicesBefore(route, index)), optionId]);
    setIndex(index + 1);
  };

  const restart = () => {
    setPlaying(false);
    setPicks([]);
    setIndex(0);
  };

  const tryOtherPath = () => {
    setPlaying(false);
    for (let i = index - 1; i >= 0; i--) {
      if (route[i].choice) {
        goTo(i);
        return;
      }
    }
  };

  useEffect(() => {
    if (!playing) return;
    if (index >= last) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => go(1), SPEED_MS[speed]);
    return () => window.clearTimeout(t);
  }, [playing, index, last, speed, go]);

  // Keep the current transcript entry in view, inside the panel only.
  useEffect(() => {
    const list = transcriptRef.current;
    const current = list?.querySelector<HTMLElement>('[data-current]');
    if (list && current)
      list.scrollTop = current.offsetTop + current.offsetHeight - list.clientHeight + 8;
  }, [index, picks]);

  const viewer = useStoryViewer({ rootRef, is3D: view === '3d', step: go });
  const fullscreen = viewer.fullscreen.isFullscreen;
  const transcript = getTranscript(route, index);
  const view2D = <ShipAFeature2D beat={beat} />;

  return (
    <div
      ref={rootRef}
      className={`relative w-full border border-orange-200 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 shadow-xl sm:p-6 ${
        fullscreen ? 'h-full overflow-y-auto bg-white' : 'overflow-hidden rounded-2xl'
      }`}
      onKeyDown={viewer.onKeyDown}
      tabIndex={0}
      aria-label={`${SCENARIO.title} scenario. Use the left and right arrow keys to step.`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="bg-gradient-to-tr from-orange-500 to-red-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            {SCENARIO.title}
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            A scenario with one choice point. Each cast member is drawn as their own copy of the
            repository.
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
                    ? 'bg-orange-600 text-white'
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

      <div className="flex min-w-0 flex-col gap-3">
        {/* Narration + transcript, under the viewer */}
        <div className="order-2 grid min-w-0 items-start gap-3 lg:grid-cols-2">
          <ol
            ref={transcriptRef}
            aria-label="Transcript"
            className="relative max-h-72 overflow-y-auto lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:max-h-96 rounded-xl border border-slate-700 bg-slate-900 p-3 font-mono text-[12px] leading-5 shadow"
          >
            {transcript.map((entry, i) => {
              const current = i === transcript.length - 1;
              return (
                <li
                  key={entry.beat}
                  data-current={current ? '' : undefined}
                  aria-current={current ? 'step' : undefined}
                  className={`mb-2 rounded border-l-2 px-2 py-1 last:mb-0 ${
                    current ? 'border-amber-400 bg-amber-400/15' : 'border-transparent'
                  }`}
                >
                  <div className="text-[11px] text-slate-400">
                    {entry.time} · {castName(entry.actor)}
                  </div>
                  {entry.command ? (
                    <div className={current ? 'text-amber-100' : 'text-slate-200'}>
                      <span className="select-none text-emerald-400">$ </span>
                      {entry.command}
                    </div>
                  ) : (
                    <div className={`italic ${current ? 'text-amber-100' : 'text-slate-300'}`}>
                      {entry.action}
                    </div>
                  )}
                  {entry.output && (
                    <pre className="whitespace-pre-wrap break-words text-slate-400">
                      {entry.output}
                    </pre>
                  )}
                </li>
              );
            })}
          </ol>

          <div
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:col-start-1"
            aria-live="polite"
          >
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
              Beat {index + 1}
            </div>
            <h4 className="mb-2 text-base font-bold text-slate-900">{beat.title}</h4>
            <p className="text-sm leading-relaxed text-slate-700">{beat.caption}</p>
          </div>

          {atChoice && beat.choice && (
            <div
              className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4 shadow-sm lg:col-start-1"
              role="group"
              aria-label="Choice point"
            >
              <p className="mb-3 text-sm font-bold text-slate-900">{beat.choice.question}</p>
              <div className="flex flex-col gap-2">
                {beat.choice.options.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    data-viz-choice={o.id}
                    onClick={() => choose(o.id)}
                    className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-left text-sm font-semibold text-slate-800 transition-colors hover:border-amber-500 hover:bg-amber-100"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {atEnding && beat.outcome && (
            <div
              className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4 shadow-sm lg:col-start-1"
              role="group"
              aria-label="Outcome"
            >
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Outcome
              </div>
              <p className="mb-3 text-sm leading-relaxed text-slate-800">{beat.outcome}</p>
              <button
                type="button"
                onClick={tryOtherPath}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Undo2 className="h-4 w-4" />
                Try the other path
              </button>
            </div>
          )}
        </div>

        {/* Cast strip + viewer */}
        <div className="order-1 flex min-w-0 flex-col gap-2">
          <div
            className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm"
            aria-label="Cast"
          >
            {SCENARIO.cast.map((m) => {
              const acting = m.id === beat.actor;
              return (
                <span
                  key={m.id}
                  data-cast={m.id}
                  aria-current={acting ? 'true' : undefined}
                  title={m.copy}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                    acting ? CAST_STYLE[m.id].on : CAST_STYLE[m.id].off
                  }`}
                >
                  {m.name}
                  <span className="ml-1 font-normal opacity-80">{m.role}</span>
                </span>
              );
            })}
            <span className="ml-auto font-mono text-xs font-semibold text-slate-700">
              {beat.time}
            </span>
          </div>

          <div
            data-viz-viewer
            onWheel={viewer.onViewerWheel}
            className={`relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg ${
              fullscreen ? 'h-[75vh]' : 'mx-auto aspect-[660/496] w-full max-w-[880px]'
            }`}
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
                  <ShipAFeature3D beat={beat} camera={viewer.camera} instant={reducedMotion} />
                </Suspense>
              </ErrorBoundary>
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
            <ControlButton label="Restart" onClick={restart}>
              <RotateCcw className="h-4 w-4" />
            </ControlButton>
            <ControlButton label="Previous step" onClick={() => go(-1)} disabled={index === 0}>
              <ChevronLeft className="h-4 w-4" />
            </ControlButton>
            <ControlButton
              label={playing ? 'Pause' : 'Play'}
              onClick={() => {
                if (!playing && atEnding) restart();
                setPlaying((p) => !p);
              }}
              disabled={!playing && atChoice}
              primary
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </ControlButton>
            <ControlButton label="Next step" onClick={() => go(1)} disabled={index === last}>
              <ChevronRight className="h-4 w-4" />
            </ControlButton>

            <div className="mx-1 flex flex-wrap gap-1" aria-hidden data-testid="route-strip">
              {route.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  tabIndex={-1}
                  title={b.title}
                  onClick={() => goTo(i)}
                  className={`h-2 w-2 rounded-full transition-colors sm:w-4 ${
                    i === index
                      ? 'bg-orange-600'
                      : i < index
                        ? 'bg-orange-300'
                        : b.choice
                          ? 'bg-amber-300'
                          : 'bg-slate-300'
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
      primary ? 'bg-orange-600 text-white hover:bg-orange-700' : 'text-slate-700 hover:bg-slate-100'
    }`}
  >
    {children}
  </button>
);

export default ShipAFeatureScenario;
