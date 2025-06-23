import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from './styles/GlobalStyles';
import { lightTheme, darkTheme } from './styles/themes';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ArtDetailPage from './pages/ArtDetailPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
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
          user={user} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />
        <main className="page-transition loaded">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/project/:slug" element={<ProjectDetailPage />} />
            <Route path="/art/:id" element={<ArtDetailPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage setUser={setUser} />} />
            <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
