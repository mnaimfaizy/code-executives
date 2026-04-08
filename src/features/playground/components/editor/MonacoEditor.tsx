import React, { useCallback } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import { useMonaco, getEditorOptions, getMonacoLanguage } from '../../hooks/useMonaco';
import type { PlaygroundLanguage } from '../../types';

interface MonacoEditorProps {
  code: string;
  language: PlaygroundLanguage;
  onChange: (value: string) => void;
  onExecute: () => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ code, language, onChange, onExecute }) => {
  const { handleBeforeMount, handleEditorMount } = useMonaco(onExecute);

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value ?? '');
    },
    [onChange]
  );

  return (
    <div className="w-full h-full" aria-label={`${language} code editor`}>
      <Editor
        language={getMonacoLanguage(language)}
        value={code}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleEditorMount}
        options={getEditorOptions()}
        loading={
          <div
            className="flex items-center justify-center w-full h-full"
            style={{ background: 'var(--pg-bg-surface)', color: 'var(--pg-text-muted)' }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--pg-accent-blue)', borderTopColor: 'transparent' }}
              />
              <span className="text-xs" style={{ fontFamily: 'var(--pg-font-mono)' }}>
                Loading editor...
              </span>
            </div>
          </div>
        }
      />
    </div>
  );
};

export default MonacoEditor;
