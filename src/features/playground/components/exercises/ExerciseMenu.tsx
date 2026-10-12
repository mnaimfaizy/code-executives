import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ExternalLink, Target } from 'lucide-react';
import type { Exercise } from '../../exercises/types';
import type { ExerciseGroup } from '../../exercises/exercises';
import PassedMark from './PassedMark';
import { SolutionSeenContext } from './solutionSeenContext';

interface ExerciseMenuProps {
  /** The exercises, grouped by level. */
  groups: ExerciseGroup[];
  /** Ids of the exercises this viewer has passed. */
  passedIds: ReadonlySet<string>;
  /** The open exercise, if any. */
  activeId: string | null;
  onOpenExercise: (exercise: Exercise) => void;
}

/**
 * The toolbar's Exercises menu: a button that shows the exercises under their level.
 * A disclosure, not an ARIA menu: every exercise is a button reached with Tab, and
 * Escape closes the list and returns to the button.
 */
const ExerciseMenu: React.FC<ExerciseMenuProps> = ({
  groups,
  passedIds,
  activeId,
  onOpenExercise,
}) => {
  const [open, setOpen] = useState(false);
  const solutionSeenIds = useContext(SolutionSeenContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Close on a click outside
  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent): void => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent): void => {
    if (event.key === 'Escape' && open) {
      // The page's own Escape handling (stop a run) is not meant here
      event.stopPropagation();
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
        style={{
          color: activeId ? 'var(--pg-accent-blue)' : 'var(--pg-text-secondary)',
          border: `1px solid ${activeId ? 'var(--pg-accent-blue)' : 'var(--pg-border)'}`,
          background: open ? 'var(--pg-bg-surface-hover)' : 'transparent',
        }}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
      >
        <Target size={13} aria-hidden="true" />
        <span>Exercises</span>
        <ChevronDown size={12} className={open ? 'rotate-180' : ''} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listId}
          className="absolute top-full right-0 mt-1 w-64 max-h-[70vh] overflow-y-auto rounded-lg shadow-xl z-50 sm:left-0 sm:right-auto"
          style={{ border: '1px solid var(--pg-border)', background: 'var(--pg-bg-secondary)' }}
        >
          {groups.map((group) => (
            <section key={group.level} aria-label={`${group.label} exercises`}>
              <h3
                className="px-3 py-1.5 text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--pg-text-muted)', background: 'var(--pg-bg-tertiary)' }}
              >
                {group.label}
              </h3>
              <ul>
                {group.exercises.map((exercise) => {
                  const active = exercise.id === activeId;
                  return (
                    <li key={exercise.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onOpenExercise(exercise);
                        }}
                        aria-current={active ? 'true' : undefined}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-white/5 focus-visible:bg-white/5"
                        style={{
                          borderBottom: '1px solid var(--pg-border)',
                          color: 'var(--pg-text-primary)',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        <span>
                          {exercise.title}
                          {active && (
                            <span style={{ color: 'var(--pg-text-muted)', fontWeight: 400 }}>
                              {' '}
                              (open)
                            </span>
                          )}
                        </span>
                        {passedIds.has(exercise.id) && (
                          <PassedMark
                            label="Passed"
                            solutionSeen={solutionSeenIds.has(exercise.id)}
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
          {/* What has been passed, and the milestones, are on one page for the whole site */}
          <a
            href="/progress"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-1.5 px-3 py-2 text-xs underline underline-offset-2 hover:bg-white/5 focus-visible:bg-white/5"
            style={{ color: 'var(--pg-accent-blue)' }}
          >
            Your progress
            <ExternalLink size={11} aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default ExerciseMenu;
