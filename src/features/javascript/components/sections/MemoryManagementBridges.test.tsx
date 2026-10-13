import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GarbageCollection from './GarbageCollection';
import MemoryManagement from './MemoryManagement';
import { examples } from '../../../playground/utils/examples';
import { playgroundHref } from '../../../playground/utils/playgroundLink';
import { getSectionPathByLabel } from '../../../../shared/constants/moduleNavigation';

const show = (section: React.ReactElement) => render(<MemoryRouter>{section}</MemoryRouter>);

const bridge = () => within(screen.getByTestId('stack-heap-bridge'));

/** Both sections end with the same two links: to the story, and to its program in the Playground. */
function expectBridge(): void {
  const story = bridge().getByRole('link', { name: 'See it step by step' });
  // The story lives in Memory Heap & Objects; the address is the sidebar's own
  expect(story).toHaveAttribute('href', getSectionPathByLabel('javascript', 'Memory Heap & Objects'));
  expect(story).not.toHaveAttribute('target');

  const playground = bridge().getByRole('link', { name: /Try it in the Playground/ });
  expect(playground).toHaveAttribute(
    'href',
    playgroundHref({ example: 'stack-heap-story', lens: 'stack-heap' })
  );
  expect(playground).toHaveAttribute('target', '_blank');
  expect(screen.getAllByRole('link', { name: /Try it in the Playground/ })).toHaveLength(1);
}

describe('the bridges from the memory sections to the Stack ↔ Heap story', () => {
  it('open an example that exists, with the lens it suggests', () => {
    const example = examples.find((item) => item.id === 'stack-heap-story');
    expect(example?.suggestedLens).toBe('stack-heap');
    expect(example?.source?.href).toBe(getSectionPathByLabel('javascript', 'Memory Heap & Objects'));
  });

  it('Memory Management ends with the story and its program in the Playground', () => {
    const { container } = show(<MemoryManagement />);
    expectBridge();
    // The last block of the section
    const all = container.querySelectorAll('h2');
    expect(bridge().getByRole('heading')).toBe(all[all.length - 1]);
  });

  it('Garbage Collection ends with them too, and says what a run cannot show', () => {
    show(<GarbageCollection />);
    expectBridge();
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
