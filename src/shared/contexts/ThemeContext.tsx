import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getSectionTheme } from '../../utils/theme';

/**
 * ThemeContext manages theme-related state across the application
 * - Current section theme (javascript, git, datastructures, etc.)
 * - Dark/light mode preference
 * - Color scheme preferences
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

export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeState {
  currentSection: SectionType;
  colorMode: ColorMode;
  reducedMotion: boolean;
}

interface ThemeContextType extends ThemeState {
  // Section theme actions
  setCurrentSection: (section: SectionType) => void;
  getCurrentTheme: () => ReturnType<typeof getSectionTheme>;

  // Color mode actions
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;

  // Accessibility actions
  setReducedMotion: (reduced: boolean) => void;
}

const defaultThemeState: ThemeState = {
  currentSection: 'javascript',
  colorMode: 'light',
  reducedMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, setState] = useState<ThemeState>(() => {
    // Load preferences from localStorage
    const savedColorMode = localStorage.getItem('colorMode') as ColorMode | null;
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true';

    return {
      ...defaultThemeState,
      colorMode: savedColorMode || 'light',
      reducedMotion: savedReducedMotion,
    };
  });

  // Persist color mode preference
  useEffect(() => {
    localStorage.setItem('colorMode', state.colorMode);
  }, [state.colorMode]);

  // Persist reduced motion preference
  useEffect(() => {
    localStorage.setItem('reducedMotion', String(state.reducedMotion));
  }, [state.reducedMotion]);

  // Apply dark mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (state.colorMode === 'dark') {
      root.classList.add('dark');
    } else if (state.colorMode === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.colorMode]);

  const setCurrentSection = (section: SectionType) => {
    setState((prev) => ({ ...prev, currentSection: section }));
  };

  const getCurrentTheme = () => {
    return getSectionTheme(state.currentSection);
  };

  const setColorMode = (mode: ColorMode) => {
    setState((prev) => ({ ...prev, colorMode: mode }));
  };

  const toggleColorMode = () => {
    setState((prev) => ({
      ...prev,
      colorMode: prev.colorMode === 'light' ? 'dark' : 'light',
    }));
  };

  const setReducedMotion = (reduced: boolean) => {
    setState((prev) => ({ ...prev, reducedMotion: reduced }));
  };

  const value: ThemeContextType = {
    ...state,
    setCurrentSection,
    getCurrentTheme,
    setColorMode,
    toggleColorMode,
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
