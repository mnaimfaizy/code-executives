import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GarbageCollection from './GarbageCollection';
import { STORY_BEATS } from '../../utils/garbageCollectionStory';

const show = () =>
  render(
    <MemoryRouter>
      <GarbageCollection />
    </MemoryRouter>
  );

describe('the Garbage Collection section', () => {
  it('holds the story, on its first beat, in 2D', () => {
    const { container } = show();
    expect(
      screen.getByRole('heading', { name: 'Garbage Collection: what does the collector free?' })
    ).toBeInTheDocument();
    expect(screen.getByText(`Beat 1 / ${STORY_BEATS.length}`)).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: `Stack and heap: ${STORY_BEATS[0].title}` })
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-viz-viewer]')).toHaveLength(1);
  });

  it('no longer holds the old simulation: no canvas, no editor, no output panel', () => {
    const { container } = show();
    expect(container.querySelector('canvas')).toBeNull();
    expect(container.querySelector('textarea')).toBeNull();
    expect(container.querySelector('#gc-input-mode-select')).toBeNull();
    for (const gone of [
      /2D Visualization: Garbage Collection/,
      /Source Code/,
      /Ready for GC simulation/,
      /Young Generation \(Nursery\)/,
      /DSL/,
    ]) {
      expect(screen.queryByText(gone)).not.toBeInTheDocument();
    }
  });

  it('keeps its prose around the story', () => {
    show();
    for (const name of [
      'Garbage Collection',
      'Role in JavaScript Engine',
      'Generational Garbage Collection',
    ]) {
      expect(screen.getByRole('heading', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('Key Insight:')).toBeInTheDocument();
    expect(screen.getByText(/weak generational hypothesis/)).toBeInTheDocument();
  });

  it('claims only the roots and the phases the research report gives', () => {
    show();
    expect(screen.queryByText(/Native objects/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Persistent handles/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Concurrent/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Run alongside application/)).not.toBeInTheDocument();

    const phases = screen.getByText('Mark-and-Sweep Phases (old generation)').parentElement!;
    expect(
      within(phases)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual([
      expect.stringMatching(/^Mark:/),
      expect.stringMatching(/^Sweep:/),
      expect.stringMatching(/^Compact: Optionally/),
    ]);
    const roots = screen.getByText('GC Roots').parentElement!;
    expect(
      within(roots)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    ).toEqual([
      'Global variables',
      expect.stringMatching(/^Local variables of every function that has not returned yet/),
    ]);
  });

  it('says under the story what it does not show, and names reference counting', () => {
    const { container } = show();
    const note = screen.getByTestId('gc-story-note');
    expect(note.tagName).toBe('P');
    expect(note).toHaveTextContent(
      'New objects are first collected by a different collector, which copies the live ones'
    );
    expect(note).toHaveTextContent('the same rule, reachability from the roots');
    expect(note).toHaveTextContent(
      /freeing an object only when nothing references it, is called reference counting\.$/
    );
    // Directly under the story
    const viewer = container.querySelector('[data-viz-viewer]')!;
    expect(viewer.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(note.previousElementSibling!.contains(viewer)).toBe(true);
  });
});
