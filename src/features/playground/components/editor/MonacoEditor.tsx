import React, { useCallback, useEffect, useRef } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
import type { editor as MonacoEditorType } from 'monaco-editor';
import { useMonaco, getEditorOptions, getMonacoLanguage } from '../../hooks/useMonaco';
import type { PlaygroundLanguage } from '../../types';

interface MonacoEditorProps {
  code: string;
  language: PlaygroundLanguage;
  onChange: (value: string) => void;
  onExecute: () => void;
  /** Line number to highlight (1-based). Set to 0 or undefined to clear. */
  highlightLine?: number;
  /** Editor font size in pixels */
  fontSize?: number;
  /** Enable word wrapping */
  wordWrap?: boolean;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  code,
  language,
  onChange,
  onExecute,
  highlightLine,
  fontSize,
  wordWrap,
}) => {
  const { handleBeforeMount, handleEditorMount } = useMonaco(onExecute);
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<MonacoEditorType.IEditorDecorationsCollection | null>(null);

  const handleChange: OnChange = useCallback(
    (value) => {
      onChange(value ?? '');
    },
    [onChange]
  );

  const handleMount = useCallback(
    (
      editor: MonacoEditorType.IStandaloneCodeEditor,
      monaco: Parameters<typeof handleEditorMount>[1]
    ) => {
      editorRef.current = editor;
      handleEditorMount(editor, monaco);
    },
    [handleEditorMount]
  );

  // Highlight the current execution line
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    if (!highlightLine || highlightLine <= 0) {
      // Clear decorations
      if (decorationsRef.current) {
        decorationsRef.current.clear();
      }
      return;
    }

    const newDecorations: MonacoEditorType.IModelDeltaDecoration[] = [
      {
        range: {
          startLineNumber: highlightLine,
          startColumn: 1,
          endLineNumber: highlightLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'pg-highlight-line',
          glyphMarginClassName: 'pg-highlight-glyph',
        },
      },
    ];

    if (decorationsRef.current) {
      decorationsRef.current.set(newDecorations);
    } else {
      decorationsRef.current = editor.createDecorationsCollection(newDecorations);
    }

    // Reveal the line
    editor.revealLineInCenterIfOutsideViewport(highlightLine);
  }, [highlightLine]);

  return (
    <div className="w-full h-full" aria-label={`${language} code editor`}>
      <Editor
        language={getMonacoLanguage(language)}
        value={code}
        onChange={handleChange}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        options={{
          ...getEditorOptions(),
          ...(fontSize !== undefined && { fontSize }),
          ...(wordWrap !== undefined && { wordWrap: wordWrap ? 'on' : 'off' }),
        }}
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
