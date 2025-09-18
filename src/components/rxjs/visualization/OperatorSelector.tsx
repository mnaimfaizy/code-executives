import React, { useState, useCallback } from 'react';
import { operatorConfigs, getOperatorConfig } from '../shared/utils';
import type { AppliedOperator } from '../shared/types';

interface OperatorSelectorProps {
  onOperatorAdd: (operator: AppliedOperator) => void;
  className?: string;
}

export const OperatorSelector: React.FC<OperatorSelectorProps> = ({
  onOperatorAdd,
  className = '',
}) => {
  const [selectedOperator, setSelectedOperator] = useState('');
  const [parameters, setParameters] = useState<Record<string, string | number | boolean>>({});

  const handleOperatorSelect = useCallback((operatorName: string) => {
    setSelectedOperator(operatorName);
    const config = getOperatorConfig(operatorName);
    if (config?.parameters) {
      const defaultParams: Record<string, string | number | boolean> = {};
      config.parameters.forEach((param) => {
        defaultParams[param.name] = param.defaultValue;
      });
      setParameters(defaultParams);
    } else {
      setParameters({});
    }
  }, []);

  const handleParameterChange = useCallback(
    (paramName: string, value: string | number | boolean) => {
      setParameters((prev) => ({
        ...prev,
        [paramName]: value,
      }));
    },
    []
  );

  const handleAddOperator = useCallback(() => {
    if (!selectedOperator) return;

    const config = getOperatorConfig(selectedOperator);
    if (!config) return;

    const operator: AppliedOperator = {
      id: `${selectedOperator}-${Date.now()}`,
      config,
      parameters,
      enabled: true,
    };

    onOperatorAdd(operator);
    setSelectedOperator('');
    setParameters({});
  }, [selectedOperator, parameters, onOperatorAdd]);

  const selectedConfig = selectedOperator ? getOperatorConfig(selectedOperator) : null;

  return (
    <div className={`operator-selector ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Operator</label>
        <select
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
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">{selectedConfig.displayName}</h4>
            <p className="text-sm text-blue-700 mb-2">{selectedConfig.description}</p>
            <code className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {selectedConfig.example}
            </code>
          </div>

          {selectedConfig.parameters && selectedConfig.parameters.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Parameters:</div>
              {selectedConfig.parameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm text-gray-600 mb-1">
                    {param.name} {param.required && <span className="text-red-500">*</span>}
                  </label>
                  {param.type === 'number' ? (
                    <input
                      type="number"
                      value={(parameters[param.name] as number) || (param.defaultValue as number)}
                      onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  ) : param.type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={(parameters[param.name] as boolean) || false}
                      onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  ) : (
                    <input
                      type="text"
                      value={(parameters[param.name] as string) || (param.defaultValue as string)}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                      placeholder={param.description}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleAddOperator}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Add Operator
          </button>
        </div>
      )}
    </div>
  );
};
