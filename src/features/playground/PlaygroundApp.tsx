import React, { useCallback, useEffect, useState } from 'react';
import PlaygroundLayout from './components/layout/PlaygroundLayout';
import BackToSiteLink from './components/layout/BackToSiteLink';
import MonacoEditor from './components/editor/MonacoEditor';
import EditorTabs from './components/editor/EditorTabs';
import LanguagePicker from './components/editor/LanguagePicker';
import SandboxFrame from './components/execution/SandboxFrame';
import ConsoleOutput from './components/execution/ConsoleOutput';
import ExecutionController from './components/execution/ExecutionController';
import PythonRunner from './components/execution/PythonRunner';
import TimelinePlayer from './components/instrumentation/TimelinePlayer';
import { usePlaygroundState } from './hooks/usePlaygroundState';
import { useSandbox } from './hooks/useSandbox';
import { usePyodide } from './hooks/usePyodide';
import { useTimeline } from './hooks/useTimeline';
import { prepareInstrumentedCode } from './instrumentation/JsInstrumenter';
import './components/theme/playground-theme.css';

const PlaygroundApp: React.FC = () => {
  const { language, code, executionState, setLanguage, setCode, setExecutionState, resetCode } =
    usePlaygroundState();

  const sandbox = useSandbox();
  const pyodide = usePyodide();
  const timeline = useTimeline();

  // Instrumented mode toggle
  const [instrumentedMode, setInstrumentedMode] = useState(true);

  // Determine which console entries to show based on language
  const consoleEntries = language === 'python' ? pyodide.entries : sandbox.entries;
  const isRunning = language === 'python' ? pyodide.isRunning : sandbox.isRunning;

  // Sync execution state
  useEffect(() => {
    if (isRunning) {
      setExecutionState('running');
    }
  }, [isRunning, setExecutionState]);

  const handleRun = useCallback((): void => {
    setExecutionState('running');
    timeline.clear();

    if (language === 'python') {
      const runFn = instrumentedMode ? pyodide.runPythonInstrumented : pyodide.runPython;
      runFn(code).then(() => {
        setExecutionState(pyodide.error ? 'error' : 'completed');
        if (instrumentedMode && pyodide.snapshots.length > 0) {
          timeline.loadSnapshots(pyodide.snapshots);
        }
      });
    } else {
      // For JS/TS: instrument the code if mode is enabled
      if (instrumentedMode) {
        const result = prepareInstrumentedCode(code);
        if ('error' in result) {
          // Fall back to non-instrumented execution on parse error
          sandbox.execute(code).then(() => {
            setExecutionState(sandbox.error ? 'error' : 'completed');
          });
          return;
        }
        sandbox.execute(result.code).then(() => {
          setExecutionState(sandbox.error ? 'error' : 'completed');
          if (sandbox.snapshots.length > 0) {
            timeline.loadSnapshots(sandbox.snapshots);
          }
        });
      } else {
        sandbox.execute(code).then(() => {
          setExecutionState(sandbox.error ? 'error' : 'completed');
        });
      }
    }
  }, [language, code, sandbox, pyodide, setExecutionState, instrumentedMode, timeline]);

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
    sandbox.clearSnapshots();
    pyodide.clearSnapshots();
    timeline.clear();
  }, [resetCode, sandbox, pyodide, timeline]);

  const handleClearConsole = useCallback((): void => {
    if (language === 'python') {
      pyodide.clearEntries();
    } else {
      sandbox.clearEntries();
    }
  }, [language, sandbox, pyodide]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Escape → stop execution
      if (e.key === 'Escape' && executionState === 'running') {
        handleStop();
      }
      // Ctrl+L → clear console
      if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleClearConsole();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executionState, handleStop, handleClearConsole]);

  return (
    <PlaygroundLayout>
      {/* Top toolbar area */}
      <div
        className="flex items-center gap-4 px-4 shrink-0"
        style={{
          height: 'var(--pg-toolbar-height)',
          borderBottom: '1px solid var(--pg-border)',
          background: 'var(--pg-bg-toolbar-translucent)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <BackToSiteLink />
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--pg-accent-green)' }} />
          <span
            className="text-sm font-semibold tracking-wide"
            style={{ color: 'var(--pg-text-primary)' }}
          >
            Playground
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-5" style={{ background: 'var(--pg-border)' }} aria-hidden="true" />

        {/* Language picker */}
        <LanguagePicker language={language} onLanguageChange={setLanguage} />

        {/* Instrumented mode toggle */}
        <label
          className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
          style={{ color: 'var(--pg-text-secondary)' }}
        >
          <input
            type="checkbox"
            checked={instrumentedMode}
            onChange={(e) => setInstrumentedMode(e.target.checked)}
            className="accent-blue-500"
          />
          <span>Trace</span>
        </label>

        <div className="flex-1" />

        {/* Execution controls */}
        <ExecutionController
          executionState={executionState}
          onRun={handleRun}
          onStop={handleStop}
          onReset={handleReset}
        />
      </div>

      {/* Python loading indicator */}
      {language === 'python' && <PythonRunner loadingState={pyodide.loadingState} />}

      {/* Three-pane content area */}
      <div className="flex-1 grid grid-cols-3 gap-1 p-1 min-h-0">
        {/* Editor Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
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
              highlightLine={timeline.currentSnapshot?.line}
            />
          </div>
        </div>

        {/* Timeline / Visualization Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
            background: 'var(--pg-bg-surface-translucent)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--pg-border)',
          }}
        >
          <TimelinePlayer
            currentStep={timeline.currentStep}
            totalSteps={timeline.totalSteps}
            currentSnapshot={timeline.currentSnapshot}
            previousSnapshot={timeline.previousSnapshot}
            isPlaying={timeline.isPlaying}
            speed={timeline.speed}
            onGoToStep={timeline.goToStep}
            onNextStep={timeline.nextStep}
            onPrevStep={timeline.prevStep}
            onFirstStep={timeline.firstStep}
            onLastStep={timeline.lastStep}
            onPlay={timeline.play}
            onPause={timeline.pause}
            onSetSpeed={timeline.setSpeed}
          />
        </div>

        {/* Output Pane */}
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{
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
