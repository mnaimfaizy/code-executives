/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getSectionTheme } from '../../utils/theme';

/**
 * ThemeContext manages theme-related state across the application
 * - Current section theme (javascript, git, datastructures, etc.)
 * - Accessibility preferences
 */

export type SectionType =
  | 'javascript'
  | 'git'
  | 'datastructures'
  | 'rxjs'
  | 'react'
  | 'nextjs'
  | 'bigo'
  | 'python'
  | 'systemdesign'
  | 'typescript';

interface ThemeState {
  currentSection: SectionType;
  reducedMotion: boolean;
}

interface ThemeContextType extends ThemeState {
  // Section theme actions
  setCurrentSection: (section: SectionType) => void;
  getCurrentTheme: () => ReturnType<typeof getSectionTheme>;

  // Accessibility actions
  setReducedMotion: (reduced: boolean) => void;
}

const defaultThemeState: ThemeState = {
  currentSection: 'javascript',
  reducedMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, setState] = useState<ThemeState>(() => {
    // Load preferences from localStorage
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';

    return {
      ...defaultThemeState,
      reducedMotion: savedReducedMotion,
    };
  });

  // Persist reduced motion preference
  useEffect(() => {
    localStorage.setItem('reducedMotion', String(state.reducedMotion));
  }, [state.reducedMotion]);

  const setCurrentSection = (section: SectionType) => {
    setState((prev) => ({ ...prev, currentSection: section }));
  };

  const getCurrentTheme = () => {
    return getSectionTheme(state.currentSection);
  };

  const setReducedMotion = (reduced: boolean) => {
    setState((prev) => ({ ...prev, reducedMotion: reduced }));
  };

  const value: ThemeContextType = {
    ...state,
    setCurrentSection,
    getCurrentTheme,
    setReducedMotion,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Custom hook to access Theme context
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
