import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { ErrorBoundary } from './shared/components/feedback/ErrorBoundary';
import { SuspenseRoute } from './shared/components/routing';
import { SkipLinks } from './shared/components/accessibility';
import { UIProvider, ThemeProvider, AppProvider } from './shared/contexts';
import { PerformanceDashboard } from './shared/components/performance';

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

const App: React.FC = () => {
  return (
    <ErrorBoundary level="app">
      <AppProvider>
        <ThemeProvider>
          <UIProvider>
            <SkipLinks />
            <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main
                  id="main-content"
                  className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8"
                >
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
          </UIProvider>
        </ThemeProvider>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
