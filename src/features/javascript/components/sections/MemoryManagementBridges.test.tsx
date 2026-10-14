import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GarbageCollection from './GarbageCollection';
import MemoryManagement from './MemoryManagement';
import { examples } from '../../../playground/utils/examples';
import { STORY_CODE as GARBAGE_COLLECTION_STORY_CODE } from '../../utils/garbageCollectionStory';
import { playgroundHref } from '../../../playground/utils/playgroundLink';
import { getSectionPathByLabel } from '../../../../shared/constants/moduleNavigation';

const show = (section: React.ReactElement) => render(<MemoryRouter>{section}</MemoryRouter>);

const bridge = () => within(screen.getByTestId('stack-heap-bridge'));

/** The address of the Stack ↔ Heap story: the sidebar's own for Memory Heap & Objects. */
const stackHeapStory = () => getSectionPathByLabel('javascript', 'Memory Heap & Objects');

/** A section's one link into the Playground, which opens `example` with the Stack & Heap lens. */
function expectPlayground(example: 'stack-heap-story' | 'garbage-collection-story'): void {
  const playground = bridge().getByRole('link', { name: /Try it in the Playground/ });
  expect(playground).toHaveAttribute('href', playgroundHref({ example, lens: 'stack-heap' }));
  expect(playground).toHaveAttribute('target', '_blank');
  expect(screen.getAllByRole('link', { name: /Try it in the Playground/ })).toHaveLength(1);
}

describe('the bridges from the memory sections to the stories', () => {
  it('open examples that exist, with the lens they suggest and the section they come from', () => {
    const stackHeap = examples.find((item) => item.id === 'stack-heap-story');
    expect(stackHeap?.suggestedLens).toBe('stack-heap');
    expect(stackHeap?.source?.href).toBe(stackHeapStory());

    const collection = examples.find((item) => item.id === 'garbage-collection-story');
    expect(collection?.suggestedLens).toBe('stack-heap');
    expect(collection?.source?.href).toBe(
      getSectionPathByLabel('javascript', 'Garbage Collection')
    );
    expect(collection?.code).toBe(GARBAGE_COLLECTION_STORY_CODE);
  });

  it('Memory Management ends with the Stack ↔ Heap story and its program in the Playground', () => {
    const { container } = show(<MemoryManagement />);
    const story = bridge().getByRole('link', { name: 'See it step by step' });
    expect(story).toHaveAttribute('href', stackHeapStory());
    expect(story).not.toHaveAttribute('target');
    expectPlayground('stack-heap-story');
    // The last block of the section
    const all = container.querySelectorAll('h2');
    expect(bridge().getByRole('heading')).toBe(all[all.length - 1]);
  });

  it('Garbage Collection points back at the Stack ↔ Heap story, and opens its own program', () => {
    show(<GarbageCollection />);
    const story = bridge().getByRole('link', { name: 'See how a heap like this gets built' });
    expect(story).toHaveAttribute('href', stackHeapStory());
    expect(story).not.toHaveAttribute('target');
    expect(screen.getByTestId('stack-heap-bridge')).toHaveTextContent(
      /the Stack ↔ Heap story in Memory Heap & Objects .* The story above starts where that one stops/
    );

    // The Playground link opens this section's story, not the other one
    expectPlayground('garbage-collection-story');
    expect(screen.getByTestId('stack-heap-bridge')).toHaveTextContent(
      'A run in the Playground marks objects that nothing can reach, but cannot show them being collected.'
    );
    const section = screen.getByTestId('stack-heap-bridge').parentElement!;
    expect(section.lastElementChild).toBe(screen.getByTestId('stack-heap-bridge'));
  });

  it('Memory Management does not carry the sentence about collection', () => {
    show(<MemoryManagement />);
    expect(screen.getByTestId('stack-heap-bridge')).not.toHaveTextContent(/being collected/);
  });
});
