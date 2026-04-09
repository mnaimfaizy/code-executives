import React, { lazy, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { ErrorBoundary } from './shared/components/feedback/ErrorBoundary';
import { SuspenseRoute } from './shared/components/routing';
import { SkipLinks } from './shared/components/accessibility';
import { ToastProvider } from './shared/components/feedback/Toast';
import { Breadcrumbs } from './shared/components/navigation/Breadcrumbs';
import { UIProvider, ThemeProvider, AppProvider } from './shared/contexts';
import { PerformanceDashboard } from './shared/components/performance';
import analyticsService from './shared/services/analytics';
import { env } from './core/config/env';

// Lazy load all pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const JavaScriptPage = lazy(() => import('./features/javascript'));
const RxJSPage = lazy(() => import('./features/rxjs'));
const GitPage = lazy(() => import('./features/git'));
const DataStructuresPage = lazy(() => import('./features/datastructures'));
const ReactPage = lazy(() => import('./features/react'));
const NextJSPage = lazy(() => import('./features/nextjs'));
const BigOPage = lazy(() => import('./features/bigo'));
const PythonPage = lazy(() => import('./features/python'));
const SystemDesignPage = lazy(() => import('./features/systemdesign'));
const TypeScriptPage = lazy(() => import('./features/typescript'));
const AIFundamentalsPage = lazy(() => import('./features/ai'));
const NodeJSPage = lazy(() => import('./features/nodejs'));
const AuthPage = lazy(() => import('./features/auth'));
const DevOpsPage = lazy(() => import('./features/devops'));
const BackendPage = lazy(() => import('./features/backend'));

// Standalone pages (rendered without main app layout)
const PlaygroundEntry = lazy(() => import('./features/playground/PlaygroundEntry'));

const App: React.FC = () => {
  // Initialize analytics on app mount
  useEffect(() => {
    if (env.enableAnalytics && env.googleAnalyticsId) {
      analyticsService.initialize(env.googleAnalyticsId);
    }
  }, []);

  const location = useLocation();
  const isPlayground = location.pathname === '/playground';

  return (
    <ErrorBoundary level="app">
      <HelmetProvider>
        <AppProvider>
          <ThemeProvider>
            <UIProvider>
              <ToastProvider>
                {isPlayground ? (
                  /* Standalone route — no Header, Sidebar, or Footer */
                  <Routes>
                    <Route
                      path="/playground"
                      element={
                        <SuspenseRoute variant="spinner">
                          <PlaygroundEntry />
                        </SuspenseRoute>
                      }
                    />
                  </Routes>
                ) : (
                  /* Main app layout with navigation chrome */
                  <>
                    <SkipLinks />
                    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
                      <Header />
                      <div className="flex flex-1">
                        <Sidebar />
                        <main
                          id="main-content"
                          className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
                          role="main"
                          aria-label="Main content"
                        >
                          {/* Breadcrumb Navigation */}
                          <Breadcrumbs />

                          <Routes>
                            <Route
                              path="/"
                              element={
                                <SuspenseRoute>
                                  <Home />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/about"
                              element={
                                <SuspenseRoute>
                                  <About />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/javascript"
                              element={
                                <SuspenseRoute>
                                  <JavaScriptPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/rxjs"
                              element={
                                <SuspenseRoute>
                                  <RxJSPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/git"
                              element={
                                <SuspenseRoute>
                                  <GitPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/datastructures"
                              element={
                                <SuspenseRoute>
                                  <DataStructuresPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/react"
                              element={
                                <SuspenseRoute>
                                  <ReactPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/nextjs"
                              element={
                                <SuspenseRoute>
                                  <NextJSPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/bigo"
                              element={
                                <SuspenseRoute>
                                  <BigOPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/python"
                              element={
                                <SuspenseRoute>
                                  <PythonPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/systemdesign"
                              element={
                                <SuspenseRoute>
                                  <SystemDesignPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/typescript"
                              element={
                                <SuspenseRoute>
                                  <TypeScriptPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/ai"
                              element={
                                <SuspenseRoute>
                                  <AIFundamentalsPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/nodejs"
                              element={
                                <SuspenseRoute>
                                  <NodeJSPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/auth"
                              element={
                                <SuspenseRoute>
                                  <AuthPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/devops"
                              element={
                                <SuspenseRoute>
                                  <DevOpsPage />
                                </SuspenseRoute>
                              }
                            />
                            <Route
                              path="/backend"
                              element={
                                <SuspenseRoute>
                                  <BackendPage />
                                </SuspenseRoute>
                              }
                            />
                          </Routes>
                        </main>
                      </div>
                      <Footer />
                      <PerformanceDashboard
                        enabled={import.meta.env.DEV}
                        position="bottom-right"
                        defaultOpen={false}
                      />
                    </div>
                  </>
                )}
              </ToastProvider>
            </UIProvider>
          </ThemeProvider>
        </AppProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
