import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, Card } from '../components/ArtCard';
import { apiService, handleApiError } from '../services/api';

export default function PortfolioPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchImagesByCategory(selectedCategory.slug);
    } else {
      fetchFeaturedImages();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();
      
      if (response.data.success) {
        setCategories(response.data.data);
      } else {
        console.error('Failed to fetch categories:', response.data.error);
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(handleApiError(err));
      
      // Fallback to demo categories
      setCategories([
        { id: '1', name: 'Tattoo Art', slug: 'tattoo-art', description: 'Tattoo photography and artwork' },
        { id: '2', name: 'Art Photography', slug: 'art-photography', description: 'Artistic photography and visual art' },
        { id: '3', name: 'Digital Art', slug: 'digital-art', description: 'Digital artwork and illustrations' }
      ]);
    }
  };

  const fetchFeaturedImages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getFeaturedImages(20);
      
      if (response.data.success) {
        const transformedImages = response.data.data.map(image => ({
          id: image.id,
          title: image.title,
          image: image.thumbnailUrl || image.url,
          category: image.categoryId
        }));
        setImages(transformedImages);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error('Failed to fetch featured images:', err);
      setError(handleApiError(err));
      
      // Fallback to demo data
      setImages([
        { id: '1', title: 'Featured Art 1', image: 'https://picsum.photos/400/400?random=1' },
        { id: '2', title: 'Featured Art 2', image: 'https://picsum.photos/400/400?random=2' },
        { id: '3', title: 'Featured Art 3', image: 'https://picsum.photos/400/400?random=3' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchImagesByCategory = async (categorySlug) => {
    setLoading(true);
    try {
      const response = await apiService.getImagesByCategory(categorySlug);
      
      if (response.data.success) {
        const transformedImages = response.data.data.map(image => ({
          id: image.id,
          title: image.title,
          image: image.thumbnailUrl || image.url,
          category: image.categoryId
        }));
        setImages(transformedImages);
      } else {
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

  const handleShowAll = () => {
    setSelectedCategory(null);
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
        
        <div className="category-buttons">
          <button 
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={handleShowAll}
          >
            Featured
          </button>
          
          {categories.map((category) => (
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

        {images.length > 0 ? (
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
              <p>No images found{selectedCategory ? ` in ${selectedCategory.name}` : ' in featured collection'}.</p>
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
