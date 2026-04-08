import React, { useMemo } from 'react';
import type { VisualizationLens, StateSnapshot } from '../../types';

interface LensSelectorProps {
  activeLens: VisualizationLens;
  onLensChange: (lens: VisualizationLens) => void;
  currentSnapshot: StateSnapshot | null;
}

interface LensOption {
  value: VisualizationLens;
  label: string;
  icon: string;
}

const LENS_OPTIONS: LensOption[] = [
  { value: 'none', label: 'None', icon: '⊘' },
  { value: 'event-loop', label: 'Event Loop', icon: '⟳' },
  { value: 'heap-stack', label: 'Heap & Stack', icon: '⬒' },
  { value: 'data-structure', label: 'Data Structures', icon: '⌬' },
  { value: 'stream', label: 'Streams', icon: '⇶' },
];

/**
 * Suggests a visualization lens based on detected patterns in execution state.
 */
function suggestLens(snapshot: StateSnapshot | null): VisualizationLens | null {
  if (!snapshot) return null;

  // Check for async queue entries → suggest Event Loop
  if (snapshot.microtaskQueue.length > 0 || snapshot.macrotaskQueue.length > 0) {
    return 'event-loop';
  }

  // Check for heap objects → suggest Heap & Stack
  if (snapshot.heapObjects.length > 0) {
    return 'heap-stack';
  }

  // Check for array/object variables → suggest Data Structures
  const hasStructures = snapshot.variables.some(
    (v) => v.type === 'object' || v.type === 'Array' || v.type === 'Map' || v.type === 'Set'
  );
  if (hasStructures) {
    return 'data-structure';
  }

  return null;
}

const LensSelector: React.FC<LensSelectorProps> = ({
  activeLens,
  onLensChange,
  currentSnapshot,
}) => {
  const suggested = useMemo(() => suggestLens(currentSnapshot), [currentSnapshot]);

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Visualization lens">
      {LENS_OPTIONS.map((option) => {
        const isActive = activeLens === option.value;
        const isSuggested = suggested === option.value && activeLens === 'none';

        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onLensChange(option.value)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
            style={{
              background: isActive ? 'var(--pg-accent-blue)' : 'transparent',
              color: isActive ? 'var(--pg-bg-primary)' : 'var(--pg-text-secondary)',
              border: isSuggested ? '1px dashed var(--pg-accent-blue)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 400,
            }}
            title={isSuggested ? `Suggested: ${option.label}` : option.label}
          >
            <span aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LensSelector;
