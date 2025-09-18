import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import JavaScriptPage from './pages/JavaScriptPage';
import RxJSPage from './pages/RxJSPage';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <Header onSidebarToggle={handleSidebarToggle} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={handleSidebarToggle} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/javascript" element={<JavaScriptPage />} />
            <Route path="/rxjs" element={<RxJSPage />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default App;
