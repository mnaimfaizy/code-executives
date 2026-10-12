import { describe, expect, it } from 'vitest';
import { parsePlaygroundLink, playgroundHref } from './playgroundLink';

describe('playgroundHref', () => {
  it('is the bare Playground path for an empty link', () => {
    expect(playgroundHref()).toBe('/playground');
  });

  it('names an example and a lens', () => {
    expect(playgroundHref({ example: 'event-loop-story', lens: 'stack-queues' })).toBe(
      '/playground?example=event-loop-story&lens=stack-queues'
    );
  });

  it('lets an exercise win over an example', () => {
    expect(playgroundHref({ example: 'a', exercise: 'two-sum' })).toBe(
      '/playground?exercise=two-sum'
    );
  });
});

describe('parsePlaygroundLink', () => {
  it('reads back what playgroundHref wrote', () => {
    const link = { example: 'stack-heap-story', lens: 'stack-heap' } as const;
    expect(parsePlaygroundLink(playgroundHref(link).split('?')[1])).toEqual(link);
  });

  it('reads an exercise and ignores an example beside it', () => {
    expect(parsePlaygroundLink('?exercise=two-sum&example=a')).toEqual({ exercise: 'two-sum' });
  });

  it('leaves out an unknown lens and anything that is not an id', () => {
    expect(parsePlaygroundLink('?example=<script>&lens=heap')).toEqual({});
    expect(parsePlaygroundLink('?example=Has Spaces')).toEqual({});
  });

  it('is empty for an empty query', () => {
    expect(parsePlaygroundLink('')).toEqual({});
  });
});
