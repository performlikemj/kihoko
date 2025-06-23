import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiService, handleApiError } from '../services/api';

export default function ArtDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [allArtworks, setAllArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const [artworkResponse, artworksResponse] = await Promise.all([
        apiService.getArtwork(id),
        apiService.getArtworks()
      ]);
      
      setArtwork(artworkResponse.data);
      setAllArtworks(artworksResponse.data);
    } catch (err) {
      console.error('Failed to fetch artwork:', err);
      setError(handleApiError(err));
      
      // Fallback to demo data
      const demoArtworks = [
        { id: 1, title: 'Artwork 1', image: 'https://picsum.photos/800/600?random=1' },
        { id: 2, title: 'Artwork 2', image: 'https://picsum.photos/800/600?random=2' },
        { id: 3, title: 'Artwork 3', image: 'https://picsum.photos/800/600?random=3' }
      ];
      
      const currentArtwork = demoArtworks.find(art => art.id === parseInt(id));
      setArtwork(currentArtwork || demoArtworks[0]);
      setAllArtworks(demoArtworks);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentIndex = () => {
    return allArtworks.findIndex(art => art.id === artwork?.id);
  };

  const navigateToArtwork = (direction) => {
    const currentIndex = getCurrentIndex();
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allArtworks.length - 1;
    } else {
      newIndex = (currentIndex + 1) % allArtworks.length;
    }
    
    const newArtwork = allArtworks[newIndex];
    navigate(`/art/${newArtwork.id}`);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div>Loading artwork...</div>
      </div>
    );
  }

  if (error || !artwork) {
    return (
      <div className="error-message">
        <h2>Artwork not found</h2>
        <p>The requested artwork could not be loaded.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="artwork-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="artwork-detail-container">
        <div className="artwork-detail-image">
          <img 
            src={artwork.image} 
            alt={artwork.title}
          />
          <button 
            className="arrow arrow-left" 
            onClick={() => navigateToArtwork('prev')}
            aria-label="Previous artwork"
          >
            &#8249;
          </button>
          <button 
            className="arrow arrow-right" 
            onClick={() => navigateToArtwork('next')}
            aria-label="Next artwork"
          >
            &#8250;
          </button>
        </div>
        <h1 className="artwork-detail-title">{artwork.title}</h1>
      </div>
    </motion.div>
  );
}
