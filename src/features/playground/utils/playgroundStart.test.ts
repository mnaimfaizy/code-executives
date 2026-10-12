import { describe, it, expect, afterEach } from 'vitest';
import { replacePlaygroundUrl, resolvePlaygroundStart, storyOf } from './playgroundStart';
import { examples, type Example } from './examples';
import { exercises } from '../exercises/exercises';
import { getDefaultTemplate } from './codeTemplates';
import { parsePlaygroundLink } from './playgroundLink';

const twoSum = exercises.find((exercise) => exercise.id === 'two-sum')!;

describe('resolvePlaygroundStart', () => {
  it('opens free play with the default template when the link says nothing', () => {
    expect(resolvePlaygroundStart('')).toEqual({
      language: 'javascript',
      code: getDefaultTemplate('javascript'),
      lens: 'none',
      exercise: null,
      example: null,
    });
  });

  it('opens an exercise with its starter code and suggested lens', () => {
    const start = resolvePlaygroundStart('?exercise=two-sum');
    expect(start.exercise).toBe(twoSum);
    expect(start.code).toBe(twoSum.starterCode);
    expect(start.language).toBe('javascript');
    expect(start.lens).toBe(twoSum.suggestedLens);
    expect(start.example).toBeNull();
  });

  it('opens an exercise with the code the learner last had for it', () => {
    const start = resolvePlaygroundStart('?exercise=two-sum', (id) =>
      id === 'two-sum' ? 'my code' : undefined
    );
    expect(start.code).toBe('my code');
  });

  it('loads an example with its language and suggested lens', () => {
    const example = examples[0];
    const start = resolvePlaygroundStart(`?example=${example.id}`);
    expect(start.example).toBe(example);
    expect(start.code).toBe(example.code);
    expect(start.language).toBe(example.language);
    expect(start.lens).toBe(example.suggestedLens);
    expect(start.exercise).toBeNull();
  });

  it('lets lens override the suggested lens', () => {
    expect(resolvePlaygroundStart('?exercise=two-sum&lens=stack-queues').lens).toBe('stack-queues');
    expect(resolvePlaygroundStart(`?example=${examples[0].id}&lens=none`).lens).toBe('none');
    expect(resolvePlaygroundStart('?lens=stack-heap').lens).toBe('stack-heap');
  });

  it('falls back to the default template for an id nothing answers to', () => {
    for (const search of ['?exercise=no-such-exercise', '?example=no-such-example', '?exercise=']) {
      const start = resolvePlaygroundStart(search);
      expect(start.code).toBe(getDefaultTemplate('javascript'));
      expect(start.exercise).toBeNull();
      expect(start.example).toBeNull();
    }
  });

  it('prefers the exercise when a link names both', () => {
    const start = resolvePlaygroundStart(`?example=${examples[0].id}&exercise=two-sum`);
    expect(start.exercise).toBe(twoSum);
    expect(start.example).toBeNull();
  });
});

describe('storyOf', () => {
  const example = (story: unknown): Example => ({ ...examples[0], story }) as Example;

  it('returns the story of an example that names one', () => {
    expect(
      storyOf(example({ label: 'The story', href: '/javascript?section=Call%20Stack' }))
    ).toEqual({ label: 'The story', href: '/javascript?section=Call%20Stack' });
  });

  it('returns null for no example, no story, or a story that is not a path in this site', () => {
    expect(storyOf(null)).toBeNull();
    expect(storyOf(example(undefined))).toBeNull();
    expect(storyOf(example('a string'))).toBeNull();
    expect(storyOf(example({ label: 'x' }))).toBeNull();
    expect(storyOf(example({ label: 'x', href: 'https://elsewhere.example/' }))).toBeNull();
    expect(storyOf(example({ label: 'x', href: '//elsewhere.example/' }))).toBeNull();
    expect(storyOf(example({ label: 'x', href: 'javascript:alert(1)' }))).toBeNull();
  });
});

describe('replacePlaygroundUrl', () => {
  afterEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('puts the link in the address bar, keeps the path and adds no history entry', () => {
    window.history.replaceState({ key: 'router' }, '', '/playground?example=old');
    const before = window.history.length;

    replacePlaygroundUrl({ exercise: 'two-sum' });
    expect(window.location.pathname).toBe('/playground');
    expect(parsePlaygroundLink(window.location.search)).toEqual({ exercise: 'two-sum' });
    // What the router keeps in the entry stays
    expect(window.history.state).toEqual({ key: 'router' });

    replacePlaygroundUrl({ example: 'event-loop-demo' });
    expect(parsePlaygroundLink(window.location.search)).toEqual({ example: 'event-loop-demo' });

    replacePlaygroundUrl({});
    expect(window.location.search).toBe('');
    expect(window.location.pathname).toBe('/playground');
    expect(window.history.length).toBe(before);
  });
});
