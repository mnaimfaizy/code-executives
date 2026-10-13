import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EventLoopView3D from './EventLoopView3D';
import type { Snapshot } from '../../snapshot';
import type { CameraState } from '../../components/viz/viewerCamera';

/*
 * The real Canvas, the real drei `Html` and the real three renderer, over a WebGL context that
 * does nothing. jsdom has no WebGL and no layout, so the test supplies the three things the
 * Canvas waits for: a context, a measured size and a ResizeObserver that reports it.
 */

/** A WebGL2 context that accepts every call: constants are numbers, calls return a default. */
function fakeContext(canvas: HTMLCanvasElement): unknown {
  const constants = new Map<string, number>();
  const names = new Map<number, string>();
  const constant = (name: string) => {
    if (!constants.has(name)) {
      constants.set(name, 1000 + constants.size);
      names.set(constants.get(name)!, name);
    }
    return constants.get(name)!;
  };
  const calls: Record<string, (...args: number[]) => unknown> = {
    getParameter: (p) => {
      const name = names.get(p);
      if (name === 'VERSION') return 'WebGL 2.0';
      if (name === 'SHADING_LANGUAGE_VERSION') return 'WebGL GLSL ES 3.00';
      if (name === 'SCISSOR_BOX' || name === 'VIEWPORT') return [0, 0, 800, 500];
      return 16;
    },
    getContextAttributes: () => ({ alpha: true, antialias: true }),
    getShaderPrecisionFormat: () => ({ precision: 23, rangeMin: 127, rangeMax: 127 }),
    getExtension: () => null,
    getSupportedExtensions: () => [],
  };
  return new Proxy(
    { canvas, drawingBufferWidth: 800, drawingBufferHeight: 500 },
    {
      get(target, prop: string) {
        if (prop in target) return target[prop as keyof typeof target];
        if (/^[A-Z][A-Z0-9_]*$/.test(prop)) return constant(prop);
        return calls[prop] ?? (() => (prop.startsWith('create') ? {} : undefined));
      },
    }
  );
}

const CAMERA: CameraState = { preset: 'iso', hold: false, pan: false, command: null };

const SNAPSHOT: Snapshot = {
  frames: [{ id: 'main', name: 'main()', slots: [] }],
  objects: [],
  microtasks: [{ id: 'onResolved', label: 'onResolved', source: 'promise' }],
  tasks: [],
  timers: [],
};

const REGIONS = ['stack', 'microtasks', 'tasks', 'timers'];
const UNMOUNT_WHILE_RENDERING = /synchronously unmount a root/;

describe('EventLoopView3D', () => {
  let errors: MockInstance<typeof console.error>;

  beforeEach(() => {
    errors = vi.spyOn(console, 'error');
    // three says here that the fake context lacks an extension, and that its Clock is deprecated.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
      this: HTMLCanvasElement
    ) {
      return fakeContext(this) as RenderingContext;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 800,
      bottom: 500,
      width: 800,
      height: 500,
      toJSON: () => ({}),
    });
    vi.stubGlobal(
      'ResizeObserver',
      class {
        private readonly report: () => void;
        constructor(report: () => void) {
          this.report = report;
        }
        observe() {
          this.report();
        }
        unobserve() {}
        disconnect() {}
      }
    );
    // No frames: the scene's DOM is what is under test, and a frame would draw with the fake.
    vi.stubGlobal('requestAnimationFrame', () => 0);
    vi.stubGlobal('cancelAnimationFrame', () => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const view = (snapshot: Snapshot) => (
    <EventLoopView3D
      snapshot={snapshot}
      focus={[]}
      label="3D view of the event loop"
      camera={CAMERA}
      instant
    />
  );
  const unmountErrors = () =>
    errors.mock.calls.filter(([message]) => UNMOUNT_WHILE_RENDERING.test(String(message)));
  /** Long enough for an unmount React had to put off to run, and empty a label again. */
  const settle = () => new Promise((resolve) => setTimeout(resolve, 100));

  /*
   * The bug this pins: the scene's first caption, "CALL STACK", was mounted and then left
   * empty for good, because drei moved every label to the event target during the commit that
   * mounted the scene. With no `portal` on the captions this test fails on that caption, and
   * re-rendering the caption does not fill it again.
   */
  it('shows every region caption on first load, and never moves a label', async () => {
    const { container } = render(view(SNAPSHOT));
    const caption = (region: string) =>
      container.querySelector(`[data-viz-region="${region}"]`)?.textContent ?? '';

    await waitFor(() => expect(caption('timers')).toContain('TIMERS'));
    await settle();

    expect(REGIONS.map(caption)).toEqual([
      expect.stringContaining('CALL STACK'),
      expect.stringContaining('MICROTASK QUEUE'),
      expect.stringContaining('TASK QUEUE'),
      expect.stringContaining('TIMERS'),
    ]);
    expect(container.querySelector('[data-viz-entry="onResolved"]')).toHaveTextContent(
      'onResolved'
    );
    // Every label hangs from the Canvas's outer element: where LabelFramer looks for them.
    const host = screen.getByRole('img', { name: '3D view of the event loop' });
    const labels = container.querySelectorAll('[data-viz-region], [data-viz-label]');
    expect(labels.length).toBeGreaterThanOrEqual(6);
    for (const label of labels) {
      expect(label.closest('[style*="translate3d"]')?.parentElement).toBe(host);
    }
    expect(unmountErrors()).toEqual([]);
  });

  it('draws the next snapshot without unmounting a label while React renders', async () => {
    const { container, rerender } = render(view(SNAPSHOT));
    await waitFor(() =>
      expect(container.querySelector('[data-viz-entry="onResolved"]')).toBeInTheDocument()
    );

    rerender(
      view({ ...SNAPSHOT, tasks: [{ id: 'onTimeout', label: 'onTimeout', source: 'timeout' }] })
    );
    await waitFor(() =>
      expect(container.querySelector('[data-viz-entry="onTimeout"]')).toHaveTextContent('onTimeout')
    );
    await settle();

    expect(container.querySelector('[data-viz-region="stack"]')).toHaveTextContent('CALL STACK');
    expect(unmountErrors()).toEqual([]);
  });
});
