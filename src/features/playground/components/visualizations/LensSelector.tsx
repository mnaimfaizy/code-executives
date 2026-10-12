import React from 'react';
import type { VisualizationLens } from '../../types';

interface LensSelectorProps {
  activeLens: VisualizationLens;
  onLensChange: (lens: VisualizationLens) => void;
}

interface LensOption {
  value: VisualizationLens;
  label: string;
  icon: string;
}

const LENS_OPTIONS: LensOption[] = [
  { value: 'none', label: 'None', icon: '⊘' },
  { value: 'stack-heap', label: 'Stack & Heap', icon: '⬒' },
  { value: 'stack-queues', label: 'Stack & Queues', icon: '☰' },
];

const LensSelector: React.FC<LensSelectorProps> = ({ activeLens, onLensChange }) => {
  return (
    <div
      className="flex flex-wrap items-center gap-1"
      role="radiogroup"
      aria-label="Visualization lens"
    >
      {LENS_OPTIONS.map((option) => {
        const isActive = activeLens === option.value;

        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onLensChange(option.value)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors"
            style={{
              background: isActive ? 'var(--pg-accent-blue)' : 'transparent',
              color: isActive ? 'var(--pg-bg-primary)' : 'var(--pg-text-secondary)',
              border: '1px solid transparent',
              fontWeight: isActive ? 600 : 400,
            }}
            title={option.label}
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
