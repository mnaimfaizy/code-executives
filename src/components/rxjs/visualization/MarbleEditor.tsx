import React, { useState, useCallback } from 'react';
import { createMarbleStream, sampleMarbles } from '../shared/utils';
import type { MarbleStream } from '../shared/types';

interface MarbleEditorProps {
  onStreamChange: (stream: MarbleStream) => void;
  initialValue?: string;
  className?: string;
}

export const MarbleEditor: React.FC<MarbleEditorProps> = ({
  onStreamChange,
  initialValue = '--a--b--c--|',
  className = '',
}) => {
  const [marbleString, setMarbleString] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  const handleMarbleChange = useCallback(
    (value: string) => {
      setMarbleString(value);
      setError(null);

      try {
        const stream = createMarbleStream('source', 'Source', value);
        onStreamChange(stream);
      } catch {
        setError('Invalid marble diagram format');
      }
    },
    [onStreamChange]
  );

  const handleTemplateClick = useCallback(
    (template: string) => {
      handleMarbleChange(template);
    },
    [handleMarbleChange]
  );

  return (
    <div className={`marble-editor ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Marble Diagram</label>
        <input
          type="text"
          value={marbleString}
          onChange={(e) => handleMarbleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="--a--b--c--|"
        />
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>

      {/* Quick Templates */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Templates:</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(sampleMarbles).map(([name, template]) => (
            <button
              key={name}
              onClick={() => handleTemplateClick(template)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              title={template}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Syntax Guide */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Syntax Guide:</div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="space-y-1">
            <div>
              <code className="bg-white px-1 rounded">-</code> = 10ms time unit
            </div>
            <div>
              <code className="bg-white px-1 rounded">a,b,c</code> = values
            </div>
          </div>
          <div className="space-y-1">
            <div>
              <code className="bg-white px-1 rounded">|</code> = completion
            </div>
            <div>
              <code className="bg-white px-1 rounded">#</code> = error
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
