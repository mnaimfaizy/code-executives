import React from 'react';
import { ExternalLink } from 'lucide-react';

export interface PracticeInPlaygroundLinkProps {
  /** The exercise's title: the link always names the exercise it opens. */
  title: string;
  /** The exercise's address in the Playground (`ExerciseCard.href`). */
  href: string;
  /**
   * Keeps the title for screen readers only. For a row that already shows the title beside
   * the link, so sighted readers do not read it twice.
   */
  titleHidden?: boolean;
}

/**
 * The link from a module page to one exercise. It opens the Playground in a new tab, so the
 * learner keeps their place in the lesson.
 */
const PracticeInPlaygroundLink: React.FC<PracticeInPlaygroundLinkProps> = ({
  title,
  href,
  titleHidden = false,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    data-testid="practice-in-playground"
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
  >
    <span>
      Practice in the Playground
      <span className={titleHidden ? 'sr-only' : undefined}>: {title}</span>
    </span>
    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
    <span className="sr-only"> (opens in a new tab)</span>
  </a>
);

export default PracticeInPlaygroundLink;
