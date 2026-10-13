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
  widenMiddle: vi.fn(),
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
  default: ({ onViewChange }: { onViewChange?: (view: '2d' | '3d') => void }) => (
    <div data-testid="mock-visualization">
      <div data-viz-viewer data-testid="mock-viewer" />
      <button onClick={() => onViewChange?.('3d')}>choose 3D</button>
      <button onClick={() => onViewChange?.('2d')}>choose 2D</button>
    </div>
  ),
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
    widenMiddle: mocks.widenMiddle,
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

  it('runs guarded code with Trace off: counted, on its own lines, with the fixed limit', async () => {
    render(<PlaygroundApp />);
    fireEvent.click(screen.getByLabelText('Trace'));
    await run();

    const [code, options] = mocks.execute.mock.calls[0];
    expect(options.traceLimits).toBeUndefined();
    expect(options.guard.limit).toBe(1_000_000);
    expect(options.guard.message).toMatch(/^Stopped after 1,000,000 loop turns and calls/);
    // No tracer, only the counter, and not one line more than the learner wrote
    expect(code).not.toContain('__t.');
    expect(code).toContain(`function greet(name) {${options.guard.name}();`);
    const source = screen.getByTestId('mock-editor').firstChild?.textContent ?? '';
    expect(code.split('\n')).toHaveLength(source.split('\n').length);
  });

  it('leaves a syntax error to the engine with Trace off: the code runs unguarded', async () => {
    render(<PlaygroundApp />);
    fireEvent.click(screen.getByLabelText('Trace'));
    fireEvent.click(screen.getByText('break the code'));
    await run();

    const [code, options] = mocks.execute.mock.calls[0];
    expect(code).toBe('const a = 1;\nconst = ;');
    expect(options.guard).toBeUndefined();
    expect(mocks.reportError).not.toHaveBeenCalled();
  });

  it('asks for a lens pane wide enough for 3D at the moment the learner chooses 3D', () => {
    render(<PlaygroundApp />);
    const rect = (width: number) => (): DOMRect => ({ width }) as DOMRect;
    // The pane is 690px wide and its border leaves the viewer 688
    screen.getByTestId('lens-pane').getBoundingClientRect = rect(690);
    screen.getByTestId('mock-viewer').getBoundingClientRect = rect(688);

    fireEvent.click(screen.getByText('choose 2D'));
    expect(mocks.widenMiddle).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('choose 3D'));
    // 760 for the viewer, and the 2px the pane puts around it
    expect(mocks.widenMiddle).toHaveBeenCalledTimes(1);
    expect(mocks.widenMiddle).toHaveBeenCalledWith({ pane: 690, needed: 762 });
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
