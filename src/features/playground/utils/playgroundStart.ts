/**
 * What the Playground opens with for a link (`playgroundLink.ts`), and keeping the address
 * bar in step afterwards so the page can be shared.
 */

import type { PlaygroundLanguage, VisualizationLens } from '../types';
import type { Exercise } from '../exercises/types';
import { findExercise } from '../exercises/exercises';
import { examples, type Example, type ExampleSource } from './examples';
import { getDefaultTemplate } from './codeTemplates';
import { parsePlaygroundLink, playgroundHref, type PlaygroundLink } from './playgroundLink';

export interface PlaygroundStart {
  language: PlaygroundLanguage;
  code: string;
  lens: VisualizationLens;
  /** The exercise the link opens. */
  exercise: Exercise | null;
  /** The example the link loads. */
  example: Example | null;
}

export function findExample(id: string | undefined): Example | undefined {
  return id === undefined ? undefined : examples.find((example) => example.id === id);
}

/** The story or section an example's code is taken from, when it names one. Read defensively. */
export function sourceOf(example: Example | null): ExampleSource | null {
  const source = (example as { source?: unknown } | null)?.source;
  if (!source || typeof source !== 'object') return null;
  const { kind, label, href } = source as { kind?: unknown; label?: unknown; href?: unknown };
  if (kind !== 'story' && kind !== 'section') return null;
  if (typeof label !== 'string' || typeof href !== 'string') return null;
  // Only a path inside this site
  if (!href.startsWith('/') || href.startsWith('//')) return null;
  return { kind, label, href };
}

/**
 * Resolves a query string. `exercise` opens that exercise with the learner's last code for
 * it (`savedCode`), or its starter code. `example` loads that example. `lens` overrides the
 * suggested lens. An id nothing answers to falls back to the default template, silently.
 */
export function resolvePlaygroundStart(
  search: string,
  savedCode: (exerciseId: string) => string | undefined = () => undefined
): PlaygroundStart {
  const link = parsePlaygroundLink(search);

  const exercise = findExercise(link.exercise);
  if (exercise) {
    return {
      language: 'javascript',
      code: savedCode(exercise.id) ?? exercise.starterCode,
      lens: link.lens ?? exercise.suggestedLens,
      exercise,
      example: null,
    };
  }

  const example = findExample(link.example);
  if (example) {
    return {
      language: example.language,
      code: example.code,
      lens: link.lens ?? example.suggestedLens,
      exercise: null,
      example,
    };
  }

  return {
    language: 'javascript',
    code: getDefaultTemplate('javascript'),
    lens: link.lens ?? 'none',
    exercise: null,
    example: null,
  };
}

/** Puts a link in the address bar without loading anything. The path stays as it is. */
export function replacePlaygroundUrl(link: PlaygroundLink): void {
  try {
    const href = playgroundHref(link);
    const at = href.indexOf('?');
    const query = at === -1 ? '' : href.slice(at);
    window.history.replaceState(window.history.state, '', window.location.pathname + query);
  } catch {
    // The address bar is a convenience: a history that refuses changes nothing else
  }
}
