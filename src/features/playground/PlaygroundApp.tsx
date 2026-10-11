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
import TimelinePlayer from './components/instrumentation/TimelinePlayer';
import VisualizationCanvas from './components/visualizations/VisualizationCanvas';
import { usePlaygroundState } from './hooks/usePlaygroundState';
import { useSandbox } from './hooks/useSandbox';
import { usePyodide } from './hooks/usePyodide';
import { useTimeline } from './hooks/useTimeline';
import { usePaneLayout } from './hooks/usePaneLayout';
import { prepareInstrumentedCode } from './instrumentation/JsInstrumenter';
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
  const timeline = useTimeline();

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
    timeline.clear();

    if (language === 'python') {
      const runFn = instrumentedMode ? pyodide.runPythonInstrumented : pyodide.runPython;
      runFn(code).then((result) => {
        setExecutionState(result.error ? 'error' : 'completed');
        if (instrumentedMode && result.snapshots.length > 0) {
          timeline.loadSnapshots(result.snapshots);
        }
      });
      return;
    }

    const runJavaScript = (js: string, mapLine?: (line: number) => number): void => {
      if (instrumentedMode) {
        const prepared = prepareInstrumentedCode(js);
        if ('error' in prepared) {
          // Fall back to non-instrumented execution on parse error
          sandbox.execute(js, { mapLine }).then((result) => {
            setExecutionState(result.error ? 'error' : 'completed');
          });
          return;
        }
        sandbox.execute(prepared.code, { mapLine }).then((result) => {
          setExecutionState(result.error ? 'error' : 'completed');
          if (result.snapshots.length > 0) {
            timeline.loadSnapshots(result.snapshots);
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

  const handleLoadExample = useCallback(
    (example: Example): void => {
      setLanguage(example.language);
      setCode(example.code);
      setActiveLens(example.suggestedLens);
      sandbox.clearEntries();
      pyodide.clearEntries();
      sandbox.clearSnapshots();
      pyodide.clearSnapshots();
      timeline.clear();
    },
    [setLanguage, setCode, sandbox, pyodide, timeline]
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
      if (!inEditor && timeline.totalSteps > 0) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          timeline.prevStep();
          return;
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          timeline.nextStep();
          return;
        }
        // Space → play/pause the steps
        if (e.key === ' ') {
          e.preventDefault();
          if (timeline.isPlaying) {
            timeline.pause();
          } else {
            timeline.play();
          }
          return;
        }
        // Home/End → first/last step
        if (e.key === 'Home') {
          e.preventDefault();
          timeline.firstStep();
          return;
        }
        if (e.key === 'End') {
          e.preventDefault();
          timeline.lastStep();
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
  }, [executionState, settingsOpen, handleRun, handleStop, handleClearConsole, timeline]);

  return (
    <PlaygroundLayout>
      {/* Top toolbar */}
      <div className="relative shrink-0 z-20" ref={settingsContainerRef}>
        <PlaygroundToolbar
          language={language}
          onLanguageChange={setLanguage}
          activeLens={activeLens}
          onLensChange={setActiveLens}
          currentSnapshot={timeline.currentSnapshot}
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
              highlightLine={timeline.currentSnapshot?.line}
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
              currentSnapshot={timeline.currentSnapshot}
              previousSnapshot={timeline.previousSnapshot}
            />
          </div>
          {/* Step controls (bottom) */}
          <div
            style={{
              borderTop: '1px solid var(--pg-border)',
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
