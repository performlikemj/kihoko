import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid, Card } from '../components/ArtCard';
import { apiService, handleApiError } from '../services/api';

export default function ArtPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllImages();
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      const transformed = data.map((img) => ({
        id: img.id,
        title: img.title,
        image: img.thumbnailUrl || img.url,
        category: img.categoryId,
      }));
      setImages(transformed);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading && !images.length) {
    return (
      <div className="loading-spinner">
        <div>Beautiful Artwork Loading...</div>
      </div>
    );
  }

  return (
    <div className="portfolio-page">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
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
              <p>No images found.</p>
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}
