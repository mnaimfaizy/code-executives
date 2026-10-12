import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlaygroundLayout from './components/layout/PlaygroundLayout';
import PaneResizer from './components/layout/PaneResizer';
import PlaygroundToolbar from './components/layout/PlaygroundToolbar';
import SettingsPanel from './components/layout/SettingsPanel';
import MonacoEditor from './components/editor/MonacoEditor';
import EditorTabs from './components/editor/EditorTabs';
import SandboxFrame from './components/execution/SandboxFrame';
import ConsoleOutput from './components/execution/ConsoleOutput';
import PythonRunner from './components/execution/PythonRunner';
import StepControls from './components/instrumentation/StepControls';
import VisualizationCanvas from './components/visualizations/VisualizationCanvas';
import RightPaneTabs, { type RightPaneTab } from './components/layout/RightPaneTabs';
import TaskPanel from './components/exercises/TaskPanel';
import ConfirmBar, { type ConfirmRequest } from './components/exercises/ConfirmBar';
import { usePlaygroundState } from './hooks/usePlaygroundState';
import { useSandbox } from './hooks/useSandbox';
import { usePyodide } from './hooks/usePyodide';
import { useTrace } from './hooks/useTrace';
import { usePaneLayout } from './hooks/usePaneLayout';
import { instrument, resolveTraceLimits } from './tracer';
import { transpileTypeScript } from './services/transpileTypeScript';
import { examples, type Example } from './utils/examples';
import { getDefaultTemplate } from './utils/codeTemplates';
import {
  replacePlaygroundUrl,
  resolvePlaygroundStart,
  storyOf,
  type PlaygroundStart,
} from './utils/playgroundStart';
import { exercisesByLevel } from './exercises/exercises';
import { loadProgress, useExerciseProgress } from './exercises/exerciseProgress';
import {
  buildWatchCode,
  formatCall,
  runChecks,
  CHECK_TIMEOUT_MS,
  CHECK_TRACE_LIMITS,
} from './exercises/runChecks';
import type { ChecksRun, Exercise } from './exercises/types';
import type { VisualizationLens } from './types';
import {
  loadSettings,
  saveSettings,
  type PlaygroundSettings,
} from './components/layout/playgroundSettings';
import './components/theme/playground-theme.css';

const EXERCISE_GROUPS = exercisesByLevel();

/** What the address bar asks for, read once when the Playground opens */
function readStart(): PlaygroundStart {
  const saved = loadProgress();
  return resolvePlaygroundStart(window.location.search, (id) => saved[id]?.code);
}

const PlaygroundApp: React.FC = () => {
  // A link opens an exercise or an example (utils/playgroundLink.ts)
  const [start] = useState(readStart);

  const { language, code, executionState, setLanguage, setCode, setExecutionState, resetCode } =
    usePlaygroundState(start);

  const sandbox = useSandbox();
  const pyodide = usePyodide();
  const trace = useTrace();

  // Instrumented mode toggle
  const [instrumentedMode, setInstrumentedMode] = useState(true);

  // Visualization lens
  const [activeLens, setActiveLens] = useState<VisualizationLens>(start.lens);

  // The open exercise (null in free play), and what its Task panel shows
  const [exercise, setExercise] = useState<Exercise | null>(start.exercise);
  const [checksRun, setChecksRun] = useState<ChecksRun | null>(null);
  /** The code the results in `checksRun` are for */
  const [checkedCode, setCheckedCode] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [watchedIndex, setWatchedIndex] = useState<number | null>(null);
  const exerciseProgress = useExerciseProgress();
  /** The exercise a Check was started for: its results are dropped if another one is open by then */
  const exerciseIdRef = useRef<string | null>(start.exercise?.id ?? null);

  // The example in the editor, for the link to its story
  const [loadedExample, setLoadedExample] = useState<Example | null>(start.example);

  // The right pane shows the Task or the Console
  const [rightTab, setRightTab] = useState<RightPaneTab>(start.exercise ? 'task' : 'console');

  // A question asked in the page before the learner's code is replaced
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  // Resizable pane layout
  const paneLayout = usePaneLayout();

  // Settings
  const [settings, setSettings] = useState<PlaygroundSettings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsContainerRef = useRef<HTMLDivElement>(null);

  // Close settings on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent): void => {
      if (
        settingsContainerRef.current &&
        !settingsContainerRef.current.contains(e.target as Node)
      ) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  // Determine which console entries to show based on language
  const consoleEntries = language === 'python' ? pyodide.entries : sandbox.entries;

  /**
   * Run JavaScript in the sandbox, traced or not, and show the steps of a traced run.
   * `rateLimit: false` is for a run a control in the page starts on its own.
   */
  const runJavaScript = useCallback(
    (
      js: string,
      traced: boolean,
      options: { mapLine?: (line: number) => number; rateLimit?: boolean } = {}
    ): void => {
      const { mapLine, rateLimit } = options;
      if (traced) {
        const instrumented = instrument(js);
        if (!instrumented.ok) {
          // Nothing runs, so the Console says why there are no steps: a syntax error
          // has a line, code the tracer cannot rewrite has none
          const { message, line } = instrumented.error;
          if (line === undefined) {
            // The position at the end of the message is one in the rewritten code
            const reason = message.replace(/\s*\(\d+:\d+\)$/, '');
            sandbox.reportError(`${reason}. No steps were recorded; turn Trace off to run it.`);
          } else {
            sandbox.reportError(`SyntaxError: ${message}`, mapLine ? mapLine(line) : line);
          }
          setExecutionState('error');
          return;
        }
        sandbox
          .execute(instrumented.code, { mapLine, rateLimit, traceLimits: resolveTraceLimits() })
          .then((result) => {
            setExecutionState(result.error ? 'error' : 'completed');
            // A run that stopped at the step limit or on an error keeps its steps
            if (result.trace && result.trace.steps.length > 0) {
              trace.loadTrace(result.trace);
            }
          });
      } else {
        sandbox.execute(js, { mapLine, rateLimit }).then((result) => {
          setExecutionState(result.error ? 'error' : 'completed');
        });
      }
    },
    [sandbox, setExecutionState, trace]
  );

  // handleRun sets the execution state itself. An effect that copied `isRunning`
  // into it could run after a fast run had already completed (a TypeScript run
  // starts outside a click event) and leave the state stuck on 'running'.
  const handleRun = useCallback((): void => {
    setExecutionState('running');
    trace.clear();
    setWatchedIndex(null);

    if (language === 'python') {
      const runFn = instrumentedMode ? pyodide.runPythonInstrumented : pyodide.runPython;
      runFn(code).then((result) => {
        setExecutionState(result.error ? 'error' : 'completed');
        if (result.trace && result.trace.steps.length > 0) {
          trace.loadTrace(result.trace);
        }
      });
      return;
    }

    if (language === 'typescript') {
      // The sandbox and the instrumenter take JavaScript: strip the types first,
      // and keep the way back to the lines of the TypeScript source
      transpileTypeScript(code).then((transpiled) => {
        if (!transpiled.ok) {
          sandbox.reportError(transpiled.message, transpiled.line);
          setExecutionState('error');
          return;
        }
        runJavaScript(transpiled.code, instrumentedMode, { mapLine: transpiled.mapLine });
      });
    } else {
      runJavaScript(code, instrumentedMode);
    }
  }, [language, code, sandbox, pyodide, setExecutionState, instrumentedMode, trace, runJavaScript]);

  const handleStop = useCallback((): void => {
    if (language === 'python') {
      // Pyodide doesn't support easy termination; mark as error
      setExecutionState('error');
    } else {
      sandbox.terminate();
      setExecutionState('idle');
    }
  }, [language, sandbox, setExecutionState]);

  const handleClearConsole = useCallback((): void => {
    if (language === 'python') {
      pyodide.clearEntries();
    } else {
      sandbox.clearEntries();
    }
  }, [language, sandbox, pyodide]);

  /** Drop everything the last run left: the Console, the steps, an exercise's results */
  const clearRun = useCallback((): void => {
    sandbox.clearEntries();
    pyodide.clearEntries();
    trace.clear();
    setChecksRun(null);
    setCheckedCode(null);
    setWatchedIndex(null);
  }, [sandbox, pyodide, trace]);

  // ---- Exercises ----

  const { saveCode, forgetCode, markPassed, progress } = exerciseProgress;

  const passedIds = useMemo(
    () => new Set(Object.keys(progress).filter((id) => progress[id].passed)),
    [progress]
  );

  /** The editor's change handler: an open exercise remembers the learner's code */
  const handleCodeChange = useCallback(
    (next: string): void => {
      setCode(next);
      if (exercise && language === 'javascript') saveCode(exercise.id, next);
    },
    [setCode, exercise, language, saveCode]
  );

  /**
   * True when replacing the editor's code would lose work: it is neither the default
   * template nor an example, and no exercise is keeping it.
   */
  const codeAtRisk =
    !(exercise && language === 'javascript') &&
    code !== getDefaultTemplate(language) &&
    !examples.some((example) => example.code === code);

  const openExercise = useCallback(
    (next: Exercise): void => {
      exerciseIdRef.current = next.id;
      setExercise(next);
      setLoadedExample(null);
      setLanguage('javascript');
      setCode(progress[next.id]?.code ?? next.starterCode);
      setActiveLens(next.suggestedLens);
      setHintsShown(0);
      setChecking(false);
      clearRun();
      setRightTab('task');
      replacePlaygroundUrl({ exercise: next.id });
    },
    [setLanguage, setCode, progress, clearRun]
  );

  /** Open an exercise, asking first when the editor holds code nothing else keeps */
  const handleOpenExercise = useCallback(
    (next: Exercise): void => {
      if (exercise?.id === next.id) {
        setRightTab('task');
        return;
      }
      if (!codeAtRisk) {
        openExercise(next);
        return;
      }
      setConfirmRequest({
        title: `Open the exercise “${next.title}”?`,
        body: 'It replaces the code in the editor, and your changes to that code are not saved anywhere.',
        confirmLabel: 'Replace my code',
        cancelLabel: 'Keep my code',
        onConfirm: () => {
          setConfirmRequest(null);
          openExercise(next);
        },
      });
    },
    [exercise, codeAtRisk, openExercise]
  );

  /** Back to free play. The learner's code for the exercise stays remembered. */
  const handleLeaveExercise = useCallback((): void => {
    exerciseIdRef.current = null;
    setExercise(null);
    if (language === 'javascript') setCode(getDefaultTemplate('javascript'));
    setHintsShown(0);
    setChecking(false);
    clearRun();
    setRightTab('console');
    replacePlaygroundUrl({});
  }, [language, setCode, clearRun]);

  /** Put the starter code back, asking first when the learner has written something */
  const handleStartOver = useCallback((): void => {
    if (!exercise) return;
    const startOver = (): void => {
      setConfirmRequest(null);
      setLanguage('javascript');
      setCode(exercise.starterCode);
      forgetCode(exercise.id);
      setHintsShown(0);
      clearRun();
    };
    if (language === 'javascript' && code !== exercise.starterCode) {
      setConfirmRequest({
        title: `Start “${exercise.title}” over?`,
        body: 'It puts the starter code back and discards the code you wrote for this exercise.',
        confirmLabel: 'Discard my code',
        cancelLabel: 'Keep my code',
        onConfirm: startOver,
      });
    } else {
      startOver();
    }
  }, [exercise, language, code, setLanguage, setCode, forgetCode, clearRun]);

  /** The Check action: run every check on the code in the editor */
  const handleCheck = useCallback((): void => {
    if (!exercise || language !== 'javascript' || checking) return;
    const checkedExercise = exercise;
    const checked = code;
    setChecking(true);
    setRightTab('task');
    trace.clear();
    setWatchedIndex(null);
    runChecks(checkedExercise, checked, (instrumentedCode, check) =>
      sandbox.runCheck(instrumentedCode, check, CHECK_TRACE_LIMITS, CHECK_TIMEOUT_MS)
    ).then((run) => {
      // The learner opened something else while the checks ran
      if (exerciseIdRef.current !== checkedExercise.id) return;
      setChecking(false);
      setChecksRun(run);
      setCheckedCode(checked);
      // What went wrong outside a comparison also goes to the Console
      if (run.kind === 'syntax-error') {
        sandbox.reportError(`SyntaxError: ${run.message}`, run.line);
      } else if (run.kind === 'untraceable') {
        sandbox.reportError(`${run.message}. The checks did not run.`);
      } else {
        for (const result of run.results) {
          if (result.status === 'threw' && result.message) {
            const call = formatCall(checkedExercise.entry, checkedExercise.checks[result.index]);
            sandbox.reportError(`Check ${result.index + 1}, ${call}: ${result.message}`);
          }
        }
        if (run.passed) markPassed(checkedExercise.id);
      }
    });
  }, [exercise, language, checking, code, trace, sandbox, markPassed]);

  /** Watch one check: run the learner's code plus that one call, traced, into the lens */
  const handleWatch = useCallback(
    (index: number): void => {
      const check = exercise?.checks[index];
      if (!exercise || !check || check.hidden || language !== 'javascript') return;
      setExecutionState('running');
      trace.clear();
      setWatchedIndex(index);
      // The steps need a lens to be drawn in
      if (activeLens === 'none') setActiveLens(exercise.suggestedLens);
      runJavaScript(buildWatchCode(code, exercise, check), true, { rateLimit: false });
    },
    [exercise, language, code, activeLens, trace, setExecutionState, runJavaScript]
  );

  const handleReset = useCallback((): void => {
    if (exercise && language === 'javascript') {
      handleStartOver();
      return;
    }
    resetCode();
    setLoadedExample(null);
    clearRun();
    if (!exercise) replacePlaygroundUrl({});
  }, [exercise, language, handleStartOver, resetCode, clearRun]);

  const handleLoadExample = useCallback(
    (example: Example): void => {
      exerciseIdRef.current = null;
      setExercise(null);
      setLoadedExample(example);
      setLanguage(example.language);
      setCode(example.code);
      setActiveLens(example.suggestedLens);
      setHintsShown(0);
      setChecking(false);
      clearRun();
      setRightTab('console');
      replacePlaygroundUrl({ example: example.id });
    },
    [setLanguage, setCode, clearRun]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl+Shift+Enter → run the open exercise's checks
      if (e.key === 'Enter' && mod && e.shiftKey && exercise) {
        e.preventDefault();
        handleCheck();
        return;
      }
      // Ctrl+Enter → Run code
      if (e.key === 'Enter' && mod && !e.shiftKey) {
        e.preventDefault();
        handleRun();
        return;
      }
      // Escape → stop execution or close settings
      if (e.key === 'Escape') {
        if (confirmRequest) {
          setConfirmRequest(null);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        } else if (executionState === 'running') {
          handleStop();
        }
        return;
      }
      // Ctrl+L → clear console
      if (e.key === 'l' && mod) {
        e.preventDefault();
        handleClearConsole();
        return;
      }
      // Left/Right arrow, Space → stepping through the trace (when not in editor or any interactive element)
      const activeEl = document.activeElement;
      const target = e.target instanceof HTMLElement ? e.target : null;
      const inEditor =
        activeEl?.getAttribute('role') === 'tab' ||
        activeEl?.closest('.monaco-editor') !== null ||
        target?.closest('.monaco-editor') !== null ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'INPUT' ||
        activeEl?.getAttribute('role') === 'textbox' ||
        activeEl?.getAttribute('contenteditable') === 'true';
      if (!inEditor && trace.stepCount > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          trace.prevStep();
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          trace.nextStep();
          return;
        }
        // Space → play/pause the steps
        if (e.key === ' ') {
          e.preventDefault();
          if (trace.isPlaying) {
            trace.pause();
          } else {
            trace.play();
          }
          return;
        }
        // Home/End → first/last step
        if (e.key === 'Home') {
          e.preventDefault();
          trace.firstStep();
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          trace.lastStep();
          return;
        }
      }
      // ? → toggle keyboard shortcut reference (only when not in editor)
      if (e.key === '?' && !inEditor) {
        // Could be expanded to show a shortcut overlay
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    executionState,
    settingsOpen,
    confirmRequest,
    exercise,
    handleRun,
    handleCheck,
    handleStop,
    handleClearConsole,
    trace,
  ]);

  // A watched check's call is on a line after the learner's last one: nothing to highlight there
  const stepLine = trace.currentStep?.line;
  const highlightLine =
    stepLine !== undefined && stepLine <= code.split('\n').length ? stepLine : undefined;

  const consoleErrors = consoleEntries.filter((entry) => entry.type === 'error').length;
  const inExercise = exercise !== null && language === 'javascript';

  return (
    <PlaygroundLayout>
      {/* Top toolbar */}
      <div className="relative shrink-0 z-20" ref={settingsContainerRef}>
        <PlaygroundToolbar
          language={language}
          onLanguageChange={setLanguage}
          activeLens={activeLens}
          onLensChange={setActiveLens}
          instrumentedMode={instrumentedMode}
          onInstrumentedModeChange={setInstrumentedMode}
          executionState={executionState}
          onRun={handleRun}
          onStop={handleStop}
          onReset={handleReset}
          onLoadExample={handleLoadExample}
          exerciseGroups={EXERCISE_GROUPS}
          passedExerciseIds={passedIds}
          activeExerciseId={exercise?.id ?? null}
          onOpenExercise={handleOpenExercise}
          onOpenSettings={() => setSettingsOpen((prev) => !prev)}
        />
        {settingsOpen && (
          <SettingsPanel
            settings={settings}
            onChange={(next) => {
              setSettings(next);
              saveSettings(next);
            }}
            onClose={() => setSettingsOpen(false)}
          />
        )}
      </div>

      {confirmRequest && (
        <ConfirmBar request={confirmRequest} onCancel={() => setConfirmRequest(null)} />
      )}

      {/* Python loading indicator */}
      {language === 'python' && <PythonRunner loadingState={pyodide.loadingState} />}

      {/* Three-pane content area */}
      <div className="flex-1 flex min-h-0 p-1 gap-0">
        {/* Editor Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            width: `${paneLayout.dividers[0] * 100}%`,
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <EditorTabs
            language={language}
            onReset={handleReset}
            resetLabel={inExercise ? 'Start the exercise over with its starter code' : undefined}
            exerciseTitle={inExercise ? exercise.title : undefined}
            story={exercise ? null : storyOf(loadedExample)}
          />
          <div className="flex-1 min-h-0">
            <MonacoEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
              onExecute={handleRun}
              highlightLine={highlightLine}
              fontSize={settings.fontSize}
              wordWrap={settings.wordWrap}
            />
          </div>
        </div>

        <PaneResizer
          position={paneLayout.dividers[0]}
          onResize={(f) => paneLayout.setDivider(0, f)}
          onReset={paneLayout.resetDividers}
          aria-label="Resize editor and visualization panes"
        />

        {/* Visualization / Steps Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            width: `${(paneLayout.dividers[1] - paneLayout.dividers[0]) * 100}%`,
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          {/* Visualization canvas (top portion) */}
          <div className="flex-1 min-h-0">
            <VisualizationCanvas
              lens={activeLens}
              steps={trace.steps}
              index={trace.index}
              language={language}
              queuesApproximate={trace.queuesApproximate}
            />
          </div>
          {/* Step controls (bottom) */}
          <div
            style={{
              borderTop: '1px solid var(--pg-border)',
            }}
          >
            <StepControls
              index={trace.index}
              stepCount={trace.stepCount}
              step={trace.currentStep}
              isPlaying={trace.isPlaying}
              speed={trace.speed}
              onGoToStep={trace.goToStep}
              onNextStep={trace.nextStep}
              onPrevStep={trace.prevStep}
              onFirstStep={trace.firstStep}
              onLastStep={trace.lastStep}
              onPlay={trace.play}
              onPause={trace.pause}
              onSetSpeed={trace.setSpeed}
              compact={activeLens !== 'none'}
            />
          </div>
        </div>

        <PaneResizer
          position={paneLayout.dividers[1]}
          onResize={(f) => paneLayout.setDivider(1, f)}
          onReset={paneLayout.resetDividers}
          aria-label="Resize visualization and console panes"
        />

        {/* Task and Console pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            width: `${(1 - paneLayout.dividers[1]) * 100}%`,
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <RightPaneTabs
            active={rightTab}
            onChange={setRightTab}
            taskOpen={exercise !== null}
            consoleErrors={consoleErrors}
            onClearConsole={handleClearConsole}
            task={
              <TaskPanel
                exercise={exercise}
                groups={EXERCISE_GROUPS}
                passedIds={passedIds}
                onOpenExercise={handleOpenExercise}
                run={checksRun}
                checking={checking}
                stale={checkedCode !== null && checkedCode !== code}
                blockedReason={
                  exercise && language !== 'javascript'
                    ? 'Exercises run JavaScript. Switch the language back to JavaScript to check your code.'
                    : undefined
                }
                hintsShown={hintsShown}
                onRevealHint={() => setHintsShown((shown) => shown + 1)}
                onCheck={handleCheck}
                onWatch={handleWatch}
                watchedIndex={watchedIndex}
                onStartOver={handleStartOver}
                onLeave={handleLeaveExercise}
              />
            }
            console={
              <ConsoleOutput
                entries={consoleEntries}
                onClear={handleClearConsole}
                showHeader={false}
              />
            }
          />
        </div>
      </div>

      {/* Hidden sandbox iframe for JS/TS execution */}
      <SandboxFrame ref={sandbox.sandboxRef} />
    </PlaygroundLayout>
  );
};

export default PlaygroundApp;
