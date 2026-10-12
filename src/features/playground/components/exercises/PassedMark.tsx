import React from 'react';
import { Check } from 'lucide-react';

interface PassedMarkProps {
  /** "Passed", or "Passed before" beside the title of the open exercise. */
  label: string;
  /** The viewer has also seen this exercise's solution. */
  solutionSeen: boolean;
}

/**
 * The mark beside an exercise this viewer has passed. When they have also seen its
 * solution it says so, quietly: a fact, not a score and not a penalty.
 */
const PassedMark: React.FC<PassedMarkProps> = ({ label, solutionSeen }) => (
  <span className="inline-flex items-center gap-1 shrink-0 text-[10px]">
    <span className="inline-flex items-center gap-1" style={{ color: 'var(--pg-accent-green)' }}>
      <Check size={11} aria-hidden="true" />
      {label}
      {solutionSeen && ','}
    </span>
    {solutionSeen && <span style={{ color: 'var(--pg-text-secondary)' }}>solution seen</span>}
  </span>
);

export default PassedMark;
