import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { usePlaygroundState } from './hooks/usePlaygroundState';
import { useSandbox } from './hooks/useSandbox';
import { usePyodide } from './hooks/usePyodide';
import { useTrace } from './hooks/useTrace';
import { usePaneLayout } from './hooks/usePaneLayout';
import { instrument, resolveTraceLimits } from './tracer';
import { transpileTypeScript } from './services/transpileTypeScript';
import type { Example } from './utils/examples';
import type { VisualizationLens } from './types';
import {
  loadSettings,
  saveSettings,
  type PlaygroundSettings,
} from './components/layout/playgroundSettings';
import './components/theme/playground-theme.css';

const PlaygroundApp: React.FC = () => {
  const { language, code, executionState, setLanguage, setCode, setExecutionState, resetCode } =
    usePlaygroundState();

  const sandbox = useSandbox();
  const pyodide = usePyodide();
  const trace = useTrace();

  // Instrumented mode toggle
  const [instrumentedMode, setInstrumentedMode] = useState(true);

  // Visualization lens
  const [activeLens, setActiveLens] = useState<VisualizationLens>('none');

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

  // handleRun sets the execution state itself. An effect that copied `isRunning`
  // into it could run after a fast run had already completed (a TypeScript run
  // starts outside a click event) and leave the state stuck on 'running'.
  const handleRun = useCallback((): void => {
    setExecutionState('running');
    trace.clear();

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

    const runJavaScript = (js: string, mapLine?: (line: number) => number): void => {
      if (instrumentedMode) {
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
          .execute(instrumented.code, { mapLine, traceLimits: resolveTraceLimits() })
          .then((result) => {
            setExecutionState(result.error ? 'error' : 'completed');
            // A run that stopped at the step limit or on an error keeps its steps
            if (result.trace && result.trace.steps.length > 0) {
              trace.loadTrace(result.trace);
            }
          });
      } else {
        sandbox.execute(js, { mapLine }).then((result) => {
          setExecutionState(result.error ? 'error' : 'completed');
        });
      }
    };

    if (language === 'typescript') {
      // The sandbox and the instrumenter take JavaScript: strip the types first,
      // and keep the way back to the lines of the TypeScript source
      transpileTypeScript(code).then((transpiled) => {
        if (!transpiled.ok) {
          sandbox.reportError(transpiled.message, transpiled.line);
          setExecutionState('error');
          return;
        }
        runJavaScript(transpiled.code, transpiled.mapLine);
      });
    } else {
      runJavaScript(code);
    }
  }, [language, code, sandbox, pyodide, setExecutionState, instrumentedMode, trace]);

  const handleStop = useCallback((): void => {
    if (language === 'python') {
      // Pyodide doesn't support easy termination; mark as error
      setExecutionState('error');
    } else {
      sandbox.terminate();
      setExecutionState('idle');
    }
  }, [language, sandbox, setExecutionState]);

  const handleReset = useCallback((): void => {
    resetCode();
    sandbox.clearEntries();
    pyodide.clearEntries();
    trace.clear();
  }, [resetCode, sandbox, pyodide, trace]);

  const handleClearConsole = useCallback((): void => {
    if (language === 'python') {
      pyodide.clearEntries();
    } else {
      sandbox.clearEntries();
    }
  }, [language, sandbox, pyodide]);

  const handleLoadExample = useCallback(
    (example: Example): void => {
      setLanguage(example.language);
      setCode(example.code);
      setActiveLens(example.suggestedLens);
      sandbox.clearEntries();
      pyodide.clearEntries();
      trace.clear();
    },
    [setLanguage, setCode, sandbox, pyodide, trace]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl+Enter → Run code
      if (e.key === 'Enter' && mod && !e.shiftKey) {
        e.preventDefault();
        handleRun();
        return;
      }
      // Escape → stop execution or close settings
      if (e.key === 'Escape') {
        if (settingsOpen) {
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
  }, [executionState, settingsOpen, handleRun, handleStop, handleClearConsole, trace]);

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
          <EditorTabs language={language} onReset={resetCode} />
          <div className="flex-1 min-h-0">
            <MonacoEditor
              code={code}
              language={language}
              onChange={setCode}
              onExecute={handleRun}
              highlightLine={trace.currentStep?.line}
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

        {/* Console Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            width: `${(1 - paneLayout.dividers[1]) * 100}%`,
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <ConsoleOutput entries={consoleEntries} onClear={handleClearConsole} />
        </div>
      </div>

      {/* Hidden sandbox iframe for JS/TS execution */}
      <SandboxFrame ref={sandbox.sandboxRef} />
    </PlaygroundLayout>
  );
};

export default PlaygroundApp;
