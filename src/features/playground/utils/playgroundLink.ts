import type { VisualizationLens } from '../types';

/**
 * A link into the Playground: which example or exercise to open, and with which lens.
 *
 * Pure and free of imports that run, so a story section in another module can build a link
 * without pulling the Playground into its bundle. A link names an example or exercise by id;
 * it never carries code.
 */
export interface PlaygroundLink {
  /** Id of an example to load (`utils/examples.ts`). */
  example?: string;
  /** Id of an exercise to open. Wins over `example` when both are given. */
  exercise?: string;
  /** Lens to select; without it the example's or exercise's suggested lens is used. */
  lens?: VisualizationLens;
}

export const PLAYGROUND_PATH = '/playground';

const LENSES: readonly VisualizationLens[] = ['stack-heap', 'stack-queues', 'none'];
const ID = /^[a-z0-9][a-z0-9-]{0,63}$/;

const idOf = (value: string | null): string | undefined =>
  value !== null && ID.test(value) ? value : undefined;

/** Reads a link from a URL's query string. Anything it does not recognise is left out. */
export function parsePlaygroundLink(search: string): PlaygroundLink {
  const params = new URLSearchParams(search);
  const link: PlaygroundLink = {};
  const example = idOf(params.get('example'));
  const exercise = idOf(params.get('exercise'));
  const lens = params.get('lens');
  if (exercise) link.exercise = exercise;
  else if (example) link.example = example;
  if (lens !== null && (LENSES as readonly string[]).includes(lens)) {
    link.lens = lens as VisualizationLens;
  }
  return link;
}

/** The Playground URL for a link, e.g. `/playground?example=event-loop-story&lens=stack-queues`. */
export function playgroundHref(link: PlaygroundLink = {}): string {
  const params = new URLSearchParams();
  if (link.exercise) params.set('exercise', link.exercise);
  else if (link.example) params.set('example', link.example);
  if (link.lens) params.set('lens', link.lens);
  const query = params.toString();
  return query ? `${PLAYGROUND_PATH}?${query}` : PLAYGROUND_PATH;
}
