import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import JavaScriptPage from './pages/JavaScriptPage';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Header onSidebarToggle={handleSidebarToggle} />
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar open={sidebarOpen} onClose={handleSidebarToggle} />
        <Box component="main" sx={{ flex: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/javascript" element={<JavaScriptPage />} />
          </Routes>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default App;
