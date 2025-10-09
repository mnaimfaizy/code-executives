// src/components/playground/CodeEditor.tsx
// Code editor component with syntax highlighting and language support

import React, { useState } from 'react';
import { Code, Copy, Check } from 'lucide-react';
import type { CodeEditorProps, Language } from '../../types/playground';

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  onLanguageChange,
  starterCode,
  readOnly = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  // Available languages
  const languages: { value: Language; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
  ];

  // Handle code copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    onLanguageChange(newLanguage);
    // Load starter code for new language if available
    if (starterCode?.[newLanguage]) {
      onChange(starterCode[newLanguage]);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Code className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Code Editor</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className={`w-full h-96 p-4 font-mono text-sm bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
            readOnly ? 'bg-gray-50 cursor-not-allowed' : ''
          }`}
          placeholder={readOnly ? 'No code available' : 'Write your solution here...'}
          spellCheck={false}
        />

        {/* Line numbers (simplified) */}
        <div className="absolute left-2 top-4 text-gray-400 font-mono text-sm select-none pointer-events-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="leading-5">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Editor Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Language: {languages.find((l) => l.value === language)?.label}</span>
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
        </div>

        {readOnly && <span className="text-orange-600">Read-only mode</span>}
      </div>
    </div>
  );
};

export default CodeEditor;
