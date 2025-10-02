/**
 * Shared Contexts
 *
 * This file exports all context providers and hooks for easy importing.
 * Hooks are exported from this file to satisfy Fast Refresh requirements.
 */

// Re-export providers
export { UIProvider } from './UIContext';
export { ThemeProvider } from './ThemeContext';
export { AppProvider } from './AppContext';

// Re-export hooks
export { useUI } from './UIContext';
export { useTheme } from './ThemeContext';
export { useApp } from './AppContext';

// Re-export types
export type { SectionType, ColorMode } from './ThemeContext';
export type { AnimationSpeed, CodeStyle } from './AppContext';
