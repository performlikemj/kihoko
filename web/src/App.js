import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/themes';
import Header from './components/Header';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import ArtPage from './pages/ArtPage';
import ContactPage from './pages/ContactPage';
import CategoriesPage from './pages/CategoriesPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import ArtDetailPage from './pages/ArtDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminUploadPage from './pages/AdminUploadPage';
import './styles/style.css';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Check for authentication
    const token = localStorage.getItem('authToken');
    if (token) {
      // You can add API call here to verify token and get user info
      setUser({ isAuthenticated: true });
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.body.setAttribute('data-bs-theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <GlobalStyles />
      <div className="flex-container" data-bs-theme={isDarkMode ? 'dark' : 'light'}>
        <Header
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
        <main className="page-transition loaded">
          <Routes>
            <Route path="/" element={<AboutPage />} />
            <Route path="/art" element={<ArtPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/category" element={<CategoriesPage />} />
            <Route path="/category/:slug" element={<PortfolioPage />} />
            <Route path="/project/:slug" element={<ProjectDetailPage />} />
            <Route path="/art/:id" element={<ArtDetailPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/signup" element={<SignupPage setUser={setUser} />} />
            {process.env.REACT_APP_ENABLE_UPLOAD === 'true' && (
              <Route path="/admin/upload" element={<AdminUploadPage />} />
            )}
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}