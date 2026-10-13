import React, { lazy, useRef, useState } from 'react';
import { useReducedMotion, useStoryViewer } from '../../../../shared/hooks';
import { useViewChoice } from '../../../../shared/hooks/useViewChoice';
import ViewToggle from '../../../../shared/components/viz/ViewToggle';
import View3DBoundary from '../../../../shared/components/viz/View3DBoundary';
import Viewer3DToolbar from '../../../../shared/components/viz/Viewer3DToolbar';
import { Viewer3DHint, WheelZoomHint } from '../../../../shared/components/viz/ViewerHints';
import StoryCodePanel from '../../../../shared/components/viz/StoryCodePanel';
import StoryControls from '../../../../shared/components/viz/StoryControls';
import TryInPlaygroundLink from '../../../../shared/components/viz/TryInPlaygroundLink';
import { useStoryPlayback } from '../../../../shared/components/viz/useStoryPlayback';
import EventLoopStory2D from '../visualizations/2d/EventLoopStory2D';
import { STORY_BEATS, STORY_CODE, running } from '../../utils/eventLoopStory';
import { consoleAt } from '../../utils/eventLoopStoryConsole';

// three.js + R3F only download when the learner switches to 3D.
const EventLoop3D = lazy(() => import('../visualizations/3d/EventLoop3D'));

const VIEW_KEY = 'code-executives.event-loop-story.view';
const CODE_LINES = STORY_CODE.split('\n');

/*
 * The one beat that asks the learner to predict (the spec's beat 7), and the beat after it,
 * which answers. The options and the answer are read from those two beats.
 */
const PREDICT_INDEX = STORY_BEATS.findIndex((b) => b.id === 'stack-empties');
const PREDICT_BEAT = STORY_BEATS[PREDICT_INDEX];
const REVEAL_BEAT = STORY_BEATS[PREDICT_INDEX + 1];
const PREDICT_OPTIONS = [
  ...PREDICT_BEAT.microtasks.map((e) => ({ id: e.id, label: e.label, queue: 'microtask queue' })),
  ...PREDICT_BEAT.tasks.map((e) => ({ id: e.id, label: e.label, queue: 'task queue' })),
];
const ANSWER = PREDICT_OPTIONS.find((o) => o.id === running(REVEAL_BEAT));

const EventLoopStory: React.FC = () => {
  const reducedMotion = useReducedMotion();
  const { view, webgl, chooseView } = useViewChoice(VIEW_KEY);
  const playback = useStoryPlayback(STORY_BEATS.length);
  const { index, go } = playback;
  const [guess, setGuess] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const beat = STORY_BEATS[index];
  const is3D = view === '3d';

  const viewer = useStoryViewer({ rootRef, is3D, step: go });
  const fullscreen = viewer.fullscreen.isFullscreen;

  const printed = consoleAt(beat);
  const guessed = PREDICT_OPTIONS.find((o) => o.id === guess);
  const view2D = <EventLoopStory2D beat={beat} />;

  return (
    <div
      ref={rootRef}
      className={`relative w-full border bg-gradient-to-br from-slate-50 to-slate-200 p-4 shadow-xl sm:p-6 ${
        fullscreen ? 'h-full overflow-y-auto bg-white' : 'overflow-hidden rounded-2xl'
      }`}
      onKeyDown={viewer.onKeyDown}
      tabIndex={0}
      aria-label="Event loop story. Use the left and right arrow keys to step."
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500" />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="bg-gradient-to-tr from-indigo-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            The Event Loop: what runs next?
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            A {STORY_BEATS.length}-beat story. One program, three callbacks waiting in two queues,
            and one rule for which of them runs first.
          </p>
        </div>

        <ViewToggle view={view} onChange={chooseView} webgl={webgl} />
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        {/*
          Viewer: the drawing is four regions wide, so it takes the full width at every size,
          and below xl it gives up its padding too (the drawing has its own margin).
        */}
        <div
          data-viz-viewer
          data-view={is3D ? '3d' : '2d'}
          onWheel={viewer.onViewerWheel}
          className={`relative overflow-hidden rounded-xl border border-slate-300 bg-white shadow-lg ${
            is3D ? (fullscreen ? 'h-[75vh]' : 'h-[420px] sm:h-[500px]') : 'xl:p-2'
          }`}
        >
          {is3D ? (
            <View3DBoundary view2D={view2D}>
              <EventLoop3D beat={beat} camera={viewer.camera} instant={reducedMotion} />
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
          onRestart={() => {
            setGuess(null);
            playback.restart();
          }}
          fullscreen={is3D ? undefined : viewer.fullscreen}
        />

        {/* Narration and Console beside the code; in one column the narration stays by the viewer. */}
        <div className="flex min-w-0 flex-col gap-3 xl:grid xl:grid-cols-12 xl:items-start">
          <div className="flex min-w-0 flex-col gap-3 xl:order-2 xl:col-span-4">
            <div
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              aria-live="polite"
            >
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">
                Beat {index + 1} / {STORY_BEATS.length}
              </div>
              <h4 className="mb-2 text-base font-bold text-slate-900">{beat.title}</h4>
              <p className="text-sm leading-relaxed text-slate-700">{beat.caption}</p>

              {beat === REVEAL_BEAT && guessed && ANSWER && (
                <p
                  className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-slate-800"
                  data-testid="prediction-result"
                >
                  {guessed.id === ANSWER.id ? (
                    <>
                      You predicted <code className="font-semibold">{guessed.label}</code>, and that
                      is what ran.
                    </>
                  ) : (
                    <>
                      You predicted <code className="font-semibold">{guessed.label}</code>.{' '}
                      <code className="font-semibold">{ANSWER.label}</code> ran: it was first in the{' '}
                      {ANSWER.queue}.
                    </>
                  )}
                </p>
              )}
            </div>

            {beat === PREDICT_BEAT && (
              <fieldset className="rounded-xl border border-amber-300 bg-amber-50 px-4 pb-3 pt-2 shadow-sm">
                <legend className="px-1 text-sm font-semibold text-amber-900">
                  Predict: which callback runs next?
                </legend>
                <div className="flex flex-wrap gap-2">
                  {PREDICT_OPTIONS.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={guess === o.id}
                      onClick={() => setGuess(o.id)}
                      className={`rounded-lg border px-3 py-1.5 text-left text-sm transition-colors ${
                        guess === o.id
                          ? 'border-amber-600 bg-amber-200 text-slate-900'
                          : 'border-slate-300 bg-white text-slate-800 hover:bg-amber-100'
                      }`}
                    >
                      <code className="font-semibold">{o.label}</code>
                      <span className="ml-1.5 text-xs text-slate-600">{o.queue}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-700" role="status">
                  {guessed
                    ? `You picked ${guessed.label}. Go to the next beat to see what runs.`
                    : 'Pick one, then go to the next beat to see what runs.'}
                </p>
              </fieldset>
            )}
          </div>

          <div className="min-w-0 xl:order-3 xl:col-span-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
                Console so far
              </h4>
              {printed.lines.length === 0 ? (
                <p className="font-mono text-xs text-slate-500">Nothing printed yet.</p>
              ) : (
                <ol className="space-y-1 font-mono text-xs" aria-label="Console output so far">
                  {printed.lines.map((line, i) => {
                    const fresh = i >= printed.lines.length - printed.fresh;
                    return (
                      <li
                        key={line}
                        data-fresh={fresh || undefined}
                        className={`rounded border-l-2 px-2 py-0.5 ${
                          fresh
                            ? 'border-amber-500 bg-amber-100 font-semibold text-slate-900'
                            : 'border-transparent text-slate-700'
                        }`}
                      >
                        {line}
                        {fresh && <span className="sr-only"> (printed on this beat)</span>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          <div className="min-w-0 xl:order-1 xl:col-span-5">
            <StoryCodePanel lines={CODE_LINES} activeLine={beat.line} />
          </div>
        </div>

        <TryInPlaygroundLink example="event-loop-story" lens="stack-queues">
          this program opens there with the Stack &amp; Queues lens chosen. Run it, then swap lines
          8 and 9 or raise the timer&apos;s delay, and see what moves.
        </TryInPlaygroundLink>
      </div>
    </div>
  );
};

export default EventLoopStory;
