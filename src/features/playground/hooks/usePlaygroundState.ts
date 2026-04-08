import { useState, useCallback } from 'react';
import type { PlaygroundLanguage, ExecutionState } from '../types';
import { getDefaultTemplate } from '../utils/codeTemplates';

interface UsePlaygroundStateReturn {
  /** Current editor language */
  language: PlaygroundLanguage;
  /** Current code in the editor */
  code: string;
  /** Current execution state */
  executionState: ExecutionState;
  /** Change the editor language (resets code to template if unchanged) */
  setLanguage: (lang: PlaygroundLanguage) => void;
  /** Update the code content */
  setCode: (code: string) => void;
  /** Update execution state */
  setExecutionState: (state: ExecutionState) => void;
  /** Reset code to default template for current language */
  resetCode: () => void;
}

/**
 * Central state hook for the Playground.
 * Manages language, code content, and execution state.
 */
export function usePlaygroundState(): UsePlaygroundStateReturn {
  const [language, setLanguageInternal] = useState<PlaygroundLanguage>('javascript');
  const [code, setCode] = useState<string>(getDefaultTemplate('javascript'));
  const [executionState, setExecutionState] = useState<ExecutionState>('idle');

  // Track if the user has modified code from the template
  const [codeModifiedForLang, setCodeModifiedForLang] = useState<
    Partial<Record<PlaygroundLanguage, string>>
  >({});

  const setLanguage = useCallback(
    (lang: PlaygroundLanguage): void => {
      if (lang === language) return;

      // Save current code for the current language
      setCodeModifiedForLang((prev) => ({ ...prev, [language]: code }));

      // Restore saved code or load default template
      const savedCode = codeModifiedForLang[lang];
      setCode(savedCode ?? getDefaultTemplate(lang));
      setLanguageInternal(lang);
      setExecutionState('idle');
    },
    [language, code, codeModifiedForLang]
  );

  const resetCode = useCallback((): void => {
    const template = getDefaultTemplate(language);
    setCode(template);
    setCodeModifiedForLang((prev) => {
      const next = { ...prev };
      delete next[language];
      return next;
    });
    setExecutionState('idle');
  }, [language]);

  return {
    language,
    code,
    executionState,
    setLanguage,
    setCode,
    setExecutionState,
    resetCode,
  };
}
