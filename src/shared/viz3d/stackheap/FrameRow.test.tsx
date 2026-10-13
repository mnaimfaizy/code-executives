import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import type { StackFrame } from '../../snapshot';
import { vizPalette } from '../../viz/palette';
import { FrameRow } from './FrameRow';
import { frameLabelPlan } from './layout';

const P = vizPalette.dark;

const frame: StackFrame = {
  id: 'f2',
  name: 'walk(node)',
  slots: [
    { name: 'node', refId: 'o1' },
    { name: 'depth', value: '2' },
    { name: 'left', value: 'null' },
    { name: 'right', refId: 'o2' },
    { name: 'sum', value: '14' },
  ],
};

/** The row of the middle frame (index 1 of 3) for the given focus. */
const middleRow = (focus: string[]) => {
  const plan = frameLabelPlan(1, 3, frame.slots.length, (i) =>
    focus.includes(`${frame.id}.${frame.slots[i].name}`)
  );
  if (plan.stacked) throw new Error('a middle frame is never stacked');
  const { container } = render(<FrameRow frame={frame} plan={plan} focus={focus} tight P={P} />);
  return container.firstElementChild as HTMLElement;
};

const texts = (row: HTMLElement) => [...row.children].map((child) => child.textContent);

describe('FrameRow', () => {
  it('shows two slots and "+N more" for a middle frame with more than two slots', () => {
    const row = middleRow([]);
    expect(row).toHaveAttribute('data-viz-frame-row', 'cut');
    expect(texts(row)).toEqual(['node: ●→', 'depth: 2', '+3 more']);
  });

  it('shows the slot the step changed, in bold, instead of one it did not', () => {
    const row = middleRow(['f2.sum']);
    expect(texts(row)).toEqual(['node: ●→', 'sum: 14', '+3 more']);
    expect(row.children[1]).toHaveClass('font-bold');
    expect(row.children[0]).not.toHaveClass('font-bold');
  });

  it('shows the first two focused slots when more than two are focused, and counts the rest', () => {
    const row = middleRow(['f2.depth', 'f2.right', 'f2.sum']);
    expect(texts(row)).toEqual(['depth: 2', 'right: ●→', '+3 more']);
  });

  it('stays one row: the count does not shrink, the slots end in an ellipsis', () => {
    const row = middleRow(['f2.sum']);
    expect(row).toHaveClass('flex', 'whitespace-nowrap');
    const [unfocused, focused, more] = [...row.children] as HTMLElement[];
    expect(more).toHaveClass('shrink-0');
    for (const slot of [unfocused, focused]) {
      expect(slot).toHaveClass('min-w-0');
      expect(slot).toHaveStyle({ overflow: 'hidden', textOverflow: 'ellipsis' });
    }
    // The slot the step did not change gives way first
    expect(Number(unfocused.style.flexShrink)).toBeGreaterThan(Number(focused.style.flexShrink));
  });

  it('lists every slot of a frame that fits the row', () => {
    const small: StackFrame = { ...frame, slots: frame.slots.slice(0, 2) };
    const plan = frameLabelPlan(1, 3, 2);
    if (plan.stacked) throw new Error('not stacked');
    const { container } = render(
      <FrameRow frame={small} plan={plan} focus={['f2.depth']} tight={false} P={P} />
    );
    const row = container.firstElementChild as HTMLElement;
    expect(row).not.toHaveAttribute('data-viz-frame-row');
    expect(texts(row)).toEqual(['node: ●→', 'depth: 2']);
    expect(row.children[1]).toHaveClass('font-bold');
  });
});
