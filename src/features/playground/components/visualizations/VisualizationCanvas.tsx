import React, { Suspense, lazy } from 'react';
import type { VisualizationLens, StateSnapshot } from '../../types';

const EventLoopLens = lazy(() => import('./lenses/EventLoopLens'));
const HeapStackLens = lazy(() => import('./lenses/HeapStackLens'));
const DataStructureLens = lazy(() => import('./lenses/DataStructureLens'));
const StreamLens = lazy(() => import('./lenses/StreamLens'));

interface VisualizationCanvasProps {
  lens: VisualizationLens;
  currentSnapshot: StateSnapshot | null;
  previousSnapshot: StateSnapshot | null;
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
        Choose a lens from the toolbar to visualize your code execution in real time.
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
        Execute your code with the Trace toggle on to see the visualization.
      </p>
    </div>
  </div>
);

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  lens,
  currentSnapshot,
  previousSnapshot,
}) => {
  if (lens === 'none') {
    return <NoLensPlaceholder />;
  }

  if (!currentSnapshot) {
    return <NoDataPlaceholder />;
  }

  const lensProps = { currentSnapshot, previousSnapshot };

  return (
    <div className="h-full w-full" role="img" aria-label={`${lens} visualization`}>
      <Suspense fallback={<LensLoading />}>
        {lens === 'event-loop' && <EventLoopLens {...lensProps} />}
        {lens === 'heap-stack' && <HeapStackLens {...lensProps} />}
        {lens === 'data-structure' && <DataStructureLens {...lensProps} />}
        {lens === 'stream' && <StreamLens {...lensProps} />}
      </Suspense>
    </div>
  );
};

export default VisualizationCanvas;
