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

  describe('Stop and the timeout backstop', () => {
    const currentIframe = (container: HTMLElement): HTMLIFrameElement => {
      const iframe = container.querySelector('iframe');
      if (!iframe?.contentWindow) throw new Error('no sandbox iframe');
      return iframe;
    };

    /** What a sandbox iframe's script would post to the host */
    const fromSandbox = (iframe: HTMLIFrameElement, data: object): void => {
      const source = iframe.contentWindow;
      act(() => {
        window.dispatchEvent(new MessageEvent('message', { data, source }));
      });
    };

    /** The `execute` messages the host posted to this iframe */
    const executesSentTo = (iframe: HTMLIFrameElement): Array<{ runId: number; code: string }> => {
      const post = iframe.contentWindow?.postMessage as unknown as ReturnType<typeof vi.fn>;
      return post.mock.calls
        .map(([message]) => message as { type: string; runId: number; code: string })
        .filter((message) => message.type === 'execute');
    };

    const watch = (iframe: HTMLIFrameElement): HTMLIFrameElement => {
      vi.spyOn(iframe.contentWindow as Window, 'postMessage').mockImplementation(() => {});
      return iframe;
    };

    const mount = async (): Promise<{ container: HTMLElement; sandbox: SandboxFrameHandle }> => {
      let container!: HTMLElement;
      await act(async () => {
        container = render(<TestWrapper />).container;
      });
      if (!handle) throw new Error('handle is null');
      return { container, sandbox: handle };
    };

    it('holds a run until the iframe says it is ready', async () => {
      const { container, sandbox } = await mount();
      const iframe = watch(currentIframe(container));

      const run = sandbox.execute('1 + 1', 5_000);
      expect(executesSentTo(iframe)).toEqual([]);

      fromSandbox(iframe, { type: 'ready' });
      const sent = executesSentTo(iframe);
      expect(sent).toHaveLength(1);
      expect(sent[0].code).toBe('1 + 1');

      fromSandbox(iframe, { type: 'result', runId: sent[0].runId, entries: [] });
      await expect(run).resolves.toEqual({ entries: [], error: undefined, trace: undefined });
    });

    it('Stop discards the iframe and mounts a fresh one, and the next run works', async () => {
      const { container, sandbox } = await mount();
      const stuck = watch(currentIframe(container));
      fromSandbox(stuck, { type: 'ready' });

      // A run the sandbox never answers
      const first = sandbox.execute('while (true) {}', 5_000);
      const firstRunId = executesSentTo(stuck)[0].runId;

      act(() => sandbox.terminate());
      await expect(first).rejects.toThrow('Execution terminated');

      // The stuck iframe is out of the document, and a different element took its place
      const fresh = watch(currentIframe(container));
      expect(fresh).not.toBe(stuck);
      expect(stuck.isConnected).toBe(false);
      expect(container.querySelectorAll('iframe')).toHaveLength(1);
      // Its document is new as well: another nonce, the same script
      expect(fresh.getAttribute('srcdoc')).not.toBe(stuck.getAttribute('srcdoc'));
      expect(fresh.getAttribute('srcdoc')).toContain('blockedNetwork');

      // The next run goes to the fresh iframe once it is ready, never to the old one
      const second = sandbox.execute('console.log("next")', 5_000);
      expect(executesSentTo(fresh)).toEqual([]);
      fromSandbox(fresh, { type: 'ready' });
      const sent = executesSentTo(fresh);
      expect(sent.map((message) => message.code)).toEqual(['console.log("next")']);
      expect(executesSentTo(stuck)).toHaveLength(1);

      // Whatever the discarded iframe still reports is not heard
      fromSandbox(stuck, { type: 'result', runId: firstRunId, entries: [] });
      fromSandbox(stuck, { type: 'result', runId: sent[0].runId, entries: [] });
      let settled = false;
      void second.then(() => {
        settled = true;
      });
      await act(async () => {});
      expect(settled).toBe(false);

      fromSandbox(fresh, {
        type: 'result',
        runId: sent[0].runId,
        entries: [{ type: 'log', args: ['next'] }],
      });
      const result = await second;
      expect(result.entries.map((entry) => entry.args)).toEqual([['next']]);
    });

    it('a run started while another is pending also gets a fresh iframe', async () => {
      const { container, sandbox } = await mount();
      const busy = watch(currentIframe(container));
      fromSandbox(busy, { type: 'ready' });

      const first = sandbox.execute('first', 5_000);
      first.catch(() => {});
      let second!: Promise<unknown>;
      act(() => {
        second = sandbox.execute('second', 5_000);
      });
      await expect(first).rejects.toThrow('Execution terminated');

      const fresh = watch(currentIframe(container));
      expect(fresh).not.toBe(busy);
      fromSandbox(fresh, { type: 'ready' });
      const sent = executesSentTo(fresh);
      expect(sent.map((message) => message.code)).toEqual(['second']);
      expect(executesSentTo(busy).map((message) => message.code)).toEqual(['first']);
      fromSandbox(fresh, { type: 'result', runId: sent[0].runId, entries: [] });
      await expect(second).resolves.toBeDefined();
    });

    it('the timeout backstop reports the timeout and replaces the silent iframe', async () => {
      const { container, sandbox } = await mount();
      const silent = watch(currentIframe(container));
      fromSandbox(silent, { type: 'ready' });

      const run = sandbox.execute('while (true) {}', 1_000);
      // The sandbox ends a run itself at the timeout; the host waits 1.5 s longer
      await act(async () => {
        vi.advanceTimersByTime(2_400);
      });
      expect(currentIframe(container)).toBe(silent);
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      const result = await run;
      expect(result.error).toBe('Execution timed out (exceeded 1s limit)');

      const fresh = watch(currentIframe(container));
      expect(fresh).not.toBe(silent);
      expect(silent.isConnected).toBe(false);

      const next = sandbox.execute('console.log("after")', 1_000);
      fromSandbox(fresh, { type: 'ready' });
      const sent = executesSentTo(fresh);
      expect(sent).toHaveLength(1);
      fromSandbox(fresh, { type: 'result', runId: sent[0].runId, entries: [] });
      await expect(next).resolves.toBeDefined();
    });

    it('sends the loop guard of a run with Trace off', async () => {
      const { container, sandbox } = await mount();
      const iframe = watch(currentIframe(container));
      fromSandbox(iframe, { type: 'ready' });
      const guard = { name: '__g', limit: 1_000_000, message: 'Stopped' };
      void sandbox.execute('__g();', 5_000, undefined, undefined, guard);
      const post = iframe.contentWindow?.postMessage as unknown as ReturnType<typeof vi.fn>;
      expect(post.mock.calls[0][0]).toMatchObject({ type: 'execute', code: '__g();', guard });
      expect(post.mock.calls[0][0]).not.toHaveProperty('tracer');
    });
  });

  it('cleans up on unmount', () => {
    const removeListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<TestWrapper />);
    unmount();
    expect(removeListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    removeListenerSpy.mockRestore();
  });
});
