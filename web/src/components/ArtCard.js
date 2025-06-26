import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Grid({ children }) {
  return <div className="art-grid">{children}</div>;
}

export function Card({ item }) {
  return (
    <motion.div className="art-card" whileHover={{ scale: 1.05 }}>
      <Link to={`/art/${item.id}`} className="art-card-link">
        <img src={item.image} alt={item.title} />
        <div className="art-card-title">{item.title}</div>
      </Link>
    </motion.div>
  );
}
