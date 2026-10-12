import React, { Suspense, lazy } from 'react';
import type { PlaygroundLanguage, VisualizationLens } from '../../types';
import type { Step } from '../../tracer';

const StackHeapLens = lazy(() => import('./lenses/StackHeapLens'));
const StackQueuesLens = lazy(() => import('./lenses/StackQueuesLens'));

interface VisualizationCanvasProps {
  lens: VisualizationLens;
  /** Every step of the trace */
  steps: readonly Step[];
  /** Index into `steps` of the step to draw */
  index: number;
  /** The language of the run: Python records values only, so its steps have no heap */
  language: PlaygroundLanguage;
  /** True when the tracer's queue model could not follow the engine for this run */
  queuesApproximate?: boolean;
}

const LensLoading: React.FC = () => (
  <div
    className="flex items-center justify-center h-full"
    style={{ color: 'var(--pg-text-muted)' }}
  >
    <div className="text-center space-y-2">
      <div
        className="w-6 h-6 border-2 rounded-full animate-spin mx-auto"
        style={{
          borderColor: 'var(--pg-border)',
          borderTopColor: 'var(--pg-accent-blue)',
        }}
      />
      <p className="text-xs">Loading visualization…</p>
    </div>
  </div>
);

const NoLensPlaceholder: React.FC = () => (
  <div
    className="flex items-center justify-center h-full"
    style={{ color: 'var(--pg-text-muted)' }}
  >
    <div className="text-center space-y-3 px-6">
      <div className="text-3xl" aria-hidden="true">
        ◎
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--pg-text-secondary)' }}>
        Select a visualization lens
      </p>
      <p className="text-xs max-w-48">
        Choose a lens from the toolbar to see what each step of your code did.
      </p>
    </div>
  </div>
);

const NoDataPlaceholder: React.FC = () => (
  <div
    className="flex items-center justify-center h-full"
    style={{ color: 'var(--pg-text-muted)' }}
  >
    <div className="text-center space-y-3 px-6">
      <div className="text-3xl" aria-hidden="true">
        ▶
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--pg-text-secondary)' }}>
        Run code with Trace enabled
      </p>
      <p className="text-xs max-w-48">
        Run your code with the Trace toggle on to record its steps.
      </p>
    </div>
  </div>
);

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  lens,
  steps,
  index,
  language,
  queuesApproximate,
}) => {
  // Anything but a lens that exists draws nothing, such as the id of a lens that was removed
  if (lens !== 'stack-heap' && lens !== 'stack-queues') {
    return <NoLensPlaceholder />;
  }

  if (steps.length === 0) {
    return <NoDataPlaceholder />;
  }

  return (
    <div className="h-full w-full">
      <Suspense fallback={<LensLoading />}>
        {lens === 'stack-queues' ? (
          <StackQueuesLens
            steps={steps}
            index={index}
            heapRecorded={language !== 'python'}
            approximate={queuesApproximate}
          />
        ) : (
          <StackHeapLens steps={steps} index={index} heapRecorded={language !== 'python'} />
        )}
      </Suspense>
    </div>
  );
};

export default VisualizationCanvas;
