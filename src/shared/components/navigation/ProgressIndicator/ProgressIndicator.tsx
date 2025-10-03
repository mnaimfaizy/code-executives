import React from 'react';

export interface ProgressIndicatorProps {
  /** Current step/section number (1-based) */
  current: number;
  /** Total number of steps/sections */
  total: number;
  /** Optional label for the progress bar */
  label?: string;
  /** Color scheme for the progress bar */
  colorScheme?: 'blue' | 'green' | 'purple' | 'indigo';
  /** Show percentage instead of fraction */
  showPercentage?: boolean;
  /** Custom className for styling */
  className?: string;
}

/**
 * ProgressIndicator component for tracking completion
 * Shows visual feedback for learning progress through sections or steps.
 *
 * @component
 * @example
 * ```tsx
 * <ProgressIndicator
 *   current={3}
 *   total={10}
 *   label="Module Progress"
 *   colorScheme="blue"
 * />
 * ```
 *
 * **Features:**
 * - Visual progress bar with smooth animations
 * - Accessible ARIA labels for screen readers
 * - Multiple color schemes
 * - Percentage or fraction display
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  label,
  colorScheme = 'blue',
  showPercentage = false,
  className = '',
}) => {
  // Calculate percentage (clamped between 0 and 100)
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  // Color scheme mapping
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    indigo: 'bg-indigo-600',
  };

  const progressColor = colorClasses[colorScheme];

  // Format display text
  const displayText = showPercentage ? `${Math.round(percentage)}%` : `${current} / ${total}`;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">{displayText}</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`${progressColor} h-2 rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label={label || `Progress: ${displayText}`}
        />
      </div>

      {/* Footer text if no label */}
      {!label && <p className="text-xs text-gray-600 mt-1 text-center">{displayText} completed</p>}
    </div>
  );
};

export default ProgressIndicator;
