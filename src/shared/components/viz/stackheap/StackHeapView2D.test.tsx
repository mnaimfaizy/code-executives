import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import StackHeapView2D from './StackHeapView2D';
import type { PlacedSnapshot } from './types';
import type { HeapObject, Placed, Slot, StackFrame } from '../../../snapshot';
import { vizPalette } from '../../../viz/palette';
import { STORY_BEATS } from '../../../../features/javascript/utils/stackHeapStory';
import {
  STORY_BEATS as GC_BEATS,
  withState,
} from '../../../../features/javascript/utils/garbageCollectionStory';

const frame = (id: string, slots: Slot[] = []): StackFrame => ({ id, name: `${id}()`, slots });

const object = (
  id: string,
  col: number,
  row: number,
  slots: Slot[] = [],
  extra: Partial<HeapObject> = {}
): Placed<HeapObject> => ({
  id,
  label: id,
  kind: 'object',
  slots,
  state: 'live',
  cell: { col, row },
  ...extra,
});

const draw = (
  snapshot: PlacedSnapshot,
  props: Partial<React.ComponentProps<typeof StackHeapView2D>> = {}
) => {
  const { container } = render(
    <StackHeapView2D snapshot={snapshot} focus={[]} label="test" {...props} />
  );
  return container.querySelector('svg')!;
};

const num = (el: Element, attr: string) => Number(el.getAttribute(attr));
const viewBox = (svg: SVGSVGElement) => svg.getAttribute('viewBox')!.split(' ').map(Number);
const entity = (svg: SVGSVGElement, text: string) =>
  [...svg.querySelectorAll('[data-viz-label]')].find((g) => g.textContent?.includes(text))!;
const refPath = (svg: SVGSVGElement, id: string) => svg.querySelector(`[data-viz-ref="${id}"]`);

/** A closure: `counter` keeps `makeCounter`'s scope, whose outer scope is the live global frame. */
const closure: PlacedSnapshot = {
  frames: [frame('global', [{ name: 'counter', refId: 'fn' }])],
  objects: [
    object('fn', 0, 0, [{ name: '[[scope]]', refId: 'scope' }], {
      kind: 'function',
      label: 'ƒ increment',
    }),
    object(
      'scope',
      1,
      0,
      [
        { name: 'count', value: '0' },
        { name: '[[outer]]', refId: 'global' },
      ],
      { kind: 'scope', label: 'makeCounter()' }
    ),
  ],
};

describe('StackHeapView2D', () => {
  it('draws a story beat on the 800×480 canvas with one group per entity', () => {
    const beat = STORY_BEATS[STORY_BEATS.length - 1];
    const svg = draw(beat, { focus: beat.focus, gcPhase: beat.gcPhase, label: beat.title });
    expect(svg.getAttribute('viewBox')).toBe('0 0 800 480');
    expect(svg.getAttribute('aria-label')).toBe(beat.title);
    expect(svg.querySelectorAll('[data-viz-label]')).toHaveLength(
      beat.frames.length + beat.objects.length
    );
  });

  it('keeps 800×480 for every beat of the story', () => {
    for (const beat of STORY_BEATS) {
      const svg = draw(beat, { focus: beat.focus, gcPhase: beat.gcPhase });
      expect(svg.getAttribute('viewBox'), beat.id).toBe('0 0 800 480');
    }
  });

  it('draws a function, its retained scope, and the reference back to a frame', () => {
    const svg = draw(closure);
    const light = vizPalette.light;

    const fn = entity(svg, 'ƒ increment');
    expect(fn.getAttribute('data-viz-entity')).toBe('function');
    expect(fn.querySelector('rect')!.getAttribute('fill')).toBe(light.function.fill);
    expect(fn.textContent).toContain('[[scope]]: ●→');

    const scope = entity(svg, 'makeCounter()');
    const scopeRect = scope.querySelector('rect')!;
    expect(scopeRect.getAttribute('fill')).toBe(light.scope.fill);
    expect(scopeRect.getAttribute('stroke-dasharray')).toBeTruthy();
    expect(scope.textContent).toContain('count = 0');

    // The arrow from the scope's [[outer]] ends on the right edge of the global frame.
    const frameRect = entity(svg, 'global()').querySelector('rect')!;
    const end = refPath(svg, 'scope.[[outer]]')!.getAttribute('d')!.split(', ').pop()!.split(' ');
    expect(Number(end[0])).toBe(num(frameRect, 'x') + num(frameRect, 'width'));
    expect(Number(end[1])).toBeGreaterThan(num(frameRect, 'y'));
    expect(Number(end[1])).toBeLessThan(num(frameRect, 'y') + num(frameRect, 'height'));

    expect(refPath(svg, 'global.counter')).not.toBeNull();
    expect(refPath(svg, 'fn.[[scope]]')).not.toBeNull();
  });

  it('draws no arrow for a refId that matches nothing', () => {
    const svg = draw({
      frames: [
        frame('main', [
          { name: 'ghost', refId: 'nowhere' },
          { name: 'a', refId: 'a' },
        ]),
      ],
      objects: [object('a', 0, 0, [{ name: 'lost', refId: 'gone' }])],
    });
    expect(svg.querySelectorAll('[data-viz-ref]')).toHaveLength(1);
    expect(refPath(svg, 'main.a')).not.toBeNull();
  });

  it('routes every direction between heap objects, a self reference and frame to frame', () => {
    const svg = draw({
      frames: [frame('global'), frame('main', [{ name: 'parent', refId: 'global' }])],
      objects: [
        object('a', 0, 0, [
          { name: 'self', refId: 'a' },
          { name: 'right', refId: 'b' },
          { name: 'down', refId: 'c' },
        ]),
        object('b', 1, 0, [{ name: 'left', refId: 'a' }]),
        object('c', 0, 1, [{ name: 'up', refId: 'a' }]),
      ],
    });
    const paths = [...svg.querySelectorAll('[data-viz-ref]')].map((p) => p.getAttribute('d')!);
    expect(paths).toHaveLength(6);
    expect(new Set(paths).size).toBe(6);
    for (const d of paths) expect(d).not.toMatch(/NaN|undefined/);
  });

  it('marks unreachable live objects only when asked', () => {
    const snapshot: PlacedSnapshot = {
      frames: [frame('main', [{ name: 'a', refId: 'kept' }])],
      objects: [object('kept', 0, 0), object('lost', 1, 0)],
    };
    const { unreachable, object: plain } = vizPalette.light;

    const off = draw(snapshot);
    expect(entity(off, 'lost').querySelector('rect')!.getAttribute('fill')).toBe(plain.fill);

    const on = draw(snapshot, { markUnreachable: true });
    const lost = entity(on, 'lost');
    expect(lost.querySelector('rect')!.getAttribute('fill')).toBe(unreachable.fill);
    expect(lost.querySelector('rect')!.getAttribute('stroke')).toBe(unreachable.stroke);
    expect(lost.hasAttribute('data-viz-unreachable')).toBe(true);
    expect(entity(on, 'kept').querySelector('rect')!.getAttribute('fill')).toBe(plain.fill);
  });

  describe('an object the collector has marked', () => {
    const snapshot = (state: HeapObject['state']): PlacedSnapshot => ({
      frames: [frame('main', [{ name: 'a', refId: 'kept' }])],
      objects: [object('kept', 0, 0, [], { state }), object('other', 1, 0)],
    });
    const tag = (g: Element) => g.querySelector('[data-viz-tag="marked"]');
    const width = (g: Element) => num(g.querySelector('rect')!, 'stroke-width');

    it('gets a MARKED tag and a heavier outline, and keeps the colours of its kind', () => {
      const { object: plain, text } = vizPalette.light;
      const svg = draw(snapshot('marked'), { gcPhase: 'mark' });
      const kept = entity(svg, 'kept');
      const rect = kept.querySelector('rect')!;

      expect(tag(kept)).toHaveTextContent('MARKED');
      expect(tag(kept)!.getAttribute('fill')).toBe(text.primary);
      expect(rect.getAttribute('fill')).toBe(plain.fill);
      expect(rect.getAttribute('stroke')).toBe(plain.stroke);
      expect(rect.hasAttribute('stroke-dasharray')).toBe(false);
      // The cue that is not colour: twice the outline of the live object beside it
      const other = entity(svg, 'other');
      expect(width(kept)).toBe(3);
      expect(width(other)).toBe(1.5);
      expect(tag(other)).toBeNull();
      expect(svg.textContent).not.toMatch(/UNMARKED|RECLAIMED/);
    });

    it('keeps the tag and the outline through the sweep, and in focus takes the focus colour', () => {
      const svg = draw(snapshot('marked'), { gcPhase: 'sweep', focus: ['kept'] });
      const kept = entity(svg, 'kept');
      expect(tag(kept)).not.toBeNull();
      expect(width(kept)).toBe(3);
      expect(kept.querySelector('rect')!.getAttribute('stroke')).toBe(vizPalette.light.focus);
    });

    it('is not drawn for a live object', () => {
      const svg = draw(snapshot('live'), { gcPhase: 'mark' });
      expect(svg.querySelector('[data-viz-tag]')).toBeNull();
      expect(svg.textContent).not.toContain('MARKED');
      expect(width(entity(svg, 'kept'))).toBe(1.5);
    });

    it('is not drawn outside a collection: a Playground trace looks as it did', () => {
      // The Stack & Heap lens hands over `marked` for an object held by a frame it does not
      // draw; a trace never passes `gcPhase`.
      const svg = draw(snapshot('marked'), { markUnreachable: true, theme: 'dark' });
      const kept = entity(svg, 'kept');
      expect(svg.textContent).not.toContain('MARKED');
      expect(width(kept)).toBe(1.5);
      expect(kept.querySelector('rect')!.getAttribute('fill')).toBe(vizPalette.dark.object.fill);
    });

    it('writes the tag in the dark palette when the theme is dark', () => {
      const svg = draw(snapshot('marked'), { gcPhase: 'mark', theme: 'dark' });
      expect(tag(entity(svg, 'kept'))!.getAttribute('fill')).toBe(vizPalette.dark.text.primary);
    });

    it('never appears in the Stack ↔ Heap story, whose collector reaches nothing', () => {
      for (const beat of STORY_BEATS) {
        const svg = draw(beat, { focus: beat.focus, gcPhase: beat.gcPhase });
        expect(svg.querySelector('[data-viz-tag]'), beat.id).toBeNull();
      }
    });

    it('is on exactly the marked objects of every Garbage Collection beat', () => {
      for (const beat of GC_BEATS) {
        const svg = draw(beat, { focus: beat.focus, gcPhase: beat.gcPhase });
        expect(svg.getAttribute('viewBox'), beat.id).toBe('0 0 800 480');
        const tagged = [...svg.querySelectorAll('[data-viz-label]')]
          .filter((g) => tag(g))
          .map((g) => g.querySelector('tspan')!.textContent!.trim().slice(1));
        expect(tagged, beat.id).toEqual(withState(beat, 'marked'));
      }
    });
  });

  it('keeps every rect inside the viewBox and apart for a 3×4 heap with 6 frames', () => {
    const slots = (n: number): Slot[] =>
      Array.from({ length: n }, (_, i) => ({ name: `k${i}`, value: String(i) }));
    for (const [cols, rows] of [
      [3, 4],
      [4, 3],
    ]) {
      const objects = Array.from({ length: cols * rows }, (_, i) =>
        // One 8-slot object in every row, in a different column each time.
        object(`o${i}`, i % cols, Math.floor(i / cols), slots(i % (cols + 1) === 0 ? 8 : 2))
      );
      const frames = Array.from({ length: 6 }, (_, i) => frame(`f${i}`, slots(1 + (i % 3))));
      const svg = draw({ frames, objects });

      const [, , width, height] = viewBox(svg);
      expect(width).toBeGreaterThan(800);
      expect(height).toBeGreaterThan(480);

      const boxes = [...svg.querySelectorAll('[data-viz-label] > rect')].map((r) => ({
        x: num(r, 'x'),
        y: num(r, 'y'),
        right: num(r, 'x') + num(r, 'width'),
        bottom: num(r, 'y') + num(r, 'height'),
      }));
      expect(boxes).toHaveLength(6 + cols * rows);
      for (const r of svg.querySelectorAll('rect')) {
        expect(num(r, 'x')).toBeGreaterThanOrEqual(0);
        expect(num(r, 'y')).toBeGreaterThanOrEqual(0);
        expect(num(r, 'x') + num(r, 'width')).toBeLessThanOrEqual(width);
        expect(num(r, 'y') + num(r, 'height')).toBeLessThanOrEqual(height);
      }
      // Frames stay under the region caption (baseline 42).
      for (const b of boxes) expect(b.y).toBeGreaterThanOrEqual(52);
      boxes.forEach((a, i) => {
        for (const b of boxes.slice(i + 1)) {
          const overlap = a.x < b.right && b.x < a.right && a.y < b.bottom && b.y < a.bottom;
          expect(overlap).toBe(false);
        }
      });
    }
  });

  it('takes every colour from the dark palette when the theme is dark', () => {
    const dark = vizPalette.dark;
    const svg = draw(closure, { theme: 'dark', focus: ['global.counter'] });

    expect(entity(svg, 'global()').querySelector('rect')!.getAttribute('fill')).toBe(
      dark.frame.fill
    );
    expect(entity(svg, 'ƒ increment').querySelector('rect')!.getAttribute('stroke')).toBe(
      dark.function.stroke
    );
    expect(refPath(svg, 'global.counter')!.getAttribute('stroke')).toBe(dark.focus);
    expect(refPath(svg, 'fn.[[scope]]')!.getAttribute('stroke')).toBe(dark.reference.stroke);

    // Nothing is painted by a class or by a light value: every text has a dark palette fill.
    const darkValues = new Set(JSON.stringify(dark).match(/#[0-9a-f]{6}/g));
    for (const el of svg.querySelectorAll('text, tspan, rect, path')) {
      for (const attr of ['fill', 'stroke']) {
        const value = el.getAttribute(attr);
        if (value && value !== 'none') expect(darkValues.has(value), value).toBe(true);
      }
    }
    for (const text of svg.querySelectorAll('text')) expect(text.getAttribute('fill')).toBeTruthy();
    expect(svg.innerHTML).not.toContain('fill-slate');
  });
});
