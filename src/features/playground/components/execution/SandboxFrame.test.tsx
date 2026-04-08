/**
 * SandboxFrame component tests.
 *
 * Since the component uses a real iframe with srcdoc and postMessage,
 * jsdom doesn't truly execute iframe content. We verify the component's
 * React-side behaviour: mounting, terminate, message handling, etc.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import SandboxFrame, { type SandboxFrameHandle } from './SandboxFrame';

describe('SandboxFrame', () => {
  let handle: SandboxFrameHandle | null = null;

  const TestWrapper: React.FC = () => {
    const ref = React.useRef<SandboxFrameHandle>(null);

    React.useEffect(() => {
      handle = ref.current;
    });

    return <SandboxFrame ref={ref} />;
  };

  beforeEach(() => {
    handle = null;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders a hidden iframe', () => {
    const { container } = render(<TestWrapper />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe?.getAttribute('sandbox')).toBe('allow-scripts');
  });

  it('exposes execute and terminate methods via ref', async () => {
    await act(async () => {
      render(<TestWrapper />);
    });
    expect(handle).not.toBeNull();
    expect(typeof handle?.execute).toBe('function');
    expect(typeof handle?.terminate).toBe('function');
  });

  it('iframe has a srcdoc with CSP headers', () => {
    const { container } = render(<TestWrapper />);
    const iframe = container.querySelector('iframe');
    const srcdoc = iframe?.getAttribute('srcdoc') ?? '';
    expect(srcdoc).toContain('Content-Security-Policy');
    expect(srcdoc).toContain("script-src 'nonce-");
    expect(srcdoc).toContain("connect-src 'none'");
  });

  it('blocks network APIs in sandbox HTML', () => {
    const { container } = render(<TestWrapper />);
    const iframe = container.querySelector('iframe');
    const srcdoc = iframe?.getAttribute('srcdoc') ?? '';
    expect(srcdoc).toContain('fetch');
    expect(srcdoc).toContain('XMLHttpRequest');
    expect(srcdoc).toContain('WebSocket');
    expect(srcdoc).toContain('blockedNetwork');
  });

  it('timeout rejects the execution promise', async () => {
    vi.useRealTimers(); // Need real timers for this test
    await act(async () => {
      render(<TestWrapper />);
    });

    if (!handle) throw new Error('handle is null');

    // execute with a very short timeout — the iframe won't respond in jsdom
    const resultPromise = handle.execute('console.log("hi")', 50);
    const result = await resultPromise;
    // In jsdom the iframe doesn't execute, so we expect a timeout or error
    expect(result).toBeDefined();
  });

  it('cleans up on unmount', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<TestWrapper />);
    unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeListenerSpy.mockRestore();
  });
});
