/**
 * PlaygroundApp — Smoke test.
 *
 * PlaygroundApp orchestrates many child components and hooks. We mock the
 * heavy ones (Monaco, SandboxFrame, Pyodide) and verify high-level
 * rendering, pane layout, and language switching.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// ---- Mocks ----

// Mock Monaco Editor
vi.mock('./components/editor/MonacoEditor', () => ({
  __esModule: true,
  default: ({ language, code }: { language: string; code: string }) => (
    <div data-testid="mock-editor" data-language={language}>
      {code}
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

// Mock VisualizationCanvas (React Flow)
vi.mock('./components/visualizations/VisualizationCanvas', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-visualization" />,
}));

// Mock CSS import
vi.mock('./components/theme/playground-theme.css', () => ({}));

// Mock usePyodide
vi.mock('./hooks/usePyodide', () => ({
  usePyodide: () => ({
    runPython: vi.fn().mockResolvedValue({ error: null, snapshots: [] }),
    runPythonInstrumented: vi.fn().mockResolvedValue({ error: null, snapshots: [] }),
    loadingState: { status: 'idle' },
    isReady: false,
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
    preload: vi.fn(),
    snapshots: [],
    clearSnapshots: vi.fn(),
  }),
}));

// Mock useSandbox
vi.mock('./hooks/useSandbox', () => ({
  useSandbox: () => ({
    sandboxRef: { current: null },
    execute: vi.fn().mockResolvedValue({ error: null, snapshots: [] }),
    terminate: vi.fn(),
    isRunning: false,
    entries: [],
    clearEntries: vi.fn(),
    error: null,
    snapshots: [],
    clearSnapshots: vi.fn(),
  }),
}));

// Mock usePaneLayout
vi.mock('./hooks/usePaneLayout', () => ({
  usePaneLayout: () => ({
    dividers: [0.33, 0.66],
    setDivider: vi.fn(),
    resetDividers: vi.fn(),
  }),
}));

// Mock SettingsPanel to avoid deep dependencies
vi.mock('./components/layout/SettingsPanel', () => ({
  __esModule: true,
  default: () => null,
  loadSettings: () => ({ fontSize: 14, wordWrap: true, tabSize: 2 }),
  saveSettings: vi.fn(),
}));

import PlaygroundApp from './PlaygroundApp';

describe('PlaygroundApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
});
