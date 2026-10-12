import React, { useEffect, useRef } from 'react';

export interface ConfirmRequest {
  /** What is about to happen, as a question. */
  title: string;
  /** What would be lost. */
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

interface ConfirmBarProps {
  request: ConfirmRequest;
  onCancel: () => void;
}

/**
 * A question asked in the page before the learner's code is replaced. It takes the focus,
 * with the safe answer first, and Escape answers it with that safe answer.
 */
const ConfirmBar: React.FC<ConfirmBarProps> = ({ request, onCancel }) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, [request]);

  return (
    <div
      role="alertdialog"
      aria-labelledby="pg-confirm-title"
      aria-describedby="pg-confirm-body"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 shrink-0 relative z-10"
      style={{
        borderBottom: '1px solid var(--pg-accent-amber)',
        background: 'var(--pg-bg-secondary)',
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <div className="min-w-0 flex-1 basis-64">
        <p
          id="pg-confirm-title"
          className="text-xs font-semibold"
          style={{ color: 'var(--pg-text-primary)' }}
        >
          {request.title}
        </p>
        <p id="pg-confirm-body" className="text-xs" style={{ color: 'var(--pg-text-secondary)' }}>
          {request.body}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          ref={cancelRef}
          type="button"
          onClick={onCancel}
          className="px-3 py-1 rounded-md text-xs font-semibold"
          style={{ background: 'var(--pg-accent-blue)', color: 'var(--pg-bg-primary)' }}
        >
          {request.cancelLabel}
        </button>
        <button
          type="button"
          onClick={request.onConfirm}
          className="px-3 py-1 rounded-md text-xs hover:bg-white/5"
          style={{ color: 'var(--pg-text-secondary)', border: '1px solid var(--pg-border)' }}
        >
          {request.confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmBar;
