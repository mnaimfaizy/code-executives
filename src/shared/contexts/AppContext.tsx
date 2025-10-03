/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

/**
 * AppContext manages application-level state
 * - User preferences (animation speed, code formatting, etc.)
 * - Navigation history
 * - Global settings
 * - Feature flags
 */

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type CodeStyle = 'compact' | 'normal' | 'expanded';

interface UserPreferences {
  animationSpeed: AnimationSpeed;
  codeStyle: CodeStyle;
  showLineNumbers: boolean;
  autoRun: boolean;
  soundEnabled: boolean;
}

interface AppState {
  preferences: UserPreferences;
  navigationHistory: string[];
  currentPath: string;
  featureFlags: Record<string, boolean>;
}

interface AppContextType extends AppState {
  // Preferences actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;

  // Navigation actions
  addToHistory: (path: string) => void;
  setCurrentPath: (path: string) => void;
  clearHistory: () => void;

  // Feature flags
  enableFeature: (feature: string) => void;
  disableFeature: (feature: string) => void;
  isFeatureEnabled: (feature: string) => boolean;
}

const defaultPreferences: UserPreferences = {
  animationSpeed: 'normal',
  codeStyle: 'normal',
  showLineNumbers: true,
  autoRun: false,
  soundEnabled: false,
};

const defaultAppState: AppState = {
  preferences: defaultPreferences,
  navigationHistory: [],
  currentPath: '/',
  featureFlags: {
    '3dVisualizations': true,
    interactivePlayground: true,
    advancedFeatures: false,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('userPreferences');
    const savedFeatureFlags = localStorage.getItem('featureFlags');
    const savedHistory = localStorage.getItem('navigationHistory');

    return {
      ...defaultAppState,
      preferences: savedPreferences ? JSON.parse(savedPreferences) : defaultPreferences,
      featureFlags: savedFeatureFlags
        ? JSON.parse(savedFeatureFlags)
        : defaultAppState.featureFlags,
      navigationHistory: savedHistory ? JSON.parse(savedHistory) : [],
    };
  });

  // Persist preferences to localStorage
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(state.preferences));
  }, [state.preferences]);

  // Persist feature flags to localStorage
  useEffect(() => {
    localStorage.setItem('featureFlags', JSON.stringify(state.featureFlags));
  }, [state.featureFlags]);

  // Persist navigation history (limited to last 20 items)
  useEffect(() => {
    const limitedHistory = state.navigationHistory.slice(-20);
    localStorage.setItem('navigationHistory', JSON.stringify(limitedHistory));
  }, [state.navigationHistory]);

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...preferences },
    }));
  };

  const resetPreferences = () => {
    setState((prev) => ({
      ...prev,
      preferences: defaultPreferences,
    }));
  };

  const addToHistory = (path: string) => {
    setState((prev) => ({
      ...prev,
      navigationHistory: [...prev.navigationHistory, path],
    }));
  };

  const setCurrentPath = (path: string) => {
    setState((prev) => ({
      ...prev,
      currentPath: path,
    }));
  };

  const clearHistory = () => {
    setState((prev) => ({
      ...prev,
      navigationHistory: [],
    }));
  };

  const enableFeature = (feature: string) => {
    setState((prev) => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [feature]: true },
    }));
  };

  const disableFeature = (feature: string) => {
    setState((prev) => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [feature]: false },
    }));
  };

  const isFeatureEnabled = (feature: string): boolean => {
    return state.featureFlags[feature] ?? false;
  };

  const value: AppContextType = {
    ...state,
    updatePreferences,
    resetPreferences,
    addToHistory,
    setCurrentPath,
    clearHistory,
    enableFeature,
    disableFeature,
    isFeatureEnabled,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Custom hook to access App context
 * @throws Error if used outside AppProvider
 */
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
