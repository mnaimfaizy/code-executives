/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * UIContext manages UI-related state across the application
 * - Sidebar open/close state
 * - Modal visibility
 * - Loading states
 * - Toast notifications
 */

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  isLoading: boolean;
  toastMessage: string | null;
}

interface UIContextType extends UIState {
  // Sidebar actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Modal actions
  openModal: () => void;
  closeModal: () => void;

  // Loading actions
  setLoading: (loading: boolean) => void;

  // Toast actions
  showToast: (message: string) => void;
  hideToast: () => void;
}

const defaultUIState: UIState = {
  sidebarOpen: false,
  modalOpen: false,
  isLoading: false,
  toastMessage: null,
};

const UIContext = createContext<UIContextType | undefined>(undefined);

interface UIProviderProps {
  children: ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({ children }) => {
  const [state, setState] = useState<UIState>(defaultUIState);

  const toggleSidebar = () => {
    setState((prev) => ({ ...prev, sidebarOpen: !prev.sidebarOpen }));
  };

  const openSidebar = () => {
    setState((prev) => ({ ...prev, sidebarOpen: true }));
  };

  const closeSidebar = () => {
    setState((prev) => ({ ...prev, sidebarOpen: false }));
  };

  const setSidebarOpen = (open: boolean) => {
    setState((prev) => ({ ...prev, sidebarOpen: open }));
  };

  const openModal = () => {
    setState((prev) => ({ ...prev, modalOpen: true }));
  };

  const closeModal = () => {
    setState((prev) => ({ ...prev, modalOpen: false }));
  };

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, isLoading: loading }));
  };

  const showToast = (message: string) => {
    setState((prev) => ({ ...prev, toastMessage: message }));
  };

  const hideToast = () => {
    setState((prev) => ({ ...prev, toastMessage: null }));
  };

  const value: UIContextType = {
    ...state,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    setSidebarOpen,
    openModal,
    closeModal,
    setLoading,
    showToast,
    hideToast,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

/**
 * Custom hook to access UI context
 * @throws Error if used outside UIProvider
 */
export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
