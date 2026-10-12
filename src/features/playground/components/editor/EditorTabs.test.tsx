import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditorTabs from './EditorTabs';

const tabs = (source?: React.ComponentProps<typeof EditorTabs>['source']) =>
  render(<EditorTabs language="javascript" onReset={() => {}} source={source} />);

describe('EditorTabs: the link back from an example', () => {
  it('reads "Read the story" for a story’s program, and names the story to a screen reader', () => {
    tabs({
      kind: 'story',
      label: 'The Event Loop: what runs next?',
      href: '/javascript?section=Event%20Loop%20%26%20Coordination',
    });
    const link = screen.getByRole('link');

    expect(link).toHaveTextContent(/^Read the story$/);
    expect(link).toHaveAccessibleName('Read the story: The Event Loop: what runs next?');
    expect(link).toHaveAttribute('href', '/javascript?section=Event%20Loop%20%26%20Coordination');
  });

  it('reads "Read the section: <label>" for a section’s sample', () => {
    tabs({
      kind: 'section',
      label: 'Task Queues & Priority',
      href: '/javascript?section=Task%20Queues%20%26%20Priority',
    });
    const link = screen.getByRole('link');

    expect(link).toHaveTextContent(/^Read the section: Task Queues & Priority$/);
    expect(link).toHaveAccessibleName('Read the section: Task Queues & Priority');
    expect(link).toHaveAttribute('href', '/javascript?section=Task%20Queues%20%26%20Priority');
  });

  it('shows no link for a standalone program', () => {
    tabs();
    expect(screen.queryByRole('link')).toBeNull();
    tabs(null);
    expect(screen.queryByRole('link')).toBeNull();
  });
});
