import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsoleOutput from './ConsoleOutput';
import type { ConsoleEntry } from '../../types';

function makeEntry(type: ConsoleEntry['type'], args: string[], id?: string): ConsoleEntry {
  return {
    id: id ?? `entry-${Math.random()}`,
    type,
    args,
    timestamp: Date.now(),
  };
}

describe('ConsoleOutput', () => {
  const onClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders empty state when no entries', () => {
    render(<ConsoleOutput entries={[]} onClear={onClear} />);
    expect(screen.getByText(/Run code to see what it prints/)).toBeInTheDocument();
  });

  it('renders log entries', () => {
    const entries = [makeEntry('log', ['Hello world'], 'e1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders warn entries with prefix', () => {
    const entries = [makeEntry('warn', ['Warning message'], 'w1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('Warning message')).toBeInTheDocument();
    // Warn prefix exists
    expect(screen.getByText('⚠')).toBeInTheDocument();
  });

  it('renders error entries with prefix', () => {
    const entries = [makeEntry('error', ['Error occurred'], 'err1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('✖')).toBeInTheDocument();
  });

  it('renders info entries with prefix', () => {
    const entries = [makeEntry('info', ['Info message'], 'i1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('Info message')).toBeInTheDocument();
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  it('renders multiple entries', () => {
    const entries = [
      makeEntry('log', ['First'], 'e1'),
      makeEntry('warn', ['Second'], 'e2'),
      makeEntry('error', ['Third'], 'e3'),
    ];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', async () => {
    const user = userEvent.setup();
    const entries = [makeEntry('log', ['Hello'], 'e1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);

    const clearButton = screen.getByLabelText('Clear console');
    await user.click(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('has an ARIA live region for accessibility', () => {
    render(<ConsoleOutput entries={[]} onClear={onClear} />);
    const logRegion = screen.getByRole('log');
    expect(logRegion).toBeInTheDocument();
    expect(logRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('displays "Console" header text', () => {
    render(<ConsoleOutput entries={[]} onClear={onClear} />);
    expect(screen.getByText('Console')).toBeInTheDocument();
  });

  it('joins multiple args with spaces', () => {
    const entries = [makeEntry('log', ['Hello', 'World', '123'], 'e1')];
    render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(screen.getByText('Hello World 123')).toBeInTheDocument();
  });

  it('shows text as written, without escaping it twice', () => {
    const text = `"Hello, World!" <script>alert("xss")</script> a & b it's`;
    const entries = [makeEntry('log', [text], 'e1')];
    const { container } = render(<ConsoleOutput entries={entries} onClear={onClear} />);
    const pre = container.querySelector('pre');
    expect(pre?.textContent).toBe(text);
    expect(pre?.textContent).not.toMatch(/&quot;|&lt;|&amp;|&#x27;/);
  });

  it('renders markup in console text as text, never as elements', () => {
    const entries = [makeEntry('error', ['<script>alert(1)</script><img src=x>'], 'e1')];
    const { container } = render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('appends the source line of an entry that has one', () => {
    const entries: ConsoleEntry[] = [
      { ...makeEntry('error', ['x is not defined'], 'e1'), line: 7 },
    ];
    const { container } = render(<ConsoleOutput entries={entries} onClear={onClear} />);
    expect(container.querySelector('pre')?.textContent).toBe('x is not defined (line 7)');
  });
});
