import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import CategoryCard from '../components/CategoryCard';
import { apiService, handleApiError } from '../services/api';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      const categoryData = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      const transformed = categoryData.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.coverImageUrl,
        description: cat.description,
      }));
      setCategories(transformed);

    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(handleApiError(err));

      // Fallback to demo data if API not available
      setCategories([
        { id: '1', name: 'Tattoo Art', slug: 'tattoo-art', image: null, description: 'Tattoo photography and artwork' },
        { id: '2', name: 'Art Photography', slug: 'art-photography', image: null, description: 'Artistic photography and visual art' },
        { id: '3', name: 'Digital Art', slug: 'digital-art', image: null, description: 'Digital artwork and illustrations' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <h2>Error loading categories</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="display-1 text-center">Kihoko Mizuno Jones</h1>
        <div className="social-links">
          <a 
            href="https://www.instagram.com/kihokomizuno/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-instagram"></i>
          </a>
          <a 
            href="https://www.youtube.com/@MizunoJones" 
            target="_blank" 
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-youtube"></i>
          </a>
        </div>
      </motion.div>

      {/* Categories Grid */}
      <div className="projects-grid">
        {Array.isArray(categories) && categories.map((cat, index) => (
          <CategoryCard key={cat.id} category={cat} index={index} />
        ))}
      </div>
    </div>
  );
}
