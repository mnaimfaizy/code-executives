import { describe, expect, it } from 'vitest';
import { examples, labelWithinSource } from './examples';
import { parsePlaygroundLink, playgroundHref } from './playgroundLink';
import { STORY_CODE as EVENT_LOOP_STORY_CODE } from '../../javascript/utils/eventLoopStory';
import { STORY_CODE as GARBAGE_COLLECTION_STORY_CODE } from '../../javascript/utils/garbageCollectionStory';
import { STORY_CODE as STACK_HEAP_STORY_CODE } from '../../javascript/utils/stackHeapStory';
import { sectionSamples } from '../../javascript/utils/sectionSamples';
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

  it('no longer hold the Event Loop Demo, which repeated the story and the sections’ samples', () => {
    expect(byId('event-loop-demo')).toBeUndefined();
    expect(examples.some((example) => example.label === 'Event Loop Demo')).toBe(false);
  });

  it('list the stories’ programs first, named as such', () => {
    expect(examples.slice(0, 3).map((example) => example.id)).toEqual([
      'stack-heap-story',
      'event-loop-story',
      'garbage-collection-story',
    ]);
    for (const example of examples.slice(0, 3)) expect(example.label).toMatch(/^Story: /);
    expect(examples.slice(3).every((example) => example.source?.kind !== 'story')).toBe(true);
  });

  it.each([
    ['stack-heap-story', STACK_HEAP_STORY_CODE, 'stack-heap'],
    ['event-loop-story', EVENT_LOOP_STORY_CODE, 'stack-queues'],
    ['garbage-collection-story', GARBAGE_COLLECTION_STORY_CODE, 'stack-heap'],
  ])('%s is the story’s own program, with its lens', (id, code, lens) => {
    const example = byId(id);
    expect(example?.code).toBe(code);
    expect(example?.language).toBe('javascript');
    expect(example?.suggestedLens).toBe(lens);
  });

  it('point a story’s example back at a section that exists', () => {
    const withStory = examples.filter((example) => example.source?.kind === 'story');
    expect(withStory).toHaveLength(3);
    for (const { source } of withStory) {
      const label = getSectionQueryValue(source!.href);
      expect(label).toBeTruthy();
      // The href is the section's own path, so the label is one the sidebar knows.
      expect(getSectionPathByLabel('javascript', label!)).toBe(source!.href);
      expect(source!.label).not.toBe('');
    }
  });
});

describe('examples taken from a JavaScript section', () => {
  const fromSections = examples.filter((example) => example.source?.kind === 'section');

  it('are the sections’ samples, one example each, after every other JavaScript example', () => {
    expect(fromSections.map((example) => example.id)).toEqual(
      sectionSamples.map((sample) => sample.example)
    );
    expect(fromSections.length).toBeGreaterThan(0);
    const firstFromSection = examples.findIndex((example) => example.source?.kind === 'section');
    expect(examples.slice(firstFromSection)).toEqual(fromSections);
  });

  it.each(sectionSamples.map((sample) => [sample.example, sample] as const))(
    '%s carries exactly its section’s code, with its lens',
    (id, sample) => {
      const example = byId(id);
      expect(example?.code).toBe(sample.code);
      expect(example?.language).toBe('javascript');
      expect(example?.suggestedLens).toBe(sample.lens);
      expect(example?.description).toBe(sample.description);
    }
  );

  it.each(sectionSamples.map((sample) => [sample.example, sample] as const))(
    '%s links back to its section, which exists',
    (id, sample) => {
      const source = byId(id)?.source;
      // The label is the sidebar's own and the href is that section's own path
      expect(source?.label).toBe(sample.section);
      expect(getSectionPathByLabel('javascript', sample.section)).not.toBeNull();
      expect(source?.href).toBe(getSectionPathByLabel('javascript', sample.section));
      expect(getSectionQueryValue(source!.href)).toBe(sample.section);
    }
  );

  it('are labelled with their section, and go by their own name under its heading', () => {
    for (const sample of sectionSamples) {
      const example = byId(sample.example)!;
      expect(example.label).toBe(`${sample.section}: ${sample.title}`);
      expect(labelWithinSource(example)).toBe(sample.title);
    }
    expect(labelWithinSource(examples[0])).toBe(examples[0].label);
  });

  it('say what the learner will see and what to change, as the rest of a sentence', () => {
    for (const { tryIt } of sectionSamples) {
      expect(tryIt).toMatch(/^[a-z].*\. Then .*\.$/);
    }
  });
});
