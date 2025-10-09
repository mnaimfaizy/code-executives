// src/components/playground/ProblemDisplay.tsx
// Component for displaying problem description, examples, and hints

import React from 'react';
import { Lightbulb, Eye, EyeOff } from 'lucide-react';
import type { ProblemDisplayProps } from '../../types/playground';

const ProblemDisplay: React.FC<ProblemDisplayProps> = ({
  problem,
  showHints = false,
  hintsUsed = [],
  onHintClick,
  className = '',
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Problem Description */}
      <div className="prose max-w-none">
        <p className="text-gray-700 leading-relaxed">{problem.description}</p>
      </div>

      {/* Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
        {problem.examples.map((example, index) => (
          <div key={example.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-600">Example {index + 1}:</span>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Input:</span>
                <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-gray-800">
                  {Array.isArray(example.input) ? JSON.stringify(example.input) : example.input}
                </code>
              </div>
              <div>
                <span className="font-medium text-gray-700">Output:</span>
                <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-gray-800">
                  {JSON.stringify(example.expectedOutput)}
                </code>
              </div>
              {example.explanation && (
                <div>
                  <span className="font-medium text-gray-700">Explanation:</span>
                  <span className="ml-2 text-gray-600">{example.explanation}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Constraints</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {problem.constraints.map((constraint, index) => (
            <li key={index}>{constraint}</li>
          ))}
        </ul>
      </div>

      {/* Hints */}
      {showHints && problem.hints.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Hints</span>
          </h3>
          <div className="space-y-3">
            {problem.hints.map((hint) => {
              const isUsed = hintsUsed.includes(hint.order);
              return (
                <div
                  key={hint.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isUsed ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">Hint {hint.order}</span>
                        {hint.penalty && (
                          <span className="text-xs text-red-600">-{hint.penalty} points</span>
                        )}
                      </div>
                      <p className="text-gray-700">{hint.content}</p>
                    </div>
                    {!isUsed && onHintClick && (
                      <button
                        onClick={() => onHintClick(hint.id)}
                        className="ml-4 px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Show</span>
                      </button>
                    )}
                    {isUsed && (
                      <div className="ml-4 flex items-center space-x-1 text-yellow-600">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-sm">Used</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Objectives */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Learning Objectives</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          {problem.learningObjectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {problem.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProblemDisplay;
