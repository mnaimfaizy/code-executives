import { useRef, useCallback } from 'react';
import type { editor } from 'monaco-editor';
import type { Monaco } from '@monaco-editor/react';
import { playgroundTokens } from '../components/theme/tokens';
import type { PlaygroundLanguage } from '../types';

/** Custom dark theme name for Monaco */
const THEME_NAME = 'playground-space' as const;

/** Map PlaygroundLanguage to Monaco language ID */
const LANGUAGE_MAP: Record<PlaygroundLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

/** File extension map for display */
export const FILE_EXTENSION_MAP: Record<PlaygroundLanguage, string> = {
  javascript: 'main.js',
  typescript: 'main.ts',
  python: 'main.py',
};

/** Build the custom dark theme matching our space palette */
function createSpaceTheme(): editor.IStandaloneThemeData {
  const { colors } = playgroundTokens;
  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: '', foreground: 'e0e0ff', background: '0d0d22' },
      { token: 'comment', foreground: '6b6b99', fontStyle: 'italic' },
      { token: 'keyword', foreground: '8b5cf6' },
      { token: 'string', foreground: '00ff88' },
      { token: 'number', foreground: '00d4ff' },
      { token: 'type', foreground: '33ddff' },
      { token: 'function', foreground: 'e0e0ff' },
      { token: 'variable', foreground: 'a0a0cc' },
      { token: 'operator', foreground: 'ffaa00' },
      { token: 'delimiter', foreground: '6b6b99' },
    ],
    colors: {
      'editor.background': colors.editor.background,
      'editor.foreground': colors.text.primary,
      'editor.lineHighlightBackground': colors.editor.lineHighlight,
      'editor.selectionBackground': colors.editor.selection,
      'editorCursor.foreground': colors.editor.cursor,
      'editorLineNumber.foreground': colors.text.muted,
      'editorLineNumber.activeForeground': colors.accent.electricBlue,
      'editorGutter.background': colors.editor.gutter,
      'editor.inactiveSelectionBackground': 'rgba(139, 92, 246, 0.1)',
      'editorIndentGuide.activeBackground': colors.border.default,
      'editorBracketMatch.background': 'rgba(0, 212, 255, 0.15)',
      'editorBracketMatch.border': colors.accent.electricBlue,
      'scrollbarSlider.background': 'rgba(26, 26, 62, 0.6)',
      'scrollbarSlider.hoverBackground': 'rgba(58, 58, 110, 0.8)',
      'scrollbarSlider.activeBackground': 'rgba(58, 58, 110, 1)',
    },
  };
}

/** Default editor options for the playground */
export function getEditorOptions(): editor.IStandaloneEditorConstructionOptions {
  return {
    theme: THEME_NAME,
    fontFamily: playgroundTokens.fonts.mono,
    fontSize: 14,
    lineHeight: 22,
    fontLigatures: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    renderLineHighlight: 'all',
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    lineNumbers: 'on',
    glyphMargin: false,
    folding: true,
    bracketPairColorization: { enabled: true },
    suggest: { showMethods: true, showFunctions: true },
    quickSuggestions: true,
    parameterHints: { enabled: true },
    formatOnPaste: true,
    formatOnType: true,
    'semanticHighlighting.enabled': true,
    accessibilitySupport: 'auto',
  };
}

/** Get the Monaco language ID for a PlaygroundLanguage */
export function getMonacoLanguage(language: PlaygroundLanguage): string {
  return LANGUAGE_MAP[language];
}

interface UseMonacoReturn {
  /** Call on Monaco's beforeMount to register our theme */
  handleBeforeMount: (monaco: Monaco) => void;
  /** Call on Monaco's onMount to store the editor reference */
  handleEditorMount: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  /** Current editor instance ref (null before mount) */
  editorRef: React.RefObject<editor.IStandaloneCodeEditor | null>;
}

/**
 * Hook to manage Monaco Editor lifecycle and configuration.
 * Registers the custom space theme and provides editor instance access.
 */
export function useMonaco(onExecute?: () => void): UseMonacoReturn {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleBeforeMount = useCallback((monaco: Monaco): void => {
    // Register space dark theme
    monaco.editor.defineTheme(THEME_NAME, createSpaceTheme());
  }, []);

  const handleEditorMount = useCallback(
    (editor: editor.IStandaloneCodeEditor, monaco: Monaco): void => {
      editorRef.current = editor;

      // Ctrl+Enter → run code
      editor.addAction({
        id: 'playground-run',
        label: 'Run Code',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
        run: () => {
          onExecute?.();
        },
      });

      // Ctrl+S → prevent browser save dialog
      editor.addAction({
        id: 'playground-save-noop',
        label: 'Save (disabled)',
        keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
        run: () => {
          // No-op: prevents browser default
        },
      });

      // Focus editor on mount
      editor.focus();
    },
    [onExecute]
  );

  return {
    handleBeforeMount,
    handleEditorMount,
    editorRef,
  };
}
