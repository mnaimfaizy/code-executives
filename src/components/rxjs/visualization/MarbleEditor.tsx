import React, { useId } from 'react';
import { sampleMarbles } from '../shared/utils';

interface MarbleEditorProps {
  /** The marble notation shown in the text box. The parent owns it. */
  value: string;
  onChange: (marbleString: string) => void;
  label?: string;
  className?: string;
}

export const MarbleEditor: React.FC<MarbleEditorProps> = ({
  value,
  onChange,
  label = 'Input Stream (Marble Notation)',
  className = '',
}) => {
  const inputId = useId();
  const templatesId = useId();

  return (
    <div className={`marble-editor ${className}`}>
      <div className="mb-4">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="--a--b--c--|"
        />
      </div>

      {/* Quick Templates */}
      <div className="mb-4">
        <div id={templatesId} className="text-sm font-medium text-gray-700 mb-2">
          Quick Templates:
        </div>
        <div role="group" aria-labelledby={templatesId} className="flex flex-wrap gap-2">
          {Object.entries(sampleMarbles).map(([name, template]) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(template)}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
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
