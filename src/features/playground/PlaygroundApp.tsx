import React, { useCallback, useEffect, useRef, useState } from 'react';
import PlaygroundLayout from './components/layout/PlaygroundLayout';
import PaneResizer from './components/layout/PaneResizer';
import PlaygroundToolbar from './components/layout/PlaygroundToolbar';
import SettingsPanel, {
  loadSettings,
  saveSettings,
  type PlaygroundSettings,
} from './components/layout/SettingsPanel';
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
import type { ExampleSnippet } from './utils/exampleSnippets';
import type { VisualizationLens } from './types';
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
      runFn(code).then((result) => {
        setExecutionState(result.error ? 'error' : 'completed');
        if (instrumentedMode && result.snapshots.length > 0) {
          timeline.loadSnapshots(result.snapshots);
        }
      });
    } else {
      // For JS/TS: instrument the code if mode is enabled
      if (instrumentedMode) {
        const prepared = prepareInstrumentedCode(code);
        if ('error' in prepared) {
          // Fall back to non-instrumented execution on parse error
          sandbox.execute(code).then((result) => {
            setExecutionState(result.error ? 'error' : 'completed');
          });
          return;
        }
        sandbox.execute(prepared.code).then((result) => {
          setExecutionState(result.error ? 'error' : 'completed');
          if (result.snapshots.length > 0) {
            timeline.loadSnapshots(result.snapshots);
          }
        });
      } else {
        sandbox.execute(code).then((result) => {
          setExecutionState(result.error ? 'error' : 'completed');
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

  const handleLoadSnippet = useCallback(
    (snippet: ExampleSnippet): void => {
      setLanguage(snippet.language);
      setCode(snippet.code);
      setActiveLens(snippet.suggestedLens);
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
      // Left/Right arrow, Space → timeline stepping (when not in editor or any interactive element)
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
        // Space → play/pause timeline
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
          onLoadSnippet={handleLoadSnippet}
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

        {/* Visualization / Timeline Pane */}
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
          {/* Timeline controls (bottom) */}
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

        {/* Output Pane */}
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
