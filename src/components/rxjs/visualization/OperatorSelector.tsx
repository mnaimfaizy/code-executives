import React, { useId, useState } from 'react';
import { operatorConfigs, getOperatorConfig } from '../shared/utils';
import type { OperatorSettings } from '../shared/utils';

interface OperatorSelectorProps {
  onOperatorAdd: (operator: OperatorSettings) => void;
  className?: string;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  onOperatorAdd,
  className = '',
}) => {
  const [selectedOperator, setSelectedOperator] = useState('');
  const [choice, setChoice] = useState('');
  const [count, setCount] = useState('');
  const operatorId = useId();
  const choiceId = useId();
  const countId = useId();

  const selectedConfig = getOperatorConfig(selectedOperator);

  const handleOperatorSelect = (operatorName: string) => {
    const config = getOperatorConfig(operatorName);
    setSelectedOperator(operatorName);
    setChoice(config?.choices?.options[0].id ?? '');
    setCount(config?.count ? String(config.count.defaultValue) : '');
  };

  const handleAddOperator = () => {
    if (!selectedConfig) return;

    onOperatorAdd({
      name: selectedConfig.name,
      ...(selectedConfig.choices ? { choice } : {}),
      // An emptied box falls back to the operator's default; 0 is kept.
      ...(selectedConfig.count ? { count: count.trim() === '' ? undefined : Number(count) } : {}),
    });
    handleOperatorSelect('');
  };

  return (
    <div className={`operator-selector ${className}`}>
      <div className="mb-4">
        <label htmlFor={operatorId} className="block text-sm font-medium text-gray-700 mb-2">
          Add an operator
        </label>
        <select
          id={operatorId}
          value={selectedOperator}
          onChange={(e) => handleOperatorSelect(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Choose an operator...</option>
          {operatorConfigs.map((config) => (
            <option key={config.name} value={config.name}>
              {config.displayName} - {config.description}
            </option>
          ))}
        </select>
      </div>

      {selectedConfig && (
        <div className="mb-4">
          {selectedConfig.choices && (
            <div className="mb-4">
              <label htmlFor={choiceId} className="block text-sm text-gray-600 mb-1">
                {selectedConfig.choices.label}
              </label>
              <select
                id={choiceId}
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {selectedConfig.choices.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedConfig.count && (
            <div className="mb-4">
              <label htmlFor={countId} className="block text-sm text-gray-600 mb-1">
                {selectedConfig.count.label}
              </label>
              <input
                id={countId}
                type="number"
                min={0}
                step={1}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAddOperator}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Add Operator
          </button>
        </div>
      )}
    </div>
  );
};
