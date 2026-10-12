import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { QueueEntry, Snapshot, StackFrame } from '../../../snapshot';
import { vizPalette } from '../../../viz/palette';

const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('../../../hooks/useReducedMotion', () => ({
  useReducedMotion: () => motion.reduced,
  default: () => motion.reduced,
}));

import EventLoopView2D from './EventLoopView2D';
import StackHeapView2D from '../stackheap/StackHeapView2D';
import { REGION_INFO } from './layout';
import type { EventLoopViewProps } from './types';

const entry = (
  id: string,
  label: string,
  source: QueueEntry['source'],
  delay?: number
): QueueEntry => (delay === undefined ? { id, label, source } : { id, label, source, delay });

const frame = (id: string, slots: [string, string][] = []): StackFrame => ({
  id,
  name: `${id}()`,
  slots: slots.map(([name, value]) => ({ name, value })),
});

const many = (n: number, prefix: string, source: QueueEntry['source'], delays = true) =>
  Array.from({ length: n }, (_, i) =>
    entry(`${prefix}${i}`, `${prefix}Callback${i}`, source, delays ? i : undefined)
  );

const BUSY: Snapshot = {
  frames: [
    frame('global', [['n', '1']]),
    frame('main'),
    frame('load', [['id', '42']]),
    frame('parse'),
  ],
  objects: [],
  microtasks: many(6, 'm', 'promise', false),
  tasks: many(4, 't', 'timeout'),
  timers: many(5, 'x', 'interval'),
};

const NOTHING: Snapshot = { frames: [], objects: [], microtasks: [], tasks: [], timers: [] };

const draw = (snapshot: Snapshot, props: Partial<EventLoopViewProps> = {}) =>
  render(<EventLoopView2D snapshot={snapshot} focus={[]} label="test" {...props} />);

const svgOf = (container: HTMLElement) => container.querySelector('svg')!;
const num = (el: Element, attr: string) => Number(el.getAttribute(attr));
const viewBox = (svg: SVGSVGElement) => svg.getAttribute('viewBox')!.split(' ').map(Number);
const card = (root: ParentNode, id: string) => root.querySelector(`[data-viz-entry="${id}"]`)!;
const shape = (root: ParentNode, id: string) => card(root, id).querySelector('rect')!;
const at = (el: Element) => {
  const [, x, y] = /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(
    (el as SVGGElement).style.transform
  )!;
  return { x: Number(x), y: Number(y) };
};

describe('EventLoopView2D', () => {
  beforeEach(() => {
    motion.reduced = false;
  });

  it('draws the four regions left to right, numbered in the order the loop takes work', () => {
    const svg = svgOf(draw(BUSY, { label: 'A busy loop' }).container);
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('A busy loop');

    const regions = [...svg.querySelectorAll('[data-viz-region]')];
    expect(regions.map((g) => g.getAttribute('data-viz-region'))).toEqual([
      'stack',
      'microtasks',
      'tasks',
      'timers',
    ]);
    const lefts = regions.map((g) => num(g.querySelector('rect')!, 'x'));
    expect([...lefts].sort((a, b) => a - b)).toEqual(lefts);

    expect(regions.map((g) => g.querySelector('circle + text')?.textContent ?? null)).toEqual([
      '1',
      '2',
      '3',
      null,
    ]);
    for (const g of regions) {
      const info = REGION_INFO[g.getAttribute('data-viz-region') as keyof typeof REGION_INFO];
      expect(g.textContent).toContain(info.caption);
      expect(g.textContent).toContain(info.note);
    }
  });

  it('draws one labelled card per entry with its label, source and delay', () => {
    const { container } = draw(BUSY);
    expect(container.querySelectorAll('[data-viz-entry]')).toHaveLength(15);
    expect(container.querySelectorAll('[data-viz-label]')).toHaveLength(15 + 4);

    expect(card(container, 'm0').textContent).toContain('mCallback0');
    expect(card(container, 'm0').textContent).toContain('promise');
    expect(card(container, 'm0').getAttribute('data-viz-entity')).toBe('microtask');
    expect(card(container, 't1').textContent).toContain('timeout · 1 ms');
    expect(card(container, 't1').getAttribute('data-viz-entity')).toBe('task');
    expect(card(container, 'x2').textContent).toContain('interval · 2 ms');
    expect(card(container, 'x2').getAttribute('data-viz-entity')).toBe('timer');

    const { microtask, task, timer } = vizPalette.light;
    expect(shape(container, 'm0').getAttribute('fill')).toBe(microtask.fill);
    expect(shape(container, 't1').getAttribute('fill')).toBe(task.fill);
    expect(shape(container, 'x2').getAttribute('fill')).toBe(timer.fill);
    // A timer cannot run yet, and says so without colour: its outline is dashed.
    expect(shape(container, 'x2').getAttribute('stroke-dasharray')).toBeTruthy();
    expect(shape(container, 't1').getAttribute('stroke-dasharray')).toBeNull();
  });

  it('marks the head of each queue, and only the head', () => {
    const { container } = draw(BUSY);
    const heads = [...container.querySelectorAll('[data-viz-head]')];
    expect(heads.map((g) => g.getAttribute('data-viz-entry'))).toEqual(['m0', 't0']);
    for (const head of heads) expect(head.textContent).toContain('NEXT');
    expect(card(container, 'm1').textContent).not.toContain('NEXT');
    expect(card(container, 'x0').textContent).not.toContain('NEXT');
    // The head stands at the top of its column, with a heavier outline than the rest.
    expect(at(card(container, 'm0')).y).toBeLessThan(at(card(container, 'm1')).y);
    expect(num(shape(container, 'm0'), 'stroke-width')).toBeGreaterThan(
      num(shape(container, 'm1'), 'stroke-width')
    );
  });

  it('keeps every card inside its region and apart from the others, at 6, 4 and 5 entries', () => {
    const svg = svgOf(draw(BUSY, { more: { microtasks: 2 } }).container);
    const [, , width, height] = viewBox(svg);
    const boxes = [...svg.querySelectorAll('[data-viz-entry]')].map((g) => {
      const rect = g.querySelector('rect')!;
      const { x, y } = at(g);
      const region = svg
        .querySelector(`[data-viz-region="${g.getAttribute('data-viz-in')}"]`)!
        .querySelector('rect')!;
      return { x, y, right: x + num(rect, 'width'), bottom: y + num(rect, 'height'), region };
    });
    for (const b of boxes) {
      expect(b.x).toBeGreaterThan(num(b.region, 'x'));
      expect(b.right).toBeLessThan(num(b.region, 'x') + num(b.region, 'width'));
      // Under the caption (baseline 42) and the note (baseline 58), above the region's edge.
      expect(b.y).toBeGreaterThan(64);
      expect(b.bottom).toBeLessThan(num(b.region, 'y') + num(b.region, 'height'));
    }
    boxes.forEach((a, i) => {
      for (const b of boxes.slice(i + 1)) {
        const overlap = a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom;
        expect(overlap).toBe(false);
      }
    });
    const panels = svg.querySelectorAll(
      '[data-viz-region] > rect, [data-viz-entity="frame"] > rect'
    );
    for (const r of panels) {
      expect(num(r, 'x')).toBeGreaterThanOrEqual(0);
      expect(num(r, 'y')).toBeGreaterThanOrEqual(0);
      expect(num(r, 'x') + num(r, 'width')).toBeLessThanOrEqual(width);
      expect(num(r, 'y') + num(r, 'height')).toBeLessThanOrEqual(height);
    }
    // Frames stay under the stack's caption and note.
    for (const r of svg.querySelectorAll('[data-viz-entity="frame"] > rect')) {
      expect(num(r, 'y')).toBeGreaterThanOrEqual(70);
    }
    const more = svg.querySelector('[data-viz-more="microtasks"]')!;
    expect(more.textContent).toBe('+2 more');
    expect(num(more, 'y')).toBeGreaterThan(Math.max(...boxes.map((b) => b.bottom)));
    expect(num(more, 'y')).toBeLessThan(height - 16);
  });

  it('says a region is empty, the stack included', () => {
    const { container } = draw(NOTHING);
    for (const g of container.querySelectorAll('[data-viz-region]')) {
      expect(g.textContent, g.getAttribute('data-viz-region')!).toContain('empty');
    }
    expect(container.querySelectorAll('[data-viz-label]')).toHaveLength(0);
  });

  it('keeps an entry the same element when it moves region, and moves it', () => {
    const timer = entry('x1', 'tick', 'timeout', 100);
    const waiting: Snapshot = { ...NOTHING, timers: [timer] };
    const fired: Snapshot = { ...NOTHING, tasks: [timer] };

    const { container, rerender } = draw(waiting);
    const before = card(container, 'x1');
    const from = at(before);
    expect(before.getAttribute('data-viz-in')).toBe('timers');
    expect(before.getAttribute('class')).toContain('el-move');

    rerender(<EventLoopView2D snapshot={fired} focus={['x1']} label="test" />);
    const after = card(container, 'x1');
    expect(after).toBe(before);
    expect(after.getAttribute('data-viz-in')).toBe('tasks');
    expect(at(after).x).toBeLessThan(from.x);
    expect(at(after).y).toBe(from.y);
    expect(after.querySelector('rect')!.getAttribute('fill')).toBe(vizPalette.light.task.fill);
    expect(after.textContent).toContain('NEXT');
  });

  it('never reorders the cards in the document, so a move is not cut short', () => {
    const a = entry('a', 'a', 'promise');
    const b = entry('b', 'b', 'promise');
    const { container, rerender } = draw({ ...NOTHING, microtasks: [b, a] });
    const order = () =>
      [...container.querySelectorAll('[data-viz-entry]')].map((g) =>
        g.getAttribute('data-viz-entry')
      );
    const first = order();
    rerender(
      <EventLoopView2D snapshot={{ ...NOTHING, microtasks: [a, b] }} focus={[]} label="t" />
    );
    expect(order()).toEqual(first);
    expect(at(card(container, 'a')).y).toBeLessThan(at(card(container, 'b')).y);
  });

  it('does not animate under reduced motion', () => {
    motion.reduced = true;
    const { container } = draw(BUSY);
    expect(container.querySelector('.el-move')).toBeNull();
    expect(container.querySelector('.el-enter')).toBeNull();
    expect(container.querySelector('style')!.textContent).toContain('prefers-reduced-motion');
  });

  it('spotlights focused entries, frames and slots in the focus colour', () => {
    const { container } = draw(BUSY, { focus: ['m2', 'x0', 'load', 'global.n'] });
    const { focus, root, microtask, text } = vizPalette.light;
    expect(shape(container, 'm2').getAttribute('stroke')).toBe(focus);
    expect(shape(container, 'x0').getAttribute('stroke')).toBe(focus);
    expect(shape(container, 'm3').getAttribute('stroke')).toBe(microtask.stroke);
    const frames = [...container.querySelectorAll('[data-viz-entity="frame"]')];
    const load = frames.find((g) => g.textContent?.includes('load()'))!;
    expect(load.querySelector('rect')!.getAttribute('stroke')).toBe(root);
    const slot = [...container.querySelectorAll('text')].find((t) => t.textContent === 'n = 1')!;
    expect(slot.getAttribute('fill')).toBe(text.onFocus);
  });

  it('tags the frame that is running an entry taken from a queue', () => {
    const running = { entry: entry('m9', 'then callback', 'promise'), from: 'microtasks' as const };
    const tagged = (container: HTMLElement) =>
      container.querySelector('[data-viz-running]')?.closest('[data-viz-entity="frame"]');

    // Without a frame id it is the top frame.
    const top = draw(BUSY, { running }).container;
    expect(tagged(top)!.textContent).toContain('parse()');
    expect(tagged(top)!.textContent).toContain('MICROTASK');

    const named = draw(BUSY, { running: { ...running, from: 'tasks', frameId: 'load' } }).container;
    expect(tagged(named)!.textContent).toContain('load()');
    expect(tagged(named)!.textContent).toContain('TASK');

    // A frame that is not drawn gets no tag, and nothing else takes it.
    const gone = draw(BUSY, { running: { ...running, frameId: 'folded' } }).container;
    expect(gone.querySelector('[data-viz-running]')).toBeNull();
    expect(draw(BUSY).container.querySelector('[data-viz-running]')).toBeNull();
  });

  it('outlines the regions a beat is about, and none when it is not told any', () => {
    const outlined = (container: HTMLElement) =>
      [...container.querySelectorAll('[data-viz-emphasis]')].map((r) =>
        r.closest('[data-viz-region]')!.getAttribute('data-viz-region')
      );
    expect(outlined(draw(BUSY).container)).toEqual([]);
    expect(outlined(draw(BUSY, { emphasis: [] }).container)).toEqual([]);

    const { container } = draw(BUSY, { emphasis: ['tasks', 'stack'] });
    expect(outlined(container)).toEqual(['stack', 'tasks']);
    // The outline lies exactly on the region's own panel and hides nothing.
    for (const outline of container.querySelectorAll('[data-viz-emphasis]')) {
      const panel = outline.closest('[data-viz-region]')!.querySelector('rect')!;
      for (const attr of ['x', 'y', 'width', 'height']) {
        expect(outline.getAttribute(attr)).toBe(panel.getAttribute(attr));
      }
      expect(outline.getAttribute('fill')).toBe('none');
      expect(outline.getAttribute('stroke')).toBe(vizPalette.light.region.label);
    }
  });

  it('keeps the same canvas for every snapshot of a run when given its extent', () => {
    const extent = { frames: 4, slotRows: 6, microtasks: 6, tasks: 4, timers: 5 };
    const quiet: Snapshot = { ...NOTHING, frames: [frame('global')] };
    const a = svgOf(draw(quiet, { extent }).container).getAttribute('viewBox');
    const b = svgOf(draw(BUSY, { extent }).container).getAttribute('viewBox');
    expect(a).toBe(b);
    // The first card stands in the same place whatever else the snapshot holds.
    const lone = draw({ ...quiet, microtasks: [entry('m0', 'only', 'promise')] }, { extent });
    expect(at(card(lone.container, 'm0'))).toEqual(
      at(card(draw(BUSY, { extent }).container, 'm0'))
    );
  });

  it('draws the stack alone for a snapshot that records no queues', () => {
    const svg = svgOf(draw({ frames: [frame('global'), frame('main')], objects: [] }).container);
    expect([...svg.querySelectorAll('[data-viz-region]')]).toHaveLength(1);
    expect(svg.querySelectorAll('[data-viz-entity="frame"]')).toHaveLength(2);
    expect(svg.querySelector('circle')).toBeNull();
    expect(viewBox(svg)[2]).toBeLessThan(300);
  });

  it('draws a frame exactly as the stack-and-heap view draws it', () => {
    const frames = [
      frame('global', [['n', '1']]),
      frame('main', [
        ['a', '2'],
        ['b', '3'],
      ]),
    ];
    const mine = svgOf(draw({ frames, objects: [] }, { focus: ['main.a'] }).container);
    const theirs = render(
      <StackHeapView2D snapshot={{ frames, objects: [] }} focus={['main.a']} label="t" />
    ).container.querySelector('svg')!;
    // Only the height of the drawing differs, so only where a frame stands in it.
    const strip = (g: Element) => g.outerHTML.replace(/ y="[\d.]+"/g, '');
    const a = [...mine.querySelectorAll('[data-viz-entity="frame"]')].map(strip);
    const b = [...theirs.querySelectorAll('[data-viz-entity="frame"]')].map(strip);
    expect(a).toHaveLength(2);
    expect(a).toEqual(b);
  });

  it('takes every colour from the dark palette when the theme is dark', () => {
    const dark = vizPalette.dark;
    const svg = svgOf(
      draw(BUSY, {
        theme: 'dark',
        focus: ['m1'],
        more: { timers: 3 },
        running: { entry: entry('m9', 'x', 'await'), from: 'microtasks' },
      }).container
    );
    expect(shape(svg, 't0').getAttribute('stroke')).toBe(dark.task.stroke);

    const darkValues = new Set(JSON.stringify(dark).match(/#[0-9a-f]{6}/g));
    for (const el of svg.querySelectorAll('text, tspan, rect, path, circle')) {
      for (const attr of ['fill', 'stroke']) {
        const value = el.getAttribute(attr);
        if (value && value !== 'none') expect(darkValues.has(value), value).toBe(true);
      }
    }
    for (const text of svg.querySelectorAll('text')) {
      expect(text.getAttribute('fill')).toBeTruthy();
      expect(num(text, 'font-size'), text.textContent!).toBeGreaterThanOrEqual(11);
    }
  });

  it('shows the labels a trace gives most often whole', () => {
    const snapshot = {
      ...NOTHING,
      tasks: [entry('t1', 'setTimeout callback', 'timeout', 0)],
      timers: [entry('x1', 'setInterval callback', 'interval', 1000)],
    };
    const { container } = draw(snapshot);
    expect(card(container, 't1').querySelector('text')!.textContent).toBe('setTimeout callback');
    expect(card(container, 'x1').querySelector('text')!.textContent).toBe('setInterval callback');
    expect(card(container, 'x1').textContent).toContain('interval · 1000 ms');
  });

  it('cuts a long label to its card and keeps the whole of it in the title', () => {
    const long = entry('m1', 'resume handleIncomingWebSocketMessage', 'await');
    const { container } = draw({ ...NOTHING, microtasks: [long] });
    const texts = [...card(container, 'm1').querySelectorAll('text')].map((t) => t.textContent!);
    expect(texts[0].length).toBe(20);
    expect(texts[0].endsWith('…')).toBe(true);
    expect(card(container, 'm1').querySelector('title')!.textContent).toBe(
      'resume handleIncomingWebSocketMessage (await)'
    );
  });
});
