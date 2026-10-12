import { describe, expect, it } from 'vitest';
import { examples } from './examples';
import { parsePlaygroundLink, playgroundHref } from './playgroundLink';
import { STORY_CODE as EVENT_LOOP_STORY_CODE } from '../../javascript/utils/eventLoopStory';
import { STORY_CODE as STACK_HEAP_STORY_CODE } from '../../javascript/utils/stackHeapStory';
import {
  getSectionPathByLabel,
  getSectionQueryValue,
} from '../../../shared/constants/moduleNavigation';

const byId = (id: string) => examples.find((example) => example.id === id);

describe('examples', () => {
  it('have unique ids that a Playground link can name', () => {
    const ids = examples.map((example) => example.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(parsePlaygroundLink(playgroundHref({ example: id }).split('?')[1])).toEqual({
        example: id,
      });
    }
  });

  it('list the stories’ programs first, named as such', () => {
    expect(examples.slice(0, 2).map((example) => example.id)).toEqual([
      'stack-heap-story',
      'event-loop-story',
    ]);
    for (const example of examples.slice(0, 2)) expect(example.label).toMatch(/^Story: /);
    expect(examples.slice(2).every((example) => example.story === undefined)).toBe(true);
  });

  it.each([
    ['stack-heap-story', STACK_HEAP_STORY_CODE, 'stack-heap'],
    ['event-loop-story', EVENT_LOOP_STORY_CODE, 'stack-queues'],
  ])('%s is the story’s own program, with its lens', (id, code, lens) => {
    const example = byId(id);
    expect(example?.code).toBe(code);
    expect(example?.language).toBe('javascript');
    expect(example?.suggestedLens).toBe(lens);
  });

  it('point a story’s example back at a section that exists', () => {
    const withStory = examples.filter((example) => example.story);
    expect(withStory).toHaveLength(2);
    for (const { story } of withStory) {
      const label = getSectionQueryValue(story!.href);
      expect(label).toBeTruthy();
      // The href is the section's own path, so the label is one the sidebar knows.
      expect(getSectionPathByLabel('javascript', label!)).toBe(story!.href);
      expect(story!.label).not.toBe('');
    }
  });
});
