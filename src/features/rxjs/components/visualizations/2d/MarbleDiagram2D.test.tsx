import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarbleDiagram2D from './MarbleDiagram2D';

const gridRect = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('svg rect')).find((rect) =>
    rect.getAttribute('fill')?.startsWith('url(#')
  );

describe('MarbleDiagram2D', () => {
  it('draws the grid, and Show Grid takes it away', async () => {
    const user = userEvent.setup();
    const { container } = render(<MarbleDiagram2D autoPlay={false} />);

    const grid = gridRect(container);
    expect(grid).toBeDefined();
    // A shape inside <defs> is never painted.
    expect(grid?.closest('defs')).toBeNull();
    const patternId = grid?.getAttribute('fill')?.slice('url(#'.length, -1);
    expect(container.querySelector('pattern')?.id).toBe(patternId);

    await user.click(screen.getByRole('button', { name: 'Visualization settings' }));
    await user.click(screen.getByRole('checkbox', { name: 'Show Grid' }));

    expect(gridRect(container)).toBeUndefined();
  });

  describe('take(3)', () => {
    const marblesOf = (container: HTMLElement, stream: string) =>
      Array.from(container.querySelectorAll(`[data-stream="${stream}"] [data-marble]`)).map(
        (g) => ({
          type: g.getAttribute('data-marble'),
          time: Number(g.getAttribute('data-time')),
          text: g.querySelector('text')?.textContent,
          x: Number(g.querySelector('circle')?.getAttribute('cx')),
        })
      );

    it('completes with the third value, not when the source completes', async () => {
      const user = userEvent.setup();
      const { container } = render(<MarbleDiagram2D autoPlay={false} />);
      await user.click(screen.getByRole('button', { name: 'take(3)' }));

      const input = marblesOf(container, 'input');
      expect(input.at(-1)).toMatchObject({ type: 'complete', time: 5000 });

      const output = marblesOf(container, 'output');
      expect(output.map((m) => `${m.type}:${m.text}@${m.time}`)).toEqual([
        'next:1@1000',
        'next:2@2000',
        'next:3@3000',
        'complete:|@3000',
      ]);
      // The end is drawn clear of the value it shares its time with (two marbles of r = 12).
      const [third, end] = output.slice(-2);
      expect(end.x - third.x).toBeGreaterThanOrEqual(24);
      expect(end.x).toBeLessThan(input.find((m) => m.time === 4000)!.x);
    });

    it('ends with the source when the source ends before the third value', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <MarbleDiagram2D
          autoPlay={false}
          streams={[
            {
              id: 'input',
              name: 'Input Stream',
              color: '#3b82f6',
              marbles: [
                { id: '1', time: 1000, value: 1, type: 'next' },
                { id: '2', time: 2000, value: 'error', type: 'error' },
                { id: '3', time: 3000, value: 3, type: 'next' },
              ],
            },
          ]}
        />
      );
      await user.click(screen.getByRole('button', { name: 'take(3)' }));

      expect(marblesOf(container, 'output').map((m) => `${m.type}@${m.time}`)).toEqual([
        'next@1000',
        'error@2000',
      ]);
    });
  });

  it('names its icon buttons and does not claim marbles can be clicked', () => {
    const { container } = render(<MarbleDiagram2D autoPlay={false} />);

    for (const name of ['Visualization settings', 'Download diagram as SVG', 'Play', 'Reset']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(container).not.toHaveTextContent(/click marbles/i);
  });
});
