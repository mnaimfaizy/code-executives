/**
 * MonacoEditor component tests.
 *
 * Monaco's heavy WASM/WebWorker dependencies cannot run in jsdom,
 * so we mock @monaco-editor/react to verify our component's behaviour
 * (language switching, onChange, keyboard shortcuts, loading state).
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the @monaco-editor/react module before importing the component
vi.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({
    value,
    language,
    onChange,
    loading,
    options,
  }: {
    value: string;
    language: string;
    onChange?: (v: string | undefined) => void;
    loading?: React.ReactNode;
    options?: Record<string, unknown>;
    beforeMount?: (m: unknown) => void;
    onMount?: (e: unknown, m: unknown) => void;
  }) => (
    <div data-testid="mock-monaco">
      <textarea
        data-testid="mock-editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-language={language}
        data-options={JSON.stringify(options)}
      />
      {loading && <div data-testid="mock-loading">{loading}</div>}
    </div>
  ),
}));

// Mock useMonaco hook
vi.mock('../../hooks/useMonaco', () => ({
  useMonaco: () => ({
    handleBeforeMount: vi.fn(),
    handleEditorMount: vi.fn(),
    editorRef: { current: null },
  }),
  getEditorOptions: () => ({ theme: 'playground-space' }),
  getMonacoLanguage: (lang: string) =>
    ({ javascript: 'javascript', typescript: 'typescript', python: 'python' })[lang] ?? lang,
}));

import MonacoEditor from './MonacoEditor';

describe('MonacoEditor', () => {
  const defaultProps = {
    code: 'const x = 1;',
    language: 'javascript' as const,
    onChange: vi.fn(),
    onExecute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<MonacoEditor {...defaultProps} />);
    expect(screen.getByTestId('mock-monaco')).toBeInTheDocument();
  });

  it('passes code as value to the editor', () => {
    render(<MonacoEditor {...defaultProps} />);
    const textarea = screen.getByTestId('mock-editor-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('const x = 1;');
  });

  it('renders with correct language', () => {
    render(<MonacoEditor {...defaultProps} language="typescript" />);
    const textarea = screen.getByTestId('mock-editor-textarea');
    expect(textarea.getAttribute('data-language')).toBe('typescript');
  });

  it('renders with python language', () => {
    render(<MonacoEditor {...defaultProps} language="python" />);
    const textarea = screen.getByTestId('mock-editor-textarea');
    expect(textarea.getAttribute('data-language')).toBe('python');
  });

  it('calls onChange when editor content changes', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MonacoEditor {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByTestId('mock-editor-textarea');
    await user.clear(textarea);
    await user.type(textarea, 'let y = 2;');
    expect(onChange).toHaveBeenCalled();
  });

  it('displays a loading indicator', () => {
    render(<MonacoEditor {...defaultProps} />);
    // The loading prop is rendered within the mock
    expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading editor...')).toBeInTheDocument();
  });

  it('has an accessible label', () => {
    render(<MonacoEditor {...defaultProps} />);
    expect(screen.getByLabelText('javascript code editor')).toBeInTheDocument();
  });

  it('applies fontSize option when provided', () => {
    render(<MonacoEditor {...defaultProps} fontSize={18} />);
    const textarea = screen.getByTestId('mock-editor-textarea');
    const opts = JSON.parse(textarea.getAttribute('data-options') ?? '{}');
    expect(opts.fontSize).toBe(18);
  });

  it('applies wordWrap option when provided', () => {
    render(<MonacoEditor {...defaultProps} wordWrap={false} />);
    const textarea = screen.getByTestId('mock-editor-textarea');
    const opts = JSON.parse(textarea.getAttribute('data-options') ?? '{}');
    expect(opts.wordWrap).toBe('off');
  });
});
