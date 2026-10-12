import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
  playgroundHref,
  type PlaygroundLink,
} from '../../../features/playground/utils/playgroundLink';

export interface TryInPlaygroundLinkProps {
  /** Id of the Playground example that holds the story's program. */
  example: NonNullable<PlaygroundLink['example']>;
  /** The lens the Playground opens with. */
  lens: NonNullable<PlaygroundLink['lens']>;
  /** The rest of the sentence: what opens, and what to change once it has. */
  children: React.ReactNode;
}

/**
 * The line that ends a story: a link that opens the story's own program in the Playground, in
 * a new tab so the story keeps its beat, followed by what the learner can try there.
 *
 * Only the link contract is imported, so a story section does not pull the Playground in.
 */
const TryInPlaygroundLink: React.FC<TryInPlaygroundLinkProps> = ({ example, lens, children }) => (
  <p className="text-sm text-slate-700" data-testid="try-in-playground">
    <a
      href={playgroundHref({ example, lens })}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
    >
      Try it in the Playground
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
    : {children}
  </p>
);

export default TryInPlaygroundLink;
