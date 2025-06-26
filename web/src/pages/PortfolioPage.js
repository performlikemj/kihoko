import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Grid, Card } from '../components/ArtCard';
import { apiService, handleApiError } from '../services/api';

export default function PortfolioPage() {
  const { slug } = useParams();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [slug]);

  useEffect(() => {
    if (selectedCategory) {
      fetchImagesByCategory(selectedCategory.slug);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const cats = response.data.data;
        setCategories(cats);
        if (slug) {
          const found = cats.find((c) => c.slug === slug);
          setSelectedCategory(found || null);
        } else {
          setSelectedCategory(cats[0] || null);
        }
      } else {
        console.error('Failed to fetch categories:', response.data?.error || 'Invalid response format');
        setError('Failed to load categories');
        
        // Fallback to demo categories
        const fallbackCats = [
          { id: '1', name: 'Tattoo Art', slug: 'tattoo-art', description: 'Tattoo photography and artwork' },
          { id: '2', name: 'Art Photography', slug: 'art-photography', description: 'Artistic photography and visual art' },
          { id: '3', name: 'Digital Art', slug: 'digital-art', description: 'Digital artwork and illustrations' }
        ];
        setCategories(fallbackCats);
        if (slug) {
          const found = fallbackCats.find((c) => c.slug === slug);
          setSelectedCategory(found || null);
        } else {
          setSelectedCategory(fallbackCats[0] || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(handleApiError(err));
      
      // Fallback to demo categories
      const fallbackCats = [
        { id: '1', name: 'Tattoo Art', slug: 'tattoo-art', description: 'Tattoo photography and artwork' },
        { id: '2', name: 'Art Photography', slug: 'art-photography', description: 'Artistic photography and visual art' },
        { id: '3', name: 'Digital Art', slug: 'digital-art', description: 'Digital artwork and illustrations' }
      ];
      setCategories(fallbackCats);
      if (slug) {
        const found = fallbackCats.find((c) => c.slug === slug);
        setSelectedCategory(found || null);
      } else {
        setSelectedCategory(fallbackCats[0] || null);
      }
    }
  };


  const fetchImagesByCategory = async (categorySlug) => {
    setLoading(true);
    try {
      const response = await apiService.getImagesByCategory(categorySlug);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const transformedImages = response.data.data.map(image => ({
          id: image.id,
          title: image.title,
          image: image.thumbnailUrl || image.url,
          category: image.categoryId
        }));
        setImages(transformedImages);
      } else {
        console.error('Failed to fetch category images:', response.data?.error || 'Invalid response format');
        setImages([]);
      }
    } catch (err) {
      console.error('Failed to fetch category images:', err);
      setError(handleApiError(err));
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };


  if (loading && !images.length) {
    return (
      <div className="loading-spinner">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      {/* Category Navigation */}
      <motion.div
        className="category-navigation"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="page-title">Portfolio</h1>
        <div className="social-links">
          <a
            href="https://www.instagram.com/kihokomizuno/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon"
          >
            <i className="fab fa-instagram"></i>
          </a>
        </div>
        
        <div className="category-buttons">
          {Array.isArray(categories) && categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory?.id === category.id ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {selectedCategory && (
          <motion.div 
            className="category-description"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>{selectedCategory.name}</h2>
            <p>{selectedCategory.description}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Images Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {Array.isArray(images) && images.length > 0 ? (
          <Grid>
            {images.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card item={item} />
              </motion.div>
            ))}
          </Grid>
        ) : (
          !loading && (
            <div className="no-images">
              <p>No images found{selectedCategory ? ` in ${selectedCategory.name}` : ''}.</p>
            </div>
          )
        )}
      </motion.div>

      {/* Loading indicator for pagination */}
      {loading && images.length > 0 && (
        <div className="loading-more">
          <div>Loading more images...</div>
        </div>
      )}
    </div>
  );
}
