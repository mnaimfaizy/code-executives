import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, Copy, Eye } from 'lucide-react';
import type { Exercise } from '../../exercises/types';
import { useReducedMotion } from '../../../../shared/hooks';
import Prose from './Prose';

interface SolutionSectionProps {
  exercise: Exercise;
  /** Hints the learner has not revealed yet: the question mentions them. */
  hintsLeft: number;
  /** This viewer has seen this solution before, so it opens without the question. */
  seen: boolean;
  /** The learner confirmed: the solution is about to be shown. */
  onReveal: () => void;
  /** Put the solution in the editor. The Playground asks first when the learner has edits. */
  onLoad: () => void;
  /** Trace the solution on the first visible check into the lens. The editor keeps its code. */
  onWatch: () => void;
  /** The lens shows the solution's steps now. */
  watching: boolean;
  /** The line of the solution the current step ran, while its steps are in the lens. */
  line?: number;
  /** The editor holds the solution's code. */
  inEditor: boolean;
  /** True when the solution cannot be loaded or run right now. */
  blocked: boolean;
}

type Stage = 'closed' | 'asking' | 'open';

const mono: React.CSSProperties = { fontFamily: 'var(--pg-font-mono)' };

const buttonStyle: React.CSSProperties = {
  color: 'var(--pg-text-secondary)',
  border: '1px solid var(--pg-border)',
  background: 'transparent',
};

const buttonClass =
  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed';

/** How long the copy button says what happened. */
const COPY_NOTICE_MS = 4000;

/**
 * The solution of an exercise, after the hints. It is shown only when the learner asks and
 * answers a question asked in the page; from then on they can read it, copy it, watch it run
 * in the lens, or load it into the editor. Nothing in here changes the learner's code.
 */
const SolutionSection: React.FC<SolutionSectionProps> = ({
  exercise,
  hintsLeft,
  seen,
  onReveal,
  onLoad,
  onWatch,
  watching,
  line,
  inEditor,
  blocked,
}) => {
  const [stage, setStage] = useState<Stage>('closed');
  /** Said once to a screen reader when the solution opens or closes */
  const [stageNotice, setStageNotice] = useState('');
  const [copyNotice, setCopyNotice] = useState('');
  const reducedMotion = useReducedMotion();
  const questionId = useId();
  const headingId = useId();

  const showRef = useRef<HTMLButtonElement>(null);
  const notYetRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const currentLineRef = useRef<HTMLSpanElement>(null);
  const codeRef = useRef<HTMLElement>(null);
  const previousStage = useRef<Stage>('closed');

  // The focus follows what the learner just did: to the safe answer of the question, to the
  // solution once it is shown, and back to the button when either is closed
  useEffect(() => {
    if (previousStage.current === stage) return;
    previousStage.current = stage;
    if (stage === 'asking') {
      notYetRef.current?.focus();
    } else if (stage === 'open') {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.scrollIntoView?.({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'nearest',
      });
    } else {
      showRef.current?.focus();
    }
  }, [stage, reducedMotion]);

  // Keep the line the lens is on in sight inside the scrollable code
  useEffect(() => {
    if (line === undefined) return;
    currentLineRef.current?.scrollIntoView?.({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
    });
  }, [line, reducedMotion]);

  useEffect(() => {
    if (!copyNotice) return;
    const timer = window.setTimeout(() => setCopyNotice(''), COPY_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [copyNotice]);

  const open = (): void => {
    setStage('open');
    setStageNotice('The solution is shown.');
  };

  const close = (notice: string): void => {
    setStage('closed');
    setStageNotice(notice);
    setCopyNotice('');
  };

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(exercise.solution.code);
      setCopyNotice('Copied the solution.');
    } catch {
      // No permission, or no clipboard in this context: select the code instead
      const selection = window.getSelection();
      if (selection && codeRef.current) {
        selection.selectAllChildren(codeRef.current);
        setCopyNotice('Could not copy. The code is selected for you to copy.');
      } else {
        setCopyNotice('Could not copy. Select the code and copy it yourself.');
      }
    }
  };

  const copied = copyNotice.startsWith('Copied');
  const lines = exercise.solution.code.replace(/\n$/, '').split('\n');

  return (
    <section aria-labelledby={headingId} className="mt-4">
      <h3
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-[10px] uppercase tracking-wider mb-1"
        style={{ color: 'var(--pg-text-muted)' }}
      >
        Solution
      </h3>
      <p aria-live="polite" className="sr-only">
        {stageNotice}
      </p>

      {stage === 'closed' && (
        <button
          ref={showRef}
          type="button"
          onClick={() => {
            if (seen) open();
            else setStage('asking');
          }}
          className={buttonClass}
          style={buttonStyle}
        >
          Show solution
        </button>
      )}

      {stage === 'asking' && (
        <div
          role="group"
          aria-labelledby={questionId}
          className="rounded-md px-2.5 py-2"
          style={{ border: '1px solid var(--pg-accent-amber)', background: 'var(--pg-bg-surface)' }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              // The page's own Escape handling (stop a run) is not meant here
              event.stopPropagation();
              close('');
            }
          }}
        >
          <p
            id={questionId}
            className="text-xs leading-relaxed mb-2"
            style={{ color: 'var(--pg-text-primary)' }}
          >
            See the solution? You can still solve it yourself first.
            {hintsLeft === 1 && ' There is 1 hint you have not looked at yet.'}
            {hintsLeft > 1 && ` There are ${hintsLeft} hints you have not looked at yet.`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReveal();
                open();
              }}
              className={buttonClass}
              style={buttonStyle}
            >
              Show
            </button>
            <button
              ref={notYetRef}
              type="button"
              onClick={() => close('')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'var(--pg-accent-blue)', color: 'var(--pg-bg-primary)' }}
            >
              Not yet
            </button>
          </div>
        </div>
      )}

      {stage === 'open' && (
        <>
          <div className="mb-2">
            <Prose text={exercise.solution.explanation} />
          </div>

          <div className="rounded-md mb-2" style={{ border: '1px solid var(--pg-border)' }}>
            <div
              className="flex items-center justify-between gap-2 px-2.5 py-1"
              style={{
                borderBottom: '1px solid var(--pg-border)',
                background: 'var(--pg-bg-surface)',
              }}
            >
              <span className="text-[11px]" style={{ color: 'var(--pg-text-secondary)' }}>
                Read-only
              </span>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy the solution code"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] hover:bg-white/5"
                style={buttonStyle}
              >
                {copied ? (
                  <Check size={11} aria-hidden="true" />
                ) : (
                  <Copy size={11} aria-hidden="true" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            {/* Focusable, so the keyboard can scroll it */}
            <pre
              tabIndex={0}
              role="group"
              aria-label="Solution code, read-only"
              className="max-h-64 overflow-auto px-2.5 py-2 text-[11px] leading-relaxed"
              style={{
                ...mono,
                background: 'var(--pg-bg-secondary)',
                color: 'var(--pg-text-primary)',
              }}
            >
              <code ref={codeRef} style={mono}>
                {lines.map((text, index) => {
                  const current = watching && line === index + 1;
                  return (
                    <span
                      key={index}
                      ref={current ? currentLineRef : undefined}
                      data-current={current ? 'true' : undefined}
                      style={
                        current
                          ? {
                              background: 'var(--pg-bg-tertiary)',
                              boxShadow: '-3px 0 0 var(--pg-accent-blue)',
                            }
                          : undefined
                      }
                    >
                      {text}
                      {'\n'}
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <button
              type="button"
              onClick={onLoad}
              disabled={blocked || inEditor}
              className={buttonClass}
              style={buttonStyle}
              title="Replace the code in the editor with the solution"
            >
              Load into the editor
            </button>
            <button
              type="button"
              onClick={onWatch}
              disabled={blocked}
              aria-pressed={watching}
              className={buttonClass}
              style={{
                ...buttonStyle,
                ...(watching
                  ? { border: '1px solid var(--pg-accent-blue)', color: 'var(--pg-accent-blue)' }
                  : {}),
              }}
              title="Run the solution on the first check and step through it in the lens. The editor keeps your code."
            >
              <Eye size={11} aria-hidden="true" />
              Watch it run
            </button>
            <button
              type="button"
              onClick={() => close('The solution is hidden.')}
              className={buttonClass}
              style={buttonStyle}
            >
              Hide solution
            </button>
          </div>

          {/* What just happened, announced politely */}
          <div
            aria-live="polite"
            className="min-h-4 text-[11px]"
            style={{ color: 'var(--pg-text-secondary)' }}
          >
            {copyNotice && <p>{copyNotice}</p>}
            {watching && (
              <p>
                The solution’s steps are in the lens.
                {!inEditor && ' The editor still holds your code.'}
              </p>
            )}
            {inEditor && <p>The solution is in the editor.</p>}
          </div>
        </>
      )}
    </section>
  );
};

export default SolutionSection;
