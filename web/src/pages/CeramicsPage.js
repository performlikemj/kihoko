import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { apiService } from '../services/api';

const PageWrapper = styled.div`
  min-height: 100vh;
  padding: 2rem 1.5rem 4rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const PageTitle = styled.h2`
  font-size: clamp(1.6rem, 4vw, 2.4rem);
  font-weight: 600;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
`;

const ImageCard = styled(motion.div)`
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 1;
  background: #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 5rem 2rem;
  color: rgba(0,0,0,0.35);
  font-size: 1.1rem;
`;

export default function CeramicsPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getImagesByCategory('ceramics')
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setImages(data);
      })
      .catch(err => console.error('Failed to load ceramics images:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper
      as={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <PageTitle>Ceramics</PageTitle>

      {loading ? (
        <p>Loading...</p>
      ) : images.length > 0 ? (
        <Grid>
          {images.map((img, i) => (
            <ImageCard
              key={img.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <img src={img.url} alt={img.title || 'Ceramic'} loading="lazy" />
            </ImageCard>
          ))}
        </Grid>
      ) : (
        <EmptyState>Coming soon 🏺</EmptyState>
      )}
    </PageWrapper>
  );
}
