import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TryInPlaygroundLink from './TryInPlaygroundLink';
import { parsePlaygroundLink } from '../../../features/playground/utils/playgroundLink';

describe('TryInPlaygroundLink', () => {
  it('links to the example with its lens', () => {
    render(
      <TryInPlaygroundLink example="event-loop-story" lens="stack-queues">
        the program opens there.
      </TryInPlaygroundLink>
    );
    const link = screen.getByRole('link', { name: /Try it in the Playground/ });

    expect(link).toHaveAttribute('href', '/playground?example=event-loop-story&lens=stack-queues');
    expect(parsePlaygroundLink(link.getAttribute('href')!.split('?')[1])).toEqual({
      example: 'event-loop-story',
      lens: 'stack-queues',
    });
  });

  it('opens in a new tab and says so to a screen reader', () => {
    render(
      <TryInPlaygroundLink example="stack-heap-story" lens="stack-heap">
        the program opens there.
      </TryInPlaygroundLink>
    );
    const link = screen.getByRole('link', { name: /Try it in the Playground/ });

    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAccessibleName(/^Try it in the Playground ?\(opens in a new tab\)$/);
  });

  it('follows the link with the sentence it was given', () => {
    render(
      <TryInPlaygroundLink example="stack-heap-story" lens="stack-heap">
        the program opens there.
      </TryInPlaygroundLink>
    );
    expect(screen.getByTestId('try-in-playground')).toHaveTextContent(
      /^Try it in the Playground ?\(opens in a new tab\): the program opens there\.$/
    );
  });
});
