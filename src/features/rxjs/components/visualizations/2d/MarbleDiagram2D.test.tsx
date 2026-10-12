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

  it('names its icon buttons and does not claim marbles can be clicked', () => {
    const { container } = render(<MarbleDiagram2D autoPlay={false} />);

    for (const name of ['Visualization settings', 'Download diagram as SVG', 'Play', 'Reset']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(container).not.toHaveTextContent(/click marbles/i);
  });
});
