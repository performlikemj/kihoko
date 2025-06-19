import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import ArtDetailPage from './pages/ArtDetailPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage />} />
      <Route path="/art/:id" element={<ArtDetailPage />} />
    </Routes>
  );
}
