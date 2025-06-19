import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const DATA = {
  '1': 'https://placekitten.com/800/600',
  '2': 'https://placekitten.com/801/601',
  '3': 'https://placekitten.com/802/602'
};

export default function ArtDetailPage() {
  const { id } = useParams();
  const image = DATA[id];

  return (
    <div style={{ textAlign: 'center' }}>
      <motion.img
        src={image}
        alt="Artwork"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '90%', height: 'auto' }}
      />
      <div style={{ marginTop: 20 }}>
        <Link to="/">Back to Portfolio</Link>
      </div>
    </div>
  );
}
