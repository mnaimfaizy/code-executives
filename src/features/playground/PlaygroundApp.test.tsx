/**
 * PlaygroundApp — Smoke test.
 *
 * PlaygroundApp orchestrates many child components and hooks. We mock the
 * heavy ones (Monaco, SandboxFrame, Pyodide) and verify high-level
 * rendering, pane layout, and language switching.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { traceSync } from './tracer';

// ---- Mocks ----

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  reportError: vi.fn(),
}));

// Mock Monaco Editor
vi.mock('./components/editor/MonacoEditor', () => ({
  __esModule: true,
  default: ({
    language,
    code,
    onChange,
    highlightLine,
  }: {
    language: string;
    code: string;
    onChange: (code: string) => void;
    highlightLine?: number;
  }) => (
    <div data-testid="mock-editor" data-language={language} data-line={highlightLine}>
      {code}
      <button onClick={() => onChange('const a = 1;\nconst = ;')}>break the code</button>
      <button
        onClick={() => onChange('function f() {\n  var twice = 1;\n  function twice() {}\n}')}
      >
        write untraceable code
      </button>
    </div>
  ),
}));

// Mock SandboxFrame
vi.mock('./components/execution/SandboxFrame', () => {
  const SandboxFrame = React.forwardRef((_: unknown, ref: React.Ref<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      execute: vi.fn().mockResolvedValue({ entries: [] }),
      terminate: vi.fn(),
    }));
    return <iframe data-testid="mock-sandbox" title="sandbox" />;
  });
  SandboxFrame.displayName = 'SandboxFrame';
  return { __esModule: true, default: SandboxFrame };
});

// Mock SpaceBackground (canvas animation)
vi.mock('./components/theme/SpaceBackground', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-space-bg" />,
}));

// Mock VisualizationCanvas (the lens loads lazily)
vi.mock('./components/visualizations/VisualizationCanvas', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-visualization" />,
}));

// Mock CSS import
vi.mock('./components/theme/playground-theme.css', () => ({}));

// Mock usePyodide
vi.mock('./hooks/usePyodide', () => ({
  usePyodide: () => ({
    runPython: vi.fn().mockResolvedValue({ error: null, trace: null }),
    runPythonInstrumented: vi.fn().mockResolvedValue({ error: null, trace: null }),
    loadingState: { status: 'idle' },
    isReady: false,
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
    preload: vi.fn(),
  }),
}));

// Mock useSandbox
vi.mock('./hooks/useSandbox', () => ({
  useSandbox: () => ({
    sandboxRef: { current: null },
    execute: mocks.execute,
    reportError: mocks.reportError,
    terminate: vi.fn(),
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
  }),
}));

// Mock usePaneLayout
vi.mock('./hooks/usePaneLayout', () => ({
  usePaneLayout: () => ({
    dividers: [0.3, 0.78],
    setDivider: vi.fn(),
    resetDividers: vi.fn(),
  }),
}));

// Mock SettingsPanel to avoid deep dependencies
vi.mock('./components/layout/SettingsPanel', () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock('./components/layout/playgroundSettings', () => ({
  __esModule: true,
  loadSettings: () => ({
    fontSize: 14,
    wordWrap: true,
    executionTimeoutMs: 10_000,
    animationsEnabled: true,
  }),
  saveSettings: vi.fn(),
}));

import PlaygroundApp from './PlaygroundApp';

describe('PlaygroundApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.execute.mockResolvedValue({ error: null, trace: null });
  });

  /** Ctrl+Enter runs the code */
  async function run(): Promise<void> {
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Enter', ctrlKey: true });
    });
  }

  it('renders without crashing', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    // Playground title should be visible in the toolbar
    expect(screen.getByText('Playground')).toBeInTheDocument();
  });

  it('renders the editor pane', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
  });

  it('renders the console output', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    expect(screen.getByText('Console')).toBeInTheDocument();
  });

  it('renders the visualization pane', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    expect(screen.getByTestId('mock-visualization')).toBeInTheDocument();
  });

  it('renders the sandbox iframe', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    expect(screen.getByTestId('mock-sandbox')).toBeInTheDocument();
  });

  it('defaults to javascript language', async () => {
    await act(async () => {
      render(<PlaygroundApp />);
    });
    const editor = screen.getByTestId('mock-editor');
    expect(editor.getAttribute('data-language')).toBe('javascript');
  });

  it('runs instrumented code with Trace on and shows the steps of the trace it gets back', async () => {
    const trace = traceSync('const a = [1];\nconst b = a;');
    mocks.execute.mockResolvedValue({ error: null, trace });
    render(<PlaygroundApp />);
    await run();

    const [code, options] = mocks.execute.mock.calls[0];
    expect(code).toContain('__t.step(');
    expect(options.traceLimits.maxSteps).toBe(2000);
    expect(screen.getByText(`Step 1 of ${trace.steps.length}`)).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor').getAttribute('data-line')).toBe(
      String(trace.steps[0].line)
    );

    // The arrow keys step through the trace, and the editor line follows
    await act(async () => {
      fireEvent.keyDown(document.body, { key: 'End' });
    });
    expect(
      screen.getByText(`Step ${trace.steps.length} of ${trace.steps.length}`)
    ).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor').getAttribute('data-line')).toBe('2');
  });

  it('keeps the steps of a run that ended in an error', async () => {
    const trace = traceSync('const a = 1;\nnull.x;');
    mocks.execute.mockResolvedValue({ error: 'TypeError', trace });
    render(<PlaygroundApp />);
    await run();
    expect(screen.getByText(`Step 1 of ${trace.steps.length}`)).toBeInTheDocument();
  });

  it('reports a syntax error with its line and runs nothing', async () => {
    render(<PlaygroundApp />);
    fireEvent.click(screen.getByText('break the code'));
    await run();

    expect(mocks.execute).not.toHaveBeenCalled();
    expect(mocks.reportError).toHaveBeenCalledTimes(1);
    const [message, line] = mocks.reportError.mock.calls[0];
    expect(message).toMatch(/^SyntaxError: /);
    expect(line).toBe(2);
  });

  it('says why there are no steps for code the tracer refuses, and does not run it untraced', async () => {
    render(<PlaygroundApp />);
    fireEvent.click(screen.getByText('write untraceable code'));
    await run();

    expect(mocks.execute).not.toHaveBeenCalled();
    const [message, line] = mocks.reportError.mock.calls[0];
    expect(message).toMatch(/^This code cannot be traced: [^()]*declared\. No steps were recorded/);
    expect(line).toBeUndefined();
  });
});
